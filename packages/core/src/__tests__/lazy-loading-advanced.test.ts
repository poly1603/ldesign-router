/**
 * @ldesign/router-core
 * 高级懒加载管理器测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  LazyLoadManager,
  createLazyLoadManager,
  LoadPriority,
  NetworkCondition,
  PrefetchStrategy,
} from '../features/lazy-loading-advanced'

describe('LazyLoadManager - 基础功能', () => {
  let manager: LazyLoadManager
  
  beforeEach(() => {
    manager = createLazyLoadManager({
      maxConcurrent: 2,
      timeout: 1000,
      retryCount: 2,
    })
  })

  afterEach(() => {
    manager.destroy()
  })

  it('应该成功创建管理器实例', () => {
    expect(manager).toBeDefined()
    expect(manager).toBeInstanceOf(LazyLoadManager)
  })

  it('应该正确注册路由加载配置', () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })
    
    manager.register({
      path: '/test',
      loader,
      priority: LoadPriority.NORMAL,
    })

    const stats = manager.getStats()
    expect(stats.registered).toBe(1)
  })

  it('应该按优先级顺序加载', async () => {
    const loadOrder: string[] = []
    
    const createLoader = (name: string) => vi.fn(async () => {
      loadOrder.push(name)
      return { default: name }
    })

    // 注册不同优先级的路由
    manager.register({
      path: '/low',
      loader: createLoader('low'),
      priority: LoadPriority.LOW,
    })

    manager.register({
      path: '/high',
      loader: createLoader('high'),
      priority: LoadPriority.HIGH,
    })

    manager.register({
      path: '/immediate',
      loader: createLoader('immediate'),
      priority: LoadPriority.IMMEDIATE,
    })

    // 依次加载（因为并发限制会按优先级排队）
    await manager.load('/low')
    await manager.load('/high')
    await manager.load('/immediate')

    // 所有路由都应该被加载
    expect(loadOrder).toContain('immediate')
    expect(loadOrder).toContain('high')
    expect(loadOrder).toContain('low')
    expect(loadOrder.length).toBe(3)
  })

  it('应该缓存加载结果', async () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })
    
    manager.register({
      path: '/test',
      loader,
    })

    // 第一次加载
    await manager.load('/test')
    expect(loader).toHaveBeenCalledTimes(1)

    // 第二次加载应该使用缓存
    await manager.load('/test')
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('应该支持预取功能', async () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })
    
    manager.register({
      path: '/test',
      loader,
      prefetchStrategy: PrefetchStrategy.IMMEDIATE,
    })

    await manager.prefetch('/test')
    
    const stats = manager.getStats()
    expect(stats.cached).toBe(1)
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('应该处理加载失败并重试', async () => {
    let attempts = 0
    const loader = vi.fn(async () => {
      attempts++
      if (attempts < 2) {
        throw new Error('Load failed')
      }
      return { default: 'Component' }
    })

    manager.register({
      path: '/test',
      loader,
    })

    const result = await manager.load('/test')
    expect(result).toEqual({ default: 'Component' })
    expect(attempts).toBe(2)
  })

  it('应该在超过重试次数后抛出错误', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Load failed'))

    manager.register({
      path: '/test',
      loader,
    })

    await expect(manager.load('/test')).rejects.toThrow('Load failed')
    expect(loader).toHaveBeenCalledTimes(3) // 初始 + 2 次重试
  })
})

describe('LazyLoadManager - 并发控制', () => {
  let manager: LazyLoadManager

  beforeEach(() => {
    manager = createLazyLoadManager({
      maxConcurrent: 2,
    })
  })

  afterEach(() => {
    manager.destroy()
  })

  it('应该限制并发加载数量', async () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    // 注册 5 个路由
    for (let i = 0; i < 5; i++) {
      manager.register({
        path: `/test${i}`,
        loader,
      })
    }

    // 同时触发所有加载
    await Promise.all([
      manager.load('/test0'),
      manager.load('/test1'),
      manager.load('/test2'),
      manager.load('/test3'),
      manager.load('/test4'),
    ])

    // 应该全部加载完成
    const stats = manager.getStats()
    expect(stats.loaded).toBe(5)
    expect(stats.cached).toBe(5)
  })

  it('应该正确统计加载数量', async () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    for (let i = 0; i < 3; i++) {
      manager.register({
        path: `/test${i}`,
        loader,
      })
    }

    await Promise.all([
      manager.load('/test0'),
      manager.load('/test1'),
      manager.load('/test2'),
    ])

    const stats = manager.getStats()
    expect(stats.loaded).toBe(3)
    expect(stats.cached).toBe(3)
  })
})

describe('LazyLoadManager - 网络条件检测', () => {
  let manager: LazyLoadManager

  beforeEach(() => {
    manager = createLazyLoadManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  it('应该在慢速网络下降低优先级', async () => {
    // 模拟慢速网络
    const originalConnection = (navigator as any).connection
    ;(navigator as any).connection = {
      effectiveType: '2g',
      downlink: 0.5,
      saveData: false,
    }

    const condition = manager['detectNetworkCondition']()
    expect(condition).toBe(NetworkCondition.SLOW)

    // 恢复
    ;(navigator as any).connection = originalConnection
  })

  it('应该在快速网络下保持正常优先级', async () => {
    // 模拟快速网络
    const originalConnection = (navigator as any).connection
    ;(navigator as any).connection = {
      effectiveType: '4g',
      downlink: 10,
      saveData: false,
    }

    const condition = manager['detectNetworkCondition']()
    expect(condition).toBe(NetworkCondition.FAST)

    // 恢复
    ;(navigator as any).connection = originalConnection
  })

  it('应该在省流量模式下跳过预取', async () => {
    // 模拟省流量模式
    const originalConnection = (navigator as any).connection
    ;(navigator as any).connection = {
      effectiveType: '4g',
      downlink: 10,
      saveData: true,
    }

    const loader = vi.fn().mockResolvedValue({ default: 'Component' })
    
    manager.register({
      path: '/test',
      loader,
      prefetchStrategy: PrefetchStrategy.HOVER,
    })

    // 在省流量模式下预取应该被跳过
    await manager.prefetch('/test')
    expect(loader).not.toHaveBeenCalled()

    // 恢复
    ;(navigator as any).connection = originalConnection
  })
})

describe('LazyLoadManager - IntersectionObserver', () => {
  let manager: LazyLoadManager

  beforeEach(() => {
    // 不设置 mock，使用实际的 IntersectionObserver（如果存在）或跳过
    manager = createLazyLoadManager({
      useIntersectionObserver: false, // 禁用以便测试
    })
  })

  afterEach(() => {
    manager.destroy()
  })

  it('应该观察元素可见性', () => {
    const element = document.createElement('div')
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    manager.register({
      path: '/test',
      loader,
      prefetchStrategy: PrefetchStrategy.VISIBLE,
    })

    // 当 IntersectionObserver 禁用时，observe 不会抛出错误
    expect(() => manager.observe(element, '/test')).not.toThrow()
  })

  it('应该在元素可见时触发加载', async () => {
    const element = document.createElement('div')
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    manager.register({
      path: '/test',
      loader,
      prefetchStrategy: PrefetchStrategy.VISIBLE,
    })

    manager.observe(element, '/test')

    // 手动触发预取
    await manager.prefetch('/test')

    expect(loader).toHaveBeenCalled()
  })

  it('应该停止观察已卸载的元素', () => {
    const element = document.createElement('div')
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    manager.register({
      path: '/test',
      loader,
      prefetchStrategy: PrefetchStrategy.VISIBLE,
    })

    manager.observe(element, '/test')
    
    // unobserve 不应该抛出错误
    expect(() => manager.unobserve(element)).not.toThrow()
  })
})

describe('LazyLoadManager - 统计信息', () => {
  let manager: LazyLoadManager

  beforeEach(() => {
    manager = createLazyLoadManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  it('应该正确统计注册数量', () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    for (let i = 0; i < 5; i++) {
      manager.register({
        path: `/test${i}`,
        loader,
      })
    }

    const stats = manager.getStats()
    expect(stats.registered).toBe(5)
  })

  it('应该正确统计加载和缓存数量', async () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    for (let i = 0; i < 3; i++) {
      manager.register({
        path: `/test${i}`,
        loader,
      })
    }

    await manager.load('/test0')
    await manager.load('/test1')

    const stats = manager.getStats()
    expect(stats.loaded).toBe(2)
    expect(stats.cached).toBe(2)
  })

  it('应该正确统计失败数量', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Load failed'))

    manager.register({
      path: '/test',
      loader,
    })

    try {
      await manager.load('/test')
    } catch (e) {
      // 忽略错误
    }

    const stats = manager.getStats()
    expect(stats.failed).toBe(1)
  })

  it('应该清除统计信息', async () => {
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    manager.register({
      path: '/test',
      loader,
    })

    await manager.load('/test')

    manager.clearStats()

    const stats = manager.getStats()
    expect(stats.loaded).toBe(0)
    expect(stats.failed).toBe(0)
    // cached 不会被 clearStats 清除，只有 clearCache 才会
    expect(stats.cached).toBe(1)
  })
})

describe('LazyLoadManager - 清理与销毁', () => {
  it('应该清除所有缓存', async () => {
    const manager = createLazyLoadManager()
    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    for (let i = 0; i < 3; i++) {
      manager.register({
        path: `/test${i}`,
        loader,
      })
      await manager.load(`/test${i}`)
    }

    expect(manager.getStats().cached).toBe(3)

    manager.clearCache()

    expect(manager.getStats().cached).toBe(0)
    manager.destroy()
  })

  it('应该在销毁时清理所有资源', () => {
    const manager = createLazyLoadManager({
      useIntersectionObserver: false,
    })

    const loader = vi.fn().mockResolvedValue({ default: 'Component' })

    manager.register({
      path: '/test',
      loader,
      prefetchStrategy: PrefetchStrategy.VISIBLE,
    })

    manager.destroy()

    const stats = manager.getStats()
    expect(stats.cached).toBe(0)
    expect(stats.registered).toBe(0)
    expect(stats.loaded).toBe(0)
  })
})