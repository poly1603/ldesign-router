/**
 * @ldesign/router-core 性能监控
 * 
 * @description
 * 提供路由性能监控和分析功能。
 * 
 * **特性**：
 * - 导航性能监控
 * - 匹配性能监控
 * - 组件加载性能
 * - 守卫执行时间
 * - 性能报告生成
 * - 性能警告阈值
 * 
 * @module features/performance
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 导航开始时间 */
  navigationStart: number
  
  /** 导航结束时间 */
  navigationEnd: number
  
  /** 总耗时 (ms) */
  duration: number
  
  /** 路由匹配耗时 (ms) */
  matchingTime: number
  
  /** 守卫执行耗时 (ms) */
  guardTime: number
  
  /** 组件加载耗时 (ms) */
  componentLoadTime: number
  
  /** 滚动处理耗时 (ms) */
  scrollTime: number
  
  /** 是否使用缓存 */
  cached: boolean
  
  /** 内存使用 (bytes, 如果可用) */
  memoryUsed?: number
}

/**
 * 性能记录
 */
export interface PerformanceRecord {
  /** 记录ID */
  id: string
  
  /** 时间戳 */
  timestamp: number
  
  /** 目标路由 */
  to: string
  
  /** 来源路由 */
  from: string
  
  /** 性能指标 */
  metrics: PerformanceMetrics
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  /** 总导航次数 */
  totalNavigations: number
  
  /** 平均导航时间 (ms) */
  averageNavigationTime: number
  
  /** 最慢导航 */
  slowestNavigation: PerformanceRecord | null
  
  /** 最快导航 */
  fastestNavigation: PerformanceRecord | null
  
  /** 缓存命中次数 */
  cacheHits: number
  
  /** 缓存命中率 */
  cacheHitRate: number
  
  /** 平均匹配时间 (ms) */
  averageMatchingTime: number
  
  /** 平均守卫时间 (ms) */
  averageGuardTime: number
  
  /** 总内存使用 (bytes) */
  totalMemoryUsed: number
}

/**
 * 性能警告
 */
export interface PerformanceWarning {
  /** 警告类型 */
  type: 'slow-navigation' | 'slow-matching' | 'slow-guard' | 'memory-high'
  
  /** 警告消息 */
  message: string
  
  /** 相关记录 */
  record: PerformanceRecord
  
  /** 时间戳 */
  timestamp: number
}

/**
 * 性能监控选项
 */
export interface PerformanceMonitorOptions {
  /** 是否启用 */
  enabled?: boolean
  
  /** 最大记录数 */
  maxRecords?: number
  
  /** 慢导航阈值 (ms) */
  slowNavigationThreshold?: number
  
  /** 慢匹配阈值 (ms) */
  slowMatchingThreshold?: number
  
  /** 慢守卫阈值 (ms) */
  slowGuardThreshold?: number
  
  /** 高内存阈值 (bytes) */
  highMemoryThreshold?: number
  
  /** 警告回调 */
  onWarning?: (warning: PerformanceWarning) => void
}

/**
 * 性能计时器
 */
class PerformanceTimer {
  private marks = new Map<string, number>()

  /**
   * 标记时间点
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 测量时间差
   */
  measure(startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    if (!start) return 0

    const end = endMark ? this.marks.get(endMark) : performance.now()
    if (!end) return 0

    return end - start
  }

  /**
   * 清除标记
   */
  clear(): void {
    this.marks.clear()
  }
}

/**
 * 性能监控管理器
 */
export class PerformanceMonitor {
  private options: Required<Omit<PerformanceMonitorOptions, 'onWarning'>> & {
    onWarning?: (warning: PerformanceWarning) => void
  }
  private records: PerformanceRecord[] = []
  private warnings: PerformanceWarning[] = []
  private timer = new PerformanceTimer()
  private currentRecordId = 0
  private isClient = typeof window !== 'undefined' && typeof performance !== 'undefined'

