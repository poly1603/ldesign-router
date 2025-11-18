/**
 * Vue 3 Router Engine 插件
 *
 * 将 Vue Router 功能集成到 LDesign Engine 中
 */

import type { Plugin, RouterPluginAPI } from '@ldesign/engine-core/types'
import type { RouteRecordRaw } from '@ldesign/router-core'
import { ROUTER_EVENTS } from '@ldesign/engine-core/constants/events'
import { createRouter } from '../router'
import { createWebHistory, createWebHashHistory, createMemoryHistory } from 'vue-router'

/**
 * 路由模式
 */
export type RouterMode = 'history' | 'hash' | 'memory'

/**
 * 路由预设
 */
export type RouterPreset = 'spa' | 'mobile' | 'desktop' | 'admin' | 'blog' | 'docs'

/**
 * 滚动行为类型
 */
export type ScrollBehavior = 'smooth' | 'auto' | 'instant'

/**
 * 路由动画配置
 */
export interface RouterAnimationConfig {
  /** 动画类型 */
  type?: 'fade' | 'slide' | 'zoom' | 'flip' | 'none'
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 动画模式 */
  mode?: 'out-in' | 'in-out' | 'default'
  /** 缓动函数 */
  easing?: string
  /** 是否启用动画 */
  enabled?: boolean
}

/**
 * 路由守卫配置
 */
export interface RouterGuardConfig {
  /** 全局前置守卫 */
  beforeEach?: (to: any, from: any, next: Function) => void
  /** 全局后置守卫 */
  afterEach?: (to: any, from: any) => void
  /** 全局解析守卫 */
  beforeResolve?: (to: any, from: any, next: Function) => void
}

/**
 * 路由持久化配置
 */
export interface RouterPersistenceConfig {
  /** 是否启用持久化 */
  enabled?: boolean
  /** 存储键名 */
  key?: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 是否保存查询参数 */
  includeQuery?: boolean
  /** 是否保存 hash */
  includeHash?: boolean
}

/**
 * 路由性能配置
 */
export interface RouterPerformanceConfig {
  /** 是否启用路由缓存 */
  cache?: boolean
  /** 缓存大小 */
  cacheSize?: number
  /** 是否启用预加载 */
  prefetch?: boolean
  /** 预加载策略 */
  prefetchStrategy?: 'hover' | 'visible' | 'idle' | 'manual'
  /** 是否启用懒加载 */
  lazyLoad?: boolean
}

/**
 * 路由国际化配置
 */
export interface RouterI18nConfig {
  /** 是否启用路由国际化 */
  enabled?: boolean
  /** 语言参数名 */
  localeParam?: string
  /** 默认语言 */
  defaultLocale?: string
  /** 支持的语言列表 */
  locales?: string[]
  /** 是否在 URL 中显示默认语言 */
  showDefaultLocale?: boolean
}

/**
 * Router Engine 插件完整配置选项
 */
export interface RouterEnginePluginOptions {
  // ========== 基础配置 ==========
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 路由配置（必需） */
  routes: RouteRecordRaw[]
  /** 路由模式 */
  mode?: RouterMode
  /** 基础路径 */
  base?: string

  // ========== 预设配置 ==========
  /** 路由预设（快速配置常见场景） */
  preset?: RouterPreset

  // ========== 高级配置 ==========
  /** 路由动画配置 */
  animation?: boolean | RouterAnimationConfig
  /** 路由守卫配置 */
  guards?: RouterGuardConfig
  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior | ((to: any, from: any, savedPosition: any) => any)
  /** 是否严格模式（路径末尾斜杠敏感） */
  strict?: boolean
  /** 是否区分大小写 */
  sensitive?: boolean
  /** 链接激活类名 */
  linkActiveClass?: string
  /** 链接精确激活类名 */
  linkExactActiveClass?: string

  // ========== 持久化配置 ==========
  /** 路由持久化配置 */
  persistence?: RouterPersistenceConfig

  // ========== 性能配置 ==========
  /** 性能优化配置 */
  performance?: RouterPerformanceConfig

  // ========== 国际化配置 ==========
  /** 路由国际化配置 */
  i18n?: RouterI18nConfig

  // ========== 调试配置 ==========
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否启用性能监控 */
  performanceMonitoring?: boolean

