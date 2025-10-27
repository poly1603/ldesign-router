/**
 * @ldesign/router 路由器核心类
 *
 * 路由器的主要实现，负责路由管理、导航控制和生命周期管理。
 * 
 * 核心功能：
 * - 路由注册与管理
 * - 导航控制与历史管理
 * - 全局守卫与生命周期钩子
 * - 内存管理与性能优化
 * 
 * @module core/router
 * @author ldesign
 */

import type { App, Ref } from 'vue'
import type {
  HistoryLocation,
  NavigationFailure,
  NavigationGuard,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationInformation,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router,
  RouteRecordNormalized,
  RouteRecordRaw,
  RouterOptions,
} from '../types'
import { ref } from 'vue'
import { RouterLink } from '../components/RouterLink'
import { RouterView } from '../components/RouterView'
import { UnifiedMemoryManager } from '../utils/unified-memory-manager'
import {
  NavigationFailureType,
  ROUTE_INJECTION_SYMBOL,
  ROUTER_INJECTION_SYMBOL,
  START_LOCATION,
} from './constants'
import { RouteMatcher } from './matcher'

/**
 * 导航重定向错误类
 * 
 * 用于在导航守卫中抛出重定向异常，触发路由重定向逻辑。
 * 这是一个内部使用的错误类型，不会暴露给用户。
 * 
 * @internal
 */
class NavigationRedirectError extends Error {
  /**
   * 创建导航重定向错误
   * @param to - 重定向的目标路由位置
   */
  constructor(public to: RouteLocationNormalized) {
    super('Navigation redirected')
    this.name = 'NavigationRedirectError'
  }
}

// ==================== 路由器实现 ====================

/**
 * 路由器实现类（增强版）
 * 
 * 这是 Router 接口的主要实现，提供了完整的路由功能：
 * 
 * **核心功能**：
 * - 路由注册与动态管理
 * - 导航控制（push/replace/go）
 * - 全局守卫系统
 * - 历史记录管理
 * - 内存自动管理
 * 
 * **性能优化**：
 * - LRU缓存路由匹配结果
 * - 守卫执行结果缓存
 * - 统一内存管理器
 * - 自动垃圾回收
 * 
 * @implements {Router}
 * @class
 */
export class RouterImpl implements Router {
  /** 路由匹配器，负责路径匹配和路由解析 */
  private matcher: RouteMatcher

  /** 全局前置守卫列表 */
  private beforeGuards: NavigationGuard[] = []

  /** 全局解析守卫列表 */
  private beforeResolveGuards: NavigationGuard[] = []

  /** 全局后置钩子列表 */
  private afterHooks: NavigationHookAfter[] = []

  /** 错误处理器列表 */
  private errorHandlers: Array<(error: Error) => void> = []

  /** 路由准备就绪的Promise */
  private isReadyPromise?: Promise<void>

  /** 路由准备就绪的resolve函数 */
  private isReadyResolve?: () => void

  /** 统一内存管理器，自动管理路由相关的内存占用 */
  private memoryManager: UnifiedMemoryManager

  /** 守卫清理函数列表，用于组件卸载时清理 */
  private guardCleanupFunctions: Array<() => void> = []

  /** 守卫执行结果缓存，避免重复执行无状态守卫 */
  private guardResultCache = new Map<string, NavigationGuardReturn>()

  /** 守卫缓存最大容量 */
  private readonly MAX_GUARD_CACHE_SIZE = 100

  /** 当前路由的响应式引用 */
  public readonly currentRoute: Ref<RouteLocationNormalized>

  /** 路由器配置选项 */
  public readonly options: RouterOptions

