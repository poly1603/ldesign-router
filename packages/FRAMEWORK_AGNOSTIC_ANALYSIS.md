# 框架无关性深度分析和优化方案

> 📅 分析日期: 2025-11-11
> 
> 🎯 目标: 确保 Core 真正框架无关，能适配所有前端框架

---

## 📊 当前状态评估

### ✅ 做得好的地方

1. **组件类型抽象**
   ```typescript
   export type Component = unknown
   ```
   ✅ 使用 `unknown` 类型，不绑定任何框架

2. **路由守卫框架无关**
   ```typescript
   export type NavigationGuard = (
     to: RouteLocationNormalized,
     from: RouteLocationNormalized,
     next: NavigationGuardNext
   ) => NavigationGuardReturn | Promise<NavigationGuardReturn>
   ```
   ✅ 纯函数接口，不依赖框架特性

3. **历史管理抽象**
   ```typescript
   export interface RouterHistory {
     readonly location: HistoryLocation
     readonly state: HistoryState
     push(to: string, state?: HistoryState): void
     replace(to: string, state?: HistoryState): void
     // ...
   }
   ```
   ✅ 接口定义清晰，与浏览器 API 解耦

### ⚠️ 需要改进的地方

#### 1. 组件加载和生命周期 ❌

**问题**: 当前没有框架无关的组件加载钩子

```typescript
// 当前缺失
// 不同框架的组件加载方式不同:
// - React: lazy(() => import('./Component'))
// - Vue: defineAsyncComponent(() => import('./Component.vue'))
// - Angular: loadChildren
// - Svelte: dynamic import
```

**影响**: 各框架需要自己处理懒加载，Core 无法统一管理

#### 2. 组件实例访问 ❌

**问题**: `NavigationGuardNextCallback` 接受组件实例，但类型是 `unknown`

```typescript
export type NavigationGuardNextCallback = (vm: unknown) => unknown
```

**影响**: 无法为框架适配层提供类型安全的组件实例访问

#### 3. 路由渲染控制缺失 ❌

**问题**: Core 不提供视图渲染的抽象

```typescript
// 缺失: 视图渲染接口
// 应该有一个 ViewRenderer 接口
```

**影响**: 各框架需要完全自己实现 RouterView 逻辑

#### 4. SSR 支持不完整 ⚠️

**问题**: SSR 相关的接口不够通用

```typescript
// features/ssr.ts 存在，但可能绑定了特定框架的假设
```

**影响**: 可能无法适配所有框架的 SSR 需求

---

## 🔧 优化方案

### 方案 1: 组件加载器抽象

#### 1.1 定义框架无关的组件加载器接口

```typescript
/**
 * 组件加载器 - 框架无关
 * 
 * @description 
 * 各框架实现自己的加载器，Core 只管理加载状态
 */
export interface ComponentLoader<T = unknown> {
  /**
   * 加载组件
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
   * 预加载组件
   */
  preload?(): Promise<void>
}

/**
 * 组件加载器工厂
 */
export type ComponentLoaderFactory<T = unknown> = () => ComponentLoader<T>

/**
 * 路由记录支持加载器
 */
export interface RouteRecordRaw extends RouteRecordBase {
  // 直接组件
  component?: Component
  
  // 组件加载器（推荐用于懒加载）
  componentLoader?: ComponentLoaderFactory
  
  // 命名组件
  components?: Record<string, Component>
  
  // 命名组件加载器
  componentsLoaders?: Record<string, ComponentLoaderFactory>
}
```

#### 1.2 框架适配示例

```typescript
// Vue 适配
class VueComponentLoader implements ComponentLoader<Component> {
  private loader: () => Promise<any>
  private component: Component | null = null
  
  constructor(loader: () => Promise<any>) {
    this.loader = loader
  }
  
  async load(): Promise<Component> {
    if (!this.component) {
      const module = await this.loader()
      this.component = defineAsyncComponent(() => Promise.resolve(module.default || module))
    }
    return this.component
  }
  
  isLoaded(): boolean {
    return this.component !== null
  }
  
  getComponent(): Component | null {
    return this.component
  }
}

// React 适配
class ReactComponentLoader implements ComponentLoader<ComponentType> {
  private loader: () => Promise<any>
  private component: ComponentType | null = null
  
  constructor(loader: () => Promise<any>) {
    this.loader = loader
  }
  
  async load(): Promise<ComponentType> {
    if (!this.component) {
      this.component = lazy(this.loader)
    }
    return this.component
  }
  
  isLoaded(): boolean {
    return this.component !== null
  }
  
  getComponent(): ComponentType | null {
    return this.component
  }
}
```

