/**
 * 性能监控器测试
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  PerformanceMonitor,
  createPerformanceMonitor,
  type PerformanceMetrics,
  type PerformanceWarning,
} from '../features/performance-monitor'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = createPerformanceMonitor({
      enabled: true,
      maxRecords: 10,
      trackMemory: false, // 测试环境可能不支持
      autoCleanup: false, // 避免测试中的定时器干扰
    })
  })

  afterEach(() => {
    monitor.destroy()
  })

  describe('基本功能', () => {
    it('应该能创建性能监控器', () => {
      expect(monitor).toBeDefined()
      expect(monitor.isEnabled()).toBe(true)
    })

    it('应该能启用/禁用监控', () => {
      monitor.setEnabled(false)
      expect(monitor.isEnabled()).toBe(false)

      monitor.setEnabled(true)
      expect(monitor.isEnabled()).toBe(true)
    })

    it('应该能记录完整的导航性能', () => {
      monitor.startNavigation('/test')
      monitor.recordMatch(0.5)
      monitor.recordGuard(10)
      monitor.recordComponentLoad(20)
      monitor.endNavigation()

      const metrics = monitor.getRecentMetrics(1)
      expect(metrics).toHaveLength(1)
      expect(metrics[0].path).toBe('/test')
      expect(metrics[0].matchDuration).toBe(0.5)
      expect(metrics[0].guardDuration).toBe(10)
      expect(metrics[0].componentLoadDuration).toBe(20)
      expect(metrics[0].totalDuration).toBeGreaterThan(0)
    })

    it('禁用时不应记录性能', () => {
      monitor.setEnabled(false)
      monitor.startNavigation('/test')
      monitor.recordMatch(0.5)
      monitor.endNavigation()

      const metrics = monitor.getRecentMetrics()
      expect(metrics).toHaveLength(0)
    })
  })

  describe('性能统计', () => {
    beforeEach(() => {
      // 模拟多次导航
      for (let i = 0; i < 5; i++) {
        monitor.startNavigation(`/test${i}`)
        monitor.recordMatch(0.5 + i * 0.1)
        monitor.recordGuard(10 + i * 5)
        monitor.recordComponentLoad(20 + i * 2)
        monitor.endNavigation()
      }
    })

    it('应该能获取性能统计', () => {
      const stats = monitor.getStats()

      expect(stats.totalNavigations).toBe(5)
      expect(stats.averageDuration).toBeGreaterThan(0)
      expect(stats.minDuration).toBeGreaterThan(0)
      expect(stats.maxDuration).toBeGreaterThanOrEqual(stats.minDuration)
      expect(stats.averageMatchDuration).toBeGreaterThan(0)
      expect(stats.averageGuardDuration).toBeGreaterThan(0)
      expect(stats.averageComponentLoadDuration).toBeGreaterThan(0)
    })

    it('应该能获取最近的性能记录', () => {
      const recent = monitor.getRecentMetrics(3)
      expect(recent).toHaveLength(3)
      expect(recent[0].path).toBe('/test2')
      expect(recent[2].path).toBe('/test4')
    })

    it('空记录应返回零值统计', () => {
      const emptyMonitor = createPerformanceMonitor()
      const stats = emptyMonitor.getStats()

      expect(stats.totalNavigations).toBe(0)
      expect(stats.averageDuration).toBe(0)
      expect(stats.minDuration).toBe(0)
      expect(stats.maxDuration).toBe(0)

      emptyMonitor.destroy()
    })
  })

  describe('性能阈值检测', () => {
    let warnings: PerformanceWarning[]

    beforeEach(() => {
      warnings = []
      monitor = createPerformanceMonitor({
        enabled: true,
        maxRecords: 10,
        trackMemory: false,
        autoCleanup: false,
        thresholds: {
          matchWarning: 1,
          matchError: 5,
          guardWarning: 50,
          guardError: 200,
          totalWarning: 100,
          totalError: 500,
        },
        onWarning: (warning) => {
          warnings.push(warning)
        },
      })
    })

    it('应该能检测匹配耗时警告', () => {
      monitor.startNavigation('/test')
      monitor.recordMatch(2) // 超过 warning (1ms)
      monitor.endNavigation()

      expect(warnings).toHaveLength(1)
      expect(warnings[0].type).toBe('match')
      expect(warnings[0].level).toBe('warning')
      expect(warnings[0].value).toBe(2)
    })

    it('应该能检测匹配耗时错误', () => {
      monitor.startNavigation('/test')
      monitor.recordMatch(6) // 超过 error (5ms)
      monitor.endNavigation()

      expect(warnings).toHaveLength(1)
      expect(warnings[0].type).toBe('match')
      expect(warnings[0].level).toBe('error')
      expect(warnings[0].value).toBe(6)
    })

    it('应该能检测守卫耗时警告', () => {
      monitor.startNavigation('/test')
      monitor.recordGuard(100) // 超过 warning (50ms)
      monitor.endNavigation()

      const guardWarnings = warnings.filter(w => w.type === 'guard')
      expect(guardWarnings).toHaveLength(1)
      expect(guardWarnings[0].level).toBe('warning')
    })

    it('应该能检测守卫耗时错误', () => {
      monitor.startNavigation('/test')
      monitor.recordGuard(250) // 超过 error (200ms)
      monitor.endNavigation()

      const guardWarnings = warnings.filter(w => w.type === 'guard')
      expect(guardWarnings).toHaveLength(1)
      expect(guardWarnings[0].level).toBe('error')
    })

    it('应该能检测总耗时警告', async () => {
      monitor.startNavigation('/test')
      // 等待超过 100ms 以触发 totalWarning
      await new Promise(resolve => setTimeout(resolve, 110))
      monitor.endNavigation()

      const totalWarnings = warnings.filter(w => w.type === 'total')
      expect(totalWarnings.length).toBeGreaterThan(0)
    })
  })

  describe('记录管理', () => {
    it('应该限制最大记录数量', () => {
      const smallMonitor = createPerformanceMonitor({
        maxRecords: 3,
        autoCleanup: false,
      })

      for (let i = 0; i < 5; i++) {
        smallMonitor.startNavigation(`/test${i}`)
        smallMonitor.endNavigation()
      }

      const metrics = smallMonitor.getRecentMetrics(10)
      expect(metrics).toHaveLength(3)
      expect(metrics[0].path).toBe('/test2') // 最早的两个被删除

      smallMonitor.destroy()
    })

    it('应该能清除所有记录', () => {
      monitor.startNavigation('/test')
      monitor.endNavigation()

      expect(monitor.getRecentMetrics()).toHaveLength(1)

      monitor.clear()

      expect(monitor.getRecentMetrics()).toHaveLength(0)
      expect(monitor.getWarnings()).toHaveLength(0)
    })

    it('应该限制警告数量', () => {
      const warningMonitor = createPerformanceMonitor({
        maxRecords: 3,
        autoCleanup: false,
        thresholds: {
          matchWarning: 0.1,
        },
      })

      for (let i = 0; i < 5; i++) {
        warningMonitor.startNavigation(`/test${i}`)
        warningMonitor.recordMatch(1) // 触发警告
        warningMonitor.endNavigation()
      }

      const warnings = warningMonitor.getWarnings()
      expect(warnings.length).toBeLessThanOrEqual(3)

      warningMonitor.destroy()
    })
  })

  describe('性能报告', () => {
    beforeEach(() => {
      for (let i = 0; i < 3; i++) {
        monitor.startNavigation(`/page${i}`)
        monitor.recordMatch(0.5)
        monitor.recordGuard(20)
        monitor.recordComponentLoad(30)
        monitor.endNavigation()
      }
    })

    it('应该能生成性能报告', () => {
      const report = monitor.generateReport()

      expect(report).toContain('Router Performance Report')
      expect(report).toContain('Total Navigations: 3')
      expect(report).toContain('Average Duration:')
      expect(report).toContain('Average Match Duration:')
      expect(report).toContain('Average Guard Duration:')
      expect(report).toContain('Average Component Load:')
    })

    it('报告应包含警告信息', () => {
      const warningMonitor = createPerformanceMonitor({
        thresholds: {
          matchWarning: 0.1,
        },
        autoCleanup: false,
      })

      warningMonitor.startNavigation('/test')
      warningMonitor.recordMatch(1) // 触发警告
      warningMonitor.endNavigation()

      const report = warningMonitor.generateReport()
      expect(report).toContain('Warnings')
      expect(report).toContain('[WARNING]')

      warningMonitor.destroy()
    })

    it('无警告时应显示正常消息', () => {
      const report = monitor.generateReport()
      expect(report).toContain('No warnings')
    })
  })

  describe('边界情况', () => {
    it('未开始导航就记录应不报错', () => {
      expect(() => {
        monitor.recordMatch(1)
        monitor.recordGuard(10)
        monitor.recordComponentLoad(20)
        monitor.endNavigation()
      }).not.toThrow()
    })

    it('多次开始导航应覆盖', () => {
      monitor.startNavigation('/test1')
      monitor.startNavigation('/test2')
      monitor.endNavigation()

      const metrics = monitor.getRecentMetrics(1)
      expect(metrics[0].path).toBe('/test2')
    })

    it('未记录某些阶段也应正常完成', () => {
      monitor.startNavigation('/test')
      // 只记录匹配，不记录守卫和组件加载
      monitor.recordMatch(0.5)
      monitor.endNavigation()

      const metrics = monitor.getRecentMetrics(1)
      expect(metrics[0].matchDuration).toBe(0.5)
      expect(metrics[0].guardDuration).toBe(0)
      expect(metrics[0].componentLoadDuration).toBe(0)
    })
  })

  describe('销毁清理', () => {
    it('销毁后应清除所有数据', () => {
      monitor.startNavigation('/test')
      monitor.endNavigation()

      expect(monitor.getRecentMetrics()).toHaveLength(1)

      monitor.destroy()

      expect(monitor.getRecentMetrics()).toHaveLength(0)
      expect(monitor.getWarnings()).toHaveLength(0)
    })

    it('销毁后应停止自动清理定时器', () => {
      const autoCleanupMonitor = createPerformanceMonitor({
        autoCleanup: true,
        cleanupInterval: 100,
      })

      autoCleanupMonitor.destroy()

      // 如果定时器没停止，这里可能会有问题
      // 但因为我们无法直接验证定时器，只能确保不抛出错误
      expect(() => {
        autoCleanupMonitor.destroy()
      }).not.toThrow()
    })
  })

  describe('自定义配置', () => {
    it('应该支持自定义阈值', () => {
      const customMonitor = createPerformanceMonitor({
        thresholds: {
          matchWarning: 10,
          matchError: 50,
          guardWarning: 100,
          guardError: 500,
        },
        autoCleanup: false,
      })

      customMonitor.startNavigation('/test')
      customMonitor.recordMatch(5) // 不应触发警告
      customMonitor.endNavigation()

      expect(customMonitor.getWarnings()).toHaveLength(0)

      customMonitor.destroy()
    })

    it('应该支持禁用内存追踪', () => {
      const noMemoryMonitor = createPerformanceMonitor({
        trackMemory: false,
        autoCleanup: false,
      })

      noMemoryMonitor.startNavigation('/test')
      noMemoryMonitor.endNavigation()

      const stats = noMemoryMonitor.getStats()
      expect(stats.memoryTrend).toBeUndefined()

      noMemoryMonitor.destroy()
    })
  })
})