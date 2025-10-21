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

class LRUCache {
  constructor(capacity = 50) {
    this.hits = 0;
    this.misses = 0;
    this.lastOptimizeTime = Date.now();
    this.minCapacity = 50;
    this.maxCapacity = 500;
    this.optimizeInterval = 6e4;
    this.capacity = Math.max(this.minCapacity, Math.min(capacity, this.maxCapacity));
    this.size = 0;
    this.cache = /* @__PURE__ */ new Map();
    this.head = {
      key: "",
      value: null,
      timestamp: 0,
      prev: null,
      next: null
    };
    this.tail = {
      key: "",
      value: null,
      timestamp: 0,
      prev: null,
      next: null
    };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      this.misses++;
      this.tryOptimizeCapacity();
      return void 0;
    }
    this.hits++;
    this.moveToHead(node);
    node.timestamp = Date.now();
    this.tryOptimizeCapacity();
    return node.value;
  }
  set(key, value) {
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.timestamp = Date.now();
      this.moveToHead(existingNode);
    } else {
      const newNode = {
        key,
        value,
        timestamp: Date.now(),
        prev: null,
        next: null
      };
      if (this.size >= this.capacity) {
        const tail = this.removeTail();
        if (tail) {
          this.cache.delete(tail.key);
          this.size--;
        }
      }
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      this.size++;
    }
  }
  clear() {
    this.cache.clear();
    this.size = 0;
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.hits = 0;
    this.misses = 0;
  }
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.size,
      capacity: this.capacity
    };
  }
  /**
   * 动态调整缓存大小
   */
  resize(newCapacity) {
    const validCapacity = Math.max(this.minCapacity, Math.min(newCapacity, this.maxCapacity));
    if (validCapacity === this.capacity) {
      return;
    }
    this.capacity = validCapacity;
    while (this.size > this.capacity) {
      const tail = this.removeTail();
      if (tail) {
        this.cache.delete(tail.key);
        this.size--;
      }
    }
  }
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    if (this.head.next) {
      this.head.next.prev = node;
    }
    this.head.next = node;
  }
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
  }
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  removeTail() {
    const lastNode = this.tail.prev;
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode);
      return lastNode;
    }
    return null;
  }
  tryOptimizeCapacity() {
    const now = Date.now();
    if (now - this.lastOptimizeTime < this.optimizeInterval) {
      return;
    }
    this.lastOptimizeTime = now;
    const hitRate = this.getStats().hitRate;
    if (hitRate < 0.3 && this.capacity < this.maxCapacity) {
      this.capacity = Math.min(this.capacity * 1.5, this.maxCapacity);
    } else if (hitRate > 0.8 && this.capacity > this.minCapacity) {
      this.capacity = Math.max(this.capacity * 0.8, this.minCapacity);
    }
  }
}

exports.LRUCache = LRUCache;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=lru-cache.cjs.map
