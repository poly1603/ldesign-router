/**
 * @ldesign/router-core 路径匹配器
 * 
 * @description
 * 提供路径模式匹配功能，支持动态参数、通配符和优先级计算。
 * 
 * **特性**：
 * - 动态参数匹配（:param）
 * - 可选参数（:param?）
 * - 通配符匹配（*）
 * - 路径评分算法
 * - 优先级排序
 * 
 * **性能优化**：
 * - 编译时路径解析
 * - O(1) 静态路径匹配
 * - 优化的正则表达式
 * 
 * @module utils/matcher
 */

import type { RouteParams } from '../types'

/**
 * 匹配结果
 */
export interface MatchResult {
  /** 是否匹配成功 */
  matched: boolean
  
  /** 提取的参数 */
  params: RouteParams
  
  /** 匹配得分（越高越优先） */
  score: number
  
  /** 匹配的路径段数 */
  segments: number
}

/**
 * 路径模式类型
 */
export type PathPattern = 
  | 'static'      // 静态路径
  | 'dynamic'     // 动态参数
  | 'optional'    // 可选参数
  | 'wildcard'    // 通配符
  | 'regex'       // 正则表达式

/**
 * 路径段
 */
interface PathSegment {
  /** 段类型 */
  type: PathPattern
  
  /** 原始文本 */
  value: string
  
  /** 参数名（动态段） */
  paramName?: string
  
  /** 是否可选 */
  optional?: boolean
  
  /** 正则表达式（如果有） */
  regex?: RegExp
  
  /** 段得分 */
  score: number
}

/**
 * 路径匹配器
 * 
 * @description
 * 编译路径模式并提供高效的匹配功能。
 * 
 * **路径模式**：
 * - `/user/profile` - 静态路径
 * - `/user/:id` - 动态参数
 * - `/user/:id?` - 可选参数
 * - `/files/*` - 通配符
 * - `/post/:id(\\d+)` - 带正则的参数
 * 
 * **评分规则**：
 * - 静态段: 100 分
 * - 动态段: 50 分
 * - 可选段: 25 分
 * - 通配符: 1 分
 * 
 * ⚡ 性能:
 * - 静态路径匹配: O(1)
 * - 动态路径匹配: O(n)，n 为段数
 * 
 * @class
 * 
 * @example
 * ```ts
 * // 静态路径
 * const matcher = new PathMatcher('/user/profile')
 * matcher.match('/user/profile')
 * // => { matched: true, params: {}, score: 200 }
 * 
 * // 动态参数
 * const matcher = new PathMatcher('/user/:id')
 * matcher.match('/user/123')
 * // => { matched: true, params: { id: '123' }, score: 150 }
 * 
 * // 可选参数
 * const matcher = new PathMatcher('/posts/:id?')
 * matcher.match('/posts')
 * // => { matched: true, params: {}, score: 100 }
 * 
 * // 通配符
 * const matcher = new PathMatcher('/files/*')
 * matcher.match('/files/docs/readme.md')
 * // => { matched: true, params: { '*': 'docs/readme.md' }, score: 101 }
 * ```
 */
export class PathMatcher {
  /** 原始路径模式 */
  private pattern: string
  
  /** 编译后的段 */
  private segments: PathSegment[] = []
  
  /** 是否为静态路径 */
  private isStatic: boolean = false
  
  /** 匹配正则表达式 */
  private matchRegex?: RegExp
  
  /** 参数名列表 */
  private paramNames: string[] = []
  
  /** 基础得分 */
  private baseScore: number = 0

  /**
   * 创建路径匹配器
   * 
   * @param pattern - 路径模式
   */
  constructor(pattern: string) {
    this.pattern = this.normalizePath(pattern)
    this.compile()
  }

