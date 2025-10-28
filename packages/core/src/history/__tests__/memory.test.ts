/**
 * MemoryHistory 测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryHistory, createMemoryHistory } from '../memory'
import type { HistoryLocation, NavigationCallback } from '../../types'

describe('MemoryHistory', () => {
  let history: MemoryHistory

  beforeEach(() => {
    history = new MemoryHistory('/')
  })

  afterEach(() => {
    history.destroy()
  })

  describe('基础功能', () => {
    it('应该正确创建 MemoryHistory 实例', () => {
      expect(history).toBeInstanceOf(MemoryHistory)
      expect(history.base).toBe('/')
    })

    it('应该支持自定义 base 路径', () => {
      const customHistory = new MemoryHistory('/app')
      expect(customHistory.base).toBe('/app')
      customHistory.destroy()
    })

    it('应该正确获取当前位置', () => {
      const location = history.location
      expect(location).toHaveProperty('path')
      expect(location).toHaveProperty('fullPath')
    })
  })

  describe('push', () => {
    it('应该添加新记录', () => {
      const location: HistoryLocation = {
        path: '/about',
        fullPath: '/about',
      }

      history.push(location)

      expect(history.location.path).toBe('/about')
    })

    it('应该支持多次 push', () => {
      history.push({ path: '/page1', fullPath: '/page1' })
      history.push({ path: '/page2', fullPath: '/page2' })
      history.push({ path: '/page3', fullPath: '/page3' })

      expect(history.location.path).toBe('/page3')
    })
  })

  describe('replace', () => {
    it('应该替换当前记录', () => {
      history.push({ path: '/old', fullPath: '/old' })
      history.replace({ path: '/new', fullPath: '/new' })

      expect(history.location.path).toBe('/new')
    })
  })

  describe('go', () => {
    it('应该能够后退', () => {
      history.push({ path: '/page1', fullPath: '/page1' })
      history.push({ path: '/page2', fullPath: '/page2' })

      history.go(-1)

      expect(history.location.path).toBe('/page1')
    })

    it('应该能够前进', () => {
      history.push({ path: '/page1', fullPath: '/page1' })
      history.push({ path: '/page2', fullPath: '/page2' })
      history.go(-1)
      history.go(1)

      expect(history.location.path).toBe('/page2')
    })

    it('应该处理超出范围的导航', () => {
      history.push({ path: '/page1', fullPath: '/page1' })

      // 尝试后退超出范围
      history.go(-10)

      // 应该停留在第一个位置
      expect(history.location.path).toBe('/')
    })
  })

  describe('listen', () => {
    it('应该能够添加监听器', () => {
      const callback: NavigationCallback = vi.fn()
      const removeListener = history.listen(callback)

      expect(typeof removeListener).toBe('function')
    })

    it('应该在导航时触发监听器', () => {
      const callback: NavigationCallback = vi.fn()
      history.listen(callback)

      history.push({ path: '/about', fullPath: '/about' })

      expect(callback).toHaveBeenCalled()
    })

    it('应该能够移除监听器', () => {
      const callback: NavigationCallback = vi.fn()
      const removeListener = history.listen(callback)

      removeListener()
      history.push({ path: '/about', fullPath: '/about' })

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('createMemoryHistory', () => {
    it('应该创建 MemoryHistory 实例', () => {
      const memHistory = createMemoryHistory()
      expect(memHistory).toBeInstanceOf(MemoryHistory)
      memHistory.destroy()
    })

    it('应该支持自定义 base 路径', () => {
      const memHistory = createMemoryHistory('/app')
      expect(memHistory.base).toBe('/app')
      memHistory.destroy()
    })

    it('应该支持初始位置', () => {
      const memHistory = createMemoryHistory('/', '/initial')
      expect(memHistory.location.path).toBe('/initial')
      memHistory.destroy()
    })
  })

  describe('性能测试', () => {
    it('应该快速处理大量导航', () => {
      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        history.push({ path: `/page/${i}`, fullPath: `/page/${i}` })
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(500) // 应该在 500ms 内完成
    })

    it('应该能够快速后退前进', () => {
      // 添加多个记录
      for (let i = 0; i < 100; i++) {
        history.push({ path: `/page/${i}`, fullPath: `/page/${i}` })
      }

      const start = Date.now()

      // 后退 50 步
      history.go(-50)

      // 前进 25 步
      history.go(25)

      const duration = Date.now() - start
      expect(duration).toBeLessThan(50) // 应该在 50ms 内完成
    })
  })
})

