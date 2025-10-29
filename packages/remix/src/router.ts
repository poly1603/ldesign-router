/**
 * remix Router Implementation
 */

import type {
  NavigationInformation,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
} from '@ldesign/router-core'

export interface RouterOptions {
  /**
   * 路由历史实例
   */
  history: RouterHistory
  /**
   * 路由配置
   */
  routes: RouteRecordRaw[]
  /**
   * 是否严格模式
   */
  strict?: boolean
  /**
   * 是否区分大小�?
   */
  sensitive?: boolean
}

export interface Router {
  /**
   * 当前路由
   */
  currentRoute: RouteLocationNormalized
  /**
   * 路由历史
   */
  history: RouterHistory
  /**
   * 推送路�?
   */
  push: (to: RouteLocationRaw) => Promise<void>
  /**
   * 替换路由
   */
  replace: (to: RouteLocationRaw) => Promise<void>
  /**
   * 返回
   */
  back: () => void
  /**
   * 前进
   */
  forward: () => void
}

export function createRouter(options: RouterOptions): Router {
  const { history } = options

  let currentRoute: RouteLocationNormalized = {
    path: '/',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    meta: {},
    matched: [],
  }

  const router: Router = {
    get currentRoute() {
      return currentRoute
    },
    history,
    async push(to: RouteLocationRaw) {
      const location = typeof to === 'string' ? { path: to } : to
      history.push(location.path || '/', {})
    },
    async replace(to: RouteLocationRaw) {
      const location = typeof to === 'string' ? { path: to } : to
      history.replace(location.path || '/', {})
    },
    back() {
      history.back()
    },
    forward() {
      history.forward()
    },
  }

  return router
}
