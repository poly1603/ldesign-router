/**
 * @ldesign/router-solid 路由器实现
 * 
 * 基于 @solidjs/router 和 @ldesign/router-core 的路由器
 * 
 * @module router
 */

import { createContext, useContext, JSX, createEffect } from 'solid-js'
import type { Component } from 'solid-js'
import { Router as SolidRouter, Route } from '@solidjs/router'
import type {
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
  NavigationGuard,
  NavigationHookAfter,
  ScrollBehavior,
} from '@ldesign/router-core'

// ==================== 类型定义 ====================

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  emit(event: string, data?: any): void
}

/**
 * 路由器配置选项
 */
export interface RouterOptions {
  /** 路由记录数组 */
  routes: RouteRecordRaw[]

  /** 历史管理器 */
  history?: RouterHistory

  /** 基础路径 */
  base?: string

  /** 路由模式 */
  mode?: 'hash' | 'history'

  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior

  /** 严格尾部斜杠匹配 */
  strict?: boolean

  /** 大小写敏感匹配 */
  sensitive?: boolean

  /** 事件发射器（用于触发路由事件） */
  eventEmitter?: EventEmitter
}

/**
 * 当前路由对象
 */
export interface CurrentRoute {
  value?: {
    path: string
    fullPath?: string
    params?: Record<string, any>
    query?: Record<string, any>
    hash?: string
    meta?: Record<string, any>
    component?: Component
  }
}

/**
 * 路由器接口
 */
export interface Router {
  /** 获取当前路由 */
  getCurrentRoute(): CurrentRoute

  /** 导航到新位置 */
  push(to: RouteLocationRaw): Promise<void>

  /** 替换当前位置 */
  replace(to: RouteLocationRaw): Promise<void>

  /** 前进或后退 */
  go(delta: number): void

  /** 后退 */
  back(): void

  /** 前进 */
  forward(): void

  /** 全局前置守卫 */
  beforeEach(guard: NavigationGuard): () => void

  /** 全局解析守卫 */
  beforeResolve(guard: NavigationGuard): () => void

  /** 全局后置钩子 */
  afterEach(hook: NavigationHookAfter): () => void

  /** 错误处理器 */
  onError(handler: (error: Error) => void): () => void

  /** 路由配置 */
  routes: RouteRecordRaw[]

  /** 历史管理器 */
  history?: RouterHistory
}

// ==================== Context ====================

const RouterContext = createContext<Router>()

/**
 * 获取路由器实例
 */
export function useRouterContext(): Router {
  const router = useContext(RouterContext)
  if (!router) {
    throw new Error('Router not found. Make sure to wrap your app with <RouterProvider>')
  }
  return router
}

// ==================== 路由器实现 ====================

