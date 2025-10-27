/**
 * @ldesign/router 组合式 API
 *
 * 提供完整的 Vue 3 Composition API 支持，让路由使用更加便捷和类型安全。
 * 
 * **核心 Composables**：
 * - useRouter - 获取路由器实例
 * - useRoute - 获取当前路由
 * - useParams - 获取路由参数
 * - useQuery - 获取查询参数
 * - useLink - 创建路由链接
 * 
 * **守卫 Composables**：
 * - onBeforeRouteUpdate - 路由更新守卫
 * - onBeforeRouteLeave - 路由离开守卫
 * 
 * **增强 Composables**：
 * - useNavigation - 导航控制
 * - useDeviceRoute - 设备路由
 * - useDeviceComponent - 设备组件
 * 
 * @module composables
 * @author ldesign
 */

import type { ComputedRef, Ref } from 'vue'
import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  RouteParams,
  RouteQuery,
  Router,
  RouteRecordNormalized,
  UseRouteReturn,
  UseRouterReturn,
} from '../types'
import {
  computed,
  inject,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  ref,
} from 'vue'
import {
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
} from '../core/constants'

// ==================== 核心组合式 API ====================

/**
 * 获取路由器实例（增强版）
 * 
 * 返回路由器实例，并提供额外的便捷方法和状态。
 * 
 * **增强功能**：
 * - 导航状态追踪（isNavigating）
 * - 历史导航能力判断
 * - 路由历史记录
 * - 便捷导航方法
 * - 路由预取功能
 * 
 * @returns 增强的路由器实例
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useRouter } from '@ldesign/router'
 * 
 * const router = useRouter()
 * 
 * // 基础导航
 * router.push('/about')
 * router.replace('/home')
 * router.back()
 * 
 * // 增强功能
 * console.log('正在导航:', router.isNavigating.value)
 * console.log('可以后退:', router.canGoBack.value)
 * router.goHome()  // 快速回到首页
 * router.reload()  // 刷新当前页
 * router.prefetch('/products')  // 预取路由
 * </script>
 * ```
 */
export function useRouter(): UseRouterReturn & {
  // 新增的便捷方法
  isNavigating: ComputedRef<boolean>
  canGoBack: ComputedRef<boolean>
  canGoForward: ComputedRef<boolean>
  routeHistory: ComputedRef<RouteLocationNormalized[]>
  goHome: () => Promise<void>
  reload: () => Promise<void>
  prefetch: (to: RouteLocationRaw) => Promise<void>
} {
  const router = inject<Router>(ROUTER_INJECTION_SYMBOL)

  if (!router) {
    throw new Error(
      'useRouter() can only be used inside a component that has a router instance',
    )
  }

  // 导航状态跟踪
  const isNavigating = ref(false)
  const routeHistory = ref<RouteLocationNormalized[]>([])

  // 增强的路由器对象 - 使用 Object.create 保留原型链
  const enhancedRouter = Object.create(router) as any

  // 添加增强属性
  Object.assign(enhancedRouter, {
    // 导航状态
    isNavigating: computed(() => isNavigating.value),

    // 历史导航能力
    canGoBack: computed(() => window.history.length > 1),
    canGoForward: computed(() => {
      // 浏览器没有直接的 API 判断是否可以前进
      // 这里简单返回 false，实际项目中可能需要自己维护历史栈
      return false
    }),

    // 路由历史
    routeHistory: computed(() => routeHistory.value),

    // 便捷方法：回到首页
    goHome: async () => {
      isNavigating.value = true
      try {
        await router.push('/')
      } finally {
        isNavigating.value = false
      }
    },

    // 便捷方法：刷新当前路由
    reload: async () => {
      const currentRoute = router.currentRoute.value
      isNavigating.value = true
      try {
        await router.replace({ path: '/redirect', query: { to: currentRoute.fullPath } })
        await router.replace(currentRoute.fullPath)
      } finally {
        isNavigating.value = false
      }
    },

    // 预取路由
    prefetch: async (to: RouteLocationRaw) => {
      try {
        const route = router.resolve(to)
        const matched = route.matched[route.matched.length - 1]
        const component = matched?.components?.default

        if (component && typeof component === 'function') {
          await (component as () => Promise<any>)()
        }
      } catch (error) {
        console.warn('路由预取失败:', error)
      }
    },
  })

  // 包装原始的 push 和 replace 方法以跟踪导航状态
  const originalPush = router.push.bind(router)
  const originalReplace = router.replace.bind(router)

  enhancedRouter.push = async (...args: Parameters<typeof router.push>) => {
    isNavigating.value = true
    try {
      const result = await originalPush(...args)
      // 添加到历史记录
      routeHistory.value.push(router.currentRoute.value)
      // 限制历史记录长度
      if (routeHistory.value.length > 50) {
        routeHistory.value.shift()
      }
      return result
    } finally {
      isNavigating.value = false
    }
  }

  enhancedRouter.replace = async (...args: Parameters<typeof router.replace>) => {
    isNavigating.value = true
    try {
      return await originalReplace(...args)
    } finally {
      isNavigating.value = false
    }
  }

  return enhancedRouter as any
}

