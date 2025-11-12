/**
 * @ldesign/router-core 路由状态持久化
 * 
 * @description
 * 提供路由状态的持久化存储功能，支持页面刷新后恢复状态。
 * 
 * **特性**：
 * - 多种存储策略（localStorage、sessionStorage、indexedDB）
 * - 自动序列化/反序列化
 * - 选择性持久化（include/exclude）
 * - 过期时间管理
 * - 存储空间管理
 * 
 * **使用场景**：
 * - 页面刷新保持状态
 * - 表单数据临时保存
 * - 用户浏览历史
 * - 离线应用支持
 * 
 * @module features/persistence
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 存储类型
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory'

/**
 * 持久化状态
 */
export interface PersistedState {
  /** 路由信息 */
  route: RouteLocationNormalized

  /** 自定义数据 */
  data?: Record<string, unknown>

  /** 保存时间戳 */
  timestamp: number

  /** 过期时间（毫秒） */
  expires?: number

  /** 版本号 */
  version?: string
}

/**
 * 持久化配置
 */
export interface PersistenceOptions {
  /** 存储类型（默认 'localStorage'） */
  storage?: StorageType

  /** 存储键前缀（默认 'router-state'） */
  keyPrefix?: string

  /** 是否启用（默认 true） */
  enabled?: boolean

  /** 是否自动保存（默认 true） */
  autoSave?: boolean

  /** 自动保存延迟（毫秒，默认 1000） */
  autoSaveDelay?: number

  /** 过期时间（毫秒，0 表示永不过期） */
  ttl?: number

  /** 包含的路由路径 */
  include?: Array<string | RegExp>

  /** 排除的路由路径 */
  exclude?: Array<string | RegExp>

  /** 序列化字段配置 */
  serializer?: {
    /** 包含的字段 */
    include?: string[]
    /** 排除的字段 */
    exclude?: string[]
  }

  /** 版本号（用于兼容性检查） */
  version?: string

  /** 最大存储项数（默认 50） */
  maxItems?: number
}

/**
 * 持久化管理器
 * 
 * @description
 * 管理路由状态的持久化存储，支持多种存储策略和自动清理。
 * 
 * **存储策略**：
 * - localStorage: 持久化存储，关闭浏览器仍保留
 * - sessionStorage: 会话存储，关闭标签页清除
 * - memory: 内存存储，刷新页面清除
 * 
 * **自动管理**：
 * - 过期自动清理
 * - 存储空间限制
 * - 版本兼容检查
 * 
 * ⚡ 性能:
 * - 读取: O(1)
 * - 保存: O(1) + 序列化开销
 * - 清理: O(n)
 * 
 * @class
 * 
 * @example
 * ```ts
 * const persistence = new PersistenceManager({
 *   storage: 'localStorage',
 *   ttl: 7 * 24 * 60 * 60 * 1000, // 7天
 *   include: ['/dashboard', '/profile'],
 *   autoSave: true,
 * })
 * 
 * // 保存状态
 * persistence.save(route, { formData: values })
 * 
 * // 恢复状态
 * const state = persistence.restore(route)
 * if (state) {
 *   // 使用恢复的数据
 * }
 * ```
 */
export class PersistenceManager {
  /** 配置选项 */
  private options: Required<PersistenceOptions>

  /** 存储实例 */
  private storage: Storage | Map<string, string>

  /** 自动保存定时器 */
  private autoSaveTimer?: ReturnType<typeof setTimeout>

  /** 待保存队列 */
  private saveQueue = new Map<string, PersistedState>()

  /** 清理定时器 */
  private cleanupTimer?: ReturnType<typeof setInterval>