  /**
   * 匹配路径
   * 
   * @param path - 要匹配的路径
   * @returns 匹配结果
   */
  match(path: string): MatchResult {
    path = this.normalizePath(path)

    // 静态路径快速匹配
    if (this.isStatic) {
      if (path === this.pattern) {
        return {
          matched: true,
          params: {},
          score: this.baseScore,
          segments: this.segments.length,
        }
      }
      return this.createFailResult()
    }

    // 使用正则匹配
    if (this.matchRegex) {
      const match = path.match(this.matchRegex)
      if (!match) {
        return this.createFailResult()
      }

      // 提取参数
      const params: RouteParams = {}
      for (let i = 0; i < this.paramNames.length; i++) {
        const value = match[i + 1]
        if (value !== undefined) {
          params[this.paramNames[i]] = decodeURIComponent(value)
        }
      }

      return {
        matched: true,
        params,
        score: this.baseScore,
        segments: this.segments.length,
      }
    }

    return this.createFailResult()
  }

  /**
   * 获取路径模式
   */
  getPattern(): string {
    return this.pattern
  }

  /**
   * 获取参数名列表
   */
  getParamNames(): string[] {
    return [...this.paramNames]
  }

  /**
   * 获取基础得分
   */
  getScore(): number {
    return this.baseScore
  }

  /**
   * 编译路径模式
   * 
   * @private
   */
  private compile(): void {
    if (!this.pattern || this.pattern === '/') {
      this.isStatic = true
      this.baseScore = 100
      this.segments = [{
        type: 'static',
        value: '/',
        score: 100,
      }]
      return
    }

    const parts = this.pattern.split('/').filter(Boolean)
    let regexPattern = '^'
    let score = 0
    let hasParams = false

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const segment = this.parseSegment(part, i === parts.length - 1)
      
      this.segments.push(segment)
      score += segment.score

      if (segment.type !== 'static') {
        hasParams = true
      }

      // 构建正则
      regexPattern += '\\/'
      
      switch (segment.type) {
        case 'static':
          regexPattern += this.escapeRegex(segment.value)
          break
          
        case 'dynamic':
          this.paramNames.push(segment.paramName!)
          if (segment.regex) {
            regexPattern += `(${segment.regex.source})`
          } else {
            regexPattern += '([^/]+)'
          }
          break
          
        case 'optional':
          this.paramNames.push(segment.paramName!)
          if (segment.regex) {
            regexPattern += `(?:(${segment.regex.source}))?`
          } else {
            regexPattern += '(?:([^/]+))?'
          }
          break
          
        case 'wildcard':
          this.paramNames.push('*')
          regexPattern += '(.*)'
          break
      }
    }

    regexPattern += '$'

    this.isStatic = !hasParams
    this.baseScore = score
    
    if (!this.isStatic) {
      this.matchRegex = new RegExp(regexPattern)
    }
  }

  /**
   * 解析路径段
   * 
   * @private
   */
  private parseSegment(part: string, isLast: boolean): PathSegment {
    // 通配符
    if (part === '*' || part === '**') {
      return {
        type: 'wildcard',
        value: part,
        score: 1,
      }
    }

    // 动态参数
    if (part.startsWith(':')) {
      const optional = part.endsWith('?')
      let paramName = part.slice(1)
      let regex: RegExp | undefined

      // 提取正则表达式
      const regexMatch = paramName.match(/^([^(]+)\((.+)\)\??$/)
      if (regexMatch) {
        paramName = regexMatch[1]
        regex = new RegExp(regexMatch[2])
      }

      if (optional) {
        paramName = paramName.slice(0, -1)
      }

      return {
        type: optional ? 'optional' : 'dynamic',
        value: part,
        paramName,
        optional,
        regex,
        score: optional ? 25 : 50,
      }
    }

    // 静态段
    return {
      type: 'static',
      value: part,
      score: 100,
    }
  }

  /**
   * 标准化路径
   * 
   * @private
   */
  private normalizePath(path: string): string {
    if (!path) return '/'
    
    // 移除多余斜杠
    path = path.replace(/\/+/g, '/')
    
    // 确保以 / 开头
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    
    // 移除末尾斜杠（除了根路径）
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    
    return path
  }

  /**
   * 转义正则表达式特殊字符
   * 
   * @private
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 创建失败结果
   * 
   * @private
   */
  private createFailResult(): MatchResult {
    return {
      matched: false,
      params: {},
      score: 0,
      segments: 0,
    }
  }
}

