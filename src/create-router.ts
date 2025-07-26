import { LDesignRouter } from './router'
import type { RouterOptions } from './types'

/**
 * 创建路由器实例
 * @param options 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): LDesignRouter {
  return new LDesignRouter(options)
}

/**
 * 创建路由器的默认配置
 */
export const defaultRouterOptions: Partial<RouterOptions> = {
  history: 'hash',
  routes: [],
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    },
    defaultDevice: 'desktop'
  },
  tabsManager: {
    enabled: false,
    persistent: true,
    maxTabs: 10,
    closable: true,
    draggable: true
  },
  breadcrumbManager: {
    enabled: true,
    separator: '/',
    showHome: true,
    homeText: '首页',
    homePath: '/'
  },
  menuManager: {
    enabled: true,
    accordion: false,
    collapsible: true,
    defaultCollapsed: false
  },
  cacheManager: {
    enabled: true,
    strategy: 'lru',
    maxSize: 10,
    persistent: false
  },
  animationManager: {
    enabled: true,
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out'
  },
  guardManager: {
    enabled: true,
    timeout: 5000
  },
  permissionManager: {
    enabled: false,
    strict: false,
    redirectPath: '/login'
  },
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    persistent: true,
    systemTheme: true
  },
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    persistent: true,
    detectBrowserLanguage: true
  },
  pluginManager: {
    enabled: true
  },
  devTools: {
    enabled: process.env.NODE_ENV === 'development',
    showInProduction: false,
    maxHistorySize: 100,
    maxErrorSize: 50
  }
}

/**
 * 合并路由器配置
 * @param userOptions 用户配置
 * @param defaultOptions 默认配置
 * @returns 合并后的配置
 */
export function mergeRouterOptions(
  userOptions: RouterOptions,
  defaultOptions: Partial<RouterOptions> = defaultRouterOptions
): RouterOptions {
  const merged = { ...defaultOptions, ...userOptions }
  
  // 深度合并嵌套对象
  const nestedKeys = [
    'deviceRouter',
    'tabsManager',
    'breadcrumbManager',
    'menuManager',
    'cacheManager',
    'animationManager',
    'guardManager',
    'permissionManager',
    'themeManager',
    'i18nManager',
    'pluginManager',
    'devTools'
  ] as const
  
  nestedKeys.forEach(key => {
    if (userOptions[key] && defaultOptions[key]) {
      merged[key] = { ...defaultOptions[key], ...userOptions[key] }
    }
  })
  
  return merged as RouterOptions
}

/**
 * 验证路由器配置
 * @param options 路由器配置
 * @returns 验证结果
 */
export function validateRouterOptions(options: RouterOptions): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // 验证基本配置
  if (!options.routes || !Array.isArray(options.routes)) {
    errors.push('routes must be an array')
  }
  
  if (options.history && !['hash', 'history', 'memory'].includes(options.history)) {
    errors.push('history must be one of: hash, history, memory')
  }
  
  // 验证路由配置
  if (options.routes) {
    options.routes.forEach((route, index) => {
      if (!route.path) {
        errors.push(`Route at index ${index} must have a path`)
      }
      
      if (route.path && !route.path.startsWith('/')) {
        errors.push(`Route path "${route.path}" must start with "/"`)
      }
      
      if (!route.component && !route.redirect && !route.children) {
        errors.push(`Route "${route.path}" must have a component, redirect, or children`)
      }
    })
  }
  
  // 验证设备路由器配置
  if (options.deviceRouter?.breakpoints) {
    const { mobile, tablet } = options.deviceRouter.breakpoints
    if (mobile >= tablet) {
      errors.push('mobile breakpoint must be less than tablet breakpoint')
    }
  }
  
  // 验证标签页管理器配置
  if (options.tabsManager?.maxTabs && options.tabsManager.maxTabs < 1) {
    errors.push('maxTabs must be greater than 0')
  }
  
  // 验证缓存管理器配置
  if (options.cacheManager?.maxSize && options.cacheManager.maxSize < 1) {
    errors.push('cache maxSize must be greater than 0')
  }
  
  if (options.cacheManager?.strategy && 
      !['lru', 'lfu', 'fifo'].includes(options.cacheManager.strategy)) {
    errors.push('cache strategy must be one of: lru, lfu, fifo')
  }
  
  // 验证动画管理器配置
  if (options.animationManager?.duration && options.animationManager.duration < 0) {
    errors.push('animation duration must be non-negative')
  }
  
  // 验证守卫管理器配置
  if (options.guardManager?.timeout && options.guardManager.timeout < 0) {
    errors.push('guard timeout must be non-negative')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 创建路由器实例的便捷方法
 * @param options 路由器配置选项
 * @returns 路由器实例
 */
export function createLDesignRouter(options: RouterOptions): LDesignRouter {
  // 合并默认配置
  const mergedOptions = mergeRouterOptions(options)
  
  // 验证配置
  const validation = validateRouterOptions(mergedOptions)
  if (!validation.valid) {
    throw new Error(`Invalid router options:\n${validation.errors.join('\n')}`)
  }
  
  // 创建路由器实例
  return createRouter(mergedOptions)
}