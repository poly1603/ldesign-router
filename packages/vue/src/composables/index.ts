/**
 * @ldesign/router-vue Composables
 * 
 * @module composables
 */

import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useRoute as vueUseRoute, useRouter as vueUseRouter, onBeforeRouteLeave as vueOnBeforeRouteLeave, onBeforeRouteUpdate as vueOnBeforeRouteUpdate } from 'vue-router'
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
// ==================== 路由缓存 Composable ====================

import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 路由缓存配置
 */
export interface RouteCacheOptions<T = any> {
  /** 缓存键，默认使用当前路由路径 */
  key?: string
  /** 初始值 */
  initialValue?: T
  /** 是否在路由离开时保存 */
  saveOnLeave?: boolean
  /** 是否在组件卸载时清除 */
  clearOnUnmount?: boolean
  /** 缓存过期时间（毫秒），0 表示永不过期 */
  ttl?: number
}

interface CachedData<T> {
  value: T
  timestamp: number
}

const routeCache = new Map<string, CachedData<any>>()

/**
 * 路由状态缓存
 * 
 * 在路由切换时保持组件状态，支持自动保存和恢复
 * 
 * @template T - 缓存数据类型
 * @param options - 缓存配置
 * @returns 缓存的状态引用和控制方法
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * // 缓存表单数据
 * const { state: formData, save, clear } = useRouteCache({
 *   key: 'user-form',
 *   initialValue: { name: '', email: '' },
 *   saveOnLeave: true,
 *   ttl: 5 * 60 * 1000, // 5分钟过期
 * })
 * 
 * // 缓存列表滚动位置
 * const { state: scrollPos } = useRouteCache({
 *   initialValue: 0,
 *   saveOnLeave: true,
 * })
 * </script>
 * ```
 */
export function useRouteCache<T = any>(options: RouteCacheOptions<T> = {}) {
  const route = vueUseRoute()
  const {
    key = route.path,
    initialValue,
    saveOnLeave = false,
    clearOnUnmount = false,
    ttl = 0,
  } = options

  // 尝试从缓存中恢复
  const getCachedValue = (): T | undefined => {
    const cached = routeCache.get(key)
    if (!cached) return undefined

    // 检查是否过期
    if (ttl > 0 && Date.now() - cached.timestamp > ttl) {
      routeCache.delete(key)
      return undefined
    }

    return cached.value
  }

  const state = ref((getCachedValue() ?? initialValue) as T) as Ref<T>

  // 保存到缓存
  const save = () => {
    routeCache.set(key, {
      value: state.value,
      timestamp: Date.now(),
    })
  }

  // 清除缓存
  const clear = () => {
    routeCache.delete(key)
    if (initialValue !== undefined) {
      state.value = initialValue as T
    }
  }

  // 重置为初始值
  const reset = () => {
    if (initialValue !== undefined) {
      state.value = initialValue as T
    }
    save()
  }

  // 自动保存
  if (saveOnLeave) {
    onBeforeRouteLeave(() => {
      save()
    })
  }

  // 组件卸载时清除
  if (clearOnUnmount) {
    onUnmounted(() => {
      clear()
    })
  }

  return {
    state,
    save,
    clear,
    reset,
  }
}

// ==================== 路由权限 Composable ====================

/**
 * 路由权限检查
 * 
 * 检查当前用户是否有访问当前路由的权限
 * 
 * @param permissions - 所需权限列表
 * @param mode - 检查模式：'some' 满足任一权限，'every' 满足所有权限
 * @returns 权限检查结果
 * 
 * @example
 * ```vue
 * <template>
 *   <div v-if="hasPermission">
 *     <button>编辑</button>
 *   </div>
 *   <div v-else>
 *     无权限访问
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * const { hasPermission } = useRoutePermission(['admin', 'editor'])
 * </script>
 * ```
 */
export function useRoutePermission(
  permissions: string[] = [],
  mode: 'some' | 'every' = 'some'
) {
  const route = vueUseRoute()
  
  const requiredPermissions = computed(() => {
    const metaPermissions = route.meta.permissions as string[] | undefined
    return permissions.length > 0 ? permissions : (metaPermissions || [])
  })

  const userPermissions = ref<string[]>([])

  // 设置用户权限
  const setUserPermissions = (perms: string[]) => {
    userPermissions.value = perms
  }

  // 检查是否有权限
  const hasPermission = computed(() => {
    if (requiredPermissions.value.length === 0) return true
    if (userPermissions.value.length === 0) return false

    if (mode === 'some') {
      return requiredPermissions.value.some(p => 
        userPermissions.value.includes(p)
      )
    } else {
      return requiredPermissions.value.every(p => 
        userPermissions.value.includes(p)
      )
    }
  })

  return {
    hasPermission,
    setUserPermissions,
    requiredPermissions,
    userPermissions: computed(() => userPermissions.value),
  }
}

