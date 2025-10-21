/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { logger } from '../utils/logger.js';

class RouteVisualizer {
  constructor(router, config = {}) {
    this.isVisible = false;
    this.router = router;
    this.config = {
      enabled: true,
      position: "bottom-right",
      hotkey: "ctrl+shift+d",
      theme: "auto",
      ...config
    };
    if (this.config?.enabled) {
      this.init();
    }
  }
  // 初始化
  init() {
    this.createContainer();
    this.setupHotkey();
    this.render();
  }
  // 创建容器
  createContainer() {
    this.container = document.createElement("div");
    this.container.id = "route-visualizer";
    this.container.style.cssText = this.getContainerStyles();
    document.body.appendChild(this.container);
  }
  // 获取容器样式
  getContainerStyles() {
    const positions = {
      "top-left": "top: 20px; left: 20px;",
      "top-right": "top: 20px; right: 20px;",
      "bottom-left": "bottom: 20px; left: 20px;",
      "bottom-right": "bottom: 20px; right: 20px;"
    };
    const theme = this.getTheme();
    const isDark = theme === "dark";
    return `
      position: fixed;
      ${positions[this.config?.position || "bottom-right"]}
      width: 400px;
      max-height: 600px;
      background: ${isDark ? "#1e1e1e" : "#ffffff"};
      color: ${isDark ? "#ffffff" : "#000000"};
      border: 1px solid ${isDark ? "#444" : "#ddd"};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      z-index: 999999;
      display: ${this.isVisible ? "block" : "none"};
      overflow: hidden;
    `;
  }
  // 获取主题
  getTheme() {
    if (this.config?.theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return this.config?.theme || "light";
  }
  // 设置快捷键
  setupHotkey() {
    document.addEventListener("keydown", (e) => {
      const hotkey = this.config?.hotkey || "ctrl+shift+d";
      const keys = hotkey.split("+");
      const ctrlKey = keys.includes("ctrl") ? e.ctrlKey : true;
      const shiftKey = keys.includes("shift") ? e.shiftKey : true;
      const altKey = keys.includes("alt") ? e.altKey : true;
      const key = keys[keys.length - 1]?.toLowerCase() || "";
      if (ctrlKey && shiftKey && altKey && e.key.toLowerCase() === key) {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  // 切换显示
  toggle() {
    this.isVisible = !this.isVisible;
    if (this.container) {
      this.container.style.display = this.isVisible ? "block" : "none";
      if (this.isVisible) {
        this.render();
      }
    }
  }
  // 渲染路由树
  render() {
    if (!this.container) return;
    const routes = this.router.getRoutes();
    const currentRoute = this.router.currentRoute.value;
    const theme = this.getTheme();
    const isDark = theme === "dark";
    const html = `
      <div style="padding: 15px; border-bottom: 1px solid ${isDark ? "#444" : "#ddd"};">
        <h3 style="margin: 0 0 10px 0; font-size: 14px;">\u{1F5FA}\uFE0F Route Tree</h3>
        <div style="color: ${isDark ? "#888" : "#666"};">
          Current: ${currentRoute.path}
        </div>
      </div>
      <div style="max-height: 500px; overflow-y: auto; padding: 15px;">
        ${this.renderRouteTree(routes, currentRoute)}
      </div>
      <div style="padding: 10px; border-top: 1px solid ${isDark ? "#444" : "#ddd"}; font-size: 11px; color: ${isDark ? "#888" : "#666"};">
        Press ${this.config?.hotkey} to toggle
      </div>
    `;
    this.container.innerHTML = html;
  }
  // 渲染路由树节点
  renderRouteTree(routes, currentRoute) {
    return `<ul style="list-style: none; padding: 0; margin: 0;">
      ${routes.map((route) => this.renderRouteNode(route, currentRoute)).join("")}
    </ul>`;
  }
  // 渲染路由节点
  renderRouteNode(route, currentRoute, level = 0) {
    const isActive = currentRoute.matched.includes(route);
    const theme = this.getTheme();
    const isDark = theme === "dark";
    const nodeStyle = `
      padding: 5px 10px;
      margin-left: ${level * 20}px;
      background: ${isActive ? isDark ? "#2a2a2a" : "#e8f4ff" : "transparent"};
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    const nameColor = isActive ? "#4CAF50" : isDark ? "#ccc" : "#333";
    const pathColor = isDark ? "#888" : "#666";
    const metaColor = "#FF9800";
    let html = `
      <li>
        <div style="${nodeStyle}" onclick="">
          <span style="color: ${nameColor}; font-weight: ${isActive ? "bold" : "normal"};">
            ${route.name ? String(route.name) : "(unnamed)"}
          </span>
          <span style="color: ${pathColor}; margin-left: 10px;">
            ${route.path}
          </span>
          ${route.meta ? `<span style="color: ${metaColor}; margin-left: 10px; font-size: 10px;">
            ${JSON.stringify(route.meta)}
          </span>` : ""}
        </div>
    `;
    if (route.children && route.children.length > 0) {
      html += `<ul style="list-style: none; padding: 0; margin: 0;">
        ${route.children.map((child) => this.renderRouteNode(child, currentRoute, level + 1)).join("")}
      </ul>`;
    }
    html += "</li>";
    return html;
  }
  // 销毁
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
class RouteTracer {
  constructor(router, config = {}) {
    this.history = [];
    this.router = router;
    this.config = {
      enabled: true,
      maxHistory: 50,
      captureStack: true,
      logLevel: "info",
      ...config
    };
    if (this.config?.enabled) {
      this.setupTracing();
    }
  }
  // 设置追踪
  setupTracing() {
    this.router.beforeEach((to, from) => {
      const trace = {
        id: this.generateId(),
        from: this.serializeRoute(from),
        to: this.serializeRoute(to),
        timestamp: Date.now(),
        type: "navigation",
        status: "pending"
      };
      if (this.config?.captureStack) {
        trace.stack = new Error("Navigation stack trace").stack;
      }
      this.addTrace(trace);
      this.log("info", `\u{1F680} Navigation: ${from.path} \u2192 ${to.path}`);
      return true;
    });
    this.router.afterEach((_to, _from, failure) => {
      const trace = this.history[this.history.length - 1];
      if (trace && trace.status === "pending") {
        trace.status = failure ? "failed" : "success";
        trace.duration = Date.now() - trace.timestamp;
        if (failure) {
          trace.error = this.serializeError(failure);
          this.log("error", `\u274C Navigation failed: ${failure}`);
        } else {
          this.log("info", `\u2705 Navigation completed in ${trace.duration}ms`);
        }
      }
    });
    this.router.onError((error) => {
      const trace = {
        id: this.generateId(),
        timestamp: Date.now(),
        type: "error",
        status: "failed",
        error: this.serializeError(error)
      };
      if (this.config?.captureStack) {
        trace.stack = error.stack;
      }
      this.addTrace(trace);
      this.log("error", `\u{1F525} Router error: ${error.message}`);
    });
  }
  // 添加追踪记录
  addTrace(trace) {
    this.history.push(trace);
    if (this.history.length > (this.config?.maxHistory || 50)) {
      this.history.shift();
    }
  }
  // 生成ID
  generateId() {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  // 序列化路由
  serializeRoute(route) {
    return {
      path: route.path,
      name: route.name,
      params: route.params,
      query: route.query,
      hash: route.hash,
      meta: route.meta
    };
  }
  // 序列化错误
  serializeError(error) {
    return {
      message: error.message || String(error),
      type: error.constructor?.name || "Error",
      stack: error.stack
    };
  }
  // 日志输出
  log(level, message, data) {
    const levels = ["verbose", "info", "warn", "error"];
    const configLevel = levels.indexOf(this.config?.logLevel || "info");
    const messageLevel = levels.indexOf(level);
    if (messageLevel >= configLevel) {
      const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
      logger[method](`[Router] ${message}`, data || "");
    }
  }
  // 获取历史记录
  getHistory() {
    return [...this.history];
  }
  // 获取最近的错误
  getRecentErrors(count = 10) {
    return this.history.filter((trace) => trace.status === "failed").slice(-count);
  }
  // 清除历史
  clearHistory() {
    this.history = [];
  }
  // 导出追踪数据
  exportTraces() {
    return JSON.stringify(this.history, null, 2);
  }
}
class RoutePerformanceAnalyzer {
  constructor(router, config = {}) {
    this.metrics = /* @__PURE__ */ new Map();
    this.componentTimings = /* @__PURE__ */ new Map();
    this.router = router;
    this.config = {
      enabled: true,
      slowThreshold: 100,
      measureComponents: true,
      reportInterval: 3e4,
      ...config
    };
    if (this.config?.enabled) {
      this.setupMeasurement();
      if (this.config?.reportInterval) {
        this.startAutoReporting();
      }
    }
  }
  // 设置性能测量
  setupMeasurement() {
    this.router.beforeEach((to, _from) => {
      const metric = {
        route: to.path,
        startTime: performance.now(),
        type: "navigation"
      };
      this.addMetric(to.path, metric);
      performance.mark(`route-start-${to.path}`);
      return true;
    });
    this.router.afterEach((to) => {
      const metrics = this.metrics.get(to.path);
      if (metrics && metrics.length > 0) {
        const lastMetric = metrics[metrics.length - 1];
        if (lastMetric && !lastMetric.endTime) {
          lastMetric.endTime = performance.now();
          lastMetric.duration = lastMetric.endTime - lastMetric.startTime;
          performance.mark(`route-end-${to.path}`);
          try {
            performance.measure(`route-${to.path}`, `route-start-${to.path}`, `route-end-${to.path}`);
          } catch {
          }
          if (lastMetric.duration && lastMetric.duration > (this.config?.slowThreshold || 100)) {
            logger.warn(`\u26A0\uFE0F Slow route detected: ${to.path} took ${lastMetric.duration.toFixed(2)}ms`);
            this.analyzeSlow(to.path, lastMetric);
          }
        }
      }
    });
  }
  // 添加性能指标
  addMetric(route, metric) {
    if (!this.metrics.has(route)) {
      this.metrics.set(route, []);
    }
    const metrics = this.metrics.get(route);
    metrics.push(metric);
    if (metrics.length > 100) {
      metrics.shift();
    }
  }
  // 测量组件性能
  measureComponent(name, fn) {
    if (!this.config?.measureComponents) {
      fn();
      return;
    }
    const startTime = performance.now();
    fn();
    const duration = performance.now() - startTime;
    if (!this.componentTimings.has(name)) {
      this.componentTimings.set(name, []);
    }
    const timings = this.componentTimings.get(name);
    timings.push(duration);
    if (timings.length > 100) {
      timings.shift();
    }
  }
  // 分析慢路由
  analyzeSlow(_route, metric) {
    const suggestions = [];
    if (metric.duration > 500) {
      suggestions.push("Consider lazy loading heavy components");
    }
    if (metric.duration > 200) {
      suggestions.push("Check for synchronous data fetching in route guards");
    }
    if (this.componentTimings.size > 0) {
      const slowComponents = Array.from(this.componentTimings.entries()).filter(([_, timings]) => {
        const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
        return avg > 50;
      }).map(([name]) => name);
      if (slowComponents.length > 0) {
        suggestions.push(`Slow components detected: ${slowComponents.join(", ")}`);
      }
    }
    if (suggestions.length > 0) {
      logger.info("\u{1F4CA} Performance suggestions:");
      suggestions.forEach((s) => logger.info(`  - ${s}`));
    }
  }
  // 开始自动报告
  startAutoReporting() {
    this.reportTimer = setInterval(() => {
      this.generateReport();
    }, this.config?.reportInterval || 3e4);
  }
  // 生成性能报告
  generateReport() {
    const report = {
      timestamp: Date.now(),
      routes: [],
      components: [],
      summary: {
        totalNavigations: 0,
        avgNavigationTime: 0,
        slowestRoute: "",
        slowestTime: 0
      }
    };
    this.metrics.forEach((metrics, route) => {
      const validMetrics = metrics.filter((m) => m.duration);
      if (validMetrics.length === 0) return;
      const durations = validMetrics.map((m) => m.duration);
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      report.routes.push({
        route,
        count: validMetrics.length,
        avg,
        min,
        max,
        p95: this.percentile(durations, 95)
      });
      report.summary.totalNavigations += validMetrics.length;
      if (max > report.summary.slowestTime) {
        report.summary.slowestTime = max;
        report.summary.slowestRoute = route;
      }
    });
    if (report.routes.length > 0) {
      report.summary.avgNavigationTime = report.routes.reduce((sum, r) => sum + r.avg, 0) / report.routes.length;
    }
    this.componentTimings.forEach((timings, component) => {
      if (timings.length === 0) return;
      const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
      const max = Math.max(...timings);
      const min = Math.min(...timings);
      const componentMetric = {
        component,
        count: timings.length,
        avg,
        min,
        max
      };
      report.components.push(componentMetric);
    });
    logger.info("\u{1F4CA} Performance report generated", report);
    return report;
  }
  // 计算百分位数
  percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(p / 100 * sorted.length) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }
  // 清理
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
    this.metrics.clear();
    this.componentTimings.clear();
  }
}
class RouteErrorDiagnostics {
  constructor(router, config = {}) {
    this.errors = [];
    this.router = router;
    this.config = {
      enabled: true,
      captureErrors: true,
      reportErrors: false,
      ...config
    };
    if (this.config?.enabled) {
      this.setupErrorCapture();
    }
  }
  // 设置错误捕获
  setupErrorCapture() {
    this.router.onError((error) => {
      this.captureError(error, "router");
    });
    if (this.config?.captureErrors) {
      window.addEventListener("error", (event) => {
        this.captureError(event.error, "global", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
      window.addEventListener("unhandledrejection", (event) => {
        this.captureError(event.reason, "promise");
      });
    }
  }
  // 捕获错误
  captureError(error, source, extra) {
    const record = {
      id: this.generateId(),
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      source,
      route: this.router.currentRoute.value.path,
      extra,
      diagnosis: this.diagnoseError(error)
    };
    this.errors.push(record);
    if (this.errors.length > 100) {
      this.errors.shift();
    }
    this.outputDiagnosis(record);
    if (this.config?.reportErrors && this.config?.errorEndpoint) {
      this.reportError(record);
    }
  }
  // 诊断错误
  diagnoseError(error) {
    const diagnosis = {
      type: error.name,
      category: "unknown",
      severity: "error",
      suggestions: []
    };
    if (error.message.includes("Cannot find module")) {
      diagnosis.category = "module";
      diagnosis.suggestions.push("Check if the module is installed");
      diagnosis.suggestions.push("Verify the import path is correct");
    } else if (error.message.includes("Navigation")) {
      diagnosis.category = "navigation";
      diagnosis.suggestions.push("Check route configuration");
      diagnosis.suggestions.push("Verify route guards are returning correct values");
    } else if (error.message.includes("Permission") || error.message.includes("401") || error.message.includes("403")) {
      diagnosis.category = "permission";
      diagnosis.suggestions.push("Check user authentication status");
      diagnosis.suggestions.push("Verify required permissions");
    } else if (error.message.includes("Network") || error.message.includes("fetch")) {
      diagnosis.category = "network";
      diagnosis.suggestions.push("Check network connectivity");
      diagnosis.suggestions.push("Verify API endpoints");
    }
    if (error.message.includes("Critical") || error.message.includes("Fatal")) {
      diagnosis.severity = "critical";
    } else if (error.message.includes("Warning")) {
      diagnosis.severity = "warning";
    }
    return diagnosis;
  }
  // 输出诊断信息
  outputDiagnosis(record) {
    const diagnosis = record.diagnosis;
    logger.group(`\u{1F50D} Error Diagnosis [${diagnosis.severity}]`);
    logger.error("Error:", record.error.message);
    logger.info(`Category: ${diagnosis.category}`);
    logger.info(`Type: ${diagnosis.type}`);
    logger.info(`Route: ${record.route}`);
    if (diagnosis.suggestions.length > 0) {
      logger.info("Suggestions:");
      diagnosis.suggestions.forEach((s) => logger.info(`  - ${s}`));
    }
    if (record.error.stack) {
      logger.debug("Stack trace:", record.error.stack);
    }
    logger.groupEnd();
  }
  // 报告错误
  async reportError(record) {
    if (!this.config?.errorEndpoint) return;
    try {
      await fetch(this.config?.errorEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(record)
      });
    } catch (e) {
      logger.error("Failed to report error:", e);
    }
  }
  // 生成ID
  generateId() {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  // 获取错误记录
  getErrors() {
    return [...this.errors];
  }
  // 清除错误
  clearErrors() {
    this.errors = [];
  }
}
class RouteDebugger {
  constructor(router, config = {}) {
    this.router = router;
    this.config = {
      enabled: true,
      ...config
    };
    if (!this.config?.enabled) return;
    this.visualizer = new RouteVisualizer(router, config.visualizer);
    this.tracer = new RouteTracer(router, config.tracer);
    this.performanceAnalyzer = new RoutePerformanceAnalyzer(router, config.performance);
    this.errorDiagnostics = new RouteErrorDiagnostics(router, config.errorDiagnostics);
    this.setupConsoleCommands();
  }
  // 设置控制台命令
  setupConsoleCommands() {
    if (typeof window !== "undefined") {
      window.routeDebugger = {
        showVisualizer: () => this.visualizer?.toggle(),
        getHistory: () => this.tracer?.getHistory() || [],
        getErrors: () => this.errorDiagnostics?.getErrors() || [],
        getPerformance: () => this.performanceAnalyzer?.generateReport(),
        exportTraces: () => this.tracer?.exportTraces() || "[]",
        clearHistory: () => this.tracer?.clearHistory(),
        clearErrors: () => this.errorDiagnostics?.clearErrors()
      };
      logger.info("[RouteDebugger] Console commands registered. Use window.routeDebugger to access.");
    }
  }
  // 获取调试信息
  getDebugInfo() {
    return {
      currentRoute: this.router.currentRoute.value,
      routes: this.router.getRoutes(),
      history: this.tracer?.getHistory() || [],
      errors: this.errorDiagnostics?.getErrors() || [],
      performance: this.performanceAnalyzer?.generateReport() || {}
    };
  }
  // 销毁
  destroy() {
    this.visualizer?.destroy();
    this.performanceAnalyzer?.destroy();
  }
}
let defaultDebugger = null;
function setupRouteDebugger(router, config) {
  if (!defaultDebugger) {
    defaultDebugger = new RouteDebugger(router, config);
  }
  return defaultDebugger;
}
function getDebugInfo() {
  return defaultDebugger?.getDebugInfo() || null;
}
function getRouteDebugger() {
  return defaultDebugger;
}
function debugLog(...args) {
  logger.info("[RouteDebug]", ...args);
}
function debugWarn(...args) {
  logger.warn("[RouteDebug Warning]", ...args);
}
function debugError(...args) {
  logger.error("[RouteDebug Error]", ...args);
}

export { RouteDebugger, RouteErrorDiagnostics, RoutePerformanceAnalyzer, RouteTracer, RouteVisualizer, debugError, debugLog, debugWarn, getDebugInfo, getRouteDebugger, setupRouteDebugger };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouteDebugger.js.map
