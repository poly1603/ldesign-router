/**
 * @ldesign/router-solid 主入口文件
 * 
 * Solid.js 路由库,基于 @solidjs/router 和 @ldesign/router-core
 * 
 * @module @ldesign/router-solid
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
  RouterProvider,
  useRouterContext,
} from './router'

export type {
  Router,
  RouterOptions,
  RouterProviderProps,
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

// ==================== Hooks 导出 ====================
export {
  useRouter,
  useRoute,
  useNavigateHook as useNavigate,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useLocation,
  useRouteMatch,
  useFullPath,
} from './hooks'

export type {
  UseRouterReturn,
  UseRouteReturn,
  UseNavigateReturn,
} from './hooks'

// ==================== 插件导出 ====================
export type {
  RouterPlugin,
} from './plugins'


