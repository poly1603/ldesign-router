/**
 * @ldesign/router 核心类型定义
 *
 * 定义路由系统的完整类型体系，提供极致的类型安全和开发体验。
 * 
 * **类型分类**：
 * - 基础类型：RouteParams, RouteQuery, RouteMeta
 * - 路由位置：RouteLocation, RouteLocationNormalized
 * - 路由记录：RouteRecord, RouteRecordNormalized
 * - 导航守卫：NavigationGuard, NavigationGuardReturn
 * - 历史管理：RouterHistory, HistoryLocation
 * - 路由器：Router, RouterOptions
 * - 组合式 API：UseRouteReturn, UseRouterReturn
 * 
 * **类型安全特性**：
 * - 路径参数自动推导
 * - 泛型支持灵活配置
 * - 严格的类型检查
 * - 完整的 TypeScript 支持
 * 
 * @module types
 * @author ldesign
 */

import type { DeviceType } from '@ldesign/device'
import type { Component, ComputedRef, Ref } from 'vue'
import type { NavigationFailureType } from '../core/constants'

// 重新导出 NavigationFailureType
export { NavigationFailureType } from '../core/constants'

// ==================== 基础类型 ====================

/**
 * 路由参数类型
 * 
 * 存储动态路由参数的键值对。
 * 参数值可以是单个字符串或字符串数组（多值参数）。
 * 
 * @example
 * ```ts
 * // 单个参数
 * const params: RouteParams = { id: '123', slug: 'hello-world' }
 * 
 * // 数组参数
 * const params: RouteParams = { tags: ['vue', 'router', 'typescript'] }
 * ```
 */
export type RouteParams = Record<string, string | string[]>

/**
 * 查询参数类型
 * 
 * 存储 URL 查询字符串的键值对。
 * 参数值可以是字符串、字符串数组、null 或 undefined。
 * 
 * @example
 * ```ts
 * // 基础查询参数
 * const query: RouteQuery = { 
 *   search: 'vue',
 *   page: '1',
 *   sort: 'desc'
 * }
 * 
 * // 数组查询参数
 * const query: RouteQuery = { 
 *   filters: ['active', 'verified']
 * }
 * 
 * // 可选参数
 * const query: RouteQuery = { 
 *   optional: null,
 *   nullable: undefined
 * }
 * ```
 */
export type RouteQuery = Record<string, string | string[] | null | undefined>

// ==================== 类型推导工具 ====================

/**
 * 从路径字符串中提取参数类型（高级类型）
 * 
 * 自动从路径模式中提取参数名称和类型。
 * 支持必需参数和可选参数的推导。
 * 
 * @template T - 路径字符串字面量类型
 * 
 * @example
 * ```ts
 * type UserParams = ExtractRouteParams<'/user/:id'>
 * // => { id: string }
 * 
 * type PostParams = ExtractRouteParams<'/post/:category/:id'>
 * // => { category: string; id: string }
 * 
 * type OptionalParams = ExtractRouteParams<'/user/:id?'>
 * // => { id?: string }
 * ```
 */
