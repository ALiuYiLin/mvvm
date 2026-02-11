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
 * @param customElement 自定义元素 <MyButton>...</MyButton>
 * @returns 插槽名到内容的映射
 */
function parseSlots(customElement: Element): Map<string, Node[]> {
    const slots = new Map<string, Node[]>();
    const defaultSlotContent: Node[] = [];

    Array.from(customElement.childNodes).forEach(child => {
        if (child instanceof HTMLTemplateElement) {
            // 获取插槽名：支持 #before, #default, slot="name" 等语法
            const slotName = getSlotNameFromTemplate(child);
            
            if (slotName) {
                // 获取 template 内的实际内容
                const content = Array.from(child.content.childNodes)
                    .map(n => n.cloneNode(true))
                    .filter(n => !(n.nodeType === Node.TEXT_NODE && !n.textContent?.trim()));
                if (content.length > 0) {
                    slots.set(slotName, content);
                }
            } else {
                // 没有指定插槽名，归入默认插槽
                const content = Array.from(child.content.childNodes)
                    .map(n => n.cloneNode(true))
                    .filter(n => !(n.nodeType === Node.TEXT_NODE && !n.textContent?.trim()));
                defaultSlotContent.push(...content);
            }
        } else if (child instanceof Element && child.hasAttribute('slot')) {
            // <div slot="slotName">
            const slotName = child.getAttribute('slot') || 'default';
            const existing = slots.get(slotName) || [];
            existing.push(child.cloneNode(true));
            slots.set(slotName, existing);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            // 文本节点归入默认插槽
            defaultSlotContent.push(document.createTextNode(child.textContent.trim()));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            // 普通元素归入默认插槽
            defaultSlotContent.push(child.cloneNode(true));
        }
    });

    // 设置默认插槽
    if (defaultSlotContent.length > 0) {
        const existing = slots.get('default') || [];
        slots.set('default', [...existing, ...defaultSlotContent]);
    }

    return slots;
}

/**
 * 从 template 元素获取插槽名
 * 支持: #before, #default, slot="name" 等语法
 * 浏览器会将 #before 解析为 #before="" 属性
 */
function getSlotNameFromTemplate(template: HTMLTemplateElement): string | null {
    // 优先检查 slot 属性
    if (template.hasAttribute('slot')) {
        return template.getAttribute('slot') || 'default';
    }
    
    // 检查 #xxx 语法（浏览器会解析为属性名）
    for (const attr of Array.from(template.attributes)) {
        if (attr.name.startsWith('#')) {
            return attr.name.slice(1); // 去掉 # 前缀
        }
    }
    
    return null;
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
        const slots = parseSlots(root);
        const props = getProps(root);
        options.push({
            el: root,
            props,
            slots,
            render: rootRender
        });
    }

    // 遍历所有已注册的组件
    componentRegistry.forEach((render, name) => {
        // 查找所有该组件的实例（浏览器会将标签名转为小写）
        const customElements = root.querySelectorAll(name.toLowerCase());
        
        customElements.forEach(customElement => {
            // 解析插槽
            const slots = parseSlots(customElement);

            // 获取 props
            const props = getProps(customElement);
            options.push({
                el: customElement,
                props,
                slots,
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
