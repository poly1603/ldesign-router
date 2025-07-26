import type { Component, App } from 'vue'

// 设备类型
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

// 基础路由配置
export interface RouteConfig {
  path: string
  name?: string
  component?: Component | (() => Promise<Component>)
  components?: Record<DeviceType, Component | (() => Promise<Component>)>
  children?: RouteConfig[]
  meta?: RouteMeta
  redirect?: string | RouteLocation
  alias?: string | string[]
  beforeEnter?: NavigationGuard
  props?: boolean | Record<string, any> | ((route: Route) => Record<string, any>)
}

// 设备适配路由配置
export interface DeviceRouteConfig extends Omit<RouteConfig, 'component'> {
  components?: {
    desktop?: Component | (() => Promise<Component>)
    tablet?: Component | (() => Promise<Component>)
    mobile?: Component | (() => Promise<Component>)
  }
}

// 路由元信息
export interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
  cache?: boolean
  animation?: string
  breadcrumb?: boolean
  tab?: boolean
  menu?: boolean
  [key: string]: any
}

// 路由位置
export interface RouteLocation {
  name?: string
  path?: string
  params?: Record<string, string | number>
  query?: Record<string, string | number | (string | number)[]>
  hash?: string
  meta?: RouteMeta
}

// 标准化路由位置
export interface RouteLocationNormalized extends RouteLocation {
  path: string
  name: string
  params: Record<string, string | number>
  query: Record<string, string | number | (string | number)[]>
  hash: string
  meta: RouteMeta
  matched: RouteConfig[]
}

// 当前路由
export interface Route extends RouteLocationNormalized {
  fullPath: string
}

// 导航守卫
export type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: (to?: RouteLocation | boolean | Error) => void
) => void | Promise<void> | boolean | RouteLocation

// 路由器选项
export interface RouterOptions {
  routes: RouteConfig[]
  mode?: 'hash' | 'history'
  base?: string
  scrollBehavior?: (to: Route, from: Route, savedPosition: any) => any
  fallback?: boolean
  deviceDetection?: boolean
  cache?: CacheConfig
  animation?: AnimationConfig
  tabs?: TabConfig
  breadcrumb?: BreadcrumbConfig
  menu?: MenuConfig
  permission?: PermissionConfig
  theme?: ThemeConfig
  i18n?: I18nConfig
  plugins?: PluginConfig[]
  devTools?: boolean
}

// 路由器接口
export interface Router {
  currentRoute: Route
  options: RouterOptions
  app: App | null
  
  push(to: RouteLocation): Promise<void>
  replace(to: RouteLocation): Promise<void>
  go(delta: number): void
  back(): void
  forward(): void
  
  beforeEach(guard: NavigationGuard): () => void
  beforeResolve(guard: NavigationGuard): () => void
  afterEach(guard: (to: Route, from: Route) => void): () => void
  
  resolve(to: RouteLocation): RouteLocationNormalized
  addRoute(route: RouteConfig): void
  removeRoute(name: string): void
  hasRoute(name: string): boolean
  getRoutes(): RouteConfig[]
  
  install(app: App): void
}

// 标签页配置
export interface TabConfig {
  enabled?: boolean
  max?: number
  persistent?: boolean
  closable?: boolean
  draggable?: boolean
  contextMenu?: boolean
  cache?: boolean
}

// 面包屑配置
export interface BreadcrumbConfig {
  enabled?: boolean
  separator?: string
  showHome?: boolean
  homeText?: string
  maxItems?: number
}

// 菜单配置
export interface MenuConfig {
  enabled?: boolean
  mode?: 'sidebar' | 'top' | 'both'
  collapsible?: boolean
  defaultCollapsed?: boolean
  width?: number
  theme?: 'light' | 'dark'
}

// 缓存配置
export interface CacheConfig {
  enabled?: boolean
  max?: number
  strategy?: 'lru' | 'fifo' | 'custom'
  ttl?: number
  storage?: 'memory' | 'session' | 'local'
}

// 动画配置
export interface AnimationConfig {
  enabled?: boolean
  type?: 'fade' | 'slide' | 'zoom' | 'custom'
  duration?: number
  easing?: string
  direction?: 'left' | 'right' | 'up' | 'down'
}

// 守卫配置
export interface GuardConfig {
  beforeEach?: NavigationGuard[]
  beforeResolve?: NavigationGuard[]
  afterEach?: ((to: Route, from: Route) => void)[]
}

// 权限配置
export interface PermissionConfig {
  enabled?: boolean
  mode?: 'role' | 'permission' | 'both'
  defaultRole?: string
  guestRole?: string
  adminRole?: string
}

// 主题配置
export interface ThemeConfig {
  enabled?: boolean
  default?: 'light' | 'dark' | 'auto'
  storage?: boolean
  customThemes?: Record<string, any>
}

// 国际化配置
export interface I18nConfig {
  enabled?: boolean
  defaultLocale?: string
  fallbackLocale?: string
  messages?: Record<string, Record<string, string>>
  storage?: boolean
}

// 插件配置
export interface PluginConfig {
  name: string
  install: (router: Router, options?: any) => void
  options?: any
}

// 设备检测结果
export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  userAgent: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// 标签页项
export interface TabItem {
  id: string
  title: string
  path: string
  name: string
  icon?: string
  closable: boolean
  cached: boolean
  meta: RouteMeta
}

// 面包屑项
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
  disabled?: boolean
}

// 菜单项
export interface MenuItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: MenuItem[]
  disabled?: boolean
  hidden?: boolean
  meta?: RouteMeta
}

// 缓存项
export interface CacheItem {
  key: string
  component: Component
  timestamp: number
  accessCount: number
  size: number
}

// 动画选项
export interface AnimationOptions {
  name: string
  mode?: 'in-out' | 'out-in' | 'default'
  appear?: boolean
  duration?: number | { enter: number; leave: number }
  css?: boolean
  type?: 'transition' | 'animation'
}

// 权限项
export interface Permission {
  id: string
  name: string
  description?: string
  resource?: string
  action?: string
}

// 角色项
export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  inherits?: string[]
}

// 用户信息
export interface User {
  id: string
  name: string
  roles: string[]
  permissions: string[]
}

// 主题项
export interface Theme {
  id: string
  name: string
  colors: Record<string, string>
  variables: Record<string, string>
}

// 语言项
export interface Locale {
  id: string
  name: string
  messages: Record<string, string>
}

// 插件实例
export interface Plugin {
  name: string
  version?: string
  install: (router: Router, options?: any) => void
  uninstall?: (router: Router) => void
  options?: any
}

// 开发工具配置
export interface DevToolsConfig {
  enabled?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'small' | 'medium' | 'large'
  features?: {
    routeInspector?: boolean
    performanceMonitor?: boolean
    errorTracker?: boolean
    cacheViewer?: boolean
    animationDebugger?: boolean
  }
}

// 性能指标
export interface PerformanceMetrics {
  routeChangeTime: number
  componentLoadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
}

// 错误信息
export interface RouteError {
  id: string
  type: 'navigation' | 'component' | 'guard' | 'cache' | 'animation'
  message: string
  stack?: string
  route?: RouteLocationNormalized
  timestamp: number
}