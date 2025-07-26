import { ref, reactive, computed } from 'vue'
import type { PermissionConfig, Permission, Role, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class PermissionManager {
  private _permissions = ref<Permission[]>([])
  private _roles = ref<Role[]>([])
  private _userPermissions = ref<string[]>([])
  private _userRoles = ref<string[]>([])
  private _config = reactive<Required<PermissionConfig>>({
    enabled: true,
    mode: 'whitelist',
    defaultRedirect: '/403',
    loginPath: '/login'
  })

  constructor(
    private router: LDesignRouter,
    config?: PermissionConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
  }

  get permissions(): Permission[] {
    return this._permissions.value
  }

  get roles(): Role[] {
    return this._roles.value
  }

  get userPermissions(): string[] {
    return this._userPermissions.value
  }

  get userRoles(): string[] {
    return this._userRoles.value
  }

  get config(): Required<PermissionConfig> {
    return this._config
  }

  /**
   * 设置权限列表
   */
  setPermissions(permissions: Permission[]): void {
    this._permissions.value = permissions
  }

  /**
   * 添加权限
   */
  addPermission(permission: Permission): void {
    const existing = this._permissions.value.find(p => p.code === permission.code)
    if (!existing) {
      this._permissions.value.push(permission)
    }
  }

  /**
   * 移除权限
   */
  removePermission(code: string): void {
    const index = this._permissions.value.findIndex(p => p.code === code)
    if (index !== -1) {
      this._permissions.value.splice(index, 1)
    }
  }

  /**
   * 设置角色列表
   */
  setRoles(roles: Role[]): void {
    this._roles.value = roles
  }

  /**
   * 添加角色
   */
  addRole(role: Role): void {
    const existing = this._roles.value.find(r => r.code === role.code)
    if (!existing) {
      this._roles.value.push(role)
    }
  }

  /**
   * 移除角色
   */
  removeRole(code: string): void {
    const index = this._roles.value.findIndex(r => r.code === code)
    if (index !== -1) {
      this._roles.value.splice(index, 1)
    }
  }

  /**
   * 设置用户权限
   */
  setUserPermissions(permissions: string[]): void {
    this._userPermissions.value = [...permissions]
    this.emitPermissionChange()
  }

  /**
   * 添加用户权限
   */
  addUserPermission(permission: string): void {
    if (!this._userPermissions.value.includes(permission)) {
      this._userPermissions.value.push(permission)
      this.emitPermissionChange()
    }
  }

  /**
   * 移除用户权限
   */
  removeUserPermission(permission: string): void {
    const index = this._userPermissions.value.indexOf(permission)
    if (index !== -1) {
      this._userPermissions.value.splice(index, 1)
      this.emitPermissionChange()
    }
  }

  /**
   * 设置用户角色
   */
  setUserRoles(roles: string[]): void {
    this._userRoles.value = [...roles]
    this.updateUserPermissionsFromRoles()
    this.emitRoleChange()
  }

  /**
   * 添加用户角色
   */
  addUserRole(role: string): void {
    if (!this._userRoles.value.includes(role)) {
      this._userRoles.value.push(role)
      this.updateUserPermissionsFromRoles()
      this.emitRoleChange()
    }
  }

  /**
   * 移除用户角色
   */
  removeUserRole(role: string): void {
    const index = this._userRoles.value.indexOf(role)
    if (index !== -1) {
      this._userRoles.value.splice(index, 1)
      this.updateUserPermissionsFromRoles()
      this.emitRoleChange()
    }
  }

  /**
   * 检查权限
   */
  hasPermission(permission: string | string[]): boolean {
    if (!this._config.enabled) return true

    if (Array.isArray(permission)) {
      return permission.every(p => this._userPermissions.value.includes(p))
    }

    return this._userPermissions.value.includes(permission)
  }

  /**
   * 检查任一权限
   */
  hasAnyPermission(permissions: string[]): boolean {
    if (!this._config.enabled) return true
    
    return permissions.some(p => this._userPermissions.value.includes(p))
  }

  /**
   * 检查角色
   */
  hasRole(role: string | string[]): boolean {
    if (!this._config.enabled) return true

    if (Array.isArray(role)) {
      return role.every(r => this._userRoles.value.includes(r))
    }

    return this._userRoles.value.includes(role)
  }

  /**
   * 检查任一角色
   */
  hasAnyRole(roles: string[]): boolean {
    if (!this._config.enabled) return true
    
    return roles.some(r => this._userRoles.value.includes(r))
  }

  /**
   * 检查路由权限
   */
  checkRoutePermission(route: RouteLocationNormalized): boolean {
    if (!this._config.enabled) return true

    // 检查路由是否需要认证
    if (route.meta.requiresAuth === false) {
      return true
    }

    // 检查权限
    const requiredPermissions = route.meta.permissions as string[] | undefined
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (route.meta.permissionMode === 'any') {
        return this.hasAnyPermission(requiredPermissions)
      } else {
        return this.hasPermission(requiredPermissions)
      }
    }

    // 检查角色
    const requiredRoles = route.meta.roles as string[] | undefined
    if (requiredRoles && requiredRoles.length > 0) {
      if (route.meta.roleMode === 'any') {
        return this.hasAnyRole(requiredRoles)
      } else {
        return this.hasRole(requiredRoles)
      }
    }

    // 默认行为
    if (this._config.mode === 'whitelist') {
      // 白名单模式：没有明确权限要求的路由需要基本认证
      return this._userPermissions.value.length > 0 || this._userRoles.value.length > 0
    } else {
      // 黑名单模式：没有明确权限要求的路由允许访问
      return true
    }
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    const hasPermission = this.checkRoutePermission(to)
    
    if (!hasPermission) {
      // 没有权限，重定向
      const redirect = to.meta.noPermissionRedirect || this._config.defaultRedirect
      this.router.replace(redirect)
      return
    }

    // 记录访问日志
    this.logAccess(to)
  }

  /**
   * 获取可访问的路由
   */
  getAccessibleRoutes(routes: any[]): any[] {
    const filterRoutes = (routes: any[]): any[] => {
      return routes.filter(route => {
        // 检查路由权限
        const mockRoute: RouteLocationNormalized = {
          path: route.path,
          name: route.name,
          params: {},
          query: {},
          hash: '',
          fullPath: route.path,
          meta: route.meta || {}
        }

        const hasAccess = this.checkRoutePermission(mockRoute)
        
        if (hasAccess && route.children) {
          route.children = filterRoutes(route.children)
        }

        return hasAccess
      })
    }

    return filterRoutes(routes)
  }

  /**
   * 获取权限树
   */
  getPermissionTree(): any[] {
    const buildTree = (permissions: Permission[], parentCode?: string): any[] => {
      return permissions
        .filter(p => p.parentCode === parentCode)
        .map(permission => ({
          ...permission,
          children: buildTree(permissions, permission.code),
          hasPermission: this.hasPermission(permission.code)
        }))
    }

    return buildTree(this._permissions.value)
  }

  /**
   * 获取角色权限映射
   */
  getRolePermissions(roleCode: string): string[] {
    const role = this._roles.value.find(r => r.code === roleCode)
    return role?.permissions || []
  }

  /**
   * 获取用户所有权限（包括角色权限）
   */
  getAllUserPermissions(): string[] {
    const directPermissions = [...this._userPermissions.value]
    const rolePermissions = this._userRoles.value.flatMap(role => 
      this.getRolePermissions(role)
    )
    
    return [...new Set([...directPermissions, ...rolePermissions])]
  }

  /**
   * 权限指令检查
   */
  checkDirective(value: string | string[] | { permissions?: string[], roles?: string[], mode?: 'all' | 'any' }): boolean {
    if (!this._config.enabled) return true

    if (typeof value === 'string') {
      return this.hasPermission(value) || this.hasRole(value)
    }

    if (Array.isArray(value)) {
      return this.hasAnyPermission(value) || this.hasAnyRole(value)
    }

    if (typeof value === 'object') {
      const { permissions, roles, mode = 'all' } = value
      let hasPermissionAccess = true
      let hasRoleAccess = true

      if (permissions && permissions.length > 0) {
        hasPermissionAccess = mode === 'any' 
          ? this.hasAnyPermission(permissions)
          : this.hasPermission(permissions)
      }

      if (roles && roles.length > 0) {
        hasRoleAccess = mode === 'any'
          ? this.hasAnyRole(roles)
          : this.hasRole(roles)
      }

      return hasPermissionAccess && hasRoleAccess
    }

    return false
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PermissionConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 清空用户权限和角色
   */
  clearUser(): void {
    this._userPermissions.value = []
    this._userRoles.value = []
    this.emitPermissionChange()
    this.emitRoleChange()
  }

  /**
   * 从角色更新用户权限
   */
  private updateUserPermissionsFromRoles(): void {
    const rolePermissions = this._userRoles.value.flatMap(role => 
      this.getRolePermissions(role)
    )
    
    // 合并直接权限和角色权限
    const allPermissions = [...new Set([...this._userPermissions.value, ...rolePermissions])]
    this._userPermissions.value = allPermissions
  }

  /**
   * 记录访问日志
   */
  private logAccess(route: RouteLocationNormalized): void {
    if (typeof window !== 'undefined') {
      const log = {
        path: route.path,
        name: route.name,
        timestamp: new Date().toISOString(),
        userPermissions: this._userPermissions.value,
        userRoles: this._userRoles.value
      }
      
      console.debug('Route access:', log)
      
      // 可以发送到服务器进行审计
      this.emitAccessLog(log)
    }
  }

  private emitPermissionChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('permission-change', {
        detail: { permissions: this._userPermissions.value }
      }))
    }
  }

  private emitRoleChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('role-change', {
        detail: { roles: this._userRoles.value }
      }))
    }
  }

  private emitAccessLog(log: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('permission-access-log', {
        detail: log
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  usePermissions() {
    return {
      permissions: computed(() => this._permissions.value),
      roles: computed(() => this._roles.value),
      userPermissions: computed(() => this._userPermissions.value),
      userRoles: computed(() => this._userRoles.value),
      allUserPermissions: computed(() => this.getAllUserPermissions()),
      config: computed(() => this._config),
      hasPermission: this.hasPermission.bind(this),
      hasRole: this.hasRole.bind(this),
      hasAnyPermission: this.hasAnyPermission.bind(this),
      hasAnyRole: this.hasAnyRole.bind(this)
    }
  }

  /**
   * 创建权限指令
   */
  createDirective() {
    return {
      mounted: (el: HTMLElement, binding: any) => {
        const hasAccess = this.checkDirective(binding.value)
        if (!hasAccess) {
          el.style.display = 'none'
        }
      },
      updated: (el: HTMLElement, binding: any) => {
        const hasAccess = this.checkDirective(binding.value)
        el.style.display = hasAccess ? '' : 'none'
      }
    }
  }

  /**
   * 销毁权限管理器
   */
  destroy(): void {
    this.clearUser()
    this._permissions.value = []
    this._roles.value = []
  }
}