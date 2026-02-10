import { Option, ParsedOption, Listener } from "../types";
import { setCurrentUpdateFn } from "../reactivity/state";
import { resolveComponents } from "./component";
import { diff } from "./diff";

type RenderResult = string | HTMLElement | Text | DocumentFragment | SVGElement;

/** 绑定显隐逻辑 */
function bindShow(el: HTMLElement, show: boolean | (() => boolean) | undefined) {
  if (show === undefined) return;
  const val = typeof show === "function" ? show() : show;
  el.style.display = val === false ? "none" : "";
}

/** 绑定文本内容 */
function bindText(el: Element, text: string | (() => string) | undefined) {
  if (text === undefined) return;
  el.textContent = typeof text === "function" ? text() : text;
}

/** 绑定 value（input/textarea） */
function bindValue(el: Element, value: (() => string) | undefined) {
  if (!value) return;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.value = value();
  }
}

/** 执行 render 并替换当前元素，返回新的跟踪元素 */
function bindRender(currentEl: Element, render: (() => RenderResult) | undefined): Element {
  if (!render || typeof render !== "function") return currentEl;

  const result = render();

  if (typeof result === "string") {
    const temp = document.createElement("div");
    temp.innerHTML = result.trim();
    const newEl = temp.firstElementChild;
    if (newEl) {
      // 使用 diff 算法更新
      return diff(currentEl, newEl) as Element;
    }
  } else if (result instanceof DocumentFragment) {
    if (currentEl.parentNode) {
      const children = Array.from(result.childNodes);
      currentEl.replaceWith(result);
      return (children.find(n => n instanceof Element) as Element) || currentEl;
    }
  } else if (result instanceof Element) {
    // 使用 diff 算法更新
    return diff(currentEl, result) as Element;
  }
  return currentEl;
}

/** 绑定事件监听 */
function bindListeners(el: Element, listeners: Listener[] | undefined) {
  if (!listeners || listeners.length === 0) return;
  listeners.forEach((listener) => {
    el.addEventListener(listener.type, listener.callback as EventListener);
  });
}

/** 编译单个元素 */
function compileElement(el: Element, option: Option) {
  const { show, text, listeners, render, value } = option;

  let currentEl: Element = el;

  const updateFn = () => {
    bindShow(currentEl as HTMLElement, show);
    bindText(currentEl, text);
    bindValue(currentEl, value);
    currentEl = bindRender(currentEl, render);
  };

  setCurrentUpdateFn(updateFn);
  updateFn();
  setCurrentUpdateFn(null);

  bindListeners(currentEl, listeners);
}

export function compile(option: Option) {
  const els = document.querySelectorAll(option.selector);
  els.forEach((el) => compileElement(el, option));
}

/**
 * 处理插槽中的子组件递归编译
 */
function processSlots(slots: Map<string, Node[]>) {
  if (slots.size === 0) return;

  slots.forEach((nodes, slotName) => {
    const resolvedNodes: Node[] = [];
    nodes.forEach((node) => {
      if (node instanceof Element) {
        const childOptions = resolveComponents(node);
        if (childOptions.length > 0) {
          // node 本身就是自定义组件，递归编译后用渲染结果替换
          childOptions.forEach((op) => {
            compileCustom(op);
          });
          // 第一个 option 的 el 就是 node 本身（resolveComponents 会检查 root）
          // compileCustom 会把 el.replaceWith 失败（游离节点），
          // 所以这里直接拿 render 结果作为替换节点
          const firstOp = childOptions[0];
          if (firstOp.el === node && firstOp.render) {
            const result = firstOp.render(firstOp.props, firstOp.slots);
            if (result instanceof Node) {
              resolvedNodes.push(result);
            } else if (typeof result === "string") {
              const wrapper = document.createElement("span");
              wrapper.innerHTML = result;
              resolvedNodes.push(...Array.from(wrapper.childNodes));
            }
          } else {
            resolvedNodes.push(node);
          }
        } else {
          resolvedNodes.push(node);
        }
      } else {
        resolvedNodes.push(node);
      }
    });
    slots.set(slotName, resolvedNodes);
  });
}

export function compileCustom(option: ParsedOption){
  const { el, render, slots, props } = option;
  const updateFn = () => {
    if(render){
      // 先渲染插槽中的子组件
      processSlots(slots);
      
      const result = render(props, slots);
      el.replaceWith(result);
    }
  }
  setCurrentUpdateFn(updateFn);
  updateFn();
  setCurrentUpdateFn(null);
}
