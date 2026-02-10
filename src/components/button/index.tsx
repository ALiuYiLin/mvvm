import {
  defineComponent,
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
  text?: string;
  onClick?: () => void;
  'data-id'?: string
};

export const buttonRender = (props: MyButtonProps, slots?: Map<string, Node[]>) => {
    const kls = ['btn', props.type ? `btn-${props.type}` : '', props.size ? `btn-${props.size}` : '', props.disabled !== undefined ? 'btn-disabled' : '', props.loading !== undefined ? 'btn-loading' : ''].filter(Boolean).join(' ');
    return (
      <div className={kls} data-id={props['data-id']} onClick={props.onClick}>
        {slots?.get('before')}
        {slots?.get('default')}
        {props.text}
        {slots?.get('after')}
      </div>
    );
}

export const MyButton = defineComponent({
  name: "MyButton",
  render: buttonRender
});