/**
 * 获取当前路由信息（增强版）
 * 
 * 返回当前路由的响应式引用，并提供丰富的便捷属性和方法。
 * 
 * **增强功能**：
 * - 面包屑导航
 * - 父路由访问
 * - 参数/查询存在判断
 * - 路由深度计算
 * - 便捷的取值方法
 * 
 * @returns 增强的路由对象
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useRoute } from '@ldesign/router'
 * 
 * const route = useRoute()
 * 
 * // 基础属性
 * console.log('路径:', route.value.path)
 * console.log('参数:', route.value.params)
 * console.log('查询:', route.value.query)
 * 
 * // 增强属性
 * console.log('是否首页:', route.value.isHome.value)
 * console.log('面包屑:', route.value.breadcrumbs.value)
 * console.log('路由深度:', route.value.depth.value)
 * 
 * // 便捷方法
 * const userId = route.value.getParam('id', 'default')
 * const searchQuery = route.value.getQuery('q', '')
 * const isUserRoute = route.value.is(['user', 'userProfile'])
 * </script>
 * ```
 */
export function useRoute(): UseRouteReturn & {
  // 新增的便捷属性和方法
  isHome: ComputedRef<boolean>
  isNotFound: ComputedRef<boolean>
  breadcrumbs: ComputedRef<Array<{ name: string; path: string; meta: any }>>
  parent: ComputedRef<RouteRecordNormalized | undefined>
  hasParams: ComputedRef<boolean>
  hasQuery: ComputedRef<boolean>
  paramKeys: ComputedRef<string[]>
  queryKeys: ComputedRef<string[]>
  matchedNames: ComputedRef<string[]>
  depth: ComputedRef<number>
  is: (name: string | string[]) => boolean
  getParam: (key: string, defaultValue?: any) => any
  getQuery: (key: string, defaultValue?: any) => any
} {
  const route = inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)

  if (!route) {
    throw new Error(
      'useRoute() can only be used inside a component that has a router instance',
    )
  }

  const currentRoute = computed(() => {
    // 确保路由对象始终有效，防止初始化时的 undefined 访问
    const r = route.value
    if (!r) {
      // 返回一个安全的默认路由对象
      return {
        path: '/',
        name: '',
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {},
      } as RouteLocationNormalized
    }
    return r
  })

  // 创建增强的路由对象
  const enhancedRoute = computed(() => ({
    ...currentRoute.value,

    // 判断是否是首页
    isHome: computed(() => currentRoute.value.path === '/'),

    // 判断是否是 404 页面
    isNotFound: computed(() =>
      currentRoute.value.name === 'NotFound' ||
      currentRoute.value.matched.length === 0
    ),

    // 生成面包屑
    breadcrumbs: computed(() => {
      return currentRoute.value.matched.map(record => ({
        name: record.name as string || '',
        path: record.path,
        meta: record.meta || {},
      }))
    }),

    // 获取父路由
    parent: computed(() => {
      const matched = currentRoute.value.matched
      return matched.length > 1 ? matched[matched.length - 2] : undefined
    }),

    // 判断是否有参数
    hasParams: computed(() => Object.keys(currentRoute.value.params).length > 0),

    // 判断是否有查询参数
    hasQuery: computed(() => Object.keys(currentRoute.value.query).length > 0),

    // 获取所有参数键
    paramKeys: computed(() => Object.keys(currentRoute.value.params)),

    // 获取所有查询参数键
    queryKeys: computed(() => Object.keys(currentRoute.value.query)),

    // 获取匹配的路由名称
    matchedNames: computed(() =>
      currentRoute.value.matched
        .map(r => r.name)
        .filter(Boolean) as string[]
    ),

    // 获取路由深度
    depth: computed(() => currentRoute.value.matched.length),

    // 检查是否是指定路由
    is: (name: string | string[]): boolean => {
      const names = Array.isArray(name) ? name : [name]
      return names.includes(currentRoute.value.name as string)
    },

    // 获取单个参数
    getParam: (key: string, defaultValue?: any) => {
      return currentRoute.value.params[key] ?? defaultValue
    },

    // 获取单个查询参数
    getQuery: (key: string, defaultValue?: any) => {
      return currentRoute.value.query[key] ?? defaultValue
    },
  }))

  return enhancedRoute.value as any
}

