/**
 * @ldesign/router 路由器核心类
 *
 * 路由器的主要实现，负责路由管理、导航控制和生命周期管理
 */
import type { App, Ref } from 'vue';
import type { NavigationFailure, NavigationGuard, NavigationHookAfter, RouteLocationNormalized, RouteLocationRaw, Router, RouteRecordNormalized, RouteRecordRaw, RouterOptions } from '../types';
/**
 * 路由器类（增强版）
 */
export declare class RouterImpl implements Router {
    private matcher;
    private beforeGuards;
    private beforeResolveGuards;
    private afterHooks;
    private errorHandlers;
    private isReadyPromise?;
    private isReadyResolve?;
    private memoryManager;
    private guardCleanupFunctions;
    private guardResultCache;
    private readonly MAX_GUARD_CACHE_SIZE;
    readonly currentRoute: Ref<RouteLocationNormalized>;
    readonly options: RouterOptions;
    constructor(options: RouterOptions);
    addRoute(route: RouteRecordRaw): () => void;
    addRoute(parentName: string | symbol, route: RouteRecordRaw): () => void;
    removeRoute(name: string | symbol): void;
    getRoutes(): RouteRecordNormalized[];
    hasRoute(name: string | symbol): boolean;
    resolve(to: RouteLocationRaw, currentLocation?: RouteLocationNormalized): RouteLocationNormalized;
    push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>;
    replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>;
    go(delta: number): void;
    back(): void;
    forward(): void;
    beforeEach(guard: NavigationGuard): () => void;
    beforeResolve(guard: NavigationGuard): () => void;
    afterEach(hook: NavigationHookAfter): () => void;
    onError(handler: (error: Error) => void): () => void;
    isReady(): Promise<void>;
    install(app: App): void;
    /**
     * 销毁路由器，清理所有资源
     */
    destroy(): void;
    /**
     * 获取内存统计信息
     */
    getMemoryStats(): {
        memory: import("../utils/unified-memory-manager").MemoryStats;
        matcher: {
            cacheStats: {
                hits: number;
                misses: number;
                hitRate: number;
                size: number;
                capacity: number;
            };
            compiledPathsCount: number;
            routesCount: number;
            hotspots: {
                path: string;
                hits: number;
            }[];
            adaptiveCache: {
                currentSize: number;
                minSize: number;
                maxSize: number;
            };
            preheated: boolean;
            cacheHits: number;
            cacheMisses: number;
            totalMatches: number;
            averageMatchTime: number;
        };
        guards: {
            beforeGuards: number;
            beforeResolveGuards: number;
            afterHooks: number;
            errorHandlers: number;
        };
    };
    private redirectCount;
    private readonly MAX_REDIRECTS;
    private redirectStartTime;
    private readonly REDIRECT_TIMEOUT;
    private pushWithRedirect;
    private runNavigationGuards;
    /**
     * 处理路由记录的重定向配置
     */
    private handleRouteRedirect;
    private runGuard;
    private runAfterHooks;
    private updateCurrentRoute;
    private setupHistoryListener;
    private handleHistoryChange;
    private initializeCurrentRoute;
    private routeLocationToHistoryLocation;
    private historyLocationToRouteLocation;
    private parseQuery;
    private stringifyQuery;
    private isSameRouteLocation;
    private createNavigationFailure;
    private handleError;
}
/**
 * 创建路由器实例
 */
export declare function createRouter(options: RouterOptions): Router;
