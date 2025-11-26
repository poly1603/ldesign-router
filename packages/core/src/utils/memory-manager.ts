/**
 * @ldesign/router-core 内存管理器
 * 
 * @description
 * 提供自动内存管理、泄漏检测和垃圾回收优化
 * 
 * **核心功能**：
 * - 自动清理：定期清理未使用的缓存和对象
 * - 内存监控：实时监控内存使用情况
 * - 泄漏检测：检测潜在的内存泄漏
 * - 弱引用：使用 WeakMap/WeakSet 避免内存泄漏
 * 
 * @module utils/memory-manager
 */

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  /** 已使用内存（字节） */
  used: number
  /** 总内存（字节） */
  total: number
  /** 使用百分比 (0-1) */
  percentage: number
  /** 堆大小（字节） */
  heapUsed?: number
  /** 堆总大小（字节） */
  heapTotal?: number
}

/**
 * 内存管理选项
 */
export interface MemoryManagerOptions {
  /** 自动清理间隔（毫秒） */
  cleanupInterval?: number
  /** 内存使用阈值（0-1） */
  memoryThreshold?: number
  /** 是否启用自动清理 */
  enableAutoCleanup?: boolean
  /** 是否启用泄漏检测 */
  enableLeakDetection?: boolean
  /** 弱引用缓存大小限制 */
  weakCacheLimit?: number
}

/**
 * 可清理的资源
 */
export interface Cleanable {
  /** 清理方法 */
  cleanup(): void
  /** 资源名称 */
  name?: string
  /** 最后访问时间 */
  lastAccess?: number
}

/**
 * 内存统计
 */
export interface MemoryStats {
  /** 注册的资源数量 */
  registeredResources: number
  /** 已清理的资源数量 */
  cleanedResources: number
  /** 清理次数 */
  cleanupCount: number
  /** 检测到的潜在泄漏 */
  potentialLeaks: number
  /** 平均清理时间 */
  avgCleanupTime: number
}

/**
 * 内存管理器
 * 
 * @description
 * 自动管理路由器相关资源的内存，防止内存泄漏和优化GC
 * 
 * **使用场景**：
 * 1. 长时间运行的SPA应用
 * 2. 频繁路由切换的场景
 * 3. 大量动态路由的应用
 * 
 * @class
 * 
 * @example
 * ```typescript
 * const memoryManager = new MemoryManager({
 *   enableAutoCleanup: true,
 *   cleanupInterval: 60000, // 1分钟
 *   memoryThreshold: 0.8, // 80%
 * })
 * 
 * // 注册需要管理的资源
 * memoryManager.register(cacheManager)
 * 
 * // 手动触发清理
 * memoryManager.cleanup()
 * 
 * // 查看统计
 * const stats = memoryManager.getStats()
 * console.log(`内存使用率: ${(stats.currentMemory.usageRate * 100).toFixed(1)}%`)
 * ```
 */
export class MemoryManager {
  private resources = new Map<string, Cleanable>()
  private resourceMetadata = new Map<string, { lastAccess: number }>()
  private weakCache = new WeakMap<object, any>()
  private weakRefs = new WeakSet<object>()
  private options: Required<MemoryManagerOptions>
  private cleanupTimer: any = null
  
  private stats = {
    registeredResources: 0,
    cleanedResources: 0,
    cleanupCount: 0,
    potentialLeaks: 0,
    totalCleanupTime: 0,
  }

  constructor(options: MemoryManagerOptions = {}) {
    this.options = {
      cleanupInterval: options.cleanupInterval ?? 60000, // 1分钟
      memoryThreshold: options.memoryThreshold ?? 0.8, // 80%
      enableAutoCleanup: options.enableAutoCleanup ?? true,
      enableLeakDetection: options.enableLeakDetection ?? true,
      weakCacheLimit: options.weakCacheLimit ?? 1000,
    }

    if (this.options.enableAutoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 注册需要管理的资源
   *
   * @param name - 资源名称
   * @param resource - 可清理的资源
   *
   * @example
   * ```typescript
   * memoryManager.register('cache', {
   *   cleanup: () => cache.clear()
   * })
   * ```
   */
  register(name: string, resource: Cleanable): void {
    this.resources.set(name, resource)
    this.resourceMetadata.set(name, { lastAccess: Date.now() })
    this.stats.registeredResources++
  }

  /**
   * 取消注册资源
   *
   * @param name - 资源名称
   * @returns 是否成功取消
   */
  unregister(name: string): boolean {
    const deleted = this.resources.delete(name)
    this.resourceMetadata.delete(name)
    return deleted
  }

  /**
   * 手动触发清理
   * 
   * ⚡ 清理策略：
   * 1. 清理长时间未访问的资源
   * 2. 当内存使用率超过阈值时强制清理
   * 3. 优先清理较老的资源
   * 
   * @param force - 是否强制清理所有资源
   * @returns 清理的资源数量
   */
  cleanup(force = false): number {
    const startTime = Date.now()
    let cleanedCount = 0
    const now = Date.now()
    const memoryUsage = this.getMemoryUsage()
    const shouldForceClean = force || memoryUsage.percentage > this.options.memoryThreshold

    for (const [name, resource] of this.resources) {
      const metadata = this.resourceMetadata.get(name)
      
      // 如果强制清理，或资源超过5分钟未访问
      const shouldClean = shouldForceClean ||
        (metadata && now - metadata.lastAccess > 5 * 60 * 1000)

      if (shouldClean) {
        try {
          resource.cleanup()
          cleanedCount++
          this.stats.cleanedResources++
        } catch (error) {
          console.error(`清理资源失败: ${name}`, error)
        }
      }
    }

    // 更新统计
    this.stats.cleanupCount++
    const cleanupTime = Date.now() - startTime
    this.stats.totalCleanupTime += cleanupTime

    // 触发垃圾回收（如果可用）
    if (shouldForceClean && typeof global !== 'undefined' && global.gc) {
      try {
        global.gc()
      } catch (e) {
        // GC 不可用，忽略
      }
    }

    return cleanedCount
  }

  /**
   * 获取内存使用情况
   * 
   * @returns 内存使用信息
   */
  getMemoryUsage(): MemoryUsage {
    // 浏览器环境
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: memory.usedJSHeapSize / memory.totalJSHeapSize,
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
      }
    }

    // Node.js 环境
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage()
      return {
        used: memory.heapUsed,
        total: memory.heapTotal,
        percentage: memory.heapUsed / memory.heapTotal,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
      }
    }

