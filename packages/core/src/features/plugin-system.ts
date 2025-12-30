/**
 * @fileoverview 路由插件系统
 * 提供可扩展的插件架构、动态路由注册、事件钩子和依赖注入功能
 */

import type { RouteRecordRaw, RouteLocationNormalized } from '../types'
import type { RouterServiceContainer } from '../container/types'

/**
 * 插件生命周期钩子
 */
export enum PluginLifecycleHook {
  /** 插件初始化前 */
  BEFORE_INSTALL = 'beforeInstall',
  /** 插件初始化后 */
  AFTER_INSTALL = 'afterInstall',
  /** 插件销毁前 */
  BEFORE_UNINSTALL = 'beforeUninstall',
  /** 插件销毁后 */
  AFTER_UNINSTALL = 'afterUninstall',
}

/**
 * 路由事件类型
 */
export enum RouterEventType {
  /** 导航开始 */
  NAVIGATION_START = 'navigationStart',
  /** 导航结束 */
  NAVIGATION_END = 'navigationEnd',
  /** 导航取消 */
  NAVIGATION_CANCELLED = 'navigationCancelled',
  /** 导航错误 */
  NAVIGATION_ERROR = 'navigationError',
  /** 路由添加 */
  ROUTE_ADDED = 'routeAdded',
  /** 路由移除 */
  ROUTE_REMOVED = 'routeRemoved',
  /** 路由更新 */
  ROUTE_UPDATED = 'routeUpdated',
  /** 守卫执行前 */
  BEFORE_GUARD = 'beforeGuard',
  /** 守卫执行后 */
  AFTER_GUARD = 'afterGuard',
}

/**
 * 路由事件数据
 */
export interface RouterEventData {
  /** 事件类型 */
  type: RouterEventType
  /** 目标路由 */
  to?: RouteLocationNormalized
  /** 来源路由 */
  from?: RouteLocationNormalized
  /** 路由记录 */
  route?: RouteRecordRaw
  /** 错误信息 */
  error?: Error
  /** 自定义数据 */
  data?: any
  /** 时间戳 */
  timestamp: number
}

/**
 * 事件监听器函数
 */
export type RouterEventListener = (event: RouterEventData) => void | Promise<void>

/**
 * 插件配置选项
 */
export interface RouterPluginOptions {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 插件优先级 */
  priority?: number
  /** 是否启用 */
  enabled?: boolean
  /** 依赖的其他插件 */
  dependencies?: string[]
  /** 插件配置 */
  config?: Record<string, any>
}

/**
 * 路由插件接口
 */
export interface RouterPlugin {
  /** 插件选项 */
  options: RouterPluginOptions

  /** 安装插件 */
  install(container: RouterServiceContainer): void | Promise<void>

  /** 卸载插件 */
  uninstall?(): void | Promise<void>

  /** 注册路由 */
  registerRoutes?(): RouteRecordRaw[]

  /** 注册事件监听器 */
  registerEventListeners?(): Map<RouterEventType, RouterEventListener[]>

  /** 生命周期钩子 */
  hooks?: Partial<Record<PluginLifecycleHook, () => void | Promise<void>>>
}

/**
 * 动态路由注册器配置
 */
export interface DynamicRouteConfig {
  /** 路由记录 */
  route: RouteRecordRaw
  /** 注册来源（插件名称） */
  source: string
  /** 是否临时路由（导航后自动移除） */
  temporary?: boolean
  /** 过期时间（毫秒） */
  expireTime?: number
  /** 注册时间 */
  registeredAt: number
}

/**
 * 事件钩子管理器选项
 */
export interface EventHookManagerOptions {
  /** 是否启用事件队列 */
  enableQueue?: boolean
  /** 队列最大长度 */
  maxQueueSize?: number
  /** 是否启用异步执行 */
  enableAsync?: boolean
  /** 错误处理策略 */
  errorHandling?: 'abort' | 'skip' | 'log'
}

/**
 * 路由插件管理器
 */
export class RouterPluginManager {
  private plugins = new Map<string, RouterPlugin>()
  private installedPlugins = new Set<string>()
  private pluginDependencyGraph = new Map<string, Set<string>>()
  private container: RouterServiceContainer | null = null

