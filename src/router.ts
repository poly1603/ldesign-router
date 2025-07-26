import { reactive, ref, computed, App } from 'vue'
import type {
  Router,
  Route,
  RouteConfig,
  RouteLocation,
  RouteLocationNormalized,
  RouterOptions,
  NavigationGuard,
  RouteMeta
} from './types'
import { DeviceRouter } from './device-router'
import { TabsManager } from './tabs-manager'
import { BreadcrumbManager } from './breadcrumb-manager'
import { NavigationMenu } from './navigation-menu'
import { RouteCache } from './route-cache'
import { RouteAnimation } from './route-animation'
import { RouteGuard } from './route-guard'
import { PermissionManager } from './permission-manager'
import { ThemeManager } from './theme-manager'
import { I18nManager } from './i18n-manager'
import { PluginManager } from './plugin-manager'
import { DevTools } from './dev-tools'

export class LDesignRouter implements Router {
  private _currentRoute = ref<Route>({
    path: '/',
    name: '',
    params: {},
    query: {},
    hash: '',
    meta: {},
    matched: [],
    fullPath: '/'
  })

  private _routes = ref<RouteConfig[]>([])
  private _guards = {
    beforeEach: [] as NavigationGuard[],
    beforeResolve: [] as NavigationGuard[],
    afterEach: [] as ((to: Route, from: Route) => void)[]
  }

  public app: App | null = null
  public deviceRouter: DeviceRouter
  public tabsManager: TabsManager
  public breadcrumbManager: BreadcrumbManager
  public navigationMenu: NavigationMenu
  public routeCache: RouteCache
  public routeAnimation: RouteAnimation
  public routeGuard: RouteGuard
  public permissionManager: PermissionManager
  public themeManager: ThemeManager
  public i18nManager: I18nManager
  public pluginManager: PluginManager
  public devTools: DevTools

  constructor(public options: RouterOptions) {
    this._routes.value = options.routes || []
    
    // 初始化各个管理器
    this.deviceRouter = new DeviceRouter(this, options.deviceDetection)
    this.tabsManager = new TabsManager(this, options.tabs)
    this.breadcrumbManager = new BreadcrumbManager(this, options.breadcrumb)
    this.navigationMenu = new NavigationMenu(this, options.menu)
    this.routeCache = new RouteCache(this, options.cache)
    this.routeAnimation = new RouteAnimation(this, options.animation)
    this.routeGuard = new RouteGuard(this, options.permission)
    this.permissionManager = new PermissionManager(this, options.permission)
    this.themeManager = new ThemeManager(this, options.theme)
    this.i18nManager = new I18nManager(this, options.i18n)
    this.pluginManager = new PluginManager(this, options.plugins)
    this.devTools = new DevTools(this, options.devTools)

    this.init()
  }

  get currentRoute(): Route {
    return this._currentRoute.value
  }

  private init(): void {
    // 初始化浏览器历史记录监听
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState.bind(this))
      
      // 设置初始路由
      const initialPath = this.options.mode === 'hash' 
        ? window.location.hash.slice(1) || '/'
        : window.location.pathname
      
