/**
 * @ldesign/router 高级路由分析工具
 *
 * 提供深度的路由访问分析和用户行为追踪功能。
 * 
 * **核心功能**：
 * - 路由访问热力图
 * - 用户路径分析
 * - 转化漏斗追踪
 * - 路由性能报告
 * - 跳出率分析
 * - 平均停留时间
 * 
 * **应用场景**：
 * - 产品数据分析
 * - 用户行为研究
 * - 转化率优化
 * - 页面性能监控
 * 
 * @module analytics/advanced-analytics
 * @author ldesign
 */

import type { RouteLocationNormalized, Router } from '../types'

// ==================== 类型定义 ====================

/**
 * 路由访问统计
 */
export interface RouteAccessStats {
  /** 路由路径 */
  path: string
  /** 访问次数 */
  pageViews: number
  /** 独立访客数（粗略估算） */
  uniqueVisitors: number
  /** 平均停留时间（毫秒） */
  avgDuration: number
  /** 跳出率（0-1） */
  bounceRate: number
  /** 最后访问时间 */
  lastAccess: number
  /** 入口次数（作为首页访问） */
  entrances: number
  /** 出口次数（作为最后页面） */
  exits: number
}

/**
 * 用户路径记录
 */
export interface UserPath {
  /** 路径ID */
  id: string
  /** 路由序列 */
  routes: string[]
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 总时长 */
  duration?: number
  /** 是否完成（达到目标） */
  completed?: boolean
}

/**
 * 转化漏斗
 */
export interface ConversionFunnel {
  /** 漏斗名称 */
  name: string
  /** 步骤列表 */
  steps: Array<{
    path: string
    name: string
    order: number
  }>
  /** 漏斗数据 */
  data?: Array<{
    step: number
    count: number
    conversionRate: number
  }>
}

/**
 * 热力图数据
 */
export interface HeatmapData {
  /** 路由路径 */
  path: string
  /** 热度值（0-100） */
  heat: number
  /** 访问次数 */
  visits: number
  /** 平均停留时间 */
  avgTime: number
}

// ==================== 高级分析器 ====================

/**
 * 高级路由分析器类
 * 
 * 提供强大的路由访问分析和用户行为追踪能力。
 * 
 * @class
 * @export
 * 
 * @example
 * ```ts
 * const analyzer = new AdvancedRouteAnalyzer()
 * analyzer.attach(router)
 * 
 * // 获取热力图
 * const heatmap = analyzer.getHeatmap()
 * 
 * // 分析用户路径
 * const paths = analyzer.getUserPaths()
 * 
 * // 计算转化率
 * const funnel = analyzer.getFunnelData({
 *   name: '购买流程',
 *   steps: [
 *     { path: '/products', name: '商品列表', order: 1 },
 *     { path: '/cart', name: '购物车', order: 2 },
 *     { path: '/checkout', name: '结算', order: 3 },
 *     { path: '/success', name: '成功', order: 4 }
 *   ]
 * })
 * ```
 */
export class AdvancedRouteAnalyzer {
  private router?: Router

  /** 路由访问统计 */
  private stats = new Map<string, RouteAccessStats>()

  /** 用户路径记录 */
  private userPaths: UserPath[] = []

  /** 当前会话 */
  private currentSession?: UserPath

  /** 会话开始时间 */
  private sessionStartTime = 0

  /** 上一个路由 */
  private previousRoute?: RouteLocationNormalized

  /** 页面进入时间 */
  private pageEnterTime = 0

  /**
   * 附加到路由器
   * 
   * @param router - 路由器实例
   */
  attach(router: Router): void {
    this.router = router

    // 开始新会话
    this.startSession()

    // 监听路由变化
    router.afterEach((to, from) => {
      this.trackNavigation(to, from)
    })

    // 记录首次访问
    if (router.currentRoute.value) {
      this.trackPageView(router.currentRoute.value, true)
    }
  }

