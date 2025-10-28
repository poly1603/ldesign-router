/**
 * @ldesign/router-svelte Stores
 * 
 * 提供响应式的路由状态 stores
 * 
 * @module stores
 */

import { getContext } from 'svelte'
import type { Readable } from 'svelte/store'
import type { RouteParams, RouteQuery, RouteMeta } from '@ldesign/router-core'
import type { Router, CurrentRoute } from '../router'
import { ROUTER_KEY } from '../router'

// ==================== 类型定义 ====================

export type RouteStore = Readable<CurrentRoute>
export type ParamsStore = Readable<RouteParams>
export type QueryStore = Readable<RouteQuery>
export type HashStore = Readable<string>
export type MetaStore = Readable<RouteMeta>

// ==================== 获取路由器 ====================

/**
 * 获取路由器实例
 * 
 * 必须在 Router 组件内部调用
 * 
 * @returns 路由器实例
 */
export function getRouter(): Router {
  const router = getContext<Router>(ROUTER_KEY)
  if (!router) {
    throw new Error('Router not found. Make sure to wrap your app with <Router>')
  }
  return router
}

// ==================== Store Getters ====================

/**
 * 获取当前路由 store
 * 
 * @returns 当前路由的响应式 store
 * 
 * @example
 * ```svelte
 * <script>
 *   import { route } from '@ldesign/router-svelte'
 * </script>
 * 
 * <p>Current path: {$route.path}</p>
 * ```
 */
export function route(): RouteStore {
  return getRouter().currentRoute
}

/**
 * 获取路由参数 store
 * 
 * @returns 路由参数的响应式 store
 * 
 * @example
 * ```svelte
 * <script>
 *   import { params } from '@ldesign/router-svelte'
 * </script>
 * 
 * <p>User ID: {$params.id}</p>
 * ```
 */
export function params(): ParamsStore {
  return getRouter().params
}

/**
 * 获取查询参数 store
 * 
 * @returns 查询参数的响应式 store
 * 
 * @example
 * ```svelte
 * <script>
 *   import { query } from '@ldesign/router-svelte'
 * </script>
 * 
 * <p>Page: {$query.page}</p>
 * ```
 */
export function query(): QueryStore {
  return getRouter().query
}

/**
 * 获取哈希值 store
 * 
 * @returns 哈希值的响应式 store
 * 
 * @example
 * ```svelte
 * <script>
 *   import { hash } from '@ldesign/router-svelte'
 * </script>
 * 
 * <p>Hash: {$hash}</p>
 * ```
 */
export function hash(): HashStore {
  return getRouter().hash
}

/**
 * 获取路由元信息 store
 * 
 * @returns 路由元信息的响应式 store
 * 
 * @example
 * ```svelte
 * <script>
 *   import { meta } from '@ldesign/router-svelte'
 * </script>
 * 
 * <h1>{$meta.title}</h1>
 * ```
 */
export function meta(): MetaStore {
  return getRouter().meta
}


