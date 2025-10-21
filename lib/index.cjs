/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var index = require('./ab-testing/index.cjs');
var routeAnalytics = require('./analytics/route-analytics.cjs');
var DeviceUnsupported = require('./components/DeviceUnsupported.cjs');
var ErrorBoundary = require('./components/ErrorBoundary.cjs');
var RouterLink = require('./components/RouterLink.cjs');
var RouterView = require('./components/RouterView.cjs');
var LocaleSwitcher = require('./components/LocaleSwitcher.cjs');
var index$1 = require('./composables/index.cjs');
var useFormRoute = require('./composables/useFormRoute.cjs');
var constants = require('./core/constants.cjs');
var history = require('./core/history.cjs');
var matcher = require('./core/matcher.cjs');
var router = require('./core/router.cjs');
var devTools = require('./debug/dev-tools.cjs');
var RouteDebugger = require('./debug/RouteDebugger.cjs');
var guard = require('./device/guard.cjs');
var plugin = require('./device/plugin.cjs');
var resolver = require('./device/resolver.cjs');
var utils = require('./device/utils.cjs');
var plugin$1 = require('./engine/plugin.cjs');
var index$2 = require('./features/code-splitting/index.cjs');
var index$3 = require('./features/data-fetching/index.cjs');
var index$4 = require('./features/i18n/index.cjs');
var RoutePerformanceAnalyzer = require('./features/RoutePerformanceAnalyzer.cjs');
var RouteSecurity = require('./features/RouteSecurity.cjs');
var RouteVersionControl = require('./features/RouteVersionControl.cjs');
var ScrollBehavior = require('./features/ScrollBehavior.cjs');
var SmartRouteManager = require('./features/SmartRouteManager.cjs');
var index$5 = require('./guards/index.cjs');
var FormRouteManager = require('./managers/FormRouteManager.cjs');
var index$6 = require('./micro-frontend/index.cjs');
var index$7 = require('./middleware/index.cjs');
var animation = require('./plugins/animation.cjs');
var cache = require('./plugins/cache.cjs');
var performance = require('./plugins/performance.cjs');
var preload = require('./plugins/preload.cjs');
var routeState = require('./state/route-state.cjs');
var index$8 = require('./utils/index.cjs');
var unifiedMemoryManager = require('./utils/unified-memory-manager.cjs');
var useDeviceComponent = require('./composables/useDeviceComponent.cjs');
var useDeviceRoute = require('./composables/useDeviceRoute.cjs');

async function createFullRouter(options) {
  const [vueRouter, animationPlugin, cachePlugin, performancePlugin, preloadPlugin] = await Promise.all([Promise.resolve().then(function () { return require('./core/router.cjs'); }), Promise.resolve().then(function () { return require('./plugins/animation.cjs'); }), Promise.resolve().then(function () { return require('./plugins/cache.cjs'); }), Promise.resolve().then(function () { return require('./plugins/performance.cjs'); }), Promise.resolve().then(function () { return require('./plugins/preload.cjs'); })]);
  const {
    RouterLink: RouterLink2,
    RouterView: RouterView2
  } = await Promise.resolve().then(function () { return require('./components/index.cjs'); });
  const {
    DEFAULT_LINK_ACTIVE_CLASS: DEFAULT_LINK_ACTIVE_CLASS2,
    DEFAULT_LINK_EXACT_ACTIVE_CLASS: DEFAULT_LINK_EXACT_ACTIVE_CLASS2,
    AnimationType: AnimationType2,
    CacheStrategy: CacheStrategy2,
    PreloadStrategy: PreloadStrategy2
  } = await Promise.resolve().then(function () { return require('./core/constants.cjs'); });
  const routerOptions = {
    history: options.history,
    routes: options.routes,
    linkActiveClass: options.linkActiveClass || DEFAULT_LINK_ACTIVE_CLASS2,
    linkExactActiveClass: options.linkExactActiveClass || DEFAULT_LINK_EXACT_ACTIVE_CLASS2
  };
  if (options.scrollBehavior) {
    routerOptions.scrollBehavior = options.scrollBehavior;
  }
  const router = vueRouter.createRouter(routerOptions);
  const plugins = [];
  if (options.animation?.enabled !== false) {
    plugins.push(animationPlugin.createAnimationPlugin({
      defaultAnimation: options.animation?.defaultAnimation || AnimationType2.FADE,
      customAnimations: options.animation?.customAnimations || {}
    }));
  }
  if (options.cache?.enabled !== false) {
    plugins.push(cachePlugin.createCachePlugin({
      strategy: options.cache?.strategy || CacheStrategy2.MEMORY,
      maxSize: options.cache?.maxSize || 3
      // 优化：降低到 3MB
    }));
  }
  if (options.preload?.enabled !== false) {
    plugins.push(preloadPlugin.createPreloadPlugin({
      strategy: options.preload?.strategy || PreloadStrategy2.IDLE,
      autoPreloadRelated: options.preload?.autoPreloadRelated ?? false
    }));
  }
  if (options.performance?.enabled !== false) {
    plugins.push(performancePlugin.createPerformancePlugin({
      warningThreshold: options.performance?.warningThreshold || 500,
      // 优化：降低到 500ms
      errorThreshold: options.performance?.errorThreshold || 2e3
      // 优化：降低到 2000ms
    }));
  }
  return {
    router,
    plugins,
    install(app) {
      app.use(router);
      app.component("RouterLink", RouterLink2);
      app.component("RouterView", RouterView2);
      app.component("router-link", RouterLink2);
      app.component("router-view", RouterView2);
      plugins.forEach((plugin) => {
        if (plugin.install) {
          plugin.install(app, router);
        }
      });
    }
  };
}

