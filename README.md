# MVVM（学习版）——自实现响应式 + 编译绑定 + JSX 渲染

这是一个用 TypeScript 从零实现的迷你 MVVM：包含 `ref / reactive` 响应式、`computed` 计算属性、`watch / watchEffect` 侦听，以及基于配置的 `compile` 视图绑定，并支持用自定义 JSX 工厂函数生成 DOM。

> 目标：用尽量少的代码串起「数据变更 -> 依赖通知 -> 视图更新」的完整链路，便于理解 Vue/React 等框架背后的核心机制。

## 特性一览

- 响应式
  - `ref`：用于基础类型/单值响应式
  - `reactive`：用于对象/数组响应式（深层访问会递归代理）
- 视图绑定（配置驱动）
  - `text / show / render / listeners` 组合实现数据到视图更新、事件回写数据
  - `selector` 支持匹配多个元素（会同时更新）
- 计算属性
  - `computed(fn)` 返回 `Ref<T>`，通过 `.value` 读取，参与依赖追踪
- 侦听器
  - `watch(ref | reactiveObject | getter, cb)` 支持三种监听源
  - `watchEffect(effect)` 自动收集依赖并在依赖变更时重跑
- JSX
  - `tsx` 中直接写 JSX，编译为真实 DOM（无虚拟 DOM）

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

### 1) ref：基础类型响应式

```ts
import { ref } from "./core/ref";

const count = ref(0);
count.value++;
```

### 2) reactive：对象/数组响应式

```ts
import { reactive } from "./core/reactive";

const student = reactive({ name: "张三", age: 20 });
student.age++;

const list = reactive([{ name: "A", age: 1 }]);
list.push({ name: "B", age: 2 });
```

### 3) computed：计算属性

`computed` 返回的是 `Ref<T>`（而不是死值），因此读取时用 `.value`：

```ts
import { computed } from "./core/computed";
import { reactive } from "./core/reactive";

const student = reactive({ name: "张三", age: 20 });

const nameAndAge = computed(() => {
  return `姓名：${student.name} 年龄：${student.age}`;
});

console.log(nameAndAge.value);
```

### 4) watch：侦听数据变化

支持三种监听源：

- 监听 `ref`

```ts
import { watch } from "./core/watch";
import { ref } from "./core/ref";

const count = ref(0);
watch(count, (newValue, oldValue) => {
  console.log("count:", oldValue, "->", newValue);
});
```

- 监听 `reactive` 对象（对象任意属性变更都会触发）

```ts
import { watch } from "./core/watch";
import { reactive } from "./core/reactive";

const student = reactive({ name: "张三", age: 20 });
watch(student, () => {
  console.log("student changed");
});
```

- 监听 getter（推荐：精确到某个属性/表达式）

```ts
import { watch } from "./core/watch";
import { reactive } from "./core/reactive";

const student = reactive({ name: "张三", age: 20 });
watch(() => student.age, (newValue, oldValue) => {
  console.log("student.age:", oldValue, "->", newValue);
});
```

### 5) watchEffect：自动收集依赖

```ts
import { watchEffect } from "./core/watchEffect";
import { reactive } from "./core/reactive";

const student = reactive({ name: "张三", age: 20 });
watchEffect(() => {
  console.log("age is", student.age);
});
```

## 视图绑定：compile + Option 配置

视图绑定通过 `compile(option)` 完成，`option` 类型定义见：[types/index.ts](file:///e:/code2/mvvm.worktrees/dev/src/types/index.ts#L11-L17)

```ts
export type Option = {
  selector: string
  show?: boolean | (() => boolean)
  text?: string | (() => string)
  listeners?: Listener[]
  render?: () => string | HTMLElement | Text | DocumentFragment
}
```

### 字段说明

- `selector`
  - CSS 选择器；内部使用 jQuery 选择元素
  - 匹配多个元素时，会对每个元素同时生效
- `text`
  - 字符串或返回字符串的函数
  - 当函数读取到响应式数据（`ref.value` / `reactive.xxx`）时，会自动建立依赖并在变更时触发视图更新
- `show`
  - 布尔值或返回布尔值的函数
  - `true` 显示，`false` 隐藏；`undefined` 视为显示
- `listeners`
  - 事件监听列表，内部用 `element.on(type, callback)` 绑定
  - 用于把用户输入/交互“反写”到数据，从而实现「数据 <-> 视图」的闭环
- `render`
  - 返回字符串或 DOM 节点（`HTMLElement | Text | DocumentFragment`）
  - 每次更新会 `empty()` 然后重新插入渲染结果（简单直观，但不会做 diff）

### 使用示例（text + listeners）

```ts
import { compile } from "./core/compile";
import { ref } from "./core/ref";
import type { Option } from "./types";

const count = ref(0);

const options: Option[] = [
  { selector: "#count", text: () => `count: ${count.value}` },
  {
    selector: "#btn",
    text: () => `点击计数: ${count.value}`,
    listeners: [{ type: "click", callback: () => (count.value += 1) }],
  },
];

options.forEach(compile);
```

对应 HTML：

```html
<div id="count"></div>
<button id="btn"></button>
```

### 使用示例（render + JSX）

项目内置了 JSX 工厂函数，允许在 `tsx` 里直接返回 DOM。

```tsx
import { compile } from "./core/compile";
import { reactive } from "./core/reactive";
import type { Option } from "./types";

const studentList = reactive([
  { name: "张三", age: 20 },
  { name: "张四", age: 21 },
]);

const options: Option[] = [
  {
    selector: "#list",
    render: () => (
      <ul>
        {studentList.map((item) => (
          <li>{`姓名：${item.name} 年龄：${item.age}`}</li>
        ))}
      </ul>
    ),
  },
];

options.forEach(compile);
```

对应 HTML：

```html
<div id="list"></div>
```

## JSX 配置说明（为什么能直接写 TSX）

本项目采用 TypeScript 的 `react-jsx` 转换模式，但 `jsxImportSource` 指向自定义运行时 `@mvvm`：

- 配置见：[tsconfig.json](file:///e:/code2/mvvm.worktrees/dev/tsconfig.json#L10-L17)
- Vite alias 见：[vite.config.ts](file:///e:/code2/mvvm.worktrees/dev/vite.config.ts#L12-L17)
- JSX runtime 实现见：[jsx-runtime.ts](file:///e:/code2/mvvm.worktrees/dev/src/core/jsx/jsx-runtime.ts) 与 [jsx.ts](file:///e:/code2/mvvm.worktrees/dev/src/core/jsx/jsx.ts)

## 实现思路（简述）

- `ref`：用 `Proxy` 拦截 `value` 的 get/set，在 get 时收集依赖（订阅当前更新函数），在 set 时发布通知。
- `reactive`：用 `Proxy` 拦截对象属性的 get/set，属性访问时收集依赖，属性变更时发布通知；数组额外拦截变更方法。
- `compile`：把一次 DOM 更新封装成 `updateFn`，在执行 `text/show/render` 的 getter 期间设置为“当前更新函数”，从而完成依赖收集。
- `watchEffect`：本质就是“把 effect 当作当前更新函数跑一遍”，依赖变化后自动重跑。

## 已知限制

- `render` 更新策略是“清空并重新插入”，不做 diff，复杂 UI 会有性能/状态丢失问题（例如输入框光标）。
- `watch(reactiveObject, cb)` 是“对象级触发”，更推荐 `watch(() => obj.xxx, cb)` 做属性级监听。
- 这是学习版实现，目标是易读易懂，并非完整对标 Vue。

