/**
 * @ldesign/router-core 增强功能模块
 * 
 * @description
 * 导出所有路由增强功能，包括懒加载、SSR、预取和权限控制。
 * 
 * @module features
 */

// ==================== 高级缓存 ====================
export {
  AdvancedCacheManager,
  createAdvancedCache,
} from './advanced-cache'

export type {
  AdvancedCacheOptions,
  CacheStats as AdvancedCacheStats,
} from './advanced-cache'

// ==================== 懒加载 ====================
export {
  LazyLoadManager,
  defineLazyComponent,
} from './lazy-loading'

export type {
  LazyLoadOptions,
  LazyLoadState,
  ComponentLoader,
} from './lazy-loading'

// ==================== 高级懒加载 ====================
export {
  LazyLoadManager as AdvancedLazyLoadManager,
  createLazyLoadManager,
  LoadPriority,
  NetworkCondition,
  PrefetchStrategy as AdvancedPrefetchStrategy,
} from './lazy-loading-advanced'

export type {
  RouteLoadConfig,
  LazyLoadManagerOptions,
  LoadStats,
} from './lazy-loading-advanced'

// ==================== SSR ====================
export {
  SSRManager,
  createSSRManager,
} from './ssr'

export type {
  SSRContext,
  SSRState,
} from './ssr'

// ==================== 预取 ====================
export {
  PrefetchManager,
  createPrefetchManager,
} from './prefetch'

export type {
  PrefetchStrategy,
  NetworkType,
  PrefetchOptions,
} from './prefetch'

// ==================== 权限控制 ====================
export {
  PermissionManager,
  createPermissionManager,
} from './permissions'

export type {
  Permission,
  Role,
  PermissionChecker,
  RoleChecker,
  PermissionOptions,
} from './permissions'

// ==================== 路由分析 ====================
export {
  AnalyticsManager,
  createAnalyticsManager,
} from './analytics'

export type {
  RouteVisit,
  NavigationPerformance,
  RouteError,
  AnalyticsStats,
  AnalyticsOptions,
  ReportFunction,
} from './analytics'

// ==================== 路由缓存 ====================
export {
  RouteCacheManager,
  createRouteCacheManager,
} from './cache'

export type {
  CacheStrategy,
  CacheOptions,
  CacheItem,
  CacheStats,
} from './cache'

// ==================== 路由过渡动画 ====================
export {
  TransitionManager,
  createTransitionManager,
} from './transition'

export type {
  TransitionType,
  TransitionDirection,
  TransitionMode,
  TransitionConfig,
  TransitionManagerOptions,
  NavigationDirection,
} from './transition'

// ==================== 路由状态持久化 ====================
export {
  PersistenceManager,
  createPersistenceManager,
} from './persistence'

export type {
  StorageType,
  PersistedState,
  PersistenceOptions,
} from './persistence'

// ==================== 导航守卫 ====================
export {
  GuardManager,
  createGuardManager,
  composeGuards,
  conditionalGuard,
  pathGuard,
  nameGuard,
  metaGuard,
} from './guards'

export type {
  GuardType,
  GuardReturn,
  Guard,
  AfterHook,
  GuardRegistration,
  GuardResult,
  GuardManagerOptions,
} from './guards'

// ==================== 并行守卫 ====================
export {
  ParallelGuardExecutor,
  BatchGuardExecutor,
  createParallelGuardExecutor,
} from './parallel-guards'

export type {
  GuardDependency,
  GuardExecutionPlan,
  GuardExecutionResult,
  ParallelGuardOptions,
} from './parallel-guards'

// ==================== 滚动行为 ====================
export {
  ScrollManager,
  createScrollManager,
  alwaysScrollToTop,
  keepScrollPosition,
  scrollToTopOnNewPage,
  scrollToHashOrTop,
  delayedScroll,
  conditionalScroll,
} from './scroll'

export type {
  ScrollBehaviorType,
  ScrollTarget,
  SavedScrollPosition,
  ScrollStrategy,
  ScrollManagerOptions,
} from './scroll'

// ==================== 匹配缓存 ====================
export {
  MatchCacheManager,
  createMatchCacheManager,
  createCacheKey,
  withCache,
} from './match-cache'

export type {
  MatchCacheItem,
  MatchCacheStats,
  MatchCacheOptions,
} from './match-cache'

// ==================== 性能监控 ====================
export {
  PerformanceMonitor,
  createPerformanceMonitor,
} from './performance-monitor'

export type {
  PerformanceMetrics,
  PerformanceStats,
  PerformanceThresholds,
  PerformanceWarning,
  PerformanceMonitorOptions,
} from './performance-monitor'

