import { ref, reactive, computed } from 'vue'
import type { DevToolsConfig, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export interface DevToolsData {
  routes: any[]
  currentRoute: RouteLocationNormalized | null
  navigationHistory: Array<{
    from: Route | null
    to: RouteLocationNormalized
    timestamp: number
    duration?: number
  }>
  performance: {
    navigationCount: number
    averageNavigationTime: number
    slowestNavigation: number
    fastestNavigation: number
  }
  cache: {
    size: number
    hitRate: number
    items: any[]
  }
  guards: {
    beforeGuards: number
    beforeResolveGuards: number
    afterGuards: number
    executionTimes: Array<{
      guard: string
      time: number
      route: string
    }>
  }
  errors: Array<{
    type: string
    message: string
    stack?: string
    route?: string
    timestamp: number
  }>
}

export class DevTools {
  private _enabled = ref(false)
  private _data = reactive<DevToolsData>({
    routes: [],
    currentRoute: null,
    navigationHistory: [],
    performance: {
      navigationCount: 0,
      averageNavigationTime: 0,
      slowestNavigation: 0,
      fastestNavigation: Infinity
    },
    cache: {
      size: 0,
      hitRate: 0,
      items: []
    },
    guards: {
      beforeGuards: 0,
      beforeResolveGuards: 0,
      afterGuards: 0,
      executionTimes: []
    },
    errors: []
  })
  private _config = reactive<Required<DevToolsConfig>>({
    enabled: process.env.NODE_ENV === 'development',
    showInProduction: false,
    maxHistorySize: 100,
    maxErrorSize: 50
  })
  private _navigationStartTime = 0

  constructor(
    private router: LDesignRouter,
    config?: DevToolsConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }

    this._enabled.value = this._config.enabled && 
      (process.env.NODE_ENV === 'development' || this._config.showInProduction)

    if (this._enabled.value) {
      this.initializeDevTools()
    }
  }

  get enabled(): boolean {
    return this._enabled.value
  }

  get data(): DevToolsData {
    return this._data
  }

  get config(): Required<DevToolsConfig> {
    return this._config
  }

  /**
   * 初始化开发工具
   */
  private initializeDevTools(): void {
    if (typeof window === 'undefined') return

    // 添加到全局对象
    ;(window as any).__LDESIGN_ROUTER_DEVTOOLS__ = this

    // 监听错误
    this.setupErrorHandling()

    // 创建开发工具面板
    this.createDevToolsPanel()

    console.info('LDesign Router DevTools initialized')
  }

  /**
   * 路由变化前的处理
   */
  onBeforeRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._enabled.value) return

    this._navigationStartTime = performance.now()
  }

  /**
   * 路由变化后的处理
   */
  onAfterRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._enabled.value) return

    const duration = performance.now() - this._navigationStartTime
    
    // 更新当前路由
    this._data.currentRoute = to

    // 添加到导航历史
    this.addNavigationHistory(from, to, duration)

    // 更新性能数据
    this.updatePerformanceData(duration)

    // 更新路由列表
    this.updateRoutes()
  }

  /**
   * 添加导航历史
   */
  private addNavigationHistory(from: Route | null, to: RouteLocationNormalized, duration: number): void {
    const historyItem = {
      from,
      to,
      timestamp: Date.now(),
      duration
    }

    this._data.navigationHistory.unshift(historyItem)

    // 限制历史记录大小
    if (this._data.navigationHistory.length > this._config.maxHistorySize) {
      this._data.navigationHistory = this._data.navigationHistory.slice(0, this._config.maxHistorySize)
    }
  }

  /**
   * 更新性能数据
   */
  private updatePerformanceData(duration: number): void {
    const perf = this._data.performance
    
    perf.navigationCount++
    perf.averageNavigationTime = (
      (perf.averageNavigationTime * (perf.navigationCount - 1) + duration) / 
      perf.navigationCount
    )
    
    if (duration > perf.slowestNavigation) {
      perf.slowestNavigation = duration
    }
    
    if (duration < perf.fastestNavigation) {
      perf.fastestNavigation = duration
    }
  }

  /**
   * 更新路由列表
   */
  private updateRoutes(): void {
    this._data.routes = this.router.getRoutes()
  }

  /**
   * 记录守卫执行时间
   */
  recordGuardExecution(guardType: string, executionTime: number, route: string): void {
    if (!this._enabled.value) return

    this._data.guards.executionTimes.unshift({
      guard: guardType,
      time: executionTime,
      route
    })

    // 限制记录大小
    if (this._data.guards.executionTimes.length > 100) {
      this._data.guards.executionTimes = this._data.guards.executionTimes.slice(0, 100)
    }
  }

  /**
   * 更新缓存数据
   */
  updateCacheData(size: number, hitRate: number, items: any[]): void {
    if (!this._enabled.value) return

    this._data.cache = {
      size,
      hitRate,
      items: items.slice(0, 20) // 只显示前20个
    }
  }

  /**
   * 记录错误
   */
  recordError(type: string, message: string, stack?: string, route?: string): void {
    if (!this._enabled.value) return

    const error = {
      type,
      message,
      stack,
      route,
      timestamp: Date.now()
    }

    this._data.errors.unshift(error)

    // 限制错误记录大小
    if (this._data.errors.length > this._config.maxErrorSize) {
      this._data.errors = this._data.errors.slice(0, this._config.maxErrorSize)
    }
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.recordError(
        'JavaScript Error',
        event.message,
        event.error?.stack,
        this._data.currentRoute?.path
      )
    })

    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(
        'Unhandled Promise Rejection',
        event.reason?.message || String(event.reason),
        event.reason?.stack,
        this._data.currentRoute?.path
      )
    })
  }

  /**
   * 创建开发工具面板
   */
  private createDevToolsPanel(): void {
    if (typeof document === 'undefined') return

    // 创建面板容器
    const panel = document.createElement('div')
    panel.id = 'ldesign-router-devtools'
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      z-index: 10000;
      display: none;
      overflow: hidden;
    `

    // 创建标题栏
    const header = document.createElement('div')
    header.style.cssText = `
      background: #f5f5f5;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `
    header.innerHTML = `
      <span>LDesign Router DevTools</span>
      <button id="devtools-close" style="background: none; border: none; font-size: 16px; cursor: pointer;">&times;</button>
    `

    // 创建内容区域
    const content = document.createElement('div')
    content.id = 'devtools-content'
    content.style.cssText = `
      max-height: 550px;
      overflow-y: auto;
      padding: 12px;
    `

    panel.appendChild(header)
    panel.appendChild(content)
    document.body.appendChild(panel)

    // 创建触发按钮
    const trigger = document.createElement('div')
    trigger.id = 'ldesign-router-devtools-trigger'
    trigger.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #1890ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `
    trigger.innerHTML = 'R'
    trigger.title = 'Open Router DevTools'
    document.body.appendChild(trigger)

    // 绑定事件
    trigger.addEventListener('click', () => {
      panel.style.display = 'block'
      trigger.style.display = 'none'
      this.updateDevToolsContent()
    })

    header.querySelector('#devtools-close')?.addEventListener('click', () => {
      panel.style.display = 'none'
      trigger.style.display = 'flex'
    })

    // 键盘快捷键
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault()
        if (panel.style.display === 'none') {
          trigger.click()
        } else {
          header.querySelector('#devtools-close')?.click()
        }
      }
    })
  }

  /**
   * 更新开发工具内容
   */
  private updateDevToolsContent(): void {
    const content = document.getElementById('devtools-content')
    if (!content) return

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Current Route</h4>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 11px;">
          ${this._data.currentRoute ? JSON.stringify(this._data.currentRoute, null, 2) : 'No route'}
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Performance</h4>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
          <div>Navigation Count: ${this._data.performance.navigationCount}</div>
          <div>Average Time: ${this._data.performance.averageNavigationTime.toFixed(2)}ms</div>
          <div>Slowest: ${this._data.performance.slowestNavigation.toFixed(2)}ms</div>
          <div>Fastest: ${this._data.performance.fastestNavigation === Infinity ? 'N/A' : this._data.performance.fastestNavigation.toFixed(2) + 'ms'}</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Navigation History (${this._data.navigationHistory.length})</h4>
        <div style="max-height: 150px; overflow-y: auto; background: #f8f9fa; border-radius: 4px;">
          ${this._data.navigationHistory.slice(0, 10).map(item => `
            <div style="padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 11px;">
              <div><strong>${item.to.path}</strong> (${item.duration?.toFixed(2)}ms)</div>
              <div style="color: #666;">${new Date(item.timestamp).toLocaleTimeString()}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Cache</h4>
        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
          <div>Size: ${this._data.cache.size}</div>
          <div>Hit Rate: ${(this._data.cache.hitRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Errors (${this._data.errors.length})</h4>
        <div style="max-height: 150px; overflow-y: auto; background: #f8f9fa; border-radius: 4px;">
          ${this._data.errors.slice(0, 5).map(error => `
            <div style="padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 11px;">
              <div style="color: #d32f2f; font-weight: 600;">${error.type}</div>
              <div style="color: #666;">${error.message}</div>
              <div style="color: #999;">${new Date(error.timestamp).toLocaleTimeString()}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Routes (${this._data.routes.length})</h4>
        <div style="max-height: 150px; overflow-y: auto; background: #f8f9fa; border-radius: 4px;">
          ${this._data.routes.map(route => `
            <div style="padding: 4px 8px; border-bottom: 1px solid #eee; font-size: 11px;">
              <div><strong>${route.path}</strong></div>
              <div style="color: #666;">${route.name || 'No name'}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="text-align: center; padding-top: 8px; border-top: 1px solid #eee; color: #666; font-size: 10px;">
        Press Ctrl+Shift+R to toggle
      </div>
    `
  }

  /**
   * 导出调试数据
   */
  exportData(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      router: {
        currentRoute: this._data.currentRoute,
        routes: this._data.routes
      },
      performance: this._data.performance,
      navigationHistory: this._data.navigationHistory,
      cache: this._data.cache,
      guards: this._data.guards,
      errors: this._data.errors
    }, null, 2)
  }

  /**
   * 清除数据
   */
  clearData(): void {
    this._data.navigationHistory = []
    this._data.errors = []
    this._data.guards.executionTimes = []
    this._data.performance = {
      navigationCount: 0,
      averageNavigationTime: 0,
      slowestNavigation: 0,
      fastestNavigation: Infinity
    }
  }

  /**
   * 启用/禁用开发工具
   */
  setEnabled(enabled: boolean): void {
    this._enabled.value = enabled
    
    if (enabled) {
      this.initializeDevTools()
    } else {
      this.destroy()
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DevToolsConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 获取响应式数据
   */
  useDevTools() {
    return {
      enabled: computed(() => this._enabled.value),
      data: computed(() => this._data),
      config: computed(() => this._config)
    }
  }

  /**
   * 销毁开发工具
   */
  destroy(): void {
    if (typeof document !== 'undefined') {
      const panel = document.getElementById('ldesign-router-devtools')
      const trigger = document.getElementById('ldesign-router-devtools-trigger')
      
      if (panel) panel.remove()
      if (trigger) trigger.remove()
    }

    if (typeof window !== 'undefined') {
      delete (window as any).__LDESIGN_ROUTER_DEVTOOLS__
    }
  }
}