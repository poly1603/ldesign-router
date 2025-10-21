/**
 * LRU 缓存实现
 *
 * 提供高性能的路由匹配结果缓存
 */
import type { MatchResult } from './types';
/**
 * LRU 缓存实现（优化版 - 支持动态容量调整）
 */
export declare class LRUCache {
    private capacity;
    private size;
    private cache;
    private head;
    private tail;
    private hits;
    private misses;
    private lastOptimizeTime;
    private readonly minCapacity;
    private readonly maxCapacity;
    private readonly optimizeInterval;
    constructor(capacity?: number);
    get(key: string): MatchResult | null | undefined;
    set(key: string, value: MatchResult | null): void;
    clear(): void;
    getStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
        capacity: number;
    };
    /**
     * 动态调整缓存大小
     */
    resize(newCapacity: number): void;
    private addToHead;
    private removeNode;
    private moveToHead;
    private removeTail;
    private tryOptimizeCapacity;
}
