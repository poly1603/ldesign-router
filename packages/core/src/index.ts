/**
 * @ldesign/router-core 主入口文件
 * 
 * 框架无关的路由核心库
 * 
 * @module @ldesign/router-core
 */

// ==================== 服务容器导出 ====================
export {
  RouterServiceContainerImpl,
  createRouterServiceContainer,
  RouterServiceLifetime,
  ROUTER_SERVICES,
} from './container'

export type {
  RouterServiceContainer,
  RouterServiceIdentifier,
  RouterServiceDescriptor,
  RouterServiceProvider,
  Constructor as RouterConstructor,
  Factory as RouterFactory,
  ResolveOptions as RouterResolveOptions,
  RouterServiceContainerStats,
} from './container'

// ==================== 类型定义导出 ====================
export type {
  // 基础类型
  RouteParams,
  RouteQuery,
  RouteMeta,
  ExtractRouteParams,
  RouteParamsFor,
  TypedRouteParams,
  TypedRouteQuery,
  // 增强类型
  ExtractRouteParamsFromPath,
  TypedRouteRecordRaw,
  TypedRouteLocation,
  ExtendedRouteMeta,
  RouteConfigBuilder,
  NamedRoutes,
  TypedNavigationGuard,
  RouteGroup,
  RouteModule,
  MergeRouteTypes,
  RouteParamsType,
  RouteQueryType,
  RouteMetaType,
  OptionalParamRoute,
  RequiredParamRoute,
  // 历史管理类型
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationInformation,
  RouterHistory,
  // 导航相关类型
  RouteLocationBase,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordBase,
  RouteRecordRaw,
  RouteRecordNormalized,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardNextCallback,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationFailure,
  ScrollPosition,
  ScrollPositionElement,
  ScrollBehavior,
} from './types'

export {
  NavigationType,
  NavigationFailureType,
  // 增强类型工具
  isTypedRoute,
  isNamedRoute,
  isPathRoute,
  createTypedRoute,
  defineRoute,
  defineRouteGroup,
  defineRouteModule,
  mergeRouteMeta,
} from './types'

// ==================== 工具函数导出 ====================
export {
  // 路径处理
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,
  extractParamNames,
  normalizeParams,
  // 查询参数处理
  parseQuery,
  stringifyQuery,
  mergeQuery,
  normalizeQuery,
  // URL 处理
  parseURL,
  stringifyURL,
  normalizeURL,
  isSameURL,
  // 查询参数增强
  parseQueryEnhanced,
  stringifyQueryEnhanced,
  transformQuery,
  mergeQueryEnhanced,
  isSameQuery,
  pickQuery,
  omitQuery,
  // 路由别名
  AliasManager,
  createAliasManager,
  expandRouteWithAliases,
  expandRoutesWithAliases,
  normalizeAliasPath,
  validateAliasConfig,
  mergeAliasConfigs,
  // 路径工具增强
  isSamePath,
  isParentPath,
  isChildPath,
  isSiblingPath,
  getPathRelation,
  splitPath,
  getPathSegments,
  getPathDepth,
  getParentPath,
  getLastPathSegment,
  getFirstPathSegment,
  joinPathsSafe,
  resolveRelativePath,
  getRelativePath,
  matchPathPattern,
  matchesAnyPattern,
  isUrlSafe,
  sanitizePath,
  isValidPath,
  normalizePathArray,
  uniquePaths,
  sortPaths,
  findCommonParent,
  extendPath,
  truncatePath,
  // 路径匹配
  PathMatcher,
  createMatcher,
  matchPath,
  isMatch,
  extractParams,
  compareMatchResults,
  // 匹配器注册表
  MatcherRegistry,
  createMatcherRegistry,
  // 错误处理
  RouterError,
  NavigationError,
  GuardError,
  MatcherError,
  ConfigError,
  ComponentError,
  HistoryError,
  RouterErrorCode,
  ErrorManager,
  createErrorManager,
  createNavigationCancelledError,
  createNavigationAbortedError,
  createNavigationDuplicatedError,
  createGuardError,
  createGuardTimeoutError,
  createNoMatchError,
  createInvalidParamsError,
  createInvalidConfigError,
  createComponentLoadError,
  createHistoryNotSupportedError,
  isRouterError,
  isNavigationError,
  isRecoverableError,
  // 路由标准化
  RouteNormalizer,
  createNormalizer,
  normalizeRouteRecord,
  normalizeRouteRecords,
  normalizeLocation,
  validateRouteRecord,
  validateLocation,
  // 路由验证器
  RouteValidator,
  createValidator,
  validateRoutes,
  check404Route,
  checkRootRoute,
  generateReport,
  // 路由优化工具包
  TriePathMatcher,
  MemoryMonitor,
  WeakCache,
  I18nRouter,
  DevToolsConnector,
  createTrieMatcher,
  createMemoryMonitor,
  createI18nRouter,
  createDevToolsConnector,
  createRouteBasedSplit,
  createModuleBasedSplit,
} from './utils'

