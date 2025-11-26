/**
 * @ldesign/router-vue DevTools 集成
 * 
 * 提供 Vue DevTools 协议支持，增强开发调试体验
 * 
 * @module devtools
 */

import type { App } from 'vue'
import type { Router } from '../router'
import type { RouteLocationNormalized } from '../types'

// ==================== 类型定义 ====================

/**
 * DevTools API 类型
 */
export interface DevtoolsPluginApi {
  on: {
    visitComponentTree(fn: (payload: any) => void): void
    inspectComponent(fn: (payload: any) => void): void
    getInspectorState(fn: (payload: any) => void): void
    getInspectorTree(fn: (payload: any) => void): void
    editInspectorState(fn: (payload: any) => void): void
  }
  notifyComponentUpdate(instance: any): void
  addInspector(options: InspectorOptions): void
  sendInspectorTree(inspectorId: string): void
  sendInspectorState(inspectorId: string): void
  addTimelineLayer(options: TimelineLayerOptions): void
  addTimelineEvent(options: TimelineEventOptions): void
}

/**
 * Inspector 选项
 */
export interface InspectorOptions {
  id: string
  label: string
  icon?: string
  treeFilterPlaceholder?: string
  stateFilterPlaceholder?: string
  noSelectionText?: string
  actions?: Array<{
    icon: string
    tooltip: string
    action: () => void
  }>
}

/**
 * Timeline 层选项
 */
export interface TimelineLayerOptions {
  id: string
  label: string
  color: number
}

/**
 * Timeline 事件选项
 */
export interface TimelineEventOptions {
  layerId: string
  event: {
    time: number
    data: any
    title?: string
    subtitle?: string
    logType?: 'default' | 'warning' | 'error'
  }
}

/**
 * DevTools 配置
 */
export interface DevtoolsOptions {
  /** 是否启用 DevTools 集成 */
  enabled?: boolean
  /** 自定义标签 */
  label?: string
  /** 是否显示路由历史 */
  showHistory?: boolean
  /** 是否显示路由树 */
  showRouteTree?: boolean
  /** 是否显示性能指标 */
  showPerformance?: boolean
}

// ==================== DevTools 集成 ====================

export const ROUTER_INSPECTOR_ID = 'ldesign-router-inspector'
export const ROUTER_TIMELINE_ID = 'ldesign-router-timeline'

/**
 * 设置 Vue DevTools 集成
 * 
 * @param app - Vue 应用实例
 * @param router - 路由器实例
 * @param options - DevTools 配置
 * 
 * @example
 * ```ts
 * import { createApp } from 'vue'
 * import { createRouter, setupDevtools } from '@ldesign/router-vue'
 * 
 * const app = createApp(App)
 * const router = createRouter({ routes })
 * 
 * if (process.env.NODE_ENV === 'development') {
 *   setupDevtools(app, router, {
 *     enabled: true,
 *     showHistory: true,
 *     showPerformance: true,
 *   })
 * }
 * ```
 */
