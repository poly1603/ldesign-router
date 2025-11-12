/**
 * @ldesign/router-core 路由验证器
 * 
 * @description
 * 在开发模式下验证路由配置的正确性。
 * 
 * **特性**：
 * - 路由配置验证
 * - 路径冲突检测
 * - 循环重定向检测
 * - 命名冲突检测
 * - 最佳实践建议
 * 
 * @module utils/validator
 */

import type { RouteRecordRaw } from '../types'

/**
 * 验证错误级别
 */
export type ValidationLevel = 'error' | 'warning' | 'info'

/**
 * 验证问题
 */
export interface ValidationIssue {
  /** 级别 */
  level: ValidationLevel
  
  /** 消息 */
  message: string
  
  /** 路由路径 */
  path?: string
  
  /** 路由名称 */
  name?: string | symbol
  
  /** 建议 */
  suggestion?: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  
  /** 错误数量 */
  errorCount: number
  
  /** 警告数量 */
  warningCount: number
  
  /** 信息数量 */
  infoCount: number
  
  /** 问题列表 */
  issues: ValidationIssue[]
}

/**
 * 验证选项
 */
export interface ValidatorOptions {
  /** 是否严格模式 */
  strict?: boolean
  
  /** 是否检查最佳实践 */
  checkBestPractices?: boolean
  
  /** 自定义规则 */
  customRules?: ValidationRule[]
}

/**
 * 验证规则
 */
export type ValidationRule = (
  routes: RouteRecordRaw[],
  issues: ValidationIssue[],
) => void

/**
 * 路由验证器
 */
export class RouteValidator {
  private options: Required<Omit<ValidatorOptions, 'customRules'>> & {
    customRules: ValidationRule[]
  }

  constructor(options: ValidatorOptions = {}) {
    this.options = {
      strict: options.strict ?? false,
      checkBestPractices: options.checkBestPractices ?? true,
      customRules: options.customRules || [],
    }
  }

  // ==================== 验证 ====================

  /**
   * 验证路由配置
   */
  validate(routes: RouteRecordRaw[]): ValidationResult {
    const issues: ValidationIssue[] = []

    // 基础验证
    this.validateBasic(routes, issues)

    // 路径冲突检测
    this.checkPathConflicts(routes, issues)

    // 命名冲突检测
    this.checkNameConflicts(routes, issues)

    // 循环重定向检测
    this.checkCircularRedirects(routes, issues)

    // 最佳实践检查
    if (this.options.checkBestPractices) {
      this.checkBestPractices(routes, issues)
    }

    // 自定义规则
    for (const rule of this.options.customRules) {
      rule(routes, issues)
    }

    // 统计
    const errorCount = issues.filter(i => i.level === 'error').length
    const warningCount = issues.filter(i => i.level === 'warning').length
    const infoCount = issues.filter(i => i.level === 'info').length

    return {
      valid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      issues,
    }
  }

  // ==================== 基础验证 ====================

  /**
   * 基础验证
   */
  private validateBasic(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
    for (const route of routes) {
      // 验证路径
      if (!route.path) {
        issues.push({
          level: 'error',
          message: 'Route path is required',
          name: route.name,
        })
      } else {
        // 路径格式检查
        if (route.path.includes('//')) {
          issues.push({
            level: 'warning',
            message: `Path contains consecutive slashes: ${route.path}`,
            path: route.path,
            suggestion: 'Remove consecutive slashes',
          })
        }

        // 通配符检查
        if (route.path.includes('*') && !route.path.endsWith('*') && route.path !== '*') {
          issues.push({
            level: 'warning',
            message: `Wildcard should be at the end: ${route.path}`,
            path: route.path,
            suggestion: 'Move wildcard to the end of the path',
          })
        }
      }

      // 验证名称
      if (route.name !== undefined) {
        if (typeof route.name !== 'string' && typeof route.name !== 'symbol') {
          issues.push({
            level: 'error',
            message: `Invalid route name type: ${typeof route.name}`,
            path: route.path,
            suggestion: 'Route name must be string or symbol',
          })
        }

        if (typeof route.name === 'string' && route.name.trim() === '') {
          issues.push({
            level: 'error',
            message: 'Route name cannot be empty',
            path: route.path,
          })
        }
      }

      // 验证组件和重定向
      if (route.redirect && (route.component || route.components)) {
        issues.push({
          level: 'warning',
          message: 'Route has both redirect and component',
          path: route.path,
          suggestion: 'Use either redirect or component, not both',
        })
      }

      // 递归验证子路由
      if (route.children) {
        this.validateBasic(route.children, issues)
      }
    }
  }

