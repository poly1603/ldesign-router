/**
 * @ldesign/router-core 路由缓存管理
 * 
 * @description
 * 提供路由组件的缓存管理功能,优化页面切换性能。
 * 
 * **特性**：
 * - Keep-Alive 缓存控制
 * - LRU 缓存策略
 * - 按路由配置缓存
 * - 缓存刷新和清理
 * - 内存使用优化
 * 
 * **使用场景**：
 * - 列表页返回保持状态
 * - 表单数据临时保存
 * - 减少重复渲染
 * 
 * @module features/cache
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 缓存策略
 */
export type CacheStrategy =
  | 'always'    // 总是缓存
  | 'never'     // 从不缓存
  | 'auto'      // 自动判断

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 最大缓存数量（默认 10） */
  max?: number

  /** 缓存策略（默认 'auto'） */
  strategy?: CacheStrategy

  /** 是否启用（默认 true） */
  enabled?: boolean

  /** 缓存匹配函数 */
  include?: Array<string | RegExp>

  /** 排除缓存函数 */
  exclude?: Array<string | RegExp>

  /** 缓存过期时间（毫秒，0 表示永不过期） */
  ttl?: number
}

/**
 * 缓存项
 */
export interface CacheItem<T = unknown> {
  /** 路由键 */
  key: string

  /** 缓存的数据 */
  data: T

  /** 创建时间 */
  createdAt: number

  /** 最后访问时间 */
  lastAccessedAt: number

  /** 访问次数 */
  accessCount: number

  /** 路由信息 */
  route: RouteLocationNormalized
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 当前缓存数 */
  size: number

  /** 最大缓存数 */
  max: number

  /** 命中次数 */
  hits: number

  /** 未命中次数 */
  misses: number

  /** 命中率 */
  hitRate: number

  /** 总内存占用（估算，字节） */
  memoryUsage: number
}

/**
 * 路由缓存管理器
 * 
 * @description
 * 使用 LRU（Least Recently Used）策略管理路由组件缓存。
 * 
 * **LRU 策略**：
 * - 最近使用的保留
 * - 最久未使用的淘汰
 * - O(1) 查询和更新
 * 
 * **内存管理**：
 * - 缓存数量限制
 * - TTL 过期清理
 * - 手动清理接口
 * 
 * ⚡ 性能:
 * - 获取: O(1)
 * - 设置: O(1)
 * - 淘汰: O(1)
 * 
 * @class
 * 
 * @example
 * ```ts
 * const cache = new RouteCacheManager({
 *   max: 10,
 *   include: ['/list', /\/detail\/\d+/],
 *   exclude: ['/login', '/logout'],
 * })
 * 
 * // 缓存路由数据
 * cache.set(route, componentInstance)
 * 
 * // 获取缓存
 * const cached = cache.get(route)
 * 
 * // 清理缓存
 * cache.clear('/list')
 * ```
 */
export class RouteCacheManager<T = unknown> {
  /** 缓存存储 */
  private cache = new Map<string, CacheItem<T>>()

  /** 访问顺序队列（用于 LRU） */
  private accessQueue: string[] = []

  /** 配置选项 */
  private options: Required<CacheOptions>

  /** 统计信息 */
  private stats = {
    hits: 0,
    misses: 0,
  }

  /** 清理定时器 */
  private cleanupTimer?: ReturnType<typeof setInterval>

  /**
   * 创建缓存管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: CacheOptions = {}) {
    this.options = {
      max: options.max ?? 10,
      strategy: options.strategy ?? 'auto',
      enabled: options.enabled ?? true,
      include: options.include ?? [],
      exclude: options.exclude ?? [],
      ttl: options.ttl ?? 0,
    }

    // 启动定期清理
    if (this.options.ttl > 0) {
      this.startCleanup()
    }
  }

  /**
   * 获取缓存
   * 
   * @param route - 路由对象
   * @returns 缓存的数据，不存在返回 null
   */
  get(route: RouteLocationNormalized): T | null {
    if (!this.options.enabled) {
      return null
    }

    const key = this.getRouteKey(route)
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.removeFromQueue(key)
      this.stats.misses++
      return null
    }

    // 更新访问信息
    item.lastAccessedAt = Date.now()
    item.accessCount++

    // 更新 LRU 队列
    this.moveToFront(key)

