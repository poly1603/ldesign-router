/**
 * @ldesign/router-solid Hooks
 * 
 * 提供路由相关的 Solid.js hooks
 * 
 * @module hooks
 */

import { createMemo } from 'solid-js'
import { useNavigate, useLocation, useParams as solidUseParams } from '@solidjs/router'
import type { Accessor } from 'solid-js'
import type { RouteParams, RouteQuery, RouteMeta, RouteLocationRaw } from '@ldesign/router-core'
import { parseQuery } from '@ldesign/router-core'
import { useRouterContext } from '../router'
import type { Router } from '../router'

// ==================== 类型定义 ====================

export interface UseRouterReturn {
  push: (to: RouteLocationRaw) => Promise<void>
  replace: (to: RouteLocationRaw) => Promise<void>
  go: (delta: number) => void
  back: () => void
  forward: () => void
}

export interface UseRouteReturn {
  path: Accessor<string>
  params: Accessor<RouteParams>
  query: Accessor<RouteQuery>
  hash: Accessor<string>
  meta: Accessor<RouteMeta>
  fullPath: Accessor<string>
}

export type UseNavigateReturn = (to: RouteLocationRaw) => void

// ==================== Hooks ====================

/**
 * 获取路由器实例
 * 
 * @returns 路由器方法集合
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const router = useRouter()
 *   
 *   const goToAbout = () => {
 *     router.push('/about')
 *   }
 *   
 *   return <button onClick={goToAbout}>Go to About</button>
 * }
 * ```
 */
export function useRouter(): UseRouterReturn {
  const router = useRouterContext()
  const navigate = useNavigate()

  // 设置 navigate 函数
  if ((router as any)._setNavigate) {
    (router as any)._setNavigate(navigate)
  }

  return {
    push: (to: RouteLocationRaw) => router.push(to),
    replace: (to: RouteLocationRaw) => router.replace(to),
    go: (delta: number) => router.go(delta),
    back: () => router.back(),
    forward: () => router.forward(),
  }
}

/**
 * 获取当前路由信息
 * 
 * @returns 当前路由信息（响应式）
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const route = useRoute()
 *   
 *   return (
 *     <div>
 *       <p>Path: {route.path()}</p>
 *       <p>Full Path: {route.fullPath()}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useRoute(): UseRouteReturn {
  const location = useLocation()
  const params = solidUseParams()

  const path = createMemo(() => location.pathname)
  const query = createMemo(() => parseQuery(location.search.slice(1)))
  const hash = createMemo(() => location.hash.slice(1))
  const meta = createMemo(() => (location.state as any)?.meta || {})
  const fullPath = createMemo(() => location.pathname + location.search + location.hash)
  const routeParams = createMemo(() => params as RouteParams)

  return {
    path,
    params: routeParams,
    query,
    hash,
    meta,
    fullPath,
  }
}

/**
 * 获取导航函数
 * 
 * @returns 导航函数
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const navigate = useNavigate()
 *   
 *   const goToAbout = () => {
 *     navigate('/about')
 *   }
 *   
 *   return <button onClick={goToAbout}>Go to About</button>
 * }
 * ```
 */
export function useNavigateHook(): UseNavigateReturn {
  const router = useRouterContext()
  return (to: RouteLocationRaw) => {
    router.push(to)
  }
}

/**
 * 获取路由参数
 * 
 * @returns 路由参数（响应式）
 * 
 * @example
 * ```tsx
 * function UserPage() {
 *   const params = useParams()
 *   
 *   return <p>User ID: {params().id}</p>
 * }
 * ```
 */
export function useParams(): Accessor<RouteParams> {
  const params = solidUseParams()
  return createMemo(() => params as RouteParams)
}

/**
 * 获取查询参数
 * 
 * @returns 查询参数（响应式）
 * 
 * @example
 * ```tsx
 * function SearchPage() {
 *   const query = useQuery()
 *   
 *   return <p>Search: {query().q}</p>
 * }
 * ```
 */
export function useQuery(): Accessor<RouteQuery> {
  const location = useLocation()
  return createMemo(() => parseQuery(location.search.slice(1)))
}

/**
 * 获取哈希值
 * 
 * @returns 哈希值（响应式）
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hash = useHash()
 *   
 *   return <p>Hash: {hash()}</p>
 * }
 * ```
 */
export function useHash(): Accessor<string> {
  const location = useLocation()
  return createMemo(() => location.hash.slice(1))
}

/**
 * 获取路由元信息
 * 
 * @returns 路由元信息（响应式）
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const meta = useMeta()
 *   
 *   return <h1>{meta().title || 'Default Title'}</h1>
 * }
 * ```
 */
export function useMeta(): Accessor<RouteMeta> {
  const location = useLocation()
  return createMemo(() => (location.state as any)?.meta || {})
}

/**
 * 获取当前位置
 * 
 * @returns 当前位置对象
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const location = useLocation()
 *   
 *   return <p>Pathname: {location.pathname}</p>
 * }
 * ```
 */
export { useLocation }

/**
 * 检查路由是否匹配
 * 
 * @param path - 路径模式
 * @returns 是否匹配（响应式）
 * 
 * @example
 * ```tsx
 * function NavItem() {
 *   const isActive = useRouteMatch('/about')
 *   
 *   return (
 *     <a class={isActive() ? 'active' : ''}>About</a>
 *   )
 * }
 * ```
 */
export function useRouteMatch(path: string): Accessor<boolean> {
  const location = useLocation()
  return createMemo(() =>
    location.pathname === path || location.pathname.startsWith(path)
  )
}

/**
 * 获取完整路径
 * 
 * @returns 完整路径（响应式）
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const fullPath = useFullPath()
 *   
 *   return <p>Full Path: {fullPath()}</p>
 * }
 * ```
 */
export function useFullPath(): Accessor<string> {
  const location = useLocation()
  return createMemo(() =>
    location.pathname + location.search + location.hash
  )
}


