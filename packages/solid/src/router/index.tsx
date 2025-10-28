/**
 * @ldesign/router-solid 路由器实现
 * 
 * 基于 @solidjs/router 和 @ldesign/router-core 的路由器
 * 
 * @module router
 */

import { createContext, useContext, JSX } from 'solid-js'
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
 * 路由器配置选项
 */
export interface RouterOptions {
  /** 路由记录数组 */
  routes: RouteRecordRaw[]

  /** 历史管理器 */
  history?: RouterHistory

  /** 基础路径 */
  base?: string

  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior

  /** 严格尾部斜杠匹配 */
  strict?: boolean

  /** 大小写敏感匹配 */
  sensitive?: boolean
}

/**
 * 路由器接口
 */
export interface Router {
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

  const router: Router = {
    routes: options.routes,
    history: options.history,

    async push(to: RouteLocationRaw) {
      if (!navigateFn) {
        console.warn('Router not initialized yet')
        return
      }

      const path = typeof to === 'string' ? to : to.path || '/'

      try {
        // TODO: 执行导航守卫
        navigateFn(path)
      } catch (error) {
        for (const handler of errorHandlers) {
          handler(error as Error)
        }
        throw error
      }
    },

    async replace(to: RouteLocationRaw) {
      if (!navigateFn) {
        console.warn('Router not initialized yet')
        return
      }

      const path = typeof to === 'string' ? to : to.path || '/'

      try {
        // TODO: 执行导航守卫
        navigateFn(path, { replace: true })
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
        {renderRoutes(props.router.routes)}
      </SolidRouter>
    </RouterContext.Provider>
  )
}

// ==================== 类型导出 ====================

export type { Component }


