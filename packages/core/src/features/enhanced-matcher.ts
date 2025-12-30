/**
 * @fileoverview 增强的路由匹配器
 * 提供多种匹配模式、参数解析验证、路由分组和守卫功能
 */

import type { RouteRecordRaw, RouteLocationNormalized } from '../types'

/**
 * 路由匹配模式
 */
export enum RouteMatchMode {
  /** 精确匹配 */
  EXACT = 'exact',
  /** 前缀匹配 */
  PREFIX = 'prefix',
  /** 正则匹配 */
  REGEX = 'regex',
  /** 模糊匹配 */
  FUZZY = 'fuzzy',
}

/**
 * 路由参数验证器
 */
export interface RouteParamValidator {
  /** 参数名称 */
  name: string
  /** 验证函数 */
  validate: (value: string) => boolean
  /** 错误消息 */
  errorMessage?: string
  /** 类型转换函数 */
  transform?: (value: string) => any
}

/**
 * 路由分组配置
 */
export interface RouteGroupConfig {
  /** 分组名称 */
  name: string
  /** 路径前缀 */
  prefix?: string
  /** 分组中间件 */
  middlewares?: string[]
  /** 分组守卫 */
  guards?: RouteGuard[]
  /** 分组元数据 */
  meta?: Record<string, any>
  /** 子路由 */
  routes: RouteRecordRaw[]
}

/**
 * 路由守卫函数
 */
export type RouteGuardFunction = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => boolean | Promise<boolean> | string | Promise<string>

/**
 * 路由守卫配置
 */
export interface RouteGuard {
  /** 守卫名称 */
  name: string
  /** 守卫函数 */
  handler: RouteGuardFunction
  /** 优先级 */
  priority?: number
  /** 执行条件 */
  condition?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean
}

/**
 * 路由匹配结果
 */
export interface RouteMatchResult {
  /** 是否匹配成功 */
  matched: boolean
  /** 匹配的路由 */
  route?: RouteRecordRaw
  /** 路径参数 */
  params: Record<string, string>
  /** 匹配模式 */
  matchMode: RouteMatchMode
  /** 匹配得分（用于模糊匹配排序） */
  score: number
  /** 验证错误 */
  validationErrors?: string[]
}

/**
 * 权限检查配置
 */
export interface PermissionConfig {
  /** 所需权限列表 */
  required: string[]
  /** 权限检查模式：all-需要全部权限，any-需要任一权限 */
  mode: 'all' | 'any'
  /** 权限验证函数 */
  validator?: (permissions: string[]) => boolean
}

/**
 * 增强路由匹配器选项
 */
export interface EnhancedMatcherOptions {
  /** 默认匹配模式 */
  defaultMatchMode?: RouteMatchMode
  /** 是否启用参数验证 */
  enableParamValidation?: boolean
  /** 是否启用权限检查 */
  enablePermissionCheck?: boolean
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否严格匹配尾部斜杠 */
  strictTrailingSlash?: boolean
}

/**
 * 增强路由匹配器
 */
export class EnhancedRouteMatcher {
  private routes = new Map<string, RouteRecordRaw>()
  private groups = new Map<string, RouteGroupConfig>()
  private paramValidators = new Map<string, RouteParamValidator[]>()
  private globalGuards: RouteGuard[] = []
  private options: Required<EnhancedMatcherOptions>

  constructor(options: EnhancedMatcherOptions = {}) {
    this.options = {
      defaultMatchMode: options.defaultMatchMode ?? RouteMatchMode.EXACT,
      enableParamValidation: options.enableParamValidation ?? true,
      enablePermissionCheck: options.enablePermissionCheck ?? true,
      caseSensitive: options.caseSensitive ?? false,
      strictTrailingSlash: options.strictTrailingSlash ?? false,
    }
  }

  /**
   * 添加路由
   */
  addRoute(route: RouteRecordRaw): void {
    const normalizedPath = this.normalizePath(route.path)
    this.routes.set(normalizedPath, route)
  }

  /**
   * 批量添加路由
   */
  addRoutes(routes: RouteRecordRaw[]): void {
    routes.forEach(route => this.addRoute(route))
  }

  /**
   * 添加路由分组
   */
  addGroup(group: RouteGroupConfig): void {
    this.groups.set(group.name, group)

    // 处理分组中的路由
    group.routes.forEach(route => {
      const groupedRoute: RouteRecordRaw = {
        ...route,
        path: group.prefix ? `${group.prefix}${route.path}` : route.path,
        meta: {
          ...group.meta,
          ...route.meta,
          group: group.name,
        },
      }
      this.addRoute(groupedRoute)
    })
  }

