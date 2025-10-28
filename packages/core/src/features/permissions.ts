/**
 * @ldesign/router-core 路由权限控制
 * 
 * @description
 * 提供基于角色和权限的路由访问控制功能。
 * 
 * **特性**：
 * - 基于角色的访问控制（RBAC）
 * - 基于权限的访问控制（PBAC）
 * - 动态权限验证
 * - 权限缓存
 * - 权限继承
 * 
 * **使用场景**：
 * - 用户权限管理
 * - 路由访问控制
 * - 功能权限验证
 * 
 * @module features/permissions
 */

import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteMeta,
} from '../types'

/**
 * 权限类型
 */
export type Permission = string

/**
 * 角色类型
 */
export type Role = string

/**
 * 权限检查函数
 */
export type PermissionChecker = (
  permissions: Permission[],
  route: RouteLocationNormalized,
) => boolean | Promise<boolean>

/**
 * 角色检查函数
 */
export type RoleChecker = (
  roles: Role[],
  route: RouteLocationNormalized,
) => boolean | Promise<boolean>

/**
 * 权限配置选项
 */
export interface PermissionOptions {
  /** 权限检查函数 */
  hasPermission?: PermissionChecker

  /** 角色检查函数 */
  hasRole?: RoleChecker

  /** 未授权时的重定向路径（默认 '/login'） */
  unauthorizedRedirect?: string

  /** 是否启用权限缓存（默认 true） */
  enableCache?: boolean

  /** 缓存过期时间（毫秒，默认 60000） */
  cacheTTL?: number
}

/**
 * 权限缓存项
 */
interface PermissionCacheItem {
  /** 权限检查结果 */
  result: boolean

  /** 缓存时间 */
  timestamp: number
}

/**
 * 路由权限管理器
 * 
 * @description
 * 管理路由的权限验证，支持角色和权限两种模式。
 * 
 * **验证流程**：
 * 1. 检查路由 meta 中的权限要求
 * 2. 调用权限检查函数验证
 * 3. 缓存验证结果
 * 4. 未授权则重定向
 * 
 * **内存管理**：
 * - 缓存大小限制（100 项）
 * - 自动清理过期缓存
 * - destroy() 释放所有资源
 * 
 * ⚡ 性能:
 * - 权限检查: O(1) 缓存命中
 * - 缓存清理: O(n)
 * 
 * @class
 * 
 * @example
 * ```ts
 * const permissionManager = new PermissionManager({
 *   hasPermission: (permissions) => {
 *     const userPermissions = getUserPermissions()
 *     return permissions.every(p => userPermissions.includes(p))
 *   },
 *   hasRole: (roles) => {
 *     const userRoles = getUserRoles()
 *     return roles.some(r => userRoles.includes(r))
 *   },
 *   unauthorizedRedirect: '/403',
 * })
 * 
 * // 创建守卫
 * const guard = permissionManager.createGuard()
 * router.beforeEach(guard)
 * ```
 */
export class PermissionManager {
  /** 配置选项 */
  private options: Required<PermissionOptions>

  /** 权限缓存 */
  private cache = new Map<string, PermissionCacheItem>()

  /** 缓存大小限制 */
  private readonly MAX_CACHE_SIZE = 100

  /** 缓存清理定时器 */
  private cleanupTimer?: ReturnType<typeof setInterval>

  /**
   * 创建权限管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: PermissionOptions = {}) {
    this.options = {
      hasPermission: options.hasPermission ?? (() => true),
      hasRole: options.hasRole ?? (() => true),
      unauthorizedRedirect: options.unauthorizedRedirect ?? '/login',
      enableCache: options.enableCache ?? true,
      cacheTTL: options.cacheTTL ?? 60000,
    }

    // 启动缓存清理定时器
    if (this.options.enableCache) {
      this.startCacheCleanup()
    }
  }

  /**
   * 检查权限
   * 
   * @param permissions - 所需权限列表
   * @param route - 路由对象
   * @returns 是否有权限
   * 
   * @example
   * ```ts
   * const hasPermission = await manager.checkPermission(
   *   ['user:read', 'user:write'],
   *   route
   * )
   * ```
   */
  async checkPermission(
    permissions: Permission[],
    route: RouteLocationNormalized,
  ): Promise<boolean> {
    if (permissions.length === 0) {
      return true
    }

    // 检查缓存
    const cacheKey = this.getCacheKey('permission', permissions, route)
    const cached = this.getCached(cacheKey)
    if (cached !== null) {
      return cached
    }

    // 执行权限检查
    const result = await this.options.hasPermission(permissions, route)

    // 缓存结果
    this.setCached(cacheKey, result)

    return result
  }

