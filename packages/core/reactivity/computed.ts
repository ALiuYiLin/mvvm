import { Ref } from "../types";
import { ref } from "./ref"
import { setCurrentUpdateFn } from "./state"

export function computed<T>(computedFn: ()=> T): Ref<T>{
  const computedRef = ref<T | null>(null)
  const updateFn = ()=> {
    computedRef.value = computedFn()
  }
  setCurrentUpdateFn(updateFn)
  updateFn()
  setCurrentUpdateFn(null)
  return computedRef as Ref<T>
}
