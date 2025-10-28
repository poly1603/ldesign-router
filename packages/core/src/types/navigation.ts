/**
 * @ldesign/router-core 导航相关类型
 *
 * 定义框架无关的导航相关类型
 * 
 * @module types/navigation
 */

import type { RouteParams, RouteQuery, RouteMeta } from './base'
import type { HistoryLocation } from './history'

// ==================== 路由位置类型 ====================

/**
 * 路由位置基础类型
 */
export interface RouteLocationBase {
  /** 路径 */
  path: string

  /** 路由名称 */
  name?: string | symbol

  /** 路由参数 */
  params: RouteParams

  /** 查询参数 */
  query: RouteQuery

  /** 哈希 */
  hash: string

  /** 元信息 */
  meta: RouteMeta
}

/**
 * 规范化的路由位置
 */
export interface RouteLocationNormalized extends RouteLocationBase {
  /** 完整路径 */
  fullPath: string

  /** 匹配的路由记录 */
  matched: RouteRecordNormalized[]

  /** 重定向的来源路由 */
  redirectedFrom?: RouteLocationNormalized
}

/**
 * 原始路由位置（用于导航）
 */
export type RouteLocationRaw =
  | string
  | {
    path?: string
    name?: string | symbol
    params?: RouteParams
    query?: RouteQuery
    hash?: string
    replace?: boolean
  }

// ==================== 路由记录类型 ====================

/**
 * 路由记录基础类型
 */
export interface RouteRecordBase {
  /** 路径 */
  path: string

  /** 路由名称 */
  name?: string | symbol

  /** 元信息 */
  meta?: RouteMeta

  /** 别名 */
  alias?: string | string[]

  /** 重定向 */
  redirect?: RouteLocationRaw | ((to: RouteLocationNormalized) => RouteLocationRaw)

  /** 子路由 */
  children?: RouteRecordRaw[]
}

/**
 * 组件类型（框架无关）
 * 
 * @description 组件可以是任何框架的组件类型
 */
export type Component = unknown

/**
 * 原始路由记录（配置时使用）
 * 
 * @description 定义路由配置的原始格式，用于创建路由
 * 
 * @example
 * ```ts
 * const route: RouteRecordRaw = {
 *   path: '/user/:id',
 *   name: 'user-detail',
 *   component: UserDetail,
 *   meta: { requiresAuth: true },
 *   beforeEnter: (to, from, next) => {
 *     // 守卫逻辑
 *     next()
 *   }
 * }
 * ```
 */
export interface RouteRecordRaw extends RouteRecordBase {
  /** 单个组件（框架特定，在各框架包中实现） */
  component?: Component

  /** 命名组件（用于命名视图） */
  components?: Record<string, Component>

  /** 设备特定组件映射 */
  deviceComponents?: Record<string, Component>

  /** 组件 props 配置 */
  props?: boolean | Record<string, unknown> | ((route: RouteLocationNormalized) => Record<string, unknown>)

  /** 路由进入前守卫（单个或数组） */
  beforeEnter?: NavigationGuard | NavigationGuard[]

  /** 其他自定义字段 */
  [key: string]: unknown
}

/**
 * 规范化的路由记录
 * 
 * @description 路由记录在内部使用的规范化格式
 * 
 * @example
 * ```ts
 * const normalizedRoute: RouteRecordNormalized = {
 *   path: '/user/123',
 *   fullPath: '/user/123?tab=profile',
 *   name: 'user-detail',
 *   components: { default: UserDetail },
 *   children: [],
 *   meta: { requiresAuth: true },
 *   props: { default: true }
 * }
 * ```
 */
export interface RouteRecordNormalized extends RouteRecordBase {
  /** 命名组件映射表 */
  components: Record<string, Component>

  /** 子路由列表（规范化后） */
  children: RouteRecordNormalized[]

  /** 组件 props 配置 */
  props: Record<string, boolean | Record<string, unknown> | ((route: RouteLocationNormalized) => Record<string, unknown>)>

  /** 路由进入前守卫（单个） */
  beforeEnter?: NavigationGuard

  /** 别名路由指向的原始路由 */
  aliasOf?: RouteRecordNormalized

  /** 父路由记录 */
  parent?: RouteRecordNormalized
}

// ==================== 导航守卫类型 ====================

/**
 * 导航守卫下一步函数
 */
export interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean): void
  (cb: NavigationGuardNextCallback): void
}

/**
 * 导航守卫回调函数
 * 
 * @description 在组件实例创建后调用的回调函数
 * 
 * @param vm - 组件实例（框架特定）
 * @returns 可选的返回值
 */
export type NavigationGuardNextCallback = (vm: unknown) => unknown

/**
 * 导航守卫返回值
 */
export type NavigationGuardReturn =
  | void
  | Error
  | RouteLocationRaw
  | boolean

/**
 * 导航守卫函数
 */
export type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => NavigationGuardReturn | Promise<NavigationGuardReturn>

/**
 * 导航后置钩子
 */
export type NavigationHookAfter = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => void | Promise<void>

// ==================== 导航失败类型 ====================

/**
 * 导航失败类型枚举
 */
export enum NavigationFailureType {
  /** 导航被取消 */
  cancelled = 0,

  /** 导航被新的导航取代 */
  superseded = 1,

  /** 导航被守卫中断 */
  aborted = 2,

  /** 路由重复 */
  duplicated = 3
}

/**
 * 导航失败信息
 */
export interface NavigationFailure extends Error {
  /** 失败类型 */
  type: NavigationFailureType

  /** 目标路由 */
  to: RouteLocationNormalized

  /** 来源路由 */
  from: RouteLocationNormalized
}

// ==================== 滚动行为类型 ====================

/**
 * 滚动位置
 */
export interface ScrollPosition {
  left: number
  top: number
}

/**
 * 滚动位置（带选择器）
 */
export interface ScrollPositionElement extends ScrollPosition {
  /** CSS 选择器 */
  selector?: string

  /** 滚动行为 */
  behavior?: ScrollBehavior
}

/**
 * 滚动行为函数
 */
export type ScrollBehavior = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  savedPosition: ScrollPosition | null
) => ScrollPosition | ScrollPositionElement | false | void | Promise<ScrollPosition | ScrollPositionElement | false | void>

