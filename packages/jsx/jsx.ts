// 自定义 JSX 工厂函数

export namespace JSX {
  export type Element = HTMLElement | Text | DocumentFragment;
  
  export interface IntrinsicElements {
    // HTML 元素
    div: HTMLAttributes;
    span: HTMLAttributes;
    p: HTMLAttributes;
    a: HTMLAttributes & { href?: string; target?: string };
    button: HTMLAttributes & { type?: string; disabled?: boolean };
    input: HTMLAttributes & { type?: string; value?: string; placeholder?: string; disabled?: boolean };
    img: HTMLAttributes & { src?: string; alt?: string };
    ul: HTMLAttributes;
    li: HTMLAttributes;
    h1: HTMLAttributes;
    h2: HTMLAttributes;
    h3: HTMLAttributes;
    h4: HTMLAttributes;
    h5: HTMLAttributes;
    h6: HTMLAttributes;
    form: HTMLAttributes;
    label: HTMLAttributes & { for?: string };
    textarea: HTMLAttributes & { value?: string; placeholder?: string };
    select: HTMLAttributes;
    option: HTMLAttributes & { value?: string };
    table: HTMLAttributes;
    tr: HTMLAttributes;
    td: HTMLAttributes;
    th: HTMLAttributes;
    thead: HTMLAttributes;
    tbody: HTMLAttributes;
    br: HTMLAttributes;
    hr: HTMLAttributes;
    [elemName: string]: HTMLAttributes;
  }

  export interface HTMLAttributes {
    id?: string;
    class?: string;
    className?: string;
    style?: string | Partial<CSSStyleDeclaration>;
    
    // 表单属性
    value?: string | number | readonly string[] | undefined;
    checked?: boolean;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    
    // 事件
    onClick?: (e: MouseEvent) => void;
    onChange?: (e: Event) => void;
    onInput?: (e: Event) => void;
    onSubmit?: (e: Event) => void;
    
    children?: any;
    [key: string]: any;
  }
}

type Child = HTMLElement | Text | string | number | boolean | null | undefined | Child[];

/**
 * 自定义 JSX 工厂函数
 * 将 JSX 转换为真实 DOM 元素
 */
export function createElement(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: Child[]
): HTMLElement | DocumentFragment {
  // 从 props 中提取 children（jsxDEV 模式会把 children 放在 props 里）
  const propsChildren = props?.children;
  const allChildren = children.length > 0 ? children : (propsChildren ? (Array.isArray(propsChildren) ? propsChildren : [propsChildren]) : []);
  
  // 如果 tag 是函数组件
  if (typeof tag === "function") {
    return tag({ ...props, children: allChildren });
  }

  // 创建 DOM 元素
  const element = document.createElement(tag);

  // 设置属性
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === "children") {
        continue; // children 单独处理
      } else if (key === "className" || key === "class") {
        element.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key.startsWith("on") && typeof value === "function") {
        // 事件绑定，如 onClick -> click
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }

  // 添加子元素
  appendChildren(element, allChildren);

  return element;
}

/**
 * jsxDEV 函数 - 开发模式下使用
 * 签名: jsxDEV(tag, props, key, isStaticChildren, source, self)
 */
export function jsxDEV(
  tag: string | Function,
  props: Record<string, any> | null,
  _key?: string,
  _isStaticChildren?: boolean,
  _source?: any,
  _self?: any
): HTMLElement | DocumentFragment {
  // 处理 Fragment
  if (tag === Fragment) {
    return Fragment(props || {});
  }
  return createElement(tag, props);
}

/**
 * Fragment 支持
 */
export function Fragment(props: { children?: Child | Child[] }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const children = props?.children;
  if (children) {
    const childArray = Array.isArray(children) ? children : [children];
    appendChildren(fragment, childArray);
  }
  return fragment;
}

/**
 * 递归添加子元素
 */
function appendChildren(parent: HTMLElement | DocumentFragment, children: Child[]) {
  for (const child of children) {
    if (child == null || typeof child === "boolean") {
      continue;
    } else if (Array.isArray(child)) {
      // 处理嵌套数组（如 map 返回的数组）
      appendChildren(parent, child);
    } else if (typeof child === "string" || typeof child === "number") {
      parent.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      parent.appendChild(child);
    }
  }
}

// 导出 jsx 和 jsxs（用于 react-jsx 转换模式）
export const jsx = createElement;
export const jsxs = createElement;
