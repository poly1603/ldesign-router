import type { App } from 'vue'
import type { DeviceType, NavigationGuard, Route, RouteConfig, RouteLocation, RouteLocationNormalized } from './types/route'
import type { AnimationConfig, BreadcrumbConfig, CacheConfig, DeviceRouterConfig, GuardConfig, MenuConfig, PermissionConfig, TabsConfig } from './types/managers'

// 重新导出路由相关类型
export type { DeviceType, RouteConfig, DeviceRouteConfig, RouteMeta, RouteLocation, RouteLocationNormalized, Route, NavigationGuard } from './types/route'

// 重新导出管理器相关类型
export type {
  DeviceRouterConfig,
  GuardConfig,
  PermissionConfig,
  CacheConfig,
  BreadcrumbConfig,
  TabsConfig,
  AnimationConfig,
  MenuConfig,
  TabItem,
  BreadcrumbItem,
  MenuItem,
  CacheItem,
  AnimationOptions,
  Permission,
  Role,
  User,
  DevToolsConfig,
} from './types/managers'

// 路由器选项
export interface RouterOptions {
  routes: RouteConfig[]
  history?: 'hash' | 'history' | 'memory'
  base?: string
  scrollBehavior?: (to: Route, from: Route, savedPosition: any) => any
  fallback?: boolean
  deviceRouter?: DeviceRouterConfig
  guards?: GuardConfig
  cache?: CacheConfig
  animation?: AnimationConfig
  tabs?: TabsConfig
  breadcrumb?: BreadcrumbConfig
  menu?: MenuConfig
  permission?: PermissionConfig
  devTools?: boolean
}

// 路由器接口
export interface Router {
  currentRoute: Route
  options: RouterOptions
  app: App | null

  push: (to: RouteLocation) => Promise<void>
  replace: (to: RouteLocation) => Promise<void>
  go: (delta: number) => void
  back: () => void
  forward: () => void

  beforeEach: (guard: NavigationGuard) => () => void
  beforeResolve: (guard: NavigationGuard) => () => void
  afterEach: (guard: (to: Route, from: Route) => void) => () => void

  resolve: (to: RouteLocation) => RouteLocationNormalized
  addRoute: (route: RouteConfig) => void
  removeRoute: (name: string) => void
  hasRoute: (name: string) => boolean
  getRoutes: () => RouteConfig[]

  install: (app: App) => void
}

// 设备信息接口
export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  userAgent: string
  pixelRatio: number
}

// Re-export core types
export * from './types/route'
export * from './types/managers'
