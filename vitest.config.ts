import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/*/src/**/__tests__/**/*.{test,spec}.{js,ts}',
      'packages/*/__tests__/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/es/**',
      '**/lib/**',
      '**/types/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'es/',
        'lib/',
        'types/',
        'examples/',
        'docs/',
        '*.config.*',
        'scripts/',
        '**/*.d.ts',
        '**/types.ts',
        '**/index.ts',
      ],
      // 覆盖率门槛 (LDesign 标准: 70%)
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

