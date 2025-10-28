/**
 * @ldesign/router-core Hash 历史管理器
 * 
 * @module history/hash
 */

import type { HistoryLocation, HistoryState, NavigationType } from '../types'
import { BaseHistory } from './base'

const SUPPORTS_HISTORY = typeof window !== 'undefined' && 'pushState' in window.history

/**
 * Hash History 模式
 */
export class HashHistory extends BaseHistory {
  private hashchangeListener?: (event: HashChangeEvent) => void

  constructor(base?: string) {
    super(base)
    if (typeof window !== 'undefined') {
      this.setupHashchangeListener()
    }
  }

  push(to: HistoryLocation, data?: HistoryState): void {
    const from = { ...this._location }
    const url = this.buildHashURL(to)

    if (SUPPORTS_HISTORY) {
      const serializableData = this.sanitizeStateData(data || {})
      history.pushState(serializableData, '', url)
    }
    else if (typeof window !== 'undefined') {
      window.location.hash = this.buildHash(to)
    }

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('push' as NavigationType))
  }

  replace(to: HistoryLocation, data?: HistoryState): void {
    const from = { ...this._location }
    const url = this.buildHashURL(to)

    if (SUPPORTS_HISTORY) {
      const serializableData = this.sanitizeStateData(data || {})
      history.replaceState(serializableData, '', url)
    }
    else if (typeof window !== 'undefined') {
      window.location.replace(url)
    }

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('replace' as NavigationType))
  }

  go(delta: number, _triggerListeners: boolean = true): void {
    if (typeof window !== 'undefined') {
      history.go(delta)
    }
  }

  override destroy(): void {
    super.destroy()
    if (this.hashchangeListener && typeof window !== 'undefined') {
      window.removeEventListener('hashchange', this.hashchangeListener)
    }
  }

  protected getCurrentLocation(): HistoryLocation {
    if (typeof window === 'undefined') {
      return { fullPath: '/', path: '/' }
    }

    const hash = window.location.hash.slice(1)
    const [pathWithQuery, hashFragment] = hash.split('#')
    const [path, queryString] = (pathWithQuery || '/').split('?')

    const query = queryString || ''
    const hashValue = hashFragment || ''

    return {
      fullPath: path + (query ? `?${query}` : '') + (hashValue ? `#${hashValue}` : ''),
      path: path || '/',
      query,
      hash: hashValue,
    }
  }

  protected getCurrentState(): HistoryState {
    return SUPPORTS_HISTORY ? history.state || {} : {}
  }

  private setupHashchangeListener(): void {
    this.hashchangeListener = () => {
      const from = { ...this._location }
      const to = this.getCurrentLocation()

      this._location = to
      this._state = this.getCurrentState()

      this.triggerListeners(to, from, this.createNavigationInfo('pop' as NavigationType))
    }

    window.addEventListener('hashchange', this.hashchangeListener)
  }

  private buildHashURL(location: HistoryLocation): string {
    if (typeof window === 'undefined') {
      return `#${this.buildHash(location)}`
    }

    const hash = this.buildHash(location)
    return `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}#${hash}`
  }

  private buildHash(location: HistoryLocation): string {
    const query = location.query ? `?${location.query}` : ''
    const hash = location.hash ? `#${location.hash}` : ''
    return location.path + query + hash
  }
}

/**
 * 创建 Hash History
 */
export function createWebHashHistory(base?: string): HashHistory {
  if (typeof window === 'undefined') {
    throw new TypeError('createWebHashHistory() can only be used in browser environment')
  }

  return new HashHistory(base)
}

