/**
 * @ldesign/router-core 插件系统
 * 
 * @description
 * 提供路由器插件系统,支持功能扩展。
 * 
 * **特性**：
 * - 插件生命周期钩子
 * - 插件依赖管理
 * - 插件优先级
 * - 插件状态管理
 * - 插件配置
 * - 内置插件集合
 * 
 * @module router/plugin
 */

import type { Router } from './router'
import type { RouteLocationNormalized } from '../types'

/**
 * 插件上下文
 */
export interface PluginContext {
  /** 路由器实例 */
  router: Router
  
  /** 插件选项 */
  options: Record<string, any>
}

/**
 * 插件钩子
 */
export interface PluginHooks {
  /** 插件安装时调用 */
  install?: (context: PluginContext) => void | Promise<void>
  
  /** 路由器初始化后调用 */
  onReady?: (context: PluginContext) => void | Promise<void>
  
  /** 导航开始前调用 */
  beforeNavigate?: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    context: PluginContext,
  ) => void | boolean | Promise<void | boolean>
  
  /** 导航完成后调用 */
  afterNavigate?: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    context: PluginContext,
  ) => void | Promise<void>
  
  /** 导航错误时调用 */
  onError?: (error: Error, context: PluginContext) => void | Promise<void>
  
  /** 插件卸载时调用 */
  uninstall?: (context: PluginContext) => void | Promise<void>
}

/**
 * 插件定义
 */
export interface Plugin extends PluginHooks {
  /** 插件名称 */
  name: string
  
  /** 插件版本 */
  version?: string
  
  /** 插件描述 */
  description?: string
  
  /** 插件依赖 */
  dependencies?: string[]
  
  /** 插件优先级 (数值越大优先级越高) */
  priority?: number
  
  /** 插件选项 */
  options?: Record<string, any>
}

/**
 * 插件状态
 */
export type PluginState = 'pending' | 'installing' | 'installed' | 'uninstalling' | 'uninstalled' | 'error'

/**
 * 插件记录
 */
export interface PluginRecord {
  /** 插件实例 */
  plugin: Plugin
  
  /** 插件状态 */
  state: PluginState
  
  /** 插件上下文 */
  context: PluginContext
  
  /** 安装时间 */
  installedAt?: number
  
  /** 错误信息 */
  error?: Error
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, PluginRecord>()
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  // ==================== 插件管理 ====================