  /**
   * 创建持久化管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: PersistenceOptions = {}) {
    this.options = {
      storage: options.storage ?? 'localStorage',
      keyPrefix: options.keyPrefix ?? 'router-state',
      enabled: options.enabled ?? true,
      autoSave: options.autoSave ?? true,
      autoSaveDelay: options.autoSaveDelay ?? 1000,
      ttl: options.ttl ?? 0,
      include: options.include ?? [],
      exclude: options.exclude ?? [],
      serializer: options.serializer ?? {},
      version: options.version ?? '1.0.0',
      maxItems: options.maxItems ?? 50,
    }

    // 初始化存储
    this.storage = this.initStorage()

    // 启动自动清理
    if (this.options.ttl > 0) {
      this.startCleanup()
    }
  }

  /**
   * 保存路由状态
   * 
   * @param route - 路由对象
   * @param data - 自定义数据
   * @returns 是否成功保存
   * 
   * @example
   * ```ts
   * persistence.save(route, {
   *   scrollPosition: window.scrollY,
   *   formData: { name: 'John' },
   * })
   * ```
   */
  save(
    route: RouteLocationNormalized,
    data?: Record<string, unknown>,
  ): boolean {
    if (!this.options.enabled) {
      return false
    }

    // 检查是否应该持久化
    if (!this.shouldPersist(route)) {
      return false
    }

    const state: PersistedState = {
      route: this.serializeRoute(route),
      data,
      timestamp: Date.now(),
      expires: this.options.ttl > 0 ? Date.now() + this.options.ttl : undefined,
      version: this.options.version,
    }

    if (this.options.autoSave) {
      // 加入自动保存队列
      const key = this.getStorageKey(route)
      this.saveQueue.set(key, state)
      this.scheduleAutoSave()
    } else {
      // 立即保存
      this.writeToStorage(route, state)
    }

    return true
  }

  /**
   * 恢复路由状态
   * 
   * @param route - 路由对象
   * @returns 持久化状态，不存在返回 null
   * 
   * @example
   * ```ts
   * const state = persistence.restore(route)
   * if (state?.data) {
   *   form.setValues(state.data.formData)
   * }
   * ```
   */
  restore(route: RouteLocationNormalized): PersistedState | null {
    if (!this.options.enabled) {
      return null
    }

    try {
      const key = this.getStorageKey(route)
      const json = this.storage.get?.(key) ?? this.storage.getItem?.(key)

      if (!json) {
        return null
      }

      const state = JSON.parse(json) as PersistedState

      // 检查版本
      if (state.version !== this.options.version) {
        // 版本不匹配，清除旧数据
        this.delete(route)
        return null
      }

      // 检查是否过期
      if (state.expires && Date.now() > state.expires) {
        this.delete(route)
        return null
      }

      return state
    } catch (error) {
      console.error('Failed to restore route state:', error)
      return null
    }
  }

  /**
   * 删除路由状态
   * 
   * @param route - 路由对象
   * @returns 是否成功删除
   */
  delete(route: RouteLocationNormalized): boolean {
    try {
      const key = this.getStorageKey(route)
      
      if (this.storage instanceof Map) {
        return this.storage.delete(key)
      } else {
        this.storage.removeItem(key)
        return true
      }
    } catch (error) {
      console.error('Failed to delete route state:', error)
      return false
    }
  }

