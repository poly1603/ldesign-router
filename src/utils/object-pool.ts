/**
 * 对象池系统 - 减少 GC 压力和内存抖动
 * 
 * 通过复用对象减少频繁创建和销毁，提升性能
 */

import type { RouteLocationNormalized, RouteParams, RouteQuery } from '../types'

/**
 * 通用对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private inUse = new WeakSet<T>()
  private readonly maxSize: number

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.maxSize = maxSize

    // 预分配对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory())
    }
  }

  /**
   * 从池中获取对象
   */
  acquire(): T {
    let obj = this.pool.pop()

    if (!obj) {
      obj = this.factory()
    }

    this.inUse.add(obj)
    return obj
  }

  /**
   * 释放对象回池
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('[ObjectPool] Attempting to release object not from this pool')
      return
    }

    this.inUse.delete(obj)
    this.reset(obj)

    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
  }

  /**
   * 批量释放对象
   */
  releaseAll(objects: T[]): void {
    for (let i = 0; i < objects.length; i++) {
      this.release(objects[i])
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool.forEach(obj => this.reset(obj))
    this.pool.length = 0
  }

  /**
   * 获取池统计信息
   */
  getStats() {
    return {
      available: this.pool.length,
      maxSize: this.maxSize
    }
  }
}

/**
 * 路由位置对象池
 */
export class RouteLocationPool {
  private pool: ObjectPool<Partial<RouteLocationNormalized>>

  constructor(initialSize = 20, maxSize = 200) {
    this.pool = new ObjectPool(
      // 工厂函数
      () => ({
        path: '',
        name: undefined,
        params: {},
        query: {},
        hash: '',
        fullPath: '',
        matched: [],
        meta: {}
      }),
      // 重置函数
      (obj) => {
        obj.path = ''
        obj.name = undefined
        obj.params = {}
        obj.query = {}
        obj.hash = ''
        obj.fullPath = ''
        if (obj.matched) obj.matched.length = 0
        obj.meta = {}
      },
      initialSize,
      maxSize
    )
  }

  /**
   * 获取路由位置对象
   */
  acquire(): Partial<RouteLocationNormalized> {
    return this.pool.acquire()
  }

  /**
   * 释放路由位置对象
   */
  release(route: Partial<RouteLocationNormalized>): void {
    this.pool.release(route)
  }

  /**
   * 创建完整的路由位置对象
   */
  create(data: Partial<RouteLocationNormalized>): RouteLocationNormalized {
    const obj = this.acquire()

    obj.path = data.path || ''
    obj.name = data.name
    obj.params = data.params || {}
    obj.query = data.query || {}
    obj.hash = data.hash || ''
    obj.fullPath = data.fullPath || ''
    obj.matched = data.matched || []
    obj.meta = data.meta || {}

    return obj as RouteLocationNormalized
  }

  getStats() {
    return this.pool.getStats()
  }
}

/**
 * 匹配结果对象池
 */
export interface MatchResult {
  record: any
  matched: any[]
  params: RouteParams
  segments: string[]
}

export class MatchResultPool {
  private pool: ObjectPool<MatchResult>

  constructor(initialSize = 20, maxSize = 100) {
    this.pool = new ObjectPool(
      // 工厂函数
      () => ({
        record: null,
        matched: [],
        params: {},
        segments: []
      }),
      // 重置函数
      (obj) => {
        obj.record = null
        obj.matched.length = 0
        // 清空 params 但保留对象
        for (const key in obj.params) {
          delete obj.params[key]
        }
        obj.segments.length = 0
      },
      initialSize,
      maxSize
    )
  }

  acquire(): MatchResult {
    return this.pool.acquire()
  }

  release(result: MatchResult): void {
    this.pool.release(result)
  }

  create(data: Partial<MatchResult>): MatchResult {
    const obj = this.acquire()

    obj.record = data.record || null
    obj.matched = data.matched || []
    Object.assign(obj.params, data.params || {})
    obj.segments = data.segments || []

    return obj
  }

  getStats() {
    return this.pool.getStats()
  }
}

/**
 * 数组池
 */
export class ArrayPool<T = any> {
  private pools = new Map<string, T[][]>()
  private readonly maxPoolSize = 30

  /**
   * 获取指定大小的数组
   */
  acquire(sizeHint = 0): T[] {
    const key = this.getSizeKey(sizeHint)
    let pool = this.pools.get(key)

    if (!pool) {
      pool = []
      this.pools.set(key, pool)
    }

    return pool.pop() || []
  }

  /**
   * 释放数组
   */
  release(arr: T[]): void {
    if (!Array.isArray(arr)) return

    const key = this.getSizeKey(arr.length)
    let pool = this.pools.get(key)

    if (!pool) {
      pool = []
      this.pools.set(key, pool)
    }

    // 清空数组
    arr.length = 0

    // 限制池大小
    if (pool.length < this.maxPoolSize) {
      pool.push(arr)
    }
  }

