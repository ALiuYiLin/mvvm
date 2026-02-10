# Core Module Design

## Directory Structure

```
packages/core/
├── reactivity/           # 响应式系统核心 (Reactivity System)
│   ├── ref.ts            # 基础响应式引用 (Primitive value wrapper)
│   ├── reactive.ts       # 对象/数组响应式代理 (Proxy-based reactivity)
│   ├── computed.ts       # 计算属性 (Derived state)
│   ├── watch.ts          # 侦听器 (Source watcher)
│   ├── watchEffect.ts    # 立即执行的副作用侦听
│   ├── state.ts          # 依赖收集全局状态管理 (Dependency tracking state)
│   ├── event.ts          # 依赖更新事件总线 (Internal event bus)
│   └── index.ts          # 模块导出
├── runtime/              # 运行时与视图编译 (Runtime & View Compiler)
│   ├── app.ts            # 应用实例入口 (App instance & plugin system)
│   ├── compile.ts        # 模板编译与数据绑定 (Template compiler)
│   ├── component.ts      # 组件注册与解析系统 (Component registry)
│   ├── diff.ts           # DOM Diff 算法 (DOM reconciliation)
│   └── index.ts          # 模块导出
├── jsx/                  # JSX 运行时支持 (JSX Runtime)
│   ├── jsx.ts            # JSX 工厂函数 & 类型定义
│   └── jsx-runtime.ts    # JSX 自动运行时导出 (jsxImportSource support)
├── types/                # TypeScript 类型定义 (Type Definitions)
│   └── index.ts          # 全局类型声明
└── index.ts              # Core 模块主入口 (Main entry point)
```