  // ========== 扩展配置 ==========
  /** 自定义元数据 */
  meta?: Record<string, any>
  /** 自定义钩子 */
  hooks?: {
    onBeforeInstall?: () => void | Promise<void>
    onAfterInstall?: () => void | Promise<void>
    onBeforeUninstall?: () => void | Promise<void>
    onAfterUninstall?: () => void | Promise<void>
  }
}

/**
 * 路由预设配置工厂
 */
export const RouterPresets: Record<RouterPreset, Partial<RouterEnginePluginOptions>> = {
  spa: {
    mode: 'history',
    animation: { type: 'fade', duration: 200 },
    performance: { cache: true, prefetch: true },
  },
  mobile: {
    mode: 'hash',
    animation: { type: 'slide', duration: 300 },
    scrollBehavior: 'smooth',
  },
  desktop: {
    mode: 'history',
    animation: { type: 'fade', duration: 150 },
    performance: { cache: true, cacheSize: 50 },
  },
  admin: {
    mode: 'history',
    persistence: { enabled: true, key: 'admin-route' },
    performance: { cache: true, prefetch: true },
  },
  blog: {
    mode: 'history',
    scrollBehavior: 'smooth',
    performance: { lazyLoad: true },
  },
  docs: {
    mode: 'history',
    scrollBehavior: 'smooth',
    performance: { cache: true, prefetch: true },
    i18n: { enabled: true },
  },
}

/**
 * Engine 接口（简化版）
 * @deprecated 使用增强的 PluginContext 代替
 */
interface EngineLike {
  logger?: {
    info?: (...args: any[]) => void
    warn?: (...args: any[]) => void
    error?: (...args: any[]) => void
  }
  events?: {
    once?: (event: string, cb: () => void) => void
    emit?: (event: string, payload?: any) => void
    on?: (event: string, cb: (payload?: any) => void) => void
    off?: (event: string, cb?: (payload?: any) => void) => void
  }
  getApp?: () => any
  state?: {
    set?: (k: string, v: any) => void
    delete?: (k: string) => void
  }
  router?: any
  setRouter?: (router: any) => void
}

/**
 * 获取 Engine 实例（兼容多种上下文结构）
 */
function getEngine(context: any): EngineLike {
  return context?.engine || context || {}
}

/**
 * 创建 Vue 3 Router Engine 插件
 *
 * @param options - 插件配置选项
 * @returns Engine 插件实例
 */
