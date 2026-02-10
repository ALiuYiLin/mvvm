
/**
 * 简单的 DOM Diff 算法
 * @param oldNode 旧节点
 * @param newNode 新节点
 * @returns 实际更新后的节点（如果是替换操作，返回新节点；如果是属性更新，返回旧节点）
 */
export function diff(oldNode: Node, newNode: Node): Node {
  // 1. 如果节点类型不同，直接替换
  if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
    oldNode.parentNode?.replaceChild(newNode, oldNode);
    return newNode;
  }

  // 2. 文本节点处理
  if (oldNode.nodeType === Node.TEXT_NODE) {
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
    return oldNode;
  }

  // 3. 元素节点处理
  if (oldNode instanceof HTMLElement && newNode instanceof HTMLElement) {
    // 3.1 更新属性
    updateAttributes(oldNode, newNode);

    // 3.2 更新子节点
    updateChildren(oldNode, newNode);
    
    return oldNode;
  }
  
  // DocumentFragment 处理（简单策略：直接把新内容插进去，不做精细 diff）
  if (oldNode instanceof DocumentFragment || newNode instanceof DocumentFragment) {
     // Fragment 比较特殊，插入后就消失了，这里无法复用 oldNode
     // 简单策略：如果父节点存在，用新 Fragment 替换旧位置的所有内容
     // 但由于 Fragment 插入后不可追踪，这里我们假设 compile.ts 里的用法场景：
     // 如果上次是 Fragment，这次也是 Fragment，我们很难直接 diff 它们（因为 Fragment 自身不留在 DOM 树上）
     // 所以对于 Fragment，建议在 compile 层直接全量替换，或者 diff 算法只处理 Element/Text
     return newNode;
  }

  return oldNode;
}

function updateAttributes(oldNode: HTMLElement, newNode: HTMLElement) {
  // 移除旧属性
  Array.from(oldNode.attributes).forEach(attr => {
    if (!newNode.hasAttribute(attr.name)) {
      oldNode.removeAttribute(attr.name);
    }
  });

  // 设置新属性
  Array.from(newNode.attributes).forEach(attr => {
    if (oldNode.getAttribute(attr.name) !== attr.value) {
      oldNode.setAttribute(attr.name, attr.value);
    }
  });
  
  // 特殊处理 value (input/textarea)
  // 只有当新节点显式设置了 value 属性（attribute）或者新节点的 value 属性（property）与默认空值不同时，才去同步 property
  // 这样可以避免“非受控组件”的用户输入被意外清空
  // 但对于受控组件（render 里 value={state}），如果 state 没变（render 出的 value 还是旧的），
  // 这里也会把用户输入重置回旧 state（符合 React 受控组件行为）。
  if ('value' in newNode && 'value' in oldNode) {
    const newValue = (newNode as any).value;
    const oldValue = (oldNode as any).value;
    
    // 只有当新值确实不同，且新节点似乎是有意设置了值时才更新
    // 简单的判断：如果新节点的 value 和它的 defaultValue (即 attribute) 一致，
    // 或者新节点有 value attribute，我们才认为它是受控的或者有明确初值的。
    // 如果新节点完全没设 value（attribute 是 null，property 是空串），可能是个“无辜”的非受控节点，
    // 这时如果旧节点有用户输入（oldValue != ""），我们尽量保留它。
    
    const hasValueAttr = newNode.hasAttribute('value');
    if (newValue !== oldValue) {
      // 如果新节点有显式的 value 属性，或者新节点的 value 属性不为空，强制同步
      if (hasValueAttr || newValue !== '') {
        (oldNode as any).value = newValue;
      }
    }
  }
}

function updateChildren(oldParent: HTMLElement, newParent: HTMLElement) {
  const oldChildren = Array.from(oldParent.childNodes);
  const newChildren = Array.from(newParent.childNodes);
  
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (!oldChild && newChild) {
      // 新增节点
      // 注意：这里需要 clone newChild，因为 appendChild 会移动节点
      // 但由于我们是在构建新的 vdom（这里其实是真实 dom），直接移过去也没问题，
      // 不过 diff 函数通常假设 newNode 是个模版。
      // 在当前框架下，newNode 是 render() 刚刚生成的新鲜 DOM，直接移动即可。
      oldParent.appendChild(newChild);
    } else if (oldChild && !newChild) {
      // 删除节点
      oldParent.removeChild(oldChild);
    } else if (oldChild && newChild) {
      // 递归 diff
      diff(oldChild, newChild);
    }
  }
}


export function diffChildren(parent: HTMLElement, oldList: (Node | undefined | null)[], newList: (Node | undefined | null)[]) {
  const maxLength = Math.max(oldList.length, newList.length);
  
  for (let i = 0; i < maxLength; i++) {
    const oldNode = oldList[i];
    const newNode = newList[i];

    if (!oldNode && newNode) {
      // 新增
      parent.appendChild(newNode);
    } else if (oldNode && !newNode) {
      // 删除
      parent.removeChild(oldNode);
    } else if (oldNode && newNode) {
      // 对比更新
      diff(oldNode as Node, newNode);
    }
  }
}