import { Option, ParsedOption, Listener } from "../types";
import { resolveComponents } from "./component";
import { setCurrentUpdateFn } from "../hooks";
import { diff, patchKeyedChildren, hasKeyedChildren } from "./diff";

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
      return diff(currentEl, newEl) as Element;
    }
  } else if (result instanceof DocumentFragment) {
    if (currentEl.parentNode) {
      const parent = currentEl.parentNode as HTMLElement;
      // 获取或创建锚点标记
      let startAnchor = (currentEl as any)._fragmentStartAnchor as Comment | undefined;
      let endAnchor = (currentEl as any)._fragmentEndAnchor as Comment | undefined;

      const newChildren = Array.from(result.childNodes);

      if (!startAnchor || !endAnchor) {
        // 首次渲染：创建锚点，插入 Fragment 内容
        startAnchor = document.createComment("fragment-start");
        endAnchor = document.createComment("fragment-end");
        
        currentEl.replaceWith(startAnchor);
        startAnchor.after(endAnchor);
        
        // 将新子节点插入到两个锚点之间
        let insertBefore: Node = endAnchor;
        for (const child of newChildren) {
          parent.insertBefore(child, insertBefore);
        }
      } else {
        // 后续更新：收集两个锚点之间的旧子节点，做 keyed diff
        const oldChildren: Node[] = [];
        let current: Node | null = startAnchor.nextSibling;
        while (current && current !== endAnchor) {
          oldChildren.push(current);
          current = current.nextSibling;
        }

        if (hasKeyedChildren(newChildren)) {
          // keyed diff：复用/移动/增删
          patchKeyedChildren(parent, oldChildren, newChildren, endAnchor);
        } else {
          // 无 key：index-based diff
          const maxLen = Math.max(oldChildren.length, newChildren.length);
          for (let i = 0; i < maxLen; i++) {
            const oldChild = oldChildren[i];
            const newChild = newChildren[i];
            if (!oldChild && newChild) {
              parent.insertBefore(newChild, endAnchor);
            } else if (oldChild && !newChild) {
              parent.removeChild(oldChild);
            } else if (oldChild && newChild) {
              diff(oldChild, newChild);
            }
          }
        }
      }

      // 用 startAnchor 作为跟踪元素（它不会被移除），把锚点信息挂在上面
      // 但 startAnchor 是 Comment 不是 Element，需要一个代理 Element 来保持 currentEl 的追踪
      // 返回一个 "代理" Element：找到锚点之间的第一个 Element，把锚点信息挂上去
      const trackerEl = findTrackerElement(parent, startAnchor, endAnchor);
      (trackerEl as any)._fragmentStartAnchor = startAnchor;
      (trackerEl as any)._fragmentEndAnchor = endAnchor;
      return trackerEl;
    }
  } else if (result instanceof Element) {
    return diff(currentEl, result) as Element;
  }
  return currentEl;
}

/** 在两个锚点之间找到第一个 Element 作为 tracker，找不到就创建一个隐藏的 span */
function findTrackerElement(parent: Node, start: Comment, end: Comment): Element {
  let current: Node | null = start.nextSibling;
  while (current && current !== end) {
    if (current instanceof Element) {
      return current;
    }
    current = current.nextSibling;
  }
  // 没有 Element 子节点时，插入一个隐藏 span 作为 tracker
  const placeholder = document.createElement("span");
  placeholder.style.display = "none";
  parent.insertBefore(placeholder, end);
  return placeholder;
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
  const { show, text, listeners, render, value, ref } = option;

  let currentEl: Element = el;

  const updateFn = () => {
    bindShow(currentEl as HTMLElement, show);
    bindText(currentEl, text);
    bindValue(currentEl, value);
    currentEl = bindRender(currentEl, render);
    if(ref !== undefined) ref.value = currentEl;
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
 * 处理 props 中插槽内容的子组件递归编译
 * 插槽内容已合并到 props 中：children 和其他具名插槽
 */
function processSlotProps(props: Record<string, any>) {
  for (const key of Object.keys(props)) {
    const value = props[key];
    if (!Array.isArray(value)) continue;
    // 检查是否为 Node[] 类型的插槽内容
    if (value.length === 0 || !(value[0] instanceof Node)) continue;

    const resolvedNodes: Node[] = [];
    value.forEach((node: Node) => {
      if (node instanceof Element) {
        const childOptions = resolveComponents(node);
        if (childOptions.length > 0) {
          childOptions.forEach((op) => {
            compileCustom(op);
          });
          const firstOp = childOptions[0];
          if (firstOp.el === node && firstOp.render) {
            const result = firstOp.render(firstOp.props);
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
    props[key] = resolvedNodes;
  }
}

export function compileCustom(option: ParsedOption){
  const { el, render, props } = option;
  const updateFn = () => {
    if(render){
      // 先渲染 props 中插槽内容的子组件
      processSlotProps(props);
      
      const result = render(props);
      el.replaceWith(result);
    }
  }
  setCurrentUpdateFn(updateFn);
  updateFn();
  setCurrentUpdateFn(null);
}
