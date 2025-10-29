/**
 * @ldesign/router-alpinejs 主入口文件
 *
 * Alpine.js 路由库，基于 @ldesign/router-core
 *
 * @module @ldesign/router-alpinejs
 */

// ==================== 指令导出 ====================
export {
  xLink,
  xRoute,
} from './directives'

export type {
  LinkDirective,
  RouteDirective,
} from './directives'

// ==================== 路由器导出 ====================
export {
  createRouter,
} from './router'

export type {
  Router,
  RouterOptions,
} from './router'

// ==================== Core 类型重新导出 ====================
export type {
  // 历史管理类型
  HistoryLocation,
  HistoryState,
  NavigationFailure,
  NavigationGuard,
  // 导航相关类型
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  // 基础类型
  RouteParams,
  RouteQuery,
  RouteRecordRaw,
  RouterHistory,
  ScrollBehavior,
} from '@ldesign/router-core'

export {
  NavigationFailureType,
} from '@ldesign/router-core'

// ==================== Core 工具函数重新导出 ====================
export {
  buildPath,
  joinPaths,
  normalizePath,
  parseQuery,
  parseURL,
  stringifyQuery,
  stringifyURL,
} from '@ldesign/router-core'

// ==================== 历史管理重新导出 ====================
export {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
} from '@ldesign/router-core'
