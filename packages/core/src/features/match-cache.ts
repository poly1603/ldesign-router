/**
 * @ldesign/router-core 路由匹配缓存
 * 
 * @description
 * 提供路由匹配结果的LRU缓存,提升路由匹配性能。
 * 
 * **特性**：
 * - LRU 缓存策略
 * - 匹配结果缓存
 * - 缓存命中率统计
 * - 缓存大小限制
 * - 手动清除缓存
 * - TTL 过期支持
 * 
 * @module features/match-cache
 */

import type { RouteRecordNormalized } from '../types'

/**
 * 缓存项
 */
export interface MatchCacheItem {
  /** 匹配的路由 */
  matched: RouteRecordNormalized[]
  
  /** 提取的参数 */
  params: Record<string, string>
  
  /** 创建时间 */
  timestamp: number
  
  /** 过期时间 (ms) */
  ttl?: number
  
  /** 访问次数 */
  hits: number
  
  /** 最后访问时间 */
  lastAccess: number
}

/**
 * 缓存统计
 */
export interface MatchCacheStats {
  /** 缓存大小 */
  size: number
  
  /** 最大容量 */
  maxSize: number
  
  /** 命中次数 */
  hits: number
  
  /** 未命中次数 */
  misses: number
  
  /** 命中率 */
  hitRate: number
  
  /** 总访问次数 */
  totalAccess: number
  
  /** 缓存键列表 */
  keys: string[]
}

/**
 * 缓存选项
 */
export interface MatchCacheOptions {
  /** 最大缓存数量 */
  maxSize?: number
  
  /** 默认TTL (ms, 0表示永不过期) */
  ttl?: number
  
  /** 是否启用统计 */
  enableStats?: boolean
  
  /** 是否自动清理过期项 */
  autoCleanup?: boolean
  
  /** 清理间隔 (ms) */
  cleanupInterval?: number
}

/**
 * 路由匹配缓存管理器
 */
export class MatchCacheManager {
  private cache = new Map<string, MatchCacheItem>()
  private accessOrder: string[] = []
  private options: Required<MatchCacheOptions>
  private stats = {
    hits: 0,
    misses: 0,
  }
  private cleanupTimer?: NodeJS.Timeout

  constructor(options: MatchCacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 1000,
      ttl: options.ttl || 0,
      enableStats: options.enableStats ?? true,
      autoCleanup: options.autoCleanup ?? true,
      cleanupInterval: options.cleanupInterval || 60000, // 1分钟
    }