// ==================== 路由预取 Composable ====================

/**
 * 路由预取配置
 */
export interface RoutePrefetchOptions {
  /** 预取延迟（毫秒） */
  delay?: number
  /** 是否在悬停时预取 */
  onHover?: boolean
  /** 是否在可见时预取 */
  onVisible?: boolean
}

/**
 * 路由预取控制
 * 
 * 控制路由组件的预加载行为，优化用户体验
 * 
 * @param path - 要预取的路由路径
 * @param options - 预取配置
 * @returns 预取控制方法
 * 
 * @example
 * ```vue
 * <template>
 *   <div @mouseenter="prefetchRoute">
 *     <router-link to="/dashboard">Dashboard</router-link>
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * const { prefetchRoute, isPrefetching } = useRoutePrefetch('/dashboard', {
 *   delay: 200,
 *   onHover: true,
 * })
 * </script>
 * ```
 */
export function useRoutePrefetch(
  path: string | (() => string),
  options: RoutePrefetchOptions = {}
) {
  const { delay = 0, onHover = false, onVisible = false } = options
  const isPrefetching = ref(false)
  const isPrefetched = ref(false)

  let prefetchTimer: ReturnType<typeof setTimeout> | null = null

  const prefetchRoute = () => {
    if (isPrefetched.value || isPrefetching.value) return

    const targetPath = typeof path === 'function' ? path() : path

    if (delay > 0) {
      prefetchTimer = setTimeout(() => {
        performPrefetch(targetPath)
      }, delay)
    } else {
      performPrefetch(targetPath)
    }
  }

  const performPrefetch = async (targetPath: string) => {
    isPrefetching.value = true
    try {
      // 这里需要路由器的支持来预加载组件
      // 实际实现需要访问 router 实例
      await new Promise(resolve => setTimeout(resolve, 100))
      isPrefetched.value = true
    } catch (error) {
      console.error('Prefetch failed:', error)
    } finally {
      isPrefetching.value = false
    }
  }

  const cancelPrefetch = () => {
    if (prefetchTimer) {
      clearTimeout(prefetchTimer)
      prefetchTimer = null
    }
    isPrefetching.value = false
  }

  onUnmounted(() => {
    cancelPrefetch()
  })

  return {
    prefetchRoute,
    cancelPrefetch,
    isPrefetching: computed(() => isPrefetching.value),
    isPrefetched: computed(() => isPrefetched.value),
  }
}

// ==================== 路由历史 Composable ====================

/**
 * 历史记录项
 */
export interface HistoryItem {
  path: string
  name?: string | symbol | null | undefined
  params: RouteParams
  query: RouteQuery
  timestamp: number
}

const navigationHistory: HistoryItem[] = []
const maxHistorySize = 50

/**
 * 路由历史记录管理
 * 
 * 追踪用户的导航历史，支持前进/后退导航
 * 
 * @returns 历史记录和导航方法
 * 
 * @example
 * ```vue
 * <template>
 *   <button @click="goBack" :disabled="!canGoBack">
 *     返回
 *   </button>
 *   <button @click="goForward" :disabled="!canGoForward">
 *     前进
 *   </button>
 *   
 *   <div>
 *     <h3>访问历史</h3>
 *     <ul>
 *       <li v-for="item in history" :key="item.timestamp">
 *         {{ item.path }} - {{ new Date(item.timestamp).toLocaleTimeString() }}
 *       </li>
 *     </ul>
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * const {
 *   history,
 *   canGoBack,
 *   canGoForward,
 *   goBack,
 *   goForward,
 *   clear
 * } = useRouteHistory()
 * </script>
 * ```
 */
export function useRouteHistory() {
  const route = vueUseRoute()
  const currentIndex = ref(navigationHistory.length - 1)

  // 监听路由变化，添加到历史记录
  watch(
    () => route.fullPath,
    () => {
      const item: HistoryItem = {
        path: route.path,
        name: route.name,
        params: route.params as RouteParams,
        query: route.query as RouteQuery,
        timestamp: Date.now(),
      }

      // 如果不是在历史记录末尾，删除当前位置之后的记录
      if (currentIndex.value < navigationHistory.length - 1) {
        navigationHistory.splice(currentIndex.value + 1)
      }

      navigationHistory.push(item)
      
      // 限制历史记录大小
      if (navigationHistory.length > maxHistorySize) {
        navigationHistory.shift()
      } else {
        currentIndex.value++
      }
    },
    { immediate: true }
  )

  const history = computed(() => [...navigationHistory])

  const canGoBack = computed(() => currentIndex.value > 0)
  
  const canGoForward = computed(() => 
    currentIndex.value < navigationHistory.length - 1
  )

  const goBack = () => {
    if (canGoBack.value) {
      currentIndex.value--
      window.history.back()
    }
  }

  const goForward = () => {
    if (canGoForward.value) {
      currentIndex.value++
      window.history.forward()
    }
  }

  const clear = () => {
    navigationHistory.length = 0
    currentIndex.value = -1
  }

  const getPrevious = () => {
    if (canGoBack.value) {
      return navigationHistory[currentIndex.value - 1]
    }
    return null
  }

  const getNext = () => {
    if (canGoForward.value) {
      return navigationHistory[currentIndex.value + 1]
    }
    return null
  }

  return {
    history,
    currentIndex: computed(() => currentIndex.value),
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    clear,
    getPrevious,
    getNext,
  }
}

