/**
 * @ldesign/router-vue 类型定义
 * 
 * 统一管理所有类型定义，包括从Core重新导出的类型和Vue特定类型
 * 
 * @module types
 */

import type { App, Ref } from 'vue'
import type { RouterHistory, NavigationFailure } from 'vue-router'

// ==================== 从 Core 重新导出类型 ====================

export type {
  // 基础类型
  RouteParams,
  RouteQuery,
  RouteMeta,
  // 路由位置类型
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteLocationBase,
  // 路由记录类型
  RouteRecordRaw,
  RouteRecordNormalized,
  RouteRecordBase,
  // 导航守卫类型
  NavigationGuard,
  NavigationGuardNext,
  NavigationFailure,
  NavigationHookAfter,
  // 历史管理类型
  HistoryLocation,
  HistoryState,
  RouterHistory,
  // 滚动行为类型
  ScrollBehavior,
  ScrollPosition,
} from '@ldesign/router-core'

export {
  NavigationFailureType,
  NavigationType,
} from '@ldesign/router-core'

// ==================== Vue 特定类型 ====================

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
  routes: import('@ldesign/router-core').RouteRecordRaw[]

  /** 历史管理器 */
  history: RouterHistory

  /** 事件发射器（可选） */
  eventEmitter?: EventEmitter

  /** 滚动行为 */
  scrollBehavior?: import('@ldesign/router-core').ScrollBehavior

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
  value?: import('@ldesign/router-core').RouteLocationNormalized
}

/**
 * 增强的路由器接口
 */
export interface Router {
  /** 当前路由 */
  currentRoute: Ref<import('@ldesign/router-core').RouteLocationNormalized>

  /** 获取当前路由（兼容性方法） */
  getCurrentRoute(): CurrentRoute

  /** 添加路由 */
  addRoute(route: import('@ldesign/router-core').RouteRecordRaw): () => void
  addRoute(parentName: string, route: import('@ldesign/router-core').RouteRecordRaw): () => void

  /** 移除路由 */
  removeRoute(name: string): void

  /** 检查路由是否存在 */
  hasRoute(name: string): boolean

  /** 获取所有路由 */
  getRoutes(): import('@ldesign/router-core').RouteRecordRaw[]

  /** 解析路由位置 */
  resolve(to: import('@ldesign/router-core').RouteLocationRaw): import('@ldesign/router-core').RouteLocationNormalized

  /** 导航到新位置 */
  push(to: import('@ldesign/router-core').RouteLocationRaw): Promise<void | NavigationFailure>

  /** 替换当前位置 */
  replace(to: import('@ldesign/router-core').RouteLocationRaw): Promise<void | NavigationFailure>

  /** 前进或后退 */
  go(delta: number): void

  /** 后退 */
  back(): void

  /** 前进 */
  forward(): void

  /** 全局前置守卫 */
  beforeEach(guard: import('@ldesign/router-core').NavigationGuard): () => void

  /** 全局解析守卫 */
  beforeResolve(guard: import('@ldesign/router-core').NavigationGuard): () => void

  /** 全局后置钩子 */
  afterEach(hook: import('@ldesign/router-core').NavigationHookAfter): () => void

  /** 错误处理器 */
  onError(handler: (error: Error) => void): () => void

  /** 判断路由是否就绪 */
  isReady(): Promise<void>

  /** 安装到 Vue 应用 */
  install(app: App): void

  /** 底层的 vue-router 实例 */
  vueRouter: import('vue-router').Router
}

// ==================== Composables 返回类型 ====================

/**
 * useRoute 返回类型
 */
export type UseRouteReturn = ReturnType<typeof import('vue-router').useRoute>

/**
 * useRouter 返回类型
 */
export type UseRouterReturn = Router

// ==================== 组件 Props 类型 ====================

/**
 * RouterView 组件 Props
 */
export interface RouterViewProps {
  /** 视图名称 */
  name?: string

  /** 路由配置 */
  route?: import('@ldesign/router-core').RouteLocationNormalized

  /** Suspense 配置 */
  suspense?: {
    /** 加载时显示的内容 */
    fallback?: any
    /** 超时时间（毫秒） */
    timeout?: number
  }

  /** 错误边界配置 */
  errorBoundary?: {
    /** 错误时显示的内容 */
    fallback?: any | ((error: Error) => any)
    /** 错误处理函数 */
    onError?: (error: Error) => void
  }

  /** 过渡动画名称 */
  transition?: string | {
    name?: string
    mode?: 'in-out' | 'out-in' | 'default'
    appear?: boolean
    duration?: number | { enter: number; leave: number }
  }
}

/**
 * RouterLink 组件 Props
 */
export interface RouterLinkProps {
  /** 目标路由 */
  to: import('@ldesign/router-core').RouteLocationRaw | string

  /** 是否替换历史记录 */
  replace?: boolean

  /** 活跃链接类名 */
  activeClass?: string

  /** 精确活跃链接类名 */
  exactActiveClass?: string

  /** 自定义类名 */
  custom?: boolean

  /** aria-current 属性值 */
  ariaCurrentValue?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
}

// ==================== 重新导出组件类型 ====================

export type {
  RouterTab,
  RouterTabsProps,
  RouterTabsEmits,
} from '../components/RouterTabs.vue'

export type {
  BreadcrumbItem,
  RouterBreadcrumbProps,
  RouterBreadcrumbEmits,
} from '../components/RouterBreadcrumb.vue'

// ==================== 类型工具 ====================

/**
 * 从路径提取参数类型
 * 
 * @example
 * ```ts
 * type Params = ExtractParams<'/users/:id/posts/:postId'>
 * // { id: string; postId: string }
 * ```
 */
export type ExtractParams<Path extends string> =
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : Path extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {}

/**
 * 类型安全的路由定义
 * 
 * @template Path - 路径字符串
 * @template Meta - 元信息类型
 */
export type TypedRoute<
  Path extends string = string,
  Meta extends import('@ldesign/router-core').RouteMeta = import('@ldesign/router-core').RouteMeta
> = {
  path: Path
  params: ExtractParams<Path>
  query: import('@ldesign/router-core').RouteQuery
  meta: Meta
}
