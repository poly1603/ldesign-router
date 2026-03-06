/**
 * RouteSerializer - 路由状态序列化/反序列化
 *
 * 用于 URL 分享、状态持久化等场景
 *
 * @module utils/route-serializer
 */

import type { RouteLocationNormalized, RouteQuery, RouteParams } from '../types'

export interface SerializedRoute {
  path: string
  name?: string
  params?: Record<string, string>
  query?: Record<string, string | string[]>
  hash?: string
  meta?: Record<string, unknown>
}

export interface RouteSerializerOptions {
  /** 是否包含 meta 数据 */
  includeMeta?: boolean
  /** 是否包含 hash */
  includeHash?: boolean
  /** 自定义编码函数 */
  encode?: (data: string) => string
  /** 自定义解码函数 */
  decode?: (data: string) => string
}

/**
 * 路由序列化器
 *
 * @example
 * ```typescript
 * const serializer = createRouteSerializer()
 *
 * // 序列化当前路由到字符串
 * const encoded = serializer.serialize(router.currentRoute)
 *
 * // 从字符串反序列化
 * const route = serializer.deserialize(encoded)
 * router.push(route)
 *
 * // 生成可分享的 URL
 * const shareUrl = serializer.toShareableURL(router.currentRoute, 'https://example.com')
 * ```
 */
export class RouteSerializer {
  private options: Required<RouteSerializerOptions>

  constructor(options: RouteSerializerOptions = {}) {
    this.options = {
      includeMeta: options.includeMeta ?? false,
      includeHash: options.includeHash ?? true,
      encode: options.encode ?? ((data: string) => btoa(encodeURIComponent(data))),
      decode: options.decode ?? ((data: string) => decodeURIComponent(atob(data))),
    }
  }

  /** 将路由序列化为 JSON 对象 */
  toJSON(route: RouteLocationNormalized): SerializedRoute {
    const serialized: SerializedRoute = {
      path: route.path,
    }

    if (route.name) {
      serialized.name = String(route.name)
    }

    if (route.params && Object.keys(route.params).length > 0) {
      serialized.params = { ...route.params } as Record<string, string>
    }

    if (route.query && Object.keys(route.query).length > 0) {
      serialized.query = { ...route.query } as Record<string, string | string[]>
    }

    if (this.options.includeHash && route.hash) {
      serialized.hash = route.hash
    }

    if (this.options.includeMeta && route.meta && Object.keys(route.meta).length > 0) {
      serialized.meta = { ...route.meta }
    }

    return serialized
  }

  /** 从 JSON 对象恢复路由 */
  fromJSON(data: SerializedRoute): Partial<RouteLocationNormalized> {
    return {
      path: data.path,
      name: data.name,
      params: (data.params || {}) as RouteParams,
      query: (data.query || {}) as RouteQuery,
      hash: data.hash || '',
      meta: data.meta || {},
    }
  }

  /** 序列化为紧凑字符串 */
  serialize(route: RouteLocationNormalized): string {
    const json = this.toJSON(route)
    const jsonStr = JSON.stringify(json)
    return this.options.encode(jsonStr)
  }

  /** 从紧凑字符串反序列化 */
  deserialize(encoded: string): Partial<RouteLocationNormalized> {
    try {
      const jsonStr = this.options.decode(encoded)
      const data = JSON.parse(jsonStr) as SerializedRoute
      return this.fromJSON(data)
    } catch {
      throw new Error(`Failed to deserialize route: invalid data`)
    }
  }

  /** 生成可分享的 URL（将路由状态编码到 query 参数中） */
  toShareableURL(route: RouteLocationNormalized, baseURL: string): string {
    const encoded = this.serialize(route)
    const url = new URL(baseURL)
    url.searchParams.set('_route', encoded)
    return url.toString()
  }

  /** 从可分享的 URL 中提取路由状态 */
  fromShareableURL(url: string): Partial<RouteLocationNormalized> | null {
    try {
      const urlObj = new URL(url)
      const encoded = urlObj.searchParams.get('_route')
      if (!encoded) return null
      return this.deserialize(encoded)
    } catch {
      return null
    }
  }

  /** 将路由转为完整的 fullPath 字符串 */
  toFullPath(route: SerializedRoute): string {
    let fullPath = route.path

    if (route.query && Object.keys(route.query).length > 0) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(route.query)) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.set(key, value)
        }
      }
      fullPath += `?${params.toString()}`
    }

    if (route.hash) {
      fullPath += route.hash.startsWith('#') ? route.hash : `#${route.hash}`
    }

    return fullPath
  }
}

/**
 * 创建路由序列化器
 */
export function createRouteSerializer(options?: RouteSerializerOptions): RouteSerializer {
  return new RouteSerializer(options)
}
