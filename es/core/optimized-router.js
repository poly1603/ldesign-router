/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ObjectPool, StringPool } from './matcher/optimized-trie.js';

class RouterEventBus extends EventTarget {
  constructor() {
    super(...arguments);
    this.listenerCounts = /* @__PURE__ */ new Map();
    this.MAX_LISTENERS = 100;
    this.eventPool = new ObjectPool(() => new CustomEvent("router", {
      detail: {}
    }), (event) => {
      Object.keys(event.detail).forEach((key) => delete event.detail[key]);
    }, 10);
  }
  addEventListener(type, callback, options) {
    const count = this.listenerCounts.get(type) || 0;
    if (count >= this.MAX_LISTENERS) {
      console.warn(`Maximum listeners (${this.MAX_LISTENERS}) for event "${type}" reached`);
      return;
    }
    this.listenerCounts.set(type, count + 1);
    super.addEventListener(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    const count = this.listenerCounts.get(type) || 0;
    if (count > 0) {
      this.listenerCounts.set(type, count - 1);
    }
    super.removeEventListener(type, callback, options);
  }
  emit(type, detail) {
    const event = this.eventPool.acquire();
    Object.assign(event.detail, detail);
    this.dispatchEvent(new CustomEvent(type, {
      detail
    }));
    setTimeout(() => {
      this.eventPool.release(event);
    }, 0);
  }
  clear() {
    this.listenerCounts.clear();
    this.eventPool.clear();
  }
}
class NavigationStateManager {
  constructor() {
    this.pendingNavigations = /* @__PURE__ */ new WeakMap();
    this.history = [];
    this.MAX_HISTORY = 50;
    this.historyIndex = 0;
  }
  addNavigation(to, from) {
    this.history[this.historyIndex % this.MAX_HISTORY] = {
      to: to.path,
      from: from.path,
      timestamp: Date.now()
    };
    this.historyIndex++;
  }
  setPending(location, from, resolve, reject) {
    this.pendingNavigations.set(location, {
      timestamp: Date.now(),
      from,
      resolve,
      reject
    });
    setTimeout(() => {
      const pending = this.pendingNavigations.get(location);
      if (pending && Date.now() - pending.timestamp > 5e3) {
        pending.reject(new Error("Navigation timeout"));
        this.pendingNavigations.delete(location);
      }
    }, 5e3);
  }
  getPending(location) {
    return this.pendingNavigations.get(location);
  }
  clearPending(location) {
    this.pendingNavigations.delete(location);
  }
  getRecentHistory(count = 10) {
    const start = Math.max(0, this.historyIndex - count);
    const end = this.historyIndex;
    const result = [];
    for (let i = start; i < end; i++) {
      const item = this.history[i % this.MAX_HISTORY];
      if (item) {
        result.push(item);
      }
    }
    return result;
  }
  clear() {
    this.history.length = 0;
    this.historyIndex = 0;
  }
}
class GuardExecutor {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.CACHE_TTL = 1e3;
    this.MAX_CACHE_SIZE = 100;
    this.stringPool = new StringPool();
  }
  async execute(guard, to, from) {
    const cacheKey = this.stringPool.intern(`${guard.name || "anonymous"}_${to.path}_${from.path}`);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    const result = await this.executeGuard(guard, to, from);
    this.setCacheResult(cacheKey, result);
    return result;
  }
  async executeGuard(guard, to, from) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const next = (result) => {
        if (isResolved) {
          console.warn("Guard next() called multiple times");
          return;
        }
        isResolved = true;
        if (result === false) {
          reject(new Error("Navigation cancelled"));
        } else if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      };
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error("Guard timeout"));
        }
      }, 3e3);
      try {
        const guardResult = guard(to, from, next);
        if (guardResult && typeof guardResult === "object" && "then" in guardResult) {
          guardResult.then((result) => {
            clearTimeout(timeout);
            if (!isResolved) {
              isResolved = true;
              resolve(result);
            }
          }, (error) => {
            clearTimeout(timeout);
            if (!isResolved) {
              isResolved = true;
              reject(error);
            }
          });
        } else {
          clearTimeout(timeout);
        }
      } catch (error) {
        clearTimeout(timeout);
        if (!isResolved) {
          isResolved = true;
          reject(error);
        }
      }
    });
  }
  setCacheResult(key, result) {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const keysToDelete = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp).slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.25)).map(([key2]) => key2);
      keysToDelete.forEach((key2) => this.cache.delete(key2));
    }
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
  clearCache() {
    this.cache.clear();
    this.stringPool.clear();
  }
}
class OptimizedRouter {
  constructor(_options) {
    this.eventBus = new RouterEventBus();
    this.navigationState = new NavigationStateManager();
    this.guardExecutor = new GuardExecutor();
    this.locationPool = new ObjectPool(() => ({
      path: "",
      name: void 0,
      params: {},
      query: {},
      hash: "",
      fullPath: "",
      matched: [],
      meta: {},
      redirectedFrom: void 0
    }), (location) => {
      location.path = "";
      location.name = void 0;
      location.params = {};
      location.query = {};
      location.hash = "";
      location.fullPath = "";
      location.matched = [];
      location.meta = {};
      location.redirectedFrom = void 0;
    }, 20);
    this.MEMORY_CHECK_INTERVAL = 3e4;
    this.startMemoryMonitoring();
  }
  /**
   * 添加导航守卫（优化版）
   */
  beforeEach(guard) {
    const wrappedGuard = (event) => {
      const {
        to,
        from,
        next
      } = event.detail;
      return guard(to, from, next);
    };
    this.eventBus.addEventListener("beforeEach", wrappedGuard);
    return () => {
      this.eventBus.removeEventListener("beforeEach", wrappedGuard);
    };
  }
  beforeResolve(guard) {
    const wrappedGuard = (event) => {
      const {
        to,
        from,
        next
      } = event.detail;
      return guard(to, from, next);
    };
    this.eventBus.addEventListener("beforeResolve", wrappedGuard);
    return () => {
      this.eventBus.removeEventListener("beforeResolve", wrappedGuard);
    };
  }
  afterEach(hook) {
    const wrappedHook = (event) => {
      const {
        to,
        from,
        failure
      } = event.detail;
      return hook(to, from, failure);
    };
    this.eventBus.addEventListener("afterEach", wrappedHook);
    return () => {
      this.eventBus.removeEventListener("afterEach", wrappedHook);
    };
  }
  // 守卫执行方法已移除
  /**
   * 内存监控
   */
  startMemoryMonitoring() {
    if (typeof window === "undefined") return;
    this.memoryCheckInterval = window.setInterval(() => {
      this.checkMemory();
    }, this.MEMORY_CHECK_INTERVAL);
  }
  checkMemory() {
    if (typeof performance === "undefined" || !("memory" in performance)) return;
    const memory = performance.memory;
    const usedMemory = memory.usedJSHeapSize;
    const totalMemory = memory.totalJSHeapSize;
    const usage = usedMemory / totalMemory;
    if (usage > 0.8) {
      console.warn(`High memory usage detected: ${(usage * 100).toFixed(2)}%`);
      this.performCleanup();
    }
  }
  performCleanup() {
    this.guardExecutor.clearCache();
    if (this.navigationState.getRecentHistory(1).length > 0) {
      const recent = this.navigationState.getRecentHistory(10);
      this.navigationState.clear();
      recent.forEach((item) => {
        const to = this.locationPool.acquire();
        const from = this.locationPool.acquire();
        to.path = item.to;
        from.path = item.from;
        this.navigationState.addNavigation(to, from);
        this.locationPool.release(to);
        this.locationPool.release(from);
      });
    }
    if (typeof globalThis !== "undefined" && typeof globalThis.gc === "function") {
      globalThis.gc();
    }
  }
  /**
   * 销毁路由器
   */
  destroy() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
    this.eventBus.clear();
    this.navigationState.clear();
    this.guardExecutor.clearCache();
    this.locationPool.clear();
  }
  /**
   * 获取内存统计
   */
  getMemoryStats() {
    return {
      eventListeners: Array.from(this.eventBus.listenerCounts?.values?.() ?? []).reduce((a, b) => a + b, 0),
      navigationHistory: this.navigationState.getRecentHistory().length,
      guardCache: this.guardExecutor.cache?.size ?? 0,
      locationPool: this.locationPool.getPoolSize()
    };
  }
}

export { OptimizedRouter };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=optimized-router.js.map
