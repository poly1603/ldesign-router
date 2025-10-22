/**
 * 统一错误处理系统
 * 
 * 提供类型安全的错误类型和错误码
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 导航错误 (E001-E099)
  NAVIGATION_CANCELLED = 'E001',
  NAVIGATION_DUPLICATED = 'E002',
  NAVIGATION_ABORTED = 'E003',
  NAVIGATION_REDIRECTED = 'E004',
  NAVIGATION_TIMEOUT = 'E005',
  MAX_REDIRECTS_EXCEEDED = 'E006',

  // 匹配器错误 (E100-E199)
  ROUTE_NOT_FOUND = 'E100',
  INVALID_ROUTE_PATH = 'E101',
  INVALID_ROUTE_NAME = 'E102',
  DUPLICATE_ROUTE_NAME = 'E103',
  PARENT_ROUTE_NOT_FOUND = 'E104',
  MISSING_REQUIRED_PARAM = 'E105',

  // 守卫错误 (E200-E299)
  GUARD_REJECTED = 'E200',
  GUARD_TIMEOUT = 'E201',
  GUARD_EXECUTION_ERROR = 'E202',

  // 组件错误 (E300-E399)
  COMPONENT_LOAD_FAILED = 'E300',
  COMPONENT_NOT_FOUND = 'E301',
  COMPONENT_TIMEOUT = 'E302',

  // 缓存错误 (E400-E499)
  CACHE_OVERFLOW = 'E400',
  CACHE_CORRUPTION = 'E401',

  // 内存错误 (E500-E599)
  MEMORY_LEAK_DETECTED = 'E500',
  OUT_OF_MEMORY = 'E501',

  // 配置错误 (E600-E699)
  INVALID_CONFIG = 'E600',
  MISSING_REQUIRED_CONFIG = 'E601',

  // 未知错误
  UNKNOWN_ERROR = 'E999'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 错误上下文
 */
export interface ErrorContext {
  timestamp: number
  route?: RouteLocationNormalized
  from?: RouteLocationNormalized
  stackTrace?: string
  [key: string]: unknown
}

/**
 * 基础路由器错误类
 */
export class RouterError extends Error {
  public readonly code: ErrorCode
  public readonly severity: ErrorSeverity
  public readonly context: ErrorContext
  public readonly timestamp: number

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: Partial<ErrorContext> = {}
  ) {
    super(message)
    this.name = 'RouterError'
    this.code = code
    this.severity = severity
    this.timestamp = Date.now()

    this.context = {
      timestamp: this.timestamp,
      ...context
    }

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    // 优化堆栈跟踪
    this.stack = this.optimizeStackTrace(this.stack)
  }

  /**
   * 优化堆栈跟踪（过滤框架内部堆栈）
   */
  private optimizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined

    const lines = stack.split('\n')
    const filtered = lines.filter(line => {
      // 过滤内部实现细节
      return !line.includes('node_modules') &&
        !line.includes('internal/') &&
        !line.includes('guard-executor.ts') &&
        !line.includes('matcher.ts')
    })

    return filtered.join('\n')
  }

  /**
   * 转换为JSON
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp,
      context: this.context
    }
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `[${this.code}] ${this.message}`
  }
}

/**
 * 导航错误
 */
export class NavigationError extends RouterError {
  public readonly to: RouteLocationNormalized
  public readonly from: RouteLocationNormalized

  constructor(
    message: string,
    code: ErrorCode,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    severity: ErrorSeverity = ErrorSeverity.WARNING
  ) {
    super(message, code, severity, { route: to, from })
    this.name = 'NavigationError'
    this.to = to
    this.from = from
  }
}

/**
 * 导航取消错误
 */
export class NavigationCancelledError extends NavigationError {
  constructor(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    super(
      'Navigation was cancelled',
      ErrorCode.NAVIGATION_CANCELLED,
      to,
      from,
      ErrorSeverity.INFO
    )
    this.name = 'NavigationCancelledError'
  }
}

/**
 * 导航重复错误
 */
