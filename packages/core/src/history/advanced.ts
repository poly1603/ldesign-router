/**
 * @ldesign/router-core 高级历史管理
 * 
 * @description
 * 提供高级历史管理功能。
 * 
 * **特性**：
 * - 历史状态持久化
 * - 前进/后退拦截
 * - 历史记录限制
 * - 状态同步
 * - 历史快照
 * 
 * @module history/advanced
 */

import type { 
  RouterHistory, 
  HistoryLocation, 
  HistoryState,
  NavigationCallback,
  NavigationDirection,
} from '../types'

/**
 * 历史记录项
 */
export interface HistoryEntry {
  /** 位置 */
  location: HistoryLocation
  
  /** 状态 */
  state: HistoryState
  
  /** 时间戳 */
  timestamp: number
  
  /** 索引 */
  index: number
}

/**
 * 历史快照
 */
export interface HistorySnapshot {
  /** 当前位置 */
  current: HistoryLocation
  
  /** 历史记录 */
  entries: HistoryEntry[]
  
  /** 当前索引 */
  currentIndex: number
  
  /** 创建时间 */
  timestamp: number
}

/**
 * 持久化选项
 */
export interface PersistenceOptions {
  /** 存储键 */
  key?: string
  
  /** 存储类型 */
  storage?: Storage
  
  /** 是否启用 */
  enabled?: boolean
  
  /** 最大记录数 */
  maxEntries?: number
}

/**
 * 拦截器
 */
export type HistoryInterceptor = (
  to: HistoryLocation,
  from: HistoryLocation,
  direction: NavigationDirection,
) => boolean | Promise<boolean>

/**
 * 高级历史管理器选项
 */
export interface AdvancedHistoryOptions {
  /** 基础历史管理器 */
  base: RouterHistory
  
  /** 最大历史记录数 */
  maxHistory?: number
  
  /** 持久化选项 */
  persistence?: PersistenceOptions
  
  /** 是否启用拦截 */
  enableInterception?: boolean
}

/**
 * 高级历史管理器
 */
export class AdvancedHistory implements RouterHistory {
  private base: RouterHistory
  private entries: HistoryEntry[] = []
  private currentIndex = 0
  private maxHistory: number
  private persistence: Required<PersistenceOptions>
  private enableInterception: boolean
  private interceptors: HistoryInterceptor[] = []
  private listeners: Set<NavigationCallback> = new Set()

  constructor(options: AdvancedHistoryOptions) {
    this.base = options.base
    this.maxHistory = options.maxHistory || 100
    this.enableInterception = options.enableInterception ?? true
    
    this.persistence = {
      key: options.persistence?.key || 'router-history',
      storage: options.persistence?.storage || (typeof sessionStorage !== 'undefined' ? sessionStorage : null as any),
      enabled: options.persistence?.enabled ?? true,
      maxEntries: options.persistence?.maxEntries || 50,
    }

    // 初始化
    this.initialize()
  }

  // ==================== 初始化 ====================

  /**
   * 初始化
   */
  private initialize(): void {
    // 恢复历史记录
    if (this.persistence.enabled && this.persistence.storage) {
      this.restoreHistory()
    }

    // 监听基础历史变化
    this.base.listen((location, type) => {
      this.addEntry(location, {})
      this.notifyListeners(location, type)
    })

    // 添加当前记录
    this.addEntry(this.base.location, {})
  }

  // ==================== 基础实现 ====================

  get location(): HistoryLocation {
    return this.base.location
  }

  get state(): HistoryState {
    return this.base.state
  }

  /**
   * 推入历史记录
   */
  async push(to: string | HistoryLocation, data?: HistoryState): Promise<void> {
    const target = typeof to === 'string' ? { path: to } as HistoryLocation : to

    // 拦截检查
    if (this.enableInterception) {
      const allowed = await this.checkInterceptors(target, this.location, 'push')
      if (!allowed) {
        return
      }
    }

    await this.base.push(to, data)
    this.addEntry(target, data || {})
    this.persistHistory()
  }

