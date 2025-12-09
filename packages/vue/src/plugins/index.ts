/**
 * @ldesign/router-vue 插件系统
 * 
 * @description
 * 提供两种插件：
 * - Vue Plugin: 用于标准 Vue 应用
 * - Engine Plugin: 用于 LDesign Engine 集成
 * 
 * @module plugins
 */

// ==================== Vue Plugin ====================
// 用于标准 Vue 应用的路由插件

export type {
  RouterPluginOptions,
} from './vue-plugin'

export {
  createRouterPlugin,
  useRouterPlugin,
} from './vue-plugin'

// ==================== Engine Plugin ====================
// 用于 LDesign Engine 的路由插件

export type {
  RouterMode,
  RouterPreset,
  RouterEnginePluginOptions,
} from './engine-plugin'

export {
  createRouterEnginePlugin,
  createDefaultRouterEnginePlugin,
  routerPlugin,
} from './engine-plugin'

// 导入以便在函数中使用
import { createRouterPlugin as _createRouterPlugin } from './vue-plugin'
import { createRouterEnginePlugin as _createRouterEnginePlugin, createDefaultRouterEnginePlugin as _createDefaultRouterEnginePlugin } from './engine-plugin'

/** 插件版本标识 */
export const PLUGINS_VERSION = '1.0.0'

/**
 * 获取所有可用的插件创建函数
 * @returns 插件创建函数集合
 */
export function getPluginCreators() {
  return {
    createRouterPlugin: _createRouterPlugin,
    createRouterEnginePlugin: _createRouterEnginePlugin,
    createDefaultRouterEnginePlugin: _createDefaultRouterEnginePlugin,
  }
}