  /**
   * 批量释放数组
   */
  releaseAll(arrays: T[][]): void {
    for (let i = 0; i < arrays.length; i++) {
      this.release(arrays[i])
    }
  }

  /**
   * 清空所有池
   */
  clear(): void {
    this.pools.clear()
  }

  /**
   * 获取大小键（按范围分组）
   */
  private getSizeKey(size: number): string {
    if (size <= 5) return 'small'
    if (size <= 20) return 'medium'
    if (size <= 100) return 'large'
    return 'xlarge'
  }

  /**
   * 获取池统计信息
   */
  getStats() {
    const stats: Record<string, number> = {}

    for (const [key, pool] of this.pools.entries()) {
      stats[key] = pool.length
    }

    return stats
  }
}

/**
 * 参数对象池
 */
export class ParamsPool {
  private pool: ObjectPool<RouteParams>

  constructor(initialSize = 20, maxSize = 100) {
    this.pool = new ObjectPool(
      () => ({}),
      (obj) => {
        for (const key in obj) {
          delete obj[key]
        }
      },
      initialSize,
      maxSize
    )
  }

  acquire(): RouteParams {
    return this.pool.acquire()
  }

  release(params: RouteParams): void {
    this.pool.release(params)
  }

  create(data: RouteParams): RouteParams {
    const obj = this.acquire()
    Object.assign(obj, data)
    return obj
  }

  getStats() {
    return this.pool.getStats()
  }
}

/**
 * 查询对象池
 */
export class QueryPool {
  private pool: ObjectPool<RouteQuery>

  constructor(initialSize = 20, maxSize = 100) {
    this.pool = new ObjectPool(
      () => ({}),
      (obj) => {
        for (const key in obj) {
          delete obj[key]
        }
      },
      initialSize,
      maxSize
    )
  }

  acquire(): RouteQuery {
    return this.pool.acquire()
  }

  release(query: RouteQuery): void {
    this.pool.release(query)
  }

  create(data: RouteQuery): RouteQuery {
    const obj = this.acquire()
    Object.assign(obj, data)
    return obj
  }

  getStats() {
    return this.pool.getStats()
  }
}

/**
 * 统一对象池管理器
 */
export class UnifiedObjectPoolManager {
  public routeLocationPool: RouteLocationPool
  public matchResultPool: MatchResultPool
  public arrayPool: ArrayPool
  public paramsPool: ParamsPool
  public queryPool: QueryPool

  constructor() {
    this.routeLocationPool = new RouteLocationPool()
    this.matchResultPool = new MatchResultPool()
    this.arrayPool = new ArrayPool()
    this.paramsPool = new ParamsPool()
    this.queryPool = new QueryPool()
  }

  /**
   * 获取所有池的统计信息
   */
  getAllStats() {
    return {
      routeLocation: this.routeLocationPool.getStats(),
      matchResult: this.matchResultPool.getStats(),
      array: this.arrayPool.getStats(),
      params: this.paramsPool.getStats(),
      query: this.queryPool.getStats()
    }
  }

  /**
   * 清空所有池
   */
  clearAll(): void {
    this.arrayPool.clear()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll()
  }
}

/**
 * 默认对象池管理器实例
 */
let defaultPoolManager: UnifiedObjectPoolManager | null = null

/**
 * 获取默认对象池管理器
 */
export function getObjectPoolManager(): UnifiedObjectPoolManager {
  if (!defaultPoolManager) {
    defaultPoolManager = new UnifiedObjectPoolManager()
  }
  return defaultPoolManager
}

/**
 * 销毁默认对象池管理器
 */
export function destroyObjectPoolManager(): void {
  if (defaultPoolManager) {
    defaultPoolManager.destroy()
    defaultPoolManager = null
  }
}

/**
 * 快捷函数：获取数组
 */
export function acquireArray<T = any>(sizeHint = 0): T[] {
  return getObjectPoolManager().arrayPool.acquire(sizeHint)
}

/**
 * 快捷函数：释放数组
 */
export function releaseArray<T = any>(arr: T[]): void {
  getObjectPoolManager().arrayPool.release(arr)
}

/**
 * 快捷函数：获取参数对象
 */
export function acquireParams(): RouteParams {
  return getObjectPoolManager().paramsPool.acquire()
}

/**
 * 快捷函数：释放参数对象
 */
export function releaseParams(params: RouteParams): void {
  getObjectPoolManager().paramsPool.release(params)
}

/**
 * 快捷函数：获取查询对象
 */
export function acquireQuery(): RouteQuery {
  return getObjectPoolManager().queryPool.acquire()
}

/**
 * 快捷函数：释放查询对象
 */
export function releaseQuery(query: RouteQuery): void {
  getObjectPoolManager().queryPool.release(query)
}