// ==================== 路由参数相关 API ====================

/**
 * 获取路由参数
 * 
 * 返回当前路由的参数对象的响应式引用。
 * 
 * @returns 路由参数的 ComputedRef
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useParams } from '@ldesign/router'
 * 
 * const params = useParams()
 * console.log('用户ID:', params.value.id)
 * 
 * // 监听参数变化
 * watch(params, (newParams) => {
 *   console.log('参数已更新:', newParams)
 * })
 * </script>
 * ```
 */
export function useParams(): ComputedRef<RouteParams> {
  const route = useRoute()
  return computed(() => route.value.params)
}

/**
 * 获取查询参数
 * 
 * 返回当前路由的查询参数对象的响应式引用。
 * 
 * @returns 查询参数的 ComputedRef
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useQuery } from '@ldesign/router'
 * 
 * const query = useQuery()
 * console.log('搜索词:', query.value.q)
 * console.log('页码:', query.value.page)
 * </script>
 * ```
 */
export function useQuery(): ComputedRef<RouteQuery> {
  const route = useRoute()
  return computed(() => route.value.query)
}

/**
 * 获取哈希值
 * 
 * 返回当前路由的哈希值的响应式引用。
 * 
 * @returns 哈希值的 ComputedRef
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useHash } from '@ldesign/router'
 * 
 * const hash = useHash()
 * 
 * // 监听锚点变化
 * watch(hash, (newHash) => {
 *   console.log('锚点已更新:', newHash)
 *   scrollToElement(newHash)
 * })
 * </script>
 * ```
 */
export function useHash(): ComputedRef<string> {
  const route = useRoute()
  return computed(() => route.value.hash)
}

/**
 * 获取路由元信息
 * 
 * 返回当前路由的元数据对象的响应式引用。
 * 
 * @returns 路由元信息的 ComputedRef
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useMeta } from '@ldesign/router'
 * 
 * const meta = useMeta()
 * 
 * // 访问元数据
 * console.log('页面标题:', meta.value.title)
 * console.log('需要认证:', meta.value.requiresAuth)
 * 
 * // 监听元数据变化
 * watch(() => meta.value.title, (title) => {
 *   document.title = title || '默认标题'
 * })
 * </script>
 * ```
 */
export function useMeta(): ComputedRef<RouteMeta> {
  const route = useRoute()
  return computed(() => route.value.meta)
}

/**
 * 获取匹配的路由记录
 * 
 * 返回当前路由匹配的所有路由记录（包括父路由）的响应式引用。
 * 用于嵌套路由的面包屑导航等场景。
 * 
 * @returns 匹配路由记录数组的 ComputedRef
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useMatched } from '@ldesign/router'
 * 
 * const matched = useMatched()
 * 
 * // 生成面包屑
 * const breadcrumbs = computed(() => {
 *   return matched.value.map(record => ({
 *     name: record.meta.title || record.name,
 *     path: record.path
 *   }))
 * })
 * </script>
 * 
 * <template>
 *   <nav class="breadcrumbs">
 *     <span v-for="(item, index) in breadcrumbs" :key="index">
 *       <RouterLink :to="item.path">{{ item.name }}</RouterLink>
 *       <span v-if="index < breadcrumbs.length - 1"> / </span>
 *     </span>
 *   </nav>
 * </template>
 * ```
 */
export function useMatched(): ComputedRef<RouteRecordNormalized[]> {
  const route = useRoute()
  return computed(() => route.value.matched)
}

// ==================== 导航相关 API ====================

/**
 * 导航控制钩子
 * 
 * 提供完整的导航控制功能，包括状态追踪和方向判断。
 * 
 * @returns 导航控制对象
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useNavigation } from '@ldesign/router'
 * 
 * const navigation = useNavigation()
 * 
 * // 导航方法
 * navigation.push('/about')
 * navigation.back()
 * navigation.forward()
 * 
 * // 导航状态
 * console.log('正在导航:', navigation.isNavigating.value)
 * console.log('导航方向:', navigation.direction.value)
 * </script>
 * ```
 */
