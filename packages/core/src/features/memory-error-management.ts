/**
 * @fileoverview 内存管理和错误处理优化
 * 提供生命周期管理、引用计数、智能缓存清理和调试工具
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 资源生命周期状态
 */
export enum ResourceLifecycleState {
  /** 初始化中 */
  INITIALIZING = 'initializing',
  /** 活跃状态 */
  ACTIVE = 'active',
  /** 空闲状态 */
  IDLE = 'idle',
  /** 清理中 */
  DISPOSING = 'disposing',
  /** 已清理 */
  DISPOSED = 'disposed',
}

/**
 * 可清理资源接口
 */
export interface Disposable {
  dispose(): void | Promise<void>
}

/**
 * 资源引用信息
 */
export interface ResourceReference {
  /** 资源ID */
  id: string
  /** 引用计数 */
  refCount: number
  /** 资源对象 */
  resource: any
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 生命周期状态 */
  state: ResourceLifecycleState
  /** 是否可清理 */
  disposable: boolean
}

/**
 * 内存泄漏检测配置
 */
export interface MemoryLeakDetectorOptions {
  /** 检测间隔（毫秒） */
  checkInterval?: number
  /** 内存阈值（MB） */
  memoryThreshold?: number
  /** 引用计数阈值 */
  refCountThreshold?: number
  /** 是否启用自动清理 */
  autoCleanup?: boolean
  /** 是否启用警告 */
  enableWarnings?: boolean
}

/**
 * 缓存清理策略
 */
export enum CacheCleanupStrategy {
  /** LRU - 最近最少使用 */
  LRU = 'lru',
  /** LFU - 最不常用 */
  LFU = 'lfu',
  /** FIFO - 先进先出 */
  FIFO = 'fifo',
  /** TTL - 基于时间 */
  TTL = 'ttl',
}

/**
 * 缓存条目
 */
export interface CacheEntry<T = any> {
  /** 键 */
  key: string
  /** 值 */
  value: T
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 过期时间（毫秒） */
  ttl?: number
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 错误发生的路由 */
  route?: RouteLocationNormalized
  /** 错误发生的位置 */
  location?: string
  /** 相关数据 */
  data?: any
  /** 堆栈跟踪 */
  stack?: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 路由错误类型
 */
export enum RouterErrorType {
  /** 导航失败 */
  NAVIGATION_FAILED = 'navigation_failed',
  /** 守卫拒绝 */
  GUARD_REJECTED = 'guard_rejected',
  /** 路由未找到 */
  ROUTE_NOT_FOUND = 'route_not_found',
  /** 参数验证失败 */
  PARAM_VALIDATION_FAILED = 'param_validation_failed',
  /** 权限不足 */
  PERMISSION_DENIED = 'permission_denied',
  /** 内部错误 */
  INTERNAL_ERROR = 'internal_error',
}

/**
 * 增强的路由错误
 */
export class RouterError extends Error {
  constructor(
    public type: RouterErrorType,
    message: string,
    public context?: ErrorContext
  ) {
    super(message)
    this.name = 'RouterError'
  }
}

/**
 * 资源生命周期管理器
 */
export class ResourceLifecycleManager {
  private resources = new Map<string, ResourceReference>()
  private cleanupCallbacks = new Map<string, (() => void)[]>()

  /**
   * 注册资源
   */
  register(id: string, resource: any, disposable: boolean = false): void {
    if (this.resources.has(id)) {
      throw new Error(`资源 "${id}" 已注册`)
    }

    const ref: ResourceReference = {
      id,
      resource,
      refCount: 1,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      state: ResourceLifecycleState.ACTIVE,
      disposable,
    }

    this.resources.set(id, ref)
  }

  /**
   * 增加引用计数
   */
  addRef(id: string): number {
    const ref = this.resources.get(id)
    if (!ref) {
      throw new Error(`资源 "${id}" 未注册`)
    }

    ref.refCount++
    ref.lastAccessedAt = Date.now()
    return ref.refCount
  }

  /**
   * 减少引用计数
   */
  release(id: string): number {
    const ref = this.resources.get(id)
    if (!ref) {
      throw new Error(`资源 "${id}" 未注册`)
    }

    ref.refCount = Math.max(0, ref.refCount - 1)
    ref.lastAccessedAt = Date.now()

    // 如果引用计数为0，标记为空闲
    if (ref.refCount === 0) {
      ref.state = ResourceLifecycleState.IDLE
    }

    return ref.refCount
  }

  /**
   * 获取资源
   */
  get<T = any>(id: string): T | undefined {
    const ref = this.resources.get(id)
    if (ref) {
      ref.lastAccessedAt = Date.now()
      return ref.resource as T
    }
    return undefined
  }

