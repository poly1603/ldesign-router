/**
 * @ldesign/router-vue2 主入口文�? *
 * Vue 2 路由库，基于 vue-router v3 �?@ldesign/router-core
 *
 * @module @ldesign/router-vue2
 */

// ==================== Core 类型重新导出 ====================
export type {
  // 基础类型
  RouteParams,
  RouteQuery,
  RouteMeta,
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

// ==================== 路由器导�?====================
export {
  createRouter,
} from './router'

export type {
  Router,
  RouterOptions,
  CurrentRoute,
  EventEmitter,
  VueRouter,
  Route,
  RouteConfig,
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

// ==================== Vue Router 原生导出（向后兼容） ====================
export { default as VueRouter } from 'vue-router'