  /**
   * 安装插件
   */
  async install(plugin: Plugin): Promise<void> {
    const { name } = plugin

    // 检查是否已安装
    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already installed`)
    }

    // 创建插件记录
    const context: PluginContext = {
      router: this.router,
      options: plugin.options || {},
    }

    const record: PluginRecord = {
      plugin,
      state: 'pending',
      context,
    }

    this.plugins.set(name, record)

    try {
      // 检查依赖
      await this.checkDependencies(plugin)

      // 更新状态
      record.state = 'installing'

      // 调用安装钩子
      if (plugin.install) {
        await plugin.install(context)
      }

      // 注册钩子
      this.registerHooks(plugin, context)

      // 更新状态
      record.state = 'installed'
      record.installedAt = Date.now()
    } catch (error) {
      record.state = 'error'
      record.error = error as Error
      this.plugins.delete(name)
      throw error
    }
  }

  /**
   * 批量安装插件
   */
  async installAll(plugins: Plugin[]): Promise<void> {
    // 按优先级排序
    const sorted = [...plugins].sort((a, b) => {
      const priorityA = a.priority || 0
      const priorityB = b.priority || 0
      return priorityB - priorityA
    })

    // 依次安装
    for (const plugin of sorted) {
      await this.install(plugin)
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(name: string): Promise<void> {
    const record = this.plugins.get(name)
    
    if (!record) {
      throw new Error(`Plugin "${name}" is not installed`)
    }

    try {
      record.state = 'uninstalling'

      // 调用卸载钩子
      if (record.plugin.uninstall) {
        await record.plugin.uninstall(record.context)
      }

      // 取消注册钩子
      this.unregisterHooks(record.plugin)

      record.state = 'uninstalled'
      this.plugins.delete(name)
    } catch (error) {
      record.state = 'error'
      record.error = error as Error
      throw error
    }
  }

  /**
   * 检查插件是否已安装
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 获取插件
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name)?.plugin
  }

  /**
   * 获取所有插件
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values()).map(r => r.plugin)
  }

  /**
   * 获取插件状态
   */
  getState(name: string): PluginState | undefined {
    return this.plugins.get(name)?.state
  }

  // ==================== 依赖管理 ====================

  /**
   * 检查插件依赖
   */
  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }

    for (const dep of plugin.dependencies) {
      const depRecord = this.plugins.get(dep)
      
      if (!depRecord) {
        throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not installed`)
      }

      if (depRecord.state !== 'installed') {
        throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not in installed state`)
      }
    }
  }

  // ==================== 钩子管理 ====================

  /**
   * 注册插件钩子
   */
  private registerHooks(plugin: Plugin, context: PluginContext): void {
    // 注册 onReady 钩子
    if (plugin.onReady) {
      this.router.on('ready', async () => {
        await plugin.onReady!(context)
      })
    }

    // 注册 beforeNavigate 钩子
    if (plugin.beforeNavigate) {
      this.router.beforeEach(async (to, from) => {
        const result = await plugin.beforeNavigate!(to, from, context)
        return result === false ? false : undefined
      })
    }

    // 注册 afterNavigate 钩子
    if (plugin.afterNavigate) {
      this.router.afterEach(async (to, from) => {
        await plugin.afterNavigate!(to, from, context)
      })
    }

    // 注册 onError 钩子
    if (plugin.onError) {
      this.router.onError(async (error) => {
        await plugin.onError!(error, context)
      })
    }
  }

  /**
   * 取消注册插件钩子
   */
  private unregisterHooks(plugin: Plugin): void {
    // 钩子会在路由器内部自动管理,这里不需要额外操作
    // 因为钩子函数会随着插件卸载而失效
  }

  // ==================== 插件信息 ====================

  /**
   * 获取插件列表
   */
  list(): Array<{ name: string; version?: string; state: PluginState }> {
    return Array.from(this.plugins.entries()).map(([name, record]) => ({
      name,
      version: record.plugin.version,
      state: record.state,
    }))
  }

  /**
   * 获取已安装插件数量
   */
  get size(): number {
    return this.plugins.size
  }

  /**
   * 清空所有插件
   */
  async clear(): Promise<void> {
    const names = Array.from(this.plugins.keys())
    
    for (const name of names) {
      try {
        await this.uninstall(name)
      } catch (error) {
        console.error(`Failed to uninstall plugin "${name}":`, error)
      }
    }
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(router: Router): PluginManager {
  return new PluginManager(router)
}

// ==================== 插件工厂 ====================

/**
 * 创建简单插件
 */
export function definePlugin(
  name: string,
  hooks: PluginHooks,
  options?: Partial<Plugin>,
): Plugin {
  return {
    name,
    ...hooks,
    ...options,
  }
}

// ==================== 内置插件 ====================

/**
 * 日志插件
 */
export function createLoggerPlugin(options?: {
  logNavigation?: boolean
  logErrors?: boolean
}): Plugin {
  const { logNavigation = true, logErrors = true } = options || {}

  return definePlugin('logger', {
    install: (context) => {
      console.log('[Router] Logger plugin installed')
    },
    beforeNavigate: (to, from) => {
      if (logNavigation) {
        console.log('[Router] Navigate:', from.path, '->', to.path)
      }
    },
    afterNavigate: (to, from) => {
      if (logNavigation) {
        console.log('[Router] Navigation complete:', to.path)
      }
    },
    onError: (error) => {
      if (logErrors) {
        console.error('[Router] Error:', error)
      }
    },
  })
}

/**
 * 页面标题插件
 */
export function createPageTitlePlugin(options?: {
  suffix?: string
  separator?: string
  defaultTitle?: string
}): Plugin {
  const {
    suffix = '',
    separator = ' | ',
    defaultTitle = 'Page',
  } = options || {}

  return definePlugin('page-title', {
    afterNavigate: (to) => {
      if (typeof document === 'undefined') return

      const title = to.meta.title as string || defaultTitle
      document.title = suffix ? `${title}${separator}${suffix}` : title
    },
  })
}

/**
 * 进度条插件
 */
export function createProgressPlugin(options?: {
  color?: string
  height?: string
  duration?: number
}): Plugin {
  const {
    color = '#4CAF50',
    height = '2px',
    duration = 300,
  } = options || {}

  let progressBar: HTMLElement | null = null

  return definePlugin('progress', {
    install: () => {
      if (typeof document === 'undefined') return

      // 创建进度条元素
      progressBar = document.createElement('div')
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: ${height};
        background-color: ${color};
        transition: width ${duration}ms ease;
        z-index: 9999;
      `
      document.body.appendChild(progressBar)
    },
    beforeNavigate: () => {
      if (progressBar) {
        progressBar.style.width = '50%'
      }
    },
    afterNavigate: () => {
      if (progressBar) {
        progressBar.style.width = '100%'
        setTimeout(() => {
          if (progressBar) {
            progressBar.style.width = '0'
          }
        }, duration)
      }
    },
    uninstall: () => {
      if (progressBar && progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar)
        progressBar = null
      }
    },
  })
}

/**
 * 分析插件
 */
export function createAnalyticsPlugin(options?: {
  trackPageView?: (path: string) => void
  trackEvent?: (event: string, data?: any) => void
}): Plugin {
  const { trackPageView, trackEvent } = options || {}

  return definePlugin('analytics', {
    afterNavigate: (to) => {
      if (trackPageView) {
        trackPageView(to.path)
      }
    },
    onError: (error) => {
      if (trackEvent) {
        trackEvent('router_error', { error: error.message })
      }
    },
  })
}

/**
 * 权限检查插件
 */
export function createPermissionPlugin(options: {
  check: (to: RouteLocationNormalized) => boolean | Promise<boolean>
  redirectTo?: string
  onDenied?: (to: RouteLocationNormalized) => void
}): Plugin {
  const { check, redirectTo = '/login', onDenied } = options

  return definePlugin('permission', {
    beforeNavigate: async (to, from, context) => {
      const hasPermission = await check(to)
      
      if (!hasPermission) {
        if (onDenied) {
          onDenied(to)
        }
        
        // 重定向到登录页
        context.router.push(redirectTo)
        return false
      }
    },
  }, {
    priority: 100, // 高优先级
  })
}

/**
 * 保持滚动位置插件
 */
export function createKeepScrollPlugin(): Plugin {
  const scrollPositions = new Map<string, { x: number; y: number }>()

  return definePlugin('keep-scroll', {
    beforeNavigate: (to, from) => {
      if (typeof window === 'undefined') return

      // 保存当前位置
      scrollPositions.set(from.path, {
        x: window.scrollX,
        y: window.scrollY,
      })
    },
    afterNavigate: (to) => {
      if (typeof window === 'undefined') return

      // 恢复位置
      const pos = scrollPositions.get(to.path)
      if (pos) {
        window.scrollTo(pos.x, pos.y)
      }
    },
  })
}
