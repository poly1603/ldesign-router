/**
 * @ldesign/router SEO 路由插件
 *
 * 将 SEO 管理器集成到路由系统中，自动处理页面元数据更新。
 * 
 * @module features/seo/plugin
 * @author ldesign
 */

import type { Router } from '../../types'
import type { SEOConfig } from './index'
import { SEOManager } from './index'

/**
 * SEO 插件选项
 */
export interface SEOPluginOptions extends SEOConfig {
  /** 是否自动更新 meta 标签 */
  autoUpdate?: boolean
  /** 是否在开发环境禁用 */
  disableInDev?: boolean
}

/**
 * 创建 SEO 路由插件
 * 
 * 自动在路由切换时更新页面的 SEO 元数据。
 * 
 * @param options - SEO 插件配置
 * @returns SEO 插件对象
 * 
 * @example
 * ```ts
 * import { createSEOPlugin } from '@ldesign/router/features/seo'
 * 
 * const seoPlugin = createSEOPlugin({
 *   titleTemplate: '%s | 我的网站',
 *   baseUrl: 'https://example.com',
 *   defaultDescription: '网站默认描述',
 *   defaultImage: 'https://example.com/og-image.jpg',
 *   openGraph: {
 *     siteName: '我的网站',
 *     locale: 'zh_CN'
 *   },
 *   twitter: {
 *     site: '@mywebsite',
 *     card: 'summary_large_image'
 *   }
 * })
 * 
 * // 安装到路由器
 * router.afterEach((to) => {
 *   seoPlugin.updateMeta(to)
 * })
 * ```
 */
export function createSEOPlugin(options: SEOPluginOptions = {}) {
  const {
    autoUpdate = true,
    disableInDev = false,
    ...seoConfig
  } = options

  // 检查是否在开发环境且已禁用
  if (disableInDev && import.meta.env?.DEV) {
    return {
      install: () => { },
      manager: null,
    }
  }

  const manager = new SEOManager(seoConfig)

  return {
    /**
     * 安装插件到路由器
     * 
     * @param router - 路由器实例
     */
    install(router: Router): void {
      if (!autoUpdate) return

      // 在路由切换后自动更新 meta 标签
      router.afterEach((to) => {
        manager.updateMeta(to)
      })

      // 初始化：更新首次加载的路由
      if (router.currentRoute.value) {
        manager.updateMeta(router.currentRoute.value)
      }
    },

    /**
     * SEO 管理器实例
     */
    manager,
  }
}

/**
 * 创建 SEO 插件（Vue 插件格式）
 * 
 * 返回一个标准的 Vue 插件，可以通过 app.use() 安装。
 * 
 * @param options - SEO 插件配置
 * @returns Vue 插件对象
 * 
 * @example
 * ```ts
 * import { createSEOVuePlugin } from '@ldesign/router/features/seo'
 * 
 * const app = createApp(App)
 * const router = createRouter({ ... })
 * 
 * app.use(router)
 * app.use(createSEOVuePlugin({
 *   titleTemplate: '%s | 我的网站'
 * }))
 * ```
 */
export function createSEOVuePlugin(options: SEOPluginOptions = {}) {
  return {
    install(app: any) {
      const router = app.config.globalProperties.$router as Router

      if (!router) {
        console.warn('SEO 插件需要在路由器安装后使用')
        return
      }

      const plugin = createSEOPlugin(options)
      plugin.install(router)

      // 提供 SEO 管理器实例
      app.provide('seoManager', plugin.manager)
      app.config.globalProperties.$seo = plugin.manager
    },
  }
}

/**
 * 导出所有内容
 */
export { SEOManager, createSEOManager } from './index'
export type { SEOConfig, SEOMeta, OpenGraphMeta, TwitterCardMeta, StructuredData } from './index'


