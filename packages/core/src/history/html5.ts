/**
 * @ldesign/router-core HTML5 历史管理器
 * 
 * @module history/html5
 */

import type { HistoryLocation, HistoryState, NavigationType } from '../types'
import { BaseHistory } from './base'

const SUPPORTS_HISTORY = typeof window !== 'undefined' && 'pushState' in window.history

/**
 * HTML5 History 模式
 * 
 * @description
 * 使用浏览器的 History API（pushState/replaceState）管理路由历史。
 * 支持现代浏览器的无刷新导航，URL 格式为标准路径（如 /about）。
 * 
 * **特性**：
 * - 使用 History API 进行导航
 * - 监听 popstate 事件
 * - 支持自定义 base 路径
 * - 导航防抖（50ms）
 * - 自动清理事件监听器
 * 
 * **性能优化**：
 * - 导航防抖，避免频繁操作
 * - requestAnimationFrame 优化 popstate 处理
 * - passive 事件监听器
 * - 状态数据清理（移除不可序列化数据）
 * 
 * **内存管理**：
 * - destroy() 自动移除所有事件监听器
 * - 清理监听器数组
 * 
 * @class
 * @extends {BaseHistory}
 * 
 * @example
 * ```ts
 * const history = new HTML5History('/app')
 * 
 * // 添加新的历史记录
 * history.push({
 *   path: '/about',
 *   fullPath: '/about',
 * })
 * 
 * // 监听导航
 * const removeListener = history.listen((to, from, info) => {
 *   console.log('导航:', from.path, '->', to.path)
 * })
 * 
 * // 清理
 * removeListener()
 * history.destroy()
 * ```
 */
export class HTML5History extends BaseHistory {
  private popstateListener?: (event: PopStateEvent) => void
  private lastNavTime = 0
  private readonly NAV_THROTTLE = 50

  constructor(base?: string) {
    super(base)
    if (typeof window !== 'undefined') {
      this.setupPopstateListener()
    }
  }

  push(to: HistoryLocation, data?: HistoryState): void {
    // 防抖处理
    const now = Date.now()
    if (now - this.lastNavTime < this.NAV_THROTTLE) {
      return
    }
    this.lastNavTime = now

    const from = this._location
    const url = this.buildURL(to)

    const serializableData = this.sanitizeStateData(data || {})
    history.pushState(serializableData, '', url)

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('push' as NavigationType))
  }

  replace(to: HistoryLocation, data?: HistoryState): void {
    const from = this._location
    const url = this.buildURL(to)

    const serializableData = this.sanitizeStateData(data || {})
    history.replaceState(serializableData, '', url)

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('replace' as NavigationType))
  }

  go(delta: number, _triggerListeners: boolean = true): void {
    history.go(delta)
  }

  override destroy(): void {
    super.destroy()
    if (this.popstateListener && typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.popstateListener)
    }
  }

  protected getCurrentLocation(): HistoryLocation {
    if (typeof window === 'undefined') {
      return { fullPath: '/', path: '/' }
    }

    const { pathname, search, hash } = window.location
    const path = this.stripBase(pathname)
    const query = search.startsWith('?') ? search.slice(1) : search
    const hashValue = hash.startsWith('#') ? hash.slice(1) : hash

    return {
      fullPath: path + search + hash,
      path,
      query,
      hash: hashValue,
    }
  }

  protected getCurrentState(): HistoryState {
    return history.state || {}
  }

  private setupPopstateListener(): void {
    let isProcessing = false

    this.popstateListener = (event: PopStateEvent) => {
      if (isProcessing) return
      isProcessing = true

      const from = this._location
      const to = this.getCurrentLocation()

      this._location = to
      this._state = event.state || {}

      this.triggerListeners(to, from, this.createNavigationInfo('pop' as NavigationType))

      requestAnimationFrame(() => {
        isProcessing = false
      })
    }

    window.addEventListener('popstate', this.popstateListener, { passive: true })
  }

  private buildURL(location: HistoryLocation): string {
    const query = location.query ? `?${location.query}` : ''
    const hash = location.hash ? `#${location.hash}` : ''
    return this._base + location.path + query + hash
  }

  private stripBase(pathname: string): string {
    if (!this._base) return pathname
    if (pathname.startsWith(this._base)) {
      return pathname.slice(this._base.length) || '/'
    }
    return pathname
  }
}

/**
 * 创建 HTML5 History 实例
 * 
 * @description
 * 工厂函数，创建基于浏览器 History API 的历史管理器。
 * 仅在浏览器环境中可用，服务端渲染请使用 createMemoryHistory。
 * 
 * **浏览器支持**：
 * - 现代浏览器（支持 History API）
 * - 不支持 IE9 及以下版本
 * 
 * **性能**：O(1) 创建时间
 * 
 * @param base - 基础路径（可选，默认为 '/'）
 * @returns HTML5History 实例
 * 
 * @throws {TypeError} 如果在非浏览器环境中调用
 * @throws {Error} 如果浏览器不支持 History API
 * 
 * @example
 * ```ts
 * // 基础用法
 * const history = createWebHistory()
 * history.push({ path: '/about', fullPath: '/about' })
 * 
 * // 自定义 base 路径
 * const history = createWebHistory('/app')
 * history.push({ path: '/home', fullPath: '/home' })
 * // 实际 URL: /app/home
 * 
 * // 监听导航
 * const removeListener = history.listen((to, from) => {
 *   console.log('从', from.path, '到', to.path)
 * })
 * 
 * // 清理
 * removeListener()
 * history.destroy()
 * ```
 */
export function createWebHistory(base?: string): HTML5History {
  if (typeof window === 'undefined') {
    throw new TypeError('createWebHistory() can only be used in browser environment')
  }

  if (!SUPPORTS_HISTORY) {
    throw new Error('HTML5 History API is not supported in this browser')
  }

  return new HTML5History(base)
}

