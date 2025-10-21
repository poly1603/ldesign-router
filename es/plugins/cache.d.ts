/**
 * @ldesign/router 缓存插件
 *
 * 提供多种缓存策略的路由组件缓存功能
 */
import type { App, Component } from 'vue';
import type { CacheConfig, CacheStrategy } from '../components/types';
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 缓存管理器
 */
export declare class CacheManager {
    private storage;
    private config;
    private componentCache;
    constructor(config: CacheConfig);
    /**
     * 创建存储实例
     */
    private createStorage;
    /**
     * 生成缓存键（优化：减少JSON序列化开销）
     */
    private generateKey;
    /**
     * 检查是否应该缓存
     */
    private shouldCache;
    /**
     * 获取缓存项
     */
    get(route: RouteLocationNormalized): Component | null;
    /**
     * 设置缓存项
     */
    set(route: RouteLocationNormalized, component: Component): void;
    /**
     * 检查是否存在缓存
     */
    has(route: RouteLocationNormalized): boolean;
    /**
     * 删除缓存项
     */
    delete(route: RouteLocationNormalized): boolean;
    /**
     * 清空所有缓存
     */
    clear(): void;
    /**
     * 获取缓存统计信息
     */
    getStats(): {
        size: number;
        memorySize: number;
        maxSize: number;
        strategy: CacheStrategy;
        keys: string[];
    };
    /**
     * 淘汰缓存项（LRU 策略）
     */
    private evict;
    /**
     * 清理过期缓存
     */
    cleanup(): void;
}
/**
 * 缓存插件选项
 */
export interface CachePluginOptions extends Partial<CacheConfig> {
    /** 是否启用缓存 */
    enabled?: boolean;
}
/**
 * 创建缓存插件
 */
export declare function createCachePlugin(options?: CachePluginOptions): {
    install(): void;
    manager: null;
} | {
    install(app: App, router: Router): void;
    manager: CacheManager;
};
/**
 * 创建缓存配置
 */
export declare function createCacheConfig(config: Partial<CacheConfig>): CacheConfig;
/**
 * 检查缓存支持
 */
export declare function supportsCaching(): {
    memory: boolean;
    session: boolean;
    local: boolean;
};
declare const _default: {
    createCachePlugin: typeof createCachePlugin;
    CacheManager: typeof CacheManager;
    createCacheConfig: typeof createCacheConfig;
    supportsCaching: typeof supportsCaching;
};
export default _default;