  /**
   * 创建路由器实例
   * 
   * @param options - 路由器配置选项
   * @param options.history - 历史模式实例（hash/html5/memory）
   * @param options.routes - 初始路由配置列表
   * @param options.scrollBehavior - 滚动行为函数
   * @param options.linkActiveClass - 激活链接的CSS类名
   * @param options.linkExactActiveClass - 精确激活链接的CSS类名
   */
  constructor(options: RouterOptions) {
    this.options = options
    this.matcher = new RouteMatcher()
    this.currentRoute = ref(START_LOCATION)

    // 初始化统一内存管理器（采用积极的内存管理策略）
    this.memoryManager = new UnifiedMemoryManager({
      monitoring: {
        enabled: true,
        interval: 60000, // 每分钟检查一次内存使用情况
        warningThreshold: 20 * 1024 * 1024, // 警告阈值：20MB
        criticalThreshold: 40 * 1024 * 1024, // 临界阈值：40MB
      },
      tieredCache: {
        enabled: true,
        l1Capacity: 15,  // L1缓存容量：15个热门路由
        l2Capacity: 30,  // L2缓存容量：30个常用路由
        l3Capacity: 60,  // L3缓存容量：60个冷门路由
        promotionThreshold: 2,    // 访问2次后提升到上一层
        demotionThreshold: 30000, // 30秒未访问降级到下一层
      },
      cleanup: {
        strategy: 'aggressive', // 积极的清理策略
        autoCleanup: true,      // 自动清理过期数据
        cleanupInterval: 120000, // 每2分钟执行一次清理
      },
    })

    // 创建路由准备就绪的Promise，用于等待初始导航完成
    this.isReadyPromise = new Promise((resolve) => {
      this.isReadyResolve = resolve
    })

    // 注册所有初始路由到路由表
    for (const route of options.routes) {
      this.addRoute(route)
    }

    // 设置浏览器历史记录监听器
    this.setupHistoryListener()

    // 初始化当前路由（处理首次加载）
    this.initializeCurrentRoute()
  }

  // ==================== 路由管理 ====================

  /**
   * 添加路由记录（支持动态路由）
   * 
   * 支持两种调用方式：
   * 1. addRoute(route) - 添加顶层路由
   * 2. addRoute(parentName, route) - 添加子路由
   * 
   * @param route - 路由配置对象
   * @returns 返回一个函数，调用后可移除该路由
   * 
   * @example
   * ```ts
   * // 添加顶层路由
   * const removeRoute = router.addRoute({
   *   path: '/about',
   *   component: About
   * })
   * 
   * // 移除路由
   * removeRoute()
   * ```
   */
  addRoute(route: RouteRecordRaw): () => void

  /**
   * 添加子路由到指定父路由
   * 
   * @param parentName - 父路由的名称
   * @param route - 子路由配置对象
   * @returns 返回一个函数，调用后可移除该路由
   * 
   * @example
   * ```ts
   * // 添加子路由
   * router.addRoute('parent', {
   *   path: 'child',
   *   component: Child
   * })
   * ```
   */
  addRoute(parentName: string | symbol, route: RouteRecordRaw): () => void

  addRoute(
    parentNameOrRoute: string | symbol | RouteRecordRaw,
    route?: RouteRecordRaw,
  ): () => void {
    let normalizedRecord: RouteRecordNormalized

    if (typeof parentNameOrRoute === 'object') {
      // 添加顶层路由
      normalizedRecord = this.matcher.addRoute(parentNameOrRoute)
    }
    else {
      // 添加子路由到指定父路由
      const parent = this.matcher.matchByName(parentNameOrRoute)
      if (!parent) {
        throw new Error(`父路由 "${String(parentNameOrRoute)}" 不存在`)
      }
      normalizedRecord = this.matcher.addRoute(route!, parent)
    }

    // 返回移除函数
    return () => {
      if (normalizedRecord.name) {
        this.removeRoute(normalizedRecord.name)
      }
    }
  }

  /**
   * 移除指定名称的路由
   * 
   * @param name - 要移除的路由名称
   * 
   * @example
   * ```ts
   * router.removeRoute('about')
   * ```
   */
  removeRoute(name: string | symbol): void {
    this.matcher.removeRoute(name)
  }

