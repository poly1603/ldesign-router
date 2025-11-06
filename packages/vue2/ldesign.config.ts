import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: '@ldesign/router-vue2',
  formats: ['esm', 'cjs'],
  external: ['vue', 'vue-router', '@ldesign/router-core'],
  dts: true,
})

