/**
 * @ldesign/router 路由状态管理
 *
 * 提供路由状态的集中管理和响应式更新
 */
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 路由历史记录项
 */
export interface RouteHistoryItem {
    route: RouteLocationNormalized;
    timestamp: number;
    duration?: number;
    source: 'push' | 'replace' | 'go' | 'back' | 'forward';
}
/**
 * 路由状态
 */
export interface RouteState {
    /** 当前路由 */
    current: RouteLocationNormalized;
    /** 上一个路由 */
    previous?: RouteLocationNormalized;
    /** 导航历史 */
    history: RouteHistoryItem[];
    /** 是否正在导航 */
    isNavigating: boolean;
    /** 导航错误 */
    error?: Error;
    /** 加载状态 */
    isLoading: boolean;
    /** 缓存的路由数据 */
    cache: Map<string, any>;
}
/**
 * 路由状态管理器
 */
export declare class RouteStateManager {
    private router;
    private state;
    private maxHistorySize;
    private subscribers;
    constructor(router: Router);
    /**
     * 设置监听器
     */
    private setupWatchers;
    /**
     * 更新状态
     */
    private updateState;
    /**
     * 获取导航来源
     */
    private getNavigationSource;
    /**
     * 添加到历史记录
     */
    private addToHistory;
    /**
     * 获取当前状态
     */
    getState(): RouteState;
    /**
     * 获取当前路由
     */
    getCurrentRoute(): RouteLocationNormalized;
    /**
     * 获取上一个路由
     */
    getPreviousRoute(): RouteLocationNormalized | undefined;
    /**
     * 获取导航历史
     */
    getHistory(): RouteHistoryItem[];
    /**
     * 获取最近访问的路由
     */
    getRecentRoutes(limit?: number): RouteHistoryItem[];
    /**
     * 获取访问频率最高的路由
     */
    getMostVisitedRoutes(limit?: number): Array<{
        path: string;
        count: number;
        lastVisit: number;
    }>;
    /**
     * 检查是否可以后退
     */
    canGoBack(): boolean;
    /**
     * 检查路由是否在历史中
     */
    isInHistory(path: string): boolean;
    /**
     * 清空历史记录
     */
    clearHistory(): void;
    /**
     * 设置路由缓存
     */
    setCache(key: string, data: any): void;
    /**
     * 获取路由缓存
     */
    getCache(key: string): any;
    /**
     * 清空缓存
     */
    clearCache(): void;
    /**
     * 订阅状态变化
     */
    subscribe(callback: (state: RouteState) => void): () => void;
    /**
     * 通知订阅者
     */
    private notifySubscribers;
    /**
     * 获取状态统计信息
     */
    getStats(): {
        totalNavigations: number;
        recentNavigations: number;
        dailyNavigations: number;
        uniqueRoutes: number;
        averageNavigationsPerHour: number;
        cacheSize: number;
        isNavigating: boolean;
        hasError: boolean;
    };
    /**
     * 导出状态数据
     */
    exportState(): {
        current: RouteLocationNormalized<Record<string, any>, Record<string, any>, import("../types").RouteMeta>;
        previous: RouteLocationNormalized<Record<string, any>, Record<string, any>, import("../types").RouteMeta> | undefined;
        history: RouteHistoryItem[];
        stats: {
            totalNavigations: number;
            recentNavigations: number;
            dailyNavigations: number;
            uniqueRoutes: number;
            averageNavigationsPerHour: number;
            cacheSize: number;
            isNavigating: boolean;
            hasError: boolean;
        };
    };
    /**
     * 重置状态
     */
    reset(): void;
}
/**
 * 创建路由状态管理器
 */
export declare function createRouteStateManager(router: Router): RouteStateManager;
/**
 * 路由状态组合式 API
 */
export declare function useRouteState(stateManager: RouteStateManager): {
    current: import("vue").ComputedRef<RouteLocationNormalized<Record<string, any>, Record<string, any>, import("../types").RouteMeta>>;
    previous: import("vue").ComputedRef<RouteLocationNormalized<Record<string, any>, Record<string, any>, import("../types").RouteMeta> | undefined>;
    isNavigating: import("vue").ComputedRef<boolean>;
    isLoading: import("vue").ComputedRef<boolean>;
    error: import("vue").ComputedRef<Error | undefined>;
    history: import("vue").ComputedRef<RouteHistoryItem[]>;
    recentRoutes: import("vue").ComputedRef<RouteHistoryItem[]>;
    mostVisitedRoutes: import("vue").ComputedRef<{
        path: string;
        count: number;
        lastVisit: number;
    }[]>;
    canGoBack: import("vue").ComputedRef<boolean>;
    stats: import("vue").ComputedRef<{
        totalNavigations: number;
        recentNavigations: number;
        dailyNavigations: number;
        uniqueRoutes: number;
        averageNavigationsPerHour: number;
        cacheSize: number;
        isNavigating: boolean;
        hasError: boolean;
    }>;
    clearHistory: () => void;
    clearCache: () => void;
    isInHistory: (path: string) => boolean;
    setCache: (key: string, data: any) => void;
    getCache: (key: string) => any;
    subscribe: (callback: (state: RouteState) => void) => () => void;
};
