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
 * 创建响应式对象
 * 深度代理对象，监听所有属性的变化
 */
function reactive<T extends object>(target: T): T {
  // 用于触发更新的虚拟 Ref
  const triggerRef = { value: null, __isRef: true as const } as Ref<any>;
  
  const createReactiveObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // 如果是数组，递归处理每个元素
    if (Array.isArray(obj)) {
      const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'];
      return new Proxy(obj.map(item => createReactiveObject(item)), {
        get(target, key) {
          const value = target[key as keyof typeof target];
          
          // 依赖收集
          if (currentUpdateFn) {
            eventBus.subscribe(triggerRef, currentUpdateFn, isCompiling);
          }
          
          // 拦截数组变更方法
          if (typeof key === 'string' && arrayMethods.includes(key) && typeof value === 'function') {
            return function (...args: any[]) {
              const result = (value as Function).apply(target, args);
              eventBus.publish(triggerRef);
              return result;
            };
          }
          
          return value;
        },
        set(target, key, newValue) {
          const result = Reflect.set(target, key, createReactiveObject(newValue));
          eventBus.publish(triggerRef);
          return result;
        }
      });
    }
    
    // 处理普通对象
    const proxy = new Proxy(obj, {
      get(target, key) {
        // 依赖收集
        if (currentUpdateFn) {
          eventBus.subscribe(triggerRef, currentUpdateFn, isCompiling);
        }
        
        const value = target[key];
        // 如果属性值是对象，递归代理
        if (value !== null && typeof value === 'object') {
          return createReactiveObject(value);
        }
        return value;
      },
      set(target, key, newValue) {
        const oldValue = target[key];
        if (oldValue !== newValue) {
          target[key] = newValue;
          eventBus.publish(triggerRef);
        }
        return true;
      },
      deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key);
        eventBus.publish(triggerRef);
        return result;
      }
    });
    
    return proxy;
  };
  
  return createReactiveObject(target);
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

// 使用 reactive 创建响应式对象
const student = reactive({
  name: "张三",
  age: 18,
  gender: "男",
});


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
          student.age++;  // reactive 对象直接访问属性，不需要 .value
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
  {
    selector: "#student",
    render: () => (
      <div>
        <p>姓名: {student.name}</p>
        <p>年龄: {student.age}</p>
        <p>性别: {student.gender}</p>
      </div>
    )
  }
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
        console.log('result: ', result);
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
