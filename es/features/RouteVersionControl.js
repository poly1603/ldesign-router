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

class RouteVersionControl {
  constructor(router, config) {
    this.versions = /* @__PURE__ */ new Map();
    this.currentVersionId = null;
    this.state = reactive({
      versions: [],
      currentVersion: null,
      isDirty: false,
      isLoading: false
    });
    this.router = router;
    this.config = {
      maxVersions: 20,
      autoSave: false,
      autoSaveInterval: 5 * 60 * 1e3,
      // 5分钟
      compression: true,
      storage: "memory",
      ...config
    };
    this.initialize();
  }
  /**
   * 初始化版本控制
   */
  async initialize() {
    await this.loadVersions();
    if (this.versions.size === 0) {
      await this.createVersion("initial", "Initial route configuration");
    }
    if (this.config?.autoSave) {
      this.startAutoSave();
    }
    this.watchRouteChanges();
  }
  /**
   * 创建新版本
   */
  async createVersion(name, description) {
    const id = this.generateVersionId();
    const routes = this.captureCurrentRoutes();
    const version = {
      id,
      name,
      description,
      createdAt: /* @__PURE__ */ new Date(),
      routes: this.config?.compression ? this.compressRoutes(routes) : routes,
      metadata: this.analyzeRoutes(routes)
    };
    if (this.versions.size >= this.config?.maxVersions) {
      this.removeOldestVersion();
    }
    this.versions.set(id, version);
    this.currentVersionId = id;
    this.updateState();
    await this.saveVersion(version);
    this.state.isDirty = false;
    return version;
  }
  /**
   * 恢复到指定版本
   */
  async restoreVersion(versionId) {
    const version = this.versions.get(versionId);
    if (!version) {
      console.error(`Version ${versionId} not found`);
      return false;
    }
    this.state.isLoading = true;
    try {
      const routes = this.config?.compression ? this.decompressRoutes(version.routes) : version.routes;
      this.clearCurrentRoutes();
      for (const route of routes) {
        this.router.addRoute(route);
      }
      this.currentVersionId = versionId;
      this.updateState();
      this.state.isDirty = false;
      return true;
    } catch (error) {
      console.error("Failed to restore version:", error);
      return false;
    } finally {
      this.state.isLoading = false;
    }
  }
  /**
   * 删除版本
   */
  async deleteVersion(versionId) {
    if (versionId === this.currentVersionId) {
      console.error("Cannot delete current version");
      return false;
    }
    const deleted = this.versions.delete(versionId);
    if (deleted) {
      await this.removeFromStorage(versionId);
      this.updateState();
    }
    return deleted;
  }
  /**
   * 比较两个版本
   */
  compareVersions(versionId1, versionId2) {
    const version1 = this.versions.get(versionId1);
    const version2 = this.versions.get(versionId2);
    if (!version1 || !version2) {
      return null;
    }
    const routes1 = this.config?.compression ? this.decompressRoutes(version1.routes) : version1.routes;
    const routes2 = this.config?.compression ? this.decompressRoutes(version2.routes) : version2.routes;
    return this.diffRoutes(routes1, routes2);
  }
  /**
   * 获取版本历史
   */
  getVersionHistory() {
    return Array.from(this.versions.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  /**
   * 获取当前版本
   */
  getCurrentVersion() {
    if (!this.currentVersionId) return null;
    return this.versions.get(this.currentVersionId) || null;
  }
  /**
   * 导出版本
   */
  exportVersion(versionId) {
    const version = this.versions.get(versionId);
    if (!version) return null;
    return JSON.stringify(version, null, 2);
  }
  /**
   * 导入版本
   */
  async importVersion(data) {
    try {
      const version = JSON.parse(data);
      if (!this.validateVersion(version)) {
        throw new Error("Invalid version format");
      }
      version.id = this.generateVersionId();
      version.createdAt = new Date(version.createdAt);
      this.versions.set(version.id, version);
      await this.saveVersion(version);
      this.updateState();
      return true;
    } catch (error) {
      console.error("Failed to import version:", error);
      return false;
    }
  }
  /**
   * 创建分支版本
   */
  async createBranch(baseVersionId, branchName) {
    const baseVersion = this.versions.get(baseVersionId);
    if (!baseVersion) return null;
    const branchVersion = {
      ...baseVersion,
      id: this.generateVersionId(),
      name: branchName,
      description: `Branch from ${baseVersion.name}`,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.versions.set(branchVersion.id, branchVersion);
    await this.saveVersion(branchVersion);
    this.updateState();
    return branchVersion;
  }
  /**
   * 合并版本
   */
  async mergeVersions(sourceId, targetId, strategy = "merge") {
    const source = this.versions.get(sourceId);
    const target = this.versions.get(targetId);
    if (!source || !target) return null;
    const sourceRoutes = this.config?.compression ? this.decompressRoutes(source.routes) : source.routes;
    const targetRoutes = this.config?.compression ? this.decompressRoutes(target.routes) : target.routes;
    let mergedRoutes;
    if (strategy === "override") {
      mergedRoutes = sourceRoutes;
    } else {
      mergedRoutes = this.mergeRoutes(targetRoutes, sourceRoutes);
    }
    const mergedVersion = {
      id: this.generateVersionId(),
      name: `Merge: ${source.name} -> ${target.name}`,
      description: `Merged ${source.name} into ${target.name}`,
      createdAt: /* @__PURE__ */ new Date(),
      routes: this.config?.compression ? this.compressRoutes(mergedRoutes) : mergedRoutes,
      metadata: this.analyzeRoutes(mergedRoutes)
    };
    this.versions.set(mergedVersion.id, mergedVersion);
    await this.saveVersion(mergedVersion);
    this.updateState();
    return mergedVersion;
  }
  // ==================== 私有方法 ====================
  /**
   * 生成版本ID
   */
  generateVersionId() {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * 捕获当前路由配置
   */
  captureCurrentRoutes() {
    return this.router.getRoutes().map((route) => this.routeToRaw(route));
  }
  /**
   * 将路由记录转换为原始格式
   */
  routeToRaw(route) {
    return {
      path: route.path,
      name: route.name,
      component: route.component,
      meta: route.meta,
      props: route.props,
      children: route.children?.map((child) => this.routeToRaw(child))
    };
  }
  /**
   * 清除当前路由
   */
  clearCurrentRoutes() {
    const routes = this.router.getRoutes();
    routes.forEach((route) => {
      if (route.name) {
        this.router.removeRoute(route.name);
      }
    });
  }
  /**
   * 分析路由配置
   */
  analyzeRoutes(routes) {
    let dynamicCount = 0;
    let maxDepth = 0;
    const analyze = (route, depth = 0) => {
      if (route.path.includes(":") || route.path.includes("*")) {
        dynamicCount++;
      }
      maxDepth = Math.max(maxDepth, depth);
      route.children?.forEach((child) => analyze(child, depth + 1));
    };
    routes.forEach((route) => analyze(route));
    return {
      routeCount: routes.length,
      dynamicRouteCount: dynamicCount,
      maxDepth
    };
  }
  /**
   * 比较路由差异
   */
  diffRoutes(routes1, routes2) {
    const map1 = new Map(routes1.map((r) => [r.path, r]));
    const map2 = new Map(routes2.map((r) => [r.path, r]));
    const added = [];
    const removed = [];
    const modified = [];
    for (const [path, route] of map2) {
      if (!map1.has(path)) {
        added.push(route);
      } else {
        const oldRoute = map1.get(path);
        const changes = this.detectChanges(oldRoute, route);
        if (changes.length > 0) {
          modified.push({
            before: oldRoute,
            after: route,
            changes
          });
        }
      }
    }
    for (const [path, route] of map1) {
      if (!map2.has(path)) {
        removed.push(route);
      }
    }
    return {
      added,
      removed,
      modified,
      totalChanges: added.length + removed.length + modified.length
    };
  }
  /**
   * 检测路由变化
   */
  detectChanges(route1, route2) {
    const changes = [];
    if (route1.name !== route2.name) {
      changes.push(`name: ${String(route1.name)} -> ${String(route2.name)}`);
    }
    if (JSON.stringify(route1.meta) !== JSON.stringify(route2.meta)) {
      changes.push("meta changed");
    }
    if (JSON.stringify(route1.props) !== JSON.stringify(route2.props)) {
      changes.push("props changed");
    }
    if (route1.component !== route2.component) {
      changes.push("component changed");
    }
    return changes;
  }
  /**
   * 合并路由
   */
  mergeRoutes(target, source) {
    const merged = [...target];
    const targetPaths = new Set(target.map((r) => r.path));
    for (const route of source) {
      if (!targetPaths.has(route.path)) {
        merged.push(route);
      }
    }
    return merged;
  }
  /**
   * 压缩路由（简单实现）
   */
  compressRoutes(routes) {
    return routes;
  }
  /**
   * 解压路由
   */
  decompressRoutes(compressed) {
    return compressed;
  }
  /**
   * 监听路由变化
   */
  watchRouteChanges() {
    this.router.afterEach(() => {
      this.state.isDirty = true;
    });
  }
  /**
   * 开始自动保存
   */
  startAutoSave() {
    this.autoSaveTimer = window.setInterval(() => {
      if (this.state.isDirty) {
        this.createVersion(`auto_${(/* @__PURE__ */ new Date()).toISOString()}`, "Auto-saved version");
      }
    }, this.config?.autoSaveInterval);
  }
  /**
   * 停止自动保存
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = void 0;
    }
  }
  /**
   * 更新响应式状态
   */
  updateState() {
    this.state.versions = this.getVersionHistory();
    this.state.currentVersion = this.getCurrentVersion();
  }
  /**
   * 移除最旧的版本
   */
  removeOldestVersion() {
    const versions = this.getVersionHistory();
    if (versions.length > 0) {
      const oldest = versions[versions.length - 1];
      if (oldest) this.deleteVersion(oldest.id);
    }
  }
  /**
   * 验证版本格式
   */
  validateVersion(version) {
    return version && typeof version.id === "string" && typeof version.name === "string" && Array.isArray(version.routes);
  }
  // ==================== 存储相关方法 ====================
  /**
   * 加载版本
   */
  async loadVersions() {
    if (this.config?.storage === "localStorage") {
      const data = localStorage.getItem("router_versions");
      if (data) {
        try {
          const versions = JSON.parse(data);
          versions.forEach((v) => {
            v.createdAt = new Date(v.createdAt);
            this.versions.set(v.id, v);
          });
        } catch (error) {
          console.error("Failed to load versions:", error);
        }
      }
    }
  }
  /**
   * 保存版本
   */
  async saveVersion(_version) {
    if (this.config?.storage === "localStorage") {
      const versions = Array.from(this.versions.values());
      localStorage.setItem("router_versions", JSON.stringify(versions));
    }
  }
  /**
   * 从存储中删除版本
   */
  async removeFromStorage(versionId) {
    if (this.config?.storage === "localStorage") {
      const versions = Array.from(this.versions.values()).filter((v) => v.id !== versionId);
      localStorage.setItem("router_versions", JSON.stringify(versions));
    }
  }
  /**
   * 清理资源
   */
  destroy() {
    this.stopAutoSave();
    this.versions.clear();
  }
}
let defaultVersionControl = null;
function setupRouteVersionControl(router, config) {
  if (!defaultVersionControl) {
    defaultVersionControl = new RouteVersionControl(router, config);
  }
  return defaultVersionControl;
}
function getVersionControl() {
  return defaultVersionControl;
}
async function createRouteVersion(name, description) {
  if (!defaultVersionControl) {
    console.error("Route version control not initialized");
    return null;
  }
  return defaultVersionControl.createVersion(name, description);
}
async function restoreRouteVersion(versionId) {
  if (!defaultVersionControl) {
    console.error("Route version control not initialized");
    return false;
  }
  return defaultVersionControl.restoreVersion(versionId);
}

export { RouteVersionControl, createRouteVersion, getVersionControl, restoreRouteVersion, setupRouteVersionControl };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouteVersionControl.js.map
