/**
 * 优化的工具函数集合 - 减少内存占用和临时对象创建
 */
/**
 * 字符串操作优化
 */
export declare class StringUtils {
    private static stringPool;
    private static readonly MAX_POOL_SIZE;
    /**
     * 字符串内部化 - 复用相同字符串
     */
    static intern(str: string): string;
    /**
     * 高效的路径拼接 - 避免创建临时字符串
     */
    static joinPath(...segments: string[]): string;
    /**
     * 路径分割优化 - 复用数组
     */
    private static segmentCache;
    static splitPath(path: string): string[];
    /**
     * 查询字符串解析优化
     */
    private static queryCache;
    static parseQuery(queryString: string): Record<string, string>;
    /**
     * 清理缓存
     */
    static clearCaches(): void;
}
/**
 * 对象操作优化
 */
export declare class ObjectUtils {
    private static emptyObjects;
    private static readonly MAX_POOL_SIZE;
    /**
     * 获取空对象 - 从池中获取或创建新的
     */
    static getEmptyObject(): any;
    /**
     * 释放对象回池
     */
    static releaseObject(obj: any): void;
    /**
     * 浅克隆优化 - 避免 Object.assign 的开销
     */
    static shallowClone<T extends object>(obj: T): T;
    /**
     * 深度冻结优化 - 使用迭代代替递归
     */
    static deepFreeze<T extends object>(obj: T): T;
    /**
     * 对象差异比较 - 优化内存使用
     */
    static diff(oldObj: any, newObj: any): {
        added: string[];
        removed: string[];
        modified: string[];
    };
    /**
     * 清理对象池
     */
    static clearCache(): void;
}
/**
 * 数组操作优化
 */
export declare class ArrayUtils {
    private static arrayPool;
    private static readonly MAX_POOL_SIZE;
    /**
     * 获取空数组
     */
    static getArray<T>(): T[];
    /**
     * 释放数组
     */
    static releaseArray(arr: any[]): void;
    /**
     * 数组去重优化 - 使用 Set
     */
    static unique<T>(arr: T[]): T[];
    /**
     * 数组分片处理 - 避免大数组一次性处理
     */
    static chunk<T>(arr: T[], size: number): Generator<T[]>;
    /**
     * 高效的数组过滤 - 复用结果数组
     */
    static filter<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[];
    /**
     * 二分查找 - 用于有序数组
     */
    static binarySearch<T>(arr: T[], target: T, compareFn?: (a: T, b: T) => number): number;
    /**
     * 清理数组池
     */
    static clearCache(): void;
}
/**
 * 函数工具优化
 */
export declare class FunctionUtils {
    private static memoCache;
    /**
     * 记忆化函数 - 缓存计算结果
     */
    static memoize<T extends (...args: any[]) => any>(fn: T): T;
    /**
     * 防抖优化 - 复用定时器
     */
    private static debounceTimers;
    static debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * 节流优化 - 使用时间戳
     */
    private static throttleTimestamps;
    static throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void;
    /**
     * 一次性函数 - 确保函数只执行一次
     */
    private static onceFlags;
    static once<T extends (...args: any[]) => any>(fn: T): T;
    /**
     * 清理缓存
     */
    static clearCache(): void;
}
/**
 * 异步工具优化
 */
export declare class AsyncUtils {
    private static promisePool;
    private static resolvedPromise;
    /**
     * 获取已解决的 Promise
     */
    static getResolvedPromise<T>(value?: T): Promise<T>;
    /**
     * 批量并发控制
     */
    static parallelLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]>;
    /**
     * 超时 Promise
     */
    static withTimeout<T>(promise: Promise<T>, timeout: number, error?: Error): Promise<T>;
    /**
     * 重试机制
     */
    static retry<T>(fn: () => Promise<T>, retries?: number, delay?: number): Promise<T>;
    /**
     * 清理Promise池
     */
    static clearCache(): void;
}
/**
 * 内存管理工具
 */
export declare class MemoryUtils {
    private static measurements;
    /**
     * 测量函数内存使用
     */
    static measureMemory<T>(fn: () => T | Promise<T>): Promise<{
        result: T;
        memoryUsed: number;
        time: number;
    }>;
    /**
     * 获取当前内存使用
     */
    static getMemoryUsage(): number;
    /**
     * 内存泄漏检测
     */
    private static leakDetectors;
    static detectLeak(key: string, size: number): boolean;
    /**
     * 手动触发垃圾回收（如果可用）
     */
    static gc(): void;
    /**
     * 清理所有缓存
     */
    static clearAllCaches(): void;
}
/**
 * 性能监控工具
 */
export declare class PerformanceMonitor {
    private static marks;
    private static measures;
    /**
     * 开始标记
     */
    static mark(name: string): void;
    /**
     * 测量并记录
     */
    static measure(name: string, startMark: string): number;
    /**
     * 获取统计信息
     */
    static getStats(name: string): {
        count: number;
        total: number;
        average: number;
        min: number;
        max: number;
    } | null;
    /**
     * 清理监控数据
     */
    static clear(): void;
}
