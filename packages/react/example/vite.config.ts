import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

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
      '@': resolve(__dirname, './src'),
      '@ldesign/router-react': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})