export class NavigationDuplicatedError extends NavigationError {
  constructor(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    super(
      'Attempted to navigate to the same route',
      ErrorCode.NAVIGATION_DUPLICATED,
      to,
      from,
      ErrorSeverity.INFO
    )
    this.name = 'NavigationDuplicatedError'
  }
}

/**
 * 导航中止错误
 */
export class NavigationAbortedError extends NavigationError {
  constructor(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    reason?: string
  ) {
    super(
      `Navigation aborted${reason ? `: ${reason}` : ''}`,
      ErrorCode.NAVIGATION_ABORTED,
      to,
      from,
      ErrorSeverity.WARNING
    )
    this.name = 'NavigationAbortedError'
  }
}

/**
 * 最大重定向错误
 */
export class MaxRedirectsError extends NavigationError {
  constructor(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    maxRedirects: number
  ) {
    super(
      `Maximum redirect limit (${maxRedirects}) exceeded`,
      ErrorCode.MAX_REDIRECTS_EXCEEDED,
      to,
      from,
      ErrorSeverity.ERROR
    )
    this.name = 'MaxRedirectsError'
  }
}

/**
 * 匹配器错误
 */
export class MatcherError extends RouterError {
  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) {
    super(message, code, severity)
    this.name = 'MatcherError'
  }
}

/**
 * 路由未找到错误
 */
export class RouteNotFoundError extends MatcherError {
  public readonly path: string

  constructor(path: string) {
    super(
      `No route found for path: ${path}`,
      ErrorCode.ROUTE_NOT_FOUND,
      ErrorSeverity.ERROR
    )
    this.name = 'RouteNotFoundError'
    this.path = path
  }
}

/**
 * 无效路由路径错误
 */
export class InvalidRoutePathError extends MatcherError {
  public readonly path: string

  constructor(path: string, reason?: string) {
    super(
      `Invalid route path: ${path}${reason ? ` - ${reason}` : ''}`,
      ErrorCode.INVALID_ROUTE_PATH,
      ErrorSeverity.ERROR
    )
    this.name = 'InvalidRoutePathError'
    this.path = path
  }
}

/**
 * 缺少必需参数错误
 */
export class MissingParamError extends MatcherError {
  public readonly paramName: string

  constructor(paramName: string) {
    super(
      `Missing required parameter: ${paramName}`,
      ErrorCode.MISSING_REQUIRED_PARAM,
      ErrorSeverity.ERROR
    )
    this.name = 'MissingParamError'
    this.paramName = paramName
  }
}

/**
 * 守卫错误
 */
export class GuardError extends RouterError {
  public readonly guardName?: string

  constructor(
    message: string,
    code: ErrorCode,
    guardName?: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) {
    super(message, code, severity, { guardName })
    this.name = 'GuardError'
    this.guardName = guardName
  }
}

/**
 * 守卫拒绝错误
 */
export class GuardRejectedError extends GuardError {
  constructor(guardName?: string) {
    super(
      `Navigation rejected by guard${guardName ? `: ${guardName}` : ''}`,
      ErrorCode.GUARD_REJECTED,
      guardName,
      ErrorSeverity.WARNING
    )
    this.name = 'GuardRejectedError'
  }
}

/**
 * 守卫超时错误
 */
export class GuardTimeoutError extends GuardError {
  public readonly timeout: number

  constructor(guardName: string | undefined, timeout: number) {
    super(
      `Guard execution timeout after ${timeout}ms${guardName ? `: ${guardName}` : ''}`,
      ErrorCode.GUARD_TIMEOUT,
      guardName,
      ErrorSeverity.ERROR
    )
    this.name = 'GuardTimeoutError'
    this.timeout = timeout
  }
}

/**
 * 组件加载错误
 */
export class ComponentError extends RouterError {
  public readonly componentName?: string

  constructor(
    message: string,
    code: ErrorCode,
    componentName?: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) {
    super(message, code, severity, { componentName })
    this.name = 'ComponentError'
    this.componentName = componentName
  }
}

/**
 * 组件加载失败错误
 */
export class ComponentLoadFailedError extends ComponentError {
  public readonly originalError?: Error

