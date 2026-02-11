import { Ref } from "../types";

export class EventBus {
  private subscribers = new Map<Ref<any>, Set<()=>void>>();

  // 订阅
  subscribe(ref: Ref<any>, callback: () => void) {
    if (!this.subscribers.has(ref)) {
      this.subscribers.set(ref, new Set());
    }
    this.subscribers.get(ref)?.add(callback);
  }

  // 发布
  publish(ref: Ref<any>){
    const callbacks = this.subscribers.get(ref);
    if(callbacks) callbacks.forEach(cb=>cb())
  }
}

export const eventBus = new EventBus();