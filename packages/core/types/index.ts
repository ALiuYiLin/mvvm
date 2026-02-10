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
  props: Record<string, string>;
  slots: Map<string, Node[]>;
  render: (
    props: Record<string, any>,
    slots: Map<string, Node[]>
  ) => string | HTMLElement | Text | DocumentFragment | SVGElement;
};

export type Option = {
  selector: string;
  show?: boolean | (() => boolean);
  text?: string | (() => string);
  value?: () => string;
  listeners?: Listener[];
  render?: () => string | HTMLElement | Text | DocumentFragment | SVGElement;
  setup?: (el: HTMLElement) => void;
  children?: Option[];
};

export type { RenderFn } from "../component";
