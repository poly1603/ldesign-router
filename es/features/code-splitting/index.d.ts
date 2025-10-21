/**
 * @ldesign/router 智能代码分割模块
 *
 * 提供智能的路由组件分割和按需加载功能
 */
import type { RouteRecordRaw } from '../../types';
/**
 * 代码分割策略
 */
export type SplittingStrategy = 'route' | 'module' | 'feature' | 'priority' | 'size';
/**
 * 分割优先级
 */
export type ChunkPriority = 'critical' | 'high' | 'normal' | 'low' | 'idle';
/**
 * 预加载策略
 */
export type PreloadStrategy = 'eager' | 'lazy' | 'hover' | 'visible' | 'predictive';
/**
 * 组件加载状态
 */
export interface ComponentLoadState {
    name: string;
    status: 'pending' | 'loading' | 'loaded' | 'error';
    startTime?: number;
    loadTime?: number;
    error?: Error;
    retries?: number;
    size?: number;
}
/**
 * 分割配置
 */
export interface SplittingConfig {
    /** 分割策略 */
    strategy: SplittingStrategy;
    /** 块大小限制（KB） */
    maxChunkSize?: number;
    /** 最小块大小（KB） */
    minChunkSize?: number;
    /** 并行加载数量 */
    maxConcurrentLoads?: number;
    /** 预加载策略 */
    preloadStrategy?: PreloadStrategy;
    /** 缓存策略 */
    cacheStrategy?: 'memory' | 'storage' | 'both';
    /** 错误重试次数 */
    maxRetries?: number;
    /** 重试延迟（ms） */
    retryDelay?: number;
}
/**
 * 分割分析结果
 */
export interface SplittingAnalysis {
    /** 总组件数 */
    totalComponents: number;
    /** 分割后的块数 */
    chunks: ChunkInfo[];
    /** 预估总大小（KB） */
    estimatedSize: number;
    /** 推荐的优化建议 */
    suggestions: string[];
}
/**
 * 块信息
 */
export interface ChunkInfo {
    id: string;
    name: string;
    routes: string[];
    components: string[];
    priority: ChunkPriority;
    estimatedSize: number;
    dependencies: string[];
}
/**
 * 加载性能指标
 */
export interface LoadingMetrics {
    componentName: string;
    loadTime: number;
    cacheHit: boolean;
    networkTime?: number;
    parseTime?: number;
    executeTime?: number;
}
export declare class CodeSplittingManager {
    private config;
    private loadStates;
    private componentCache;
    private metrics;
    private preloadQueue;
    private loadingPromises;
    private chunkMap;
    private intersectionObserver?;
    constructor(config: SplittingConfig);
    /**
     * 初始化预加载策略
     */
    private initializePreloadStrategy;
    /**
     * 设置可见性观察器
     */
    private setupIntersectionObserver;
    /**
     * 设置预测性预加载
     */
    private setupPredictivePreloading;
    /**
     * 创建智能分割的路由
     */
    createSplitRoute(route: RouteRecordRaw): RouteRecordRaw;
    /**
     * 加载组件
     */
    private loadComponent;
    /**
     * 执行加载
     */
    private performLoad;
    /**
     * 预加载组件
     */
    preloadComponent(name: string, _trigger?: 'hover' | 'visible' | 'manual'): Promise<void>;
    /**
     * 按名称加载组件
     */
    private loadComponentByName;
    /**
     * 请求空闲加载
     */
    private requestIdleLoad;
    /**
     * 分析路由分割情况
     */
    analyzeRoutes(routes: RouteRecordRaw[]): SplittingAnalysis;
    /**
     * 生成块ID
     */
    private generateChunkId;
    /**
     * 提取模块名
     */
    private extractModuleName;
    /**
     * 提取功能名
     */
    private extractFeatureName;
    /**
     * 确定优先级
     */
    private determinePriority;
    /**
     * 估算组件大小
     */
    private estimateComponentSize;
    /**
     * 生成优化建议
     */
    private generateSuggestions;
    /**
     * 检查循环依赖
     */
    private checkCircularDependencies;
    /**
     * 更新加载状态
     */
    private updateLoadState;
    /**
     * 记录性能指标
     */
    private recordMetrics;
    /**
     * 延迟函数
     */
    private delay;
    /**
     * 获取加载统计
     */
    getLoadStatistics(): {
        totalLoaded: number;
        totalCached: number;
        averageLoadTime: number;
        cacheHitRate: number;
        failureRate: number;
    };
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 创建代码分割管理器
 */
export declare function createCodeSplittingManager(config?: Partial<SplittingConfig>): CodeSplittingManager;
/**
 * 代码分割插件
 */
export declare const CodeSplittingPlugin: {
    install(app: any, options?: Partial<SplittingConfig>): void;
};
