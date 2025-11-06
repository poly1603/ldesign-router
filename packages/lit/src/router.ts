/**
 * @ldesign/router-lit 路由器实现
 *
 * 基于 Lit 的增强路由器
 *
 * @module router
 */

import type {
  RouteLocationNormalized,
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
  mode?: 'history' | 'hash'

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

  /** 历史管理器 */
  history?: RouterHistory
}

// ==================== 路由器实现 ====================

/**
 * 创建增强的路由器
 *
 * @param options - 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): Router {
  const beforeGuards: NavigationGuard[] = []
  const beforeResolveGuards: NavigationGuard[] = []
  const afterHooks: NavigationHookAfter[] = []
  const errorHandlers: Array<(error: Error) => void> = []

  // 事件发射器
  const eventEmitter = options.eventEmitter

  // 当前路由状态
  let currentRouteValue: RouteLocationNormalized | undefined

  // 触发路由导航事件
  const emitNavigated = () => {
    if (eventEmitter) {
      const route = router.getCurrentRoute()
      eventEmitter.emit('router:navigated', {
        to: route.value,
        from: currentRouteValue,
      })
      currentRouteValue = route.value
    }
  }

  // 创建路由器实例
  const router: Router = {
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
          matched: matchedRoute ? [matchedRoute] : [],
        }
      }
    },

    async push(to: RouteLocationRaw) {
      const path = typeof to === 'string' ? to : to.path || '/'

      try {
        // TODO: 执行导航守卫

        // 根据模式进行导航
        const mode = options.mode || 'hash'
        if (mode === 'hash') {
          window.location.hash = path
        } else if (options.history) {
          options.history.push({ path, fullPath: path, query: '', hash: '' }, {})
        } else {
          window.history.pushState({}, '', path)
        }

        // 延迟触发事件，等待导航完成
        setTimeout(emitNavigated, 0)
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

        // 根据模式进行导航
        const mode = options.mode || 'hash'
        if (mode === 'hash') {
          window.location.replace('#' + path)
        } else if (options.history) {
          options.history.replace({ path, fullPath: path, query: '', hash: '' }, {})
        } else {
          window.history.replaceState({}, '', path)
        }

        // 延迟触发事件，等待导航完成
        setTimeout(emitNavigated, 0)
      } catch (error) {
        for (const handler of errorHandlers) {
          handler(error as Error)
        }
        throw error
      }
    },

    go(delta: number) {
      window.history.go(delta)
      setTimeout(emitNavigated, 0)
    },

    back() {
      window.history.back()
      setTimeout(emitNavigated, 0)
    },

    forward() {
      window.history.forward()
      setTimeout(emitNavigated, 0)
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

  return router
}
