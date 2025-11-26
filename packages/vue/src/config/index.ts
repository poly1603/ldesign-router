/**
 * @ldesign/router-vue 配置管理
 * 
 * 提供 Vue 3 Provide/Inject API 的路由配置传递机制
 * 
 * @module config
 */

import { inject, provide, reactive, readonly, type App, type InjectionKey } from 'vue'
import type { Router } from '../router'

// ==================== 类型定义 ====================

/**
 * 路由全局配置
 */
export interface RouterConfig {
  /** 路由器实例 */
  router?: Router
  
  /** 过渡动画配置 */
  transition?: {
    /** 默认过渡类型 */
    type?: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'flip' | 'scale'
    /** 过渡持续时间（毫秒） */
    duration?: number
    /** 是否启用过渡 */
    enabled?: boolean
  }
  
  /** 权限配置 */
  permissions?: {
    /** 用户权限列表 */
    userPermissions?: string[]
    /** 权限检查模式 */
    mode?: 'some' | 'every'
    /** 未授权时的重定向路径 */
    unauthorizedRedirect?: string
  }
  
  /** 缓存配置 */
  cache?: {
    /** 是否启用缓存 */
    enabled?: boolean
    /** 默认 TTL（毫秒） */
    defaultTTL?: number
    /** 最大缓存数量 */
    maxSize?: number
  }
  
  /** 预取配置 */
  prefetch?: {
    /** 是否启用预取 */
    enabled?: boolean
    /** 预取延迟（毫秒） */
    delay?: number
    /** 是否在悬停时预取 */
    onHover?: boolean
    /** 是否在可见时预取 */
    onVisible?: boolean
  }
  
  /** 滚动行为配置 */
  scroll?: {
    /** 滚动行为类型 */
    behavior?: 'auto' | 'smooth'
    /** 是否保存滚动位置 */
    savePosition?: boolean
    /** 恢复滚动位置的延迟（毫秒） */
    restoreDelay?: number
  }
  
  /** 加载状态配置 */
  loading?: {
    /** 加载延迟（毫秒），避免闪烁 */
    delay?: number
    /** 最小显示时间（毫秒） */
    minDuration?: number
    /** 自定义加载组件 */
    component?: any
  }
  
  /** 错误处理配置 */
  error?: {
    /** 自定义错误组件 */
    component?: any
    /** 错误处理函数 */
    handler?: (error: Error) => void
    /** 是否在控制台输出错误 */
    logErrors?: boolean
  }
  
  /** 开发模式配置 */
  dev?: {
    /** 是否启用调试日志 */
    debug?: boolean
    /** 是否启用性能追踪 */
    trace?: boolean
    /** 是否在控制台显示路由变化 */
    logRouteChanges?: boolean
  }
}

/**
 * 路由配置上下文
 */
export interface RouterConfigContext extends RouterConfig {
  /** 更新配置 */
  update: (config: Partial<RouterConfig>) => void
  /** 重置配置 */
  reset: () => void
  /** 获取配置值 */
  get: <K extends keyof RouterConfig>(key: K) => RouterConfig[K]
  /** 设置配置值 */
  set: <K extends keyof RouterConfig>(key: K, value: RouterConfig[K]) => void
}

// ==================== Injection Keys ====================

/**
 * 路由配置的注入键
 */
export const ROUTER_CONFIG_KEY: InjectionKey<RouterConfigContext> = Symbol('router-config')

/**
 * 路由器实例的注入键
 */
export const ROUTER_KEY: InjectionKey<Router> = Symbol('router')

// ==================== 默认配置 ====================

/**
 * 默认路由配置
 */
export const defaultRouterConfig: RouterConfig = {
  transition: {
    type: 'fade',
    duration: 300,
    enabled: true,
  },
  permissions: {
    userPermissions: [],
    mode: 'some',
    unauthorizedRedirect: '/login',
  },
  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000, // 5分钟
    maxSize: 50,
  },
  prefetch: {
    enabled: true,
    delay: 0,
    onHover: true,
    onVisible: false,
  },
  scroll: {
    behavior: 'smooth',
    savePosition: true,
    restoreDelay: 0,
  },
  loading: {
    delay: 200,
    minDuration: 500,
  },
  error: {
    logErrors: true,
  },
  dev: {
    debug: false,
    trace: false,
    logRouteChanges: false,
  },
}

// ==================== 配置管理器 ====================

/**
 * 创建路由配置上下文
 * 
 * @param initialConfig - 初始配置
 * @returns 配置上下文
 */
