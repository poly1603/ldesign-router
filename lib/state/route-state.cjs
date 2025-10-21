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

class RouteStateManager {
  constructor(router) {
    this.maxHistorySize = 50;
    this.subscribers = [];
    this.router = router;
    this.state = vue.reactive({
      current: router.currentRoute.value,
      previous: void 0,
      history: [],
      isNavigating: false,
      error: void 0,
      isLoading: false,
      cache: /* @__PURE__ */ new Map()
    });
    this.setupWatchers();
  }
  /**
   * 设置监听器
   */
  setupWatchers() {
    vue.watch(() => this.router.currentRoute.value, (to, from) => {
      this.updateState(to, from);
    }, {
      immediate: true
    });
    this.router.beforeEach((_to, _from, next) => {
      this.state.isNavigating = true;
      this.state.isLoading = true;
      this.state.error = void 0;
      next();
    });
    this.router.afterEach((_to, _from) => {
      this.state.isNavigating = false;
      this.state.isLoading = false;
    });
    this.router.onError((error) => {
      this.state.error = error;
      this.state.isNavigating = false;
      this.state.isLoading = false;
    });
  }
  /**
   * 更新状态
   */
  updateState(to, from) {
    const previousRoute = this.state.current;
    this.state.current = to;
    this.state.previous = previousRoute;
    if (from) {
      this.addToHistory(to, this.getNavigationSource());
    }
    this.notifySubscribers();
  }
  /**
   * 获取导航来源
   */
  getNavigationSource() {
    return "push";
  }
  /**
   * 添加到历史记录
   */
  addToHistory(route, source) {
    const historyItem = {
      route,
      timestamp: Date.now(),
      source
    };
    this.state.history.push(historyItem);
    if (this.state.history.length > this.maxHistorySize) {
      this.state.history.shift();
    }
  }
  /**
   * 获取当前状态
   */
  getState() {
    return this.state;
  }
  /**
   * 获取当前路由
   */
  getCurrentRoute() {
    return this.state.current;
  }
  /**
   * 获取上一个路由
   */
  getPreviousRoute() {
    return this.state.previous;
  }
  /**
   * 获取导航历史
   */
  getHistory() {
    return [...this.state.history];
  }
  /**
   * 获取最近访问的路由
   */
  getRecentRoutes(limit = 10) {
    return this.state.history.slice(-limit).reverse();
  }
  /**
   * 获取访问频率最高的路由
   */
  getMostVisitedRoutes(limit = 10) {
    const pathCounts = /* @__PURE__ */ new Map();
    for (const item of this.state.history) {
      const path = item.route.path;
      const existing = pathCounts.get(path);
      if (existing) {
        existing.count++;
        existing.lastVisit = Math.max(existing.lastVisit, item.timestamp);
      } else {
        pathCounts.set(path, {
          count: 1,
          lastVisit: item.timestamp
        });
      }
    }
    return Array.from(pathCounts.entries()).map(([path, data]) => ({
      path,
      ...data
    })).sort((a, b) => b.count - a.count).slice(0, limit);
  }
  /**
   * 检查是否可以后退
   */
  canGoBack() {
    return this.state.history.length > 1;
  }
  /**
   * 检查路由是否在历史中
   */
  isInHistory(path) {
    return this.state.history.some((item) => item.route.path === path);
  }
  /**
   * 清空历史记录
   */
  clearHistory() {
    this.state.history = [];
  }
  /**
   * 设置路由缓存
   */
  setCache(key, data) {
    this.state.cache.set(key, data);
  }
  /**
   * 获取路由缓存
   */
  getCache(key) {
    return this.state.cache.get(key);
  }
  /**
   * 清空缓存
   */
  clearCache() {
    this.state.cache.clear();
  }
  /**
   * 订阅状态变化
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  /**
   * 通知订阅者
   */
  notifySubscribers() {
    for (const callback of this.subscribers) {
      try {
        callback(this.state);
      } catch (error) {
        console.error("\u8DEF\u7531\u72B6\u6001\u8BA2\u9605\u8005\u56DE\u8C03\u6267\u884C\u5931\u8D25:", error);
      }
    }
  }
  /**
   * 获取状态统计信息
   */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1e3;
    const oneDayAgo = now - 24 * 60 * 60 * 1e3;
    const recentHistory = this.state.history.filter((item) => item.timestamp > oneHourAgo);
    const dailyHistory = this.state.history.filter((item) => item.timestamp > oneDayAgo);
    return {
      totalNavigations: this.state.history.length,
      recentNavigations: recentHistory.length,
      dailyNavigations: dailyHistory.length,
      uniqueRoutes: new Set(this.state.history.map((item) => item.route.path)).size,
      averageNavigationsPerHour: recentHistory.length,
      cacheSize: this.state.cache.size,
      isNavigating: this.state.isNavigating,
      hasError: !!this.state.error
    };
  }
  /**
   * 导出状态数据
   */
  exportState() {
    return {
      current: this.state.current,
      previous: this.state.previous,
      history: this.getHistory(),
      stats: this.getStats()
    };
  }
  /**
   * 重置状态
   */
  reset() {
    this.state.previous = void 0;
    this.state.history = [];
    this.state.isNavigating = false;
    this.state.error = void 0;
    this.state.isLoading = false;
    this.state.cache.clear();
  }
}
function createRouteStateManager(router) {
  return new RouteStateManager(router);
}
function useRouteState(stateManager) {
  const state = stateManager.getState();
  return {
    // 响应式状态
    current: vue.computed(() => state.current),
    previous: vue.computed(() => state.previous),
    isNavigating: vue.computed(() => state.isNavigating),
    isLoading: vue.computed(() => state.isLoading),
    error: vue.computed(() => state.error),
    // 历史记录
    history: vue.computed(() => state.history),
    recentRoutes: vue.computed(() => stateManager.getRecentRoutes()),
    mostVisitedRoutes: vue.computed(() => stateManager.getMostVisitedRoutes()),
    // 工具方法
    canGoBack: vue.computed(() => stateManager.canGoBack()),
    stats: vue.computed(() => stateManager.getStats()),
    // 方法
    clearHistory: () => stateManager.clearHistory(),
    clearCache: () => stateManager.clearCache(),
    isInHistory: (path) => stateManager.isInHistory(path),
    setCache: (key, data) => stateManager.setCache(key, data),
    getCache: (key) => stateManager.getCache(key),
    subscribe: (callback) => stateManager.subscribe(callback)
  };
}

exports.RouteStateManager = RouteStateManager;
exports.createRouteStateManager = createRouteStateManager;
exports.useRouteState = useRouteState;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=route-state.cjs.map