  /**
   * 开始新会话
   * 
   * @private
   */
  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      routes: [],
      startTime: Date.now(),
    }

    this.sessionStartTime = Date.now()
  }

  /**
   * 生成会话ID
   * 
   * @private
   * @returns 会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 追踪导航
   * 
   * @private
   * @param to - 目标路由
   * @param from - 来源路由
   */
  private trackNavigation(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
    // 计算停留时间
    const duration = Date.now() - this.pageEnterTime

    // 更新来源路由统计
    if (from.path && from.path !== '/') {
      this.updateStats(from.path, duration, false)
    }

    // 追踪新页面
    this.trackPageView(to, from.path === '/')

    // 记录到会话
    if (this.currentSession) {
      this.currentSession.routes.push(to.path)
    }

    this.previousRoute = from
  }

  /**
   * 追踪页面访问
   * 
   * @private
   * @param route - 路由
   * @param isEntrance - 是否是入口
   */
  private trackPageView(route: RouteLocationNormalized, isEntrance: boolean): void {
    let stats = this.stats.get(route.path)

    if (!stats) {
      stats = {
        path: route.path,
        pageViews: 0,
        uniqueVisitors: 0,
        avgDuration: 0,
        bounceRate: 0,
        lastAccess: Date.now(),
        entrances: 0,
        exits: 0,
      }
      this.stats.set(route.path, stats)
    }

    stats.pageViews++
    stats.lastAccess = Date.now()

    if (isEntrance) {
      stats.entrances++
    }

    this.pageEnterTime = Date.now()
  }

  /**
   * 更新统计数据
   * 
   * @private
   * @param path - 路由路径
   * @param duration - 停留时间
   * @param isExit - 是否是出口
   */
  private updateStats(path: string, duration: number, isExit: boolean): void {
    const stats = this.stats.get(path)
    if (!stats) return

    // 更新平均停留时间
    stats.avgDuration = (stats.avgDuration * (stats.pageViews - 1) + duration) / stats.pageViews

    if (isExit) {
      stats.exits++
    }

    // 计算跳出率（单页访问的比例）
    stats.bounceRate = stats.entrances > 0 ? stats.exits / stats.entrances : 0
  }

  /**
   * 获取路由热力图数据
   * 
   * 返回所有路由的热度数据，用于可视化展示。
   * 
   * @param topN - 返回TOP N 路由（默认全部）
   * @returns 热力图数据数组
   * 
   * @example
   * ```ts
   * const heatmap = analyzer.getHeatmap(10)
   * // [{ path: '/home', heat: 95, visits: 1000 }, ...]
   * ```
   */
  getHeatmap(topN?: number): HeatmapData[] {
    const allStats = Array.from(this.stats.values())

    // 找出最大访问次数（用于归一化）
    const maxVisits = Math.max(...allStats.map(s => s.pageViews), 1)

    // 生成热力图数据
    const heatmap = allStats.map(stats => ({
      path: stats.path,
      heat: (stats.pageViews / maxVisits) * 100,
      visits: stats.pageViews,
      avgTime: stats.avgDuration,
    }))

    // 按热度排序
    heatmap.sort((a, b) => b.heat - a.heat)

    // 返回TOP N
    return topN ? heatmap.slice(0, topN) : heatmap
  }

  /**
   * 获取用户路径
   * 
   * 返回所有用户的访问路径序列。
   * 
   * @param minLength - 最小路径长度（默认2）
   * @returns 用户路径数组
   * 
   * @example
   * ```ts
   * const paths = analyzer.getUserPaths(3)
   * // 获取至少包含3个页面的用户路径
   * ```
   */
  getUserPaths(minLength: number = 2): UserPath[] {
    return this.userPaths.filter(path => path.routes.length >= minLength)
  }

  /**
   * 分析转化漏斗
   * 
   * 计算指定流程的转化率。
   * 
   * @param funnel - 漏斗配置
   * @returns 带数据的漏斗对象
   * 
   * @example
   * ```ts
   * const funnel = analyzer.getFunnelData({
   *   name: '注册流程',
   *   steps: [
   *     { path: '/signup', name: '注册页', order: 1 },
   *     { path: '/verify', name: '验证', order: 2 },
   *     { path: '/profile', name: '完善资料', order: 3 },
   *     { path: '/welcome', name: '完成', order: 4 }
   *   ]
   * })
   * 
   * funnel.data.forEach(step => {
   *   console.log(`步骤${step.step}: ${step.count}人, 转化率${step.conversionRate}%`)
   * })
   * ```
   */
  getFunnelData(funnel: ConversionFunnel): ConversionFunnel {
    const steps = funnel.steps.sort((a, b) => a.order - b.order)
    const data: ConversionFunnel['data'] = []

    // 计算每一步的数量
    let previousCount = 0

    steps.forEach((step, index) => {
      const stats = this.stats.get(step.path)
      const count = stats?.pageViews || 0

      // 计算转化率
      const conversionRate = index === 0
        ? 100
        : previousCount > 0
          ? (count / previousCount) * 100
          : 0

      data.push({
        step: index + 1,
        count,
        conversionRate,
      })

      previousCount = count
    })

    return {
      ...funnel,
      data,
    }
  }

  /**
   * 获取路由统计报告
   * 
   * @returns 完整的统计报告
   * 
   * @example
   * ```ts
   * const report = analyzer.getReport()
   * console.log('总页面访问:', report.totalPageViews)
   * console.log('TOP路由:', report.topRoutes)
   * ```
   */
  getReport() {
    const allStats = Array.from(this.stats.values())
    const totalPageViews = allStats.reduce((sum, s) => sum + s.pageViews, 0)
    const avgBounceRate = allStats.reduce((sum, s) => sum + s.bounceRate, 0) / allStats.length

    return {
      totalPageViews,
      totalRoutes: allStats.length,
      avgBounceRate: avgBounceRate * 100,
      topRoutes: this.getTopRoutes(10),
      userPaths: this.getUserPaths().length,
      sessionDuration: Date.now() - this.sessionStartTime,
    }
  }

  /**
   * 获取TOP路由
   * 
   * @param count - 返回数量
   * @returns TOP路由数组
   */
  getTopRoutes(count: number): RouteAccessStats[] {
    return Array.from(this.stats.values())
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, count)
  }

  /**
   * 清除所有数据
   * 
   * @example
   * ```ts
   * analyzer.clear()
   * ```
   */
  clear(): void {
    this.stats.clear()
    this.userPaths = []
    this.currentSession = undefined
  }

  /**
   * 导出数据（JSON格式）
   * 
   * @returns JSON字符串
   * 
   * @example
   * ```ts
   * const data = analyzer.exportData()
   * // 保存到文件或发送到服务器
   * ```
   */
  exportData(): string {
    return JSON.stringify({
      stats: Array.from(this.stats.entries()),
      userPaths: this.userPaths,
      timestamp: Date.now(),
    })
  }

  /**
   * 导入数据
   * 
   * @param jsonData - JSON字符串
   * 
   * @example
   * ```ts
   * analyzer.importData(previousData)
   * ```
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)

      if (data.stats) {
        this.stats = new Map(data.stats)
      }

      if (data.userPaths) {
        this.userPaths = data.userPaths
      }
    }
    catch (error) {
      console.error('数据导入失败:', error)
    }
  }
}

/**
 * 创建高级路由分析器
 * 
 * @returns 分析器实例
 * 
 * @example
 * ```ts
 * import { createAdvancedAnalyzer } from '@ldesign/router/analytics'
 * 
 * const analyzer = createAdvancedAnalyzer()
 * analyzer.attach(router)
 * 
 * // 定期获取报告
 * setInterval(() => {
 *   const report = analyzer.getReport()
 *   console.log('分析报告:', report)
 * }, 60000)
 * ```
 */
export function createAdvancedAnalyzer(): AdvancedRouteAnalyzer {
  return new AdvancedRouteAnalyzer()
}

// 默认导出
export default AdvancedRouteAnalyzer

