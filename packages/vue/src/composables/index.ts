/**
 * @ldesign/router-vue Composables
 * 
 * @module composables
 */

import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useRoute, onBeforeRouteLeave as vueOnBeforeRouteLeave, onBeforeRouteUpdate as vueOnBeforeRouteUpdate } from 'vue-router'
import type { RouteParams, RouteQuery, RouteMeta, NavigationGuard } from '@ldesign/router-core'

// ==================== 类型定义 ====================

export type UseRouteReturn = ReturnType<typeof useRoute>
export type UseRouterReturn = any // 从 router/index.ts 导入

// ==================== Composables ====================

/**
 * 获取路由参数
 * 
 * @returns 路由参数的响应式引用
 */
export function useParams(): ComputedRef<RouteParams> {
  const route = useRoute()
  return computed(() => route.params as RouteParams)
}

/**
 * 获取查询参数
 * 
 * @returns 查询参数的响应式引用
 */
export function useQuery(): ComputedRef<RouteQuery> {
  const route = useRoute()
  return computed(() => route.query as RouteQuery)
}

/**
 * 获取哈希值
 * 
 * @returns 哈希值的响应式引用
 */
export function useHash(): ComputedRef<string> {
  const route = useRoute()
  return computed(() => route.hash)
}

/**
 * 获取路由元信息
 * 
 * @returns 路由元信息的响应式引用
 */
export function useMeta(): ComputedRef<RouteMeta> {
  const route = useRoute()
  return computed(() => route.meta as RouteMeta)
}

/**
 * 路由离开守卫
 * 
 * @param guard - 守卫函数
 */
export function onBeforeRouteLeave(guard: NavigationGuard): void {
  vueOnBeforeRouteLeave(guard as any)
}

/**
 * 路由更新守卫
 * 
 * @param guard - 守卫函数
 */
export function onBeforeRouteUpdate(guard: NavigationGuard): void {
  vueOnBeforeRouteUpdate(guard as any)
}

/**
 * 检查路由是否匹配
 * 
 * @param path - 路径模式
 * @returns 是否匹配
 */
export function useRouteMatch(path: string): ComputedRef<boolean> {
  const route = useRoute()
  return computed(() => route.path === path || route.path.startsWith(path))
}

/**
 * 获取完整路径
 * 
 * @returns 完整路径的响应式引用
 */
export function useFullPath(): ComputedRef<string> {
  const route = useRoute()
  return computed(() => route.fullPath)
}

/**
 * 获取路由名称
 * 
 * @returns 路由名称的响应式引用
 */
export function useRouteName(): ComputedRef<string | symbol | undefined> {
  const route = useRoute()
  return computed(() => route.name)
}

