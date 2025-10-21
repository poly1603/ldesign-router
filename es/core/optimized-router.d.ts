/**
 * 优化的路由器实现 - 减少内存占用和提升性能
 */
import type { NavigationGuard, NavigationHookAfter, RouterOptions } from '../types';
/**
 * 优化的路由器实现
 */
export declare class OptimizedRouter {
    private eventBus;
    private navigationState;
    private guardExecutor;
    private locationPool;
    private memoryCheckInterval?;
    private readonly MEMORY_CHECK_INTERVAL;
    constructor(_options: RouterOptions);
    /**
     * 添加导航守卫（优化版）
     */
    beforeEach(guard: NavigationGuard): () => void;
    beforeResolve(guard: NavigationGuard): () => void;
    afterEach(hook: NavigationHookAfter): () => void;
    /**
     * 内存监控
     */
    private startMemoryMonitoring;
    private checkMemory;
    private performCleanup;
    /**
     * 销毁路由器
     */
    destroy(): void;
    /**
     * 获取内存统计
     */
    getMemoryStats(): {
        eventListeners: number;
        navigationHistory: number;
        guardCache: number;
        locationPool: number;
    };
}
