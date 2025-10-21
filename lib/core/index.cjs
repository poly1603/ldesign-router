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

var constants = require('./constants.cjs');
var history = require('./history.cjs');
var matcher = require('./matcher.cjs');
var router = require('./router.cjs');



Object.defineProperty(exports, "AnimationType", {
	enumerable: true,
	get: function () { return constants.AnimationType; }
});
Object.defineProperty(exports, "CacheStrategy", {
	enumerable: true,
	get: function () { return constants.CacheStrategy; }
});
exports.DEFAULT_ANIMATION_DURATION = constants.DEFAULT_ANIMATION_DURATION;
exports.DEFAULT_CACHE_SIZE = constants.DEFAULT_CACHE_SIZE;
exports.DEFAULT_LINK_ACTIVE_CLASS = constants.DEFAULT_LINK_ACTIVE_CLASS;
exports.DEFAULT_LINK_EXACT_ACTIVE_CLASS = constants.DEFAULT_LINK_EXACT_ACTIVE_CLASS;
exports.DEFAULT_PRELOAD_DELAY = constants.DEFAULT_PRELOAD_DELAY;
exports.DEFAULT_VIEW_NAME = constants.DEFAULT_VIEW_NAME;
exports.EMPTY_STRING = constants.EMPTY_STRING;
Object.defineProperty(exports, "ErrorTypes", {
	enumerable: true,
	get: function () { return constants.ErrorTypes; }
});
exports.HASH_SEPARATOR = constants.HASH_SEPARATOR;
Object.defineProperty(exports, "HttpStatusCode", {
	enumerable: true,
	get: function () { return constants.HttpStatusCode; }
});
exports.IS_DEV = constants.IS_DEV;
exports.IS_PROD = constants.IS_PROD;
exports.IS_TEST = constants.IS_TEST;
exports.MIN_VUE_VERSION = constants.MIN_VUE_VERSION;
Object.defineProperty(exports, "NavigationFailureType", {
	enumerable: true,
	get: function () { return constants.NavigationFailureType; }
});
exports.OPTIONAL_PARAM_RE = constants.OPTIONAL_PARAM_RE;
exports.PARAM_RE = constants.PARAM_RE;
exports.PATH_SEPARATOR = constants.PATH_SEPARATOR;
exports.PERFORMANCE_WARNING_THRESHOLD = constants.PERFORMANCE_WARNING_THRESHOLD;
Object.defineProperty(exports, "PerformanceEventType", {
	enumerable: true,
	get: function () { return constants.PerformanceEventType; }
});
Object.defineProperty(exports, "PreloadStrategy", {
	enumerable: true,
	get: function () { return constants.PreloadStrategy; }
});
exports.QUERY_ITEM_SEPARATOR = constants.QUERY_ITEM_SEPARATOR;
exports.QUERY_KV_SEPARATOR = constants.QUERY_KV_SEPARATOR;
exports.QUERY_SEPARATOR = constants.QUERY_SEPARATOR;
exports.ROOT_PATH = constants.ROOT_PATH;
exports.ROUTER_INJECTION_SYMBOL = constants.ROUTER_INJECTION_SYMBOL;
exports.ROUTER_VERSION = constants.ROUTER_VERSION;
exports.ROUTER_VIEW_LOCATION_SYMBOL = constants.ROUTER_VIEW_LOCATION_SYMBOL;
exports.ROUTE_INJECTION_SYMBOL = constants.ROUTE_INJECTION_SYMBOL;
exports.START_LOCATION = constants.START_LOCATION;
exports.SUPPORTS_HISTORY = constants.SUPPORTS_HISTORY;
exports.SUPPORTS_INTERSECTION_OBSERVER = constants.SUPPORTS_INTERSECTION_OBSERVER;
exports.SUPPORTS_REQUEST_IDLE_CALLBACK = constants.SUPPORTS_REQUEST_IDLE_CALLBACK;
exports.WILDCARD_RE = constants.WILDCARD_RE;
exports.__DEV__ = constants.__DEV__;
exports.createMemoryHistory = history.createMemoryHistory;
exports.createWebHashHistory = history.createWebHashHistory;
exports.createWebHistory = history.createWebHistory;
exports.RouteMatcher = matcher.RouteMatcher;
exports.createRouter = router.createRouter;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
