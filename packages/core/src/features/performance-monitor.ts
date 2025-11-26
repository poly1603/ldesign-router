/**
 * 性能监控和分析工具
 * 提供路由性能的实时监控、分析和报告功能
 */

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  /** 导航开始时间 */
  navigationStart: number
  /** 路由匹配耗时 (ms) */
  matchDuration: number
  /** 守卫执行耗时 (ms) */
  guardDuration: number
  /** 组件加载耗时 (ms) */
  componentLoadDuration: number
  /** 总导航耗时 (ms) */
  totalDuration: number
  /** 内存使用 (bytes) */
  memoryUsage?: number
  /** 路由路径 */
  path: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 性能统计数据
 */
export interface PerformanceStats {
  /** 总导航次数 */
  totalNavigations: number
  /** 平均导航耗时 (ms) */
  averageDuration: number
  /** 最快导航耗时 (ms) */
  minDuration: number
  /** 最慢导航耗时 (ms) */
  maxDuration: number
  /** 平均匹配耗时 (ms) */
  averageMatchDuration: number
  /** 平均守卫耗时 (ms) */
  averageGuardDuration: number
  /** 平均组件加载耗时 (ms) */
  averageComponentLoadDuration: number
  /** 内存使用趋势 */
  memoryTrend?: {
    min: number
    max: number
    average: number
  }
}

/**
 * 性能阈值配置
 */
export interface PerformanceThresholds {
  /** 匹配耗时警告阈值 (ms) */
  matchWarning?: number
  /** 匹配耗时错误阈值 (ms) */
  matchError?: number
  /** 守卫耗时警告阈值 (ms) */
  guardWarning?: number
  /** 守卫耗时错误阈值 (ms) */
  guardError?: number
  /** 总耗时警告阈值 (ms) */
  totalWarning?: number
  /** 总耗时错误阈值 (ms) */
  totalError?: number
  /** 内存使用警告阈值 (bytes) */
  memoryWarning?: number
}

/**
 * 性能警告
 */
export interface PerformanceWarning {
  type: 'match' | 'guard' | 'component' | 'total' | 'memory'
  level: 'warning' | 'error'
  message: string
  value: number
  threshold: number
  path: string
  timestamp: number
}

/**
 * 性能监控器配置
 */
