/**
 * @ldesign/router-core 路由分析
 * 
 * @description
 * 提供路由访问统计、性能监控和用户行为分析功能。
 * 
 * **特性**：
 * - 路由访问次数统计
 * - 页面停留时长追踪
 * - 导航性能监控
 * - 用户路径分析
 * - 错误跟踪
 * 
 * **性能优化**：
 * - 异步数据上报
 * - 批量统计处理
 * - 内存限制保护
 * 
 * @module features/analytics
 */

import type {
  NavigationGuard,
  RouteLocationNormalized,
} from '../types'

/**
 * 路由访问记录
 */
export interface RouteVisit {
  /** 路由路径 */
  path: string

  /** 路由名称 */
  name?: string | symbol

  /** 访问时间 */
  timestamp: number

  /** 停留时长（毫秒） */
  duration?: number

  /** 来源路径 */
  from?: string

  /** 查询参数 */
  query?: Record<string, string>

  /** 路由参数 */
  params?: Record<string, string>

  /** 自定义元数据 */
  meta?: Record<string, unknown>
}

/**
 * 导航性能指标
 */
export interface NavigationPerformance {
  /** 路由路径 */
  path: string

  /** 导航开始时间 */
  startTime: number

  /** 导航结束时间 */
  endTime: number

  /** 总耗时（毫秒） */
  duration: number

  /** 组件加载耗时 */
  componentLoadTime?: number

  /** 守卫执行耗时 */
  guardTime?: number

  /** 渲染耗时 */
  renderTime?: number
}

/**
 * 路由错误记录
 */
export interface RouteError {
  /** 错误类型 */
  type: 'navigation' | 'guard' | 'component' | 'permission'

  /** 错误消息 */
  message: string

  /** 错误堆栈 */
  stack?: string

  /** 路由路径 */
  path: string

  /** 时间戳 */
  timestamp: number

  /** 额外信息 */
  extra?: Record<string, unknown>
}

/**
 * 分析统计数据
 */
export interface AnalyticsStats {
  /** 总访问次数 */
  totalVisits: number

  /** 唯一路由数 */
  uniqueRoutes: number

  /** 平均停留时长 */
  avgDuration: number

  /** 最常访问路由 */
  topRoutes: Array<{ path: string; count: number }>

  /** 总错误数 */
  totalErrors: number

  /** 平均导航耗时 */
  avgNavigationTime: number
}

/**
 * 数据上报函数
 */
export type ReportFunction = (
  type: 'visit' | 'performance' | 'error',
  data: RouteVisit | NavigationPerformance | RouteError,
) => void | Promise<void>

/**
 * 分析配置选项
 */
export interface AnalyticsOptions {
  /** 是否启用（默认 true） */
  enabled?: boolean

  /** 是否在开发环境启用（默认 false） */
  enableInDev?: boolean

  /** 数据上报函数 */
  report?: ReportFunction

  /** 是否追踪性能（默认 true） */
  trackPerformance?: boolean

  /** 是否追踪错误（默认 true） */
  trackErrors?: boolean

  /** 最大存储记录数（默认 1000） */
  maxRecords?: number

  /** 批量上报间隔（毫秒，默认 30000） */
  batchInterval?: number

  /** 忽略的路径（正则表达式） */
  ignoredPaths?: RegExp[]

  /** 采样率（0-1，默认 1） */
  sampleRate?: number
}

/**
 * 路由分析管理器
 * 
 * @description
 * 管理路由访问统计和性能监控，提供完整的分析数据。
 * 
 * **内存管理**：
 * - 记录数量限制
 * - 自动清理过期数据
 * - 批量处理优化
 * 
 * ⚡ 性能:
 * - 统计查询: O(1)
 * - 数据上报: 异步批量
 * 
 * @class
 * 
 * @example
 * ```ts
 * const analytics = new AnalyticsManager({
 *   enabled: true,
 *   report: (type, data) => {
 *     // 上报到分析服务
 *     fetch('/api/analytics', {
 *       method: 'POST',
 *       body: JSON.stringify({ type, data }),
 *     })
 *   },
 * })
 * 
 * // 创建守卫
 * const guard = analytics.createGuard()
 * router.beforeEach(guard)
 * 
 * // 获取统计
 * const stats = analytics.getStats()
 * ```
 */
export class AnalyticsManager {
  /** 配置选项 */
  private options: Required<AnalyticsOptions>

