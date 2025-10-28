import { defineConfig } from '@ldesign/launcher'
import solidPlugin from 'vite-plugin-solid'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      '@': resolve(__dirname, '../src'),
      '@ldesign/router-solid': resolve(__dirname, '../../src'),
      '@ldesign/router-core': resolve(__dirname, '../../../core/src'),
    },
  },
})

