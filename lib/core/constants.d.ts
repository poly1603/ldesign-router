/**
 * @ldesign/router 常量定义
 *
 * 这个文件定义了路由系统中使用的所有常量
 */
import type { RouteLocationNormalized } from '../types';
/** 是否为开发模式 */
export declare const __DEV__: boolean;
/** 根路径 */
export declare const ROOT_PATH = "/";
/** 路径分隔符 */
export declare const PATH_SEPARATOR = "/";
/** 哈希分隔符 */
export declare const HASH_SEPARATOR = "#";
/** 查询参数分隔符 */
export declare const QUERY_SEPARATOR = "?";
/** 查询参数项分隔符 */
export declare const QUERY_ITEM_SEPARATOR = "&";
/** 查询参数键值分隔符 */
export declare const QUERY_KV_SEPARATOR = "=";
/** 空字符串 */
export declare const EMPTY_STRING = "";
/** 参数匹配正则 */
export declare const PARAM_RE: RegExp;
/** 可选参数匹配正则 */
export declare const OPTIONAL_PARAM_RE: RegExp;
/** 通配符匹配正则 */
export declare const WILDCARD_RE: RegExp;
/** 默认链接激活类名 */
export declare const DEFAULT_LINK_ACTIVE_CLASS = "router-link-active";
/** 默认链接精确激活类名 */
export declare const DEFAULT_LINK_EXACT_ACTIVE_CLASS = "router-link-exact-active";
/** 默认视图名称 */
export declare const DEFAULT_VIEW_NAME = "default";
/** 路由器注入键 */
export declare const ROUTER_INJECTION_SYMBOL: unique symbol;
/** 路由注入键 */
export declare const ROUTE_INJECTION_SYMBOL: unique symbol;
/** 路由视图位置注入键 */
export declare const ROUTER_VIEW_LOCATION_SYMBOL: unique symbol;
/** 错误类型枚举 */
export declare enum ErrorTypes {
    MATCHER_NOT_FOUND = "MATCHER_NOT_FOUND",
    NAVIGATION_GUARD_REDIRECT = "NAVIGATION_GUARD_REDIRECT",
    NAVIGATION_ABORTED = "NAVIGATION_ABORTED",
    NAVIGATION_CANCELLED = "NAVIGATION_CANCELLED",
    NAVIGATION_DUPLICATED = "NAVIGATION_DUPLICATED"
}
/** 导航失败类型 */
export declare enum NavigationFailureType {
    /** 导航被中止 */
    aborted = 4,
    /** 导航被取消 */
    cancelled = 8,
    /** 重复导航 */
    duplicated = 16
}
/** 起始路由位置 */
export declare const START_LOCATION: RouteLocationNormalized;
/** 默认动画持续时间（毫秒） */
export declare const DEFAULT_ANIMATION_DURATION = 300;
/** 动画类型 */
export declare enum AnimationType {
    FADE = "fade",
    SLIDE = "slide",
    SCALE = "scale",
    FLIP = "flip",
    NONE = "none"
}
/** 预加载策略 */
export declare enum PreloadStrategy {
    HOVER = "hover",
    VISIBLE = "visible",
    IDLE = "idle",
    NONE = "none"
}
/** 默认预加载延迟（毫秒） */
export declare const DEFAULT_PRELOAD_DELAY = 200;
/** 缓存策略 */
export declare enum CacheStrategy {
    MEMORY = "memory",
    SESSION = "session",
    LOCAL = "local",
    NONE = "none"
}
/** 默认缓存大小限制 */
export declare const DEFAULT_CACHE_SIZE = 10;
/** 性能监控事件类型 */
export declare enum PerformanceEventType {
    NAVIGATION_START = "navigation-start",
    NAVIGATION_END = "navigation-end",
    COMPONENT_LOAD_START = "component-load-start",
    COMPONENT_LOAD_END = "component-load-end",
    ROUTE_MATCH_START = "route-match-start",
    ROUTE_MATCH_END = "route-match-end"
}
/** 性能警告阈值（毫秒） */
export declare const PERFORMANCE_WARNING_THRESHOLD = 1000;
/** HTTP 状态码 */
export declare enum HttpStatusCode {
    OK = 200,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500
}
/** 是否支持 History API */
export declare const SUPPORTS_HISTORY: boolean;
/** 是否支持 IntersectionObserver */
export declare const SUPPORTS_INTERSECTION_OBSERVER: boolean;
/** 是否支持 requestIdleCallback */
export declare const SUPPORTS_REQUEST_IDLE_CALLBACK: boolean;
export declare const IS_DEV: boolean;
/** 是否为生产模式 */
export declare const IS_PROD: boolean;
/** 是否为测试模式 */
export declare const IS_TEST: boolean;
/** 路由器版本 */
export declare const ROUTER_VERSION = "1.0.0";
/** 最小 Vue 版本要求 */
export declare const MIN_VUE_VERSION = "3.3.0";