  /**
   * 清理资源
   */
  async dispose(id: string): Promise<void> {
    const ref = this.resources.get(id)
    if (!ref) return

    ref.state = ResourceLifecycleState.DISPOSING

    // 执行清理回调
    const callbacks = this.cleanupCallbacks.get(id)
    if (callbacks) {
      for (const callback of callbacks) {
        callback()
      }
      this.cleanupCallbacks.delete(id)
    }

    // 如果资源是可清理的，调用dispose方法
    if (ref.disposable && ref.resource && typeof ref.resource.dispose === 'function') {
      await Promise.resolve(ref.resource.dispose())
    }

    ref.state = ResourceLifecycleState.DISPOSED
    this.resources.delete(id)
  }

  /**
   * 清理空闲资源
   */
  async cleanupIdle(idleTimeout: number = 60000): Promise<number> {
    const now = Date.now()
    let cleanedCount = 0

    for (const [id, ref] of this.resources.entries()) {
      if (
        ref.state === ResourceLifecycleState.IDLE &&
        now - ref.lastAccessedAt > idleTimeout
      ) {
        await this.dispose(id)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * 添加清理回调
   */
  onCleanup(id: string, callback: () => void): void {
    if (!this.cleanupCallbacks.has(id)) {
      this.cleanupCallbacks.set(id, [])
    }
    this.cleanupCallbacks.get(id)!.push(callback)
  }

  /**
   * 获取资源状态
   */
  getState(id: string): ResourceLifecycleState | undefined {
    return this.resources.get(id)?.state
  }

  /**
   * 获取所有资源引用
   */
  getAllReferences(): ResourceReference[] {
    return Array.from(this.resources.values())
  }

  /**
   * 清理所有资源
   */
  async disposeAll(): Promise<void> {
    const ids = Array.from(this.resources.keys())
    for (const id of ids) {
      await this.dispose(id)
    }
  }
}

/**
 * 智能缓存管理器
 */
export class SmartCacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private strategy: CacheCleanupStrategy
  private maxSize: number
  private defaultTTL: number

  constructor(
    strategy: CacheCleanupStrategy = CacheCleanupStrategy.LRU,
    maxSize: number = 1000,
    defaultTTL: number = 3600000 // 1小时
  ) {
    this.strategy = strategy
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * 设置缓存
   */
  set(key: string, value: T, ttl?: number): void {
    // 检查容量
    if (this.cache.size >= this.maxSize) {
      this.cleanup(1)
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
      ttl: ttl ?? this.defaultTTL,
    }

    this.cache.set(key, entry)
  }

  /**
   * 获取缓存
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问信息
    entry.lastAccessedAt = Date.now()
    entry.accessCount++

    return entry.value
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 清理缓存
   */
  cleanup(count: number = 1): number {
    const entries = Array.from(this.cache.values())
    let toRemove: CacheEntry<T>[] = []

    switch (this.strategy) {
      case CacheCleanupStrategy.LRU:
        toRemove = entries
          .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt)
          .slice(0, count)
        break

      case CacheCleanupStrategy.LFU:
        toRemove = entries
          .sort((a, b) => a.accessCount - b.accessCount)
          .slice(0, count)
        break

      case CacheCleanupStrategy.FIFO:
        toRemove = entries
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(0, count)
        break

      case CacheCleanupStrategy.TTL:
        const now = Date.now()
        toRemove = entries
          .filter(e => e.ttl && now - e.createdAt > e.ttl)
          .slice(0, count)
        break
    }

    toRemove.forEach(entry => this.cache.delete(entry.key))
    return toRemove.length
  }

  /**
   * 清理过期缓存
   */
  cleanupExpired(): number {
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.ttl) return false
    return Date.now() - entry.createdAt > entry.ttl
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const entries = Array.from(this.cache.values())
    const totalAccess = entries.reduce((sum, e) => sum + e.accessCount, 0)
    const avgAccess = entries.length > 0 ? totalAccess / entries.length : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess,
      avgAccess,
      oldestEntry: entries.sort((a, b) => a.createdAt - b.createdAt)[0],
      mostAccessed: entries.sort((a, b) => b.accessCount - a.accessCount)[0],
    }
  }
}

/**
 * 内存泄漏检测器
 */
export class MemoryLeakDetector {
  private options: Required<MemoryLeakDetectorOptions>
  private checkTimer?: NodeJS.Timeout
  private lifecycleManager: ResourceLifecycleManager
  private warnings: string[] = []

  constructor(
    lifecycleManager: ResourceLifecycleManager,
    options: MemoryLeakDetectorOptions = {}
  ) {
    this.lifecycleManager = lifecycleManager
    this.options = {
      checkInterval: options.checkInterval ?? 60000, // 1分钟
      memoryThreshold: options.memoryThreshold ?? 100, // 100MB
      refCountThreshold: options.refCountThreshold ?? 100,
      autoCleanup: options.autoCleanup ?? false,
      enableWarnings: options.enableWarnings ?? true,
    }
  }

  /**
   * 开始检测
   */
  start(): void {
    if (this.checkTimer) {
      console.warn('[MemoryLeakDetector] 检测器已在运行')
      return
    }

    this.checkTimer = setInterval(() => {
      this.check()
    }, this.options.checkInterval)

    console.log('[MemoryLeakDetector] 内存泄漏检测已启动')
  }

