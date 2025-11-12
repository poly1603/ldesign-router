/**
 * @ldesign/router-core 错误处理
 * 
 * @description
 * 提供统一的路由错误类型和处理机制。
 * 
 * **特性**：
 * - 统一错误类型
 * - 错误工厂函数
 * - 错误恢复策略
 * - 错误日志记录
 * 
 * @module utils/errors
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 错误类型
 */
export type RouterErrorType =
  | 'navigation'    // 导航错误
  | 'guard'         // 守卫错误
  | 'matcher'       // 匹配错误
  | 'config'        // 配置错误
  | 'component'     // 组件错误
  | 'history'       // 历史记录错误

/**
 * 错误代码
 */
export enum RouterErrorCode {
  // 导航错误 (1xxx)
  NAVIGATION_CANCELLED = 'ERR_NAVIGATION_CANCELLED',
  NAVIGATION_ABORTED = 'ERR_NAVIGATION_ABORTED',
  NAVIGATION_DUPLICATED = 'ERR_NAVIGATION_DUPLICATED',
  NAVIGATION_FAILED = 'ERR_NAVIGATION_FAILED',
  
  // 守卫错误 (2xxx)
  GUARD_REJECTED = 'ERR_GUARD_REJECTED',
  GUARD_ERROR = 'ERR_GUARD_ERROR',
  GUARD_TIMEOUT = 'ERR_GUARD_TIMEOUT',
  
  // 匹配错误 (3xxx)
  NO_MATCH = 'ERR_NO_MATCH',
  INVALID_PARAMS = 'ERR_INVALID_PARAMS',
  INVALID_PATH = 'ERR_INVALID_PATH',
  
  // 配置错误 (4xxx)
  INVALID_ROUTE_CONFIG = 'ERR_INVALID_ROUTE_CONFIG',
  DUPLICATE_ROUTE = 'ERR_DUPLICATE_ROUTE',
  MISSING_REQUIRED_FIELD = 'ERR_MISSING_REQUIRED_FIELD',
  
  // 组件错误 (5xxx)
  COMPONENT_LOAD_FAILED = 'ERR_COMPONENT_LOAD_FAILED',
  COMPONENT_NOT_FOUND = 'ERR_COMPONENT_NOT_FOUND',
  
  // 历史错误 (6xxx)
  HISTORY_NOT_SUPPORTED = 'ERR_HISTORY_NOT_SUPPORTED',
  HISTORY_OPERATION_FAILED = 'ERR_HISTORY_OPERATION_FAILED',
}

/**
 * 路由错误基类
 */
export class RouterError extends Error {
  /** 错误类型 */
  type: RouterErrorType
  
  /** 错误代码 */
  code: RouterErrorCode | string
  
  /** 额外详情 */
  details?: unknown
  
  /** 错误发生时间 */
  timestamp: number
  
  /** 是否可恢复 */
  recoverable: boolean

  constructor(
    type: RouterErrorType,
    code: RouterErrorCode | string,
    message: string,
    details?: unknown,
    recoverable: boolean = false,
  ) {
    super(message)
    this.name = 'RouterError'
    this.type = type
    this.code = code
    this.details = details
    this.timestamp = Date.now()
    this.recoverable = recoverable

    // 确保错误栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 转为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      stack: this.stack,
    }
  }
}

/**
 * 导航错误
 */
export class NavigationError extends RouterError {
  to: RouteLocationNormalized
  from: RouteLocationNormalized

  constructor(
    code: RouterErrorCode | string,
    message: string,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    details?: unknown,
  ) {
    super('navigation', code, message, details, true)
    this.name = 'NavigationError'
    this.to = to
    this.from = from
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      to: this.to.path,
      from: this.from.path,
    }
  }
}

/**
 * 守卫错误
 */
export class GuardError extends RouterError {
  guardName?: string

  constructor(
    code: RouterErrorCode | string,
    message: string,
    guardName?: string,
    details?: unknown,
  ) {
    super('guard', code, message, details, false)
    this.name = 'GuardError'
    this.guardName = guardName
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      guardName: this.guardName,
    }
  }
}

/**
 * 匹配错误
 */
export class MatcherError extends RouterError {
  path: string

  constructor(
    code: RouterErrorCode | string,
    message: string,
    path: string,
    details?: unknown,
  ) {
    super('matcher', code, message, details, true)
    this.name = 'MatcherError'
    this.path = path
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      path: this.path,
    }
  }
}

/**
 * 配置错误
 */
export class ConfigError extends RouterError {
  constructor(
    code: RouterErrorCode | string,
    message: string,
    details?: unknown,
  ) {
    super('config', code, message, details, false)
    this.name = 'ConfigError'
  }
}

/**
 * 组件错误
 */
export class ComponentError extends RouterError {
  componentName?: string

  constructor(
    code: RouterErrorCode | string,
    message: string,
    componentName?: string,
    details?: unknown,
  ) {
    super('component', code, message, details, true)
    this.name = 'ComponentError'
    this.componentName = componentName
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      componentName: this.componentName,
    }
  }
}

/**
 * 历史错误
 */
export class HistoryError extends RouterError {
  constructor(
    code: RouterErrorCode | string,
    message: string,
    details?: unknown,
  ) {
    super('history', code, message, details, false)
    this.name = 'HistoryError'
  }
}

// ==================== 错误工厂函数 ====================

/**
 * 创建导航取消错误
 */
