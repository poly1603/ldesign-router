/**
 * @ldesign/router 路由匹配器
 *
 * 基于 Trie 树实现的高效路由匹配算法，支持 LRU 缓存和路径预编译
 */
import type { RouteLocationNormalized, RouteLocationRaw, RouteParams, RouteRecordNormalized, RouteRecordRaw } from '../types';
/**
 * 匹配结果
 */
interface MatchResult {
    /** 匹配的路由记录 */
    record: RouteRecordNormalized;
    /** 所有匹配的路由记录（包括父路由） */
    matched: RouteRecordNormalized[];
    /** 提取的参数 */
    params: RouteParams;
    /** 匹配的路径段 */
    segments: string[];
}
/**
 * 路由匹配器（优化版）
 */
export declare class RouteMatcher {
    private root;
    private routes;
    private rawRoutes;
    private lruCache;
    private compiledPaths;
    private stats;
    private readonly objectPool;
    private hotspots;
    private adaptiveCacheConfig;
    private preheated;
    private preheatRoutes;
    constructor(cacheSize?: number);
    /**
     * 创建新节点 - 优化：减少初始内存分配
     */
    private createNode;
    /**
     * 获取缓存键（优化版：使用更高效的键生成）
     */
    private getCacheKey;
    /**
     * 编译路径为正则表达式（用于快速匹配）
     */
    private compilePath;
    /**
     * 获取性能统计
     */
    getStats(): {
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
    /**
     * 启动自适应缓存调整
     */
    private startAdaptiveCacheAdjustment;
    /**
     * 自适应调整缓存大小
     */
    private adjustCacheSize;
    /**
     * 记录热点访问
     */
    private recordHotspot;
    /**
     * 清理过期的热点记录
     */
    private cleanupHotspots;
    /**
     * 获取TOP热点路由
     */
    private getTopHotspots;
    /**
     * 预热路由（提前编译和缓存热门路由）
     */
    preheat(routes?: string[]): void;
    /**
     * 重置预热状态
     */
    resetPreheat(): void;
    /**
     * 清理缓存和统计
     */
    clearCache(): void;
    /**
     * 添加路由记录
     */
    addRoute(record: RouteRecordRaw, parent?: RouteRecordNormalized): RouteRecordNormalized;
    /**
     * 移除路由记录
     */
    removeRoute(name: string | symbol): void;
    /**
     * 获取所有路由记录
     */
    getRoutes(): RouteRecordNormalized[];
    /**
     * 检查路由是否存在
     */
    hasRoute(name: string | symbol): boolean;
    /**
     * 根据路径匹配路由（优化版）
     */
    matchByPath(path: string): MatchResult | null;
    /**
     * 优化：快速匹配根路径
     */
    private matchRootPath;
    /**
     * 优化：使用对象池管理segments数组
     */
    private getPooledSegments;
    private releasePooledSegments;
    private fillSegments;
    /**
     * 快速匹配（使用预编译的正则表达式）
     */
    private fastMatch;
    /**
     * 更新平均匹配时间
     */
    private updateAverageMatchTime;
    /**
     * 根据名称匹配路由
     */
    matchByName(name: string | symbol): RouteRecordNormalized | null;
    /**
     * 解析路由位置
     */
    resolve(to: RouteLocationRaw, _currentLocation?: RouteLocationNormalized): RouteLocationNormalized;
    /**
     * 标准化路由记录
     */
    private normalizeRecord;
    /**
     * 标准化路径
     */
    private normalizePath;
    /**
     * 标准化属性配置
     */
    private normalizeProps;
    /**
     * 添加默认子路由到 Trie 树
     */
    private addDefaultChildToTrie;
    /**
     * 添加到 Trie 树（优化版）
     */
    private addToTrie;
    /**
     * 检查路径是否可能有嵌套路由
     */
    private hasNestedRoutesForPath;
    /**
     * 从 Trie 树移除
     */
    private removeFromTrie;
    /**
     * 解析路径段
     */
    private parsePathSegments;
    /**
     * 添加段到节点
     */
    private addSegmentToNode;
    /**
     * 查找子节点
     */
    private findChildNode;
    /**
     * 匹配路径段
     */
    private matchSegments;
    /**
     * 根据路径解析（优化版）
     */
    private resolveByPath;
    /**
     * 根据名称解析
     */
    private resolveByName;
    /**
     * 从参数构建路径
     */
    private buildPathFromParams;
    /**
     * 构建完整路径
     */
    private buildFullPath;
}
export {};