export function setupDevtools(
  app: App,
  router: Router,
  options: DevtoolsOptions = {}
): void {
  // 仅在开发模式下启用
  if (process.env.NODE_ENV === 'production' && !options.enabled) {
    return
  }

  // 检查是否存在 DevTools
  if (typeof window === 'undefined' || !(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    return
  }

  const {
    label = 'LDesign Router',
    showHistory = true,
    showRouteTree = true,
    showPerformance = true,
  } = options

  const devtoolsApi = (app.config.globalProperties.$devtools || 
    (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) as DevtoolsPluginApi

  if (!devtoolsApi) return

  // 注册 Router Inspector
  if (showRouteTree) {
    registerRouterInspector(devtoolsApi, router, label)
  }

  // 注册 Timeline 层
  if (showHistory) {
    registerRouterTimeline(devtoolsApi, router, label)
  }

  // 监听路由变化
  router.afterEach((to, from) => {
    // 发送 timeline 事件
    if (showHistory) {
      addRouteChangeEvent(devtoolsApi, to, from)
    }

    // 更新 inspector 状态
    if (showRouteTree) {
      updateInspectorState(devtoolsApi, router)
    }
  })

  // 监听路由错误
  router.onError((error) => {
    addRouteErrorEvent(devtoolsApi, error)
  })
}

/**
 * 注册 Router Inspector
 */
function registerRouterInspector(
  api: DevtoolsPluginApi,
  router: Router,
  label: string
): void {
  try {
    api.addInspector({
      id: ROUTER_INSPECTOR_ID,
      label,
      icon: 'route',
      treeFilterPlaceholder: '搜索路由...',
      stateFilterPlaceholder: '搜索状态...',
      noSelectionText: '选择一个路由以查看详情',
      actions: [
        {
          icon: 'refresh',
          tooltip: '刷新路由树',
          action: () => {
            api.sendInspectorTree(ROUTER_INSPECTOR_ID)
            api.sendInspectorState(ROUTER_INSPECTOR_ID)
          },
        },
      ],
    })

    // 获取 Inspector 树
    api.on.getInspectorTree((payload) => {
      if (payload.inspectorId === ROUTER_INSPECTOR_ID) {
        payload.rootNodes = buildRouterTree(router)
      }
    })

    // 获取 Inspector 状态
    api.on.getInspectorState((payload) => {
      if (payload.inspectorId === ROUTER_INSPECTOR_ID) {
        payload.state = buildRouterState(router, payload.nodeId)
      }
    })
  } catch (error) {
    console.warn('[DevTools] Failed to register router inspector:', error)
  }
}

/**
 * 注册 Router Timeline
 */
function registerRouterTimeline(
  api: DevtoolsPluginApi,
  router: Router,
  label: string
): void {
  try {
    api.addTimelineLayer({
      id: ROUTER_TIMELINE_ID,
      label: `${label} Navigation`,
      color: 0x42b883, // Vue green
    })
  } catch (error) {
    console.warn('[DevTools] Failed to register router timeline:', error)
  }
}

/**
 * 构建路由树
 */
function buildRouterTree(router: Router): any[] {
  const routes = router.getRoutes()
  
  return routes.map((route) => ({
    id: route.name?.toString() || route.path,
    label: route.name?.toString() || route.path,
    tags: [
      { label: route.path, textColor: 0x000000, backgroundColor: 0xe0e0e0 },
    ],
    children: route.children?.map((child) => ({
      id: child.name?.toString() || child.path,
      label: child.name?.toString() || child.path,
      tags: [
        { label: child.path, textColor: 0x000000, backgroundColor: 0xf0f0f0 },
      ],
    })) || [],
  }))
}

/**
 * 构建路由状态
 */
function buildRouterState(router: Router, nodeId: string): any {
  const route = router.getRoutes().find(
    (r) => r.name?.toString() === nodeId || r.path === nodeId
  )

  if (!route) {
    return {}
  }

  const currentRoute = router.currentRoute.value

  return {
    '路由信息': [
      { key: 'name', value: route.name, editable: false },
      { key: 'path', value: route.path, editable: false },
      { key: 'redirect', value: route.redirect, editable: false },
    ],
    '当前状态': [
      { key: 'fullPath', value: currentRoute.fullPath, editable: false },
      { key: 'params', value: currentRoute.params, editable: false },
      { key: 'query', value: currentRoute.query, editable: false },
      { key: 'hash', value: currentRoute.hash, editable: false },
    ],
    '元信息': [
      { key: 'meta', value: route.meta, editable: false },
    ],
    '匹配记录': [
      {
        key: 'matched',
        value: currentRoute.matched.map((r) => r.path),
        editable: false,
      },
    ],
  }
}

/**
 * 添加路由变化事件
 */
function addRouteChangeEvent(
  api: DevtoolsPluginApi,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): void {
  try {
    api.addTimelineEvent({
      layerId: ROUTER_TIMELINE_ID,
      event: {
        time: Date.now(),
        data: {
          from: {
            path: from.path,
            name: from.name,
            params: from.params,
            query: from.query,
          },
          to: {
            path: to.path,
            name: to.name,
            params: to.params,
            query: to.query,
          },
        },
        title: `导航到 ${to.path}`,
        subtitle: from.path ? `从 ${from.path}` : undefined,
        logType: 'default',
      },
    })
  } catch (error) {
    console.warn('[DevTools] Failed to add timeline event:', error)
  }
}

/**
 * 添加路由错误事件
 */
function addRouteErrorEvent(api: DevtoolsPluginApi, error: Error): void {
  try {
    api.addTimelineEvent({
      layerId: ROUTER_TIMELINE_ID,
      event: {
        time: Date.now(),
        data: {
          error: {
            message: error.message,
            stack: error.stack,
          },
        },
        title: '路由错误',
        subtitle: error.message,
        logType: 'error',
      },
    })
  } catch (err) {
    console.warn('[DevTools] Failed to add error event:', err)
  }
}

/**
 * 更新 Inspector 状态
 */
function updateInspectorState(api: DevtoolsPluginApi, router: Router): void {
  try {
    api.sendInspectorState(ROUTER_INSPECTOR_ID)
  } catch (error) {
    console.warn('[DevTools] Failed to update inspector state:', error)
  }
}

// ==================== 性能监控集成 ====================

/**
 * 添加性能监控到 DevTools
 * 
 * @param api - DevTools API
 * @param metrics - 性能指标
 */
export function addPerformanceMetrics(
  api: DevtoolsPluginApi,
  metrics: {
    navigationTime: number
    matchTime: number
    guardTime: number
  }
): void {
  try {
    api.addTimelineEvent({
      layerId: ROUTER_TIMELINE_ID,
      event: {
        time: Date.now(),
        data: metrics,
        title: '性能指标',
        subtitle: `导航耗时: ${metrics.navigationTime.toFixed(2)}ms`,
        logType: metrics.navigationTime > 100 ? 'warning' : 'default',
      },
    })
  } catch (error) {
    console.warn('[DevTools] Failed to add performance metrics:', error)
  }
}