  constructor(componentName: string, originalError?: Error) {
    super(
      `Failed to load component: ${componentName}`,
      ErrorCode.COMPONENT_LOAD_FAILED,
      componentName,
      ErrorSeverity.ERROR
    )
    this.name = 'ComponentLoadFailedError'
    this.originalError = originalError
  }
}

/**
 * 内存错误
 */
export class MemoryError extends RouterError {
  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.CRITICAL
  ) {
    super(message, code, severity)
    this.name = 'MemoryError'
  }
}

/**
 * 内存泄漏检测错误
 */
export class MemoryLeakError extends MemoryError {
  public readonly leakInfo: {
    initialSize: number
    currentSize: number
    duration: number
  }

  constructor(leakInfo: MemoryLeakError['leakInfo']) {
    super(
      `Potential memory leak detected: ${leakInfo.currentSize} bytes (initial: ${leakInfo.initialSize}, duration: ${leakInfo.duration}ms)`,
      ErrorCode.MEMORY_LEAK_DETECTED,
      ErrorSeverity.CRITICAL
    )
    this.name = 'MemoryLeakError'
    this.leakInfo = leakInfo
  }
}

/**
 * 错误处理器
 */
export type ErrorHandler = (error: RouterError) => void

/**
 * 错误处理器管理器
 */
export class ErrorHandlerManager {
  private handlers = new Map<ErrorCode | 'all', Set<ErrorHandler>>()
  private globalHandlers = new Set<ErrorHandler>()

  /**
   * 添加错误处理器
   */
  on(code: ErrorCode | 'all', handler: ErrorHandler): () => void {
    if (code === 'all') {
      this.globalHandlers.add(handler)
      return () => this.globalHandlers.delete(handler)
    }

    if (!this.handlers.has(code)) {
      this.handlers.set(code, new Set())
    }

    const handlers = this.handlers.get(code)!
    handlers.add(handler)

    return () => handlers.delete(handler)
  }

  /**
   * 移除错误处理器
   */
  off(code: ErrorCode | 'all', handler: ErrorHandler): boolean {
    if (code === 'all') {
      return this.globalHandlers.delete(handler)
    }

    const handlers = this.handlers.get(code)
    return handlers ? handlers.delete(handler) : false
  }

  /**
   * 触发错误处理器
   */
  emit(error: RouterError): void {
    // 触发全局处理器
    this.globalHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (err) {
        console.error('[ErrorHandler] Error in global error handler:', err)
      }
    })

    // 触发特定错误码的处理器
    const handlers = this.handlers.get(error.code)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(error)
        } catch (err) {
          console.error(`[ErrorHandler] Error in handler for ${error.code}:`, err)
        }
      })
    }
  }

  /**
   * 清空所有处理器
   */
  clear(): void {
    this.handlers.clear()
    this.globalHandlers.clear()
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      globalHandlers: this.globalHandlers.size,
      specificHandlers: this.handlers.size,
      totalHandlers: this.globalHandlers.size +
        Array.from(this.handlers.values()).reduce((sum, set) => sum + set.size, 0)
    }
  }
}

/**
 * 错误类型守卫
 */
export function isRouterError(error: unknown): error is RouterError {
  return error instanceof RouterError
}

export function isNavigationError(error: unknown): error is NavigationError {
  return error instanceof NavigationError
}

export function isNavigationCancelledError(error: unknown): error is NavigationCancelledError {
  return error instanceof NavigationCancelledError
}

export function isNavigationDuplicatedError(error: unknown): error is NavigationDuplicatedError {
  return error instanceof NavigationDuplicatedError
}

export function isNavigationAbortedError(error: unknown): error is NavigationAbortedError {
  return error instanceof NavigationAbortedError
}

export function isMatcherError(error: unknown): error is MatcherError {
  return error instanceof MatcherError
}

export function isRouteNotFoundError(error: unknown): error is RouteNotFoundError {
  return error instanceof RouteNotFoundError
}

export function isGuardError(error: unknown): error is GuardError {
  return error instanceof GuardError
}

export function isComponentError(error: unknown): error is ComponentError {
  return error instanceof ComponentError
}

export function isMemoryError(error: unknown): error is MemoryError {
  return error instanceof MemoryError
}

