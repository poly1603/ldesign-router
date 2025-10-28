import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/router-react': resolve(__dirname, '../../src'),
      '@ldesign/router-core': resolve(__dirname, '../../../core/src'),
    },
  },
})

