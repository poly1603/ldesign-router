/**
 * Solid Router Engine 插件
 * 
 * 将 Solid Router 功能集成到 LDesign Engine 中
 */

import type { Plugin } from '@ldesign/engine-core/types'
import type { RouteRecordRaw } from '@ldesign/router-core'
import { createRouter, type RouterOptions } from './router'

export type RouterMode = 'history' | 'hash' | 'memory'
export type RouterPreset = 'spa' | 'mobile' | 'desktop' | 'admin' | 'blog'

export interface RouterEnginePluginOptions {
  name?: string
  version?: string
  routes: RouteRecordRaw[]
  mode?: RouterMode
  base?: string
  preset?: RouterPreset
  debug?: boolean
}

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

  return {
    name,
    version,
    dependencies: [],

    async install(context: any) {
      try {
        const engine: EngineLike = context?.engine || context

        if (!engine) {
          throw new Error('Engine instance not found in context')
        }

        engine.logger?.info?.('Installing Solid router plugin...', {
          version,
          mode,
          base,
          routesCount: routes.length,
          preset,
        })

        engine.state?.set?.('router:mode', mode)
        engine.state?.set?.('router:base', base)
        if (preset) {
          engine.state?.set?.('router:preset', preset)
        }

        const routerOptions: RouterOptions = {
          routes,
          base,
          mode,
          // 传入事件发射器，使router能够触发事件
          eventEmitter: engine.events ? {
            emit: (event: string, data?: any) => engine.events?.emit?.(event, data)
          } : undefined,
        }

        const router = createRouter(routerOptions)

        if (engine.setRouter) {
          engine.setRouter(router)
        } else {
          (engine as any).router = router
        }

        engine.events?.emit?.('router:installed', { router, mode, base })
        engine.logger?.info?.('Solid router plugin installed successfully')
      } catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to install Solid router plugin:', error)
        throw error
      }
    },

    async uninstall(context: any) {
      try {
        const engine: EngineLike = context?.engine || context
        if (!engine) return

        engine.logger?.info?.('Uninstalling Solid router plugin...')
        engine.state?.delete?.('router:mode')
        engine.state?.delete?.('router:base')
        engine.state?.delete?.('router:preset')

        if (engine.setRouter) {
          engine.setRouter(null)
        } else {
          (engine as any).router = null
        }

        engine.events?.emit?.('router:uninstalled')
        engine.logger?.info?.('Solid router plugin uninstalled successfully')
      } catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to uninstall Solid router plugin:', error)
      }
    },
  }
}

export function createDefaultRouterEnginePlugin(routes: RouteRecordRaw[]): Plugin {
  return createRouterEnginePlugin({ routes, mode: 'history', base: '/' })
}

export const routerPlugin = createRouterEnginePlugin

