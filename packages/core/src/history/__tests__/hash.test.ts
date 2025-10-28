/**
 * HashHistory 测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HashHistory, createWebHashHistory } from '../hash'
import type { HistoryLocation, NavigationCallback } from '../../types'

describe('HashHistory', () => {
  let history: HashHistory
  const originalLocation = window.location

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location
    window.location = {
      ...originalLocation,
      pathname: '/',
      search: '',
      hash: '',
    } as any

    history = new HashHistory('/')
  })

  afterEach(() => {
    history.destroy()
    window.location = originalLocation
  })

  describe('基础功能', () => {
    it('应该正确创建 HashHistory 实例', () => {
      expect(history).toBeInstanceOf(HashHistory)
      expect(history.base).toBe('/')
    })

    it('应该支持自定义 base 路径', () => {
      const customHistory = new HashHistory('/app')
      expect(customHistory.base).toBe('/app')
      customHistory.destroy()
    })
  })

  describe('createWebHashHistory', () => {
    it('应该创建 HashHistory 实例', () => {
      const hashHistory = createWebHashHistory()
      expect(hashHistory).toBeInstanceOf(HashHistory)
      hashHistory.destroy()
    })

    it('应该支持自定义 base 路径', () => {
      const hashHistory = createWebHashHistory('/app')
      expect(hashHistory.base).toBe('/app')
      hashHistory.destroy()
    })
  })
})

