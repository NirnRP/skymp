#include "HorsePhysicsBlock.h"

#include <RE/A/Actor.h>
#include <RE/N/NiPoint3.h>
#include <REL/Relocation.h>

#include <FunctionHook.hpp>

#include <atomic>
#include <fstream>
#include <mutex>
#include <unordered_set>

namespace {

using SetPosition_t = char(__fastcall*)(RE::Actor*, RE::NiPoint3&);

std::atomic<bool> g_enabled{ false };
SetPosition_t g_realSetPosition = nullptr;
std::once_flag g_installFlag;

std::unordered_set<uint32_t> g_blocked;
std::mutex g_blockedMutex;

void DiagLine(const char* msg, std::uintptr_t value = 0)
{
  std::ofstream f("Data/Platform/mount-native-diag.log", std::ios::app);
  if (f) {
    f << "[phys-block] " << msg;
    if (value) {
      f << " 0x" << std::hex << value << std::dec;
    }
    f << "\n";
  }
}

char __fastcall HookSetPosition(RE::Actor* apThis, RE::NiPoint3& aPosition)
{

  if (g_enabled.load(std::memory_order_relaxed) && apThis) {
    const uint32_t id = apThis->GetFormID();
    if (id >= 0xFF000000) {
      bool blocked;
      {
        std::lock_guard l(g_blockedMutex);
        blocked = g_blocked.find(id) != g_blocked.end();
      }
      if (blocked) {

        return 1;
      }
    }
  }
  return g_realSetPosition(apThis, aPosition);
}

void InstallOnce()
{
  std::call_once(g_installFlag, [] {
    if (!REL::Module::IsAE()) {
      DiagLine("NOT AE — hook skipped");
      return;
    }
    REL::Relocation<SetPosition_t> reloc{ REL::ID(19790) };
    g_realSetPosition = reloc.get();
    DiagLine("install addr=", reinterpret_cast<std::uintptr_t>(g_realSetPosition));
    TP_HOOK(&g_realSetPosition, HookSetPosition);
    TP_HOOK_COMMIT;
    DiagLine("hook committed");
  });
}

}

namespace HorsePhysicsBlock {

void SetEnabled(bool enabled)
{
  InstallOnce();
  g_enabled.store(enabled, std::memory_order_relaxed);
  DiagLine(enabled ? "enabled" : "disabled");
}

void Add(uint32_t formId)
{
  std::lock_guard l(g_blockedMutex);
  g_blocked.insert(formId);
}

void Remove(uint32_t formId)
{
  std::lock_guard l(g_blockedMutex);
  g_blocked.erase(formId);
}

}