  constructor(container?: RouterServiceContainer) {
    this.container = container ?? null
  }

  /**
   * 设置服务容器
   */
  setContainer(container: RouterServiceContainer): void {
    this.container = container
  }

  /**
   * 注册插件
   */
  register(plugin: RouterPlugin): void {
    const { name } = plugin.options

    if (this.plugins.has(name)) {
      throw new Error(`插件 "${name}" 已注册`)
    }

    // 检查依赖
    if (plugin.options.dependencies) {
      this.pluginDependencyGraph.set(name, new Set(plugin.options.dependencies))
    }

    this.plugins.set(name, plugin)
    console.log(`[PluginManager] 插件 "${name}" 注册成功`)
  }

  /**
   * 批量注册插件
   */
  registerBatch(plugins: RouterPlugin[]): void {
    // 按优先级排序
    const sortedPlugins = plugins.sort((a, b) =>
      (b.options.priority ?? 0) - (a.options.priority ?? 0)
    )

    sortedPlugins.forEach(plugin => this.register(plugin))
  }

  /**
   * 安装插件
   */
  async install(pluginName: string): Promise<void> {
    if (!this.container) {
      throw new Error('服务容器未设置，无法安装插件')
    }

    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 "${pluginName}" 未注册`)
    }

    if (this.installedPlugins.has(pluginName)) {
      console.warn(`[PluginManager] 插件 "${pluginName}" 已安装`)
      return
    }

    if (!plugin.options.enabled) {
      console.warn(`[PluginManager] 插件 "${pluginName}" 已禁用`)
      return
    }

    // 检查并安装依赖
    await this.installDependencies(pluginName)

    // 执行 beforeInstall 钩子
    await this.executeHook(plugin, PluginLifecycleHook.BEFORE_INSTALL)

    // 安装插件
    await Promise.resolve(plugin.install(this.container))

    // 执行 afterInstall 钩子
    await this.executeHook(plugin, PluginLifecycleHook.AFTER_INSTALL)

    this.installedPlugins.add(pluginName)
    console.log(`[PluginManager] 插件 "${pluginName}" 安装成功`)
  }

  /**
   * 安装所有注册的插件
   */
  async installAll(): Promise<void> {
    // 拓扑排序，确保依赖顺序
    const sortedPlugins = this.topologicalSort()

    for (const pluginName of sortedPlugins) {
      await this.install(pluginName)
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 "${pluginName}" 未注册`)
    }

    if (!this.installedPlugins.has(pluginName)) {
      console.warn(`[PluginManager] 插件 "${pluginName}" 未安装`)
      return
    }

    // 检查是否有其他插件依赖此插件
    const dependentPlugins = this.findDependentPlugins(pluginName)
    if (dependentPlugins.length > 0) {
      throw new Error(
        `无法卸载插件 "${pluginName}"，以下插件依赖它: ${dependentPlugins.join(', ')}`
      )
    }

    // 执行 beforeUninstall 钩子
    await this.executeHook(plugin, PluginLifecycleHook.BEFORE_UNINSTALL)

    // 卸载插件
    if (plugin.uninstall) {
      await Promise.resolve(plugin.uninstall())
    }

    // 执行 afterUninstall 钩子
    await this.executeHook(plugin, PluginLifecycleHook.AFTER_UNINSTALL)

    this.installedPlugins.delete(pluginName)
    console.log(`[PluginManager] 插件 "${pluginName}" 卸载成功`)
  }

  /**
   * 安装依赖
   */
  private async installDependencies(pluginName: string): Promise<void> {
    const dependencies = this.pluginDependencyGraph.get(pluginName)
    if (!dependencies) return

    for (const dep of dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`插件 "${pluginName}" 的依赖 "${dep}" 未注册`)
      }

      if (!this.installedPlugins.has(dep)) {
        await this.install(dep)
      }
    }
  }

  /**
   * 查找依赖当前插件的其他插件
   */
  private findDependentPlugins(pluginName: string): string[] {
    const dependent: string[] = []

    for (const [name, deps] of this.pluginDependencyGraph.entries()) {
      if (deps.has(pluginName) && this.installedPlugins.has(name)) {
        dependent.push(name)
      }
    }

    return dependent
  }

  /**
   * 拓扑排序（确保依赖顺序）
   */
  private topologicalSort(): string[] {
    const sorted: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`检测到循环依赖: ${name}`)
      }

      visiting.add(name)

      const deps = this.pluginDependencyGraph.get(name)
      if (deps) {
        deps.forEach(dep => visit(dep))
      }

      visiting.delete(name)
      visited.add(name)
      sorted.push(name)
    }

    for (const name of this.plugins.keys()) {
      visit(name)
    }

    return sorted
  }

  /**
   * 执行插件钩子
   */
  private async executeHook(
    plugin: RouterPlugin,
    hook: PluginLifecycleHook
  ): Promise<void> {
    const hookFn = plugin.hooks?.[hook]
    if (hookFn) {
      await Promise.resolve(hookFn())
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): RouterPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(name: string): boolean {
    return this.installedPlugins.has(name)
  }

  /**
   * 获取所有已安装的插件
   */
  getInstalledPlugins(): RouterPlugin[] {
    return Array.from(this.installedPlugins)
      .map(name => this.plugins.get(name)!)
      .filter(Boolean)
  }

  /**
   * 清除所有插件
   */
  clear(): void {
    this.plugins.clear()
    this.installedPlugins.clear()
    this.pluginDependencyGraph.clear()
  }
}

