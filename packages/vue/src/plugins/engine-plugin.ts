/**
 * Vue 3 Router Engine 插件
 *
 * 将 Vue Router 功能集成到 LDesign Engine 中
 */

import type { Plugin } from '@ldesign/engine-core/types'
import type { RouteRecordRaw } from '@ldesign/router-core'
import { createRouter } from '../router'
import { createWebHistory, createWebHashHistory, createMemoryHistory } from 'vue-router'

/**
 * 路由模式
 */
export type RouterMode = 'history' | 'hash' | 'memory'

/**
 * 路由预设
 */
export type RouterPreset = 'spa' | 'mobile' | 'desktop' | 'admin' | 'blog'

/**
 * Router Engine 插件配置选项
 */
export interface RouterEnginePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 路由配置 */
  routes: RouteRecordRaw[]
  /** 路由模式 */
  mode?: RouterMode
  /** 基础路径 */
  base?: string
  /** 路由预设 */
  preset?: RouterPreset
  /** 是否启用调试模式 */
  debug?: boolean
  /** 路由动画配置 */
  animation?: boolean | {
    type?: 'fade' | 'slide' | 'zoom' | 'none'
    duration?: number
    mode?: 'out-in' | 'in-out' | 'default'
    easing?: string
    enabled?: boolean
  }
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
                engine.events?.emit?.('router:navigated', { to })
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

        // 发射路由器安装完成事件
        engine.events?.emit?.('router:installed', { router, mode, base })

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

        // 发射路由器卸载事件
        engine.events?.emit?.('router:uninstalled')

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

