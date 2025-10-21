/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

/*!
 * ***********************************
 * @ldesign/device v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:55 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class ObjectPool {
  constructor(config) {
    this.pool = [];
    this.inUse = /* @__PURE__ */ new Set();
    this.maxSize = config.maxSize;
    this.createFn = config.createFn;
    this.resetFn = config.resetFn;
    const initialSize = config.initialSize || Math.min(10, config.maxSize);
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  /**
   * 获取对象
   */
  acquire() {
    let obj;
    if (this.pool.length > 0) {
      const popped = this.pool.pop();
      if (!popped) {
        obj = this.createFn();
      } else {
        obj = popped;
      }
    } else {
      obj = this.createFn();
    }
    this.inUse.add(obj);
    return obj;
  }
  /**
   * 释放对象
   */
  release(obj) {
    if (!this.inUse.has(obj)) {
      return;
    }
    this.inUse.delete(obj);
    if (this.resetFn) {
      this.resetFn(obj);
    }
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }
  /**
   * 清空对象池
   */
  clear() {
    this.pool.length = 0;
    this.inUse.clear();
  }
  /**
   * 获取池统计信息
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      inUseSize: this.inUse.size,
      totalSize: this.pool.length + this.inUse.size,
      maxSize: this.maxSize
    };
  }
}
const _MemoryManager = class _MemoryManager2 {
  constructor() {
    this.pools = /* @__PURE__ */ new Map();
    this.memoryCheckInterval = null;
    this.gcCallbacks = /* @__PURE__ */ new Set();
    this.memoryThreshold = 0.8;
    this.lastGCTime = 0;
    this.gcCount = 0;
    this.weakRefs = /* @__PURE__ */ new Map();
    this.stats = {
      totalAllocations: 0,
      totalDeallocations: 0,
      gcTriggers: 0,
      memoryPressureEvents: 0
    };
    this.finalizationRegistry = new FinalizationRegistry((heldValue) => {
      this.onObjectFinalized(heldValue);
    });
    this.startMemoryMonitoring();
  }
  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!_MemoryManager2.instance) {
      _MemoryManager2.instance = new _MemoryManager2();
    }
    return _MemoryManager2.instance;
  }
  /**
   * 注册对象池
   */
  registerPool(name, config) {
    if (this.pools.has(name)) {
      throw new Error(`Pool "${name}" already exists`);
    }
    const pool = new ObjectPool(config);
    this.pools.set(name, pool);
    return pool;
  }
  /**
   * 获取对象池
   */
  getPool(name) {
    return this.pools.get(name);
  }
  /**
   * 从池中获取对象
   */
  acquireFromPool(poolName) {
    const pool = this.pools.get(poolName);
    return pool?.acquire();
  }
  /**
   * 释放对象到池
   */
  releaseToPool(poolName, obj) {
    const pool = this.pools.get(poolName);
    pool?.release(obj);
  }
  /**
   * 注册弱引用对象（用于追踪大对象）
   */
  registerWeakRef(key, obj) {
    const weakRef = new WeakRef(obj);
    this.weakRefs.set(key, weakRef);
    this.finalizationRegistry.register(obj, key);
    this.stats.totalAllocations++;
  }
  /**
   * 获取弱引用对象
   */
  getWeakRef(key) {
    const weakRef = this.weakRefs.get(key);
    if (weakRef) {
      const obj = weakRef.deref();
      if (!obj) {
        this.weakRefs.delete(key);
      }
      return obj;
    }
    return void 0;
  }
  /**
   * 对象被回收时的回调
   */
  onObjectFinalized(key) {
    this.weakRefs.delete(key);
    this.stats.totalDeallocations++;
  }
  /**
   * 添加GC回调
   */
  addGCCallback(callback) {
    this.gcCallbacks.add(callback);
  }
  /**
   * 移除GC回调
   */
  removeGCCallback(callback) {
    this.gcCallbacks.delete(callback);
  }
  /**
   * 手动触发垃圾回收（建议）
   */
  suggestGC() {
    this.gcCount++;
    this.lastGCTime = Date.now();
    this.stats.gcTriggers++;
    this.pools.forEach((pool) => {
      const stats = pool.getStats();
      if (stats.poolSize > Math.max(10, stats.inUseSize)) {
        pool.clear();
      }
    });
    this.weakRefs.forEach((ref, key) => {
      if (!ref.deref()) {
        this.weakRefs.delete(key);
      }
    });
    for (const callback of this.gcCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error("GC callback error:", error);
      }
    }
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        window.gc?.();
      } catch {
      }
    }
  }
  /**
   * 获取内存统计信息
   */
  getMemoryStats() {
    if (typeof window === "undefined" || !performance.memory) {
      return null;
    }
    const memory = performance.memory;
    if (!memory) return null;
    return {
      usedHeapSize: memory.usedJSHeapSize,
      totalHeapSize: memory.totalJSHeapSize,
      heapLimit: memory.jsHeapSizeLimit,
      external: 0,
      gcCount: this.gcCount,
      lastGCTime: this.lastGCTime
    };
  }
  /**
   * 检查内存压力
   */
  checkMemoryPressure() {
    const stats = this.getMemoryStats();
    if (!stats) return false;
    const usage = stats.usedHeapSize / stats.heapLimit;
    if (usage > this.memoryThreshold) {
      this.stats.memoryPressureEvents++;
      return true;
    }
    return false;
  }
  /**
   * 开始内存监控
   */
  startMemoryMonitoring() {
    if (typeof window === "undefined") return;
    this.memoryCheckInterval = setInterval(() => {
      if (this.checkMemoryPressure()) {
        console.warn("Memory pressure detected, triggering cleanup");
        this.suggestGC();
      }
    }, 3e4);
  }
  /**
   * 停止内存监控
   */
  stopMemoryMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }
  /**
   * 获取管理器统计信息
   */
  getStats() {
    const poolStats = {};
    this.pools.forEach((pool, name) => {
      poolStats[name] = pool.getStats();
    });
    return {
      ...this.stats,
      pools: poolStats,
      weakRefs: this.weakRefs.size,
      gcCallbacks: this.gcCallbacks.size,
      memoryStats: this.getMemoryStats()
    };
  }
  /**
   * 销毁管理器
   */
  destroy() {
    this.stopMemoryMonitoring();
    this.pools.forEach((pool) => pool.clear());
    this.pools.clear();
    this.gcCallbacks.clear();
    this.weakRefs.clear();
    _MemoryManager2.instance = null;
  }
};
_MemoryManager.instance = null;
let MemoryManager = _MemoryManager;
class SafeTimerManager {
  constructor() {
    this.timers = /* @__PURE__ */ new Map();
    this.intervals = /* @__PURE__ */ new Map();
  }
  /**
   * 设置定时器（自动清理旧的）
   */
  setTimeout(key, callback, delay) {
    this.clearTimeout(key);
    const timer = setTimeout(() => {
      this.timers.delete(key);
      callback();
    }, delay);
    this.timers.set(key, timer);
  }
  /**
   * 清理定时器
   */
  clearTimeout(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
  /**
   * 设置间隔定时器
   */
  setInterval(key, callback, interval) {
    this.clearInterval(key);
    const timer = setInterval(callback, interval);
    this.intervals.set(key, timer);
  }
  /**
   * 清理间隔定时器
   */
  clearInterval(key) {
    const timer = this.intervals.get(key);
    if (timer) {
      clearInterval(timer);
      this.intervals.delete(key);
    }
  }
  /**
   * 清理所有定时器
   */
  clearAll() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.intervals.forEach((timer) => clearInterval(timer));
    this.timers.clear();
    this.intervals.clear();
  }
  /**
   * 获取活跃定时器数量
   */
  getActiveCount() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size
    };
  }
}
const memoryManager = MemoryManager.getInstance();
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.MemoryManager = MemoryManager;
exports.ObjectPool = ObjectPool;
exports.SafeTimerManager = SafeTimerManager;
exports.memoryManager = memoryManager;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=MemoryManager.cjs.map
