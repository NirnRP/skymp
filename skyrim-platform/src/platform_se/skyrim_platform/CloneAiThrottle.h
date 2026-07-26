#pragma once

#include "NapiHelper.h"

namespace CloneAiThrottle {

void SetMode(int mode);

void SetActors(const uint32_t* ids, uint32_t count);

struct Stats
{
  uint64_t totalCalls = 0;
  uint64_t totalNs = 0;
  uint64_t markedCalls = 0;
  uint64_t markedNs = 0;
  uint64_t skipped = 0;

  uint64_t updCalls = 0;
  uint64_t updNs = 0;
  uint64_t updMarkedCalls = 0;
  uint64_t updMarkedNs = 0;
};

Stats TakeStats();

}

namespace CloneAiApi {

Napi::Value SetMode(const Napi::CallbackInfo& info);
Napi::Value SetActors(const Napi::CallbackInfo& info);
Napi::Value TakeStats(const Napi::CallbackInfo& info);

inline void Register(Napi::Env env, Napi::Object& exports)
{
  exports.Set("setCloneAiMode",
              Napi::Function::New(env, NapiHelper::WrapCppExceptions(SetMode)));
  exports.Set(
    "setCloneAiActors",
    Napi::Function::New(env, NapiHelper::WrapCppExceptions(SetActors)));
  exports.Set(
    "takeCloneAiStats",
    Napi::Function::New(env, NapiHelper::WrapCppExceptions(TakeStats)));
}

}