/**
 * 创建路由器
 * 
 * @param options - 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  const beforeGuards: NavigationGuard[] = []
  const beforeResolveGuards: NavigationGuard[] = []
  const afterHooks: NavigationHookAfter[] = []
  const errorHandlers: Array<(error: Error) => void> = []

  // 导航函数（将在 RouterProvider 中通过 useNavigate 获取）
  let navigateFn: ((to: string | number, options?: any) => void) | null = null

  // 事件触发器（用于触发 router:navigated 事件）
  const eventEmitter = options.eventEmitter || null

  const router: Router & { _setNavigateFn?: (fn: any) => void; _setEventEmitter?: (emitter: any) => void } = {
    routes: options.routes,
    history: options.history,

    getCurrentRoute(): CurrentRoute {
      // 根据模式获取路径信息
      const mode = options.mode || 'hash'
      let path: string
      let hash: string
      let search: string

      if (mode === 'hash') {
        // Hash 模式：从 hash 中提取路径
        const hashValue = window.location.hash.slice(1) // 移除 #
        const hashParts = hashValue.split('?')
        path = hashParts[0] || '/'
        search = hashParts[1] ? '?' + hashParts[1] : ''
        hash = ''
      } else {
        // History 模式：使用 pathname
        path = window.location.pathname
        hash = window.location.hash
        search = window.location.search
      }

      // 解析查询参数
      const query: Record<string, any> = {}
      if (search) {
        const params = new URLSearchParams(search.slice(1))
        params.forEach((value, key) => {
          query[key] = value
        })
      }

      // 查找匹配的路由
      let matchedRoute: RouteRecordRaw | undefined
      let params: Record<string, any> = {}

      for (const route of options.routes) {
        if (route.path === path) {
          matchedRoute = route
          break
        }
        // 简单的参数匹配（例如 /user/:id）
        const pathPattern = route.path.replace(/:\w+/g, '([^/]+)')
        const regex = new RegExp(`^${pathPattern}$`)
        const match = path.match(regex)
        if (match) {
          matchedRoute = route
          // 提取参数
          const paramNames = route.path.match(/:\w+/g) || []
          paramNames.forEach((paramName, index) => {
            params[paramName.slice(1)] = match[index + 1]
          })
          break
        }
      }

      return {
        value: {
          path,
          fullPath: path + search + hash,
          params,
          query,
          hash: hash.slice(1),
          meta: matchedRoute?.meta,
          component: matchedRoute?.component as Component,
        }
      }
    },

    async push(to: RouteLocationRaw) {
      const path = typeof to === 'string' ? to : to.path || '/'

      try {
        // TODO: 执行导航守卫

        // 如果有 navigateFn，使用它
        if (navigateFn) {
          navigateFn(path)
        } else {
          // 否则直接使用 window.location.hash
          window.location.hash = path
        }

        // 触发导航事件
        if (eventEmitter && typeof eventEmitter.emit === 'function') {
          // 延迟触发，等待 hash 变化完成
          setTimeout(() => {
            if (eventEmitter && typeof eventEmitter.emit === 'function') {
              const currentRoute = router.getCurrentRoute()
              eventEmitter.emit('router:navigated', { to: currentRoute })
            }
          }, 0)
        }
      } catch (error) {
        for (const handler of errorHandlers) {
          handler(error as Error)
        }
        throw error
      }
    },

    async replace(to: RouteLocationRaw) {
      const path = typeof to === 'string' ? to : to.path || '/'

      try {
        // TODO: 执行导航守卫

        // 如果有 navigateFn，使用它
        if (navigateFn) {
          navigateFn(path, { replace: true })
        } else {
          // 否则直接使用 window.location.replace
          window.location.replace('#' + path)
        }
      } catch (error) {
        for (const handler of errorHandlers) {
          handler(error as Error)
        }
        throw error
      }
    },

    go(delta: number) {
      if (navigateFn) {
        navigateFn(delta)
      }
    },

    back() {
      this.go(-1)
    },

    forward() {
      this.go(1)
    },

    beforeEach(guard: NavigationGuard) {
      beforeGuards.push(guard)
      return () => {
        const index = beforeGuards.indexOf(guard)
        if (index > -1) beforeGuards.splice(index, 1)
      }
    },

    beforeResolve(guard: NavigationGuard) {
      beforeResolveGuards.push(guard)
      return () => {
        const index = beforeResolveGuards.indexOf(guard)
        if (index > -1) beforeResolveGuards.splice(index, 1)
      }
    },

    afterEach(hook: NavigationHookAfter) {
      afterHooks.push(hook)
      return () => {
        const index = afterHooks.indexOf(hook)
        if (index > -1) afterHooks.splice(index, 1)
      }
    },

    onError(handler: (error: Error) => void) {
      errorHandlers.push(handler)
      return () => {
        const index = errorHandlers.indexOf(handler)
        if (index > -1) errorHandlers.splice(index, 1)
      }
    },
  }

  // 存储 navigate 函数的引用
  ; (router as any)._setNavigate = (fn: any) => {
    navigateFn = fn
  }

  return router
}

// ==================== RouterProvider 组件 ====================

export interface RouterProviderProps {
  router: Router
  children?: JSX.Element
}

/**
 * 内部组件，用于在 SolidRouter 内部获取 navigate 函数
 */
const RouterSetup: Component<{ router: Router; children: JSX.Element }> = (props) => {
  createEffect(() => {
    const navigate = (to: any, options?: any) => {
      if (typeof to === 'string') {
        window.location.hash = to
      } else if (typeof to === 'number') {
        window.history.go(to)
      }
    }

    // 设置 navigate 函数到 router
    if ((props.router as any)._setNavigate) {
      (props.router as any)._setNavigate(navigate)
      console.log('Navigate function set to router')
    }
  })

  return <>{props.children}</>
}

/**
 * RouterProvider 组件
 *
 * 提供路由器上下文并设置路由
 */
export const RouterProvider: Component<RouterProviderProps> = (props) => {
  // 渲染路由
  const renderRoutes = (routes: RouteRecordRaw[]): JSX.Element => {
    return (
      <>
        {routes.map((route) => {
          const component = route.component as Component<any>

          if (route.children && route.children.length > 0) {
            return (
              <Route path={route.path} component={component}>
                {renderRoutes(route.children)}
              </Route>
            )
          }

          return <Route path={route.path} component={component} />
        })}
      </>
    )
  }

  return (
    <RouterContext.Provider value={props.router}>
      <SolidRouter base={props.router.history?.base}>
        <RouterSetup router={props.router}>
          {renderRoutes(props.router.routes)}
        </RouterSetup>
      </SolidRouter>
    </RouterContext.Provider>
  )
}

// ==================== 类型导出 ====================

export type { Component }


