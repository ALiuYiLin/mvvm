/**
 * App 类 - 应用入口，统一管理组件注册、自定义组件解析和选项编译
 */

import { registerComponent, resolveComponents } from "./component";
import { compile, compileCustom } from "./compile";
import { RenderFn, Option } from "../types";

let appInstance: App | null = null;

export class App {
  private _customResolved = false;

  constructor() {
    if (appInstance) {
      return appInstance;
    }
    appInstance = this;
  }

  /**
   * 注册组件（render 函数，函数名即组件标签名）
   */
  use(render: RenderFn): this {
    registerComponent(render);
    return this;
  }

  /**
   * 解析并编译 HTML 中的自定义组件标签（内部自动调用）
   */
  private resolveCustomComponents(root: Element = document.body): void {
    const options = resolveComponents(root);
    options.forEach((item) => {
      compileCustom(item);
    });
    this._customResolved = true;
  }

  /**
   * 编译选项配置（挂载事件、代理 DOM 样式/属性等）
   * 首次调用前会自动解析自定义组件
   */
  resolveOptions(options: Option[]): this {
    if (!this._customResolved) {
      this.resolveCustomComponents();
    }
    options.forEach((option) => {
      compile(option);
    });
    return this;
  }
}

/**
 * 获取 App 单例，未创建时抛出错误
 */
export function useApp(): App {
  if (!appInstance) {
    throw new Error("App instance not created yet. Call `new App()` first.");
  }
  return appInstance;
}


export function useResolveOptions(options: Option[]){
  queueMicrotask(() => {
    const app = useApp();
    app.resolveOptions(options);
  })
}
