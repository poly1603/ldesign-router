/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class GuardExecutor {
  constructor() {
    this.guards = /* @__PURE__ */ new Map();
    this.dependencyGraph = /* @__PURE__ */ new Map();
    this.resultCache = /* @__PURE__ */ new Map();
    this.CACHE_TTL = 5e3;
    this.stats = {
      totalExecutions: 0,
      parallelExecutions: 0,
      cacheHits: 0,
      skipped: 0,
      averageDuration: 0
    };
  }
  /**
   * 注册守卫
   */
  registerGuard(metadata) {
    this.guards.set(metadata.id, metadata);
    this.rebuildDependencyGraph();
  }
  /**
   * 批量注册守卫
   */
  registerGuards(metadatas) {
    for (const metadata of metadatas) {
      this.guards.set(metadata.id, metadata);
    }
    this.rebuildDependencyGraph();
  }
  /**
   * 移除守卫
   */
  unregisterGuard(id) {
    this.guards.delete(id);
    this.rebuildDependencyGraph();
  }
  /**
   * 执行所有守卫（优化版）
   */
  async executeAll(to, from) {
    const startTime = performance.now();
    this.stats.totalExecutions++;
    const guardsToExecute = this.filterGuardsToExecute(to, from);
    if (guardsToExecute.length === 0) {
      return void 0;
    }
    const executionPlan = this.buildExecutionPlan(guardsToExecute);
    const results = [];
    for (const batch of executionPlan) {
      const batchResults = await this.executeBatch(batch, to, from);
      results.push(...batchResults);
      const abortResult = batchResults.find((r) => r.result === false || r.result && typeof r.result !== "boolean");
      if (abortResult) {
        this.updateStats(results, startTime);
        return abortResult.result;
      }
    }
    this.updateStats(results, startTime);
    return void 0;
  }
  /**
   * 过滤需要执行的守卫
   */
  filterGuardsToExecute(to, from) {
    const result = [];
    for (const metadata of this.guards.values()) {
      if (metadata.skipCondition && metadata.skipCondition(to, from)) {
        this.stats.skipped++;
        continue;
      }
      if (metadata.cacheable) {
        const cacheKey = this.getCacheKey(metadata.id, to, from);
        const cached = this.resultCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          this.stats.cacheHits++;
          continue;
        }
      }
      result.push(metadata);
    }
    return result;
  }
  /**
   * 构建执行计划（按依赖和优先级分批）
   */
  buildExecutionPlan(guards) {
    const plan = [];
    const remaining = new Set(guards.map((g) => g.id));
    const executed = /* @__PURE__ */ new Set();
    while (remaining.size > 0) {
      const batch = [];
      for (const guardId of remaining) {
        const metadata = this.guards.get(guardId);
        const node = this.dependencyGraph.get(guardId);
        const dependenciesMet = !node || Array.from(node.dependencies).every((dep) => executed.has(dep));
        if (dependenciesMet) {
          batch.push(metadata);
        }
      }
      if (batch.length === 0) {
        const first = Array.from(remaining)[0];
        const metadata = this.guards.get(first);
        batch.push(metadata);
      }
      batch.sort((a, b) => b.priority - a.priority);
      for (const guard of batch) {
        remaining.delete(guard.id);
        executed.add(guard.id);
      }
      plan.push(batch);
    }
    return plan;
  }
  /**
   * 并行执行一批守卫
   */
  async executeBatch(batch, to, from) {
    if (batch.length > 1) {
      this.stats.parallelExecutions++;
    }
    const promises = batch.map((metadata) => this.executeGuard(metadata, to, from));
    return Promise.all(promises);
  }
  /**
   * 执行单个守卫
   */
  async executeGuard(metadata, to, from) {
    const startTime = performance.now();
    try {
      const result = await this.runGuard(metadata.guard, to, from);
      if (metadata.cacheable) {
        const cacheKey = this.getCacheKey(metadata.id, to, from);
        this.resultCache.set(cacheKey, {
          result,
          timestamp: Date.now()
        });
      }
      return {
        guardId: metadata.id,
        result,
        duration: performance.now() - startTime,
        cached: false
      };
    } catch (error) {
      throw error;
    }
  }
  /**
   * 运行守卫（带超时和重试）
   */
  async runGuard(guard, to, from) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const next = (result) => {
        if (resolved) return;
        resolved = true;
        if (result === false) {
          resolve(false);
        } else if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      };
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`Guard timeout: ${guard.name || "anonymous"}`));
        }
      }, 3e3);
      try {
        const guardResult = guard(to, from, next);
        if (guardResult && typeof guardResult === "object" && "then" in guardResult) {
          guardResult.then((result) => {
            clearTimeout(timeout);
            if (!resolved) {
              resolved = true;
              resolve(result);
            }
          }, (error) => {
            clearTimeout(timeout);
            if (!resolved) {
              resolved = true;
              reject(error);
            }
          });
        } else {
          clearTimeout(timeout);
        }
      } catch (error) {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      }
    });
  }
  /**
   * 重建依赖图
   */
  rebuildDependencyGraph() {
    this.dependencyGraph.clear();
    for (const [id, metadata] of this.guards) {
      this.dependencyGraph.set(id, {
        id,
        metadata,
        dependents: /* @__PURE__ */ new Set(),
        dependencies: new Set(metadata.dependencies),
        executed: false
      });
    }
    for (const node of this.dependencyGraph.values()) {
      for (const depId of node.dependencies) {
        const depNode = this.dependencyGraph.get(depId);
        if (depNode) {
          depNode.dependents.add(node.id);
        }
      }
    }
  }
  /**
   * 生成缓存键
   */
  getCacheKey(guardId, to, from) {
    return `${guardId}_${to.path}_${from.path}`;
  }
  /**
   * 更新统计信息
   */
  updateStats(results, startTime) {
    performance.now() - startTime;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    this.stats.averageDuration = (this.stats.averageDuration * (this.stats.totalExecutions - 1) + avgDuration) / this.stats.totalExecutions;
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      registeredGuards: this.guards.size,
      cacheSize: this.resultCache.size
    };
  }
  /**
   * 清理缓存
   */
  clearCache() {
    this.resultCache.clear();
  }
  /**
   * 重置统计
   */
  resetStats() {
    this.stats = {
      totalExecutions: 0,
      parallelExecutions: 0,
      cacheHits: 0,
      skipped: 0,
      averageDuration: 0
    };
  }
}
function createGuardMetadata(guard, options = {}) {
  return {
    guard,
    id: options.id || guard.name || `guard_${Date.now()}_${Math.random()}`,
    priority: options.priority ?? 0,
    dependencies: options.dependencies || [],
    cacheable: options.cacheable ?? false,
    skipCondition: options.skipCondition
  };
}
const commonSkipConditions = {
  // 当路径相同时跳过
  samePath: (to, from) => to.path === from.path,
  // 当查询参数相同时跳过
  sameQuery: (to, from) => JSON.stringify(to.query) === JSON.stringify(from.query),
  // 当参数相同时跳过
  sameParams: (to, from) => JSON.stringify(to.params) === JSON.stringify(from.params),
  // 组合条件
  sameRoute: (to, from) => to.path === from.path && JSON.stringify(to.query) === JSON.stringify(from.query) && JSON.stringify(to.params) === JSON.stringify(from.params)
};

export { GuardExecutor, commonSkipConditions, createGuardMetadata };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=guard-executor.js.map
