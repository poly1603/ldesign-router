import { inject, computed } from 'vue'
import type { LDesignRouter } from '../router'
import type { RouteLocationNormalized } from '../types'

/**
 * 获取路由器实例
 */
export function useRouter(): LDesignRouter {
  const router = inject<LDesignRouter>('$router')
  if (!router) {
    throw new Error('useRouter() must be called within a router context')
  }
  return router
}

/**
 * 获取当前路由
 */
export function useRoute() {
  const router = useRouter()
  return computed(() => router.currentRoute.value)
}

/**
 * 获取设备路由器
 */
export function useDeviceRouter() {
  const router = useRouter()
  return router.deviceRouter
}

/**
 * 获取标签页管理器
 */
export function useTabsManager() {
  const router = useRouter()
  return router.tabsManager
}

/**
 * 获取面包屑管理器
 */
export function useBreadcrumbManager() {
  const router = useRouter()
  return router.breadcrumbManager
}

/**
 * 获取菜单管理器
 */
export function useMenuManager() {
  const router = useRouter()
  return router.menuManager
}

/**
 * 获取缓存管理器
 */
export function useCacheManager() {
  const router = useRouter()
  return router.cacheManager
}

/**
 * 获取动画管理器
 */
export function useAnimationManager() {
  const router = useRouter()
  return router.animationManager
}

/**
 * 获取守卫管理器
 */
export function useGuardManager() {
  const router = useRouter()
  return router.guardManager
}

/**
 * 获取权限管理器
 */
export function usePermissionManager() {
  const router = useRouter()
  return router.permissionManager
}

/**
 * 获取主题管理器
 */
export function useThemeManager() {
  const router = useRouter()
  return router.themeManager
}

/**
 * 获取国际化管理器
 */
export function useI18nManager() {
  const router = useRouter()
  return router.i18nManager
}

/**
 * 获取插件管理器
 */
export function usePluginManager() {
  const router = useRouter()
  return router.pluginManager
}

/**
 * 获取开发工具
 */
export function useDevTools() {
  const router = useRouter()
  return router.devTools
}

/**
 * 路由导航钩子
 */
export function useRouteNavigation() {
  const router = useRouter()
  
  return {
    push: router.push.bind(router),
    replace: router.replace.bind(router),
    go: router.go.bind(router),
    back: router.back.bind(router),
    forward: router.forward.bind(router)
  }
}

/**
 * 路由参数钩子
 */
export function useRouteParams() {
  const route = useRoute()
  
  return computed(() => route.value?.params || {})
}

/**
 * 路由查询参数钩子
 */
export function useRouteQuery() {
  const route = useRoute()
  
  return computed(() => route.value?.query || {})
}

/**
 * 路由元信息钩子
 */
export function useRouteMeta() {
  const route = useRoute()
  
  return computed(() => route.value?.meta || {})
}

/**
 * 设备信息钩子
 */
export function useDevice() {
  const deviceRouter = useDeviceRouter()
  
  return {
    deviceType: computed(() => deviceRouter.deviceType.value),
    isMobile: computed(() => deviceRouter.isMobile.value),
    isTablet: computed(() => deviceRouter.isTablet.value),
    isDesktop: computed(() => deviceRouter.isDesktop.value),
    deviceClass: computed(() => deviceRouter.deviceClass.value)
  }
}

/**
 * 标签页钩子
 */
export function useTabs() {
  const tabsManager = useTabsManager()
  
  return {
    tabs: computed(() => tabsManager.tabs.value),
    activeTab: computed(() => tabsManager.activeTab.value),
    addTab: tabsManager.addTab.bind(tabsManager),
    removeTab: tabsManager.removeTab.bind(tabsManager),
    activateTab: tabsManager.activateTab.bind(tabsManager),
    refreshTab: tabsManager.refreshTab.bind(tabsManager),
    closeOtherTabs: tabsManager.closeOtherTabs.bind(tabsManager),
    closeAllTabs: tabsManager.closeAllTabs.bind(tabsManager)
  }
}

/**
 * 面包屑钩子
 */
export function useBreadcrumbs() {
  const breadcrumbManager = useBreadcrumbManager()
  
  return {
    breadcrumbs: computed(() => breadcrumbManager.breadcrumbs.value),
    generateText: breadcrumbManager.generateText.bind(breadcrumbManager),
    navigateTo: breadcrumbManager.navigateTo.bind(breadcrumbManager)
  }
}

/**
 * 菜单钩子
 */
export function useMenu() {
  const menuManager = useMenuManager()
  
  return {
    menus: computed(() => menuManager.menus.value),
    activeMenus: computed(() => menuManager.activeMenus.value),
    openMenus: computed(() => menuManager.openMenus.value),
    collapsed: computed(() => menuManager.collapsed.value),
    setMenus: menuManager.setMenus.bind(menuManager),
    toggleCollapse: menuManager.toggleCollapse.bind(menuManager),
    handleMenuClick: menuManager.handleMenuClick.bind(menuManager)
  }
}

/**
 * 权限钩子
 */
export function usePermissions() {
  const permissionManager = usePermissionManager()
  
  return {
    permissions: computed(() => permissionManager.permissions.value),
    roles: computed(() => permissionManager.roles.value),
    hasPermission: permissionManager.hasPermission.bind(permissionManager),
    hasRole: permissionManager.hasRole.bind(permissionManager),
    hasAnyPermission: permissionManager.hasAnyPermission.bind(permissionManager),
    hasAnyRole: permissionManager.hasAnyRole.bind(permissionManager)
  }
}

/**
 * 主题钩子
 */
export function useTheme() {
  const themeManager = useThemeManager()
  
  return {
    theme: computed(() => themeManager.theme.value),
    themes: computed(() => themeManager.themes.value),
    setTheme: themeManager.setTheme.bind(themeManager),
    toggleTheme: themeManager.toggleTheme.bind(themeManager),
    addTheme: themeManager.addTheme.bind(themeManager)
  }
}

/**
 * 国际化钩子
 */
export function useI18n() {
  const i18nManager = useI18nManager()
  
  return {
    locale: computed(() => i18nManager.locale.value),
    locales: computed(() => i18nManager.locales.value),
    t: i18nManager.t.bind(i18nManager),
    setLocale: i18nManager.setLocale.bind(i18nManager),
    formatNumber: i18nManager.formatNumber.bind(i18nManager),
    formatDate: i18nManager.formatDate.bind(i18nManager),
    formatRelativeTime: i18nManager.formatRelativeTime.bind(i18nManager)
  }
}