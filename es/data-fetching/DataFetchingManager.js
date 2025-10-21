/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class DataFetchingManager {
  constructor(options = {}) {
    this.router = null;
    this.cache = /* @__PURE__ */ new Map();
    this.fetchConfigs = /* @__PURE__ */ new Map();
    this.fetchStates = /* @__PURE__ */ new Map();
    this.pendingFetches = /* @__PURE__ */ new Map();
    this.prefetchQueue = /* @__PURE__ */ new Set();
    this.fetchHistory = /* @__PURE__ */ new Map();
    this.options = {
      globalCache: true,
      defaultCacheDuration: 5 * 60 * 1e3,
      // 5分钟
      enablePrefetch: true,
      prefetchDelay: 100,
      parallelFetch: true,
      maxParallel: 5,
      enableRetry: true,
      defaultRetryCount: 3,
      enableTimeout: true,
      defaultTimeout: 3e4,
      // 30秒
      enableErrorBoundary: true,
      ...options
    };
    this.startCacheCleaner();
  }
  /**
   * 初始化管理器
   */
  init(router) {
    this.router = router;
    router.beforeEach(async (to, from, next) => {
      await this.handleRouteChange(to, from, next);
    });
    router.afterEach((to, from) => {
      this.handleAfterRoute(to, from);
    });
  }
  /**
   * 注册数据获取配置
   */
  register(key, config) {
    this.fetchConfigs.set(key, {
      fetchOnClient: true,
      fetchOnServer: false,
      parallel: this.options.parallelFetch,
      retryCount: this.options.defaultRetryCount,
      retryDelay: 1e3,
      timeout: this.options.defaultTimeout,
      cacheDuration: this.options.defaultCacheDuration,
      ...config
    });
  }
  /**
   * 批量注册数据获取配置
   */
  registerBatch(configs) {
    Object.entries(configs).forEach(([key, config]) => {
      this.register(key, config);
    });
  }
  /**
   * 获取数据
   */
  async fetch(key, route, params) {
    const config = this.fetchConfigs.get(key);
    if (!config) {
      throw new Error(`Data fetch config not found: ${key}`);
    }
    const cacheKey = this.generateCacheKey(key, route, config);
    if (this.pendingFetches.has(cacheKey)) {
      return this.pendingFetches.get(cacheKey);
    }
    if (this.options.globalCache && config.cacheDuration) {
      const cached = this.getFromCache(cacheKey);
      if (cached !== null) {
        this.updateState(key, {
          loading: false,
          error: null,
          data: cached,
          timestamp: Date.now(),
          fromCache: true
        });
        return cached;
      }
    }
    this.updateState(key, {
      loading: true,
      error: null,
      data: null,
      timestamp: Date.now(),
      fromCache: false
    });
    const fetchPromise = this.performFetch(key, config, route, params, cacheKey);
    this.pendingFetches.set(cacheKey, fetchPromise);
    try {
      const data = await fetchPromise;
      return data;
    } finally {
      this.pendingFetches.delete(cacheKey);
    }
  }
  /**
   * 执行数据获取
   */
  async performFetch(key, config, route, params, cacheKey) {
    let lastError = null;
    const retryCount = config.retryCount || 0;
    for (let i = 0; i <= retryCount; i++) {
      try {
        const data = await this.fetchWithTimeout(config.fetcher(route, params), config.timeout || this.options.defaultTimeout);
        if (this.options.globalCache && config.cacheDuration) {
          this.setCache(cacheKey, data, config.cacheDuration);
        }
        this.updateState(key, {
          loading: false,
          error: null,
          data,
          timestamp: Date.now(),
          fromCache: false
        });
        if (config.onSuccess) {
          config.onSuccess(data, route);
        }
        this.recordFetchHistory(key);
        return data;
      } catch (error) {
        lastError = error;
        if (i < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, config.retryDelay || 1e3));
        }
      }
    }
    this.updateState(key, {
      loading: false,
      error: lastError,
      data: null,
      timestamp: Date.now(),
      fromCache: false
    });
    if (config.onError) {
      config.onError(lastError, route);
    } else if (this.options.globalErrorHandler) {
      this.options.globalErrorHandler(lastError, route);
    }
    throw lastError;
  }
  /**
   * 带超时的数据获取
   */
  async fetchWithTimeout(promise, timeout) {
    if (!this.options.enableTimeout) {
      return promise;
    }
    return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Fetch timeout")), timeout))]);
  }
  /**
   * 预获取数据
   */
  async prefetch(key, route, params) {
    if (!this.options.enablePrefetch) {
      return;
    }
    const config = this.fetchConfigs.get(key);
    if (!config) {
      return;
    }
    const cacheKey = this.generateCacheKey(key, route, config);
    if (this.prefetchQueue.has(cacheKey)) {
      return;
    }
    this.prefetchQueue.add(cacheKey);
    setTimeout(async () => {
      try {
        await this.fetch(key, route, params);
      } catch (error) {
        console.warn(`Prefetch failed for ${key}:`, error);
      } finally {
        this.prefetchQueue.delete(cacheKey);
      }
    }, this.options.prefetchDelay || 100);
  }
  /**
   * 批量预获取
   */
  async prefetchBatch(keys, route, params) {
    const promises = keys.map((key) => this.prefetch(key, route, params));
    await Promise.allSettled(promises);
  }
  /**
   * 处理路由变化
   */
  async handleRouteChange(to, from, next) {
    const routeFetchers = this.getRouteFetchers(to);
    if (routeFetchers.length === 0) {
      next();
      return;
    }
    try {
      const blockingFetchers = routeFetchers.filter((key) => {
        const config = this.fetchConfigs.get(key);
        return config && !config.parallel;
      });
      if (blockingFetchers.length > 0) {
        for (const key of blockingFetchers) {
          await this.fetch(key, to);
        }
      }
      const parallelFetchers = routeFetchers.filter((key) => {
        const config = this.fetchConfigs.get(key);
        return config && config.parallel;
      });
      if (parallelFetchers.length > 0) {
        const promises = parallelFetchers.map((key) => this.fetch(key, to));
        await Promise.allSettled(promises);
      }
      next();
    } catch (error) {
      if (this.options.enableErrorBoundary) {
        console.error("Route data fetch failed:", error);
        next(false);
      } else {
        next();
      }
    }
  }
  /**
   * 处理路由后置操作
   */
  handleAfterRoute(to, from) {
    this.cleanupRouteStates(from);
    this.prefetchNextRoutes(to);
  }
  /**
   * 获取路由相关的数据获取器
   */
  getRouteFetchers(route) {
    const fetchers = [];
    if (route.meta.fetchers) {
      fetchers.push(...route.meta.fetchers);
    }
    if (route.name) {
      this.fetchConfigs.forEach((config, key) => {
        if (key.startsWith(route.name)) {
          fetchers.push(key);
        }
      });
    }
    return [...new Set(fetchers)];
  }
  /**
   * 预获取可能的下一页数据
   */
  prefetchNextRoutes(route) {
    const predictions = this.predictNextRoutes(route);
    predictions.forEach((nextRoute) => {
      const fetchers = this.getRouteFetchers(nextRoute);
      fetchers.forEach((key) => {
        this.prefetch(key, nextRoute).catch(() => {
        });
      });
    });
  }
  /**
   * 预测下一个可能的路由
   */
  predictNextRoutes(currentRoute) {
    const predictions = [];
    return predictions;
  }
  /**
   * 清理路由状态
   */
  cleanupRouteStates(route) {
    const fetchers = this.getRouteFetchers(route);
    fetchers.forEach((key) => {
      this.fetchStates.delete(key);
    });
  }
  /**
   * 生成缓存键
   */
  generateCacheKey(key, route, config) {
    if (config.cacheKey) {
      return config.cacheKey(route);
    }
    const routeKey = `${route.path}_${JSON.stringify(route.params)}_${JSON.stringify(route.query)}`;
    return `${key}_${routeKey}`;
  }
  /**
   * 从缓存获取数据
   */
  getFromCache(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  /**
   * 设置缓存
   */
  setCache(key, data, duration) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });
  }
  /**
   * 更新状态
   */
  updateState(key, state) {
    this.fetchStates.set(key, state);
  }
  /**
   * 获取状态
   */
  getState(key) {
    return this.fetchStates.get(key);
  }
  /**
   * 获取所有状态
   */
  getAllStates() {
    return new Map(this.fetchStates);
  }
  /**
   * 清除缓存
   */
  clearCache(key) {
    if (key) {
      const cacheKeys = Array.from(this.cache.keys()).filter((k) => k.startsWith(key));
      cacheKeys.forEach((k) => this.cache.delete(k));
    } else {
      this.cache.clear();
    }
  }
  /**
   * 刷新数据
   */
  async refresh(key, route, params) {
    this.clearCache(key);
    return this.fetch(key, route, params);
  }
  /**
   * 记录获取历史
   */
  recordFetchHistory(key) {
    const history = this.fetchHistory.get(key) || [];
    history.push(Date.now());
    if (history.length > 100) {
      history.shift();
    }
    this.fetchHistory.set(key, history);
  }
  /**
   * 获取获取统计
   */
  getStatistics(key) {
    if (key) {
      const history = this.fetchHistory.get(key) || [];
      const state = this.fetchStates.get(key);
      return {
        key,
        totalFetches: history.length,
        lastFetch: history[history.length - 1] || null,
        averageInterval: this.calculateAverageInterval(history),
        currentState: state,
        cacheHitRate: this.calculateCacheHitRate(key)
      };
    }
    const stats = {};
    this.fetchConfigs.forEach((_, k) => {
      stats[k] = this.getStatistics(k);
    });
    return stats;
  }
  /**
   * 计算平均获取间隔
   */
  calculateAverageInterval(history) {
    if (history.length < 2) {
      return 0;
    }
    let totalInterval = 0;
    for (let i = 1; i < history.length; i++) {
      totalInterval += history[i] - history[i - 1];
    }
    return totalInterval / (history.length - 1);
  }
  /**
   * 计算缓存命中率
   */
  calculateCacheHitRate(key) {
    const state = this.fetchStates.get(key);
    if (!state) {
      return 0;
    }
    return state.fromCache ? 1 : 0;
  }
  /**
   * 启动缓存清理器
   */
  startCacheCleaner() {
    setInterval(() => {
      const now = Date.now();
      this.cache.forEach((entry, key) => {
        if (now > entry.expiry) {
          this.cache.delete(key);
        }
      });
    }, 6e4);
  }
  /**
   * 销毁管理器
   */
  destroy() {
    this.cache.clear();
    this.fetchConfigs.clear();
    this.fetchStates.clear();
    this.pendingFetches.clear();
    this.prefetchQueue.clear();
    this.fetchHistory.clear();
  }
}
const DATA_FETCHING_KEY = Symbol("DataFetching");
const DataFetchingPlugin = {
  install(app, options) {
    const manager = new DataFetchingManager(options);
    app.provide(DATA_FETCHING_KEY, manager);
    app.config.globalProperties.$dataFetching = manager;
  }
};
function createDataFetchingManager(options) {
  return new DataFetchingManager(options);
}

export { DATA_FETCHING_KEY, DataFetchingManager, DataFetchingPlugin, createDataFetchingManager };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=DataFetchingManager.js.map
