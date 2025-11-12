/**
 * @ldesign/router-core 框架适配器接口
 * 
 * @description
 * 定义框架无关的适配器接口，允许 Core 适配任何前端框架
 * 
 * @module types/framework
 */

import type { RouteLocationNormalized } from './navigation'

// ==================== 组件加载器 ====================

/**
 * 组件加载器 - 框架无关
 * 
 * @description 
 * 各框架实现自己的加载器，Core 只管理加载状态和流程
 * 
 * @template T - 组件类型（框架特定）
 * 
 * @example
 * ```ts
 * // Vue 实现
 * class VueComponentLoader implements ComponentLoader<Component> {
 *   async load() {
 *     const module = await this.loader()
 *     return defineAsyncComponent(() => Promise.resolve(module))
 *   }
 * }
 * 
 * // React 实现
 * class ReactComponentLoader implements ComponentLoader<ComponentType> {
 *   async load() {
 *     return lazy(this.loader)
 *   }
 * }
 * ```
 */
export interface ComponentLoader<T = unknown> {
  /**
   * 加载组件
   * 
   * @returns Promise<组件实例>
   */
  load(): Promise<T>
  
  /**
   * 组件是否已加载
   */
  isLoaded(): boolean
  
  /**
   * 获取已加载的组件
   */
  getComponent(): T | null
  
  /**
   * 预加载组件（可选）
   */
  preload?(): Promise<void>
  
  /**
   * 取消加载（可选）
   */
  cancel?(): void
}

/**
 * 组件加载器工厂
 */
export type ComponentLoaderFactory<T = unknown> = () => ComponentLoader<T>

// ==================== 视图渲染器 ====================

/**
 * 视图渲染器 - 框架无关
 * 
 * @description
 * 框架适配层实现此接口，Core 通过此接口控制视图渲染
 * 
 * @template TContext - 渲染上下文类型（框架特定）
 * 
 * @example
 * ```ts
 * // Vue 实现
 * class VueViewRenderer implements ViewRenderer<App> {
 *   render(route: RouteLocationNormalized) {
 *     // Vue 通过 reactive 系统自动更新
 *   }
 * }
 * 
 * // React 实现
 * class ReactViewRenderer implements ViewRenderer<Root> {
 *   render(route: RouteLocationNormalized, context: Root) {
 *     context.render(createElement(RouterView, { route }))
 *   }
 * }
 * ```
 */
export interface ViewRenderer<TContext = unknown> {
  /**
   * 渲染视图
   * 
   * @param route - 当前路由
   * @param context - 框架特定的渲染上下文
   */
  render(route: RouteLocationNormalized, context?: TContext): void | Promise<void>
  
  /**
   * 销毁视图
   */
  destroy?(): void
  
  /**
   * 视图是否准备就绪
   */
  isReady(): boolean
}

// ==================== SSR 渲染器 ====================

/**
 * SSR 上下文 - 框架无关
 */
export interface SSRContext {
  /** 请求 URL */
  url: string
  
  /** 服务端还是客户端 */
  isServer: boolean
  
  /** 初始状态 */
  state?: Record<string, unknown>
  
  /** HTTP 请求头 */
  headers?: Record<string, string>
  
  /** 自定义数据 */
  [key: string]: unknown
}

/**
 * SSR 渲染器 - 框架无关
 * 
 * @template TApp - 应用实例类型
 * @template TResult - 渲染结果类型
 * 
 * @example
 * ```ts
 * // Vue SSR
 * class VueSSRRenderer implements SSRRenderer<App, string> {
 *   async renderToString(app: App, context: SSRContext) {
 *     return await renderToString(app, context)
 *   }
 * }
 * 
 * // React SSR
 * class ReactSSRRenderer implements SSRRenderer<ReactElement, string> {
 *   async renderToString(app: ReactElement) {
 *     return ReactDOMServer.renderToString(app)
 *   }
 * }
 * ```
 */
export interface SSRRenderer<TApp = unknown, TResult = unknown> {
  /**
   * 服务端渲染为字符串
   */
  renderToString(app: TApp, context: SSRContext): Promise<TResult>
  
  /**
   * 服务端预取数据
   */
  prefetchData?(route: RouteLocationNormalized, context: SSRContext): Promise<void>
  
  /**
   * 客户端激活（hydration）
   */
  hydrate?(app: TApp, context: SSRContext): void
  
  /**
   * 渲染为流（可选，用于流式 SSR）
   */
  renderToStream?(app: TApp, context: SSRContext): ReadableStream
}

// ==================== 错误边界 ====================

/**
 * 错误边界 - 框架无关
 * 
 * @example
 * ```ts
 * // Vue 错误边界
 * class VueErrorBoundary implements ErrorBoundary {
 *   catch(error: Error, route: RouteLocationNormalized) {
 *     app.config.errorHandler?.(error, null, 'router')
 *   }
 * }
 * 
 * // React 错误边界
 * class ReactErrorBoundary implements ErrorBoundary {
 *   catch(error: Error) {
 *     // 通过 ErrorBoundary 组件处理
 *   }
 * }
 * ```
 */
