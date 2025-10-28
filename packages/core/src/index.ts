/**
 * @ldesign/router-core 主入口文件
 * 
 * 框架无关的路由核心库
 * 
 * @module @ldesign/router-core
 */

// ==================== 类型定义导出 ====================
export type {
  // 基础类型
  RouteParams,
  RouteQuery,
  RouteMeta,
  ExtractRouteParams,
  RouteParamsFor,
  TypedRouteParams,
  TypedRouteQuery,
  // 历史管理类型
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationInformation,
  RouterHistory,
  // 导航相关类型
  RouteLocationBase,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordBase,
  RouteRecordRaw,
  RouteRecordNormalized,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardNextCallback,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationFailure,
  ScrollPosition,
  ScrollPositionElement,
  ScrollBehavior,
} from './types'

export {
  NavigationType,
  NavigationFailureType,
} from './types'

// ==================== 工具函数导出 ====================
export {
  // 路径处理
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,
  extractParamNames,
  normalizeParams,
  // 查询参数处理
  parseQuery,
  stringifyQuery,
  mergeQuery,
  normalizeQuery,
  // URL 处理
  parseURL,
  stringifyURL,
  normalizeURL,
  isSameURL,
} from './utils'

export type {
  ParsedURL,
} from './utils'

// ==================== 历史管理导出 ====================
export {
  BaseHistory,
  HTML5History,
  createWebHistory,
  HashHistory,
  createWebHashHistory,
  MemoryHistory,
  createMemoryHistory,
} from './history'

// ==================== 增强功能导出 ====================
export {
  LazyLoadManager,
  defineLazyComponent,
  SSRManager,
  createSSRManager,
  PrefetchManager,
  createPrefetchManager,
  PermissionManager,
  createPermissionManager,
} from './features'

export type {
  LazyLoadOptions,
  LazyLoadState,
  ComponentLoader,
  SSRContext,
  SSRState,
  PrefetchStrategy,
  NetworkType,
  PrefetchOptions,
  Permission,
  Role,
  PermissionChecker,
  RoleChecker,
  PermissionOptions,
} from './features'

