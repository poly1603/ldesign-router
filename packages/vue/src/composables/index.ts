/**
 * @ldesign/router-vue Composables
 * 
 * @module composables
 */

import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useRoute as vueUseRoute, onBeforeRouteLeave as vueOnBeforeRouteLeave, onBeforeRouteUpdate as vueOnBeforeRouteUpdate } from 'vue-router'
import type { RouteRecordName } from 'vue-router'
import type {
  RouteParams,
  RouteQuery,
  RouteMeta,
  NavigationGuard,
} from '../types'

// ==================== Composables ====================

/**
 * 获取路由参数
 * 
 * @returns 路由参数的响应式引用
 */
export function useParams(): ComputedRef<RouteParams> {
  const route = vueUseRoute()
  return computed(() => route.params as RouteParams)
}

/**
 * 获取查询参数
 * 
 * @returns 查询参数的响应式引用
 */
export function useQuery(): ComputedRef<RouteQuery> {
  const route = vueUseRoute()
  return computed(() => route.query as RouteQuery)
}

/**
 * 获取哈希值
 * 
 * @returns 哈希值的响应式引用
 */
export function useHash(): ComputedRef<string> {
  const route = vueUseRoute()
  return computed(() => route.hash)
}

/**
 * 获取路由元信息
 * 
 * @returns 路由元信息的响应式引用
 */
export function useMeta(): ComputedRef<RouteMeta> {
  const route = vueUseRoute()
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
  const route = vueUseRoute()
  return computed(() => route.path === path || route.path.startsWith(path))
}

/**
 * 获取完整路径
 * 
 * @returns 完整路径的响应式引用
 */
export function useFullPath(): ComputedRef<string> {
  const route = vueUseRoute()
  return computed(() => route.fullPath)
}

/**
 * 获取路由名称
 * 
 * @returns 路由名称的响应式引用
 */
export function useRouteName(): ComputedRef<RouteRecordName | undefined> {
  const route = vueUseRoute()
  return computed(() => (route.name ?? undefined) as RouteRecordName | undefined)
}

/**
 * 类型安全的路由参数钩子
 * 
 * @template T - 参数类型
 * @returns 类型安全的路由参数的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * interface UserParams {
 *   id: string
 *   tab?: string
 * }
 * 
 * const params = useTypedParams<UserParams>()
 * // params.value.id 自动推断为 string
 * // params.value.tab 自动推断为 string | undefined
 * </script>
 * ```
 */
export function useTypedParams<T extends RouteParams = RouteParams>(): ComputedRef<T> {
  const route = vueUseRoute()
  return computed(() => route.params as T)
}

/**
 * 类型安全的查询参数钩子
 * 
 * @template T - 查询参数类型
 * @returns 类型安全的查询参数的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * interface SearchQuery {
 *   keyword?: string
 *   page?: string
 *   sort?: 'asc' | 'desc'
 * }
 * 
 * const query = useTypedQuery<SearchQuery>()
 * // query.value.keyword 自动推断为 string | string[] | undefined
 * // query.value.sort 自动推断为 'asc' | 'desc' | undefined
 * </script>
 * ```
 */
export function useTypedQuery<T extends RouteQuery = RouteQuery>(): ComputedRef<T> {
  const route = vueUseRoute()
  return computed(() => route.query as T)
}

/**
 * 类型安全的路由元信息钩子
 * 
 * @template T - 元信息类型
 * @returns 类型安全的路由元信息的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * interface PageMeta {
 *   title: string
 *   requiresAuth: boolean
 *   roles?: string[]
 * }
 * 
 * const meta = useTypedMeta<PageMeta>()
 * // meta.value.title 自动推断为 string
 * // meta.value.requiresAuth 自动推断为 boolean
 * </script>
 * ```
 */
export function useTypedMeta<T extends RouteMeta = RouteMeta>(): ComputedRef<T> {
  const route = vueUseRoute()
  return computed(() => route.meta as T)
}

// ==================== 增强 Composables ====================

/**
 * 获取导航状态
 * 
 * @returns 导航状态的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const navigationState = useNavigationState()
 * 
 * watchEffect(() => {
 *   if (navigationState.value.isNavigating) {
 *     console.log('正在导航...')
 *   }
 * })
 * </script>
 * ```
 */
