import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  formatters: true,
  ignores: [
    '**/node_modules',
    '**/dist',
    '**/es',
    '**/lib',
    '**/.ldesign',
  ],
})