// ==================== 路由过渡动画 Composable ====================

/**
 * 过渡动画类型
 */
export type TransitionType =
    | 'fade'
    | 'slide-left'
    | 'slide-right'
    | 'slide-up'
    | 'slide-down'
    | 'zoom'
    | 'flip'
    | 'scale'
    | 'none'
  
  /**
   * 过渡方向
   */
  export type TransitionDirection = 'forward' | 'backward' | 'none'
  
  /**
   * 过渡动画配置
   */
  export interface RouteTransitionOptions {
    /** 默认过渡类型 */
    defaultType?: TransitionType
    /** 过渡持续时间（毫秒） */
    duration?: number
    /** 是否启用过渡 */
    enabled?: boolean
    /** 自定义过渡类名前缀 */
    classPrefix?: string
    /** 是否根据路由深度自动判断方向 */
    autoDirection?: boolean
    /** 路由特定的过渡配置 */
    routeTransitions?: Record<string, TransitionType>
  }
  
  /**
   * 过渡状态
   */
  export interface TransitionState {
    /** 当前过渡类型 */
    type: TransitionType
    /** 过渡方向 */
    direction: TransitionDirection
    /** 是否正在过渡 */
    isTransitioning: boolean
    /** 进入类名 */
    enterClass: string
    /** 进入激活类名 */
    enterActiveClass: string
    /** 进入结束类名 */
    enterToClass: string
    /** 离开类名 */
    leaveClass: string
    /** 离开激活类名 */
    leaveActiveClass: string
    /** 离开结束类名 */
    leaveToClass: string
  }
  
  /**
   * 路由过渡动画控制
   *
   * 提供灵活的路由切换动画控制，支持多种预设动画和自定义配置
   *
   * @param options - 过渡配置
   * @returns 过渡状态和控制方法
   *
   * @example
   * ```vue
   * <template>
   *   <router-view v-slot="{ Component }">
   *     <transition
   *       :name="transitionName"
   *       :duration="duration"
   *       @before-enter="onBeforeEnter"
   *       @after-enter="onAfterEnter"
   *     >
   *       <component :is="Component" :key="$route.path" />
   *     </transition>
   *   </router-view>
   * </template>
   *
   * <script setup lang="ts">
   * const {
   *   transitionName,
   *   duration,
   *   setTransition,
   *   onBeforeEnter,
   *   onAfterEnter,
   * } = useRouteTransition({
   *   defaultType: 'slide-left',
   *   duration: 300,
   *   autoDirection: true,
   * })
   *
   * // 为特定路由设置过渡
   * setTransition('/about', 'fade')
   * </script>
   * ```
   *
   * @example
   * ```vue
   * <script setup lang="ts">
   * // 高级用法：根据路由深度自动选择过渡
   * const { transitionName, direction } = useRouteTransition({
   *   autoDirection: true,
   *   routeTransitions: {
   *     '/dashboard': 'slide-up',
   *     '/profile': 'zoom',
   *     '/settings': 'fade',
   *   },
   * })
   *
   * // 监听过渡方向变化
   * watch(direction, (newDir) => {
   *   console.log('过渡方向:', newDir)
   * })
   * </script>
   * ```
   */
  export function useRouteTransition(options: RouteTransitionOptions = {}) {
    const route = vueUseRoute()
    const {
      defaultType = 'fade',
      duration = 300,
      enabled = true,
      classPrefix = 'route-transition',
      autoDirection = true,
      routeTransitions = {},
    } = options
  
    // 当前过渡状态
    const currentType = ref<TransitionType>(defaultType)
    const currentDirection = ref<TransitionDirection>('none')
    const isTransitioning = ref(false)
    
    // 上一个路由信息（用于判断方向）
    const previousRoute = ref({
      path: route.path,
      depth: route.matched.length,
    })
  
    /**
     * 获取路由深度
     */
    const getRouteDepth = (path: string): number => {
      return path.split('/').filter(Boolean).length
    }
  
    /**
     * 判断过渡方向
     */
    const determineDirection = (
      fromPath: string,
      toPath: string
    ): TransitionDirection => {
      if (!autoDirection) return 'none'
  
      const fromDepth = getRouteDepth(fromPath)
      const toDepth = getRouteDepth(toPath)
  
      if (toDepth > fromDepth) return 'forward'
      if (toDepth < fromDepth) return 'backward'
      return 'none'
    }
  
    /**
     * 获取过渡类型
     */
    const getTransitionType = (path: string): TransitionType => {
      // 检查路由特定配置
      for (const [routePath, type] of Object.entries(routeTransitions)) {
        if (path.startsWith(routePath)) {
          return type
        }
      }
      return defaultType
    }
  
    /**
     * 生成过渡类名
     */
    const generateTransitionClasses = (
      type: TransitionType,
      direction: TransitionDirection
    ) => {
      if (!enabled || type === 'none') {
        return {
          enterClass: '',
          enterActiveClass: '',
          enterToClass: '',
          leaveClass: '',
          leaveActiveClass: '',
          leaveToClass: '',
        }
      }
  
      const directionSuffix = direction !== 'none' ? `-${direction}` : ''
      const base = `${classPrefix}-${type}${directionSuffix}`
  
      return {
        enterClass: `${base}-enter-from`,
        enterActiveClass: `${base}-enter-active`,
        enterToClass: `${base}-enter-to`,
        leaveClass: `${base}-leave-from`,
        leaveActiveClass: `${base}-leave-active`,
        leaveToClass: `${base}-leave-to`,
      }
    }
  
    // 监听路由变化
    watch(
      () => route.path,
      (newPath) => {
        const direction = determineDirection(previousRoute.value.path, newPath)
        const type = getTransitionType(newPath)
  
        currentType.value = type
        currentDirection.value = direction
  
        previousRoute.value = {
          path: newPath,
          depth: route.matched.length,
        }
      }
    )
  
    // 计算过渡状态
    const transitionState = computed<TransitionState>(() => {
      const classes = generateTransitionClasses(
        currentType.value,
        currentDirection.value
      )
  
      return {
        type: currentType.value,
        direction: currentDirection.value,
        isTransitioning: isTransitioning.value,
        ...classes,
      }
    })
  
    /**
     * 计算过渡名称（用于 <transition> 组件）
     */
    const transitionName = computed(() => {
      if (!enabled || currentType.value === 'none') return ''
      
      const directionSuffix = currentDirection.value !== 'none'
        ? `-${currentDirection.value}`
        : ''
      return `${classPrefix}-${currentType.value}${directionSuffix}`
    })
  
    /**
     * 设置过渡类型
     */
    const setTransition = (type: TransitionType) => {
      currentType.value = type
    }
  
    /**
     * 设置特定路由的过渡
     */
    const setRouteTransition = (path: string, type: TransitionType) => {
      routeTransitions[path] = type
    }
  
    /**
     * 手动设置过渡方向
     */
    const setDirection = (direction: TransitionDirection) => {
      currentDirection.value = direction
    }
  
    /**
     * 过渡生命周期钩子
     */
    const onBeforeEnter = () => {
      isTransitioning.value = true
    }
  
    const onEnter = () => {
      // 过渡进入中
    }
  
    const onAfterEnter = () => {
      isTransitioning.value = false
    }
  
    const onBeforeLeave = () => {
      isTransitioning.value = true
    }
  
    const onLeave = () => {
      // 过渡离开中
    }
  
    const onAfterLeave = () => {
      isTransitioning.value = false
    }
  
    /**
     * 禁用/启用过渡
     */
    const disable = () => {
      currentType.value = 'none'
    }
  
    const enable = (type: TransitionType = defaultType) => {
      currentType.value = type
    }
  
    return {
      // 状态
      transitionState,
      transitionName,
      type: computed(() => currentType.value),
      direction: computed(() => currentDirection.value),
      isTransitioning: computed(() => isTransitioning.value),
      duration: computed(() => duration),
  
      // 控制方法
      setTransition,
      setRouteTransition,
      setDirection,
      disable,
      enable,
  
      // 生命周期钩子
      onBeforeEnter,
      onEnter,
      onAfterEnter,
      onBeforeLeave,
      onLeave,
      onAfterLeave,
    }
  }
  
  /**
   * 预设过渡动画样式（需要在全局 CSS 中定义）
   *
   * @example
   * ```css
   * // Fade 过渡
   * .route-transition-fade-enter-active,
   * .route-transition-fade-leave-active {
   *   transition: opacity 0.3s ease;
   * }
   * .route-transition-fade-enter-from,
   * .route-transition-fade-leave-to {
   *   opacity: 0;
   * }
   *
   * // Slide Left 过渡
   * .route-transition-slide-left-enter-active,
   * .route-transition-slide-left-leave-active {
   *   transition: transform 0.3s ease;
   * }
   * .route-transition-slide-left-enter-from {
   *   transform: translateX(100%);
   * }
   * .route-transition-slide-left-leave-to {
   *   transform: translateX(-100%);
   * }
   *
   * // Zoom 过渡
   * .route-transition-zoom-enter-active,
   * .route-transition-zoom-leave-active {
   *   transition: all 0.3s ease;
   * }
   * .route-transition-zoom-enter-from {
   *   opacity: 0;
   *   transform: scale(0.9);
   * }
   * .route-transition-zoom-leave-to {
   *   opacity: 0;
   *   transform: scale(1.1);
   * }
   * ```
   */
  export const transitionPresetStyles = {
    fade: `
      .route-transition-fade-enter-active,
      .route-transition-fade-leave-active {
        transition: opacity 0.3s ease;
      }
      .route-transition-fade-enter-from,
      .route-transition-fade-leave-to {
        opacity: 0;
      }
    `,
    slide: `
      .route-transition-slide-left-enter-active,
      .route-transition-slide-left-leave-active,
      .route-transition-slide-right-enter-active,
      .route-transition-slide-right-leave-active {
        transition: transform 0.3s ease;
      }
      .route-transition-slide-left-enter-from {
        transform: translateX(100%);
      }
      .route-transition-slide-left-leave-to {
        transform: translateX(-100%);
      }
      .route-transition-slide-right-enter-from {
        transform: translateX(-100%);
      }
      .route-transition-slide-right-leave-to {
        transform: translateX(100%);
      }
    `,
    zoom: `
      .route-transition-zoom-enter-active,
      .route-transition-zoom-leave-active {
        transition: all 0.3s ease;
      }
      .route-transition-zoom-enter-from {
        opacity: 0;
        transform: scale(0.9);
      }
      .route-transition-zoom-leave-to {
        opacity: 0;
        transform: scale(1.1);
      }
    `,
  }

