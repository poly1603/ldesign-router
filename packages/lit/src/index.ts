/**
 * @ldesign/router-lit 主入口文�?
 *
 * Lit 路由库，基于 @ldesign/router-core
 *
 * @module @ldesign/router-lit
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

// ==================== 路由器导�?====================
export {
  createRouter,
} from './router'

export type {
  Router,
  RouterOptions,
  CurrentRoute,
  EventEmitter,
} from './router'

// ==================== Engine 插件导出 ====================
export {
  createRouterEnginePlugin,
  createDefaultRouterEnginePlugin,
  routerPlugin,
} from './plugins/engine-plugin'

export type {
  RouterEnginePluginOptions,
  RouterMode,
  RouterPreset,
} from './plugins/engine-plugin'
