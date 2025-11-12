/**
 * @ldesign/router-core 路由别名处理
 * 
 * @description
 * 提供路由别名配置和处理功能,支持一个路由配置多个访问路径。
 * 
 * **特性**：
 * - 路由别名配置
 * - 别名匹配
 * - 别名重定向
 * - 多个别名支持
 * - 别名参数处理
 * - 别名继承
 * 
 * @module utils/alias
 */

import type { RouteRecordRaw } from '../types'
import { normalizePath } from './path'

/**
 * 别名配置
 */
export interface AliasConfig {
  /** 原始路径 */
  path: string
  
  /** 别名列表 */
  aliases: string[]
  
  /** 路由名称 */
  name?: string | symbol
  
  /** 是否保留原始路径 */
  keepOriginal?: boolean
}

/**
 * 别名记录
 */
export interface AliasRecord {
  /** 别名路径 */
  alias: string
  
  /** 目标路径 */
  target: string
  
  /** 路由名称 */
  name?: string | symbol
  
  /** 是否精确匹配 */
  exact?: boolean
  
  /** 参数映射 */
  paramMapping?: Record<string, string>
}

/**
 * 别名匹配结果
 */
export interface AliasMatchResult {
  /** 是否匹配 */
  matched: boolean
  
  /** 目标路径 */
  targetPath?: string
  
  /** 参数 */
  params?: Record<string, string>
  
  /** 匹配的别名记录 */
  record?: AliasRecord
}

/**
 * 路由别名管理器
 */
export class AliasManager {
  private aliases = new Map<string, AliasRecord[]>()
  private aliasToTarget = new Map<string, string>()

  /**
   * 注册别名
   */
  registerAlias(config: AliasConfig): void {
    const { path, aliases, name, keepOriginal = true } = config

    for (const alias of aliases) {
      const normalizedAlias = normalizePath(alias)
      const normalizedPath = normalizePath(path)

      const record: AliasRecord = {
        alias: normalizedAlias,
        target: normalizedPath,
        name,
        exact: !normalizedAlias.includes(':') && !normalizedAlias.includes('*'),
      }

      // 存储别名记录
      if (!this.aliases.has(normalizedAlias)) {
        this.aliases.set(normalizedAlias, [])
      }
      this.aliases.get(normalizedAlias)!.push(record)

      // 存储别名到目标的映射
      this.aliasToTarget.set(normalizedAlias, normalizedPath)
    }
  }

  /**
   * 从路由配置中注册别名
   */
  registerFromRoute(route: RouteRecordRaw): void {
    if (!route.alias) {
      return
    }

    const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]
    
    this.registerAlias({
      path: route.path,
      aliases,
      name: route.name,
    })

