/**
 * 高级路由性能优化系统
 * 
 * 提供全面的性能优化和监控功能
 * 
 * @module features/advanced-performance
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 路由解析时间 (ms) */
  resolveTime: number
  /** 匹配时间 (ms) */
  matchTime: number
  /** 守卫执行时间 (ms) */
  guardTime: number
  /** 总导航时间 (ms) */
  totalTime: number
  /** 缓存命中 */
  cacheHit: boolean
  /** 时间戳 */
  timestamp: number
}

/**
 * 性能记录
 */
export interface PerformanceRecord extends PerformanceMetrics {
  /** 路径 */
  path: string
  /** 导航ID */
  navigationId: string
}

/**
 * 性能统计
 */
export interface AdvancedPerformanceStats {
  /** 总导航次数 */
  totalNavigations: number
  /** 平均导航时间 */
  avgNavigationTime: number
  /** 最慢导航 */
  slowestNavigation: PerformanceRecord | null
  /** 缓存命中率 */
  cacheHitRate: number
  /** 性能警告数 */
  warningCount: number
  /** 最近的性能警告 */
  recentWarnings: PerformanceWarning[]
  /** 按路径统计 */
  byPath: Map<string, PathPerformanceStats>
}

/**
 * 路径性能统计
 */
export interface PathPerformanceStats {
  /** 访问次数 */
  count: number
  /** 平均时间 */
  avgTime: number
  /** 最小时间 */
  minTime: number
  /** 最大时间 */
  maxTime: number
  /** 缓存命中次数 */
  cacheHits: number
}

/**
 * 性能警告
 */
export interface PerformanceWarning {
  /** 警告类型 */
  type: 'slow-navigation' | 'slow-guard' | 'slow-match' | 'cache-miss'
  /** 消息 */
  message: string
  /** 路径 */
  path: string
  /** 时间 */
  time: number
  /** 阈值 */
  threshold: number
  /** 时间戳 */
  timestamp: number
}

/**
 * 性能阈值配置
 */
export interface PerformanceThresholds {
  /** 导航时间阈值 (ms) */
  navigation: number
  /** 匹配时间阈值 (ms) */
  match: number
  /** 守卫时间阈值 (ms) */
  guard: number
  /** 缓存命中率阈值 */
  cacheHitRate: number
}

/**
 * 高级性能监控器选项
 */
export interface AdvancedPerformanceMonitorOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 性能阈值 */
  thresholds?: Partial<PerformanceThresholds>
  /** 最大记录数 */
  maxRecords?: number
  /** 最大警告数 */
  maxWarnings?: number
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 是否记录详细信息 */
  detailed?: boolean
}

/**
 * 默认性能阈值
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  navigation: 100, // 100ms
  match: 10, // 10ms
  guard: 50, // 50ms
  cacheHitRate: 0.8, // 80%
}

/**
 * 高级性能监控器
 * 
 * 提供全面的路由性能监控和优化建议
 * 
 * @example
 * ```typescript
 * const monitor = new AdvancedPerformanceMonitor({
 *   thresholds: {
 *     navigation: 100,
 *     match: 10
 *   }
 * })
 * 
 * // 记录导航性能
 * const metrics = monitor.recordNavigation('/user/123', {
 *   resolveTime: 5,
 *   matchTime: 3,
 *   guardTime: 20,
 *   totalTime: 28,
 *   cacheHit: true
 * })
 * 
 * // 获取统计信息
 * const stats = monitor.getStats()
 * console.log(`平均导航时间: ${stats.avgNavigationTime}ms`)
 * console.log(`缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`)
 * ```
 */
export class AdvancedPerformanceMonitor {
  private options: Required<AdvancedPerformanceMonitorOptions>
  private thresholds: PerformanceThresholds
  private records: PerformanceRecord[] = []
  private warnings: PerformanceWarning[] = []
  private pathStats = new Map<string, PathPerformanceStats>()
  private navigationCounter = 0

  constructor(options: AdvancedPerformanceMonitorOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      thresholds: options.thresholds || {},
      maxRecords: options.maxRecords || 1000,
      maxWarnings: options.maxWarnings || 100,
      sampleRate: options.sampleRate || 1.0,
      detailed: options.detailed ?? true,
    }

    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...this.options.thresholds,
    }
  }

  /**
   * 记录导航性能
   */
  recordNavigation(
    path: string,
    metrics: Omit<PerformanceMetrics, 'timestamp'>
  ): PerformanceRecord {
    if (!this.options.enabled) {
      return this.createRecord(path, metrics)
    }

    // 采样控制
    if (Math.random() > this.options.sampleRate) {
      return this.createRecord(path, metrics)
    }

    const record = this.createRecord(path, metrics)

    // 保存记录
    this.records.push(record)
    if (this.records.length > this.options.maxRecords) {
      this.records.shift()
    }

    // 更新路径统计
    this.updatePathStats(path, metrics)

    // 检查性能警告
    this.checkPerformanceWarnings(path, metrics)

    return record
  }

  /**
   * 创建性能记录
   */
  private createRecord(
    path: string,
    metrics: Omit<PerformanceMetrics, 'timestamp'>
  ): PerformanceRecord {
    return {
      path,
      navigationId: `nav-${++this.navigationCounter}`,
      ...metrics,
      timestamp: Date.now(),
    }
  }

  /**
   * 更新路径统计
   */
  private updatePathStats(
    path: string,
    metrics: Omit<PerformanceMetrics, 'timestamp'>
  ): void {
    const stats = this.pathStats.get(path) || {
      count: 0,
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      cacheHits: 0,
    }

    stats.count++
    stats.minTime = Math.min(stats.minTime, metrics.totalTime)
    stats.maxTime = Math.max(stats.maxTime, metrics.totalTime)
    stats.avgTime =
      (stats.avgTime * (stats.count - 1) + metrics.totalTime) / stats.count
    if (metrics.cacheHit) {
      stats.cacheHits++
    }

    this.pathStats.set(path, stats)
  }

  /**
   * 检查性能警告
   */
  private checkPerformanceWarnings(
    path: string,
    metrics: Omit<PerformanceMetrics, 'timestamp'>
  ): void {
    // 检查导航时间
    if (metrics.totalTime > this.thresholds.navigation) {
      this.addWarning({
        type: 'slow-navigation',
        message: `Slow navigation detected: ${metrics.totalTime}ms (threshold: ${this.thresholds.navigation}ms)`,
        path,
        time: metrics.totalTime,
        threshold: this.thresholds.navigation,
        timestamp: Date.now(),
      })
    }

    // 检查匹配时间
    if (metrics.matchTime > this.thresholds.match) {
      this.addWarning({
        type: 'slow-match',
        message: `Slow route matching: ${metrics.matchTime}ms (threshold: ${this.thresholds.match}ms)`,
        path,
        time: metrics.matchTime,
        threshold: this.thresholds.match,
        timestamp: Date.now(),
      })
    }

    // 检查守卫时间
    if (metrics.guardTime > this.thresholds.guard) {
      this.addWarning({
        type: 'slow-guard',
        message: `Slow guard execution: ${metrics.guardTime}ms (threshold: ${this.thresholds.guard}ms)`,
        path,
        time: metrics.guardTime,
        threshold: this.thresholds.guard,
        timestamp: Date.now(),
      })
    }

    // 检查缓存命中
    if (!metrics.cacheHit) {
      const pathStats = this.pathStats.get(path)
      if (pathStats && pathStats.count > 1) {
        this.addWarning({
          type: 'cache-miss',
          message: `Cache miss for frequently visited path: ${path}`,
          path,
          time: metrics.totalTime,
          threshold: 0,
          timestamp: Date.now(),
        })
      }
    }
  }

  /**
   * 添加警告
   */
  private addWarning(warning: PerformanceWarning): void {
    this.warnings.push(warning)
    if (this.warnings.length > this.options.maxWarnings) {
      this.warnings.shift()
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): AdvancedPerformanceStats {
    const totalNavigations = this.records.length
    const avgNavigationTime =
      totalNavigations > 0
        ? this.records.reduce((sum, r) => sum + r.totalTime, 0) / totalNavigations
        : 0

    const slowestNavigation =
      this.records.length > 0
        ? this.records.reduce((slowest, current) =>
          current.totalTime > slowest.totalTime ? current : slowest
        )
        : null

    const cacheHits = this.records.filter((r) => r.cacheHit).length
    const cacheHitRate = totalNavigations > 0 ? cacheHits / totalNavigations : 0

    return {
      totalNavigations,
      avgNavigationTime,
      slowestNavigation,
      cacheHitRate,
      warningCount: this.warnings.length,
      recentWarnings: this.warnings.slice(-10),
      byPath: new Map(this.pathStats),
    }
  }

  /**
   * 获取路径统计
   */
  getPathStats(path: string): PathPerformanceStats | undefined {
    return this.pathStats.get(path)
  }

  /**
   * 获取所有警告
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings]
  }

  /**
   * 清除警告
   */
  clearWarnings(): void {
    this.warnings = []
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.records = []
    this.warnings = []
    this.pathStats.clear()
    this.navigationCounter = 0
  }

  /**
   * 获取性能报告
   */
  getReport(): string {
    const stats = this.getStats()
    const lines: string[] = []

    lines.push('=== 路由性能报告 ===')
    lines.push(`总导航次数: ${stats.totalNavigations}`)
    lines.push(`平均导航时间: ${stats.avgNavigationTime.toFixed(2)}ms`)
    lines.push(`缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`)
    lines.push(`性能警告数: ${stats.warningCount}`)

    if (stats.slowestNavigation) {
      lines.push('')
      lines.push('=== 最慢导航 ===')
      lines.push(`路径: ${stats.slowestNavigation.path}`)
      lines.push(`总时间: ${stats.slowestNavigation.totalTime.toFixed(2)}ms`)
      lines.push(`解析时间: ${stats.slowestNavigation.resolveTime.toFixed(2)}ms`)
      lines.push(`匹配时间: ${stats.slowestNavigation.matchTime.toFixed(2)}ms`)
      lines.push(`守卫时间: ${stats.slowestNavigation.guardTime.toFixed(2)}ms`)
    }

    if (stats.recentWarnings.length > 0) {
      lines.push('')
      lines.push('=== 最近的警告 ===')
      stats.recentWarnings.forEach((warning, index) => {
        lines.push(
          `${index + 1}. [${warning.type}] ${warning.message} (${warning.path})`
        )
      })
    }

    // 最慢的路径
    if (stats.byPath.size > 0) {
      lines.push('')
      lines.push('=== 最慢的路径 (Top 5) ===')
      const sortedPaths = Array.from(stats.byPath.entries())
        .sort((a, b) => b[1].avgTime - a[1].avgTime)
        .slice(0, 5)

      sortedPaths.forEach(([path, pathStats], index) => {
        lines.push(
          `${index + 1}. ${path}: ${pathStats.avgTime.toFixed(2)}ms (访问${pathStats.count}次)`
        )
      })
    }

    return lines.join('\n')
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.reset()
  }
}

/**
 * 创建高级性能监控器
 */
export function createAdvancedPerformanceMonitor(
  options?: AdvancedPerformanceMonitorOptions
): AdvancedPerformanceMonitor {
  return new AdvancedPerformanceMonitor(options)
}
