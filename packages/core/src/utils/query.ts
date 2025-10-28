/**
 * @ldesign/router-core 查询参数处理工具
 * 
 * @module utils/query
 */

import type { RouteQuery } from '../types'

/**
 * 解析查询字符串
 * 
 * 将 URL 查询字符串解析为键值对对象，支持数组参数。
 * 自动处理 URL 编码的参数。
 * 
 * ⚡ 性能: O(n)，n 为查询参数数量
 * 
 * @param queryString - 查询字符串（可包含或不包含前导 ?）
 * @returns 解析后的查询参数对象
 * 
 * @example
 * ```ts
 * // 基础用法
 * parseQuery('name=john&age=30')
 * // => { name: 'john', age: '30' }
 * 
 * // 数组参数（相同键名多次出现）
 * parseQuery('tags=vue&tags=router&tags=ts')
 * // => { tags: ['vue', 'router', 'ts'] }
 * 
 * // URL 编码处理
 * parseQuery('name=john%20doe&message=hello%20world')
 * // => { name: 'john doe', message: 'hello world' }
 * 
 * // 带前导 ?
 * parseQuery('?search=vue&page=1')
 * // => { search: 'vue', page: '1' }
 * 
 * // 空字符串
 * parseQuery('')
 * // => {}
 * ```
 */
export function parseQuery(queryString: string): RouteQuery {
  const query: RouteQuery = {}

  if (!queryString || queryString === '') {
    return query
  }

  // 移除开头的 ?
  if (queryString.startsWith('?')) {
    queryString = queryString.slice(1)
  }

  const pairs = queryString.split('&')

  for (const pair of pairs) {
    if (!pair) continue

    const [key, value = ''] = pair.split('=')
    const decodedKey = decodeURIComponent(key)
    const decodedValue = decodeURIComponent(value)

    // 处理数组参数
    if (decodedKey in query) {
      const existing = query[decodedKey]
      if (Array.isArray(existing)) {
        existing.push(decodedValue)
      }
      else if (existing !== null && existing !== undefined) {
        query[decodedKey] = [existing, decodedValue]
      }
    }
    else {
      query[decodedKey] = decodedValue
    }
  }

  return query
}

/**
 * 序列化查询参数
 * 
 * 将查询参数对象序列化为 URL 查询字符串，自动处理数组参数和 URL 编码。
 * 过滤 null 和 undefined 值。
 * 
 * ⚡ 性能: O(n)，n 为查询参数数量
 * 
 * @param query - 查询参数对象
 * @returns 序列化后的查询字符串（不包含前导 ?）
 * 
 * @example
 * ```ts
 * // 基础用法
 * stringifyQuery({ name: 'john', age: '30' })
 * // => 'name=john&age=30'
 * 
 * // 数组参数
 * stringifyQuery({ tags: ['vue', 'router', 'ts'] })
 * // => 'tags=vue&tags=router&tags=ts'
 * 
 * // URL 编码处理
 * stringifyQuery({ name: 'john doe', message: 'hello world' })
 * // => 'name=john%20doe&message=hello%20world'
 * 
 * // 过滤空值
 * stringifyQuery({ name: 'john', age: null, active: undefined })
 * // => 'name=john'
 * 
 * // 空对象
 * stringifyQuery({})
 * // => ''
 * ```
 */
export function stringifyQuery(query: RouteQuery): string {
  const pairs: string[] = []

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue
    }

    const encodedKey = encodeURIComponent(key)

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined) {
          pairs.push(`${encodedKey}=${encodeURIComponent(item)}`)
        }
      }
    }
    else {
      pairs.push(`${encodedKey}=${encodeURIComponent(value)}`)
    }
  }

  return pairs.length > 0 ? pairs.join('&') : ''
}

/**
 * 合并查询参数
 * 
 * 合并多个查询参数对象，后面的对象会覆盖前面的同名参数。
 * 忽略 null 和 undefined 值。
 * 
 * ⚡ 性能: O(n*m)，n 为对象数量，m 为平均参数数量
 * 
 * @param queries - 要合并的查询参数对象（可变参数）
 * @returns 合并后的查询参数对象
 * 
 * @example
 * ```ts
 * // 合并两个对象
 * mergeQuery(
 *   { page: '1', sort: 'desc' },
 *   { page: '2', limit: '20' }
 * )
 * // => { page: '2', sort: 'desc', limit: '20' }
 * 
 * // 合并多个对象
 * mergeQuery(
 *   { a: '1' },
 *   { b: '2' },
 *   { c: '3' }
 * )
 * // => { a: '1', b: '2', c: '3' }
 * 
 * // 忽略空值
 * mergeQuery(
 *   { name: 'john', age: '30' },
 *   { age: null }
 * )
 * // => { name: 'john', age: '30' }
 * ```
 */
export function mergeQuery(...queries: RouteQuery[]): RouteQuery {
  const result: RouteQuery = {}

  for (const query of queries) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        result[key] = value
      }
    }
  }

  return result
}

/**
 * 标准化查询参数
 * 
 * 将任意类型的查询参数对象标准化为字符串值。
 * 保留 null 和 undefined 值，数组元素转为字符串。
 * 
 * ⚡ 性能: O(n)，n 为参数数量
 * 
 * @param query - 原始查询参数对象（支持任意类型）
 * @returns 标准化后的查询参数对象（字符串或字符串数组）
 * 
 * @example
 * ```ts
 * // 数字转字符串
 * normalizeQuery({ page: 1, limit: 20 })
 * // => { page: '1', limit: '20' }
 * 
 * // 布尔值转字符串
 * normalizeQuery({ active: true, disabled: false })
 * // => { active: 'true', disabled: 'false' }
 * 
 * // 数组元素转字符串
 * normalizeQuery({ ids: [1, 2, 3] })
 * // => { ids: ['1', '2', '3'] }
 * 
 * // 保留空值
 * normalizeQuery({ name: 'john', age: null, active: undefined })
 * // => { name: 'john', age: null, active: undefined }
 * ```
 */
export function normalizeQuery(query: Record<string, unknown>): RouteQuery {
  const normalized: RouteQuery = {}

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      normalized[key] = value
    }
    else if (Array.isArray(value)) {
      normalized[key] = value.map(v => String(v))
    }
    else {
      normalized[key] = String(value)
    }
  }

  return normalized
}