export function createNavigationCancelledError(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
): NavigationError {
  return new NavigationError(
    RouterErrorCode.NAVIGATION_CANCELLED,
    `Navigation to "${to.path}" was cancelled`,
    to,
    from,
  )
}

/**
 * 创建导航中止错误
 */
export function createNavigationAbortedError(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  reason?: string,
): NavigationError {
  return new NavigationError(
    RouterErrorCode.NAVIGATION_ABORTED,
    `Navigation to "${to.path}" was aborted${reason ? `: ${reason}` : ''}`,
    to,
    from,
  )
}

/**
 * 创建导航重复错误
 */
export function createNavigationDuplicatedError(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
): NavigationError {
  return new NavigationError(
    RouterErrorCode.NAVIGATION_DUPLICATED,
    `Navigation to "${to.path}" is duplicated`,
    to,
    from,
  )
}

/**
 * 创建守卫错误
 */
export function createGuardError(
  guardName: string,
  originalError: Error,
): GuardError {
  return new GuardError(
    RouterErrorCode.GUARD_ERROR,
    `Guard "${guardName}" threw an error: ${originalError.message}`,
    guardName,
    originalError,
  )
}

/**
 * 创建守卫超时错误
 */
export function createGuardTimeoutError(
  guardName: string,
  timeout: number,
): GuardError {
  return new GuardError(
    RouterErrorCode.GUARD_TIMEOUT,
    `Guard "${guardName}" timed out after ${timeout}ms`,
    guardName,
  )
}

/**
 * 创建路径不匹配错误
 */
export function createNoMatchError(path: string): MatcherError {
  return new MatcherError(
    RouterErrorCode.NO_MATCH,
    `No route matches path "${path}"`,
    path,
  )
}

/**
 * 创建无效参数错误
 */
export function createInvalidParamsError(
  path: string,
  params: unknown,
): MatcherError {
  return new MatcherError(
    RouterErrorCode.INVALID_PARAMS,
    `Invalid params for path "${path}"`,
    path,
    params,
  )
}

/**
 * 创建无效配置错误
 */
export function createInvalidConfigError(
  field: string,
  details?: unknown,
): ConfigError {
  return new ConfigError(
    RouterErrorCode.INVALID_ROUTE_CONFIG,
    `Invalid route config: ${field}`,
    details,
  )
}

/**
 * 创建组件加载失败错误
 */
export function createComponentLoadError(
  componentName: string,
  originalError: Error,
): ComponentError {
  return new ComponentError(
    RouterErrorCode.COMPONENT_LOAD_FAILED,
    `Failed to load component "${componentName}": ${originalError.message}`,
    componentName,
    originalError,
  )
}

/**
 * 创建历史不支持错误
 */
export function createHistoryNotSupportedError(): HistoryError {
  return new HistoryError(
    RouterErrorCode.HISTORY_NOT_SUPPORTED,
    'History API is not supported in this environment',
  )
}

// ==================== 错误处理器 ====================

/**
 * 错误处理器类型
 */
export type ErrorHandler = (error: RouterError) => void

/**
 * 错误恢复策略
 */
export type RecoveryStrategy = (
  error: RouterError,
) => RouteLocationNormalized | null

/**
 * 错误管理器
 */
export class ErrorManager {
  private handlers: ErrorHandler[] = []
  private recoveryStrategies = new Map<RouterErrorCode | string, RecoveryStrategy>()
  private errorLog: RouterError[] = []
  private maxLogSize = 100

  /**
   * 注册错误处理器
   */
  onError(handler: ErrorHandler): () => void {
    this.handlers.push(handler)
    return () => {
      const index = this.handlers.indexOf(handler)
      if (index >= 0) {
        this.handlers.splice(index, 1)
      }
    }
  }

  /**
   * 注册恢复策略
   */
  registerRecovery(
    code: RouterErrorCode | string,
    strategy: RecoveryStrategy,
  ): void {
    this.recoveryStrategies.set(code, strategy)
  }

  /**
   * 处理错误
   */
  handle(error: RouterError): void {
    // 记录错误
    this.logError(error)

    // 调用所有处理器
    for (const handler of this.handlers) {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }
  }

  /**
   * 尝试恢复
   */
  recover(error: RouterError): RouteLocationNormalized | null {
    if (!error.recoverable) {
      return null
    }

    const strategy = this.recoveryStrategies.get(error.code)
    if (strategy) {
      try {
        return strategy(error)
      } catch {
        return null
      }
    }

    return null
  }

  /**
   * 记录错误
   */
  private logError(error: RouterError): void {
    this.errorLog.push(error)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }
  }

  /**
   * 获取错误日志
   */
  getErrorLog(): RouterError[] {
    return [...this.errorLog]
  }

  /**
   * 清空错误日志
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.handlers = []
    this.recoveryStrategies.clear()
    this.errorLog = []
  }
}

/**
 * 创建错误管理器
 */
export function createErrorManager(): ErrorManager {
  return new ErrorManager()
}

/**
 * 判断是否为路由错误
 */
export function isRouterError(error: unknown): error is RouterError {
  return error instanceof RouterError
}

/**
 * 判断是否为导航错误
 */
export function isNavigationError(error: unknown): error is NavigationError {
  return error instanceof NavigationError
}

/**
 * 判断是否为可恢复错误
 */
export function isRecoverableError(error: unknown): boolean {
  return isRouterError(error) && error.recoverable
}
