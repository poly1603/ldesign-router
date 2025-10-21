/**
 * @ldesign/router 工具函数
 *
 * 提供路由相关的实用工具函数
 */
import type { NavigationFailureType } from '../core/constants';
import type { NavigationFailure, RouteLocationNormalized, RouteLocationRaw, RouteParams, RouteQuery } from '../types';
/**
 * 标准化路径（增强版）
 */
export declare function normalizePath(path: string): string;
/**
 * 连接路径
 */
export declare function joinPaths(...paths: string[]): string;
/**
 * 解析路径参数
 */
export declare function parsePathParams(pattern: string, path: string): RouteParams;
/**
 * 构建路径
 */
export declare function buildPath(pattern: string, params?: RouteParams): string;
/**
 * 解析查询字符串（增强版）
 */
export declare function parseQuery(search: string): RouteQuery;
/**
 * 序列化查询参数
 */
export declare function stringifyQuery(query: RouteQuery): string;
/**
 * 合并查询参数
 */
export declare function mergeQuery(target: RouteQuery, source: RouteQuery): RouteQuery;
/**
 * 解析 URL
 */
export declare function parseURL(url: string): {
    path: string;
    query: RouteQuery;
    hash: string;
};
/**
 * 构建 URL
 */
export declare function stringifyURL(path: string, query?: RouteQuery, hash?: string): string;
/**
 * 标准化路由参数
 */
export declare function normalizeParams(params: RouteParams): RouteParams;
/**
 * 比较路由位置是否相同
 */
export declare function isSameRouteLocation(a: RouteLocationNormalized, b: RouteLocationNormalized): boolean;
/**
 * 解析路由位置
 */
export declare function resolveRouteLocation(raw: RouteLocationRaw): Partial<RouteLocationNormalized>;
/**
 * 创建导航失败对象
 */
export declare function createNavigationFailure(type: NavigationFailureType, from: RouteLocationNormalized, to: RouteLocationNormalized, message?: string): NavigationFailure;
/**
 * 检查是否为导航失败
 */
export declare function isNavigationFailure(error: any, type?: NavigationFailureType): error is NavigationFailure;
/**
 * 检查路径是否匹配模式
 */
export declare function matchPath(pattern: string, path: string): boolean;
/**
 * 提取路径参数
 */
export declare function extractParams(pattern: string, path: string): RouteParams;
/**
 * 深度克隆路由位置
 */
export declare function cloneRouteLocation(location: RouteLocationNormalized): RouteLocationNormalized;
/**
 * 获取路由层级深度
 */
export declare function getRouteDepth(route: RouteLocationNormalized): number;
/**
 * 检查是否为子路由
 */
export declare function isChildRoute(parent: string, child: string): boolean;
declare const _default: {
    normalizePath: typeof normalizePath;
    joinPaths: typeof joinPaths;
    parsePathParams: typeof parsePathParams;
    buildPath: typeof buildPath;
    parseQuery: typeof parseQuery;
    stringifyQuery: typeof stringifyQuery;
    mergeQuery: typeof mergeQuery;
    parseURL: typeof parseURL;
    stringifyURL: typeof stringifyURL;
    normalizeParams: typeof normalizeParams;
    isSameRouteLocation: typeof isSameRouteLocation;
    resolveRouteLocation: typeof resolveRouteLocation;
    createNavigationFailure: typeof createNavigationFailure;
    isNavigationFailure: typeof isNavigationFailure;
    matchPath: typeof matchPath;
    extractParams: typeof extractParams;
    cloneRouteLocation: typeof cloneRouteLocation;
    getRouteDepth: typeof getRouteDepth;
    isChildRoute: typeof isChildRoute;
};
export default _default;
export type * from '../types/enhanced-types';
export { CodeQualityChecker, codeQualityChecker, IssueSeverity, QualityIssueType, } from './code-quality';
export { addErrorListener, type ErrorDetails, type ErrorListener, errorManager, ErrorManager, type ErrorManagerConfig, type ErrorRecoveryStrategy, ErrorSeverity, ErrorType, getErrorHistory, getErrorStatistics, handleError } from './error-manager';
export { analyticsLogger, debugLogger, logger, Logger, type LoggerConfig, type LogLevel, performanceLogger, securityLogger } from './logger';
