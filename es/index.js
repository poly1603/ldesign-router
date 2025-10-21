/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { ABTestManager, ABTestPlugin, GoogleAnalyticsAdapter, useABTest } from './ab-testing/index.js';
export { RouteAnalytics, createRouteAnalytics } from './analytics/route-analytics.js';
export { default as DeviceUnsupported } from './components/DeviceUnsupported.js';
export { ErrorBoundary, ErrorRecoveryStrategies, RouteErrorHandler, withErrorBoundary } from './components/ErrorBoundary.js';
export { RouterLink } from './components/RouterLink.js';
export { RouterView } from './components/RouterView.js';
export { LocaleSwitcher } from './components/LocaleSwitcher.js';
export { hasRoute, hasRouter, onBeforeRouteLeave, onBeforeRouteUpdate, useHash, useLink, useMatched, useMeta, useNavigation, useParams, useQuery, useRoute, useRouter } from './composables/index.js';
export { FormRoutePlugin, useFormRoute, useMultiStepForm } from './composables/useFormRoute.js';
export { AnimationType, CacheStrategy, DEFAULT_LINK_ACTIVE_CLASS, DEFAULT_LINK_EXACT_ACTIVE_CLASS, DEFAULT_VIEW_NAME, ErrorTypes, NavigationFailureType, PreloadStrategy, START_LOCATION } from './core/constants.js';
export { createMemoryHistory, createWebHashHistory, createWebHistory } from './core/history.js';
export { RouteMatcher } from './core/matcher.js';
export { createRouter } from './core/router.js';
export { DevToolsPanel, RouteInspector, createDevTools } from './debug/dev-tools.js';
export { RouteDebugger, getRouteDebugger, setupRouteDebugger } from './debug/RouteDebugger.js';
export { DeviceRouteGuard } from './device/guard.js';
export { createDeviceRouterPlugin } from './device/plugin.js';
export { DeviceComponentResolver } from './device/resolver.js';
export { checkDeviceSupport, createUnsupportedDeviceRoute, resolveDeviceComponent } from './device/utils.js';
export { createDefaultRouterEnginePlugin, createRouterEnginePlugin, routerPlugin } from './engine/plugin.js';
export { CodeSplittingManager, CodeSplittingPlugin, createCodeSplittingManager } from './features/code-splitting/index.js';
export { DataFetchingManager, DataFetchingPlugin, defineAsyncComponent, defineLoader, setupDataFetching, useRouteData } from './features/data-fetching/index.js';
export { I18nRouteManager, I18nRouterPlugin, getI18nManager, setupI18nRouter, useI18nRoute } from './features/i18n/index.js';
export { RoutePerformanceAnalyzer, generatePerformanceReport, getPerformanceAnalyzer, getPerformanceSuggestions, setupPerformanceAnalyzer } from './features/RoutePerformanceAnalyzer.js';
export { AuthManager, CSRFProtection, PermissionManager, RouteSecurityManager, XSSProtection, checkPermission, getCurrentUser, isAuthenticated, sanitizeContent, setupRouteSecurity } from './features/RouteSecurity.js';
export { RouteVersionControl, createRouteVersion, getVersionControl, restoreRouteVersion, setupRouteVersionControl } from './features/RouteVersionControl.js';
export { ScrollBehaviorManager, ScrollBehaviorPlugin, createScrollBehavior, getScrollManager } from './features/ScrollBehavior.js';
export { AutoRouteGenerator, DynamicRouteLoader, NestedRouteOptimizer, RouteGroupManager, SmartRouteManager, addDynamicRoute, getRouteStatistics, setupSmartRouteManager } from './features/SmartRouteManager.js';
export { combineGuards, createAuthGuard, createLoadingGuard, createPermissionGuard, createProgressGuard, createScrollGuard, createTitleGuard } from './guards/index.js';
export { FormRouteManager } from './managers/FormRouteManager.js';
export { MicroFrontendPlugin, MicroFrontendRouter, useMicroFrontend } from './micro-frontend/index.js';
export { MiddlewareManager, authMiddleware, createCacheMiddleware, createRateLimitMiddleware, loggingMiddleware, middlewareManager, permissionMiddleware, progressMiddleware, roleMiddleware, titleMiddleware } from './middleware/index.js';
export { ANIMATION_PRESETS, AnimationManager, createAnimationConfig, createAnimationPlugin, getAnimationDuration, supportsAnimations } from './plugins/animation.js';
export { CacheManager, createCacheConfig, createCachePlugin, supportsCaching } from './plugins/cache.js';
export { PerformanceEventType, PerformanceManager, createPerformanceConfig, createPerformancePlugin, getPagePerformance, supportsPerformanceAPI, withPerformanceMonitoring } from './plugins/performance.js';
export { HoverPreloadStrategy, IdlePreloadStrategy, PreloadManager, VisibilityPreloadStrategy, createPreloadConfig, createPreloadPlugin, supportsPreload } from './plugins/preload.js';
export { RouteStateManager, createRouteStateManager, useRouteState } from './state/route-state.js';
export { buildPath, cloneRouteLocation, createNavigationFailure, extractParams, getRouteDepth, isChildRoute, isNavigationFailure, isSameRouteLocation, joinPaths, matchPath, mergeQuery, normalizeParams, normalizePath, parsePathParams, parseQuery, parseURL, resolveRouteLocation, stringifyQuery, stringifyURL } from './utils/index.js';
export { CachePriority, UnifiedMemoryManager, cacheGet, cacheSet, cleanupMemory, getMemoryManager } from './utils/unified-memory-manager.js';
export { useDeviceComponent } from './composables/useDeviceComponent.js';
export { useDeviceRoute } from './composables/useDeviceRoute.js';

async function createFullRouter(options) {
  const [vueRouter, animationPlugin, cachePlugin, performancePlugin, preloadPlugin] = await Promise.all([import('./core/router.js'), import('./plugins/animation.js'), import('./plugins/cache.js'), import('./plugins/performance.js'), import('./plugins/preload.js')]);
  const {
    RouterLink: RouterLink2,
    RouterView: RouterView2
  } = await import('./components/index.js');
  const {
    DEFAULT_LINK_ACTIVE_CLASS: DEFAULT_LINK_ACTIVE_CLASS2,
    DEFAULT_LINK_EXACT_ACTIVE_CLASS: DEFAULT_LINK_EXACT_ACTIVE_CLASS2,
    AnimationType: AnimationType2,
    CacheStrategy: CacheStrategy2,
    PreloadStrategy: PreloadStrategy2
  } = await import('./core/constants.js');
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

export { createFullRouter };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
