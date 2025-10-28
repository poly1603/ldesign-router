/**
 * @ldesign/router-vue 插件系统
 * 
 * @module plugins
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
}

// ==================== 插件实现 ====================

/**
 * 创建路由器插件
 * 
 * @param options - 插件配置选项
 * @returns Vue 插件
 */
export function createRouterPlugin(options: RouterPluginOptions): Plugin {
  let router: Router | null = null

  return {
    install(app: App) {
      // 创建路由器
      router = createRouter(options)

      // 安装路由器
      router.install(app)

      // 全局注册组件（可选）
      if (options.globalComponents !== false) {
        // 组件已通过 vue-router 自动注册
      }

      // 提供路由器实例
      app.provide('router', router)
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

