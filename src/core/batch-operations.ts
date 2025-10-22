/**
 * 路由批量操作 - 性能优化版
 * 
 * 提供批量添加、删除、预加载路由的高效实现
 */

import type {
  Router,
  RouteRecordRaw,
  RouteLocationRaw,
  RouteLocationNormalized
} from '../types'

/**
 * 批量操作配置
 */
export interface BatchOperationConfig {
  /** 是否优化操作（减少中间状态更新） */
  optimize?: boolean
  /** 批次大小 */
  batchSize?: number
  /** 并发数 */
  concurrency?: number
  /** 进度回调 */
  onProgress?: (current: number, total: number) => void
  /** 错误回调 */
  onError?: (error: Error, index: number) => void
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult<T = any> {
  success: number
  failed: number
  total: number
  errors: Array<{ index: number, error: Error }>
  results: T[]
  duration: number
}

/**
 * 路由批量操作管理器
 */
export class BatchOperationsManager {
  constructor(private router: Router) { }

  /**
   * 批量添加路由（优化版）
   */
  async addRoutes(
    routes: RouteRecordRaw[],
    config: BatchOperationConfig = {}
  ): Promise<BatchOperationResult<() => void>> {
    const {
      optimize = true,
      batchSize = 50,
      onProgress,
      onError
    } = config

    const startTime = performance.now()
    const results: (() => void)[] = []
    const errors: Array<{ index: number, error: Error }> = []
    let successCount = 0

    // 优化：暂停缓存更新（如果支持）
    if (optimize && 'pauseCacheUpdates' in this.router) {
      (this.router as any).pauseCacheUpdates?.()
    }

    try {
      // 分批处理
      for (let i = 0; i < routes.length; i += batchSize) {
        const batch = routes.slice(i, Math.min(i + batchSize, routes.length))

        for (let j = 0; j < batch.length; j++) {
          const route = batch[j]
          const index = i + j

          try {
            const removeRoute = this.router.addRoute(route)
            results.push(removeRoute)
            successCount++

            onProgress?.(index + 1, routes.length)
          } catch (error) {
            const err = error as Error
            errors.push({ index, error: err })
            onError?.(err, index)
          }
        }

        // 让出主线程
        if (i + batchSize < routes.length) {
          await this.yieldToMainThread()
        }
      }
    } finally {
      // 恢复缓存更新
      if (optimize && 'resumeCacheUpdates' in this.router) {
        (this.router as any).resumeCacheUpdates?.()
      }
    }

    return {
      success: successCount,
      failed: errors.length,
      total: routes.length,
      errors,
      results,
      duration: performance.now() - startTime
    }
  }

  /**
   * 批量删除路由
   */
  async removeRoutes(
    names: (string | symbol)[],
    config: BatchOperationConfig = {}
  ): Promise<BatchOperationResult<void>> {
    const {
      optimize = true,
      batchSize = 50,
      onProgress,
      onError
    } = config

    const startTime = performance.now()
    const errors: Array<{ index: number, error: Error }> = []
    let successCount = 0

    if (optimize && 'pauseCacheUpdates' in this.router) {
      (this.router as any).pauseCacheUpdates?.()
    }

    try {
      for (let i = 0; i < names.length; i += batchSize) {
        const batch = names.slice(i, Math.min(i + batchSize, names.length))

        for (let j = 0; j < batch.length; j++) {
          const name = batch[j]
          const index = i + j

          try {
            this.router.removeRoute(name)
            successCount++

            onProgress?.(index + 1, names.length)
          } catch (error) {
            const err = error as Error
            errors.push({ index, error: err })
            onError?.(err, index)
          }
        }

        if (i + batchSize < names.length) {
          await this.yieldToMainThread()
        }
      }
    } finally {
      if (optimize && 'resumeCacheUpdates' in this.router) {
        (this.router as any).resumeCacheUpdates?.()
      }
    }

    return {
      success: successCount,
      failed: errors.length,
      total: names.length,
      errors,
      results: [],
      duration: performance.now() - startTime
    }
  }

  /**
   * 批量预加载路由
   */
  async preloadRoutes(
    routes: RouteLocationRaw[],
    config: BatchOperationConfig = {}
  ): Promise<BatchOperationResult<RouteLocationNormalized>> {
    const {
      batchSize = 10,
      concurrency = 3,
      onProgress,
      onError
    } = config

    const startTime = performance.now()
    const results: RouteLocationNormalized[] = []
    const errors: Array<{ index: number, error: Error }> = []
    let successCount = 0

    // 使用并发控制的批处理
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, Math.min(i + batchSize, routes.length))

      // 并发预加载
      const batchResults = await this.preloadBatchConcurrent(
        batch,
        concurrency,
        i,
        onProgress,
        onError,
        routes.length
      )

      for (const result of batchResults) {
        if (result.success) {
          results.push(result.route!)
          successCount++
        } else {
          errors.push({ index: result.index, error: result.error! })
        }
      }

      // 让出主线程
      if (i + batchSize < routes.length) {
        await this.yieldToMainThread()
      }
    }

