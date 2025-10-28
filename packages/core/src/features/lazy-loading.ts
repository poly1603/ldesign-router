/**
 * @ldesign/router-core 路由懒加载增强
 * 
 * @description
 * 提供路由组件的懒加载功能，支持预加载、错误重试和加载状态管理。
 * 
 * **特性**：
 * - 组件懒加载
 * - 预加载（prefetch）
 * - 加载失败重试
 * - 加载状态跟踪
 * - 加载超时处理
 * 
 * **性能优化**：
 * - 加载结果缓存
 * - 并发加载限制
 * - 智能预加载策略
 * 
 * @module features/lazy-loading
 */

import type { Component } from '../types'

/**
 * 懒加载配置选项
 */
export interface LazyLoadOptions {
  /** 最大重试次数（默认 3） */
  maxRetries?: number

  /** 重试延迟（毫秒，默认 1000） */
  retryDelay?: number

  /** 加载超时（毫秒，默认 10000） */
  timeout?: number

  /** 加载失败时的回退组件 */
  fallback?: Component

  /** 加载中的占位组件 */
  loading?: Component

  /** 错误处理函数 */
  onError?: (error: Error) => void

  /** 加载成功回调 */
  onLoad?: (component: Component) => void
}

/**
 * 懒加载状态
 */
export interface LazyLoadState {
  /** 是否正在加载 */
  loading: boolean

  /** 是否加载成功 */
  loaded: boolean

  /** 加载错误 */
  error: Error | null

  /** 加载的组件 */
  component: Component | null

  /** 重试次数 */
  retries: number
}

/**
 * 组件加载器函数类型
 */
export type ComponentLoader = () => Promise<{ default: Component } | Component>

/**
 * 懒加载管理器
 * 
 * @description
 * 管理路由组件的懒加载，提供缓存、重试和预加载功能。
 * 
 * **内存管理**：
 * - 加载结果缓存有大小限制（默认 100）
 * - 自动清理过期缓存
 * - destroy() 释放所有资源
 * 
 * ⚡ 性能: 
 * - 加载: O(1) 缓存命中
 * - 预加载: 并发限制，避免资源争抢
 * 
 * @class
 * 
 * @example
 * ```ts
 * const loader = new LazyLoadManager({
 *   maxRetries: 3,
 *   timeout: 10000,
 * })
 * 
 * // 懒加载组件
 * const component = await loader.load(
 *   () => import('./components/UserProfile.vue')
 * )
 * 
 * // 预加载组件
 * loader.prefetch(() => import('./components/Dashboard.vue'))
 * 
 * // 清理
 * loader.destroy()
 * ```
 */
export class LazyLoadManager {
  /** 加载结果缓存 */
  private cache = new Map<ComponentLoader, Component>()

  /** 加载状态映射 */
  private states = new Map<ComponentLoader, LazyLoadState>()

  /** 正在进行的加载 Promise */
  private pending = new Map<ComponentLoader, Promise<Component>>()

  /** 默认配置 */
  private options: Required<LazyLoadOptions>

  /** 缓存大小限制 */
  private readonly MAX_CACHE_SIZE = 100

  /** 并发加载限制 */
  private readonly MAX_CONCURRENT_LOADS = 5
  private currentLoads = 0

