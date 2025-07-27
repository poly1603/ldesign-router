import type { GuardConfig, NavigationGuard, Route, RouteLocationNormalized } from '../types'

/**
 * 导航守卫管理器
 * 负责管理路由的前置守卫、解析守卫和后置守卫
 */
export class GuardManager {
  private beforeEachGuards: NavigationGuard[] = []
  private beforeResolveGuards: NavigationGuard[] = []
  private afterEachGuards: ((to: Route, from: Route) => void)[] = []

  constructor(
    private router: any, // 使用 any 避免循环依赖
    private config: GuardConfig = {},
  ) {
    this.initializeGuards()
  }

  /**
   * 初始化守卫
   */
  private initializeGuards(): void {
    // 添加配置中的守卫
    if (this.config.beforeEach) {
      this.beforeEachGuards.push(...this.config.beforeEach)
    }

    if (this.config.beforeResolve) {
      this.beforeResolveGuards.push(...this.config.beforeResolve)
    }

    if (this.config.afterEach) {
      this.afterEachGuards.push(...this.config.afterEach)
    }
  }

  /**
   * 添加前置守卫
   * @param guard 守卫函数
   * @returns 移除守卫的函数
   */
  addBeforeEach(guard: NavigationGuard): () => void {
    this.beforeEachGuards.push(guard)

    return () => {
      const index = this.beforeEachGuards.indexOf(guard)
      if (index > -1) {
        this.beforeEachGuards.splice(index, 1)
      }
    }
  }

  /**
   * 添加解析守卫
   * @param guard 守卫函数
   * @returns 移除守卫的函数
   */
  addBeforeResolve(guard: NavigationGuard): () => void {
    this.beforeResolveGuards.push(guard)

    return () => {
      const index = this.beforeResolveGuards.indexOf(guard)
      if (index > -1) {
        this.beforeResolveGuards.splice(index, 1)
      }
    }
  }

  /**
   * 添加后置守卫
   * @param guard 守卫函数
   * @returns 移除守卫的函数
   */
  addAfterEach(guard: (to: Route, from: Route) => void): () => void {
    this.afterEachGuards.push(guard)

    return () => {
      const index = this.afterEachGuards.indexOf(guard)
      if (index > -1) {
        this.afterEachGuards.splice(index, 1)
      }
    }
  }

  /**
   * 执行前置守卫
   * @param to 目标路由
   * @param from 当前路由
   * @returns 是否允许导航
   */
  async executeBeforeEach(to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<boolean> {
    for (const guard of this.beforeEachGuards) {
      const result = await this.executeGuard(guard, to, from)
      if (result === false) {
        return false
      }
      if (typeof result === 'object') {
        // 重定向到其他路由
        this.router.push(result)
        return false
      }
    }
    return true
  }

  /**
   * 执行解析守卫
   * @param to 目标路由
   * @param from 当前路由
   * @returns 是否允许导航
   */
  async executeBeforeResolve(to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<boolean> {
    for (const guard of this.beforeResolveGuards) {
      const result = await this.executeGuard(guard, to, from)
      if (result === false) {
        return false
      }
      if (typeof result === 'object') {
        this.router.push(result)
        return false
      }
    }
    return true
  }

  /**
   * 执行后置守卫
   * @param to 目标路由
   * @param from 当前路由
   */
  executeAfterEach(to: Route, from: Route): void {
    this.afterEachGuards.forEach((guard) => {
      try {
        guard(to, from)
      }
 catch (error) {
        console.error('Error in afterEach guard:', error)
      }
    })
  }

  /**
   * 执行单个守卫
   * @param guard 守卫函数
   * @param to 目标路由
   * @param from 当前路由
   * @returns 守卫执行结果
   */
  private async executeGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<boolean | object> {
    return new Promise((resolve) => {
      const next = (result?: any) => {
        if (result === undefined || result === true) {
          resolve(true)
        }
 else if (result === false) {
          resolve(false)
        }
 else if (typeof result === 'object') {
          resolve(result)
        }
 else if (result instanceof Error) {
          console.error('Navigation guard error:', result)
          resolve(false)
        }
 else {
          resolve(false)
        }
      }

      try {
        const result = guard(to, from, next)

        // 处理同步返回值
        if (result !== undefined) {
          if (typeof result === 'boolean') {
            resolve(result)
          }
 else if (typeof result === 'object') {
            resolve(result)
          }
 else if (result && typeof result === 'object' && 'then' in result) {
            (result as Promise<any>).then(resolve).catch((error: any) => {
              console.error('Async navigation guard error:', error)
              resolve(false)
            })
          }
        }
      }
 catch (error) {
        console.error('Navigation guard execution error:', error)
        resolve(false)
      }
    })
  }

  /**
   * 清除所有守卫
   */
  clearAllGuards(): void {
    this.beforeEachGuards = []
    this.beforeResolveGuards = []
    this.afterEachGuards = []
  }

  /**
   * 获取守卫统计信息
   */
  getGuardStats(): {
    beforeEach: number
    beforeResolve: number
    afterEach: number
  } {
    return {
      beforeEach: this.beforeEachGuards.length,
      beforeResolve: this.beforeResolveGuards.length,
      afterEach: this.afterEachGuards.length,
    }
  }
}