  /**
   * 清空所有状态
   * 
   * @param pattern - 可选的路径模式，匹配的会被清除
   */
  clear(pattern?: string | RegExp): void {
    try {
      if (!pattern) {
        // 清空所有
        if (this.storage instanceof Map) {
          this.storage.clear()
        } else {
          const keys = this.getAllKeys()
          keys.forEach(key => this.storage.removeItem?.(key))
        }
        return
      }

      // 按模式清除
      const regex = typeof pattern === 'string'
        ? new RegExp(`^${pattern}`)
        : pattern

      const keys = this.getAllKeys()
      for (const key of keys) {
        const path = this.extractPathFromKey(key)
        if (path && regex.test(path)) {
          if (this.storage instanceof Map) {
            this.storage.delete(key)
          } else {
            this.storage.removeItem?.(key)
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear route states:', error)
    }
  }

  /**
   * 获取所有持久化的路由路径
   * 
   * @returns 路由路径数组
   */
  getPersistedRoutes(): string[] {
    const keys = this.getAllKeys()
    return keys.map(key => this.extractPathFromKey(key)).filter(Boolean) as string[]
  }

  /**
   * 获取存储统计信息
   * 
   * @returns 统计数据
   */
  getStats(): {
    total: number
    size: number
    expired: number
  } {
    const keys = this.getAllKeys()
    let expired = 0
    let size = 0

    for (const key of keys) {
      try {
        const json = this.storage.get?.(key) ?? this.storage.getItem?.(key)
        if (!json) continue

        size += json.length

        const state = JSON.parse(json) as PersistedState
        if (state.expires && Date.now() > state.expires) {
          expired++
        }
      } catch {
        // 忽略解析错误
      }
    }

    return {
      total: keys.length,
      size,
      expired,
    }
  }

  /**
   * 清理过期数据
   * 
   * @returns 清理的数量
   */
  cleanup(): number {
    let cleaned = 0

    try {
      const keys = this.getAllKeys()

      for (const key of keys) {
        try {
          const json = this.storage.get?.(key) ?? this.storage.getItem?.(key)
          if (!json) continue

          const state = JSON.parse(json) as PersistedState

          // 清理过期项
          if (state.expires && Date.now() > state.expires) {
            if (this.storage instanceof Map) {
              this.storage.delete(key)
            } else {
              this.storage.removeItem?.(key)
            }
            cleaned++
          }
        } catch {
          // 清理无效项
          if (this.storage instanceof Map) {
            this.storage.delete(key)
          } else {
            this.storage.removeItem?.(key)
          }
          cleaned++
        }
      }

      // 限制存储项数
      if (keys.length - cleaned > this.options.maxItems) {
        this.trimStorage()
      }
    } catch (error) {
      console.error('Failed to cleanup route states:', error)
    }

    return cleaned
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 清除定时器
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    // 保存待保存的数据
    this.flushSaveQueue()

    // 清空队列
    this.saveQueue.clear()
  }

  /**
   * 初始化存储
   * 
   * @private
   */
  private initStorage(): Storage | Map<string, string> {
    if (this.options.storage === 'memory') {
      return new Map<string, string>()
    }

    if (typeof window === 'undefined') {
      return new Map<string, string>()
    }

    try {
      const storage = this.options.storage === 'localStorage'
        ? window.localStorage
        : window.sessionStorage

      // 测试存储是否可用
      const testKey = `${this.options.keyPrefix}-test`
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)

      return storage
    } catch {
      // 回退到内存存储
      console.warn('Storage not available, falling back to memory storage')
      return new Map<string, string>()
    }
  }

  /**
   * 获取存储键
   * 
   * @private
   */
  private getStorageKey(route: RouteLocationNormalized): string {
    return `${this.options.keyPrefix}:${route.path}`
  }

  /**
   * 从键提取路径
   * 
   * @private
   */
  private extractPathFromKey(key: string): string | null {
    const prefix = `${this.options.keyPrefix}:`
    if (!key.startsWith(prefix)) {
      return null
    }
    return key.slice(prefix.length)
  }

  /**
   * 获取所有存储键
   * 
   * @private
   */
  private getAllKeys(): string[] {
    if (this.storage instanceof Map) {
      return Array.from(this.storage.keys())
    }

    const keys: string[] = []
    const prefix = this.options.keyPrefix

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key)
      }
    }

