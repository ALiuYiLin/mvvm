import {
  ref,
  compile,
  Option,
  defineComponent,
  ComponentDefinition,
} from "@actview/core";

// 响应式状态（用于演示页面）
const count = ref(0);

// 点击处理函数
function handleIncrement() {
  count.value++;
}

function handleReset() {
  count.value = 0;
}

// 编译配置（用于演示页面）
const options: Option[] = [
  {
    selector: "#counter-btn",
    listeners: [
      {
        type: "click",
        callback: handleIncrement,
      },
    ],
  },
  {
    selector: "#reset-btn",
    listeners: [
      {
        type: "click",
        callback: handleReset,
      },
    ],
  },
  {
    selector: "#click-count",
    text: () => `点击次数: ${count.value}`,
  },
];

// 仅在演示页面执行
if (document.querySelector("#counter-btn")) {
  options.forEach((option) => compile(option));
}

/**
 * MyButton 组件定义
 * 支持 before、default、after 三个插槽
 *
 * @example
 * <MyButton type="primary" size="lg">
 *   <template #before><svg>...</svg></template>
 *   按钮文字
 * </MyButton>
 *
 * @props
 * - type: primary | secondary | success | danger | warning | ghost | link
 * - size: sm | lg
 * - disabled: 禁用状态
 * - loading: 加载状态
 */


export const buttonCmp = (props: Record<string, string>) => {
    console.log('render: MyButton');
    const kls = ['btn', props.type ? `btn-${props.type}` : '', props.size ? `btn-${props.size}` : '', props.disabled !== undefined ? 'btn-disabled' : '', props.loading !== undefined ? 'btn-loading' : ''].filter(Boolean).join(' ');
    function handleClick() {
        console.log('props: ', props);
    }
    return (
      <div className={kls} onClick={handleClick} data-id={props['data-id']}>
        <slot name="before"></slot>
        aaaaa<slot></slot>
        <slot name="after"></slot>
      </div>
    );
}
export const MyButton: ComponentDefinition = defineComponent({
  name: "MyButton",
  render: (props) => {
    console.log('render: MyButton');
    const kls = ['btn', props.type ? `btn-${props.type}` : '', props.size ? `btn-${props.size}` : '', props.disabled !== undefined ? 'btn-disabled' : '', props.loading !== undefined ? 'btn-loading' : ''].filter(Boolean).join(' ');
    function handleClick() {
        console.log('props: ', props);
    }
    return (
      <div className={kls} onClick={handleClick} data-id={props['data-id']}>
        <slot name="before"></slot>
        aaaaa<slot></slot>
        <slot name="after"></slot>
      </div>
    );
  },
});
