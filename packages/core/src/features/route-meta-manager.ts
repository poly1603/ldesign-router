/**
 * RouteMetaManager - 路由 Meta 数据统一管理
 *
 * 自动设置页面 title、描述等，支持模板和继承
 *
 * @module features/route-meta-manager
 */

import type { RouteLocationNormalized, RouteMeta } from '../types'

export interface MetaManagerOptions {
  /** 默认页面标题 */
  defaultTitle?: string
  /** 标题模板，%s 为页面标题占位符 */
  titleTemplate?: string | ((title: string) => string)
  /** 默认描述 */
  defaultDescription?: string
  /** 是否自动设置 document.title（仅浏览器环境） */
  autoDocumentTitle?: boolean
}

export interface MetaInfo {
  title?: string
  description?: string
  keywords?: string[]
  [key: string]: unknown
}

export type MetaChangeListener = (meta: MetaInfo, route: RouteLocationNormalized) => void

/**
 * 路由 Meta 管理器
 *
 * @example
 * ```typescript
 * const metaManager = createRouteMetaManager({
 *   defaultTitle: 'My App',
 *   titleTemplate: '%s | My App',
 *   autoDocumentTitle: true,
 * })
 *
 * router.afterEach((to) => {
 *   metaManager.update(to)
 * })
 * ```
 */
export class RouteMetaManager {
  private options: Required<MetaManagerOptions>
  private currentMeta: MetaInfo = {}
  private listeners = new Set<MetaChangeListener>()

  constructor(options: MetaManagerOptions = {}) {
    this.options = {
      defaultTitle: options.defaultTitle ?? '',
      titleTemplate: options.titleTemplate ?? '%s',
      defaultDescription: options.defaultDescription ?? '',
      autoDocumentTitle: options.autoDocumentTitle ?? true,
    }
  }

  /** 根据路由更新 Meta */
  update(route: RouteLocationNormalized): MetaInfo {
    const meta = this.extractMeta(route)
    this.currentMeta = meta

    // 自动更新 document.title
    if (this.options.autoDocumentTitle && typeof document !== 'undefined') {
      document.title = this.formatTitle(meta.title || this.options.defaultTitle)
    }

    // 通知监听器
    for (const listener of this.listeners) {
      listener(meta, route)
    }

    return meta
  }

  /** 从路由中提取 Meta 信息 */
  private extractMeta(route: RouteLocationNormalized): MetaInfo {
    const routeMeta: RouteMeta = route.meta || {}

    // 从 matched 路由链中合并 meta
    const mergedMeta: RouteMeta = {}
    if (route.matched) {
      for (const record of route.matched) {
        if (record.meta) {
          Object.assign(mergedMeta, record.meta)
        }
      }
    }
    // 当前路由 meta 优先级最高
    Object.assign(mergedMeta, routeMeta)

    return {
      title: (mergedMeta.title as string) || this.options.defaultTitle,
      description: (mergedMeta.description as string) || this.options.defaultDescription,
      keywords: (mergedMeta.keywords as string[]) || [],
      ...mergedMeta,
    }
  }

  /** 格式化标题 */
  private formatTitle(title: string): string {
    if (!title) return this.options.defaultTitle

    const template = this.options.titleTemplate
    if (typeof template === 'function') {
      return template(title)
    }
    return template.replace('%s', title)
  }

  /** 获取当前 Meta */
  getCurrentMeta(): Readonly<MetaInfo> {
    return { ...this.currentMeta }
  }

  /** 手动设置标题 */
  setTitle(title: string): void {
    this.currentMeta.title = title
    if (this.options.autoDocumentTitle && typeof document !== 'undefined') {
      document.title = this.formatTitle(title)
    }
  }

  /** 注册 Meta 变化监听器 */
  onChange(listener: MetaChangeListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** 销毁 */
  destroy(): void {
    this.listeners.clear()
  }
}

/**
 * 创建路由 Meta 管理器
 */
export function createRouteMetaManager(options?: MetaManagerOptions): RouteMetaManager {
  return new RouteMetaManager(options)
}
