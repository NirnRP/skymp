#include "CloneAiThrottle.h"

#include <RE/A/Actor.h>
#include <RE/C/Character.h>
#include <REL/Relocation.h>

#include <atomic>
#include <chrono>
#include <fstream>
#include <mutex>
#include <unordered_set>

namespace {

using UpdateCombat_t = void(__fastcall*)(RE::Actor*);

constexpr std::size_t kUpdateCombatVtblIndex = 0x0E4;

std::atomic<int> g_mode{ 0 };
UpdateCombat_t g_realUpdateCombat = nullptr;
std::once_flag g_installFlag;

std::unordered_set<uint32_t> g_actors;
std::mutex g_actorsMutex;

std::atomic<uint64_t> g_totalCalls{ 0 };
std::atomic<uint64_t> g_totalNs{ 0 };
std::atomic<uint64_t> g_markedCalls{ 0 };
std::atomic<uint64_t> g_markedNs{ 0 };
std::atomic<uint64_t> g_skipped{ 0 };

using Update_t = void(__fastcall*)(RE::Actor*, float);
constexpr std::size_t kUpdateVtblIndex = 0x0AD;
Update_t g_realUpdate = nullptr;

std::atomic<uint64_t> g_updCalls{ 0 };
std::atomic<uint64_t> g_updNs{ 0 };
std::atomic<uint64_t> g_updMarkedCalls{ 0 };
std::atomic<uint64_t> g_updMarkedNs{ 0 };

void DiagLine(const char* msg, std::uintptr_t value = 0)
{
  std::ofstream f("Data/Platform/clone-ai-diag.log", std::ios::app);
  if (f) {
    f << "[clone-ai] " << msg;
    if (value) {
      f << " 0x" << std::hex << value << std::dec;
    }
    f << "\n";
  }
}

bool IsMarked(uint32_t formId)
{

  if (formId < 0xFF000000) {
    return false;
  }
  std::lock_guard l(g_actorsMutex);
  return g_actors.find(formId) != g_actors.end();
}

void __fastcall HookUpdateCombat(RE::Actor* self)
{
  const int mode = g_mode.load(std::memory_order_relaxed);

  if (mode == 0 || !self) {
    g_realUpdateCombat(self);
    return;
  }

  const bool marked = IsMarked(self->GetFormID());

  if (mode == 2 && marked) {

    g_skipped.fetch_add(1, std::memory_order_relaxed);
    return;
  }

  if (mode == 1) {

    const auto t0 = std::chrono::steady_clock::now();
    g_realUpdateCombat(self);
    const auto dt = static_cast<uint64_t>(
      std::chrono::duration_cast<std::chrono::nanoseconds>(
        std::chrono::steady_clock::now() - t0)
        .count());
    g_totalCalls.fetch_add(1, std::memory_order_relaxed);
    g_totalNs.fetch_add(dt, std::memory_order_relaxed);
    if (marked) {
      g_markedCalls.fetch_add(1, std::memory_order_relaxed);
      g_markedNs.fetch_add(dt, std::memory_order_relaxed);
    }
    return;
  }

  g_realUpdateCombat(self);
}

void __fastcall HookUpdate(RE::Actor* self, float delta)
{
  if (g_mode.load(std::memory_order_relaxed) != 1 || !self) {
    g_realUpdate(self, delta);
    return;
  }

  const bool marked = IsMarked(self->GetFormID());
  const auto t0 = std::chrono::steady_clock::now();
  g_realUpdate(self, delta);
  const auto dt = static_cast<uint64_t>(
    std::chrono::duration_cast<std::chrono::nanoseconds>(
      std::chrono::steady_clock::now() - t0)
      .count());

  g_updCalls.fetch_add(1, std::memory_order_relaxed);
  g_updNs.fetch_add(dt, std::memory_order_relaxed);
  if (marked) {
    g_updMarkedCalls.fetch_add(1, std::memory_order_relaxed);
    g_updMarkedNs.fetch_add(dt, std::memory_order_relaxed);
  }
}

void InstallOnce()
{
  std::call_once(g_installFlag, [] {

    REL::Relocation<std::uintptr_t> vtbl{ RE::Character::VTABLE[0] };
    g_realUpdateCombat = reinterpret_cast<UpdateCombat_t>(
      vtbl.write_vfunc(kUpdateCombatVtblIndex, HookUpdateCombat));
    DiagLine("hooked Character::UpdateCombat, orig=",
             reinterpret_cast<std::uintptr_t>(g_realUpdateCombat));

    g_realUpdate =
      reinterpret_cast<Update_t>(vtbl.write_vfunc(kUpdateVtblIndex, HookUpdate));
    DiagLine("hooked Character::Update, orig=",
             reinterpret_cast<std::uintptr_t>(g_realUpdate));
  });
}

}

