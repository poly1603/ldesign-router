/**
 * @ldesign/router-core 导航守卫管理
 * 
 * @description
 * 提供统一的导航守卫管理系统,支持全局守卫、路由守卫、组件守卫。
 * 
 * **特性**：
 * - 全局前置守卫 (beforeEach)
 * - 全局后置钩子 (afterEach)
 * - 路由独享守卫 (beforeEnter)
 * - 组件内守卫
 * - 异步守卫支持
 * - 守卫超时控制
 * - 守卫错误处理
 * - 守卫执行顺序控制
 * 
 * @module features/guards
 */

import type { RouteLocationNormalized, NavigationGuard, NavigationHookAfter } from '../types'
import { createGuardError, createGuardTimeoutError, type RouterError } from '../utils/errors'

/**
 * 守卫类型
 */
export type GuardType = 'beforeEach' | 'beforeEnter' | 'beforeRouteEnter' | 'beforeRouteUpdate' | 'beforeRouteLeave' | 'afterEach'

/**
 * 守卫返回值类型
 */
export type GuardReturn = void | boolean | string | { name: string } | RouteLocationNormalized | Error

/**
 * 守卫函数
 */
export type Guard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => GuardReturn | Promise<GuardReturn>

/**
 * 后置钩子函数
 */
export type AfterHook = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => void | Promise<void>

/**
 * 守卫注册信息
 */
export interface GuardRegistration {
  /** 守卫ID */
  id: string
  
  /** 守卫类型 */
  type: GuardType
  
  /** 守卫函数 */
  guard: Guard | AfterHook
  
  /** 优先级 (数值越大优先级越高) */
  priority: number
  
  /** 是否一次性 */
  once: boolean
  
  /** 守卫名称 */
  name?: string
}

/**
 * 守卫执行结果
 */
export interface GuardResult {
  /** 是否允许通过 */
  allowed: boolean
  
  /** 重定向位置 */
  redirect?: string | RouteLocationNormalized
  
  /** 错误 */
  error?: RouterError
  
  /** 执行时间 (ms) */
  duration: number
}

/**
 * 守卫管理器选项
 */
export interface GuardManagerOptions {
  /** 守卫超时时间 (ms) */
  timeout?: number
  
  /** 是否在错误时停止 */
  stopOnError?: boolean
  
  /** 错误处理器 */
  onError?: (error: RouterError) => void
}

/**
 * 守卫执行上下文
 */
interface GuardContext {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  aborted: boolean
}

/**
 * 导航守卫管理器
 */
export class GuardManager {
  private guards = new Map<GuardType, GuardRegistration[]>()
  private guardIdCounter = 0
  private options: Required<GuardManagerOptions>

  constructor(options: GuardManagerOptions = {}) {
    this.options = {
      timeout: options.timeout || 10000,
      stopOnError: options.stopOnError ?? true,
      onError: options.onError || (() => {}),
    }
  }

  // ==================== 守卫注册 ====================

  /**
   * 注册全局前置守卫
   */
  beforeEach(guard: Guard, options?: { priority?: number; name?: string }): () => void {
    return this.register('beforeEach', guard, options)
  }

  /**
   * 注册全局后置钩子
   */
  afterEach(hook: AfterHook, options?: { priority?: number; name?: string }): () => void {
    return this.register('afterEach', hook, options)
  }

  /**
   * 注册路由独享守卫
   */
  beforeEnter(guard: Guard, options?: { priority?: number; name?: string }): () => void {
    return this.register('beforeEnter', guard, options)
  }

  /**
   * 注册组件内守卫 - beforeRouteEnter
   */
  beforeRouteEnter(guard: Guard, options?: { priority?: number; name?: string }): () => void {
    return this.register('beforeRouteEnter', guard, options)
  }

  /**
   * 注册组件内守卫 - beforeRouteUpdate
   */
  beforeRouteUpdate(guard: Guard, options?: { priority?: number; name?: string }): () => void {
    return this.register('beforeRouteUpdate', guard, options)
  }

  /**
   * 注册组件内守卫 - beforeRouteLeave
   */
  beforeRouteLeave(guard: Guard, options?: { priority?: number; name?: string }): () => void {
    return this.register('beforeRouteLeave', guard, options)
  }

