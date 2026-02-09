# @actview/core

Actview 的核心响应式系统，提供 Vue 风格的响应式 API。

## 安装

```bash
npm install @actview/core
# 或
pnpm add @actview/core
```

## API

### `ref<T>(value: T): Ref<T>`

创建一个响应式引用，通过 `.value` 访问和修改值。

```typescript
import { ref } from '@actview/core'

const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

### `reactive<T>(value: T): T`

创建一个响应式对象，支持深层响应式和数组。

```typescript
import { reactive } from '@actview/core'

const state = reactive({
  name: 'Actview',
  items: [1, 2, 3]
})

state.name = 'New Name'  // 触发更新
state.items.push(4)      // 触发更新
```

### `computed<T>(getter: () => T): Ref<T>`

创建一个计算属性，依赖变化时自动重新计算。

```typescript
import { ref, computed } from '@actview/core'

const count = ref(1)
const double = computed(() => count.value * 2)

console.log(double.value) // 2

count.value = 5
console.log(double.value) // 10
```

### `watch<T>(source, callback)`

监听响应式数据变化，支持 `ref`、`reactive` 对象或 getter 函数。

```typescript
import { ref, watch } from '@actview/core'

const count = ref(0)

// 监听 ref
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// 监听 getter 函数
watch(
  () => count.value * 2,
  (newVal, oldVal) => {
    console.log(`double changed: ${oldVal} -> ${newVal}`)
  }
)
```

### `watchEffect(callback: () => void)`

立即执行回调函数，并自动追踪依赖，依赖变化时重新执行。

```typescript
import { ref, watchEffect } from '@actview/core'

const count = ref(0)

watchEffect(() => {
  console.log(`count is: ${count.value}`)
})
// 立即输出: count is: 0

count.value = 1
// 输出: count is: 1
```

### `compile(option: Option)`

配置驱动的 DOM 绑定，通过选择器自动绑定数据和事件。

```typescript
import { ref, compile } from '@actview/core'

const visible = ref(true)
const message = ref('Hello')

compile({
  selector: '#app',
  show: () => visible.value,
  text: () => message.value,
  listeners: [
    { type: 'click', callback: () => visible.value = !visible.value }
  ]
})
```

#### Option 配置项

| 属性 | 类型 | 说明 |
|------|------|------|
| `selector` | `string` | jQuery 选择器 |
| `show` | `boolean \| () => boolean` | 控制元素显示/隐藏 |
| `text` | `string \| () => string` | 设置元素文本内容 |
| `render` | `() => string \| Node` | 自定义渲染函数（支持 JSX） |
| `listeners` | `Listener[]` | 事件监听器列表 |

## 类型定义

```typescript
// 响应式引用
type Ref<T> = {
  value: T
  __isRef: true
}

// 事件监听器（类型安全）
type Listener<K extends keyof HTMLElementEventMap> = {
  type: K
  callback: (e: HTMLElementEventMap[K]) => void
}

// compile 配置
type Option = {
  selector: string
  show?: boolean | (() => boolean)
  text?: string | (() => string)
  listeners?: Listener[]
  render?: () => string | HTMLElement | Text | DocumentFragment
}
```

## 依赖

- `jquery` ^4.0.0

## License

MIT