  // ==================== 冲突检测 ====================

  /**
   * 检查路径冲突
   */
  private checkPathConflicts(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
    const paths = new Map<string, RouteRecordRaw[]>()

    const collectPaths = (routes: RouteRecordRaw[], parent: string = '') => {
      for (const route of routes) {
        const fullPath = this.joinPaths(parent, route.path)
        
        if (!paths.has(fullPath)) {
          paths.set(fullPath, [])
        }
        paths.get(fullPath)!.push(route)

        if (route.children) {
          collectPaths(route.children, fullPath)
        }
      }
    }

    collectPaths(routes)

    // 检查重复路径
    for (const [path, conflictRoutes] of paths.entries()) {
      if (conflictRoutes.length > 1) {
        issues.push({
          level: 'error',
          message: `Duplicate path found: ${path}`,
          path,
          suggestion: 'Each path should be unique',
        })
      }
    }
  }

  /**
   * 检查命名冲突
   */
  private checkNameConflicts(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
    const names = new Map<string | symbol, RouteRecordRaw[]>()

    const collectNames = (routes: RouteRecordRaw[]) => {
      for (const route of routes) {
        if (route.name) {
          if (!names.has(route.name)) {
            names.set(route.name, [])
          }
          names.get(route.name)!.push(route)
        }

        if (route.children) {
          collectNames(route.children)
        }
      }
    }

    collectNames(routes)

    // 检查重复名称
    for (const [name, conflictRoutes] of names.entries()) {
      if (conflictRoutes.length > 1) {
        issues.push({
          level: 'error',
          message: `Duplicate route name: ${String(name)}`,
          name,
          suggestion: 'Each route name should be unique',
        })
      }
    }
  }

  /**
   * 检查循环重定向
   */
  private checkCircularRedirects(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
    const redirects = new Map<string, string>()

    // 收集重定向
    const collectRedirects = (routes: RouteRecordRaw[], parent: string = '') => {
      for (const route of routes) {
        const fullPath = this.joinPaths(parent, route.path)

        if (route.redirect && typeof route.redirect === 'string') {
          redirects.set(fullPath, route.redirect)
        }

        if (route.children) {
          collectRedirects(route.children, fullPath)
        }
      }
    }

    collectRedirects(routes)

    // 检查循环
    for (const [path, target] of redirects.entries()) {
      const visited = new Set<string>()
      let current = target

      while (redirects.has(current)) {
        if (visited.has(current)) {
          issues.push({
            level: 'error',
            message: `Circular redirect detected: ${path} -> ${target}`,
            path,
            suggestion: 'Remove circular redirect chain',
          })
          break
        }

        visited.add(current)
        current = redirects.get(current)!
      }
    }
  }

  // ==================== 最佳实践 ====================