export function createRouterConfig(initialConfig: RouterConfig = {}): RouterConfigContext {
  // 合并默认配置和初始配置
  const config = reactive<RouterConfig>({
    ...defaultRouterConfig,
    ...initialConfig,
    transition: { ...defaultRouterConfig.transition, ...initialConfig.transition },
    permissions: { ...defaultRouterConfig.permissions, ...initialConfig.permissions },
    cache: { ...defaultRouterConfig.cache, ...initialConfig.cache },
    prefetch: { ...defaultRouterConfig.prefetch, ...initialConfig.prefetch },
    scroll: { ...defaultRouterConfig.scroll, ...initialConfig.scroll },
    loading: { ...defaultRouterConfig.loading, ...initialConfig.loading },
    error: { ...defaultRouterConfig.error, ...initialConfig.error },
    dev: { ...defaultRouterConfig.dev, ...initialConfig.dev },
  })

  const context: RouterConfigContext = {
    ...readonly(config) as RouterConfig,
    
    update(newConfig: Partial<RouterConfig>) {
      Object.assign(config, newConfig)
      
      // 深度合并嵌套对象
      if (newConfig.transition) {
        Object.assign(config.transition!, newConfig.transition)
      }
      if (newConfig.permissions) {
        Object.assign(config.permissions!, newConfig.permissions)
      }
      if (newConfig.cache) {
        Object.assign(config.cache!, newConfig.cache)
      }
      if (newConfig.prefetch) {
        Object.assign(config.prefetch!, newConfig.prefetch)
      }
      if (newConfig.scroll) {
        Object.assign(config.scroll!, newConfig.scroll)
      }
      if (newConfig.loading) {
        Object.assign(config.loading!, newConfig.loading)
      }
      if (newConfig.error) {
        Object.assign(config.error!, newConfig.error)
      }
      if (newConfig.dev) {
        Object.assign(config.dev!, newConfig.dev)
      }
    },
    
    reset() {
      Object.assign(config, defaultRouterConfig)
    },
    
    get<K extends keyof RouterConfig>(key: K): RouterConfig[K] {
      return config[key] as RouterConfig[K]
    },
    
    set<K extends keyof RouterConfig>(key: K, value: RouterConfig[K]) {
      (config as any)[key] = value
    },
  }

  return context
}

// ==================== Provide/Inject API ====================

/**
 * 提供路由配置
 * 
 * 在应用的顶层或任何组件中提供路由配置，
 * 使其在整个组件树中可用
 * 
 * @param config - 路由配置
 * @param router - 路由器实例（可选）
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { provideRouterConfig } from '@ldesign/router-vue'
 * 
 * provideRouterConfig({
 *   transition: {
 *     type: 'slide-left',
 *     duration: 300,
 *   },
 *   permissions: {
 *     userPermissions: ['read', 'write'],
 *   },
 * })
 * </script>
 * ```
 */
export function provideRouterConfig(config: RouterConfig = {}, router?: Router): void {
  const configContext = createRouterConfig(config)
  
  // 如果提供了路由器实例，添加到配置中
  if (router) {
    configContext.update({ router })
    provide(ROUTER_KEY, router)
  }
  
  provide(ROUTER_CONFIG_KEY, configContext)
}

/**
 * 注入路由配置
 * 
 * 在组件中注入路由配置，可以访问和修改配置
 * 
 * @param defaultConfig - 默认配置（当没有提供配置时使用）
 * @returns 路由配置上下文
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { injectRouterConfig } from '@ldesign/router-vue'
 * 
 * const config = injectRouterConfig()
 * 
 * // 读取配置
 * console.log(config.transition?.type)
 * 
 * // 更新配置
 * config.update({
 *   transition: { type: 'zoom' }
 * })
 * 
 * // 获取特定配置
 * const cacheConfig = config.get('cache')
 * 
 * // 设置特定配置
 * config.set('cache', { enabled: false })
 * </script>
 * ```
 */
export function injectRouterConfig(defaultConfig?: RouterConfig): RouterConfigContext {
  const config = inject(ROUTER_CONFIG_KEY, null)
  
  if (config) {
    return config
  }
  
  // 如果没有提供配置，创建一个新的
  return createRouterConfig(defaultConfig || defaultRouterConfig)
}

/**
 * 注入路由器实例
 * 
 * @returns 路由器实例
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { injectRouter } from '@ldesign/router-vue'
 * 
 * const router = injectRouter()
 * 
 * const goToHome = () => {
 *   router.push('/')
 * }
 * </script>
 * ```
 */
export function injectRouter(): Router {
  const router = inject(ROUTER_KEY, null)
  
  if (!router) {
    throw new Error('Router not provided. Make sure to use provideRouterConfig with a router instance.')
  }
  
  return router
}

/**
 * 使用路由器（兼容性 API）
 * 
 * 这是 `injectRouter` 的别名，提供更友好的 API
 * 
 * @returns 路由器实例
 */
export function useRouter(): Router {
  return injectRouter()
}

// ==================== Vue 应用级别配置 ====================

/**
 * 在 Vue 应用中安装路由配置
 * 
 * @param app - Vue 应用实例
 * @param config - 路由配置
 * @param router - 路由器实例
 * 
 * @example
 * ```ts
 * import { createApp } from 'vue'
 * import { installRouterConfig, createRouter } from '@ldesign/router-vue'
 * import App from './App.vue'
 * 
 * const app = createApp(App)
 * const router = createRouter({ routes })
 * 
 * installRouterConfig(app, {
 *   transition: { type: 'fade' },
 *   permissions: { userPermissions: ['admin'] },
 * }, router)
 * 
 * app.mount('#app')
 * ```
 */
export function installRouterConfig(
  app: App,
  config: RouterConfig = {},
  router?: Router
): void {
  const configContext = createRouterConfig(config)
  
  if (router) {
    configContext.update({ router })
    app.provide(ROUTER_KEY, router)
  }
  
  app.provide(ROUTER_CONFIG_KEY, configContext)
}
