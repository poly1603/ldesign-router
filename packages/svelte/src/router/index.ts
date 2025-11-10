/**
 * @ldesign/router-svelte 路由器实现
 * 
 * 基于 Svelte stores 和 @ldesign/router-core 的路由器
 * 
 * @module router
 */

import { writable, derived, get } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordRaw,
  RouterHistory,
  NavigationGuard,
  NavigationHookAfter,
  ScrollBehavior,
  RouteParams,
  RouteQuery,
  RouteMeta,
} from '@ldesign/router-core'
import {
  parseQuery,
  stringifyQuery,
  normalizePath,
  parseURL,
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
  history: RouterHistory

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
 * 当前路由信息
 */
export interface CurrentRoute {
  path: string
  name?: string | symbol
  params: RouteParams
  query: RouteQuery
  hash: string
  meta: RouteMeta
  fullPath: string
  matched: RouteRecordRaw[]
  component?: any
}

/**
 * 路由器接口
 */
export interface Router {
  /** 当前路由 store */
  currentRoute: Readable<CurrentRoute>

  /** 路由参数 store */
  params: Readable<RouteParams>

  /** 查询参数 store */
  query: Readable<RouteQuery>

  /** 哈希值 store */
  hash: Readable<string>

  /** 元信息 store */
  meta: Readable<RouteMeta>

  /** 获取当前路由（与其他框架适配器保持一致） */
  getCurrentRoute(): { value?: RouteLocationNormalized }

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
  resolve(to: RouteLocationRaw): CurrentRoute

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

  /** 判断路由是否就绪 */
  isReady(): Promise<void>
}

// ==================== 路由器实现 ====================

/**
 * 路由匹配器
 */
class RouteMatcher {
  private routes: RouteRecordRaw[] = []

  constructor(routes: RouteRecordRaw[]) {
    this.routes = routes
  }

  addRoute(route: RouteRecordRaw): void {
    this.routes.push(route)
  }

  removeRoute(name: string): void {
    this.routes = this.routes.filter(r => r.name !== name)
  }

  hasRoute(name: string): boolean {
    return this.routes.some(r => r.name === name)
  }

  getRoutes(): RouteRecordRaw[] {
    return [...this.routes]
  }

  match(path: string): { route: RouteRecordRaw | null; params: RouteParams } {
    for (const route of this.routes) {
      const params = this.matchRoute(route, path)
      if (params !== null) {
        return { route, params }
      }
    }
    return { route: null, params: {} }
  }

  private matchRoute(route: RouteRecordRaw, path: string): RouteParams | null {
    const pattern = this.pathToRegex(route.path)
    const match = path.match(pattern.regex)

    if (!match) {
      return null
    }

    const params: RouteParams = {}
    pattern.keys.forEach((key, index) => {
      params[key] = match[index + 1]
    })

    return params
  }

  private pathToRegex(path: string): { regex: RegExp; keys: string[] } {
    const keys: string[] = []
    const pattern = path
      .replace(/:(\w+)/g, (_, key) => {
        keys.push(key)
        return '([^/]+)'
      })
      .replace(/\*/g, '(.*)')

    return {
      regex: new RegExp(`^${pattern}$`),
      keys,
    }
  }
}

/**
 * 创建路由器
 * 
 * @param options - 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  const matcher = new RouteMatcher(options.routes)
  const beforeGuards: NavigationGuard[] = []
  const beforeResolveGuards: NavigationGuard[] = []
  const afterHooks: NavigationHookAfter[] = []
  const errorHandlers: Array<(error: Error) => void> = []

  // 事件发射器
  const eventEmitter = options.eventEmitter

  // 创建当前路由 store
  const currentRouteStore: Writable<CurrentRoute> = writable({
    path: '/',
    params: {},
    query: {},
    hash: '',
    meta: {},
    fullPath: '/',
    matched: [],
  })

  // 派生 stores
  const paramsStore = derived(currentRouteStore, $route => $route.params)
  const queryStore = derived(currentRouteStore, $route => $route.query)
  const hashStore = derived(currentRouteStore, $route => $route.hash)
  const metaStore = derived(currentRouteStore, $route => $route.meta)

  // 解析路径为路由信息
  function parseLocation(location: RouteLocationRaw): CurrentRoute {
    let path: string
    let query: RouteQuery = {}
    let hash = ''

    if (typeof location === 'string') {
      const parsed = parseURL(location)
      path = parsed.path
      query = parsed.query  // parseURL 已经返回解析后的 query 对象
      hash = parsed.hash
    } else {
      path = location.path || '/'
      query = location.query || {}
      hash = location.hash || ''
    }

    path = normalizePath(path)
    const { route, params } = matcher.match(path)

    const fullPath = path +
      (Object.keys(query).length ? '?' + stringifyQuery(query) : '') +
      (hash ? '#' + hash : '')

    return {
      path,
      name: route?.name,
      params,
      query,
      hash,
      meta: route?.meta || {},
      fullPath,
      matched: route ? [route] : [],
      component: route?.component,
    }
  }

  // 导航到新位置
  async function navigate(to: RouteLocationRaw, replace = false): Promise<void> {
    const from = get(currentRouteStore)
    const targetRoute = parseLocation(to)

    try {
      // 执行前置守卫
      for (const guard of beforeGuards) {
        const result = await guard(targetRoute as any, from as any, () => { })
        if (result === false || (result && typeof result === 'object')) {
          return
        }
      }

      // 执行解析守卫
      for (const guard of beforeResolveGuards) {
        const result = await guard(targetRoute as any, from as any, () => { })
        if (result === false || (result && typeof result === 'object')) {
          return
        }
      }

      // 更新历史记录
      const location = {
        fullPath: targetRoute.fullPath,
        path: targetRoute.path,
        query: stringifyQuery(targetRoute.query),
        hash: targetRoute.hash,
      }

      if (replace) {
        options.history.replace(location)
      } else {
        options.history.push(location)
      }

      // 更新当前路由
      currentRouteStore.set(targetRoute)

      // 执行后置钩子
      for (const hook of afterHooks) {
        hook(targetRoute as any, from as any)
      }

      // 触发路由导航事件
      if (eventEmitter) {
        setTimeout(() => {
          eventEmitter.emit('router:navigated', {
            to: targetRoute,
            from,
          })
        }, 0)
      }

      // 处理滚动行为
      if (options.scrollBehavior) {
        const scrollPosition = await options.scrollBehavior(
          targetRoute as any,
          from as any,
          null
        )
        if (scrollPosition) {
          window.scrollTo(scrollPosition.left || 0, scrollPosition.top || 0)
        }
      }
    } catch (error) {
      // 调用错误处理器
      for (const handler of errorHandlers) {
        handler(error as Error)
      }
      throw error
    }
  }

  // 监听历史变化
  options.history.listen((to) => {
    const location: RouteLocationRaw = {
      path: to.path,
      query: parseQuery(to.query),
      hash: to.hash,
    }
    const targetRoute = parseLocation(location)
    currentRouteStore.set(targetRoute)
  })

  // 初始化路由
  const initialLocation = options.history.location
  const initialRoute = parseLocation({
    path: initialLocation.path,
    query: parseQuery(initialLocation.query),
    hash: initialLocation.hash,
  })
  currentRouteStore.set(initialRoute)

  // 路由器实例
  const router: Router = {
    currentRoute: currentRouteStore,
    params: paramsStore,
    query: queryStore,
    hash: hashStore,
    meta: metaStore,

    getCurrentRoute() {
      const current = get(currentRouteStore)
      return {
        value: {
          path: current.path,
          fullPath: current.fullPath,
          params: current.params,
          query: current.query,
          hash: current.hash,
          meta: current.meta,
          matched: current.matched as any,
          component: current.component,
        }
      }
    },

    addRoute(parentOrRoute: string | RouteRecordRaw, route?: RouteRecordRaw) {
      if (typeof parentOrRoute === 'string') {
        // TODO: 实现父路由添加
        if (route) {
          matcher.addRoute(route)
        }
      } else {
        matcher.addRoute(parentOrRoute)
      }
      return () => { }
    },

    removeRoute(name: string) {
      matcher.removeRoute(name)
    },

    hasRoute(name: string) {
      return matcher.hasRoute(name)
    },

    getRoutes() {
      return matcher.getRoutes()
    },

    resolve(to: RouteLocationRaw) {
      return parseLocation(to)
    },

    push(to: RouteLocationRaw) {
      return navigate(to, false)
    },

    replace(to: RouteLocationRaw) {
      return navigate(to, true)
    },

    go(delta: number) {
      options.history.go(delta)
    },

    back() {
      options.history.go(-1)
    },

    forward() {
      options.history.go(1)
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

    async isReady() {
      // Svelte 路由器立即就绪
      return Promise.resolve()
    },
  }

  return router
}

// ==================== Context ====================

const ROUTER_KEY = Symbol('router')

/**
 * 设置路由器到 context
 */
export function setRouterContext(router: Router): void {
  // 这个函数应该在 Svelte 组件中调用
  // 实际的 context 设置将在 Router 组件中完成
}

/**
 * 从 context 获取路由器
 */
export function getRouterContext(): Router {
  // 这个函数应该在 Svelte 组件中调用
  // 实际的 context 获取将通过 Svelte 的 getContext 完成
  throw new Error('getRouterContext must be called within a Router component')
}

export { ROUTER_KEY }


