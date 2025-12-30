/**
 * @fileoverview 路由中间件系统
 * 提供完整的中间件链式调用、优先级排序、条件执行、错误处理和性能监控功能
 */

import type { RouteLocationNormalized, NavigationGuardNext } from '../types'

/**
 * 中间件执行结果
 */
export type MiddlewareResult = void | boolean | string | Error

/**
 * 中间件函数类型
 */
export type MiddlewareFunction = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => MiddlewareResult | Promise<MiddlewareResult>

/**
 * 中间件配置选项
 */
export interface MiddlewareOptions {
  /** 中间件唯一标识 */
  id: string
  /** 中间件函数 */
  handler: MiddlewareFunction
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 执行条件 */
  condition?: MiddlewareCondition
  /** 是否启用 */
  enabled?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 错误处理策略 */
  errorStrategy?: MiddlewareErrorStrategy
}

/**
 * 中间件执行条件
 */
export interface MiddlewareCondition {
  /** 路径匹配模式 */
  pathPattern?: string | RegExp | ((path: string) => boolean)
  /** 路由名称匹配 */
  namePattern?: string | string[]
  /** 元数据匹配 */
  metaMatch?: Record<string, any>
  /** 自定义条件函数 */
  custom?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean
}

/**
 * 中间件错误处理策略
 */
export enum MiddlewareErrorStrategy {
  /** 终止执行并抛出错误 */
  ABORT = 'abort',
  /** 跳过当前中间件，继续执行后续中间件 */
  SKIP = 'skip',
  /** 重试执行 */
  RETRY = 'retry',
  /** 自定义处理 */
  CUSTOM = 'custom',
}

/**
 * 中间件执行上下文
 */
export interface MiddlewareContext {
  /** 目标路由 */
  to: RouteLocationNormalized
  /** 来源路由 */
  from: RouteLocationNormalized
  /** 已执行的中间件ID列表 */
  executedMiddlewares: string[]
  /** 共享数据 */
  data: Map<string, any>
  /** 开始时间 */
  startTime: number
}

/**
 * 中间件执行结果统计
 */
export interface MiddlewareExecutionStats {
  /** 中间件ID */
  middlewareId: string
  /** 执行时间（毫秒） */
  executionTime: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: Error
  /** 执行顺序 */
  executionOrder: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 中间件性能报告
 */
export interface MiddlewarePerformanceReport {
  /** 总执行时间 */
  totalExecutionTime: number
  /** 中间件执行统计列表 */
  stats: MiddlewareExecutionStats[]
  /** 最慢的中间件 */
  slowestMiddleware?: MiddlewareExecutionStats
  /** 失败的中间件 */
  failedMiddlewares: MiddlewareExecutionStats[]
  /** 执行路径 */
  executionPath: string[]
}

/**
 * 中间件管理器选项
 */
export interface MiddlewareManagerOptions {
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 默认超时时间（毫秒） */
  defaultTimeout?: number
  /** 默认错误处理策略 */
  defaultErrorStrategy?: MiddlewareErrorStrategy
  /** 重试次数 */
  retryAttempts?: number
  /** 是否启用调试日志 */
  enableDebugLog?: boolean
}

/**
 * 路由中间件管理器
 * 提供完整的中间件注册、执行、错误处理和性能监控功能
 */
export class RouterMiddlewareManager {
  private middlewares = new Map<string, MiddlewareOptions>()
  private performanceStats = new Map<string, MiddlewareExecutionStats[]>()
  private executionHistory: MiddlewarePerformanceReport[] = []
  private options: Required<MiddlewareManagerOptions>

  constructor(options: MiddlewareManagerOptions = {}) {
    this.options = {
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      defaultTimeout: options.defaultTimeout ?? 5000,
      defaultErrorStrategy: options.defaultErrorStrategy ?? MiddlewareErrorStrategy.ABORT,
      retryAttempts: options.retryAttempts ?? 3,
      enableDebugLog: options.enableDebugLog ?? false,
    }
  }

