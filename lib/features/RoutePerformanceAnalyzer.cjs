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

class RoutePerformanceAnalyzer {
  constructor(router, config) {
    this.metrics = /* @__PURE__ */ new Map();
    this.currentNavigation = null;
    this.navigationCount = 0;
    this.state = vue.reactive({
      isRecording: false,
      totalRecords: 0,
      currentReport: null,
      realTimeMetrics: {
        lastNavigationTime: 0,
        averageTime: 0,
        memoryUsage: 0
      }
    });
    this.router = router;
    this.config = {
      enabled: true,
      sampleRate: 1,
      maxRecords: 1e3,
      thresholds: {
        good: 200,
        acceptable: 500,
        poor: 1e3,
        ...config?.thresholds
      },
      detailed: false,
      autoAnalyze: true,
      analyzeInterval: 6e4,
      // 1分钟
      ...config
    };
    if (this.config?.enabled) {
      this.initialize();
    }
  }
  /**
   * 初始化分析器
   */
  initialize() {
    this.setupNavigationTracking();
    if (this.config?.autoAnalyze) {
      this.startAutoAnalyze();
    }
    this.state.isRecording = true;
  }
  /**
   * 设置导航跟踪
   */
  setupNavigationTracking() {
    this.router.beforeEach((to, _from, next) => {
      if (this.shouldRecord()) {
        this.startNavigation(to);
      }
      const guardStart = performance.now();
      const wrappedNext = (arg) => {
        if (this.currentNavigation) {
          this.currentNavigation.guardTime = performance.now() - guardStart;
        }
        return next(arg);
      };
      return wrappedNext;
    });
    this.router.afterEach((to, _from) => {
      if (this.currentNavigation) {
        this.endNavigation(to);
      }
    });
    this.router.onError((error) => {
      if (this.currentNavigation) {
        this.currentNavigation.error = error;
        this.endNavigation();
      }
    });
  }
  /**
   * 判断是否应该记录
   */
  shouldRecord() {
    if (!this.config?.enabled || !this.state.isRecording) {
      return false;
    }
    if (Math.random() > this.config?.sampleRate) {
      return false;
    }
    if (this.state.totalRecords >= this.config?.maxRecords) {
      this.cleanOldRecords();
    }
    return true;
  }
  /**
   * 开始导航记录
   */
  startNavigation(to) {
    this.currentNavigation = {
      path: to.path,
      name: to.name,
      startTime: performance.now(),
      memoryUsage: this.getMemoryUsage()
    };
  }
  /**
   * 结束导航记录
   */
  endNavigation(to) {
    if (!this.currentNavigation) return;
    const endTime = performance.now();
    this.currentNavigation.endTime = endTime;
    this.currentNavigation.duration = endTime - this.currentNavigation.startTime;
    if (this.currentNavigation.guardTime && this.currentNavigation.componentLoadTime) {
      this.currentNavigation.renderTime = this.currentNavigation.duration - this.currentNavigation.guardTime - this.currentNavigation.componentLoadTime;
    }
    this.currentNavigation.score = this.calculateScore(this.currentNavigation);
    const path = to?.path || this.currentNavigation.path;
    if (!this.metrics.has(path)) {
      this.metrics.set(path, []);
    }
    this.metrics.get(path).push(this.currentNavigation);
    this.navigationCount++;
    this.state.totalRecords++;
    this.updateRealTimeMetrics(this.currentNavigation);
    this.currentNavigation = null;
  }
  /**
   * 计算性能评分
   */
  calculateScore(metric) {
    if (!metric.duration) return 0;
    const {
      good = 200,
      acceptable = 500,
      poor = 1e3
    } = this.config?.thresholds || {};
    if (metric.duration <= good) {
      return 100;
    } else if (metric.duration <= acceptable) {
      return 80 - (metric.duration - good) / (acceptable - good) * 20;
    } else if (metric.duration <= poor) {
      return 60 - (metric.duration - acceptable) / (poor - acceptable) * 30;
    } else {
      return Math.max(0, 30 - (metric.duration - poor) / 1e3 * 10);
    }
  }
  /**
   * 获取内存使用量
   */
  getMemoryUsage() {
    if ("memory" in performance) {
      return performance.memory.usedJSHeapSize || 0;
    }
    return 0;
  }
  /**
   * 更新实时指标
   */
  updateRealTimeMetrics(metric) {
    this.state.realTimeMetrics.lastNavigationTime = metric.duration || 0;
    this.state.realTimeMetrics.memoryUsage = this.getMemoryUsage();
    const allMetrics = Array.from(this.metrics.values()).flat();
    const recentMetrics = allMetrics.slice(-100);
    const totalTime = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    this.state.realTimeMetrics.averageTime = recentMetrics.length > 0 ? totalTime / recentMetrics.length : 0;
  }
  /**
   * 清理旧记录
   */
  cleanOldRecords() {
    const halfMax = Math.floor(this.config?.maxRecords / 2);
    for (const [path, metrics] of this.metrics.entries()) {
      if (metrics.length > halfMax) {
        this.metrics.set(path, metrics.slice(-halfMax));
      }
    }
    this.state.totalRecords = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
  }
  /**
   * 生成性能报告
   */
  generateReport() {
    const allMetrics = Array.from(this.metrics.values()).flat();
    if (allMetrics.length === 0) {
      return this.createEmptyReport();
    }
    const sortedByDuration = [...allMetrics].filter((m) => m.duration !== void 0).sort((a, b) => (a.duration || 0) - (b.duration || 0));
    const durations = sortedByDuration.map((m) => m.duration || 0);
    const totalTime = durations.reduce((sum, d) => sum + d, 0);
    const averageTime = totalTime / durations.length;
    const detailedMetrics = {
      p50: this.percentile(durations, 0.5),
      p75: this.percentile(durations, 0.75),
      p90: this.percentile(durations, 0.9),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99)
    };
    const slowestRoutes = sortedByDuration.slice(-5).reverse();
    const fastestRoutes = sortedByDuration.slice(0, 5);
    const errorRoutes = allMetrics.filter((m) => m.error);
    const trend = this.calculateTrend(allMetrics);
    const suggestions = this.generateSuggestions(allMetrics);
    const overallScore = this.calculateOverallScore(allMetrics);
    const report = {
      overallScore,
      totalNavigations: allMetrics.length,
      averageNavigationTime: averageTime,
      slowestRoutes,
      fastestRoutes,
      errorRoutes,
      performanceTrend: trend,
      suggestions,
      detailedMetrics
    };
    this.state.currentReport = report;
    return report;
  }
  /**
   * 计算百分位数
   */
  percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
  }
  /**
   * 计算性能趋势
   */
  calculateTrend(metrics) {
    if (metrics.length < 20) return "stable";
    const recent = metrics.slice(-10);
    const previous = metrics.slice(-20, -10);
    const recentAvg = recent.reduce((sum, m) => sum + (m.duration || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, m) => sum + (m.duration || 0), 0) / previous.length;
    const changePercent = (recentAvg - previousAvg) / previousAvg * 100;
    if (changePercent < -10) return "improving";
    if (changePercent > 10) return "degrading";
    return "stable";
  }
  /**
   * 生成优化建议
   */
  generateSuggestions(metrics) {
    const suggestions = [];
    const routeMetrics = /* @__PURE__ */ new Map();
    metrics.forEach((m) => {
      if (!routeMetrics.has(m.path)) {
        routeMetrics.set(m.path, []);
      }
      routeMetrics.get(m.path).push(m);
    });
    for (const [path, pathMetrics] of routeMetrics.entries()) {
      const avgTime = pathMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / pathMetrics.length;
      if (this.config && avgTime > (this.config.thresholds?.poor ?? 1e3)) {
        suggestions.push({
          priority: "high",
          type: "lazy-loading",
          affectedRoutes: [path],
          description: `\u8DEF\u7531 "${path}" \u5E73\u5747\u52A0\u8F7D\u65F6\u95F4\u4E3A ${avgTime.toFixed(0)}ms\uFF0C\u5EFA\u8BAE\u5B9E\u65BD\u61D2\u52A0\u8F7D`,
          expectedImprovement: "\u9884\u8BA1\u53EF\u51CF\u5C11 50-70% \u7684\u521D\u59CB\u52A0\u8F7D\u65F6\u95F4",
          implementationSteps: ['\u5C06\u7EC4\u4EF6\u6539\u4E3A\u52A8\u6001\u5BFC\u5165\uFF1A() => import("./Component.vue")', "\u8003\u8651\u4F7F\u7528\u8DEF\u7531\u7EA7\u522B\u7684\u4EE3\u7801\u5206\u5272", "\u5B9E\u65BD\u9884\u52A0\u8F7D\u7B56\u7565"]
        });
      }
      if (this.config && pathMetrics.length > metrics.length * 0.2 && avgTime > (this.config.thresholds?.acceptable ?? 500)) {
        suggestions.push({
          priority: "medium",
          type: "caching",
          affectedRoutes: [path],
          description: `\u8DEF\u7531 "${path}" \u8BBF\u95EE\u9891\u7E41\u4F46\u52A0\u8F7D\u8F83\u6162\uFF0C\u5EFA\u8BAE\u542F\u7528\u7F13\u5B58`,
          expectedImprovement: "\u9884\u8BA1\u53EF\u51CF\u5C11 60-80% \u7684\u91CD\u590D\u52A0\u8F7D\u65F6\u95F4",
          implementationSteps: ["\u542F\u7528\u7EC4\u4EF6\u7F13\u5B58", "\u4F7F\u7528 keep-alive \u5305\u88F9\u7EC4\u4EF6", "\u5B9E\u65BD\u6570\u636E\u7F13\u5B58\u7B56\u7565"]
        });
      }
      const avgGuardTime = pathMetrics.filter((m) => m.guardTime).reduce((sum, m) => sum + (m.guardTime || 0), 0) / pathMetrics.length;
      if (avgGuardTime > 100) {
        suggestions.push({
          priority: "medium",
          type: "guard-optimization",
          affectedRoutes: [path],
          description: `\u8DEF\u7531 "${path}" \u7684\u5B88\u536B\u6267\u884C\u65F6\u95F4\u8FC7\u957F (${avgGuardTime.toFixed(0)}ms)`,
          expectedImprovement: "\u9884\u8BA1\u53EF\u51CF\u5C11 30-50% \u7684\u5B88\u536B\u6267\u884C\u65F6\u95F4",
          implementationSteps: ["\u4F18\u5316\u5B88\u536B\u903B\u8F91\uFF0C\u907F\u514D\u540C\u6B65\u963B\u585E\u64CD\u4F5C", "\u5C06\u91CD\u590D\u7684\u9A8C\u8BC1\u903B\u8F91\u7F13\u5B58", "\u8003\u8651\u5E76\u884C\u6267\u884C\u72EC\u7ACB\u7684\u5B88\u536B"]
        });
      }
    }
    const avgMemory = metrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / metrics.length;
    if (avgMemory > 50 * 1024 * 1024) {
      suggestions.push({
        priority: "high",
        type: "memory",
        affectedRoutes: Array.from(routeMetrics.keys()),
        description: `\u5E73\u5747\u5185\u5B58\u4F7F\u7528\u91CF\u8FC7\u9AD8 (${(avgMemory / 1024 / 1024).toFixed(1)}MB)`,
        expectedImprovement: "\u9884\u8BA1\u53EF\u51CF\u5C11 40-60% \u7684\u5185\u5B58\u4F7F\u7528",
        implementationSteps: ["\u6E05\u7406\u672A\u4F7F\u7528\u7684\u7EC4\u4EF6\u548C\u6570\u636E", "\u5B9E\u65BD\u66F4\u6FC0\u8FDB\u7684\u5783\u573E\u56DE\u6536\u7B56\u7565", "\u4F18\u5316\u6570\u636E\u7ED3\u6784\u548C\u7B97\u6CD5", "\u907F\u514D\u5185\u5B58\u6CC4\u6F0F"]
      });
    }
    const priorityOrder = {
      high: 0,
      medium: 1,
      low: 2
    };
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return suggestions;
  }
  /**
   * 计算总体评分
   */
  calculateOverallScore(metrics) {
    if (metrics.length === 0) return 100;
    const scores = metrics.filter((m) => m.score !== void 0).map((m) => m.score);
    if (scores.length === 0) return 100;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
  /**
   * 创建空报告
   */
  createEmptyReport() {
    return {
      overallScore: 100,
      totalNavigations: 0,
      averageNavigationTime: 0,
      slowestRoutes: [],
      fastestRoutes: [],
      errorRoutes: [],
      performanceTrend: "stable",
      suggestions: [],
      detailedMetrics: {
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        p99: 0
      }
    };
  }
  /**
   * 开始自动分析
   */
  startAutoAnalyze() {
    if (typeof window === "undefined") return;
    this.analyzeTimer = window.setInterval(() => {
      this.generateReport();
    }, this.config?.analyzeInterval);
  }
  /**
   * 停止自动分析
   */
  stopAutoAnalyze() {
    if (this.analyzeTimer) {
      clearInterval(this.analyzeTimer);
      this.analyzeTimer = void 0;
    }
  }
  // ==================== 公共 API ====================
  /**
   * 开始记录
   */
  startRecording() {
    this.state.isRecording = true;
  }
  /**
   * 停止记录
   */
  stopRecording() {
    this.state.isRecording = false;
  }
  /**
   * 清除数据
   */
  clearData() {
    this.metrics.clear();
    this.state.totalRecords = 0;
    this.state.currentReport = null;
    this.navigationCount = 0;
  }
  /**
   * 导出数据
   */
  exportData() {
    const data = {
      metrics: Array.from(this.metrics.entries()).map(([path, metrics]) => ({
        path,
        metrics
      })),
      report: this.state.currentReport,
      config: this.config,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
  /**
   * 导入数据
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.metrics.clear();
      data.metrics.forEach((item) => {
        this.metrics.set(item.path, item.metrics);
      });
      this.state.totalRecords = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
      this.generateReport();
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }
  /**
   * 获取路由性能历史
   */
  getRouteHistory(path) {
    return this.metrics.get(path) || [];
  }
  /**
   * 获取实时指标
   */
  getRealTimeMetrics() {
    return {
      ...this.state.realTimeMetrics
    };
  }
  /**
   * 销毁分析器
   */
  destroy() {
    this.stopAutoAnalyze();
    this.clearData();
  }
}
let defaultAnalyzer = null;
function setupPerformanceAnalyzer(router, config) {
  if (!defaultAnalyzer) {
    defaultAnalyzer = new RoutePerformanceAnalyzer(router, config);
  }
  return defaultAnalyzer;
}
function getPerformanceAnalyzer() {
  return defaultAnalyzer;
}
function generatePerformanceReport() {
  if (!defaultAnalyzer) {
    console.error("Performance analyzer not initialized");
    return null;
  }
  return defaultAnalyzer.generateReport();
}
function getPerformanceSuggestions() {
  const report = generatePerformanceReport();
  return report?.suggestions || [];
}

exports.RoutePerformanceAnalyzer = RoutePerformanceAnalyzer;
exports.generatePerformanceReport = generatePerformanceReport;
exports.getPerformanceAnalyzer = getPerformanceAnalyzer;
exports.getPerformanceSuggestions = getPerformanceSuggestions;
exports.setupPerformanceAnalyzer = setupPerformanceAnalyzer;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RoutePerformanceAnalyzer.cjs.map
