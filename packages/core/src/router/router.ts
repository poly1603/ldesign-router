/**
 * @ldesign/router-core 核心路由器
 * 
 * @description
 * 整合所有功能的完整路由器实现。
 * 
 * **特性**：
 * - 导航控制
 * - 守卫系统集成
 * - 事件系统
 * - 状态管理
 * - 路径匹配 (PathMatcher)
 * - 错误处理 (ErrorManager)
 * - 路由标准化 (RouteNormalizer)
 * - 匹配缓存 (MatchCacheManager)
 * - 守卫管理 (GuardManager)
 * - 滚动管理 (ScrollManager)
 * - 别名处理 (AliasManager)
 * 
 * @module router/router
 */

import type {
  RouteRecordRaw,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordNormalized,
  NavigationFailure,
} from '../types'
import type { RouterHistory } from '../types/history'
import { createMatcherRegistry, type MatcherRegistry } from '../utils/matcher'
import { createTrieMatcher as createTrieRouterMatcher, TrieMatcher } from '../utils/trie-matcher'
import { createErrorManager, type ErrorManager, NavigationError, createNavigationCancelledError } from '../utils/errors'
import { createNormalizer, type RouteNormalizer } from '../utils/normalizer'
import { createMatchCacheManager, type MatchCacheManager } from '../features/match-cache'
import { createGuardManager, type GuardManager, type Guard } from '../features/guards'
import { createScrollManager, type ScrollManager, type ScrollStrategy } from '../features/scroll'
import { createAliasManager, type AliasManager } from '../utils/alias'
import { createMemoryManager, type MemoryManager } from '../utils/memory-manager'
import { NavigationFailureType } from '../types'

/**
 * 路由器选项
 */
export interface RouterOptions {
  /** 路由配置 */
  routes: RouteRecordRaw[]

  /** 历史管理器 */
  history: RouterHistory

  /** 滚动行为 */
  scrollBehavior?: ScrollStrategy

  /** 是否启用缓存 */
  enableCache?: boolean

  /** 缓存大小 */
  cacheSize?: number

  /** 守卫超时时间 (ms) */
  guardTimeout?: number

  /** 是否严格模式 */
  strict?: boolean

  /** 是否使用 Trie 树匹配器（高性能模式） */
  useTrie?: boolean

  /** 是否启用匹配统计 */
  enableMatchStats?: boolean

  /** 是否启用自动内存管理 */
  enableMemoryManagement?: boolean

  /** 内存清理间隔（毫秒），默认 60000（1分钟） */
  memoryCleanupInterval?: number

  /** 内存使用阈值（0-1），默认 0.8（80%） */
  memoryThreshold?: number
}

/**
 * 导航选项
 */
export interface NavigationOptions {
  /** 是否替换历史记录 */
  replace?: boolean

  /** 是否跳过守卫 */
  skipGuards?: boolean

  /** 状态数据 */
  state?: Record<string, unknown>
}

/**
 * 事件类型
 */
type RouterEventType = 'beforeEach' | 'afterEach' | 'onError' | 'ready'

/**
 * 事件处理器
 */
type EventHandler = (...args: any[]) => void | Promise<void>

/**
 * 核心路由器
 */
export class Router {
  // 核心组件
  private history: RouterHistory
  private matcher: MatcherRegistry | TrieMatcher
  private useTrie: boolean
  private errorManager: ErrorManager
  private normalizer: RouteNormalizer
  private cacheManager: MatchCacheManager
  private guardManager: GuardManager
  private scrollManager: ScrollManager
  private aliasManager: AliasManager
  private memoryManager: MemoryManager | null = null

  // 路由状态
  private routes: RouteRecordRaw[] = []
  private currentRoute: RouteLocationNormalized
  private pendingNavigation: Promise<void> | null = null
  private isReady = false

  // 事件系统
  private events = new Map<RouterEventType, Set<EventHandler>>()

