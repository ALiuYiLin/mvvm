// 主入口文件
import "./style.css";
import $ from "jquery";

type Option = {
  selector: string;
  text?: string | (() => string | number | boolean);
  show?: boolean | (() => boolean);
  listeners?: {
    type: string;
    handler: (e: Event) => void;
  }[];
};

type Ref<T> = {
  value: T;
  __isRef: true; // 标识符，用于识别 Ref 对象
};

// 当前正在收集依赖的更新函数
let currentUpdateFn: (() => void) | null = null;

/**
 * 发布订阅中心
 */
class EventBus {
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

// 存储所有创建的 Ref，用于遍历
const count: Ref<number> = ref(0);
const isShow: Ref<boolean> = ref(true);
const isVisible: Ref<boolean> = computed(() => count.value % 3 === 0);

const options: Option[] = [
  {
    selector: "#counter",
    listeners: [
      {
        type: "click",
        handler: () => {
          isShow.value = count.value % 3 === 0;
          count.value++;
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
    show: () => isVisible.value,
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
    const { selector, text, show, listeners } = option;
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
