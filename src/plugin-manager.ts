import { ref, reactive } from 'vue'
import type { PluginConfig, Plugin, PluginContext, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class PluginManager {
  private _plugins = ref<Plugin[]>([])
  private _pluginInstances = new Map<string, any>()
  private _config = reactive<Required<PluginConfig>>({
    enabled: true,
    autoInstall: true,
    loadOrder: []
  })

  constructor(
    private router: LDesignRouter,
    config?: PluginConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
  }

  get plugins(): Plugin[] {
    return this._plugins.value
  }

  get config(): Required<PluginConfig> {
    return this._config
  }

  /**
   * 注册插件
   */
  use(plugin: Plugin, options?: any): this {
    if (!this._config.enabled) return this

    // 检查插件是否已注册
    if (this._plugins.value.find(p => p.name === plugin.name)) {
      console.warn(`Plugin '${plugin.name}' is already registered`)
      return this
    }

    // 验证插件
    if (!this.validatePlugin(plugin)) {
      console.error(`Invalid plugin '${plugin.name}'`)
      return this
    }

    // 添加到插件列表
    this._plugins.value.push(plugin)

    // 自动安装
    if (this._config.autoInstall) {
      this.installPlugin(plugin, options)
    }

    return this
  }

  /**
   * 安装插件
   */
  installPlugin(plugin: Plugin, options?: any): void {
    try {
      const context = this.createPluginContext(plugin)
      
      // 调用插件的安装函数
      if (typeof plugin.install === 'function') {
        const instance = plugin.install(context, options)
        if (instance) {
          this._pluginInstances.set(plugin.name, instance)
        }
      }

      // 触发插件安装事件
      this.emitPluginEvent('install', plugin, { options })
      
      console.debug(`Plugin '${plugin.name}' installed successfully`)
    } catch (error) {
      console.error(`Failed to install plugin '${plugin.name}':`, error)
    }
  }

  /**
   * 卸载插件
   */
  uninstallPlugin(pluginName: string): void {
    const plugin = this._plugins.value.find(p => p.name === pluginName)
    if (!plugin) {
      console.warn(`Plugin '${pluginName}' not found`)
      return
    }

    try {
      const instance = this._pluginInstances.get(pluginName)
      
      // 调用插件的卸载函数
      if (typeof plugin.uninstall === 'function') {
        plugin.uninstall(instance)
      } else if (instance && typeof instance.destroy === 'function') {
        instance.destroy()
      }

      // 从列表中移除
      const index = this._plugins.value.indexOf(plugin)
      if (index !== -1) {
        this._plugins.value.splice(index, 1)
      }
      
      this._pluginInstances.delete(pluginName)

      // 触发插件卸载事件
      this.emitPluginEvent('uninstall', plugin)
      
      console.debug(`Plugin '${pluginName}' uninstalled successfully`)
    } catch (error) {
      console.error(`Failed to uninstall plugin '${pluginName}':`, error)
    }
  }

  /**
   * 获取插件实例
   */
  getPlugin<T = any>(pluginName: string): T | undefined {
    return this._pluginInstances.get(pluginName)
  }

  /**
   * 检查插件是否已安装
   */
  hasPlugin(pluginName: string): boolean {
    return this._pluginInstances.has(pluginName)
  }

  /**
   * 启用插件
   */
  enablePlugin(pluginName: string): void {
    const plugin = this._plugins.value.find(p => p.name === pluginName)
    if (!plugin) return

    const instance = this._pluginInstances.get(pluginName)
    if (instance && typeof instance.enable === 'function') {
      instance.enable()
      this.emitPluginEvent('enable', plugin)
    }
  }

  /**
   * 禁用插件
   */
  disablePlugin(pluginName: string): void {
    const plugin = this._plugins.value.find(p => p.name === pluginName)
    if (!plugin) return

    const instance = this._pluginInstances.get(pluginName)
    if (instance && typeof instance.disable === 'function') {
      instance.disable()
      this.emitPluginEvent('disable', plugin)
    }
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    // 通知所有插件路由变化
    this._pluginInstances.forEach((instance, pluginName) => {
      if (instance && typeof instance.onRouteChange === 'function') {
        try {
          instance.onRouteChange(to, from)
        } catch (error) {
          console.error(`Plugin '${pluginName}' route change handler failed:`, error)
        }
      }
    })
  }

  /**
   * 调用插件钩子
   */
  callHook(hookName: string, ...args: any[]): Promise<any[]> {
    const results: Promise<any>[] = []

    this._pluginInstances.forEach((instance, pluginName) => {
      if (instance && typeof instance[hookName] === 'function') {
        try {
          const result = instance[hookName](...args)
          results.push(Promise.resolve(result))
        } catch (error) {
          console.error(`Plugin '${pluginName}' hook '${hookName}' failed:`, error)
          results.push(Promise.reject(error))
        }
      }
    })

    return Promise.allSettled(results).then(results => 
      results.map(result => result.status === 'fulfilled' ? result.value : result.reason)
    )
  }

  /**
   * 创建插件上下文
   */
  private createPluginContext(plugin: Plugin): PluginContext {
    return {
      router: this.router,
      pluginManager: this,
      plugin,
      emit: (event: string, data?: any) => {
        this.emitPluginEvent(event, plugin, data)
      },
      log: {
        debug: (message: string, ...args: any[]) => {
          console.debug(`[${plugin.name}] ${message}`, ...args)
        },
        info: (message: string, ...args: any[]) => {
          console.info(`[${plugin.name}] ${message}`, ...args)
        },
        warn: (message: string, ...args: any[]) => {
          console.warn(`[${plugin.name}] ${message}`, ...args)
        },
        error: (message: string, ...args: any[]) => {
          console.error(`[${plugin.name}] ${message}`, ...args)
        }
      }
    }
  }

  /**
   * 验证插件
   */
  private validatePlugin(plugin: Plugin): boolean {
    if (!plugin.name || typeof plugin.name !== 'string') {
      console.error('Plugin must have a valid name')
      return false
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      console.error('Plugin must have a valid version')
      return false
    }

    if (plugin.install && typeof plugin.install !== 'function') {
      console.error('Plugin install must be a function')
      return false
    }

    return true
  }

  /**
   * 安装所有插件
   */
  installAllPlugins(): void {
    // 按照加载顺序安装
    const orderedPlugins = this.getOrderedPlugins()
    
    orderedPlugins.forEach(plugin => {
      if (!this._pluginInstances.has(plugin.name)) {
        this.installPlugin(plugin)
      }
    })
  }

  /**
   * 卸载所有插件
   */
  uninstallAllPlugins(): void {
    // 按照相反顺序卸载
    const orderedPlugins = this.getOrderedPlugins().reverse()
    
    orderedPlugins.forEach(plugin => {
      this.uninstallPlugin(plugin.name)
    })
  }

  /**
   * 获取有序插件列表
   */
  private getOrderedPlugins(): Plugin[] {
    const ordered: Plugin[] = []
    const remaining = [...this._plugins.value]

    // 按照配置的加载顺序
    this._config.loadOrder.forEach(pluginName => {
      const index = remaining.findIndex(p => p.name === pluginName)
      if (index !== -1) {
        ordered.push(remaining.splice(index, 1)[0])
      }
    })

    // 添加剩余插件
    ordered.push(...remaining)

    return ordered
  }

  /**
   * 获取插件信息
   */
  getPluginInfo(pluginName: string): {
    plugin: Plugin | undefined
    instance: any
    installed: boolean
    enabled: boolean
  } {
    const plugin = this._plugins.value.find(p => p.name === pluginName)
    const instance = this._pluginInstances.get(pluginName)
    
    return {
      plugin,
      instance,
      installed: !!instance,
      enabled: instance ? (instance.enabled !== false) : false
    }
  }

  /**
   * 获取所有插件信息
   */
  getAllPluginsInfo(): Array<{
    name: string
    version: string
    description?: string
    installed: boolean
    enabled: boolean
  }> {
    return this._plugins.value.map(plugin => {
      const info = this.getPluginInfo(plugin.name)
      return {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        installed: info.installed,
        enabled: info.enabled
      }
    })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PluginConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 创建内置插件
   */
  static createPlugin(options: {
    name: string
    version: string
    description?: string
    install: (context: PluginContext, options?: any) => any
    uninstall?: (instance: any) => void
  }): Plugin {
    return {
      name: options.name,
      version: options.version,
      description: options.description,
      install: options.install,
      uninstall: options.uninstall
    }
  }

  /**
   * 创建持久化插件
   */
  static createPersistencePlugin(options: {
    key?: string
    storage?: Storage
    include?: string[]
    exclude?: string[]
  } = {}): Plugin {
    return this.createPlugin({
      name: 'persistence',
      version: '1.0.0',
      description: 'Route state persistence plugin',
      install: (context) => {
        const {
          key = 'ldesign-router-state',
          storage = localStorage,
          include = [],
          exclude = []
        } = options

        const saveState = () => {
          try {
            const state = {
              currentRoute: context.router.currentRoute,
              timestamp: Date.now()
            }
            storage.setItem(key, JSON.stringify(state))
          } catch (error) {
            console.warn('Failed to save router state:', error)
          }
        }

        const loadState = () => {
          try {
            const stored = storage.getItem(key)
            if (stored) {
              return JSON.parse(stored)
            }
          } catch (error) {
            console.warn('Failed to load router state:', error)
          }
          return null
        }

        return {
          saveState,
          loadState,
          onRouteChange: (to: RouteLocationNormalized) => {
            if (include.length === 0 || include.includes(to.name?.toString() || '')) {
              if (!exclude.includes(to.name?.toString() || '')) {
                saveState()
              }
            }
          }
        }
      }
    })
  }

  /**
   * 创建分析插件
   */
  static createAnalyticsPlugin(options: {
    trackPageView?: (route: RouteLocationNormalized) => void
    trackEvent?: (event: string, data?: any) => void
  } = {}): Plugin {
    return this.createPlugin({
      name: 'analytics',
      version: '1.0.0',
      description: 'Route analytics plugin',
      install: (context) => {
        const { trackPageView, trackEvent } = options

        return {
          onRouteChange: (to: RouteLocationNormalized) => {
            if (trackPageView) {
              trackPageView(to)
            }
          },
          trackEvent: (event: string, data?: any) => {
            if (trackEvent) {
              trackEvent(event, data)
            }
          }
        }
      }
    })
  }

  private emitPluginEvent(event: string, plugin: Plugin, data?: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`plugin-${event}`, {
        detail: { plugin, data }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  usePlugins() {
    return {
      plugins: computed(() => this._plugins.value),
      pluginsInfo: computed(() => this.getAllPluginsInfo()),
      config: computed(() => this._config)
    }
  }

  /**
   * 销毁插件管理器
   */
  destroy(): void {
    this.uninstallAllPlugins()
    this._plugins.value = []
    this._pluginInstances.clear()
  }
}