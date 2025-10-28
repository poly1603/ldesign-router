/**
 * @ldesign/router-core 路径处理工具
 * 
 * @module utils/path
 */

import type { RouteParams } from '../types'

/**
 * 标准化路径
 * 
 * 将路径规范化为标准格式：
 * - 确保以 / 开头
 * - 移除多余的斜杠
 * - 移除末尾斜杠（根路径除外）
 * - 处理相对路径符号（. 和 ..）
 * 
 * @param path - 要规范化的路径
 * @returns 规范化后的路径
 */
export function normalizePath(path: string): string {
  if (typeof path !== 'string') {
    throw new TypeError('路径必须是字符串类型')
  }

  if (!path || path === '') {
    return '/'
  }

  // 移除多余的斜杠
  path = path.replace(/\/+/g, '/')

  // 确保以斜杠开头
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  // 移除末尾斜杠（除了根路径）
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  // 处理相对路径符号
  const segments = path.split('/').filter(Boolean)
  const normalizedSegments: string[] = []

  for (const segment of segments) {
    if (segment === '..') {
      if (normalizedSegments.length > 0) {
        normalizedSegments.pop()
      }
    }
    else if (segment !== '.') {
      normalizedSegments.push(segment)
    }
  }

  return normalizedSegments.length === 0 ? '/' : `/${normalizedSegments.join('/')}`
}

/**
 * 连接多个路径段
 * 
 * @param paths - 路径段数组
 * @returns 连接后的路径
 */
export function joinPaths(...paths: string[]): string {
  return normalizePath(paths.filter(Boolean).join('/'))
}

/**
 * 解析路径参数
 * 
 * 从实际路径中提取参数值，基于路径模式
 * 
 * @param pattern - 路径模式（如 '/user/:id'）
 * @param path - 实际路径（如 '/user/123'）
 * @returns 参数对象（如 { id: '123' }）
 */
export function parsePathParams(pattern: string, path: string): RouteParams {
  const params: RouteParams = {}
  const patternSegments = pattern.split('/')
  const pathSegments = path.split('/')

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment && patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1).replace(/\?$/, '')
      if (pathSegment !== undefined) {
        params[paramName] = decodeURIComponent(pathSegment)
      }
    }
  }

  return params
}

/**
 * 构建带参数的路径
 * 
 * @param pattern - 路径模式
 * @param params - 参数对象
 * @returns 构建后的路径
 */
export function buildPath(pattern: string, params: RouteParams = {}): string {
  let path = pattern

  // 替换路径参数
  for (const [key, value] of Object.entries(params)) {
    const paramValue = Array.isArray(value) ? value[0] : value
    path = path.replace(`:${key}`, encodeURIComponent(paramValue))
    path = path.replace(`:${key}?`, encodeURIComponent(paramValue))
  }

  // 移除未提供值的可选参数
  path = path.replace(/\/:[^/]+\?/g, '')

  return normalizePath(path)
}

/**
 * 提取路径中的参数名
 * 
 * @param pattern - 路径模式
 * @returns 参数名数组
 */
export function extractParamNames(pattern: string): string[] {
  const paramNames: string[] = []
  const regex = /:([^/?]+)\??/g
  let match

  while ((match = regex.exec(pattern)) !== null) {
    paramNames.push(match[1])
  }

  return paramNames
}

/**
 * 标准化参数
 * 
 * @param params - 参数对象
 * @returns 标准化后的参数对象
 */
export function normalizeParams(params: Record<string, any>): RouteParams {
  const normalized: RouteParams = {}

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        normalized[key] = value.map(v => String(v))
      }
      else {
        normalized[key] = String(value)
      }
    }
  }

  return normalized
}

