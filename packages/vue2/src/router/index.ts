/**
 * @ldesign/router-vue2 路由器实现
 *
 * 基于 vue-router v3 的增强路由器
 *
 * @module router
 */

import Vue from 'vue'
import VueRouter from 'vue-router'
import type { RouterOptions as VueRouterOptions, Route, RouteConfig } from 'vue-router'

// Ensure vue-router is installed into Vue (idempotent)
// Vue.use will ignore if already installed
// @ts-ignore
Vue.use(VueRouter)

import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
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

  /** 路由模式 */
  mode?: 'hash' | 'history' | 'abstract'

  /** 基础路径 */
  base?: string

  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior

  /** 事件发射器（用于触发路由事件） */
  eventEmitter?: EventEmitter
}

/**
 * 当前路由信息
 */
export interface CurrentRoute {
  value?: RouteLocationNormalized
}

/**
 * 增强的路由器接口
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

  /** 底层的 vue-router 实例 */
  vueRouter: VueRouter
}

// ==================== 路由器实现 ====================

/**
 * 转换路由记录为 vue-router v3 格式
 */
function convertRouteRecord(route: RouteRecordRaw): RouteConfig {
  const vueRoute: RouteConfig = {
    path: route.path,
    name: route.name,
    component: route.component as any,
    meta: route.meta,
  }

  if (route.redirect) {
    vueRoute.redirect = route.redirect as any
  }

  if (route.alias) {
    vueRoute.alias = route.alias
  }

  if (route.children) {
    vueRoute.children = route.children.map(convertRouteRecord)
  }

  if (route.beforeEnter) {
    vueRoute.beforeEnter = route.beforeEnter as any
  }

  return vueRoute
}

/**
 * 创建增强的路由器
 *
 * @param options - 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  // 转换配置为 vue-router 格式
  const vueRouterOptions: VueRouterOptions = {
    mode: options.mode || 'hash',
    base: options.base,
    routes: options.routes.map(convertRouteRecord),
  }

  if (options.scrollBehavior) {
    vueRouterOptions.scrollBehavior = options.scrollBehavior as any
  }

  // 创建 vue-router 实例
  const vueRouter = new VueRouter(vueRouterOptions)

  // 获取事件发射器
  const eventEmitter = options.eventEmitter

  // 创建增强的路由器包装器
  const router: Router = {
    routes: options.routes,
    vueRouter,

    getCurrentRoute(): CurrentRoute {
      const currentRoute = vueRouter.currentRoute
      return {
        value: {
          path: currentRoute.path,
          fullPath: currentRoute.fullPath,
          params: currentRoute.params,
          query: currentRoute.query,
          hash: currentRoute.hash,
          meta: currentRoute.meta,
          matched: currentRoute.matched as any,
        }
      }
    },

    async push(to: RouteLocationRaw) {
      await vueRouter.push(to as any)
      // 触发路由导航事件
      if (eventEmitter) {
        eventEmitter.emit('router:navigated', {
          to: vueRouter.currentRoute
        })
      }
    },

    async replace(to: RouteLocationRaw) {
      await vueRouter.replace(to as any)
      // 触发路由导航事件
      if (eventEmitter) {
        eventEmitter.emit('router:navigated', {
          to: vueRouter.currentRoute
        })
      }
    },

    go(delta: number) {
      vueRouter.go(delta)
      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: vueRouter.currentRoute
          })
        }, 0)
      }
    },

    back() {
      vueRouter.back()
      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: vueRouter.currentRoute
          })
        }, 0)
      }
    },

    forward() {
      vueRouter.forward()
      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: vueRouter.currentRoute
          })
        }, 0)
      }
    },

    beforeEach(guard: NavigationGuard) {
      return vueRouter.beforeEach(guard as any)
    },

    beforeResolve(guard: NavigationGuard) {
      return vueRouter.beforeResolve(guard as any)
    },

    afterEach(hook: NavigationHookAfter) {
      return vueRouter.afterEach(hook as any)
    },

    onError(handler: (error: Error) => void) {
      return vueRouter.onError(handler)
    },
  }

  return router
}

// ==================== 类型导出 ====================

export type { VueRouter, Route, RouteConfig }

