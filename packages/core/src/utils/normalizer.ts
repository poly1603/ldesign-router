/**
 * @ldesign/router-core 路由标准化
 * 
 * @description
 * 提供路由配置标准化、验证和转换功能。
 * 
 * **特性**：
 * - 路由配置标准化
 * - 参数验证
 * - 路径规范化
 * - 默认值填充
 * 
 * @module utils/normalizer
 */

import type { RouteRecordRaw, RouteLocationRaw, RouteLocationNormalized } from '../types'
import { normalizePath } from './path'
import { parseQuery } from './query'
import { createInvalidConfigError } from './errors'

/**
 * 标准化选项
 */
export interface NormalizeOptions {
  /** 是否严格模式 */
  strict?: boolean
  
  /** 是否保留尾部斜杠 */
  trailingSlash?: boolean
  
  /** 是否自动添加前导斜杠 */
  leadingSlash?: boolean
  
  /** 默认路由名称前缀 */
  namePrefix?: string
}

/**
 * 路由验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  
  /** 错误列表 */
  errors: string[]
  
  /** 警告列表 */
  warnings: string[]
}

// ==================== 路由记录标准化 ====================

/**
 * 标准化路由记录
 */
export function normalizeRouteRecord(
  record: RouteRecordRaw,
  parent?: RouteRecordRaw,
  options: NormalizeOptions = {},
): RouteRecordRaw {
  const {
    strict = false,
    trailingSlash = false,
    leadingSlash = true,
    namePrefix = '',
  } = options

  // 验证必需字段
  if (!record.path) {
    throw createInvalidConfigError('path', 'Route path is required')
  }

  // 标准化路径
  let path = record.path
  
  // 处理相对路径
  if (parent && !path.startsWith('/') && !path.startsWith('*')) {
    path = joinPaths(parent.path, path)
  }
  
  // 标准化路径格式
  path = normalizePath(path, trailingSlash)
  
  // 确保有前导斜杠
  if (leadingSlash && !path.startsWith('/') && !path.startsWith('*')) {
    path = '/' + path
  }

  // 标准化名称
  let name = record.name
  if (name && namePrefix) {
    name = namePrefix + String(name)
  }

  // 标准化子路由
  let children: RouteRecordRaw[] | undefined
  if (record.children && record.children.length > 0) {
    children = record.children.map(child =>
      normalizeRouteRecord(child, { ...record, path }, options),
    )
  }

  // 标准化重定向
  let redirect = record.redirect
  if (redirect && typeof redirect === 'string') {
    redirect = normalizePath(redirect, trailingSlash)
  }

  // 验证路由配置
  if (strict) {
    const validation = validateRouteRecord(record)
    if (!validation.valid) {
      throw createInvalidConfigError('route', validation.errors)
    }
  }

  return {
    ...record,
    path,
    name,
    children,
    redirect,
  }
}

/**
 * 批量标准化路由记录
 */
export function normalizeRouteRecords(
  records: RouteRecordRaw[],
  options?: NormalizeOptions,
): RouteRecordRaw[] {
  return records.map(record => normalizeRouteRecord(record, undefined, options))
}

/**
 * 连接路径
 */