/**
 * 错误工厂函数
 */
export const ErrorFactory = {
  /**
   * 创建导航取消错误
   */
  navigationCancelled(to: RouteLocationNormalized, from: RouteLocationNormalized): NavigationCancelledError {
    return new NavigationCancelledError(to, from)
  },

  /**
   * 创建导航重复错误
   */
  navigationDuplicated(to: RouteLocationNormalized, from: RouteLocationNormalized): NavigationDuplicatedError {
    return new NavigationDuplicatedError(to, from)
  },

  /**
   * 创建导航中止错误
   */
  navigationAborted(to: RouteLocationNormalized, from: RouteLocationNormalized, reason?: string): NavigationAbortedError {
    return new NavigationAbortedError(to, from, reason)
  },

  /**
   * 创建最大重定向错误
   */
  maxRedirects(to: RouteLocationNormalized, from: RouteLocationNormalized, max: number): MaxRedirectsError {
    return new MaxRedirectsError(to, from, max)
  },

  /**
   * 创建路由未找到错误
   */
  routeNotFound(path: string): RouteNotFoundError {
    return new RouteNotFoundError(path)
  },

  /**
   * 创建无效路径错误
   */
  invalidPath(path: string, reason?: string): InvalidRoutePathError {
    return new InvalidRoutePathError(path, reason)
  },

  /**
   * 创建缺少参数错误
   */
  missingParam(paramName: string): MissingParamError {
    return new MissingParamError(paramName)
  },

  /**
   * 创建守卫拒绝错误
   */
  guardRejected(guardName?: string): GuardRejectedError {
    return new GuardRejectedError(guardName)
  },

  /**
   * 创建守卫超时错误
   */
  guardTimeout(guardName: string | undefined, timeout: number): GuardTimeoutError {
    return new GuardTimeoutError(guardName, timeout)
  },

  /**
   * 创建组件加载失败错误
   */
  componentLoadFailed(componentName: string, originalError?: Error): ComponentLoadFailedError {
    return new ComponentLoadFailedError(componentName, originalError)
  },

  /**
   * 创建内存泄漏错误
   */
  memoryLeak(leakInfo: MemoryLeakError['leakInfo']): MemoryLeakError {
    return new MemoryLeakError(leakInfo)
  }
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  canRecover(error: RouterError): boolean
  recover(error: RouterError): Promise<void> | void
}

/**
 * 导航错误恢复策略
 */
export class NavigationErrorRecovery implements ErrorRecoveryStrategy {
  constructor(private router: { push: (to: string) => Promise<unknown> }) { }

  canRecover(error: RouterError): boolean {
    return isNavigationError(error) &&
      error.code !== ErrorCode.MAX_REDIRECTS_EXCEEDED
  }

  async recover(error: RouterError): Promise<void> {
    if (isNavigationError(error)) {
      // 尝试回到上一个路由
      await this.router.push(error.from.path)
    }
  }
}

/**
 * 路由未找到恢复策略
 */
export class RouteNotFoundRecovery implements ErrorRecoveryStrategy {
  constructor(
    private router: { push: (to: string) => Promise<unknown> },
    private fallbackRoute = '/404'
  ) { }

  canRecover(error: RouterError): boolean {
    return isRouteNotFoundError(error)
  }

  async recover(error: RouterError): Promise<void> {
    if (isRouteNotFoundError(error)) {
      await this.router.push(this.fallbackRoute)
    }
  }
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = []

  /**
   * 添加恢复策略
   */
  addStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.push(strategy)
  }

  /**
   * 尝试恢复错误
   */
  async tryRecover(error: RouterError): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover(error)
          return true
        } catch (recoveryError) {
          console.error('[ErrorRecovery] Recovery failed:', recoveryError)
        }
      }
    }

    return false
  }

  /**
   * 清空策略
   */
  clear(): void {
    this.strategies = []
  }
}

/**
 * 默认错误处理器管理器
 */
let defaultErrorHandlerManager: ErrorHandlerManager | null = null

/**
 * 获取默认错误处理器管理器
 */
