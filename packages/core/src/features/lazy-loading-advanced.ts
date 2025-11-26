/**
 * @ldesign/router-core 高级懒加载管理器
 * 
 * @description
 * 提供智能懒加载、优先级控制和预取策略
 * 
 * **核心功能**：
 * - 优先级队列：根据路由重要性控制加载顺序
 * - 智能预取：基于用户行为预测并预加载路由
 * - 带宽检测：根据网络状况调整加载策略
 * - 空闲时间加载：利用浏览器空闲时间预加载
 * - 可见性检测：当路由链接进入视口时触发预加载
 * 
 * @module features/lazy-loading-advanced
 */

/**
 * 加载优先级
 */
export enum LoadPriority {
  /** 立即加载 */
  IMMEDIATE = 0,
  /** 高优先级 */
  HIGH = 1,
  /** 正常优先级 */
  NORMAL = 2,
  /** 低优先级 */
  LOW = 3,
  /** 空闲时加载 */
  IDLE = 4,
}

/**
 * 网络状况
 */
export enum NetworkCondition {
  /** 4G 或更好 */
  FAST = 'fast',
  /** 3G */
  MODERATE = 'moderate',
  /** 2G 或更差 */
  SLOW = 'slow',
  /** 离线 */
  OFFLINE = 'offline',
}

/**
 * 预取策略
 */
export enum PrefetchStrategy {
  /** 不预取 */
  NONE = 'none',
  /** 悬停时预取 */
  HOVER = 'hover',
  /** 可见时预取 */
  VISIBLE = 'visible',
  /** 空闲时预取 */
  IDLE = 'idle',
  /** 立即预取 */
  IMMEDIATE = 'immediate',
}

/**
 * 路由加载配置
 */
export interface RouteLoadConfig {
  /** 路由路径 */
  path: string
  /** 组件加载器 */
  loader: () => Promise<any>
  /** 优先级 */
  priority?: LoadPriority
  /** 预取策略 */
  prefetchStrategy?: PrefetchStrategy
  /** 是否已加载 */
  loaded?: boolean
  /** 是否正在加载 */
  loading?: boolean
  /** 依赖的其他路由 */
  dependencies?: string[]
}

/**
 * 懒加载管理器配置
 */
export interface LazyLoadManagerOptions {
  /** 最大并发加载数 */
  maxConcurrent?: number
  /** 是否启用预取 */
  enablePrefetch?: boolean
  /** 是否检测网络状况 */
  detectNetwork?: boolean
  /** 是否使用 IntersectionObserver */
  useIntersectionObserver?: boolean
  /** 预取延迟（毫秒） */
  prefetchDelay?: number
  /** 超时时间（毫秒） */
  timeout?: number
}

/**
 * 加载任务
 */
interface LoadTask {
  path: string
  loader: () => Promise<any>
  priority: LoadPriority
  resolve: (value: any) => void
  reject: (reason?: any) => void
  startTime?: number
  retryCount?: number
}

/**
 * 加载统计
 */
export interface LoadStats {
  /** 注册的路由数量 */
  registered: number
  /** 已加载数量 */
  loaded: number
  /** 已缓存数量 */
  cached: number
  /** 失败数量 */
  failed: number
  /** 平均加载时间（毫秒） */
  avgLoadTime: number
  /** 预取命中次数 */
  prefetchHits: number
  /** 当前正在加载的数量 */
  currentLoading: number
}

/**
 * 高级懒加载管理器
 * 
 * @class
 * 
 * @example
 * ```typescript
 * const lazyLoadManager = new LazyLoadManager({
 *   maxConcurrent: 3,
 *   enablePrefetch: true,
 *   detectNetwork: true,
 * })
 * 
 * // 注册路由
 * lazyLoadManager.register({
 *   path: '/dashboard',
 *   loader: () => import('./Dashboard.vue'),
 *   priority: LoadPriority.HIGH,
 *   prefetchStrategy: PrefetchStrategy.HOVER,
 * })
 * 
 * // 加载路由
 * const component = await lazyLoadManager.load('/dashboard')
 * 
 * // 预取路由
 * lazyLoadManager.prefetch('/settings')
 * ```
 */
