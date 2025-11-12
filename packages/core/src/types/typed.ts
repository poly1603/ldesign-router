/**
 * @ldesign/router-core 类型安全系统
 * 
 * @description
 * 提供强类型的路由定义和类型推导。
 * 
 * **特性**：
 * - 严格类型检查
 * - 路由参数类型推导
 * - 命名路由类型安全
 * - 元数据类型定义
 * - 守卫类型增强
 * 
 * @module types/typed
 */

import type {
  RouteRecordRaw,
  RouteLocationRaw,
  RouteParams,
  RouteMeta,
  NavigationGuard,
} from './base'

/**
 * 提取路径参数类型
 */
export type ExtractRouteParamsFromPath<T extends string> = 
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParamsFromPath<Rest>]: string }
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>

/**
 * 严格类型的路由定义
 */
export interface TypedRouteRecordRaw<
  TPath extends string = string,
  TName extends string | symbol = string | symbol,
  TMeta extends RouteMeta = RouteMeta,
  TParams extends RouteParams = ExtractRouteParamsFromPath<TPath>
> extends Omit<RouteRecordRaw, 'path' | 'name' | 'meta' | 'params'> {
  /** 路径(带类型推导) */
  path: TPath
  
  /** 名称(带类型) */
  name?: TName
  
  /** 元数据(带类型) */
  meta?: TMeta
  
  /** 参数(类型推导) */
  params?: TParams
}

/**
 * 严格类型的路由位置
 */
export interface TypedRouteLocation<
  TName extends string | symbol = string | symbol,
  TParams extends RouteParams = RouteParams,
  TQuery extends Record<string, any> = Record<string, any>
> {
  /** 路由名称 */
  name: TName
  
  /** 路由参数 */
  params?: TParams
  
  /** 查询参数 */
  query?: TQuery
  
  /** 哈希 */
  hash?: string
}

/**
 * 路由元数据扩展
 */
export interface ExtendedRouteMeta extends RouteMeta {
  /** 页面标题 */
  title?: string
  
  /** 图标 */
  icon?: string
  
  /** 是否需要认证 */
  requiresAuth?: boolean
  
  /** 所需角色 */
  roles?: string[]
  
  /** 所需权限 */
  permissions?: string[]
  
  /** 是否隐藏 */
  hidden?: boolean
  
  /** 排序 */
  order?: number
  
  /** 面包屑 */
  breadcrumb?: boolean | string[]
  
  /** 是否缓存 */
  keepAlive?: boolean
  
  /** 布局 */
  layout?: string
  
  /** 过渡效果 */
  transition?: string
  
  /** 自定义数据 */
  [key: string]: any
}

/**
 * 类型安全的路由配置构建器
 */
export type RouteConfigBuilder<T extends Record<string, any>> = {
  [K in keyof T]: {
    path: K
    params: T[K] extends { params: infer P } ? P : Record<string, never>
    query: T[K] extends { query: infer Q } ? Q : Record<string, any>
    meta: T[K] extends { meta: infer M } ? M : ExtendedRouteMeta
  }
}

/**
 * 命名路由映射
 */
export type NamedRoutes<T extends Record<string | symbol, any>> = {
  [K in keyof T]: TypedRouteLocation<
    K,
    T[K] extends { params: infer P } ? P : Record<string, never>,
    T[K] extends { query: infer Q } ? Q : Record<string, any>
  >
}

/**
 * 类型安全的导航守卫
 */
export type TypedNavigationGuard<
  TFrom extends RouteLocationRaw = RouteLocationRaw,
  TTo extends RouteLocationRaw = RouteLocationRaw,
  TMeta extends RouteMeta = RouteMeta
> = (
  to: TTo & { meta: TMeta },
  from: TFrom & { meta: TMeta },
  next: NavigationGuard
) => void | Promise<void>

/**
 * 路由组定义
 */
export interface RouteGroup<
  TPrefix extends string = string,
  TMeta extends RouteMeta = RouteMeta
> {
  /** 路径前缀 */
  prefix: TPrefix
  
  /** 共享元数据 */
  meta?: TMeta
  
  /** 子路由 */
  routes: Array<TypedRouteRecordRaw<string, any, TMeta>>
  
  /** 守卫 */
  guards?: TypedNavigationGuard<any, any, TMeta>[]
}

/**
 * 路由模块定义
 */
export interface RouteModule<
  TName extends string = string,
  TMeta extends RouteMeta = RouteMeta
> {
  /** 模块名称 */
  name: TName
  
  /** 路由列表 */
  routes: Array<TypedRouteRecordRaw<string, any, TMeta>>
  
  /** 模块级守卫 */
  guards?: TypedNavigationGuard<any, any, TMeta>[]
  
  /** 模块元数据 */
  meta?: TMeta
}