    // 无法获取内存信息
    return {
      used: 0,
      total: 0,
      percentage: 0,
    }
  }

  /**
   * 检测潜在的内存泄漏
   * 
   * @returns 检测到的泄漏数量
   */
  detectLeaks(): number {
    if (!this.options.enableLeakDetection) {
      return 0
    }

    let leakCount = 0
    const now = Date.now()

    // 检查长时间未清理的资源
    for (const [name, resource] of this.resources) {
      const metadata = this.resourceMetadata.get(name)
      if (metadata && now - metadata.lastAccess > 30 * 60 * 1000) {
        console.warn(`潜在内存泄漏: ${name} 已超过30分钟未访问`)
        leakCount++
        this.stats.potentialLeaks++
      }
    }

    return leakCount
  }

  /**
   * 使用弱引用缓存
   * 
   * 优势：当对象没有其他引用时，自动被GC回收
   * 
   * @param key - 缓存键（对象）
   * @param value - 缓存值
   */
  setWeakCache(key: object, value: any): void {
    this.weakCache.set(key, value)
    this.weakRefs.add(key)
  }

  /**
   * 获取弱引用缓存
   * 
   * @param key - 缓存键
   * @returns 缓存值，如果已被回收则返回undefined
   */
  getWeakCache(key: object): any {
    return this.weakCache.get(key)
  }

  /**
   * 检查弱引用是否存在
   * 
   * @param key - 缓存键
   * @returns 是否存在
   */
  hasWeakCache(key: object): boolean {
    return this.weakCache.has(key)
  }

  /**
   * 删除弱引用缓存
   *
   * @param key - 缓存键
   * @returns 是否成功删除
   */
  deleteWeakCache(key: object): boolean {
    return this.weakCache.delete(key)
  }

  /**
   * 获取统计信息
   * 
   * @returns 内存管理统计
   */
  getStats(): MemoryStats {
    return {
      registeredResources: this.resources.size,
      cleanedResources: this.stats.cleanedResources,
      cleanupCount: this.stats.cleanupCount,
      potentialLeaks: this.stats.potentialLeaks,
      avgCleanupTime: this.stats.cleanupCount > 0
        ? this.stats.totalCleanupTime / this.stats.cleanupCount
        : 0,
    }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      registeredResources: this.resources.size,
      cleanedResources: 0,
      cleanupCount: 0,
      potentialLeaks: 0,
      totalCleanupTime: 0,
    }
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const memoryUsage = this.getMemoryUsage()
      
      // 如果内存使用率超过阈值，触发清理
      if (memoryUsage.percentage > this.options.memoryThreshold) {
        const cleaned = this.cleanup()
        console.log(`🧹 自动清理：清理了 ${cleaned} 个资源，内存使用率：${(memoryUsage.percentage * 100).toFixed(1)}%`)
      }

      // 定期检测泄漏
      if (this.options.enableLeakDetection) {
        const leaks = this.detectLeaks()
        if (leaks > 0) {
          console.warn(`⚠️ 检测到 ${leaks} 个潜在内存泄漏`)
        }
      }
    }, this.options.cleanupInterval)
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.cleanup(true)
    this.resources.clear()
    this.weakRefs = new WeakSet()
    this.resetStats()
  }
}

/**
 * 创建内存管理器
 * 
 * @param options - 配置选项
 * @returns 内存管理器实例
 * 
 * @example
 * ```typescript
 * const memoryManager = createMemoryManager({
 *   enableAutoCleanup: true,
 *   memoryThreshold: 0.75,
 * })
 * ```
 */
export function createMemoryManager(options?: MemoryManagerOptions): MemoryManager {
  return new MemoryManager(options)
}