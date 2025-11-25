/**
 * @ldesign/router-core 路由器统一导出
 *
 * @module router
 */

// 核心路由器
export {
  Router,
  createRouter,
} from './router'

export type {
  RouterOptions,
  NavigationOptions,
} from './router'

// Trie 树路由匹配
export {
  RouteTrie,
  createRouteTrie,
} from './route-trie'

export type {
  RouteNode,
  MatchResult,
} from './route-trie'

// 压缩版 Trie 树
export {
  CompressedRouteTrie,
  createCompressedRouteTrie,
} from './compressed-route-trie'

export type {
  CompressedRouteNode,
} from './trie-compressor'

// Trie 树压缩器
export {
  TrieCompressor,
  createTrieCompressor,
  compressTrie,
} from './trie-compressor'

export type {
  CompressionStats,
} from './trie-compressor'

// 插件系统
export {
  PluginManager,
  createPluginManager,
  definePlugin,
  createLoggerPlugin,
  createPageTitlePlugin,
  createProgressPlugin,
  createAnalyticsPlugin,
  createPermissionPlugin,
  createKeepScrollPlugin,
} from './plugin'

export type {
  Plugin,
  PluginContext,
  PluginHooks,
  PluginState,
  PluginRecord,
} from './plugin'

// 链式API
export {
  RouteBuilder,
  ChainableRouter,
  RouteComposer,
  route,
  createChainableRouter,
  compose,
} from './chainable'

export type {
  RouteBuilderOptions,
} from './chainable'

// Promise API
export {
  PromiseRouter,
  NavigationController,
  createPromiseRouter,
  createNavigationController,
  waitForNavigation,
  navigateRace,
  navigateWithTimeout,
  safeNavigate,
} from './promise'

export type {
  NavigationOptions as PromiseNavigationOptions,
  NavigationResult,
} from './promise'
