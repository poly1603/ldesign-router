/**
 * 守卫执行器 - 优化版
 * 
 * 支持并行执行独立守卫和智能缓存
 */

import type {
  NavigationGuard,
  NavigationGuardReturn,
  RouteLocationNormalized
} from '../types'
import type { UnknownRecord } from '../types/strict-types'

/**
 * 守卫元数据
 */
export interface GuardMetadata {
  /** 守卫函数 */
  guard: NavigationGuard
  /** 是否可缓存（无状态守卫） */
  cacheable?: boolean
  /** 依赖的其他守卫名称 */
  dependencies?: string[]
  /** 守卫名称 */
  name?: string
  /** 优先级（数字越大越先执行） */
  priority?: number
}

/**
 * 守卫执行结果
 */
export interface GuardExecutionResult {
  success: boolean
  result?: NavigationGuardReturn
  error?: Error
  duration: number
  cached: boolean
}

/**
 * 守卫执行配置
 */
export interface GuardExecutorConfig {
  /** 是否启用并行执行 */
  enableParallel?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存大小 */
  cacheSize?: number
  /** 执行超时（毫秒） */
  timeout?: number
}

/**
 * 守卫执行器
 */
export class GuardExecutor {
  private config: Required<GuardExecutorConfig>
  private cache = new Map<string, { result: NavigationGuardReturn, timestamp: number }>()
  private readonly CACHE_TTL = 5000 // 5秒缓存

  constructor(config: GuardExecutorConfig = {}) {
    this.config = {
      enableParallel: true,
      enableCache: true,
      cacheSize: 100,
      timeout: 5000,
      ...config
    }
  }