export type ExtractRouteParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${infer _Start}:${infer Param}?/${infer Rest}`
  ? { [K in Param]?: string } & ExtractRouteParams<Rest>
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : T extends `${infer _Start}:${infer Param}?`
  ? { [K in Param]?: string }
  : Record<string, never>

/**
 * 路径参数类型推导（便捷别名）
 * 
 * @template T - 路径字符串字面量类型
 * 
 * @example
 * ```ts
 * function navigateToUser(params: RouteParamsFor<'/user/:id'>) {
 *   router.push({ name: 'user', params })
 * }
 * 
 * navigateToUser({ id: '123' })  // ✅ 类型安全
 * navigateToUser({})             // ❌ TypeScript 错误
 * ```
 */
export type RouteParamsFor<T extends string> = ExtractRouteParams<T>

/**
 * 类型安全的路由参数
 * 
 * 将参数对象转换为路由参数类型，确保值为字符串或字符串数组。
 * 
 * @template T - 参数对象类型
 * 
 * @example
 * ```ts
 * interface UserRouteParams {
 *   id: string
 *   section?: string
 * }
 * 
 * const params: TypedRouteParams<UserRouteParams> = {
 *   id: '123',
 *   section: 'profile'
 * }
 * ```
 */
export type TypedRouteParams<
  T extends Record<string, any> = Record<string, any>,
> = {
    [K in keyof T]: T[K] extends string ? string : string | string[]
  }

/**
 * 类型安全的查询参数
 * 
 * 将查询对象转换为路由查询类型，支持多种值类型。
 * 所有查询参数都是可选的，值会被转换为字符串。
 * 
 * @template T - 查询对象类型
 * 
 * @example
 * ```ts
 * interface SearchQuery {
 *   q: string
 *   page: number
 *   active: boolean
 * }
 * 
 * const query: TypedRouteQuery<SearchQuery> = {
 *   q: 'vue router',
 *   page: '1',      // 数字会转为字符串
 *   active: 'true'  // 布尔值会转为字符串
 * }
 * ```
 */
export type TypedRouteQuery<
  T extends Record<string, any> = Record<string, any>,
> = {
    [K in keyof T]?: T[K] extends string
    ? string | string[] | null | undefined
    : T[K] extends number
    ? string | string[] | null | undefined
    : T[K] extends boolean
    ? string | string[] | null | undefined
    : string | string[] | null | undefined
  }

/**
 * 路由元信息类型
 * 
 * 存储路由的元数据，可以在路由配置中自定义任何字段。
 * 以下是常用的内置字段，但可以扩展添加任何自定义字段。
 * 
 * @interface
 * 
 * @example
 * ```ts
 * // 基础用法
 * const route = {
 *   path: '/admin',
 *   meta: {
 *     title: '管理后台',
 *     requiresAuth: true,
 *     roles: ['admin']
 *   }
 * }
 * 
 * // 扩展自定义字段
 * interface CustomRouteMeta extends RouteMeta {
 *   icon?: string
 *   order?: number
 *   hidden?: boolean
 * }
 * 
 * const customRoute = {
 *   path: '/dashboard',
 *   meta: {
 *     title: '仪表板',
 *     icon: 'dashboard',
 *     order: 1
 *   } as CustomRouteMeta
 * }
 * ```
 */
export interface RouteMeta extends Record<string | number | symbol, unknown> {
  /** 页面标题，用于设置 document.title */
  title?: string

  /** 是否需要登录认证 */
  requiresAuth?: boolean

  /** 需要的用户角色（用于权限控制） */
  roles?: string[]

  /** 是否使用 KeepAlive 缓存组件 */
  keepAlive?: boolean

  /** 预加载策略：hover（悬停）、visible（可见）、idle（空闲） */
  preload?: boolean | 'hover' | 'visible' | 'idle'

  /** 页面过渡动画类型 */
  transition?: string

  /** 是否禁止搜索引擎索引 */
  noIndex?: boolean

  /** Sitemap 优先级（0-1） */
  sitemapPriority?: number

  /** Sitemap 更新频率 */
  sitemapChangefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

  /** 是否禁用缓存 */
  noCache?: boolean

  /** 数据预取函数（SSR 用） */
  fetchData?: (route: RouteLocationNormalized) => Promise<any>

  /** SEO 配置 */
  seo?: any

  // ==================== 设备适配相关 ====================

  /** 支持的设备类型，默认支持所有设备 */
  supportedDevices?: DeviceType[]

  /** 不支持设备时的提示信息 */
  unsupportedMessage?: string

  /** 不支持设备时的重定向路由 */
  unsupportedRedirect?: string

}

// ==================== 路由位置类型 ====================

/**
 * 路由位置基础接口（泛型版）
 * 
 * 定义路由位置的基本结构，所有路由位置类型的基类。
 * 
 * @template TParams - 参数类型
 * @template TQuery - 查询类型  
 * @template TMeta - 元信息类型
 */
export interface RouteLocationBase<
  TParams extends Record<string, any> = Record<string, any>,
  TQuery extends Record<string, any> = Record<string, any>,
  TMeta extends RouteMeta = RouteMeta,
> {
  /** 路径字符串（不含查询参数和哈希） */
  path: string

  /** 路由名称（可选） */
  name?: string | symbol

  /** 路由参数对象 */
  params: TypedRouteParams<TParams>

  /** 查询参数对象 */
  query: TypedRouteQuery<TQuery>

  /** URL 哈希值（包含 # 符号） */
  hash: string

  /** 路由元信息 */
  meta: TMeta
}

/**
 * 标准化的路由位置（泛型版）
 * 
 * 完整的路由位置对象，包含所有解析后的信息。
 * 
 * @template TParams - 参数类型
 * @template TQuery - 查询类型
 * @template TMeta - 元信息类型
 * 
 * @example
 * ```ts
 * const route: RouteLocationNormalized = {
 *   path: '/user/123',
 *   name: 'user',
 *   params: { id: '123' },
 *   query: { tab: 'profile' },
 *   hash: '#bio',
 *   fullPath: '/user/123?tab=profile#bio',
 *   matched: [parentRoute, currentRoute],
 *   meta: { title: '用户详情' }
 * }
 * ```
 */
export interface RouteLocationNormalized<
  TParams extends Record<string, any> = Record<string, any>,
  TQuery extends Record<string, any> = Record<string, any>,
  TMeta extends RouteMeta = RouteMeta,
> extends RouteLocationBase<TParams, TQuery, TMeta> {
  /** 完整路径（包含查询参数和哈希值） */
  fullPath: string

  /** 匹配的路由记录数组（从父到子的顺序） */
  matched: RouteRecordNormalized[]

  /** 重定向来源路由（如果是重定向过来的） */
  redirectedFrom?: RouteLocationNormalized
}

/**
 * 加载后的路由位置
 * 
 * 用于组件内访问的路由对象，保证所有异步组件已加载。
 * 
 * @interface
 */
export interface RouteLocationNormalizedLoaded extends RouteLocationNormalized {
  /** 匹配的路由记录（所有组件已加载） */
  matched: RouteRecordNormalized[]
}

/**
 * 类型安全的路由位置（基于路径自动推导）
 * 
 * @template T - 路径字符串字面量类型
 * 
 * @example
 * ```ts
 * const route: TypedRouteLocation<'/user/:id'> = {
 *   path: '/user/123',
 *   params: { id: '123' },  // 类型自动推导
 *   // ...
 * }
 * ```
 */
export type TypedRouteLocation<T extends string> = RouteLocationNormalized<
  RouteParamsFor<T>,
  Record<string, any>,
  RouteMeta
>

/**
 * 路由位置原始类型（用于导航）
 * 
 * 支持三种形式：
 * 1. 字符串路径：'/about'
 * 2. 路径对象：{ path: '/about', query: {...} }
 * 3. 命名路由：{ name: 'about', params: {...} }
 * 
 * @template TParams - 参数类型
 * @template TQuery - 查询类型
 * 
 * @example
 * ```ts
 * // 字符串形式
 * router.push('/about')
 * 
 * // 路径对象
 * router.push({ path: '/about', query: { tab: 'team' } })
 * 
 * // 命名路由
 * router.push({ name: 'user', params: { id: '123' } })
 * ```
 */
export type RouteLocationRaw<
  TParams extends Record<string, any> = Record<string, any>,
  TQuery extends Record<string, any> = Record<string, any>,
> =
  | string
  | RouteLocationPathRaw<TQuery>
  | RouteLocationNamedRaw<TParams, TQuery>

/**
 * 基于路径的路由位置（泛型版）
 * 
 * 使用路径进行导航时的对象格式。
 * 
 * @template TQuery - 查询类型
 */
export interface RouteLocationPathRaw<
  TQuery extends Record<string, any> = Record<string, any>,
> {
  /** 路径字符串 */
  path: string
  /** 查询参数 */
  query?: TypedRouteQuery<TQuery>
  /** 哈希值 */
  hash?: string
  /** 历史状态 */
  state?: HistoryState
}

/**
 * 基于名称的路由位置（泛型版）
 * 
 * 使用路由名称进行导航时的对象格式。
 * 
 * @template TParams - 参数类型
 * @template TQuery - 查询类型
 */
export interface RouteLocationNamedRaw<
  TParams extends Record<string, any> = Record<string, any>,
  TQuery extends Record<string, any> = Record<string, any>,
> {
  /** 路由名称 */
  name: string | symbol
  /** 路由参数 */
  params?: TypedRouteParams<TParams>
  /** 查询参数 */
  query?: TypedRouteQuery<TQuery>
  /** 哈希值 */
  hash?: string
  /** 历史状态 */
  state?: HistoryState
}

// ==================== 路由记录类型 ====================

/**
 * 路由组件类型
 */
export type RouteComponent = Component | (() => Promise<Component>)

/**
 * 路由记录类型别名（为了兼容性）
 */
export type RouteRecord = RouteRecordRaw

/**
 * 路由记录原始配置
 */
export interface RouteRecordRaw {
  /** 路径 */
  path: string
  /** 路由名称 */
  name?: string | symbol
  /** 组件 */
  component?: RouteComponent
  /** 命名视图组件 */
  components?: Record<string, RouteComponent>
  /** 重定向 */
  redirect?:
  | RouteLocationRaw
  | ((to: RouteLocationNormalized) => RouteLocationRaw)
  /** 别名 */
  alias?: string | string[]
  /** 子路由 */
  children?: RouteRecordRaw[]
  /** 元信息 */
  meta?: RouteMeta
  /** 路由级守卫 */
  beforeEnter?: NavigationGuard | NavigationGuard[]
  /** 属性传递 */
  props?:
  | boolean
  | Record<string, unknown>
  | ((route: RouteLocationNormalized) => Record<string, unknown>)
  /** 路径匹配是否大小写敏感 */
  sensitive?: boolean
  /** 路径匹配是否严格模式 */
  strict?: boolean

  // ==================== 设备适配相关 ====================
  /** 设备特定组件配置 */
  deviceComponents?: {
    mobile?: RouteComponent
    tablet?: RouteComponent
    desktop?: RouteComponent
  }

}

/**
 * 标准化的路由记录
 */
export interface RouteRecordNormalized {
  /** 路径 */
  path: string
  /** 路由名称 */
  name: string | symbol | undefined
  /** 组件映射 */
  components: Record<string, RouteComponent> | null | undefined
  /** 子路由 */
  children: RouteRecordNormalized[]
  /** 元信息 */
  meta: RouteMeta
  /** 属性配置 */
  props: Record<
    string,
    | boolean
    | Record<string, unknown>
    | ((route: RouteLocationNormalized) => Record<string, unknown>)
  >
  /** 路由级守卫 */
  beforeEnter: NavigationGuard | undefined
  /** 别名来源 */
  aliasOf: RouteRecordNormalized | undefined
  /** 重定向配置 */
  redirect:
  | RouteLocationRaw
  | ((to: RouteLocationNormalized) => RouteLocationRaw)
  | undefined
}

// ==================== 导航守卫类型 ====================

/**
 * 导航守卫函数
 */
export interface NavigationGuard {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ): NavigationGuardReturn | Promise<NavigationGuardReturn>
}

/**
 * 导航守卫返回值
 */
export type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean

/**
 * 导航守卫 next 函数
 */
export interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean | undefined): void
}

/**
 * 导航后置钩子
 */
export interface NavigationHookAfter {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    failure?: NavigationFailure | void | undefined
  ): void
}

// ==================== 历史管理类型 ====================

/**
 * 历史状态
 */
export interface HistoryState {
  [key: string]: unknown
}

/**
 * 历史位置
 */
export interface HistoryLocation {
  pathname: string
  search: string
  hash: string
}

/**
 * 路由历史接口
 */
export interface RouterHistory {
  readonly base: string
  readonly location: HistoryLocation
  readonly state: HistoryState

  push: (to: HistoryLocation, data?: HistoryState) => void
  replace: (to: HistoryLocation, data?: HistoryState) => void
  go: (delta: number, triggerListeners?: boolean) => void
  back: () => void
  forward: () => void

  listen: (callback: NavigationCallback) => () => void
  destroy: () => void
}

/**
 * 导航回调
 */
export interface NavigationCallback {
  (
    to: HistoryLocation,
    from: HistoryLocation,
    info: NavigationInformation
  ): void
}

/**
 * 导航信息
 */
export interface NavigationInformation {
  type: NavigationType
  direction: NavigationDirection
  delta: number
}

/**
 * 导航类型
 */
export type NavigationType = 'pop' | 'push' | 'replace'

/**
 * 导航方向
 */
export type NavigationDirection = 'forward' | 'backward' | 'unknown'

// ==================== 导航失败类型 ====================

// 重新导出设备相关类型
export type { DeviceType } from '@ldesign/device'
export type { Component, ComputedRef, Ref } from 'vue'

/**
 * 导航失败接口
 */
export interface NavigationFailure extends Error {
  type: NavigationFailureType
  from: RouteLocationNormalized
  to: RouteLocationNormalized
}

// ==================== 滚动行为类型 ====================

/**
 * 滚动位置
 */
export interface ScrollPosition {
  left: number
  top: number
  el?: Element | null
}

/**
 * 滚动行为函数
 */
export interface ScrollBehavior {
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    savedPosition: ScrollPosition | null
  ): ScrollPosition | Promise<ScrollPosition> | undefined | null
}

// ==================== 路由器类型 ====================

/**
 * 路由器选项
 */
export interface RouterOptions {
  /** 历史模式 */
  history: RouterHistory
  /** 路由配置 */
  routes: RouteRecordRaw[]
  /** 链接激活类名 */
  linkActiveClass?: string
  /** 链接精确激活类名 */
  linkExactActiveClass?: string
  /** 查询参数解析函数 */
  parseQuery?: (query: string) => RouteQuery
  /** 查询参数序列化函数 */
  stringifyQuery?: (query: RouteQuery) => string
  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior
  /** 路径匹配是否大小写敏感 */
  sensitive?: boolean
  /** 路径匹配是否严格模式 */
  strict?: boolean
}

/**
 * 路由器接口
 */
export interface Router {
  /** 当前路由 */
  readonly currentRoute: Ref<RouteLocationNormalized>
  /** 路由选项 */
  readonly options: RouterOptions

  /** 添加路由 */
  addRoute: ((route: RouteRecordRaw) => () => void) &
  ((parentName: string | symbol, route: RouteRecordRaw) => () => void)

  /** 移除路由 */
  removeRoute: (name: string | symbol) => void

  /** 获取所有路由记录 */
  getRoutes: () => RouteRecordNormalized[]

  /** 检查路由是否存在 */
  hasRoute: (name: string | symbol) => boolean

  /** 解析路由位置 */
  resolve: (
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalized
  ) => RouteLocationNormalized

  /** 导航到指定位置 */
  push: (to: RouteLocationRaw) => Promise<NavigationFailure | void | undefined>

  /** 替换当前位置 */
  replace: (
    to: RouteLocationRaw
  ) => Promise<NavigationFailure | void | undefined>

  /** 历史导航 */
  go: (delta: number) => void
  back: () => void
  forward: () => void

  /** 全局前置守卫 */
  beforeEach: (guard: NavigationGuard) => () => void

  /** 全局解析守卫 */
  beforeResolve: (guard: NavigationGuard) => () => void

  /** 全局后置钩子 */
  afterEach: (hook: NavigationHookAfter) => () => void

  /** 导航错误处理 */
  onError: (handler: (error: Error) => void) => () => void

  /** 准备就绪 */
  isReady: () => Promise<void>

  /** 安装到 Vue 应用 */
  install: (app: any) => void
}

// ==================== 组合式 API 类型 ====================

/**
 * useRoute 返回类型
 */
export interface UseRouteReturn extends ComputedRef<RouteLocationNormalized> { }

/**
 * useRouter 返回类型
 */
export interface UseRouterReturn extends Router { }

// ==================== 设备适配类型 ====================

/**
 * 设备路由配置
 */
export interface DeviceRouteConfig {
  /** 默认支持的设备类型 */
  defaultSupportedDevices?: DeviceType[]
  /** 设备不支持时的默认提示信息 */
  defaultUnsupportedMessage?: string
  /** 设备不支持时的默认重定向路由 */
  defaultUnsupportedRedirect?: string
  /** 是否启用设备检测 */
  enableDeviceDetection?: boolean
  /** 是否启用设备访问控制 */
  enableDeviceGuard?: boolean

}

/**
 * 设备组件解析结果
 */
export interface DeviceComponentResolution {
  /** 解析到的组件 */
  component: RouteComponent
  /** 使用的设备类型 */
  deviceType: DeviceType
  /** 是否为回退组件 */
  isFallback: boolean
  /** 解析来源 */
  source: 'deviceComponents' | 'component'
}

/**
 * 设备组件选项
 */
export interface UseDeviceComponentOptions {
  /** 视图名称 */
  viewName?: string
  /** 是否启用自动解析 */
  autoResolve?: boolean
  /** 回退组件 */
  fallbackComponent?: RouteComponent
}

/**
 * 设备组件返回值
 */
export interface UseDeviceComponentReturn {
  /** 当前解析的组件 */
  resolvedComponent: ComputedRef<RouteComponent | null>
  /** 组件解析结果 */
  resolution: ComputedRef<DeviceComponentResolution | null>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 手动解析组件 */
  resolveComponent: () => Promise<RouteComponent | null>
  /** 检查是否有设备特定组件 */
  hasDeviceComponent: (device: DeviceType) => boolean
  /** 获取设备特定组件 */
  getDeviceComponent: (device: DeviceType) => RouteComponent | null
}

/**
 * 设备路由守卫选项
 */
export interface DeviceGuardOptions {
  /** 支持的设备类型检查函数 */
  checkSupportedDevices?: (
    supportedDevices: DeviceType[],
    currentDevice: DeviceType,
    route: RouteLocationNormalized
  ) => boolean
  /** 不支持设备时的处理函数 */
  onUnsupportedDevice?: (
    currentDevice: DeviceType,
    route: RouteLocationNormalized
  ) => RouteLocationRaw | void
}

/**
 * 设备路由插件选项
 */
export interface DeviceRouterPluginOptions extends DeviceRouteConfig {
  /** 设备路由守卫选项 */
  guardOptions?: DeviceGuardOptions
}