// ==================== 类型工具 ====================

/**
 * 合并路由类型
 */
export type MergeRouteTypes<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U 
    ? U[K] 
    : K extends keyof T 
    ? T[K] 
    : never
}

/**
 * 路由参数类型提取
 */
export type RouteParamsType<T> = T extends { params: infer P } ? P : never

/**
 * 路由查询类型提取
 */
export type RouteQueryType<T> = T extends { query: infer Q } ? Q : never

/**
 * 路由元数据类型提取
 */
export type RouteMetaType<T> = T extends { meta: infer M } ? M : never

/**
 * 可选参数路由
 */
export type OptionalParamRoute<T extends TypedRouteLocation> = Omit<T, 'params'> & {
  params?: Partial<T['params']>
}

/**
 * 必需参数路由
 */
export type RequiredParamRoute<T extends TypedRouteLocation> = T & {
  params: Required<T['params']>
}

// ==================== 类型守卫 ====================

/**
 * 检查是否为类型化路由
 */
export function isTypedRoute<T extends TypedRouteLocation>(
  route: any,
): route is T {
  return (
    route &&
    typeof route === 'object' &&
    'name' in route
  )
}

/**
 * 检查是否为命名路由
 */
export function isNamedRoute(
  route: RouteLocationRaw,
): route is { name: string | symbol } {
  return (
    typeof route === 'object' &&
    route !== null &&
    'name' in route
  )
}

/**
 * 检查是否为路径路由
 */
export function isPathRoute(
  route: RouteLocationRaw,
): route is { path: string } {
  return (
    typeof route === 'object' &&
    route !== null &&
    'path' in route &&
    typeof route.path === 'string'
  )
}

// ==================== 类型辅助函数 ====================

/**
 * 创建类型安全的路由
 */
export function createTypedRoute<
  TName extends string | symbol,
  TParams extends RouteParams = Record<string, never>,
  TQuery extends Record<string, any> = Record<string, any>
>(
  name: TName,
  params?: TParams,
  query?: TQuery,
): TypedRouteLocation<TName, TParams, TQuery> {
  return {
    name,
    params,
    query,
  }
}

/**
 * 创建类型安全的路由记录
 */
export function defineRoute<
  TPath extends string,
  TName extends string | symbol = string,
  TMeta extends RouteMeta = RouteMeta
>(
  config: TypedRouteRecordRaw<TPath, TName, TMeta>,
): TypedRouteRecordRaw<TPath, TName, TMeta> {
  return config
}

/**
 * 创建路由组
 */
export function defineRouteGroup<
  TPrefix extends string,
  TMeta extends RouteMeta = RouteMeta
>(
  config: RouteGroup<TPrefix, TMeta>,
): RouteGroup<TPrefix, TMeta> {
  return config
}

/**
 * 创建路由模块
 */
export function defineRouteModule<
  TName extends string,
  TMeta extends RouteMeta = RouteMeta
>(
  config: RouteModule<TName, TMeta>,
): RouteModule<TName, TMeta> {
  return config
}

/**
 * 合并路由元数据
 */
export function mergeRouteMeta<
  T extends RouteMeta,
  U extends RouteMeta
>(
  base: T,
  override: U,
): MergeRouteTypes<T, U> {
  return { ...base, ...override } as MergeRouteTypes<T, U>
}

// ==================== 类型推导示例 ====================

/**
 * 使用示例:
 * 
 * ```typescript
 * // 定义路由
 * const userRoute = defineRoute({
 *   path: '/user/:id',
 *   name: 'user',
 *   component: UserComponent,
 *   meta: {
 *     title: 'User',
 *     requiresAuth: true,
 *   },
 * })
 * 
 * // 类型安全的导航
 * const location = createTypedRoute(
 *   'user',
 *   { id: '123' }, // 类型检查
 *   { tab: 'profile' }
 * )
 * 
 * // 路由组
 * const adminRoutes = defineRouteGroup({
 *   prefix: '/admin',
 *   meta: {
 *     requiresAuth: true,
 *     roles: ['admin'],
 *   },
 *   routes: [
 *     defineRoute({ path: 'users', name: 'admin-users' }),
 *     defineRoute({ path: 'settings', name: 'admin-settings' }),
 *   ],
 * })
 * 
 * // 路由模块
 * const authModule = defineRouteModule({
 *   name: 'auth',
 *   routes: [
 *     defineRoute({ path: '/login', name: 'login' }),
 *     defineRoute({ path: '/register', name: 'register' }),
 *   ],
 * })
 * ```
 */
