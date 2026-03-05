import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    vue()
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,ts,vue}',
      'src-ssr/**/*.{test,spec}.{js,ts}',
      'src-electron/**/*.{test,spec}.{js,ts}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,vue}', 'src-ssr/**/*.{js,ts}', 'src-electron/**/*.{js,ts}'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100
      }
    }
  },
  resolve: {
    alias: {
      'src': fileURLToPath(new URL('./src', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      'pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      'assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      'boot': fileURLToPath(new URL('./src/boot', import.meta.url)),
      'stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '#q-app/wrappers': fileURLToPath(new URL('./src/mock-wrappers.ts', import.meta.url)),
    }
  }
})