export interface PerformanceMonitorOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 最大记录数量 */
  maxRecords?: number
  /** 是否记录内存使用 */
  trackMemory?: boolean
  /** 性能阈值 */
  thresholds?: PerformanceThresholds
  /** 警告回调 */
  onWarning?: (warning: PerformanceWarning) => void
  /** 是否自动清理旧记录 */
  autoCleanup?: boolean
  /** 清理间隔 (ms) */
  cleanupInterval?: number
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private warnings: PerformanceWarning[] = []
  private currentNavigation: Partial<PerformanceMetrics> | null = null
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  
  private readonly options: Required<PerformanceMonitorOptions>

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      maxRecords: options.maxRecords ?? 100,
      trackMemory: options.trackMemory ?? true,
      thresholds: {
        matchWarning: 1,
        matchError: 5,
        guardWarning: 50,
        guardError: 200,
        totalWarning: 100,
        totalError: 500,
        memoryWarning: 50 * 1024 * 1024, // 50MB
        ...options.thresholds,
      },
      onWarning: options.onWarning ?? (() => {}),
      autoCleanup: options.autoCleanup ?? true,
      cleanupInterval: options.cleanupInterval ?? 60000, // 1分钟
    }

    if (this.options.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 开始导航性能记录
   */
  startNavigation(path: string): void {
    if (!this.options.enabled) return

    this.currentNavigation = {
      path,
      navigationStart: performance.now(),
      timestamp: Date.now(),
    }
  }

  /**
   * 记录匹配耗时
   */
  recordMatch(duration: number): void {
    if (!this.options.enabled || !this.currentNavigation) return

    this.currentNavigation.matchDuration = duration

    // 检查阈值
    this.checkThreshold('match', duration, this.currentNavigation.path!)
  }

  /**
   * 记录守卫耗时
   */
  recordGuard(duration: number): void {
    if (!this.options.enabled || !this.currentNavigation) return

    this.currentNavigation.guardDuration = duration

    // 检查阈值
    this.checkThreshold('guard', duration, this.currentNavigation.path!)
  }

  /**
   * 记录组件加载耗时
   */
  recordComponentLoad(duration: number): void {
    if (!this.options.enabled || !this.currentNavigation) return

    this.currentNavigation.componentLoadDuration = duration
  }

  /**
   * 完成导航性能记录
   */
  endNavigation(): void {
    if (!this.options.enabled || !this.currentNavigation) return

    const navigation = this.currentNavigation
    const totalDuration = performance.now() - navigation.navigationStart!

    const metrics: PerformanceMetrics = {
      navigationStart: navigation.navigationStart!,
      matchDuration: navigation.matchDuration ?? 0,
      guardDuration: navigation.guardDuration ?? 0,
      componentLoadDuration: navigation.componentLoadDuration ?? 0,
      totalDuration,
      path: navigation.path!,
      timestamp: navigation.timestamp!,
    }

    // 记录内存使用
    if (this.options.trackMemory && typeof performance !== 'undefined' && 'memory' in performance) {
      metrics.memoryUsage = (performance as any).memory?.usedJSHeapSize
      
      // 检查内存阈值
      if (metrics.memoryUsage && this.options.thresholds.memoryWarning) {
        if (metrics.memoryUsage > this.options.thresholds.memoryWarning) {
          this.addWarning({
            type: 'memory',
            level: 'warning',
            message: `Memory usage is high: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
            value: metrics.memoryUsage,
            threshold: this.options.thresholds.memoryWarning,
            path: metrics.path,
            timestamp: Date.now(),
          })
        }
      }
    }

    // 检查总耗时阈值
    this.checkThreshold('total', totalDuration, metrics.path)

    // 添加到记录
    this.metrics.push(metrics)

    // 限制记录数量
    if (this.metrics.length > this.options.maxRecords) {
      this.metrics.shift()
    }

    this.currentNavigation = null
  }

  /**
   * 检查性能阈值
   */
  private checkThreshold(type: 'match' | 'guard' | 'total', value: number, path: string): void {
    const warningKey = `${type}Warning` as keyof PerformanceThresholds
    const errorKey = `${type}Error` as keyof PerformanceThresholds
    
    const warningThreshold = this.options.thresholds[warningKey]
    const errorThreshold = this.options.thresholds[errorKey]

    if (errorThreshold && value > errorThreshold) {
      this.addWarning({
        type,
        level: 'error',
        message: `${type} duration exceeded error threshold: ${value.toFixed(2)}ms > ${errorThreshold}ms`,
        value,
        threshold: errorThreshold,
        path,
        timestamp: Date.now(),
      })
    } else if (warningThreshold && value > warningThreshold) {
      this.addWarning({
        type,
        level: 'warning',
        message: `${type} duration exceeded warning threshold: ${value.toFixed(2)}ms > ${warningThreshold}ms`,
        value,
        threshold: warningThreshold,
        path,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 添加警告
   */
  private addWarning(warning: PerformanceWarning): void {
    this.warnings.push(warning)
    
    // 限制警告数量
    if (this.warnings.length > this.options.maxRecords) {
      this.warnings.shift()
    }

    // 触发回调
    this.options.onWarning(warning)
  }

  /**
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalNavigations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        averageMatchDuration: 0,
        averageGuardDuration: 0,
        averageComponentLoadDuration: 0,
      }
    }

    const durations = this.metrics.map(m => m.totalDuration)
    const matchDurations = this.metrics.map(m => m.matchDuration)
    const guardDurations = this.metrics.map(m => m.guardDuration)
    const componentLoadDurations = this.metrics.map(m => m.componentLoadDuration)

    const stats: PerformanceStats = {
      totalNavigations: this.metrics.length,
      averageDuration: this.average(durations),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      averageMatchDuration: this.average(matchDurations),
      averageGuardDuration: this.average(guardDurations),
      averageComponentLoadDuration: this.average(componentLoadDurations),
    }

    // 内存统计
    if (this.options.trackMemory) {
      const memoryUsages = this.metrics
        .map(m => m.memoryUsage)
        .filter((m): m is number => m !== undefined)

      if (memoryUsages.length > 0) {
        stats.memoryTrend = {
          min: Math.min(...memoryUsages),
          max: Math.max(...memoryUsages),
          average: this.average(memoryUsages),
        }
      }
    }

    return stats
  }

  /**
   * 获取最近的性能记录
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count)
  }

  /**
   * 获取警告列表
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings]
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const stats = this.getStats()
    const warnings = this.warnings

    const report = `
===========================================
Router Performance Report
===========================================

Statistics:
-----------
Total Navigations: ${stats.totalNavigations}
Average Duration: ${stats.averageDuration.toFixed(2)}ms
Min Duration: ${stats.minDuration.toFixed(2)}ms
Max Duration: ${stats.maxDuration.toFixed(2)}ms

Breakdown:
-----------
Average Match Duration: ${stats.averageMatchDuration.toFixed(2)}ms
Average Guard Duration: ${stats.averageGuardDuration.toFixed(2)}ms
Average Component Load: ${stats.averageComponentLoadDuration.toFixed(2)}ms

${stats.memoryTrend ? `
Memory Usage:
-----------
Min: ${(stats.memoryTrend.min / 1024 / 1024).toFixed(2)}MB
Max: ${(stats.memoryTrend.max / 1024 / 1024).toFixed(2)}MB
Average: ${(stats.memoryTrend.average / 1024 / 1024).toFixed(2)}MB
` : ''}

${warnings.length > 0 ? `
Warnings (${warnings.length}):
-----------
${warnings.slice(-10).map(w => 
  `[${w.level.toUpperCase()}] ${w.type}: ${w.message} (${w.path})`
).join('\n')}
` : 'No warnings'}

===========================================
    `.trim()

    return report
  }

  /**
   * 清除所有记录
   */
  clear(): void {
    this.metrics = []
    this.warnings = []
    this.currentNavigation = null
  }

  /**
   * 启用/禁用监控
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.options.enabled
  }

  /**
   * 开始自动清理
   */
  private startAutoCleanup(): void {
    if (this.cleanupTimer) return

    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      const threshold = 24 * 60 * 60 * 1000 // 24小时

      // 清理旧的性能记录
      this.metrics = this.metrics.filter(m => now - m.timestamp < threshold)
      
      // 清理旧的警告
      this.warnings = this.warnings.filter(w => now - w.timestamp < threshold)
    }, this.options.cleanupInterval)
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 计算平均值
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.clear()
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(
  options?: PerformanceMonitorOptions
): PerformanceMonitor {
  return new PerformanceMonitor(options)
}