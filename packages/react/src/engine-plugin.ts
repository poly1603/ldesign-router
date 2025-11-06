/**
 * React Router Engine 插件
 * 
 * 将 React Router 功能集成到 LDesign Engine 中
 */

import type { Plugin } from '@ldesign/engine-core/types'
import type { RouteRecordRaw } from '@ldesign/router-core'
import { createRouter, type RouterOptions } from './router'

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
}

/**
 * Engine 接口（简化版）
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
  state?: {
    set?: (k: string, v: any) => void
    delete?: (k: string) => void
  }
  router?: any
  setRouter?: (router: any) => void
}

/**
 * 创建 React Router Engine 插件
 * 
 * @param options - 插件配置选项
 * @returns Engine 插件实例
 * 
 * @example
 * ```typescript
 * import { createRouterEnginePlugin } from '@ldesign/router-react'
 * 
 * const routerPlugin = createRouterEnginePlugin({
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ],
 *   mode: 'history',
 *   base: '/'
 * })
 * 
 * await engine.use(routerPlugin)
 * ```
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
    console.log('[React Router Plugin] createRouterEnginePlugin called with options:', options)
  }

  return {
    name,
    version,
    dependencies: [],

    async install(context: any) {
      try {
        if (debug) {
          console.log('[React Router Plugin] install method called')
        }

        // 从上下文中获取引擎实例
        const engine: EngineLike = context?.engine || context

        if (!engine) {
          throw new Error('Engine instance not found in context')
        }

        // 记录安装信息
        engine.logger?.info?.('Installing React router plugin...', {
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

        // 创建路由器配置
        const routerOptions: RouterOptions = {
          routes,
          mode,
          base,
          // 传入事件发射器，使router能够触发事件
          eventEmitter: engine.events ? {
            emit: (event: string, data?: any) => engine.events?.emit?.(event, data)
          } : undefined,
        }

        // 创建路由器实例
        const router = createRouter(routerOptions)

        // 注册路由器到 engine
        if (engine.setRouter) {
          engine.setRouter(router)
        } else {
          (engine as any).router = router
        }

        // 发射路由器安装完成事件
        engine.events?.emit?.('router:installed', { router, mode, base })

        engine.logger?.info?.('React router plugin installed successfully')
      } catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to install React router plugin:', error)
        throw error
      }
    },

    async uninstall(context: any) {
      try {
        const engine: EngineLike = context?.engine || context

        if (!engine) {
          return
        }

        engine.logger?.info?.('Uninstalling React router plugin...')

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

        engine.logger?.info?.('React router plugin uninstalled successfully')
      } catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to uninstall React router plugin:', error)
      }
    },
  }
}

/**
 * 创建默认 React Router Engine 插件
 * 
 * @param routes - 路由配置
 * @returns Engine 插件实例
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