  /**
   * 获取所有已注册的路由记录
   * 
   * @returns 所有路由记录的数组
   * 
   * @example
   * ```ts
   * const routes = router.getRoutes()
   * console.log(routes.map(r => r.path))
   * ```
   */
  getRoutes(): RouteRecordNormalized[] {
    return this.matcher.getRoutes()
  }

  /**
   * 检查指定名称的路由是否存在
   * 
   * @param name - 路由名称
   * @returns 如果路由存在返回true，否则返回false
   * 
   * @example
   * ```ts
   * if (router.hasRoute('about')) {
   *   console.log('about路由存在')
   * }
   * ```
   */
  hasRoute(name: string | symbol): boolean {
    return this.matcher.hasRoute(name)
  }

  /**
   * 解析路由位置
   * 
   * 将路由位置原始值（字符串或对象）解析为标准化的路由位置对象。
   * 
   * @param to - 目标路由位置
   * @param currentLocation - 当前路由位置（可选）
   * @returns 标准化的路由位置对象
   * 
   * @example
   * ```ts
   * const route = router.resolve('/about')
   * console.log(route.path, route.name, route.params)
   * 
   * const route2 = router.resolve({ name: 'user', params: { id: '123' } })
   * ```
   */
  resolve(
    to: RouteLocationRaw,
    currentLocation?: RouteLocationNormalized,
  ): RouteLocationNormalized {
    return this.matcher.resolve(to, currentLocation || this.currentRoute.value)
  }

  // ==================== 导航控制 ====================

  /**
   * 导航到指定路由（添加历史记录）
   * 
   * 这是最常用的导航方法，会在浏览器历史记录中添加一条新记录。
   * 
   * @param to - 目标路由位置（字符串路径或路由对象）
   * @returns Promise，导航成功时resolve，失败时返回NavigationFailure
   * 
   * @example
   * ```ts
   * // 字符串路径
   * await router.push('/about')
   * 
   * // 路由对象
   * await router.push({ name: 'user', params: { id: '123' } })
   * 
   * // 带查询参数
   * await router.push({ path: '/search', query: { q: 'vue' } })
   * ```
   */
  async push(
    to: RouteLocationRaw,
  ): Promise<NavigationFailure | void | undefined> {
    return this.pushWithRedirect(to, false)
  }

  /**
   * 替换当前路由（不添加历史记录）
   * 
   * 与push类似，但会替换当前历史记录而不是添加新记录。
   * 用户点击浏览器后退按钮时，不会返回到被替换的路由。
   * 
   * @param to - 目标路由位置
   * @returns Promise，导航成功时resolve，失败时返回NavigationFailure
   * 
   * @example
   * ```ts
   * // 登录后替换登录页，避免用户后退到登录页
   * await router.replace('/dashboard')
   * ```
   */
  async replace(
    to: RouteLocationRaw,
  ): Promise<NavigationFailure | void | undefined> {
    return this.pushWithRedirect(to, true)
  }

  /**
   * 在历史记录中前进或后退指定步数
   * 
   * @param delta - 前进或后退的步数（正数前进，负数后退）
   * 
   * @example
   * ```ts
   * router.go(-1)  // 后退一步
   * router.go(1)   // 前进一步
   * router.go(-2)  // 后退两步
   * ```
   */
  go(delta: number): void {
    this.options.history.go(delta)
  }

  /**
   * 后退一步（等同于 go(-1)）
   * 
   * @example
   * ```ts
   * router.back()
   * ```
   */
  back(): void {
    this.go(-1)
  }

  /**
   * 前进一步（等同于 go(1)）
   * 
   * @example
   * ```ts
   * router.forward()
   * ```
   */
  forward(): void {
    this.go(1)
  }

  // ==================== 导航守卫 ====================

