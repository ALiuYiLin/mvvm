import { getAppInstance, App } from "../runtime/app";
import { Option } from "../types";

/**
 * 获取 App 单例，未创建时抛出错误
 */
export function useApp(): App {
  const instance = getAppInstance();
  if (!instance) {
    throw new Error("App instance not created yet. Call `new App()` first.");
  }
  return instance;
}

export function useResolveOptions(options: Option[]) {
  queueMicrotask(() => {
    const app = useApp();
    app.resolveOptions(options);
  })
}