  /**
   * 停止检测
   */
  stop(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = undefined
      console.log('[MemoryLeakDetector] 内存泄漏检测已停止')
    }
  }

  /**
   * 执行检测
   */
  check(): void {
    const resources = this.lifecycleManager.getAllReferences()

    // 检查引用计数异常
    const highRefCountResources = resources.filter(
      r => r.refCount > this.options.refCountThreshold
    )

    if (highRefCountResources.length > 0) {
      const warning = `检测到 ${highRefCountResources.length} 个资源引用计数异常高 (>${this.options.refCountThreshold})`
      this.addWarning(warning)

      if (this.options.autoCleanup) {
        this.cleanupHighRefCountResources(highRefCountResources)
      }
    }

    // 检查长时间未访问的资源
    const now = Date.now()
    const staleResources = resources.filter(
      r => now - r.lastAccessedAt > 3600000 && r.refCount === 0 // 1小时未访问且无引用
    )

    if (staleResources.length > 0) {
      const warning = `检测到 ${staleResources.length} 个陈旧资源（1小时未访问）`
      this.addWarning(warning)

      if (this.options.autoCleanup) {
        this.cleanupStaleResources(staleResources)
      }
    }
  }

  /**
   * 清理高引用计数资源
   */
  private async cleanupHighRefCountResources(
    resources: ResourceReference[]
  ): Promise<void> {
    for (const resource of resources) {
      // 强制将引用计数设为0
      resource.refCount = 0
      resource.state = ResourceLifecycleState.IDLE
      await this.lifecycleManager.dispose(resource.id)
    }
  }

  /**
   * 清理陈旧资源
   */
  private async cleanupStaleResources(
    resources: ResourceReference[]
  ): Promise<void> {
    for (const resource of resources) {
      await this.lifecycleManager.dispose(resource.id)
    }
  }

  /**
   * 添加警告
   */
  private addWarning(message: string): void {
    this.warnings.push(message)

    if (this.options.enableWarnings) {
      console.warn(`[MemoryLeakDetector] ${message}`)
    }

    // 保留最近100条警告
    if (this.warnings.length > 100) {
      this.warnings.shift()
    }
  }

  /**
   * 获取警告列表
   */
  getWarnings(): string[] {
    return [...this.warnings]
  }

  /**
   * 清除警告
   */
  clearWarnings(): void {
    this.warnings = []
  }
}

/**
 * 错误追踪器
 */
export class RouterErrorTracker {
  private errors: Array<{ error: RouterError; context: ErrorContext }> = []
  private maxErrors: number

  constructor(maxErrors: number = 100) {
    this.maxErrors = maxErrors
  }

  /**
   * 记录错误
   */
  track(error: RouterError): void {
    this.errors.push({
      error,
      context: error.context ?? {
        timestamp: Date.now(),
      },
    })

    // 保留最近的错误
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }
  }

  /**
   * 获取所有错误
   */
  getErrors(): Array<{ error: RouterError; context: ErrorContext }> {
    return [...this.errors]
  }

  /**
   * 按类型获取错误
   */
  getErrorsByType(type: RouterErrorType): RouterError[] {
    return this.errors
      .filter(e => e.error.type === type)
      .map(e => e.error)
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(count: number = 10): RouterError[] {
    return this.errors
      .slice(-count)
      .map(e => e.error)
  }

  /**
   * 清除错误
   */
  clear(): void {
    this.errors = []
  }

  /**
   * 生成错误报告
   */
  generateReport(): string {
    const lines: string[] = []
    lines.push('=== 路由错误报告 ===\n')
    lines.push(`总错误数: ${this.errors.length}\n`)

    // 按类型统计
    const byType = new Map<RouterErrorType, number>()
    for (const { error } of this.errors) {
      byType.set(error.type, (byType.get(error.type) ?? 0) + 1)
    }

    lines.push('错误类型统计:')
    for (const [type, count] of byType.entries()) {
      lines.push(`  ${type}: ${count}`)
    }

    return lines.join('\n')
  }
}

/**
 * 创建资源生命周期管理器
 */
export function createLifecycleManager(): ResourceLifecycleManager {
  return new ResourceLifecycleManager()
}

/**
 * 创建智能缓存管理器
 */
export function createSmartCache<T = any>(
  strategy?: CacheCleanupStrategy,
  maxSize?: number,
  defaultTTL?: number
): SmartCacheManager<T> {
  return new SmartCacheManager<T>(strategy, maxSize, defaultTTL)
}

/**
 * 创建内存泄漏检测器
 */
export function createMemoryLeakDetector(
  lifecycleManager: ResourceLifecycleManager,
  options?: MemoryLeakDetectorOptions
): MemoryLeakDetector {
  return new MemoryLeakDetector(lifecycleManager, options)
}

/**
 * 创建错误追踪器
 */
export function createErrorTracker(maxErrors?: number): RouterErrorTracker {
  return new RouterErrorTracker(maxErrors)
}
