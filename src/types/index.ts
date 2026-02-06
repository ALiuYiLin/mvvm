export type Option = {
  selector: string;
  text?: string | (() => string | number | boolean);
  show?: boolean | (() => boolean);
  render?: () => string | HTMLElement | Text | DocumentFragment;
  listeners?: {
    type: string;
    handler: (e: Event) => void;
  }[];
};

export type Ref<T> = {
  value: T;
  __isRef: true; // 标识符，用于识别 Ref 对象
};
