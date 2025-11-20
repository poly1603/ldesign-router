/**
 * @ldesign/router-vue 路由器实现
 * 
 * 基于 vue-router v4 的增强路由器
 * 
 * @module router
 */

import type { App } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  NavigationGuard,
  NavigationHookAfter,
  Router,
  RouterOptions,
} from '../types'
import {
  createRouter as createVueRouter,
  useRouter as useVueRouter,
  useRoute as useVueRoute,
} from 'vue-router'
import type {
  Router as VueRouter,
  RouteRecordRaw as VueRouteRecordRaw,
  RouterOptions as VueRouterOptions,
} from 'vue-router'

export type { Router, RouterOptions } from '../types'

// ==================== 路由器实现 ====================

/**
 * 转换路由记录为 vue-router 格式
 */
function convertRouteRecord(route: RouteRecordRaw): VueRouteRecordRaw {
  const vueRoute: VueRouteRecordRaw = {
    path: route.path,
    name: route.name,
    component: route.component as any,
    meta: route.meta as any,
    ...(route.children ? { children: route.children.map(convertRouteRecord) as any } : {}),
  }

  if (route.redirect) {
    vueRoute.redirect = route.redirect as any
  }

  if (route.alias) {
    vueRoute.alias = route.alias
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
    history: options.history as any,
    routes: options.routes.map(convertRouteRecord),
  }

  if (options.scrollBehavior) {
    vueRouterOptions.scrollBehavior = options.scrollBehavior as any
  }

  if (options.linkActiveClass) {
    vueRouterOptions.linkActiveClass = options.linkActiveClass
  }

  if (options.linkExactActiveClass) {
    vueRouterOptions.linkExactActiveClass = options.linkExactActiveClass
  }

  if (options.strict !== undefined) {
    vueRouterOptions.strict = options.strict
  }

  if (options.sensitive !== undefined) {
    vueRouterOptions.sensitive = options.sensitive
  }

  // 创建 vue-router 实例
  const vueRouter = createVueRouter(vueRouterOptions)

  // 获取事件发射器
  const eventEmitter = options.eventEmitter

  // 创建增强的路由器包装器
  const router: Router = {
    currentRoute: vueRouter.currentRoute as any,

    getCurrentRoute: () => {
      return {
        value: vueRouter.currentRoute.value as any
      }
    },

    addRoute: (parentOrRoute: string | RouteRecordRaw, route?: RouteRecordRaw) => {
      if (typeof parentOrRoute === 'string') {
        return vueRouter.addRoute(parentOrRoute, convertRouteRecord(route!))
      }
      return vueRouter.addRoute(convertRouteRecord(parentOrRoute))
    },

    removeRoute: (name: string) => {
      vueRouter.removeRoute(name)
    },

    hasRoute: (name: string) => {
      return vueRouter.hasRoute(name)
    },

    getRoutes: () => {
      return vueRouter.getRoutes() as any
    },

    resolve: (to: RouteLocationRaw) => {
      return vueRouter.resolve(to as any) as any
    },

    push: async (to: RouteLocationRaw) => {
      const result = await vueRouter.push(to as any)
      // 触发路由导航事件
      if (eventEmitter) {
        eventEmitter.emit('router:navigated', {
          to: vueRouter.currentRoute.value
        })
      }
      return result as any
    },

    replace: async (to: RouteLocationRaw) => {
      const result = await vueRouter.replace(to as any)
      // 触发路由导航事件
      if (eventEmitter) {
        eventEmitter.emit('router:navigated', {
          to: vueRouter.currentRoute.value
        })
      }
      return result as any
    },

    go: (delta: number) => {
      vueRouter.go(delta)
      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: vueRouter.currentRoute.value
          })
        }, 0)
      }
    },

    back: () => {
      vueRouter.back()
      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: vueRouter.currentRoute.value
          })
        }, 0)
      }
    },

    forward: () => {
      vueRouter.forward()
      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: vueRouter.currentRoute.value
          })
        }, 0)
      }
    },

    beforeEach: (guard: NavigationGuard) => {
      return vueRouter.beforeEach(guard as any)
    },

    beforeResolve: (guard: NavigationGuard) => {
      return vueRouter.beforeResolve(guard as any)
    },

    afterEach: (hook: NavigationHookAfter) => {
      return vueRouter.afterEach(hook as any)
    },

    onError: (handler: (error: Error) => void) => {
      return vueRouter.onError(handler)
    },

    isReady: () => {
      return vueRouter.isReady()
    },

    install: (app: App) => {
      app.use(vueRouter)

      // 🚀 优化：在应用卸载时自动清理资源
      app.config.globalProperties.$router = router

      // 监听应用卸载事件
      const originalUnmount = app.unmount
      app.unmount = function () {
        // 清理路由器资源（如果有 destroy 方法）
        if (vueRouter && typeof (vueRouter as any).destroy === 'function') {
          (vueRouter as any).destroy()
        }

        // 调用原始的 unmount
        return originalUnmount.call(this)
      }
    },

    vueRouter,
  }

  return router
}

/**
 * 获取当前路由器实例
 * 
 * @returns 路由器实例
 */
export function useRouter(): Router {
  const vueRouter = useVueRouter()

  // 返回与 createRouter 相同的接口
  return {
    currentRoute: vueRouter.currentRoute as any,
    getCurrentRoute: () => ({
      value: vueRouter.currentRoute.value as any
    }),
    addRoute: vueRouter.addRoute.bind(vueRouter) as any,
    removeRoute: vueRouter.removeRoute.bind(vueRouter),
    hasRoute: vueRouter.hasRoute.bind(vueRouter),
    getRoutes: vueRouter.getRoutes.bind(vueRouter) as any,
    resolve: vueRouter.resolve.bind(vueRouter) as any,
    push: vueRouter.push.bind(vueRouter) as any,
    replace: vueRouter.replace.bind(vueRouter) as any,
    go: vueRouter.go.bind(vueRouter),
    back: vueRouter.back.bind(vueRouter),
    forward: vueRouter.forward.bind(vueRouter),
    beforeEach: vueRouter.beforeEach.bind(vueRouter) as any,
    beforeResolve: vueRouter.beforeResolve.bind(vueRouter) as any,
    afterEach: vueRouter.afterEach.bind(vueRouter) as any,
    onError: vueRouter.onError.bind(vueRouter),
    isReady: vueRouter.isReady.bind(vueRouter),
    install: vueRouter.install.bind(vueRouter),
    vueRouter,
  }
}

/**
 * 获取当前路由
 * 
 * @returns 当前路由
 */
export function useRoute() {
  return useVueRoute() as RouteLocationNormalized
}

// ==================== 类型导出 ====================

export type { VueRouter }
export type UseRouterReturn = Router
export type UseRouteReturn = RouteLocationNormalized