  /** 访问记录 */
  private visits: RouteVisit[] = []

  /** 性能记录 */
  private performances: NavigationPerformance[] = []

  /** 错误记录 */
  private errors: RouteError[] = []

  /** 当前访问 */
  private currentVisit: RouteVisit | null = null

  /** 路由访问计数 */
  private visitCounts = new Map<string, number>()

  /** 导航开始时间 */
  private navigationStartTime: number | null = null

  /** 批量上报定时器 */
  private batchTimer?: ReturnType<typeof setInterval>

  /** 待上报队列 */
  private reportQueue: Array<{
    type: 'visit' | 'performance' | 'error'
    data: RouteVisit | NavigationPerformance | RouteError
  }> = []

  /**
   * 创建分析管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: AnalyticsOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      enableInDev: options.enableInDev ?? false,
      report: options.report ?? (() => {}),
      trackPerformance: options.trackPerformance ?? true,
      trackErrors: options.trackErrors ?? true,
      maxRecords: options.maxRecords ?? 1000,
      batchInterval: options.batchInterval ?? 30000,
      ignoredPaths: options.ignoredPaths ?? [],
      sampleRate: options.sampleRate ?? 1,
    }

    // 启动批量上报
    if (this.options.enabled && this.options.batchInterval > 0) {
      this.startBatchReport()
    }
  }

  /**
   * 记录路由访问
   * 
   * @param route - 路由对象
   * @param from - 来源路由
   */
  recordVisit(
    route: RouteLocationNormalized,
    from?: RouteLocationNormalized,
  ): void {
    if (!this.shouldTrack(route)) {
      return
    }

    // 结束上一次访问
    if (this.currentVisit) {
      this.currentVisit.duration = Date.now() - this.currentVisit.timestamp
      this.addToReportQueue('visit', this.currentVisit)
    }

    // 创建新访问记录
    const visit: RouteVisit = {
      path: route.path,
      name: route.name,
      timestamp: Date.now(),
      from: from?.path,
      query: route.query as Record<string, string>,
      params: route.params as Record<string, string>,
      meta: route.meta,
    }

    this.currentVisit = visit
    this.visits.push(visit)

    // 更新访问计数
    const count = this.visitCounts.get(route.path) || 0
    this.visitCounts.set(route.path, count + 1)

    // 限制记录数
    this.trimRecords()
  }

  /**
   * 记录导航性能
   * 
   * @param route - 路由对象
   * @param metrics - 性能指标
   */
  recordPerformance(
    route: RouteLocationNormalized,
    metrics: Partial<NavigationPerformance> = {},
  ): void {
    if (!this.options.trackPerformance || !this.shouldTrack(route)) {
      return
    }

    const endTime = Date.now()
    const startTime = this.navigationStartTime || endTime
    
    const performance: NavigationPerformance = {
      path: route.path,
      startTime,
      endTime,
      duration: endTime - startTime,
      ...metrics,
    }

    this.performances.push(performance)
    this.addToReportQueue('performance', performance)

    // 重置导航开始时间
    this.navigationStartTime = null

    // 限制记录数
    this.trimRecords()
  }

  /**
   * 记录错误
   * 
   * @param error - 错误对象
   */
  recordError(error: RouteError): void {
    if (!this.options.trackErrors) {
      return
    }

    this.errors.push(error)
    this.addToReportQueue('error', error)

    // 限制记录数
    this.trimRecords()
  }

  /**
   * 开始导航计时
   */
  startNavigation(): void {
    if (this.options.trackPerformance) {
      this.navigationStartTime = Date.now()
    }
  }

  /**
   * 创建导航守卫
   * 
   * @returns 导航守卫函数
   */
  createGuard(): NavigationGuard {
    return async (to, from, next) => {
      // 开始计时
      this.startNavigation()

      try {
        // 记录访问
        this.recordVisit(to, from)
        next()
      } catch (error) {
        // 记录错误
        this.recordError({
          type: 'guard',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          path: to.path,
          timestamp: Date.now(),
        })
        next(false)
      }
    }
  }