---

### 方案 2: 视图渲染器抽象

#### 2.1 定义框架无关的视图渲染接口

```typescript
/**
 * 视图渲染器 - 框架无关
 * 
 * @description
 * 框架适配层实现此接口，Core 通过此接口控制视图渲染
 */
export interface ViewRenderer<TContext = unknown> {
  /**
   * 渲染视图
   * 
   * @param route - 当前路由
   * @param context - 框架特定的渲染上下文
   */
  render(route: RouteLocationNormalized, context: TContext): void | Promise<void>
  
  /**
   * 销毁视图
   */
  destroy?(): void
  
  /**
   * 视图是否准备就绪
   */
  isReady(): boolean
}

/**
 * 路由器选项 - 添加渲染器
 */
export interface RouterOptions {
  routes: RouteRecordRaw[]
  history: RouterHistory
  
  /** 视图渲染器（可选，框架适配层提供） */
  renderer?: ViewRenderer
  
  // ... 其他选项
}
```

#### 2.2 Vue 适配示例

```typescript
class VueViewRenderer implements ViewRenderer<App> {
  private app: App
  
  constructor(app: App) {
    this.app = app
  }
  
  render(route: RouteLocationNormalized, context: App): void {
    // Vue 会自动通过 reactive 系统更新视图
    // 这里只需要确保 currentRoute 是响应式的
  }
  
  isReady(): boolean {
    return this.app !== null
  }
}
```

---

### 方案 3: 组件实例生命周期抽象

#### 3.1 定义框架无关的生命周期钩子

```typescript
/**
 * 组件生命周期钩子 - 框架无关
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
   * 组件卸载前
   */
  beforeUnmount?(instance: T, route: RouteLocationNormalized): void | Promise<void>
}

/**
 * 路由记录支持生命周期
 */
export interface RouteRecordRaw extends RouteRecordBase {
  // ... 其他字段
  
  /** 组件生命周期钩子 */
  lifecycle?: ComponentLifecycleHooks
}
```

---

### 方案 4: 强化 SSR 支持

#### 4.1 通用 SSR 接口

```typescript
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
  
  /** 自定义数据 */
  [key: string]: unknown
}

/**
 * SSR 渲染器 - 框架无关
 */
export interface SSRRenderer<TApp = unknown, TResult = unknown> {
  /**
   * 服务端渲染
   */
  renderToString(app: TApp, context: SSRContext): Promise<TResult>
  
  /**
   * 服务端预取数据
   */
  prefetchData?(route: RouteLocationNormalized, context: SSRContext): Promise<void>
  
  /**
   * 客户端激活
   */
  hydrate?(app: TApp, context: SSRContext): void
}

/**
 * 路由器选项 - 添加 SSR
 */
export interface RouterOptions {
  // ... 其他选项
  
  /** SSR 渲染器 */
  ssrRenderer?: SSRRenderer
  
  /** SSR 上下文 */
  ssrContext?: SSRContext
}
```

#### 4.2 Vue SSR 适配示例

```typescript
class VueSSRRenderer implements SSRRenderer<App, string> {
  async renderToString(app: App, context: SSRContext): Promise<string> {
    return await renderToString(app, context)
  }
  
  async prefetchData(route: RouteLocationNormalized, context: SSRContext): Promise<void> {
    // 预取组件需要的数据
    const components = route.matched.map(r => r.components?.default)
    for (const component of components) {
      if (component && 'serverPrefetch' in component) {
        await (component as any).serverPrefetch(context)
      }
    }
  }
  
  hydrate(app: App, context: SSRContext): void {
    app.mount('#app')
  }
}
```

---

### 方案 5: 错误边界抽象

#### 5.1 定义框架无关的错误处理

