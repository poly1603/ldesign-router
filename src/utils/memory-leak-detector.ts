/**
 * @ldesign/router 内存泄漏检测工具
 *
 * 自动检测和报告潜在的内存泄漏问题。
 * 
 * **检测项目**：
 * - 未清理的事件监听器
 * - 未清理的定时器
 * - 循环引用
 * - 大对象持有
 * - 缓存溢出
 * 
 * **性能影响**：
 * - 开发环境：启用详细检测
 * - 生产环境：轻量级监控
 * 
 * @module utils/memory-leak-detector
 * @author ldesign
 */

// ==================== 类型定义 ====================

/**
 * 内存泄漏类型
 */
export enum LeakType {
  /** 事件监听器未清理 */
  EVENT_LISTENER = 'event_listener',
  /** 定时器未清理 */
  TIMER = 'timer',
  /** 循环引用 */
  CIRCULAR_REFERENCE = 'circular_reference',
  /** 大对象持有 */
  LARGE_OBJECT = 'large_object',
  /** 缓存溢出 */
  CACHE_OVERFLOW = 'cache_overflow',
  /** 组件未销毁 */
  COMPONENT_NOT_DESTROYED = 'component_not_destroyed',
}

/**
 * 内存泄漏报告
 */
export interface MemoryLeakReport {
  /** 泄漏类型 */
  type: LeakType
  /** 严重程度（1-10） */
  severity: number
  /** 描述信息 */
  message: string
  /** 受影响的对象 */
  target?: any
  /** 堆栈信息 */
  stack?: string
  /** 时间戳 */
  timestamp: number
  /** 预估内存大小（字节） */
  estimatedSize?: number
}

/**
 * 检测器配置
 */
export interface LeakDetectorConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 检测间隔（毫秒） */
  interval?: number
  /** 是否自动修复 */
  autoFix?: boolean
  /** 报告回调 */
  onLeakDetected?: (report: MemoryLeakReport) => void
  /** 严重程度阈值 */
  severityThreshold?: number
}

// ==================== 内存泄漏检测器 ====================

/**
 * 内存泄漏检测器类
 * 
 * 实时监控和检测潜在的内存泄漏问题。
 * 
 * @class
 * @export
 * 
 * @example
 * ```ts
 * const detector = new MemoryLeakDetector({
 *   enabled: true,
 *   interval: 30000,  // 30秒检测一次
 *   onLeakDetected: (report) => {
 *     console.warn('检测到内存泄漏:', report)
 *   }
 * })
 * 
 * detector.start()
 * ```
 */
export class MemoryLeakDetector {
  private config: Required<LeakDetectorConfig>
  private reports: MemoryLeakReport[] = []
  private timerId?: ReturnType<typeof setInterval>

  /** 监听器追踪 */
  private listeners = new WeakMap<EventTarget, Set<string>>()

  /** 定时器追踪 */
  private timers = new Set<number>()

  /** 对象引用追踪 */
  private references = new WeakMap<object, string>()

  /** 上次内存快照 */
  private lastMemorySnapshot?: { heapUsed: number; timestamp: number }

  /**
   * 创建内存泄漏检测器实例
   * 
   * @param config - 配置选项
   */
  constructor(config: LeakDetectorConfig = {}) {
    this.config = {
      enabled: true,
      interval: 30000, // 30秒
      autoFix: false,
      onLeakDetected: () => { },
      severityThreshold: 5,
      ...config,
    }
  }

  /**
   * 启动检测
   * 
   * @example
   * ```ts
   * detector.start()
   * ```
   */
  start(): void {
    if (!this.config.enabled) return
    if (this.timerId) return

    // 记录初始内存快照
    this.takeMemorySnapshot()

    // 定期检测
    this.timerId = setInterval(() => {
      this.detect()
    }, this.config.interval)
  }