  constructor(options: PerformanceMonitorOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      maxRecords: options.maxRecords || 100,
      slowNavigationThreshold: options.slowNavigationThreshold || 1000,
      slowMatchingThreshold: options.slowMatchingThreshold || 100,
      slowGuardThreshold: options.slowGuardThreshold || 500,
      highMemoryThreshold: options.highMemoryThreshold || 50 * 1024 * 1024, // 50MB
      onWarning: options.onWarning,
    }
  }

  // ==================== 监控控制 ====================

  /**
   * 启用监控
   */
  enable(): void {
    this.options.enabled = true
  }

  /**
   * 禁用监控
   */
  disable(): void {
    this.options.enabled = false
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.options.enabled && this.isClient
  }

  // ==================== 导航监控 ====================

  /**
   * 开始导航监控
   */
  startNavigation(to: RouteLocationNormalized, from: RouteLocationNormalized): string {
    if (!this.isEnabled()) return ''

    const id = `nav_${this.currentRecordId++}`
    this.timer.mark(`${id}_start`)
    this.timer.mark(`${id}_navigation_start`)

    return id
  }

  /**
   * 记录匹配开始
   */
  markMatchingStart(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_matching_start`)
  }

  /**
   * 记录匹配结束
   */
  markMatchingEnd(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_matching_end`)
  }

  /**
   * 记录守卫开始
   */
  markGuardStart(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_guard_start`)
  }

  /**
   * 记录守卫结束
   */
  markGuardEnd(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_guard_end`)
  }

  /**
   * 记录组件加载开始
   */
  markComponentLoadStart(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_component_start`)
  }

  /**
   * 记录组件加载结束
   */
  markComponentLoadEnd(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_component_end`)
  }

  /**
   * 记录滚动开始
   */
  markScrollStart(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_scroll_start`)
  }

  /**
   * 记录滚动结束
   */
  markScrollEnd(id: string): void {
    if (!this.isEnabled() || !id) return
    this.timer.mark(`${id}_scroll_end`)
  }

  /**
   * 结束导航监控
   */
  endNavigation(
    id: string,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    cached: boolean = false,
  ): void {
    if (!this.isEnabled() || !id) return

    this.timer.mark(`${id}_navigation_end`)
    this.timer.mark(`${id}_end`)

    // 计算各项指标
    const navigationStart = this.timer.marks.get(`${id}_navigation_start`) || 0
    const navigationEnd = this.timer.marks.get(`${id}_navigation_end`) || 0
    const duration = this.timer.measure(`${id}_start`, `${id}_end`)
    const matchingTime = this.timer.measure(`${id}_matching_start`, `${id}_matching_end`)
    const guardTime = this.timer.measure(`${id}_guard_start`, `${id}_guard_end`)
    const componentLoadTime = this.timer.measure(`${id}_component_start`, `${id}_component_end`)
    const scrollTime = this.timer.measure(`${id}_scroll_start`, `${id}_scroll_end`)

    // 获取内存使用
    let memoryUsed: number | undefined
    if (this.isClient && (performance as any).memory) {
      memoryUsed = (performance as any).memory.usedJSHeapSize
    }

    // 创建性能记录
    const record: PerformanceRecord = {
      id,
      timestamp: Date.now(),
      to: to.path,
      from: from.path,
      metrics: {
        navigationStart,
        navigationEnd,
        duration,
        matchingTime,
        guardTime,
        componentLoadTime,
        scrollTime,
        cached,
        memoryUsed,
      },
    }

    // 保存记录
    this.addRecord(record)

    // 检查性能警告
    this.checkWarnings(record)

    // 清理计时器标记
    this.timer.clear()
  }

  /**
   * 添加记录
   */
  private addRecord(record: PerformanceRecord): void {
    this.records.push(record)

    // 限制记录数量
    if (this.records.length > this.options.maxRecords) {
      this.records.shift()
    }
  }

  // ==================== 性能警告 ====================

  /**
   * 检查性能警告
   */
  private checkWarnings(record: PerformanceRecord): void {
    const { metrics } = record

    // 检查慢导航
    if (metrics.duration > this.options.slowNavigationThreshold) {
      this.addWarning({
        type: 'slow-navigation',
        message: `Slow navigation detected: ${metrics.duration.toFixed(2)}ms (threshold: ${this.options.slowNavigationThreshold}ms)`,
        record,
        timestamp: Date.now(),
      })
    }

    // 检查慢匹配
    if (metrics.matchingTime > this.options.slowMatchingThreshold) {
      this.addWarning({
        type: 'slow-matching',
        message: `Slow route matching: ${metrics.matchingTime.toFixed(2)}ms (threshold: ${this.options.slowMatchingThreshold}ms)`,
        record,
        timestamp: Date.now(),
      })
    }

    // 检查慢守卫
    if (metrics.guardTime > this.options.slowGuardThreshold) {
      this.addWarning({
        type: 'slow-guard',
        message: `Slow guard execution: ${metrics.guardTime.toFixed(2)}ms (threshold: ${this.options.slowGuardThreshold}ms)`,
        record,
        timestamp: Date.now(),
      })
    }

    // 检查高内存
    if (metrics.memoryUsed && metrics.memoryUsed > this.options.highMemoryThreshold) {
      this.addWarning({
        type: 'memory-high',
        message: `High memory usage: ${(metrics.memoryUsed / 1024 / 1024).toFixed(2)}MB (threshold: ${(this.options.highMemoryThreshold / 1024 / 1024).toFixed(2)}MB)`,
        record,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 添加警告
   */
  private addWarning(warning: PerformanceWarning): void {
    this.warnings.push(warning)

    // 触发回调
    if (this.options.onWarning) {
      this.options.onWarning(warning)
    }
  }

  // ==================== 统计分析 ====================

  /**
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    const records = this.records
    const totalNavigations = records.length

    if (totalNavigations === 0) {
      return {
        totalNavigations: 0,
        averageNavigationTime: 0,
        slowestNavigation: null,
        fastestNavigation: null,
        cacheHits: 0,
        cacheHitRate: 0,
        averageMatchingTime: 0,
        averageGuardTime: 0,
        totalMemoryUsed: 0,
      }
    }

    // 计算平均值
    const totalTime = records.reduce((sum, r) => sum + r.metrics.duration, 0)
    const totalMatchingTime = records.reduce((sum, r) => sum + r.metrics.matchingTime, 0)
    const totalGuardTime = records.reduce((sum, r) => sum + r.metrics.guardTime, 0)
    const cacheHits = records.filter(r => r.metrics.cached).length
    const totalMemory = records.reduce((sum, r) => sum + (r.metrics.memoryUsed || 0), 0)

    // 找出最慢和最快
    let slowest = records[0]
    let fastest = records[0]

    for (const record of records) {
      if (record.metrics.duration > slowest.metrics.duration) {
        slowest = record
      }
      if (record.metrics.duration < fastest.metrics.duration) {
        fastest = record
      }
    }

    return {
      totalNavigations,
      averageNavigationTime: totalTime / totalNavigations,
      slowestNavigation: slowest,
      fastestNavigation: fastest,
      cacheHits,
      cacheHitRate: cacheHits / totalNavigations,
      averageMatchingTime: totalMatchingTime / totalNavigations,
      averageGuardTime: totalGuardTime / totalNavigations,
      totalMemoryUsed: totalMemory,
    }
  }

  /**
   * 获取所有记录
   */
  getRecords(): PerformanceRecord[] {
    return [...this.records]
  }

  /**
   * 获取最近的记录
   */
  getRecentRecords(count: number = 10): PerformanceRecord[] {
    return this.records.slice(-count)
  }

  /**
   * 获取所有警告
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings]
  }

  /**
   * 清空记录
   */
  clearRecords(): void {
    this.records = []
  }

  /**
   * 清空警告
   */
  clearWarnings(): void {
    this.warnings = []
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const stats = this.getStats()
    const warnings = this.warnings

    let report = '=== Router Performance Report ===\n\n'

    report += `Total Navigations: ${stats.totalNavigations}\n`
    report += `Average Navigation Time: ${stats.averageNavigationTime.toFixed(2)}ms\n`
    report += `Average Matching Time: ${stats.averageMatchingTime.toFixed(2)}ms\n`
    report += `Average Guard Time: ${stats.averageGuardTime.toFixed(2)}ms\n`
    report += `Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(2)}%\n`
    
    if (stats.totalMemoryUsed > 0) {
      report += `Total Memory Used: ${(stats.totalMemoryUsed / 1024 / 1024).toFixed(2)}MB\n`
    }

    if (stats.slowestNavigation) {
      report += `\nSlowest Navigation: ${stats.slowestNavigation.to} (${stats.slowestNavigation.metrics.duration.toFixed(2)}ms)\n`
    }

    if (stats.fastestNavigation) {
      report += `Fastest Navigation: ${stats.fastestNavigation.to} (${stats.fastestNavigation.metrics.duration.toFixed(2)}ms)\n`
    }

    if (warnings.length > 0) {
      report += `\nWarnings (${warnings.length}):\n`
      for (const warning of warnings.slice(-10)) {
        report += `- [${warning.type}] ${warning.message}\n`
      }
    }

    return report
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.records = []
    this.warnings = []
    this.timer.clear()
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(options?: PerformanceMonitorOptions): PerformanceMonitor {
  return new PerformanceMonitor(options)
}
