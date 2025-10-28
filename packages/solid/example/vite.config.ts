import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  plugins: [solidPlugin()],

  server: {
    port: 5176,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ldesign/router-solid': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})


