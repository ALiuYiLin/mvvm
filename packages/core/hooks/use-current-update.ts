export function useCurrentUpdateFn() {
  let currentUpdateFn: (() => void) | null = null;
  const getCurrentUpdateFn = () => currentUpdateFn;
  const setCurrentUpdateFn = (fn: (() => void) | null) => { currentUpdateFn = fn; };
  return { getCurrentUpdateFn, setCurrentUpdateFn };
}
