/**
 * @ldesign/router 性能监控面板
 *
 * 提供可视化的性能监控面板，实时显示路由性能指标。
 * 
 * **核心功能**：
 * - 实时性能指标展示
 * - 路由导航时间线
 * - 内存使用趋势图
 * - 缓存命中率统计
 * - 性能警告提示
 * 
 * **适用场景**：
 * - 开发环境性能调试
 * - 生产环境性能监控
 * - 性能瓶颈分析
 * 
 * @module debug/performance-panel
 * @author ldesign
 */

import type { Router, RouteLocationNormalized } from '../types'

// ==================== 类型定义 ====================

/**
 * 性能数据点
 */
export interface PerformanceDataPoint {
  /** 时间戳 */
  timestamp: number
  /** 路由路径 */
  route: string
  /** 导航时间（毫秒） */
  navigationTime: number
  /** 组件加载时间（毫秒） */
  componentLoadTime: number
  /** 内存使用（MB） */
  memoryUsage: number
}

/**
 * 性能面板配置
 */
export interface PerformancePanelConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 面板位置 */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /** 是否可拖动 */
  draggable?: boolean
  /** 是否可折叠 */
  collapsible?: boolean
  /** 数据保留时长（毫秒） */
  dataRetention?: number
  /** 更新频率（毫秒） */
  updateInterval?: number
}

// ==================== 性能面板类 ====================

/**
 * 性能监控面板类
 * 
 * 创建一个浮动的性能监控面板，实时显示路由性能数据。
 * 
 * @class
 * @export
 * 
 * @example
 * ```ts
 * const panel = new PerformancePanel({
 *   enabled: true,
 *   position: 'bottom-right',
 *   collapsible: true
 * })
 * 
 * panel.attach(router)
 * ```
 */
export class PerformancePanel {
  private config: Required<PerformancePanelConfig>
  private router?: Router
  private container?: HTMLElement
  private dataPoints: PerformanceDataPoint[] = []
  private updateTimer?: ReturnType<typeof setInterval>
  private navigationStartTime = 0

  /**
   * 创建性能面板实例
   * 
   * @param config - 配置选项
   */
  constructor(config: PerformancePanelConfig = {}) {
    this.config = {
      enabled: true,
      position: 'bottom-right',
      draggable: true,
      collapsible: true,
      dataRetention: 5 * 60 * 1000, // 5分钟
      updateInterval: 1000, // 1秒更新一次
      ...config,
    }
  }

  /**
   * 附加到路由器
   * 
   * @param router - 路由器实例
   * 
   * @example
   * ```ts
   * const panel = new PerformancePanel()
   * panel.attach(router)
   * ```
   */
  attach(router: Router): void {
    if (!this.config.enabled) return
    if (typeof window === 'undefined') return

    this.router = router

    // 创建面板 UI
    this.createPanel()

    // 监听路由变化
    router.beforeEach((to, from, next) => {
      this.navigationStartTime = performance.now()
      next()
    })

    router.afterEach((to) => {
      this.recordNavigation(to)
    })

    // 启动更新定时器
    this.startUpdateTimer()
  }