/**
 * 动态路由注册器
 */
export class DynamicRouteRegistry {
  private routes = new Map<string, DynamicRouteConfig>()
  private routeCleanupTimers = new Map<string, NodeJS.Timeout>()

  /**
   * 注册动态路由
   */
  register(config: Omit<DynamicRouteConfig, 'registeredAt'>): void {
    const routeKey = this.generateRouteKey(config.route)

    const fullConfig: DynamicRouteConfig = {
      ...config,
      registeredAt: Date.now(),
    }

    this.routes.set(routeKey, fullConfig)

    // 设置过期清理
    if (config.expireTime) {
      this.scheduleCleanup(routeKey, config.expireTime)
    }

    console.log(`[DynamicRouteRegistry] 动态路由已注册: ${routeKey}`)
  }

  /**
   * 取消注册动态路由
   */
  unregister(routePath: string): boolean {
    const routeKey = this.findRouteKey(routePath)
    if (!routeKey) return false

    this.clearCleanupTimer(routeKey)
    const result = this.routes.delete(routeKey)

    if (result) {
      console.log(`[DynamicRouteRegistry] 动态路由已移除: ${routeKey}`)
    }

    return result
  }

  /**
   * 获取动态路由
   */
  get(routePath: string): DynamicRouteConfig | undefined {
    const routeKey = this.findRouteKey(routePath)
    return routeKey ? this.routes.get(routeKey) : undefined
  }

  /**
   * 获取所有动态路由
   */
  getAll(): DynamicRouteConfig[] {
    return Array.from(this.routes.values())
  }

  /**
   * 获取来源为指定插件的路由
   */
  getBySource(source: string): DynamicRouteConfig[] {
    return Array.from(this.routes.values())
      .filter(config => config.source === source)
  }

  /**
   * 清除临时路由
   */
  clearTemporary(): void {
    for (const [key, config] of this.routes.entries()) {
      if (config.temporary) {
        this.routes.delete(key)
        this.clearCleanupTimer(key)
      }
    }
  }

  /**
   * 清除过期路由
   */
  clearExpired(): void {
    const now = Date.now()

    for (const [key, config] of this.routes.entries()) {
      if (config.expireTime && now - config.registeredAt > config.expireTime) {
        this.routes.delete(key)
        this.clearCleanupTimer(key)
      }
    }
  }

  /**
   * 生成路由键
   */
  private generateRouteKey(route: RouteRecordRaw): string {
    return route.name ? String(route.name) : route.path
  }

  /**
   * 查找路由键
   */
  private findRouteKey(routePath: string): string | undefined {
    for (const [key, config] of this.routes.entries()) {
      if (config.route.path === routePath || String(config.route.name) === routePath) {
        return key
      }
    }
    return undefined
  }

