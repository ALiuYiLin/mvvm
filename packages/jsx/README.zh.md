# @actview/jsx

Actview 的自定义 JSX 运行时，将 JSX 直接渲染为真实 DOM 元素。

## 安装

```bash
npm install @actview/jsx
# 或
pnpm add @actview/jsx
```

## 配置

### TypeScript 配置

在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@actview/jsx"
  }
}
```

### Vite 配置（可选）

如果使用 Vite，它会自动使用 TypeScript 的 JSX 设置。

## 使用方法

### 基本元素

```tsx
const element = <div class="container">Hello World</div>
document.body.appendChild(element)
```

### 事件处理

```tsx
const button = (
  <button onClick={(e) => console.log('clicked!', e)}>
    点击我
  </button>
)
```

### 样式设置

```tsx
// 字符串样式
<div style="color: red; font-size: 16px;">红色文字</div>

// 对象样式
<div style={{ color: 'blue', fontSize: '16px' }}>蓝色文字</div>
```

### 函数组件

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>你好, {name}!</h1>
}

const element = <Greeting name="世界" />
```

### Fragment

```tsx
import { Fragment } from '@actview/jsx'

function List() {
  return (
    <>
      <li>项目 1</li>
      <li>项目 2</li>
      <li>项目 3</li>
    </>
  )
}
```

### 条件渲染

```tsx
const isLoggedIn = true

const element = (
  <div>
    {isLoggedIn ? <span>欢迎！</span> : <span>请登录</span>}
  </div>
)
```

### 列表渲染

```tsx
const items = ['苹果', '香蕉', '樱桃']

const list = (
  <ul>
    {items.map(item => <li>{item}</li>)}
  </ul>
)
```

### 配合 @actview/core 使用

```tsx
import { ref, compile } from '@actview/core'

const count = ref(0)

compile({
  selector: '#app',
  render: () => (
    <div>
      <p>计数: {count.value}</p>
      <button onClick={() => count.value++}>增加</button>
    </div>
  )
})
```

## API

### `createElement(tag, props, ...children)`

JSX 工厂函数，创建真实 DOM 元素。

```typescript
function createElement(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: Child[]
): HTMLElement | DocumentFragment
```

### `Fragment`

允许返回多个元素而无需包装器。

```typescript
function Fragment(props: { children?: Child | Child[] }): DocumentFragment
```

### 导出项

| 导出 | 说明 |
|------|------|
| `createElement` | JSX 工厂函数 |
| `jsx` | `createElement` 的别名 |
| `jsxs` | `createElement` 的别名（静态子元素） |
| `jsxDEV` | 开发模式 JSX 函数 |
| `Fragment` | Fragment 组件 |

## 支持的 HTML 属性

### 通用属性

- `id`、`class`、`className`
- `style`（字符串或对象）
- 任何标准 HTML 属性

### 事件处理器

- `onClick`、`onChange`、`onInput`、`onSubmit`
- 任何 `on*` 属性都会转换为事件监听器

### 表单属性

- `value`、`checked`、`placeholder`、`disabled`、`type`

## 类型定义

```typescript
namespace JSX {
  type Element = HTMLElement | Text | DocumentFragment

  interface HTMLAttributes {
    id?: string
    class?: string
    className?: string
    style?: string | Partial<CSSStyleDeclaration>
    onClick?: (e: MouseEvent) => void
    onChange?: (e: Event) => void
    onInput?: (e: Event) => void
    onSubmit?: (e: Event) => void
    children?: any
    [key: string]: any
  }
}
```

## License

MIT
