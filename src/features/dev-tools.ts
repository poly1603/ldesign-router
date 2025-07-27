import { reactive, ref } from 'vue'
import type { DevToolsConfig, PerformanceMetrics, RouteError } from '../types'

/**
 * 开发工具
 * 提供路由调试和性能监控功能
 */
export class DevTools {
  private _errors = ref<RouteError[]>([])
  private _metrics = ref<PerformanceMetrics>({
    routeChangeTime: 0,
    componentLoadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
  })

  private config = reactive<Required<DevToolsConfig>>({
    enabled: true,
    position: 'bottom',
    size: 'medium',
    features: {
      routeInspector: true,
      performanceMonitor: true,
      errorTracker: true,
      cacheViewer: true,
      animationDebugger: true,
    },
  })

  private startTime: number = 0
  private errorCount: number = 0

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: DevToolsConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializeDevTools()
  }

  /**
   * 初始化开发工具
   */
  private initializeDevTools(): void {
    if (!this.config.enabled || process.env.NODE_ENV !== 'development') {
      return
    }

    this.setupErrorTracking()
    this.setupPerformanceMonitoring()
    this.setupRouteInspection()
    this.createDevToolsUI()
  }

  /**
   * 设置错误跟踪
   */
  private setupErrorTracking(): void {
    if (!this.config.features.errorTracker)
return

    // 监听全局错误
    window.addEventListener('error', (event) => {
      this.addError({
        id: this.generateErrorId(),
        type: 'component',
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
      })
    })

    // 监听未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.addError({
        id: this.generateErrorId(),
        type: 'navigation',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
      })
    })
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.features.performanceMonitor)
return

    // 监控路由变化性能
    this.router.beforeEach((to, from, next) => {
      this.startTime = performance.now()
      next()
    })

    this.router.afterEach(() => {
      const endTime = performance.now()
      this.updateMetrics({
        routeChangeTime: endTime - this.startTime,
      })
    })

    // 定期更新内存使用情况
    setInterval(() => {
      this.updateMemoryUsage()
    }, 5000)
  }

  /**
   * 设置路由检查
   */
  private setupRouteInspection(): void {
    if (!this.config.features.routeInspector)
return

    // 记录路由变化
    this.router.afterEach((to, from) => {
      console.group('🧭 Route Change')
      console.log('From:', from)
      console.log('To:', to)
      console.log('Matched:', to.matched)
      console.log('Meta:', to.meta)
      console.groupEnd()
    })
  }

  /**
   * 创建开发工具UI
   */
  private createDevToolsUI(): void {
    if (typeof document === 'undefined')
return

    const devToolsContainer = document.createElement('div')
    devToolsContainer.id = 'ldesign-dev-tools'
    devToolsContainer.innerHTML = this.getDevToolsHTML()
    devToolsContainer.style.cssText = this.getDevToolsCSS()

    document.body.appendChild(devToolsContainer)
    this.bindDevToolsEvents(devToolsContainer)
  }

  /**
   * 获取开发工具HTML
   */
  private getDevToolsHTML(): string {
    return `
      <div class="dev-tools-header">
        <span>LDesign Router DevTools</span>
        <button class="toggle-btn">📊</button>
      </div>
      <div class="dev-tools-content">
        <div class="tab-buttons">
          <button class="tab-btn active" data-tab="routes">Routes</button>
          <button class="tab-btn" data-tab="performance">Performance</button>
          <button class="tab-btn" data-tab="errors">Errors</button>
          <button class="tab-btn" data-tab="cache">Cache</button>
        </div>
        <div class="tab-content">
          <div class="tab-panel active" id="routes-panel">
            <div class="route-info"></div>
          </div>
          <div class="tab-panel" id="performance-panel">
            <div class="metrics-info"></div>
          </div>
          <div class="tab-panel" id="errors-panel">
            <div class="errors-list"></div>
          </div>
          <div class="tab-panel" id="cache-panel">
            <div class="cache-info"></div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 获取开发工具CSS
   */
  private getDevToolsCSS(): string {
    const position = this.config.position
    const size = this.config.size

    const sizeMap = {
      small: { width: '300px', height: '200px' },
      medium: { width: '400px', height: '300px' },
      large: { width: '600px', height: '400px' },
    }

    const { width, height } = sizeMap[size]

    return `
      position: fixed;
      ${position}: 10px;
      right: 10px;
      width: ${width};
      height: ${height};
      background: #1a1a1a;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 10000;
      overflow: hidden;
    `
  }

  /**
   * 绑定开发工具事件
   */
  private bindDevToolsEvents(container: HTMLElement): void {
    // 切换显示/隐藏
    const toggleBtn = container.querySelector('.toggle-btn')
    const content = container.querySelector('.dev-tools-content') as HTMLElement

    toggleBtn?.addEventListener('click', () => {
      content.style.display = content.style.display === 'none' ? 'block' : 'none'
    })

    // 标签页切换
    const tabBtns = container.querySelectorAll('.tab-btn')
    const tabPanels = container.querySelectorAll('.tab-panel')

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab')

        // 更新按钮状态
        tabBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        // 更新面板显示
        tabPanels.forEach((panel) => {
          panel.classList.remove('active')
          if (panel.id === `${tabName}-panel`) {
            panel.classList.add('active')
          }
        })

        // 更新面板内容
        this.updateTabContent(tabName as string)
      })
    })

    // 初始化内容
    this.updateTabContent('routes')
  }

  /**
   * 更新标签页内容
   */
  private updateTabContent(tabName: string): void {
    const panel = document.querySelector(`#${tabName}-panel`)
    if (!panel)
return

    switch (tabName) {
      case 'routes':
        this.updateRoutesPanel(panel)
        break
      case 'performance':
        this.updatePerformancePanel(panel)
        break
      case 'errors':
        this.updateErrorsPanel(panel)
        break
      case 'cache':
        this.updateCachePanel(panel)
        break
    }
  }

  /**
   * 更新路由面板
   */
  private updateRoutesPanel(panel: Element): void {
    const currentRoute = this.router.currentRoute
    const routes = this.router.getRoutes()

    panel.innerHTML = `
      <div style="padding: 10px;">
        <h4>Current Route</h4>
        <pre>${JSON.stringify(currentRoute, null, 2)}</pre>
        <h4>All Routes (${routes.length})</h4>
        <div style="max-height: 150px; overflow-y: auto;">
          ${routes.map(route => `<div>${route.path} (${route.name || 'unnamed'})</div>`).join('')}
        </div>
      </div>
    `
  }

  /**
   * 更新性能面板
   */
  private updatePerformancePanel(panel: Element): void {
    const metrics = this._metrics.value

    panel.innerHTML = `
      <div style="padding: 10px;">
        <h4>Performance Metrics</h4>
        <div>Route Change: ${metrics.routeChangeTime.toFixed(2)}ms</div>
        <div>Component Load: ${metrics.componentLoadTime.toFixed(2)}ms</div>
        <div>Render Time: ${metrics.renderTime.toFixed(2)}ms</div>
        <div>Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
        <div>Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%</div>
      </div>
    `
  }

  /**
   * 更新错误面板
   */
  private updateErrorsPanel(panel: Element): void {
    const errors = this._errors.value

    panel.innerHTML = `
      <div style="padding: 10px;">
        <h4>Errors (${errors.length})</h4>
        <div style="max-height: 200px; overflow-y: auto;">
          ${errors.map(error => `
            <div style="margin-bottom: 10px; padding: 5px; background: #2a2a2a; border-radius: 4px;">
              <div style="color: #ff6b6b;">${error.type}: ${error.message}</div>
              <div style="color: #888; font-size: 10px;">${new Date(error.timestamp).toLocaleTimeString()}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  /**
   * 更新缓存面板
   */
  private updateCachePanel(panel: Element): void {
    const cacheStats = this.router.cacheManager?.getCacheStats() || {
      size: 0,
      maxSize: 0,
      hitRate: 0,
      totalSize: 0,
      enabled: false,
    }

    panel.innerHTML = `
      <div style="padding: 10px;">
        <h4>Cache Status</h4>
        <div>Enabled: ${cacheStats.enabled ? 'Yes' : 'No'}</div>
        <div>Size: ${cacheStats.size}/${cacheStats.maxSize}</div>
        <div>Hit Rate: ${cacheStats.hitRate}%</div>
        <div>Total Size: ${(cacheStats.totalSize / 1024).toFixed(2)}KB</div>
      </div>
    `
  }

  /**
   * 添加错误
   */
  private addError(error: RouteError): void {
    this._errors.value.push(error)
    this.errorCount++

    // 限制错误数量
    if (this._errors.value.length > 100) {
      this._errors.value.shift()
    }
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(metrics: Partial<PerformanceMetrics>): void {
    Object.assign(this._metrics.value, metrics)
  }

  /**
   * 更新内存使用情况
   */
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.updateMetrics({
        memoryUsage: memory.usedJSHeapSize,
      })
    }
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取开发工具统计信息
   */
  getDevToolsStats(): {
    enabled: boolean
    errorCount: number
    features: DevToolsConfig['features']
  } {
    return {
      enabled: this.config.enabled,
      errorCount: this.errorCount,
      features: this.config.features,
    }
  }
}
