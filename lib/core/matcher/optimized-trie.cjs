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

const FLAG_HAS_CHILDREN = 1;
const FLAG_HAS_PARAM = 2;
const FLAG_HAS_WILDCARD = 4;
const FLAG_IS_OPTIONAL = 8;
const FLAG_HAS_RECORD = 16;
const FLAG_HAS_DEFAULT = 32;
class OptimizedTrieNode {
  constructor() {
    this.flags = 0;
    this.stats = new Uint16Array(2);
  }
  // Getter/Setter 方法
  get hasChildren() {
    return (this.flags & FLAG_HAS_CHILDREN) !== 0;
  }
  get children() {
    if (!this.data?.children) {
      if (!this.data) this.data = {};
      this.data.children = /* @__PURE__ */ new Map();
      this.flags |= FLAG_HAS_CHILDREN;
    }
    return this.data.children;
  }
  get paramChild() {
    return this.data?.paramChild;
  }
  set paramChild(child) {
    if (!this.data) this.data = {};
    this.data.paramChild = child;
    if (child) {
      this.flags |= FLAG_HAS_PARAM;
    } else {
      this.flags &= ~FLAG_HAS_PARAM;
    }
  }
  get paramName() {
    return this.data?.paramName;
  }
  set paramName(name) {
    if (!this.data) this.data = {};
    this.data.paramName = name;
  }
  get wildcardChild() {
    return this.data?.wildcardChild;
  }
  set wildcardChild(child) {
    if (!this.data) this.data = {};
    this.data.wildcardChild = child;
    if (child) {
      this.flags |= FLAG_HAS_WILDCARD;
    } else {
      this.flags &= ~FLAG_HAS_WILDCARD;
    }
  }
  get record() {
    return this.data?.record;
  }
  set record(record) {
    if (!this.data) this.data = {};
    this.data.record = record;
    if (record) {
      this.flags |= FLAG_HAS_RECORD;
    } else {
      this.flags &= ~FLAG_HAS_RECORD;
    }
  }
  get defaultChild() {
    return this.data?.defaultChild;
  }
  set defaultChild(child) {
    if (!this.data) this.data = {};
    this.data.defaultChild = child;
    if (child) {
      this.flags |= FLAG_HAS_DEFAULT;
    } else {
      this.flags &= ~FLAG_HAS_DEFAULT;
    }
  }
  get isOptional() {
    return (this.flags & FLAG_IS_OPTIONAL) !== 0;
  }
  set isOptional(value) {
    if (value) {
      this.flags |= FLAG_IS_OPTIONAL;
    } else {
      this.flags &= ~FLAG_IS_OPTIONAL;
    }
  }
  get weight() {
    return this.stats[0] ?? 0;
  }
  set weight(value) {
    this.stats[0] = Math.min(value, 65535);
  }
  get accessCount() {
    return this.stats[1] ?? 0;
  }
  set accessCount(value) {
    this.stats[1] = Math.min(value, 65535);
  }
  // 内存优化：清理未使用的数据
  compact() {
    if (this.data) {
      if (this.data.children?.size === 0) {
        delete this.data.children;
        this.flags &= ~FLAG_HAS_CHILDREN;
      }
      if (Object.keys(this.data).length === 0) {
        delete this.data;
      }
    }
  }
  // 获取内存占用估算
  getMemorySize() {
    let size = 4 + 4;
    if (this.data) {
      size += 8;
      if (this.data.children) {
        size += 40 + this.data.children.size * 32;
      }
      if (this.data.paramName) {
        size += this.data.paramName.length * 2 + 24;
      }
      if (this.data.paramChild) size += 8;
      if (this.data.wildcardChild) size += 8;
      if (this.data.record) size += 8;
      if (this.data.defaultChild) size += 8;
    }
    return size;
  }
}
class StringPool {
  constructor() {
    this.pool = /* @__PURE__ */ new Map();
    this.maxSize = 1e3;
  }
  /**
   * 获取内部化的字符串
   */
  intern(str) {
    if (!str) return str;
    let interned = this.pool.get(str);
    if (!interned) {
      if (this.pool.size >= this.maxSize) {
        const keysToDelete = Array.from(this.pool.keys()).slice(0, this.maxSize / 10);
        keysToDelete.forEach((key) => this.pool.delete(key));
      }
      this.pool.set(str, str);
      interned = str;
    }
    return interned;
  }
  clear() {
    this.pool.clear();
  }
  getSize() {
    return this.pool.size;
  }
}
class PathBuilder {
  constructor() {
    this.segments = [];
    this.cached = null;
  }
  add(segment) {
    this.segments.push(segment);
    this.cached = null;
    return this;
  }
  addAll(segments) {
    this.segments.push(...segments);
    this.cached = null;
    return this;
  }
  clear() {
    this.segments.length = 0;
    this.cached = null;
    return this;
  }
  toString() {
    if (this.cached === null) {
      this.cached = `/${this.segments.filter(Boolean).join("/")}`;
    }
    return this.cached;
  }
  getSegments() {
    return this.segments.slice();
  }
}
class ObjectPool {
  constructor(factory, reset, initialSize = 10, maxSize = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    this.pool = [];
    this.inUse = /* @__PURE__ */ new WeakSet();
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }
  acquire() {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }
  release(obj) {
    if (!this.inUse.has(obj)) {
      console.warn("Attempting to release object not from this pool");
      return;
    }
    this.inUse.delete(obj);
    this.reset(obj);
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }
  clear() {
    this.pool.forEach((obj) => this.reset(obj));
    this.pool.length = 0;
  }
  getPoolSize() {
    return this.pool.length;
  }
}
class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.maxMeasurements = 100;
  }
  measure() {
    const memory = typeof performance !== "undefined" && "memory" in performance ? performance.memory.usedJSHeapSize : 0;
    this.measurements.push({
      timestamp: Date.now(),
      memory
    });
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }
    return memory;
  }
  getStats() {
    if (this.measurements.length === 0) {
      return {
        current: 0,
        average: 0,
        peak: 0,
        trend: 0
      };
    }
    const memories = this.measurements.map((m) => m.memory);
    const current = memories[memories.length - 1];
    const average = memories.reduce((a, b) => a + b, 0) / memories.length;
    const peak = Math.max(...memories);
    const recent = memories.slice(-10);
    let trend = 0;
    if (recent.length > 1) {
      const firstHalf = recent.slice(0, recent.length / 2);
      const secondHalf = recent.slice(recent.length / 2);
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      trend = secondAvg - firstAvg;
    }
    return {
      current,
      average,
      peak,
      trend
    };
  }
  clear() {
    this.measurements.length = 0;
  }
}

exports.MemoryMonitor = MemoryMonitor;
exports.ObjectPool = ObjectPool;
exports.OptimizedTrieNode = OptimizedTrieNode;
exports.PathBuilder = PathBuilder;
exports.StringPool = StringPool;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=optimized-trie.cjs.map
