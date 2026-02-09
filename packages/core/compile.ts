import { Option } from "./types";
import $ from "jquery";
import { setCurrentUpdateFn } from "./state";


import { diff, diffChildren } from "./diff";

export function compile(option: Option) {
  const { selector, show, text, listeners,render } = option;

  const element = $(selector);

  const updateFn = () => {
    const showValue = typeof show === "function" ? show() : show;
    const textValue = typeof text === "function" ? text() : text;
    if (textValue !== undefined) element.text(textValue);
    showValue || showValue === undefined ? element.show() : element.hide();
    if(render && typeof render === 'function'){
      // 获取上一次渲染的 DOM 结构（可能是单个 Node，也可能是 Node 列表）
      // 如果是 Fragment，我们需要追踪的是它的 childNodes 列表，而不是 Fragment 本身
      const lastRenderResult = element.data('__lastRenderResult') as Node | Node[] | undefined
      
      const result = render()
      
      if(typeof result === 'string') {
        element.empty()
        element.text(result)
        element.data('__lastRenderResult', null)
      } else if(result instanceof Node) {
         // 准备本次渲染的“追踪对象”
         // 如果是 Fragment，我们需要克隆一份它的子节点列表（因为 append 后 Fragment 就空了）
         let currentNodes: Node | Node[];
         if (result instanceof DocumentFragment) {
            currentNodes = Array.from(result.childNodes);
         } else {
            currentNodes = result;
         }

         if (lastRenderResult) {
            // 执行 Diff
            // 情况 1: 都是单个元素 (Element vs Element)
            if (!Array.isArray(lastRenderResult) && !Array.isArray(currentNodes) && 
                lastRenderResult instanceof HTMLElement && currentNodes instanceof HTMLElement) {
                const newDom = diff(lastRenderResult, currentNodes)
                element.data('__lastRenderResult', newDom)
            } 
            // 情况 2: 涉及列表/Fragment (List vs List / Element vs List / List vs Element)
            else {
                // 暂时降级：如果涉及 Fragment 列表 diff，逻辑比较复杂（需要类似 Vue 的列表 diff），
                // 这里为了稳健，如果检测到列表长度没变且 key 没变（这里没 key），可以尝试原地 patch？
                // 鉴于目前 diff 算法较弱，先保留“清空重绘”逻辑，但我们可以优化一下：
                // 如果是列表对列表，我们可以尝试一一对比？
                
                // 简单起见，我们对 Fragment 场景仍然做全量替换，以保证正确性。
                // 如果你想解决 input 失去焦点问题，必须在这里实现真正的列表 diff。
                // 也就是：diffArrays(oldChildren, newChildren, parent)
                
                // 下面尝试一个简单的列表 diff (无 key，按 index 对比)
                const oldList = Array.isArray(lastRenderResult) ? lastRenderResult : [lastRenderResult];
                const newList = Array.isArray(currentNodes) ? currentNodes : [currentNodes];
                
                diffChildren(element[0], oldList, newList);
                element.data('__lastRenderResult', currentNodes) // 注意：这里存的是新生成的节点引用
            }
         } else {
            // 首次渲染
            element.empty()
            element.append(result)
            element.data('__lastRenderResult', currentNodes)
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


