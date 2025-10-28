/**
 * @ldesign/router-core 基础类型定义
 *
 * 定义框架无关的路由基础类型
 * 
 * @module types/base
 */

// ==================== 基础类型 ====================

/**
 * 路由参数类型
 * 
 * 存储动态路由参数的键值对
 * 参数值可以是单个字符串或字符串数组（多值参数）
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
 * 存储 URL 查询字符串的键值对
 * 参数值可以是字符串、字符串数组、null 或 undefined
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
 * ```
 */
export type RouteQuery = Record<string, string | string[] | null | undefined>

/**
 * 路由元信息类型
 * 
 * 存储路由的元数据，可以在路由配置中自定义任何字段
 * 
 * @example
 * ```ts
 * const meta: RouteMeta = {
 *   title: '用户详情',
 *   requiresAuth: true,
 *   roles: ['admin', 'user'],
 *   icon: 'user',
 *   keepAlive: true
 * }
 * ```
 */
export interface RouteMeta {
  /** 页面标题 */
  title?: string

  /** 是否需要身份验证 */
  requiresAuth?: boolean

  /** 需要的角色权限 */
  roles?: string[]

  /** 图标名称 */
  icon?: string

  /** 是否缓存组件 */
  keepAlive?: boolean

  /** 是否在菜单中隐藏 */
  hidden?: boolean

  /** 支持的设备类型 */
  supportedDevices?: string[]

  /** 不支持设备的提示信息 */
  unsupportedMessage?: string

  /** 不支持设备时的重定向路径 */
  unsupportedRedirect?: string

  /** 过渡动画名称 */
  transition?: string

  /** 自定义扩展字段 */
  [key: string]: unknown
}

// ==================== 类型推导工具 ====================

/**
 * 从路径字符串中提取参数类型
 * 
 * 自动从路径模式中提取参数名称和类型
 * 支持必需参数和可选参数的推导
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
 */
export type RouteParamsFor<T extends string> = ExtractRouteParams<T>

/**
 * 类型安全的路由参数
 */
export type TypedRouteParams<
  T extends Record<string, any> = Record<string, any>,
> = {
    [K in keyof T]: T[K] extends string ? string : string | string[]
  }

/**
 * 类型安全的查询参数
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

