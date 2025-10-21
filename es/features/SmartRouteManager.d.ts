/**
 * 智能路由管理�?
 * 提供自动路由生成、动态路由、嵌套路由优化、路由分�?
 */
import type { NavigationGuard, Router, RouteRecordRaw } from '../types';
export interface SmartRouteConfig {
    autoGenerate?: {
        enabled?: boolean;
        pagesDir?: string;
        excludes?: string[];
        layouts?: Record<string, any>;
        importMode?: 'sync' | 'async';
    };
    dynamic?: {
        enabled?: boolean;
        loader?: (path: string) => Promise<RouteRecordRaw>;
        cache?: boolean;
        retry?: number;
    };
    nested?: {
        enabled?: boolean;
        maxDepth?: number;
        flattenSingleChild?: boolean;
        mergeParams?: boolean;
    };
    grouping?: {
        enabled?: boolean;
        groups?: RouteGroup[];
        defaultGroup?: string;
    };
}
export interface RouteGroup {
    name: string;
    pattern?: RegExp | string;
    prefix?: string;
    layout?: any;
    meta?: Record<string, any>;
    guard?: NavigationGuard;
    priority?: number;
}
export declare class AutoRouteGenerator {
    private routes;
    private fileRouteMap;
    private _config;
    constructor(config?: SmartRouteConfig['autoGenerate']);
    generateFromFileSystem(): Promise<RouteRecordRaw[]>;
    private scanDirectory;
    private fileToRoute;
    private nestRoutes;
    private applyLayouts;
    private determineLayout;
    addRoute(route: RouteRecordRaw): void;
    removeRoute(name: string): void;
    getRoutes(): RouteRecordRaw[];
}
export declare class DynamicRouteLoader {
    private router;
    private loadedRoutes;
    private loadingPromises;
    private _config;
    private retryCount;
    constructor(router: Router, config?: SmartRouteConfig['dynamic']);
    loadRoute(path: string): Promise<RouteRecordRaw | null>;
    private createLoadPromise;
    private shouldRetry;
    loadRoutes(paths: string[]): Promise<RouteRecordRaw[]>;
    preloadRoute(path: string): void;
    clearCache(): void;
}
export declare class NestedRouteOptimizer {
    private _config;
    constructor(config?: SmartRouteConfig['nested']);
    optimizeRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[];
    private optimizeRoute;
    private combinePaths;
    private mergeChildParams;
    private extractParams;
}
export declare class RouteGroupManager {
    private groups;
    private routeGroupMap;
    private _config;
    constructor(config?: SmartRouteConfig['grouping']);
    addGroup(group: RouteGroup): void;
    removeGroup(name: string): void;
    groupRoutes(routes: RouteRecordRaw[]): Map<string, RouteRecordRaw[]>;
    private determineGroup;
    private matchesGroup;
    private applyGroupSettings;
    getGroup(name: string): RouteGroup | undefined;
    getRouteGroup(routeName: string): string | undefined;
    getGroupRoutes(groupName: string, routes: RouteRecordRaw[]): RouteRecordRaw[];
}
export declare class SmartRouteManager {
    private autoGenerator;
    private dynamicLoader;
    private nestedOptimizer;
    private groupManager;
    private router;
    state: {
        routes: RouteRecordRaw[];
        groups: Map<string, RouteRecordRaw[]>;
        loading: boolean;
        error: Error | null;
    };
    constructor(router: Router, config?: SmartRouteConfig);
    initialize(): Promise<void>;
    addDynamicRoute(path: string): Promise<void>;
    addDynamicRoutes(paths: string[]): Promise<void>;
    getStatistics(): RouteStatistics;
    private calculateDepth;
    findRoute(predicate: (route: RouteRecordRaw) => boolean): RouteRecordRaw | undefined;
    getRoutesByGroup(groupName: string): RouteRecordRaw[];
    clear(): void;
}
interface RouteStatistics {
    total: number;
    groups: number;
    dynamic: number;
    nested: number;
    maxDepth: number;
}
export declare function setupSmartRouteManager(router: Router, config?: SmartRouteConfig): SmartRouteManager;
export declare function getRouteStatistics(): RouteStatistics | null;
export declare function addDynamicRoute(path: string): Promise<void>;
export {};
