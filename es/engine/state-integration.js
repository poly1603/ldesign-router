/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class RouterStateManager {
  constructor(stateManager, router, config = {}) {
    this.unsubscribers = [];
    this.stateManager = stateManager;
    this.router = router;
    this.config = {
      enableHistory: true,
      maxHistoryLength: 50,
      persistent: false,
      persistentKey: "router-state",
      enableSync: true,
      ...config
    };
    this.initializeState();
    this.setupRouterListeners();
    this.setupStateSync();
  }
  /**
   * 初始化状态
   */
  initializeState() {
    const initialState = {
      currentRoute: this.router.currentRoute.value,
      history: [],
      forwardHistory: [],
      isNavigating: false,
      error: null,
      isLoading: false
    };
    this.stateManager.set("router", initialState);
    if (this.config?.persistent) {
      this.restorePersistedState();
    }
  }
  /**
   * 设置路由监听器
   */
  setupRouterListeners() {
    const unsubscribeRoute = this.router.afterEach((to, from) => {
      this.updateCurrentRoute(to);
      if (this.config?.enableHistory) {
        this.addToHistory(from);
      }
      this.setNavigating(false);
      this.clearError();
    });
    const unsubscribeBeforeEach = this.router.beforeEach((_to, _from, next) => {
      this.setNavigating(true);
      next();
    });
    const unsubscribeError = this.router.onError((error) => {
      this.setError(error);
      this.setNavigating(false);
    });
    this.unsubscribers.push(unsubscribeRoute, unsubscribeBeforeEach, unsubscribeError);
  }
  /**
   * 设置状态同步
   */
  setupStateSync() {
    if (!this.config?.enableSync) return;
    if (this.config?.persistent) {
      const unsubscribe = this.stateManager.subscribe("router", (newState) => {
        this.persistState(newState);
      });
      this.unsubscribers.push(unsubscribe);
    }
  }
  /**
   * 更新当前路由
   */
  updateCurrentRoute(route) {
    this.stateManager.set("router.currentRoute", route);
  }
  /**
   * 添加到历史记录
   */
  addToHistory(route) {
    const currentHistory = this.stateManager.get("router.history") || [];
    const newHistory = [route, ...currentHistory];
    const maxLength = this.config?.maxHistoryLength;
    if (maxLength && newHistory.length > maxLength) {
      newHistory.splice(maxLength);
    }
    this.stateManager.set("router.history", newHistory);
    this.stateManager.set("router.forwardHistory", []);
  }
  /**
   * 设置导航状态
   */
  setNavigating(isNavigating) {
    this.stateManager.set("router.isNavigating", isNavigating);
  }
  /**
   * 设置错误状态
   */
  setError(error) {
    this.stateManager.set("router.error", error);
  }
  /**
   * 清除错误状态
   */
  clearError() {
    this.setError(null);
  }
  /**
   * 设置加载状态
   */
  setLoading(isLoading) {
    this.stateManager.set("router.isLoading", isLoading);
  }
  /**
   * 持久化状态
   */
  persistState(state) {
    try {
      const persistentData = {
        currentRoute: state.currentRoute,
        history: state.history.slice(0, 10),
        // 只保存最近10条历史
        timestamp: Date.now()
      };
      const persistentKey = this.config?.persistentKey;
      if (persistentKey) {
        localStorage.setItem(persistentKey, JSON.stringify(persistentData));
      }
    } catch (error) {
      console.warn("Failed to persist router state:", error);
    }
  }
  /**
   * 恢复持久化状态
   */
  restorePersistedState() {
    try {
      const persistentKey = this.config?.persistentKey;
      if (!persistentKey) return;
      const persistentData = localStorage.getItem(persistentKey);
      if (!persistentData) return;
      const data = JSON.parse(persistentData);
      const now = Date.now();
      if (now - data.timestamp > 24 * 60 * 60 * 1e3) {
        if (persistentKey) {
          localStorage.removeItem(persistentKey);
        }
        return;
      }
      if (data.history && Array.isArray(data.history)) {
        this.stateManager.set("router.history", data.history);
      }
    } catch (error) {
      console.warn("Failed to restore router state:", error);
      const persistentKey = this.config?.persistentKey;
      if (persistentKey) {
        localStorage.removeItem(persistentKey);
      }
    }
  }
  /**
   * 获取路由状态
   */
  getState() {
    return this.stateManager.get("router") || {};
  }
  /**
   * 获取当前路由
   */
  getCurrentRoute() {
    return this.stateManager.get("router.currentRoute");
  }
  /**
   * 获取历史记录
   */
  getHistory() {
    return this.stateManager.get("router.history") || [];
  }
  /**
   * 获取前进历史
   */
  getForwardHistory() {
    return this.stateManager.get("router.forwardHistory") || [];
  }
  /**
   * 是否可以后退
   */
  canGoBack() {
    return this.getHistory().length > 0;
  }
  /**
   * 是否可以前进
   */
  canGoForward() {
    return this.getForwardHistory().length > 0;
  }
  /**
   * 后退
   */
  goBack() {
    const history = this.getHistory();
    if (history.length === 0) return;
    const previousRoute = history[0];
    const currentRoute = this.getCurrentRoute();
    if (!currentRoute || !previousRoute) {
      console.warn("No current route or previous route available for navigation");
      return;
    }
    this.stateManager.set("router.history", history.slice(1));
    const forwardHistory = this.getForwardHistory();
    this.stateManager.set("router.forwardHistory", [currentRoute, ...forwardHistory]);
    this.router.push(previousRoute);
  }
  /**
   * 前进
   */
  goForward() {
    const forwardHistory = this.getForwardHistory();
    if (forwardHistory.length === 0) return;
    const nextRoute = forwardHistory[0];
    const currentRoute = this.getCurrentRoute();
    if (!currentRoute || !nextRoute) {
      console.warn("No current route or next route available for navigation");
      return;
    }
    this.stateManager.set("router.forwardHistory", forwardHistory.slice(1));
    const history = this.getHistory();
    this.stateManager.set("router.history", [currentRoute, ...history]);
    this.router.push(nextRoute);
  }
  /**
   * 清除历史记录
   */
  clearHistory() {
    this.stateManager.set("router.history", []);
    this.stateManager.set("router.forwardHistory", []);
  }
  /**
   * 销毁状态管理器
   */
  destroy() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.stateManager.remove("router");
  }
}
function createRouterStateManager(stateManager, router, config) {
  return new RouterStateManager(stateManager, router, config);
}
var stateIntegration = {
  RouterStateManager,
  createRouterStateManager
};

export { RouterStateManager, createRouterStateManager, stateIntegration as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=state-integration.js.map