export function createRouterEnginePlugin(
  options: RouterEnginePluginOptions
): Plugin {
  const {
    name = 'router',
    version = '1.0.0',
    routes,
    mode = 'history',
    base = '/',
    preset,
    debug = false,
  } = options

  if (debug) {
    console.log('[Vue Router Plugin] createRouterEnginePlugin called with options:', options)
  }

  return {
    name,
    version,
    dependencies: [],

    async install(context: any) {
      try {
        if (debug) {
          console.log('[Vue Router Plugin] install method called')
        }

        const engine = getEngine(context)

        if (!engine) {
          throw new Error('Engine instance not found in context')
        }

        engine.logger?.info?.('Installing Vue router plugin...', {
          version,
          mode,
          base,
          routesCount: routes.length,
          preset,
        })

        // 保存路由配置到状态
        engine.state?.set?.('router:mode', mode)
        engine.state?.set?.('router:base', base)
        if (preset) {
          engine.state?.set?.('router:preset', preset)
        }

        // 创建历史管理器
        let history: any
        if (mode === 'history') {
          history = createWebHistory(base)
        } else if (mode === 'hash') {
          history = createWebHashHistory(base)
        } else {
          history = createMemoryHistory(base)
        }

        // 创建路由器
        const router = createRouter({
          history,
          routes,
          eventEmitter: engine.events ? {
            emit: (event: string, data?: any) => engine.events?.emit?.(event, data)
          } : undefined,
        })

        // 初始同步与 hash 监听：确保刷新后保持当前哈希路由
        try {
          if (typeof window !== 'undefined') {
            const initialPath = (mode === 'hash')
              ? (window.location.hash.slice(1) || '/')
              : (window.location.pathname + window.location.search + window.location.hash)
            try { await (router as any).vueRouter.replace(initialPath) } catch { }
            if (mode === 'hash') {
              window.addEventListener('hashchange', () => {
                const to = (router as any).vueRouter?.currentRoute?.value
                engine.events?.emit?.(ROUTER_EVENTS.NAVIGATED, { to })
              })
            }
          }
        } catch { }

        // 动画配置处理
        const provideAnimation = (appInstance: any) => {
          const normalize = (val: any) => {
            if (val === undefined || val === null) return null
            if (typeof val === 'boolean') return val ? { type: 'fade' } : { type: 'none' }
            if (typeof val === 'object') return val
            return null
          }
          const anim = normalize((options as any).animation)
          if (anim) appInstance.provide('routerAnimationConfig', anim)
        }

        // 安装到 Vue 应用
        const installToVue = (app: any) => {
          app.use((router as any).vueRouter)
          app.provide('router', router)
          provideAnimation(app)
        }

        // 优先使用增强上下文的 framework.app
        const app = context?.framework?.app || engine.getApp?.()

        if (app) {
          installToVue(app)
        } else {
          // 如果应用还未创建，等待应用创建事件
          engine.events?.once?.('app:created', () => {
            const app = context?.framework?.app || engine.getApp?.()
            if (app) {
              installToVue(app)
            }
          })
        }

        // 注册路由器到 engine
        if (engine.setRouter) {
          engine.setRouter(router)
        } else {
          (engine as any).router = router
        }

        // 注册路由服务到容器（使用增强上下文）
        const container = context?.container || (engine as any).container
        if (container && container.singleton) {
          container.singleton('router', router)
          if (debug) {
            console.log('[Vue Router Plugin] Router service registered to container')
          }
        }

        // 注册 Router API 到 API 注册表
        if ((engine as any).api) {
          const vueRouter = (router as any).vueRouter
          const routerAPI: RouterPluginAPI = {
            name: 'router',
            version: version || '1.0.0',
            push: (path: string) => vueRouter.push(path),
            replace: (path: string) => vueRouter.replace(path),
            back: () => vueRouter.back(),
            forward: () => vueRouter.forward(),
            go: (n: number) => vueRouter.go(n),
            getCurrentRoute: () => vueRouter.currentRoute.value,
            getRoutes: () => vueRouter.getRoutes(),
            addRoute: (route: any) => vueRouter.addRoute(route),
            removeRoute: (name: string) => vueRouter.removeRoute(name),
            hasRoute: (name: string) => vueRouter.hasRoute(name),
            beforeEach: (guard: any) => vueRouter.beforeEach(guard),
            afterEach: (hook: any) => vueRouter.afterEach(hook),
          };
          (engine as any).api.register(routerAPI)
          if (debug) {
            console.log('[Vue Router Plugin] Router API registered to API registry')
          }
        }

        // 发射路由器安装完成事件
        engine.events?.emit?.(ROUTER_EVENTS.INSTALLED, { mode, base })

        engine.logger?.info?.('Vue router plugin installed successfully')
      } catch (error) {
        const engine = getEngine(context)
        engine?.logger?.error?.('Failed to install Vue router plugin:', error)
        throw error
      }
    },

    async uninstall(context: any) {
      try {
        const engine = getEngine(context)

        if (!engine) {
          return
        }

        engine.logger?.info?.('Uninstalling Vue router plugin...')

        // 清理状态
        engine.state?.delete?.('router:mode')
        engine.state?.delete?.('router:base')
        engine.state?.delete?.('router:preset')

        // 清理路由器
        if (engine.setRouter) {
          engine.setRouter(null)
        } else {
          (engine as any).router = null
        }

        // 注销 Router API
        if ((engine as any).api) {
          (engine as any).api.unregister('router')
        }

        // 发射路由器卸载事件
        engine.events?.emit?.(ROUTER_EVENTS.UNINSTALLED)

        engine.logger?.info?.('Vue router plugin uninstalled successfully')
      } catch (error) {
        const engine = getEngine(context)
        engine?.logger?.error?.('Failed to uninstall Vue router plugin:', error)
      }
    },
  }
}

/**
 * 创建默认 Vue Router Engine 插件
 */
export function createDefaultRouterEnginePlugin(
  routes: RouteRecordRaw[]
): Plugin {
  return createRouterEnginePlugin({
    routes,
    mode: 'history',
    base: '/',
  })
}

/**
 * 路由插件别名（向后兼容）
 */
export const routerPlugin = createRouterEnginePlugin

