// 主入口文件
import "./style.css";
import $ from "jquery";
import { Ref, Option } from "./types";
import { EventBus } from "./core/event";
// 当前正在收集依赖的更新函数
let currentUpdateFn: (() => void) | null = null;

const eventBus = new EventBus();

// 标记是否处于 compile 阶段
let isCompiling = false;

function ref<T>(value: T): Ref<T> {
  const obj = { value, __isRef: true as const };
  const state = new Proxy(obj, {
    set: (target, key, v) => {
      if (key === "value") {
        const oldValue = target.value;
        target.value = v;
        // 值发生变化时，发布通知
        if (oldValue !== v) {
          eventBus.publish(state);
        }
      }
      return true;
    },
    get: (target, key) => {
      // 依赖收集：当有更新函数正在收集时，直接建立订阅关系
      if (key === "value" && currentUpdateFn) {
        eventBus.subscribe(state, currentUpdateFn, isCompiling);
      }
      return target[key as keyof typeof target];
    },
  }) as Ref<T>;
  return state;
}

/**
 * 创建响应式数组
 * 拦截数组的变更方法，触发更新
 */
function reactiveArray<T>(initialValue: T[]): Ref<T[]> {
  // 需要拦截的数组变更方法
  const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'];
  
  // 用于存储代理数组和触发更新
  const container = {
    __isRef: true as const,
    rawArray: [...initialValue],
    proxyArray: null as T[] | null
  };
  
  // 创建代理数组
  const createReactiveArray = (arr: T[]): T[] => {
    return new Proxy(arr, {
      get(target, key) {
        const value = target[key as keyof T[]];
        
        // 拦截数组变更方法
        if (typeof key === 'string' && arrayMethods.includes(key) && typeof value === 'function') {
          return function (...args: any[]) {
            const result = (value as Function).apply(target, args);
            // 触发更新
            eventBus.publish(state);
            return result;
          };
        }
        
        return value;
      },
      set(target, key, newValue) {
        const result = Reflect.set(target, key, newValue);
        // 数组索引赋值或 length 变化时触发更新
        if (typeof key === 'string' && (!isNaN(Number(key)) || key === 'length')) {
          eventBus.publish(state);
        }
        return result;
      }
    });
  };
  
  container.proxyArray = createReactiveArray(container.rawArray);
  
  // 创建 Ref 代理
  const state = new Proxy(container, {
    get(target, key) {
      if (key === 'value') {
        // 依赖收集
        if (currentUpdateFn) {
          eventBus.subscribe(state as unknown as Ref<T[]>, currentUpdateFn, isCompiling);
        }
        return target.proxyArray;
      }
      if (key === '__isRef') {
        return true;
      }
      return target[key as keyof typeof target];
    },
    set(target, key, newValue) {
      if (key === 'value') {
        target.rawArray = [...newValue];
        target.proxyArray = createReactiveArray(target.rawArray);
        eventBus.publish(state as unknown as Ref<T[]>);
        return true;
      }
      return Reflect.set(target, key, newValue);
    }
  }) as unknown as Ref<T[]>;
  
  return state;
}

function computed<T>(fn: () => T): Ref<T> {
  const cref = ref<T | null>(null);
  const updateFn = () => {
    cref.value = fn();
  };
  currentUpdateFn = updateFn;
  updateFn();
  currentUpdateFn = null;
  return cref as Ref<T>;
}

function watch<T>(ref: Ref<T>, callback: (newValue: T, oldValue: T) => void) {
  // 用闭包保存旧值
  let oldValue = ref.value;

  eventBus.subscribe(
    ref,
    () => {
      const newValue = ref.value;
      callback(newValue, oldValue);
      oldValue = newValue; // 更新旧值
    },
    false
  );
}
function useEffect(callback: () => void, [...refs]) {
  const updateFn = callback;
  refs.forEach((ref) => {
    eventBus.subscribe(ref, updateFn, false);
  });
}

// 存储所有创建的 Ref，用于遍历
const count: Ref<number> = ref(0);
const isShow: Ref<boolean> = ref(true);
const isVisible: Ref<boolean> = computed(() => count.value % 3 === 0);
const arr = reactiveArray([1, 2, 3]);

watch(isVisible, (newValue, oldValue) => {
  console.log("isVisible changed:", newValue, oldValue);
});

useEffect(() => {
  console.log("count", count.value);
}, [isVisible]);

const options: Option[] = [
  {
    selector: "#counter",
    listeners: [
      {
        type: "click",
        handler: () => {
          isShow.value = count.value % 3 === 0;
          count.value++;
          arr.value.push(count.value);
        },
      },
    ],
    text: () => `点击计数: ${count.value}`,
    show: true,
  },
  {
    selector: "#count",
    text: () => `1: ${count.value}`,
  },
  {
    selector: "#msg",
    render: () => (
      <ul>
        {arr.value.map((item: number) => <li>{item}</li>)}
      </ul>
    ),
  },
];

// 执行编译
compile(options);

/**
 * 编译过程：遍历 options，完成依赖收集、DOM 绑定和订阅设置
 */
function compile(options: Option[]) {
  // 只清空 compile 阶段的订阅，保留 computed 等建立的订阅
  eventBus.clearCompileSubscribers();
  isCompiling = true;

  // 遍历每个 option，进行依赖收集 + DOM 绑定
  options.forEach((option) => {
    const { selector, text, show, listeners, render } = option;
    const $element = $(selector);

    // 创建该 selector 的更新函数
    const updateFn = () => {
      // 更新 text
      if (text) {
        if (typeof text === "function") {
          $element.text(String(text()));
        } else {
          $element.text(text);
        }
      }
      // 更新 show/hide
      if (show !== undefined) {
        if (typeof show === "function") {
          show() ? $element.show() : $element.hide();
        } else {
          show ? $element.show() : $element.hide();
        }
      }
      // 处理渲染函数
      if (render) {
        const result = render();
        console.log("result: ", result);
        $element.empty(); // 清空现有内容
        if (typeof result === "string") {
          $element.html(result);
        } else if (result instanceof Node) {
          $element.append(result);
        }
      }
    };

    // 设置当前正在收集的更新函数
    currentUpdateFn = updateFn;

    // 首次执行更新函数，同时触发依赖收集并建立订阅
    updateFn();

    // 重置
    currentUpdateFn = null;

    // 处理事件监听器绑定（只绑定一次）
    if (listeners) {
      listeners.forEach((listener) => {
        $element.on(listener.type, listener.handler);
      });
    }
  });

  isCompiling = false;
}