export interface ErrorBoundary {
  /**
   * 捕获错误
   */
  catch(error: Error, route?: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 错误恢复
   */
  recover?(): void | Promise<void>
  
  /**
   * 渲染错误 UI
   */
  renderError?(error: Error): unknown
  
  /**
   * 重置错误状态
   */
  reset?(): void
}

// ==================== 组件生命周期钩子 ====================

/**
 * 组件生命周期钩子 - 框架无关
 * 
 * @template T - 组件实例类型（框架特定）
 */
export interface ComponentLifecycleHooks<T = unknown> {
  /**
   * 组件创建前
   */
  beforeCreate?(route: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件创建后
   * @param instance - 组件实例（框架特定）
   */
  afterCreate?(instance: T, route: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件挂载前
   */
  beforeMount?(instance: T, route: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件挂载后
   */
  afterMount?(instance: T, route: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件更新前
   */
  beforeUpdate?(instance: T, from: RouteLocationNormalized, to: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件更新后
   */
  afterUpdate?(instance: T, from: RouteLocationNormalized, to: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件卸载前
   */
  beforeUnmount?(instance: T, route: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 组件卸载后
   */
  afterUnmount?(route: RouteLocationNormalized): void | Promise<void>
}

// ==================== 框架适配器 ====================

/**
 * 框架适配器接口
 * 
 * @description
 * 各前端框架实现此接口，提供框架特定的功能给 Core
 * 
 * @template TComponent - 组件类型
 * @template TInstance - 组件实例类型
 * 
 * @example
 * ```ts
 * // Vue 3 适配器
 * export const vueAdapter: FrameworkAdapter = {
 *   name: 'vue',
 *   version: '3.x',
 *   
 *   createComponentLoader(loader) {
 *     return new VueComponentLoader(loader)
 *   },
 *   
 *   createViewRenderer() {
 *     return new VueViewRenderer()
 *   }
 * }
 * 
 * // React 适配器
 * export const reactAdapter: FrameworkAdapter = {
 *   name: 'react',
 *   version: '18.x',
 *   
 *   createComponentLoader(loader) {
 *     return new ReactComponentLoader(loader)
 *   }
 * }
 * ```
 */
export interface FrameworkAdapter<TComponent = unknown, TInstance = unknown> {
  /** 框架名称 */
  readonly name: string
  
  /** 框架版本 */
  readonly version: string
  
  /**
   * 创建组件加载器
   */
  createComponentLoader(loader: () => Promise<any>): ComponentLoader<TComponent>
  
  /**
   * 创建视图渲染器（可选）
   */
  createViewRenderer?(): ViewRenderer
  
  /**
   * 创建 SSR 渲染器（可选）
   */
  createSSRRenderer?(): SSRRenderer
  
  /**
   * 创建错误边界（可选）
   */
  createErrorBoundary?(): ErrorBoundary
  
  /**
   * 获取组件实例（可选）
   */
  getComponentInstance?(component: TComponent): TInstance | null
  
  /**
   * 组件是否已挂载（可选）
   */
  isComponentMounted?(instance: TInstance): boolean
  
  /**
   * 克隆/复制组件（可选，用于某些优化场景）
   */
  cloneComponent?(component: TComponent): TComponent
}

// ==================== 适配器注册与管理 ====================

/**
 * 全局适配器注册表
 */
const adapters = new Map<string, FrameworkAdapter>()

/**
 * 当前活动的适配器
 */
let currentAdapter: FrameworkAdapter | null = null

/**
 * 注册框架适配器
 * 
 * @param adapter - 框架适配器实例
 * 
 * @example
 * ```ts
 * import { vueAdapter } from '@ldesign/router-vue'
 * 
 * registerFrameworkAdapter(vueAdapter)
 * ```
 */
export function registerFrameworkAdapter(adapter: FrameworkAdapter): void {
  adapters.set(adapter.name, adapter)
  
  // 如果还没有当前适配器，自动设置为当前
  if (!currentAdapter) {
    currentAdapter = adapter
  }
}

/**
 * 获取框架适配器
 * 
 * @param name - 框架名称（可选，不提供则返回当前适配器）
 * @returns 框架适配器实例或 null
 * 
 * @example
 * ```ts
 * const adapter = getFrameworkAdapter('vue')
 * const currentAdapter = getFrameworkAdapter()
 * ```
 */
export function getFrameworkAdapter(name?: string): FrameworkAdapter | null {
  if (name) {
    return adapters.get(name) || null
  }
  return currentAdapter
}

/**
 * 设置当前框架适配器
 * 
 * @param name - 框架名称
 * 
 * @example
 * ```ts
 * setCurrentFrameworkAdapter('vue')
 * ```
 */
export function setCurrentFrameworkAdapter(name: string): void {
  const adapter = adapters.get(name)
  if (adapter) {
    currentAdapter = adapter
  } else {
    throw new Error(`Framework adapter "${name}" not found`)
  }
}

/**
 * 获取所有已注册的框架适配器
 * 
 * @returns 框架适配器列表
 */
export function getAllFrameworkAdapters(): FrameworkAdapter[] {
  return Array.from(adapters.values())
}

/**
 * 自动检测框架
 * 
 * @description
 * 通过全局对象检测当前使用的框架
 * 
 * @returns 框架名称或 null
 * 
 * @example
 * ```ts
 * const framework = detectFramework()
 * // 可能返回: 'vue', 'react', 'angular', 'svelte' 等
 * ```
 */
export function detectFramework(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const win = window as any
  
  // 检测 Vue
  if (win.Vue || win.__VUE__) {
    return 'vue'
  }
  
  // 检测 React
  if (win.React || win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    return 'react'
  }
  
  // 检测 Angular
  if (win.ng || win.getAllAngularRootElements) {
    return 'angular'
  }
  
  // 检测 Svelte
  if (win.__SVELTE_DEVTOOLS_GLOBAL_HOOK__) {
    return 'svelte'
  }
  
  // 检测 Solid
  if (win._$HY) {
    return 'solid'
  }
  
  return null
}

/**
 * 检测并自动设置框架适配器
 * 
 * @returns 是否成功设置
 */
export function autoDetectAndSetAdapter(): boolean {
  const framework = detectFramework()
  if (framework && adapters.has(framework)) {
    setCurrentFrameworkAdapter(framework)
    return true
  }
  return false
}
