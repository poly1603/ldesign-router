/**
 * @ldesign/router-vue 主入口文件
 * 
 * Vue 3 路由库，基于 vue-router 和 @ldesign/router-core
 * 
 * @module @ldesign/router-vue
 */

// ==================== 类型导出 ====================

// 重新导出所有类型（包括Core和Vue特定类型）
export type {
  // Core基础类型
  RouteParams,
  RouteQuery,
  RouteMeta,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteLocationBase,
  RouteRecordRaw,
  RouteRecordNormalized,
  RouteRecordBase,
  NavigationGuard,
  NavigationGuardNext,
  NavigationFailure,
  NavigationHookAfter,
  RouterHistory,
  HistoryLocation,
  HistoryState,
  ScrollBehavior,
  ScrollPosition,
  // Vue特定类型
  Router,
  RouterOptions,
  CurrentRoute,
  UseRouteReturn,
  UseRouterReturn,
  EventEmitter,
  TypedRoute,
  ExtractParams,
} from './types'

// 重新导出组件类型
export type {
  // RouterView
  RouterViewProps,
  RouterViewEmits,
  TransitionConfig,
  CacheConfig,
  // RouterLink
  RouterLinkProps,
  RouterLinkEmits,
  // RouterTabs
  RouterTab,
  RouterTabsProps,
  RouterTabsEmits,
  // RouterBreadcrumb
  BreadcrumbItem,
  RouterBreadcrumbProps,
  RouterBreadcrumbEmits,
} from './components'

export {
  NavigationFailureType,
  NavigationType,
} from './types'

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
// 注意：Vue 适配层需要使用 vue-router 的 History 实现
export {
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
} from 'vue-router'

// ==================== 路由器导出 ====================
export {
  createRouter,
  useRouter,
  useRoute,
} from './router'

// ==================== 组件导出 ====================
export {
  RouterView,
  RouterLink,
  RouterTabs,
  RouterBreadcrumb,
} from './components'

// ==================== Composables 导出 ====================
export {
  useParams,
  useQuery,
  useHash,
  useMeta,
  useRouteMatch,
  useFullPath,
  useRouteName,
  useTypedParams,
  useTypedQuery,
  useTypedMeta,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  // 增强 Composables
  useNavigationState,
  useBreadcrumb,
  useRouteActive,
  usePathActive,
  useHasQueryParam,
  useQueryParam,
  useParam,
} from './composables'

// ==================== 配置管理导出 ====================
export {
  provideRouterConfig,
  injectRouterConfig,
  injectRouter,
  useRouter as useRouterConfig,
  installRouterConfig,
  createRouterConfig,
  defaultRouterConfig,
  ROUTER_CONFIG_KEY,
  ROUTER_KEY,
} from './config'

export type {
  RouterConfig,
  RouterConfigContext,
} from './config'

// ==================== DevTools 集成导出 ====================
export {
  setupDevtools,
  addPerformanceMetrics,
  ROUTER_INSPECTOR_ID,
  ROUTER_TIMELINE_ID,
} from './devtools'

export type {
  DevtoolsPluginApi,
  DevtoolsOptions,
  InspectorOptions,
  TimelineLayerOptions,
  TimelineEventOptions,
} from './devtools'

// ==================== 插件导出 ====================
// Vue Plugin - 用于标准 Vue 应用
export {
  createRouterPlugin,
  useRouterPlugin,
} from './plugins'

export type {
  RouterPluginOptions,
} from './plugins'

// Engine Plugin - 用于 LDesign Engine
export {
  createRouterEnginePlugin,
  createDefaultRouterEnginePlugin,
  routerPlugin,
} from './plugins'

export type {
  RouterEnginePluginOptions,
  RouterMode,
  RouterPreset,
} from './plugins'

// ==================== 框架适配器导出 ====================
export {
  vueAdapter,
  VueComponentLoader,
  VueViewRenderer,
  VueSSRRenderer,
  VueErrorBoundary,
} from './adapter'

export type {
  FrameworkAdapter,
  ComponentLoader,
  ViewRenderer,
  SSRRenderer,
  SSRContext,
  ErrorBoundary,
  ComponentLifecycleHooks,
} from '@ldesign/router-core'