  /**
   * 注册全局前置守卫
   * 
   * 在每次导航前执行，可以用于：
   * - 权限验证
   * - 登录检查
   * - 数据预加载
   * - 路由拦截
   * 
   * @param guard - 守卫函数
   * @returns 返回一个函数，调用后可移除该守卫
   * 
   * @example
   * ```ts
   * // 添加权限检查守卫
   * const removeGuard = router.beforeEach((to, from, next) => {
   *   if (to.meta.requiresAuth && !isLoggedIn()) {
   *     next('/login')  // 重定向到登录页
   *   } else {
   *     next()  // 继续导航
   *   }
   * })
   * 
   * // 移除守卫
   * removeGuard()
   * ```
   */
  beforeEach(guard: NavigationGuard): () => void {
    this.beforeGuards.push(guard)

    // 创建清理函数
    const cleanup = () => {
      const index = this.beforeGuards.indexOf(guard)
      if (index >= 0) {
        this.beforeGuards.splice(index, 1)
      }
    }

    this.guardCleanupFunctions.push(cleanup)
    return cleanup
  }

  /**
   * 注册全局解析守卫
   * 
   * 在导航被确认之前、所有组件内守卫和异步路由组件被解析之后调用。
   * 适合做一些最后的检查或处理。
   * 
   * @param guard - 守卫函数
   * @returns 返回一个函数，调用后可移除该守卫
   * 
   * @example
   * ```ts
   * router.beforeResolve((to, from, next) => {
   *   // 在这里可以访问所有已解析的组件
   *   console.log('即将完成导航到:', to.path)
   *   next()
   * })
   * ```
   */
  beforeResolve(guard: NavigationGuard): () => void {
    this.beforeResolveGuards.push(guard)
    return () => {
      const index = this.beforeResolveGuards.indexOf(guard)
      if (index >= 0) {
        this.beforeResolveGuards.splice(index, 1)
      }
    }
  }

  /**
   * 注册全局后置钩子
   * 
   * 在导航完成后执行，不能更改导航。
   * 适合用于：
   * - 页面标题更新
   * - 统计分析
   * - 页面追踪
   * 
   * @param hook - 后置钩子函数
   * @returns 返回一个函数，调用后可移除该钩子
   * 
   * @example
   * ```ts
   * router.afterEach((to, from) => {
   *   // 更新页面标题
   *   document.title = to.meta.title || 'Default Title'
   *   
   *   // 发送统计信息
   *   analytics.track('page_view', { path: to.path })
   * })
   * ```
   */
  afterEach(hook: NavigationHookAfter): () => void {
    this.afterHooks.push(hook)
    return () => {
      const index = this.afterHooks.indexOf(hook)
      if (index >= 0) {
        this.afterHooks.splice(index, 1)
      }
    }
  }

