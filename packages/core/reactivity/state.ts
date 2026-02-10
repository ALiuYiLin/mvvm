export let currentUpdateFn: (() => void) | null = null;

export function setCurrentUpdateFn(fn: (() => void) | null) {
  currentUpdateFn = fn;
}

export function getCurrentUpdateFn() {
  return currentUpdateFn;
}
