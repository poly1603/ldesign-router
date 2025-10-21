/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import process from 'node:process';
import { asyncPool } from '../utils/index.js';

class ModuleLoader {
  constructor() {
    this.modules = /* @__PURE__ */ new Map();
    this.loadingPromises = /* @__PURE__ */ new Map();
    this.dependencies = /* @__PURE__ */ new Map();
    this.priorities = /* @__PURE__ */ new Map();
    this.loadingStats = /* @__PURE__ */ new Map();
    this.maxRetries = 3;
    this.retryDelay = 1e3;
    this.maxStatsEntries = 50;
    this.statsCleanupThreshold = 100;
  }
  // 当统计信息超过100条时触发清理
  /**
   * 加载模块并返回数据
   */
  async load(name) {
    if (this.modules.has(name)) {
      const module = this.modules.get(name);
      if (!module) throw new Error(`Module ${name} not found`);
      return module.getData();
    }
    if (this.loadingPromises.has(name)) {
      const promise = this.loadingPromises.get(name);
      if (!promise) throw new Error(`Loading promise for ${name} not found`);
      return promise;
    }
    const loadingPromise = this.loadModule(name);
    this.loadingPromises.set(name, loadingPromise);
    try {
      const module = await loadingPromise;
      this.modules.set(name, module);
      this.loadingPromises.delete(name);
      return module.getData();
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }
  /**
   * 加载模块并返回模块实例
   */
  async loadModuleInstance(name) {
    if (this.modules.has(name)) {
      const module = this.modules.get(name);
      if (!module) throw new Error(`Module ${name} not found`);
      return module;
    }
    if (this.loadingPromises.has(name)) {
      const promise = this.loadingPromises.get(name);
      if (promise) await promise;
      const module = this.modules.get(name);
      if (!module) throw new Error(`Module ${name} not found after loading`);
      return module;
    }
    const loadingPromise = this.loadModule(name);
    this.loadingPromises.set(name, loadingPromise);
    try {
      const module = await loadingPromise;
      this.modules.set(name, module);
      this.loadingPromises.delete(name);
      return module;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }
  /**
   * 卸载模块
   */
  async unload(name) {
    const module = this.modules.get(name);
    if (!module) return;
    try {
      await module.destroy();
    } catch (error) {
      console.error(`Error destroying module "${name}":`, error);
    } finally {
      this.modules.delete(name);
    }
  }
  /**
   * 检查模块是否已加载
   */
  isLoaded(name) {
    return this.modules.has(name);
  }
  /**
   * 获取已加载的模块
   */
  getModule(name) {
    return this.modules.get(name);
  }
  /**
   * 获取所有已加载的模块名称
   */
  getLoadedModules() {
    return Array.from(this.modules.keys());
  }
  /**
   * 卸载模块（别名方法，用于测试兼容性）
   */
  async unloadModule(name) {
    return this.unload(name);
  }
  /**
   * 卸载所有模块
   */
  async unloadAll() {
    const unloadPromises = Array.from(this.modules.keys()).map((name) => this.unload(name));
    await Promise.all(unloadPromises);
  }
  /**
   * 卸载所有模块（别名方法，用于测试兼容性）
   */
  async unloadAllModules() {
    return this.unloadAll();
  }
  /**
   * 检查模块是否已加载（别名方法，用于测试兼容性）
   */
  isModuleLoaded(name) {
    return this.isLoaded(name);
  }
  /**
   * 获取模块加载统计信息
   */
  getLoadingStats(name) {
    if (name) {
      return this.loadingStats.get(name);
    }
    return Object.fromEntries(this.loadingStats.entries());
  }
  /**
   * 清理统计信息
   *
   * 优化: 防止统计信息无限增长
   */
  clearStats(name) {
    if (name) {
      this.loadingStats.delete(name);
    } else {
      this.loadingStats.clear();
    }
  }
  /**
   * 清理旧的统计信息
   *
   * 当统计信息过多时,只保留最近使用的模块统计（优化版本）
   */
  cleanupOldStats() {
    if (this.loadingStats.size <= this.statsCleanupThreshold) {
      return;
    }
    const entries = Array.from(this.loadingStats.entries());
    entries.sort((a, b) => b[1].lastLoadTime - a[1].lastLoadTime);
    this.loadingStats.clear();
    const keepCount = Math.min(this.maxStatsEntries, entries.length);
    for (let i = 0; i < keepCount; i++) {
      const [name, stats] = entries[i];
      this.loadingStats.set(name, stats);
    }
  }
  /**
   * 实际加载模块的方法
   */
  async loadModule(name) {
    const startTime = performance.now();
    let retries = 0;
    while (retries <= this.maxRetries) {
      try {
        let module;
        switch (name) {
          case "network":
            module = await this.loadNetworkModule();
            break;
          case "battery":
            module = await this.loadBatteryModule();
            break;
          case "geolocation":
            module = await this.loadGeolocationModule();
            break;
          case "feature":
            module = await this.loadFeatureDetectionModule();
            break;
          case "performance":
            module = await this.loadPerformanceModule();
            break;
          case "media":
            module = await this.loadMediaModule();
            break;
          default:
            throw new Error(`Unknown module: ${name}`);
        }
        this.updateLoadingStats(name, Math.max(1, performance.now() - startTime), false);
        return module;
      } catch (error) {
        if (error instanceof Error && /Unknown module:/.test(error.message)) {
          this.updateLoadingStats(name, Math.max(1, performance.now() - startTime), true);
          throw error;
        }
        retries++;
        this.updateLoadingStats(name, Math.max(1, performance.now() - startTime), true);
        if (retries > this.maxRetries) {
          throw new Error(`Failed to load module "${name}" after ${this.maxRetries} retries: ${error}`);
        }
        const delay = typeof process !== "undefined" && process.env && process.env.VITEST ? 10 * retries : this.retryDelay * retries;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to load module "${name}"`);
  }
  /**
   * 加载网络信息模块
   */
  async loadNetworkModule() {
    const {
      NetworkModule
    } = await import('../modules/NetworkModule.js');
    const module = new NetworkModule();
    await module.init();
    return module;
  }
  /**
   * 加载电池信息模块
   */
  async loadBatteryModule() {
    const {
      BatteryModule
    } = await import('../modules/BatteryModule.js');
    const module = new BatteryModule();
    await module.init();
    return module;
  }
  /**
   * 加载地理位置模块
   */
  async loadGeolocationModule() {
    const {
      GeolocationModule
    } = await import('../modules/GeolocationModule.js');
    const module = new GeolocationModule();
    await module.init();
    return module;
  }
  /**
   * 加载特性检测模块
   */
  async loadFeatureDetectionModule() {
    const {
      FeatureDetectionModule
    } = await import('../modules/FeatureDetectionModule.js');
    const module = new FeatureDetectionModule();
    await module.init();
    return module;
  }
  /**
   * 加载性能评估模块
   */
  async loadPerformanceModule() {
    const {
      PerformanceModule
    } = await import('../modules/PerformanceModule.js');
    const module = new PerformanceModule();
    await module.init();
    return module;
  }
  /**
   * 加载媒体设备模块
   */
  async loadMediaModule() {
    const {
      MediaModule
    } = await import('../modules/MediaModule.js');
    const module = new MediaModule();
    await module.init();
    return module;
  }
  /**
   * 更新加载统计信息
   */
  updateLoadingStats(name, loadTime, isError) {
    if (!this.loadingStats.has(name)) {
      this.loadingStats.set(name, {
        loadCount: 0,
        totalLoadTime: 0,
        averageLoadTime: 0,
        lastLoadTime: 0,
        errors: 0
      });
    }
    const stats = this.loadingStats.get(name);
    if (!stats) return;
    const safeLoadTime = Math.max(1, Math.floor(loadTime));
    if (isError) {
      stats.errors++;
    } else {
      stats.loadCount++;
      stats.totalLoadTime += safeLoadTime;
      stats.averageLoadTime = stats.totalLoadTime / stats.loadCount;
    }
    stats.lastLoadTime = safeLoadTime;
    this.cleanupOldStats();
  }
  /**
   * 设置模块依赖关系
   * 
   * @param name - 模块名称
   * @param deps - 依赖的模块列表
   */
  setDependencies(name, deps) {
    this.dependencies.set(name, deps);
  }
  /**
   * 设置模块优先级
   * 
   * @param name - 模块名称
   * @param priority - 优先级（数字越大优先级越高）
   */
  setPriority(name, priority) {
    this.priorities.set(name, priority);
  }
  /**
   * 预加载模块（在后台加载，不阻塞）
   * 
   * @param names - 要预加载的模块名称列表
   */
  async preload(names) {
    const sortedNames = names.sort((a, b) => {
      const priorityA = this.priorities.get(a) || 0;
      const priorityB = this.priorities.get(b) || 0;
      return priorityB - priorityA;
    });
    const toLoad = this.resolveDependencies(sortedNames);
    const needLoad = toLoad.filter((name) => !this.isLoaded(name));
    if (needLoad.length === 0) {
      return;
    }
    try {
      await asyncPool(3, needLoad, async (name) => {
        if (!this.isLoaded(name)) {
          await this.loadModuleInstance(name);
        }
      });
    } catch (error) {
      console.warn("Preload failed for some modules:", error);
    }
  }
  /**
   * 批量加载模块（并行加载）
   * 
   * @param names - 要加载的模块名称列表
   * @param concurrency - 并发数（默认3）
   * @returns Promise<模块实例数组>
   */
  async loadMultiple(names, concurrency = 3) {
    const toLoad = this.resolveDependencies(names);
    const modules = await asyncPool(concurrency, toLoad, async (name) => {
      return this.loadModuleInstance(name);
    });
    return modules;
  }
  /**
   * 解析模块依赖关系（拓扑排序）
   * 
   * @param names - 模块名称列表
   * @returns 排序后的模块名称列表
   */
  resolveDependencies(names) {
    const result = [];
    const visited = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    const visit = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      visiting.add(name);
      const deps = this.dependencies.get(name) || [];
      for (const dep of deps) {
        visit(dep);
      }
      visiting.delete(name);
      visited.add(name);
      result.push(name);
    };
    for (const name of names) {
      visit(name);
    }
    return result;
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { ModuleLoader };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=ModuleLoader.js.map
