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

class CodeSplittingManager {
  constructor(config) {
    this.config = config;
    this.loadStates = /* @__PURE__ */ new Map();
    this.componentCache = /* @__PURE__ */ new Map();
    this.metrics = [];
    this.preloadQueue = /* @__PURE__ */ new Set();
    this.loadingPromises = /* @__PURE__ */ new Map();
    this.chunkMap = /* @__PURE__ */ new Map();
    this.initializePreloadStrategy();
  }
  /**
   * 初始化预加载策略
   */
  initializePreloadStrategy() {
    if (this.config?.preloadStrategy === "visible") {
      this.setupIntersectionObserver();
    } else if (this.config?.preloadStrategy === "predictive") {
      this.setupPredictivePreloading();
    }
  }
  /**
   * 设置可见性观察器
   */
  setupIntersectionObserver() {
    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const routeName = entry.target.getAttribute("data-route");
            if (routeName) {
              this.preloadComponent(routeName);
            }
          }
        });
      }, {
        rootMargin: "50px"
      });
    }
  }
  /**
   * 设置预测性预加载
   */
  setupPredictivePreloading() {
    if (typeof window !== "undefined") {
      window.addEventListener("mouseover", (e) => {
        const target = e.target;
        const link = target.closest("[data-route]");
        if (link) {
          const routeName = link.getAttribute("data-route");
          if (routeName) {
            this.preloadComponent(routeName, "hover");
          }
        }
      });
    }
  }
  /**
   * 创建智能分割的路由
   */
  createSplitRoute(route) {
    if (!route.component || typeof route.component !== "function") {
      return route;
    }
    const originalComponent = route.component;
    const componentName = route.name?.toString() || route.path;
    const splitComponent = () => {
      return this.loadComponent(componentName, originalComponent);
    };
    return {
      ...route,
      component: splitComponent
    };
  }
  /**
   * 加载组件
   */
  async loadComponent(name, loader) {
    if (this.componentCache.has(name)) {
      this.recordMetrics(name, 0, true);
      return this.componentCache.get(name);
    }
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }
    const loadPromise = this.performLoad(name, loader);
    this.loadingPromises.set(name, loadPromise);
    try {
      const component = await loadPromise;
      this.loadingPromises.delete(name);
      return component;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }
  /**
   * 执行加载
   */
  async performLoad(name, loader) {
    const startTime = performance.now();
    let retries = 0;
    this.updateLoadState(name, {
      name,
      status: "loading",
      startTime,
      retries: 0
    });
    while (retries <= (this.config?.maxRetries || 3)) {
      try {
        const component = await loader();
        const loadTime = performance.now() - startTime;
        this.updateLoadState(name, {
          name,
          status: "loaded",
          loadTime
        });
        if (this.config?.cacheStrategy !== "storage") {
          this.componentCache.set(name, component);
        }
        this.recordMetrics(name, loadTime, false);
        return component;
      } catch (error) {
        retries++;
        if (retries > (this.config?.maxRetries || 3)) {
          this.updateLoadState(name, {
            name,
            status: "error",
            error,
            retries
          });
          throw error;
        }
        await this.delay(this.config?.retryDelay || 1e3 * retries);
      }
    }
    throw new Error(`Failed to load component: ${name}`);
  }
  /**
   * 预加载组件
   */
  async preloadComponent(name, _trigger) {
    if (this.componentCache.has(name) || this.preloadQueue.has(name)) {
      return;
    }
    this.preloadQueue.add(name);
    const chunkInfo = this.chunkMap.get(name);
    const priority = chunkInfo?.priority || "normal";
    if (priority === "critical") {
      await this.loadComponentByName(name);
    } else if (priority === "high") {
      this.requestIdleLoad(name);
    } else {
      setTimeout(() => this.loadComponentByName(name), 5e3);
    }
  }
  /**
   * 按名称加载组件
   */
  async loadComponentByName(_name) {
  }
  /**
   * 请求空闲加载
   */
  requestIdleLoad(name) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        this.loadComponentByName(name);
      });
    } else {
      setTimeout(() => this.loadComponentByName(name), 2e3);
    }
  }
  /**
   * 分析路由分割情况
   */
  analyzeRoutes(routes) {
    const chunks = [];
    let totalComponents = 0;
    let estimatedSize = 0;
    const analyzeRoute = (route, depth = 0) => {
      if (route.component) {
        totalComponents++;
        const chunkId = this.generateChunkId(route);
        const priority = this.determinePriority(route, depth);
        const size = this.estimateComponentSize(route);
        estimatedSize += size;
        chunks.push({
          id: chunkId,
          name: route.name?.toString() || route.path,
          routes: [route.path],
          components: [route.name?.toString() || "unnamed"],
          priority,
          estimatedSize: size,
          dependencies: []
        });
      }
      if (route.children) {
        route.children.forEach((child) => analyzeRoute(child, depth + 1));
      }
    };
    routes.forEach((route) => analyzeRoute(route));
    const suggestions = this.generateSuggestions(chunks, estimatedSize);
    return {
      totalComponents,
      chunks,
      estimatedSize,
      suggestions
    };
  }
  /**
   * 生成块ID
   */
  generateChunkId(route) {
    const strategy = this.config?.strategy;
    switch (strategy) {
      case "route":
        return `route-${route.name ? String(route.name) : route.path.replace(/\//g, "-")}`;
      case "module":
        return `module-${this.extractModuleName(route.path)}`;
      case "feature":
        return `feature-${this.extractFeatureName(route.path)}`;
      default:
        return `chunk-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  /**
   * 提取模块名
   */
  extractModuleName(path) {
    const segments = path.split("/");
    return segments[1] || "root";
  }
  /**
   * 提取功能名
   */
  extractFeatureName(path) {
    const segments = path.split("/");
    return segments.slice(1, 3).join("-") || "main";
  }
  /**
   * 确定优先级
   */
  determinePriority(route, depth) {
    if (depth === 0) return "critical";
    if (route.meta?.priority) return route.meta.priority;
    if (depth === 1) return "high";
    if (depth === 2) return "normal";
    return "low";
  }
  /**
   * 估算组件大小
   */
  estimateComponentSize(route) {
    let baseSize = 10;
    if (route.children?.length) {
      baseSize += route.children.length * 5;
    }
    if (route.components) {
      baseSize += Object.keys(route.components).length * 8;
    }
    return baseSize;
  }
  /**
   * 生成优化建议
   */
  generateSuggestions(chunks, totalSize) {
    const suggestions = [];
    chunks.forEach((chunk) => {
      if (chunk.estimatedSize > (this.config?.maxChunkSize || 244)) {
        suggestions.push(`\u5757 ${chunk.name} \u8FC7\u5927 (${chunk.estimatedSize}KB)\uFF0C\u5EFA\u8BAE\u8FDB\u4E00\u6B65\u5206\u5272`);
      }
      if (chunk.estimatedSize < (this.config?.minChunkSize || 10)) {
        suggestions.push(`\u5757 ${chunk.name} \u8FC7\u5C0F (${chunk.estimatedSize}KB)\uFF0C\u5EFA\u8BAE\u4E0E\u5176\u4ED6\u5757\u5408\u5E76`);
      }
    });
    const criticalChunks = chunks.filter((c) => c.priority === "critical");
    if (criticalChunks.length > 5) {
      suggestions.push("\u5173\u952E\u5757\u8FC7\u591A\uFF0C\u5EFA\u8BAE\u4F18\u5316\u9996\u5C4F\u52A0\u8F7D\u7B56\u7565");
    }
    if (totalSize > 1024) {
      suggestions.push(`\u5E94\u7528\u603B\u5927\u5C0F\u8FC7\u5927 (${totalSize}KB)\uFF0C\u5EFA\u8BAE\u542F\u7528\u66F4\u6FC0\u8FDB\u7684\u4EE3\u7801\u5206\u5272`);
    }
    const hasCircularDeps = this.checkCircularDependencies(chunks);
    if (hasCircularDeps) {
      suggestions.push("\u68C0\u6D4B\u5230\u5FAA\u73AF\u4F9D\u8D56\uFF0C\u5EFA\u8BAE\u91CD\u6784\u7EC4\u4EF6\u7ED3\u6784");
    }
    return suggestions;
  }
  /**
   * 检查循环依赖
   */
  checkCircularDependencies(chunks) {
    const visited = /* @__PURE__ */ new Set();
    const recursionStack = /* @__PURE__ */ new Set();
    const hasCycle = (chunkId) => {
      visited.add(chunkId);
      recursionStack.add(chunkId);
      const chunk = chunks.find((c) => c.id === chunkId);
      if (chunk) {
        for (const dep of chunk.dependencies) {
          if (!visited.has(dep)) {
            if (hasCycle(dep)) return true;
          } else if (recursionStack.has(dep)) {
            return true;
          }
        }
      }
      recursionStack.delete(chunkId);
      return false;
    };
    for (const chunk of chunks) {
      if (!visited.has(chunk.id)) {
        if (hasCycle(chunk.id)) return true;
      }
    }
    return false;
  }
  /**
   * 更新加载状态
   */
  updateLoadState(name, state) {
    this.loadStates.set(name, state);
  }
  /**
   * 记录性能指标
   */
  recordMetrics(name, loadTime, cacheHit) {
    this.metrics.push({
      componentName: name,
      loadTime,
      cacheHit
    });
    if (this.metrics.length > 1e3) {
      this.metrics = this.metrics.slice(-500);
    }
  }
  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * 获取加载统计
   */
  getLoadStatistics() {
    const loaded = Array.from(this.loadStates.values());
    const totalLoaded = loaded.filter((s) => s.status === "loaded").length;
    const totalFailed = loaded.filter((s) => s.status === "error").length;
    const totalCached = this.componentCache.size;
    const loadTimes = this.metrics.filter((m) => !m.cacheHit).map((m) => m.loadTime);
    const averageLoadTime = loadTimes.length ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0;
    const cacheHits = this.metrics.filter((m) => m.cacheHit).length;
    const cacheHitRate = this.metrics.length ? cacheHits / this.metrics.length : 0;
    const failureRate = loaded.length ? totalFailed / loaded.length : 0;
    return {
      totalLoaded,
      totalCached,
      averageLoadTime,
      cacheHitRate,
      failureRate
    };
  }
  /**
   * 清理资源
   */
  dispose() {
    this.intersectionObserver?.disconnect();
    this.loadStates.clear();
    this.componentCache.clear();
    this.metrics = [];
    this.preloadQueue.clear();
    this.loadingPromises.clear();
    this.chunkMap.clear();
  }
}
function createCodeSplittingManager(config) {
  const defaultConfig = {
    strategy: "route",
    maxChunkSize: 244,
    minChunkSize: 10,
    maxConcurrentLoads: 3,
    preloadStrategy: "lazy",
    cacheStrategy: "memory",
    maxRetries: 3,
    retryDelay: 1e3
  };
  return new CodeSplittingManager({
    ...defaultConfig,
    ...config
  });
}
const CodeSplittingPlugin = {
  install(app, options) {
    const manager = createCodeSplittingManager(options);
    app.provide("codeSplittingManager", manager);
    app.config.globalProperties.$codeSplitting = manager;
    app.unmount = new Proxy(app.unmount, {
      apply(target, thisArg, argArray) {
        manager.dispose();
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
};

exports.CodeSplittingManager = CodeSplittingManager;
exports.CodeSplittingPlugin = CodeSplittingPlugin;
exports.createCodeSplittingManager = createCodeSplittingManager;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
