import { Option } from "../types";
import $ from "jquery";
import { setCurrentUpdateFn } from "./state";


import { diff } from "./diff";

export function compile(option: Option) {
  const { selector, show, text, listeners,render } = option;

  const element = $(selector);

  const updateFn = () => {
    const showValue = typeof show === "function" ? show() : show;
    const textValue = typeof text === "function" ? text() : text;
    if (textValue !== undefined) element.text(textValue);
    showValue || showValue === undefined ? element.show() : element.hide();
    if(render && typeof render === 'function'){
      // 获取上一次渲染的render
      const lastRenderDom = element.data('__lastRenderDom') as HTMLElement | Text | DocumentFragment | undefined
      
      const result = render()
      
      if(typeof result === 'string') {
        // 字符串简单处理：如果不一致直接替换
        element.empty()
        element.text(result)
        element.data('__lastRenderDom', null) // 清理缓存
      } else if(result instanceof Node) {
        if (lastRenderDom && lastRenderDom instanceof Node && !(lastRenderDom instanceof DocumentFragment) && !(result instanceof DocumentFragment)) {
           // 有旧节点且都不是 Fragment，执行 diff
           const newDom = diff(lastRenderDom, result)
           console.log('lastRenderDom: ', lastRenderDom);
           console.log('result: ', result);
           // diff 内部可能会替换节点，更新引用
           element.data('__lastRenderDom', newDom)
        } else {
           // 首次渲染、或者涉及 Fragment（Fragment 插入后就消失了，很难追踪），直接清空重绘
           element.empty()
           element.append(result)
           // 注意：如果 result 是 DocumentFragment，插入后它就空了，
           // 但我们需要追踪的是“插入后的那些子节点”。
           // 为了简化模型，对于 Fragment 场景我们暂时只存 result 引用（虽然它空了），
           // 或者我们需要改成存储 childNodes 列表。
           // 考虑到 diff 算法的复杂度，这里对 Fragment 场景做降级：下一次直接全量替换。
           element.data('__lastRenderDom', result instanceof DocumentFragment ? null : result)
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