export function useNavigation() {
  const router = useRouter()

  // 创建导航状态的响应式引用
  const isNavigating = ref(false)
  const direction = ref<'forward' | 'backward' | 'unknown'>('unknown')
  const lastNavigationTime = ref(0)

  return {
    /**
     * 导航到指定路由
     */
    push: router.push.bind(router),

    /**
     * 替换当前路由
     */
    replace: router.replace.bind(router),

    /**
     * 历史导航
     */
    go: router.go.bind(router),

    /**
     * 后退
     */
    back: router.back.bind(router),

    /**
     * 前进
     */
    forward: router.forward.bind(router),

    /**
     * 导航状态
     */
    isNavigating: computed(() => isNavigating.value),
    direction: computed(() => direction.value),
    lastNavigationTime: computed(() => lastNavigationTime.value),
  }
}

// ==================== 路由守卫相关 API ====================

/**
 * 组件内路由更新守卫
 * 
 * 在当前路由更新但组件被复用时调用。
 * 
 * **使用场景**：
 * - 路由参数变化时重新获取数据
 * - 同一组件不同参数的处理
 * - 表单状态重置
 * 
 * @param guard - 守卫函数
 * 
 * @example
 * ```vue
 * <script setup>
 * import { onBeforeRouteUpdate } from '@ldesign/router'
 * 
 * // 路由参数变化时重新加载数据
 * onBeforeRouteUpdate((to, from, next) => {
 *   if (to.params.id !== from.params.id) {
 *     loadUserData(to.params.id).then(() => {
 *       next()
 *     })
 *   } else {
 *     next()
 *   }
 * })
 * </script>
 * ```
 */
export function onBeforeRouteUpdate(guard: NavigationGuard): void {
  const router = useRouter()
  const route = useRoute()

  let removeGuard: (() => void) | undefined

  const setupGuard = () => {
    removeGuard = router.beforeEach((to, from, next) => {
      // 只在当前组件的路由更新时触发
      const lastMatchedRecord = route.value.matched[route.value.matched.length - 1]
      if (
        lastMatchedRecord && to.matched.includes(lastMatchedRecord)
      ) {
        guard(to, from, next)
      }
      else {
        next()
      }
    })
  }

  const cleanupGuard = () => {
    if (removeGuard) {
      removeGuard()
      removeGuard = undefined
    }
  }

  // 在组件激活时设置守卫
  onActivated(setupGuard)

  // 在组件失活时清理守卫
  onDeactivated(cleanupGuard)

  // 在组件卸载时清理守卫
  onBeforeUnmount(cleanupGuard)

  // 立即设置守卫（如果组件已经激活）
  setupGuard()
}

/**
 * 组件内路由离开守卫
 * 
 * 在离开当前路由时调用，可以阻止导航或确认离开。
 * 
 * **使用场景**：
 * - 表单未保存提醒
 * - 确认离开对话框
 * - 清理定时器/监听器
 * - 保存草稿
 * 
 * @param guard - 守卫函数
 * 
 * @example
 * ```vue
 * <script setup>
 * import { onBeforeRouteLeave } from '@ldesign/router'
 * import { ref } from 'vue'
 * 
 * const hasUnsavedChanges = ref(false)
 * 
 * // 未保存时提醒用户
 * onBeforeRouteLeave((to, from, next) => {
 *   if (hasUnsavedChanges.value) {
 *     const answer = window.confirm('有未保存的更改，确定要离开吗？')
 *     if (answer) {
 *       next()
 *     } else {
 *       next(false)  // 取消导航
 *     }
 *   } else {
 *     next()
 *   }
 * })
 * </script>
 * ```
 */
export function onBeforeRouteLeave(guard: NavigationGuard): void {
  const router = useRouter()
  const route = useRoute()

  let removeGuard: (() => void) | undefined

  const setupGuard = () => {
    removeGuard = router.beforeEach((to, from, next) => {
      // 只在离开当前组件的路由时触发
      const lastMatchedRecord = route.value.matched[route.value.matched.length - 1]
      if (
        lastMatchedRecord
        && from.matched.includes(lastMatchedRecord)
        && !to.matched.includes(lastMatchedRecord)
      ) {
        guard(to, from, next)
      }
      else {
        next()
      }
    })
  }

  const cleanupGuard = () => {
    if (removeGuard) {
      removeGuard()
      removeGuard = undefined
    }
  }

  // 在组件激活时设置守卫
  onActivated(setupGuard)

  // 在组件失活时清理守卫
  onDeactivated(cleanupGuard)

  // 在组件卸载时清理守卫
  onBeforeUnmount(cleanupGuard)

  // 立即设置守卫（如果组件已经激活）
  setupGuard()
}