    return {
      success: successCount,
      failed: errors.length,
      total: routes.length,
      errors,
      results,
      duration: performance.now() - startTime
    }
  }

  /**
   * 并发预加载批次
   */
  private async preloadBatchConcurrent(
    routes: RouteLocationRaw[],
    concurrency: number,
    baseIndex: number,
    onProgress?: (current: number, total: number) => void,
    onError?: (error: Error, index: number) => void,
    total = 0
  ): Promise<Array<{
    success: boolean
    route?: RouteLocationNormalized
    error?: Error
    index: number
  }>> {
    const results: Array<{
      success: boolean
      route?: RouteLocationNormalized
      error?: Error
      index: number
    }> = []

    const executing: Promise<void>[] = []

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      const index = baseIndex + i

      const promise = this.preloadSingleRoute(route)
        .then(resolved => {
          results[i] = { success: true, route: resolved, index }
          onProgress?.(index + 1, total)
        })
        .catch(error => {
          results[i] = { success: false, error, index }
          onError?.(error, index)
        })

      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
        const completedIndex = executing.findIndex(p =>
          results.some(r => r !== undefined)
        )
        if (completedIndex !== -1) {
          executing.splice(completedIndex, 1)
        }
      }
    }

    await Promise.all(executing)
    return results
  }

  /**
   * 预加载单个路由
   */
  private async preloadSingleRoute(route: RouteLocationRaw): Promise<RouteLocationNormalized> {
    const resolved = this.router.resolve(route)

    // 预加载组件
    const lastMatched = resolved.matched[resolved.matched.length - 1]
    if (lastMatched?.components) {
      const loadPromises = Object.values(lastMatched.components).map(component => {
        if (typeof component === 'function' && 'then' in component) {
          return (component as () => Promise<any>)()
        }
        return Promise.resolve()
      })

      await Promise.all(loadPromises)
    }

    return resolved
  }

  /**
   * 批量清理缓存（支持模式匹配）
   */
  clearCacheByPattern(pattern: string | RegExp): number {
    let count = 0

    // 如果路由器有匹配器缓存
    if ('matcher' in this.router && this.router.matcher) {
      const matcher = this.router.matcher as any

      if (matcher.lruCache && matcher.lruCache.cache) {
        const cache = matcher.lruCache.cache as Map<string, any>
        const regex = typeof pattern === 'string'
          ? new RegExp(pattern.replace(/\*/g, '.*'))
          : pattern

        const keysToDelete: string[] = []

        for (const key of cache.keys()) {
          if (regex.test(key)) {
            keysToDelete.push(key)
          }
        }

        keysToDelete.forEach(key => {
          cache.delete(key)
          count++
        })
      }
    }

    return count
  }

  /**
   * 批量更新路由元信息
   */
  async updateRouteMeta(
    updates: Array<{ name: string | symbol, meta: Record<string, any> }>,
    config: BatchOperationConfig = {}
  ): Promise<BatchOperationResult<void>> {
    const { batchSize = 50, onProgress } = config
    const startTime = performance.now()
    const errors: Array<{ index: number, error: Error }> = []
    let successCount = 0

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, Math.min(i + batchSize, updates.length))

      for (let j = 0; j < batch.length; j++) {
        const { name, meta } = batch[j]
        const index = i + j

        try {
          const routes = this.router.getRoutes()
          const route = routes.find(r => r.name === name)

          if (route) {
            Object.assign(route.meta, meta)
            successCount++
          } else {
            throw new Error(`Route not found: ${String(name)}`)
          }

          onProgress?.(index + 1, updates.length)
        } catch (error) {
          errors.push({ index, error: error as Error })
        }
      }

      if (i + batchSize < updates.length) {
        await this.yieldToMainThread()
      }
    }

    return {
      success: successCount,
      failed: errors.length,
      total: updates.length,
      errors,
      results: [],
      duration: performance.now() - startTime
    }
  }

  /**
   * 让出主线程（避免长任务阻塞）
   */
  private yieldToMainThread(): Promise<void> {
    return new Promise(resolve => {
      if ('scheduler' in globalThis && 'yield' in (globalThis as any).scheduler) {
        (globalThis as any).scheduler.yield().then(resolve)
      } else {
        setTimeout(resolve, 0)
      }
    })
  }

  /**
   * 获取批量操作统计信息
   */
  getStats() {
    return {
      routesCount: this.router.getRoutes().length
    }
  }
}

/**
 * 创建批量操作管理器
 */
export function createBatchOperationsManager(router: Router): BatchOperationsManager {
  return new BatchOperationsManager(router)
}

/**
 * 为路由器添加批量操作方法
 */
export function installBatchOperations(router: Router): void {
  const manager = createBatchOperationsManager(router)

  // 扩展路由器实例
  Object.assign(router, {
    addRoutes: (routes: RouteRecordRaw[], config?: BatchOperationConfig) =>
      manager.addRoutes(routes, config),
    removeRoutes: (names: (string | symbol)[], config?: BatchOperationConfig) =>
      manager.removeRoutes(names, config),
    preloadRoutes: (routes: RouteLocationRaw[], config?: BatchOperationConfig) =>
      manager.preloadRoutes(routes, config),
    clearCacheByPattern: (pattern: string | RegExp) =>
      manager.clearCacheByPattern(pattern),
    updateRouteMeta: (updates: Array<{ name: string | symbol, meta: Record<string, any> }>, config?: BatchOperationConfig) =>
      manager.updateRouteMeta(updates, config)
  })
}


