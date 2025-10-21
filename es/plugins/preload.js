/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class PreloadManager {
  constructor(config, retryConfig) {
    this.preloadQueue = /* @__PURE__ */ new Map();
    this.componentCache = /* @__PURE__ */ new Map();
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0,
      retried: 0,
      averageTime: 0,
      errorRate: 0
    };
    this.maxCacheSize = 50;
    this.cacheTimeout = 30 * 60 * 1e3;
    this.config = config;
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1e3,
      backoffMultiplier: 2,
      retryCondition: (error) => {
        return error.name === "NetworkError" || error.message.includes("timeout") || error.message.includes("fetch");
      },
      ...retryConfig
    };
    this.setupCacheCleanup();
  }
  /**
   * 生成预加载键
   */
  generateKey(route) {
    return `${route.path}-${JSON.stringify(route.params)}`;
  }
  /**
   * 设置缓存清理
   */
  setupCacheCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1e3);
  }
  /**
   * 清理过期缓存
   */
  cleanupExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];
    for (const [key, item] of this.componentCache.entries()) {
      if (now - item.timestamp > this.cacheTimeout) {
        expiredKeys.push(key);
      }
    }
    expiredKeys.forEach((key) => this.componentCache.delete(key));
    if (this.componentCache.size > this.maxCacheSize) {
      const sortedEntries = Array.from(this.componentCache.entries()).sort((a, b) => a[1].accessCount - b[1].accessCount);
      const toDelete = sortedEntries.slice(0, this.componentCache.size - this.maxCacheSize);
      toDelete.forEach(([key]) => this.componentCache.delete(key));
    }
  }
  /**
   * 预加载路由组件（增强版）
   */
  async preload(route, strategy = this.config?.strategy, priority = 0) {
    const key = this.generateKey(route);
    const cached = this.componentCache.get(key);
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      this.stats.cached++;
      return;
    }
    if (this.preloadQueue.has(key)) {
      return;
    }
    const startTime = Date.now();
    this.stats.total++;
    const preloadItem = {
      route,
      component: this.loadRouteComponentsWithRetry(route),
      startTime,
      strategy,
      priority,
      retryCount: 0,
      maxRetries: this.retryConfig.maxRetries
    };
    this.preloadQueue.set(key, preloadItem);
    try {
      const components = await preloadItem.component;
      const size = this.estimateComponentSize(components);
      this.componentCache.set(key, {
        component: components,
        timestamp: Date.now(),
        accessCount: 1,
        size
      });
      this.preloadQueue.delete(key);
      this.stats.success++;
      this.updateAverageTime(Date.now() - startTime);
      this.updateErrorRate();
    } catch (error) {
      this.preloadQueue.delete(key);
      this.stats.failed++;
      this.updateErrorRate();
      console.warn(`\u9884\u52A0\u8F7D\u5931\u8D25: ${route.path}`, error);
      if (this.retryConfig.retryCondition?.(error)) {
        this.stats.retried++;
      }
    }
  }
  /**
   * 批量预加载
   */
  async preloadBatch(routes, strategy) {
    const promises = routes.map((route) => this.preload(route, strategy));
    await Promise.allSettled(promises);
  }
  /**
   * 预加载相关路由
   */
  async preloadRelated(currentRoute) {
    const relatedRoutes = this.findRelatedRoutes(currentRoute);
    await this.preloadBatch(relatedRoutes, "idle");
  }
  /**
   * 带重试的组件加载
   */
  async loadRouteComponentsWithRetry(route, retryCount = 0) {
    try {
      return await this.loadRouteComponents(route);
    } catch (error) {
      if (retryCount < this.retryConfig.maxRetries && this.retryConfig.retryCondition?.(error)) {
        const delay = this.retryConfig.retryDelay * this.retryConfig.backoffMultiplier ** retryCount;
        console.warn(`\u9884\u52A0\u8F7D\u5931\u8D25\uFF0C${delay}ms\u540E\u91CD\u8BD5 (${retryCount + 1}/${this.retryConfig.maxRetries}):`, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.loadRouteComponentsWithRetry(route, retryCount + 1);
      }
      throw error;
    }
  }
  /**
   * 估算组件大小
   */
  estimateComponentSize(components) {
    try {
      return JSON.stringify(components).length;
    } catch {
      return 1024;
    }
  }
  /**
   * 更新错误率
   */
  updateErrorRate() {
    this.stats.errorRate = this.stats.total > 0 ? this.stats.failed / this.stats.total : 0;
  }
  /**
   * 获取预加载的组件
   */
  getPreloaded(route) {
    const key = this.generateKey(route);
    const cached = this.componentCache.get(key);
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.component;
    }
    return null;
  }
  /**
   * 检查是否已预加载
   */
  isPreloaded(route) {
    const key = this.generateKey(route);
    return this.componentCache.has(key);
  }
  /**
   * 清理预加载缓存
   */
  clear() {
    this.preloadQueue.clear();
    this.componentCache.clear();
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0,
      retried: 0,
      averageTime: 0,
      errorRate: 0
    };
  }
  /**
   * 获取缓存信息
   */
  getCacheInfo() {
    const now = Date.now();
    const items = Array.from(this.componentCache.entries()).map(([key, item]) => ({
      key,
      size: item.size,
      accessCount: item.accessCount,
      age: now - item.timestamp
    }));
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    return {
      size: this.componentCache.size,
      maxSize: this.maxCacheSize,
      totalSize,
      items
    };
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats
    };
  }
  /**
   * 加载路由组件
   */
  async loadRouteComponents(route) {
    const components = {};
    for (const record of route.matched) {
      if (record.components) {
        for (const [name, component] of Object.entries(record.components)) {
          if (typeof component === "function") {
            components[name] = typeof component === "function" && "then" in component ? await component() : component;
          } else {
            components[name] = component;
          }
        }
      }
    }
    return components;
  }
  /**
   * 查找相关路由
   */
  findRelatedRoutes(_currentRoute) {
    return [];
  }
  /**
   * 更新平均时间
   */
  updateAverageTime(time) {
    const total = this.stats.success + this.stats.failed;
    this.stats.averageTime = (this.stats.averageTime * (total - 1) + time) / total;
  }
}
class HoverPreloadStrategy {
  constructor(manager) {
    this.timers = /* @__PURE__ */ new Map();
    this.manager = manager;
  }
  /**
   * 处理鼠标悬停
   */
  onMouseEnter(route, delay = 200) {
    const key = this.manager.generateKey(route);
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = window.setTimeout(() => {
      this.manager.preload(route, "hover", 1);
      this.timers.delete(key);
    }, delay);
    this.timers.set(key, timer);
  }
  /**
   * 处理鼠标离开
   */
  onMouseLeave(route) {
    const key = this.manager.generateKey(route);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
  /**
   * 清理所有定时器
   */
  cleanup() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
class VisibilityPreloadStrategy {
  constructor(manager) {
    this.observedElements = /* @__PURE__ */ new Map();
    this.manager = manager;
    this.setupObserver();
  }
  /**
   * 设置交叉观察器
   */
  setupObserver() {
    if (typeof IntersectionObserver === "undefined") return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const route = this.observedElements.get(entry.target);
          if (route) {
            this.manager.preload(route, "visible", 2);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "50px"
    });
  }
  /**
   * 观察元素
   */
  observe(element, route) {
    if (!this.observer) return;
    this.observer.observe(element);
    this.observedElements.set(element, route);
  }
  /**
   * 停止观察元素
   */
  unobserve(element) {
    if (!this.observer) return;
    this.observer.unobserve(element);
    this.observedElements.delete(element);
  }
  /**
   * 清理观察器
   */
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observedElements.clear();
    }
  }
}
class IdlePreloadStrategy {
  constructor(manager) {
    this.pendingRoutes = [];
    this.manager = manager;
    this.scheduleIdlePreload();
  }
  /**
   * 添加到空闲预加载队列
   */
  addToQueue(route) {
    if (!this.pendingRoutes.some((r) => r.path === route.path)) {
      this.pendingRoutes.push(route);
    }
  }
  /**
   * 调度空闲预加载
   */
  scheduleIdlePreload() {
    const processQueue = () => {
      if (this.pendingRoutes.length === 0) return;
      const route = this.pendingRoutes.shift();
      this.manager.preload(route, "idle", 3);
      if (this.pendingRoutes.length > 0) {
        this.scheduleNext();
      }
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(processQueue, {
        timeout: 5e3
      });
    } else {
      setTimeout(processQueue, 1e3);
    }
  }
  /**
   * 调度下一个预加载
   */
  scheduleNext() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => this.scheduleIdlePreload(), {
        timeout: 5e3
      });
    } else {
      setTimeout(() => this.scheduleIdlePreload(), 1e3);
    }
  }
  /**
   * 清理队列
   */
  cleanup() {
    this.pendingRoutes = [];
  }
}
function createPreloadPlugin(options = {}) {
  const {
    enabled = true,
    strategy = "hover",
    delay = 200,
    onVisible = true,
    visibilityThreshold = 0.1,
    onIdle = true,
    idleTimeout = 5e3,
    autoPreloadRelated = false
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
    delay,
    onVisible,
    visibilityThreshold,
    onIdle,
    idleTimeout
  };
  const manager = new PreloadManager(config);
  const hoverStrategy = new HoverPreloadStrategy(manager);
  const visibilityStrategy = new VisibilityPreloadStrategy(manager);
  const idleStrategy = new IdlePreloadStrategy(manager);
  return {
    install(app, router) {
      app.provide("preloadManager", manager);
      app.config.globalProperties.$preloadManager = manager;
      if (autoPreloadRelated) {
        router.afterEach((to) => {
          manager.preloadRelated(to);
        });
      }
    },
    manager,
    strategies: {
      hover: hoverStrategy,
      visibility: visibilityStrategy,
      idle: idleStrategy
    }
  };
}
function createPreloadConfig(config) {
  return {
    strategy: "hover",
    delay: 200,
    onVisible: true,
    visibilityThreshold: 0.1,
    onIdle: true,
    idleTimeout: 5e3,
    ...config
  };
}
function supportsPreload() {
  return {
    intersectionObserver: typeof IntersectionObserver !== "undefined",
    requestIdleCallback: typeof requestIdleCallback !== "undefined"
  };
}
var preload = {
  createPreloadPlugin,
  PreloadManager,
  HoverPreloadStrategy,
  VisibilityPreloadStrategy,
  IdlePreloadStrategy,
  createPreloadConfig,
  supportsPreload
};

export { HoverPreloadStrategy, IdlePreloadStrategy, PreloadManager, VisibilityPreloadStrategy, createPreloadConfig, createPreloadPlugin, preload as default, supportsPreload };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=preload.js.map
