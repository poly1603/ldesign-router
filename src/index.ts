// Core router
export { LDesignRouter } from './router'
export { createRouter, createLDesignRouter, defaultRouterOptions, mergeRouterOptions, validateRouterOptions } from './create-router'

// Composables
export * from './composables'

// Components
export * from './components'

// Managers
export { DeviceRouter } from './device-router'
export { TabsManager } from './tabs-manager'
export { BreadcrumbManager } from './breadcrumb-manager'
export { MenuManager } from './menu-manager'
export { CacheManager } from './cache-manager'
export { AnimationManager } from './animation-manager'
export { GuardManager } from './guard-manager'
export { PermissionManager } from './permission-manager'
export { ThemeManager } from './theme-manager'
export { I18nManager } from './i18n-manager'
export { PluginManager } from './plugin-manager'
export { DevTools } from './dev-tools'

export type {
  Router,
  Route,
  RouteConfig,
  DeviceType,
  NavigationGuard,
  RouteLocation,
  RouteLocationNormalized,
  RouterOptions,
  DeviceRouteConfig,
  TabConfig,
  BreadcrumbConfig,
  MenuConfig,
  CacheConfig,
  AnimationConfig,
  GuardConfig,
  PermissionConfig,
  ThemeConfig,
  I18nConfig,
  PluginConfig
} from './types'