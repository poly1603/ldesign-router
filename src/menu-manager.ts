import { ref, reactive, computed } from 'vue'
import type { MenuItem, MenuConfig, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class MenuManager {
  private _menuItems = ref<MenuItem[]>([])
  private _activeMenus = ref<string[]>([])
  private _openMenus = ref<string[]>([])
  private _config = reactive<Required<MenuConfig>>({
    mode: 'vertical',
    theme: 'light',
    collapsed: false,
    accordion: false,
    showIcons: true,
    showBadges: true
  })

  constructor(
    private router: LDesignRouter,
    config?: MenuConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
  }

  get menuItems(): MenuItem[] {
    return this._menuItems.value
  }

  get activeMenus(): string[] {
    return this._activeMenus.value
  }

  get openMenus(): string[] {
    return this._openMenus.value
  }

  get config(): Required<MenuConfig> {
    return this._config
  }

  /**
   * 设置菜单项
   */
  setMenuItems(items: MenuItem[]): void {
    this._menuItems.value = this.processMenuItems(items)
    this.updateActiveMenus()
  }

  /**
   * 添加菜单项
   */
  addMenuItem(item: MenuItem, parentKey?: string): void {
    if (parentKey) {
      const parent = this.findMenuItem(parentKey)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(this.processMenuItem(item))
      }
    } else {
      this._menuItems.value.push(this.processMenuItem(item))
    }
    this.updateActiveMenus()
  }

  /**
   * 移除菜单项
   */
  removeMenuItem(key: string): void {
    const removeFromArray = (items: MenuItem[]): boolean => {
      const index = items.findIndex(item => item.key === key)
      if (index !== -1) {
        items.splice(index, 1)
        return true
      }
      
      for (const item of items) {
        if (item.children && removeFromArray(item.children)) {
          return true
        }
      }
      return false
    }

    removeFromArray(this._menuItems.value)
    this.updateActiveMenus()
  }

  /**
   * 更新菜单项
   */
  updateMenuItem(key: string, updates: Partial<MenuItem>): void {
    const item = this.findMenuItem(key)
    if (item) {
      Object.assign(item, updates)
      this.updateActiveMenus()
    }
  }

  /**
   * 查找菜单项
   */
  findMenuItem(key: string): MenuItem | null {
    const findInArray = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.key === key) return item
        if (item.children) {
          const found = findInArray(item.children)
          if (found) return found
        }
      }
      return null
    }

    return findInArray(this._menuItems.value)
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    this.updateActiveMenus()
    this.updateOpenMenus()
  }

  /**
   * 菜单点击处理
   */
  handleMenuClick(item: MenuItem): void {
    if (item.disabled) return

    // 如果有路径，进行导航
    if (item.path) {
      this.router.push({ path: item.path })
    }

    // 如果有子菜单，切换展开状态
    if (item.children && item.children.length > 0) {
      this.toggleSubmenu(item.key)
    }

    // 触发点击事件
    this.emitMenuClick(item)
  }

  /**
   * 切换子菜单展开状态
   */
  toggleSubmenu(key: string): void {
    const index = this._openMenus.value.indexOf(key)
    if (index !== -1) {
      this._openMenus.value.splice(index, 1)
    } else {
      // 如果是手风琴模式，关闭其他同级菜单
      if (this._config.accordion) {
        const item = this.findMenuItem(key)
        if (item) {
          const parentKey = this.getParentKey(key)
          const siblings = this.getSiblings(key)
          siblings.forEach(sibling => {
            const siblingIndex = this._openMenus.value.indexOf(sibling.key)
            if (siblingIndex !== -1) {
              this._openMenus.value.splice(siblingIndex, 1)
            }
          })
        }
      }
      this._openMenus.value.push(key)
    }
  }

  /**
   * 展开菜单
   */
  openSubmenu(key: string): void {
    if (!this._openMenus.value.includes(key)) {
      this._openMenus.value.push(key)
    }
  }

  /**
   * 关闭菜单
   */
  closeSubmenu(key: string): void {
    const index = this._openMenus.value.indexOf(key)
    if (index !== -1) {
      this._openMenus.value.splice(index, 1)
    }
  }

  /**
   * 展开所有菜单
   */
  openAllSubmenus(): void {
    const getAllKeys = (items: MenuItem[]): string[] => {
      const keys: string[] = []
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          keys.push(item.key)
          keys.push(...getAllKeys(item.children))
        }
      })
      return keys
    }

    this._openMenus.value = getAllKeys(this._menuItems.value)
  }

  /**
   * 关闭所有菜单
   */
  closeAllSubmenus(): void {
    this._openMenus.value = []
  }

  /**
   * 切换菜单折叠状态
   */
  toggleCollapse(): void {
    this._config.collapsed = !this._config.collapsed
    this.emitCollapseChange(this._config.collapsed)
  }

  /**
   * 设置菜单折叠状态
   */
  setCollapsed(collapsed: boolean): void {
    this._config.collapsed = collapsed
    this.emitCollapseChange(collapsed)
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<MenuConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 获取菜单路径
   */
  getMenuPath(key: string): string[] {
    const path: string[] = []
    
    const findPath = (items: MenuItem[], targetKey: string, currentPath: string[]): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item.key]
        
        if (item.key === targetKey) {
          path.push(...newPath)
          return true
        }
        
        if (item.children && findPath(item.children, targetKey, newPath)) {
          return true
        }
      }
      return false
    }

    findPath(this._menuItems.value, key, [])
    return path
  }

  /**
   * 获取面包屑路径
   */
  getBreadcrumbPath(key: string): MenuItem[] {
    const path: MenuItem[] = []
    
    const findPath = (items: MenuItem[], targetKey: string, currentPath: MenuItem[]): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item]
        
        if (item.key === targetKey) {
          path.push(...newPath)
          return true
        }
        
        if (item.children && findPath(item.children, targetKey, newPath)) {
          return true
        }
      }
      return false
    }

    findPath(this._menuItems.value, key, [])
    return path
  }

  /**
   * 过滤菜单项
   */
  filterMenuItems(predicate: (item: MenuItem) => boolean): MenuItem[] {
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        if (item.children) {
          item.children = filterItems(item.children)
        }
        return predicate(item)
      })
    }

    return filterItems([...this._menuItems.value])
  }

  /**
   * 搜索菜单项
   */
  searchMenuItems(keyword: string): MenuItem[] {
    const results: MenuItem[] = []
    
    const searchItems = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(keyword.toLowerCase()))) {
          results.push(item)
        }
        
        if (item.children) {
          searchItems(item.children)
        }
      })
    }

    searchItems(this._menuItems.value)
    return results
  }

  /**
   * 从路由生成菜单
   */
  generateFromRoutes(routes: any[]): void {
    const generateItems = (routes: any[]): MenuItem[] => {
      return routes
        .filter(route => !route.meta?.hidden)
        .map(route => {
          const item: MenuItem = {
            key: route.name || route.path,
            title: route.meta?.title || route.name || route.path,
            path: route.path,
            icon: route.meta?.icon,
            disabled: route.meta?.disabled || false
          }

          if (route.children && route.children.length > 0) {
            item.children = generateItems(route.children)
          }

          return item
        })
    }

    this.setMenuItems(generateItems(routes))
  }

  private processMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map(item => this.processMenuItem(item))
  }

  private processMenuItem(item: MenuItem): MenuItem {
    const processed = { ...item }
    
    if (processed.children) {
      processed.children = this.processMenuItems(processed.children)
    }
    
    return processed
  }

  private updateActiveMenus(): void {
    const currentPath = this.router.currentRoute?.path
    if (!currentPath) return

    const activeKeys: string[] = []
    
    const findActiveItems = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.path === currentPath) {
          activeKeys.push(item.key)
          // 添加父级菜单
          const parentKeys = this.getParentKeys(item.key)
          activeKeys.push(...parentKeys)
        }
        
        if (item.children) {
          findActiveItems(item.children)
        }
      })
    }

    findActiveItems(this._menuItems.value)
    this._activeMenus.value = [...new Set(activeKeys)]
  }

  private updateOpenMenus(): void {
    // 自动展开激活菜单的父级
    const activeParents = this._activeMenus.value.slice(0, -1) // 排除最后一个（当前激活项）
    activeParents.forEach(key => {
      if (!this._openMenus.value.includes(key)) {
        this._openMenus.value.push(key)
      }
    })
  }

  private getParentKey(key: string): string | null {
    const findParent = (items: MenuItem[], targetKey: string, parentKey?: string): string | null => {
      for (const item of items) {
        if (item.key === targetKey) {
          return parentKey || null
        }
        
        if (item.children) {
          const result = findParent(item.children, targetKey, item.key)
          if (result !== null) return result
        }
      }
      return null
    }

    return findParent(this._menuItems.value, key)
  }

  private getParentKeys(key: string): string[] {
    const path = this.getMenuPath(key)
    return path.slice(0, -1) // 排除自己
  }

  private getSiblings(key: string): MenuItem[] {
    const parentKey = this.getParentKey(key)
    
    if (parentKey) {
      const parent = this.findMenuItem(parentKey)
      return parent?.children || []
    } else {
      return this._menuItems.value
    }
  }

  private emitMenuClick(item: MenuItem): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('menu-click', {
        detail: { item }
      }))
    }
  }

  private emitCollapseChange(collapsed: boolean): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('menu-collapse-change', {
        detail: { collapsed }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useMenu() {
    return {
      menuItems: computed(() => this._menuItems.value),
      activeMenus: computed(() => this._activeMenus.value),
      openMenus: computed(() => this._openMenus.value),
      config: computed(() => this._config),
      collapsed: computed(() => this._config.collapsed)
    }
  }

  /**
   * 创建菜单组件的属性
   */
  createMenuProps() {
    return {
      items: this._menuItems.value,
      activeKeys: this._activeMenus.value,
      openKeys: this._openMenus.value,
      mode: this._config.mode,
      theme: this._config.theme,
      collapsed: this._config.collapsed,
      onClick: this.handleMenuClick.bind(this),
      onOpenChange: (keys: string[]) => {
        this._openMenus.value = keys
      }
    }
  }

  /**
   * 销毁菜单管理器
   */
  destroy(): void {
    this._menuItems.value = []
    this._activeMenus.value = []
    this._openMenus.value = []
  }
}