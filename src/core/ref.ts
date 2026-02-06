import { Ref } from "../types";
import { eventBus } from "./event";
import { getCurrentUpdateFn } from "./state";
export function ref<T>(value: T): Ref<T> {
  const obj = { value, __isRef: true };
  const state = new Proxy(obj, {
    set: (target, key, value) => {
      if (key === "value") {
        target[key] = value;
        eventBus.publish(state);
      }
      return true;
    },
    get: (target, key) => {
      const currentUpdateFn = getCurrentUpdateFn();
      if (key === "value" && currentUpdateFn) {
        eventBus.subscribe(state, currentUpdateFn);
      }
      return target[key as keyof typeof target];
    },
  }) as Ref<T>;
  return state;
}