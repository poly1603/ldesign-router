import type { RouterOptions } from '../types'
import { LDesignRouter } from './router'

/**
 * 创建 LDesign 路由器实例
 * @param options 路由器配置选项
 * @returns 路由器实例
 */
export function createLDesignRouter(options: RouterOptions): LDesignRouter {
  const mergedOptions = mergeRouterOptions(defaultRouterOptions, options)
  validateRouterOptions(mergedOptions)
  return new LDesignRouter(mergedOptions)
}

/**
 * 创建标准路由器（向后兼容）
 * @param options 路由器配置选项
 * @returns 路由器实例
 */
export function createRouter(options: RouterOptions): LDesignRouter {
  return createLDesignRouter(options)
}

/**
 * 默认路由器配置
 */
export const defaultRouterOptions: Partial<RouterOptions> = {
  history: 'hash',
  routes: [],

  // 设备路由配置
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
    defaultDevice: 'desktop',
  },

  // 守卫配置
  guards: {
    beforeEach: [],
    beforeResolve: [],
    afterEach: [],
  },

  // 权限配置
  permission: {
    enabled: false,
    mode: 'both',
    defaultRole: 'guest',
    guestRole: 'guest',
    adminRole: 'admin',
    redirectPath: '/login',
  },

  // 缓存配置
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 10,
    ttl: 300000, // 5分钟
    storage: 'memory',
  },

  // 面包屑配置
  breadcrumb: {
    enabled: true,
    separator: '/',
    showHome: true,
    homeText: '首页',
    homePath: '/',
    maxItems: 10,
  },

  // 标签页配置
  tabs: {
    enabled: false,
    max: 10,
    persistent: true,
    closable: true,
    draggable: false,
    contextMenu: true,
    cache: true,
  },

  // 动画配置
  animation: {
    enabled: true,
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    direction: 'right',
  },

  // 菜单配置
  menu: {
    enabled: true,
    mode: 'sidebar',
    collapsible: true,
    defaultCollapsed: false,
    width: 240,
    accordion: false,
  },

  // 开发工具
  devTools: false,
}

/**
 * 合并路由器配置
 * @param defaultOptions 默认配置
 * @param userOptions 用户配置
 * @returns 合并后的配置
 */
export function mergeRouterOptions(
  defaultOptions: Partial<RouterOptions>,
  userOptions: RouterOptions,
): RouterOptions {
  const merged = { ...defaultOptions, ...userOptions }

  // 深度合并对象配置
  if (defaultOptions.deviceRouter && userOptions.deviceRouter) {
    merged.deviceRouter = { ...defaultOptions.deviceRouter, ...userOptions.deviceRouter }
  }

  if (defaultOptions.guards && userOptions.guards) {
    merged.guards = { ...defaultOptions.guards, ...userOptions.guards }
  }

  if (defaultOptions.permission && userOptions.permission) {
    merged.permission = { ...defaultOptions.permission, ...userOptions.permission }
  }

  if (defaultOptions.cache && userOptions.cache) {
    merged.cache = { ...defaultOptions.cache, ...userOptions.cache }
  }

  if (defaultOptions.breadcrumb && userOptions.breadcrumb) {
    merged.breadcrumb = { ...defaultOptions.breadcrumb, ...userOptions.breadcrumb }
  }

  if (defaultOptions.tabs && userOptions.tabs) {
    merged.tabs = { ...defaultOptions.tabs, ...userOptions.tabs }
  }

  if (defaultOptions.animation && userOptions.animation) {
    merged.animation = { ...defaultOptions.animation, ...userOptions.animation }
  }

  if (defaultOptions.menu && userOptions.menu) {
    merged.menu = { ...defaultOptions.menu, ...userOptions.menu }
  }

  return merged as RouterOptions
}

/**
 * 验证路由器配置
 * @param options 路由器配置
 */
export function validateRouterOptions(options: RouterOptions): void {
  if (!options.routes || !Array.isArray(options.routes)) {
    throw new Error('Router options must include a valid routes array')
  }

  if (options.history && !['hash', 'history', 'memory'].includes(options.history)) {
    throw new Error('Invalid history mode. Must be one of: hash, history, memory')
  }

  // 验证路由配置
  validateRoutes(options.routes)
}

/**
 * 验证路由配置
 * @param routes 路由配置数组
 */
function validateRoutes(routes: any[]): void {
  routes.forEach((route, index) => {
    if (!route.path || typeof route.path !== 'string') {
      throw new Error(`Route at index ${index} must have a valid path`)
    }

    if (route.name && typeof route.name !== 'string') {
      throw new Error(`Route at index ${index} name must be a string`)
    }

    if (route.children && Array.isArray(route.children)) {
      validateRoutes(route.children)
    }
  })
}