export function getErrorHandlerManager(): ErrorHandlerManager {
  if (!defaultErrorHandlerManager) {
    defaultErrorHandlerManager = new ErrorHandlerManager()
  }
  return defaultErrorHandlerManager
}

/**
 * 销毁默认错误处理器管理器
 */
export function destroyErrorHandlerManager(): void {
  if (defaultErrorHandlerManager) {
    defaultErrorHandlerManager.clear()
    defaultErrorHandlerManager = null
  }
}

/**
 * 快捷函数：处理路由器错误
 */
export function handleRouterError(
  error: Error | RouterError,
  defaultMessage = 'An unknown router error occurred'
): void {
  if (isRouterError(error)) {
    getErrorHandlerManager().emit(error)
  } else {
    const routerError = new RouterError(
      error.message || defaultMessage,
      ErrorCode.UNKNOWN_ERROR,
      ErrorSeverity.ERROR
    )
    getErrorHandlerManager().emit(routerError)
  }
}

/**
 * 错误日志记录器
 */
export class ErrorLogger {
  private logs: Array<{
    error: RouterError
    timestamp: number
  }> = []

  private maxLogs = 100

  /**
   * 记录错误
   */
  log(error: RouterError): void {
    this.logs.push({
      error,
      timestamp: Date.now()
    })

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 控制台输出
    this.consoleLog(error)
  }

  /**
   * 控制台输出
   */
  private consoleLog(error: RouterError): void {
    const prefix = `[Router ${error.code}]`

    switch (error.severity) {
      case ErrorSeverity.INFO:
        console.info(prefix, error.message)
        break
      case ErrorSeverity.WARNING:
        console.warn(prefix, error.message, error.context)
        break
      case ErrorSeverity.ERROR:
        console.error(prefix, error.message, error.context)
        break
      case ErrorSeverity.CRITICAL:
        console.error(prefix, '🚨 CRITICAL:', error.message, error.context)
        break
    }
  }

  /**
   * 获取错误日志
   */
  getLogs(): ReadonlyArray<{ error: RouterError, timestamp: number }> {
    return this.logs
  }

  /**
   * 获取最近的错误
   */
  getRecent(count = 10): ReadonlyArray<{ error: RouterError, timestamp: number }> {
    return this.logs.slice(-count)
  }

  /**
   * 按错误码过滤
   */
  filterByCode(code: ErrorCode): Array<{ error: RouterError, timestamp: number }> {
    return this.logs.filter(log => log.error.code === code)
  }

  /**
   * 按严重级别过滤
   */
  filterBySeverity(severity: ErrorSeverity): Array<{ error: RouterError, timestamp: number }> {
    return this.logs.filter(log => log.error.severity === severity)
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = []
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const bySeverity = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0
    }

    const byCode = new Map<ErrorCode, number>()

    this.logs.forEach(log => {
      bySeverity[log.error.severity]++
      byCode.set(log.error.code, (byCode.get(log.error.code) || 0) + 1)
    })

    return {
      total: this.logs.length,
      bySeverity,
      byCode: Object.fromEntries(byCode)
    }
  }
}

/**
 * 默认错误日志记录器
 */
let defaultErrorLogger: ErrorLogger | null = null

/**
 * 获取默认错误日志记录器
 */
export function getErrorLogger(): ErrorLogger {
  if (!defaultErrorLogger) {
    defaultErrorLogger = new ErrorLogger()
  }
  return defaultErrorLogger
}

/**
 * 销毁默认错误日志记录器
 */
export function destroyErrorLogger(): void {
  if (defaultErrorLogger) {
    defaultErrorLogger.clear()
    defaultErrorLogger = null
  }
}

/**
 * 导出所有错误类型
 */
export {
  RouterError,
  NavigationError,
  NavigationCancelledError,
  NavigationDuplicatedError,
  NavigationAbortedError,
  MaxRedirectsError,
  MatcherError,
  RouteNotFoundError,
  InvalidRoutePathError,
  MissingParamError,
  GuardError,
  GuardRejectedError,
  GuardTimeoutError,
  ComponentError,
  ComponentLoadFailedError,
  MemoryError,
  MemoryLeakError
}


