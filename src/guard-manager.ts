import { ref, reactive } from 'vue'
import type { GuardConfig, NavigationGuard, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export type NavigationGuardNext = (to?: string | false | RouteLocationNormalized | Error) => void
export type NavigationGuardReturn = void | Error | string | boolean | RouteLocationNormalized
export type NavigationGuardWithThis<T> = (this: T, to: RouteLocationNormalized, from: Route, next: NavigationGuardNext) => NavigationGuardReturn | Promise<NavigationGuardReturn>

export class GuardManager {
  private _beforeGuards: NavigationGuard[] = []
  private _beforeResolveGuards: NavigationGuard[] = []
  private _afterGuards: NavigationGuard[] = []
  private _config = reactive<Required<GuardConfig>>({
    enabled: true,
    timeout: 5000,
    errorHandler: null
  })

  constructor(
    private router: LDesignRouter,
    config?: GuardConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
  }

  get config(): Required<GuardConfig> {
    return this._config
  }

  /**
   * 添加全局前置守卫
   */
  beforeEach(guard: NavigationGuard): () => void {
    this._beforeGuards.push(guard)
    return () => {
      const index = this._beforeGuards.indexOf(guard)
      if (index > -1) this._beforeGuards.splice(index, 1)
    }
  }

  /**
   * 添加全局解析守卫
   */
  beforeResolve(guard: NavigationGuard): () => void {
    this._beforeResolveGuards.push(guard)
    return () => {
      const index = this._beforeResolveGuards.indexOf(guard)
      if (index > -1) this._beforeResolveGuards.splice(index, 1)
    }
  }

  /**
   * 添加全局后置钩子
   */
  afterEach(guard: NavigationGuard): () => void {
    this._afterGuards.push(guard)
    return () => {
      const index = this._afterGuards.indexOf(guard)
      if (index > -1) this._afterGuards.splice(index, 1)
    }
  }

  /**
   * 执行导航守卫
   */
  async executeGuards(
    to: RouteLocationNormalized,
    from: Route,
    type: 'before' | 'beforeResolve' | 'after' = 'before'
  ): Promise<boolean | string | RouteLocationNormalized> {
    if (!this._config.enabled) return true

    const guards = this.getGuards(type)
    
    for (const guard of guards) {
      try {
        const result = await this.executeGuard(guard, to, from)
        
        if (result === false) {
          return false // 取消导航
        }
        
        if (typeof result === 'string' || (result && typeof result === 'object')) {
          return result // 重定向
        }
      } catch (error) {
        this.handleGuardError(error, to, from, guard)
        return false
      }
    }

    return true
  }

  /**
   * 执行单个守卫
   */
  private executeGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: Route
  ): Promise<NavigationGuardReturn> {
    return new Promise((resolve, reject) => {
      let isResolved = false
      
      // 超时处理
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          reject(new Error(`Navigation guard timeout after ${this._config.timeout}ms`))
        }
      }, this._config.timeout)

      const next: NavigationGuardNext = (result) => {
        if (isResolved) return
        isResolved = true
        clearTimeout(timeout)
        
        if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      }

      try {
        const result = guard(to, from, next)
        
        // 如果守卫返回 Promise
        if (result && typeof result.then === 'function') {
          result.then((res) => {
            if (!isResolved) {
              isResolved = true
              clearTimeout(timeout)
              resolve(res)
            }
          }).catch((error) => {
            if (!isResolved) {
              isResolved = true
              clearTimeout(timeout)
              reject(error)
            }
          })
        }
        // 如果守卫直接返回结果
        else if (result !== undefined) {
          if (!isResolved) {
            isResolved = true
            clearTimeout(timeout)
            resolve(result)
          }
        }
        // 如果守卫没有返回值，等待 next() 调用
      } catch (error) {
        if (!isResolved) {
          isResolved = true
          clearTimeout(timeout)
          reject(error)
        }
      }
    })
  }

  /**
   * 获取指定类型的守卫
   */
  private getGuards(type: 'before' | 'beforeResolve' | 'after'): NavigationGuard[] {
    switch (type) {
      case 'before':
        return [...this._beforeGuards]
      case 'beforeResolve':
        return [...this._beforeResolveGuards]
      case 'after':
        return [...this._afterGuards]
      default:
        return []
    }
  }

  /**
   * 处理守卫错误
   */
  private handleGuardError(
    error: any,
    to: RouteLocationNormalized,
    from: Route,
    guard: NavigationGuard
  ): void {
    console.error('Navigation guard error:', error)
    
    if (this._config.errorHandler) {
      try {
        this._config.errorHandler(error, to, from)
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError)
      }
    }

    // 触发错误事件
    this.emitGuardError(error, to, from, guard)
  }

  /**
   * 创建路由级守卫
   */
  createRouteGuard(guardName: string, guard: NavigationGuard): NavigationGuard {
    return (to, from, next) => {
      // 检查路由是否需要此守卫
      if (to.meta[guardName] === false) {
        next()
        return
      }

      return guard(to, from, next)
    }
  }

  /**
   * 权限守卫
   */
  createPermissionGuard(getPermissions: () => string[] | Promise<string[]>): NavigationGuard {
    return async (to, from, next) => {
      try {
        const permissions = await getPermissions()
        const requiredPermissions = to.meta.permissions as string[] | undefined
        
        if (!requiredPermissions || requiredPermissions.length === 0) {
          next()
          return
        }

        const hasPermission = requiredPermissions.every(permission => 
          permissions.includes(permission)
        )

        if (hasPermission) {
          next()
        } else {
          next('/403') // 无权限页面
        }
      } catch (error) {
        console.error('Permission check failed:', error)
        next('/login') // 权限检查失败，跳转登录
      }
    }
  }

  /**
   * 认证守卫
   */
  createAuthGuard(isAuthenticated: () => boolean | Promise<boolean>): NavigationGuard {
    return async (to, from, next) => {
      try {
        const authenticated = await isAuthenticated()
        const requiresAuth = to.meta.requiresAuth !== false
        
        if (requiresAuth && !authenticated) {
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
        } else if (to.path === '/login' && authenticated) {
          next('/') // 已登录用户访问登录页，重定向到首页
        } else {
          next()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        next('/login')
      }
    }
  }

  /**
   * 角色守卫
   */
  createRoleGuard(getUserRoles: () => string[] | Promise<string[]>): NavigationGuard {
    return async (to, from, next) => {
      try {
        const userRoles = await getUserRoles()
        const requiredRoles = to.meta.roles as string[] | undefined
        
        if (!requiredRoles || requiredRoles.length === 0) {
          next()
          return
        }

        const hasRole = requiredRoles.some(role => userRoles.includes(role))
        
        if (hasRole) {
          next()
        } else {
          next('/403')
        }
      } catch (error) {
        console.error('Role check failed:', error)
        next('/login')
      }
    }
  }

  /**
   * 数据预加载守卫
   */
  createDataGuard(loadData: (to: RouteLocationNormalized) => Promise<any>): NavigationGuard {
    return async (to, from, next) => {
      try {
        // 显示加载状态
        this.emitLoadingStart(to)
        
        await loadData(to)
        
        // 隐藏加载状态
        this.emitLoadingEnd(to)
        
        next()
      } catch (error) {
        this.emitLoadingEnd(to)
        console.error('Data loading failed:', error)
        next(error)
      }
    }
  }

  /**
   * 页面标题守卫
   */
  createTitleGuard(getTitle?: (to: RouteLocationNormalized) => string): NavigationGuard {
    return (to, from, next) => {
      if (typeof document !== 'undefined') {
        let title = ''
        
        if (getTitle) {
          title = getTitle(to)
        } else if (to.meta.title) {
          title = to.meta.title
        } else if (to.name) {
          title = to.name.toString()
        }
        
        if (title) {
          document.title = title
        }
      }
      
      next()
    }
  }

  /**
   * 滚动位置守卫
   */
  createScrollGuard(): NavigationGuard {
    return (to, from, next) => {
      // 保存当前滚动位置
      if (typeof window !== 'undefined' && from.meta) {
        from.meta.scrollTop = window.pageYOffset
        from.meta.scrollLeft = window.pageXOffset
      }
      
      next()
    }
  }

  /**
   * 缓存守卫
   */
  createCacheGuard(): NavigationGuard {
    return (to, from, next) => {
      // 设置缓存标记
      if (to.meta.cache !== false) {
        to.meta.keepAlive = true
      }
      
      next()
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GuardConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 清除所有守卫
   */
  clearGuards(): void {
    this._beforeGuards.length = 0
    this._beforeResolveGuards.length = 0
    this._afterGuards.length = 0
  }

  /**
   * 获取守卫统计信息
   */
  getGuardStats(): {
    beforeGuards: number
    beforeResolveGuards: number
    afterGuards: number
    total: number
  } {
    return {
      beforeGuards: this._beforeGuards.length,
      beforeResolveGuards: this._beforeResolveGuards.length,
      afterGuards: this._afterGuards.length,
      total: this._beforeGuards.length + this._beforeResolveGuards.length + this._afterGuards.length
    }
  }

  private emitGuardError(
    error: any,
    to: RouteLocationNormalized,
    from: Route,
    guard: NavigationGuard
  ): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('router-guard-error', {
        detail: { error, to, from, guard }
      }))
    }
  }

  private emitLoadingStart(to: RouteLocationNormalized): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('router-loading-start', {
        detail: { to }
      }))
    }
  }

  private emitLoadingEnd(to: RouteLocationNormalized): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('router-loading-end', {
        detail: { to }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useGuards() {
    return {
      config: computed(() => this._config),
      stats: computed(() => this.getGuardStats())
    }
  }

  /**
   * 销毁守卫管理器
   */
  destroy(): void {
    this.clearGuards()
  }
}