  /**
   * 检查角色
   * 
   * @param roles - 所需角色列表
   * @param route - 路由对象
   * @returns 是否有角色
   * 
   * @example
   * ```ts
   * const hasRole = await manager.checkRole(['admin', 'moderator'], route)
   * ```
   */
  async checkRole(
    roles: Role[],
    route: RouteLocationNormalized,
  ): Promise<boolean> {
    if (roles.length === 0) {
      return true
    }

    // 检查缓存
    const cacheKey = this.getCacheKey('role', roles, route)
    const cached = this.getCached(cacheKey)
    if (cached !== null) {
      return cached
    }

    // 执行角色检查
    const result = await this.options.hasRole(roles, route)

    // 缓存结果
    this.setCached(cacheKey, result)

    return result
  }

  /**
   * 验证路由访问权限
   * 
   * @description
   * 根据路由 meta 中的权限配置验证访问权限。
   * 
   * @param route - 路由对象
   * @returns 是否允许访问
   * 
   * @example
   * ```ts
   * const canAccess = await manager.verifyRoute(route)
   * if (!canAccess) {
   *   router.push('/403')
   * }
   * ```
   */
  async verifyRoute(route: RouteLocationNormalized): Promise<boolean> {
    const meta = route.meta as RouteMeta & {
      permissions?: Permission[]
      roles?: Role[]
      requiresAuth?: boolean
    }

    // 检查是否需要认证
    if (meta.requiresAuth === false) {
      return true
    }

    // 检查权限
    if (meta.permissions && meta.permissions.length > 0) {
      const hasPermission = await this.checkPermission(meta.permissions, route)
      if (!hasPermission) {
        return false
      }
    }

    // 检查角色
    if (meta.roles && meta.roles.length > 0) {
      const hasRole = await this.checkRole(meta.roles, route)
      if (!hasRole) {
        return false
      }
    }

    return true
  }

  /**
   * 创建导航守卫
   * 
   * @description
   * 创建一个导航守卫，自动验证路由权限。
   * 
   * @returns 导航守卫函数
   * 
   * @example
   * ```ts
   * const guard = manager.createGuard()
   * router.beforeEach(guard)
   * ```
   */
  createGuard(): NavigationGuard {
    return async (to, _from, next) => {
      try {
        const allowed = await this.verifyRoute(to)

        if (allowed) {
          next()
        }
        else {
          // 重定向到未授权页面
          next(this.options.unauthorizedRedirect)
        }
      }
      catch (error) {
        // 权限检查出错，拒绝访问
        console.error('Permission check failed:', error)
        next(false)
      }
    }
  }

  /**
   * 获取缓存键
   * 
   * @private
   */
  private getCacheKey(
    type: 'permission' | 'role',
    items: string[],
    route: RouteLocationNormalized,
  ): string {
    return `${type}:${items.sort().join(',')}:${route.path}`
  }

  /**
   * 获取缓存值
   * 
   * @private
   */
  private getCached(key: string): boolean | null {
    if (!this.options.enableCache) {
      return null
    }

    const cached = this.cache.get(key)
    if (!cached) {
      return null
    }

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.options.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.result
  }

  /**
   * 设置缓存值
   * 
   * @private
   */
  private setCached(key: string, result: boolean): void {
    if (!this.options.enableCache) {
      return
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    })

    // 限制缓存大小
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.trimCache()
    }
  }

  /**
   * 清理缓存
   * 
   * @private
   */
  private trimCache(): void {
    const entries = Array.from(this.cache.entries())
    const toRemove = entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2))

    for (const [key] of toRemove) {
      this.cache.delete(key)
    }
  }

  /**
   * 启动缓存清理定时器
   * 
   * @private
   */
  private startCacheCleanup(): void {
    // 每分钟清理一次过期缓存
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > this.options.cacheTTL) {
          this.cache.delete(key)
        }
      }
    }, 60000)

    // 使用 unref() 防止阻止进程退出
    if (typeof (this.cleanupTimer as any).unref === 'function') {
      (this.cleanupTimer as any).unref()
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 销毁管理器
   * 
   * @description
   * 释放所有资源，清理定时器。
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clearCache()
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    cacheSize: number
    cacheHitRate: number
  } {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0, // TODO: 实现命中率统计
    }
  }
}

/**
 * 创建权限管理器
 * 
 * @param options - 配置选项
 * @returns 权限管理器实例
 * 
 * @example
 * ```ts
 * const manager = createPermissionManager({
 *   hasPermission: (perms) => checkUserPermissions(perms),
 *   hasRole: (roles) => checkUserRoles(roles),
 *   unauthorizedRedirect: '/403',
 * })
 * 
 * const guard = manager.createGuard()
 * router.beforeEach(guard)
 * ```
 */
export function createPermissionManager(
  options?: PermissionOptions,
): PermissionManager {
  return new PermissionManager(options)
}

