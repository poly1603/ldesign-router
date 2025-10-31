/**
 * @ldesign/router-vue 主入口文件
 * 
 * Vue 3 路由库，基于 vue-router 和 @ldesign/router-core
 * 
 * @module @ldesign/router-vue
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
  useRouter,
  useRoute,
} from './router'

export type {
  Router,
  RouterOptions,
} from './router'

// ==================== 组件导出 ====================
export {
  RouterView,
  RouterLink,
} from './components'

export type {
  RouterViewProps,
  RouterLinkProps,
} from './components'

// ==================== Composables 导出 ====================
export {
  useParams,
  useQuery,
  useHash,
  useMeta,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
} from './composables'

export type {
  UseRouteReturn,
  UseRouterReturn,
} from './composables'

// ==================== 插件导出 ====================
export {
  createRouterPlugin,
} from './plugins'

export type {
  RouterPluginOptions,
} from './plugins'

