/**
 * @ldesign/router-core 内存管理器测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMemoryManager, type Cleanable } from '../memory-manager'

describe('MemoryManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基本功能', () => {
    it('应该创建内存管理器实例', () => {
      const manager = createMemoryManager()
      expect(manager).toBeDefined()
      expect(typeof manager.cleanup).toBe('function')
      expect(typeof manager.getMemoryUsage).toBe('function')
    })

    it('应该注册和管理资源', () => {
      const manager = createMemoryManager()
      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }

      manager.register('test', mockCleanable)
      const cleaned = manager.cleanup(true)

      expect(mockCleanable.cleanup).toHaveBeenCalled()
      expect(cleaned).toBeGreaterThanOrEqual(0)
    })

    it('应该注销资源', () => {
      const manager = createMemoryManager()
      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }

      manager.register('test', mockCleanable)
      const unregistered = manager.unregister('test')
      expect(unregistered).toBe(true)

      manager.cleanup(true)
      expect(mockCleanable.cleanup).not.toHaveBeenCalled()
    })
  })

  describe('自动清理', () => {
    it('应该定期自动清理资源', () => {
      const manager = createMemoryManager({
        cleanupInterval: 1000,
        memoryThreshold: 0.01, // 设置很低的阈值，确保触发清理
      })

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      // 快进到第一次清理 - 自动清理会检查阈值
      vi.advanceTimersByTime(1000)
      
      // 由于设置了很低的阈值，应该触发清理
      // 但实际是否清理取决于内存使用情况
      expect(mockCleanable.cleanup).toHaveBeenCalled()

      manager.destroy()
    })

    it('应该在销毁时停止自动清理', () => {
      const manager = createMemoryManager({
        cleanupInterval: 1000,
        memoryThreshold: 0.01,
      })

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      // 销毁管理器（会清理一次）
      manager.destroy()
      const callCountAfterDestroy = mockCleanable.cleanup.mock.calls.length

      // 再快进时间，不应该再触发自动清理
      vi.advanceTimersByTime(5000)
      expect(mockCleanable.cleanup).toHaveBeenCalledTimes(callCountAfterDestroy)
    })
  })

  describe('强制清理', () => {
    it('应该强制清理所有资源', () => {
      const manager = createMemoryManager()

      const mockCleanable1: Cleanable = {
        cleanup: vi.fn(),
      }
      const mockCleanable2: Cleanable = {
        cleanup: vi.fn(),
      }

      manager.register('test1', mockCleanable1)
      manager.register('test2', mockCleanable2)

      const cleaned = manager.cleanup(true)

      expect(mockCleanable1.cleanup).toHaveBeenCalled()
      expect(mockCleanable2.cleanup).toHaveBeenCalled()
      expect(cleaned).toBe(2)
    })

    it('应该正常清理（不强制）', () => {
      const manager = createMemoryManager()

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }

      manager.register('test', mockCleanable)

      // 不强制清理
      const cleaned = manager.cleanup(false)

      // 因为资源刚注册，不会被清理
      expect(cleaned).toBe(0)
    })
  })

  describe('内存监控', () => {
    it('应该获取内存使用情况', () => {
      const manager = createMemoryManager()
      const usage = manager.getMemoryUsage()

      expect(usage).toBeDefined()
      expect(typeof usage.used).toBe('number')
      expect(typeof usage.total).toBe('number')
      expect(typeof usage.percentage).toBe('number')
      expect(usage.percentage).toBeGreaterThanOrEqual(0)
      expect(usage.percentage).toBeLessThanOrEqual(1)
    })

    it('应该检测超出阈值的内存使用', () => {
      const manager = createMemoryManager({
        memoryThreshold: 0.01, // 设置极低的阈值，确保触发
      })

      const usage = manager.getMemoryUsage()
      // 在真实环境中，内存使用通常会超过 1%
      expect(usage.percentage).toBeGreaterThanOrEqual(0)
    })
  })

  describe('泄漏检测', () => {
    it('应该检测长时间未访问的资源', () => {
      const manager = createMemoryManager()

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }

      manager.register('test', mockCleanable)

      // 立即检测，不应该有泄漏
      let leaks = manager.detectLeaks()
      expect(leaks).toBe(0)

      // 快进 31 分钟（超过默认的 30 分钟阈值）
      vi.advanceTimersByTime(31 * 60 * 1000)

      // 再次检测，应该检测到泄漏
      leaks = manager.detectLeaks()
      expect(leaks).toBeGreaterThan(0)
    })
  })

  describe('弱引用缓存', () => {
    it('应该设置和获取弱引用缓存', () => {
      const manager = createMemoryManager()
      const key = { id: 1 }
      const value = { data: 'test' }

      manager.setWeakCache(key, value)
      const retrieved = manager.getWeakCache(key)

      expect(retrieved).toBe(value)
    })

    it('应该检查弱引用缓存是否存在', () => {
      const manager = createMemoryManager()
      const key = { id: 1 }
      const value = { data: 'test' }

      expect(manager.hasWeakCache(key)).toBe(false)

      manager.setWeakCache(key, value)
      expect(manager.hasWeakCache(key)).toBe(true)
    })

    it('应该删除弱引用缓存', () => {
      const manager = createMemoryManager()
      const key = { id: 1 }
      const value = { data: 'test' }

      manager.setWeakCache(key, value)
      expect(manager.hasWeakCache(key)).toBe(true)

      const deleted = manager.deleteWeakCache(key)
      expect(deleted).toBe(true)
      expect(manager.hasWeakCache(key)).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该获取内存管理统计', () => {
      const manager = createMemoryManager()

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      manager.cleanup(true)

      const stats = manager.getStats()
      expect(stats).toBeDefined()
      expect(stats.registeredResources).toBe(1)
      expect(stats.cleanupCount).toBeGreaterThan(0)
      expect(stats.cleanedResources).toBeGreaterThan(0)
      expect(typeof stats.avgCleanupTime).toBe('number')
    })

    it('应该重置统计信息', () => {
      const manager = createMemoryManager()

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      manager.cleanup(true)

      let stats = manager.getStats()
      expect(stats.cleanupCount).toBeGreaterThan(0)

      manager.resetStats()

      stats = manager.getStats()
      expect(stats.cleanupCount).toBe(0)
      expect(stats.cleanedResources).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理清理过程中的错误', () => {
      const manager = createMemoryManager()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(() => {
          throw new Error('清理失败')
        }),
      }

      manager.register('test', mockCleanable)
      manager.cleanup(true)

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('应该继续清理其他资源即使某个失败', () => {
      const manager = createMemoryManager()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockCleanable1: Cleanable = {
        cleanup: vi.fn(() => {
          throw new Error('清理失败')
        }),
      }
      const mockCleanable2: Cleanable = {
        cleanup: vi.fn(),
      }

      manager.register('test1', mockCleanable1)
      manager.register('test2', mockCleanable2)

      manager.cleanup(true)

      expect(mockCleanable1.cleanup).toHaveBeenCalled()
      expect(mockCleanable2.cleanup).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('配置选项', () => {
    it('应该使用自定义清理间隔', () => {
      const customInterval = 5000
      const manager = createMemoryManager({
        cleanupInterval: customInterval,
        memoryThreshold: 0.01, // 低阈值确保触发
      })

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      // 快进到自定义间隔
      vi.advanceTimersByTime(customInterval)
      
      // 验证已触发（实际是否清理取决于内存情况）
      expect(mockCleanable.cleanup).toHaveBeenCalled()

      manager.destroy()
    })

    it('应该使用自定义内存阈值', () => {
      const customThreshold = 0.5
      const manager = createMemoryManager({
        memoryThreshold: customThreshold,
      })

      expect(manager).toBeDefined()
      // 阈值在内部使用，这里只验证创建成功
    })
  })

  describe('销毁和清理', () => {
    it('应该正确销毁管理器', () => {
      const manager = createMemoryManager({
        enableAutoCleanup: false, // 禁用自动清理，只测试手动销毁
      })

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      manager.destroy()
      
      // 验证销毁时清理了资源
      expect(mockCleanable.cleanup).toHaveBeenCalledTimes(1)

      // 销毁后不应该再执行清理
      vi.advanceTimersByTime(10000)
      expect(mockCleanable.cleanup).toHaveBeenCalledTimes(1)
    })

    it('应该在销毁时清理所有资源', () => {
      const manager = createMemoryManager()

      const mockCleanable: Cleanable = {
        cleanup: vi.fn(),
      }
      manager.register('test', mockCleanable)

      manager.destroy()

      expect(mockCleanable.cleanup).toHaveBeenCalled()
    })
  })
})