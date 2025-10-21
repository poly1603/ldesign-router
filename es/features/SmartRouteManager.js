/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { reactive } from 'vue';

class AutoRouteGenerator {
  constructor(config = {}) {
    this.routes = [];
    this.fileRouteMap = /* @__PURE__ */ new Map();
    this._config = {
      enabled: true,
      pagesDir: "src/pages",
      excludes: ["components", "utils", "hooks"],
      layouts: {},
      importMode: "async",
      ...config
    };
  }
  // 从文件系统生成路�?
  async generateFromFileSystem() {
    if (!this._config?.enabled) return [];
    const pagesDir = this._config?.pagesDir || "src/pages";
    const files = await this.scanDirectory(pagesDir);
    for (const file of files) {
      const route = this.fileToRoute(file);
      if (route) {
        this.routes.push(route);
        this.fileRouteMap.set(file, route);
      }
    }
    this.routes = this.nestRoutes(this.routes);
    this.routes = this.applyLayouts(this.routes);
    return this.routes;
  }
  // 扫描目录（模拟实现）
  async scanDirectory(_dir) {
    return ["src/pages/index.vue", "src/pages/about.vue", "src/pages/users/index.vue", "src/pages/users/[id].vue", "src/pages/users/[id]/edit.vue", "src/pages/admin/index.vue", "src/pages/admin/dashboard.vue", "src/pages/admin/settings.vue", "src/pages/[...404].vue"];
  }
  // 文件路径转路�?
  fileToRoute(file) {
    if (this._config?.excludes?.some((exc) => file.includes(exc))) {
      return null;
    }
    const relativePath = file.replace(`${this._config?.pagesDir}/`, "").replace(/\.(vue|tsx?|jsx?)$/, "");
    let path = `/${relativePath.replace(/index$/, "").replace(/\[\.\.\.(.+)\]/, ":$1(.*)").replace(/\[(.+)\]/g, ":$1").replace(/\/+$/, "")}`;
    if (path === "/") path = "";
    const name = relativePath.replace(/\//g, "-").replace(/[[\].]/g, "");
    const component = () => import(
      /* @vite-ignore */
      file
    );
    return {
      path,
      name,
      component,
      meta: {
        file,
        generated: true
      }
    };
  }
  // 处理嵌套路由
  nestRoutes(routes) {
    const nested = [];
    const routeMap = /* @__PURE__ */ new Map();
    routes.sort((a, b) => a.path.split("/").length - b.path.split("/").length);
    for (const route of routes) {
      const segments = route.path.split("/").filter(Boolean);
      if (segments.length === 0 || segments.length === 1) {
        nested.push(route);
        routeMap.set(route.path, route);
      } else {
        const parentPath = `/${segments.slice(0, -1).join("/")}`;
        const parent = routeMap.get(parentPath);
        if (parent) {
          if (!parent.children) parent.children = [];
          route.path = segments[segments.length - 1] || "";
          parent.children.push(route);
        } else {
          nested.push(route);
          routeMap.set(route.path, route);
        }
      }
    }
    return nested;
  }
  // 应用布局
  applyLayouts(routes) {
    const layoutGroups = /* @__PURE__ */ new Map();
    for (const route of routes) {
      const layoutName = this.determineLayout(route);
      if (layoutName && this._config?.layouts?.[layoutName]) {
        if (!layoutGroups.has(layoutName)) {
          layoutGroups.set(layoutName, []);
        }
        layoutGroups.get(layoutName).push(route);
      }
    }
    const result = [];
    for (const [layoutName, groupRoutes] of layoutGroups) {
      result.push({
        path: "",
        component: this._config?.layouts[layoutName],
        children: groupRoutes
      });
    }
    routes.forEach((route) => {
      const hasLayout = Array.from(layoutGroups.values()).flat().includes(route);
      if (!hasLayout) {
        result.push(route);
      }
    });
    return result;
  }
  // 确定路由使用的布局
  determineLayout(route) {
    if (route.path.startsWith("/admin")) return "admin";
    if (route.path.startsWith("/auth")) return "auth";
    return "default";
  }
  // 添加路由
  addRoute(route) {
    this.routes.push(route);
  }
  // 移除路由
  removeRoute(name) {
    const index = this.routes.findIndex((r) => r.name === name);
    if (index !== -1) {
      this.routes.splice(index, 1);
    }
  }
  // 获取所有路�?
  getRoutes() {
    return this.routes;
  }
}
class DynamicRouteLoader {
  constructor(router, config = {}) {
    this.router = router;
    this.loadedRoutes = /* @__PURE__ */ new Map();
    this.loadingPromises = /* @__PURE__ */ new Map();
    this.retryCount = /* @__PURE__ */ new Map();
    this._config = {
      enabled: true,
      cache: true,
      retry: 3,
      ...config
    };
  }
  // 动态加载路�?
  async loadRoute(path) {
    if (!this._config?.enabled || !this._config?.loader) return null;
    if (this._config?.cache && this.loadedRoutes.has(path)) {
      return this.loadedRoutes.get(path);
    }
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }
    const loadPromise = this.createLoadPromise(path);
    this.loadingPromises.set(path, loadPromise);
    try {
      const route = await loadPromise;
      if (this._config?.cache) {
        this.loadedRoutes.set(path, route);
      }
      this.router.addRoute(route);
      this.loadingPromises.delete(path);
      return route;
    } catch (error) {
      this.loadingPromises.delete(path);
      if (this.shouldRetry(path)) {
        this.retryCount.set(path, (this.retryCount.get(path) || 0) + 1);
        return this.loadRoute(path);
      }
      throw error;
    }
  }
  // 创建加载 Promise
  async createLoadPromise(path) {
    try {
      const route = await this._config?.loader(path);
      if (!route) {
        throw new Error(`Route loader returned null for path: ${path}`);
      }
      return route;
    } catch (error) {
      console.error(`Failed to load dynamic route: ${path}`, error);
      throw error;
    }
  }
  // 判断是否应该重试
  shouldRetry(path) {
    const count = this.retryCount.get(path) || 0;
    return count < (this._config?.retry || 3);
  }
  // 批量加载路由
  async loadRoutes(paths) {
    const promises = paths.map((path) => this.loadRoute(path));
    const results = await Promise.allSettled(promises);
    return results.filter((result) => result.status === "fulfilled").map((result) => result.value).filter((route) => route !== null);
  }
  // 预加载路�?
  preloadRoute(path) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => this.loadRoute(path));
    } else {
      setTimeout(() => this.loadRoute(path), 1e3);
    }
  }
  // 清除缓存
  clearCache() {
    this.loadedRoutes.clear();
    this.retryCount.clear();
  }
}
class NestedRouteOptimizer {
  constructor(config = {}) {
    this._config = {
      enabled: true,
      maxDepth: 5,
      flattenSingleChild: true,
      mergeParams: true,
      ...config
    };
  }
  // 优化嵌套路由
  optimizeRoutes(routes) {
    if (!this._config?.enabled) return routes;
    return routes.map((route) => this.optimizeRoute(route));
  }
  // 优化单个路由
  optimizeRoute(route, depth = 0) {
    if (depth >= (this._config?.maxDepth || 5)) {
      console.warn(`Route nesting depth exceeded: ${route.path}`);
      return route;
    }
    const optimized = {
      ...route
    };
    if (optimized.children && optimized.children.length > 0) {
      if (this._config?.flattenSingleChild && optimized.children.length === 1) {
        const child = optimized.children[0];
        if (!optimized.component || optimized.component === child?.component) {
          return {
            ...child,
            path: this.combinePaths(optimized.path, child?.path || ""),
            meta: {
              ...optimized.meta,
              ...child?.meta
            }
          };
        }
      }
      optimized.children = optimized.children.map((child) => this.optimizeRoute(child, depth + 1));
      if (this._config?.mergeParams) {
        optimized.children = this.mergeChildParams(optimized, optimized.children);
      }
    }
    return optimized;
  }
  // 合并路径
  combinePaths(parent, child) {
    if (child.startsWith("/")) return child;
    const parentPath = parent.endsWith("/") ? parent.slice(0, -1) : parent;
    const childPath = child.startsWith("/") ? child.slice(1) : child;
    return `${parentPath}/${childPath}`;
  }
  // 合并子路由参�?
  mergeChildParams(parent, children) {
    const parentParams = this.extractParams(parent.path);
    return children.map((child) => {
      const childParams = this.extractParams(child.path);
      const duplicates = parentParams.filter((p) => childParams.includes(p));
      if (duplicates.length > 0) {
        console.warn(`Duplicate params in nested route: ${duplicates.join(", ")}`);
      }
      return {
        ...child,
        meta: {
          ...child.meta,
          inheritedParams: parentParams
        }
      };
    });
  }
  // 提取路径参数
  extractParams(path) {
    const matches = path.match(/:([^/]+)/g) || [];
    return matches.map((m) => m.slice(1));
  }
}
class RouteGroupManager {
  constructor(config = {}) {
    this.groups = /* @__PURE__ */ new Map();
    this.routeGroupMap = /* @__PURE__ */ new Map();
    this._config = {
      enabled: true,
      groups: [],
      defaultGroup: "default",
      ...config
    };
    this._config?.groups?.forEach((group) => {
      this.addGroup(group);
    });
  }
  // 添加分组
  addGroup(group) {
    this.groups.set(group.name, group);
  }
  // 移除分组
  removeGroup(name) {
    this.groups.delete(name);
    for (const [route, groupName] of this.routeGroupMap) {
      if (groupName === name) {
        this.routeGroupMap.delete(route);
      }
    }
  }
  // 将路由分�?
  groupRoutes(routes) {
    const grouped = /* @__PURE__ */ new Map();
    const sortedGroups = Array.from(this.groups.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
    for (const route of routes) {
      const groupName = this.determineGroup(route, sortedGroups);
      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      grouped.get(groupName).push(this.applyGroupSettings(route, groupName));
      this.routeGroupMap.set(route.name, groupName);
    }
    return grouped;
  }
  // 确定路由所属分�?
  determineGroup(route, groups) {
    for (const group of groups) {
      if (this.matchesGroup(route, group)) {
        return group.name;
      }
    }
    return this._config?.defaultGroup || "default";
  }
  // 检查路由是否匹配分�?
  matchesGroup(route, group) {
    if (group.pattern) {
      const pattern = typeof group.pattern === "string" ? new RegExp(group.pattern) : group.pattern;
      if (pattern.test(route.path)) {
        return true;
      }
    }
    if (group.prefix && route.path.startsWith(group.prefix)) {
      return true;
    }
    return false;
  }
  // 应用分组设置
  applyGroupSettings(route, groupName) {
    const group = this.groups.get(groupName);
    if (!group) return route;
    const applied = {
      ...route
    };
    if (group.layout && !applied.component) {
      applied.component = group.layout;
    }
    if (group.meta) {
      applied.meta = {
        ...group.meta,
        ...applied.meta,
        group: groupName
      };
    }
    if (group.guard) {
      const originalBeforeEnter = applied.beforeEnter;
      applied.beforeEnter = async (to, from, next) => {
        const groupResult = await group.guard(to, from, next);
        if (groupResult === false) {
          return false;
        }
        if (originalBeforeEnter) {
          return Array.isArray(originalBeforeEnter) ? originalBeforeEnter[0]?.(to, from, next) : originalBeforeEnter(to, from, next);
        }
        return true;
      };
    }
    return applied;
  }
  // 获取分组信息
  getGroup(name) {
    return this.groups.get(name);
  }
  // 获取路由所属分�?
  getRouteGroup(routeName) {
    return this.routeGroupMap.get(routeName);
  }
  // 获取分组下的所有路�?
  getGroupRoutes(groupName, routes) {
    return routes.filter((route) => this.routeGroupMap.get(route.name) === groupName);
  }
}
class SmartRouteManager {
  constructor(router, config = {}) {
    this.state = reactive({
      routes: [],
      groups: /* @__PURE__ */ new Map(),
      loading: false,
      error: null
    });
    this.router = router;
    this.autoGenerator = new AutoRouteGenerator(config.autoGenerate);
    this.dynamicLoader = new DynamicRouteLoader(router, config.dynamic);
    this.nestedOptimizer = new NestedRouteOptimizer(config.nested);
    this.groupManager = new RouteGroupManager(config.grouping);
  }
  // 初始�?
  async initialize() {
    this.state.loading = true;
    this.state.error = null;
    try {
      const generatedRoutes = await this.autoGenerator.generateFromFileSystem();
      const optimizedRoutes = this.nestedOptimizer.optimizeRoutes(generatedRoutes);
      const groupedRoutes = this.groupManager.groupRoutes(optimizedRoutes);
      for (const routes of groupedRoutes.values()) {
        routes.forEach((route) => this.router.addRoute(route));
      }
      this.state.routes = optimizedRoutes;
      this.state.groups = groupedRoutes;
    } catch (error) {
      this.state.error = error;
      console.error("Failed to initialize smart route manager:", error);
    } finally {
      this.state.loading = false;
    }
  }
  // 动态添加路�?
  async addDynamicRoute(path) {
    const route = await this.dynamicLoader.loadRoute(path);
    if (route) {
      const optimized = this.nestedOptimizer.optimizeRoutes([route])[0];
      if (!optimized) return;
      const grouped = this.groupManager.groupRoutes([optimized]);
      if (optimized) this.state.routes.push(optimized);
      for (const [groupName, routes] of grouped) {
        if (!this.state.groups.has(groupName)) {
          this.state.groups.set(groupName, []);
        }
        this.state.groups.get(groupName).push(...routes);
      }
    }
  }
  // 批量添加动态路�?
  async addDynamicRoutes(paths) {
    const routes = await this.dynamicLoader.loadRoutes(paths);
    if (routes.length > 0) {
      const optimized = this.nestedOptimizer.optimizeRoutes(routes);
      const grouped = this.groupManager.groupRoutes(optimized);
      this.state.routes.push(...optimized);
      for (const [groupName, groupRoutes] of grouped) {
        if (!this.state.groups.has(groupName)) {
          this.state.groups.set(groupName, []);
        }
        this.state.groups.get(groupName).push(...groupRoutes);
      }
    }
  }
  // 获取路由统计
  getStatistics() {
    const stats = {
      total: this.state.routes.length,
      groups: this.state.groups.size,
      dynamic: 0,
      nested: 0,
      maxDepth: 0
    };
    for (const route of this.state.routes) {
      if (route.meta?.generated) stats.dynamic++;
      const depth = this.calculateDepth(route);
      if (depth > 0) stats.nested++;
      if (depth > stats.maxDepth) stats.maxDepth = depth;
    }
    return stats;
  }
  // 计算路由深度
  calculateDepth(route, depth = 0) {
    if (!route.children || route.children.length === 0) {
      return depth;
    }
    return Math.max(...route.children.map((child) => this.calculateDepth(child, depth + 1)));
  }
  // 查找路由
  findRoute(predicate) {
    return this.state.routes.find(predicate);
  }
  // 按组获取路由
  getRoutesByGroup(groupName) {
    return this.state.groups.get(groupName) || [];
  }
  // 清理
  clear() {
    this.dynamicLoader.clearCache();
    this.state.routes = [];
    this.state.groups.clear();
  }
}
let defaultManager = null;
function setupSmartRouteManager(router, config) {
  if (!defaultManager) {
    defaultManager = new SmartRouteManager(router, config);
    defaultManager.initialize();
  }
  return defaultManager;
}
function getRouteStatistics() {
  return defaultManager?.getStatistics() || null;
}
function addDynamicRoute(path) {
  if (!defaultManager) {
    throw new Error("Smart route manager not initialized");
  }
  return defaultManager.addDynamicRoute(path);
}

export { AutoRouteGenerator, DynamicRouteLoader, NestedRouteOptimizer, RouteGroupManager, SmartRouteManager, addDynamicRoute, getRouteStatistics, setupSmartRouteManager };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=SmartRouteManager.js.map
