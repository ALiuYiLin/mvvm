import { Option, ParsedOption } from "./types";
import $ from "jquery";
import { setCurrentUpdateFn } from "./state";
import { resolveComponents } from "./component";

export function compile(option: Option) {
  const { selector, show, text, listeners,render, value } = option;

  const element = $(selector);

  // 用于追踪 render 替换后的当前 DOM 元素
  let currentEl: Element | null = element[0] || null;

  const updateFn = () => {
    const showValue = typeof show === "function" ? show() : show;
    const textValue = typeof text === "function" ? text() : text;
    if (textValue !== undefined) element.text(textValue);
    showValue || showValue === undefined ? element.show() : element.hide();
    if (value) {
      const el = element[0];
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = value();
      }
    }
    if(render && typeof render === 'function'){
      const result = render();

      if(typeof result === 'string') {
        const temp = document.createElement('div');
        temp.innerHTML = result.trim();
        const newEl = temp.firstElementChild;
        if (newEl && currentEl) {
          currentEl.replaceWith(newEl);
          currentEl = newEl;
        }
      } else if(result instanceof DocumentFragment) {
        // Fragment：用其子节点替换当前元素
        if (currentEl && currentEl.parentNode) {
          const children = Array.from(result.childNodes);
          currentEl.replaceWith(result);
          // 追踪第一个元素节点用于下次替换
          currentEl = children.find(n => n instanceof Element) as Element || null;
        }
      } else if(result instanceof Element) {
        if (currentEl) {
          currentEl.replaceWith(result);
          currentEl = result;
        }
      }
    }
  };

  setCurrentUpdateFn(updateFn);
  updateFn();
  setCurrentUpdateFn(null);

  if (listeners && listeners.length > 0) {
    listeners.forEach((listener) => {
      element.on(listener.type, listener.callback);
    });
  }
}

export function compileCustom(option: ParsedOption){
  const { el, render, slots, props } = option;
  const updateFn = () => {
    if(render){
      // 先渲染插槽中的子组件：遍历 slots，将自定义组件节点替换为渲染后的 DOM
      if(slots.size > 0){
        slots.forEach((nodes, slotName) => {
          const resolvedNodes: Node[] = [];
          nodes.forEach(node => {
            if(node instanceof Element){
              const childOptions = resolveComponents(node);
              if(childOptions.length > 0){
                // node 本身就是自定义组件，递归编译后用渲染结果替换
                childOptions.forEach(op => {
                  compileCustom(op);
                });
                // 第一个 option 的 el 就是 node 本身（resolveComponents 会检查 root）
                // compileCustom 会把 el.replaceWith 失败（游离节点），
                // 所以这里直接拿 render 结果作为替换节点
                const firstOp = childOptions[0];
                if(firstOp.el === node && firstOp.render){
                  const result = firstOp.render(firstOp.props, firstOp.slots);
                  if(result instanceof Node){
                    resolvedNodes.push(result);
                  } else if(typeof result === 'string'){
                    const wrapper = document.createElement('span');
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
      const result = render(props, slots);
      el.replaceWith(result);
    }
  }
  setCurrentUpdateFn(updateFn);
  updateFn();
  setCurrentUpdateFn(null);
}