  /**
   * 调度清理任务
   */
  private scheduleCleanup(routeKey: string, expireTime: number): void {
    this.clearCleanupTimer(routeKey)

    const timer = setTimeout(() => {
      this.routes.delete(routeKey)
      this.routeCleanupTimers.delete(routeKey)
      console.log(`[DynamicRouteRegistry] 路由已过期: ${routeKey}`)
    }, expireTime)

    this.routeCleanupTimers.set(routeKey, timer)
  }

  /**
   * 清除清理定时器
   */
  private clearCleanupTimer(routeKey: string): void {
    const timer = this.routeCleanupTimers.get(routeKey)
    if (timer) {
      clearTimeout(timer)
      this.routeCleanupTimers.delete(routeKey)
    }
  }

  /**
   * 清除所有路由
   */
  clear(): void {
    for (const timer of this.routeCleanupTimers.values()) {
      clearTimeout(timer)
    }
    this.routes.clear()
    this.routeCleanupTimers.clear()
  }
}

/**
 * 事件钩子管理器
 */
export class RouterEventHookManager {
  private listeners = new Map<RouterEventType, Set<RouterEventListener>>()
  private eventQueue: RouterEventData[] = []
  private options: Required<EventHookManagerOptions>

  constructor(options: EventHookManagerOptions = {}) {
    this.options = {
      enableQueue: options.enableQueue ?? false,
      maxQueueSize: options.maxQueueSize ?? 100,
      enableAsync: options.enableAsync ?? true,
      errorHandling: options.errorHandling ?? 'log',
    }
  }

  /**
   * 注册事件监听器
   */
  on(type: RouterEventType, listener: RouterEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)!.add(listener)

    // 返回取消监听函数
    return () => this.off(type, listener)
  }

  /**
   * 移除事件监听器
   */
  off(type: RouterEventType, listener: RouterEventListener): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 注册一次性监听器
   */
  once(type: RouterEventType, listener: RouterEventListener): () => void {
    const wrappedListener: RouterEventListener = async (event) => {
      await listener(event)
      this.off(type, wrappedListener)
    }

    return this.on(type, wrappedListener)
  }

  /**
   * 触发事件
   */
  async emit(type: RouterEventType, data?: Partial<RouterEventData>): Promise<void> {
    const event: RouterEventData = {
      type,
      timestamp: Date.now(),
      ...data,
    }

    // 添加到事件队列
    if (this.options.enableQueue) {
      this.eventQueue.push(event)
      if (this.eventQueue.length > this.options.maxQueueSize) {
        this.eventQueue.shift()
      }
    }

    const listeners = this.listeners.get(type)
    if (!listeners || listeners.size === 0) return

    // 执行监听器
    const promises = Array.from(listeners).map(listener =>
      this.executeListener(listener, event)
    )

    if (this.options.enableAsync) {
      await Promise.all(promises)
    } else {
      for (const promise of promises) {
        await promise
      }
    }
  }

  /**
   * 执行监听器
   */
  private async executeListener(
    listener: RouterEventListener,
    event: RouterEventData
  ): Promise<void> {
    try {
      await Promise.resolve(listener(event))
    } catch (error) {
      this.handleError(error as Error, event)
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: Error, event: RouterEventData): void {
    switch (this.options.errorHandling) {
      case 'abort':
        throw error
      case 'skip':
        // 跳过错误，继续执行
        break
      case 'log':
        console.error(`[EventHookManager] 事件监听器执行错误:`, error, event)
        break
    }
  }

  /**
   * 获取事件队列
   */
  getEventQueue(): RouterEventData[] {
    return [...this.eventQueue]
  }

  /**
   * 清空事件队列
   */
  clearEventQueue(): void {
    this.eventQueue = []
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear()
    this.eventQueue = []
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(
  container?: RouterServiceContainer
): RouterPluginManager {
  return new RouterPluginManager(container)
}

/**
 * 创建动态路由注册器
 */
export function createDynamicRouteRegistry(): DynamicRouteRegistry {
  return new DynamicRouteRegistry()
}

/**
 * 创建事件钩子管理器
 */
export function createEventHookManager(
  options?: EventHookManagerOptions
): RouterEventHookManager {
  return new RouterEventHookManager(options)
}
