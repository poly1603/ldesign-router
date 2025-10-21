/**
 * @ldesign/router 预加载插件
 *
 * 提供智能的路由组件预加载功能
 */
import type { App } from 'vue';
import type { PreloadConfig, PreloadStrategy } from '../components/types';
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 预加载统计
 */
interface PreloadStats {
    total: number;
    success: number;
    failed: number;
    cached: number;
    retried: number;
    averageTime: number;
    errorRate: number;
}
/**
 * 错误重试配置
 */
interface RetryConfig {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
    retryCondition?: (error: Error) => boolean;
}
/**
 * 预加载管理器（增强版）
 */
export declare class PreloadManager {
    private preloadQueue;
    private componentCache;
    private config;
    private retryConfig;
    private stats;
    private maxCacheSize;
    private cacheTimeout;
    constructor(config: PreloadConfig, retryConfig?: Partial<RetryConfig>);
    /**
     * 生成预加载键
     */
    generateKey(route: RouteLocationNormalized): string;
    /**
     * 设置缓存清理
     */
    private setupCacheCleanup;
    /**
     * 清理过期缓存
     */
    private cleanupExpiredCache;
    /**
     * 预加载路由组件（增强版）
     */
    preload(route: RouteLocationNormalized, strategy?: PreloadStrategy, priority?: number): Promise<void>;
    /**
     * 批量预加载
     */
    preloadBatch(routes: RouteLocationNormalized[], strategy: PreloadStrategy): Promise<void>;
    /**
     * 预加载相关路由
     */
    preloadRelated(currentRoute: RouteLocationNormalized): Promise<void>;
    /**
     * 带重试的组件加载
     */
    private loadRouteComponentsWithRetry;
    /**
     * 估算组件大小
     */
    private estimateComponentSize;
    /**
     * 更新错误率
     */
    private updateErrorRate;
    /**
     * 获取预加载的组件
     */
    getPreloaded(route: RouteLocationNormalized): any | null;
    /**
     * 检查是否已预加载
     */
    isPreloaded(route: RouteLocationNormalized): boolean;
    /**
     * 清理预加载缓存
     */
    clear(): void;
    /**
     * 获取缓存信息
     */
    getCacheInfo(): {
        size: number;
        maxSize: number;
        totalSize: number;
        items: Array<{
            key: string;
            size: number;
            accessCount: number;
            age: number;
        }>;
    };
    /**
     * 获取统计信息
     */
    getStats(): PreloadStats;
    /**
     * 加载路由组件
     */
    private loadRouteComponents;
    /**
     * 查找相关路由
     */
    private findRelatedRoutes;
    /**
     * 更新平均时间
     */
    private updateAverageTime;
}
/**
 * Hover 预加载策略
 */
export declare class HoverPreloadStrategy {
    private manager;
    private timers;
    constructor(manager: PreloadManager);
    /**
     * 处理鼠标悬停
     */
    onMouseEnter(route: RouteLocationNormalized, delay?: number): void;
    /**
     * 处理鼠标离开
     */
    onMouseLeave(route: RouteLocationNormalized): void;
    /**
     * 清理所有定时器
     */
    cleanup(): void;
}
/**
 * 可见性预加载策略
 */
export declare class VisibilityPreloadStrategy {
    private manager;
    private observer?;
    private observedElements;
    constructor(manager: PreloadManager);
    /**
     * 设置交叉观察器
     */
    private setupObserver;
    /**
     * 观察元素
     */
    observe(element: Element, route: RouteLocationNormalized): void;
    /**
     * 停止观察元素
     */
    unobserve(element: Element): void;
    /**
     * 清理观察器
     */
    cleanup(): void;
}
/**
 * 空闲预加载策略
 */
export declare class IdlePreloadStrategy {
    private manager;
    private pendingRoutes;
    constructor(manager: PreloadManager);
    /**
     * 添加到空闲预加载队列
     */
    addToQueue(route: RouteLocationNormalized): void;
    /**
     * 调度空闲预加载
     */
    private scheduleIdlePreload;
    /**
     * 调度下一个预加载
     */
    private scheduleNext;
    /**
     * 清理队列
     */
    cleanup(): void;
}
/**
 * 预加载插件选项
 */
export interface PreloadPluginOptions extends Partial<PreloadConfig> {
    /** 是否启用预加载 */
    enabled?: boolean;
    /** 是否启用自动预加载相关路由 */
    autoPreloadRelated?: boolean;
}
/**
 * 创建预加载插件
 */
export declare function createPreloadPlugin(options?: PreloadPluginOptions): {
    install(): void;
    manager: null;
    strategies?: undefined;
} | {
    install(app: App, router: Router): void;
    manager: PreloadManager;
    strategies: {
        hover: HoverPreloadStrategy;
        visibility: VisibilityPreloadStrategy;
        idle: IdlePreloadStrategy;
    };
};
/**
 * 创建预加载配置
 */
export declare function createPreloadConfig(config: Partial<PreloadConfig>): PreloadConfig;
/**
 * 检查预加载支持
 */
export declare function supportsPreload(): {
    intersectionObserver: boolean;
    requestIdleCallback: boolean;
};
declare const _default: {
    createPreloadPlugin: typeof createPreloadPlugin;
    PreloadManager: typeof PreloadManager;
    HoverPreloadStrategy: typeof HoverPreloadStrategy;
    VisibilityPreloadStrategy: typeof VisibilityPreloadStrategy;
    IdlePreloadStrategy: typeof IdlePreloadStrategy;
    createPreloadConfig: typeof createPreloadConfig;
    supportsPreload: typeof supportsPreload;
};
export default _default;