  /**
   * 替换历史记录
   */
  async replace(to: string | HistoryLocation, data?: HistoryState): Promise<void> {
    const target = typeof to === 'string' ? { path: to } as HistoryLocation : to

    // 拦截检查
    if (this.enableInterception) {
      const allowed = await this.checkInterceptors(target, this.location, 'replace')
      if (!allowed) {
        return
      }
    }

    await this.base.replace(to, data)
    
    // 替换当前记录
    if (this.entries.length > 0) {
      this.entries[this.currentIndex] = {
        location: target,
        state: data || {},
        timestamp: Date.now(),
        index: this.currentIndex,
      }
    }

    this.persistHistory()
  }

  /**
   * 跳转
   */
  go(delta: number, triggerListeners?: boolean): void {
    // 拦截检查
    if (this.enableInterception) {
      const targetIndex = this.currentIndex + delta
      if (targetIndex >= 0 && targetIndex < this.entries.length) {
        const target = this.entries[targetIndex].location
        const direction: NavigationDirection = delta > 0 ? 'forward' : 'back'
        
        this.checkInterceptors(target, this.location, direction).then(allowed => {
          if (allowed) {
            this.performGo(delta, triggerListeners)
          }
        })
        return
      }
    }

    this.performGo(delta, triggerListeners)
  }

  /**
   * 执行跳转
   */
  private performGo(delta: number, triggerListeners?: boolean): void {
    this.currentIndex = Math.max(0, Math.min(this.entries.length - 1, this.currentIndex + delta))
    this.base.go(delta, triggerListeners)
    this.persistHistory()
  }