export type {
  ParsedURL,
  MatchResult,
  MatcherOptions,
  RouterErrorType,
  ErrorHandler,
  RecoveryStrategy,
  NormalizeOptions,
  ValidationResult as UtilsValidationResult,
  QueryValue,
  QueryObject,
  QueryParamConfig,
  QueryParamsConfig,
  StringifyOptions,
  ParseOptions,
  AliasConfig,
  AliasRecord,
  AliasMatchResult,
  PathSegment,
  PathCompareOptions,
  PathRelation,
  ValidationLevel,
  ValidationIssue,
  ValidatorOptions,
  ValidationRule,
  MemoryUsage,
  CodeSplitStrategy,
  I18nRouteConfig,
  DevToolsEvent,
  DevToolsHook,
} from './utils'

// ==================== 框架适配器导出 ====================
export type {
  ComponentLoader,
  ComponentLoaderFactory,
  ViewRenderer,
  SSRContext,
  SSRRenderer,
  ErrorBoundary,
  ComponentLifecycleHooks,
  FrameworkAdapter,
} from './types/framework'

export {
  registerFrameworkAdapter,
  getFrameworkAdapter,
  setCurrentFrameworkAdapter,
  getAllFrameworkAdapters,
  detectFramework,
  autoDetectAndSetAdapter,
} from './types/framework'

// ==================== 元数据和扩展导出 ====================
export type {
  RouteMetaExtended,
  RouteDataFetcher,
  RouteValidator as MetadataRouteValidator,
  RouteTransformer,
  RouteAnalyzer,
  RouteOptimizer,
  RouteMiddleware,
  RouteMiddlewareManager,
  RouteStateManager,
  RouteEvent,
  RouteEventEmitter,
  RoutePlugin,
  RoutePluginManager,
} from './types/metadata'

// ==================== 历史管理导出 ====================
export {
  BaseHistory,
  HTML5History,
  createWebHistory,
  HashHistory,
  createWebHashHistory,
  MemoryHistory,
  createMemoryHistory,
  // 高级历史
  AdvancedHistory,
  createAdvancedHistory,
  // 兼容旧名称
  EnhancedHistory,
  createEnhancedHistory,
  filterHistory,
  findHistoryEntry,
  getHistoryStats,
} from './history'

export type {
  HistoryEntry,
  HistorySnapshot,
  PersistenceOptions as HistoryPersistenceOptions,
  HistoryInterceptor,
  AdvancedHistoryOptions,
  EnhancedHistoryOptions,
  HistoryStats,
} from './history'

// ==================== 核心路由器 ====================
export {
  Router,
  createRouter,
} from './router/router'

export type {
  RouterOptions,
  NavigationOptions,
} from './router/router'

// ==================== 插件系统 ====================
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
} from './router/plugin'

export type {
  Plugin,
  PluginContext,
  PluginHooks,
  PluginState,
  PluginRecord,
} from './router/plugin'

// ==================== 链式API ====================
export {
  RouteBuilder,
  ChainableRouter,
  RouteComposer,
  route,
  createChainableRouter,
  compose,
} from './router/chainable'

export type {
  RouteBuilderOptions,
} from './router/chainable'

// ==================== Promise API ====================
export {
  PromiseRouter,
  NavigationController,
  createPromiseRouter,
  createNavigationController,
  waitForNavigation,
  navigateRace,
  navigateWithTimeout,
  safeNavigate,
} from './router/promise'

export type {
  NavigationOptions as PromiseNavigationOptions,
  NavigationResult,
} from './router/promise'

