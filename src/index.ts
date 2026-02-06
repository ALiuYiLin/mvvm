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
  __isRef: true;  // 标识符，用于识别 Ref 对象
};

type Dep<T> = {
  data: Ref<T>;
  selectors: string[];
};

// 当前正在收集依赖的 selector
let currentCollectingSelector: string | null = null;
// 用于存储依赖收集结果的 Map: Ref -> Set<selector>
const depMap = new WeakMap<Ref<any>, Set<string>>();
// 存储 selector 对应的更新函数: selector -> updateFn
const updateFnMap = new Map<string, () => void>();

/**
 * 发布订阅中心
 */
class EventBus {
  private subscribers = new Map<Ref<any>, Set<() => void>>();

  // 订阅：将更新函数绑定到 Ref
  subscribe(ref: Ref<any>, callback: () => void) {
    if (!this.subscribers.has(ref)) {
      this.subscribers.set(ref, new Set());
    }
    this.subscribers.get(ref)!.add(callback);
  }

  // 发布：通知所有订阅了该 Ref 的更新函数执行
  publish(ref: Ref<any>) {
    const callbacks = this.subscribers.get(ref);
    if (callbacks) {
      callbacks.forEach((cb) => cb());
    }
  }

  // 清空订阅
  clear() {
    this.subscribers.clear();
  }
}

const eventBus = new EventBus();

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
      // 依赖收集：当有 selector 正在收集时，记录这个 Ref 被哪个 selector 访问
      if (key === "value" && currentCollectingSelector) {
        if (!depMap.has(state)) {
          depMap.set(state, new Set());
        }
        depMap.get(state)!.add(currentCollectingSelector);
      }
      return target[key as keyof typeof target];
    },
  }) as Ref<T>;
  return state;
}

// 存储所有创建的 Ref，用于遍历
const allRefs: Ref<any>[] = [];

const count: Ref<number> = ref(0);
allRefs.push(count);
const isShow: Ref<boolean> = ref(true);
allRefs.push(isShow);

const deps: Dep<any>[] = [];

const options: Option[] = [
  {
    selector: "#counter",
    listeners: [
      {
        type: "click",
        handler: () => {
            isShow.value = count.value % 3 === 0
            count.value++
        }

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
    show: () => isShow.value
  }
];

// 执行编译
compile(options, deps);

/**
 * 编译过程：遍历 options，同时完成依赖收集、DOM 绑定和订阅设置
 */
function compile(options: Option[], deps: Dep<any>[]) {
  // 清空
  deps.length = 0;
  eventBus.clear();
  updateFnMap.clear();

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

    // 存储更新函数
    updateFnMap.set(selector, updateFn);

    // 设置当前正在收集的 selector
    currentCollectingSelector = selector;

    // 首次执行更新函数，同时触发依赖收集
    updateFn();

    // 处理事件监听器绑定（只绑定一次，不需要在更新时重新绑定）
    if (listeners) {
      listeners.forEach((listener) => {
        $element.on(listener.type, listener.handler);
      });
    }

    // 重置当前收集的 selector
    currentCollectingSelector = null;
  });

  // 将 depMap 转换为 deps 数组格式，并建立订阅关系
  allRefs.forEach((refObj) => {
    const selectors = depMap.get(refObj);
    if (selectors && selectors.size > 0) {
      deps.push({
        data: refObj,
        selectors: Array.from(selectors),
      });

      // 为每个依赖的 selector 建立订阅关系
      selectors.forEach((selector) => {
        const updateFn = updateFnMap.get(selector);
        if (updateFn) {
          eventBus.subscribe(refObj, updateFn);
        }
      });
    }
  });
  return deps;
}
