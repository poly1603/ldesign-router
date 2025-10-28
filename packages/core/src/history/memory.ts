/**
 * @ldesign/router-core Memory 历史管理器
 * 
 * @module history/memory
 */

import type { HistoryLocation, HistoryState, NavigationType } from '../types'
import { BaseHistory } from './base'

/**
 * Memory History 模式（用于 SSR 或测试）
 */
export class MemoryHistory extends BaseHistory {
  private stack: Array<{ location: HistoryLocation, state: HistoryState }> = []
  private index: number = -1
  private readonly MAX_STACK_SIZE = 100

  constructor(base?: string, initialLocation?: HistoryLocation) {
    super(base)

    const location = initialLocation || {
      fullPath: '/',
      path: '/',
      query: '',
      hash: '',
    }

    this.stack.push({ location, state: {} })
    this.index = 0
    this._location = location
  }

  push(to: HistoryLocation, data?: HistoryState): void {
    const from = this._location

    // 移除当前位置之后的所有历史记录
    this.stack = this.stack.slice(0, this.index + 1)

    // 限制栈大小
    if (this.stack.length >= this.MAX_STACK_SIZE) {
      this.stack.shift()
      this.index--
    }

    // 添加新记录
    this.stack.push({ location: to, state: data || {} })
    this.index++

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('push' as NavigationType))
  }

  replace(to: HistoryLocation, data?: HistoryState): void {
    const from = { ...this._location }

    // 替换当前记录
    this.stack[this.index] = { location: to, state: data || {} }

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('replace' as NavigationType))
  }

  go(delta: number, triggerListeners: boolean = true): void {
    const newIndex = this.index + delta

    if (newIndex < 0 || newIndex >= this.stack.length) {
      return
    }

    const from = { ...this._location }
    const stackEntry = this.stack[newIndex]
    if (!stackEntry) {
      return
    }

    const { location, state } = stackEntry

    this.index = newIndex
    this._location = location
    this._state = state

    if (triggerListeners) {
      this.triggerListeners(
        location,
        from,
        this.createNavigationInfo('pop' as NavigationType, delta),
      )
    }
  }

  protected getCurrentLocation(): HistoryLocation {
    return this._location
  }

  protected getCurrentState(): HistoryState {
    return this._state
  }

  /**
   * 获取历史记录栈大小
   */
  getStackSize(): number {
    return this.stack.length
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.index
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    const initialLocation = {
      fullPath: '/',
      path: '/',
      query: '',
      hash: '',
    }

    this.stack = [{ location: initialLocation, state: {} }]
    this.index = 0
    this._location = initialLocation
    this._state = {}
  }
}

/**
 * 创建 Memory History
 */
export function createMemoryHistory(base?: string, initialLocation?: HistoryLocation): MemoryHistory {
  return new MemoryHistory(base, initialLocation)
}