namespace CloneAiThrottle {

void SetMode(int mode)
{
  if (mode > 0) {
    InstallOnce();
  }
  const int prev = g_mode.exchange(mode, std::memory_order_relaxed);
  if (prev != mode) {
    DiagLine(mode == 0   ? "mode=off"
               : mode == 1 ? "mode=measure"
                           : "mode=block");
  }
}

void SetActors(const uint32_t* ids, uint32_t count)
{
  std::lock_guard l(g_actorsMutex);
  g_actors.clear();
  for (uint32_t i = 0; i < count; ++i) {

    if (ids[i] >= 0xFF000000) {
      g_actors.insert(ids[i]);
    }
  }
}

Stats TakeStats()
{
  Stats s;
  s.totalCalls = g_totalCalls.exchange(0, std::memory_order_relaxed);
  s.totalNs = g_totalNs.exchange(0, std::memory_order_relaxed);
  s.markedCalls = g_markedCalls.exchange(0, std::memory_order_relaxed);
  s.markedNs = g_markedNs.exchange(0, std::memory_order_relaxed);
  s.skipped = g_skipped.exchange(0, std::memory_order_relaxed);
  s.updCalls = g_updCalls.exchange(0, std::memory_order_relaxed);
  s.updNs = g_updNs.exchange(0, std::memory_order_relaxed);
  s.updMarkedCalls = g_updMarkedCalls.exchange(0, std::memory_order_relaxed);
  s.updMarkedNs = g_updMarkedNs.exchange(0, std::memory_order_relaxed);
  return s;
}

}

Napi::Value CloneAiApi::SetMode(const Napi::CallbackInfo& info)
{
  const auto mode =
    static_cast<int>(NapiHelper::ExtractInt32(info[0], "cloneAiMode"));
  if (mode < 0 || mode > 2) {
    throw std::runtime_error("cloneAiMode must be 0 (off), 1 (measure) or 2 (block)");
  }
  CloneAiThrottle::SetMode(mode);
  return info.Env().Undefined();
}

Napi::Value CloneAiApi::SetActors(const Napi::CallbackInfo& info)
{
  if (!info[0].IsTypedArray()) {
    throw std::runtime_error("formIds must be a Uint32Array");
  }
  auto typedArr = info[0].As<Napi::TypedArray>();
  if (typedArr.TypedArrayType() != napi_uint32_array) {
    throw std::runtime_error("formIds must be a Uint32Array");
  }

  auto idsArr = info[0].As<Napi::Uint32Array>();
  const uint32_t n = static_cast<uint32_t>(idsArr.ElementLength());
  CloneAiThrottle::SetActors(n ? idsArr.Data() : nullptr, n);
  return info.Env().Undefined();
}

Napi::Value CloneAiApi::TakeStats(const Napi::CallbackInfo& info)
{
  const auto s = CloneAiThrottle::TakeStats();
  auto env = info.Env();
  auto out = Napi::Object::New(env);

  out.Set("totalCalls", Napi::Number::New(env, static_cast<double>(s.totalCalls)));
  out.Set("totalUs", Napi::Number::New(env, static_cast<double>(s.totalNs) / 1000.0));
  out.Set("markedCalls",
          Napi::Number::New(env, static_cast<double>(s.markedCalls)));
  out.Set("markedUs",
          Napi::Number::New(env, static_cast<double>(s.markedNs) / 1000.0));
  out.Set("skipped", Napi::Number::New(env, static_cast<double>(s.skipped)));
  out.Set("updCalls", Napi::Number::New(env, static_cast<double>(s.updCalls)));
  out.Set("updUs", Napi::Number::New(env, static_cast<double>(s.updNs) / 1000.0));
  out.Set("updMarkedCalls",
          Napi::Number::New(env, static_cast<double>(s.updMarkedCalls)));
  out.Set("updMarkedUs",
          Napi::Number::New(env, static_cast<double>(s.updMarkedNs) / 1000.0));
  return out;
}