  /**
   * 检查最佳实践
   */
  private checkBestPractices(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
    const checkRoute = (route: RouteRecordRaw, parent: string = '') => {
      // 建议使用命名路由
      if (!route.name && !route.redirect && route.component) {
        issues.push({
          level: 'info',
          message: `Consider adding a name to route: ${route.path}`,
          path: route.path,
          suggestion: 'Named routes are easier to navigate programmatically',
        })
      }

      // 建议为动态路由添加 props
      if (route.path.includes(':') && route.component && !route.props) {
        issues.push({
          level: 'info',
          message: `Consider using props for dynamic route: ${route.path}`,
          path: route.path,
          suggestion: 'Props make components more reusable',
        })
      }

      // 检查路径长度
      const fullPath = this.joinPaths(parent, route.path)
      if (fullPath.split('/').filter(Boolean).length > 5) {
        issues.push({
          level: 'info',
          message: `Deep nesting detected: ${fullPath}`,
          path: fullPath,
          suggestion: 'Consider flattening route structure',
        })
      }

      // 递归检查子路由
      if (route.children) {
        for (const child of route.children) {
          checkRoute(child, fullPath)
        }
      }
    }

    for (const route of routes) {
      checkRoute(route)
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 拼接路径
   */
  private joinPaths(parent: string, child: string): string {
    if (!parent || parent === '/') {
      return child.startsWith('/') ? child : '/' + child
    }

    if (child.startsWith('/')) {
      return child
    }

    return parent.replace(/\/$/, '') + '/' + child
  }
}

/**
 * 创建路由验证器
 */
export function createValidator(options?: ValidatorOptions): RouteValidator {
  return new RouteValidator(options)
}

/**
 * 快速验证路由
 */
export function validateRoutes(
  routes: RouteRecordRaw[],
  options?: ValidatorOptions,
): ValidationResult {
  const validator = createValidator(options)
  return validator.validate(routes)
}

// ==================== 内置规则 ====================

/**
 * 检查404路由
 */
export function check404Route(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
  const has404 = routes.some(r => r.path === '*' || r.path === '/:pathMatch(.*)*')

  if (!has404) {
    issues.push({
      level: 'warning',
      message: 'No 404 (catch-all) route found',
      suggestion: 'Add a catch-all route to handle 404 pages',
    })
  }
}

/**
 * 检查根路由
 */
export function checkRootRoute(routes: RouteRecordRaw[], issues: ValidationIssue[]): void {
  const hasRoot = routes.some(r => r.path === '/')

  if (!hasRoot) {
    issues.push({
      level: 'warning',
      message: 'No root route (/) found',
      suggestion: 'Add a root route for the home page',
    })
  }
}

/**
 * 生成验证报告
 */
export function generateReport(result: ValidationResult): string {
  let report = '=== Route Validation Report ===\n\n'

  report += `Status: ${result.valid ? '✓ PASS' : '✗ FAIL'}\n`
  report += `Errors: ${result.errorCount}\n`
  report += `Warnings: ${result.warningCount}\n`
  report += `Info: ${result.infoCount}\n\n`

  if (result.issues.length > 0) {
    report += 'Issues:\n'

    // 按级别分组
    const errors = result.issues.filter(i => i.level === 'error')
    const warnings = result.issues.filter(i => i.level === 'warning')
    const infos = result.issues.filter(i => i.level === 'info')

    if (errors.length > 0) {
      report += '\nErrors:\n'
      for (const issue of errors) {
        report += `  ✗ ${issue.message}\n`
        if (issue.path) report += `    Path: ${issue.path}\n`
        if (issue.suggestion) report += `    Suggestion: ${issue.suggestion}\n`
      }
    }

    if (warnings.length > 0) {
      report += '\nWarnings:\n'
      for (const issue of warnings) {
        report += `  ⚠ ${issue.message}\n`
        if (issue.path) report += `    Path: ${issue.path}\n`
        if (issue.suggestion) report += `    Suggestion: ${issue.suggestion}\n`
      }
    }

    if (infos.length > 0) {
      report += '\nInfo:\n'
      for (const issue of infos) {
        report += `  ℹ ${issue.message}\n`
        if (issue.path) report += `    Path: ${issue.path}\n`
        if (issue.suggestion) report += `    Suggestion: ${issue.suggestion}\n`
      }
    }
  } else {
    report += 'No issues found! ✓\n'
  }

  return report
}
