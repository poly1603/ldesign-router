import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: 'dist',
  format: ['esm', 'cjs'],

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    '@builder.io/qwik',
    '@builder.io/qwik-city',
    '@ldesign/router-core',
    /^@ldesign\//,
  ],
})
