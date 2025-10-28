/**
 * @ldesign/router-svelte 主入口文件
 * 
 * Svelte 路由库，基于 @ldesign/router-core
 * 
 * @module @ldesign/router-svelte
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
  ROUTER_KEY,
} from './router'

export type {
  Router,
  RouterOptions,
  CurrentRoute,
} from './router'

// ==================== 组件导出 ====================
export {
  Router as RouterProvider,
  RouterView,
  RouterLink,
} from './components'

// ==================== Stores 导出 ====================
export {
  getRouter,
  route,
  params,
  query,
  hash,
  meta,
} from './stores'

export type {
  RouteStore,
  ParamsStore,
  QueryStore,
  HashStore,
  MetaStore,
} from './stores'

// ==================== 插件导出 ====================
export type {
  RouterPlugin,
} from './plugins'


