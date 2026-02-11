# @actview/core

The core reactive system for Actview, providing Vue-style reactive APIs.

## Installation

```bash
npm install @actview/core
# or
pnpm add @actview/core
```

## API

### `ref<T>(value: T): Ref<T>`

Creates a reactive reference. Access and modify the value through `.value`.

```typescript
import { ref } from '@actview/core'

const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

### `reactive<T>(value: T): T`

Creates a reactive object with deep reactivity support, including arrays.

```typescript
import { reactive } from '@actview/core'

const state = reactive({
  name: 'Actview',
  items: [1, 2, 3]
})

state.name = 'New Name'  // triggers update
state.items.push(4)      // triggers update
```

### `computed<T>(getter: () => T): Ref<T>`

Creates a computed property that automatically recalculates when dependencies change.

```typescript
import { ref, computed } from '@actview/core'

const count = ref(1)
const double = computed(() => count.value * 2)

console.log(double.value) // 2

count.value = 5
console.log(double.value) // 10
```

### `watch<T>(source, callback)`

Watches reactive data changes. Supports `ref`, `reactive` objects, or getter functions.

```typescript
import { ref, watch } from '@actview/core'

const count = ref(0)

// Watch a ref
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// Watch a getter function
watch(
  () => count.value * 2,
  (newVal, oldVal) => {
    console.log(`double changed: ${oldVal} -> ${newVal}`)
  }
)
```

### `watchEffect(callback: () => void)`

Immediately executes the callback and automatically tracks dependencies. Re-executes when dependencies change.

```typescript
import { ref, watchEffect } from '@actview/core'

const count = ref(0)

watchEffect(() => {
  console.log(`count is: ${count.value}`)
})
// Immediately outputs: count is: 0

count.value = 1
// Outputs: count is: 1
```

### `compile(option: Option)`

Configuration-driven DOM binding. Automatically binds data and events through selectors.

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

#### Option Properties

| Property | Type | Description |
|----------|------|-------------|
| `selector` | `string` | jQuery selector |
| `show` | `boolean \| () => boolean` | Controls element visibility |
| `text` | `string \| () => string` | Sets element text content |
| `render` | `() => string \| Node` | Custom render function (supports JSX) |
| `listeners` | `Listener[]` | Event listeners array |

## Type Definitions

```typescript
// Reactive reference
type Ref<T> = {
  value: T
  __isRef: true
}

// Event listener (type-safe)
type Listener<K extends keyof HTMLElementEventMap> = {
  type: K
  callback: (e: HTMLElementEventMap[K]) => void
}

// compile options
type Option = {
  selector: string
  show?: boolean | (() => boolean)
  text?: string | (() => string)
  listeners?: Listener[]
  render?: () => string | HTMLElement | Text | DocumentFragment
}
```

## Dependencies

- `jquery` ^4.0.0

## License

MIT