    return keys
  }

  /**
   * 检查是否应该持久化
   * 
   * @private
   */
  private shouldPersist(route: RouteLocationNormalized): boolean {
    const path = route.path

    // 检查排除列表
    if (this.options.exclude.length > 0) {
      if (this.isExcluded(path)) {
        return false
      }
    }

    // 检查包含列表
    if (this.options.include.length > 0) {
      return this.isIncluded(path)
    }

    // 默认持久化
    return true
  }

  /**
   * 检查路径是否在包含列表中
   * 
   * @private
   */
  private isIncluded(path: string): boolean {
    return this.options.include.some(pattern => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern)
      }
      return pattern.test(path)
    })
  }

  /**
   * 检查路径是否在排除列表中
   * 
   * @private
   */
  private isExcluded(path: string): boolean {
    return this.options.exclude.some(pattern => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern)
      }
      return pattern.test(path)
    })
  }

  /**
   * 序列化路由
   * 
   * @private
   */
  private serializeRoute(route: RouteLocationNormalized): RouteLocationNormalized {
    const { serializer } = this.options

    // 选择性序列化
    const result: any = {}

    const fields = serializer.include ?? ['path', 'name', 'params', 'query', 'hash', 'meta']

    for (const field of fields) {
      if (serializer.exclude?.includes(field)) {
        continue
      }

      if (field in route) {
        result[field] = (route as any)[field]
      }
    }

    return result as RouteLocationNormalized
  }

  /**
   * 写入存储
   * 
   * @private
   */
  private writeToStorage(route: RouteLocationNormalized, state: PersistedState): void {
    try {
      const key = this.getStorageKey(route)
      const json = JSON.stringify(state)

      if (this.storage instanceof Map) {
        this.storage.set(key, json)
      } else {
        this.storage.setItem(key, json)
      }
    } catch (error) {
      console.error('Failed to write route state:', error)
    }
  }

  /**
   * 调度自动保存
   * 
   * @private
   */
  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
    }

    this.autoSaveTimer = setTimeout(() => {
      this.flushSaveQueue()
    }, this.options.autoSaveDelay)
  }

  /**
   * 清空保存队列
   * 
   * @private
   */
  private flushSaveQueue(): void {
    for (const [key, state] of this.saveQueue.entries()) {
      try {
        const json = JSON.stringify(state)

        if (this.storage instanceof Map) {
          this.storage.set(key, json)
        } else {
          this.storage.setItem(key, json)
        }
      } catch (error) {
        console.error('Failed to flush save queue:', error)
      }
    }

    this.saveQueue.clear()
  }

  /**
   * 启动定期清理
   * 
   * @private
   */
  private startCleanup(): void {
    // 每小时清理一次
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, 60 * 60 * 1000)

    // 使用 unref() 防止阻止进程退出
    if (typeof (this.cleanupTimer as any).unref === 'function') {
      (this.cleanupTimer as any).unref()
    }
  }

  /**
   * 限制存储项数
   * 
   * @private
   */
  private trimStorage(): void {
    try {
      const keys = this.getAllKeys()
      const states: Array<{ key: string; timestamp: number }> = []

      // 收集所有状态的时间戳
      for (const key of keys) {
        try {
          const json = this.storage.get?.(key) ?? this.storage.getItem?.(key)
          if (!json) continue

          const state = JSON.parse(json) as PersistedState
          states.push({ key, timestamp: state.timestamp })
        } catch {
          // 忽略错误
        }
      }

      // 按时间排序，删除最旧的
      states.sort((a, b) => a.timestamp - b.timestamp)

      const toRemove = states.slice(0, states.length - this.options.maxItems)

      for (const { key } of toRemove) {
        if (this.storage instanceof Map) {
          this.storage.delete(key)
        } else {
          this.storage.removeItem?.(key)
        }
      }
    } catch (error) {
      console.error('Failed to trim storage:', error)
    }
  }
}

/**
 * 创建持久化管理器
 * 
 * @param options - 配置选项
 * @returns 持久化管理器实例
 * 
 * @example
 * ```ts
 * const persistence = createPersistenceManager({
 *   storage: 'localStorage',
 *   ttl: 7 * 24 * 60 * 60 * 1000,
 *   autoSave: true,
 * })
 * ```
 */
export function createPersistenceManager(
  options?: PersistenceOptions,
): PersistenceManager {
  return new PersistenceManager(options)
}
