/**
 * 代码重构助手 - 消除重复代码
 * 
 * 提供统一的工具函数来替代重复逻辑
 */

import type { UnknownObject } from '../types/strict-types'

/**
 * 统一的缓存清理策略
 */
export interface CacheCleanupStrategy<K = string, V = unknown> {
  shouldEvict(key: K, value: V, metadata: CacheMetadata): boolean
  onEvicted?(key: K, value: V): void
}

/**
 * 缓存元数据
 */
export interface CacheMetadata {
  timestamp: number
  accessCount: number
  lastAccessTime: number
  size?: number
  ttl?: number
}

/**
 * LRU 清理策略
 */
export class LRUCleanupStrategy<K, V> implements CacheCleanupStrategy<K, V> {
  constructor(private maxAge: number = 5 * 60 * 1000) { }

  shouldEvict(_key: K, _value: V, metadata: CacheMetadata): boolean {
    const age = Date.now() - metadata.lastAccessTime
    return age > this.maxAge
  }
}

/**
 * LFU 清理策略
 */
export class LFUCleanupStrategy<K, V> implements CacheCleanupStrategy<K, V> {
  constructor(private minAccessCount: number = 2) { }

  shouldEvict(_key: K, _value: V, metadata: CacheMetadata): boolean {
    return metadata.accessCount < this.minAccessCount
  }
}

/**
 * TTL 清理策略
 */
export class TTLCleanupStrategy<K, V> implements CacheCleanupStrategy<K, V> {
  shouldEvict(_key: K, _value: V, metadata: CacheMetadata): boolean {
    if (!metadata.ttl) return false
    const age = Date.now() - metadata.timestamp
    return age > metadata.ttl
  }
}

/**
 * 混合清理策略（LRU + LFU + TTL）
 */
export class HybridCleanupStrategy<K, V> implements CacheCleanupStrategy<K, V> {
  private lru: LRUCleanupStrategy<K, V>
  private lfu: LFUCleanupStrategy<K, V>
  private ttl: TTLCleanupStrategy<K, V>

  constructor() {
    this.lru = new LRUCleanupStrategy()
    this.lfu = new LFUCleanupStrategy()
    this.ttl = new TTLCleanupStrategy()
  }

  shouldEvict(key: K, value: V, metadata: CacheMetadata): boolean {
    return this.ttl.shouldEvict(key, value, metadata) ||
      this.lru.shouldEvict(key, value, metadata) ||
      this.lfu.shouldEvict(key, value, metadata)
  }
}

/**
 * 通用缓存清理器
 */
export class CacheCleaner<K = string, V = unknown> {
  constructor(
    private cache: Map<K, V>,
    private metadataMap: Map<K, CacheMetadata>,
    private strategy: CacheCleanupStrategy<K, V>
  ) { }

  /**
   * 执行清理
   */
  cleanup(): number {
    let count = 0
    const keysToDelete: K[] = []

    for (const [key, value] of this.cache.entries()) {
      const metadata = this.metadataMap.get(key)
      if (!metadata) continue

      if (this.strategy.shouldEvict(key, value, metadata)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.metadataMap.delete(key)

      if (value !== undefined) {
        this.strategy.onEvicted?.(key, value)
      }

      count++
    })

    return count
  }
}

/**
 * 统一的对象重置函数
 */
export function resetObject(obj: UnknownObject): void {
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key) {
      delete obj[key]
    }
  }
}

/**
 * 批量重置对象
 */
export function resetObjects(objects: UnknownObject[]): void {
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i]
    if (obj) {
      resetObject(obj)
    }
  }
}

/**
 * 深度重置对象
 */
export function deepResetObject(obj: UnknownObject): void {
  const keys = Object.keys(obj)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (!key) continue

    const value = obj[key]

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        value.length = 0
      } else {
        deepResetObject(value as UnknownObject)
      }
    }

    delete obj[key]
  }
}

/**
 * 时间工具类
 */
export class TimeUtils {
  /**
   * 获取当前时间戳
   */
  static now(): number {
    return Date.now()
  }

