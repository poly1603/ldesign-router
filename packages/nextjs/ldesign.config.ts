import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'next',
    'next/navigation',
    'next/router',
    'react',
    'react-dom',
    '@ldesign/router-core',
    /^@ldesign\//,
  ],
})