  /**
   * 注册中间件
   */
  register(middleware: MiddlewareOptions): void {
    if (this.middlewares.has(middleware.id)) {
      this.log(`警告: 中间件 "${middleware.id}" 已存在，将被覆盖`)
    }

    const normalizedMiddleware: MiddlewareOptions = {
      ...middleware,
      priority: middleware.priority ?? 0,
      enabled: middleware.enabled ?? true,
      timeout: middleware.timeout ?? this.options.defaultTimeout,
      errorStrategy: middleware.errorStrategy ?? this.options.defaultErrorStrategy,
    }

    this.middlewares.set(middleware.id, normalizedMiddleware)
    this.log(`中间件 "${middleware.id}" 注册成功，优先级: ${normalizedMiddleware.priority}`)
  }

  /**
   * 批量注册中间件
   */
  registerBatch(middlewares: MiddlewareOptions[]): void {
    middlewares.forEach(middleware => this.register(middleware))
  }

  /**
   * 注销中间件
   */
  unregister(middlewareId: string): boolean {
    const result = this.middlewares.delete(middlewareId)
    if (result) {
      this.performanceStats.delete(middlewareId)
      this.log(`中间件 "${middlewareId}" 已注销`)
    }
    return result
  }

  /**
   * 启用中间件
   */
  enable(middlewareId: string): void {
    const middleware = this.middlewares.get(middlewareId)
    if (middleware) {
      middleware.enabled = true
      this.log(`中间件 "${middlewareId}" 已启用`)
    }
  }

  /**
   * 禁用中间件
   */
  disable(middlewareId: string): void {
    const middleware = this.middlewares.get(middlewareId)
    if (middleware) {
      middleware.enabled = false
      this.log(`中间件 "${middlewareId}" 已禁用`)
    }
  }

