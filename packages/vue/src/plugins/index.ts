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