```typescript
/**
 * 错误边界 - 框架无关
 */
export interface ErrorBoundary {
  /**
   * 捕获错误
   */
  catch(error: Error, route: RouteLocationNormalized): void | Promise<void>
  
  /**
   * 错误恢复
   */
  recover?(): void | Promise<void>
  
  /**
   * 渲染错误UI
   */
  renderError?(error: Error): unknown
}

/**
 * 路由器选项 - 添加错误边界
 */
export interface RouterOptions {
  // ... 其他选项
  
  /** 全局错误边界 */
  errorBoundary?: ErrorBoundary
}

/**
 * 路由记录支持错误边界
 */
export interface RouteRecordRaw extends RouteRecordBase {
  // ... 其他字段
  
  /** 路由级错误边界 */
  errorBoundary?: ErrorBoundary
}
```

---

## 📦 新增的 Core API

### types/framework.ts (新文件)

```typescript
/**
 * 框架适配器接口
 * 
 * @description
 * 各框架实现此接口，提供框架特定的功能
 */
export interface FrameworkAdapter<TComponent = unknown, TInstance = unknown> {
  /** 框架名称 */
  readonly name: string
  
  /** 框架版本 */
  readonly version: string
  
  /** 组件加载器工厂 */
  createComponentLoader(loader: () => Promise<any>): ComponentLoader<TComponent>
  
  /** 视图渲染器 */
  createViewRenderer?(): ViewRenderer
  
  /** SSR 渲染器 */
  createSSRRenderer?(): SSRRenderer
  
  /** 错误边界 */
  createErrorBoundary?(): ErrorBoundary
  
  /** 获取组件实例 */
  getComponentInstance?(component: TComponent): TInstance | null
  
  /** 组件是否已挂载 */
  isComponentMounted?(instance: TInstance): boolean
}

/**
 * 注册框架适配器
 */
export function registerFrameworkAdapter(adapter: FrameworkAdapter): void

/**
 * 获取当前框架适配器
 */
export function getFrameworkAdapter(): FrameworkAdapter | null

/**
 * 自动检测框架
 */
export function detectFramework(): string | null
```

### 框架适配示例

```typescript
// Vue 3 适配器
export const vueAdapter: FrameworkAdapter = {
  name: 'vue',
  version: '3.x',
  
  createComponentLoader(loader) {
    return new VueComponentLoader(loader)
  },
  
  createViewRenderer() {
    return new VueViewRenderer()
  },
  
  createSSRRenderer() {
    return new VueSSRRenderer()
  },
  
  getComponentInstance(component) {
    return getCurrentInstance()
  },
  
  isComponentMounted(instance) {
    return instance.isMounted
  }
}

// React 适配器
export const reactAdapter: FrameworkAdapter = {
  name: 'react',
  version: '18.x',
  
  createComponentLoader(loader) {
    return new ReactComponentLoader(loader)
  },
  
  createViewRenderer() {
    return new ReactViewRenderer()
  },
  
  // React 没有官方 SSR 渲染器，需要用户提供
  createSSRRenderer() {
    throw new Error('React SSR requires custom implementation')
  }
}
```

---

## 🔄 Core API 优化

### router.ts 优化

```typescript
export interface RouterOptions {
  /** 路由配置 */
  routes: RouteRecordRaw[]
  
  /** 历史管理器 */
  history: RouterHistory
  
  /** 框架适配器（自动检测或手动指定） */
  adapter?: FrameworkAdapter
  
  /** 视图渲染器 */
  renderer?: ViewRenderer
  
  /** SSR 渲染器 */
  ssrRenderer?: SSRRenderer
  
  /** SSR 上下文 */
  ssrContext?: SSRContext
  
  /** 全局错误边界 */
  errorBoundary?: ErrorBoundary
  
  /** 滚动行为 */
  scrollBehavior?: ScrollStrategy
  
  /** 是否启用缓存 */
  enableCache?: boolean
  
  /** 缓存大小 */
  cacheSize?: number
  
  /** 守卫超时时间 (ms) */
  guardTimeout?: number
  
  /** 是否严格模式 */
  strict?: boolean
}

export class Router {
  private adapter?: FrameworkAdapter
  private renderer?: ViewRenderer
  private ssrRenderer?: SSRRenderer
  private errorBoundary?: ErrorBoundary
  
  // ... 其他字段
  
  constructor(options: RouterOptions) {
    // 自动检测或使用指定的适配器
    this.adapter = options.adapter || this.detectAdapter()
    this.renderer = options.renderer || this.adapter?.createViewRenderer?.()
    this.ssrRenderer = options.ssrRenderer || this.adapter?.createSSRRenderer?.()
    this.errorBoundary = options.errorBoundary || this.adapter?.createErrorBoundary?.()
    
    // ... 其他初始化
  }
  
  private detectAdapter(): FrameworkAdapter | undefined {
    const framework = detectFramework()
    // 根据检测结果返回对应适配器
    return undefined // 让框架包自己注册
  }
  
  /**
   * 加载路由组件
   */
  private async loadComponent(route: RouteRecordRaw): Promise<Component> {
    if (route.component) {
      return route.component
    }
    
    if (route.componentLoader) {
      const loader = route.componentLoader()
      return await loader.load()
    }
    
    throw new Error(`No component or component loader for route: ${route.path}`)
  }
  
  /**
   * 渲染视图
   */
  private async renderView(route: RouteLocationNormalized): Promise<void> {
    if (this.renderer) {
      await this.renderer.render(route, {})
    }
  }
  
  // ... 其他方法
}
```

