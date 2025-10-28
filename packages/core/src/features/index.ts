/**
 * @ldesign/router-core 增强功能模块
 * 
 * @description
 * 导出所有路由增强功能，包括懒加载、SSR、预取和权限控制。
 * 
 * @module features
 */

// ==================== 懒加载 ====================
export {
  LazyLoadManager,
  defineLazyComponent,
} from './lazy-loading'

export type {
  LazyLoadOptions,
  LazyLoadState,
  ComponentLoader,
} from './lazy-loading'

// ==================== SSR ====================
export {
  SSRManager,
  createSSRManager,
} from './ssr'

export type {
  SSRContext,
  SSRState,
} from './ssr'

// ==================== 预取 ====================
export {
  PrefetchManager,
  createPrefetchManager,
} from './prefetch'

export type {
  PrefetchStrategy,
  NetworkType,
  PrefetchOptions,
} from './prefetch'

// ==================== 权限控制 ====================
export {
  PermissionManager,
  createPermissionManager,
} from './permissions'

export type {
  Permission,
  Role,
  PermissionChecker,
  RoleChecker,
  PermissionOptions,
} from './permissions'