  /**
   * 执行单个守卫
   */
  async executeSingle(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    metadata?: Partial<GuardMetadata>
  ): Promise<GuardExecutionResult> {
    const startTime = performance.now()
    const cacheKey = this.getCacheKey(guard, to, from)

    // 检查缓存
    if (metadata?.cacheable && this.config.enableCache) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          success: true,
          result: cached.result,
          duration: performance.now() - startTime,
          cached: true
        }
      }
    }

    try {
      const result = await this.runGuardWithTimeout(guard, to, from)
      const duration = performance.now() - startTime

      // 缓存结果
      if (metadata?.cacheable && this.config.enableCache) {
        this.updateCache(cacheKey, result)
      }

      return {
        success: true,
        result,
        duration,
        cached: false
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        duration: performance.now() - startTime,
        cached: false
      }
    }
  }

  /**
   * 并行执行多个独立守卫
   */
  async executeParallel(
    guards: GuardMetadata[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<GuardExecutionResult[]> {
    if (!this.config.enableParallel || guards.length === 0) {
      return this.executeSequential(guards, to, from)
    }

    // 分析依赖关系
    const { independent, dependent } = this.analyzeDependencies(guards)

    const results: GuardExecutionResult[] = []

    // 并行执行独立守卫
    if (independent.length > 0) {
      const independentResults = await Promise.all(
        independent.map(metadata =>
          this.executeSingle(metadata.guard, to, from, metadata)
        )
      )

      // 检查是否有失败的守卫
      for (const result of independentResults) {
        if (!result.success || result.result === false) {
          return [...independentResults]
        }
      }

      results.push(...independentResults)
    }

    // 顺序执行有依赖的守卫
    if (dependent.length > 0) {
      const dependentResults = await this.executeSequential(dependent, to, from)
      results.push(...dependentResults)
    }

    return results
  }

  /**
   * 顺序执行守卫
   */
  async executeSequential(
    guards: GuardMetadata[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<GuardExecutionResult[]> {
    const results: GuardExecutionResult[] = []

    for (const metadata of guards) {
      const result = await this.executeSingle(metadata.guard, to, from, metadata)
      results.push(result)

      // 如果守卫返回 false 或错误，停止执行
      if (!result.success || result.result === false) {
        break
      }

      // 如果守卫返回重定向，停止执行
      if (result.result && typeof result.result !== 'boolean') {
        break
      }
    }

    return results
  }

  /**
   * 执行守卫组（自动选择并行或顺序）
   */
  async executeGroup(
    guards: (NavigationGuard | GuardMetadata)[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<GuardExecutionResult[]> {
    // 规范化守卫元数据
    const guardMetadata = guards.map(g =>
      typeof g === 'function'
        ? { guard: g, cacheable: false }
        : g
    )

    // 按优先级排序
    const sorted = this.sortByPriority(guardMetadata)

    // 执行
    return this.config.enableParallel
      ? this.executeParallel(sorted, to, from)
      : this.executeSequential(sorted, to, from)
  }

  /**
   * 分析守卫依赖关系
   */
  private analyzeDependencies(guards: GuardMetadata[]): {
    independent: GuardMetadata[]
    dependent: GuardMetadata[]
  } {
    const independent: GuardMetadata[] = []
    const dependent: GuardMetadata[] = []

    for (const guard of guards) {
      if (!guard.dependencies || guard.dependencies.length === 0) {
        independent.push(guard)
      } else {
        dependent.push(guard)
      }
    }

    return { independent, dependent }
  }

  /**
   * 按优先级排序
   */
  private sortByPriority(guards: GuardMetadata[]): GuardMetadata[] {
    return guards.sort((a, b) => {
      const priorityA = a.priority ?? 0
      const priorityB = b.priority ?? 0
      return priorityB - priorityA // 高优先级在前
    })
  }

  /**
   * 执行守卫（带超时）
   */
  private async runGuardWithTimeout(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    return new Promise<NavigationGuardReturn>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Guard execution timeout after ${this.config.timeout}ms`))
      }, this.config.timeout)

      const next = (result?: NavigationGuardReturn) => {
        clearTimeout(timer)
        if (result === false) {
          reject(new Error('Navigation cancelled by guard'))
        } else if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      }

      try {
        const guardResult = guard(to, from, next)

        if (guardResult && typeof guardResult === 'object' && 'then' in guardResult) {
          (guardResult as Promise<NavigationGuardReturn>).then(
            res => {
              clearTimeout(timer)
              resolve(res)
            },
            err => {
              clearTimeout(timer)
              reject(err)
            }
          )
        }
      } catch (error) {
        clearTimeout(timer)
        reject(error)
      }
    })
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): string {
    const guardKey = guard.name || guard.toString().slice(0, 50)
    return `${guardKey}:${to.path}:${from.path}`
  }

  /**
   * 更新缓存
   */
  private updateCache(key: string, result: NavigationGuardReturn): void {
    if (this.cache.size >= this.config.cacheSize) {
      // 删除最旧的缓存项
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    })
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.config.cacheSize,
      enableParallel: this.config.enableParallel,
      enableCache: this.config.enableCache
    }
  }

  /**
   * 销毁执行器
   */
  destroy(): void {
    this.clearCache()
  }
}

/**
 * 导航会话管理器（使用 WeakMap 优化）
 */
export class NavigationSessionManager {
  private sessions = new WeakMap<object, NavigationSession>()
  private activeSession?: NavigationSession

  /**
   * 创建新会话
   */
  createSession(to: RouteLocationNormalized, from: RouteLocationNormalized): NavigationSession {
    const session: NavigationSession = {
      id: this.generateSessionId(),
      to,
      from,
      startTime: Date.now(),
      redirectCount: 0,
      guardResults: new Map()
    }

    // 使用 to 对象作为 WeakMap 的键
    this.sessions.set(to as any, session)
    this.activeSession = session

    return session
  }

  /**
   * 获取会话
   */
  getSession(route: RouteLocationNormalized): NavigationSession | undefined {
    return this.sessions.get(route as any) || this.activeSession
  }

  /**
   * 结束会话
   */
  endSession(): void {
    this.activeSession = undefined
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 导航会话
 */
export interface NavigationSession {
  id: string
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  startTime: number
  redirectCount: number
  guardResults: Map<string, NavigationGuardReturn>
}

/**
 * 创建守卫执行器
 */
export function createGuardExecutor(config?: GuardExecutorConfig): GuardExecutor {
  return new GuardExecutor(config)
}

/**
 * 创建导航会话管理器
 */
export function createNavigationSessionManager(): NavigationSessionManager {
  return new NavigationSessionManager()
}
