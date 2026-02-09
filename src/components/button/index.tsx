import {
  defineComponent,
  ComponentDefinition,
} from "@actview/core";
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

export type MyButtonProps = {
  type?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
};

export const buttonRender = (props: MyButtonProps) => {
    const kls = ['btn', props.type ? `btn-${props.type}` : '', props.size ? `btn-${props.size}` : '', props.disabled !== undefined ? 'btn-disabled' : '', props.loading !== undefined ? 'btn-loading' : ''].filter(Boolean).join(' ');
    return (
      <div className={kls}>
        <slot name="before"></slot>
        <slot></slot>
        <slot name="after"></slot>
      </div>
    );
}

export const MyButton: ComponentDefinition = defineComponent({
  name: "MyButton",
  render: buttonRender
});
