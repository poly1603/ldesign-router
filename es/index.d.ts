/**
 * @ldesign/router 主入口文件
 *
 * 一个现代化、高性能、类型安全的 Vue 路由库
 * 完全独立于 vue-router，提供更好的开发体验和性能
 */
export { ABTestManager, ABTestPlugin, GoogleAnalyticsAdapter, useABTest } from './ab-testing';
export type { ABTestExperiment, ABTestResult, ABTestVariant, AnalyticsAdapter, ExperimentGoal, TargetingRule, UserSegment, VariantStats } from './ab-testing';
export { createRouteAnalytics, RouteAnalytics, } from './analytics/route-analytics';
export type { AnalyticsConfig, PerformanceMetrics as AnalyticsPerformanceMetrics, RouteVisit, UserBehaviorEvent, } from './analytics/route-analytics';
export { DeviceUnsupported, ErrorBoundary, ErrorRecoveryStrategies, RouteErrorHandler, RouterLink, RouterView, withErrorBoundary, } from './components';
export type { DeviceUnsupportedProps, ErrorBoundaryProps, RouteErrorInfo, } from './components';
export { LocaleSwitcher, } from './components/LocaleSwitcher';
export type { AnimationConfig, CacheConfig, AnimationType as ComponentAnimationType, CacheStrategy as ComponentCacheStrategy, PreloadStrategy as ComponentPreloadStrategy, ComponentSize, LinkVariant, PerformanceConfig, PerformanceMetrics, PreloadConfig, RouterLinkProps, RouterLinkSlotProps, RouterViewProps, RouterViewSlotProps, } from './components/types';
export { useLink, useNavigation, useRoute, useRouter } from './composables';
export { useHash, useMatched, useMeta, useParams, useQuery, } from './composables';
export { onBeforeRouteLeave, onBeforeRouteUpdate } from './composables';
export { hasRoute, hasRouter } from './composables';
export { useDeviceComponent, useDeviceRoute } from './composables';
export type { UseDeviceRouteOptions, UseDeviceRouteReturn, } from './composables';
export type { UseLinkOptions, UseLinkReturn } from './composables';
export { FormRoutePlugin, useFormRoute, useMultiStepForm } from './composables/useFormRoute';
export { AnimationType, CacheStrategy, DEFAULT_LINK_ACTIVE_CLASS, DEFAULT_LINK_EXACT_ACTIVE_CLASS, DEFAULT_VIEW_NAME, ErrorTypes, NavigationFailureType, PreloadStrategy, START_LOCATION, } from './core/constants';
export { createMemoryHistory, createWebHashHistory, createWebHistory, } from './core/history';
export { RouteMatcher } from './core/matcher';
export { createRouter } from './core/router';
export type { RouterImpl } from './core/router';
export { createDevTools, DevToolsPanel, RouteInspector, } from './debug/dev-tools';
export { getRouteDebugger, RouteDebugger, setupRouteDebugger, } from './debug/RouteDebugger';
export type { DebugConfig, } from './debug/RouteDebugger';
export { createDeviceRouterPlugin, DeviceComponentResolver, DeviceRouteGuard, } from './device';
export { checkDeviceSupport, createUnsupportedDeviceRoute, resolveDeviceComponent, } from './device/utils';
export { createDefaultRouterEnginePlugin, createRouterEnginePlugin, routerPlugin, } from './engine';
export type { RouterEnginePluginOptions } from './engine';
export { CodeSplittingManager, CodeSplittingPlugin, createCodeSplittingManager, } from './features/code-splitting';
export type { ChunkInfo, ChunkPriority, LoadingMetrics as CodeSplittingMetrics, PreloadStrategy as CodeSplittingPreloadStrategy, ComponentLoadState, SplittingAnalysis, SplittingConfig, SplittingStrategy, } from './features/code-splitting';
export { DataFetchingManager, DataFetchingPlugin, defineAsyncComponent, defineLoader, setupDataFetching, useRouteData, } from './features/data-fetching';
export type { DataFetchingOptions, DataFetchingState, DataLoader, DataResolver, } from './features/data-fetching';
export { getI18nManager, I18nRouteManager, I18nRouterPlugin, setupI18nRouter, useI18nRoute, } from './features/i18n';
export type { I18nRouteConfig, } from './features/i18n';
/**
 * 创建完整的路由器实例（包含所有插件）
 * 提供一个便捷的方式来创建包含所有常用插件的路由器
 */