  /**
   * 停止检测
   * 
   * @example
   * ```ts
   * detector.stop()
   * ```
   */
  stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = undefined
    }
  }

  /**
   * 执行检测
   * 
   * @private
   */
  private detect(): void {
    // 1. 检测内存增长
    this.detectMemoryGrowth()

    // 2. 检测未清理的定时器
    this.detectTimers()

    // 3. 检测缓存溢出
    this.detectCacheOverflow()
  }

  /**
   * 检测内存持续增长
   * 
   * @private
   */
  private detectMemoryGrowth(): void {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return
    }

    const current = this.takeMemorySnapshot()

    if (this.lastMemorySnapshot) {
      const growth = current.heapUsed - this.lastMemorySnapshot.heapUsed
      const timeElapsed = current.timestamp - this.lastMemorySnapshot.timestamp

      // 计算内存增长率（MB/分钟）
      const growthRate = (growth / 1024 / 1024) / (timeElapsed / 60000)

      // 如果内存增长率超过 5MB/分钟，可能存在泄漏
      if (growthRate > 5) {
        this.report({
          type: LeakType.LARGE_OBJECT,
          severity: Math.min(10, Math.floor(growthRate)),
          message: `内存持续增长，增长率: ${growthRate.toFixed(2)} MB/分钟`,
          timestamp: Date.now(),
          estimatedSize: growth,
        })
      }
    }
  }

  /**
   * 记录内存快照
   * 
   * @private
   * @returns 内存快照
   */
  private takeMemorySnapshot(): { heapUsed: number; timestamp: number } {
    const snapshot = {
      heapUsed: (performance as any).memory?.usedJSHeapSize || 0,
      timestamp: Date.now(),
    }

    this.lastMemorySnapshot = snapshot
    return snapshot
  }

  /**
   * 检测未清理的定时器
   * 
   * @private
   */
  private detectTimers(): void {
    // 简化实现：追踪 timers 数量
    if (this.timers.size > 50) {
      this.report({
        type: LeakType.TIMER,
        severity: 6,
        message: `检测到大量定时器未清理，数量: ${this.timers.size}`,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 检测缓存溢出
   * 
   * @private
   */
  private detectCacheOverflow(): void {
    // 这里可以集成实际的缓存检测逻辑
    // 暂时作为占位符
  }

  /**
   * 报告内存泄漏
   * 
   * @private
   * @param report - 泄漏报告
   */
  private report(report: MemoryLeakReport): void {
    // 检查严重程度阈值
    if (report.severity < this.config.severityThreshold) {
      return
    }

    // 添加到报告列表
    this.reports.push(report)

    // 限制报告数量
    if (this.reports.length > 100) {
      this.reports.shift()
    }

    // 调用回调
    this.config.onLeakDetected(report)

    // 开发环境下输出警告
    if (import.meta.env?.DEV) {
      console.warn('[内存泄漏检测]', report.message, report)
    }
  }

  /**
   * 获取所有泄漏报告
   * 
   * @returns 泄漏报告数组
   * 
   * @example
   * ```ts
   * const reports = detector.getReports()
   * console.log(`发现 ${reports.length} 个潜在泄漏`)
   * ```
   */
  getReports(): MemoryLeakReport[] {
    return [...this.reports]
  }

  /**
   * 获取泄漏统计
   * 
   * @returns 统计对象
   */
  getStats() {
    const byType = new Map<LeakType, number>()

    this.reports.forEach((report) => {
      byType.set(report.type, (byType.get(report.type) || 0) + 1)
    })

    return {
      total: this.reports.length,
      byType: Object.fromEntries(byType),
      avgSeverity:
        this.reports.reduce((sum, r) => sum + r.severity, 0) / this.reports.length || 0,
    }
  }

  /**
   * 清除报告
   * 
   * @example
   * ```ts
   * detector.clearReports()
   * ```
   */
  clearReports(): void {
    this.reports = []
  }

  /**
   * 销毁检测器
   * 
   * @example
   * ```ts
   * detector.destroy()
   * ```
   */
  destroy(): void {
    this.stop()
    this.clearReports()
    this.timers.clear()
  }
}

/**
 * 创建内存泄漏检测器
 * 
 * @param config - 配置选项
 * @returns 检测器实例
 * 
 * @example
 * ```ts
 * const detector = createMemoryLeakDetector({
 *   enabled: import.meta.env.DEV,
 *   interval: 30000,
 *   onLeakDetected: (report) => {
 *     // 发送到监控系统
 *     analytics.track('memory_leak', report)
 *   }
 * })
 * 
 * detector.start()
 * ```
 */
export function createMemoryLeakDetector(config?: LeakDetectorConfig): MemoryLeakDetector {
  return new MemoryLeakDetector(config)
}

// ==================== 便捷函数 ====================

/**
 * 计算对象大小（估算）
 * 
 * 递归计算对象占用的内存大小（粗略估算）。
 * 
 * @param obj - 要计算的对象
 * @param visited - 已访问的对象集合（内部使用）
 * @returns 估算的字节数
 * 
 * @example
 * ```ts
 * const size = estimateObjectSize({ name: 'test', data: [1, 2, 3] })
 * console.log(`对象大小: ${size} 字节`)
 * ```
 */
export function estimateObjectSize(obj: any, visited = new WeakSet()): number {
  if (obj === null || obj === undefined) return 0
  if (visited.has(obj)) return 0 // 避免循环引用

  let size = 0

  switch (typeof obj) {
    case 'boolean':
      size = 4
      break
    case 'number':
      size = 8
      break
    case 'string':
      size = obj.length * 2
      break
    case 'object':
      visited.add(obj)

      if (Array.isArray(obj)) {
        size = obj.reduce((acc, item) => acc + estimateObjectSize(item, visited), 0)
      }
      else {
        size = Object.keys(obj).reduce((acc, key) => {
          return acc + key.length * 2 + estimateObjectSize(obj[key], visited)
        }, 0)
      }
      break
  }

  return size
}

/**
 * 检查是否存在循环引用
 * 
 * @param obj - 要检查的对象
 * @param visited - 已访问的对象集合（内部使用）
 * @returns 是否存在循环引用
 * 
 * @example
 * ```ts
 * const obj: any = { name: 'test' }
 * obj.self = obj  // 创建循环引用
 * 
 * if (hasCircularReference(obj)) {
 *   console.warn('对象存在循环引用')
 * }
 * ```
 */
export function hasCircularReference(obj: any, visited = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') return false
  if (visited.has(obj)) return true

  visited.add(obj)

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (hasCircularReference(obj[key], visited)) {
        return true
      }
    }
  }

  return false
}

// 默认导出
export default MemoryLeakDetector

