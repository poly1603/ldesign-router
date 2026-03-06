import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/router-core': resolve(__dirname, '../packages/core/src'),
      '@ldesign/router-vue': resolve(__dirname, '../packages/vue/src'),
      '@ldesign/engine-vue3': resolve(__dirname, '../../engine/packages/vue3/src'),
      '@ldesign/engine-core': resolve(__dirname, '../../engine/packages/core/src'),
    },
  },
  server: {
    port: 5180,
    open: true,
  },
  // 根据模式选择入口
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
}))
