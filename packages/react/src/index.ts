/**
 * @ldesign/router-react 主入口文件
 * 
 * React 路由库，基于 react-router-dom 和 @ldesign/router-core
 * 
 * @module @ldesign/router-react
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
} from './router'

export type {
  Router,
  RouterOptions,
} from './router'

// ==================== 组件导出 ====================
export {
  RouterView,
  RouterLink,
  Routes,
} from './components'

export type {
  RouterViewProps,
  RouterLinkProps,
  RoutesProps,
} from './components'

// ==================== Hooks 导出 ====================
export {
  useRouter,
  useRoute,
  useNavigate,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useLocation,
} from './hooks'

export type {
  UseRouterReturn,
  UseRouteReturn,
  UseNavigateReturn,
} from './hooks'

// ==================== Engine 插件导出 ====================
export {
  createRouterEnginePlugin,
  createDefaultRouterEnginePlugin,
  routerPlugin,
} from './engine-plugin'

export type {
  RouterEnginePluginOptions,
  RouterMode,
  RouterPreset,
} from './engine-plugin'