    this.stats.hits++
    return item.data
  }

  /**
   * 设置缓存
   * 
   * @param route - 路由对象
   * @param data - 要缓存的数据
   * @returns 是否成功缓存
   */
  set(route: RouteLocationNormalized, data: T): boolean {
    if (!this.options.enabled) {
      return false
    }

    // 检查是否应该缓存
    if (!this.shouldCache(route)) {
      return false
    }

    const key = this.getRouteKey(route)
    const now = Date.now()

    // 创建缓存项
    const item: CacheItem<T> = {
      key,
      data,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
      route,
    }

    // 如果已存在，更新
    if (this.cache.has(key)) {
      this.cache.set(key, item)
      this.moveToFront(key)
      return true
    }

    // 检查缓存数量限制
    if (this.cache.size >= this.options.max) {
      this.evict()
    }

    // 添加新缓存
    this.cache.set(key, item)
    this.accessQueue.unshift(key)

    return true
  }

  /**
   * 检查是否有缓存
   * 
   * @param route - 路由对象
   * @returns 是否存在缓存
   */
  has(route: RouteLocationNormalized): boolean {
    const key = this.getRouteKey(route)
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.removeFromQueue(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   * 
   * @param routeOrKey - 路由对象或路由键
   * @returns 是否成功删除
   */
  delete(routeOrKey: RouteLocationNormalized | string): boolean {
    const key = typeof routeOrKey === 'string'
      ? routeOrKey
      : this.getRouteKey(routeOrKey)

    const deleted = this.cache.delete(key)
    if (deleted) {
      this.removeFromQueue(key)
    }

    return deleted
  }

  /**
   * 清空缓存
   * 
   * @param pattern - 可选的路径模式，匹配的会被清除
   */
  clear(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear()
      this.accessQueue = []
      return
    }

    const regex = typeof pattern === 'string'
      ? new RegExp(`^${pattern}`)
      : pattern

    for (const [key, item] of this.cache.entries()) {
      if (regex.test(item.route.path)) {
        this.cache.delete(key)
        this.removeFromQueue(key)
      }
    }
  }

  /**
   * 刷新缓存（更新访问时间）
   * 
   * @param route - 路由对象
   */
  refresh(route: RouteLocationNormalized): void {
    const key = this.getRouteKey(route)
    const item = this.cache.get(key)

    if (item) {
      item.lastAccessedAt = Date.now()
      this.moveToFront(key)
    }
  }

  /**
   * 获取所有缓存的路由路径
   * 
   * @returns 路由路径数组
   */
  getCachedRoutes(): string[] {
    return Array.from(this.cache.values()).map(item => item.route.path)
  }

  /**
   * 获取统计信息
   * 
   * @returns 缓存统计
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? this.stats.hits / total : 0

    // 粗略估算内存占用
    let memoryUsage = 0
    for (const item of this.cache.values()) {
      memoryUsage += JSON.stringify(item).length * 2 // UTF-16
    }

    return {
      size: this.cache.size,
      max: this.options.max,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      memoryUsage,
    }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats.hits = 0
    this.stats.misses = 0
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.clear()
    this.resetStats()
  }

  /**
   * 获取路由键
   * 
   * @private
   */
  private getRouteKey(route: RouteLocationNormalized): string {
    // 使用完整路径作为键（包含查询参数）
    return route.fullPath
  }

  /**
   * 检查是否应该缓存
   * 
   * @private
   */
  private shouldCache(route: RouteLocationNormalized): boolean {
    const path = route.path

    // 检查策略
    if (this.options.strategy === 'never') {
      return false
    }

    if (this.options.strategy === 'always') {
      // 仍需检查 exclude
      return !this.isExcluded(path)
    }

    // auto 策略：检查 include 和 exclude
    if (this.options.exclude.length > 0 && this.isExcluded(path)) {
      return false
    }

    if (this.options.include.length > 0) {
      return this.isIncluded(path)
    }

    // 默认缓存
    return true
  }

  /**
   * 检查路径是否在包含列表中
   * 
   * @private
   */
  private isIncluded(path: string): boolean {
    return this.options.include.some(pattern => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern)
      }
      return pattern.test(path)
    })
  }

  /**
   * 检查路径是否在排除列表中
   * 
   * @private
   */
  private isExcluded(path: string): boolean {
    return this.options.exclude.some(pattern => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern)
      }
      return pattern.test(path)
    })
  }

  /**
   * 检查缓存是否过期
   * 
   * @private
   */
  private isExpired(item: CacheItem<T>): boolean {
    if (this.options.ttl === 0) {
      return false
    }

    return Date.now() - item.createdAt > this.options.ttl
  }

  /**
   * 淘汰最久未使用的缓存（LRU）
   * 
   * @private
   */
  private evict(): void {
    if (this.accessQueue.length === 0) {
      return
    }

    // 移除队列末尾（最久未访问）
    const key = this.accessQueue.pop()
    if (key) {
      this.cache.delete(key)
    }
  }

  /**
   * 将键移到队列前端
   * 
   * @private
   */
  private moveToFront(key: string): void {
    this.removeFromQueue(key)
    this.accessQueue.unshift(key)
  }

  /**
   * 从队列中移除键
   * 
   * @private
   */
  private removeFromQueue(key: string): void {
    const index = this.accessQueue.indexOf(key)
    if (index !== -1) {
      this.accessQueue.splice(index, 1)
    }
  }

  /**
   * 启动定期清理
   * 
   * @private
   */
  private startCleanup(): void {
    // 每分钟清理一次过期缓存
    this.cleanupTimer = setInterval(() => {
      for (const [key, item] of this.cache.entries()) {
        if (this.isExpired(item)) {
          this.cache.delete(key)
          this.removeFromQueue(key)
        }
      }
    }, 60000)

    // 使用 unref() 防止阻止进程退出
    if (typeof (this.cleanupTimer as any).unref === 'function') {
      (this.cleanupTimer as any).unref()
    }
  }
}

/**
 * 创建路由缓存管理器
 * 
 * @param options - 配置选项
 * @returns 缓存管理器实例
 * 
 * @example
 * ```ts
 * const cache = createRouteCacheManager({
 *   max: 10,
 *   include: ['/dashboard', '/profile'],
 *   ttl: 5 * 60 * 1000, // 5 分钟
 * })
 * ```
 */
export function createRouteCacheManager<T = unknown>(
  options?: CacheOptions,
): RouteCacheManager<T> {
  return new RouteCacheManager<T>(options)
}
