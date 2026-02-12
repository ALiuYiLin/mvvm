export type Ref<T> = {
  value: T;
  __isRef: true;
};

export type Listener<
  K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap
> = {
  type: K;
  callback: (e: HTMLElementEventMap[K]) => void;
};

export type ParsedOption = {
  el: Element;
  props: Record<string, any>;
  render: (
    props: Record<string, any>,
  ) => string | HTMLElement | Text | DocumentFragment | SVGElement;
};

export type Option = {
  selector: string;
  ref?: Ref<Element | null>;
  show?: boolean | (() => boolean);
  text?: string | (() => string);
  value?: () => string;
  listeners?: Listener[];
  render?: () => string | HTMLElement | Text | DocumentFragment | SVGElement;
  setup?: (el: HTMLElement) => void;
  children?: Option[];
};

export type RenderFn = (props: Record<string, any>) => HTMLElement | DocumentFragment | Text | string | SVGElement;