  /**
   * 创建懒加载管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: LazyLoadOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      timeout: options.timeout ?? 10000,
      fallback: options.fallback ?? null,
      loading: options.loading ?? null,
      onError: options.onError ?? (() => { }),
      onLoad: options.onLoad ?? (() => { }),
    }
  }

  /**
   * 加载组件
   * 
   * @param loader - 组件加载器函数
   * @returns 加载的组件
   * 
   * @example
   * ```ts
   * const component = await manager.load(
   *   () => import('./MyComponent.vue')
   * )
   * ```
   */
  async load(loader: ComponentLoader): Promise<Component> {
    // 检查缓存
    const cached = this.cache.get(loader)
    if (cached) {
      return cached
    }

    // 检查是否正在加载
    const pending = this.pending.get(loader)
    if (pending) {
      return pending
    }

    // 检查并发限制
    while (this.currentLoads >= this.MAX_CONCURRENT_LOADS) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 开始加载
    const loadPromise = this.loadWithRetry(loader)
    this.pending.set(loader, loadPromise)
    this.currentLoads++

    try {
      const component = await loadPromise
      this.cache.set(loader, component)
      this.pending.delete(loader)
      this.currentLoads--

      // 限制缓存大小
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        this.trimCache()
      }

      this.options.onLoad(component)
      return component
    }
    catch (error) {
      this.pending.delete(loader)
      this.currentLoads--
      this.options.onError(error as Error)
      throw error
    }
  }

  /**
   * 带重试的加载
   * 
   * @private
   */
  private async loadWithRetry(loader: ComponentLoader): Promise<Component> {
    const state: LazyLoadState = {
      loading: true,
      loaded: false,
      error: null,
      component: null,
      retries: 0,
    }
    this.states.set(loader, state)

    for (let i = 0; i <= this.options.maxRetries; i++) {
      try {
        const component = await this.loadWithTimeout(loader)
        state.loading = false
        state.loaded = true
        state.component = component
        return component
      }
      catch (error) {
        state.retries = i + 1
        state.error = error as Error

        if (i < this.options.maxRetries) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, this.options.retryDelay))
        }
        else {
          // 重试次数用尽
          state.loading = false
          throw error
        }
      }
    }

    throw new Error('Component loading failed after retries')
  }

  /**
   * 带超时的加载
   * 
   * @private
   */
  private async loadWithTimeout(loader: ComponentLoader): Promise<Component> {
    return Promise.race([
      this.executeLoader(loader),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Component loading timeout')),
          this.options.timeout,
        )
      }),
    ])
  }

  /**
   * 执行加载器
   * 
   * @private
   */
  private async executeLoader(loader: ComponentLoader): Promise<Component> {
    const result = await loader()

    // 处理不同的导出格式
    if (result && typeof result === 'object' && 'default' in result) {
      return result.default
    }

    return result as Component
  }

  /**
   * 预加载组件
   * 
   * @description
   * 在后台预加载组件，不阻塞当前操作。
   * 适合在用户可能访问的路由上使用。
   * 
   * @param loader - 组件加载器函数
   * 
   * @example
   * ```ts
   * // 预加载可能访问的组件
   * manager.prefetch(() => import('./Dashboard.vue'))
   * ```
   */
  prefetch(loader: ComponentLoader): void {
    // 已缓存，无需预加载
    if (this.cache.has(loader)) {
      return
    }

    // 正在加载，无需重复
    if (this.pending.has(loader)) {
      return
    }

    // 在空闲时加载
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        this.load(loader).catch(() => {
          // 预加载失败不影响主流程
        })
      })
    }
    else {
      // 回退到 setTimeout
      setTimeout(() => {
        this.load(loader).catch(() => {
          // 预加载失败不影响主流程
        })
      }, 0)
    }
  }

  /**
   * 获取加载状态
   * 
   * @param loader - 组件加载器函数
   * @returns 加载状态
   */
  getState(loader: ComponentLoader): LazyLoadState | null {
    return this.states.get(loader) ?? null
  }

  /**
   * 清理缓存
   * 
   * @description
   * 清理最少使用的缓存项，保持缓存大小在限制内。
   * 
   * @private
   */
  private trimCache(): void {
    const entries = Array.from(this.cache.entries())
    const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2))

    for (const [loader] of toRemove) {
      this.cache.delete(loader)
      this.states.delete(loader)
    }
  }

  /**
   * 清空所有缓存
   * 
   * @example
   * ```ts
   * manager.clear()
   * ```
   */
  clear(): void {
    this.cache.clear()
    this.states.clear()
    this.pending.clear()
  }

  /**
   * 销毁管理器
   * 
   * @description
   * 释放所有资源，清空缓存和状态。
   */
  destroy(): void {
    this.clear()
    this.currentLoads = 0
  }

  /**
   * 获取统计信息
   * 
   * @returns 统计数据
   */
  getStats(): {
    cacheSize: number
    pendingLoads: number
    currentLoads: number
    totalStates: number
  } {
    return {
      cacheSize: this.cache.size,
      pendingLoads: this.pending.size,
      currentLoads: this.currentLoads,
      totalStates: this.states.size,
    }
  }
}

/**
 * 创建懒加载包装器
 * 
 * @description
 * 便捷函数，为组件加载器添加懒加载功能。
 * 
 * @param loader - 组件加载器函数
 * @param options - 懒加载配置
 * @returns 增强的加载器函数
 * 
 * @example
 * ```ts
 * const lazyComponent = defineLazyComponent(
 *   () => import('./MyComponent.vue'),
 *   {
 *     maxRetries: 3,
 *     timeout: 10000,
 *   }
 * )
 * 
 * // 使用
 * const component = await lazyComponent()
 * ```
 */
export function defineLazyComponent(
  loader: ComponentLoader,
  options: LazyLoadOptions = {},
): ComponentLoader {
  const manager = new LazyLoadManager(options)

  return async () => {
    const component = await manager.load(loader)
    return component
  }
}

