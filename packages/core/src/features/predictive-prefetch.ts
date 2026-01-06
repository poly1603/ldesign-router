/**
 * 路由预测预加载
 *
 * 基于用户行为分析预测下一个可能访问的路由，并智能预加载组件。
 *
 * @module features/predictive-prefetch
 */

/**
 * 路由转换记录
 */
interface RouteTransition {
  /** 来源路由 */
  from: string
  /** 目标路由 */
  to: string
  /** 转换次数 */
  count: number
  /** 最后转换时间 */
  lastTime: number
  /** 平均停留时间（毫秒） */
  avgDwellTime: number
}

/**
 * 路由访问统计
 */
interface RouteStats {
  /** 路由路径 */
  path: string
  /** 访问次数 */
  visitCount: number
  /** 最后访问时间 */
  lastVisit: number
  /** 平均停留时间 */
  avgDwellTime: number
  /** 总停留时间 */
  totalDwellTime: number
}

/**
 * 预测结果
 */
export interface PredictionResult {
  /** 预测的路由路径 */
  path: string
  /** 置信度 (0-1) */
  confidence: number
  /** 基于什么策略预测 */
  strategy: 'markov' | 'frequency' | 'recency' | 'pattern'
}

/**
 * 预测预加载选项
 */
export interface PredictivePrefetchOptions {
  /** 最小置信度阈值 (0-1)，低于此值不预加载 */
  confidenceThreshold?: number
  /** 最大预加载数量 */
  maxPrefetch?: number
  /** 是否考虑网络状况 */
  respectNetwork?: boolean
  /** 允许预加载的网络类型 */
  allowedNetworkTypes?: Array<'4g' | 'wifi' | '3g' | '2g' | 'slow-2g'>
  /** 是否启用模式学习 */
  enablePatternLearning?: boolean
  /** 数据保留时间（毫秒） */
  dataRetentionTime?: number
  /** 是否持久化学习数据 */
  persist?: boolean
  /** 持久化键名 */
  persistKey?: string
}

/**
 * 预测预加载状态
 */
export interface PredictivePrefetchState {
  /** 是否启用 */
  enabled: boolean
  /** 已学习的转换数 */
  learnedTransitions: number
  /** 预测准确率 */
  accuracy: number
  /** 预加载命中数 */
  prefetchHits: number
  /** 预加载总数 */
  totalPrefetches: number
}

/**
 * 组件加载器类型
 */
export type ComponentLoader = () => Promise<unknown>

/**
 * 预测预加载管理器
 *
 * @example
 * ```typescript
 * const predictor = createPredictivePrefetch({
 *   confidenceThreshold: 0.6,
 *   maxPrefetch: 3,
 *   persist: true,
 * })
 *
 * // 注册路由组件
 * predictor.registerComponent('/user/:id', () => import('./User.vue'))
 * predictor.registerComponent('/settings', () => import('./Settings.vue'))
 *
 * // 记录导航
 * predictor.recordNavigation('/home', '/user/123')
 *
 * // 获取预测并预加载
 * const predictions = predictor.predict('/user/123')
 * await predictor.prefetchPredictions(predictions)
 * ```
 */
export class PredictivePrefetchManager {
  private transitions = new Map<string, Map<string, RouteTransition>>()
  private routeStats = new Map<string, RouteStats>()
  private components = new Map<string, ComponentLoader>()
  private prefetchedRoutes = new Set<string>()
  private lastNavigation: { path: string; time: number } | null = null
  private options: Required<PredictivePrefetchOptions>

  // 准确率统计
  private predictions: Array<{ predicted: string; actual: string; hit: boolean }> = []
  private prefetchHits = 0
  private totalPrefetches = 0

