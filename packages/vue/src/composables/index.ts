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