  /**
   * 通用注册方法
   */
  private register(
    type: GuardType,
    guard: Guard | AfterHook,
    options?: { priority?: number; name?: string; once?: boolean },
  ): () => void {
    const id = `guard_${this.guardIdCounter++}`
    const registration: GuardRegistration = {
      id,
      type,
      guard,
      priority: options?.priority || 0,
      once: options?.once || false,
      name: options?.name,
    }

    if (!this.guards.has(type)) {
      this.guards.set(type, [])
    }

    const guards = this.guards.get(type)!
    guards.push(registration)
    
    // 按优先级排序 (优先级高的先执行)
    guards.sort((a, b) => b.priority - a.priority)

    // 返回取消注册函数
    return () => this.unregister(id, type)
  }

  /**
   * 取消注册守卫
   */
  private unregister(id: string, type: GuardType): void {
    const guards = this.guards.get(type)
    if (!guards) return

    const index = guards.findIndex(g => g.id === id)
    if (index >= 0) {
      guards.splice(index, 1)
    }
  }

  // ==================== 守卫执行 ====================

  /**
   * 执行所有前置守卫
   */
  async runBeforeGuards(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<GuardResult> {
    const context: GuardContext = { to, from, aborted: false }

    // 1. 执行 beforeRouteLeave (当前路由组件)
    const leaveResult = await this.runGuardsByType('beforeRouteLeave', context)
    if (!leaveResult.allowed || context.aborted) {
      return leaveResult
    }

    // 2. 执行全局 beforeEach
    const beforeEachResult = await this.runGuardsByType('beforeEach', context)
    if (!beforeEachResult.allowed || context.aborted) {
      return beforeEachResult
    }

    // 3. 执行路由独享 beforeEnter
    const beforeEnterResult = await this.runGuardsByType('beforeEnter', context)
    if (!beforeEnterResult.allowed || context.aborted) {
      return beforeEnterResult
    }

    // 4. 执行组件内 beforeRouteEnter
    const enterResult = await this.runGuardsByType('beforeRouteEnter', context)
    if (!enterResult.allowed || context.aborted) {
      return enterResult
    }

    // 5. 执行组件内 beforeRouteUpdate (如果是同一组件)
    if (this.isSameComponent(to, from)) {
      const updateResult = await this.runGuardsByType('beforeRouteUpdate', context)
      if (!updateResult.allowed || context.aborted) {
        return updateResult
      }
    }

    return {
      allowed: true,
      duration: 0,
    }
  }

  /**
   * 执行后置钩子
   */
  async runAfterHooks(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<void> {
    const hooks = this.guards.get('afterEach') || []
    
    for (const registration of hooks) {
      try {
        await this.executeHook(registration, to, from)
        
        // 如果是一次性钩子,执行后移除
        if (registration.once) {
          this.unregister(registration.id, 'afterEach')
        }
      } catch (error) {
        // 后置钩子错误不应阻止导航
        console.error(`Error in afterEach hook:`, error)
      }
    }
  }

  /**
   * 执行特定类型的守卫
   */
  private async runGuardsByType(
    type: GuardType,
    context: GuardContext,
  ): Promise<GuardResult> {
    const guards = this.guards.get(type) || []
    const startTime = Date.now()

    for (const registration of guards) {
      if (context.aborted) {
        break
      }

      try {
        const result = await this.executeGuard(registration, context.to, context.from)

        // 处理守卫返回值
        const guardResult = this.processGuardResult(result)
        
        if (!guardResult.allowed) {
          guardResult.duration = Date.now() - startTime
          return guardResult
        }

        // 如果是一次性守卫,执行后移除
        if (registration.once) {
          this.unregister(registration.id, type)
        }
      } catch (error) {
        const guardError = createGuardError(
          registration.name || registration.id,
          error as Error,
        )
        
        this.options.onError(guardError)

        if (this.options.stopOnError) {
          return {
            allowed: false,
            error: guardError,
            duration: Date.now() - startTime,
          }
        }
      }
    }

    return {
      allowed: true,
      duration: Date.now() - startTime,
    }
  }

  /**
   * 执行单个守卫
   */
  private async executeGuard(
    registration: GuardRegistration,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<GuardReturn> {
    const guard = registration.guard as Guard

    // 添加超时控制
    return await this.withTimeout(
      guard(to, from),
      this.options.timeout,
      registration.name || registration.id,
    )
  }

  /**
   * 执行后置钩子
   */
  private async executeHook(
    registration: GuardRegistration,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<void> {
    const hook = registration.guard as AfterHook
    await hook(to, from)
  }

  /**
   * 处理守卫返回值
   */
  private processGuardResult(result: GuardReturn): GuardResult {
    // undefined 或 true - 允许通过
    if (result === undefined || result === true) {
      return { allowed: true, duration: 0 }
    }

    // false - 取消导航
    if (result === false) {
      return { allowed: false, duration: 0 }
    }

    // string - 重定向到路径
    if (typeof result === 'string') {
      return {
        allowed: false,
        redirect: result,
        duration: 0,
      }
    }

    // Error - 错误
    if (result instanceof Error) {
      return {
        allowed: false,
        error: result as RouterError,
        duration: 0,
      }
    }

    // object - 重定向到位置
    if (typeof result === 'object') {
      return {
        allowed: false,
        redirect: result as RouteLocationNormalized,
        duration: 0,
      }
    }

    return { allowed: true, duration: 0 }
  }

  /**
   * 添加超时控制
   */
  private async withTimeout<T>(
    promise: Promise<T> | T,
    timeout: number,
    guardName: string,
  ): Promise<T> {
    // 如果不是 Promise,直接返回
    if (!(promise instanceof Promise)) {
      return promise
    }

    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(createGuardTimeoutError(guardName, timeout))
        }, timeout)
      }),
    ])
  }

  /**
   * 判断是否为同一组件
   */
  private isSameComponent(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): boolean {
    // 简单判断:路由名称相同
    return !!to.name && to.name === from.name
  }

  // ==================== 守卫管理 ====================

  /**
   * 获取所有守卫
   */
  getGuards(type?: GuardType): GuardRegistration[] {
    if (type) {
      return [...(this.guards.get(type) || [])]
    }

    const allGuards: GuardRegistration[] = []
    for (const guards of this.guards.values()) {
      allGuards.push(...guards)
    }
    return allGuards
  }

  /**
   * 获取守卫数量
   */
  getGuardCount(type?: GuardType): number {
    if (type) {
      return (this.guards.get(type) || []).length
    }

    let count = 0
    for (const guards of this.guards.values()) {
      count += guards.length
    }
    return count
  }

  /**
   * 清空所有守卫
   */
  clear(type?: GuardType): void {
    if (type) {
      this.guards.delete(type)
    } else {
      this.guards.clear()
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.guards.clear()
  }
}

