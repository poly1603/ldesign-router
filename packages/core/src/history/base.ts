/**
 * @ldesign/router-core 基础历史管理器
 * 
 * @module history/base
 */

import type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationInformation,
  NavigationType,
  RouterHistory,
} from '../types'

/**
 * 基础历史管理器抽象类
 * 
 * @description
 * 提供历史管理的基础实现，包括监听器管理、导航方向判断等通用功能。
 * 具体的历史操作（push、replace、go）由子类实现。
 * 
 * **子类实现**：
 * - HTML5History: 使用浏览器 History API
 * - HashHistory: 使用 URL hash
 * - MemoryHistory: 内存中的历史记录（用于 SSR 和测试）
 * 
 * **内存管理**：
 * - 监听器数组在 destroy() 时被清空
 * - 子类应在 destroy() 中清理额外资源
 * 
 * @abstract
 * @implements {RouterHistory}
 * 
 * @example
 * ```ts
 * class MyHistory extends BaseHistory {
 *   push(to: HistoryLocation) {
 *     // 实现具体的 push 逻辑
 *   }
 *   replace(to: HistoryLocation) {
 *     // 实现具体的 replace 逻辑
 *   }
 *   go(delta: number) {
 *     // 实现具体的 go 逻辑
 *   }
 *   protected getCurrentLocation() {
 *     // 返回当前位置
 *     return { path: '/', fullPath: '/' }
 *   }
 *   protected getCurrentState() {
 *     // 返回当前状态
 *     return { current: this.location, position: 0 }
 *   }
 * }
 * ```
 */
export abstract class BaseHistory implements RouterHistory {
  protected listeners: NavigationCallback[] = []
  protected _base: string
  protected _location: HistoryLocation
  protected _state: HistoryState

  constructor(base: string = '') {
    this._base = this.normalizeBase(base)
    this._location = this.getCurrentLocation()
    this._state = this.getCurrentState()
  }

  get base(): string {
    return this._base
  }

  get location(): HistoryLocation {
    return this._location
  }

  get state(): HistoryState {
    return this._state
  }

  abstract push(to: HistoryLocation, data?: HistoryState): void
  abstract replace(to: HistoryLocation, data?: HistoryState): void
  abstract go(delta: number, triggerListeners?: boolean): void

  back(): void {
    this.go(-1)
  }

  forward(): void {
    this.go(1)
  }

  listen(callback: NavigationCallback): () => void {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index >= 0) {
        this.listeners.splice(index, 1)
      }
    }
  }

  destroy(): void {
    this.listeners = []
  }

  protected normalizeBase(base: string): string {
    if (!base) return ''
    base = base.replace(/^\/+/, '/').replace(/\/+$/, '')
    return base === '/' ? '' : base
  }

  protected abstract getCurrentLocation(): HistoryLocation
  protected abstract getCurrentState(): HistoryState

  protected triggerListeners(
    to: HistoryLocation,
    from: HistoryLocation,
    info: NavigationInformation,
  ): void {
    for (const listener of this.listeners) {
      listener(to, from, info)
    }
  }

  protected createNavigationInfo(
    type: NavigationType,
    delta: number = 0,
  ): NavigationInformation {
    return {
      type,
      direction: this.getNavigationDirection(delta),
      delta,
    }
  }

  protected getNavigationDirection(delta: number): NavigationDirection {
    if (delta > 0) return 'forward'
    if (delta < 0) return 'back'
    return 'unknown'
  }

  /**
   * 清理状态数据，确保只包含可序列化的内容
   */
  protected sanitizeStateData(data: HistoryState): HistoryState {
    if (!data || typeof data !== 'object') {
      return data || {}
    }

    const cache = new WeakSet()

    const sanitize = (obj: any, depth = 0): any => {
      if (depth > 10) return undefined
      if (obj === null || obj === undefined) return obj

      const type = typeof obj
      if (type === 'string' || type === 'number' || type === 'boolean') {
        return obj
      }

      if (type === 'object') {
        if (cache.has(obj)) return undefined
        cache.add(obj)

        if (Array.isArray(obj)) {
          return obj
            .map(item => sanitize(item, depth + 1))
            .filter(item => item !== undefined)
        }

        if (obj.constructor === Object) {
          const result: any = {}
          for (const [key, value] of Object.entries(obj)) {
            const sanitized = sanitize(value, depth + 1)
            if (sanitized !== undefined) {
              result[key] = sanitized
            }
          }
          return result
        }
      }

      return undefined
    }

    return sanitize(data) || {}
  }
}