  /**
   * 创建错误处理器
   * 
   * @returns 错误处理函数
   */
  createErrorHandler() {
    return (error: Error, route: RouteLocationNormalized) => {
      this.recordError({
        type: 'navigation',
        message: error.message,
        stack: error.stack,
        path: route.path,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 获取统计数据
   * 
   * @returns 分析统计
   */
  getStats(): AnalyticsStats {
    const totalVisits = this.visits.length
    const uniqueRoutes = this.visitCounts.size

    // 计算平均停留时长
    const validDurations = this.visits
      .filter(v => v.duration !== undefined)
      .map(v => v.duration!)
    const avgDuration = validDurations.length > 0
      ? validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length
      : 0

    // 获取最常访问路由
    const topRoutes = Array.from(this.visitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // 计算平均导航耗时
    const avgNavigationTime = this.performances.length > 0
      ? this.performances.reduce((sum, p) => sum + p.duration, 0) / this.performances.length
      : 0

    return {
      totalVisits,
      uniqueRoutes,
      avgDuration,
      topRoutes,
      totalErrors: this.errors.length,
      avgNavigationTime,
    }
  }

  /**
   * 获取访问记录
   * 
   * @param limit - 限制数量
   * @returns 访问记录数组
   */
  getVisits(limit?: number): RouteVisit[] {
    return limit ? this.visits.slice(-limit) : [...this.visits]
  }

  /**
   * 获取性能记录
   * 
   * @param limit - 限制数量
   * @returns 性能记录数组
   */
  getPerformances(limit?: number): NavigationPerformance[] {
    return limit ? this.performances.slice(-limit) : [...this.performances]
  }

  /**
   * 获取错误记录
   * 
   * @param limit - 限制数量
   * @returns 错误记录数组
   */
  getErrors(limit?: number): RouteError[] {
    return limit ? this.errors.slice(-limit) : [...this.errors]
  }

  /**
   * 检查是否应该追踪
   * 
   * @private
   */
  private shouldTrack(route: RouteLocationNormalized): boolean {
    // 检查是否启用
    if (!this.options.enabled) {
      return false
    }

    // 检查开发环境
    if (!this.options.enableInDev && process.env.NODE_ENV === 'development') {
      return false
    }

    // 检查忽略路径
    if (this.options.ignoredPaths.some(pattern => pattern.test(route.path))) {
      return false
    }

    // 采样检查
    if (this.options.sampleRate < 1 && Math.random() > this.options.sampleRate) {
      return false
    }

    return true
  }

  /**
   * 添加到上报队列
   * 
   * @private
   */
  private addToReportQueue(
    type: 'visit' | 'performance' | 'error',
    data: RouteVisit | NavigationPerformance | RouteError,
  ): void {
    this.reportQueue.push({ type, data })
  }

  /**
   * 启动批量上报
   * 
   * @private
   */
  private startBatchReport(): void {
    this.batchTimer = setInterval(() => {
      this.flushReportQueue()
    }, this.options.batchInterval)

    // 使用 unref() 防止阻止进程退出
    if (typeof (this.batchTimer as any).unref === 'function') {
      (this.batchTimer as any).unref()
    }
  }

  /**
   * 清空上报队列
   * 
   * @private
   */
  private async flushReportQueue(): Promise<void> {
    if (this.reportQueue.length === 0) {
      return
    }

    const queue = [...this.reportQueue]
    this.reportQueue = []

    // 批量上报
    for (const item of queue) {
      try {
        await this.options.report(item.type, item.data)
      } catch (error) {
        console.error('Analytics report failed:', error)
      }
    }
  }

  /**
   * 限制记录数
   * 
   * @private
   */
  private trimRecords(): void {
    const max = this.options.maxRecords

    if (this.visits.length > max) {
      this.visits = this.visits.slice(-max)
    }

    if (this.performances.length > max) {
      this.performances = this.performances.slice(-max)
    }

    if (this.errors.length > max) {
      this.errors = this.errors.slice(-max)
    }
  }

  /**
   * 清空所有记录
   */
  clear(): void {
    this.visits = []
    this.performances = []
    this.errors = []
    this.visitCounts.clear()
    this.reportQueue = []
    this.currentVisit = null
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
      this.batchTimer = undefined
    }

    // 清空队列
    this.flushReportQueue()
    this.clear()
  }
}

/**
 * 创建分析管理器
 * 
 * @param options - 配置选项
 * @returns 分析管理器实例
 * 
 * @example
 * ```ts
 * const analytics = createAnalyticsManager({
 *   enabled: true,
 *   report: (type, data) => {
 *     console.log('Analytics:', type, data)
 *   },
 * })
 * ```
 */
export function createAnalyticsManager(
  options?: AnalyticsOptions,
): AnalyticsManager {
  return new AnalyticsManager(options)
}
