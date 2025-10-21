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

var vue = require('vue');

exports.CachePriority = void 0;
(function(CachePriority2) {
  CachePriority2["HOT"] = "hot";
  CachePriority2["WARM"] = "warm";
  CachePriority2["COLD"] = "cold";
})(exports.CachePriority || (exports.CachePriority = {}));
class EnhancedWeakRefManager {
  constructor() {
    this.refs = /* @__PURE__ */ new Map();
    this.metadata = /* @__PURE__ */ new Map();
    if (typeof FinalizationRegistry !== "undefined") {
      this.registry = new FinalizationRegistry((key) => {
        this.handleFinalization(key);
      });
    }
  }
  /**
   * 创建弱引用（优化版）
   */
  createRef(key, target, metadata) {
    if (this.refs.size > 100) {
      this.cleanup();
    }
    this.removeRef(key);
    if (typeof WeakRef !== "undefined") {
      const ref = new WeakRef(target);
      this.refs.set(key, ref);
      if (this.registry) {
        this.registry.register(target, key);
      }
      if (metadata) {
        this.metadata.set(key, metadata);
      }
    }
  }
  /**
   * 清理无效的弱引用
   */
  cleanup() {
    const keysToDelete = [];
    for (const [key, ref] of this.refs.entries()) {
      if (!ref.deref()) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => {
      this.refs.delete(key);
      this.metadata.delete(key);
    });
  }
  /**
   * 获取弱引用
   */
  getRef(key) {
    const ref = this.refs.get(key);
    if (!ref) return void 0;
    const target = ref.deref();
    if (!target) {
      this.removeRef(key);
      return void 0;
    }
    return target;
  }
  /**
   * 移除弱引用
   */
  removeRef(key) {
    const deleted = this.refs.delete(key);
    this.metadata.delete(key);
    return deleted;
  }
  /**
   * 处理对象终结
   */
  handleFinalization(key) {
    this.refs.delete(key);
    this.metadata.delete(key);
  }
  /**
   * 获取统计信息
   */
  getStats() {
    let totalSize = 0;
    this.metadata.forEach((meta) => {
      totalSize += meta.size || 0;
    });
    return {
      count: this.refs.size,
      totalSize
    };
  }
  /**
   * 清理所有引用
   */
  clear() {
    this.refs.clear();
    this.metadata.clear();
  }
}
class TieredCacheManager {
  constructor(config = {}) {
    this.l1Cache = /* @__PURE__ */ new Map();
    this.l2Cache = /* @__PURE__ */ new Map();
    this.l3Cache = /* @__PURE__ */ new Map();
    this.accessPatterns = /* @__PURE__ */ new Map();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
    this.config = {
      enabled: true,
      l1Capacity: 20,
      l2Capacity: 50,
      l3Capacity: 100,
      promotionThreshold: 3,
      demotionThreshold: 6e4,
      // 1分钟
      ...config
    };
  }
  /**
   * 获取缓存项
   */
  get(key) {
    const now = Date.now();
    let item = this.l1Cache.get(key);
    let fromLevel = 1;
    if (!item) {
      item = this.l2Cache.get(key);
      fromLevel = 2;
    }
    if (!item) {
      item = this.l3Cache.get(key);
      fromLevel = 3;
    }
    if (!item) {
      this.missCount++;
      return void 0;
    }
    this.hitCount++;
    item.accessCount++;
    item.lastAccessTime = now;
    this.recordAccess(key, now);
    if (fromLevel > 1) {
      this.checkPromotion(key, item, fromLevel);
    }
    return item.value;
  }
  /**
   * 设置缓存项（优化版）
   */
  set(key, value, options) {
    const now = Date.now();
    if (this.l1Cache.size + this.l2Cache.size + this.l3Cache.size > 100) {
      this.cleanupExpired(now);
    }
    const item = {
      key,
      value,
      size: options?.size || this.estimateSize(value),
      priority: options?.priority || this.determineInitialPriority(key),
      accessCount: 1,
      lastAccessTime: now,
      createTime: now,
      ttl: options?.ttl,
      tags: options?.tags
    };
    this.addToAppropriateLayer(key, item);
    this.recordAccess(key, now);
  }
  /**
   * 删除缓存项
   */
  delete(key) {
    const deleted = this.l1Cache.delete(key) || this.l2Cache.delete(key) || this.l3Cache.delete(key);
    if (deleted) {
      this.accessPatterns.delete(key);
    }
    return deleted;
  }
  /**
   * 清空所有缓存
   */
  clear() {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.l3Cache.clear();
    this.accessPatterns.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
  }
  /**
   * 获取缓存统计
   */
  getStats() {
    const totalAccess = this.hitCount + this.missCount;
    return {
      hitRate: totalAccess > 0 ? this.hitCount / totalAccess : 0,
      l1Size: this.l1Cache.size,
      l2Size: this.l2Cache.size,
      l3Size: this.l3Cache.size,
      totalSize: this.l1Cache.size + this.l2Cache.size + this.l3Cache.size,
      evictionCount: this.evictionCount
    };
  }
  /**
   * 获取内存使用量
   */
  getMemoryUsage() {
    let l1Memory = 0;
    let l2Memory = 0;
    let l3Memory = 0;
    this.l1Cache.forEach((item) => l1Memory += item.size);
    this.l2Cache.forEach((item) => l2Memory += item.size);
    this.l3Cache.forEach((item) => l3Memory += item.size);
    return {
      l1: l1Memory,
      l2: l2Memory,
      l3: l3Memory,
      total: l1Memory + l2Memory + l3Memory
    };
  }
  /**
   * 优化缓存层级
   */
  optimize() {
    const now = Date.now();
    this.cleanupExpired(now);
    this.adjustLayers(now);
  }
  // ==================== 私有方法 ====================
  addToAppropriateLayer(key, item) {
    switch (item.priority) {
      case exports.CachePriority.HOT:
        this.addToL1(key, item);
        break;
      case exports.CachePriority.WARM:
        this.addToL2(key, item);
        break;
      case exports.CachePriority.COLD:
        this.addToL3(key, item);
        break;
    }
  }
  addToL1(key, item) {
    if (this.l1Cache.size >= this.config.l1Capacity) {
      this.evictFromL1();
    }
    this.l1Cache.set(key, item);
  }
  addToL2(key, item) {
    if (this.l2Cache.size >= this.config.l2Capacity) {
      this.evictFromL2();
    }
    this.l2Cache.set(key, item);
  }
  addToL3(key, item) {
    if (this.l3Cache.size >= this.config.l3Capacity) {
      this.evictFromL3();
    }
    this.l3Cache.set(key, item);
  }
  evictFromL1() {
    const victim = this.findEvictionCandidate(this.l1Cache);
    if (victim) {
      const item = this.l1Cache.get(victim);
      this.l1Cache.delete(victim);
      item.priority = exports.CachePriority.WARM;
      this.addToL2(victim, item);
      this.evictionCount++;
    }
  }
  evictFromL2() {
    const victim = this.findEvictionCandidate(this.l2Cache);
    if (victim) {
      const item = this.l2Cache.get(victim);
      this.l2Cache.delete(victim);
      item.priority = exports.CachePriority.COLD;
      this.addToL3(victim, item);
      this.evictionCount++;
    }
  }
  evictFromL3() {
    const victim = this.findEvictionCandidate(this.l3Cache);
    if (victim) {
      this.l3Cache.delete(victim);
      this.accessPatterns.delete(victim);
      this.evictionCount++;
    }
  }
  findEvictionCandidate(cache) {
    if (cache.size === 0) return null;
    let minScore = Infinity;
    let candidate = null;
    for (const [key, item] of cache.entries()) {
      const timeSinceLastAccess = Date.now() - item.lastAccessTime;
      const frequency = item.accessCount / Math.max(1, Date.now() - item.createTime);
      const score = frequency * 1e6 - timeSinceLastAccess;
      if (score < minScore) {
        minScore = score;
        candidate = key;
      }
    }
    return candidate;
  }
  checkPromotion(key, item, currentLevel) {
    const recentAccess = this.getRecentAccessCount(key, 1e4);
    if (recentAccess >= this.config.promotionThreshold) {
      if (currentLevel === 3) {
        this.l3Cache.delete(key);
        item.priority = exports.CachePriority.WARM;
        this.addToL2(key, item);
      } else if (currentLevel === 2) {
        this.l2Cache.delete(key);
        item.priority = exports.CachePriority.HOT;
        this.addToL1(key, item);
      }
    }
  }
  recordAccess(key, timestamp) {
    const pattern = this.accessPatterns.get(key) || [];
    pattern.push(timestamp);
    const twoMinutesAgo = timestamp - 12e4;
    const recent = pattern.filter((t) => t > twoMinutesAgo);
    this.accessPatterns.set(key, recent);
  }
  getRecentAccessCount(key, windowMs) {
    const pattern = this.accessPatterns.get(key);
    if (!pattern) return 0;
    const now = Date.now();
    return pattern.filter((t) => now - t < windowMs).length;
  }
  determineInitialPriority(key) {
    const pattern = this.accessPatterns.get(key);
    if (!pattern || pattern.length === 0) {
      return exports.CachePriority.COLD;
    }
    const recentCount = this.getRecentAccessCount(key, 3e4);
    if (recentCount >= 5) return exports.CachePriority.HOT;
    if (recentCount >= 2) return exports.CachePriority.WARM;
    return exports.CachePriority.COLD;
  }
  estimateSize(value) {
    if (value === null || value === void 0) return 0;
    const type = typeof value;
    if (type === "string") return value.length * 2;
    if (type === "number") return 8;
    if (type === "boolean") return 4;
    if (type === "object") {
      if (Array.isArray(value)) {
        return value.length * 50;
      }
      return Object.keys(value).length * 100;
    }
    return 100;
  }
  cleanupExpired(now) {
    const checkAndClean = (cache) => {
      for (const [key, item] of cache.entries()) {
        if (item.ttl && now - item.createTime > item.ttl) {
          cache.delete(key);
          this.accessPatterns.delete(key);
        }
      }
    };
    checkAndClean(this.l1Cache);
    checkAndClean(this.l2Cache);
    checkAndClean(this.l3Cache);
  }
  adjustLayers(now) {
    for (const [key, item] of this.l1Cache.entries()) {
      if (now - item.lastAccessTime > this.config.demotionThreshold) {
        this.l1Cache.delete(key);
        item.priority = exports.CachePriority.WARM;
        this.addToL2(key, item);
      }
    }
    for (const [key, item] of this.l2Cache.entries()) {
      if (now - item.lastAccessTime > this.config.demotionThreshold * 2) {
        this.l2Cache.delete(key);
        item.priority = exports.CachePriority.COLD;
        this.addToL3(key, item);
      }
    }
  }
  /**
   * 获取 L3 缓存的键列表
   */
  getL3Keys() {
    return Array.from(this.l3Cache.keys());
  }
}
class UnifiedMemoryManager {
  constructor(config) {
    this.state = vue.reactive({
      stats: {
        totalMemory: 0,
        cacheMemory: 0,
        l1Memory: 0,
        l2Memory: 0,
        l3Memory: 0,
        routeMemory: 0,
        listenerCount: 0,
        weakRefCount: 0,
        cacheHitRate: 0,
        evictionCount: 0
      },
      isWarning: false,
      isCritical: false,
      lastCleanup: null
    });
    this.config = {
      tieredCache: {
        enabled: true,
        l1Capacity: 15,
        l2Capacity: 30,
        l3Capacity: 60,
        promotionThreshold: 2,
        demotionThreshold: 3e4,
        // 30秒
        ...config?.tieredCache
      },
      monitoring: {
        enabled: true,
        interval: 6e4,
        // 1分钟
        warningThreshold: 10 * 1024 * 1024,
        // 10MB
        criticalThreshold: 20 * 1024 * 1024,
        // 20MB
        ...config?.monitoring
      },
      weakRef: {
        enabled: true,
        maxRefs: 500,
        ...config?.weakRef
      },
      cleanup: {
        strategy: "aggressive",
        autoCleanup: true,
        cleanupInterval: 12e4,
        // 2分钟
        ...config?.cleanup
      }
    };
    this.tieredCache = new TieredCacheManager(this.config.tieredCache);
    this.weakRefManager = new EnhancedWeakRefManager();
    this.initialize();
  }
  // ==================== 公共 API ====================
  /**
   * 获取缓存值
   */
  get(key) {
    return this.tieredCache.get(key);
  }
  /**
   * 设置缓存值
   */
  set(key, value, options) {
    if (options?.weak && this.config.weakRef.enabled) {
      if (typeof value === "object" && value !== null) {
        this.weakRefManager.createRef(key, value);
        return;
      }
    }
    this.tieredCache.set(key, value, options);
    this.updateStats();
  }
  /**
   * 删除缓存
   */
  delete(key) {
    const deleted = this.tieredCache.delete(key);
    this.weakRefManager.removeRef(key);
    this.updateStats();
    return deleted;
  }
  /**
   * 清空所有缓存
   */
  clear() {
    this.tieredCache.clear();
    this.weakRefManager.clear();
    this.updateStats();
  }
  /**
   * 创建弱引用
   */
  createWeakRef(key, target) {
    if (this.config.weakRef.enabled) {
      this.weakRefManager.createRef(key, target);
      this.updateStats();
    }
  }
  /**
   * 获取弱引用
   */
  getWeakRef(key) {
    return this.weakRefManager.getRef(key);
  }
  /**
   * 手动触发优化
   */
  optimize() {
    this.tieredCache.optimize();
    this.performCleanup();
    this.updateStats();
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.state.stats
    };
  }
  /**
   * 获取缓存信息
   */
  getCacheInfo() {
    const cacheStats = this.tieredCache.getStats();
    const memoryUsage = this.tieredCache.getMemoryUsage();
    const weakRefStats = this.weakRefManager.getStats();
    return {
      cache: cacheStats,
      memory: memoryUsage,
      weakRef: weakRefStats
    };
  }
  // ==================== 私有方法 ====================
  initialize() {
    if (this.config.monitoring.enabled) {
      this.startMonitoring();
    }
    if (this.config.cleanup.autoCleanup) {
      this.startAutoCleanup();
    }
    this.updateStats();
  }
  startMonitoring() {
    if (typeof window === "undefined") return;
    this.monitorTimer = window.setInterval(() => {
      this.updateStats();
      this.checkThresholds();
    }, this.config.monitoring.interval);
  }
  stopMonitoring() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = void 0;
    }
  }
  startAutoCleanup() {
    if (typeof window === "undefined") return;
    this.cleanupTimer = window.setInterval(() => {
      this.performCleanup();
    }, this.config.cleanup.cleanupInterval);
  }
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = void 0;
    }
  }
  updateStats() {
    const cacheStats = this.tieredCache.getStats();
    const memoryUsage = this.tieredCache.getMemoryUsage();
    const weakRefStats = this.weakRefManager.getStats();
    this.state.stats = {
      totalMemory: this.getJSHeapSize(),
      cacheMemory: memoryUsage.total,
      l1Memory: memoryUsage.l1,
      l2Memory: memoryUsage.l2,
      l3Memory: memoryUsage.l3,
      routeMemory: 0,
      // 需要从路由器获取
      listenerCount: 0,
      // 需要从事件系统获取
      weakRefCount: weakRefStats.count,
      cacheHitRate: cacheStats.hitRate,
      evictionCount: cacheStats.evictionCount
    };
  }
  getJSHeapSize() {
    if ("memory" in performance) {
      return performance.memory.usedJSHeapSize || 0;
    }
    return 0;
  }
  checkThresholds() {
    const totalMemory = this.state.stats.totalMemory;
    if (totalMemory > this.config.monitoring.criticalThreshold) {
      this.state.isCritical = true;
      this.state.isWarning = true;
      this.performCleanup("aggressive");
    } else if (totalMemory > this.config.monitoring.warningThreshold) {
      this.state.isWarning = true;
      this.state.isCritical = false;
      this.performCleanup("moderate");
    } else {
      this.state.isWarning = false;
      this.state.isCritical = false;
    }
  }
  performCleanup(level) {
    const strategy = level || this.config.cleanup.strategy;
    const memoryPressure = this.state.stats.totalMemory / this.config.monitoring.criticalThreshold;
    if (memoryPressure > 0.9 || strategy === "aggressive") {
      this.tieredCache.clear();
      this.weakRefManager.clear();
    } else if (memoryPressure > 0.7 || strategy === "moderate") {
      this.tieredCache.optimize();
      const l3Keys = this.tieredCache.getL3Keys();
      l3Keys.slice(0, Math.floor(l3Keys.length / 2)).forEach((key) => {
        this.tieredCache.delete(key);
      });
    } else {
      this.tieredCache.optimize();
    }
    this.state.lastCleanup = /* @__PURE__ */ new Date();
    this.updateStats();
    if (typeof globalThis !== "undefined" && typeof globalThis.gc === "function") {
      globalThis.gc();
    }
  }
  /**
   * 销毁管理器 - 清理所有资源
   */
  destroy() {
    this.stopMonitoring();
    this.stopAutoCleanup();
    this.clear();
    this.state.stats = {
      totalMemory: 0,
      cacheMemory: 0,
      l1Memory: 0,
      l2Memory: 0,
      l3Memory: 0,
      routeMemory: 0,
      listenerCount: 0,
      weakRefCount: 0,
      cacheHitRate: 0,
      evictionCount: 0
    };
    this.state.isWarning = false;
    this.state.isCritical = false;
    this.state.lastCleanup = null;
  }
}
let defaultManager = null;
function getMemoryManager(config) {
  if (!defaultManager) {
    defaultManager = new UnifiedMemoryManager(config);
  }
  return defaultManager;
}
function cacheGet(key) {
  return getMemoryManager().get(key);
}
function cacheSet(key, value, options) {
  getMemoryManager().set(key, value, options);
}
function cleanupMemory() {
  getMemoryManager().optimize();
}
function destroyMemoryManager() {
  if (defaultManager) {
    defaultManager.destroy();
    defaultManager = null;
  }
}

exports.UnifiedMemoryManager = UnifiedMemoryManager;
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cleanupMemory = cleanupMemory;
exports.destroyMemoryManager = destroyMemoryManager;
exports.getMemoryManager = getMemoryManager;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=unified-memory-manager.cjs.map
