/**
 * @ldesign/router 统一内存管理器
 *
 * 整合基础内存管理和分层缓存功能，提供统一的高性能内存管理方案
 */
/**
 * 缓存优先级
 */
export declare enum CachePriority {
    /** 热数据 - L1缓存 */
    HOT = "hot",
    /** 温数据 - L2缓存 */
    WARM = "warm",
    /** 冷数据 - L3缓存 */
    COLD = "cold"
}
/**
 * 缓存项
 */
export interface CacheItem<T = any> {
    key: string;
    value: T;
    size: number;
    priority: CachePriority;
    accessCount: number;
    lastAccessTime: number;
    createTime: number;
    ttl?: number;
    tags?: string[];
}
/**
 * 内存统计信息
 */
export interface MemoryStats {
    totalMemory: number;
    cacheMemory: number;
    l1Memory: number;
    l2Memory: number;
    l3Memory: number;
    routeMemory: number;
    listenerCount: number;
    weakRefCount: number;
    cacheHitRate: number;
    evictionCount: number;
}
/**
 * 统一内存管理配置
 */
export interface UnifiedMemoryConfig {
    tieredCache?: {
        enabled?: boolean;
        l1Capacity?: number;
        l2Capacity?: number;
        l3Capacity?: number;
        promotionThreshold?: number;
        demotionThreshold?: number;
    };
    monitoring?: {
        enabled?: boolean;
        interval?: number;
        warningThreshold?: number;
        criticalThreshold?: number;
    };
    weakRef?: {
        enabled?: boolean;
        maxRefs?: number;
    };
    cleanup?: {
        strategy?: 'aggressive' | 'moderate' | 'conservative';
        autoCleanup?: boolean;
        cleanupInterval?: number;
    };
}
/**
 * 统一内存管理器
 * 整合分层缓存、弱引用管理、内存监控等功能
 */
export declare class UnifiedMemoryManager {
    private tieredCache;
    private weakRefManager;
    private config;
    private monitorTimer?;
    private cleanupTimer?;
    state: {
        stats: {
            totalMemory: number;
            cacheMemory: number;
            l1Memory: number;
            l2Memory: number;
            l3Memory: number;
            routeMemory: number;
            listenerCount: number;
            weakRefCount: number;
            cacheHitRate: number;
            evictionCount: number;
        };
        isWarning: boolean;
        isCritical: boolean;
        lastCleanup: Date | null;
    };
    constructor(config?: UnifiedMemoryConfig);
    /**
     * 获取缓存值
     */
    get<T>(key: string): T | undefined;
    /**
     * 设置缓存值
     */
    set<T>(key: string, value: T, options?: {
        priority?: CachePriority;
        ttl?: number;
        tags?: string[];
        weak?: boolean;
    }): void;
    /**
     * 删除缓存
     */
    delete(key: string): boolean;
    /**
     * 清空所有缓存
     */
    clear(): void;
    /**
     * 创建弱引用
     */
    createWeakRef<T extends object>(key: string, target: T): void;
    /**
     * 获取弱引用
     */
    getWeakRef<T extends object>(key: string): T | undefined;
    /**
     * 手动触发优化
     */
    optimize(): void;
    /**
     * 获取统计信息
     */
    getStats(): MemoryStats;
    /**
     * 获取缓存信息
     */
    getCacheInfo(): any;
    private initialize;
    private startMonitoring;
    private stopMonitoring;
    private startAutoCleanup;
    private stopAutoCleanup;
    private updateStats;
    private getJSHeapSize;
    private checkThresholds;
    private performCleanup;
    /**
     * 销毁管理器 - 清理所有资源
     */
    destroy(): void;
}
/**
 * 获取默认内存管理器
 */
export declare function getMemoryManager(config?: UnifiedMemoryConfig): UnifiedMemoryManager;
/**
 * 快速缓存获取
 */
export declare function cacheGet<T>(key: string): T | undefined;
/**
 * 快速缓存设置
 */
export declare function cacheSet<T>(key: string, value: T, options?: any): void;
/**
 * 清理内存
 */
export declare function cleanupMemory(): void;
/**
 * 销毁默认内存管理器
 * 应在应用卸载时调用
 */
export declare function destroyMemoryManager(): void;
