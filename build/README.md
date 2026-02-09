# Build Module

用于构建 `packages/` 目录下的所有子包。

## 使用方法

### 构建所有包

```bash
pnpm build:packages
# 或
node build/index.mjs
```

### 构建指定包

```bash
node build/index.mjs core    # 只构建 @actview/core
node build/index.mjs jsx     # 只构建 @actview/jsx
```

## 输出

每个包会在其目录下生成 `dist/` 文件夹，包含：

- `index.mjs` - ESM 格式
- `index.cjs` - CommonJS 格式
- `index.mjs.map` - Source map
- `*.d.ts` - TypeScript 类型声明

## 配置

- `build/index.mjs` - 主构建脚本（包含包入口配置和动态 tsconfig 生成）