// ==================== 导航进度 Composable ====================

import {
  NavigationProgress,
  createNavigationProgress,
  type NavigationProgressOptions,
  type NavigationProgressState,
} from '@ldesign/router-core'

let _globalProgress: NavigationProgress | null = null

/**
 * 导航进度条 Composable
 *
 * 提供 loading bar 的响应式状态，自动与路由导航绑定
 *
 * @param options - 进度条配置
 * @returns 进度状态和控制方法
 *
 * @example
 * ```vue
 * <template>
 *   <div
 *     v-if="progress.isLoading"
 *     class="progress-bar"
 *     :style="{ width: (progress.progress * 100) + '%' }"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * const { progress, start, finish } = useNavigationProgress()
 * </script>
 * ```
 */
export function useNavigationProgress(options?: NavigationProgressOptions) {
  if (!_globalProgress) {
    _globalProgress = createNavigationProgress(options)
  }

  const state = ref<NavigationProgressState>({
    progress: 0,
    isLoading: false,
    isFinished: false,
  })

  const unsubscribe = _globalProgress.onChange((newState) => {
    state.value = { ...newState }
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    progress: computed(() => state.value),
    start: () => _globalProgress!.start(),
    finish: () => _globalProgress!.finish(),
    fail: () => _globalProgress!.fail(),
    set: (val: number) => _globalProgress!.set(val),
    inc: (amount?: number) => _globalProgress!.inc(amount),
    /** 获取底层 NavigationProgress 实例 */
    instance: _globalProgress,
  }
}

// ==================== 路由标题 Composable ====================

/**
 * 自动设置页面标题的 Composable
 *
 * 监听路由变化并根据路由 meta.title 自动更新 document.title
 *
 * @param template - 标题模板，%s 为占位符。例如 '%s | My App'
 * @param defaultTitle - 默认标题
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { title } = useRouteTitle('%s - My App', 'Home')
 * </script>
 * ```
 */
export function useRouteTitle(
  template: string | ((title: string) => string) = '%s',
  defaultTitle = '',
) {
  const route = vueUseRoute()

  const formatTitle = (raw: string): string => {
    if (typeof template === 'function') return template(raw)
    return template.replace('%s', raw)
  }

  const title = computed(() => {
    // 从 matched 路由链中查找最后一个有 title 的
    let t = defaultTitle
    if (route.matched) {
      for (const record of route.matched) {
        if (record.meta?.title) {
          t = record.meta.title as string
        }
      }
    }
    if (route.meta?.title) {
      t = route.meta.title as string
    }
    return t || defaultTitle
  })

  const formattedTitle = computed(() => formatTitle(title.value))

  // 自动更新 document.title
  watch(
    formattedTitle,
    (newTitle) => {
      if (typeof document !== 'undefined' && newTitle) {
        document.title = newTitle
      }
    },
    { immediate: true },
  )

  return {
    title,
    formattedTitle,
  }
}

// ==================== 路由监听 Composable ====================

export type RouteWatchSource = 'path' | 'fullPath' | 'name' | 'params' | 'query' | 'hash'

export interface RouteWatcherOptions {
  /** 监听的属性，默认 'fullPath' */
  source?: RouteWatchSource
  /** 是否立即执行 */
  immediate?: boolean
  /** 是否深度监听（对 params/query 有效） */
  deep?: boolean
}

/**
 * 路由变化监听 Composable
 *
 * 通用的路由变化监听工具，比直接 watch route 更简洁
 *
 * @param callback - 路由变化回调
 * @param options - 配置项
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * // 监听路径变化
 * useRouteWatcher((newPath, oldPath) => {
 *   console.log(`From ${oldPath} to ${newPath}`)
 * })
 *
 * // 监听 query 变化
 * useRouteWatcher(
 *   (newQuery, oldQuery) => { console.log('query changed', newQuery) },
 *   { source: 'query', deep: true }
 * )
 * </script>
 * ```
 */
export function useRouteWatcher(
  callback: (newValue: any, oldValue: any) => void,
  options: RouteWatcherOptions = {},
) {
  const route = vueUseRoute()
  const { source = 'fullPath', immediate = false, deep = false } = options

  const getSource = () => {
    switch (source) {
      case 'path': return route.path
      case 'fullPath': return route.fullPath
      case 'name': return route.name
      case 'params': return route.params
      case 'query': return route.query
      case 'hash': return route.hash
      default: return route.fullPath
    }
  }

  const stopWatch = watch(
    () => getSource(),
    (newVal, oldVal) => {
      callback(newVal, oldVal)
    },
    { immediate, deep },
  )

  onUnmounted(() => {
    stopWatch()
  })

  return stopWatch
}

// ==================== 异步路由数据 Composable ====================

/**
 * 异步路由数据选项
 */
export interface AsyncRouteDataOptions<T = any> {
  /** 是否在创建时立即执行 */
  immediate?: boolean
  /** 监听的路由属性变化来触发 refetch，默认 ['params', 'query'] */
  watch?: ('params' | 'query' | 'hash' | 'path')[]
  /** 缓存键，默认使用 route.fullPath */
  cacheKey?: string | ((route: any) => string)
  /** 缓存时间（毫秒），0 = 不缓存 */
  cacheTime?: number
  /** 初始数据 */
  initialData?: T
  /** 数据转换函数 */
  transform?: (data: any) => T
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

const asyncDataCache = new Map<string, { data: any; timestamp: number }>()

/**
 * 路由级异步数据加载
 * 
 * 当路由参数或查询参数变化时自动重新获取数据，支持缓存、loading/error 状态和重试。
 * 
 * @template T - 数据类型
 * @param fetcher - 数据获取函数，接收当前路由作为参数
 * @param options - 配置选项
 * @returns 数据状态和控制方法
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { data, loading, error, refresh } = useAsyncRouteData(
 *   (route) => fetch(`/api/users/${route.params.id}`).then(r => r.json()),
 *   { immediate: true, watch: ['params'] }
 * )
 * </script>
 * ```
 */
export function useAsyncRouteData<T = any>(
  fetcher: (route: ReturnType<typeof vueUseRoute>) => Promise<T>,
  options: AsyncRouteDataOptions<T> = {},
) {
  const route = vueUseRoute()
  const {
    immediate = true,
    watch: watchSources = ['params', 'query'],
    cacheKey,
    cacheTime = 0,
    initialData,
    transform,
    onSuccess,
    onError,
  } = options

  const data = ref<T | undefined>(initialData) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const fetchCount = ref(0)

  const getCacheKey = (): string => {
    if (typeof cacheKey === 'function') return cacheKey(route)
    if (typeof cacheKey === 'string') return cacheKey
    return route.fullPath
  }

  const getCached = (): T | undefined => {
    if (cacheTime <= 0) return undefined
    const key = getCacheKey()
    const cached = asyncDataCache.get(key)
    if (!cached) return undefined
    if (Date.now() - cached.timestamp > cacheTime) {
      asyncDataCache.delete(key)
      return undefined
    }
    return cached.data
  }

  const execute = async () => {
    // Check cache first
    const cached = getCached()
    if (cached !== undefined) {
      data.value = cached
      return
    }

    loading.value = true
    error.value = null
    fetchCount.value++
    const currentFetch = fetchCount.value

    try {
      let result = await fetcher(route)
      // Stale request check
      if (currentFetch !== fetchCount.value) return

      if (transform) result = transform(result)
      data.value = result

      // Store in cache
      if (cacheTime > 0) {
        asyncDataCache.set(getCacheKey(), { data: result, timestamp: Date.now() })
      }

      onSuccess?.(result)
    } catch (e) {
      if (currentFetch !== fetchCount.value) return
      error.value = e instanceof Error ? e : new Error(String(e))
      onError?.(error.value)
    } finally {
      if (currentFetch === fetchCount.value) {
        loading.value = false
      }
    }
  }

  const refresh = () => execute()

  const clearCache = (key?: string) => {
    if (key) {
      asyncDataCache.delete(key)
    } else {
      asyncDataCache.delete(getCacheKey())
    }
  }

  // Watch route changes
  const getWatchSources = () => watchSources.map(s => {
    switch (s) {
      case 'params': return route.params
      case 'query': return route.query
      case 'hash': return route.hash
      case 'path': return route.path
      default: return route.fullPath
    }
  })

  watch(
    () => getWatchSources(),
    () => { execute() },
    { deep: true },
  )

  // Immediate fetch
  if (immediate) {
    execute()
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh,
    clearCache,
    /** Execute count, useful for tracking refetches */
    fetchCount: computed(() => fetchCount.value),
  }
}

// ==================== 路由无障碍播报 Composable ====================

/**
 * 路由播报选项
 */
export interface RouteAnnouncerOptions {
  /** aria-live 级别 */
  politeness?: 'polite' | 'assertive'
  /** 播报模板，%s 为路由标题占位符 */
  template?: string | ((title: string) => string)
  /** 播报延迟(ms) */
  announceDelay?: number
}

let _announcerElement: HTMLElement | null = null

/**
 * 路由变化无障碍播报
 * 
 * 为 SPA 路由切换提供屏幕阅读器播报支持，在路由变化时自动
 * 通过 ARIA live region 告知辅助技术当前页面已切换。
 * 
 * @param options - 播报配置
 * @returns 播报控制方法
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { announce } = useRouteAnnouncer({
 *   template: '已导航到 %s',
 *   politeness: 'polite',
 * })
 * </script>
 * ```
 */
export function useRouteAnnouncer(options: RouteAnnouncerOptions = {}) {
  const route = vueUseRoute()
  const {
    politeness = 'polite',
    template = '%s',
    announceDelay = 100,
  } = options

  const message = ref('')
  const isActive = ref(false)

  // Create or get the announcer element
  const ensureAnnouncer = () => {
    if (typeof document === 'undefined') return
    if (_announcerElement) return _announcerElement

    const el = document.createElement('div')
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', politeness)
    el.setAttribute('aria-atomic', 'true')
    Object.assign(el.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    })
    document.body.appendChild(el)
    _announcerElement = el
    return el
  }

  const formatMessage = (title: string): string => {
    if (typeof template === 'function') return template(title)
    return template.replace('%s', title)
  }

  const announce = (text?: string) => {
    const el = ensureAnnouncer()
    if (!el) return

    const title = text || (route.meta?.title as string) || String(route.name ?? route.path)
    const formatted = formatMessage(title)

    // Clear then set to trigger screen reader re-announcement
    el.textContent = ''
    isActive.value = true
    message.value = formatted

    setTimeout(() => {
      el.textContent = formatted
      isActive.value = false
    }, 50)
  }

  // Auto announce on route change
  let announceTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    () => route.fullPath,
    () => {
      if (announceTimer) clearTimeout(announceTimer)
      announceTimer = setTimeout(() => announce(), announceDelay)
    },
  )

  onUnmounted(() => {
    if (announceTimer) clearTimeout(announceTimer)
  })

  return {
    /** Current announcement message */
    message: computed(() => message.value),
    /** Whether an announcement is being processed */
    isActive: computed(() => isActive.value),
    /** Manually announce a message */
    announce,
  }
}

