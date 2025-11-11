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
      name: 'LDesignRouterReact',
      entry: 'src/index.ts',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'react',
    'react-dom',
    'react-router-dom',
    '@ldesign/router-core',
    '@ldesign/device',
    '@ldesign/engine',
    /^react\//,
  ],
})

