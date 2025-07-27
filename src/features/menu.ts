import { computed, reactive, ref } from 'vue'
import type { MenuConfig, MenuItem, RouteConfig } from '../types'

/**
 * 菜单管理器
 * 负责根据路由配置自动生成菜单结构
 */
export class MenuManager {
  private _menuItems = ref<MenuItem[]>([])
  private _collapsed = ref(false)

  private config = reactive<Required<MenuConfig>>({
    enabled: true,
    mode: 'sidebar',
    collapsible: true,
    defaultCollapsed: false,
    width: 240,
    accordion: false,
  })

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: MenuConfig = {},
  ) {
    Object.assign(this.config, config)
    this._collapsed.value = this.config.defaultCollapsed
    this.initializeMenu()
  }

  /**
   * 初始化菜单
   */
  private initializeMenu(): void {
    if (!this.config.enabled)
return

    this.generateMenuFromRoutes()
  }

  /**
   * 从路由配置生成菜单
   */
  private generateMenuFromRoutes(): void {
    const routes = this.router.getRoutes()
    this._menuItems.value = this.buildMenuItems(routes)
  }

  /**
   * 构建菜单项
   * @param routes 路由配置数组
   * @returns 菜单项数组
   */
  private buildMenuItems(routes: RouteConfig[]): MenuItem[] {
    const menuItems: MenuItem[] = []

    routes.forEach((route) => {
      const menuItem = this.createMenuItemFromRoute(route)
      if (menuItem) {
        menuItems.push(menuItem)
      }
    })

    return menuItems
  }

  /**
   * 从路由创建菜单项
   * @param route 路由配置
   * @returns 菜单项
   */
  private createMenuItemFromRoute(route: RouteConfig): MenuItem | null {
    const meta = route.meta || {}

    // 跳过不显示在菜单中的路由
    if (meta.menu === false || meta.hidden === true) {
      return null
    }

    const menuItem: MenuItem = {
      id: route.name || route.path,
      title: meta.title || route.name || route.path,
      path: route.path,
      icon: meta.icon,
      disabled: meta.disabled || false,
      hidden: meta.hidden || false,
      meta,
    }

    // 处理子路由
    if (route.children && route.children.length > 0) {
      const childMenuItems = this.buildMenuItems(route.children)
      if (childMenuItems.length > 0) {
        menuItem.children = childMenuItems
      }
    }

    return menuItem
  }

  /**
   * 获取菜单项列表
   */
  getMenuItems(): MenuItem[] {
    return this._menuItems.value
  }

  /**
   * 获取菜单项的响应式引用
   */
  get menuItems() {
    return computed(() => this._menuItems.value)
  }

  /**
   * 获取折叠状态
   */
  get collapsed() {
    return computed(() => this._collapsed.value)
  }

  /**
   * 切换折叠状态
   */
  toggleCollapse(): void {
    if (!this.config.collapsible)
return
    this._collapsed.value = !this._collapsed.value
  }

  /**
   * 设置折叠状态
   * @param collapsed 是否折叠
   */
  setCollapsed(collapsed: boolean): void {
    if (!this.config.collapsible)
return
    this._collapsed.value = collapsed
  }

  /**
   * 添加菜单项
   * @param menuItem 菜单项
   * @param parentId 父菜单项ID
   */
  addMenuItem(menuItem: MenuItem, parentId?: string): void {
    if (parentId) {
      const parent = this.findMenuItem(parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(menuItem)
      }
    }
 else {
      this._menuItems.value.push(menuItem)
    }
  }

  /**
   * 移除菜单项
   * @param menuId 菜单项ID
   */
  removeMenuItem(menuId: string): void {
    this._menuItems.value = this.removeMenuItemRecursive(this._menuItems.value, menuId)
  }

  /**
   * 递归移除菜单项
   * @param items 菜单项数组
   * @param menuId 要移除的菜单项ID
   * @returns 处理后的菜单项数组
   */
  private removeMenuItemRecursive(items: MenuItem[], menuId: string): MenuItem[] {
    return items.filter((item) => {
      if (item.id === menuId) {
        return false
      }
      if (item.children) {
        item.children = this.removeMenuItemRecursive(item.children, menuId)
      }
      return true
    })
  }

  /**
   * 查找菜单项
   * @param menuId 菜单项ID
   * @returns 菜单项
   */
  findMenuItem(menuId: string): MenuItem | null {
    return this.findMenuItemRecursive(this._menuItems.value, menuId)
  }

  /**
   * 递归查找菜单项
   * @param items 菜单项数组
   * @param menuId 菜单项ID
   * @returns 菜单项
   */
  private findMenuItemRecursive(items: MenuItem[], menuId: string): MenuItem | null {
    for (const item of items) {
      if (item.id === menuId) {
        return item
      }
      if (item.children) {
        const found = this.findMenuItemRecursive(item.children, menuId)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  /**
   * 更新菜单项
   * @param menuId 菜单项ID
   * @param updates 更新内容
   */
  updateMenuItem(menuId: string, updates: Partial<MenuItem>): void {
    const menuItem = this.findMenuItem(menuId)
    if (menuItem) {
      Object.assign(menuItem, updates)
    }
  }

  /**
   * 获取当前激活的菜单项
   * @param currentPath 当前路径
   * @returns 激活的菜单项
   */
  getActiveMenuItem(currentPath: string): MenuItem | null {
    return this.findActiveMenuItemRecursive(this._menuItems.value, currentPath)
  }

  /**
   * 递归查找激活的菜单项
   * @param items 菜单项数组
   * @param currentPath 当前路径
   * @returns 激活的菜单项
   */
  private findActiveMenuItemRecursive(items: MenuItem[], currentPath: string): MenuItem | null {
    for (const item of items) {
      if (item.path === currentPath) {
        return item
      }
      if (item.children) {
        const found = this.findActiveMenuItemRecursive(item.children, currentPath)
        if (found) {
          return item // 返回父菜单项
        }
      }
    }
    return null
  }

  /**
   * 获取菜单路径
   * @param menuId 菜单项ID
   * @returns 菜单路径数组
   */
  getMenuPath(menuId: string): MenuItem[] {
    const path: MenuItem[] = []
    this.findMenuPathRecursive(this._menuItems.value, menuId, path)
    return path
  }

  /**
   * 递归查找菜单路径
   * @param items 菜单项数组
   * @param menuId 菜单项ID
   * @param path 路径数组
   * @returns 是否找到
   */
  private findMenuPathRecursive(items: MenuItem[], menuId: string, path: MenuItem[]): boolean {
    for (const item of items) {
      path.push(item)

      if (item.id === menuId) {
        return true
      }

      if (item.children && this.findMenuPathRecursive(item.children, menuId, path)) {
        return true
      }

      path.pop()
    }
    return false
  }

  /**
   * 刷新菜单
   */
  refreshMenu(): void {
    this.generateMenuFromRoutes()
  }

  /**
   * 设置菜单配置
   * @param newConfig 新配置
   */
  setConfig(newConfig: Partial<MenuConfig>): void {
    Object.assign(this.config, newConfig)
  }

  /**
   * 获取菜单配置
   */
  getConfig(): MenuConfig {
    return { ...this.config }
  }

  /**
   * 获取菜单统计信息
   */
  getMenuStats(): {
    totalItems: number
    maxDepth: number
    collapsed: boolean
    enabled: boolean
  } {
    const totalItems = this.countMenuItems(this._menuItems.value)
    const maxDepth = this.getMaxDepth(this._menuItems.value)

    return {
      totalItems,
      maxDepth,
      collapsed: this._collapsed.value,
      enabled: this.config.enabled,
    }
  }

  /**
   * 计算菜单项总数
   * @param items 菜单项数组
   * @returns 总数
   */
  private countMenuItems(items: MenuItem[]): number {
    let count = items.length
    items.forEach((item) => {
      if (item.children) {
        count += this.countMenuItems(item.children)
      }
    })
    return count
  }

  /**
   * 获取菜单最大深度
   * @param items 菜单项数组
   * @param currentDepth 当前深度
   * @returns 最大深度
   */
  private getMaxDepth(items: MenuItem[], currentDepth: number = 1): number {
    let maxDepth = currentDepth
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const childDepth = this.getMaxDepth(item.children, currentDepth + 1)
        maxDepth = Math.max(maxDepth, childDepth)
      }
    })
    return maxDepth
  }
}
