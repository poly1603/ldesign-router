import { ref, reactive, computed } from 'vue'
import type { BreadcrumbItem, BreadcrumbConfig, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class BreadcrumbManager {
  private _breadcrumbs = ref<BreadcrumbItem[]>([])
  private _config = reactive<Required<BreadcrumbConfig>>({
    enabled: true,
    separator: '/',
    showHome: true,
    homeText: '首页',
    maxItems: 10
  })

  constructor(
    private router: LDesignRouter,
    config?: BreadcrumbConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
  }

  get breadcrumbs(): BreadcrumbItem[] {
    return this._breadcrumbs.value
  }

  get config(): Required<BreadcrumbConfig> {
    return this._config
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    // 检查路由是否应该显示面包屑
    if (!this.shouldShowBreadcrumb(to)) {
      this._breadcrumbs.value = []
      return
    }

    this.generateBreadcrumbs(to)
  }

  /**
   * 生成面包屑导航
   */
  private generateBreadcrumbs(route: RouteLocationNormalized): void {
    const breadcrumbs: BreadcrumbItem[] = []

    // 添加首页
    if (this._config.showHome && route.path !== '/') {
      breadcrumbs.push({
        title: this._config.homeText,
        path: '/',
        icon: 'home'
      })
    }

    // 根据路由匹配生成面包屑
    const pathSegments = route.path.split('/').filter(segment => segment)
    let currentPath = ''

    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += '/' + pathSegments[i]
      const matchedRoute = this.findRouteByPath(currentPath)
      
      if (matchedRoute && this.shouldShowInBreadcrumb(matchedRoute)) {
        const isLast = i === pathSegments.length - 1
        
        breadcrumbs.push({
          title: this.getBreadcrumbTitle(matchedRoute, route),
          path: isLast ? undefined : currentPath, // 最后一项不可点击
          icon: matchedRoute.meta?.icon,
          disabled: isLast
        })
      }
    }

    // 限制面包屑数量
    if (breadcrumbs.length > this._config.maxItems) {
      const excess = breadcrumbs.length - this._config.maxItems
      breadcrumbs.splice(1, excess, {
        title: '...',
        disabled: true
      })
    }

    this._breadcrumbs.value = breadcrumbs
    this.emitBreadcrumbChange(breadcrumbs)
  }

  /**
   * 手动设置面包屑
   */
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this._breadcrumbs.value = [...breadcrumbs]
    this.emitBreadcrumbChange(this._breadcrumbs.value)
  }

  /**
   * 添加面包屑项
   */
  addBreadcrumb(item: BreadcrumbItem, index?: number): void {
    if (index !== undefined) {
      this._breadcrumbs.value.splice(index, 0, item)
    } else {
      this._breadcrumbs.value.push(item)
    }
    this.emitBreadcrumbChange(this._breadcrumbs.value)
  }

  /**
   * 移除面包屑项
   */
  removeBreadcrumb(index: number): void {
    if (index >= 0 && index < this._breadcrumbs.value.length) {
      this._breadcrumbs.value.splice(index, 1)
      this.emitBreadcrumbChange(this._breadcrumbs.value)
    }
  }

  /**
   * 清空面包屑
   */
  clearBreadcrumbs(): void {
    this._breadcrumbs.value = []
    this.emitBreadcrumbChange([])
  }

  /**
   * 面包屑点击处理
   */
  handleBreadcrumbClick(item: BreadcrumbItem, index: number): void {
    if (item.disabled || !item.path) return

    // 导航到对应路径
    this.router.push({ path: item.path })
    
    // 触发点击事件
    this.emitBreadcrumbClick(item, index)
  }

  /**
   * 获取面包屑文本（支持国际化）
   */
  getBreadcrumbText(): string {
    return this._breadcrumbs.value
      .map(item => item.title)
      .join(` ${this._config.separator} `)
  }

  /**
   * 获取面包屑路径数组
   */
  getBreadcrumbPaths(): string[] {
    return this._breadcrumbs.value
      .filter(item => item.path)
      .map(item => item.path!)
  }

  /**
   * 检查是否在指定路径
   */
  isAtPath(path: string): boolean {
    const currentPath = this.router.currentRoute.path
    return currentPath === path
  }

  /**
   * 获取当前面包屑深度
   */
  getDepth(): number {
    return this._breadcrumbs.value.length
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<BreadcrumbConfig>): void {
    Object.assign(this._config, config)
    
    // 重新生成面包屑
    const currentRoute = this.router.currentRoute
    if (currentRoute) {
      this.generateBreadcrumbs(currentRoute)
    }
  }

  /**
   * 自定义面包屑生成器
   */
  setCustomGenerator(generator: (route: RouteLocationNormalized) => BreadcrumbItem[]): void {
    this.customGenerator = generator
    
    // 重新生成面包屑
    const currentRoute = this.router.currentRoute
    if (currentRoute) {
      this.generateBreadcrumbs(currentRoute)
    }
  }

  private customGenerator?: (route: RouteLocationNormalized) => BreadcrumbItem[]

  private shouldShowBreadcrumb(route: RouteLocationNormalized): boolean {
    // 检查路由元信息中的 breadcrumb 配置
    if (route.meta.breadcrumb === false) return false
    if (route.meta.breadcrumb === true) return true
    
    // 默认显示面包屑（除了特殊路由）
    const excludePaths = ['/login', '/404', '/403', '/500']
    return !excludePaths.includes(route.path)
  }

  private shouldShowInBreadcrumb(route: any): boolean {
    // 检查路由是否应该在面包屑中显示
    if (route.meta?.breadcrumb === false) return false
    if (route.meta?.hidden === true) return false
    
    return true
  }

  private getBreadcrumbTitle(route: any, currentRoute: RouteLocationNormalized): string {
    // 优先使用路由元信息中的标题
    if (route.meta?.breadcrumbTitle) {
      return route.meta.breadcrumbTitle
    }
    
    if (route.meta?.title) {
      return route.meta.title
    }
    
    // 使用路由名称
    if (route.name) {
      return route.name
    }
    
    // 使用路径的最后一段
    const pathSegments = route.path.split('/').filter(Boolean)
    return pathSegments[pathSegments.length - 1] || 'Unknown'
  }

  private findRouteByPath(path: string): any {
    const findRoute = (routes: any[], targetPath: string): any => {
      for (const route of routes) {
        if (route.path === targetPath) {
          return route
        }
        if (route.children) {
          const childMatch = findRoute(route.children, targetPath)
          if (childMatch) return childMatch
        }
      }
      return null
    }

    return findRoute(this.router.getRoutes(), path)
  }

  private emitBreadcrumbChange(breadcrumbs: BreadcrumbItem[]): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('breadcrumb-change', {
        detail: { breadcrumbs }
      }))
    }
  }

  private emitBreadcrumbClick(item: BreadcrumbItem, index: number): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('breadcrumb-click', {
        detail: { item, index }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useBreadcrumbs() {
    return {
      breadcrumbs: computed(() => this._breadcrumbs.value),
      config: computed(() => this._config),
      breadcrumbText: computed(() => this.getBreadcrumbText()),
      breadcrumbPaths: computed(() => this.getBreadcrumbPaths()),
      depth: computed(() => this.getDepth())
    }
  }

  /**
   * 创建面包屑导航组件的属性
   */
  createBreadcrumbProps() {
    return {
      items: this._breadcrumbs.value,
      separator: this._config.separator,
      onClick: this.handleBreadcrumbClick.bind(this)
    }
  }

  /**
   * 获取结构化数据（用于SEO）
   */
  getStructuredData(): any {
    const breadcrumbs = this._breadcrumbs.value.filter(item => item.path)
    
    if (breadcrumbs.length === 0) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.title,
        'item': item.path ? `${window.location.origin}${item.path}` : undefined
      }))
    }
  }

  /**
   * 销毁面包屑管理器
   */
  destroy(): void {
    this._breadcrumbs.value = []
  }
}