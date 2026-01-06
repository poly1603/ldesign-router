/**
 * 路由状态时间旅行
 *
 * 提供路由历史快照、状态回放和时间旅行调试功能。
 *
 * @module features/time-travel
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 路由快照
 */
export interface RouteSnapshot {
  /** 快照 ID */
  id: string
  /** 路由位置 */
  location: RouteLocationNormalized
  /** 快照时间戳 */
  timestamp: number
  /** 导航类型 */
  type: 'push' | 'replace' | 'pop' | 'initial'
  /** 自定义状态 */
  state?: Record<string, unknown>
  /** 导航耗时（毫秒） */
  duration?: number
  /** 标签 */
  label?: string
}

/**
 * 时间旅行选项
 */
export interface TimeTravelOptions {
  /** 最大快照数量 */
  maxSnapshots?: number
  /** 是否启用自动快照 */
  autoSnapshot?: boolean
  /** 是否持久化到 sessionStorage */
  persist?: boolean
  /** 持久化键名 */
  persistKey?: string
  /** 快照过滤器 */
  filter?: (location: RouteLocationNormalized) => boolean
}

/**
 * 时间旅行状态
 */
export interface TimeTravelState {
  /** 所有快照 */
  snapshots: RouteSnapshot[]
  /** 当前位置索引 */
  currentIndex: number
  /** 是否处于时间旅行模式 */
  isTraveling: boolean
  /** 是否可以后退 */
  canGoBack: boolean
  /** 是否可以前进 */
  canGoForward: boolean
}

/**
 * 时间旅行事件监听器
 */
export type TimeTravelListener = (state: TimeTravelState) => void

/**
 * 时间旅行管理器
 *
 * @example
 * ```typescript
 * const timeTravel = createTimeTravel({
 *   maxSnapshots: 50,
 *   autoSnapshot: true,
 *   persist: true,
 * })
 *
 * // 添加快照
 * timeTravel.snapshot(currentRoute, 'push')
 *
 * // 回退到上一个快照
 * const prevRoute = timeTravel.goBack()
 *
 * // 前进到下一个快照
 * const nextRoute = timeTravel.goForward()
 *
 * // 跳转到指定快照
 * const route = timeTravel.goTo(snapshotId)
 *
 * // 获取状态
 * const state = timeTravel.getState()
 * ```
 */
export class TimeTravelManager {
  private snapshots: RouteSnapshot[] = []
  private currentIndex = -1
  private isTraveling = false
  private listeners = new Set<TimeTravelListener>()
  private options: Required<TimeTravelOptions>
  private snapshotIdCounter = 0

  constructor(options: TimeTravelOptions = {}) {
    this.options = {
      maxSnapshots: options.maxSnapshots ?? 100,
      autoSnapshot: options.autoSnapshot ?? true,
      persist: options.persist ?? false,
      persistKey: options.persistKey ?? '__ldesign_router_time_travel__',
      filter: options.filter ?? (() => true),
    }

    // 从持久化存储恢复
    if (this.options.persist) {
      this.restore()
    }
  }

  /**
   * 创建快照
   *
   * @param location - 路由位置
   * @param type - 导航类型
   * @param options - 额外选项
   * @returns 快照 ID
   */
  snapshot(
    location: RouteLocationNormalized,
    type: RouteSnapshot['type'] = 'push',
    options?: {
      state?: Record<string, unknown>
      duration?: number
      label?: string
    }
  ): string {
    // 应用过滤器
    if (!this.options.filter(location)) {
      return ''
    }

    // 如果正在时间旅行中进行了新的导航，清除后续快照
    if (this.isTraveling && this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1)
      this.isTraveling = false
    }

    const snapshot: RouteSnapshot = {
      id: this.generateId(),
      location: this.cloneLocation(location),
      timestamp: Date.now(),
      type,
      state: options?.state,
      duration: options?.duration,
      label: options?.label,
    }

    this.snapshots.push(snapshot)
    this.currentIndex = this.snapshots.length - 1

