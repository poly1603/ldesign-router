import { computed, reactive, ref } from 'vue'
import type { BreadcrumbConfig, BreadcrumbItem, Route } from '../types'

/**
 * 面包屑管理器
 * 负责自动生成和管理面包屑导航
 */
export class BreadcrumbManager {
  private _breadcrumbs = ref<BreadcrumbItem[]>([])

  private config = reactive<Required<BreadcrumbConfig>>({
    enabled: true,
    separator: '/',
    showHome: true,
    homeText: '首页',
    homePath: '/',
    maxItems: 10,
  })

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: BreadcrumbConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializeBreadcrumbs()
  }

  /**
   * 初始化面包屑
   */
  private initializeBreadcrumbs(): void {
    if (!this.config.enabled)
return

    // 添加首页面包屑
    if (this.config.showHome) {
      this.addHomeBreadcrumb()
    }
  }

  /**
   * 更新面包屑
   * @param route 当前路由
   */
  updateBreadcrumbs(route: Route): void {
    if (!this.config.enabled)
return

    const breadcrumbs: BreadcrumbItem[] = []

    // 添加首页
    if (this.config.showHome && route.path !== this.config.homePath) {
      breadcrumbs.push({
        title: this.config.homeText,
        path: this.config.homePath,
        icon: 'home',
      })
    }

    // 根据路由匹配生成面包屑
    const routeBreadcrumbs = this.generateBreadcrumbsFromRoute(route)
    breadcrumbs.push(...routeBreadcrumbs)

    // 限制面包屑数量
    if (breadcrumbs.length > this.config.maxItems) {
      const excess = breadcrumbs.length - this.config.maxItems
      breadcrumbs.splice(1, excess) // 保留首页，删除中间项

      // 添加省略号指示
      if (breadcrumbs.length > 1) {
        breadcrumbs.splice(1, 0, {
          title: '...',
          disabled: true,
        })
      }
    }

    this._breadcrumbs.value = breadcrumbs
  }

  /**
   * 从路由生成面包屑
   * @param route 当前路由
   * @returns 面包屑项数组
   */
  private generateBreadcrumbsFromRoute(route: Route): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []

    // 遍历匹配的路由
    route.matched.forEach((matchedRoute, index) => {
      const meta = matchedRoute.meta || {}

      // 跳过不显示面包屑的路由
      if (meta.breadcrumb === false)
return

      const title = this.getBreadcrumbTitle(matchedRoute, route)
      if (!title)
return

      const isLast = index === route.matched.length - 1

      breadcrumbs.push({
        title,
        path: isLast ? undefined : this.buildRoutePath(matchedRoute, route),
        icon: meta.icon,
        disabled: isLast,
      })
    })

    return breadcrumbs
  }

  /**
   * 获取面包屑标题
   * @param matchedRoute 匹配的路由
   * @param currentRoute 当前路由
   * @returns 标题
   */
  private getBreadcrumbTitle(matchedRoute: any, currentRoute: Route): string {
    const meta = matchedRoute.meta || {}

    // 优先使用 meta.title
    if (meta.title) {
      return typeof meta.title === 'function'
        ? meta.title(currentRoute)
        : meta.title
    }

    // 使用路由名称
    if (matchedRoute.name) {
      return matchedRoute.name
    }

    // 从路径提取
    const pathSegments = matchedRoute.path.split('/').filter(Boolean)
    return pathSegments[pathSegments.length - 1] || ''
  }

  /**
   * 构建路由路径
   * @param matchedRoute 匹配的路由
   * @param currentRoute 当前路由
   * @returns 路径
   */
  private buildRoutePath(matchedRoute: any, currentRoute: Route): string {
    let path = matchedRoute.path

    // 替换动态参数
    Object.keys(currentRoute.params).forEach((key) => {
      path = path.replace(`:${key}`, currentRoute.params[key])
    })

    return path
  }

  /**
   * 添加首页面包屑
   */
  private addHomeBreadcrumb(): void {
    this._breadcrumbs.value = [{
      title: this.config.homeText,
      path: this.config.homePath,
      icon: 'home',
    }]
  }

  /**
   * 手动添加面包屑项
   * @param item 面包屑项
   * @param index 插入位置，默认添加到末尾
   */
  addBreadcrumb(item: BreadcrumbItem, index?: number): void {
    if (index !== undefined) {
      this._breadcrumbs.value.splice(index, 0, item)
    }
 else {
      this._breadcrumbs.value.push(item)
    }
  }

  /**
   * 移除面包屑项
   * @param index 要移除的索引
   */
  removeBreadcrumb(index: number): void {
    if (index >= 0 && index < this._breadcrumbs.value.length) {
      this._breadcrumbs.value.splice(index, 1)
    }
  }

  /**
   * 清空面包屑
   */
  clearBreadcrumbs(): void {
    this._breadcrumbs.value = []

    // 重新添加首页
    if (this.config.showHome) {
      this.addHomeBreadcrumb()
    }
  }

  /**
   * 获取面包屑列表
   */
  getBreadcrumbs(): BreadcrumbItem[] {
    return this._breadcrumbs.value
  }

  /**
   * 获取面包屑的响应式引用
   */
  get breadcrumbs() {
    return computed(() => this._breadcrumbs.value)
  }

  /**
   * 设置配置
   * @param newConfig 新配置
   */
  setConfig(newConfig: Partial<BreadcrumbConfig>): void {
    Object.assign(this.config, newConfig)

    // 重新初始化
    if (this.config.enabled) {
      this.initializeBreadcrumbs()
    }
 else {
      this.clearBreadcrumbs()
    }
  }

  /**
   * 获取配置
   */
  getConfig(): BreadcrumbConfig {
    return { ...this.config }
  }

  /**
   * 生成面包屑文本
   * @param separator 分隔符，默认使用配置的分隔符
   * @returns 面包屑文本
   */
  getBreadcrumbText(separator?: string): string {
    const sep = separator || this.config.separator
    return this._breadcrumbs.value
      .filter(item => !item.disabled)
      .map(item => item.title)
      .join(` ${sep} `)
  }

  /**
   * 检查是否为首页
   * @param path 路径
   * @returns 是否为首页
   */
  isHomePage(path: string): boolean {
    return path === this.config.homePath
  }

  /**
   * 获取面包屑统计信息
   */
  getBreadcrumbStats(): {
    total: number
    maxItems: number
    enabled: boolean
    showHome: boolean
  } {
    return {
      total: this._breadcrumbs.value.length,
      maxItems: this.config.maxItems,
      enabled: this.config.enabled,
      showHome: this.config.showHome,
    }
  }
}
