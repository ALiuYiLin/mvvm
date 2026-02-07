# ActView (MVVM Study Edition)

[简体中文](./README.zh.md) | English

**ActView** is a lightweight MVVM library born for **Campaign / Marketing Single Page Applications**.

> Target Scenarios: Single-page applications with complex state and logic, requiring strong collaboration between roles.

## Why ActView?

In Campaign/H5 development, there is often a clear division of labor:
- **Teammate A**: Focuses solely on HTML / CSS (The Slicer)
- **Teammate B**: Focuses solely on Data, Logic, and Reactivity (The Logician)

**ActView**'s core capability is to "wire" these two together:
**Selector + Configuration → Automatic Data Binding**

Goal: **Low Mental Burden, Fast, Stable, Easy Handoff**.

## Core Features

- **Configuration-Driven Binding**: Non-intrusive to HTML, just provide `selector` + configuration options.
- **Automatic Reactivity**: `ref` / `reactive` data changes automatically update the view.
- **Two-Way Binding Loop**: Quickly write back data via `listeners`.
- **Computed / Watch**: `computed` / `watch` for handling complex logic.
- **JSX / Functional Rendering**: Support returning JSX directly in configuration (`render` function) for complex lists/components.
- **Quick Event Mounting**: Define event callbacks directly in the configuration.

## Quick Start

```bash
npm i
npm run dev
```

Build output to `out/`:

```bash
npm run build
```

## Core Usage

### 1) Data Definition (Ref / Reactive)

```ts
import { ref, reactive } from "./core";

// Primitive type
const count = ref(0);

// Object / Array
const student = reactive({ name: "John Doe", age: 20 });
const list = reactive([{ id: 1, name: "A" }]);
```

### 2) View Binding (Compile + Option)

View binding is done via `compile(option)`. Teammate A writes HTML (id="count"), Teammate B writes configuration:

```ts
import { compile } from "./core/compile";

compile({
  selector: "#count",
  // Text binding: automatically responds to count.value changes
  text: () => `Current Count: ${count.value}`,
  // Visibility binding
  show: () => count.value > 0,
  // Event binding
  listeners: [
    { type: "click", callback: () => count.value++ }
  ]
});
```

### 3) Complex Rendering (Render + JSX)

For lists or complex structures, use JSX directly:

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

### 4) Logic Reuse (Computed / Watch)

```ts
import { computed, watch } from "./core";

// Computed Property
const info = computed(() => `${student.name} (${student.age} years old)`);

// Watcher
watch(() => student.age, (newVal, oldVal) => {
  console.log("Age changed:", oldVal, "->", newVal);
});
```

## Directory Structure & Principle

- `src/core`: Core implementation
  - `ref.ts` / `reactive.ts`: Reactivity system based on Proxy
  - `compile.ts`: View binder based on jQuery selectors
  - `computed.ts` / `watch.ts`: Dependency collection and side effect handling
  - `jsx/`: Custom JSX runtime (No Virtual DOM, returns real DOM directly)
- `src/types`: Type definitions

## Known Limitations

- `render` strategy is "clear and re-insert", no Diff algorithm, suitable for display-heavy Campaign UIs.
- Intended for learning and small-scale campaign pages only.
