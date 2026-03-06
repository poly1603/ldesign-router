/**
 * @ldesign/router-vue Vue 插件
 *
 * 用于标准 Vue 3 应用的路由插件（不依赖 LDesign Engine）
 *
 * @module plugins/vue-plugin
 */

import type { App, Plugin } from 'vue'
import type { Router, RouterOptions } from '../router'
import { createRouter } from '../router'

// ==================== 类型定义 ====================

export interface RouterPluginOptions extends RouterOptions {
  /** 插件名称 */
  name?: string

  /** 是否全局注册组件 */
  globalComponents?: boolean

  /** 是否自动管理页面标题 */
  autoTitle?: boolean | {
    /** 标题模板 */
    template?: string
    /** 默认标题 */
    defaultTitle?: string
  }

  /** 是否启用导航进度条 */
  progress?: boolean

  /** 安装完成回调 */
  onReady?: (router: Router) => void
}

// ==================== 插件实现 ====================

/**
 * 创建路由器插件（用于标准 Vue 应用）
 *
 * @param options - 插件配置选项
 * @returns Vue 插件
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { createRouterPlugin, createWebHistory } from '@ldesign/router-vue'
 *
 * const app = createApp(App)
 * app.use(createRouterPlugin({
 *   history: createWebHistory(),
 *   routes: [...],
 *   autoTitle: { template: '%s | My App', defaultTitle: 'Home' },
 *   progress: true,
 * }))
 * app.mount('#app')
 * ```
 */
export function createRouterPlugin(options: RouterPluginOptions): Plugin {
  let router: Router | null = null

  return {
    install(app: App) {
      // 创建路由器
      router = createRouter(options)

      // 安装路由器
      router.install(app)

      // 提供路由器实例
      app.provide('router', router)

      // 自动标题管理
      if (options.autoTitle) {
        const titleConfig = typeof options.autoTitle === 'object' ? options.autoTitle : {}
        const template = titleConfig.template || '%s'
        const defaultTitle = titleConfig.defaultTitle || ''

        router.afterEach((to: any) => {
          if (typeof document !== 'undefined') {
            const title = (to.meta?.title as string) || defaultTitle
            if (title) {
              document.title = typeof template === 'string'
                ? template.replace('%s', title)
                : title
            }
          }
        })
      }

      // 导航进度条集成
      if (options.progress) {
        import('@ldesign/router-core').then(({ createNavigationProgress }) => {
          const progress = createNavigationProgress()
          app.provide('navigationProgress', progress)

          router!.beforeEach(() => {
            progress.start()
          })
          router!.afterEach(() => {
            progress.finish()
          })
          router!.onError(() => {
            progress.fail()
          })
        }).catch(() => {
          // NavigationProgress not available, silently ignore
        })
      }

      // Ready callback
      if (options.onReady && router) {
        router.isReady().then(() => {
          options.onReady!(router!)
        })
      }
    },
  }
}

/**
 * 使用路由器的简化工厂函数
 *
 * @param app - Vue 应用实例
 * @param options - 路由器配置
 * @returns 路由器实例
 */
export function useRouterPlugin(app: App, options: RouterOptions): Router {
  const router = createRouter(options)
  router.install(app)
  return router
}

