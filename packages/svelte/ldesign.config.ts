import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'svelte',
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
    },
    cjs: {
      dir: 'lib',
    },
    umd: {
      dir: 'dist',
      name: 'LDesignRouterSvelte',
      entry: 'src/index.ts',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'svelte',
    'svelte/store',
    'svelte/internal',
    '@ldesign/router-core',
  ],
})