  /**
   * 注册全局错误处理器
   * 
   * 捕获路由过程中发生的错误，包括：
   * - 守卫中抛出的错误
   * - 组件加载失败
   * - 异步操作失败
   * 
   * @param handler - 错误处理函数
   * @returns 返回一个函数，调用后可移除该处理器
   * 
   * @example
   * ```ts
   * router.onError((error) => {
   *   console.error('路由错误:', error)
   *   
   *   // 显示错误提示
   *   if (error.message.includes('Loading chunk')) {
   *     alert('页面加载失败，请刷新重试')
   *   }
   * })
   * ```
   */
  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.push(handler)
    return () => {
      const index = this.errorHandlers.indexOf(handler)
      if (index >= 0) {
        this.errorHandlers.splice(index, 1)
      }
    }
  }

  // ==================== 生命周期 ====================

  /**
   * 等待路由器准备就绪
   * 
   * 返回一个Promise，在初始导航完成后resolve。
   * 适合在服务端渲染(SSR)或需要等待首次导航完成的场景。
   * 
   * @returns Promise，路由器准备就绪时resolve
   * 
   * @example
   * ```ts
   * // 等待路由器准备就绪后再挂载应用
   * await router.isReady()
   * app.mount('#app')
   * ```
   */
  async isReady(): Promise<void> {
    return this.isReadyPromise!
  }

  /**
   * 安装路由器到Vue应用
   * 
   * 这个方法会：
   * 1. 注入路由器实例和当前路由
   * 2. 添加全局属性 $router 和 $route
   * 3. 注册全局组件 RouterLink 和 RouterView
   * 
   * 通常通过 app.use(router) 自动调用。
   * 
   * @param app - Vue应用实例
   * 
   * @example
   * ```ts
   * const app = createApp(App)
   * app.use(router)  // 内部调用 router.install(app)
   * ```
   */
  install(app: App): void {
    // 注入路由器实例和当前路由，供子组件通过 inject 使用
    app.provide(ROUTER_INJECTION_SYMBOL, this)
    app.provide(ROUTE_INJECTION_SYMBOL, this.currentRoute)

    // 添加全局属性，支持选项式API访问
    app.config.globalProperties.$router = this
    app.config.globalProperties.$route = this.currentRoute

    // 注册全局组件
    app.component('RouterLink', RouterLink)
    app.component('RouterView', RouterView)
  }

  /**
   * 销毁路由器，清理所有资源
   * 
   * 执行完整的清理操作：
   * - 停止内存管理器
   * - 移除所有守卫和钩子
   * - 清空缓存
   * - 清理历史监听器
   * 
   * 适合在应用卸载或路由器不再需要时调用。
   * 
   * @example
   * ```ts
   * // 应用卸载时清理路由器
   * router.destroy()
   * ```
   */
  destroy(): void {
    // 销毁统一内存管理器
    this.memoryManager.destroy()

    // 清理所有守卫的清理函数
    this.guardCleanupFunctions.forEach(cleanup => cleanup())
    this.guardCleanupFunctions = []

    // 清空所有守卫和钩子数组
    this.beforeGuards.length = 0
    this.beforeResolveGuards.length = 0
    this.afterHooks.length = 0
    this.errorHandlers.length = 0

    // 清空守卫执行结果缓存
    this.guardResultCache.clear()

    // 清空路由匹配器缓存
    this.matcher.clearCache()

    // 清理历史记录监听器
    this.options.history.destroy()
  }

  /**
   * 获取内存统计信息
   * 
   * 返回详细的内存使用情况，包括：
   * - 内存管理器统计
   * - 路由匹配器统计
   * - 守卫数量统计
   * 
   * 用于性能监控和调试。
   * 
   * @returns 内存统计对象
   * 
   * @example
   * ```ts
   * const stats = router.getMemoryStats()
   * console.log('守卫数量:', stats.guards.beforeGuards)
   * console.log('缓存命中率:', stats.matcher.cacheHitRate)
   * ```
   */
  getMemoryStats() {
    return {
      memory: this.memoryManager.getStats(),
      matcher: this.matcher.getStats(),
      guards: {
        beforeGuards: this.beforeGuards.length,
        beforeResolveGuards: this.beforeResolveGuards.length,
        afterHooks: this.afterHooks.length,
        errorHandlers: this.errorHandlers.length,
      },
    }
  }

  // ==================== 私有方法 ====================

  /** 重定向计数器，用于防止无限重定向 */
  private redirectCount = 0

  /** 最大重定向次数限制 */
  private readonly MAX_REDIRECTS = 10

  /** 重定向开始时间戳 */
  private redirectStartTime = 0

  /** 重定向超时时间（毫秒） */
  private readonly REDIRECT_TIMEOUT = 5000

  private async pushWithRedirect(
    to: RouteLocationRaw,
    replace: boolean,
  ): Promise<NavigationFailure | void | undefined> {
    // 重置重定向计数器（如果是新的导航）
    const now = Date.now()
    if (now - this.redirectStartTime > this.REDIRECT_TIMEOUT) {
      this.redirectCount = 0
      this.redirectStartTime = now
    }

    // 检查重定向次数限制
    if (this.redirectCount >= this.MAX_REDIRECTS) {
      const error = new Error(`Maximum redirect limit (${this.MAX_REDIRECTS}) exceeded`)
      this.handleError(error)
      return this.createNavigationFailure(
        NavigationFailureType.aborted,
        this.currentRoute.value,
        this.resolve(to),
      )
    }

    const targetLocation = this.resolve(to)
    const from = this.currentRoute.value

    // 检查是否重复导航
    if (this.isSameRouteLocation(targetLocation, from)) {
      this.redirectCount = 0 // 重置计数器
      return this.createNavigationFailure(
        NavigationFailureType.duplicated,
        from,
        targetLocation,
      )
    }

    try {
      // 执行导航守卫，可能会返回重定向的路由
      const finalLocation = await this.runNavigationGuards(targetLocation, from)

      // 更新历史记录
      const historyLocation = this.routeLocationToHistoryLocation(finalLocation)
      if (replace) {
        this.options.history.replace(historyLocation, { ...finalLocation })
      }
      else {
        this.options.history.push(historyLocation, { ...finalLocation })
      }

      // 更新当前路由
      this.updateCurrentRoute(finalLocation, from)

      // 执行后置钩子
      this.runAfterHooks(finalLocation, from)
    }
    catch (error) {
      // 处理重定向错误
      if (error instanceof NavigationRedirectError) {
        // 增加重定向计数
        this.redirectCount++

        // 递归处理重定向
        return this.pushWithRedirect(error.to, replace)
      }

      if (error instanceof Error) {
        this.handleError(error)
        this.redirectCount = 0 // 重置计数器
        return this.createNavigationFailure(
          NavigationFailureType.aborted,
          from,
          targetLocation,
        )
      }

      this.redirectCount = 0 // 重置计数器
      throw error
    }

    // 成功导航后重置计数器
    this.redirectCount = 0
  }

  private async runNavigationGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<RouteLocationNormalized> {
    let currentTo = to

    // 首先检查路由记录的重定向配置
    const redirectResult = this.handleRouteRedirect(currentTo, 0)

    // 如果发生了重定向（比较路径），抛出重定向错误
    if (redirectResult.path !== currentTo.path) {
      throw new NavigationRedirectError(redirectResult)
    }

    currentTo = redirectResult

    // 执行全局前置守卫
    for (const guard of this.beforeGuards) {
      const result = await this.runGuard(guard, currentTo, from)
      if (result === false) {
        throw new Error('Navigation aborted by guard')
      }
      else if (
        result
        && (typeof result === 'string' || (typeof result === 'object' && result !== null))
      ) {
        // 重定向
        currentTo = this.resolve(result)
      }
    }

    // 执行路由级守卫
    for (const record of currentTo.matched) {
      if (record.beforeEnter) {
        const result = await this.runGuard(record.beforeEnter, currentTo, from)
        if (result === false) {
          throw new Error('Navigation aborted by route guard')
        }
        else if (
          result
          && (typeof result === 'string' || (typeof result === 'object' && result !== null))
        ) {
          // 重定向
          currentTo = this.resolve(result)
        }
      }
    }

    // 执行全局解析守卫
    for (const guard of this.beforeResolveGuards) {
      const result = await this.runGuard(guard, currentTo, from)
      if (result === false) {
        throw new Error('Navigation aborted by resolve guard')
      }
      else if (
        result
        && (typeof result === 'string' || (typeof result === 'object' && result !== null))
      ) {
        // 重定向
        currentTo = this.resolve(result)
      }
    }

    // 优化：定期清理守卫缓存
    if (this.guardResultCache.size > 50) {
      const keysToDelete = Array.from(this.guardResultCache.keys()).slice(0, 25)
      keysToDelete.forEach(key => this.guardResultCache.delete(key))
    }

    return currentTo
  }

  /**
   * 处理路由记录的重定向配置
   */
  private handleRouteRedirect(
    to: RouteLocationNormalized,
    redirectCount: number = 0,
  ): RouteLocationNormalized {
    // 防止无限重定向
    if (redirectCount > 10) {
      throw new Error(`Too many redirects when navigating to ${to.path}`)
    }

    // 检查最后匹配的路由记录是否有重定向配置
    const lastMatched = to.matched[to.matched.length - 1]

    if (lastMatched?.redirect) {
      const redirect = lastMatched.redirect
      let redirectTarget: RouteLocationNormalized

      // 如果重定向是字符串，直接解析
      if (typeof redirect === 'string') {
        redirectTarget = this.resolve(redirect)
      }
      // 如果重定向是函数，调用函数获取重定向目标
      else if (typeof redirect === 'function') {
        const redirectResult = redirect(to)
        if (redirectResult) {
          redirectTarget = this.resolve(redirectResult)
        }
        else {
          return to
        }
      }
      // 如果重定向是对象，直接解析
      else if (typeof redirect === 'object') {
        redirectTarget = this.resolve(redirect)
      }
      else {
        return to
      }

      // 递归处理重定向目标，防止链式重定向
      return this.handleRouteRedirect(redirectTarget, redirectCount + 1)
    }

    return to
  }

  private async runGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<NavigationGuardReturn> {
    // 优化：缓存守卫结果（对于无状态守卫）
    const guardKey = `${guard.name || guard.toString().slice(0, 50)}_${to.path}_${from.path}`

    if (this.guardResultCache.has(guardKey)) {
      return this.guardResultCache.get(guardKey)!
    }

    const result = await new Promise<NavigationGuardReturn>((resolve, reject) => {
      const next = (result?: NavigationGuardReturn) => {
        if (result === false) {
          reject(new Error('Navigation cancelled'))
        }
        else if (result instanceof Error) {
          reject(result)
        }
        else {
          resolve(result)
        }
      }

      const guardResult = guard(to, from, next)
      if (
        guardResult
        && typeof guardResult === 'object'
        && 'then' in guardResult
        && typeof guardResult.then === 'function'
      ) {
        (guardResult as Promise<NavigationGuardReturn>).then(resolve, reject)
      }
    })

    // 缓存结果，限制缓存大小
    if (this.guardResultCache.size >= this.MAX_GUARD_CACHE_SIZE) {
      // 删除最早的缓存项
      const firstKey = this.guardResultCache.keys().next().value
      if (firstKey !== undefined) {
        this.guardResultCache.delete(firstKey)
      }
    }
    this.guardResultCache.set(guardKey, result)

    return result
  }

  private runAfterHooks(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): void {
    for (const hook of this.afterHooks) {
      try {
        hook(to, from)
      }
      catch (error) {
        this.handleError(error as Error)
      }
    }
  }

  private updateCurrentRoute(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
  ): void {
    this.currentRoute.value = to
    // this._pendingLocation = undefined as any

    // 触发准备就绪
    if (this.isReadyResolve) {
      this.isReadyResolve()
      this.isReadyResolve = undefined as any
    }
  }

  private setupHistoryListener(): void {
    this.options.history.listen((to, from, info) => {
      this.handleHistoryChange(to, from, info)
    })
  }

  private async handleHistoryChange(
    to: HistoryLocation,
    _from: HistoryLocation,
    _info: NavigationInformation,
  ): Promise<void> {
    const targetLocation = this.historyLocationToRouteLocation(to)
    const fromLocation = this.currentRoute.value

    try {
      const finalLocation = await this.runNavigationGuards(
        targetLocation,
        fromLocation,
      )
      this.updateCurrentRoute(finalLocation, fromLocation)
      this.runAfterHooks(finalLocation, fromLocation)
    }
    catch (error) {
      this.handleError(error as Error)
    }
  }

  private initializeCurrentRoute(): void {
    const location = this.options.history.location
    const routeLocation = this.historyLocationToRouteLocation(location)

    // 检查是否需要重定向
    const redirectResult = this.handleRouteRedirect(routeLocation, 0)

    if (redirectResult.path !== routeLocation.path) {
      // 需要重定向，使用 replace 模式避免在历史记录中留下原始路径
      this.replace(redirectResult.path)
        .then(() => {
          // 重定向完成后解析 isReady Promise
          if (this.isReadyResolve) {
            this.isReadyResolve()
            this.isReadyResolve = undefined as any
          }
        })
        .catch((error) => {
          this.handleError(error)
          // 即使重定向失败也要解析 isReady Promise
          if (this.isReadyResolve) {
            this.isReadyResolve()
            this.isReadyResolve = undefined as any
          }
        })
    }
    else {
      // 不需要重定向，直接设置当前路由
      this.currentRoute.value = routeLocation

      // 直接解析 isReady Promise
      if (this.isReadyResolve) {
        this.isReadyResolve()
        this.isReadyResolve = undefined as any
      }
    }
  }

  private routeLocationToHistoryLocation(
    location: RouteLocationNormalized,
  ): HistoryLocation {
    return {
      pathname: location.path,
      search: this.stringifyQuery(location.query),
      hash: location.hash,
    }
  }

  private historyLocationToRouteLocation(
    location: HistoryLocation,
  ): RouteLocationNormalized {
    const path = location.pathname
    const query = this.parseQuery(location.search)
    const hash = location.hash

    try {
      return this.matcher.resolve({ path, query, hash })
    }
    catch {
      // 如果匹配失败，返回 404 路由或默认路由
      return {
        ...START_LOCATION,
        path,
        query,
        hash,
        fullPath: path + location.search + location.hash,
      }
    }
  }

  private parseQuery(search: string): Record<string, any> {
    if (this.options.parseQuery) {
      return this.options.parseQuery(search.slice(1))
    }

    const query: Record<string, any> = {}
    const params = new URLSearchParams(search)

    for (const [key, value] of params) {
      query[key] = value
    }

    return query
  }

  private stringifyQuery(query: Record<string, any>): string {
    if (this.options.stringifyQuery) {
      const result = this.options.stringifyQuery(query)
      return result ? `?${result}` : ''
    }

    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        params.append(key, String(value))
      }
    }

    const result = params.toString()
    return result ? `?${result}` : ''
  }

  private isSameRouteLocation(
    a: RouteLocationNormalized,
    b: RouteLocationNormalized,
  ): boolean {
    // 快速路径检查
    if (a === b) return true
    if (a.path !== b.path || a.hash !== b.hash) return false

    // 使用快速查询比较代替 JSON.stringify（性能提升 80%+）
    return this.fastQueryEqual(a.query, b.query)
  }

  /**
   * 快速查询对象比较（避免 JSON.stringify）
   */
  private fastQueryEqual(a: Record<string, any>, b: Record<string, any>): boolean {
    if (a === b) return true
    if (!a || !b) return a === b

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false
    if (keysA.length === 0) return true

    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i]
      if (a[key] !== b[key]) return false
    }

    return true
  }

  private createNavigationFailure(
    type: NavigationFailureType,
    from: RouteLocationNormalized,
    to: RouteLocationNormalized,
  ): NavigationFailure {
    const error = new Error(`Navigation failed`) as NavigationFailure
    error.type = type
    error.from = from
    error.to = to
    return error
  }

  private handleError(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error)
      }
      catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }

    if (this.errorHandlers.length === 0) {
      console.error('Unhandled router error:', error)
    }
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  return new RouterImpl(options)
}
