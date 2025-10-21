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

var codeQuality = require('../utils/code-quality.cjs');

class RouteInspector {
  constructor(router) {
    this.highlightedElement = null;
    this.router = router;
  }
  /**
   * 检查当前路由
   */
  inspectCurrentRoute() {
    const currentRoute = this.router.currentRoute.value;
    return this.inspectRoute(currentRoute);
  }
  /**
   * 检查指定路由
   */
  inspectRoute(route) {
    return {
      route: {
        path: route.path,
        name: route.name ? String(route.name) : void 0,
        params: route.params,
        query: route.query,
        meta: route.meta,
        matched: route.matched.map((record) => ({
          path: record.path,
          name: record.name ? String(record.name) : void 0,
          component: record.components?.default?.name || "Anonymous"
        }))
      },
      performance: this.analyzeRoutePerformance(route),
      accessibility: this.checkAccessibility(route),
      seo: this.checkSEO(route),
      security: this.checkSecurity(route)
    };
  }
  /**
   * 分析路由性能
   */
  analyzeRoutePerformance(_route) {
    return {
      loadTime: performance.now(),
      // 简化实现
      cacheHit: false,
      // 简化实现
      componentSize: "Unknown",
      // 需要实际测量
      recommendations: ["\u8003\u8651\u4F7F\u7528\u8DEF\u7531\u61D2\u52A0\u8F7D", "\u542F\u7528\u7EC4\u4EF6\u7F13\u5B58", "\u4F18\u5316\u7EC4\u4EF6\u5927\u5C0F"]
    };
  }
  /**
   * 检查无障碍访问
   */
  checkAccessibility(route) {
    const issues = [];
    if (!route.meta?.title) {
      issues.push("\u7F3A\u5C11\u9875\u9762\u6807\u9898");
    }
    if (!route.meta?.description) {
      issues.push("\u7F3A\u5C11\u9875\u9762\u63CF\u8FF0");
    }
    return {
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25),
      issues,
      suggestions: ["\u6DFB\u52A0\u9875\u9762\u6807\u9898\u548C\u63CF\u8FF0", "\u786E\u4FDD\u952E\u76D8\u5BFC\u822A\u53EF\u7528", "\u68C0\u67E5\u989C\u8272\u5BF9\u6BD4\u5EA6"]
    };
  }
  /**
   * 检查SEO
   */
  checkSEO(route) {
    const issues = [];
    if (!route.meta?.title) {
      issues.push("\u7F3A\u5C11\u9875\u9762\u6807\u9898");
    }
    if (!route.meta?.description) {
      issues.push("\u7F3A\u5C11meta\u63CF\u8FF0");
    }
    if (!route.meta?.keywords) {
      issues.push("\u7F3A\u5C11\u5173\u952E\u8BCD");
    }
    return {
      score: Math.max(0, 100 - issues.length * 20),
      issues,
      suggestions: ["\u6DFB\u52A0\u9875\u9762\u6807\u9898\u548C\u63CF\u8FF0", "\u8BBE\u7F6E\u5408\u9002\u7684\u5173\u952E\u8BCD", "\u4F18\u5316URL\u7ED3\u6784"]
    };
  }
  /**
   * 检查安全性
   */
  checkSecurity(route) {
    const issues = [];
    if (route.meta?.requiresAuth && !route.meta?.auth) {
      issues.push("\u9700\u8981\u8BA4\u8BC1\u4F46\u672A\u914D\u7F6E\u8BA4\u8BC1\u68C0\u67E5");
    }
    if (route.meta?.roles && !Array.isArray(route.meta.roles)) {
      issues.push("\u89D2\u8272\u914D\u7F6E\u683C\u5F0F\u9519\u8BEF");
    }
    return {
      score: Math.max(0, 100 - issues.length * 30),
      issues,
      suggestions: ["\u914D\u7F6E\u9002\u5F53\u7684\u8BA4\u8BC1\u68C0\u67E5", "\u8BBE\u7F6E\u89D2\u8272\u6743\u9650", "\u9A8C\u8BC1\u8F93\u5165\u53C2\u6570"]
    };
  }
  /**
   * 高亮路由元素
   */
  highlightRouteElement(selector) {
    this.clearHighlight();
    const element = document.querySelector(selector);
    if (element) {
      element.style.outline = "2px solid #007acc";
      element.style.outlineOffset = "2px";
      this.highlightedElement = element;
    }
  }
  /**
   * 清除高亮
   */
  clearHighlight() {
    if (this.highlightedElement) {
      this.highlightedElement.style.outline = "";
      this.highlightedElement.style.outlineOffset = "";
      this.highlightedElement = null;
    }
  }
}
class DevToolsPanel {
  constructor(router, config = {}) {
    this.container = null;
    this.isVisible = false;
    this.inspector = new RouteInspector(router);
    this.config = {
      enabled: true,
      hotkeys: {
        toggle: "Ctrl+Shift+D",
        inspect: "Ctrl+Shift+I",
        performance: "Ctrl+Shift+P",
        quality: "Ctrl+Shift+Q"
      },
      panel: {
        position: "bottom",
        size: 300,
        theme: "auto"
      },
      features: {
        routeInspector: true,
        performanceMonitor: true,
        qualityChecker: true,
        networkTracker: true,
        stateViewer: true
      },
      ...config
    };
    if (this.config?.enabled) {
      this.init();
    }
  }
  /**
   * 初始化开发工具
   */
  init() {
    this.setupHotkeys();
    this.createPanel();
  }
  /**
   * 设置热键
   */
  setupHotkeys() {
    document.addEventListener("keydown", (event) => {
      if (this.matchHotkey(event, this.config?.hotkeys.toggle)) {
        this.toggle();
      } else if (this.matchHotkey(event, this.config?.hotkeys.inspect)) {
        this.showInspector();
      } else if (this.matchHotkey(event, this.config?.hotkeys.performance)) {
        this.showPerformance();
      } else if (this.matchHotkey(event, this.config?.hotkeys.quality)) {
        this.showQuality();
      }
    });
  }
  /**
   * 匹配热键
   */
  matchHotkey(event, hotkey) {
    const keys = hotkey.split("+").map((k) => k.trim().toLowerCase());
    const pressed = [];
    if (event.ctrlKey) pressed.push("ctrl");
    if (event.shiftKey) pressed.push("shift");
    if (event.altKey) pressed.push("alt");
    if (event.metaKey) pressed.push("meta");
    pressed.push(event.key.toLowerCase());
    return keys.every((key) => pressed.includes(key)) && keys.length === pressed.length;
  }
  /**
   * 创建面板
   */
  createPanel() {
    this.container = document.createElement("div");
    this.container.id = "ldesign-router-devtools";
    this.container.style.cssText = `
      position: fixed;
      ${this.config?.panel.position}: 0;
      left: 0;
      right: 0;
      height: ${this.config?.panel.size}px;
      background: #1e1e1e;
      color: #fff;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 999999;
      border-top: 1px solid #333;
      display: none;
      overflow: auto;
    `;
    document.body.appendChild(this.container);
  }
  /**
   * 切换面板显示
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  /**
   * 显示面板
   */
  show() {
    if (this.container) {
      this.container.style.display = "block";
      this.isVisible = true;
      this.render();
    }
  }
  /**
   * 隐藏面板
   */
  hide() {
    if (this.container) {
      this.container.style.display = "none";
      this.isVisible = false;
    }
  }
  /**
   * 显示路由检查器
   */
  showInspector() {
    this.show();
    const result = this.inspector.inspectCurrentRoute();
    this.renderInspector(result);
  }
  /**
   * 显示性能监控
   */
  showPerformance() {
    this.show();
    const stats = {
      avgLoadTime: 0,
      slowestRoutes: [],
      totalNavigations: 0,
      cacheHitRate: 0
    };
    this.renderPerformance(stats);
  }
  /**
   * 显示质量检查
   */
  showQuality() {
    this.show();
    const routes = this.getAllRoutes();
    const issues = codeQuality.codeQualityChecker.check({
      routes
    });
    this.renderQuality(issues);
  }
  /**
   * 获取所有路由
   */
  getAllRoutes() {
    return [];
  }
  /**
   * 渲染面板内容
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div style="padding: 10px; border-bottom: 1px solid #333;">
        <h3 style="margin: 0; color: #007acc;">LDesign Router DevTools</h3>
        <div style="margin-top: 5px;">
          <button onclick="window.ldesignRouterDevTools.showInspector()" style="margin-right: 10px;">\u68C0\u67E5\u5668</button>
          <button onclick="window.ldesignRouterDevTools.showPerformance()" style="margin-right: 10px;">\u6027\u80FD</button>
          <button onclick="window.ldesignRouterDevTools.showQuality()" style="margin-right: 10px;">\u8D28\u91CF</button>
        </div>
      </div>
      <div id="devtools-content" style="padding: 10px;"></div>
    `;
    window.ldesignRouterDevTools = this;
  }
  /**
   * 渲染检查器结果
   */
  renderInspector(result) {
    const content = document.getElementById("devtools-content");
    if (!content) return;
    content.innerHTML = `
      <h4>\u8DEF\u7531\u68C0\u67E5\u7ED3\u679C</h4>
      <div><strong>\u8DEF\u5F84:</strong> ${result.route.path}</div>
      <div><strong>\u540D\u79F0:</strong> ${result.route.name || "N/A"}</div>
      <div><strong>\u6027\u80FD\u8BC4\u5206:</strong> ${result.performance.cacheHit ? "\u826F\u597D" : "\u9700\u4F18\u5316"}</div>
      <div><strong>\u65E0\u969C\u788D\u8BC4\u5206:</strong> ${result.accessibility.score}/100</div>
      <div><strong>SEO\u8BC4\u5206:</strong> ${result.seo.score}/100</div>
      <div><strong>\u5B89\u5168\u8BC4\u5206:</strong> ${result.security.score}/100</div>
    `;
  }
  /**
   * 渲染性能数据
   */
  renderPerformance(stats) {
    const content = document.getElementById("devtools-content");
    if (!content) return;
    content.innerHTML = `
      <h4>\u6027\u80FD\u76D1\u63A7</h4>
      <div><strong>\u7F13\u5B58\u547D\u4E2D\u7387:</strong> ${(stats.monitor.hitRate * 100).toFixed(2)}%</div>
      <div><strong>\u7F13\u5B58\u5927\u5C0F:</strong> ${stats.memory.cacheSize}</div>
      <div><strong>\u5185\u5B58\u4F7F\u7528\u7387:</strong> ${(stats.memory.usageRatio * 100).toFixed(2)}%</div>
    `;
  }
  /**
   * 渲染质量检查结果
   */
  renderQuality(issues) {
    const content = document.getElementById("devtools-content");
    if (!content) return;
    content.innerHTML = `
      <h4>\u4EE3\u7801\u8D28\u91CF\u68C0\u67E5</h4>
      <div><strong>\u95EE\u9898\u603B\u6570:</strong> ${issues.length}</div>
      ${issues.map((issue) => `
        <div style="margin: 5px 0; padding: 5px; background: #333;">
          <div><strong>${issue.severity}:</strong> ${issue.message}</div>
          <div style="font-size: 11px; color: #ccc;">${issue.suggestion}</div>
        </div>
      `).join("")}
    `;
  }
  /**
   * 销毁开发工具
   */
  destroy() {
    if (this.container) {
      document.body.removeChild(this.container);
      this.container = null;
    }
    this.inspector.clearHighlight();
  }
}
function createDevTools(router, config) {
  return new DevToolsPanel(router, config);
}

exports.DevToolsPanel = DevToolsPanel;
exports.RouteInspector = RouteInspector;
exports.createDevTools = createDevTools;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=dev-tools.cjs.map