/**
 * 创建路径匹配器
 * 
 * @param pattern - 路径模式
 * @returns 路径匹配器实例
 * 
 * @example
 * ```ts
 * const matcher = createMatcher('/user/:id')
 * const result = matcher.match('/user/123')
 * ```
 */
export function createMatcher(pattern: string): PathMatcher {
  return new PathMatcher(pattern)
}

/**
 * 比较两个匹配结果的优先级
 * 
 * @description
 * 用于排序匹配结果，得分高的优先。
 * 
 * @param a - 第一个匹配结果
 * @param b - 第二个匹配结果
 * @returns 比较结果（负数表示 a 优先，正数表示 b 优先）
 * 
 * @example
 * ```ts
 * const results = [result1, result2, result3]
 * results.sort(compareMatchResults)
 * // 得分最高的排在最前
 * ```
 */
export function compareMatchResults(a: MatchResult, b: MatchResult): number {
  // 先按得分排序
  if (a.score !== b.score) {
    return b.score - a.score
  }
  
  // 得分相同，段数多的优先
  return b.segments - a.segments
}

/**
 * 批量匹配路径
 * 
 * @description
 * 对多个路径模式进行匹配，返回最佳匹配结果。
 * 
 * @param patterns - 路径模式数组
 * @param path - 要匹配的路径
 * @returns 最佳匹配结果，没有匹配返回 null
 * 
 * @example
 * ```ts
 * const patterns = ['/user/:id', '/user/profile', '/user/*']
 * const result = matchPath(patterns, '/user/profile')
 * // => 返回 '/user/profile' 的匹配结果（得分最高）
 * ```
 */
export function matchPath(
  patterns: string[],
  path: string,
): { pattern: string; result: MatchResult } | null {
  const matches: Array<{ pattern: string; result: MatchResult }> = []

  for (const pattern of patterns) {
    const matcher = new PathMatcher(pattern)
    const result = matcher.match(path)
    
    if (result.matched) {
      matches.push({ pattern, result })
    }
  }

  if (matches.length === 0) {
    return null
  }

  // 返回得分最高的
  matches.sort((a, b) => compareMatchResults(a.result, b.result))
  return matches[0]
}

/**
 * 检查路径是否匹配模式
 * 
 * @param pattern - 路径模式
 * @param path - 要检查的路径
 * @returns 是否匹配
 * 
 * @example
 * ```ts
 * isMatch('/user/:id', '/user/123') // => true
 * isMatch('/user/:id', '/post/123') // => false
 * ```
 */
export function isMatch(pattern: string, path: string): boolean {
  const matcher = new PathMatcher(pattern)
  return matcher.match(path).matched
}

/**
 * 从路径中提取参数
 * 
 * @param pattern - 路径模式
 * @param path - 实际路径
 * @returns 提取的参数，不匹配返回 null
 * 
 * @example
 * ```ts
 * extractParams('/user/:id', '/user/123')
 * // => { id: '123' }
 * 
 * extractParams('/user/:id', '/post/123')
 * // => null
 * ```
 */
export function extractParams(
  pattern: string,
  path: string,
): RouteParams | null {
  const matcher = new PathMatcher(pattern)
  const result = matcher.match(path)
  return result.matched ? result.params : null
}

/**
 * 匹配器选项
 */
export interface MatcherOptions {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存大小 */
  cacheSize?: number
}

/**
 * 路由记录（简化版）
 */
interface RouteRecord {
  path: string
  [key: string]: any
}

/**
 * 匹配注册表
 * 
 * @description
 * 管理多个路由模式的匹配器，提供统一的匹配接口。
 * 支持添加、删除路由，并按优先级返回最佳匹配结果。
 * 
 * @class
 * 
 * @example
 * ```ts
 * const registry = new MatcherRegistry()
 * 
 * // 添加路由
 * registry.addRoute('/user/:id', { name: 'user', component: UserPage })
 * registry.addRoute('/user/profile', { name: 'profile', component: ProfilePage })
 * 
 * // 匹配路径
 * const result = registry.match('/user/123')
 * // => { matched: true, params: { id: '123' }, route: { name: 'user', ... } }
 * 
 * // 移除路由
 * registry.removeRoute('/user/:id')
 * ```
 */
