/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
const nodeProcess = typeof process !== "undefined" ? process : void 0;
const __DEV__ = nodeProcess?.env?.NODE_ENV === "development";
const ROOT_PATH = "/";
const PATH_SEPARATOR = "/";
const HASH_SEPARATOR = "#";
const QUERY_SEPARATOR = "?";
const QUERY_ITEM_SEPARATOR = "&";
const QUERY_KV_SEPARATOR = "=";
const EMPTY_STRING = "";
const PARAM_RE = /:([\w-]+)(\?)?/g;
const OPTIONAL_PARAM_RE = /\?$/;
const WILDCARD_RE = /\*/g;
const DEFAULT_LINK_ACTIVE_CLASS = "router-link-active";
const DEFAULT_LINK_EXACT_ACTIVE_CLASS = "router-link-exact-active";
const DEFAULT_VIEW_NAME = "default";
const ROUTER_INJECTION_SYMBOL = Symbol("router");
const ROUTE_INJECTION_SYMBOL = Symbol("route");
const ROUTER_VIEW_LOCATION_SYMBOL = Symbol("router-view-location");
var ErrorTypes;
(function(ErrorTypes2) {
  ErrorTypes2["MATCHER_NOT_FOUND"] = "MATCHER_NOT_FOUND";
  ErrorTypes2["NAVIGATION_GUARD_REDIRECT"] = "NAVIGATION_GUARD_REDIRECT";
  ErrorTypes2["NAVIGATION_ABORTED"] = "NAVIGATION_ABORTED";
  ErrorTypes2["NAVIGATION_CANCELLED"] = "NAVIGATION_CANCELLED";
  ErrorTypes2["NAVIGATION_DUPLICATED"] = "NAVIGATION_DUPLICATED";
})(ErrorTypes || (ErrorTypes = {}));
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
const START_LOCATION = {
  path: "/",
  name: "",
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {}
};
const DEFAULT_ANIMATION_DURATION = 300;
var AnimationType;
(function(AnimationType2) {
  AnimationType2["FADE"] = "fade";
  AnimationType2["SLIDE"] = "slide";
  AnimationType2["SCALE"] = "scale";
  AnimationType2["FLIP"] = "flip";
  AnimationType2["NONE"] = "none";
})(AnimationType || (AnimationType = {}));
var PreloadStrategy;
(function(PreloadStrategy2) {
  PreloadStrategy2["HOVER"] = "hover";
  PreloadStrategy2["VISIBLE"] = "visible";
  PreloadStrategy2["IDLE"] = "idle";
  PreloadStrategy2["NONE"] = "none";
})(PreloadStrategy || (PreloadStrategy = {}));
const DEFAULT_PRELOAD_DELAY = 200;
var CacheStrategy;
(function(CacheStrategy2) {
  CacheStrategy2["MEMORY"] = "memory";
  CacheStrategy2["SESSION"] = "session";
  CacheStrategy2["LOCAL"] = "local";
  CacheStrategy2["NONE"] = "none";
})(CacheStrategy || (CacheStrategy = {}));
const DEFAULT_CACHE_SIZE = 10;
var PerformanceEventType;
(function(PerformanceEventType2) {
  PerformanceEventType2["NAVIGATION_START"] = "navigation-start";
  PerformanceEventType2["NAVIGATION_END"] = "navigation-end";
  PerformanceEventType2["COMPONENT_LOAD_START"] = "component-load-start";
  PerformanceEventType2["COMPONENT_LOAD_END"] = "component-load-end";
  PerformanceEventType2["ROUTE_MATCH_START"] = "route-match-start";
  PerformanceEventType2["ROUTE_MATCH_END"] = "route-match-end";
})(PerformanceEventType || (PerformanceEventType = {}));
const PERFORMANCE_WARNING_THRESHOLD = 1e3;
var HttpStatusCode;
(function(HttpStatusCode2) {
  HttpStatusCode2[HttpStatusCode2["OK"] = 200] = "OK";
  HttpStatusCode2[HttpStatusCode2["NOT_FOUND"] = 404] = "NOT_FOUND";
  HttpStatusCode2[HttpStatusCode2["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatusCode || (HttpStatusCode = {}));
const SUPPORTS_HISTORY = typeof window !== "undefined" && "history" in window && "pushState" in window.history;
const SUPPORTS_INTERSECTION_OBSERVER = typeof window !== "undefined" && "IntersectionObserver" in window;
const SUPPORTS_REQUEST_IDLE_CALLBACK = typeof window !== "undefined" && "requestIdleCallback" in window;
const IS_DEV = nodeProcess?.env?.NODE_ENV === "development";
const IS_PROD = nodeProcess?.env?.NODE_ENV === "production";
const IS_TEST = nodeProcess?.env?.NODE_ENV === "test";
const ROUTER_VERSION = "1.0.0";
const MIN_VUE_VERSION = "3.3.0";

export { AnimationType, CacheStrategy, DEFAULT_ANIMATION_DURATION, DEFAULT_CACHE_SIZE, DEFAULT_LINK_ACTIVE_CLASS, DEFAULT_LINK_EXACT_ACTIVE_CLASS, DEFAULT_PRELOAD_DELAY, DEFAULT_VIEW_NAME, EMPTY_STRING, ErrorTypes, HASH_SEPARATOR, HttpStatusCode, IS_DEV, IS_PROD, IS_TEST, MIN_VUE_VERSION, NavigationFailureType, OPTIONAL_PARAM_RE, PARAM_RE, PATH_SEPARATOR, PERFORMANCE_WARNING_THRESHOLD, PerformanceEventType, PreloadStrategy, QUERY_ITEM_SEPARATOR, QUERY_KV_SEPARATOR, QUERY_SEPARATOR, ROOT_PATH, ROUTER_INJECTION_SYMBOL, ROUTER_VERSION, ROUTER_VIEW_LOCATION_SYMBOL, ROUTE_INJECTION_SYMBOL, START_LOCATION, SUPPORTS_HISTORY, SUPPORTS_INTERSECTION_OBSERVER, SUPPORTS_REQUEST_IDLE_CALLBACK, WILDCARD_RE, __DEV__ };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=constants.js.map