// ==================== 增强功能导出 ====================
export {
  LazyLoadManager,
  defineLazyComponent,
  SSRManager,
  createSSRManager,
  PrefetchManager,
  createPrefetchManager,
  PermissionManager,
  createPermissionManager,
  AnalyticsManager,
  createAnalyticsManager,
  RouteCacheManager,
  createRouteCacheManager,
  TransitionManager,
  createTransitionManager,
  PersistenceManager,
  createPersistenceManager,
  GuardManager,
  createGuardManager,
  composeGuards,
  conditionalGuard,
  pathGuard,
  nameGuard,
  metaGuard,
  ScrollManager,
  createScrollManager,
  alwaysScrollToTop,
  keepScrollPosition,
  scrollToTopOnNewPage,
  scrollToHashOrTop,
  delayedScroll,
  conditionalScroll,
  MatchCacheManager,
  createMatchCacheManager,
  createCacheKey,
  withCache,
  PerformanceMonitor,
  createPerformanceMonitor,
  // 中间件系统
  RouterMiddlewareManager,
  createMiddlewareManager,
  MiddlewareErrorStrategy,
  // 增强路由匹配器
  EnhancedRouteMatcher,
  createEnhancedMatcher,
  RouteMatchMode,
  // 插件系统
  RouterPluginManager,
  DynamicRouteRegistry,
  RouterEventHookManager,
  createPluginManager as createRouterPluginManager,
  createDynamicRouteRegistry,
  createEventHookManager,
  PluginLifecycleHook,
  RouterEventType,
  // 内存管理和错误处理
  ResourceLifecycleManager,
  SmartCacheManager,
  MemoryLeakDetector,
  RouterErrorTracker,
  RouterError as RouterErrorEnhanced,
  createLifecycleManager,
  createSmartCache,
  createMemoryLeakDetector,
  createErrorTracker,
  ResourceLifecycleState,
  CacheCleanupStrategy,
  RouterErrorType as RouterErrorTypeEnum,
} from './features'

export type {
  LazyLoadOptions,
  LazyLoadState,
  ComponentLoader as FeaturesComponentLoader,
  SSRContext as FeaturesSSRContext,
  SSRState,
  PrefetchStrategy,
  NetworkType,
  PrefetchOptions,
  Permission,
  Role,
  PermissionChecker,
  RoleChecker,
  PermissionOptions,
  RouteVisit,
  NavigationPerformance,
  RouteError,
  AnalyticsStats,
  AnalyticsOptions,
  ReportFunction,
  CacheStrategy,
  CacheOptions,
  CacheItem,
  CacheStats,
  TransitionType,
  TransitionDirection,
  TransitionMode,
  TransitionConfig,
  TransitionManagerOptions,
  NavigationDirection as FeaturesNavigationDirection,
  StorageType,
  PersistedState,
  PersistenceOptions,
  GuardType,
  GuardReturn,
  Guard,
  AfterHook,
  GuardRegistration,
  GuardResult,
  GuardManagerOptions,
  ScrollBehaviorType,
  ScrollTarget,
  SavedScrollPosition,
  ScrollStrategy,
  ScrollManagerOptions,
  MatchCacheItem,
  MatchCacheStats,
  MatchCacheOptions,
  PerformanceMetrics,
  PerformanceStats,
  PerformanceWarning,
  PerformanceMonitorOptions,
  // 中间件系统类型
  MiddlewareFunction,
  MiddlewareOptions,
  MiddlewareCondition,
  MiddlewareContext,
  MiddlewareExecutionStats,
  MiddlewarePerformanceReport,
  MiddlewareManagerOptions,
  MiddlewareResult,
  // 增强路由匹配器类型
  RouteParamValidator,
  RouteGroupConfig,
  RouteGuard,
  RouteGuardFunction,
  RouteMatchResult,
  PermissionConfig,
  EnhancedMatcherOptions,
  // 插件系统类型
  RouterPlugin,
  RouterPluginOptions,
  DynamicRouteConfig,
  EventHookManagerOptions,
  RouterEventData,
  RouterEventListener,
  // 内存管理和错误处理类型
  Disposable,
  ResourceReference,
  MemoryLeakDetectorOptions,
  CacheEntry,
  ErrorContext,
} from './features'