    // 递归处理子路由
    if (route.children) {
      for (const child of route.children) {
        this.registerFromRoute(child)
      }
    }
  }

  /**
   * 批量注册路由别名
   */
  registerFromRoutes(routes: RouteRecordRaw[]): void {
    for (const route of routes) {
      this.registerFromRoute(route)
    }
  }

  /**
   * 匹配别名
   */
  match(path: string): AliasMatchResult {
    const normalizedPath = normalizePath(path)

    // 1. 精确匹配
    const exactRecords = this.aliases.get(normalizedPath)
    if (exactRecords && exactRecords.length > 0) {
      const record = exactRecords[0]
      return {
        matched: true,
        targetPath: record.target,
        params: {},
        record,
      }
    }

    // 2. 动态参数匹配
    for (const [alias, records] of this.aliases.entries()) {
      if (alias.includes(':') || alias.includes('*')) {
        for (const record of records) {
          const matchResult = this.matchDynamicAlias(normalizedPath, record)
          if (matchResult.matched) {
            return matchResult
          }
        }
      }
    }

    return { matched: false }
  }

  /**
   * 匹配动态别名
   */
  private matchDynamicAlias(path: string, record: AliasRecord): AliasMatchResult {
    const aliasPattern = this.aliasToPattern(record.alias)
    const match = path.match(aliasPattern)

    if (!match) {
      return { matched: false }
    }

    // 提取参数
    const params = this.extractAliasParams(record.alias, path)
    
    // 构建目标路径
    const targetPath = this.buildTargetPath(record.target, params)

    return {
      matched: true,
      targetPath,
      params,
      record,
    }
  }

  /**
   * 别名转正则模式
   */
  private aliasToPattern(alias: string): RegExp {
    let pattern = alias
      // 转义特殊字符
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      // 动态参数 :param -> ([^/]+)
      .replace(/:(\w+)/g, '([^/]+)')
      // 可选参数 :param? -> ([^/]+)?
      .replace(/:(\w+)\?/g, '([^/]+)?')
      // 通配符 * -> (.*)
      .replace(/\*/g, '(.*)')

    return new RegExp(`^${pattern}$`)
  }

  /**
   * 提取别名参数
   */
  private extractAliasParams(alias: string, path: string): Record<string, string> {
    const params: Record<string, string> = {}
    const aliasPattern = this.aliasToPattern(alias)
    const match = path.match(aliasPattern)

    if (!match) {
      return params
    }

    // 提取参数名
    const paramNames: string[] = []
    const paramRegex = /:(\w+)\??/g
    let paramMatch: RegExpExecArray | null

    while ((paramMatch = paramRegex.exec(alias)) !== null) {
      paramNames.push(paramMatch[1])
    }

    // 映射参数值
    for (let i = 0; i < paramNames.length; i++) {
      const value = match[i + 1]
      if (value !== undefined) {
        params[paramNames[i]] = value
      }
    }

    return params
  }

  /**
   * 构建目标路径
   */
  private buildTargetPath(target: string, params: Record<string, string>): string {
    let path = target

    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value)
      path = path.replace(`:${key}?`, value)
    }

    return path
  }

  /**
   * 解析别名路径
   */
  resolve(path: string): string {
    const matchResult = this.match(path)
    
    if (matchResult.matched && matchResult.targetPath) {
      return matchResult.targetPath
    }

    return path
  }

  /**
   * 检查是否为别名
   */
  isAlias(path: string): boolean {
    const normalizedPath = normalizePath(path)
    
    // 检查精确匹配
    if (this.aliases.has(normalizedPath)) {
      return true
    }

    // 检查动态匹配
    for (const [alias] of this.aliases.entries()) {
      if (alias.includes(':') || alias.includes('*')) {
        const pattern = this.aliasToPattern(alias)
        if (pattern.test(normalizedPath)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 获取路径的所有别名
   */
  getAliases(path: string): string[] {
    const normalizedPath = normalizePath(path)
    const aliases: string[] = []

    for (const [alias, records] of this.aliases.entries()) {
      for (const record of records) {
        if (record.target === normalizedPath) {
          aliases.push(alias)
        }
      }
    }

    return aliases
  }

  /**
   * 获取别名的目标路径
   */
  getTarget(alias: string): string | undefined {
    return this.aliasToTarget.get(normalizePath(alias))
  }

  /**
   * 获取所有别名记录
   */
  getAllAliases(): AliasRecord[] {
    const allRecords: AliasRecord[] = []
    
    for (const records of this.aliases.values()) {
      allRecords.push(...records)
    }

    return allRecords
  }

  /**
   * 删除别名
   */
  removeAlias(alias: string): boolean {
    const normalizedAlias = normalizePath(alias)
    const deleted = this.aliases.delete(normalizedAlias)
    
    if (deleted) {
      this.aliasToTarget.delete(normalizedAlias)
    }

    return deleted
  }

  /**
   * 清空所有别名
   */
  clear(): void {
    this.aliases.clear()
    this.aliasToTarget.clear()
  }

  /**
   * 获取别名数量
   */
  get size(): number {
    return this.aliases.size
  }
}

/**
 * 创建别名管理器
 */
export function createAliasManager(): AliasManager {
  return new AliasManager()
}

// ==================== 工具函数 ====================

/**
 * 扩展路由配置以包含别名
 */
export function expandRouteWithAliases(route: RouteRecordRaw): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [route]

  if (!route.alias) {
    return routes
  }

  const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]

  for (const alias of aliases) {
    routes.push({
      ...route,
      path: alias,
      alias: undefined,
      // 添加元数据标记这是别名路由
      meta: {
        ...route.meta,
        isAlias: true,
        originalPath: route.path,
      },
    })
  }

  return routes
}

/**
 * 批量扩展路由配置
 */
export function expandRoutesWithAliases(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  const expanded: RouteRecordRaw[] = []

  for (const route of routes) {
    expanded.push(...expandRouteWithAliases(route))
    
    // 递归处理子路由
    if (route.children) {
      route.children = expandRoutesWithAliases(route.children)
    }
  }

  return expanded
}

/**
 * 规范化别名路径
 */
export function normalizeAliasPath(alias: string, parentPath?: string): string {
  let path = alias

  // 如果是相对路径且有父路径,拼接父路径
  if (parentPath && !path.startsWith('/')) {
    path = `${parentPath}/${path}`
  }

  return normalizePath(path)
}

/**
 * 验证别名配置
 */
export function validateAliasConfig(config: AliasConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.path) {
    errors.push('Path is required')
  }

  if (!config.aliases || config.aliases.length === 0) {
    errors.push('At least one alias is required')
  }

  // 检查别名不能与路径相同
  if (config.aliases) {
    for (const alias of config.aliases) {
      if (normalizePath(alias) === normalizePath(config.path)) {
        errors.push(`Alias "${alias}" cannot be the same as path "${config.path}"`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 合并别名配置
 */
export function mergeAliasConfigs(...configs: AliasConfig[]): AliasConfig[] {
  const mergedMap = new Map<string, AliasConfig>()

  for (const config of configs) {
    const normalizedPath = normalizePath(config.path)
    
    if (mergedMap.has(normalizedPath)) {
      const existing = mergedMap.get(normalizedPath)!
      // 合并别名列表
      existing.aliases = [...new Set([...existing.aliases, ...config.aliases])]
    } else {
      mergedMap.set(normalizedPath, { ...config })
    }
  }

  return Array.from(mergedMap.values())
}
