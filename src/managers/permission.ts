import { reactive, ref } from 'vue'
import type { Permission, PermissionConfig, Role, RouteLocationNormalized, User } from '../types'

/**
 * 权限管理器
 * 负责管理路由级别的权限控制
 */
export class PermissionManager {
  private _currentUser = ref<User | null>(null)
  private _roles = ref<Role[]>([])
  private _permissions = ref<Permission[]>([])

  private config = reactive<Required<PermissionConfig>>({
    enabled: false,
    mode: 'both',
    defaultRole: 'guest',
    guestRole: 'guest',
    adminRole: 'admin',
    checkPermission: () => false,
    checkRole: () => false,
    redirectPath: '/login',
  })

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: PermissionConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializePermissions()
  }

  /**
   * 初始化权限系统
   */
  private initializePermissions(): void {
    if (!this.config.enabled)
return

    // 设置默认权限检查函数
    if (!this.config.checkPermission || this.config.checkPermission === (() => false)) {
      this.config.checkPermission = this.defaultCheckPermission.bind(this)
    }

    if (!this.config.checkRole || this.config.checkRole === (() => false)) {
      this.config.checkRole = this.defaultCheckRole.bind(this)
    }
  }

  /**
   * 设置当前用户
   * @param user 用户信息
   */
  setCurrentUser(user: User | null): void {
    this._currentUser.value = user
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this._currentUser.value
  }

  /**
   * 设置角色列表
   * @param roles 角色列表
   */
  setRoles(roles: Role[]): void {
    this._roles.value = roles
  }

  /**
   * 设置权限列表
   * @param permissions 权限列表
   */
  setPermissions(permissions: Permission[]): void {
    this._permissions.value = permissions
  }

  /**
   * 检查路由权限
   * @param route 路由信息
   * @returns 是否有权限访问
   */
  checkRoutePermission(route: RouteLocationNormalized): boolean {
    if (!this.config.enabled)
return true

    const { meta } = route
    if (!meta)
return true

    // 检查是否需要认证
    if (meta.requiresAuth && !this._currentUser.value) {
      return false
    }

    // 检查角色权限
    if (meta.roles && meta.roles.length > 0) {
      if (!this.config.checkRole(meta.roles)) {
        return false
      }
    }

    // 检查具体权限
    if (meta.permissions && meta.permissions.length > 0) {
      if (!this.config.checkPermission(meta.permissions)) {
        return false
      }
    }

    return true
  }

  /**
   * 默认权限检查函数
   * @param permissions 需要的权限列表
   * @returns 是否有权限
   */
  private defaultCheckPermission(permissions: string[]): boolean {
    const user = this._currentUser.value
    if (!user)
return false

    if (this.config.mode === 'role') {
      // 仅基于角色检查
      return this.hasRolePermissions(user.roles, permissions)
    }
 else if (this.config.mode === 'permission') {
      // 仅基于权限检查
      return permissions.every(permission => user.permissions.includes(permission))
    }
 else {
      // 同时检查角色和权限
      return permissions.every(permission => user.permissions.includes(permission))
        || this.hasRolePermissions(user.roles, permissions)
    }
  }

  /**
   * 默认角色检查函数
   * @param roles 需要的角色列表
   * @returns 是否有角色
   */
  private defaultCheckRole(roles: string[]): boolean {
    const user = this._currentUser.value
    if (!user)
return false

    return roles.some(role => user.roles.includes(role))
  }

  /**
   * 检查角色是否包含所需权限
   * @param userRoles 用户角色
   * @param permissions 需要的权限
   * @returns 是否有权限
   */
  private hasRolePermissions(userRoles: string[], permissions: string[]): boolean {
    const rolePermissions = new Set<string>()

    // 收集所有角色的权限
    userRoles.forEach((roleName) => {
      const role = this._roles.value.find(r => r.name === roleName)
      if (role) {
        role.permissions.forEach(permission => rolePermissions.add(permission))

        // 处理角色继承
        if (role.inherits) {
          role.inherits.forEach((inheritedRole) => {
            const inherited = this._roles.value.find(r => r.name === inheritedRole)
            if (inherited) {
              inherited.permissions.forEach(permission => rolePermissions.add(permission))
            }
          })
        }
      }
    })

    return permissions.every(permission => rolePermissions.has(permission))
  }

  /**
   * 检查是否为管理员
   * @returns 是否为管理员
   */
  isAdmin(): boolean {
    const user = this._currentUser.value
    if (!user)
return false

    return user.roles.includes(this.config.adminRole)
  }

  /**
   * 检查是否为访客
   * @returns 是否为访客
   */
  isGuest(): boolean {
    const user = this._currentUser.value
    return !user || user.roles.includes(this.config.guestRole)
  }

  /**
   * 获取重定向路径
   * @returns 重定向路径
   */
  getRedirectPath(): string {
    return this.config.redirectPath
  }

  /**
   * 添加角色
   * @param role 角色信息
   */
  addRole(role: Role): void {
    const existingIndex = this._roles.value.findIndex(r => r.id === role.id)
    if (existingIndex > -1) {
      this._roles.value[existingIndex] = role
    }
 else {
      this._roles.value.push(role)
    }
  }

  /**
   * 移除角色
   * @param roleId 角色ID
   */
  removeRole(roleId: string): void {
    const index = this._roles.value.findIndex(r => r.id === roleId)
    if (index > -1) {
      this._roles.value.splice(index, 1)
    }
  }

  /**
   * 添加权限
   * @param permission 权限信息
   */
  addPermission(permission: Permission): void {
    const existingIndex = this._permissions.value.findIndex(p => p.id === permission.id)
    if (existingIndex > -1) {
      this._permissions.value[existingIndex] = permission
    }
 else {
      this._permissions.value.push(permission)
    }
  }

  /**
   * 移除权限
   * @param permissionId 权限ID
   */
  removePermission(permissionId: string): void {
    const index = this._permissions.value.findIndex(p => p.id === permissionId)
    if (index > -1) {
      this._permissions.value.splice(index, 1)
    }
  }

  /**
   * 获取权限统计信息
   */
  getPermissionStats(): {
    users: number
    roles: number
    permissions: number
    enabled: boolean
  } {
    return {
      users: this._currentUser.value ? 1 : 0,
      roles: this._roles.value.length,
      permissions: this._permissions.value.length,
      enabled: this.config.enabled,
    }
  }
}