  constructor(options: PredictivePrefetchOptions = {}) {
    this.options = {
      confidenceThreshold: options.confidenceThreshold ?? 0.5,
      maxPrefetch: options.maxPrefetch ?? 3,
      respectNetwork: options.respectNetwork ?? true,
      allowedNetworkTypes: options.allowedNetworkTypes ?? ['4g', 'wifi'],
      enablePatternLearning: options.enablePatternLearning ?? true,
      dataRetentionTime: options.dataRetentionTime ?? 7 * 24 * 60 * 60 * 1000, // 7 天
      persist: options.persist ?? false,
      persistKey: options.persistKey ?? '__ldesign_router_predictions__',
    }

    if (this.options.persist) {
      this.restore()
    }
  }

  /**
   * 注册路由组件
   *
   * @param pathPattern - 路由路径模式
   * @param loader - 组件加载器
   */
  registerComponent(pathPattern: string, loader: ComponentLoader): void {
    this.components.set(this.normalizePath(pathPattern), loader)
  }

  /**
   * 批量注册路由组件
   *
   * @param components - 路由组件映射
   */
  registerComponents(components: Record<string, ComponentLoader>): void {
    Object.entries(components).forEach(([path, loader]) => {
      this.registerComponent(path, loader)
    })
  }

  /**
   * 记录导航
   *
   * @param from - 来源路由
   * @param to - 目标路由
   */
  recordNavigation(from: string, to: string): void {
    const normalizedFrom = this.normalizePath(from)
    const normalizedTo = this.normalizePath(to)

    // 记录停留时间
    if (this.lastNavigation) {
      const dwellTime = Date.now() - this.lastNavigation.time
      this.updateDwellTime(this.lastNavigation.path, dwellTime)
    }

    // 更新转换记录
    this.updateTransition(normalizedFrom, normalizedTo)

    // 更新路由统计
    this.updateRouteStats(normalizedTo)

    // 更新最后导航
    this.lastNavigation = { path: normalizedTo, time: Date.now() }

    // 检查预测准确率
    this.checkPredictionAccuracy(normalizedTo)

    // 检查预加载命中
    if (this.prefetchedRoutes.has(normalizedTo)) {
      this.prefetchHits++
      this.prefetchedRoutes.delete(normalizedTo)
    }

    // 持久化
    if (this.options.persist) {
      this.persist()
    }
  }

  /**
   * 预测下一个可能的路由
   *
   * @param currentPath - 当前路由
   * @param limit - 返回预测数量限制
   * @returns 预测结果数组
   */
  predict(currentPath: string, limit?: number): PredictionResult[] {
    const normalizedPath = this.normalizePath(currentPath)
    const maxResults = limit ?? this.options.maxPrefetch
    const results: PredictionResult[] = []

    // 1. 马尔可夫链预测（基于转换概率）
    const markovPredictions = this.predictByMarkov(normalizedPath)
    results.push(...markovPredictions)

    // 2. 频率预测（全局热门路由）
    if (results.length < maxResults) {
      const frequencyPredictions = this.predictByFrequency(normalizedPath, maxResults - results.length)
      results.push(...frequencyPredictions)
    }

    // 3. 模式学习预测
    if (this.options.enablePatternLearning && results.length < maxResults) {
      const patternPredictions = this.predictByPattern(normalizedPath)
      results.push(...patternPredictions)
    }

    // 去重并排序
    const uniqueResults = this.deduplicatePredictions(results)
    const filteredResults = uniqueResults.filter(
      r => r.confidence >= this.options.confidenceThreshold
    )

    // 记录预测用于准确率计算
    filteredResults.slice(0, maxResults).forEach(prediction => {
      this.predictions.push({
        predicted: prediction.path,
        actual: '', // 将在下次导航时填充
        hit: false,
      })
    })

    // 限制返回数量并保留最近预测
    if (this.predictions.length > 100) {
      this.predictions = this.predictions.slice(-100)
    }

    return filteredResults.slice(0, maxResults)
  }

