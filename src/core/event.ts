import { Ref } from '../types';
/**
 * 发布订阅中心
 */
export class EventBus {
  private subscribers = new Map<Ref<any>, Set<() => void>>();
  // 标记哪些订阅是 compile 阶段建立的
  private compileSubscribers = new Map<Ref<any>, Set<() => void>>();

  // 订阅：将更新函数绑定到 Ref
  subscribe(ref: Ref<any>, callback: () => void, isCompile = false) {
    if (!this.subscribers.has(ref)) {
      this.subscribers.set(ref, new Set());
    }
    this.subscribers.get(ref)!.add(callback);

    // 记录 compile 阶段的订阅，方便后续清理
    if (isCompile) {
      if (!this.compileSubscribers.has(ref)) {
        this.compileSubscribers.set(ref, new Set());
      }
      this.compileSubscribers.get(ref)!.add(callback);
    }
  }

  // 发布：通知所有订阅了该 Ref 的更新函数执行
  publish(ref: Ref<any>) {
    const callbacks = this.subscribers.get(ref);
    if (callbacks) {
      callbacks.forEach((cb) => cb());
    }
  }

  // 只清空 compile 阶段建立的订阅
  clearCompileSubscribers() {
    this.compileSubscribers.forEach((callbacks, ref) => {
      const allCallbacks = this.subscribers.get(ref);
      if (allCallbacks) {
        callbacks.forEach((cb) => allCallbacks.delete(cb));
      }
    });
    this.compileSubscribers.clear();
  }
}
