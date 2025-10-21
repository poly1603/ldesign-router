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
var logger = require('../../utils/logger.cjs');

class DataCache {
  constructor(options) {
    this.cache = /* @__PURE__ */ new Map();
    this.strategy = options?.strategy || "memory";
    this.ttl = options?.ttl || 5 * 60 * 1e3;
    this.maxSize = options?.maxSize;
    if (this.strategy !== "memory") {
      this.restore();
    }
  }
  set(key, data) {
    if (this.maxSize && this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const oldest = sorted[0];
      if (!oldest) return;
      const oldestKey = oldest[0];
      this.cache.delete(oldestKey);
    }
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    this.cache.set(key, cacheData);
    if (this.strategy !== "memory") {
      this.persist();
    }
  }
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      if (this.strategy !== "memory") {
        this.persist();
      }
      return null;
    }
    return cached.data;
  }
  clear() {
    this.cache.clear();
    if (this.strategy !== "memory") {
      this.persist();
    }
  }
  getStorage() {
    if (typeof window === "undefined") return null;
    return this.strategy === "session" ? sessionStorage : localStorage;
  }
  persist() {
    const storage = this.getStorage();
    if (!storage) return;
    const data = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      ...value
    }));
    try {
      storage.setItem("router-data-cache", JSON.stringify(data));
    } catch (e) {
      logger.logger.warn("Failed to persist data cache", e);
    }
  }
  restore() {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      const data = storage.getItem("router-data-cache");
      if (data) {
        const parsed = JSON.parse(data);
        parsed.forEach((item) => {
          this.cache.set(item.key, {
            data: item.data,
            timestamp: item.timestamp
          });
        });
      }
    } catch (e) {
      logger.logger.warn("Failed to restore data cache", e);
    }
  }
}
class DataFetchingManager {
  constructor(router, options = {}) {
    this.cache = null;
    this.loadingCount = 0;
    this.abortController = null;
    this.router = router;
    this.options = {
      parallel: true,
      ...options
    };
    if (options.cache?.enabled) {
      this.cache = new DataCache(options.cache);
    }
    this.currentState = {
      loading: vue.ref(false),
      error: vue.ref(null),
      data: vue.shallowRef({}),
      refresh: async () => {
        const route = this.router.currentRoute.value;
        await this.fetchData(route);
      }
    };
    this.setupNavigationGuards();
    if (options.prefetch?.enabled) {
      this.setupPrefetch();
    }
  }
  /**
   * 设置导航守卫
   */
  setupNavigationGuards() {
    const guard = async (to, _from, next) => {
      if (this.abortController) {
        this.abortController.abort();
      }
      try {
        await this.fetchData(to);
        next();
      } catch (error) {
        logger.logger.error("Data fetching failed", error);
        if (this.options.onError) {
          this.options.onError(error, to);
        }
        if (error.preventNavigation) {
          next(false);
        } else {
          next();
        }
      }
    };
    this.router.beforeResolve(guard);
  }
  /**
   * 设置预取
   */
  setupPrefetch() {
    const {
      routes,
      delay = 1e3
    } = this.options.prefetch;
    setTimeout(() => {
      if (routes && routes.length > 0) {
        routes.forEach((routeName) => {
          const route = this.router.resolve({
            name: routeName
          });
          this.prefetchData(route);
        });
      }
    }, delay);
  }
  /**
   * 获取数据
   */
  async fetchData(route) {
    const loaders = await this.getLoaders(route);
    if (!loaders || Object.keys(loaders).length === 0) {
      return;
    }
    this.abortController = new AbortController();
    const {
      signal
    } = this.abortController;
    this.updateLoadingState(true);
    this.currentState.error.value = null;
    try {
      const data = {};
      if (this.options.parallel) {
        const entries = Object.entries(loaders);
        const promises = entries.map(async ([key, loader]) => {
          const cacheKey = this.getCacheKey(route, key);
          const cached = this.cache?.get(cacheKey);
          if (cached !== null && cached !== void 0) {
            return {
              key,
              data: cached
            };
          }
          const result = await this.loadWithRetry(loader, route, signal);
          if (this.cache) {
            this.cache.set(cacheKey, result);
          }
          return {
            key,
            data: result
          };
        });
        const results = await Promise.all(promises);
        results.forEach(({
          key,
          data: value
        }) => {
          data[key] = value;
        });
      } else {
        for (const [key, loader] of Object.entries(loaders)) {
          if (signal.aborted) break;
          const cacheKey = this.getCacheKey(route, key);
          const cached = this.cache?.get(cacheKey);
          if (cached !== null && cached !== void 0) {
            data[key] = cached;
            continue;
          }
          const result = await this.loadWithRetry(loader, route, signal);
          data[key] = result;
          if (this.cache) {
            this.cache.set(cacheKey, result);
          }
        }
      }
      const transformedData = this.options.transform ? this.options.transform(data) : data;
      this.currentState.data.value = vue.markRaw(transformedData);
      route.meta._data = transformedData;
    } catch (error) {
      if (error.name !== "AbortError") {
        this.currentState.error.value = error;
        throw error;
      }
    } finally {
      this.updateLoadingState(false);
      this.abortController = null;
    }
  }
  /**
   * 预取数据
   */
  async prefetchData(route) {
    try {
      const loaders = await this.getLoaders(route);
      if (!loaders || Object.keys(loaders).length === 0) {
        return;
      }
      const promises = Object.entries(loaders).map(async ([key, loader]) => {
        const cacheKey = this.getCacheKey(route, key);
        if (this.cache?.get(cacheKey) !== null) {
          return;
        }
        try {
          const result = await loader(route);
          if (this.cache) {
            this.cache.set(cacheKey, result);
          }
        } catch (error) {
          logger.logger.warn(`Failed to prefetch data for key "${key}"`, error);
        }
      });
      await Promise.all(promises);
    } catch (error) {
      logger.logger.warn("Prefetch failed", error);
    }
  }
  /**
   * 获取数据加载器
   */
  async getLoaders(route) {
    const metaLoaders = route.meta.loaders;
    if (metaLoaders) {
      return metaLoaders;
    }
    if (this.options.loaders) {
      return this.options.loaders;
    }
    if (this.options.resolver) {
      return await this.options.resolver(route);
    }
    return null;
  }
  /**
   * 带重试的加载
   */
  async loadWithRetry(loader, route, signal) {
    const {
      retry,
      timeout
    } = this.options;
    const maxRetries = retry?.count || 0;
    const retryDelay = retry?.delay || 1e3;
    const backoff = retry?.backoff || "linear";
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (signal.aborted) {
        throw new Error("Aborted");
      }
      try {
        const timeoutPromise = timeout ? new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), timeout);
        }) : null;
        const loadPromise = loader(route);
        const result = timeoutPromise ? await Promise.race([loadPromise, timeoutPromise]) : await loadPromise;
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = backoff === "exponential" ? retryDelay * 2 ** attempt : retryDelay * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
  /**
   * 更新加载状态
   */
  updateLoadingState(loading) {
    if (loading) {
      this.loadingCount++;
    } else {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
    }
    const isLoading = this.loadingCount > 0;
    this.currentState.loading.value = isLoading;
    if (this.options.onLoadingChange) {
      this.options.onLoadingChange(isLoading);
    }
  }
  /**
   * 获取缓存键
   */
  getCacheKey(route, dataKey) {
    return `${route.path}:${dataKey}:${JSON.stringify(route.params)}:${JSON.stringify(route.query)}`;
  }
  // ==================== 公共 API ====================
  /**
   * 获取状态
   */
  getState() {
    return this.currentState;
  }
  /**
   * 清除缓存
   */
  clearCache() {
    this.cache?.clear();
  }
  /**
   * 刷新数据
   */
  async refresh() {
    await this.currentState.refresh();
  }
  /**
   * 获取路由数据
   */
  getData(route) {
    const targetRoute = route || this.router.currentRoute.value;
    return targetRoute.meta._data || this.currentState.data.value;
  }
}
let dataManager = null;
function setupDataFetching(router, options) {
  dataManager = new DataFetchingManager(router, options);
  return dataManager;
}
function useRouteData() {
  if (!dataManager) {
    throw new Error("Data fetching not initialized. Call setupDataFetching first.");
  }
  const state = dataManager.getState();
  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    refresh: state.refresh,
    clearCache: () => dataManager.clearCache(),
    getData: (route) => dataManager.getData(route)
  };
}
function defineLoader(loader) {
  return loader;
}
function defineAsyncComponent(componentLoader, dataLoaders) {
  return {
    component: componentLoader,
    meta: {
      loaders: dataLoaders
    }
  };
}
const DataFetchingPlugin = {
  install(app, options) {
    const manager = setupDataFetching(options.router, options.config);
    app.config.globalProperties.$routeData = manager;
    app.provide("routeData", manager);
  }
};

exports.DataFetchingManager = DataFetchingManager;
exports.DataFetchingPlugin = DataFetchingPlugin;
exports.defineAsyncComponent = defineAsyncComponent;
exports.defineLoader = defineLoader;
exports.setupDataFetching = setupDataFetching;
exports.useRouteData = useRouteData;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
