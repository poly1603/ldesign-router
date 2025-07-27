import type { Component } from 'vue'
import { reactive } from 'vue'
import type { CacheConfig, CacheItem, Route } from '../types'

/**
 * 缓存管理器
 * 负责管理路由组件的缓存策略
 */
export class CacheManager {
  private _cacheMap = new Map<string, CacheItem>()
  private _accessOrder: string[] = []

  private config = reactive<Required<CacheConfig>>({
    enabled: true,
    max: 10,
    strategy: 'lru',
    ttl: 300000, // 5分钟
    storage: 'memory',
  })

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: CacheConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializeCache()
  }

  /**
   * 初始化缓存
   */
  private initializeCache(): void {
    if (!this.config.enabled)
return

    // 从存储中恢复缓存（如果配置了持久化存储）
    if (this.config.storage !== 'memory') {
      this.loadFromStorage()
    }

    // 设置定时清理过期缓存
    if (this.config.ttl > 0) {
      setInterval(() => {
        this.cleanExpiredCache()
      }, this.config.ttl / 2)
    }
  }

  /**
   * 处理路由变化
   * @param route 新路由
   */
  handleRouteChange(route: Route): void {
    if (!this.config.enabled)
return

    const cacheKey = this.getCacheKey(route)

    // 更新访问顺序
    this.updateAccessOrder(cacheKey)

    // 检查是否需要缓存当前路由
    if (this.shouldCache(route)) {
      this.addToCache(route)
    }
  }

  /**
   * 添加到缓存
   * @param route 路由信息
   */
  private addToCache(route: Route): void {
    const cacheKey = this.getCacheKey(route)

    // 检查缓存大小限制
    if (this._cacheMap.size >= this.config.max) {
      this.evictCache()
    }

    const cacheItem: CacheItem = {
      key: cacheKey,
      component: route.matched[route.matched.length - 1]?.component as Component,
      timestamp: Date.now(),
      accessCount: 1,
      size: this.estimateComponentSize(route),
    }

    this._cacheMap.set(cacheKey, cacheItem)
    this.saveToStorage()
  }

  /**
   * 从缓存中移除
   * @param cacheKey 缓存键
   */
  removeFromCache(cacheKey: string): void {
    this._cacheMap.delete(cacheKey)

    const index = this._accessOrder.indexOf(cacheKey)
    if (index > -1) {
      this._accessOrder.splice(index, 1)
    }

    this.saveToStorage()
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this._cacheMap.clear()
    this._accessOrder = []
    this.saveToStorage()
  }

  /**
   * 获取缓存项
   * @param cacheKey 缓存键
   * @returns 缓存项
   */
  getCacheItem(cacheKey: string): CacheItem | undefined {
    const item = this._cacheMap.get(cacheKey)
    if (item) {
      // 更新访问计数和时间
      item.accessCount++
      item.timestamp = Date.now()
      this.updateAccessOrder(cacheKey)
    }
    return item
  }

  /**
   * 检查是否应该缓存路由
   * @param route 路由信息
   * @returns 是否应该缓存
   */
  private shouldCache(route: Route): boolean {
    // 检查路由元信息中的缓存配置
    if (route.meta?.cache === false)
return false
    if (route.meta?.cache === true)
return true

    // 默认缓存策略
    return true
  }

  /**
   * 获取缓存键
   * @param route 路由信息
   * @returns 缓存键
   */
  private getCacheKey(route: Route): string {
    // 使用路由名称和参数生成缓存键
    const params = Object.keys(route.params).length > 0
      ? JSON.stringify(route.params)
      : ''
    return `${route.name}${params}`
  }

  /**
   * 更新访问顺序
   * @param cacheKey 缓存键
   */
  private updateAccessOrder(cacheKey: string): void {
    const index = this._accessOrder.indexOf(cacheKey)
    if (index > -1) {
      this._accessOrder.splice(index, 1)
    }
    this._accessOrder.push(cacheKey)
  }

  /**
   * 缓存淘汰
   */
  private evictCache(): void {
    if (this._accessOrder.length === 0)
return

    let keyToEvict: string

    switch (this.config.strategy) {
      case 'lru':
        // 最近最少使用
        keyToEvict = this._accessOrder[0]
        break
      case 'fifo':
        // 先进先出
        keyToEvict = this._accessOrder[0]
        break
      case 'custom':
        // 自定义策略（这里使用访问次数最少的）
        keyToEvict = this.findLeastAccessedKey()
        break
      default:
        keyToEvict = this._accessOrder[0]
    }

    this.removeFromCache(keyToEvict)
  }

  /**
   * 查找访问次数最少的缓存键
   * @returns 缓存键
   */
  private findLeastAccessedKey(): string {
    let minAccessCount = Infinity
    let keyToEvict = this._accessOrder[0]

    this._cacheMap.forEach((item, key) => {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount
        keyToEvict = key
      }
    })

    return keyToEvict
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now()
    const keysToRemove: string[] = []

    this._cacheMap.forEach((item, key) => {
      if (now - item.timestamp > this.config.ttl) {
        keysToRemove.push(key)
      }
    })

    keysToRemove.forEach(key => this.removeFromCache(key))
  }

  /**
   * 估算组件大小
   * @param route 路由信息
   * @returns 估算大小（字节）
   */
  private estimateComponentSize(route: Route): number {
    // 简单的大小估算，实际项目中可能需要更复杂的计算
    return JSON.stringify(route).length * 2
  }

  /**
   * 保存到存储
   */
  private saveToStorage(): void {
    if (this.config.storage === 'memory')
return

    try {
      const data = {
        cacheMap: Array.from(this._cacheMap.entries()),
        accessOrder: this._accessOrder,
      }

      const storage = this.config.storage === 'local' ? localStorage : sessionStorage
      storage.setItem('ldesign-router-cache', JSON.stringify(data))
    }
 catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  /**
   * 从存储加载
   */
  private loadFromStorage(): void {
    try {
      const storage = this.config.storage === 'local' ? localStorage : sessionStorage
      const data = storage.getItem('ldesign-router-cache')

      if (data) {
        const parsed = JSON.parse(data)
        this._cacheMap = new Map(parsed.cacheMap)
        this._accessOrder = parsed.accessOrder || []
      }
    }
 catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalSize: number
    enabled: boolean
  } {
    const totalSize = Array.from(this._cacheMap.values())
      .reduce((sum, item) => sum + item.size, 0)

    const totalAccess = Array.from(this._cacheMap.values())
      .reduce((sum, item) => sum + item.accessCount, 0)

    const hitRate = totalAccess > 0 ? (this._cacheMap.size / totalAccess) * 100 : 0

    return {
      size: this._cacheMap.size,
      maxSize: this.config.max,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSize,
      enabled: this.config.enabled,
    }
  }

  /**
   * 获取所有缓存键
   */
  getCacheKeys(): string[] {
    return Array.from(this._cacheMap.keys())
  }

  /**
   * 检查是否已缓存
   * @param cacheKey 缓存键
   * @returns 是否已缓存
   */
  isCached(cacheKey: string): boolean {
    return this._cacheMap.has(cacheKey)
  }
}
