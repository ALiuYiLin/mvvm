import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@mvvm/jsx-runtime': path.resolve(__dirname, 'src/core/jsx-runtime.ts'),
      '@mvvm/jsx-dev-runtime': path.resolve(__dirname, 'src/core/jsx-runtime.ts')
    }
  },
  esbuild: {
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment',
    jsxInject: `import { createElement, Fragment } from '@mvvm/jsx-runtime'`
  }
})