// ==================== 路由滚动 Composable ====================

/**
 * 路由滚动选项
 */
export interface RouteScrollOptions {
  /** 滚动行为 */
  behavior?: ScrollBehavior
  /** 滚动容器选择器，默认 window */
  selector?: string
  /** 新路由是否自动滚动到顶部 */
  scrollToTop?: boolean
  /** 保存键前缀 */
  saveKey?: string
}

const scrollPositions = new Map<string, { x: number; y: number }>()

/**
 * 路由滚动位置管理
 * 
 * 在路由切换时自动保存/恢复滚动位置，支持 hash 锚点、自定义容器。
 * 
 * @param options - 滚动配置
 * @returns 滚动控制方法
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { savedPosition, scrollTo, savePosition } = useRouteScroll({
 *   scrollToTop: true,
 *   behavior: 'smooth',
 * })
 * </script>
 * ```
 */
export function useRouteScroll(options: RouteScrollOptions = {}) {
  const route = vueUseRoute()
  const {
    behavior = 'auto',
    selector,
    scrollToTop = true,
    saveKey = 'route-scroll',
  } = options

  const savedPosition = ref<{ x: number; y: number } | null>(null)

  const getScrollElement = (): Element | Window => {
    if (selector && typeof document !== 'undefined') {
      return document.querySelector(selector) || window
    }
    return typeof window !== 'undefined' ? window : null as any
  }

  const getCurrentPosition = (): { x: number; y: number } => {
    const el = getScrollElement()
    if (el === window || !el) {
      return { x: window.scrollX || 0, y: window.scrollY || 0 }
    }
    return { x: (el as Element).scrollLeft, y: (el as Element).scrollTop }
  }

  const savePosition = () => {
    const key = `${saveKey}:${route.fullPath}`
    const pos = getCurrentPosition()
    scrollPositions.set(key, pos)
    savedPosition.value = pos
  }

  const scrollTo = (pos: { x?: number; y?: number } | string) => {
    const el = getScrollElement()
    if (!el) return

    if (typeof pos === 'string') {
      // Scroll to element by selector / hash
      const target = typeof document !== 'undefined' ? document.querySelector(pos) : null
      if (target) {
        target.scrollIntoView({ behavior })
        return
      }
    }

    const { x = 0, y = 0 } = pos as { x?: number; y?: number }
    if (el === window) {
      window.scrollTo({ left: x, top: y, behavior })
    } else {
      ;(el as Element).scrollTo({ left: x, top: y, behavior })
    }
  }

  const restorePosition = () => {
    const key = `${saveKey}:${route.fullPath}`
    const pos = scrollPositions.get(key)
    if (pos) {
      savedPosition.value = pos
      // Restore after DOM update
      setTimeout(() => scrollTo(pos), 50)
      return true
    }
    return false
  }

  // On route change: save old position, restore or scroll to top
  let previousPath = route.fullPath
  watch(
    () => route.fullPath,
    (newPath) => {
      // Save current position for previous route
      const prevKey = `${saveKey}:${previousPath}`
      scrollPositions.set(prevKey, getCurrentPosition())
      previousPath = newPath

      // Try to restore, or scroll to top
      setTimeout(() => {
        if (route.hash) {
          scrollTo(route.hash)
        } else if (!restorePosition() && scrollToTop) {
          scrollTo({ x: 0, y: 0 })
        }
      }, 80)
    },
  )

  return {
    /** Last saved scroll position */
    savedPosition: computed(() => savedPosition.value),
    /** Manually save current scroll position */
    savePosition,
    /** Scroll to a position or element */
    scrollTo,
    /** Restore saved position for current route */
    restorePosition,
    /** Clear all saved positions */
    clearPositions: () => scrollPositions.clear(),
  }
}

