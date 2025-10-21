/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class MemoryCacheStorage {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  get(key) {
    const item = this.cache.get(key);
    if (item) {
      item.lastAccessedAt = Date.now();
      item.accessCount++;
      return item;
    }
    return null;
  }
  set(key, item) {
    this.cache.set(key, item);
  }
  has(key) {
    return this.cache.has(key);
  }
  delete(key) {
    return this.cache.delete(key);
  }
  clear() {
    this.cache.clear();
  }
  size() {
    return this.cache.size;
  }
  keys() {
    return Array.from(this.cache.keys());
  }
}
class SessionCacheStorage {
  constructor() {
    this.prefix = "ldesign-router-cache:";
  }
  get(key) {
    if (typeof sessionStorage === "undefined") return null;
    try {
      const data = sessionStorage.getItem(this.prefix + key);
      if (data) {
        const item = JSON.parse(data);
        item.lastAccessedAt = Date.now();
        item.accessCount++;
        this.set(key, item);
        return item;
      }
    } catch (error) {
      console.warn("Failed to get from session storage:", error);
    }
    return null;
  }
  set(key, item) {
    if (typeof sessionStorage === "undefined") return;
    try {
      const serializable = {
        ...item,
        component: null
        // 组件实例不能序列化
      };
      sessionStorage.setItem(this.prefix + key, JSON.stringify(serializable));
    } catch (error) {
      console.warn("Failed to set to session storage:", error);
    }
  }
  has(key) {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem(this.prefix + key) !== null;
  }
  delete(key) {
    if (typeof sessionStorage === "undefined") return false;
    try {
      sessionStorage.removeItem(this.prefix + key);
      return true;
    } catch {
      return false;
    }
  }
  clear() {
    if (typeof sessionStorage === "undefined") return;
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  }
  size() {
    if (typeof sessionStorage === "undefined") return 0;
    let count = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }
  keys() {
    if (typeof sessionStorage === "undefined") return [];
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
}
class LocalCacheStorage {
  constructor() {
    this.prefix = "ldesign-router-cache:";
  }
  get(key) {
    if (typeof localStorage === "undefined") return null;
    try {
      const data = localStorage.getItem(this.prefix + key);
      if (data) {
        const item = JSON.parse(data);
        if (item.ttl && Date.now() > item.createdAt + item.ttl) {
          this.delete(key);
          return null;
        }
        item.lastAccessedAt = Date.now();
        item.accessCount++;
        this.set(key, item);
        return item;
      }
    } catch (error) {
      console.warn("Failed to get from local storage:", error);
    }
    return null;
  }
  set(key, item) {
    if (typeof localStorage === "undefined") return;
    try {
      const serializable = {
        ...item,
        component: null
        // 组件实例不能序列化
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(serializable));
    } catch (error) {
      console.warn("Failed to set to local storage:", error);
    }
  }
  has(key) {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(this.prefix + key) !== null;
  }
  delete(key) {
    if (typeof localStorage === "undefined") return false;
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch {
      return false;
    }
  }
  clear() {
    if (typeof localStorage === "undefined") return;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
  size() {
    if (typeof localStorage === "undefined") return 0;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }
  keys() {
    if (typeof localStorage === "undefined") return [];
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
}
class CacheManager {
  constructor(config) {
    this.componentCache = /* @__PURE__ */ new Map();
    this.config = config;
    this.storage = this.createStorage(config.strategy);
  }
  /**
   * 创建存储实例
   */
  createStorage(strategy) {
    switch (strategy) {
      case "session":
        return new SessionCacheStorage();
      case "local":
        return new LocalCacheStorage();
      case "memory":
      default:
        return new MemoryCacheStorage();
    }
  }
  /**
   * 生成缓存键（优化：减少JSON序列化开销）
   */
  generateKey(route) {
    const paramsStr = Object.keys(route.params).length > 0 ? `-${JSON.stringify(route.params)}` : "";
    const queryStr = Object.keys(route.query).length > 0 ? `-${JSON.stringify(route.query)}` : "";
    return `${route.path}${paramsStr}${queryStr}`;
  }
  /**
   * 检查是否应该缓存
   */
  shouldCache(componentName) {
    if (this.config?.include) {
      const include = Array.isArray(this.config?.include) ? this.config?.include : [this.config?.include];
      return include.some((pattern) => {
        if (typeof pattern === "string") {
          return componentName === pattern;
        }
        return pattern.test(componentName);
      });
    }
    if (this.config?.exclude) {
      const exclude = Array.isArray(this.config?.exclude) ? this.config?.exclude : [this.config?.exclude];
      return !exclude.some((pattern) => {
        if (typeof pattern === "string") {
          return componentName === pattern;
        }
        return pattern.test(componentName);
      });
    }
    return true;
  }
  /**
   * 获取缓存项
   */
  get(route) {
    const key = this.generateKey(route);
    const memoryComponent = this.componentCache.get(key);
    if (memoryComponent) {
      return memoryComponent;
    }
    const item = this.storage.get(key);
    if (item && item.component) {
      this.componentCache.set(key, item.component);
      return item.component;
    }
    return null;
  }
  /**
   * 设置缓存项
   */
  set(route, component) {
    const componentName = component.name || "Anonymous";
    if (!this.shouldCache(componentName)) {
      return;
    }
    const key = this.generateKey(route);
    if (this.storage.size() >= this.config?.maxSize) {
      this.evict();
    }
    const item = {
      component,
      route,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 1,
      ttl: this.config?.ttl || 0
    };
    this.componentCache.set(key, component);
    this.storage.set(key, item);
  }
  /**
   * 检查是否存在缓存
   */
  has(route) {
    const key = this.generateKey(route);
    return this.componentCache.has(key) || this.storage.has(key);
  }
  /**
   * 删除缓存项
   */
  delete(route) {
    const key = this.generateKey(route);
    this.componentCache.delete(key);
    return this.storage.delete(key);
  }
  /**
   * 清空所有缓存
   */
  clear() {
    this.componentCache.clear();
    this.storage.clear();
  }
  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.storage.size(),
      memorySize: this.componentCache.size,
      maxSize: this.config?.maxSize,
      strategy: this.config?.strategy,
      keys: this.storage.keys()
    };
  }
  /**
   * 淘汰缓存项（LRU 策略）
   */
  evict() {
    const keys = this.storage.keys();
    if (keys.length === 0) return;
    let oldestKey = keys[0];
    let oldestTime = Date.now();
    for (const key of keys) {
      const item = this.storage.get(key);
      if (item && item.lastAccessedAt < oldestTime) {
        oldestTime = item.lastAccessedAt;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.storage.delete(oldestKey);
      this.componentCache.delete(oldestKey);
    }
  }
  /**
   * 清理过期缓存
   */
  cleanup() {
    const keys = this.storage.keys();
    for (const key of keys) {
      const item = this.storage.get(key);
      if (item && item.ttl && Date.now() > item.createdAt + item.ttl) {
        this.storage.delete(key);
        this.componentCache.delete(key);
      }
    }
  }
}
function createCachePlugin(options = {}) {
  const {
    enabled = true,
    strategy = "memory",
    maxSize = 5,
    // 优化：减少默认缓存大小
    ttl,
    include,
    exclude
  } = options;
  if (!enabled) {
    return {
      install() {
      },
      manager: null
    };
  }
  const config = {
    strategy,
    maxSize,
    ttl: ttl || 0
  };
  if (include !== void 0) {
    config.include = include;
  }
  if (exclude !== void 0) {
    config.exclude = exclude;
  }
  const manager = new CacheManager(config);
  return {
    install(app, router) {
      app.provide("cacheManager", manager);
      app.config.globalProperties.$cacheManager = manager;
      router.afterEach(() => {
        if (Math.random() < 0.1) {
          manager.cleanup?.();
        }
      });
    },
    manager
  };
}
function createCacheConfig(config) {
  return {
    strategy: "memory",
    maxSize: 5,
    // 优化：减少默认缓存大小
    ...config
  };
}
function supportsCaching() {
  return {
    memory: true,
    session: typeof sessionStorage !== "undefined",
    local: typeof localStorage !== "undefined"
  };
}
var cache = {
  createCachePlugin,
  CacheManager,
  createCacheConfig,
  supportsCaching
};

export { CacheManager, createCacheConfig, createCachePlugin, cache as default, supportsCaching };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=cache.js.map
