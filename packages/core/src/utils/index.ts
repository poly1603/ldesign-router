/**
 * @ldesign/router-core 工具函数统一导出
 *
 * @module utils
 */

// 路径处理工具
export {
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,
  extractParamNames,
  normalizeParams,
} from './path'

// 查询参数处理工具
export {
  parseQuery,
  stringifyQuery,
  mergeQuery,
  normalizeQuery,
} from './query'

// URL 处理工具
export {
  parseURL,
  stringifyURL,
  normalizeURL,
  isSameURL,
} from './url'

export type {
  ParsedURL,
} from './url'

// 路径匹配工具
export {
  PathMatcher,
  createMatcher,
  matchPath,
  isMatch,
  extractParams,
  compareMatchResults,
  MatcherRegistry,
  createMatcherRegistry,
} from './matcher'

export type {
  MatchResult,
  MatcherOptions,
} from './matcher'

// Trie 树匹配器（高性能路由匹配）
export {
  TrieMatcher,
  createTrieMatcher as createTrieRouterMatcher,
} from './trie-matcher'

export type {
  TrieMatcherOptions,
  MatchStats as TrieMatchStats,
} from './trie-matcher'

// 内存管理器
export {
  MemoryManager,
  createMemoryManager,
} from './memory-manager'

export type {
  MemoryUsage,
  MemoryManagerOptions,
  Cleanable,
  MemoryStats,
} from './memory-manager'

// 错误处理
export {
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
} from './errors'

export type {
  RouterErrorType,
  ErrorHandler,
  RecoveryStrategy,
} from './errors'

// 路由标准化
export {
  RouteNormalizer,
  createNormalizer,
  normalizeRouteRecord,
  normalizeRouteRecords,
  normalizeLocation,
  validateRouteRecord,
  validateLocation,
} from './normalizer'

export type {
  NormalizeOptions,
  ValidationResult,
} from './normalizer'

// 高级查询参数工具
export {
  parseQueryEnhanced,
  stringifyQueryEnhanced,
  transformQuery,
  mergeQueryEnhanced,
  isSameQuery,
  pickQuery,
  omitQuery,
} from './query-advanced'

export type {
  QueryValue,
  QueryObject,
  QueryParamConfig,
  QueryParamsConfig,
  StringifyOptions,
  ParseOptions,
} from './query-advanced'

// 路由别名
export {
  AliasManager,
  createAliasManager,
  expandRouteWithAliases,
  expandRoutesWithAliases,
  normalizeAliasPath,
  validateAliasConfig,
  mergeAliasConfigs,
} from './alias'

export type {
  AliasConfig,
  AliasRecord,
  AliasMatchResult,
} from './alias'

// 高级路径工具
export {
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
} from './path-advanced'

export type {
  PathSegment,
  PathCompareOptions,
  PathRelation,
} from './path-advanced'

// 路由验证器
export {
  RouteValidator,
  createValidator,
  validateRoutes,
  check404Route,
  checkRootRoute,
  generateReport,
} from './validator'

export type {
  ValidationLevel,
  ValidationIssue,
  ValidationResult,
  ValidatorOptions,
  ValidationRule,
} from './validator'

// 路由优化工具包
export {
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
} from './optimization'

export type {
  MemoryUsage,
  CodeSplitStrategy,
  I18nRouteConfig,
  DevToolsEvent,
  DevToolsHook,
} from './optimization'

