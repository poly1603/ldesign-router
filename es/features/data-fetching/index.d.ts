/**
 * @ldesign/router 数据预取机制
 *
 * 提供路由级数据加载、并行数据获取、数据缓存策略
 */
import type { RouteLocationNormalized, Router } from '../../types';
import { type Ref } from 'vue';
export type DataLoader<T = any> = (route: RouteLocationNormalized) => T | Promise<T>;
export type DataResolver = (route: RouteLocationNormalized) => Record<string, DataLoader> | Promise<Record<string, DataLoader>>;
export interface DataFetchingOptions {
    /**
     * 数据加载器
     */
    loaders?: Record<string, DataLoader>;
    /**
     * 动态数据解析器
     */
    resolver?: DataResolver;
    /**
     * 并行加载
     */
    parallel?: boolean;
    /**
     * 缓存配置
     */
    cache?: {
        enabled: boolean;
        strategy: 'memory' | 'session' | 'local';
        ttl: number;
        maxSize?: number;
    };
    /**
     * 重试配置
     */
    retry?: {
        count: number;
        delay: number;
        backoff?: 'linear' | 'exponential';
    };
    /**
     * 超时配置
     */
    timeout?: number;
    /**
     * 数据转换器
     */
    transform?: (data: any) => any;
    /**
     * 错误处理器
     */
    onError?: (error: Error, route: RouteLocationNormalized) => void;
    /**
     * 加载状态变更回调
     */
    onLoadingChange?: (loading: boolean) => void;
    /**
     * 预取策略
     */
    prefetch?: {
        enabled: boolean;
        routes?: string[];
        delay?: number;
    };
}
export interface DataFetchingState {
    loading: Ref<boolean>;
    error: Ref<Error | null>;
    data: Ref<Record<string, any>>;
    refresh: () => Promise<void>;
}
export declare class DataFetchingManager {
    private router;
    private options;
    private cache;
    private loadingCount;
    private currentState;
    private abortController;
    constructor(router: Router, options?: DataFetchingOptions);
    /**
     * 设置导航守卫
     */
    private setupNavigationGuards;
    /**
     * 设置预取
     */
    private setupPrefetch;
    /**
     * 获取数据
     */
    fetchData(route: RouteLocationNormalized): Promise<void>;
    /**
     * 预取数据
     */
    prefetchData(route: RouteLocationNormalized): Promise<void>;
    /**
     * 获取数据加载器
     */
    private getLoaders;
    /**
     * 带重试的加载
     */
    private loadWithRetry;
    /**
     * 更新加载状态
     */
    private updateLoadingState;
    /**
     * 获取缓存键
     */
    private getCacheKey;
    /**
     * 获取状态
     */
    getState(): DataFetchingState;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 刷新数据
     */
    refresh(): Promise<void>;
    /**
     * 获取路由数据
     */
    getData(route?: RouteLocationNormalized): Record<string, any>;
}
/**
 * 设置数据获取管理器
 */
export declare function setupDataFetching(router: Router, options: DataFetchingOptions): DataFetchingManager;
/**
 * 使用路由数据
 */
export declare function useRouteData(): {
    loading: Ref<boolean, boolean>;
    error: Ref<Error | null, Error | null>;
    data: Ref<Record<string, any>, Record<string, any>>;
    refresh: () => Promise<void>;
    clearCache: () => void;
    getData: (route?: RouteLocationNormalized) => Record<string, any>;
};
/**
 * 定义路由数据加载器
 */
export declare function defineLoader<T = any>(loader: DataLoader<T>): DataLoader<T>;
/**
 * 定义异步组件与数据加载
 */
export declare function defineAsyncComponent(componentLoader: () => Promise<any>, dataLoaders?: Record<string, DataLoader>): {
    component: () => Promise<any>;
    meta: {
        loaders: Record<string, DataLoader<any>> | undefined;
    };
};
export declare const DataFetchingPlugin: {
    install(app: any, options: {
        router: Router;
        config: DataFetchingOptions;
    }): void;
};
