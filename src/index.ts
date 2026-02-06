// 主入口文件
import "./style.css";
import $ from "jquery";
import { Option, Ref } from "./types";

// 1. 响应式数据
// 2. 订阅发布模式
// 3. 编译

class EventBus {
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

function ref<T>(value: T): Ref<T> {
    const obj = { value, __isRef: true }
    const state = new Proxy(obj, {
        set: (target, key, value) => {
            if(key === 'value'){
                target[key] = value;
                eventBus.publish(state)
            }
            return true;
        },
        get: (target, key) => {
            if(key === 'value' && currentUpdateFn){
              eventBus.subscribe(state, currentUpdateFn);
            }
            return target[key as keyof typeof target];
        }
    }) as Ref<T>;
    return state
}

function compile(option: Option){
  const {selector, show, text, listeners} = option;

  const element = $(selector);

  const updateFn = () => {
    const showValue = typeof show === 'function' ? show() : show;
    const textValue = typeof text === 'function' ? text() : text;
    if(textValue !== undefined) element.text(textValue);
    showValue || showValue === undefined ? element.show() : element.hide();
  }

  currentUpdateFn = updateFn;
  updateFn();
  currentUpdateFn = null;

  if(listeners && listeners.length > 0){
    listeners.forEach(listener => {
      element.on(listener.type, listener.callback)
    })
  }
}

const eventBus = new EventBus();

let currentUpdateFn : (()=>void) | null = null;

const count = ref(0);

const options: Option[] = [
  {
    selector: "#count",
    text: () => `count: ${count.value}`,
  },
  {
    selector: '#counter',
    listeners: [
      {
        type: 'click',
        callback: () => count.value++
      }
    ],
    text: () => `点击计数: ${count.value}`
  }
];

options.forEach((option) => compile(option));
