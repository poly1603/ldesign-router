/**
 * @ldesign/router-angular 主入口文件
 * 
 * Angular 路由库，基于 @angular/router 和 @ldesign/router-core
 * 
 * @module @ldesign/router-angular
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

// ==================== 服务导出 ====================
export {
  LdRouterService,
} from './services'

// ==================== 守卫导出 ====================
export {
  authGuard,
  createGuard,
  confirmDeactivateGuard,
} from './guards'

// ==================== 指令导出 ====================
export {
  LdRouterLinkDirective,
} from './directives'

// ==================== Angular Router 重新导出 ====================
// 方便使用
export {
  Router,
  ActivatedRoute,
  RouterModule,
  RouterOutlet,
  RouterLink,
  provideRouter,
} from '@angular/router'

export type {
  Routes,
  Route,
  CanActivateFn,
  CanDeactivateFn,
} from '@angular/router'

