import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: 'LDesignRouterVue2',
      entry: 'src/index.ts',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: ['vue', 'vue-router', '@ldesign/router-core'],
})

