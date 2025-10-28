/**
 * @ldesign/router-react 路由器实现
 * 
 * 基于 react-router-dom v6 的增强路由器
 * 
 * @module router
 */

import React from 'react'
import type { ReactNode } from 'react'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
  NavigationGuard,
  ScrollBehavior,
} from '@ldesign/router-core'
import {
  createBrowserRouter,
  RouterProvider as ReactRouterProvider,
  useNavigate as reactUseNavigate,
  useLocation as reactUseLocation,
  useParams as reactUseParams,
} from 'react-router-dom'
import type { Router as ReactRouter, RouteObject } from 'react-router-dom'

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
  basename?: string

  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior
}

/**
 * 增强的路由器接口
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

  /** 底层的 react-router 实例 */
  reactRouter: ReactRouter
}

// ==================== 路由器实现 ====================

/**
 * 转换路由记录为 react-router 格式
 */
function convertRouteRecord(route: RouteRecordRaw): RouteObject {
  const reactRoute: RouteObject = {
    path: route.path,
    element: route.component ? React.createElement(route.component as any) : undefined,
  }

  if (route.children) {
    reactRoute.children = route.children.map(convertRouteRecord)
  }

  // react-router 使用 loader 处理数据预取
  if (route.beforeEnter) {
    // 可以在这里转换为 loader
  }

  return reactRoute
}

/**
 * 创建增强的路由器
 * 
 * @param options - 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  // 转换路由配置
  const routes = options.routes.map(convertRouteRecord)

  // 创建 react-router 实例
  const reactRouter = createBrowserRouter(routes, {
    basename: options.basename,
  })

  // 创建增强的路由器包装器
  const router: Router = {
    push: async (to: RouteLocationRaw) => {
      const path = typeof to === 'string' ? to : to.path || '/'
      reactRouter.navigate(path)
    },

    replace: async (to: RouteLocationRaw) => {
      const path = typeof to === 'string' ? to : to.path || '/'
      reactRouter.navigate(path, { replace: true })
    },

    go: (delta: number) => {
      reactRouter.navigate(delta)
    },

    back: () => {
      reactRouter.navigate(-1)
    },

    forward: () => {
      reactRouter.navigate(1)
    },

    reactRouter,
  }

  return router
}

/**
 * RouterProvider 组件
 * 
 * 提供路由上下文
 */
export interface RouterProviderProps {
  /** 路由器实例 */
  router: Router

  /** 子组件 */
  children?: ReactNode
}

export function RouterProvider({ router }: RouterProviderProps) {
  return React.createElement(ReactRouterProvider, { router: router.reactRouter })
}

// ==================== 类型导出 ====================

export type { ReactRouter }