/**
 * 创建守卫管理器
 */
export function createGuardManager(options?: GuardManagerOptions): GuardManager {
  return new GuardManager(options)
}

// ==================== 守卫组合器 ====================

/**
 * 组合多个守卫
 */
export function composeGuards(...guards: Guard[]): Guard {
  return async (to, from) => {
    for (const guard of guards) {
      const result = await guard(to, from)
      
      // 如果守卫返回 false 或重定向,停止执行后续守卫
      if (result === false || typeof result === 'string' || (result && typeof result === 'object')) {
        return result
      }
    }
    
    return true
  }
}

/**
 * 创建条件守卫
 */
export function conditionalGuard(
  condition: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean,
  guard: Guard,
): Guard {
  return async (to, from) => {
    if (condition(to, from)) {
      return await guard(to, from)
    }
    return true
  }
}

/**
 * 创建路径匹配守卫
 */
export function pathGuard(pattern: string | RegExp, guard: Guard): Guard {
  const regex = typeof pattern === 'string'
    ? new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
    : pattern

  return conditionalGuard(
    (to) => regex.test(to.path),
    guard,
  )
}

/**
 * 创建名称匹配守卫
 */
export function nameGuard(names: string | string[], guard: Guard): Guard {
  const nameSet = new Set(Array.isArray(names) ? names : [names])
  
  return conditionalGuard(
    (to) => !!to.name && nameSet.has(String(to.name)),
    guard,
  )
}

/**
 * 创建元数据匹配守卫
 */
export function metaGuard(
  key: string,
  value: any,
  guard: Guard,
): Guard {
  return conditionalGuard(
    (to) => to.meta[key] === value,
    guard,
  )
}