export declare function createFullRouter(options: {
    history: import('./types').RouterHistory;
    routes: import('./types').RouteRecordRaw[];
    animation?: {
        enabled?: boolean;
        defaultAnimation?: import('./core/constants').AnimationType;
        customAnimations?: Record<string, import('./components/types').AnimationConfig>;
    };
    cache?: {
        enabled?: boolean;
        strategy?: import('./core/constants').CacheStrategy;
        maxSize?: number;
    };
    preload?: {
        enabled?: boolean;
        strategy?: import('./core/constants').PreloadStrategy;
        autoPreloadRelated?: boolean;
    };
    performance?: {
        enabled?: boolean;
        warningThreshold?: number;
        errorThreshold?: number;
    };
    linkActiveClass?: string;
    linkExactActiveClass?: string;
    scrollBehavior?: import('./types').ScrollBehavior;
}): Promise<{
    router: import("./types").Router;
    plugins: any[];
    install(app: any): void;
}>;
export { generatePerformanceReport, getPerformanceAnalyzer, getPerformanceSuggestions, RoutePerformanceAnalyzer, setupPerformanceAnalyzer, } from './features/RoutePerformanceAnalyzer';
export type { AnalyzerConfig, OptimizationSuggestion, PerformanceMetric, PerformanceReport, } from './features/RoutePerformanceAnalyzer';
export { AuthManager, checkPermission, CSRFProtection, getCurrentUser, isAuthenticated, PermissionManager, RouteSecurityManager, sanitizeContent, setupRouteSecurity, XSSProtection, } from './features/RouteSecurity';
export type { SecurityConfig, } from './features/RouteSecurity';
export { createRouteVersion, getVersionControl, restoreRouteVersion, RouteVersionControl, setupRouteVersionControl, } from './features/RouteVersionControl';
export type { RouteVersion, VersionControlConfig, VersionDiff, } from './features/RouteVersionControl';
export { createScrollBehavior, getScrollManager, ScrollBehaviorManager, ScrollBehaviorPlugin, } from './features/ScrollBehavior';
export type { ScrollBehaviorOptions, } from './features/ScrollBehavior';
export { addDynamicRoute, AutoRouteGenerator, DynamicRouteLoader, getRouteStatistics, NestedRouteOptimizer, RouteGroupManager, setupSmartRouteManager, SmartRouteManager, } from './features/SmartRouteManager';
export type { RouteGroup, SmartRouteConfig, } from './features/SmartRouteManager';
export { combineGuards, createAuthGuard, createLoadingGuard, createPermissionGuard, createProgressGuard, createScrollGuard, createTitleGuard, } from './guards';
export type { AuthChecker, AuthGuardOptions, LoadingGuardOptions, PermissionChecker, PermissionGuardOptions, ProgressGuardOptions, ScrollGuardOptions, TitleGuardOptions, } from './guards';
export { FormRouteManager } from './managers/FormRouteManager';
export type { FormRouteConfig } from './managers/FormRouteManager';
export { MicroFrontendPlugin, MicroFrontendRouter, useMicroFrontend } from './micro-frontend';
export type { GlobalLifeCycles, MicroApp, MicroAppState, MicroFrontendConfig, SandboxConfig } from './micro-frontend';
export { authMiddleware, createCacheMiddleware, createRateLimitMiddleware, loggingMiddleware, MiddlewareManager, middlewareManager, permissionMiddleware, progressMiddleware, roleMiddleware, titleMiddleware, } from './middleware';
export type { MiddlewareConfig, MiddlewareContext, MiddlewareFunction, } from './middleware';
export { ANIMATION_PRESETS, AnimationManager, createAnimationConfig, createAnimationPlugin, getAnimationDuration, supportsAnimations, } from './plugins/animation';
export type { AnimationPluginOptions } from './plugins/animation';
export { CacheManager, createCacheConfig, createCachePlugin, supportsCaching, } from './plugins/cache';
export type { CachePluginOptions } from './plugins/cache';
export { createPerformanceConfig, createPerformancePlugin, getPagePerformance, PerformanceEventType, PerformanceManager, supportsPerformanceAPI, withPerformanceMonitoring, } from './plugins/performance';
export type { PerformancePluginOptions } from './plugins/performance';
export { createPreloadConfig, createPreloadPlugin, HoverPreloadStrategy, IdlePreloadStrategy, PreloadManager, supportsPreload, VisibilityPreloadStrategy, } from './plugins/preload';
export type { PreloadPluginOptions } from './plugins/preload';
export { createRouteStateManager, RouteStateManager, useRouteState, } from './state/route-state';
export type { RouteHistoryItem, RouteState, } from './state/route-state';
export type { HistoryLocation, HistoryState, NavigationCallback, NavigationDirection, NavigationFailure, NavigationGuard, NavigationGuardNext, NavigationGuardReturn, NavigationHookAfter, NavigationInformation, NavigationType, RouteComponent, RouteLocationBase, RouteLocationNormalized, RouteLocationNormalizedLoaded, RouteLocationRaw, RouteMeta, RouteParams, RouteQuery, Router, RouteRecord, RouteRecordNormalized, RouteRecordRaw, RouterHistory, RouterOptions, ScrollBehavior, ScrollPosition, UseRouteReturn, UseRouterReturn, } from './types';
export type { DeviceComponentResolution, DeviceGuardOptions, DeviceRouteConfig, DeviceRouterPluginOptions, } from './types';
export { buildPath, cloneRouteLocation, createNavigationFailure, extractParams, getRouteDepth, isChildRoute, isNavigationFailure, isSameRouteLocation, joinPaths, matchPath, mergeQuery, normalizeParams, normalizePath, parsePathParams, parseQuery, parseURL, resolveRouteLocation, stringifyQuery, stringifyURL, } from './utils';
export { cacheGet, CachePriority, cacheSet, cleanupMemory, getMemoryManager, UnifiedMemoryManager, } from './utils/unified-memory-manager';
export type { CacheItem, MemoryStats, UnifiedMemoryConfig, } from './utils/unified-memory-manager';