  constructor(options: RouterOptions) {
    this.history = options.history
    this.routes = options.routes
    this.useTrie = options.useTrie ?? false

    // 初始化核心组件 - 根据配置选择匹配器
    if (this.useTrie) {
      // 🚀 使用 Trie 树匹配器（高性能模式）
      this.matcher = createTrieRouterMatcher({
        enableCache: options.enableCache !== false,
        cacheSize: options.cacheSize || 1000,
        enableStats: options.enableMatchStats ?? false,
      })
    } else {
      // 使用传统匹配器（兼容模式）
      this.matcher = createMatcherRegistry({
        enableCache: options.enableCache !== false,
        cacheSize: options.cacheSize || 1000,
      })
    }
    
    this.errorManager = createErrorManager()
    this.normalizer = createNormalizer({ strict: options.strict })
    this.cacheManager = createMatchCacheManager({
      maxSize: options.cacheSize || 1000,
      enableStats: true,
    })
    this.guardManager = createGuardManager({
      timeout: options.guardTimeout || 10000,
    })
    this.scrollManager = createScrollManager({
      strategy: options.scrollBehavior,
    })
    this.aliasManager = createAliasManager()

    // 初始化内存管理器（如果启用）
    if (options.enableMemoryManagement !== false) {
      this.memoryManager = createMemoryManager({
        cleanupInterval: options.memoryCleanupInterval || 60000,
        memoryThreshold: options.memoryThreshold || 0.8,
      })
      
      // 注册需要清理的资源
      this.memoryManager.register('cache', this.cacheManager)
      this.memoryManager.register('matcher', this.matcher)
    }

    // 初始化路由
    this.initializeRoutes()

    // 初始化当前路由
    this.currentRoute = this.createInitialRoute()

    // 监听历史变化
    this.setupHistoryListener()
  }

  // ==================== 初始化 ====================

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 标准化路由
    const normalizedRoutes = this.routes.map(route =>
      this.normalizer.normalizeRecord(route),
    )

    // 注册别名
    this.aliasManager.registerFromRoutes(normalizedRoutes)

