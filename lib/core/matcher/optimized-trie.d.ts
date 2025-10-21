/**
 * 优化的 Trie 树实现 - 减少内存占用
 */
import type { RouteRecordNormalized } from '../../types';
/**
 * 优化的 Trie 节点 - 内存占用从 ~100 bytes 减少到 ~40 bytes
 */
export declare class OptimizedTrieNode {
    private flags;
    private stats;
    private data?;
    get hasChildren(): boolean;
    get children(): Map<string, OptimizedTrieNode>;
    get paramChild(): OptimizedTrieNode | undefined;
    set paramChild(child: OptimizedTrieNode | undefined);
    get paramName(): string | undefined;
    set paramName(name: string | undefined);
    get wildcardChild(): OptimizedTrieNode | undefined;
    set wildcardChild(child: OptimizedTrieNode | undefined);
    get record(): RouteRecordNormalized | undefined;
    set record(record: RouteRecordNormalized | undefined);
    get defaultChild(): RouteRecordNormalized | undefined;
    set defaultChild(child: RouteRecordNormalized | undefined);
    get isOptional(): boolean;
    set isOptional(value: boolean);
    get weight(): number;
    set weight(value: number);
    get accessCount(): number;
    set accessCount(value: number);
    compact(): void;
    getMemorySize(): number;
}
/**
 * 字符串内存池 - 避免重复字符串占用内存
 */
export declare class StringPool {
    private pool;
    private maxSize;
    /**
     * 获取内部化的字符串
     */
    intern(str: string): string;
    clear(): void;
    getSize(): number;
}
/**
 * 路径构建器 - 优化字符串拼接
 */
export declare class PathBuilder {
    private segments;
    private cached;
    add(segment: string): this;
    addAll(segments: string[]): this;
    clear(): this;
    toString(): string;
    getSegments(): string[];
}
/**
 * 对象池 - 复用频繁创建的对象
 */
export declare class ObjectPool<T extends object> {
    private factory;
    private reset;
    private maxSize;
    private pool;
    private inUse;
    constructor(factory: () => T, reset: (obj: T) => void, initialSize?: number, maxSize?: number);
    acquire(): T;
    release(obj: T): void;
    clear(): void;
    getPoolSize(): number;
}
/**
 * 内存监控器
 */
export declare class MemoryMonitor {
    private measurements;
    private maxMeasurements;
    measure(): number;
    getStats(): {
        current: number | undefined;
        average: number;
        peak: number;
        trend: number;
    };
    clear(): void;
}
