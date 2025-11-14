import { defineConfig } from '@ldesign/builder'

/**
 * @ldesign/router-vue 构建配置
 * 
 * 产物格式:
 * - es/   - ES 模块 (.mjs) + 样式文件
 * - esm/  - ESM 模块 (.js) 无样式
 * - cjs/  - CommonJS 模块 (.cjs)
 * - dist/ - UMD 模块 (浏览器使用)
 */
export default defineConfig({
  entry: 'src/index.ts',

  output: {
    es: {
      dir: 'es',
      sourcemap: true,
    },
    esm: {
      dir: 'esm',
      sourcemap: true,
    },
    cjs: {
      dir: 'cjs',
      sourcemap: true,
    },
    umd: {
      dir: 'dist',
      name: 'LDesignRouterVue',
      globals: {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        '@ldesign/router-core': 'LDesignRouterCore',
        '@ldesign/device': 'LDesignDevice',
        '@ldesign/engine': 'LDesignEngine',
      },
    },
  },

  external: [
    'vue',
    'vue-router',
    '@ldesign/router-core',
    '@ldesign/device',
    '@ldesign/engine',
    '@ldesign/shared',
    'tslib',
  ],

  globals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    '@ldesign/router-core': 'LDesignRouterCore',
    '@ldesign/device': 'LDesignDevice',
    '@ldesign/engine': 'LDesignEngine',
  },

  libraryType: 'vue3',
  bundler: 'rollup',

  dts: {
    enabled: true,
  },
})

