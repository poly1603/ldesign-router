/**
 * @ldesign/router-core Promise导航API
 * 
 * @description
 * 提供基于Promise的导航API,更好地处理异步导航。
 * 
 * **特性**：
 * - Promise-based导航
 * - 导航队列
 * - 错误处理
 * - 取消支持
 * - 超时控制
 * 
 * @module router/promise
 */

import type { RouteLocationRaw, NavigationFailure } from '../types'

/**
 * 导航选项
 */
export interface NavigationOptions {
  /** 是否替换历史记录 */
  replace?: boolean
  
  /** 导航超时(毫秒) */
  timeout?: number
  
  /** 取消信号 */
  signal?: AbortSignal
  
  /** 导航元数据 */
  meta?: Record<string, any>
}

/**
 * 导航结果
 */
export interface NavigationResult {
  /** 是否成功 */
  success: boolean
  
  /** 目标位置 */
  to: RouteLocationRaw
  
  /** 来源位置 */
  from?: string
  
  /** 失败原因 */
  failure?: NavigationFailure
  
  /** 耗时(毫秒) */
  duration: number
  
  /** 元数据 */
  meta?: Record<string, any>
}

/**
 * 导航任务
 */
interface NavigationTask {
  /** 目标 */
  to: RouteLocationRaw
  
  /** 选项 */
  options: NavigationOptions
  
  /** resolve回调 */
  resolve: (result: NavigationResult) => void
  
  /** reject回调 */
  reject: (error: Error) => void
  
  /** 开始时间 */
  startTime: number
}

/**
 * Promise路由器
 */
export class PromiseRouter {
  private navigateHandler: ((to: RouteLocationRaw, options: NavigationOptions) => Promise<NavigationResult>) | null = null
  private queue: NavigationTask[] = []
  private processing = false

  // ==================== 配置 ====================

  /**
   * 设置导航处理器
   */
  setNavigateHandler(
    handler: (to: RouteLocationRaw, options: NavigationOptions) => Promise<NavigationResult>,
  ): void {
    this.navigateHandler = handler
  }

  // ==================== 导航 ====================

  /**
   * 导航到指定位置
   */
  async navigate(
    to: RouteLocationRaw,
    options: NavigationOptions = {},
  ): Promise<NavigationResult> {
    if (!this.navigateHandler) {
      throw new Error('Navigate handler not set')
    }

    return new Promise<NavigationResult>((resolve, reject) => {
      const task: NavigationTask = {
        to,
        options,
        resolve,
        reject,
        startTime: Date.now(),
      }

      this.queue.push(task)
      this.processQueue()
    })
  }

  /**
   * 推入导航(添加历史记录)
   */
  async push(to: RouteLocationRaw, options?: Omit<NavigationOptions, 'replace'>): Promise<NavigationResult> {
    return this.navigate(to, { ...options, replace: false })
  }

  /**
   * 替换导航(替换历史记录)
   */
  async replace(to: RouteLocationRaw, options?: Omit<NavigationOptions, 'replace'>): Promise<NavigationResult> {
    return this.navigate(to, { ...options, replace: true })
  }

  /**
   * 后退
   */
  async back(): Promise<NavigationResult> {
    return this.navigate(-1 as any)
  }

  /**
   * 前进
   */
  async forward(): Promise<NavigationResult> {
    return this.navigate(1 as any)
  }

  /**
   * 跳转指定步数
   */
  async go(delta: number): Promise<NavigationResult> {
    return this.navigate(delta as any)
  }

