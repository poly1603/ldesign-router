import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'solid',
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
      name: 'LDesignRouterSolid',
      entry: 'src/index.ts',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'solid-js',
    'solid-js/web',
    'solid-js/store',
    '@solidjs/router',
    '@ldesign/router-core',
  ],
})