      this.replace({ path: initialPath })
    }
  }

  private handlePopState(event: PopStateEvent): void {
    const path = this.options.mode === 'hash'
      ? window.location.hash.slice(1) || '/'
      : window.location.pathname
    
    this.replace({ path }, false)
  }

  async push(to: RouteLocation): Promise<void> {
    const resolved = this.resolve(to)
    await this.navigate(resolved, 'push')
  }

  async replace(to: RouteLocation, updateHistory = true): Promise<void> {
    const resolved = this.resolve(to)
    await this.navigate(resolved, updateHistory ? 'replace' : 'silent')
  }

  go(delta: number): void {
    if (typeof window !== 'undefined') {
      window.history.go(delta)
    }
  }

  back(): void {
    this.go(-1)
  }

  forward(): void {
    this.go(1)
  }

  private async navigate(to: RouteLocationNormalized, type: 'push' | 'replace' | 'silent'): Promise<void> {
    const from = this._currentRoute.value

    try {
      // 执行导航守卫
      const canNavigate = await this.executeGuards(to, from)
      if (!canNavigate) return

      // 更新当前路由
      this._currentRoute.value = {
        ...to,
        fullPath: this.buildFullPath(to)
      }

      // 更新浏览器历史记录
      if (type !== 'silent' && typeof window !== 'undefined') {
        const url = this.options.mode === 'hash' 
          ? `#${to.path}${this.buildQuery(to.query)}${to.hash}`
          : `${to.path}${this.buildQuery(to.query)}${to.hash}`
        
        if (type === 'push') {
          window.history.pushState(null, '', url)
        } else {
          window.history.replaceState(null, '', url)
        }
      }

      // 通知各个管理器
      this.tabsManager.onRouteChange(to, from)
      this.breadcrumbManager.onRouteChange(to, from)
      this.routeCache.onRouteChange(to, from)
      this.routeAnimation.onRouteChange(to, from)
      this.devTools.onRouteChange(to, from)

      // 执行后置守卫
      this._guards.afterEach.forEach(guard => guard(this._currentRoute.value, from))

    } catch (error) {
      console.error('Navigation error:', error)
      this.devTools.recordError({
        id: Date.now().toString(),
        type: 'navigation',
        message: error instanceof Error ? error.message : 'Unknown navigation error',
        stack: error instanceof Error ? error.stack : undefined,
        route: to,
        timestamp: Date.now()
      })
    }
  }

  private async executeGuards(to: RouteLocationNormalized, from: Route): Promise<boolean> {
    // 执行全局前置守卫
    for (const guard of this._guards.beforeEach) {
      const result = await this.executeGuard(guard, to, from)
      if (result === false) return false
      if (typeof result === 'object') {
        await this.navigate(this.resolve(result), 'replace')
        return false
      }
    }

    // 执行路由级守卫
    const matchedRoute = this.findMatchedRoute(to.path)
    if (matchedRoute?.beforeEnter) {
      const result = await this.executeGuard(matchedRoute.beforeEnter, to, from)
      if (result === false) return false
      if (typeof result === 'object') {
        await this.navigate(this.resolve(result), 'replace')
        return false
      }
    }

    // 执行权限检查
    const hasPermission = await this.permissionManager.checkPermission(to)
    if (!hasPermission) return false

    // 执行解析守卫
    for (const guard of this._guards.beforeResolve) {
      const result = await this.executeGuard(guard, to, from)
      if (result === false) return false
      if (typeof result === 'object') {
        await this.navigate(this.resolve(result), 'replace')
        return false
      }
    }

    return true
  }

  private async executeGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: Route
  ): Promise<boolean | RouteLocation | void> {
    return new Promise((resolve) => {
      const next = (result?: RouteLocation | boolean | Error) => {
        if (result instanceof Error) {
          throw result
        }
        resolve(result)
      }

      const result = guard(to, from, next)
      if (result instanceof Promise) {
        result.then(resolve).catch(next)
      } else if (result !== undefined) {
        resolve(result)
      }
    })
  }

  resolve(to: RouteLocation): RouteLocationNormalized {
    if (typeof to === 'string') {
      to = { path: to }
    }

    const matched = this.findMatchedRoute(to.path || '/')
    const meta = matched?.meta || {}

    return {
      path: to.path || '/',
      name: to.name || matched?.name || '',
      params: { ...to.params } || {},
      query: { ...to.query } || {},
      hash: to.hash || '',
      meta,
      matched: matched ? [matched] : []
    }
  }

  private findMatchedRoute(path: string): RouteConfig | null {
    const findRoute = (routes: RouteConfig[], targetPath: string): RouteConfig | null => {
      for (const route of routes) {
        if (this.matchPath(route.path, targetPath)) {
          return route
        }
        if (route.children) {
          const childMatch = findRoute(route.children, targetPath)
          if (childMatch) return childMatch
        }
      }
      return null
    }

    return findRoute(this._routes.value, path)
  }

  private matchPath(routePath: string, targetPath: string): boolean {
    // 简单的路径匹配，实际应该支持动态参数
    if (routePath === targetPath) return true
    
    // 支持动态参数匹配 /user/:id
    const routeSegments = routePath.split('/')
    const targetSegments = targetPath.split('/')
    
    if (routeSegments.length !== targetSegments.length) return false
    
    return routeSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === targetSegments[index]
    })
  }

  private buildFullPath(route: RouteLocationNormalized): string {
    let path = route.path
    const query = this.buildQuery(route.query)
    const hash = route.hash
    
    return `${path}${query}${hash}`
  }

  private buildQuery(query: Record<string, any>): string {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)))
      } else {
        params.append(key, String(value))
      }
    })
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  beforeEach(guard: NavigationGuard): () => void {
    this._guards.beforeEach.push(guard)
    return () => {
      const index = this._guards.beforeEach.indexOf(guard)
      if (index > -1) this._guards.beforeEach.splice(index, 1)
    }
  }

  beforeResolve(guard: NavigationGuard): () => void {
    this._guards.beforeResolve.push(guard)
    return () => {
      const index = this._guards.beforeResolve.indexOf(guard)
      if (index > -1) this._guards.beforeResolve.splice(index, 1)
    }
  }

  afterEach(guard: (to: Route, from: Route) => void): () => void {
    this._guards.afterEach.push(guard)
    return () => {
      const index = this._guards.afterEach.indexOf(guard)
      if (index > -1) this._guards.afterEach.splice(index, 1)
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

  install(app: App): void {
    this.app = app
    
    // 注册全局属性
    app.config.globalProperties.$router = this
    app.config.globalProperties.$route = computed(() => this.currentRoute)
    
    // 提供注入
    app.provide('router', this)
    app.provide('route', computed(() => this.currentRoute))
    
    // 安装插件
    this.pluginManager.installAll()
    
    // 初始化开发工具
    if (this.options.devTools) {
      this.devTools.init()
    }
  }
}

export function createRouter(options: RouterOptions): Router {
  return new LDesignRouter(options)
}