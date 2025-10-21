/**
 * @ldesign/router 守卫执行器
 *
 * 支持依赖分析、并行执行、智能跳过和优先级队列
 */
import type { NavigationGuard, NavigationGuardReturn, RouteLocationNormalized } from '../types';
/**
 * 守卫元数据
 */
interface GuardMetadata {
    guard: NavigationGuard;
    id: string;
    priority: number;
    dependencies: string[];
    cacheable: boolean;
    skipCondition?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean;
}
/**
 * 优化的守卫执行器
 */
export declare class GuardExecutor {
    private guards;
    private dependencyGraph;
    private resultCache;
    private readonly CACHE_TTL;
    private stats;
    /**
     * 注册守卫
     */
    registerGuard(metadata: GuardMetadata): void;
    /**
     * 批量注册守卫
     */
    registerGuards(metadatas: GuardMetadata[]): void;
    /**
     * 移除守卫
     */
    unregisterGuard(id: string): void;
    /**
     * 执行所有守卫（优化版）
     */
    executeAll(to: RouteLocationNormalized, from: RouteLocationNormalized): Promise<NavigationGuardReturn>;
    /**
     * 过滤需要执行的守卫
     */
    private filterGuardsToExecute;
    /**
     * 构建执行计划（按依赖和优先级分批）
     */
    private buildExecutionPlan;
    /**
     * 并行执行一批守卫
     */
    private executeBatch;
    /**
     * 执行单个守卫
     */
    private executeGuard;
    /**
     * 运行守卫（带超时和重试）
     */
    private runGuard;
    /**
     * 重建依赖图
     */
    private rebuildDependencyGraph;
    /**
     * 生成缓存键
     */
    private getCacheKey;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 获取统计信息
     */
    getStats(): {
        registeredGuards: number;
        cacheSize: number;
        totalExecutions: number;
        parallelExecutions: number;
        cacheHits: number;
        skipped: number;
        averageDuration: number;
    };
    /**
     * 清理缓存
     */
    clearCache(): void;
    /**
     * 重置统计
     */
    resetStats(): void;
}
/**
 * 创建守卫元数据的辅助函数
 */
export declare function createGuardMetadata(guard: NavigationGuard, options?: {
    id?: string;
    priority?: number;
    dependencies?: string[];
    cacheable?: boolean;
    skipCondition?: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean;
}): GuardMetadata;
/**
 * 常用的跳过条件
 */
export declare const commonSkipConditions: {
    samePath: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean;
    sameQuery: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean;
    sameParams: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean;
    sameRoute: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean;
};
export {};