  /**
   * 添加参数验证器
   */
  addParamValidator(routePath: string, validator: RouteParamValidator): void {
    const normalizedPath = this.normalizePath(routePath)

    if (!this.paramValidators.has(normalizedPath)) {
      this.paramValidators.set(normalizedPath, [])
    }

    this.paramValidators.get(normalizedPath)!.push(validator)
  }

  /**
   * 添加全局守卫
   */
  addGlobalGuard(guard: RouteGuard): void {
    this.globalGuards.push(guard)
    this.globalGuards.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  }

  /**
   * 匹配路由
   */
  match(path: string, mode?: RouteMatchMode): RouteMatchResult {
    const normalizedPath = this.normalizePath(path)
    const matchMode = mode ?? this.options.defaultMatchMode

    switch (matchMode) {
      case RouteMatchMode.EXACT:
        return this.exactMatch(normalizedPath)

      case RouteMatchMode.PREFIX:
        return this.prefixMatch(normalizedPath)

      case RouteMatchMode.REGEX:
        return this.regexMatch(normalizedPath)

      case RouteMatchMode.FUZZY:
        return this.fuzzyMatch(normalizedPath)

      default:
        return this.exactMatch(normalizedPath)
    }
  }

  /**
   * 精确匹配
   */
  private exactMatch(path: string): RouteMatchResult {
    const route = this.routes.get(path)

    if (route) {
      const params = this.extractParams(route.path, path)
      const validationErrors = this.validateParams(route.path, params)

      return {
        matched: validationErrors.length === 0,
        route,
        params,
        matchMode: RouteMatchMode.EXACT,
        score: 100,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      }
    }

    // 尝试匹配动态路由
    for (const [routePath, route] of this.routes.entries()) {
      if (this.isDynamicRoute(routePath)) {
        const params = this.extractParams(routePath, path)
        if (params && this.pathMatchesPattern(routePath, path)) {
          const validationErrors = this.validateParams(routePath, params)

          return {
            matched: validationErrors.length === 0,
            route,
            params,
            matchMode: RouteMatchMode.EXACT,
            score: 90,
            validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
          }
        }
      }
    }

    return {
      matched: false,
      params: {},
      matchMode: RouteMatchMode.EXACT,
      score: 0,
    }
  }

  /**
   * 前缀匹配
   */
  private prefixMatch(path: string): RouteMatchResult {
    const matches: RouteMatchResult[] = []

    for (const [routePath, route] of this.routes.entries()) {
      if (path.startsWith(routePath)) {
        const params = this.extractParams(routePath, path)
        matches.push({
          matched: true,
          route,
          params,
          matchMode: RouteMatchMode.PREFIX,
          score: (routePath.length / path.length) * 100,
        })
      }
    }

    if (matches.length > 0) {
      // 返回最长匹配
      matches.sort((a, b) => b.score - a.score)
      return matches[0]!
    }

    return {
      matched: false,
      params: {},
      matchMode: RouteMatchMode.PREFIX,
      score: 0,
    }
  }

  /**
   * 正则匹配
   */
  private regexMatch(path: string): RouteMatchResult {
    for (const [routePath, route] of this.routes.entries()) {
      const pattern = route.meta?.pattern as RegExp | undefined

      if (pattern && pattern.test(path)) {
        const params = this.extractRegexParams(pattern, path)

        return {
          matched: true,
          route,
          params,
          matchMode: RouteMatchMode.REGEX,
          score: 85,
        }
      }
    }

    return {
      matched: false,
      params: {},
      matchMode: RouteMatchMode.REGEX,
      score: 0,
    }
  }

  /**
   * 模糊匹配
   */
  private fuzzyMatch(path: string): RouteMatchResult {
    const matches: RouteMatchResult[] = []

    for (const [routePath, route] of this.routes.entries()) {
      const score = this.calculateFuzzyScore(routePath, path)

      if (score > 50) {
        matches.push({
          matched: true,
          route,
          params: this.extractParams(routePath, path),
          matchMode: RouteMatchMode.FUZZY,
          score,
        })
      }
    }

    if (matches.length > 0) {
      matches.sort((a, b) => b.score - a.score)
      return matches[0]!
    }

    return {
      matched: false,
      params: {},
      matchMode: RouteMatchMode.FUZZY,
      score: 0,
    }
  }