  /**
   * 创建面板 UI
   * 
   * @private
   */
  private createPanel(): void {
    const container = document.createElement('div')
    container.id = 'ldesign-router-performance-panel'
    container.className = `performance-panel ${this.config.position}`

    container.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🚀 路由性能监控</span>
        ${this.config.collapsible ? '<button class="collapse-btn">−</button>' : ''}
      </div>
      <div class="panel-content">
        <div class="metric">
          <span class="metric-label">平均导航时间:</span>
          <span class="metric-value" id="avg-nav-time">0ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">缓存命中率:</span>
          <span class="metric-value" id="cache-hit-rate">0%</span>
        </div>
        <div class="metric">
          <span class="metric-label">内存使用:</span>
          <span class="metric-value" id="memory-usage">0MB</span>
        </div>
        <div class="metric">
          <span class="metric-label">导航次数:</span>
          <span class="metric-value" id="nav-count">0</span>
        </div>
      </div>
    `

    // 添加样式
    this.injectStyles()

    // 添加到页面
    document.body.appendChild(container)
    this.container = container

    // 绑定事件
    if (this.config.collapsible) {
      const collapseBtn = container.querySelector('.collapse-btn')
      collapseBtn?.addEventListener('click', () => {
        container.classList.toggle('collapsed')
      })
    }

    if (this.config.draggable) {
      this.makeDraggable(container)
    }
  }

  /**
   * 注入样式
   * 
   * @private
   */
  private injectStyles(): void {
    if (document.getElementById('ldesign-router-performance-panel-styles')) {
      return
    }

    const style = document.createElement('style')
    style.id = 'ldesign-router-performance-panel-styles'
    style.textContent = `
      .performance-panel {
        position: fixed;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        padding: 12px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s;
      }
      
      .performance-panel.top-right { top: 20px; right: 20px; }
      .performance-panel.top-left { top: 20px; left: 20px; }
      .performance-panel.bottom-right { bottom: 20px; right: 20px; }
      .performance-panel.bottom-left { bottom: 20px; left: 20px; }
      
      .performance-panel.collapsed .panel-content { display: none; }
      
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .panel-title { font-weight: bold; }
      
      .collapse-btn {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        padding: 0 4px;
      }
      
      .metric {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
      }
      
      .metric-label { opacity: 0.7; }
      .metric-value { font-weight: bold; color: #4ade80; }
    `

    document.head.appendChild(style)
  }

  /**
   * 使面板可拖动
   * 
   * @private
   * @param element - 面板元素
   */
  private makeDraggable(element: HTMLElement): void {
    let isDragging = false
    let currentX = 0
    let currentY = 0
    let initialX = 0
    let initialY = 0

    const header = element.querySelector('.panel-header') as HTMLElement

    header.style.cursor = 'move'

    header.addEventListener('mousedown', (e) => {
      isDragging = true
      initialX = e.clientX - currentX
      initialY = e.clientY - currentY
    })

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault()
        currentX = e.clientX - initialX
        currentY = e.clientY - initialY
        element.style.transform = `translate(${currentX}px, ${currentY}px)`
      }
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
    })
  }

  /**
   * 记录导航
   * 
   * @private
   * @param to - 目标路由
   */
  private recordNavigation(to: RouteLocationNormalized): void {
    const navigationTime = performance.now() - this.navigationStartTime

    const dataPoint: PerformanceDataPoint = {
      timestamp: Date.now(),
      route: to.path,
      navigationTime,
      componentLoadTime: 0, // 待实现
      memoryUsage: this.getMemoryUsage(),
    }

    this.dataPoints.push(dataPoint)

    // 清理过期数据
    this.cleanupOldData()
  }

  /**
   * 获取内存使用量
   * 
   * @private
   * @returns 内存使用量（MB）
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  /**
   * 清理过期数据
   * 
   * @private
   */
  private cleanupOldData(): void {
    const now = Date.now()
    this.dataPoints = this.dataPoints.filter(
      point => now - point.timestamp <= this.config.dataRetention,
    )
  }

  /**
   * 启动更新定时器
   * 
   * @private
   */
  private startUpdateTimer(): void {
    this.updateTimer = setInterval(() => {
      this.updatePanel()
    }, this.config.updateInterval)
  }

  /**
   * 更新面板数据
   * 
   * @private
   */
  private updatePanel(): void {
    if (!this.container || !this.router) return

    // 计算平均导航时间
    const avgNavTime = this.dataPoints.length > 0
      ? this.dataPoints.reduce((sum, p) => sum + p.navigationTime, 0) / this.dataPoints.length
      : 0

    // 获取路由器统计（如果有 getMemoryStats 方法）
    const stats = (this.router as any).getMemoryStats?.()
    const cacheHitRate = stats?.matcher?.cacheHitRate || 0

    // 更新 UI
    const avgNavTimeEl = this.container.querySelector('#avg-nav-time')
    if (avgNavTimeEl) avgNavTimeEl.textContent = `${avgNavTime.toFixed(1)}ms`

    const cacheHitRateEl = this.container.querySelector('#cache-hit-rate')
    if (cacheHitRateEl) cacheHitRateEl.textContent = `${(cacheHitRate * 100).toFixed(1)}%`

    const memoryUsageEl = this.container.querySelector('#memory-usage')
    if (memoryUsageEl) memoryUsageEl.textContent = `${this.getMemoryUsage().toFixed(1)}MB`

    const navCountEl = this.container.querySelector('#nav-count')
    if (navCountEl) navCountEl.textContent = String(this.dataPoints.length)
  }

  /**
   * 显示面板
   * 
   * @example
   * ```ts
   * panel.show()
   * ```
   */
  show(): void {
    if (this.container) {
      this.container.style.display = 'block'
    }
  }

  /**
   * 隐藏面板
   * 
   * @example
   * ```ts
   * panel.hide()
   * ```
   */
  hide(): void {
    if (this.container) {
      this.container.style.display = 'none'
    }
  }

  /**
   * 销毁面板
   * 
   * @example
   * ```ts
   * panel.destroy()
   * ```
   */
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    if (this.container) {
      this.container.remove()
    }

    this.dataPoints = []
  }
}

/**
 * 创建性能监控面板
 * 
 * @param config - 配置选项
 * @returns 面板实例
 * 
 * @example
 * ```ts
 * import { createPerformancePanel } from '@ldesign/router/debug'
 * 
 * const panel = createPerformancePanel({
 *   enabled: import.meta.env.DEV,
 *   position: 'bottom-right'
 * })
 * 
 * panel.attach(router)
 * ```
 */
export function createPerformancePanel(config?: PerformancePanelConfig): PerformancePanel {
  return new PerformancePanel(config)
}

// 默认导出
export default PerformancePanel