  /**
   * 执行中间件链
   */
  async execute(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<MiddlewarePerformanceReport> {
    const startTime = performance.now()
    const context: MiddlewareContext = {
      to,
      from,
      executedMiddlewares: [],
      data: new Map(),
      startTime,
    }

    const stats: MiddlewareExecutionStats[] = []
    const failedMiddlewares: MiddlewareExecutionStats[] = []
    let executionOrder = 0

    // 获取并排序中间件
    const sortedMiddlewares = this.getSortedMiddlewares(to, from)

    this.log(`开始执行中间件链，共 ${sortedMiddlewares.length} 个中间件`)

    // 执行中间件链
    for (const middleware of sortedMiddlewares) {
      executionOrder++
      const middlewareStartTime = performance.now()
      let executionResult: MiddlewareExecutionStats

      try {
        await this.executeMiddleware(middleware, context)

        executionResult = {
          middlewareId: middleware.id,
          executionTime: performance.now() - middlewareStartTime,
          success: true,
          executionOrder,
          timestamp: Date.now(),
        }

        context.executedMiddlewares.push(middleware.id)
        this.log(`中间件 "${middleware.id}" 执行成功，耗时: ${executionResult.executionTime.toFixed(2)}ms`)
      } catch (error) {
        executionResult = {
          middlewareId: middleware.id,
          executionTime: performance.now() - middlewareStartTime,
          success: false,
          error: error as Error,
          executionOrder,
          timestamp: Date.now(),
        }

        failedMiddlewares.push(executionResult)
        this.log(`中间件 "${middleware.id}" 执行失败: ${(error as Error).message}`)

        // 根据错误策略处理
        const shouldContinue = await this.handleMiddlewareError(
          middleware,
          error as Error,
          context
        )

        if (!shouldContinue) {
          this.log(`中间件链执行终止`)
          break
        }
      }

      stats.push(executionResult)

      // 记录性能统计
      if (this.options.enablePerformanceMonitoring) {
        this.recordPerformanceStats(middleware.id, executionResult)
      }
    }

    const totalExecutionTime = performance.now() - startTime
    const report: MiddlewarePerformanceReport = {
      totalExecutionTime,
      stats,
      slowestMiddleware: this.findSlowestMiddleware(stats),
      failedMiddlewares,
      executionPath: context.executedMiddlewares,
    }

    // 保存执行历史
    this.executionHistory.push(report)
    if (this.executionHistory.length > 100) {
      this.executionHistory.shift()
    }

    this.log(`中间件链执行完成，总耗时: ${totalExecutionTime.toFixed(2)}ms`)

    return report
  }

  /**
   * 执行单个中间件
   */
  private async executeMiddleware(
    middleware: MiddlewareOptions,
    context: MiddlewareContext
  ): Promise<void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`中间件 "${middleware.id}" 执行超时 (${middleware.timeout}ms)`))
      }, middleware.timeout)
    })

    const executionPromise = new Promise<void>((resolve, reject) => {
      const next: NavigationGuardNext = (result?: any) => {
        if (result === false) {
          reject(new Error('导航被中止'))
        } else if (result instanceof Error) {
          reject(result)
        } else if (typeof result === 'string') {
          reject(new Error(`重定向到: ${result}`))
        } else {
          resolve()
        }
      }

      Promise.resolve(middleware.handler(context.to, context.from, next))
        .then(() => resolve())
        .catch(reject)
    })

    await Promise.race([executionPromise, timeoutPromise])
  }

  /**
   * 处理中间件错误
   */
  private async handleMiddlewareError(
    middleware: MiddlewareOptions,
    error: Error,
    context: MiddlewareContext
  ): Promise<boolean> {
    const strategy = middleware.errorStrategy ?? this.options.defaultErrorStrategy

    switch (strategy) {
      case MiddlewareErrorStrategy.ABORT:
        throw error

      case MiddlewareErrorStrategy.SKIP:
        this.log(`跳过失败的中间件 "${middleware.id}"，继续执行`)
        return true

      case MiddlewareErrorStrategy.RETRY:
        this.log(`尝试重试中间件 "${middleware.id}"`)
        for (let i = 0; i < this.options.retryAttempts; i++) {
          try {
            await this.executeMiddleware(middleware, context)
            this.log(`中间件 "${middleware.id}" 重试成功`)
            return true
          } catch (retryError) {
            if (i === this.options.retryAttempts - 1) {
              throw retryError
            }
          }
        }
        return false

      case MiddlewareErrorStrategy.CUSTOM:
        // 自定义错误处理，可以在这里扩展
        return true

      default:
        throw error
    }
  }

  /**
   * 获取排序后的中间件列表
   */
  private getSortedMiddlewares(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): MiddlewareOptions[] {
    const enabledMiddlewares = Array.from(this.middlewares.values())
      .filter(m => m.enabled)
      .filter(m => this.checkCondition(m, to, from))

    // 按优先级排序（优先级高的先执行）
    return enabledMiddlewares.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  }

  /**
   * 检查中间件执行条件
   */
  private checkCondition(
    middleware: MiddlewareOptions,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): boolean {
    if (!middleware.condition) {
      return true
    }

    const { pathPattern, namePattern, metaMatch, custom } = middleware.condition

    // 路径匹配
    if (pathPattern) {
      if (typeof pathPattern === 'string') {
        if (!to.path.includes(pathPattern)) return false
      } else if (pathPattern instanceof RegExp) {
        if (!pathPattern.test(to.path)) return false
      } else if (typeof pathPattern === 'function') {
        if (!pathPattern(to.path)) return false
      }
    }

    // 名称匹配
    if (namePattern) {
      const patterns = Array.isArray(namePattern) ? namePattern : [namePattern]
      if (to.name && !patterns.includes(to.name as string)) {
        return false
      }
    }

    // 元数据匹配
    if (metaMatch) {
      for (const [key, value] of Object.entries(metaMatch)) {
        if (to.meta[key] !== value) {
          return false
        }
      }
    }

    // 自定义条件
    if (custom) {
      return custom(to, from)
    }

    return true
  }

  /**
   * 记录性能统计
   */
  private recordPerformanceStats(
    middlewareId: string,
    stats: MiddlewareExecutionStats
  ): void {
    if (!this.performanceStats.has(middlewareId)) {
      this.performanceStats.set(middlewareId, [])
    }

    const middlewareStats = this.performanceStats.get(middlewareId)!
    middlewareStats.push(stats)

    // 保留最近100条记录
    if (middlewareStats.length > 100) {
      middlewareStats.shift()
    }
  }

  /**
   * 查找最慢的中间件
   */
  private findSlowestMiddleware(
    stats: MiddlewareExecutionStats[]
  ): MiddlewareExecutionStats | undefined {
    if (stats.length === 0) return undefined

    return stats.reduce((slowest, current) =>
      current.executionTime > slowest.executionTime ? current : slowest
    )
  }

  /**
   * 获取中间件性能统计
   */
  getMiddlewareStats(middlewareId: string): MiddlewareExecutionStats[] {
    return this.performanceStats.get(middlewareId) ?? []
  }

  /**
   * 获取所有中间件的平均执行时间
   */
  getAverageExecutionTimes(): Map<string, number> {
    const averages = new Map<string, number>()

    for (const [middlewareId, stats] of this.performanceStats.entries()) {
      if (stats.length > 0) {
        const totalTime = stats.reduce((sum, s) => sum + s.executionTime, 0)
        averages.set(middlewareId, totalTime / stats.length)
      }
    }

    return averages
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(): MiddlewarePerformanceReport[] {
    return [...this.executionHistory]
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): string {
    const lines: string[] = []
    lines.push('=== 中间件性能报告 ===\n')

    // 注册的中间件
    lines.push(`已注册中间件数量: ${this.middlewares.size}`)
    lines.push(`启用的中间件数量: ${Array.from(this.middlewares.values()).filter(m => m.enabled).length}\n`)

    // 平均执行时间
    const averageTimes = this.getAverageExecutionTimes()
    lines.push('平均执行时间:')
    for (const [middlewareId, avgTime] of averageTimes.entries()) {
      lines.push(`  ${middlewareId}: ${avgTime.toFixed(2)}ms`)
    }
    lines.push('')

    // 最近的执行记录
    if (this.executionHistory.length > 0) {
      const lastExecution = this.executionHistory[this.executionHistory.length - 1]!
      lines.push('最近一次执行:')
      lines.push(`  总耗时: ${lastExecution.totalExecutionTime.toFixed(2)}ms`)
      lines.push(`  执行路径: ${lastExecution.executionPath.join(' → ')}`)

      if (lastExecution.slowestMiddleware) {
        lines.push(`  最慢中间件: ${lastExecution.slowestMiddleware.middlewareId} (${lastExecution.slowestMiddleware.executionTime.toFixed(2)}ms)`)
      }

      if (lastExecution.failedMiddlewares.length > 0) {
        lines.push(`  失败中间件: ${lastExecution.failedMiddlewares.map(m => m.middlewareId).join(', ')}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 清除所有中间件
   */
  clear(): void {
    this.middlewares.clear()
    this.performanceStats.clear()
    this.executionHistory = []
    this.log('所有中间件已清除')
  }

  /**
   * 清除性能统计
   */
  clearPerformanceStats(): void {
    this.performanceStats.clear()
    this.executionHistory = []
    this.log('性能统计已清除')
  }

  /**
   * 日志输出
   */
  private log(message: string): void {
    if (this.options.enableDebugLog) {
      console.log(`[RouterMiddleware] ${message}`)
    }
  }
}

/**
 * 创建中间件管理器实例
 */
export function createMiddlewareManager(
  options?: MiddlewareManagerOptions
): RouterMiddlewareManager {
  return new RouterMiddlewareManager(options)
}