exports.ABTestManager = index.ABTestManager;
exports.ABTestPlugin = index.ABTestPlugin;
exports.GoogleAnalyticsAdapter = index.GoogleAnalyticsAdapter;
exports.useABTest = index.useABTest;
exports.RouteAnalytics = routeAnalytics.RouteAnalytics;
exports.createRouteAnalytics = routeAnalytics.createRouteAnalytics;
exports.DeviceUnsupported = DeviceUnsupported.default;
exports.ErrorBoundary = ErrorBoundary.ErrorBoundary;
exports.ErrorRecoveryStrategies = ErrorBoundary.ErrorRecoveryStrategies;
exports.RouteErrorHandler = ErrorBoundary.RouteErrorHandler;
exports.withErrorBoundary = ErrorBoundary.withErrorBoundary;
exports.RouterLink = RouterLink.RouterLink;
exports.RouterView = RouterView.RouterView;
exports.LocaleSwitcher = LocaleSwitcher.LocaleSwitcher;
exports.hasRoute = index$1.hasRoute;
exports.hasRouter = index$1.hasRouter;
exports.onBeforeRouteLeave = index$1.onBeforeRouteLeave;
exports.onBeforeRouteUpdate = index$1.onBeforeRouteUpdate;
exports.useHash = index$1.useHash;
exports.useLink = index$1.useLink;
exports.useMatched = index$1.useMatched;
exports.useMeta = index$1.useMeta;
exports.useNavigation = index$1.useNavigation;
exports.useParams = index$1.useParams;
exports.useQuery = index$1.useQuery;
exports.useRoute = index$1.useRoute;
exports.useRouter = index$1.useRouter;
exports.FormRoutePlugin = useFormRoute.FormRoutePlugin;
exports.useFormRoute = useFormRoute.useFormRoute;
exports.useMultiStepForm = useFormRoute.useMultiStepForm;
Object.defineProperty(exports, "AnimationType", {
    enumerable: true,
    get: function () { return constants.AnimationType; }
});
Object.defineProperty(exports, "CacheStrategy", {
    enumerable: true,
    get: function () { return constants.CacheStrategy; }
});
exports.DEFAULT_LINK_ACTIVE_CLASS = constants.DEFAULT_LINK_ACTIVE_CLASS;
exports.DEFAULT_LINK_EXACT_ACTIVE_CLASS = constants.DEFAULT_LINK_EXACT_ACTIVE_CLASS;
exports.DEFAULT_VIEW_NAME = constants.DEFAULT_VIEW_NAME;
Object.defineProperty(exports, "ErrorTypes", {
    enumerable: true,
    get: function () { return constants.ErrorTypes; }
});
Object.defineProperty(exports, "NavigationFailureType", {
    enumerable: true,
    get: function () { return constants.NavigationFailureType; }
});
Object.defineProperty(exports, "PreloadStrategy", {
    enumerable: true,
    get: function () { return constants.PreloadStrategy; }
});
exports.START_LOCATION = constants.START_LOCATION;
exports.createMemoryHistory = history.createMemoryHistory;
exports.createWebHashHistory = history.createWebHashHistory;
exports.createWebHistory = history.createWebHistory;
exports.RouteMatcher = matcher.RouteMatcher;
exports.createRouter = router.createRouter;
exports.DevToolsPanel = devTools.DevToolsPanel;
exports.RouteInspector = devTools.RouteInspector;
exports.createDevTools = devTools.createDevTools;
exports.RouteDebugger = RouteDebugger.RouteDebugger;
exports.getRouteDebugger = RouteDebugger.getRouteDebugger;
exports.setupRouteDebugger = RouteDebugger.setupRouteDebugger;
exports.DeviceRouteGuard = guard.DeviceRouteGuard;
exports.createDeviceRouterPlugin = plugin.createDeviceRouterPlugin;
exports.DeviceComponentResolver = resolver.DeviceComponentResolver;
exports.checkDeviceSupport = utils.checkDeviceSupport;
exports.createUnsupportedDeviceRoute = utils.createUnsupportedDeviceRoute;
exports.resolveDeviceComponent = utils.resolveDeviceComponent;
exports.createDefaultRouterEnginePlugin = plugin$1.createDefaultRouterEnginePlugin;
exports.createRouterEnginePlugin = plugin$1.createRouterEnginePlugin;
exports.routerPlugin = plugin$1.routerPlugin;
exports.CodeSplittingManager = index$2.CodeSplittingManager;
exports.CodeSplittingPlugin = index$2.CodeSplittingPlugin;
exports.createCodeSplittingManager = index$2.createCodeSplittingManager;
exports.DataFetchingManager = index$3.DataFetchingManager;
exports.DataFetchingPlugin = index$3.DataFetchingPlugin;
exports.defineAsyncComponent = index$3.defineAsyncComponent;
exports.defineLoader = index$3.defineLoader;
exports.setupDataFetching = index$3.setupDataFetching;
exports.useRouteData = index$3.useRouteData;
exports.I18nRouteManager = index$4.I18nRouteManager;
exports.I18nRouterPlugin = index$4.I18nRouterPlugin;
exports.getI18nManager = index$4.getI18nManager;
exports.setupI18nRouter = index$4.setupI18nRouter;
exports.useI18nRoute = index$4.useI18nRoute;
exports.RoutePerformanceAnalyzer = RoutePerformanceAnalyzer.RoutePerformanceAnalyzer;
exports.generatePerformanceReport = RoutePerformanceAnalyzer.generatePerformanceReport;
exports.getPerformanceAnalyzer = RoutePerformanceAnalyzer.getPerformanceAnalyzer;
exports.getPerformanceSuggestions = RoutePerformanceAnalyzer.getPerformanceSuggestions;
exports.setupPerformanceAnalyzer = RoutePerformanceAnalyzer.setupPerformanceAnalyzer;
exports.AuthManager = RouteSecurity.AuthManager;
exports.CSRFProtection = RouteSecurity.CSRFProtection;
exports.PermissionManager = RouteSecurity.PermissionManager;
exports.RouteSecurityManager = RouteSecurity.RouteSecurityManager;
exports.XSSProtection = RouteSecurity.XSSProtection;
exports.checkPermission = RouteSecurity.checkPermission;
exports.getCurrentUser = RouteSecurity.getCurrentUser;
exports.isAuthenticated = RouteSecurity.isAuthenticated;
exports.sanitizeContent = RouteSecurity.sanitizeContent;
exports.setupRouteSecurity = RouteSecurity.setupRouteSecurity;
exports.RouteVersionControl = RouteVersionControl.RouteVersionControl;
exports.createRouteVersion = RouteVersionControl.createRouteVersion;
exports.getVersionControl = RouteVersionControl.getVersionControl;
exports.restoreRouteVersion = RouteVersionControl.restoreRouteVersion;
exports.setupRouteVersionControl = RouteVersionControl.setupRouteVersionControl;
exports.ScrollBehaviorManager = ScrollBehavior.ScrollBehaviorManager;
exports.ScrollBehaviorPlugin = ScrollBehavior.ScrollBehaviorPlugin;
exports.createScrollBehavior = ScrollBehavior.createScrollBehavior;
exports.getScrollManager = ScrollBehavior.getScrollManager;
exports.AutoRouteGenerator = SmartRouteManager.AutoRouteGenerator;
exports.DynamicRouteLoader = SmartRouteManager.DynamicRouteLoader;
exports.NestedRouteOptimizer = SmartRouteManager.NestedRouteOptimizer;
exports.RouteGroupManager = SmartRouteManager.RouteGroupManager;
exports.SmartRouteManager = SmartRouteManager.SmartRouteManager;
exports.addDynamicRoute = SmartRouteManager.addDynamicRoute;
exports.getRouteStatistics = SmartRouteManager.getRouteStatistics;
exports.setupSmartRouteManager = SmartRouteManager.setupSmartRouteManager;
exports.combineGuards = index$5.combineGuards;
exports.createAuthGuard = index$5.createAuthGuard;
exports.createLoadingGuard = index$5.createLoadingGuard;
exports.createPermissionGuard = index$5.createPermissionGuard;
exports.createProgressGuard = index$5.createProgressGuard;
exports.createScrollGuard = index$5.createScrollGuard;
exports.createTitleGuard = index$5.createTitleGuard;
exports.FormRouteManager = FormRouteManager.FormRouteManager;
exports.MicroFrontendPlugin = index$6.MicroFrontendPlugin;
exports.MicroFrontendRouter = index$6.MicroFrontendRouter;
exports.useMicroFrontend = index$6.useMicroFrontend;
exports.MiddlewareManager = index$7.MiddlewareManager;
exports.authMiddleware = index$7.authMiddleware;
exports.createCacheMiddleware = index$7.createCacheMiddleware;
exports.createRateLimitMiddleware = index$7.createRateLimitMiddleware;
exports.loggingMiddleware = index$7.loggingMiddleware;
exports.middlewareManager = index$7.middlewareManager;
exports.permissionMiddleware = index$7.permissionMiddleware;
exports.progressMiddleware = index$7.progressMiddleware;
exports.roleMiddleware = index$7.roleMiddleware;
exports.titleMiddleware = index$7.titleMiddleware;
exports.ANIMATION_PRESETS = animation.ANIMATION_PRESETS;
exports.AnimationManager = animation.AnimationManager;
exports.createAnimationConfig = animation.createAnimationConfig;
exports.createAnimationPlugin = animation.createAnimationPlugin;
exports.getAnimationDuration = animation.getAnimationDuration;
exports.supportsAnimations = animation.supportsAnimations;
exports.CacheManager = cache.CacheManager;
exports.createCacheConfig = cache.createCacheConfig;
exports.createCachePlugin = cache.createCachePlugin;
exports.supportsCaching = cache.supportsCaching;
Object.defineProperty(exports, "PerformanceEventType", {
    enumerable: true,
    get: function () { return performance.PerformanceEventType; }
});
exports.PerformanceManager = performance.PerformanceManager;
exports.createPerformanceConfig = performance.createPerformanceConfig;
exports.createPerformancePlugin = performance.createPerformancePlugin;
exports.getPagePerformance = performance.getPagePerformance;
exports.supportsPerformanceAPI = performance.supportsPerformanceAPI;
exports.withPerformanceMonitoring = performance.withPerformanceMonitoring;
exports.HoverPreloadStrategy = preload.HoverPreloadStrategy;
exports.IdlePreloadStrategy = preload.IdlePreloadStrategy;
exports.PreloadManager = preload.PreloadManager;
exports.VisibilityPreloadStrategy = preload.VisibilityPreloadStrategy;
exports.createPreloadConfig = preload.createPreloadConfig;
exports.createPreloadPlugin = preload.createPreloadPlugin;
exports.supportsPreload = preload.supportsPreload;
exports.RouteStateManager = routeState.RouteStateManager;
exports.createRouteStateManager = routeState.createRouteStateManager;
exports.useRouteState = routeState.useRouteState;
exports.buildPath = index$8.buildPath;
exports.cloneRouteLocation = index$8.cloneRouteLocation;
exports.createNavigationFailure = index$8.createNavigationFailure;
exports.extractParams = index$8.extractParams;
exports.getRouteDepth = index$8.getRouteDepth;
exports.isChildRoute = index$8.isChildRoute;
exports.isNavigationFailure = index$8.isNavigationFailure;
exports.isSameRouteLocation = index$8.isSameRouteLocation;
exports.joinPaths = index$8.joinPaths;
exports.matchPath = index$8.matchPath;
exports.mergeQuery = index$8.mergeQuery;
exports.normalizeParams = index$8.normalizeParams;
exports.normalizePath = index$8.normalizePath;
exports.parsePathParams = index$8.parsePathParams;
exports.parseQuery = index$8.parseQuery;
exports.parseURL = index$8.parseURL;
exports.resolveRouteLocation = index$8.resolveRouteLocation;
exports.stringifyQuery = index$8.stringifyQuery;
exports.stringifyURL = index$8.stringifyURL;
Object.defineProperty(exports, "CachePriority", {
    enumerable: true,
    get: function () { return unifiedMemoryManager.CachePriority; }
});
exports.UnifiedMemoryManager = unifiedMemoryManager.UnifiedMemoryManager;
exports.cacheGet = unifiedMemoryManager.cacheGet;
exports.cacheSet = unifiedMemoryManager.cacheSet;
exports.cleanupMemory = unifiedMemoryManager.cleanupMemory;
exports.getMemoryManager = unifiedMemoryManager.getMemoryManager;
exports.useDeviceComponent = useDeviceComponent.useDeviceComponent;
exports.useDeviceRoute = useDeviceRoute.useDeviceRoute;
exports.createFullRouter = createFullRouter;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