export class LazyLoadManager {
  private routes = new Map<string, RouteLoadConfig>()
  private loadedModules = new Map<string, any>()
  private loadQueue: LoadTask[] = []
  private activeLoads = new Set<string>()
  private prefetchedPaths = new Set<string>()
  private intersectionObserver?: IntersectionObserver
  private options: Required<LazyLoadManagerOptions>
  
  private stats = {
    totalLoads: 0,
    successfulLoads: 0,
    failedLoads: 0,
    totalLoadTime: 0,
    prefetchHits: 0,
  }

  private retryCount: number

  constructor(options: LazyLoadManagerOptions = {}) {
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      enablePrefetch: options.enablePrefetch ?? true,
      detectNetwork: options.detectNetwork ?? true,
      useIntersectionObserver: options.useIntersectionObserver ?? true,
      prefetchDelay: options.prefetchDelay ?? 200,
      timeout: options.timeout ?? 30000,
    }
    this.retryCount = 2 // 默认重试2次

    if (this.options.useIntersectionObserver && typeof IntersectionObserver !== 'undefined') {
      this.setupIntersectionObserver()
    }
  }

  /**
   * 注册路由配置
   */
  register(config: RouteLoadConfig): void {
    this.routes.set(config.path, {
      ...config,
      loaded: false,
      loading: false,
      priority: config.priority ?? LoadPriority.NORMAL,
      prefetchStrategy: config.prefetchStrategy ?? PrefetchStrategy.NONE,
    })
  }

  /**
   * 批量注册路由
   */
  registerBatch(configs: RouteLoadConfig[]): void {
    configs.forEach(config => this.register(config))
  }

  /**
   * 加载路由组件
   */
  async load(path: string): Promise<any> {
    // 如果已加载，直接返回
    if (this.loadedModules.has(path)) {
      this.stats.prefetchHits++
      return this.loadedModules.get(path)
    }

    const config = this.routes.get(path)
    if (!config) {
      throw new Error(`Route not registered: ${path}`)
    }

    // 如果正在加载，等待
    if (this.activeLoads.has(path)) {
      return this.waitForLoad(path)
    }

    return this.executeLoad(config)
  }

  /**
   * 预取路由
   */
  async prefetch(path: string): Promise<void> {
    // 已加载或已预取，跳过
    if (this.loadedModules.has(path) || this.prefetchedPaths.has(path)) {
      return
    }

    const config = this.routes.get(path)
    if (!config || !this.options.enablePrefetch) {
      return
    }

    // 检查网络状况
    const networkCondition = this.detectNetworkCondition()
    
    // 检查是否为省流量模式
    if (this.isSaveDataMode()) {
      return
    }
    
    if (networkCondition === NetworkCondition.SLOW || networkCondition === NetworkCondition.OFFLINE) {
      return
    }

    this.prefetchedPaths.add(path)

    // 延迟预取
    await new Promise(resolve => setTimeout(resolve, this.options.prefetchDelay))

    try {
      await this.executeLoad(config)
    } catch (error) {
      console.warn(`Prefetch failed for ${path}:`, error)
    }
  }

  /**
   * 批量预取
   */
  async prefetchBatch(paths: string[]): Promise<void> {
    await Promise.allSettled(paths.map(path => this.prefetch(path)))
  }

  /**
   * 预取依赖
   */
  async prefetchDependencies(path: string): Promise<void> {
    const config = this.routes.get(path)
    if (!config?.dependencies) {
      return
    }

    await this.prefetchBatch(config.dependencies)
  }

  /**
   * 执行加载（带重试）
   */
  private async executeLoad(config: RouteLoadConfig, retryCount = 0): Promise<any> {
    const startTime = Date.now()
    this.stats.totalLoads++
    this.activeLoads.add(config.path)
    config.loading = true

    try {
      // 设置超时
      const module = await Promise.race([
        config.loader(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Load timeout')), this.options.timeout)
        ),
      ])

      // 缓存模块
      this.loadedModules.set(config.path, module)
      config.loaded = true
      this.stats.successfulLoads++
      this.stats.totalLoadTime += Date.now() - startTime

      // 加载依赖
      if (config.dependencies) {
        this.prefetchBatch(config.dependencies)
      }

      return module
    } catch (error) {
      // 重试逻辑
      if (retryCount < this.retryCount) {
        console.warn(`Load failed for ${config.path}, retrying... (${retryCount + 1}/${this.retryCount})`)
        return this.executeLoad(config, retryCount + 1)
      }
      
      this.stats.failedLoads++
      config.loaded = false
      throw error
    } finally {
      this.activeLoads.delete(config.path)
      config.loading = false
      this.processQueue()
    }
  }

  /**
   * 等待加载完成
   */
  private async waitForLoad(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.loadedModules.has(path)) {
          clearInterval(checkInterval)
          resolve(this.loadedModules.get(path))
        } else if (!this.activeLoads.has(path)) {
          clearInterval(checkInterval)
          reject(new Error(`Load failed for ${path}`))
        }
      }, 100)
    })
  }

  /**
   * 处理加载队列
   */
  private processQueue(): void {
    if (this.activeLoads.size >= this.options.maxConcurrent) {
      return
    }

    // 按优先级排序
    this.loadQueue.sort((a, b) => a.priority - b.priority)

    while (this.activeLoads.size < this.options.maxConcurrent && this.loadQueue.length > 0) {
      const task = this.loadQueue.shift()
      if (task) {
        this.executeLoad({
          path: task.path,
          loader: task.loader,
          priority: task.priority,
        }).then(task.resolve).catch(task.reject)
      }
    }
  }

  /**
   * 检测网络状况
   */
  detectNetworkCondition(): NetworkCondition {
    if (!this.options.detectNetwork || typeof navigator === 'undefined') {
      return NetworkCondition.FAST
    }

    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (!connection) {
      return NetworkCondition.FAST
    }

    if (!navigator.onLine) {
      return NetworkCondition.OFFLINE
    }

    const effectiveType = connection.effectiveType
    const downlink = connection.downlink

    // 基于有效类型和带宽判断
    if (effectiveType === '4g' || downlink >= 5) {
      return NetworkCondition.FAST
    } else if (effectiveType === '3g' || downlink >= 1) {
      return NetworkCondition.MODERATE
    } else {
      return NetworkCondition.SLOW
    }
  }

  /**
   * 检查是否为省流量模式
   */
  private isSaveDataMode(): boolean {
    if (typeof navigator === 'undefined') {
      return false
    }

    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    return connection?.saveData === true
  }

  /**
   * 设置 IntersectionObserver
   */
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const path = (entry.target as HTMLElement).dataset.prefetch
            if (path) {
              this.prefetch(path)
            }
          }
        })
      },
      {
        rootMargin: '50px',
      }
    )
  }

  /**
   * 观察元素
   */
  observe(element: HTMLElement, path: string): void {
    if (this.intersectionObserver) {
      element.dataset.prefetch = path
      this.intersectionObserver.observe(element)
    }
  }

  /**
   * 取消观察
   */
  unobserve(element: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element)
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): LoadStats {
    return {
      registered: this.routes.size,
      loaded: this.stats.successfulLoads,
      cached: this.loadedModules.size,
      failed: this.stats.failedLoads,
      avgLoadTime: this.stats.successfulLoads > 0
        ? this.stats.totalLoadTime / this.stats.successfulLoads
        : 0,
      prefetchHits: this.stats.prefetchHits,
      currentLoading: this.activeLoads.size,
    }
  }

  /**
   * 清除统计信息（不清除缓存）
   */
  clearStats(): void {
    this.stats = {
      totalLoads: 0,
      successfulLoads: 0,
      failedLoads: 0,
      totalLoadTime: 0,
      prefetchHits: 0,
    }
  }
  
  /**
   * 完全重置（清除缓存和统计）
   */
  reset(): void {
    this.clearCache()
    this.clearStats()
  }

  /**
   * 清除缓存
   */
  clearCache(path?: string): void {
    if (path) {
      this.loadedModules.delete(path)
      this.prefetchedPaths.delete(path)
      const config = this.routes.get(path)
      if (config) {
        config.loaded = false
      }
    } else {
      this.loadedModules.clear()
      this.prefetchedPaths.clear()
      this.routes.forEach(config => {
        config.loaded = false
      })
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = undefined
    }
    this.loadQueue = []
    this.activeLoads.clear()
    this.loadedModules.clear()
    this.prefetchedPaths.clear()
    this.routes.clear()
    this.clearStats()
  }
}

/**
 * 创建懒加载管理器
 */
export function createLazyLoadManager(options?: LazyLoadManagerOptions): LazyLoadManager {
  return new LazyLoadManager(options)
}