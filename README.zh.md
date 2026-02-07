# ActView (MVVM 学习版)

[English](./README.md) | 简体中文

**ActView** 是为**活动/营销单页**而生的轻量级 MVVM 库。

> 目标场景：单页应用、状态复杂、逻辑复杂，且有强分工协作需求。

## 为什么叫 ActView？

在活动页（Campaign/H5）开发中，常有明确分工：
- **A 同学**：只写 HTML / CSS（切图仔）
- **B 同学**：只管数据、逻辑、响应式（逻辑仔）

**ActView** 的核心能力就是把这两者“接”起来：
**选择器 + 配置 → 自动绑定数据**

目标：**低心智负担、快、稳、好交接**。

## 核心特性

- **配置驱动绑定**：不侵入 HTML，只需提供 `selector` + 配置项。
- **自动响应式**：`ref` / `reactive` 数据变更自动更新视图。
- **双向绑定闭环**：通过 `listeners` 快速回写数据。
- **计算属性/侦听器**：`computed` / `watch` 处理复杂逻辑。
- **JSX / 函数渲染**：支持在配置中直接返回 JSX（`render` 函数），处理复杂列表/组件。
- **事件快速挂载**：配置里直接写事件回调。

## 快速开始

```bash
npm i
npm run dev
```

构建产物输出到 `out/`：

```bash
npm run build
```

## 核心用法

### 1) 数据定义 (Ref / Reactive)

```ts
import { ref, reactive } from "./core";

// 基础类型
const count = ref(0);

// 对象/数组
const student = reactive({ name: "张三", age: 20 });
const list = reactive([{ id: 1, name: "A" }]);
```

### 2) 视图绑定 (Compile + Option)

视图绑定通过 `compile(option)` 完成。A 同学写好 HTML (id="count")，B 同学写配置：

```ts
import { compile } from "./core/compile";

compile({
  selector: "#count",
  // 绑定文本：自动响应 count.value 变化
  text: () => `当前计数: ${count.value}`,
  // 绑定显隐
  show: () => count.value > 0,
  // 绑定事件
  listeners: [
    { type: "click", callback: () => count.value++ }
  ]
});
```

### 3) 复杂渲染 (Render + JSX)

对于列表或复杂结构，直接用 JSX：

```tsx
compile({
  selector: "#list",
  render: () => (
    <ul>
      {list.map(item => <li>{item.name}</li>)}
    </ul>
  )
});
```

### 4) 逻辑复用 (Computed / Watch)

```ts
import { computed, watch } from "./core";

// 计算属性
const info = computed(() => `${student.name} (${student.age}岁)`);

// 侦听器
watch(() => student.age, (newVal, oldVal) => {
  console.log("年龄变了:", oldVal, "->", newVal);
});
```

## 目录结构与原理

- `src/core`：核心实现
  - `ref.ts` / `reactive.ts`：基于 Proxy 的响应式系统
  - `compile.ts`：基于 jQuery 选择器的视图绑定器
  - `computed.ts` / `watch.ts`：依赖收集与副作用处理
  - `jsx/`：自定义 JSX 运行时（无虚拟 DOM，直接返回真实 DOM）
- `src/types`：类型定义

## 已知限制

- `render` 策略是“清空并重新插入”，无 Diff 算法，适合活动页展示型 UI。
- 仅供学习与小型活动页使用。

