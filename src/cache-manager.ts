import { ref, reactive, shallowRef, markRaw } from 'vue'
import type { CacheConfig, CacheItem, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class CacheManager {
  private _cachedComponents = new Map<string, CacheItem>()
  private _cacheKeys = ref<string[]>([])
  private _config = reactive<Required<CacheConfig>>({
    enabled: true,
    maxSize: 10,
    strategy: 'lru',
    include: [],
    exclude: [],
    storageKey: 'ldesign-router-cache'
  })

  constructor(
    private router: LDesignRouter,
    config?: CacheConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
    
    this.loadFromStorage()
  }

  get cachedComponents(): Map<string, CacheItem> {
    return this._cachedComponents
  }

  get cacheKeys(): string[] {
    return this._cacheKeys.value
  }

  get config(): Required<CacheConfig> {
    return this._config
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    // 缓存离开的组件
    if (from && this.shouldCache(from)) {
      this.cacheComponent(from)
    }

    // 检查是否需要清理缓存
    this.cleanupCache()
  }

  /**
   * 缓存组件
   */
  cacheComponent(route: RouteLocationNormalized): void {
    const key = this.getCacheKey(route)
    if (!key) return

    const existingItem = this._cachedComponents.get(key)
    if (existingItem) {
      // 更新访问时间
      existingItem.lastAccessed = Date.now()
      existingItem.accessCount++
    } else {
      // 创建新的缓存项
      const cacheItem: CacheItem = {
        key,
        route: { ...route },
        component: null, // 组件实例将在运行时设置
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        size: this.estimateSize(route)
      }

      this._cachedComponents.set(key, cacheItem)
      this._cacheKeys.value.push(key)
    }

    // 检查缓存大小限制
    this.enforceMaxSize()
    this.saveToStorage()
  }

  /**
   * 获取缓存的组件
   */
  getCachedComponent(route: RouteLocationNormalized): CacheItem | null {
    const key = this.getCacheKey(route)
    if (!key) return null

    const item = this._cachedComponents.get(key)
    if (item) {
      item.lastAccessed = Date.now()
      item.accessCount++
      return item
    }

    return null
  }

  /**
   * 移除缓存
   */
  removeCache(key: string): void {
    if (this._cachedComponents.has(key)) {
      this._cachedComponents.delete(key)
      const index = this._cacheKeys.value.indexOf(key)
      if (index !== -1) {
        this._cacheKeys.value.splice(index, 1)
      }
      this.saveToStorage()
    }
  }

  /**
   * 根据路由移除缓存
   */
  removeCacheByRoute(route: RouteLocationNormalized): void {
    const key = this.getCacheKey(route)
    if (key) {
      this.removeCache(key)
    }
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this._cachedComponents.clear()
    this._cacheKeys.value = []
    this.saveToStorage()
  }

  /**
   * 清空指定路径的缓存
   */
  clearCacheByPath(path: string): void {
    const keysToRemove: string[] = []
    
    this._cachedComponents.forEach((item, key) => {
      if (item.route.path === path) {
        keysToRemove.push(key)
      }
    })

    keysToRemove.forEach(key => this.removeCache(key))
  }

  /**
   * 清空匹配模式的缓存
   */
  clearCacheByPattern(pattern: RegExp): void {
    const keysToRemove: string[] = []
    
    this._cachedComponents.forEach((item, key) => {
      if (pattern.test(item.route.path) || pattern.test(key)) {
        keysToRemove.push(key)
      }
    })

    keysToRemove.forEach(key => this.removeCache(key))
  }

  /**
   * 刷新缓存
   */
  refreshCache(key: string): void {
    const item = this._cachedComponents.get(key)
    if (item) {
      // 重置组件实例
      item.component = null
      item.createdAt = Date.now()
      item.lastAccessed = Date.now()
      this.saveToStorage()
    }
  }

  /**
   * 根据路由刷新缓存
   */
  refreshCacheByRoute(route: RouteLocationNormalized): void {
    const key = this.getCacheKey(route)
    if (key) {
      this.refreshCache(key)
    }
  }

  /**
   * 检查是否应该缓存
   */
  shouldCache(route: RouteLocationNormalized): boolean {
    if (!this._config.enabled) return false

    // 检查路由元信息
    if (route.meta.cache === false) return false
    if (route.meta.cache === true) return true

    // 检查包含列表
    if (this._config.include.length > 0) {
      const routeName = route.name?.toString() || ''
      const routePath = route.path
      
      const isIncluded = this._config.include.some(pattern => {
        if (typeof pattern === 'string') {
          return routeName === pattern || routePath === pattern
        } else if (pattern instanceof RegExp) {
          return pattern.test(routeName) || pattern.test(routePath)
        }
        return false
      })
      
      if (!isIncluded) return false
    }

    // 检查排除列表
    if (this._config.exclude.length > 0) {
      const routeName = route.name?.toString() || ''
      const routePath = route.path
      
      const isExcluded = this._config.exclude.some(pattern => {
        if (typeof pattern === 'string') {
          return routeName === pattern || routePath === pattern
        } else if (pattern instanceof RegExp) {
          return pattern.test(routeName) || pattern.test(routePath)
        }
        return false
      })
      
      if (isExcluded) return false
    }

    return true
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalSize: number
    items: Array<{
      key: string
      path: string
      accessCount: number
      lastAccessed: Date
      size: number
    }>
  } {
    const items = Array.from(this._cachedComponents.values())
    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0)
    const totalHits = items.reduce((sum, item) => sum + (item.accessCount - 1), 0)
    
    return {
      size: this._cachedComponents.size,
      maxSize: this._config.maxSize,
      hitRate: totalAccess > 0 ? totalHits / totalAccess : 0,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      items: items.map(item => ({
        key: item.key,
        path: item.route.path,
        accessCount: item.accessCount,
        lastAccessed: new Date(item.lastAccessed),
        size: item.size
      }))
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CacheConfig>): void {
    Object.assign(this._config, config)
    
    // 如果禁用缓存，清空所有缓存
    if (!this._config.enabled) {
      this.clearCache()
    }
    
    // 如果最大大小减少，清理缓存
    this.enforceMaxSize()
  }

  /**
   * 预加载缓存
   */
  preloadCache(routes: RouteLocationNormalized[]): void {
    routes.forEach(route => {
      if (this.shouldCache(route)) {
        this.cacheComponent(route)
      }
    })
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(route: RouteLocationNormalized): string | null {
    // 优先使用路由元信息中的缓存键
    if (route.meta.cacheKey) {
      return route.meta.cacheKey
    }

    // 使用路由名称
    if (route.name) {
      return route.name.toString()
    }

    // 使用路径（去除动态参数）
    const path = route.path.replace(/\/:[^/]+/g, '')
    return path || null
  }

  /**
   * 估算缓存大小
   */
  private estimateSize(route: RouteLocationNormalized): number {
    // 简单的大小估算（可以根据实际需要调整）
    const baseSize = 1024 // 1KB 基础大小
    const pathSize = route.path.length * 2
    const querySize = Object.keys(route.query).length * 50
    const paramsSize = Object.keys(route.params).length * 50
    
    return baseSize + pathSize + querySize + paramsSize
  }

  /**
   * 强制执行最大大小限制
   */
  private enforceMaxSize(): void {
    while (this._cachedComponents.size > this._config.maxSize) {
      const keyToRemove = this.selectKeyForRemoval()
      if (keyToRemove) {
        this.removeCache(keyToRemove)
      } else {
        break
      }
    }
  }

  /**
   * 选择要移除的缓存键
   */
  private selectKeyForRemoval(): string | null {
    if (this._cachedComponents.size === 0) return null

    const items = Array.from(this._cachedComponents.entries())
    
    switch (this._config.strategy) {
      case 'lru': // 最近最少使用
        return items.reduce((oldest, [key, item]) => {
          const [oldestKey, oldestItem] = oldest
          return item.lastAccessed < oldestItem.lastAccessed ? [key, item] : oldest
        })[0]
        
      case 'lfu': // 最少使用频率
        return items.reduce((least, [key, item]) => {
          const [leastKey, leastItem] = least
          return item.accessCount < leastItem.accessCount ? [key, item] : least
        })[0]
        
      case 'fifo': // 先进先出
        return items.reduce((oldest, [key, item]) => {
          const [oldestKey, oldestItem] = oldest
          return item.createdAt < oldestItem.createdAt ? [key, item] : oldest
        })[0]
        
      default:
        return items[0][0]
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now()
    const maxAge = 30 * 60 * 1000 // 30分钟
    
    const keysToRemove: string[] = []
    
    this._cachedComponents.forEach((item, key) => {
      if (now - item.lastAccessed > maxAge) {
        keysToRemove.push(key)
      }
    })

    keysToRemove.forEach(key => this.removeCache(key))
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data = {
        keys: this._cacheKeys.value,
        timestamp: Date.now()
      }
      
      localStorage.setItem(this._config.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this._config.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        // 只恢复缓存键，组件实例需要重新创建
        this._cacheKeys.value = data.keys || []
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }

  /**
   * 获取响应式数据
   */
  useCache() {
    return {
      cacheKeys: computed(() => this._cacheKeys.value),
      cacheSize: computed(() => this._cachedComponents.size),
      config: computed(() => this._config),
      stats: computed(() => this.getCacheStats())
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.clearCache()
  }
}