  // ==================== 队列处理 ====================

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      await this.processTask(task)
    }

    this.processing = false
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: NavigationTask): Promise<void> {
    const { to, options, resolve, reject, startTime } = task

    try {
      // 检查取消信号
      if (options.signal?.aborted) {
        throw new Error('Navigation aborted')
      }

      // 设置超时
      const timeout = options.timeout || 30000
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Navigation timeout')), timeout)
      })

      // 执行导航
      const navigationPromise = this.navigateHandler!(to, options)

      const result = await Promise.race([navigationPromise, timeoutPromise])

      // 计算耗时
      result.duration = Date.now() - startTime

      resolve(result)
    } catch (error) {
      reject(error as Error)
    }
  }

  // ==================== 批量操作 ====================

  /**
   * 批量导航
   */
  async navigateAll(
    locations: RouteLocationRaw[],
    options?: NavigationOptions,
  ): Promise<NavigationResult[]> {
    const promises = locations.map(to => this.navigate(to, options))
    return Promise.all(promises)
  }

  /**
   * 顺序导航
   */
  async navigateSequence(
    locations: RouteLocationRaw[],
    options?: NavigationOptions,
  ): Promise<NavigationResult[]> {
    const results: NavigationResult[] = []

    for (const to of locations) {
      const result = await this.navigate(to, options)
      results.push(result)
    }

    return results
  }

  // ==================== 条件导航 ====================

  /**
   * 条件导航
   */
  async navigateIf(
    condition: boolean | (() => boolean | Promise<boolean>),
    to: RouteLocationRaw,
    options?: NavigationOptions,
  ): Promise<NavigationResult | null> {
    const shouldNavigate = typeof condition === 'function' ? await condition() : condition

    if (shouldNavigate) {
      return this.navigate(to, options)
    }

    return null
  }

  /**
   * 重试导航
   */
  async navigateWithRetry(
    to: RouteLocationRaw,
    options?: NavigationOptions & { maxRetries?: number; retryDelay?: number },
  ): Promise<NavigationResult> {
    const maxRetries = options?.maxRetries || 3
    const retryDelay = options?.retryDelay || 1000

    let lastError: Error | undefined

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await this.navigate(to, options)
      } catch (error) {
        lastError = error as Error

        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
    }

    throw lastError
  }

  // ==================== 状态 ====================

  /**
   * 是否正在导航
   */
  isNavigating(): boolean {
    return this.processing || this.queue.length > 0
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    // 拒绝所有等待的任务
    for (const task of this.queue) {
      task.reject(new Error('Queue cleared'))
    }

    this.queue = []
  }
}

/**
 * 创建Promise路由器
 */
export function createPromiseRouter(): PromiseRouter {
  return new PromiseRouter()
}

// ==================== 导航控制器 ====================

/**
 * 导航控制器
 */
export class NavigationController {
  private abortController: AbortController | null = null

  /**
   * 开始导航
   */
  start(): AbortSignal {
    this.abortController = new AbortController()
    return this.abortController.signal
  }

  /**
   * 取消导航
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * 是否已取消
   */
  isCancelled(): boolean {
    return this.abortController?.signal.aborted ?? false
  }
}

/**
 * 创建导航控制器
 */
export function createNavigationController(): NavigationController {
  return new NavigationController()
}

// ==================== 实用工具 ====================

/**
 * 等待导航完成
 */
export async function waitForNavigation(
  router: PromiseRouter,
  timeout: number = 30000,
): Promise<void> {
  const startTime = Date.now()

  while (router.isNavigating()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Wait for navigation timeout')
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

/**
 * 导航竞速
 */
export async function navigateRace(
  router: PromiseRouter,
  locations: RouteLocationRaw[],
  options?: NavigationOptions,
): Promise<NavigationResult> {
  const promises = locations.map(to => router.navigate(to, options))
  return Promise.race(promises)
}

/**
 * 导航超时包装
 */
export async function navigateWithTimeout(
  router: PromiseRouter,
  to: RouteLocationRaw,
  timeout: number,
  options?: NavigationOptions,
): Promise<NavigationResult> {
  return router.navigate(to, { ...options, timeout })
}

/**
 * 安全导航(不抛出错误)
 */
export async function safeNavigate(
  router: PromiseRouter,
  to: RouteLocationRaw,
  options?: NavigationOptions,
): Promise<NavigationResult> {
  try {
    return await router.navigate(to, options)
  } catch (error) {
    return {
      success: false,
      to,
      failure: {
        type: 4, // NavigationFailureType.other
        from: undefined as any,
        to: to as any,
      },
      duration: 0,
    }
  }
}
