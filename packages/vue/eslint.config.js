import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  jsonc: false,
  markdown: false,
  ignores: [
    'dist',
    'es',
    'lib',
    'node_modules',
    '*.md',
    'coverage',
    '*.config.ts',
    'example',
  ],
  rules: {
    // 允许 console.warn 和 console.error
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    // 未使用的变量（以 _ 开头的除外）
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // 显式 any 类型给出警告
    '@typescript-eslint/no-explicit-any': 'warn',
    // Vue 特定规则
    'vue/multi-word-component-names': 'off',
  },
})