  /**
   * 获取高精度时间戳
   */
  static nowPrecise(): number {
    return performance.now()
  }

  /**
   * 计算持续时间
   */
  static duration(startTime: number): number {
    return this.now() - startTime
  }

  /**
   * 计算高精度持续时间
   */
  static durationPrecise(startTime: number): number {
    return this.nowPrecise() - startTime
  }

  /**
   * 格式化持续时间
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(2)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
    return `${(ms / 60000).toFixed(2)}m`
  }

  /**
   * 是否超时
   */
  static isTimeout(startTime: number, timeout: number): boolean {
    return this.duration(startTime) > timeout
  }

  /**
   * 延迟执行
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 带超时的Promise
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    errorMessage?: string
  ): Promise<T> {
    return Promise.race([
      promise,
      this.delay(timeout).then(() => {
        throw new Error(errorMessage || `Timeout after ${timeout}ms`)
      })
    ])
  }

  /**
   * 重试执行
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number
      delay?: number
      backoff?: number
      shouldRetry?: (error: Error) => boolean
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = 2,
      shouldRetry = () => true
    } = options

    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        if (i < maxRetries - 1 && shouldRetry(lastError)) {
          await this.delay(delay * Math.pow(backoff, i))
        } else {
          throw lastError
        }
      }
    }

    throw lastError!
  }

  /**
   * 节流执行
   */
  private static throttleTimestamps = new WeakMap<Function, number>()

  static throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
  ): T {
    return ((...args: unknown[]) => {
      const now = this.now()
      const last = this.throttleTimestamps.get(fn) || 0

      if (now - last >= limit) {
        this.throttleTimestamps.set(fn, now)
        return fn(...args)
      }
      return undefined
    }) as T
  }

  /**
   * 防抖执行
   */
  private static debounceTimers = new WeakMap<Function, ReturnType<typeof setTimeout>>()

  static debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
  ): T {
    return ((...args: unknown[]) => {
      const timer = this.debounceTimers.get(fn)
      if (timer !== undefined) {
        clearTimeout(timer)
      }

      const newTimer = setTimeout(() => {
        this.debounceTimers.delete(fn)
        fn(...args)
      }, delay)

      this.debounceTimers.set(fn, newTimer)
    }) as T
  }
}

/**
 * 统计信息收集器基类
 */
export abstract class StatsCollector<T = UnknownObject> {
  protected stats: T
  protected startTime: number

  constructor(initialStats: T) {
    this.stats = { ...initialStats }
    this.startTime = Date.now()
  }

  /**
   * 获取统计信息
   */
  abstract getStats(): T

  /**
   * 重置统计
   */
  reset(newStats?: T): void {
    if (newStats) {
      this.stats = { ...newStats }
    } else {
      // 重置为初始值
      this.stats = { ...this.stats } as T
    }

    this.startTime = Date.now()
  }

  /**
   * 合并统计
   */
  merge(other: Partial<T>): void {
    Object.assign(this.stats as object, other)
  }

  /**
   * 获取运行时长
   */
  getUptime(): number {
    return Date.now() - this.startTime
  }
}

/**
 * 性能统计收集器
 */
export interface PerformanceStats {
  totalOperations: number
  successCount: number
  failureCount: number
  totalDuration: number
  averageDuration: number
  minDuration: number
  maxDuration: number
}

export class PerformanceStatsCollector extends StatsCollector<PerformanceStats> {
  constructor() {
    super({
      totalOperations: 0,
      successCount: 0,
      failureCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0
    })
  }

  /**
   * 记录操作
   */
  record(duration: number, success: boolean): void {
    this.stats.totalOperations++

    if (success) {
      this.stats.successCount++
    } else {
      this.stats.failureCount++
    }

    this.stats.totalDuration += duration
    this.stats.minDuration = Math.min(this.stats.minDuration, duration)
    this.stats.maxDuration = Math.max(this.stats.maxDuration, duration)
    this.stats.averageDuration = this.stats.totalDuration / this.stats.totalOperations
  }

  getStats(): PerformanceStats {
    return { ...this.stats }
  }
}

