/**
 * App 类 - 应用入口，统一管理组件注册、自定义组件解析和选项编译
 */

import { RenderFn, registerComponent, resolveComponents } from "./component";
import { compile, compileCustom } from "./compile";
import { Option } from "./types";

export class App {
  /**
   * 注册组件（render 函数，函数名即组件标签名）
   */
  use(render: RenderFn): this {
    registerComponent(render);
    return this;
  }

  /**
   * 解析并编译 HTML 中的自定义组件标签
   */
  resolveCustomComponents(root: Element = document.body): this {
    const options = resolveComponents(root);
    options.forEach((item) => {
      compileCustom(item);
    });
    return this;
  }

  /**
   * 编译选项配置（挂载事件、代理 DOM 样式/属性等）
   */
  resolveOptions(options: Option[]): this {
    options.forEach((option) => {
      compile(option);
    });
    return this;
  }
}
