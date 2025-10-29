# 批量生成框架适配包的脚本

$packages = @(
    @{
        Name = "astro"
        UmdName = "LDesignRouterAstro"
        External = @("astro", "@ldesign/router-core")
    },
    @{
        Name = "lit"
        UmdName = "LDesignRouterLit"
        External = @("lit", "@ldesign/router-core")
    },
    @{
        Name = "nextjs"
        UmdName = "LDesignRouterNext"
        External = @("next", "next/navigation", "next/router", "react", "react-dom", "@ldesign/router-core")
    },
    @{
        Name = "nuxtjs"
        UmdName = "LDesignRouterNuxt"
        External = @("nuxt", "@nuxt/kit", "#app", "vue", "@ldesign/router-core")
    },
    @{
        Name = "preact"
        UmdName = "LDesignRouterPreact"
        External = @("preact", "preact/hooks", "preact-router", "@ldesign/router-core")
    },
    @{
        Name = "qwik"
        UmdName = "LDesignRouterQwik"
        External = @("@builder.io/qwik", "@builder.io/qwik-city", "@ldesign/router-core")
    },
    @{
        Name = "remix"
        UmdName = "LDesignRouterRemix"
        External = @("@remix-run/react", "react", "react-dom", "@ldesign/router-core")
    },
    @{
        Name = "sveltekit"
        UmdName = "LDesignRouterSvelteKit"
        External = @("@sveltejs/kit", "$app/navigation", "$app/stores", "svelte", "@ldesign/router-core")
    }
)

foreach ($pkg in $packages) {
    $pkgPath = ".\packages\$($pkg.Name)"
    $srcPath = "$pkgPath\src"
    
    # 创建目录
    New-Item -ItemType Directory -Force -Path $srcPath | Out-Null
    
    # 创建 tsconfig.json
    $tsconfig = @"
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "es",
    "lib",
    "__tests__"
  ]
}
"@
    Set-Content -Path "$pkgPath\tsconfig.json" -Value $tsconfig
    
    # 创建 eslint.config.js
    $eslintConfig = @"
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
"@
    Set-Content -Path "$pkgPath\eslint.config.js" -Value $eslintConfig
    
    # 创建 ldesign.config.ts
    $externals = ($pkg.External | ForEach-Object { "    '$_'," }) -join "`n"
    $ldesignConfig = @"
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
      name: '$($pkg.UmdName)',
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
$externals
    /^@ldesign\//,
  ],
})
"@
    Set-Content -Path "$pkgPath\ldesign.config.ts" -Value $ldesignConfig
    
    # 创建 src/index.ts
    $indexTs = @"
/**
 * @ldesign/router-$($pkg.Name) 主入口文件
 *
 * $($pkg.Name) 路由库，基于 @ldesign/router-core
 *
 * @module @ldesign/router-$($pkg.Name)
 */

// ==================== Core 类型重新导出 ====================
export type {
  // 基础类型
  RouteParams,
  RouteQuery,
  RouteMeta,
  // 历史管理类型
  HistoryLocation,
  HistoryState,
  RouterHistory,
  // 导航相关类型
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  NavigationGuard,
  NavigationFailure,
  ScrollBehavior,
} from '@ldesign/router-core'

export {
  NavigationFailureType,
} from '@ldesign/router-core'

// ==================== Core 工具函数重新导出 ====================
export {
  normalizePath,
  joinPaths,
  buildPath,
  parseQuery,
  stringifyQuery,
  parseURL,
  stringifyURL,
} from '@ldesign/router-core'

// ==================== 历史管理重新导出 ====================
export {
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
} from '@ldesign/router-core'

// ==================== 路由器导出 ====================
export {
  createRouter,
} from './router'

export type {
  Router,
  RouterOptions,
} from './router'
"@
    Set-Content -Path "$srcPath\index.ts" -Value $indexTs
    
    # 创建 src/router.ts
    $routerTs = @"
/**
 * $($pkg.Name) Router Implementation
 */

import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
} from '@ldesign/router-core'

export interface RouterOptions {
  /**
   * 路由历史实例
   */
  history: RouterHistory
  /**
   * 路由配置
   */
  routes: RouteRecordRaw[]
  /**
   * 是否严格模式
   */
  strict?: boolean
  /**
   * 是否区分大小写
   */
  sensitive?: boolean
}

export interface Router {
  /**
   * 当前路由
   */
  currentRoute: RouteLocationNormalized
  /**
   * 路由历史
   */
  history: RouterHistory
  /**
   * 推送路由
   */
  push: (to: RouteLocationRaw) => Promise<void>
  /**
   * 替换路由
   */
  replace: (to: RouteLocationRaw) => Promise<void>
  /**
   * 返回
   */
  back: () => void
  /**
   * 前进
   */
  forward: () => void
}

export function createRouter(options: RouterOptions): Router {
  const { history, routes } = options

  let currentRoute: RouteLocationNormalized = {
    path: '/',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    meta: {},
    matched: [],
  }

  const router: Router = {
    get currentRoute() {
      return currentRoute
    },
    history,
    async push(to: RouteLocationRaw) {
      const location = typeof to === 'string' ? { path: to } : to
      history.push(location.path || '/', {})
    },
    async replace(to: RouteLocationRaw) {
      const location = typeof to === 'string' ? { path: to } : to
      history.replace(location.path || '/', {})
    },
    back() {
      history.back()
    },
    forward() {
      history.forward()
    },
  }

  return router
}
"@
    Set-Content -Path "$srcPath\router.ts" -Value $routerTs
    
    # 创建 README.md
    $readme = @"
# @ldesign/router-$($pkg.Name)

$($pkg.Name) router library with enhanced features, built on @ldesign/router-core.

## Installation

\`\`\`bash
pnpm add @ldesign/router-$($pkg.Name)
\`\`\`

## Usage

\`\`\`typescript
import { createRouter, createWebHistory } from '@ldesign/router-$($pkg.Name)'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // your routes
  ],
})
\`\`\`

## License

MIT
"@
    Set-Content -Path "$pkgPath\README.md" -Value $readme
    
    Write-Host "Generated package: $($pkg.Name)" -ForegroundColor Green
}

Write-Host "`nAll packages generated successfully!" -ForegroundColor Cyan