  /**
   * 预加载预测的路由
   *
   * @param predictions - 预测结果
   * @returns 预加载结果
   */
  async prefetchPredictions(predictions: PredictionResult[]): Promise<{
    success: string[]
    failed: string[]
  }> {
    // 检查网络状况
    if (this.options.respectNetwork && !this.isNetworkSuitable()) {
      return { success: [], failed: predictions.map(p => p.path) }
    }

    const success: string[] = []
    const failed: string[] = []

    for (const prediction of predictions) {
      try {
        const loaded = await this.prefetchRoute(prediction.path)
        if (loaded) {
          success.push(prediction.path)
          this.prefetchedRoutes.add(prediction.path)
          this.totalPrefetches++
        } else {
          failed.push(prediction.path)
        }
      } catch {
        failed.push(prediction.path)
      }
    }

    return { success, failed }
  }

  /**
   * 预加载单个路由
   *
   * @param path - 路由路径
   * @returns 是否成功
   */
  async prefetchRoute(path: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(path)
    const loader = this.findComponentLoader(normalizedPath)

    if (!loader) {
      return false
    }

    try {
      await loader()
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取预测状态
   */
  getState(): PredictivePrefetchState {
    const accuracy = this.calculateAccuracy()

    return {
      enabled: true,
      learnedTransitions: this.countTransitions(),
      accuracy,
      prefetchHits: this.prefetchHits,
      totalPrefetches: this.totalPrefetches,
    }
  }

  /**
   * 获取路由统计
   *
   * @param path - 路由路径
   */
  getRouteStats(path: string): RouteStats | null {
    return this.routeStats.get(this.normalizePath(path)) ?? null
  }

  /**
   * 获取所有路由统计
   */
  getAllRouteStats(): RouteStats[] {
    return Array.from(this.routeStats.values())
  }

  /**
   * 获取热门路由
   *
   * @param limit - 返回数量
   */
  getHotRoutes(limit = 10): RouteStats[] {
    return Array.from(this.routeStats.values())
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, limit)
  }

  /**
   * 清除学习数据
   */
  clear(): void {
    this.transitions.clear()
    this.routeStats.clear()
    this.prefetchedRoutes.clear()
    this.predictions = []
    this.prefetchHits = 0
    this.totalPrefetches = 0
    this.lastNavigation = null

    if (this.options.persist) {
      this.clearPersisted()
    }
  }

  /**
   * 清理过期数据
   */
  cleanup(): void {
    const now = Date.now()
    const threshold = now - this.options.dataRetentionTime

    // 清理过期转换
    const transitionKeys = Array.from(this.transitions.keys())
    for (const from of transitionKeys) {
      const toMap = this.transitions.get(from)!
      const toKeys = Array.from(toMap.keys())
      for (const to of toKeys) {
        const transition = toMap.get(to)!
        if (transition.lastTime < threshold) {
          toMap.delete(to)
        }
      }
      if (toMap.size === 0) {
        this.transitions.delete(from)
      }
    }

    // 清理过期路由统计
    const routeKeys = Array.from(this.routeStats.keys())
    for (const path of routeKeys) {
      const stats = this.routeStats.get(path)!
      if (stats.lastVisit < threshold) {
        this.routeStats.delete(path)
      }
    }

    if (this.options.persist) {
      this.persist()
    }
  }

  /**
   * 导出学习数据
   */
  export(): string {
    return JSON.stringify({
      transitions: this.serializeTransitions(),
      routeStats: Array.from(this.routeStats.entries()),
      version: 1,
    })
  }

  /**
   * 导入学习数据
   *
   * @param data - 导出的数据
   */
  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.version !== 1) {
        return false
      }

      this.deserializeTransitions(parsed.transitions)
      this.routeStats = new Map(parsed.routeStats)

      if (this.options.persist) {
        this.persist()
      }

