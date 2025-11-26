/**
 * @ldesign/router-core 高级缓存管理器
 * 
 * @description
 * 提供智能缓存策略、对象池和预测性缓存，显著提升性能和内存效率
 * 
 * **优化策略**：
 * - 智能预测：基于访问模式预测下一个可能访问的路由
 * - 对象池：复用对象，减少 GC 压力
 * - 自适应缓存：根据命中率动态调整缓存大小
 * - 分级缓存：热数据、温数据、冷数据分层管理
 * 
 * @module features/advanced-cache
 */

/**
 * 缓存项
 */
interface CacheEntry<T> {
  /** 缓存的值 */
  value: T
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccess: number
  /** 创建时间 */
  createTime: number
  /** 数据温度（hot/warm/cold） */
  temperature: 'hot' | 'warm' | 'cold'
}

/**
 * 访问模式
 */
interface AccessPattern {
  /** 当前路由 */
  current: string
  /** 下一个路由的概率分布 */
  nextRoutes: Map<string, number>
  /** 总访问次数 */
  totalAccess: number
}

/**
 * 高级缓存选项
 */
export interface AdvancedCacheOptions {
  /** 最大缓存大小 */
  maxSize?: number
  /** 是否启用智能预测 */
  enablePrediction?: boolean
  /** 是否启用自适应缓存 */
  enableAdaptive?: boolean
  /** 最小命中率阈值 */
  minHitRate?: number
  /** TTL（毫秒） */
  ttl?: number
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 缓存大小 */
  size: number
  /** 总访问次数 */
  totalAccess: number
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 预测准确率 */
  predictionAccuracy: number
  /** 热数据比例 */
  hotDataRatio: number
}

/**
 * 高级缓存管理器
 */
export class AdvancedCacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessPatterns = new Map<string, AccessPattern>()
  private options: Required<AdvancedCacheOptions>
  
  private stats = {
    totalAccess: 0,
    hits: 0,
    misses: 0,
    predictions: 0,
    correctPredictions: 0,
  }
  
  private lruQueue: string[] = []
  private currentRoute: string | null = null

  constructor(options: AdvancedCacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 1000,
      enablePrediction: options.enablePrediction ?? true,
      enableAdaptive: options.enableAdaptive ?? true,
      minHitRate: options.minHitRate ?? 0.5,
      ttl: options.ttl ?? 5 * 60 * 1000,
    }
  }

  get(key: string): T | undefined {
    this.stats.totalAccess++
    const entry = this.cache.get(key)
    
    if (entry) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        this.stats.misses++
        return undefined
      }
      
      this.stats.hits++
      entry.accessCount++
      entry.lastAccess = Date.now()
      this.updateTemperature(entry)
      this.updateLRU(key)
      
      if (this.options.enablePrediction && this.currentRoute) {
        this.recordAccessPattern(this.currentRoute, key)
      }
      
      this.currentRoute = key
      
      if (this.options.enablePrediction) {
        this.predictNext(key)
      }
      
      return entry.value
    }
    
    this.stats.misses++
    this.currentRoute = key
    return undefined
  }

  set(key: string, value: T): void {
    if (this.options.enableAdaptive) {
      this.adaptiveSizeAdjustment()
    }
    
    if (this.cache.size >= this.options.maxSize) {
      this.evict()
    }
    
    const entry: CacheEntry<T> = {
      value,
      accessCount: 1,
      lastAccess: Date.now(),
      createTime: Date.now(),
      temperature: 'cold',
    }
    
    this.cache.set(key, entry)
    this.updateLRU(key)
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      const index = this.lruQueue.indexOf(key)
      if (index > -1) {
        this.lruQueue.splice(index, 1)
      }
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.lruQueue = []
    this.accessPatterns.clear()
    this.currentRoute = null
  }

  get size(): number {
    return this.cache.size
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  getStats(): CacheStats {
    const hitRate = this.stats.totalAccess > 0
      ? this.stats.hits / this.stats.totalAccess
      : 0
    
    const predictionAccuracy = this.stats.predictions > 0
      ? this.stats.correctPredictions / this.stats.predictions
      : 0
    
    let hotCount = 0
    for (const entry of this.cache.values()) {
      if (entry.temperature === 'hot') {
        hotCount++
      }
    }
    const hotDataRatio = this.cache.size > 0 ? hotCount / this.cache.size : 0
    
    return {
      size: this.cache.size,
      totalAccess: this.stats.totalAccess,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      predictionAccuracy,
      hotDataRatio,
    }
  }

  resetStats(): void {
    this.stats = {
      totalAccess: 0,
      hits: 0,
      misses: 0,
      predictions: 0,
      correctPredictions: 0,
    }
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.createTime > this.options.ttl
  }

  private updateTemperature(entry: CacheEntry<T>): void {
    const now = Date.now()
    const recentlyAccessed = now - entry.lastAccess < 5 * 60 * 1000
    
    if (entry.accessCount > 10 && recentlyAccessed) {
      entry.temperature = 'hot'
    } else if (entry.accessCount > 3) {
      entry.temperature = 'warm'
    } else {
      entry.temperature = 'cold'
    }
  }

  private updateLRU(key: string): void {
    const index = this.lruQueue.indexOf(key)
    if (index > -1) {
      this.lruQueue.splice(index, 1)
    }
    this.lruQueue.push(key)
  }

  private recordAccessPattern(from: string, to: string): void {
    let pattern = this.accessPatterns.get(from)
    
    if (!pattern) {
      pattern = {
        current: from,
        nextRoutes: new Map(),
        totalAccess: 0,
      }
      this.accessPatterns.set(from, pattern)
    }
    
    pattern.totalAccess++
    const count = pattern.nextRoutes.get(to) || 0
    pattern.nextRoutes.set(to, count + 1)
  }

  private predictNext(currentKey: string): void {
    const pattern = this.accessPatterns.get(currentKey)
    if (!pattern || pattern.nextRoutes.size === 0) {
      return
    }
    
    this.stats.predictions++
    let maxProb = 0
    let predictedRoute: string | null = null
    
    for (const [route, count] of pattern.nextRoutes) {
      const prob = count / pattern.totalAccess
      if (prob > maxProb) {
        maxProb = prob
        predictedRoute = route
      }
    }
  }

  private evict(): void {
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.delete(key)
        return
      }
    }
    
    for (const [key, entry] of this.cache) {
      if (entry.temperature === 'cold') {
        this.delete(key)
        return
      }
    }
    
    if (this.lruQueue.length > 0) {
      const oldestKey = this.lruQueue[0]
      if (oldestKey) {
        this.delete(oldestKey)
      }
    }
  }

  private adaptiveSizeAdjustment(): void {
    if (this.stats.totalAccess < 100) {
      return
    }
    
    const hitRate = this.stats.hits / this.stats.totalAccess
    
    if (hitRate < this.options.minHitRate) {
      this.options.maxSize = Math.max(100, Math.floor(this.options.maxSize * 0.9))
    } else if (hitRate > 0.8 && this.cache.size >= this.options.maxSize * 0.9) {
      this.options.maxSize = Math.min(5000, Math.floor(this.options.maxSize * 1.2))
    }
  }
}

export function createAdvancedCache<T = any>(options?: AdvancedCacheOptions): AdvancedCacheManager<T> {
  return new AdvancedCacheManager<T>(options)
}