// ==================== 导航防抖 Composable ====================

/**
 * 导航防抖选项
 */
export interface RouteDebounceOptions {
  /** 防抖延迟(ms) */
  delay?: number
  /** 是否在延迟前立即执行第一次 */
  leading?: boolean
}

/**
 * 路由导航防抖
 * 
 * 防止用户快速连续点击导致导航重复执行，自动对 router.push 进行防抖处理。
 * 
 * @param options - 防抖配置
 * @returns 防抖的导航方法
 * 
 * @example
 * ```vue
 * <template>
 *   <button @click="navigate('/dashboard')" :disabled="isNavigating">
 *     Go
 *   </button>
 * </template>
 * 
 * <script setup lang="ts">
 * const { navigate, isNavigating, cancel } = useRouteDebounce({ delay: 300 })
 * </script>
 * ```
 */
export function useRouteDebounce(options: RouteDebounceOptions = {}) {
  const { delay = 300, leading = false } = options

  const isNavigating = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastTarget: string | Record<string, any> | null = null

  let _router: ReturnType<typeof vueUseRouter> | null = null
  const getRouter = () => {
    if (!_router) _router = vueUseRouter()
    return _router!
  }

  const navigate = (to: string | Record<string, any>, replace = false) => {
    lastTarget = to

    if (leading && !timer) {
      isNavigating.value = true
      const router = getRouter()
      const nav = replace ? router.replace(to as any) : router.push(to as any)
      nav.finally(() => { isNavigating.value = false })
    }

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      timer = null
      if (!leading && lastTarget) {
        isNavigating.value = true
        const router = getRouter()
        const nav = replace ? router.replace(lastTarget as any) : router.push(lastTarget as any)
        nav.finally(() => { isNavigating.value = false })
        lastTarget = null
      }
    }, delay)
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastTarget = null
    isNavigating.value = false
  }

  onUnmounted(() => cancel())

  return {
    /** Debounced navigate function */
    navigate,
    /** Whether a navigation is pending or in-flight */
    isNavigating: computed(() => isNavigating.value),
    /** Cancel pending navigation */
    cancel,
  }
}
