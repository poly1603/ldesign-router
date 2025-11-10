/**
 * Angular Router Engine 插件
 *
 * 将 Angular Router 功能集成到 LDesign Engine 中
 */

import type { Plugin } from '@ldesign/engine-core/types'
import type { RouteRecordRaw } from '@ldesign/router-core'

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
 * 创建 Angular Router Engine 插件
 *
 * @param options - 插件配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createRouterEnginePlugin } from '@ldesign/router-angular'
 *
 * const routerPlugin = createRouterEnginePlugin({
 *   routes: [
 *     { path: '', component: HomeComponent },
 *     { path: 'about', component: AboutComponent }
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
    console.log('[Angular Router Plugin] createRouterEnginePlugin called with options:', options)
  }

  return {
    name,
    version,
    dependencies: [],

    async install(context: any) {
      try {
        if (debug) {
          console.log('[Angular Router Plugin] install method called')
        }

        // 从上下文中获取引擎实例
        const engine: EngineLike = context?.engine || context

        if (!engine) {
          throw new Error('Engine instance not found in context')
        }

        // 记录安装信息
        engine.logger?.info?.('Installing Angular router plugin...', {
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

        // Angular 使用服务模式，将路由配置保存到状态中
        engine.state?.set?.('router:routes', routes)

        // 创建简易路由器实例（支持 hash/history），提供 getCurrentRoute/push/replace 等方法
        const eventEmitter = engine.events ? { emit: (event: string, data?: any) => engine.events?.emit?.(event, data) } : undefined

        function parseLocation() {
          const isHash = (mode || 'hash') === 'hash'
          if (typeof window === 'undefined') {
            return { path: '/', search: '', hash: '', fullPath: '/' }
          }
          if (isHash) {
            const hashValue = window.location.hash.slice(1)
            const [pathWithQuery, hashFragment] = hashValue.split('#')
            const [path, queryString] = (pathWithQuery || '/').split('?')
            const search = queryString ? `?${queryString}` : ''
            const hash = hashFragment ? `#${hashFragment}` : ''
            return { path: path || '/', search, hash, fullPath: (path || '/') + search + hash }
          } else {
            const path = window.location.pathname
            const search = window.location.search
            const hash = window.location.hash
            return { path, search, hash, fullPath: path + search + hash }
          }
        }

        function matchRoute(currentPath: string) {
          let matched: any | undefined
          let params: Record<string, any> = {}
          for (const r of routes) {
            if (r.path === currentPath) { matched = r; break }
            const pattern = r.path.replace(/:\\w+/g, '([^/]+)')
            const regex = new RegExp(`^${pattern}$`)
            const m = currentPath.match(regex)
            if (m) {
              matched = r
              const names = r.path.match(/:\\w+/g) || []
              names.forEach((n: string, i: number) => { params[n.slice(1)] = m[i + 1] })
              break
            }
          }
          return { matched, params }
        }

        const router = {
          routes,
          getCurrentRoute() {
            const { path, search, hash, fullPath } = parseLocation()
            const { matched, params } = matchRoute(path)
            return {
              value: {
                path,
                fullPath,
                params,
                query: Object.fromEntries(new URLSearchParams(search.replace(/^\?/, ''))),
                hash: hash.replace(/^#/, ''),
                meta: matched?.meta,
                matched: matched ? [matched] : [],
                component: matched?.component,
              }
            }
          },
          async push(to: any) {
            const isHash = (mode || 'hash') === 'hash'
            const target = typeof to === 'string' ? to : (to?.path || '/')
            if (typeof window !== 'undefined') {
              if (isHash) {
                window.location.hash = target
              } else {
                history.pushState(null, '', target)
              }
              setTimeout(() => eventEmitter?.emit?.('router:navigated', { to: this.getCurrentRoute().value }), 0)
            }
          },
          async replace(to: any) {
            const isHash = (mode || 'hash') === 'hash'
            const target = typeof to === 'string' ? to : (to?.path || '/')
            if (typeof window !== 'undefined') {
              if (isHash) {
                const newHash = '#' + target.replace(/^#/, '')
                if (window.location.hash !== newHash) {
                  window.location.replace(window.location.pathname + window.location.search + newHash)
                }
              } else {
                history.replaceState(null, '', target)
              }
              setTimeout(() => eventEmitter?.emit?.('router:navigated', { to: this.getCurrentRoute().value }), 0)
            }
          },
          go(delta: number) {
            if (typeof window !== 'undefined') {
              window.history.go(delta)
            }
          },
          back() { if (typeof window !== 'undefined') window.history.back() },
          forward() { if (typeof window !== 'undefined') window.history.forward() },
        }

        // 初始同步：根据 URL 设置当前路由并发射一次事件
        if (typeof window !== 'undefined') {
          if ((mode || 'hash') === 'hash') {
            // 确保初始 hash 有路径
            if (!window.location.hash) {
              window.location.hash = '/'
            }
          }
          // 监听 hash 变化，触发事件
          window.addEventListener('hashchange', () => {
            eventEmitter?.emit?.('router:navigated', { to: router.getCurrentRoute().value })
          })
        }

        // 注册路由器到 engine
        if (engine.setRouter) {
          engine.setRouter(router)
        } else {
          (engine as any).router = router
        }

        // 发射路由器安装完成事件
        engine.events?.emit?.('router:installed', { router, mode, base })

        engine.logger?.info?.('Angular router plugin installed successfully')
      } catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to install Angular router plugin:', error)
        throw error
      }
    },

    async uninstall(context: any) {
      try {
        const engine: EngineLike = context?.engine || context

        if (!engine) {
          return
        }

        engine.logger?.info?.('Uninstalling Angular router plugin...')

        // 清理状态
        engine.state?.delete?.('router:mode')
        engine.state?.delete?.('router:base')
        engine.state?.delete?.('router:preset')
        engine.state?.delete?.('router:routes')

        // 清理路由器
        if (engine.setRouter) {
          engine.setRouter(null)
        } else {
          (engine as any).router = null
        }

        // 发射路由器卸载事件
        engine.events?.emit?.('router:uninstalled')

        engine.logger?.info?.('Angular router plugin uninstalled successfully')
      } catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to uninstall Angular router plugin:', error)
      }
    },
  }
}

/**
 * 创建默认 Angular Router Engine 插件
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