    // 限制快照数量
    if (this.snapshots.length > this.options.maxSnapshots) {
      const removeCount = this.snapshots.length - this.options.maxSnapshots
      this.snapshots.splice(0, removeCount)
      this.currentIndex -= removeCount
    }

    // 持久化
    if (this.options.persist) {
      this.persist()
    }

    this.notifyListeners()
    return snapshot.id
  }

  /**
   * 回退到上一个快照
   *
   * @returns 上一个快照的路由位置，如果不能回退则返回 null
   */
  goBack(): RouteLocationNormalized | null {
    if (!this.canGoBack()) {
      return null
    }

    this.isTraveling = true
    this.currentIndex--
    this.notifyListeners()

    if (this.options.persist) {
      this.persist()
    }

    return this.getCurrentSnapshot()?.location ?? null
  }

  /**
   * 前进到下一个快照
   *
   * @returns 下一个快照的路由位置，如果不能前进则返回 null
   */
  goForward(): RouteLocationNormalized | null {
    if (!this.canGoForward()) {
      return null
    }

    this.isTraveling = true
    this.currentIndex++
    this.notifyListeners()

    if (this.options.persist) {
      this.persist()
    }

    return this.getCurrentSnapshot()?.location ?? null
  }

  /**
   * 跳转到指定快照
   *
   * @param snapshotId - 快照 ID
   * @returns 目标快照的路由位置，如果找不到则返回 null
   */
  goTo(snapshotId: string): RouteLocationNormalized | null {
    const index = this.snapshots.findIndex(s => s.id === snapshotId)
    if (index === -1) {
      return null
    }

    this.isTraveling = true
    this.currentIndex = index
    this.notifyListeners()

    if (this.options.persist) {
      this.persist()
    }

    return this.snapshots[index].location
  }

  /**
   * 跳转到指定索引
   *
   * @param index - 快照索引
   * @returns 目标快照的路由位置，如果索引无效则返回 null
   */
  goToIndex(index: number): RouteLocationNormalized | null {
    if (index < 0 || index >= this.snapshots.length) {
      return null
    }

    this.isTraveling = true
    this.currentIndex = index
    this.notifyListeners()

    if (this.options.persist) {
      this.persist()
    }

    return this.snapshots[index].location
  }

  /**
   * 获取当前快照
   */
  getCurrentSnapshot(): RouteSnapshot | null {
    return this.snapshots[this.currentIndex] ?? null
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): RouteSnapshot[] {
    return [...this.snapshots]
  }

  /**
   * 获取指定快照
   *
   * @param snapshotId - 快照 ID
   */
  getSnapshot(snapshotId: string): RouteSnapshot | null {
    return this.snapshots.find(s => s.id === snapshotId) ?? null
  }

  /**
   * 检查是否可以回退
   */
  canGoBack(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 检查是否可以前进
   */
  canGoForward(): boolean {
    return this.currentIndex < this.snapshots.length - 1
  }

  /**
   * 获取时间旅行状态
   */
  getState(): TimeTravelState {
    return {
      snapshots: [...this.snapshots],
      currentIndex: this.currentIndex,
      isTraveling: this.isTraveling,
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward(),
    }
  }

  /**
   * 添加状态变化监听器
   *
   * @param listener - 监听器函数
   * @returns 取消监听函数
   */
  subscribe(listener: TimeTravelListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 清除所有快照
   */
  clear(): void {
    this.snapshots = []
    this.currentIndex = -1
    this.isTraveling = false

    if (this.options.persist) {
      this.clearPersisted()
    }

    this.notifyListeners()
  }

  /**
   * 更新快照标签
   *
   * @param snapshotId - 快照 ID
   * @param label - 新标签
   */
  updateLabel(snapshotId: string, label: string): boolean {
    const snapshot = this.snapshots.find(s => s.id === snapshotId)
    if (!snapshot) {
      return false
    }

    snapshot.label = label

    if (this.options.persist) {
      this.persist()
    }

    return true
  }

  /**
   * 删除指定快照
   *
   * @param snapshotId - 快照 ID
   */
  removeSnapshot(snapshotId: string): boolean {
    const index = this.snapshots.findIndex(s => s.id === snapshotId)
    if (index === -1) {
      return false
    }

    this.snapshots.splice(index, 1)

    // 调整当前索引
    if (this.currentIndex >= index) {
      this.currentIndex = Math.max(0, this.currentIndex - 1)
    }

    if (this.options.persist) {
      this.persist()
    }

    this.notifyListeners()
    return true
  }

  /**
   * 导出快照数据
   */
  export(): string {
    return JSON.stringify({
      snapshots: this.snapshots,
      currentIndex: this.currentIndex,
      version: 1,
    })
  }

  /**
   * 导入快照数据
   *
   * @param data - 导出的数据字符串
   */
  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (!Array.isArray(parsed.snapshots)) {
        return false
      }

      this.snapshots = parsed.snapshots
      this.currentIndex = parsed.currentIndex ?? this.snapshots.length - 1
      this.isTraveling = false

      if (this.options.persist) {
        this.persist()
      }

      this.notifyListeners()
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalSnapshots: number
    currentIndex: number
    oldestSnapshot: RouteSnapshot | null
    newestSnapshot: RouteSnapshot | null
    uniquePaths: number
    averageDuration: number
  } {
    const durations = this.snapshots
      .map(s => s.duration)
      .filter((d): d is number => d !== undefined)

    const uniquePaths = new Set(this.snapshots.map(s => s.location.path)).size

    return {
      totalSnapshots: this.snapshots.length,
      currentIndex: this.currentIndex,
      oldestSnapshot: this.snapshots[0] ?? null,
      newestSnapshot: this.snapshots[this.snapshots.length - 1] ?? null,
      uniquePaths,
      averageDuration:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
    }
  }

  /**
   * 生成快照 ID
   */
  private generateId(): string {
    return `snapshot_${Date.now()}_${++this.snapshotIdCounter}`
  }

  /**
   * 克隆路由位置
   */
  private cloneLocation(location: RouteLocationNormalized): RouteLocationNormalized {
    return {
      ...location,
      params: { ...location.params },
      query: { ...location.query },
      meta: { ...location.meta },
      matched: [...(location.matched || [])],
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach(listener => listener(state))
  }

  /**
   * 持久化到 sessionStorage
   */
  private persist(): void {
    try {
      const data = JSON.stringify({
        snapshots: this.snapshots.slice(-50), // 只持久化最近 50 个
        currentIndex: Math.min(this.currentIndex, 49),
      })
      sessionStorage.setItem(this.options.persistKey, data)
    } catch {
      // 忽略持久化错误
    }
  }

  /**
   * 从 sessionStorage 恢复
   */
  private restore(): void {
    try {
      const data = sessionStorage.getItem(this.options.persistKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.snapshots = parsed.snapshots ?? []
        this.currentIndex = parsed.currentIndex ?? -1
      }
    } catch {
      // 忽略恢复错误
    }
  }

  /**
   * 清除持久化数据
   */
  private clearPersisted(): void {
    try {
      sessionStorage.removeItem(this.options.persistKey)
    } catch {
      // 忽略清除错误
    }
  }
}

/**
 * 创建时间旅行管理器
 *
 * @param options - 配置选项
 * @returns 时间旅行管理器实例
 *
 * @example
 * ```typescript
 * const timeTravel = createTimeTravel({
 *   maxSnapshots: 50,
 *   persist: true,
 * })
 *
 * // 在路由守卫中添加快照
 * router.afterEach((to, from) => {
 *   timeTravel.snapshot(to, 'push')
 * })
 *
 * // 监听状态变化
 * timeTravel.subscribe((state) => {
 *   console.log('Current index:', state.currentIndex)
 * })
 * ```
 */
export function createTimeTravel(options?: TimeTravelOptions): TimeTravelManager {
  return new TimeTravelManager(options)
}