/**
 * 内存统计收集器
 */
export interface MemoryStats {
  currentMemory: number
  peakMemory: number
  averageMemory: number
  gcCount: number
  leakDetections: number
}

export class MemoryStatsCollector extends StatsCollector<MemoryStats> {
  private measurements: number[] = []

  constructor() {
    super({
      currentMemory: 0,
      peakMemory: 0,
      averageMemory: 0,
      gcCount: 0,
      leakDetections: 0
    })
  }

  /**
   * 记录内存使用
   */
  record(memory: number): void {
    this.stats.currentMemory = memory
    this.stats.peakMemory = Math.max(this.stats.peakMemory, memory)

    this.measurements.push(memory)
    if (this.measurements.length > 100) {
      this.measurements.shift()
    }

    this.stats.averageMemory =
      this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length
  }

  /**
   * 记录GC
   */
  recordGC(): void {
    this.stats.gcCount++
  }

  /**
   * 记录内存泄漏检测
   */
  recordLeak(): void {
    this.stats.leakDetections++
  }

  getStats(): MemoryStats {
    return { ...this.stats }
  }
}

/**
 * 缓存统计收集器
 */
export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
  capacity: number
  evictions: number
}

export class CacheStatsCollector extends StatsCollector<CacheStats> {
  constructor(capacity: number) {
    super({
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      capacity,
      evictions: 0
    })
  }

  /**
   * 记录命中
   */
  recordHit(): void {
    this.stats.hits++
    this.updateHitRate()
  }

  /**
   * 记录未命中
   */
  recordMiss(): void {
    this.stats.misses++
    this.updateHitRate()
  }

  /**
   * 记录驱逐
   */
  recordEviction(): void {
    this.stats.evictions++
  }

  /**
   * 更新大小
   */
  updateSize(size: number): void {
    this.stats.size = size
  }

  /**
   * 更新容量
   */
  updateCapacity(capacity: number): void {
    this.stats.capacity = capacity
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }
}

/**
 * 统一的对象克隆函数
 */
export function shallowClone<T extends UnknownObject>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.slice() as unknown as T
  }

  const clone = Object.create(Object.getPrototypeOf(obj))
  Object.assign(clone, obj)
  return clone
}

/**
 * 深度克隆（带循环引用检测）
 */
export function deepClone<T>(obj: T, seen = new WeakMap<object, unknown>()): T {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 检查循环引用
  if (seen.has(obj as object)) {
    return seen.get(obj as object) as T
  }

  // 特殊对象类型
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T
  }

  if (obj instanceof Map) {
    const clone = new Map()
    seen.set(obj as object, clone)

    for (const [key, value] of obj.entries()) {
      clone.set(deepClone(key, seen), deepClone(value, seen))
    }

    return clone as unknown as T
  }

  if (obj instanceof Set) {
    const clone = new Set()
    seen.set(obj as object, clone)

    for (const value of obj.values()) {
      clone.add(deepClone(value, seen))
    }

    return clone as unknown as T
  }

  // 数组
  if (Array.isArray(obj)) {
    const clone: unknown[] = []
    seen.set(obj as object, clone)

    for (let i = 0; i < obj.length; i++) {
      clone[i] = deepClone(obj[i], seen)
    }

    return clone as unknown as T
  }

  // 普通对象
  const clone = Object.create(Object.getPrototypeOf(obj))
  seen.set(obj as object, clone)

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone((obj as UnknownObject)[key], seen)
    }
  }

  return clone
}

/**
 * 统一的数组工具函数
 */