    // 启动自动清理
    if (this.options.autoCleanup && this.options.ttl > 0) {
      this.startAutoCleanup()
    }
  }

  // ==================== 缓存操作 ====================

  /**
   * 获取缓存
   */
  get(path: string): MatchCacheItem | undefined {
    const item = this.cache.get(path)

    if (!item) {
      if (this.options.enableStats) {
        this.stats.misses++
      }
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(path)
      if (this.options.enableStats) {
        this.stats.misses++
      }
      return undefined
    }

    // 更新访问记录
    item.hits++
    item.lastAccess = Date.now()
    this.updateAccessOrder(path)

    if (this.options.enableStats) {
      this.stats.hits++
    }

    return item
  }

  /**
   * 设置缓存
   */
  set(
    path: string,
    matched: RouteRecordNormalized[],
    params: Record<string, string>,
    ttl?: number,
  ): void {
    // 如果已存在,更新
    if (this.cache.has(path)) {
      const item = this.cache.get(path)!
      item.matched = matched
      item.params = params
      item.timestamp = Date.now()
      item.lastAccess = Date.now()
      item.ttl = ttl ?? this.options.ttl
      this.updateAccessOrder(path)
      return
    }

    // 检查容量
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    // 添加新项
    const item: MatchCacheItem = {
      matched,
      params,
      timestamp: Date.now(),
      ttl: ttl ?? this.options.ttl,
      hits: 0,
      lastAccess: Date.now(),
    }

    this.cache.set(path, item)
    this.accessOrder.push(path)
  }

  /**
   * 删除缓存
   */
  delete(path: string): boolean {
    const deleted = this.cache.delete(path)
    
    if (deleted) {
      const index = this.accessOrder.indexOf(path)
      if (index >= 0) {
        this.accessOrder.splice(index, 1)
      }
    }

    return deleted
  }

  /**
   * 检查是否存在
   */
  has(path: string): boolean {
    const item = this.cache.get(path)
    
    if (!item) {
      return false
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(path)
      return false
    }

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    
    if (this.options.enableStats) {
      this.stats.hits = 0
      this.stats.misses = 0
    }
  }

  // ==================== LRU 逻辑 ====================

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(path: string): void {
    const index = this.accessOrder.indexOf(path)
    
    if (index >= 0) {
      // 移除旧位置
      this.accessOrder.splice(index, 1)
    }
    
    // 添加到末尾 (最近访问)
    this.accessOrder.push(path)
  }

  /**
   * 淘汰最少使用的项
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) {
      return
    }

    // 获取最久未使用的键
    const lruKey = this.accessOrder[0]
    this.delete(lruKey)
  }

  /**
   * 检查是否过期
   */
  private isExpired(item: MatchCacheItem): boolean {
    if (!item.ttl || item.ttl === 0) {
      return false
    }

    const now = Date.now()
    const age = now - item.timestamp

    return age > item.ttl
  }

  // ==================== 清理 ====================

  /**
   * 清理过期项
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [path, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.delete(path)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    if (this.cleanupTimer) {
      return
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)

    // 确保在 Node.js 中不会阻止进程退出
    if (typeof (this.cleanupTimer as any).unref === 'function') {
      (this.cleanupTimer as any).unref()
    }
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  // ==================== 统计信息 ====================

  /**
   * 获取统计信息
   */
  getStats(): MatchCacheStats {
    const totalAccess = this.stats.hits + this.stats.misses
    const hitRate = totalAccess > 0 ? this.stats.hits / totalAccess : 0

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalAccess,
      keys: Array.from(this.cache.keys()),
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
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有值
   */
  values(): MatchCacheItem[] {
    return Array.from(this.cache.values())
  }

  /**
   * 获取所有条目
   */
  entries(): [string, MatchCacheItem][] {
    return Array.from(this.cache.entries())
  }

  // ==================== 高级操作 ====================

  /**
   * 按访问次数排序获取缓存项
   */
  getMostAccessed(limit: number = 10): [string, MatchCacheItem][] {
    return this.entries()
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, limit)
  }

  /**
   * 按最后访问时间排序获取缓存项
   */
  getRecentlyAccessed(limit: number = 10): [string, MatchCacheItem][] {
    return this.entries()
      .sort((a, b) => b[1].lastAccess - a[1].lastAccess)
      .slice(0, limit)
  }

  /**
   * 获取即将过期的项
   */
  getExpiringSoon(threshold: number = 60000): [string, MatchCacheItem][] {
    const now = Date.now()
    const expiring: [string, MatchCacheItem][] = []

    for (const [path, item] of this.cache.entries()) {
      if (item.ttl && item.ttl > 0) {
        const age = now - item.timestamp
        const remaining = item.ttl - age
        
        if (remaining > 0 && remaining < threshold) {
          expiring.push([path, item])
        }
      }
    }

    return expiring.sort((a, b) => {
      const aRemaining = a[1].ttl! - (now - a[1].timestamp)
      const bRemaining = b[1].ttl! - (now - b[1].timestamp)
      return aRemaining - bRemaining
    })
  }

  /**
   * 预热缓存
   */
  warmup(entries: Array<{ path: string; matched: RouteRecordNormalized[]; params: Record<string, string> }>): void {
    for (const entry of entries) {
      this.set(entry.path, entry.matched, entry.params)
    }
  }

  /**
   * 导出缓存数据
   */
  export(): Array<{ path: string; matched: RouteRecordNormalized[]; params: Record<string, string> }> {
    return this.entries().map(([path, item]) => ({
      path,
      matched: item.matched,
      params: item.params,
    }))
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.clear()
  }
}

/**
 * 创建匹配缓存管理器
 */
export function createMatchCacheManager(options?: MatchCacheOptions): MatchCacheManager {
  return new MatchCacheManager(options)
}

// ==================== 缓存策略 ====================

/**
 * 创建基于路径模式的缓存键
 */
export function createCacheKey(path: string, query?: Record<string, any>): string {
  if (!query || Object.keys(query).length === 0) {
    return path
  }

  // 排序查询参数以确保一致性
  const sortedQuery = Object.keys(query)
    .sort()
    .map(key => `${key}=${JSON.stringify(query[key])}`)
    .join('&')

  return `${path}?${sortedQuery}`
}

/**
 * 创建缓存装饰器
 */
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  cache: MatchCacheManager,
  keyGenerator: (...args: Parameters<T>) => string,
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    const cached = cache.get(key)

    if (cached) {
      return cached
    }

    const result = fn(...args)
    
    // 只缓存成功的匹配结果
    if (result && result.matched && result.matched.length > 0) {
      cache.set(key, result.matched, result.params || {})
    }

    return result
  }) as T
}
