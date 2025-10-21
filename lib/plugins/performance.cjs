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

Object.defineProperty(exports, '__esModule', { value: true });

exports.PerformanceEventType = void 0;
(function(PerformanceEventType2) {
  PerformanceEventType2["NAVIGATION_START"] = "navigation-start";
  PerformanceEventType2["NAVIGATION_END"] = "navigation-end";
  PerformanceEventType2["COMPONENT_LOAD_START"] = "component-load-start";
  PerformanceEventType2["COMPONENT_LOAD_END"] = "component-load-end";
  PerformanceEventType2["ROUTE_MATCH_START"] = "route-match-start";
  PerformanceEventType2["ROUTE_MATCH_END"] = "route-match-end";
  PerformanceEventType2["GUARD_EXECUTION_START"] = "guard-execution-start";
  PerformanceEventType2["GUARD_EXECUTION_END"] = "guard-execution-end";
})(exports.PerformanceEventType || (exports.PerformanceEventType = {}));
class PerformanceManager {
  constructor(config) {
    this.navigations = /* @__PURE__ */ new Map();
    this.eventListeners = /* @__PURE__ */ new Map();
    this.config = config;
  }
  /**
   * 开始导航监控
   */
  startNavigation(from, to) {
    const id = this.generateNavigationId(from, to);
    const startTime = performance.now();
    const navigation = {
      id,
      from,
      to,
      startTime,
      events: []
    };
    this.navigations.set(id, navigation);
    this.currentNavigation = navigation;
    this.emitEvent({
      type: exports.PerformanceEventType.NAVIGATION_START,
      timestamp: startTime,
      route: to
    });
    return id;
  }
  /**
   * 结束导航监控
   */
  endNavigation(id) {
    const navigation = this.navigations.get(id);
    if (!navigation) return null;
    const endTime = performance.now();
    navigation.endTime = endTime;
    const metrics = this.calculateMetrics(navigation);
    navigation.metrics = metrics;
    this.emitEvent({
      type: exports.PerformanceEventType.NAVIGATION_END,
      timestamp: endTime,
      route: navigation.to,
      data: metrics
    });
    this.checkThresholds(metrics);
    if (this.config?.onMetrics) {
      this.config?.onMetrics(metrics);
    }
    if (this.currentNavigation?.id === id) {
      this.currentNavigation = void 0;
    }
    return metrics;
  }
  /**
   * 记录事件
   */
  recordEvent(type, data) {
    if (!this.config?.enabled) return;
    const event = {
      type,
      timestamp: performance.now(),
      data
    };
    if (this.currentNavigation?.to) {
      event.route = this.currentNavigation.to;
    }
    if (this.currentNavigation) {
      this.currentNavigation.events.push(event);
    }
    this.emitEvent(event);
  }
  /**
   * 添加事件监听器
   */
  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    const listeners = this.eventListeners.get(type);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }
  /**
   * 获取导航历史
   */
  getNavigationHistory() {
    return Array.from(this.navigations.values());
  }
  /**
   * 获取性能统计
   */
  getStats() {
    const navigations = Array.from(this.navigations.values());
    const completedNavigations = navigations.filter((n) => n.metrics);
    if (completedNavigations.length === 0) {
      return {
        totalNavigations: 0,
        averageTime: 0,
        slowNavigations: 0,
        fastNavigations: 0
      };
    }
    const totalTime = completedNavigations.reduce((sum, n) => sum + n.metrics.totalTime, 0);
    const averageTime = totalTime / completedNavigations.length;
    const slowNavigations = completedNavigations.filter((n) => n.metrics.totalTime > this.config?.warningThreshold).length;
    const fastNavigations = completedNavigations.filter((n) => n.metrics.totalTime < this.config?.warningThreshold / 2).length;
    return {
      totalNavigations: completedNavigations.length,
      averageTime,
      slowNavigations,
      fastNavigations
    };
  }
  /**
   * 清理历史数据
   */
  clear() {
    this.navigations.clear();
    this.currentNavigation = void 0;
  }
  /**
   * 生成导航ID
   */
  generateNavigationId(from, to) {
    return `${from.path}->${to.path}-${Date.now()}`;
  }
  /**
   * 计算性能指标
   */
  calculateMetrics(navigation) {
    const events = navigation.events;
    const startTime = navigation.startTime;
    const endTime = navigation.endTime || performance.now();
    const componentLoadStart = events.find((e) => e.type === exports.PerformanceEventType.COMPONENT_LOAD_START);
    const componentLoadEnd = events.find((e) => e.type === exports.PerformanceEventType.COMPONENT_LOAD_END);
    const routeMatchStart = events.find((e) => e.type === exports.PerformanceEventType.ROUTE_MATCH_START);
    const routeMatchEnd = events.find((e) => e.type === exports.PerformanceEventType.ROUTE_MATCH_END);
    const guardStart = events.find((e) => e.type === exports.PerformanceEventType.GUARD_EXECUTION_START);
    const guardEnd = events.find((e) => e.type === exports.PerformanceEventType.GUARD_EXECUTION_END);
    return {
      navigationStart: startTime,
      navigationEnd: endTime,
      componentLoadStart: componentLoadStart?.timestamp || startTime,
      componentLoadEnd: componentLoadEnd?.timestamp || endTime,
      routeMatchTime: routeMatchEnd && routeMatchStart ? routeMatchEnd.timestamp - routeMatchStart.timestamp : 0,
      guardExecutionTime: guardEnd && guardStart ? guardEnd.timestamp - guardStart.timestamp : 0,
      totalTime: endTime - startTime
    };
  }
  /**
   * 检查性能阈值
   */
  checkThresholds(metrics) {
    if (metrics.totalTime > this.config?.errorThreshold) {
      console.error(`\u8DEF\u7531\u5BFC\u822A\u6027\u80FD\u4E25\u91CD\u8D85\u6807: ${metrics.totalTime.toFixed(2)}ms (\u9608\u503C: ${this.config?.errorThreshold}ms)`);
    } else if (metrics.totalTime > this.config?.warningThreshold) {
      console.warn(`\u8DEF\u7531\u5BFC\u822A\u6027\u80FD\u8D85\u6807: ${metrics.totalTime.toFixed(2)}ms (\u9608\u503C: ${this.config?.warningThreshold}ms)`);
    }
  }
  /**
   * 发射事件
   */
  emitEvent(event) {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("\u6027\u80FD\u76D1\u63A7\u4E8B\u4EF6\u76D1\u542C\u5668\u9519\u8BEF:", error);
        }
      });
    }
  }
}
function withPerformanceMonitoring(fn, name, manager) {
  return (...args) => {
    const startTime = performance.now();
    try {
      const result = fn(...args);
      if (result && typeof result.then === "function") {
        return result.finally(() => {
          const endTime2 = performance.now();
          manager.recordEvent(exports.PerformanceEventType.COMPONENT_LOAD_END, {
            name,
            duration: endTime2 - startTime
          });
        });
      }
      const endTime = performance.now();
      manager.recordEvent(exports.PerformanceEventType.COMPONENT_LOAD_END, {
        name,
        duration: endTime - startTime
      });
      return result;
    } catch (error) {
      const endTime = performance.now();
      manager.recordEvent(exports.PerformanceEventType.COMPONENT_LOAD_END, {
        name,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };
}
function createPerformancePlugin(options = {}) {
  const {
    enabled = true,
    warningThreshold = 1e3,
    errorThreshold = 3e3,
    sampleRate = 1,
    autoMonitor = true,
    consoleOutput = true,
    onMetrics
  } = options;
  if (!enabled) {
    return {
      install() {
      },
      manager: null
    };
  }
  const config = {
    enabled,
    warningThreshold,
    errorThreshold,
    sampleRate,
    onMetrics: onMetrics || (() => {
    })
  };
  const manager = new PerformanceManager(config);
  return {
    install(app, router) {
      app.provide("performanceManager", manager);
      app.config.globalProperties.$performanceManager = manager;
      if (autoMonitor) {
        router.beforeEach((to, from, next) => {
          if (Math.random() > sampleRate) {
            next();
            return;
          }
          const navigationId = manager.startNavigation(from, to);
          manager.recordEvent(exports.PerformanceEventType.ROUTE_MATCH_START);
          manager.recordEvent(exports.PerformanceEventType.GUARD_EXECUTION_START);
          to.meta._navigationId = navigationId;
          next();
        });
        router.afterEach((to, from) => {
          const navigationId = to.meta._navigationId;
          if (navigationId) {
            manager.recordEvent(exports.PerformanceEventType.GUARD_EXECUTION_END);
            manager.recordEvent(exports.PerformanceEventType.ROUTE_MATCH_END);
            setTimeout(() => {
              const metrics = manager.endNavigation(navigationId);
              if (consoleOutput && metrics) {
                console.warn(`\u8DEF\u7531\u5BFC\u822A\u6027\u80FD: ${from.path} -> ${to.path}`, {
                  \u603B\u8017\u65F6: `${metrics.totalTime.toFixed(2)}ms`,
                  \u8DEF\u7531\u5339\u914D: `${metrics.routeMatchTime.toFixed(2)}ms`,
                  \u5B88\u536B\u6267\u884C: `${metrics.guardExecutionTime.toFixed(2)}ms`,
                  \u7EC4\u4EF6\u52A0\u8F7D: `${(metrics.componentLoadEnd - metrics.componentLoadStart).toFixed(2)}ms`
                });
              }
            }, 0);
          }
        });
      }
    },
    manager
  };
}
function createPerformanceConfig(config) {
  return {
    enabled: true,
    warningThreshold: 1e3,
    errorThreshold: 3e3,
    sampleRate: 1,
    ...config
  };
}
function supportsPerformanceAPI() {
  return typeof performance !== "undefined" && "now" in performance;
}
function getPagePerformance() {
  if (!supportsPerformanceAPI()) return null;
  const navigation = performance.getEntriesByType("navigation")[0];
  if (!navigation) return null;
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0
  };
}
var performance$1 = {
  createPerformancePlugin,
  PerformanceManager,
  PerformanceEventType: exports.PerformanceEventType,
  withPerformanceMonitoring,
  createPerformanceConfig,
  supportsPerformanceAPI,
  getPagePerformance
};

exports.PerformanceManager = PerformanceManager;
exports.createPerformanceConfig = createPerformanceConfig;
exports.createPerformancePlugin = createPerformancePlugin;
exports.default = performance$1;
exports.getPagePerformance = getPagePerformance;
exports.supportsPerformanceAPI = supportsPerformanceAPI;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=performance.cjs.map
