/**
 * @ldesign/router-core SSR（服务端渲染）支持
 * 
 * @description
 * 提供服务端渲染场景下的路由功能支持。
 * 
 * **特性**：
 * - 服务端路由解析
 * - 状态序列化/反序列化
 * - 客户端激活（hydration）
 * - 路由数据预取
 * 
 * **使用场景**：
 * - Next.js / Nuxt.js 等 SSR 框架
 * - 服务端预渲染
 * - 静态站点生成（SSG）
 * 
 * @module features/ssr
 */

import type {
  RouteLocationNormalized,
  RouteQuery,
  RouteParams,
} from '../types'

/**
 * SSR 上下文
 * 
 * @description
 * 服务端渲染时的上下文信息
 */
export interface SSRContext {
  /** 请求 URL */
  url: string

  /** 请求路径 */
  path: string

  /** 查询参数 */
  query: RouteQuery

  /** 路由参数 */
  params: RouteParams

  /** 当前路由 */
  route?: RouteLocationNormalized

  /** 自定义数据 */
  [key: string]: unknown
}

/**
 * SSR 序列化状态
 */
export interface SSRState {
  /** 当前路由信息 */
  route: RouteLocationNormalized

  /** 预取的数据 */
  data?: Record<string, unknown>

  /** 时间戳 */
  timestamp: number
}

/**
 * SSR 路由管理器
 * 
 * @description
 * 管理 SSR 场景下的路由状态，支持服务端预渲染和客户端激活。
 * 
 * **工作流程**：
 * 1. 服务端：解析请求 URL，渲染对应组件
 * 2. 序列化：将路由状态序列化为 JSON
 * 3. 客户端：反序列化状态，激活路由
 * 
 * ⚡ 性能:
 * - 序列化: O(n)，n 为状态大小
 * - 反序列化: O(n)
 * 
 * @class
 * 
 * @example
 * ```ts
 * // 服务端
 * const ssrManager = new SSRManager()
 * const context = ssrManager.createContext('/user/123?tab=profile')
 * const serialized = ssrManager.serialize(route)
 * 
 * // 客户端
 * const state = ssrManager.deserialize(serialized)
 * router.replace(state.route)
 * ```
 */
export class SSRManager {
  /** 状态序列化ID（防止冲突） */
  private readonly STATE_KEY = '__ROUTER_SSR_STATE__'

  /**
   * 创建 SSR 上下文
   * 
   * @param url - 请求 URL
   * @returns SSR 上下文对象
   * 
   * @example
   * ```ts
   * const context = manager.createContext('/user/123?tab=profile')
   * // => {
   * //   url: '/user/123?tab=profile',
   * //   path: '/user/123',
   * //   query: { tab: 'profile' },
   * //   params: {}
   * // }
   * ```
   */
  createContext(url: string): SSRContext {
    // 解析 URL
    const urlObj = this.parseURL(url)

    return {
      url,
      path: urlObj.path,
      query: urlObj.query,
      params: {},
    }
  }

  /**
   * 序列化路由状态
   * 
   * @description
   * 将路由状态序列化为 JSON 字符串，可以嵌入 HTML。
   * 自动过滤不可序列化的数据（函数、Symbol 等）。
   * 
   * @param route - 路由位置对象
   * @param data - 额外的预取数据（可选）
   * @returns 序列化的 JSON 字符串
   * 
   * @example
   * ```ts
   * const serialized = manager.serialize(route, { user: userData })
   * // 在 HTML 中注入
   * `<script>window.${STATE_KEY} = ${serialized}</script>`
   * ```
   */
  serialize(
    route: RouteLocationNormalized,
    data?: Record<string, unknown>,
  ): string {
    const state: SSRState = {
      route: this.serializeRoute(route),
      data: data ? this.sanitizeData(data) : undefined,
      timestamp: Date.now(),
    }

    return JSON.stringify(state)
  }

  /**
   * 反序列化路由状态
   * 
   * @description
   * 从序列化的 JSON 字符串恢复路由状态。
   * 
   * @param serialized - 序列化的 JSON 字符串
   * @returns SSR 状态对象
   * 
   * @example
   * ```ts
   * const state = manager.deserialize(window.__ROUTER_SSR_STATE__)
   * router.replace(state.route)
   * ```
   */
  deserialize(serialized: string): SSRState {
    try {
      return JSON.parse(serialized) as SSRState
    }
    catch (error) {
      throw new Error(`Failed to deserialize SSR state: ${error}`)
    }
  }

  /**
   * 从 window 对象获取 SSR 状态
   * 
   * @description
   * 从全局 window 对象中读取服务端注入的路由状态。
   * 
   * @returns SSR 状态对象，如果不存在返回 null
   * 
   * @example
   * ```ts
   * const state = manager.getStateFromWindow()
   * if (state) {
   *   router.replace(state.route)
   * }
   * ```
   */
  getStateFromWindow(): SSRState | null {
    if (typeof window === 'undefined') {
      return null
    }

    const state = (window as any)[this.STATE_KEY]
    if (!state) {
      return null
    }

    try {
      return typeof state === 'string'
        ? this.deserialize(state)
        : state
    }
    catch {
      return null
    }
  }

  /**
   * 清理 window 中的 SSR 状态
   * 
   * @description
   * 激活后清理全局状态，避免内存泄漏。
   * 
   * @example
   * ```ts
   * const state = manager.getStateFromWindow()
   * if (state) {
   *   router.replace(state.route)
   *   manager.cleanupWindow()
   * }
   * ```
   */
  cleanupWindow(): void {
    if (typeof window !== 'undefined') {
      delete (window as any)[this.STATE_KEY]
    }
  }

  /**
   * 解析 URL（简化版）
   * 
   * @private
   */
  private parseURL(url: string): { path: string; query: RouteQuery } {
    const [path, queryString] = url.split('?')
    const query: RouteQuery = {}

    if (queryString) {
      const pairs = queryString.split('&')
      for (const pair of pairs) {
        const [key, value] = pair.split('=')
        if (key) {
          query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
        }
      }
    }

    return { path: path || '/', query }
  }

  /**
   * 序列化路由对象
   * 
   * @private
   */
  private serializeRoute(route: RouteLocationNormalized): RouteLocationNormalized {
    return {
      path: route.path,
      name: typeof route.name === 'symbol' ? undefined : route.name,
      params: route.params,
      query: route.query,
      hash: route.hash,
      fullPath: route.fullPath,
      matched: route.matched.map(record => ({
        ...record,
        // 移除不可序列化的字段
        components: {},
        beforeEnter: undefined,
      })),
      meta: this.sanitizeData(route.meta),
    }
  }

  /**
   * 清理数据（移除不可序列化的值）
   * 
   * @private
   */
  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      if (this.isSerializable(value)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          sanitized[key] = this.sanitizeData(value as Record<string, unknown>)
        }
        else {
          sanitized[key] = value
        }
      }
    }

    return sanitized
  }

  /**
   * 检查值是否可序列化
   * 
   * @private
   */
  private isSerializable(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true
    }

    const type = typeof value
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return true
    }

    if (Array.isArray(value)) {
      return true
    }

    if (type === 'object') {
      return true
    }

    return false
  }
}

/**
 * 创建 SSR 管理器实例
 * 
 * @returns SSR 管理器
 * 
 * @example
 * ```ts
 * const ssrManager = createSSRManager()
 * ```
 */
export function createSSRManager(): SSRManager {
  return new SSRManager()
}

