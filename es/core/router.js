/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref } from 'vue';
import { RouterLink } from '../components/RouterLink.js';
import { RouterView } from '../components/RouterView.js';
import { UnifiedMemoryManager } from '../utils/unified-memory-manager.js';
import { START_LOCATION, ROUTER_INJECTION_SYMBOL, ROUTE_INJECTION_SYMBOL, NavigationFailureType } from './constants.js';
import { RouteMatcher } from './matcher.js';

class NavigationRedirectError extends Error {
  constructor(to) {
    super("Navigation redirected");
    this.to = to;
    this.name = "NavigationRedirectError";
  }
}
class RouterImpl {
  constructor(options) {
    this.beforeGuards = [];
    this.beforeResolveGuards = [];
    this.afterHooks = [];
    this.errorHandlers = [];
    this.guardCleanupFunctions = [];
    this.guardResultCache = /* @__PURE__ */ new Map();
    this.MAX_GUARD_CACHE_SIZE = 100;
    this.redirectCount = 0;
    this.MAX_REDIRECTS = 10;
    this.redirectStartTime = 0;
    this.REDIRECT_TIMEOUT = 5e3;
    this.options = options;
    this.matcher = new RouteMatcher();
    this.currentRoute = ref(START_LOCATION);
    this.memoryManager = new UnifiedMemoryManager({
      monitoring: {
        enabled: true,
        interval: 6e4,
        // 每分钟检查
        warningThreshold: 20 * 1024 * 1024,
        // 20MB
        criticalThreshold: 40 * 1024 * 1024
        // 40MB
      },
      tieredCache: {
        enabled: true,
        l1Capacity: 15,
        l2Capacity: 30,
        l3Capacity: 60,
        promotionThreshold: 2,
        demotionThreshold: 3e4
        // 30秒
      },
      cleanup: {
        strategy: "aggressive",
        autoCleanup: true,
        cleanupInterval: 12e4
        // 2分钟
      }
    });
    this.isReadyPromise = new Promise((resolve) => {
      this.isReadyResolve = resolve;
    });
    for (const route of options.routes) {
      this.addRoute(route);
    }
    this.setupHistoryListener();
    this.initializeCurrentRoute();
  }
  addRoute(parentNameOrRoute, route) {
    let normalizedRecord;
    if (typeof parentNameOrRoute === "object") {
      normalizedRecord = this.matcher.addRoute(parentNameOrRoute);
    } else {
      const parent = this.matcher.matchByName(parentNameOrRoute);
      if (!parent) {
        throw new Error(`Parent route "${String(parentNameOrRoute)}" not found`);
      }
      normalizedRecord = this.matcher.addRoute(route, parent);
    }
    return () => {
      if (normalizedRecord.name) {
        this.removeRoute(normalizedRecord.name);
      }
    };
  }
  removeRoute(name) {
    this.matcher.removeRoute(name);
  }
  getRoutes() {
    return this.matcher.getRoutes();
  }
  hasRoute(name) {
    return this.matcher.hasRoute(name);
  }
  resolve(to, currentLocation) {
    return this.matcher.resolve(to, currentLocation || this.currentRoute.value);
  }
  // ==================== 导航控制 ====================
  async push(to) {
    return this.pushWithRedirect(to, false);
  }
  async replace(to) {
    return this.pushWithRedirect(to, true);
  }
  go(delta) {
    this.options.history.go(delta);
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  // ==================== 导航守卫 ====================
  beforeEach(guard) {
    this.beforeGuards.push(guard);
    const cleanup = () => {
      const index = this.beforeGuards.indexOf(guard);
      if (index >= 0) {
        this.beforeGuards.splice(index, 1);
      }
    };
    this.guardCleanupFunctions.push(cleanup);
    return cleanup;
  }
  beforeResolve(guard) {
    this.beforeResolveGuards.push(guard);
    return () => {
      const index = this.beforeResolveGuards.indexOf(guard);
      if (index >= 0) {
        this.beforeResolveGuards.splice(index, 1);
      }
    };
  }
  afterEach(hook) {
    this.afterHooks.push(hook);
    return () => {
      const index = this.afterHooks.indexOf(hook);
      if (index >= 0) {
        this.afterHooks.splice(index, 1);
      }
    };
  }
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index >= 0) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }
  // ==================== 生命周期 ====================
  async isReady() {
    return this.isReadyPromise;
  }
  install(app) {
    app.provide(ROUTER_INJECTION_SYMBOL, this);
    app.provide(ROUTE_INJECTION_SYMBOL, this.currentRoute);
    app.config.globalProperties.$router = this;
    app.config.globalProperties.$route = this.currentRoute;
    app.component("RouterLink", RouterLink);
    app.component("RouterView", RouterView);
  }
  /**
   * 销毁路由器，清理所有资源
   */
  destroy() {
    this.memoryManager.destroy();
    this.guardCleanupFunctions.forEach((cleanup) => cleanup());
    this.guardCleanupFunctions = [];
    this.beforeGuards.length = 0;
    this.beforeResolveGuards.length = 0;
    this.afterHooks.length = 0;
    this.errorHandlers.length = 0;
    this.guardResultCache.clear();
    this.matcher.clearCache();
    this.options.history.destroy();
  }
  /**
   * 获取内存统计信息
   */
  getMemoryStats() {
    return {
      memory: this.memoryManager.getStats(),
      matcher: this.matcher.getStats(),
      guards: {
        beforeGuards: this.beforeGuards.length,
        beforeResolveGuards: this.beforeResolveGuards.length,
        afterHooks: this.afterHooks.length,
        errorHandlers: this.errorHandlers.length
      }
    };
  }
  async pushWithRedirect(to, replace) {
    const now = Date.now();
    if (now - this.redirectStartTime > this.REDIRECT_TIMEOUT) {
      this.redirectCount = 0;
      this.redirectStartTime = now;
    }
    if (this.redirectCount >= this.MAX_REDIRECTS) {
      const error = new Error(`Maximum redirect limit (${this.MAX_REDIRECTS}) exceeded`);
      this.handleError(error);
      return this.createNavigationFailure(NavigationFailureType.aborted, this.currentRoute.value, this.resolve(to));
    }
    const targetLocation = this.resolve(to);
    const from = this.currentRoute.value;
    if (this.isSameRouteLocation(targetLocation, from)) {
      this.redirectCount = 0;
      return this.createNavigationFailure(NavigationFailureType.duplicated, from, targetLocation);
    }
    try {
      const finalLocation = await this.runNavigationGuards(targetLocation, from);
      const historyLocation = this.routeLocationToHistoryLocation(finalLocation);
      if (replace) {
        this.options.history.replace(historyLocation, {
          ...finalLocation
        });
      } else {
        this.options.history.push(historyLocation, {
          ...finalLocation
        });
      }
      this.updateCurrentRoute(finalLocation, from);
      this.runAfterHooks(finalLocation, from);
    } catch (error) {
      if (error instanceof NavigationRedirectError) {
        this.redirectCount++;
        return this.pushWithRedirect(error.to, replace);
      }
      if (error instanceof Error) {
        this.handleError(error);
        this.redirectCount = 0;
        return this.createNavigationFailure(NavigationFailureType.aborted, from, targetLocation);
      }
      this.redirectCount = 0;
      throw error;
    }
    this.redirectCount = 0;
  }
  async runNavigationGuards(to, from) {
    let currentTo = to;
    const redirectResult = this.handleRouteRedirect(currentTo, 0);
    if (redirectResult.path !== currentTo.path) {
      throw new NavigationRedirectError(redirectResult);
    }
    currentTo = redirectResult;
    for (const guard of this.beforeGuards) {
      const result = await this.runGuard(guard, currentTo, from);
      if (result === false) {
        throw new Error("Navigation aborted by guard");
      } else if (result && (typeof result === "string" || typeof result === "object" && result !== null)) {
        currentTo = this.resolve(result);
      }
    }
    for (const record of currentTo.matched) {
      if (record.beforeEnter) {
        const result = await this.runGuard(record.beforeEnter, currentTo, from);
        if (result === false) {
          throw new Error("Navigation aborted by route guard");
        } else if (result && (typeof result === "string" || typeof result === "object" && result !== null)) {
          currentTo = this.resolve(result);
        }
      }
    }
    for (const guard of this.beforeResolveGuards) {
      const result = await this.runGuard(guard, currentTo, from);
      if (result === false) {
        throw new Error("Navigation aborted by resolve guard");
      } else if (result && (typeof result === "string" || typeof result === "object" && result !== null)) {
        currentTo = this.resolve(result);
      }
    }
    if (this.guardResultCache.size > 50) {
      const keysToDelete = Array.from(this.guardResultCache.keys()).slice(0, 25);
      keysToDelete.forEach((key) => this.guardResultCache.delete(key));
    }
    return currentTo;
  }
  /**
   * 处理路由记录的重定向配置
   */
  handleRouteRedirect(to, redirectCount = 0) {
    if (redirectCount > 10) {
      throw new Error(`Too many redirects when navigating to ${to.path}`);
    }
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched?.redirect) {
      const redirect = lastMatched.redirect;
      let redirectTarget;
      if (typeof redirect === "string") {
        redirectTarget = this.resolve(redirect);
      } else if (typeof redirect === "function") {
        const redirectResult = redirect(to);
        if (redirectResult) {
          redirectTarget = this.resolve(redirectResult);
        } else {
          return to;
        }
      } else if (typeof redirect === "object") {
        redirectTarget = this.resolve(redirect);
      } else {
        return to;
      }
      return this.handleRouteRedirect(redirectTarget, redirectCount + 1);
    }
    return to;
  }
  async runGuard(guard, to, from) {
    const guardKey = `${guard.name || guard.toString().slice(0, 50)}_${to.path}_${from.path}`;
    if (this.guardResultCache.has(guardKey)) {
      return this.guardResultCache.get(guardKey);
    }
    const result = await new Promise((resolve, reject) => {
      const next = (result2) => {
        if (result2 === false) {
          reject(new Error("Navigation cancelled"));
        } else if (result2 instanceof Error) {
          reject(result2);
        } else {
          resolve(result2);
        }
      };
      const guardResult = guard(to, from, next);
      if (guardResult && typeof guardResult === "object" && "then" in guardResult && typeof guardResult.then === "function") {
        guardResult.then(resolve, reject);
      }
    });
    if (this.guardResultCache.size >= this.MAX_GUARD_CACHE_SIZE) {
      const firstKey = this.guardResultCache.keys().next().value;
      if (firstKey !== void 0) {
        this.guardResultCache.delete(firstKey);
      }
    }
    this.guardResultCache.set(guardKey, result);
    return result;
  }
  runAfterHooks(to, from) {
    for (const hook of this.afterHooks) {
      try {
        hook(to, from);
      } catch (error) {
        this.handleError(error);
      }
    }
  }
  updateCurrentRoute(to, _from) {
    this.currentRoute.value = to;
    if (this.isReadyResolve) {
      this.isReadyResolve();
      this.isReadyResolve = void 0;
    }
  }
  setupHistoryListener() {
    this.options.history.listen((to, from, info) => {
      this.handleHistoryChange(to, from, info);
    });
  }
  async handleHistoryChange(to, _from, _info) {
    const targetLocation = this.historyLocationToRouteLocation(to);
    const fromLocation = this.currentRoute.value;
    try {
      const finalLocation = await this.runNavigationGuards(targetLocation, fromLocation);
      this.updateCurrentRoute(finalLocation, fromLocation);
      this.runAfterHooks(finalLocation, fromLocation);
    } catch (error) {
      this.handleError(error);
    }
  }
  initializeCurrentRoute() {
    const location = this.options.history.location;
    const routeLocation = this.historyLocationToRouteLocation(location);
    const redirectResult = this.handleRouteRedirect(routeLocation, 0);
    if (redirectResult.path !== routeLocation.path) {
      this.replace(redirectResult.path).then(() => {
        if (this.isReadyResolve) {
          this.isReadyResolve();
          this.isReadyResolve = void 0;
        }
      }).catch((error) => {
        this.handleError(error);
        if (this.isReadyResolve) {
          this.isReadyResolve();
          this.isReadyResolve = void 0;
        }
      });
    } else {
      this.currentRoute.value = routeLocation;
      if (this.isReadyResolve) {
        this.isReadyResolve();
        this.isReadyResolve = void 0;
      }
    }
  }
  routeLocationToHistoryLocation(location) {
    return {
      pathname: location.path,
      search: this.stringifyQuery(location.query),
      hash: location.hash
    };
  }
  historyLocationToRouteLocation(location) {
    const path = location.pathname;
    const query = this.parseQuery(location.search);
    const hash = location.hash;
    try {
      return this.matcher.resolve({
        path,
        query,
        hash
      });
    } catch {
      return {
        ...START_LOCATION,
        path,
        query,
        hash,
        fullPath: path + location.search + location.hash
      };
    }
  }
  parseQuery(search) {
    if (this.options.parseQuery) {
      return this.options.parseQuery(search.slice(1));
    }
    const query = {};
    const params = new URLSearchParams(search);
    for (const [key, value] of params) {
      query[key] = value;
    }
    return query;
  }
  stringifyQuery(query) {
    if (this.options.stringifyQuery) {
      const result2 = this.options.stringifyQuery(query);
      return result2 ? `?${result2}` : "";
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== void 0) {
        params.append(key, String(value));
      }
    }
    const result = params.toString();
    return result ? `?${result}` : "";
  }
  isSameRouteLocation(a, b) {
    return a.path === b.path && JSON.stringify(a.query) === JSON.stringify(b.query) && a.hash === b.hash;
  }
  createNavigationFailure(type, from, to) {
    const error = new Error(`Navigation failed`);
    error.type = type;
    error.from = from;
    error.to = to;
    return error;
  }
  handleError(error) {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error("Error in error handler:", handlerError);
      }
    }
    if (this.errorHandlers.length === 0) {
      console.error("Unhandled router error:", error);
    }
  }
}
function createRouter(options) {
  return new RouterImpl(options);
}

export { RouterImpl, createRouter };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=router.js.map
