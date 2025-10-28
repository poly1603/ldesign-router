/**
 * @ldesign/router-react Hooks
 * 
 * @module hooks
 */

import { useMemo } from 'react'
import {
  useNavigate as reactUseNavigate,
  useLocation as reactUseLocation,
  useParams as reactUseParams,
} from 'react-router-dom'
import type { RouteParams, RouteQuery, RouteMeta, RouteLocationRaw } from '@ldesign/router-core'
import { parseQuery } from '@ldesign/router-core'

// ==================== 类型定义 ====================

export interface UseRouterReturn {
  push: (to: RouteLocationRaw) => void
  replace: (to: RouteLocationRaw) => void
  go: (delta: number) => void
  back: () => void
  forward: () => void
}

export interface UseRouteReturn {
  path: string
  params: RouteParams
  query: RouteQuery
  hash: string
  meta: RouteMeta
  fullPath: string
}

export type UseNavigateReturn = (to: RouteLocationRaw) => void

// ==================== Hooks ====================

/**
 * 获取路由器实例
 * 
 * @returns 路由器实例
 */
export function useRouter(): UseRouterReturn {
  const navigate = reactUseNavigate()

  return useMemo(() => ({
    push: (to: RouteLocationRaw) => {
      const path = typeof to === 'string' ? to : to.path || '/'
      navigate(path)
    },

    replace: (to: RouteLocationRaw) => {
      const path = typeof to === 'string' ? to : to.path || '/'
      navigate(path, { replace: true })
    },

    go: (delta: number) => {
      navigate(delta)
    },

    back: () => {
      navigate(-1)
    },

    forward: () => {
      navigate(1)
    },
  }), [navigate])
}

/**
 * 获取当前路由信息
 * 
 * @returns 当前路由
 */
export function useRoute(): UseRouteReturn {
  const location = reactUseLocation()
  const params = reactUseParams()

  return useMemo(() => {
    const queryString = location.search.slice(1)
    const query = parseQuery(queryString)
    const hash = location.hash.slice(1)

    return {
      path: location.pathname,
      params: params as RouteParams,
      query,
      hash,
      meta: (location.state as any)?.meta || {},
      fullPath: location.pathname + location.search + location.hash,
    }
  }, [location, params])
}

/**
 * 获取导航函数
 * 
 * @returns 导航函数
 */
export function useNavigate(): UseNavigateReturn {
  const navigate = reactUseNavigate()

  return useMemo(() => (to: RouteLocationRaw) => {
    const path = typeof to === 'string' ? to : to.path || '/'
    navigate(path)
  }, [navigate])
}

/**
 * 获取路由参数
 * 
 * @returns 路由参数
 */
export function useParams(): RouteParams {
  const params = reactUseParams()
  return params as RouteParams
}

/**
 * 获取查询参数
 * 
 * @returns 查询参数
 */
export function useQuery(): RouteQuery {
  const location = reactUseLocation()

  return useMemo(() => {
    const queryString = location.search.slice(1)
    return parseQuery(queryString)
  }, [location.search])
}

/**
 * 获取哈希值
 * 
 * @returns 哈希值
 */
export function useHash(): string {
  const location = reactUseLocation()
  return useMemo(() => location.hash.slice(1), [location.hash])
}

/**
 * 获取路由元信息
 * 
 * @returns 路由元信息
 */
export function useMeta(): RouteMeta {
  const location = reactUseLocation()
  return useMemo(() => (location.state as any)?.meta || {}, [location.state])
}

/**
 * 获取当前位置
 * 
 * @returns 当前位置对象
 */
export function useLocation() {
  return reactUseLocation()
}

/**
 * 检查路由是否匹配
 * 
 * @param path - 路径模式
 * @returns 是否匹配
 */
export function useRouteMatch(path: string): boolean {
  const location = reactUseLocation()
  return useMemo(
    () => location.pathname === path || location.pathname.startsWith(path),
    [location.pathname, path]
  )
}

/**
 * 获取完整路径
 * 
 * @returns 完整路径
 */
export function useFullPath(): string {
  const location = reactUseLocation()
  return useMemo(
    () => location.pathname + location.search + location.hash,
    [location]
  )
}

