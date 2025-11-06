/**
 * @ldesign/router-vue 路由器实现
 * 
 * 基于 vue-router v4 的增强路由器
 * 
 * @module router
 */

import type { App, Ref } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  NavigationGuard,
  NavigationHookAfter,
  ScrollBehavior,
} from '@ldesign/router-core'
import {
  createRouter as createVueRouter,
  useRouter as useVueRouter,
  useRoute as useVueRoute,
} from 'vue-router'
import type {
  Router as VueRouter,
  RouteRecordRaw as VueRouteRecordRaw,
  RouterOptions as VueRouterOptions,
  RouterHistory,
} from 'vue-router'

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
  history: RouterHistory

  /** 事件发射器（可选） */
  eventEmitter?: EventEmitter

  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior

  /** 活跃链接类名 */
  linkActiveClass?: string

  /** 精确活跃链接类名 */
  linkExactActiveClass?: string

  /** 严格尾部斜杠匹配 */
  strict?: boolean

  /** 大小写敏感匹配 */
  sensitive?: boolean
}

/**
 * 当前路由对象
 */
export interface CurrentRoute {
  value?: RouteLocationNormalized
}

/**
 * 增强的路由器接口
 */
export interface Router {
  /** 当前路由 */
  currentRoute: Ref<RouteLocationNormalized>

  /** 获取当前路由（兼容性方法） */
  getCurrentRoute(): CurrentRoute

  /** 添加路由 */
  addRoute(route: RouteRecordRaw): () => void
  addRoute(parentName: string, route: RouteRecordRaw): () => void

  /** 移除路由 */
  removeRoute(name: string): void

  /** 检查路由是否存在 */
  hasRoute(name: string): boolean

  /** 获取所有路由 */
  getRoutes(): RouteRecordRaw[]

  /** 解析路由位置 */
  resolve(to: RouteLocationRaw): RouteLocationNormalized

  /** 导航到新位置 */
  push(to: RouteLocationRaw): Promise<void | NavigationFailure>

  /** 替换当前位置 */
  replace(to: RouteLocationRaw): Promise<void | NavigationFailure>

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

  /** 判断路由是否就绪 */
  isReady(): Promise<void>

  /** 安装到 Vue 应用 */
  install(app: App): void

  /** 底层的 vue-router 实例 */
  vueRouter: VueRouter
}

// ==================== 路由器实现 ====================

/**
 * 转换路由记录为 vue-router 格式
 */
function convertRouteRecord(route: RouteRecordRaw): VueRouteRecordRaw {
  const vueRoute: VueRouteRecordRaw = {
    path: route.path,
    name: route.name,
    component: route.component,
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
 * 转换历史管理器为 vue-router 格式
 */
function convertHistory(history: RouterHistory): any {
  // vue-router 的 history 接口与我们的 RouterHistory 基本兼容
  // 只需要做一些适配
  return {
    base: history.base,
    location: history.location.path,
    state: history.state,
    push: (to: string) => {
      const location = typeof to === 'string'
        ? { fullPath: to, path: to, query: '', hash: '' }
        : to
      history.push(location)
    },
    replace: (to: string) => {
      const location = typeof to === 'string'
        ? { fullPath: to, path: to, query: '', hash: '' }
        : to
      history.replace(location)
    },
    go: (delta: number) => history.go(delta),
    listen: history.listen.bind(history),
    destroy: history.destroy.bind(history),
  }
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