// ==================== 链接相关 API ====================

/**
 * 链接选项配置
 */
export interface UseLinkOptions {
  /** 目标路由位置 */
  to: ComputedRef<RouteLocationRaw> | RouteLocationRaw
  /** 是否使用 replace 模式 */
  replace?: boolean
}

/**
 * 链接功能返回值
 */
export interface UseLinkReturn {
  /** 链接的 href 属性 */
  href: ComputedRef<string>
  /** 解析后的路由对象 */
  route: ComputedRef<RouteLocationNormalized>
  /** 是否激活（部分匹配） */
  isActive: ComputedRef<boolean>
  /** 是否精确激活 */
  isExactActive: ComputedRef<boolean>
  /** 执行导航 */
  navigate: (e?: Event) => Promise<void>
}

/**
 * 链接功能钩子
 * 
 * 提供编程式创建路由链接的功能，适合自定义链接组件。
 * 
 * @param options - 链接配置
 * @returns 链接功能对象
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useLink } from '@ldesign/router'
 * import { computed } from 'vue'
 * 
 * const props = defineProps<{ to: string }>()
 * 
 * const link = useLink({
 *   to: computed(() => props.to),
 *   replace: false
 * })
 * 
 * // 使用链接功能
 * const handleClick = (e: Event) => {
 *   link.navigate(e)
 * }
 * </script>
 * 
 * <template>
 *   <a 
 *     :href="link.href.value"
 *     :class="{ active: link.isActive.value }"
 *     @click="handleClick"
 *   >
 *     <slot />
 *   </a>
 * </template>
 * ```
 */
export function useLink(options: UseLinkOptions): UseLinkReturn {
  const router = useRouter()
  const currentRoute = useRoute()

  const to = computed(() => {
    if (!options.to) {
      return ''
    }
    if (typeof options.to === 'string') {
      return options.to
    }
    else if (typeof options.to === 'object' && options.to && 'value' in options.to) {
      // ComputedRef<RouteLocationRaw>
      return options.to.value
    }
    else {
      // RouteLocationRaw (object)
      return options.to
    }
  })

  const route = computed(() => {
    return router.resolve(to.value, currentRoute.value)
  })

  const href = computed(() => {
    return route.value?.fullPath || '#'
  })

  const isActive = computed(() => {
    if (!route.value || !currentRoute.value) return false
    return currentRoute.value.path.startsWith(route.value.path)
  })

  const isExactActive = computed(() => {
    if (!route.value || !currentRoute.value) return false
    return (
      currentRoute.value.path === route.value.path
      && JSON.stringify(currentRoute.value.query)
      === JSON.stringify(route.value.query)
      && currentRoute.value.hash === route.value.hash
    )
  })

  const navigate = async (e?: Event) => {
    if (e) {
      e.preventDefault()
    }

    if (options.replace) {
      await router.replace(to.value)
    }
    else {
      await router.push(to.value)
    }
  }

  return {
    href,
    route,
    isActive,
    isExactActive,
    navigate,
  }
}

// ==================== 工具函数 ====================

/**
 * 检查是否在路由器上下文中
 */
export function hasRouter(): boolean {
  try {
    inject<Router>(ROUTER_INJECTION_SYMBOL)
    return true
  }
  catch {
    return false
  }
}

/**
 * 检查是否在路由上下文中
 */
export function hasRoute(): boolean {
  try {
    inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)
    return true
  }
  catch {
    return false
  }
}

// ==================== 默认导出 ====================

export default {
  useRouter,
  useRoute,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
  useNavigation,
  useLink,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  hasRouter,
  hasRoute,
}

// ==================== 设备适配 Composables ====================

// 设备组件解析功能
export { useDeviceComponent } from './useDeviceComponent'
export type {
  // UseDeviceComponentOptions,
  // UseDeviceComponentReturn,
} from './useDeviceComponent'

// 设备路由功能
export { useDeviceRoute } from './useDeviceRoute'
export type {
  UseDeviceRouteOptions,
  UseDeviceRouteReturn,
} from './useDeviceRoute'
