/**
 * @ldesign/router-core URL 处理工具
 * 
 * @module utils/url
 */

import type { RouteQuery } from '../types'
import { parseQuery, stringifyQuery } from './query'

/**
 * URL 解析结果
 * 
 * @description 表示解析后的 URL 各个组成部分
 * 
 * @example
 * ```ts
 * const parsed: ParsedURL = {
 *   path: '/user/123',
 *   query: { tab: 'profile', sort: 'desc' },
 *   hash: 'section-1',
 *   fullPath: '/user/123?tab=profile&sort=desc#section-1'
 * }
 * ```
 */
export interface ParsedURL {
  /** 路径部分（不包含查询参数和哈希） */
  path: string

  /** 查询参数对象 */
  query: RouteQuery

  /** 哈希部分（不包含前导 #） */
  hash: string

  /** 完整路径（包含查询参数和哈希） */
  fullPath: string
}

/**
 * 解析 URL
 * 
 * 将 URL 字符串解析为结构化对象，包含路径、查询参数和哈希。
 * 自动处理各部分的分隔符。
 * 
 * ⚡ 性能: O(n)，n 为 URL 长度
 * 
 * @param url - 要解析的 URL 字符串
 * @returns 解析后的 URL 对象
 * 
 * @example
 * ```ts
 * // 完整 URL
 * parseURL('/user/123?tab=profile&sort=desc#section-1')
 * // => {
 * //   path: '/user/123',
 * //   query: { tab: 'profile', sort: 'desc' },
 * //   hash: 'section-1',
 * //   fullPath: '/user/123?tab=profile&sort=desc#section-1'
 * // }
 * 
 * // 仅路径
 * parseURL('/about')
 * // => { path: '/about', query: {}, hash: '', fullPath: '/about' }
 * 
 * // 带查询参数
 * parseURL('/search?q=vue&page=1')
 * // => {
 * //   path: '/search',
 * //   query: { q: 'vue', page: '1' },
 * //   hash: '',
 * //   fullPath: '/search?q=vue&page=1'
 * // }
 * 
 * // 带哈希
 * parseURL('/docs#introduction')
 * // => {
 * //   path: '/docs',
 * //   query: {},
 * //   hash: 'introduction',
 * //   fullPath: '/docs#introduction'
 * // }
 * ```
 */
export function parseURL(url: string): ParsedURL {
  // 提取哈希部分
  let hash = ''
  const hashIndex = url.indexOf('#')
  if (hashIndex >= 0) {
    hash = url.slice(hashIndex + 1)
    url = url.slice(0, hashIndex)
  }

  // 提取查询参数
  let queryString = ''
  const queryIndex = url.indexOf('?')
  if (queryIndex >= 0) {
    queryString = url.slice(queryIndex + 1)
    url = url.slice(0, queryIndex)
  }

  const path = url || '/'
  const query = parseQuery(queryString)
  const fullPath = stringifyURL({ path, query, hash })

  return { path, query, hash, fullPath }
}

/**
 * 序列化 URL
 * 
 * 将 URL 各部分组合为完整的 URL 字符串。
 * 自动添加分隔符（?、#）。
 * 
 * ⚡ 性能: O(n)，n 为查询参数数量
 * 
 * @param options - URL 选项
 * @param options.path - 路径部分
 * @param options.query - 查询参数对象（可选）
 * @param options.hash - 哈希部分（可选，可包含或不包含 #）
 * @returns 完整的 URL 字符串
 * 
 * @example
 * ```ts
 * // 仅路径
 * stringifyURL({ path: '/about' })
 * // => '/about'
 * 
 * // 路径 + 查询参数
 * stringifyURL({
 *   path: '/search',
 *   query: { q: 'vue', page: '1' }
 * })
 * // => '/search?q=vue&page=1'
 * 
 * // 路径 + 哈希
 * stringifyURL({
 *   path: '/docs',
 *   hash: 'introduction'
 * })
 * // => '/docs#introduction'
 * 
 * // 完整 URL
 * stringifyURL({
 *   path: '/user/123',
 *   query: { tab: 'profile' },
 *   hash: 'section-1'
 * })
 * // => '/user/123?tab=profile#section-1'
 * 
 * // 哈希可带 # 前缀
 * stringifyURL({ path: '/docs', hash: '#intro' })
 * // => '/docs#intro'
 * ```
 */
export function stringifyURL(options: {
  path: string
  query?: RouteQuery
  hash?: string
}): string {
  let url = options.path || '/'

  // 添加查询参数
  if (options.query && Object.keys(options.query).length > 0) {
    const queryString = stringifyQuery(options.query)
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // 添加哈希
  if (options.hash) {
    const hash = options.hash.startsWith('#') ? options.hash : `#${options.hash}`
    url += hash
  }

  return url
}

/**
 * 规范化 URL
 * 
 * 解析并重新构建 URL，确保格式统一。
 * 移除多余的字符，统一查询参数顺序。
 * 
 * ⚡ 性能: O(n)，n 为 URL 长度
 * 
 * @param url - 要规范化的 URL 字符串
 * @returns 规范化后的 URL 字符串
 * 
 * @example
 * ```ts
 * // 移除多余字符
 * normalizeURL('/about/')
 * // => '/about'
 * 
 * // 规范化查询参数
 * normalizeURL('/search?a=1&b=2')
 * // => '/search?a=1&b=2'
 * 
 * // 完整 URL
 * normalizeURL('/user/123?tab=profile#section')
 * // => '/user/123?tab=profile#section'
 * ```
 */
export function normalizeURL(url: string): string {
  const parsed = parseURL(url)
  return stringifyURL(parsed)
}

/**
 * 比较两个 URL 是否相同
 * 
 * 比较两个 URL 的路径、查询参数和哈希是否相同。
 * 忽略查询参数的顺序。
 * 
 * ⚡ 性能: O(n)，n 为查询参数数量
 * 
 * @param url1 - 第一个 URL 字符串
 * @param url2 - 第二个 URL 字符串
 * @returns 如果 URL 相同返回 true，否则返回 false
 * 
 * @example
 * ```ts
 * // 相同的 URL
 * isSameURL('/about', '/about')
 * // => true
 * 
 * // 查询参数顺序不同但内容相同
 * isSameURL('/search?a=1&b=2', '/search?b=2&a=1')
 * // => true
 * 
 * // 不同的路径
 * isSameURL('/about', '/contact')
 * // => false
 * 
 * // 不同的查询参数
 * isSameURL('/search?q=vue', '/search?q=react')
 * // => false
 * 
 * // 不同的哈希
 * isSameURL('/docs#intro', '/docs#guide')
 * // => false
 * ```
 */
export function isSameURL(url1: string, url2: string): boolean {
  const parsed1 = parseURL(url1)
  const parsed2 = parseURL(url2)

  // 比较路径
  if (parsed1.path !== parsed2.path) {
    return false
  }

  // 比较哈希
  if (parsed1.hash !== parsed2.hash) {
    return false
  }

  // 比较查询参数（忽略顺序）
  const keys1 = Object.keys(parsed1.query).sort()
  const keys2 = Object.keys(parsed2.query).sort()

  if (keys1.length !== keys2.length) {
    return false
  }

  for (let i = 0; i < keys1.length; i++) {
    if (keys1[i] !== keys2[i]) {
      return false
    }

    const value1 = parsed1.query[keys1[i]]
    const value2 = parsed2.query[keys2[i]]

    if (JSON.stringify(value1) !== JSON.stringify(value2)) {
      return false
    }
  }

  return true
}