      return true
    } catch {
      return false
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 标准化路径
   */
  private normalizePath(path: string): string {
    // 移除查询参数和 hash
    let normalized = path.split('?')[0].split('#')[0]
    // 移除末尾斜杠
    normalized = normalized.replace(/\/+$/, '') || '/'
    // 将动态参数替换为占位符
    normalized = normalized.replace(/\/\d+/g, '/:id')
    normalized = normalized.replace(/\/[a-f0-9-]{36}/gi, '/:uuid')
    return normalized
  }

  /**
   * 更新转换记录
   */
  private updateTransition(from: string, to: string): void {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map())
    }

    const toMap = this.transitions.get(from)!
    const existing = toMap.get(to)

    if (existing) {
      existing.count++
      existing.lastTime = Date.now()
    } else {
      toMap.set(to, {
        from,
        to,
        count: 1,
        lastTime: Date.now(),
        avgDwellTime: 0,
      })
    }
  }

  /**
   * 更新停留时间
   */
  private updateDwellTime(path: string, dwellTime: number): void {
    const stats = this.routeStats.get(path)
    if (stats) {
      stats.totalDwellTime += dwellTime
      stats.avgDwellTime = stats.totalDwellTime / stats.visitCount
    }
  }

  /**
   * 更新路由统计
   */
  private updateRouteStats(path: string): void {
    const existing = this.routeStats.get(path)

    if (existing) {
      existing.visitCount++
      existing.lastVisit = Date.now()
    } else {
      this.routeStats.set(path, {
        path,
        visitCount: 1,
        lastVisit: Date.now(),
        avgDwellTime: 0,
        totalDwellTime: 0,
      })
    }
  }

  /**
   * 马尔可夫链预测
   */
  private predictByMarkov(currentPath: string): PredictionResult[] {
    const toMap = this.transitions.get(currentPath)
    if (!toMap || toMap.size === 0) {
      return []
    }

    const totalTransitions = Array.from(toMap.values()).reduce(
      (sum, t) => sum + t.count,
      0
    )

    return Array.from(toMap.values())
      .map(t => ({
        path: t.to,
        confidence: t.count / totalTransitions,
        strategy: 'markov' as const,
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 频率预测
   */
  private predictByFrequency(excludePath: string, limit: number): PredictionResult[] {
    const maxVisits = Math.max(...Array.from(this.routeStats.values()).map(s => s.visitCount), 1)

    return Array.from(this.routeStats.values())
      .filter(s => s.path !== excludePath)
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, limit)
      .map(s => ({
        path: s.path,
        confidence: (s.visitCount / maxVisits) * 0.5, // 频率预测的置信度降低
        strategy: 'frequency' as const,
      }))
  }

  /**
   * 模式预测
   */
  private predictByPattern(currentPath: string): PredictionResult[] {
    // 简单的模式：如果当前在列表页，预测详情页
    if (currentPath.endsWith('s') || currentPath.includes('/list')) {
      const detailPath = currentPath.replace(/s$/, '') + '/:id'
      const altDetailPath = currentPath.replace('/list', '/:id')

      return [
        { path: detailPath, confidence: 0.3, strategy: 'pattern' as const },
        { path: altDetailPath, confidence: 0.3, strategy: 'pattern' as const },
      ].filter(p => this.components.has(p.path))
    }

    return []
  }

  /**
   * 去重预测结果
   */
  private deduplicatePredictions(predictions: PredictionResult[]): PredictionResult[] {
    const seen = new Map<string, PredictionResult>()

    for (const prediction of predictions) {
      const existing = seen.get(prediction.path)
      if (!existing || existing.confidence < prediction.confidence) {
        seen.set(prediction.path, prediction)
      }
    }

    return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 查找组件加载器
   */
  private findComponentLoader(path: string): ComponentLoader | null {
    // 精确匹配
    if (this.components.has(path)) {
      return this.components.get(path)!
    }

    // 模式匹配
    const patterns = Array.from(this.components.keys())
    for (const pattern of patterns) {
      if (this.matchPattern(path, pattern)) {
        return this.components.get(pattern)!
      }
    }

    return null
  }

  /**
   * 路径模式匹配
   */
  private matchPattern(path: string, pattern: string): boolean {
    const pathParts = path.split('/')
    const patternParts = pattern.split('/')

    if (pathParts.length !== patternParts.length) {
      return false
    }

    return patternParts.every((part, i) => {
      if (part.startsWith(':')) {
        return true // 动态参数匹配任意值
      }
      return part === pathParts[i]
    })
  }

  /**
   * 检查网络是否适合预加载
   */
  private isNetworkSuitable(): boolean {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return true // 无法检测时默认允许
    }

    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
    if (!connection?.effectiveType) {
      return true
    }

    return this.options.allowedNetworkTypes.includes(
      connection.effectiveType as '4g' | 'wifi' | '3g' | '2g' | 'slow-2g'
    )
  }

  /**
   * 检查预测准确率
   */
  private checkPredictionAccuracy(actualPath: string): void {
    // 更新最近的预测记录
    for (let i = this.predictions.length - 1; i >= 0; i--) {
      const pred = this.predictions[i]
      if (!pred.actual) {
        pred.actual = actualPath
        pred.hit = pred.predicted === actualPath
        break
      }
    }
  }

  /**
   * 计算准确率
   */
  private calculateAccuracy(): number {
    const evaluated = this.predictions.filter(p => p.actual)
    if (evaluated.length === 0) {
      return 0
    }

    const hits = evaluated.filter(p => p.hit).length
    return hits / evaluated.length
  }

  /**
   * 计算转换总数
   */
  private countTransitions(): number {
    let count = 0
    this.transitions.forEach(toMap => {
      count += toMap.size
    })
    return count
  }

  /**
   * 序列化转换数据
   */
  private serializeTransitions(): Array<[string, Array<[string, RouteTransition]>]> {
    return Array.from(this.transitions.entries()).map(([from, toMap]) => [
      from,
      Array.from(toMap.entries()),
    ])
  }

  /**
   * 反序列化转换数据
   */
  private deserializeTransitions(data: Array<[string, Array<[string, RouteTransition]>]>): void {
    this.transitions.clear()
    for (const [from, toArray] of data) {
      this.transitions.set(from, new Map(toArray))
    }
  }

  /**
   * 持久化到 localStorage
   */
  private persist(): void {
    try {
      const data = JSON.stringify({
        transitions: this.serializeTransitions(),
        routeStats: Array.from(this.routeStats.entries()),
      })
      localStorage.setItem(this.options.persistKey, data)
    } catch {
      // 忽略持久化错误
    }
  }

  /**
   * 从 localStorage 恢复
   */
  private restore(): void {
    try {
      const data = localStorage.getItem(this.options.persistKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.deserializeTransitions(parsed.transitions ?? [])
        this.routeStats = new Map(parsed.routeStats ?? [])
      }
    } catch {
      // 忽略恢复错误
    }
  }

  /**
   * 清除持久化数据
   */
  private clearPersisted(): void {
    try {
      localStorage.removeItem(this.options.persistKey)
    } catch {
      // 忽略清除错误
    }
  }
}

/**
 * 创建预测预加载管理器
 *
 * @param options - 配置选项
 * @returns 预测预加载管理器实例
 *
 * @example
 * ```typescript
 * const predictor = createPredictivePrefetch({
 *   confidenceThreshold: 0.6,
 *   maxPrefetch: 3,
 * })
 *
 * // 注册组件
 * predictor.registerComponents({
 *   '/home': () => import('./Home.vue'),
 *   '/user/:id': () => import('./User.vue'),
 * })
 *
 * // 在路由守卫中使用
 * router.afterEach((to, from) => {
 *   predictor.recordNavigation(from.path, to.path)
 *   const predictions = predictor.predict(to.path)
 *   predictor.prefetchPredictions(predictions)
 * })
 * ```
 */
export function createPredictivePrefetch(
  options?: PredictivePrefetchOptions
): PredictivePrefetchManager {
  return new PredictivePrefetchManager(options)
}