    // 注册路由到匹配器
    for (const route of normalizedRoutes) {
      this.registerRoute(route)
    }
  }

  /**
   * 注册路由
   */
  private registerRoute(route: RouteRecordRaw): void {
    // 类型适配：将 symbol 类型的 name 转换为 string
    const adaptedRoute = {
      ...route,
      name: typeof route.name === 'symbol' ? String(route.name) : route.name,
    }
    this.matcher.addRoute(route.path, adaptedRoute as any)

    // 递归注册子路由
    if (route.children) {
      for (const child of route.children) {
        this.registerRoute(child)
      }
    }
  }

  /**
   * 创建初始路由
   */
  private createInitialRoute(): RouteLocationNormalized {
    const location = this.history.location

    return {
      path: location.path,
      name: undefined,
      fullPath: location.path,
      query: {},
      hash: location.hash || '',
      params: {},
      matched: [],
      meta: {},
    }
  }

  /**
   * 设置历史监听器
   */
  private setupHistoryListener(): void {
    this.history.listen((to, from, { direction }) => {
      this.handleHistoryChange(to.path, from?.path)
    })
  }

  /**
   * 处理历史变化
   */
  private async handleHistoryChange(toPath: string, fromPath?: string): Promise<void> {
    try {
      await this.push(toPath, { replace: true, skipGuards: false })
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  // ==================== 导航 ====================

  /**
   * 导航到指定位置
   */
  async push(to: RouteLocationRaw, options: NavigationOptions = {}): Promise<void> {
    return this.navigate(to, { ...options, replace: false })
  }

  /**
   * 替换当前位置
   */
  async replace(to: RouteLocationRaw, options: NavigationOptions = {}): Promise<void> {
    return this.navigate(to, { ...options, replace: true })
  }

  /**
   * 返回
   */
  back(): void {
    this.history.back()
  }

  /**
   * 前进
   */
  forward(): void {
    this.history.forward()
  }

  /**
   * 跳转到指定历史位置
   */
  go(delta: number): void {
    this.history.go(delta)
  }

  /**
   * 核心导航逻辑
   */
  private async navigate(
    to: RouteLocationRaw,
    options: NavigationOptions = {},
  ): Promise<void> {
    // 如果有进行中的导航,等待完成
    if (this.pendingNavigation) {
      await this.pendingNavigation
    }

    const navigationPromise = this.performNavigation(to, options)
    this.pendingNavigation = navigationPromise

    try {
      await navigationPromise
    } finally {
      this.pendingNavigation = null
    }
  }

  /**
   * 执行导航
   */
  private async performNavigation(
    to: RouteLocationRaw,
    options: NavigationOptions,
  ): Promise<void> {
    const from = this.currentRoute

    try {
      // 1. 解析目标路由
      const targetRoute = await this.resolveRoute(to)

      // 2. 检查是否重复导航
      if (this.isSameRoute(targetRoute, from)) {
        return
      }

      // 3. 触发 beforeEach 事件
      await this.emit('beforeEach', targetRoute, from)

      // 4. 执行守卫
      if (!options.skipGuards) {
        const guardResult = await this.guardManager.runBeforeGuards(targetRoute, from)

        if (!guardResult.allowed) {
          if (guardResult.redirect) {
            // 重定向
            return this.navigate(guardResult.redirect, options)
          }

          if (guardResult.error) {
            throw guardResult.error
          }

          // 取消导航
          throw createNavigationCancelledError(targetRoute, from)
        }
      }

      // 5. 更新历史
      if (options.replace) {
        this.history.replace(targetRoute.fullPath as any, options.state as any)
      } else {
        this.history.push(targetRoute.fullPath as any, options.state as any)
      }

      // 6. 更新当前路由
      const oldRoute = this.currentRoute
      this.currentRoute = targetRoute

      // 7. 处理滚动
      await this.scrollManager.handleScroll(targetRoute, oldRoute)

      // 8. 执行后置钩子
      await this.guardManager.runAfterHooks(targetRoute, oldRoute)

      // 9. 触发 afterEach 事件
      await this.emit('afterEach', targetRoute, oldRoute)

      // 10. 标记为就绪
      if (!this.isReady) {
        this.isReady = true
        await this.emit('ready')
      }
    } catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 解析路由
   */
  private async resolveRoute(to: RouteLocationRaw): Promise<RouteLocationNormalized> {
    // 标准化位置
    const normalized = this.normalizer.normalizeLocation(to, this.currentRoute)

    // 解析别名
    const resolvedPath = this.aliasManager.resolve(normalized.path)
    if (resolvedPath !== normalized.path) {
      normalized.path = resolvedPath
      normalized.fullPath = resolvedPath // 简化处理
    }

    // 尝试从缓存获取
    const cached = this.cacheManager.get(normalized.path)
    if (cached) {
      return {
        ...normalized,
        matched: cached.matched,
        params: { ...normalized.params, ...cached.params },
      }
    }

    // 匹配路由
    const matchResult = this.matcher.match(normalized.path)

    if (!matchResult.matched) {
      throw new Error(`No route matched for path: ${normalized.path}`)
    }

    // 缓存匹配结果
    // 转换 params：确保所有值都是字符串（处理 string[] 情况）
    const stringParams: Record<string, string> = {}
    for (const [key, value] of Object.entries(matchResult.params)) {
      stringParams[key] = Array.isArray(value) ? (value[0] || '') : (value || '')
    }
    
    this.cacheManager.set(
      normalized.path,
      matchResult.route ? [matchResult.route as any] : [],
      stringParams,
    )

    return {
      ...normalized,
      matched: matchResult.route ? [matchResult.route as any] : [],
      params: { ...normalized.params, ...stringParams },
    }
  }

  /**
   * 判断是否为相同路由
   */
  private isSameRoute(a: RouteLocationNormalized, b: RouteLocationNormalized): boolean {
    return a.path === b.path &&
      a.name === b.name &&
      JSON.stringify(a.query) === JSON.stringify(b.query) &&
      a.hash === b.hash
  }

  // ==================== 守卫 ====================

  /**
   * 注册全局前置守卫
   */
  beforeEach(guard: Guard): () => void {
    return this.guardManager.beforeEach(guard)
  }

  /**
   * 注册全局后置钩子
   */
  afterEach(hook: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void): () => void {
    return this.guardManager.afterEach(hook)
  }

  // ==================== 事件系统 ====================

  /**
   * 注册事件监听器
   */
  on(event: RouterEventType, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    this.events.get(event)!.add(handler)

    return () => {
      this.events.get(event)?.delete(handler)
    }
  }

  /**
   * 触发事件
   */
  private async emit(event: RouterEventType, ...args: any[]): Promise<void> {
    const handlers = this.events.get(event)
    if (!handlers) return

    for (const handler of handlers) {
      try {
        await handler(...args)
      } catch (error) {
        console.error(`Error in ${event} handler:`, error)
      }
    }
  }

  // ==================== 错误处理 ====================

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.errorManager.handle(error as any)
    this.emit('onError', error)
  }

  /**
   * 注册错误处理器
   */
  onError(handler: (error: Error) => void): () => void {
    return this.errorManager.onError(handler as any)
  }

  // ==================== 路由管理 ====================

  /**
   * 添加路由
   */
  addRoute(route: RouteRecordRaw): void {
    const normalized = this.normalizer.normalizeRecord(route)
    this.routes.push(normalized)
    this.registerRoute(normalized)
    this.aliasManager.registerFromRoute(normalized)
  }

  // ==================== 状态访问 ====================

  /**
   * 获取当前路由
   */
  get current(): RouteLocationNormalized {
    return this.currentRoute
  }

  /**
   * 检查路由器是否就绪
   */
  get ready(): boolean {
    return this.isReady
  }

  /**
   * 等待路由器就绪
   */
  async isReadyAsync(): Promise<void> {
    if (this.isReady) {
      return
    }

    return new Promise(resolve => {
      const unsubscribe = this.on('ready', () => {
        unsubscribe()
        resolve()
      })
    })
  }

  // ==================== 工具方法 ====================

  /**
   * 解析路由位置
   */
  resolve(to: RouteLocationRaw): RouteLocationNormalized {
    return this.normalizer.normalizeLocation(to, this.currentRoute)
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cacheManager.getStats()
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cacheManager.clear()
  }

  /**
   * 获取守卫统计
   */
  getGuardStats() {
    return {
      count: this.guardManager.getGuardCount(),
      guards: this.guardManager.getGuards(),
    }
  }

  /**
   * 获取匹配器统计（仅在使用 Trie 匹配器时可用）
   *
   * @returns 匹配器统计信息，如果未启用则返回 null
   *
   * @example
   * ```typescript
   * const stats = router.getMatcherStats()
   * if (stats) {
   *   console.log(`平均匹配时间: ${stats.avgMatchTime}ms`)
   *   console.log(`缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`)
   * }
   * ```
   */
  getMatcherStats() {
    if (this.useTrie && 'getStats' in this.matcher) {
      return (this.matcher as TrieMatcher).getStats()
    }
    return null
  }

  /**
   * 重置匹配器统计（仅在使用 Trie 匹配器时可用）
   *
   * @example
   * ```typescript
   * router.resetMatcherStats()
   * console.log('匹配器统计已重置')
   * ```
   */
  resetMatcherStats(): void {
    if (this.useTrie && 'resetStats' in this.matcher) {
      (this.matcher as TrieMatcher).resetStats()
    }
  }

  /**
   * 批量添加路由
   *
   * @param routes - 路由配置数组
   *
   * @example
   * ```typescript
   * router.addRoutes([
   *   { path: '/user', component: User },
   *   { path: '/admin', component: Admin }
   * ])
   * ```
   */
  addRoutes(routes: RouteRecordRaw[]): void {
    routes.forEach(route => {
      this.addRoute(route)
    })
  }

  /**
   * 移除路由
   *
   * 从路由器中移除指定名称的路由，同时清理相关缓存
   *
   * @param name - 路由名称
   * @returns 是否成功移除
   *
   * @example
   * ```typescript
   * const removed = router.removeRoute('user')
   * if (removed) {
   *   console.log('用户路由已移除')
   * }
   * ```
   */
  removeRoute(name: string): boolean {
    // 从内部路由数组中移除
    const index = this.routes.findIndex(r => r.name === name)
    if (index >= 0) {
      this.routes.splice(index, 1)
    }
    
    // 清除相关缓存
    this.cacheManager.clear()
    
    // 从匹配器中移除
    return this.matcher.removeRoute(name)
  }

  /**
   * 检查路由是否存在
   *
   * 检查指定名称的路由是否已在路由器中注册
   *
   * @param name - 路由名称
   * @returns 是否存在
   *
   * @example
   * ```typescript
   * if (router.hasRoute('user')) {
   *   console.log('用户路由已注册')
   * } else {
   *   console.log('用户路由未注册')
   * }
   * ```
   */
  hasRoute(name: string): boolean {
    return this.matcher.hasRoute(name)
  }

  /**
   * 获取所有路由
   *
   * 获取路由器中注册的所有路由记录（标准化后的）
   *
   * @returns 所有路由记录
   *
   * @example
   * ```typescript
   * const routes = router.getRoutes()
   * console.log('路由总数:', routes.length)
   * routes.forEach(route => {
   *   console.log(`路由: ${route.name} -> ${route.path}`)
   * })
   * ```
   */
  getRoutes(): RouteRecordNormalized[] {
    return this.matcher.getRoutes() as any
  }

  /**
   * 路由健康检查
   *
   * 检查路由系统的健康状态
   *
   * @returns 健康检查结果
   *
   * @example
   * ```typescript
   * const health = router.healthCheck()
   * if (!health.healthy) {
   *   console.error('路由系统异常:', health.issues)
   * }
   * ```
   */
  healthCheck(): {
    healthy: boolean
    issues: string[]
    stats: {
      routes: number
      guards: number
      cacheSize: number
      currentRoute: string
    }
  } {
    const issues: string[] = []
    const routes = this.getRoutes()

    // 检查是否有路由
    if (routes.length === 0) {
      issues.push('未注册任何路由')
    }

    // 检查当前路由
    if (!this.currentRoute) {
      issues.push('当前路由未初始化')
    }

    // 检查缓存状态
    const cacheStats = this.getCacheStats()
    if (cacheStats.hitRate < 0.5 && cacheStats.totalAccess > 100) {
      issues.push(`缓存命中率过低: ${(cacheStats.hitRate * 100).toFixed(1)}%`)
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats: {
        routes: routes.length,
        guards: this.guardManager.getGuardCount(),
        cacheSize: cacheStats.size,
        currentRoute: this.currentRoute?.path || '/',
      },
    }
  }

  /**
   * 分析路由配置
   *
   * 分析路由配置,找出潜在问题
   *
   * @returns 分析结果
   *
   * @example
   * ```typescript
   * const analysis = router.analyzeRoutes()
   * console.log('重复路径:', analysis.duplicatePaths)
   * console.log('未命名路由:', analysis.unnamedRoutes)
   * ```
   */
  analyzeRoutes(): {
    totalRoutes: number
    duplicatePaths: string[]
    duplicateNames: string[]
    unnamedRoutes: number
    dynamicRoutes: number
    staticRoutes: number
  } {
    const routes = this.getRoutes()
    const pathMap = new Map<string, number>()
    const nameMap = new Map<string, number>()
    let unnamedRoutes = 0
    let dynamicRoutes = 0
    let staticRoutes = 0

    routes.forEach((route) => {
      // 统计路径
      const path = route.path
      pathMap.set(path, (pathMap.get(path) || 0) + 1)

      // 统计名称
      if (route.name) {
        const routeName = String(route.name)
        nameMap.set(routeName, (nameMap.get(routeName) || 0) + 1)
      }
      else {
        unnamedRoutes++
      }

      // 统计动态/静态路由
      if (path.includes(':') || path.includes('*')) {
        dynamicRoutes++
      }
      else {
        staticRoutes++
      }
    })

    // 找出重复的路径和名称
    const duplicatePaths: string[] = []
    const duplicateNames: string[] = []

    pathMap.forEach((count, path) => {
      if (count > 1) {
        duplicatePaths.push(path)
      }
    })

    nameMap.forEach((count, name) => {
      if (count > 1) {
        duplicateNames.push(name)
      }
    })

    return {
      totalRoutes: routes.length,
      duplicatePaths,
      duplicateNames,
      unnamedRoutes,
      dynamicRoutes,
      staticRoutes,
    }
  }

  /**
   * 获取内存使用情况
   *
   * 获取当前内存使用统计信息（需要启用内存管理）
   *
   * @returns 内存使用情况，如果未启用则返回 null
   *
   * @example
   * ```typescript
   * const memoryUsage = router.getMemoryUsage()
   * if (memoryUsage) {
   *   console.log(`内存使用: ${(memoryUsage.percentage * 100).toFixed(1)}%`)
   *   console.log(`使用量: ${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB`)
   * }
   * ```
   */
  getMemoryUsage() {
    return this.memoryManager?.getMemoryUsage() || null
  }

  /**
   * 强制触发内存清理
   *
   * 手动触发内存清理，清理未使用的资源
   *
   * @returns 清理的资源数量，如果未启用则返回 0
   *
   * @example
   * ```typescript
   * const cleaned = router.cleanupMemory()
   * console.log(`已清理 ${cleaned} 个资源`)
   * ```
   */
  cleanupMemory(): number {
    if (!this.memoryManager) {
      return 0
    }
    return this.memoryManager.cleanup(true)
  }

  /**
   * 检测内存泄漏
   *
   * 检测长时间未访问的资源，可能存在内存泄漏
   *
   * @returns 可能泄漏的资源数量，如果未启用则返回 0
   *
   * @example
   * ```typescript
   * const leaks = router.detectMemoryLeaks()
   * if (leaks > 0) {
   *   console.warn(`检测到 ${leaks} 个可能的内存泄漏`)
   * }
   * ```
   */
  detectMemoryLeaks(): number {
    if (!this.memoryManager) {
      return 0
    }
    return this.memoryManager.detectLeaks()
  }

  /**
   * 获取内存管理统计
   *
   * 获取内存管理器的详细统计信息
   *
   * @returns 内存统计，如果未启用则返回 null
   *
   * @example
   * ```typescript
   * const stats = router.getMemoryStats()
   * if (stats) {
   *   console.log(`清理次数: ${stats.cleanupCount}`)
   *   console.log(`清理的资源总数: ${stats.cleanedResources}`)
   * }
   * ```
   */
  getMemoryStats() {
    return this.memoryManager?.getStats() || null
  }

  // ==================== 销毁 ====================

  /**
   * 销毁路由器
   */
  destroy(): void {
    // 停止内存管理器
    if (this.memoryManager) {
      this.memoryManager.destroy()
      this.memoryManager = null
    }
    
    this.cacheManager.destroy()
    this.guardManager.destroy()
    this.scrollManager.destroy()
    this.errorManager.destroy()
    this.aliasManager.clear()
    this.events.clear()
  }
}

/**
 * 创建路由器
 */
export function createRouter(options: RouterOptions): Router {
  return new Router(options)
}
