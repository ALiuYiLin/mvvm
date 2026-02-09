/**
 * 组件系统 - 支持自定义标签和插槽
 */

export interface ComponentDefinition {
    /** 组件名称（自定义标签名，如 MyButton） */
    name: string;
    /** 组件模板 - HTML 字符串或选择器 */
    template?: string;
    /** render 函数 - 接收 props，返回 DOM 元素（支持 JSX） */
    render?: (props: Record<string, string>) => HTMLElement | DocumentFragment | Text | string;
    /** 组件样式（可选） */
    style?: string;
    /** 组件初始化回调 */
    setup?: (el: HTMLElement, props: Record<string, string>) => void;
}

// 组件注册表
const componentRegistry = new Map<string, ComponentDefinition>();

/**
 * 注册组件
 */
export function defineComponent(definition: ComponentDefinition): ComponentDefinition {
    // 统一转为小写存储（因为浏览器会将自定义标签名转为小写）
    componentRegistry.set(definition.name.toLowerCase(), definition);
    return definition;
}

/**
 * 获取已注册的组件
 */
export function getComponent(name: string): ComponentDefinition | undefined {
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
 * 创建组件实例
 * @param definition 组件定义
 * @param slots 插槽内容
 * @param props 组件属性
 */
function createComponentInstance(
    definition: ComponentDefinition,
    slots: Map<string, Node[]>,
    props: Record<string, string>
): HTMLElement {
    let templateElement: HTMLElement;

    if (definition.render) {
        // render 函数模式：传入 props，返回带 <slot> 的 DOM
        const result = definition.render(props);
        if (typeof result === 'string') {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = result.trim();
            templateElement = wrapper.firstElementChild as HTMLElement || wrapper;
        } else if (result instanceof DocumentFragment) {
            // Fragment 需要包一层
            const wrapper = document.createElement('div');
            wrapper.appendChild(result);
            templateElement = wrapper;
        } else if (result instanceof HTMLElement) {
            templateElement = result;
        } else {
            const wrapper = document.createElement('span');
            wrapper.appendChild(result);
            templateElement = wrapper;
        }
    } else if (definition.template) {
        if (definition.template.startsWith('#')) {
            // 选择器模式
            const templateSource = document.querySelector(definition.template);
            if (!templateSource) {
                console.error(`Component template not found: ${definition.template}`);
                return document.createElement('div');
            }
            templateElement = templateSource.cloneNode(true) as HTMLElement;
            templateElement.removeAttribute('id');
        } else {
            // HTML 字符串模式
            const wrapper = document.createElement('div');
            wrapper.innerHTML = definition.template.trim();
            templateElement = wrapper.firstElementChild as HTMLElement || wrapper;
        }
    } else {
        console.error(`Component "${definition.name}" has no template or render function.`);
        return document.createElement('div');
    }

    // 填充插槽（替换模板中的 <slot> 元素）
    fillSlots(templateElement, slots);

    // 调用 setup（如果有）
    if (definition.setup) {
        definition.setup(templateElement, props);
    }

    // 应用通用 props 到元素属性（class, style 等）
    applyProps(templateElement, props);

    return templateElement;
}

/**
 * 填充插槽
 */
function fillSlots(element: HTMLElement, slots: Map<string, Node[]>): void {
    // 查找所有 <slot> 元素
    const slotElements = element.querySelectorAll('slot');
    
    slotElements.forEach(slotEl => {
        const slotName = slotEl.getAttribute('name') || 'default';
        const slotContent = slots.get(slotName);

        if (slotContent && slotContent.length > 0) {
            // 有内容，替换 slot
            const fragment = document.createDocumentFragment();
            slotContent.forEach(node => fragment.appendChild(node.cloneNode(true)));
            slotEl.replaceWith(fragment);
        } else {
            // 无内容，使用 slot 的默认内容或移除
            const defaultContent = slotEl.innerHTML.trim();
            if (defaultContent) {
                // 保留默认内容
                const span = document.createElement('span');
                span.innerHTML = defaultContent;
                slotEl.replaceWith(...Array.from(span.childNodes));
            } else {
                // 移除空 slot
                slotEl.remove();
            }
        }
    });
}

/**
 * 应用 props 到元素
 */
function applyProps(element: HTMLElement, props: Record<string, string>): void {
    // 处理 class 合并
    if (props.class) {
        element.classList.add(...props.class.split(' ').filter(Boolean));
    }

    // 处理 style 合并
    if (props.style) {
        element.setAttribute('style', (element.getAttribute('style') || '') + ';' + props.style);
    }

    // 不要将组件特有的 props 传递到 DOM（如 type, size 等由 setup 处理）
}

/**
 * 解析并替换页面中的自定义组件
 * @param root 根元素，默认为 document.body
 */
export function resolveComponents(root: Element = document.body): void {
    // 遍历所有已注册的组件
    componentRegistry.forEach((definition, name) => {
        // 查找所有该组件的实例（浏览器会将标签名转为小写）
        const customElements = root.querySelectorAll(name.toLowerCase());
        
        customElements.forEach(customElement => {
            // 解析插槽
            const slots = parseSlots(customElement);
            // 获取 props
            const props = getProps(customElement);
            // 创建组件实例
            const instance = createComponentInstance(definition, slots, props);
            // 替换原元素
            customElement.replaceWith(instance);
        });
    });
}

/**
 * 批量注册组件并解析
 */
export function registerComponents(definitions: ComponentDefinition[]): void {
    definitions.forEach(def => defineComponent(def));
}
