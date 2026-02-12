/**
 * 组件系统 - 支持自定义标签和插槽
 */

import { ParsedOption, RenderFn } from "../types";

/** render 函数类型 */

// 组件注册表：组件名（小写） -> render 函数
const componentRegistry = new Map<string, RenderFn>();

/**
 * 注册单个组件（用函数名作为组件标签名）
 */
export function registerComponent(render: RenderFn): void {
    const name = render.name;
    if (!name) {
        console.error('registerComponent: render function must be a named function');
        return;
    }
    componentRegistry.set(name.toLowerCase(), render);
}

/**
 * 获取已注册的组件
 */
export function getComponent(name: string): RenderFn | undefined {
    return componentRegistry.get(name.toLowerCase());
}

/**
 * 解析插槽内容
 * 仅支持 <template slot="slotName">...</template> 语法
 * @param customElement 自定义元素 <MyButton>...</MyButton>
 * @returns 插槽名到内容的映射
 */
function parseSlots(customElement: Element): Map<string, Node[]> {
    const slots = new Map<string, Node[]>();
    const defaultSlotContent: Node[] = [];

    Array.from(customElement.childNodes).forEach(child => {
        if (child instanceof HTMLTemplateElement && child.hasAttribute('slot')) {
            const slotName = child.getAttribute('slot') || 'default';
            const content = Array.from(child.content.childNodes)
                .map(n => n.cloneNode(true))
                .filter(n => !(n.nodeType === Node.TEXT_NODE && !n.textContent?.trim()));
            if (content.length > 0) {
                const existing = slots.get(slotName) || [];
                existing.push(...content);
                slots.set(slotName, existing);
            }
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            defaultSlotContent.push(document.createTextNode(child.textContent.trim()));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            defaultSlotContent.push(child.cloneNode(true));
        }
    });

    if (defaultSlotContent.length > 0) {
        const existing = slots.get('default') || [];
        slots.set('default', [...existing, ...defaultSlotContent]);
    }

    return slots;
}

/**
 * 将插槽合并到 props 中
 * - default 插槽 -> props.children
 * - 其他具名插槽 -> props.<slotName>
 */
function mergeSlots(props: Record<string, any>, slots: Map<string, Node[]>): Record<string, any> {
    slots.forEach((nodes, name) => {
        if (name === 'default') {
            props.children = nodes;
        } else {
            props[name] = nodes;
        }
    });
    return props;
}

/**
 * 获取元素的所有属性作为 props
 */
function getProps(element: Element): Record<string, string> {
    const props: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
        props[attr.name] = attr.value;
    });
    return props;
}



/**
 * 解析并替换页面中的自定义组件
 * @param root 根元素，默认为 document.body
 */
export function resolveComponents(root: Element = document.body) {
    const options: ParsedOption[] = []

    // 判断 root 本身是否为自定义组件
    const rootRender = componentRegistry.get(root.tagName.toLowerCase());
    if (rootRender) {
        const props = mergeSlots(getProps(root), parseSlots(root));
        options.push({
            el: root,
            props,
            render: rootRender
        });
    }

    // 遍历所有已注册的组件
    componentRegistry.forEach((render, name) => {
        // 查找所有该组件的实例（浏览器会将标签名转为小写）
        const customElements = root.querySelectorAll(name.toLowerCase());
        
        customElements.forEach(customElement => {
            const props = mergeSlots(getProps(customElement), parseSlots(customElement));
            options.push({
                el: customElement,
                props,
                render
            })
        });
    });
    return options
}

/**
 * 批量注册组件
 */
export function registerComponents(renders: RenderFn[]): void {
    renders.forEach(render => registerComponent(render));
}
