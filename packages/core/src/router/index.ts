/**
 * @ldesign/router-core 路由器统一导出
 * 
 * @module router
 */

// 核心路由器
export {
  Router,
  createRouter,
} from './router'

export type {
  RouterOptions,
  NavigationOptions,
} from './router'

// 插件系统
export {
  PluginManager,
  createPluginManager,
  definePlugin,
  createLoggerPlugin,
  createPageTitlePlugin,
  createProgressPlugin,
  createAnalyticsPlugin,
  createPermissionPlugin,
  createKeepScrollPlugin,
} from './plugin'

export type {
  Plugin,
  PluginContext,
  PluginHooks,
  PluginState,
  PluginRecord,
} from './plugin'

// 链式API
export {
  RouteBuilder,
  ChainableRouter,
  RouteComposer,
  route,
  createChainableRouter,
  compose,
} from './chainable'

export type {
  RouteBuilderOptions,
} from './chainable'

// Promise API
export {
  PromiseRouter,
  NavigationController,
  createPromiseRouter,
  createNavigationController,
  waitForNavigation,
  navigateRace,
  navigateWithTimeout,
  safeNavigate,
} from './promise'

export type {
  NavigationOptions,
  NavigationResult,
} from './promise'
