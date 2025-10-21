/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class StringUtils {
  /**
   * 字符串内部化 - 复用相同字符串
   */
  static intern(str) {
    if (!str) return str;
    let interned = this.stringPool.get(str);
    if (!interned) {
      if (this.stringPool.size >= this.MAX_POOL_SIZE) {
        const toDelete = Math.floor(this.MAX_POOL_SIZE * 0.1);
        const keys = Array.from(this.stringPool.keys());
        for (let i = 0; i < toDelete && i < keys.length; i++) {
          const key = keys[i];
          if (key !== void 0) {
            this.stringPool.delete(key);
          }
        }
      }
      this.stringPool.set(str, str);
      interned = str;
    }
    return interned;
  }
  /**
   * 高效的路径拼接 - 避免创建临时字符串
   */
  static joinPath(...segments) {
    const cleaned = [];
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segment && segment !== "/") {
        cleaned.push(segment.replace(/^\/+|\/+$/g, ""));
      }
    }
    return `/${cleaned.join("/")}`;
  }
  static splitPath(path) {
    let segments = this.segmentCache.get(path);
    if (!segments) {
      segments = path.split("/").filter(Boolean);
      if (this.segmentCache.size < 100) {
        this.segmentCache.set(path, segments);
      }
    }
    return segments.slice();
  }
  static parseQuery(queryString) {
    if (!queryString) return {};
    const cached = this.queryCache.get(queryString);
    if (cached) return {
      ...cached
    };
    const query = /* @__PURE__ */ Object.create(null);
    const pairs = queryString.replace(/^\?/, "").split("&");
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair) continue;
      const eqIndex = pair.indexOf("=");
      if (eqIndex === -1) {
        query[decodeURIComponent(pair)] = "";
      } else {
        const key = decodeURIComponent(pair.slice(0, eqIndex));
        const value = decodeURIComponent(pair.slice(eqIndex + 1));
        query[key] = value;
      }
    }
    if (this.queryCache.size < 50) {
      this.queryCache.set(queryString, query);
    }
    return query;
  }
  /**
   * 清理缓存
   */
  static clearCaches() {
    this.stringPool.clear();
    this.segmentCache.clear();
    this.queryCache.clear();
  }
}
StringUtils.stringPool = /* @__PURE__ */ new Map();
StringUtils.MAX_POOL_SIZE = 1e3;
StringUtils.segmentCache = /* @__PURE__ */ new Map();
StringUtils.queryCache = /* @__PURE__ */ new Map();
class ObjectUtils {
  /**
   * 获取空对象 - 从池中获取或创建新的
   */
  static getEmptyObject() {
    return this.emptyObjects.pop() || /* @__PURE__ */ Object.create(null);
  }
  /**
   * 释放对象回池
   */
  static releaseObject(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const key in obj) {
      delete obj[key];
    }
    if (this.emptyObjects.length < this.MAX_POOL_SIZE) {
      this.emptyObjects.push(obj);
    }
  }
  /**
   * 浅克隆优化 - 避免 Object.assign 的开销
   */
  static shallowClone(obj) {
    if (!obj) return obj;
    const clone = this.getEmptyObject();
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = obj[key];
      }
    }
    return clone;
  }
  /**
   * 深度冻结优化 - 使用迭代代替递归
   */
  static deepFreeze(obj) {
    const toFreeze = [obj];
    const frozen = /* @__PURE__ */ new WeakSet();
    while (toFreeze.length > 0) {
      const current = toFreeze.pop();
      if (frozen.has(current)) continue;
      Object.freeze(current);
      frozen.add(current);
      for (const key in current) {
        const value = current[key];
        if (value && typeof value === "object" && !frozen.has(value)) {
          toFreeze.push(value);
        }
      }
    }
    return obj;
  }
  /**
   * 对象差异比较 - 优化内存使用
   */
  static diff(oldObj, newObj) {
    const added = [];
    const removed = [];
    const modified = [];
    const oldKeys = new Set(Object.keys(oldObj || {}));
    const newKeys = new Set(Object.keys(newObj || {}));
    for (const key of newKeys) {
      if (!oldKeys.has(key)) {
        added.push(key);
      } else if (oldObj[key] !== newObj[key]) {
        modified.push(key);
      }
    }
    for (const key of oldKeys) {
      if (!newKeys.has(key)) {
        removed.push(key);
      }
    }
    return {
      added,
      removed,
      modified
    };
  }
  /**
   * 清理对象池
   */
  static clearCache() {
    this.emptyObjects.length = 0;
  }
}
ObjectUtils.emptyObjects = [];
ObjectUtils.MAX_POOL_SIZE = 50;
class ArrayUtils {
  /**
   * 获取空数组
   */
  static getArray() {
    return this.arrayPool.pop() || [];
  }
  /**
   * 释放数组
   */
  static releaseArray(arr) {
    if (!Array.isArray(arr)) return;
    arr.length = 0;
    if (this.arrayPool.length < this.MAX_POOL_SIZE) {
      this.arrayPool.push(arr);
    }
  }
  /**
   * 数组去重优化 - 使用 Set
   */
  static unique(arr) {
    return Array.from(new Set(arr));
  }
  /**
   * 数组分片处理 - 避免大数组一次性处理
   */
  static *chunk(arr, size) {
    for (let i = 0; i < arr.length; i += size) {
      yield arr.slice(i, i + size);
    }
  }
  /**
   * 高效的数组过滤 - 复用结果数组
   */
  static filter(arr, predicate) {
    const result = this.getArray();
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item !== void 0 && predicate(item, i)) {
        result.push(item);
      }
    }
    return result;
  }
  /**
   * 二分查找 - 用于有序数组
   */
  static binarySearch(arr, target, compareFn) {
    let left = 0;
    let right = arr.length - 1;
    const compare = compareFn || ((a, b) => a < b ? -1 : a > b ? 1 : 0);
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = arr[mid];
      if (midValue === void 0) return -1;
      const cmp = compare(midValue, target);
      if (cmp === 0) return mid;
      if (cmp < 0) left = mid + 1;
      else right = mid - 1;
    }
    return -1;
  }
  /**
   * 清理数组池
   */
  static clearCache() {
    this.arrayPool.length = 0;
  }
}
ArrayUtils.arrayPool = [];
ArrayUtils.MAX_POOL_SIZE = 30;
class FunctionUtils {
  /**
   * 记忆化函数 - 缓存计算结果
   */
  static memoize(fn) {
    let cache = this.memoCache.get(fn);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      this.memoCache.set(fn, cache);
    }
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      if (cache.size >= 100) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== void 0) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, result);
      return result;
    };
  }
  static debounce(fn, delay) {
    return (...args) => {
      const prevTimer = this.debounceTimers.get(fn);
      if (prevTimer !== void 0) {
        clearTimeout(prevTimer);
      }
      const timer = setTimeout(() => {
        this.debounceTimers.delete(fn);
        fn(...args);
      }, delay);
      this.debounceTimers.set(fn, timer);
    };
  }
  static throttle(fn, limit) {
    return (...args) => {
      const now = Date.now();
      const lastCall = this.throttleTimestamps.get(fn) || 0;
      if (now - lastCall >= limit) {
        this.throttleTimestamps.set(fn, now);
        fn(...args);
      }
    };
  }
  static once(fn) {
    return (...args) => {
      if (!this.onceFlags.has(fn)) {
        this.onceFlags.add(fn);
        return fn(...args);
      }
    };
  }
  /**
   * 清理缓存
   */
  static clearCache() {
    this.memoCache = /* @__PURE__ */ new WeakMap();
  }
}
FunctionUtils.memoCache = /* @__PURE__ */ new WeakMap();
FunctionUtils.debounceTimers = /* @__PURE__ */ new WeakMap();
FunctionUtils.throttleTimestamps = /* @__PURE__ */ new WeakMap();
FunctionUtils.onceFlags = /* @__PURE__ */ new WeakSet();
class AsyncUtils {
  /**
   * 获取已解决的 Promise
   */
  static getResolvedPromise(value) {
    return value === void 0 ? this.resolvedPromise : Promise.resolve(value);
  }
  /**
   * 批量并发控制
   */
  static async parallelLimit(items, limit, fn) {
    const results = [];
    const executing = [];
    for (const item of items) {
      const promise = Promise.resolve().then(() => fn(item)).then((result) => {
        results.push(result);
      });
      executing.push(promise);
      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex((p) => p), 1);
      }
    }
    await Promise.all(executing);
    return results;
  }
  /**
   * 超时 Promise
   */
  static withTimeout(promise, timeout, error) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(error || new Error(`Promise timed out after ${timeout}ms`));
      }, timeout);
      promise.then((value) => {
        clearTimeout(timer);
        resolve(value);
      }, (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
  /**
   * 重试机制
   */
  static async retry(fn, retries = 3, delay = 1e3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    throw lastError;
  }
  /**
   * 清理Promise池
   */
  static clearCache() {
    this.promisePool.length = 0;
  }
}
AsyncUtils.promisePool = [];
AsyncUtils.resolvedPromise = Promise.resolve();
class MemoryUtils {
  // private static readonly _MAX_MEASUREMENTS = 100 // 保留用于未来功能
  /**
   * 测量函数内存使用
   */
  static async measureMemory(fn) {
    const startMemory = this.getMemoryUsage();
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    return {
      result,
      memoryUsed: endMemory - startMemory,
      time: endTime - startTime
    };
  }
  /**
   * 获取当前内存使用
   */
  static getMemoryUsage() {
    if (typeof performance !== "undefined" && "memory" in performance) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  static detectLeak(key, size) {
    const detector = this.leakDetectors.get(key) || {
      count: 0,
      lastSize: 0
    };
    if (size > detector.lastSize * 1.5 && detector.count > 5) {
      console.warn(`Potential memory leak detected: ${key}`);
      return true;
    }
    detector.count++;
    detector.lastSize = size;
    this.leakDetectors.set(key, detector);
    if (this.leakDetectors.size > 100) {
      const firstKey = this.leakDetectors.keys().next().value;
      if (firstKey !== void 0) {
        this.leakDetectors.delete(firstKey);
      }
    }
    return false;
  }
  /**
   * 手动触发垃圾回收（如果可用）
   */
  static gc() {
    if (typeof globalThis !== "undefined" && typeof globalThis.gc === "function") {
      globalThis.gc();
    }
  }
  /**
   * 清理所有缓存
   */
  static clearAllCaches() {
    StringUtils.clearCaches();
    ArrayUtils.clearCache();
    ObjectUtils.clearCache();
    FunctionUtils.clearCache();
    AsyncUtils.clearCache();
    this.measurements.length = 0;
    this.leakDetectors.clear();
  }
}
MemoryUtils.measurements = [];
MemoryUtils.leakDetectors = /* @__PURE__ */ new Map();
class PerformanceMonitor {
  /**
   * 开始标记
   */
  static mark(name) {
    this.marks.set(name, performance.now());
  }
  /**
   * 测量并记录
   */
  static measure(name, startMark) {
    const start = this.marks.get(startMark);
    if (!start) return 0;
    const duration = performance.now() - start;
    let measures = this.measures.get(name);
    if (!measures) {
      measures = [];
      this.measures.set(name, measures);
    }
    measures.push(duration);
    if (measures.length > 100) {
      measures.shift();
    }
    return duration;
  }
  /**
   * 获取统计信息
   */
  static getStats(name) {
    const measures = this.measures.get(name);
    if (!measures || measures.length === 0) return null;
    const total = measures.reduce((a, b) => a + b, 0);
    return {
      count: measures.length,
      total,
      average: total / measures.length,
      min: Math.min(...measures),
      max: Math.max(...measures)
    };
  }
  /**
   * 清理监控数据
   */
  static clear() {
    this.marks.clear();
    this.measures.clear();
  }
}
PerformanceMonitor.marks = /* @__PURE__ */ new Map();
PerformanceMonitor.measures = /* @__PURE__ */ new Map();

export { ArrayUtils, AsyncUtils, FunctionUtils, MemoryUtils, ObjectUtils, PerformanceMonitor, StringUtils };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=optimized-utils.js.map