  /**
   * 提取路径参数
   */
  private extractParams(pattern: string, path: string): Record<string, string> {
    const params: Record<string, string> = {}
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')

    if (patternParts.length !== pathParts.length) {
      return params
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]

      if (patternPart && patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1)
        if (pathPart) {
          params[paramName] = decodeURIComponent(pathPart)
        }
      }
    }

    return params
  }

  /**
   * 提取正则表达式参数
   */
  private extractRegexParams(pattern: RegExp, path: string): Record<string, string> {
    const params: Record<string, string> = {}
    const match = pattern.exec(path)

    if (match) {
      const groups = match.groups
      if (groups) {
        Object.assign(params, groups)
      }
    }

    return params
  }

  /**
   * 验证路径参数
   */
  private validateParams(routePath: string, params: Record<string, string>): string[] {
    if (!this.options.enableParamValidation) {
      return []
    }

    const errors: string[] = []
    const validators = this.paramValidators.get(routePath)

    if (!validators) {
      return errors
    }

    for (const validator of validators) {
      const value = params[validator.name]

      if (value !== undefined && !validator.validate(value)) {
        errors.push(
          validator.errorMessage ??
          `参数 "${validator.name}" 验证失败: ${value}`
        )
      }
    }

    return errors
  }

  /**
   * 执行守卫检查
   */
  async executeGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<boolean | string> {
    // 执行全局守卫
    for (const guard of this.globalGuards) {
      if (guard.condition && !guard.condition(to, from)) {
        continue
      }

      const result = await Promise.resolve(guard.handler(to, from))

      if (result === false || typeof result === 'string') {
        return result
      }
    }

    // 执行路由级守卫
    const route = this.routes.get(this.normalizePath(to.path))
    if (route?.meta?.guards) {
      const guards = route.meta.guards as RouteGuard[]

      for (const guard of guards) {
        const result = await Promise.resolve(guard.handler(to, from))

        if (result === false || typeof result === 'string') {
          return result
        }
      }
    }

    return true
  }

  /**
   * 检查权限
   */
  checkPermission(
    route: RouteRecordRaw,
    userPermissions: string[]
  ): boolean {
    if (!this.options.enablePermissionCheck) {
      return true
    }

    const permissionConfig = route.meta?.permission as PermissionConfig | undefined

    if (!permissionConfig) {
      return true
    }

    if (permissionConfig.validator) {
      return permissionConfig.validator(userPermissions)
    }

    const { required, mode } = permissionConfig

    if (mode === 'all') {
      return required.every(perm => userPermissions.includes(perm))
    } else {
      return required.some(perm => userPermissions.includes(perm))
    }
  }

  /**
   * 判断是否为动态路由
   */
  private isDynamicRoute(path: string): boolean {
    return path.includes(':')
  }

  /**
   * 检查路径是否匹配模式
   */
  private pathMatchesPattern(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')

    if (patternParts.length !== pathParts.length) {
      return false
    }

    return patternParts.every((part, i) => {
      if (part.startsWith(':')) {
        return true
      }
      const pathPart = pathParts[i]
      if (!pathPart) return false
      return this.options.caseSensitive
        ? part === pathPart
        : part.toLowerCase() === pathPart.toLowerCase()
    })
  }

  /**
   * 计算模糊匹配得分
   */
  private calculateFuzzyScore(routePath: string, targetPath: string): number {
    const route = this.options.caseSensitive ? routePath : routePath.toLowerCase()
    const target = this.options.caseSensitive ? targetPath : targetPath.toLowerCase()

    let score = 0
    let targetIndex = 0

    for (let i = 0; i < route.length && targetIndex < target.length; i++) {
      const routeChar = route[i]
      if (routeChar && routeChar === target[targetIndex]) {
        score += 2
        targetIndex++
      } else if (routeChar && target.includes(routeChar)) {
        score += 1
      }
    }

    // 长度匹配加分
    const lengthRatio = Math.min(route.length, target.length) / Math.max(route.length, target.length)
    score += lengthRatio * 20

    return Math.min(score, 100)
  }

  /**
   * 规范化路径
   */
  private normalizePath(path: string): string {
    let normalized = path

    if (!this.options.caseSensitive) {
      normalized = normalized.toLowerCase()
    }

    if (!this.options.strictTrailingSlash) {
      normalized = normalized.replace(/\/+$/, '')
    }

    return normalized || '/'
  }

  /**
   * 获取所有路由
   */
  getRoutes(): RouteRecordRaw[] {
    return Array.from(this.routes.values())
  }

  /**
   * 获取所有分组
   */
  getGroups(): RouteGroupConfig[] {
    return Array.from(this.groups.values())
  }

  /**
   * 移除路由
   */
  removeRoute(path: string): boolean {
    const normalizedPath = this.normalizePath(path)
    return this.routes.delete(normalizedPath)
  }

  /**
   * 清除所有路由
   */
  clear(): void {
    this.routes.clear()
    this.groups.clear()
    this.paramValidators.clear()
    this.globalGuards = []
  }
}

/**
 * 创建增强路由匹配器
 */
export function createEnhancedMatcher(
  options?: EnhancedMatcherOptions
): EnhancedRouteMatcher {
  return new EnhancedRouteMatcher(options)
}
