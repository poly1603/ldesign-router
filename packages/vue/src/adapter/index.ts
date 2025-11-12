/**
 * @ldesign/router-vue 框架适配器
 * 
 * @description
 * Vue 3 框架的路由适配器实现
 * 
 * @module adapter
 */

import { defineAsyncComponent, getCurrentInstance, type Component, type App } from 'vue'
import type {
  FrameworkAdapter,
  ComponentLoader,
  ViewRenderer,
  SSRRenderer,
  ErrorBoundary,
  SSRContext,
  RouteLocationNormalized,
} from '@ldesign/router-core'

// ==================== Vue 组件加载器 ====================

/**
 * Vue 组件加载器实现
 */
export class VueComponentLoader implements ComponentLoader<Component> {
  private loader: () => Promise<any>
  private component: Component | null = null
  private loading = false
  private error: Error | null = null
  
  constructor(loader: () => Promise<any>) {
    this.loader = loader
  }
  
  async load(): Promise<Component> {
    if (this.component) {
      return this.component
    }
    
    if (this.loading) {
      // 等待加载完成
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this.component) {
            clearInterval(checkInterval)
            resolve(this.component)
          } else if (this.error) {
            clearInterval(checkInterval)
            reject(this.error)
          }
        }, 50)
      })
    }
    
    try {
      this.loading = true
      const module = await this.loader()
      
      // 支持多种模块格式
      const componentDef = module.default || module
      
      // 如果已经是异步组件，直接使用
      if (typeof componentDef === 'function' || componentDef.__asyncLoader) {
        this.component = componentDef
      } else {
        // 包装为异步组件
        this.component = defineAsyncComponent(() => Promise.resolve(componentDef))
      }
      
      return this.component
    } catch (err) {
      this.error = err as Error
      throw err
    } finally {
      this.loading = false
    }
  }
  
  isLoaded(): boolean {
    return this.component !== null
  }
  
  getComponent(): Component | null {
    return this.component
  }
  
  async preload(): Promise<void> {
    if (!this.component && !this.loading) {
      await this.load()
    }
  }
  
  cancel(): void {
    // Vue 不支持取消组件加载
    // 但我们可以清理状态
    if (!this.component) {
      this.loading = false
    }
  }
}

// ==================== Vue 视图渲染器 ====================

/**
 * Vue 视图渲染器实现
 */
export class VueViewRenderer implements ViewRenderer<App> {
  private app: App | null = null
  
  constructor(app?: App) {
    this.app = app || null
  }
  
  render(route: RouteLocationNormalized, context?: App): void {
    // Vue 通过 reactive 系统自动更新视图
    // 这里不需要手动渲染
    // 只需要确保 currentRoute 是响应式的即可
    
    if (context) {
      this.app = context
    }
  }
  
  destroy(): void {
    this.app = null
  }
  
  isReady(): boolean {
    return this.app !== null
  }
  
  setApp(app: App): void {
    this.app = app
  }
}

// ==================== Vue SSR 渲染器 ====================

/**
 * Vue SSR 渲染器实现
 */
export class VueSSRRenderer implements SSRRenderer<App, string> {
  async renderToString(app: App, context: SSRContext): Promise<string> {
    // 动态导入 vue/server-renderer 以避免客户端打包
    if (typeof window !== 'undefined') {
      throw new Error('SSR renderToString should only be called on the server')
    }
    
    try {
      const { renderToString } = await import('vue/server-renderer')
      return await renderToString(app, context)
    } catch (err) {
      throw new Error(`Failed to render Vue app to string: ${(err as Error).message}`)
    }
  }
  
  async prefetchData(route: RouteLocationNormalized, context: SSRContext): Promise<void> {
    // 预取组件需要的数据
    const components = route.matched.map(r => r.components?.default).filter(Boolean)
    
    for (const component of components) {
      // 检查组件是否有 serverPrefetch 方法
      if (component && typeof component === 'object' && 'serverPrefetch' in component) {
        await (component as any).serverPrefetch(context)
      }
    }
  }
  
  hydrate(app: App, context: SSRContext): void {
    // 客户端激活
    const container = context.container || '#app'
    if (typeof container === 'string') {
      app.mount(container)
    } else {
      app.mount(container as Element)
    }
  }
}

// ==================== Vue 错误边界 ====================

/**
 * Vue 错误边界实现
 */
export class VueErrorBoundary implements ErrorBoundary {
  private app: App | null = null
  private errorHandler?: (error: Error) => void
  
  constructor(app?: App, errorHandler?: (error: Error) => void) {
    this.app = app || null
    this.errorHandler = errorHandler
  }
  
  catch(error: Error, route?: RouteLocationNormalized): void {
    // 调用自定义错误处理器
    if (this.errorHandler) {
      this.errorHandler(error)
    }
    
    // 调用 Vue 的全局错误处理器
    if (this.app && this.app.config.errorHandler) {
      this.app.config.errorHandler(error, null, 'router')
    } else {
      // 默认处理：输出到控制台
      console.error('[Router Error]', error, route)
    }
  }
  
  recover(): void {
    // Vue 的错误恢复通常由框架自动处理
  }
  
  renderError(error: Error): Component {
    // 返回一个简单的错误组件
    return defineAsyncComponent({
      loader: () => Promise.resolve({
        template: `
          <div class="router-error">
            <h2>路由错误</h2>
            <pre>{{ error.message }}</pre>
          </div>
        `,
        props: ['error'],
      }),
    })
  }
  
  reset(): void {
    // 重置错误状态
    this.errorHandler = undefined
  }
  
  setApp(app: App): void {
    this.app = app
  }
  
  setErrorHandler(handler: (error: Error) => void): void {
    this.errorHandler = handler
  }
}

// ==================== Vue 适配器 ====================

/**
 * Vue 3 框架适配器
 */
export const vueAdapter: FrameworkAdapter<Component> = {
  name: 'vue',
  version: '3.x',
  
  createComponentLoader(loader: () => Promise<any>): ComponentLoader<Component> {
    return new VueComponentLoader(loader)
  },
  
  createViewRenderer(): ViewRenderer {
    return new VueViewRenderer()
  },
  
  createSSRRenderer(): SSRRenderer {
    return new VueSSRRenderer()
  },
  
  createErrorBoundary(): ErrorBoundary {
    return new VueErrorBoundary()
  },
  
  getComponentInstance(component: Component): any {
    // 在 setup 或组件内部调用时获取当前实例
    return getCurrentInstance()
  },
  
  isComponentMounted(instance: any): boolean {
    return instance?.isMounted === true
  },
}

// ==================== 导出 ====================

export default vueAdapter