function joinPaths(parent: string, child: string): string {
  if (!parent || parent === '/') {
    return '/' + child
  }
  
  if (!child) {
    return parent
  }
  
  // 移除parent尾部的斜杠
  parent = parent.replace(/\/$/, '')
  
  // 移除child开头的斜杠
  child = child.replace(/^\//, '')
  
  return parent + '/' + child
}

// ==================== 路由位置标准化 ====================

/**
 * 标准化路由位置
 */
export function normalizeLocation(
  raw: RouteLocationRaw,
  current: RouteLocationNormalized,
): RouteLocationNormalized {
  // 如果是字符串，转为对象
  if (typeof raw === 'string') {
    return normalizeLocationFromPath(raw, current)
  }

  // 如果有 name，使用 name 导航
  if (raw.name) {
    return normalizeLocationFromName(raw, current)
  }

  // 如果有 path，使用 path 导航
  if (raw.path) {
    return normalizeLocationFromPath(raw.path, current, raw.params, raw.query, raw.hash)
  }

  throw createInvalidConfigError('location', 'Invalid location: must have name or path')
}

/**
 * 从路径标准化位置
 */
function normalizeLocationFromPath(
  path: string,
  current: RouteLocationNormalized,
  params?: Record<string, any>,
  query?: Record<string, any>,
  hash?: string,
): RouteLocationNormalized {
  // 解析查询字符串和 hash
  const [pathOnly, search = ''] = path.split('?')
  const [pathAndQuery, hashValue = ''] = pathOnly.split('#')

  // 合并查询参数
  const parsedQuery = search ? parseQuery(search) : {}
  const finalQuery = { ...parsedQuery, ...query }

  // 合并 hash
  const finalHash = hash || hashValue

  // 处理相对路径
  let finalPath = pathAndQuery
  if (!finalPath.startsWith('/')) {
    finalPath = resolveRelativePath(finalPath, current.path)
  }

  // 标准化路径
  finalPath = normalizePath(finalPath)

  return {
    name: undefined,
    path: finalPath,
    fullPath: buildFullPath(finalPath, finalQuery, finalHash),
    query: finalQuery,
    hash: finalHash ? (finalHash.startsWith('#') ? finalHash : '#' + finalHash) : '',
    params: params || {},
    matched: [],
    meta: {},
  }
}

/**
 * 从名称标准化位置
 */
function normalizeLocationFromName(
  raw: RouteLocationRaw & { name: string | symbol },
  current: RouteLocationNormalized,
): RouteLocationNormalized {
  return {
    name: raw.name,
    path: '',
    fullPath: '',
    query: raw.query || {},
    hash: raw.hash || '',
    params: raw.params || {},
    matched: [],
    meta: {},
  }
}

/**
 * 解析相对路径
 */
function resolveRelativePath(relative: string, current: string): string {
  const currentSegments = current.split('/').filter(Boolean)
  const relativeSegments = relative.split('/').filter(Boolean)

  // 处理返回上级目录
  for (const segment of relativeSegments) {
    if (segment === '.') {
      continue
    } else if (segment === '..') {
      currentSegments.pop()
    } else {
      currentSegments.push(segment)
    }
  }

  return '/' + currentSegments.join('/')
}

/**
 * 构建完整路径
 */
function buildFullPath(
  path: string,
  query: Record<string, any>,
  hash: string,
): string {
  let fullPath = path

  // 添加查询参数
  const queryString = stringifyQuery(query)
  if (queryString) {
    fullPath += '?' + queryString
  }

  // 添加 hash
  if (hash) {
    fullPath += hash.startsWith('#') ? hash : '#' + hash
  }

  return fullPath
}

/**
 * 序列化查询参数
 */
function stringifyQuery(query: Record<string, any>): string {
  const parts: string[] = []

  for (const key in query) {
    const value = query[key]
    
    if (value == null) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }

  return parts.join('&')
}

// ==================== 路由验证 ====================

/**
 * 验证路由记录
 */
export function validateRouteRecord(record: RouteRecordRaw): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 验证 path
  if (!record.path) {
    errors.push('Route path is required')
  } else {
    // 验证路径格式
    if (record.path.includes('//')) {
      warnings.push(`Path contains consecutive slashes: ${record.path}`)
    }
    
    // 验证通配符位置
    if (record.path.includes('*') && !record.path.endsWith('*')) {
      warnings.push(`Wildcard should be at the end of path: ${record.path}`)
    }
  }

  // 验证 name
  if (record.name !== undefined) {
    if (typeof record.name !== 'string' && typeof record.name !== 'symbol') {
      errors.push('Route name must be string or symbol')
    }
    
    if (typeof record.name === 'string' && record.name.trim() === '') {
      errors.push('Route name cannot be empty')
    }
  }

  // 验证 redirect
  if (record.redirect !== undefined) {
    const redirectType = typeof record.redirect
    if (redirectType !== 'string' && redirectType !== 'function' && redirectType !== 'object') {
      errors.push('Route redirect must be string, function, or object')
    }
  }

  // 验证 component
  if (record.component !== undefined && typeof record.component !== 'function' && typeof record.component !== 'object') {
    errors.push('Route component must be function or object')
  }

  // 验证 children
  if (record.children !== undefined) {
    if (!Array.isArray(record.children)) {
      errors.push('Route children must be array')
    } else {
      // 递归验证子路由
      for (const child of record.children) {
        const childValidation = validateRouteRecord(child)
        errors.push(...childValidation.errors)
        warnings.push(...childValidation.warnings)
      }
    }
  }

  // 验证 meta
  if (record.meta !== undefined && typeof record.meta !== 'object') {
    errors.push('Route meta must be object')
  }

  // 验证冲突配置
  if (record.redirect && record.component) {
    warnings.push('Route has both redirect and component, redirect will take precedence')
  }

  if (record.redirect && record.children && record.children.length > 0) {
    warnings.push('Route has both redirect and children, redirect will take precedence')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 验证路由位置
 */
export function validateLocation(location: RouteLocationRaw): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof location === 'string') {
    if (location.trim() === '') {
      errors.push('Location path cannot be empty')
    }
  } else {
    // 必须有 name 或 path
    if (!location.name && !location.path) {
      errors.push('Location must have name or path')
    }

    // 验证 name
    if (location.name !== undefined) {
      const nameType = typeof location.name
      if (nameType !== 'string' && nameType !== 'symbol') {
        errors.push('Location name must be string or symbol')
      }
    }

    // 验证 path
    if (location.path !== undefined) {
      if (typeof location.path !== 'string') {
        errors.push('Location path must be string')
      } else if (location.path.trim() === '') {
        errors.push('Location path cannot be empty')
      }
    }

    // 验证 params
    if (location.params !== undefined && typeof location.params !== 'object') {
      errors.push('Location params must be object')
    }

    // 验证 query
    if (location.query !== undefined && typeof location.query !== 'object') {
      errors.push('Location query must be object')
    }

    // 验证 hash
    if (location.hash !== undefined && typeof location.hash !== 'string') {
      errors.push('Location hash must be string')
    }

    // 冲突检查
    if (location.name && location.path) {
      warnings.push('Location has both name and path, name will take precedence')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ==================== 导出 ====================

/**
 * 路由标准化器
 */
export class RouteNormalizer {
  constructor(private options: NormalizeOptions = {}) {}

  /**
   * 标准化路由记录
   */
  normalizeRecord(
    record: RouteRecordRaw,
    parent?: RouteRecordRaw,
  ): RouteRecordRaw {
    return normalizeRouteRecord(record, parent, this.options)
  }

  /**
   * 批量标准化路由记录
   */
  normalizeRecords(records: RouteRecordRaw[]): RouteRecordRaw[] {
    return normalizeRouteRecords(records, this.options)
  }

  /**
   * 标准化路由位置
   */
  normalizeLocation(
    raw: RouteLocationRaw,
    current: RouteLocationNormalized,
  ): RouteLocationNormalized {
    return normalizeLocation(raw, current)
  }

  /**
   * 验证路由记录
   */
  validateRecord(record: RouteRecordRaw): ValidationResult {
    return validateRouteRecord(record)
  }

  /**
   * 验证路由位置
   */
  validateLocation(location: RouteLocationRaw): ValidationResult {
    return validateLocation(location)
  }
}

/**
 * 创建路由标准化器
 */
export function createNormalizer(options?: NormalizeOptions): RouteNormalizer {
  return new RouteNormalizer(options)
}
