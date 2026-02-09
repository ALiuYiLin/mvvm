# Design

vue 
- v-if
- v-show
- v-model
- v-for

react


组件声明，插槽暴露
```tsx
export const MyButton: ComponentDefinition = defineComponent({
  name: "MyButton",
  render: (props) => {
    const kls = ['btn', props.type ? `btn-${props.type}` : '', props.size ? `btn-${props.size}` : '', props.disabled !== undefined ? 'btn-disabled' : '', props.loading !== undefined ? 'btn-loading' : ''].filter(Boolean).join(' ');
    return (
      <div className={kls}>
        <slot name="before"></slot>
        <slot></slot>
        <slot name="after"></slot>
      </div>
    );
  },
});
```
在html中使用
```html
<MyButton type="primary">
    <template #before>
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
        </svg>
    </template>
    添加
</MyButton>
```
组件注册后，将Mybutton 标签解析，并转化为以下DOM结构
```html
<div class="btn btn-primary">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
    添加
</div>
```

组件注册
```tsx

// 导入并注册组件,需要再compile之间执行
import { MyButton, buttonCmp } from './components/button';

registerComponents([MyButton]);

// 解析页面中的自定义组件（在 DOM 解析完成后执行）
resolveComponents();
```
