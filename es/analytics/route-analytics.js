/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class RouteAnalytics {
  constructor(router, config = {}) {
    this.visits = [];
    this.performanceData = /* @__PURE__ */ new Map();
    this.behaviorEvents = [];
    this.router = router;
    this.config = {
      enabled: true,
      sampleRate: 1,
      collectPerformance: true,
      collectBehavior: false,
      batchSize: 10,
      reportInterval: 3e4,
      // 30秒
      storageKey: "ldesign-router-analytics",
      ...config
    };
    this.sessionId = this.generateSessionId();
    if (this.config?.enabled && this.shouldSample()) {
      this.init();
    }
  }
  /**
   * 初始化分析器
   */
  init() {
    this.setupRouteTracking();
    if (this.config?.collectPerformance) {
      this.setupPerformanceTracking();
    }
    if (this.config?.collectBehavior) {
      this.setupBehaviorTracking();
    }
    this.startReporting();
    this.loadStoredData();
  }
  /**
   * 设置路由追踪
   */
  setupRouteTracking() {
    this.router.beforeEach((to, from) => {
      if (this.currentVisit) {
        this.currentVisit.duration = Date.now() - this.currentVisit.timestamp;
        this.visits.push(this.currentVisit);
      }
      this.currentVisit = {
        path: to.path,
        name: to.name,
        timestamp: Date.now(),
        referrer: from.path,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        metadata: {
          params: to.params,
          query: to.query,
          meta: to.meta
        }
      };
    });
    this.router.afterEach((_to) => {
      if (this.currentVisit) {
        this.currentVisit.duration = Date.now() - this.currentVisit.timestamp;
      }
    });
  }
  /**
   * 设置性能追踪
   */
  setupPerformanceTracking() {
    this.router.beforeEach((to) => {
      const metrics = {
        navigationStart: performance.now()
      };
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navEntry = entry;
            metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          } else if (entry.entryType === "paint") {
            if (entry.name === "first-contentful-paint") {
              metrics.fcp = entry.startTime;
            }
          } else if (entry.entryType === "largest-contentful-paint") {
            metrics.lcp = entry.startTime;
          }
        }
      });
      observer.observe({
        entryTypes: ["navigation", "paint", "largest-contentful-paint"]
      });
      to._performanceMetrics = metrics;
    });
    this.router.afterEach((to) => {
      const metrics = to._performanceMetrics;
      if (metrics) {
        metrics.renderComplete = performance.now();
        metrics.totalTime = metrics.renderComplete - (metrics.navigationStart || 0);
        this.performanceData.set(to.path, metrics);
      }
    });
  }
  /**
   * 设置用户行为追踪
   */
  setupBehaviorTracking() {
    document.addEventListener("click", (event) => {
      this.recordBehaviorEvent({
        type: "click",
        target: this.getElementSelector(event.target),
        route: this.router.currentRoute.value.path,
        timestamp: Date.now(),
        data: {
          x: event.clientX,
          y: event.clientY
        }
      });
    });
    let scrollTimer;
    document.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.recordBehaviorEvent({
          type: "scroll",
          target: "window",
          route: this.router.currentRoute.value.path,
          timestamp: Date.now(),
          data: {
            scrollY: window.scrollY,
            scrollX: window.scrollX
          }
        });
      }, 100);
    });
  }
  /**
   * 记录用户行为事件
   */
  recordBehaviorEvent(event) {
    this.behaviorEvents.push(event);
    if (this.behaviorEvents.length > 1e3) {
      this.behaviorEvents = this.behaviorEvents.slice(-500);
    }
  }
  /**
   * 获取元素选择器
   */
  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.className) {
      return `.${element.className.split(" ")[0]}`;
    }
    return element.tagName.toLowerCase();
  }
  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * 判断是否应该采样
   */
  shouldSample() {
    return Math.random() < this.config?.sampleRate;
  }
  /**
   * 开始定期上报
   */
  startReporting() {
    this.reportTimer = setInterval(() => {
      this.report();
    }, this.config?.reportInterval);
  }
  /**
   * 上报数据
   */
  async report() {
    if (this.visits.length === 0 && this.behaviorEvents.length === 0) {
      return;
    }
    const data = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      visits: this.visits.splice(0, this.config?.batchSize),
      performance: Object.fromEntries(this.performanceData),
      behavior: this.behaviorEvents.splice(0, this.config?.batchSize * 5),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    try {
      if (this.config?.endpoint) {
        await fetch(this.config?.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
      } else {
        this.storeData(data);
      }
    } catch (error) {
      console.error("\u8DEF\u7531\u5206\u6790\u6570\u636E\u4E0A\u62A5\u5931\u8D25:", error);
      this.visits.unshift(...data.visits);
      this.behaviorEvents.unshift(...data.behavior);
    }
  }
  /**
   * 存储数据到本地
   */
  storeData(data) {
    try {
      const stored = localStorage.getItem(this.config?.storageKey);
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(data);
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100);
      }
      localStorage.setItem(this.config?.storageKey, JSON.stringify(existing));
    } catch (error) {
      console.error("\u8DEF\u7531\u5206\u6790\u6570\u636E\u5B58\u50A8\u5931\u8D25:", error);
    }
  }
  /**
   * 加载存储的数据
   */
  loadStoredData() {
    try {
      const stored = localStorage.getItem(this.config?.storageKey);
      if (stored) {
      }
    } catch (error) {
      console.error("\u52A0\u8F7D\u8DEF\u7531\u5206\u6790\u6570\u636E\u5931\u8D25:", error);
    }
  }
  /**
   * 获取分析报告
   */
  getReport() {
    const allVisits = [...this.visits];
    if (this.currentVisit) {
      allVisits.push({
        ...this.currentVisit,
        duration: Date.now() - this.currentVisit.timestamp
      });
    }
    const routeStats = /* @__PURE__ */ new Map();
    for (const visit of allVisits) {
      const existing = routeStats.get(visit.path);
      if (existing) {
        existing.count++;
        existing.totalTime += visit.duration || 0;
        existing.avgTime = existing.totalTime / existing.count;
      } else {
        routeStats.set(visit.path, {
          count: 1,
          totalTime: visit.duration || 0,
          avgTime: visit.duration || 0
        });
      }
    }
    const performanceStats = {
      averageNavigationTime: 0,
      slowestRoute: "",
      fastestRoute: "",
      totalNavigations: allVisits.length
    };
    if (this.performanceData.size > 0) {
      const times = Array.from(this.performanceData.values()).map((m) => m.totalTime);
      performanceStats.averageNavigationTime = times.reduce((a, b) => a + b, 0) / times.length;
      const sortedEntries = Array.from(this.performanceData.entries()).sort((a, b) => b[1].totalTime - a[1].totalTime);
      performanceStats.slowestRoute = sortedEntries[0]?.[0] || "";
      performanceStats.fastestRoute = sortedEntries[sortedEntries.length - 1]?.[0] || "";
    }
    return {
      sessionId: this.sessionId,
      totalVisits: allVisits.length,
      uniqueRoutes: routeStats.size,
      routeStats: Object.fromEntries(routeStats),
      performanceStats,
      behaviorEvents: this.behaviorEvents.length,
      topRoutes: Array.from(routeStats.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([path, stats]) => ({
        path,
        ...stats
      }))
    };
  }
  /**
   * 清空数据
   */
  clear() {
    this.visits = [];
    this.performanceData.clear();
    this.behaviorEvents = [];
    this.currentVisit = void 0;
    localStorage.removeItem(this.config?.storageKey);
  }
  /**
   * 销毁分析器
   */
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    this.report();
  }
}
function createRouteAnalytics(router, config) {
  return new RouteAnalytics(router, config);
}

export { RouteAnalytics, createRouteAnalytics };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=route-analytics.js.map
