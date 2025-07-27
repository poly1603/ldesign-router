import type { App } from 'vue'
import { computed, ref } from 'vue'
import type {
  NavigationGuard,
  Route,
  RouteConfig,
  RouteLocation,
  RouteLocationNormalized,
  Router,
  RouterOptions,
} from '../types'

// 管理器导入
import { GuardManager } from '../managers/guard'
import { PermissionManager } from '../managers/permission'
import { CacheManager } from '../managers/cache'
import { BreadcrumbManager } from '../managers/breadcrumb'
import { TabsManager } from '../managers/tabs'
import { AnimationManager } from '../managers/animation'
import { DeviceRouter } from '../features/device-router'
import { MenuManager } from '../features/menu'
import { DevTools } from '../features/dev-tools'

export class LDesignRouter implements Router {
  private _currentRoute = ref<Route>({
    path: '/',
    name: 'root',
    params: {},
    query: {},
    hash: '',
    meta: {},
    matched: [],
    fullPath: '/',
  })

  private _routes = ref<RouteConfig[]>([])
  private _app: App | null = null

  // 管理器实例
  public readonly guardManager: GuardManager
  public readonly permissionManager: PermissionManager
  public readonly cacheManager: CacheManager
  public readonly breadcrumbManager: BreadcrumbManager
  public readonly tabsManager: TabsManager
  public readonly animationManager: AnimationManager
  public readonly deviceRouter: DeviceRouter
  public readonly menuManager: MenuManager
  public readonly devTools?: DevTools

  constructor(public readonly options: RouterOptions) {
    // 初始化路由
    this._routes.value = options.routes || []

    // 初始化管理器
    this.guardManager = new GuardManager(this, options.guards)
    this.permissionManager = new PermissionManager(this, options.permission)
    this.cacheManager = new CacheManager(this, options.cache)
    this.breadcrumbManager = new BreadcrumbManager(this, options.breadcrumb)
    this.tabsManager = new TabsManager(this, options.tabs)
    this.animationManager = new AnimationManager(this, options.animation)
    this.deviceRouter = new DeviceRouter(this, options.deviceRouter)
    this.menuManager = new MenuManager(this, options.menu)

    // 开发工具（仅在开发环境）
    if (options.devTools && process.env.NODE_ENV === 'development') {
      this.devTools = new DevTools(this)
    }

    this.setupRouterListeners()
  }

  get currentRoute(): { value: Route } {
    return this._currentRoute
  }

  get app(): App | null {
    return this._app
  }

  // 导航方法
  async push(to: RouteLocation): Promise<void> {
    const resolved = this.resolve(to)

    // 执行导航守卫
    const canNavigate = await this.guardManager.executeBeforeEach(resolved, this.currentRoute)
    if (!canNavigate)
return

    // 权限检查
    if (!this.permissionManager.checkRoutePermission(resolved)) {
      const redirectPath = this.permissionManager.getRedirectPath()
      if (redirectPath) {
        return this.push({ path: redirectPath })
      }
      return
    }

    // 更新当前路由
    this.updateCurrentRoute(resolved)

    // 执行后置守卫
    this.guardManager.executeAfterEach(resolved, this.currentRoute)
  }

  async replace(to: RouteLocation): Promise<void> {
    // 实现类似 push，但替换当前历史记录
    await this.push(to)
  }

  go(delta: number): void {
    if (typeof window !== 'undefined' && window.history) {
      window.history.go(delta)
    }
  }

  back(): void {
    this.go(-1)
  }

  forward(): void {
    this.go(1)
  }

  // 守卫方法
  beforeEach(guard: NavigationGuard): () => void {
    return this.guardManager.addBeforeEach(guard)
  }

  beforeResolve(guard: NavigationGuard): () => void {
    return this.guardManager.addBeforeResolve(guard)
  }

  afterEach(guard: (to: Route, from: Route) => void): () => void {
    return this.guardManager.addAfterEach(guard)
  }

  // 路由操作
  resolve(to: RouteLocation): RouteLocationNormalized {
    // 简化的路由解析逻辑
    const path = to.path || '/'
    const name = to.name || ''
    const params = to.params || {}
    const query = to.query || {}
    const hash = to.hash || ''
    const meta = to.meta || {}

    return {
      path,
      name,
      params,
      query,
      hash,
      meta,
      matched: this.findMatchedRoutes(path),
    }
  }

  addRoute(route: RouteConfig): void {
    this._routes.value.push(route)
  }

  removeRoute(name: string): void {
    const index = this._routes.value.findIndex(route => route.name === name)
    if (index > -1) {
      this._routes.value.splice(index, 1)
    }
  }

  hasRoute(name: string): boolean {
    return this._routes.value.some(route => route.name === name)
  }

  getRoutes(): RouteConfig[] {
    return [...this._routes.value]
  }

  // Vue 插件接口
  install(app: App): void {
    this._app = app

    // 注册全局属性
    app.config.globalProperties.$router = this
    app.config.globalProperties.$route = computed(() => this.currentRoute)

    // 提供注入
    app.provide('router', this)
    app.provide('route', computed(() => this.currentRoute))

    // 注册组件
    // app.component('RouterView', RouterView)
    // app.component('RouterLink', RouterLink)
  }

  // 私有方法
  private updateCurrentRoute(route: RouteLocationNormalized): void {
    const newRoute: Route = {
      ...route,
      fullPath: this.buildFullPath(route),
    }

    this._currentRoute.value = newRoute

    // 更新相关管理器
    this.breadcrumbManager.updateBreadcrumbs(newRoute)
    this.tabsManager.addTab(newRoute)
    this.cacheManager.handleRouteChange(newRoute)
  }

  private buildFullPath(route: RouteLocationNormalized): string {
    let fullPath = route.path

    // 添加查询参数
    const queryString = new URLSearchParams(
      Object.entries(route.query).map(([key, value]) => [key, String(value)]),
    ).toString()

    if (queryString) {
      fullPath += `?${queryString}`
    }

    // 添加哈希
    if (route.hash) {
      fullPath += route.hash
    }

    return fullPath
  }

  private findMatchedRoutes(path: string): RouteConfig[] {
    // 简化的路由匹配逻辑
    const matched: RouteConfig[] = []

    const findRoute = (routes: RouteConfig[], currentPath: string): RouteConfig | null => {
      for (const route of routes) {
        if (route.path === currentPath || this.pathMatches(route.path, currentPath)) {
          matched.push(route)
          return route
        }

        if (route.children) {
          const childRoute = findRoute(route.children, currentPath)
          if (childRoute) {
            matched.unshift(route)
            return childRoute
          }
        }
      }
      return null
    }

    findRoute(this._routes.value, path)
    return matched
  }

  private pathMatches(routePath: string, currentPath: string): boolean {
    // 简化的路径匹配逻辑
    if (routePath === currentPath)
return true

    // 处理动态路由参数
    const routeSegments = routePath.split('/')
    const pathSegments = currentPath.split('/')

    if (routeSegments.length !== pathSegments.length)
return false

    return routeSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === pathSegments[index]
    })
  }

  private setupRouterListeners(): void {
    // 监听浏览器前进后退
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState.bind(this))
    }
  }

  private handlePopState(event: PopStateEvent): void {
    const path = window.location.pathname
    this.push({ path })
  }
}
