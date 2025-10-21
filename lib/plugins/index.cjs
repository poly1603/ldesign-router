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

var animation = require('./animation.cjs');
var cache = require('./cache.cjs');
var performance = require('./performance.cjs');
var preload = require('./preload.cjs');



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
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