export const ArrayHelpers = {
  /**
   * 数组去重
   */
  unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
  },

  /**
   * 带键函数的去重
   */
  uniqueBy<T>(arr: T[], keyFn: (item: T) => unknown): T[] {
    const seen = new Set<unknown>()
    return arr.filter(item => {
      const key = keyFn(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  },

  /**
   * 数组分组
   */
  groupBy<T, K extends string | number>(
    arr: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    return arr.reduce((result, item) => {
      const key = keyFn(item)
      if (!result[key]) result[key] = []
      result[key].push(item)
      return result
    }, Object.create(null) as Record<K, T[]>)
  },

  /**
   * 数组分区
   */
  partition<T>(
    arr: T[],
    predicate: (item: T) => boolean
  ): [T[], T[]] {
    return arr.reduce<[T[], T[]]>(
      ([pass, fail], item) => {
        predicate(item) ? pass.push(item) : fail.push(item)
        return [pass, fail]
      },
      [[], []]
    )
  },

  /**
   * 数组扁平化
   */
  flatten<T>(arr: (T | T[])[], depth = 1): T[] {
    return depth <= 0 ? arr as T[] : arr.flat(depth) as T[]
  },

  /**
   * 数组分块
   */
  chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []

    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }

    return chunks
  }
}

/**
 * 统一的Map工具函数
 */
export const MapHelpers = {
  /**
   * Map转对象
   */
  toObject<K extends string | number, V>(map: Map<K, V>): Record<K, V> {
    const obj = Object.create(null) as Record<K, V>

    for (const [key, value] of map.entries()) {
      obj[key] = value
    }

    return obj
  },

  /**
   * 对象转Map
   */
  fromObject<K extends string | number, V>(obj: Record<K, V>): Map<K, V> {
    const map = new Map<K, V>()

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        map.set(key, obj[key])
      }
    }

    return map
  },

  /**
   * Map过滤
   */
  filter<K, V>(
    map: Map<K, V>,
    predicate: (value: V, key: K) => boolean
  ): Map<K, V> {
    const result = new Map<K, V>()

    for (const [key, value] of map.entries()) {
      if (predicate(value, key)) {
        result.set(key, value)
      }
    }

    return result
  },

  /**
   * Map映射
   */
  map<K, V, R>(
    map: Map<K, V>,
    mapper: (value: V, key: K) => R
  ): Map<K, R> {
    const result = new Map<K, R>()

    for (const [key, value] of map.entries()) {
      result.set(key, mapper(value, key))
    }

    return result
  }
}

/**
 * 代码质量度量工具
 */
export class CodeQualityMetrics {
  /**
   * 计算圈复杂度（简化版）
   */
  static calculateComplexity(fn: Function): number {
    const source = fn.toString()

    // 统计分支语句
    const ifCount = (source.match(/\bif\s*\(/g) || []).length
    const forCount = (source.match(/\bfor\s*\(/g) || []).length
    const whileCount = (source.match(/\bwhile\s*\(/g) || []).length
    const caseCount = (source.match(/\bcase\s+/g) || []).length
    const catchCount = (source.match(/\bcatch\s*\(/g) || []).length
    const ternaryCount = (source.match(/\?[^:]+:/g) || []).length
    const andOrCount = (source.match(/\|\||&&/g) || []).length

    return 1 + ifCount + forCount + whileCount + caseCount + catchCount + ternaryCount + andOrCount
  }

  /**
   * 计算函数长度（行数）
   */
  static calculateLength(fn: Function): number {
    return fn.toString().split('\n').length
  }

  /**
   * 检查是否超过复杂度阈值
   */
  static isComplexityHigh(fn: Function, threshold = 10): boolean {
    return this.calculateComplexity(fn) > threshold
  }

  /**
   * 检查是否超过长度阈值
   */
  static isLengthHigh(fn: Function, threshold = 50): boolean {
    return this.calculateLength(fn) > threshold
  }
}

/**
 * 导出所有助手
 */
export const RefactoringHelpers = {
  // 缓存清理
  CacheCleaner,
  LRUCleanupStrategy,
  LFUCleanupStrategy,
  TTLCleanupStrategy,
  HybridCleanupStrategy,

  // 对象操作
  resetObject,
  resetObjects,
  deepResetObject,
  shallowClone,
  deepClone,

  // 时间工具
  TimeUtils,

  // 统计收集
  StatsCollector,
  PerformanceStatsCollector,
  MemoryStatsCollector,
  CacheStatsCollector,

  // 数组和Map工具
  ArrayHelpers,
  MapHelpers,

  // 代码质量
  CodeQualityMetrics
}

export default RefactoringHelpers

