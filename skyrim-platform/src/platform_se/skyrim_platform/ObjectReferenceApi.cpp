#include "ObjectReferenceApi.h"

#include "NullPointerException.h"

namespace {
RE::TESObjectREFR* GetArgObjectReference(const Napi::Value& arg)
{
  auto formId = NapiHelper::ExtractUInt32(arg, "refrFormId");
  auto refr = RE::TESForm::LookupByID<RE::TESObjectREFR>(formId);

  if (!refr) {
    throw NullPointerException("refr");
  }

  return refr;
}
}

Napi::Value ObjectReferenceApi::SetCollision(const Napi::CallbackInfo& info)
{
  auto refr = GetArgObjectReference(info[0]);
  refr->SetCollision(NapiHelper::ExtractBoolean(info[1], "collision"));
  return info.Env().Undefined();
}

Napi::Value ObjectReferenceApi::GetIdentityBatch(const Napi::CallbackInfo& info)
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

  auto out = Napi::Uint32Array::New(info.Env(), n * 2);

  for (uint32_t i = 0; i < n; ++i) {
    out[2 * i + 0] = 0;
    out[2 * i + 1] = 0;

    auto refr = RE::TESForm::LookupByID<RE::TESObjectREFR>(idsArr[i]);
    if (!refr) {
      continue;
    }

    if (auto base = refr->GetBaseObject()) {
      out[2 * i + 0] = base->formID;
    }

    if (auto actor = refr->As<RE::Actor>()) {
      if (auto race = actor->GetRace()) {
        out[2 * i + 1] = race->formID;
      }
    }
  }

  return out;
}