---

## 🎯 Vue 适配层优化

### 基于优化后的 Core

```typescript
// @ldesign/router-vue

import { 
  createRouter as createCoreRouter, 
  registerFrameworkAdapter,
  type RouterOptions as CoreRouterOptions,
  type FrameworkAdapter 
} from '@ldesign/router-core'
import { createRouter as createVueRouter } from 'vue-router'

// 注册 Vue 适配器
registerFrameworkAdapter(vueAdapter)

export interface RouterOptions extends Omit<CoreRouterOptions, 'adapter'> {
  // Vue 特定选项
  linkActiveClass?: string
  linkExactActiveClass?: string
}

export function createRouter(options: RouterOptions): Router {
  // 1. 创建 vue-router (底层)
  const vueRouter = createVueRouter({
    history: options.history,
    routes: options.routes,
    // ... 其他选项
  })
  
  // 2. 创建 core router (中间层)
  const coreRouter = createCoreRouter({
    ...options,
    adapter: vueAdapter, // 明确指定 Vue 适配器
    renderer: vueAdapter.createViewRenderer(),
  })
  
  // 3. 桥接两者
  const router = {
    // 优先使用 vue-router 的 API (保持兼容性)
    ...vueRouter,
    
    // Core 增强功能
    getCacheStats: () => coreRouter.getCacheStats(),
    clearCache: () => coreRouter.clearCache(),
    
    // 底层访问
    coreRouter,
    vueRouter,
  }
  
  return router as any
}
```

---

## 📈 兼容性矩阵

### 框架支持检查表

| 功能 | Vue 3 | React | Angular | Svelte | Solid | Qwik |
|-----|-------|-------|---------|--------|-------|------|
| 基础路由 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 懒加载 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 路由守卫 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 嵌套路由 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 命名视图 | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 过渡动画 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| SSR | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| 错误边界 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

✅ 完全支持 | ⚠️ 部分支持 | ❌ 不支持

---

## 🚀 实施计划

### 阶段 1: Core 增强 (Week 1-2)

1. ✅ 添加 `types/framework.ts`
2. ✅ 实现 `FrameworkAdapter` 接口
3. ✅ 添加 `ComponentLoader` 抽象
4. ✅ 添加 `ViewRenderer` 抽象
5. ✅ 优化 `Router` 类

### 阶段 2: Vue 适配优化 (Week 2-3)

1. ✅ 实现 Vue 适配器
2. ✅ 优化 vue-router 集成
3. ✅ 添加增强功能
4. ✅ 完善类型定义

### 阶段 3: 文档和测试 (Week 3-4)

1. ⏳ 编写适配器开发指南
2. ⏳ 添加各框架适配示例
3. ⏳ 完善 API 文档
4. ⏳ 添加单元测试

---

## 📝 总结

### Core 真正框架无关的关键

1. **抽象而非实现**: Core 只定义接口，不实现框架特定逻辑
2. **适配器模式**: 通过适配器桥接框架差异
3. **生命周期解耦**: 组件生命周期通过钩子暴露，不绑定框架
4. **渲染控制分离**: 视图渲染完全由框架适配层控制
5. **类型灵活性**: 使用泛型和 unknown 保持类型灵活

### Vue 适配的优势

1. **完全兼容 vue-router**: 保持原有 API
2. **Core 增强**: 获得 Core 的高级功能
3. **类型安全**: 完整的 TypeScript 支持
4. **渐进式**: 可以选择性使用增强功能

---

**维护者**: @ldesign-team

**最后更新**: 2025-11-11