export function useNavigationState() {
  const route = vueUseRoute()
  // 注释掉未使用的 router
  // const router = vueUseRouter()
  
  return computed(() => ({
    currentPath: route.path,
    currentName: route.name,
    isNavigating: false, // 这个需要在 router 中维护状态
    canGoBack: typeof window !== 'undefined' && window.history.length > 1,
    canGoForward: false, // 浏览器不直接暴露这个信息
  }))
}

/**
 * 面包屑导航
 * 
 * @returns 面包屑数据的响应式引用
 * 
 * @example
 * ```vue
 * <template>
 *   <nav>
 *     <router-link
 *       v-for="(item, index) in breadcrumbs"
 *       :key="index"
 *       :to="item.path"
 *     >
 *       {{ item.title }}
 *     </router-link>
 *   </nav>
 * </template>
 * 
 * <script setup lang="ts">
 * const breadcrumbs = useBreadcrumb()
 * </script>
 * ```
 */
export function useBreadcrumb() {
  const route = vueUseRoute()
  
  return computed(() => {
    const matched = route.matched
    const breadcrumbs = matched
      .filter(record => record.meta && record.meta.breadcrumb !== false)
      .map(record => ({
        path: record.path,
        name: record.name,
        title: (record.meta?.title as string) || record.name || record.path,
        meta: record.meta,
      }))
    
    return breadcrumbs
  })
}

/**
 * 路由是否活跃
 * 
 * @param name - 路由名称
 * @param exact - 是否精确匹配
 * @returns 是否活跃的响应式引用
 * 
 * @example
 * ```vue
 * <template>
 *   <div :class="{ active: isActive }">
 *     User Profile
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * const isActive = useRouteActive('UserProfile')
 * </script>
 * ```
 */
export function useRouteActive(name: string, exact = false): ComputedRef<boolean> {
  const route = vueUseRoute()
  
  return computed(() => {
    if (exact) {
      return route.name === name
    }
    
    // 检查当前路由及其父级路由
    return route.matched.some(record => record.name === name)
  })
}

/**
 * 路由路径是否活跃
 * 
 * @param path - 路由路径
 * @param exact - 是否精确匹配
 * @returns 是否活跃的响应式引用
 * 
 * @example
 * ```vue
 * <template>
 *   <div :class="{ active: isActive }">
 *     Dashboard
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * const isActive = usePathActive('/dashboard')
 * </script>
 * ```
 */
export function usePathActive(path: string, exact = false): ComputedRef<boolean> {
  const route = vueUseRoute()
  
  return computed(() => {
    if (exact) {
      return route.path === path
    }
    
    return route.path.startsWith(path)
  })
}

/**
 * 查询参数是否包含指定键
 * 
 * @param key - 查询参数键
 * @returns 是否包含的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const hasTab = useHasQueryParam('tab')
 * // URL: /page?tab=profile => hasTab.value === true
 * </script>
 * ```
 */
export function useHasQueryParam(key: string): ComputedRef<boolean> {
  const route = vueUseRoute()
  return computed(() => key in route.query)
}

/**
 * 获取单个查询参数的值
 * 
 * @param key - 查询参数键
 * @param defaultValue - 默认值
 * @returns 查询参数值的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const page = useQueryParam('page', '1')
 * const sort = useQueryParam('sort', 'asc')
 * </script>
 * ```
 */
export function useQueryParam(key: string, defaultValue = ''): ComputedRef<string> {
  const route = vueUseRoute()
  return computed(() => {
    const value = route.query[key]
    if (Array.isArray(value)) {
      return value[0] || defaultValue
    }
    return (value as string) || defaultValue
  })
}

/**
 * 获取单个路由参数的值
 * 
 * @param key - 路由参数键
 * @param defaultValue - 默认值
 * @returns 路由参数值的响应式引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const userId = useParam('id', '')
 * // Route: /user/:id => userId.value === '123' for /user/123
 * </script>
 * ```
 */
export function useParam(key: string, defaultValue = ''): ComputedRef<string> {
  const route = vueUseRoute()
  return computed(() => {
    const value = route.params[key]
    if (Array.isArray(value)) {
      return value[0] || defaultValue
    }
    return (value as string) || defaultValue
  })
}

