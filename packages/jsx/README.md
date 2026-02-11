# @actview/jsx

Custom JSX runtime for Actview that renders JSX directly to real DOM elements.

## Installation

```bash
npm install @actview/jsx
# or
pnpm add @actview/jsx
```

## Configuration

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@actview/jsx"
  }
}
```

### Vite Configuration (Optional)

If using Vite, it will automatically use the TypeScript JSX settings.

## Usage

### Basic Elements

```tsx
const element = <div class="container">Hello World</div>
document.body.appendChild(element)
```

### Event Handling

```tsx
const button = (
  <button onClick={(e) => console.log('clicked!', e)}>
    Click Me
  </button>
)
```

### Styling

```tsx
// String style
<div style="color: red; font-size: 16px;">Styled Text</div>

// Object style
<div style={{ color: 'blue', fontSize: '16px' }}>Styled Text</div>
```

### Function Components

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>
}

const element = <Greeting name="World" />
```

### Fragment

```tsx
import { Fragment } from '@actview/jsx'

function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  )
}
```

### Conditional Rendering

```tsx
const isLoggedIn = true

const element = (
  <div>
    {isLoggedIn ? <span>Welcome!</span> : <span>Please login</span>}
  </div>
)
```

### List Rendering

```tsx
const items = ['Apple', 'Banana', 'Cherry']

const list = (
  <ul>
    {items.map(item => <li>{item}</li>)}
  </ul>
)
```

### With @actview/core

```tsx
import { ref, compile } from '@actview/core'

const count = ref(0)

compile({
  selector: '#app',
  render: () => (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  )
})
```

## API

### `createElement(tag, props, ...children)`

The JSX factory function that creates real DOM elements.

```typescript
function createElement(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: Child[]
): HTMLElement | DocumentFragment
```

### `Fragment`

Allows returning multiple elements without a wrapper.

```typescript
function Fragment(props: { children?: Child | Child[] }): DocumentFragment
```

### Exports

| Export | Description |
|--------|-------------|
| `createElement` | JSX factory function |
| `jsx` | Alias for `createElement` |
| `jsxs` | Alias for `createElement` (static children) |
| `jsxDEV` | Development mode JSX function |
| `Fragment` | Fragment component |

## Supported HTML Attributes

### Common Attributes

- `id`, `class`, `className`
- `style` (string or object)
- Any standard HTML attribute

### Event Handlers

- `onClick`, `onChange`, `onInput`, `onSubmit`
- Any `on*` prop is converted to an event listener

### Form Attributes

- `value`, `checked`, `placeholder`, `disabled`, `type`

## Type Definitions

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
