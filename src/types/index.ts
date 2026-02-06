export type Ref<T> = {
    value: T,
    __isRef: true
}

export type Listener<K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap> = {
    type: K,
    callback: (e: HTMLElementEventMap[K]) => void
}

export type Option = {
    selector: string,
    show?: boolean | (() => boolean)
    text?: string | (() => string)
    listeners?: Listener[]
}