  /**
   * 监听历史变化
   */
  listen(callback: NavigationCallback): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.listeners.clear()
    this.interceptors = []
    this.base.destroy()
  }

  // ==================== 历史记录管理 ====================

  /**
   * 添加记录
   */
  private addEntry(location: HistoryLocation, state: HistoryState): void {
    // 移除当前索引之后的记录
    this.entries = this.entries.slice(0, this.currentIndex + 1)

    // 添加新记录
    const entry: HistoryEntry = {
      location,
      state,
      timestamp: Date.now(),
      index: this.entries.length,
    }

    this.entries.push(entry)
    this.currentIndex = this.entries.length - 1

    // 限制历史记录数量
    if (this.entries.length > this.maxHistory) {
      this.entries.shift()
      this.currentIndex--
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(): HistoryEntry[] {
    return [...this.entries]
  }

  /**
   * 获取当前记录
   */
  getCurrentEntry(): HistoryEntry | null {
    return this.entries[this.currentIndex] || null
  }

  /**
   * 获取指定索引的记录
   */
  getEntry(index: number): HistoryEntry | null {
    return this.entries[index] || null
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    const current = this.entries[this.currentIndex]
    this.entries = current ? [current] : []
    this.currentIndex = 0
    this.persistHistory()
  }

  /**
   * 获取历史长度
   */
  getHistoryLength(): number {
    return this.entries.length
  }

  /**
   * 是否可以后退
   */
  canGoBack(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 是否可以前进
   */
  canGoForward(): boolean {
    return this.currentIndex < this.entries.length - 1
  }

  // ==================== 拦截器 ====================

  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: HistoryInterceptor): () => void {
    this.interceptors.push(interceptor)
    
    return () => {
      const index = this.interceptors.indexOf(interceptor)
      if (index > -1) {
        this.interceptors.splice(index, 1)
      }
    }
  }

  /**
   * 检查拦截器
   */
  private async checkInterceptors(
    to: HistoryLocation,
    from: HistoryLocation,
    direction: NavigationDirection,
  ): Promise<boolean> {
    for (const interceptor of this.interceptors) {
      const result = await interceptor(to, from, direction)
      if (!result) {
        return false
      }
    }
    return true
  }

  /**
   * 清空拦截器
   */
  clearInterceptors(): void {
    this.interceptors = []
  }

  // ==================== 持久化 ====================

  /**
   * 持久化历史记录
   */
  private persistHistory(): void {
    if (!this.persistence.enabled || !this.persistence.storage) {
      return
    }

    try {
      const snapshot = this.createSnapshot()
      
      // 限制持久化的记录数量
      if (snapshot.entries.length > this.persistence.maxEntries) {
        const startIndex = snapshot.entries.length - this.persistence.maxEntries
        snapshot.entries = snapshot.entries.slice(startIndex)
        snapshot.currentIndex = Math.min(snapshot.currentIndex, snapshot.entries.length - 1)
      }

      this.persistence.storage.setItem(
        this.persistence.key,
        JSON.stringify(snapshot),
      )
    } catch (error) {
      console.error('Failed to persist history:', error)
    }
  }

  /**
   * 恢复历史记录
   */
  private restoreHistory(): void {
    if (!this.persistence.storage) {
      return
    }

    try {
      const data = this.persistence.storage.getItem(this.persistence.key)
      if (!data) {
        return
      }

      const snapshot: HistorySnapshot = JSON.parse(data)
      
      // 验证快照
      if (snapshot.entries && Array.isArray(snapshot.entries)) {
        this.entries = snapshot.entries
        this.currentIndex = snapshot.currentIndex || 0
      }
    } catch (error) {
      console.error('Failed to restore history:', error)
    }
  }

  /**
   * 清除持久化数据
   */
  clearPersistedHistory(): void {
    if (this.persistence.storage) {
      try {
        this.persistence.storage.removeItem(this.persistence.key)
      } catch (error) {
        console.error('Failed to clear persisted history:', error)
      }
    }
  }

  // ==================== 快照 ====================

  /**
   * 创建快照
   */
  createSnapshot(): HistorySnapshot {
    return {
      current: this.location,
      entries: [...this.entries],
      currentIndex: this.currentIndex,
      timestamp: Date.now(),
    }
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(snapshot: HistorySnapshot): void {
    this.entries = snapshot.entries
    this.currentIndex = snapshot.currentIndex
    
    // 同步到基础历史
    const targetEntry = this.entries[this.currentIndex]
    if (targetEntry) {
      this.base.replace(targetEntry.location, targetEntry.state)
    }

    this.persistHistory()
  }

  // ==================== 工具方法 ====================

  /**
   * 通知监听器
   */
  private notifyListeners(location: HistoryLocation, type: NavigationDirection): void {
    for (const listener of this.listeners) {
      listener(location, type)
    }
  }
}

/**
 * 创建高级历史管理器
 */
export function createAdvancedHistory(options: AdvancedHistoryOptions): AdvancedHistory {
  return new AdvancedHistory(options)
}

// 保留旧名称以兼容 (标记为弃用)
/** @deprecated Use AdvancedHistory instead */
export { AdvancedHistory as EnhancedHistory }
/** @deprecated Use AdvancedHistoryOptions instead */
export type { AdvancedHistoryOptions as EnhancedHistoryOptions }
/** @deprecated Use createAdvancedHistory instead */
export { createAdvancedHistory as createEnhancedHistory }

/**
 * 历史记录过滤器
 */
export function filterHistory(
  entries: HistoryEntry[],
  predicate: (entry: HistoryEntry) => boolean,
): HistoryEntry[] {
  return entries.filter(predicate)
}

/**
 * 查找历史记录
 */
export function findHistoryEntry(
  entries: HistoryEntry[],
  predicate: (entry: HistoryEntry) => boolean,
): HistoryEntry | null {
  return entries.find(predicate) || null
}

/**
 * 历史记录统计
 */
export interface HistoryStats {
  /** 总记录数 */
  total: number
  
  /** 唯一路径数 */
  uniquePaths: number
  
  /** 最早时间 */
  earliestTimestamp: number
  
  /** 最晚时间 */
  latestTimestamp: number
  
  /** 平均停留时间 */
  averageDuration: number
}

/**
 * 获取历史统计
 */
export function getHistoryStats(entries: HistoryEntry[]): HistoryStats {
  if (entries.length === 0) {
    return {
      total: 0,
      uniquePaths: 0,
      earliestTimestamp: 0,
      latestTimestamp: 0,
      averageDuration: 0,
    }
  }

  const paths = new Set(entries.map(e => e.location.path))
  const timestamps = entries.map(e => e.timestamp)
  
  const durations: number[] = []
  for (let i = 0; i < entries.length - 1; i++) {
    durations.push(entries[i + 1].timestamp - entries[i].timestamp)
  }

  return {
    total: entries.length,
    uniquePaths: paths.size,
    earliestTimestamp: Math.min(...timestamps),
    latestTimestamp: Math.max(...timestamps),
    averageDuration: durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0,
  }
}
