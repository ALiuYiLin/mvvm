import { Ref } from "../types";
import { eventBus } from "./event";
import { getCurrentUpdateFn } from "./state";
export function reactiveArray<T>(inittialValue: T[]): Ref<T[]> {
  // 需要拦截的数组变更方法
  const arrayMethods = [
    'push', 'pop', 'shift', 'unshift',
    'splice', 'soft', 'reverse', 'fill',
    'copyWithin'
  ]

  // 用于存储代理数组和触发更新
  const container = {
    __isRef: true as const,
    rawArray: [...inittialValue],
    proxyArray: null as T[] | null
  }

  // 创建代理数组 
  const createReactiveArray = (arr: T[]): T[] => {
    return new Proxy(arr, {
      get(target, key) {
        const value = target[key as keyof T[]]
        // 拦截数组变更方法
        if(typeof key === 'string' && arrayMethods.includes(key) && typeof value === 'function'){
          return function(...args: any[]){
            const result = (value as Function).apply(target, args)
            // 触发更新
            eventBus.publish(state)
            return result
          }
        }
        return value
      },
      set(target, key, newValue){
        const result = Reflect.set(target, key, newValue);
        // 数组索引赋值或length变化时触发更新
        if(typeof key === 'string' && (!isNaN(Number(key)) || key === 'length')) {
          eventBus.publish(state)
        }
        return result;
      }
    })
  }

  container.proxyArray = createReactiveArray(container.rawArray);

  // 创建Ref代理
  const state = new Proxy(container, {
    get(target, key){
      const currentUpdateFn = getCurrentUpdateFn()
      if(key === 'value' && currentUpdateFn){
        eventBus.subscribe(state as unknown as Ref<T[]>, currentUpdateFn)
        return target.proxyArray
      }
      if(key === '__isRef') return true
      return target[key as keyof typeof target]
    },
    set(target, key, newValue){
      if(key === 'value'){
        target.rawArray = [...newValue]
        target.proxyArray = createReactiveArray(target.rawArray)
        eventBus.publish(state as unknown as Ref<T[]>)
        return true
      }
      return Reflect.set(target, key, newValue)
    }
  }) as unknown as Ref<T[]>

  return state
}