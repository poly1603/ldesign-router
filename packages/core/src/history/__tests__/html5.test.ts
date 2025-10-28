/**
 * HTML5History 测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HTML5History, createWebHistory } from '../html5'
import type { HistoryLocation, NavigationCallback } from '../../types'

describe('HTML5History', () => {
  let history: HTML5History
  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState
  const originalLocation = window.location

  beforeEach(() => {
    // Mock window.history methods
    window.history.pushState = vi.fn()
    window.history.replaceState = vi.fn()

    // Mock window.location
    delete (window as any).location
    window.location = {
      ...originalLocation,
      pathname: '/',
      search: '',
      hash: '',
    } as any

    history = new HTML5History('/')
  })

  afterEach(() => {
    history.destroy()
    window.history.pushState = originalPushState
    window.history.replaceState = originalReplaceState
    window.location = originalLocation
  })

  describe('基础功能', () => {
    it('应该正确创建 HTML5History 实例', () => {
      expect(history).toBeInstanceOf(HTML5History)
      expect(history.base).toBe('/')
    })

    it('应该支持自定义 base 路径', () => {
      const customHistory = new HTML5History('/app')
      expect(customHistory.base).toBe('/app')
      customHistory.destroy()
    })

    it('应该正确获取当前位置', () => {
      const location = history.location
      expect(location).toHaveProperty('path')
      expect(location).toHaveProperty('fullPath')
    })

    it('应该正确获取当前状态', () => {
      const state = history.state
      expect(state).toHaveProperty('current')
      expect(state).toHaveProperty('position')
    })
  })

  describe('push', () => {
    it('应该调用 pushState 添加新记录', () => {
      const location: HistoryLocation = {
        path: '/about',
        fullPath: '/about',
      }

      history.push(location)

      expect(window.history.pushState).toHaveBeenCalled()
    })

    it('应该支持带查询参数的路径', () => {
      const location: HistoryLocation = {
        path: '/search',
        fullPath: '/search?q=vue',
        query: 'q=vue',
      }

      history.push(location)

      expect(window.history.pushState).toHaveBeenCalled()
    })

    it('应该支持带哈希的路径', () => {
      const location: HistoryLocation = {
        path: '/docs',
        fullPath: '/docs#intro',
        hash: 'intro',
      }

      history.push(location)

      expect(window.history.pushState).toHaveBeenCalled()
    })

    it('应该支持自定义状态数据', () => {
      const location: HistoryLocation = {
        path: '/page',
        fullPath: '/page',
      }

      const customState = {
        timestamp: Date.now(),
        custom: 'data',
      }

      history.push(location, customState)

      expect(window.history.pushState).toHaveBeenCalled()
    })
  })

  describe('replace', () => {
    it('应该调用 replaceState 替换当前记录', () => {
      const location: HistoryLocation = {
        path: '/new-path',
        fullPath: '/new-path',
      }

      history.replace(location)

      expect(window.history.replaceState).toHaveBeenCalled()
    })

    it('应该支持替换带查询参数的路径', () => {
      const location: HistoryLocation = {
        path: '/search',
        fullPath: '/search?q=react',
        query: 'q=react',
      }

      history.replace(location)

      expect(window.history.replaceState).toHaveBeenCalled()
    })
  })

  describe('go', () => {
    it('应该调用 window.history.go 进行导航', () => {
      const goSpy = vi.spyOn(window.history, 'go')

      history.go(-1)

      expect(goSpy).toHaveBeenCalledWith(-1)
    })

    it('应该支持前进', () => {
      const goSpy = vi.spyOn(window.history, 'go')

      history.go(1)

      expect(goSpy).toHaveBeenCalledWith(1)
    })

    it('应该支持后退', () => {
      const goSpy = vi.spyOn(window.history, 'go')

      history.go(-1)

      expect(goSpy).toHaveBeenCalledWith(-1)
    })
  })

  describe('back', () => {
    it('应该调用 go(-1) 后退', () => {
      const goSpy = vi.spyOn(history, 'go')

      history.back()

      expect(goSpy).toHaveBeenCalledWith(-1)
    })
  })

  describe('forward', () => {
    it('应该调用 go(1) 前进', () => {
      const goSpy = vi.spyOn(history, 'go')

      history.forward()

      expect(goSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('listen', () => {
    it('应该能够添加监听器', () => {
      const callback: NavigationCallback = vi.fn()
      const removeListener = history.listen(callback)

      expect(typeof removeListener).toBe('function')
    })

    it('应该能够移除监听器', () => {
      const callback: NavigationCallback = vi.fn()
      const removeListener = history.listen(callback)

      removeListener()

      // 监听器应该被移除，不会再被调用
    })

    it('应该在导航时触发监听器', (done) => {
      const callback: NavigationCallback = vi.fn((to, from, info) => {
        expect(to).toBeDefined()
        expect(from).toBeDefined()
        expect(info).toBeDefined()
        done()
      })

      history.listen(callback)

      // 模拟 popstate 事件
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
  })

  describe('destroy', () => {
    it('应该能够销毁 history 实例', () => {
      const callback: NavigationCallback = vi.fn()
      history.listen(callback)

      history.destroy()

      // 销毁后监听器不应再被触发
      window.dispatchEvent(new PopStateEvent('popstate'))
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('createWebHistory', () => {
    it('应该创建 HTML5History 实例', () => {
      const webHistory = createWebHistory()
      expect(webHistory).toBeInstanceOf(HTML5History)
      webHistory.destroy()
    })

    it('应该支持自定义 base 路径', () => {
      const webHistory = createWebHistory('/app')
      expect(webHistory.base).toBe('/app')
      webHistory.destroy()
    })
  })

  describe('边界情况', () => {
    it('应该处理空路径', () => {
      const location: HistoryLocation = {
        path: '',
        fullPath: '',
      }

      expect(() => history.push(location)).not.toThrow()
    })

    it('应该处理极长的路径', () => {
      const longPath = '/path/' + 'segment/'.repeat(100)
      const location: HistoryLocation = {
        path: longPath,
        fullPath: longPath,
      }

      expect(() => history.push(location)).not.toThrow()
    })

    it('应该处理特殊字符路径', () => {
      const specialPath = '/path/with-special-chars-!@#$%^&*()'
      const location: HistoryLocation = {
        path: specialPath,
        fullPath: specialPath,
      }

      expect(() => history.push(location)).not.toThrow()
    })

    it('应该处理中文路径', () => {
      const chinesePath = '/文档/介绍'
      const location: HistoryLocation = {
        path: chinesePath,
        fullPath: chinesePath,
      }

      expect(() => history.push(location)).not.toThrow()
    })
  })

  describe('性能测试', () => {
    it('应该快速添加大量历史记录', () => {
      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        const location: HistoryLocation = {
          path: `/page/${i}`,
          fullPath: `/page/${i}`,
        }
        history.push(location)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // 应该在 1 秒内完成
    })

    it('应该快速处理大量监听器', () => {
      const listeners: Array<() => void> = []

      const start = Date.now()

      for (let i = 0; i < 100; i++) {
        const callback: NavigationCallback = vi.fn()
        const removeListener = history.listen(callback)
        listeners.push(removeListener)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // 应该在 100ms 内完成

      // 清理监听器
      listeners.forEach(remove => remove())
    })
  })
})