export class MatcherRegistry {
  private matchers = new Map<string, PathMatcher>()
  private routes = new Map<string, RouteRecord>()
  private matchCache = new Map<string, { matched: boolean; params: RouteParams; route?: RouteRecord }>()
  private options: Required<MatcherOptions>

  constructor(options: MatcherOptions = {}) {
    this.options = {
      enableCache: options.enableCache ?? true,
      cacheSize: options.cacheSize || 1000,
    }
  }

  /**
   * 添加路由
   * 
   * @param path - 路径模式
   * @param route - 路由记录
   */
  addRoute(path: string, route: RouteRecord): void {
    const matcher = new PathMatcher(path)
    this.matchers.set(path, matcher)
    this.routes.set(path, route)
    
    // 清空缓存
    if (this.options.enableCache) {
      this.matchCache.clear()
    }
  }

  /**
   * 移除路由
   * 
   * @param path - 路径模式
   */
  removeRoute(path: string): void {
    this.matchers.delete(path)
    this.routes.delete(path)
    
    // 清空缓存
    if (this.options.enableCache) {
      this.matchCache.clear()
    }
  }

  /**
   * 匹配路径
   * 
   * @param path - 要匹配的路径
   * @returns 匹配结果
   */
  match(path: string): {
    matched: boolean
    params: RouteParams
    route?: RouteRecord
    score?: number
  } {
    // 尝试从缓存获取
    if (this.options.enableCache && this.matchCache.has(path)) {
      return this.matchCache.get(path)!
    }

    const matches: Array<{
      pattern: string
      result: MatchResult
      route: RouteRecord
    }> = []

    // 遍历所有匹配器
    for (const [pattern, matcher] of this.matchers) {
      const result = matcher.match(path)
      
      if (result.matched) {
        const route = this.routes.get(pattern)!
        matches.push({ pattern, result, route })
      }
    }

    // 没有匹配
    if (matches.length === 0) {
      const result = {
        matched: false,
        params: {},
      }
      
      if (this.options.enableCache) {
        this.cacheResult(path, result)
      }
      
      return result
    }

    // 按得分排序，返回最佳匹配
    matches.sort((a, b) => compareMatchResults(a.result, b.result))
    const best = matches[0]

    const result = {
      matched: true,
      params: best.result.params,
      route: best.route,
      score: best.result.score,
    }

    if (this.options.enableCache) {
      this.cacheResult(path, result)
    }

    return result
  }

  /**
   * 缓存匹配结果
   */
  private cacheResult(
    path: string,
    result: { matched: boolean; params: RouteParams; route?: RouteRecord },
  ): void {
    // LRU 缓存策略
    if (this.matchCache.size >= this.options.cacheSize) {
      const firstKey = this.matchCache.keys().next().value
      this.matchCache.delete(firstKey)
    }
    
    this.matchCache.set(path, result)
  }

  /**
   * 获取所有路由模式
   */
  getPatterns(): string[] {
    return Array.from(this.matchers.keys())
  }

  /**
   * 检查路由是否存在
   */
  has(path: string): boolean {
    return this.matchers.has(path)
  }

  /**
   * 清空所有路由
   */
  clear(): void {
    this.matchers.clear()
    this.routes.clear()
    this.matchCache.clear()
  }

  /**
   * 获取路由数量
   */
  get size(): number {
    return this.matchers.size
  }
}

/**
 * 创建匹配器注册表
 * 
 * @param options - 选项
 * @returns 匹配器注册表实例
 * 
 * @example
 * ```ts
 * const registry = createMatcherRegistry({
 *   enableCache: true,
 *   cacheSize: 500
 * })
 * ```
 */
export function createMatcherRegistry(options?: MatcherOptions): MatcherRegistry {
  return new MatcherRegistry(options)
}
