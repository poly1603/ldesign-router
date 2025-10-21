/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { nanoid } from 'nanoid';
import { inject, computed } from 'vue';

class ABTestManager {
  constructor(options = {}) {
    this.experiments = /* @__PURE__ */ new Map();
    this.userVariants = /* @__PURE__ */ new Map();
    this.results = /* @__PURE__ */ new Map();
    this.router = null;
    this.analytics = null;
    this.userId = options.userId || this.generateUserId();
    this.storage = options.storage || localStorage;
    this.analytics = options.analytics || null;
    this.loadExperiments();
    this.loadUserVariants();
  }
  /**
   * 初始化路由集成
   */
  initRouter(router) {
    this.router = router;
    this.setupRouterIntegration();
  }
  /**
   * 设置路由集成
   */
  setupRouterIntegration() {
    if (!this.router) return;
    this.router.beforeEach((to, _from, next) => {
      const experiment = this.getExperimentForRoute(to.path);
      if (experiment && experiment.status === "running") {
        const variant = this.selectVariant(experiment);
        if (variant && variant.route !== to.path) {
          this.recordImpression(experiment.id, variant.id);
          next(variant.route);
        } else {
          next();
        }
      } else {
        next();
      }
    });
  }
  /**
   * 创建实验
   */
  createExperiment(config) {
    const experiment = {
      ...config,
      id: nanoid(),
      status: config.status || "draft"
    };
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error("Variant weights must sum to 100");
    }
    this.experiments.set(experiment.id, experiment);
    this.saveExperiments();
    if (experiment.status === "running" && this.router) {
      this.setupExperimentRoutes(experiment);
    }
    return experiment;
  }
  /**
   * 更新实验
   */
  updateExperiment(id, updates) {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      throw new Error(`Experiment ${id} not found`);
    }
    Object.assign(experiment, updates);
    if (updates.status) {
      if (updates.status === "running") {
        this.startExperiment(id);
      } else if (updates.status === "paused" || updates.status === "completed") {
        this.stopExperiment(id);
      }
    }
    this.saveExperiments();
  }
  /**
   * 删除实验
   */
  deleteExperiment(id) {
    const experiment = this.experiments.get(id);
    if (!experiment) return;
    if (experiment.status === "running") {
      this.stopExperiment(id);
    }
    this.experiments.delete(id);
    this.saveExperiments();
  }
  /**
   * 启动实验
   */
  startExperiment(id) {
    const experiment = this.experiments.get(id);
    if (!experiment) return;
    experiment.status = "running";
    experiment.startDate = /* @__PURE__ */ new Date();
    if (this.router) {
      this.setupExperimentRoutes(experiment);
    }
    this.saveExperiments();
    if (this.analytics) {
      this.analytics.track("experiment_started", {
        experimentId: id,
        experimentName: experiment.name
      });
    }
  }
  /**
   * 停止实验
   */
  stopExperiment(id) {
    const experiment = this.experiments.get(id);
    if (!experiment) return;
    if (experiment.status === "running") {
      experiment.status = "paused";
      experiment.endDate = /* @__PURE__ */ new Date();
    }
    if (this.router) {
      this.removeExperimentRoutes(experiment);
    }
    this.saveExperiments();
    if (this.analytics) {
      this.analytics.track("experiment_stopped", {
        experimentId: id,
        experimentName: experiment.name
      });
    }
  }
  /**
   * 设置实验路由
   */
  setupExperimentRoutes(experiment) {
    if (!this.router) return;
    const router = this.router;
    experiment.variants.forEach((variant) => {
      if (variant.component) {
        const routePath = typeof variant.route === "string" ? variant.route : typeof variant.route === "object" && "path" in variant.route ? variant.route.path : void 0;
        if (!routePath) return;
        const route = {
          path: routePath,
          name: `ab-${experiment.id}-${variant.id}`,
          component: variant.component,
          props: variant.props,
          meta: {
            ...variant.meta,
            abTest: {
              experimentId: experiment.id,
              variantId: variant.id
            }
          }
        };
        router.addRoute(route);
      }
    });
  }
  /**
   * 移除实验路由
   */
  removeExperimentRoutes(experiment) {
    if (!this.router) return;
    const router = this.router;
    experiment.variants.forEach((variant) => {
      const routeName = `ab-${experiment.id}-${variant.id}`;
      router.removeRoute(routeName);
    });
  }
  /**
   * 选择变体
   */
  selectVariant(experiment) {
    if (!this.matchesTargeting(experiment)) {
      return null;
    }
    if (experiment.sampleSize && experiment.sampleSize < 100) {
      const hash = this.hashString(this.userId + experiment.id);
      if (hash % 100 >= experiment.sampleSize) {
        return null;
      }
    }
    let userVariantMap = this.userVariants.get(this.userId);
    if (!userVariantMap) {
      userVariantMap = /* @__PURE__ */ new Map();
      this.userVariants.set(this.userId, userVariantMap);
    }
    let variantId = userVariantMap.get(experiment.id);
    if (!variantId) {
      variantId = this.assignVariant(experiment);
      userVariantMap.set(experiment.id, variantId);
      this.saveUserVariants();
    }
    return experiment.variants.find((v) => v.id === variantId) || null;
  }
  /**
   * 分配变体
   */
  assignVariant(experiment) {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }
    return experiment.variants[0]?.id || experiment.variants[0].id;
  }
  /**
   * 检查定位规则
   */
  matchesTargeting(experiment) {
    if (!experiment.targeting) return true;
    const {
      include,
      exclude,
      customRules
    } = experiment.targeting;
    if (include && include.length > 0) {
      const matches = include.some((segment) => this.matchesSegment(segment));
      if (!matches) return false;
    }
    if (exclude && exclude.length > 0) {
      const matches = exclude.some((segment) => this.matchesSegment(segment));
      if (matches) return false;
    }
    if (customRules && customRules.length > 0) {
      const user = this.getCurrentUser();
      const matches = customRules.every((rule) => rule(user));
      if (!matches) return false;
    }
    return true;
  }
  /**
   * 匹配用户分段
   */
  matchesSegment(segment) {
    switch (segment.type) {
      case "new":
        return this.isNewUser();
      case "returning":
        return !this.isNewUser();
      case "location":
        return this.matchesLocation(segment.value, segment.operator);
      case "device":
        return this.matchesDevice(segment.value, segment.operator);
      case "custom":
        return this.matchesCustomSegment(segment.value, segment.operator);
      default:
        return false;
    }
  }
  /**
   * 判断是否新用户
   */
  isNewUser() {
    const firstVisit = this.storage.getItem("ab_first_visit");
    if (!firstVisit) {
      this.storage.setItem("ab_first_visit", Date.now().toString());
      return true;
    }
    const daysSinceFirstVisit = (Date.now() - Number.parseInt(firstVisit)) / (1e3 * 60 * 60 * 24);
    return daysSinceFirstVisit < 7;
  }
  /**
   * 匹配位置
   */
  matchesLocation(value, operator) {
    const userLocation = this.getUserLocation();
    if (!userLocation) return false;
    switch (operator) {
      case "equals":
        return userLocation === value;
      case "contains":
        return userLocation.includes(value);
      default:
        return false;
    }
  }
  /**
   * 匹配设备
   */
  matchesDevice(value, _operator) {
    const userAgent = navigator.userAgent.toLowerCase();
    switch (value) {
      case "mobile":
        return /mobile|android|iphone|ipad|phone/i.test(userAgent);
      case "desktop":
        return !/mobile|android|iphone|ipad|phone/i.test(userAgent);
      case "tablet":
        return /ipad|tablet/i.test(userAgent);
      default:
        return false;
    }
  }
  /**
   * 匹配自定义分段
   */
  matchesCustomSegment(_value, _operator) {
    return true;
  }
  /**
   * 记录展示
   */
  recordImpression(experimentId, variantId) {
    const result = {
      experimentId,
      variantId,
      userId: this.userId,
      timestamp: /* @__PURE__ */ new Date(),
      goals: []
    };
    if (!this.results.has(experimentId)) {
      this.results.set(experimentId, []);
    }
    this.results.get(experimentId).push(result);
    if (this.analytics) {
      this.analytics.track("experiment_impression", {
        experimentId,
        variantId,
        userId: this.userId
      });
    }
  }
  /**
   * 记录转化
   */
  recordConversion(experimentId, goalId, value) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;
    const userVariantMap = this.userVariants.get(this.userId);
    if (!userVariantMap) return;
    const variantId = userVariantMap.get(experimentId);
    if (!variantId) return;
    const results = this.results.get(experimentId);
    if (!results) return;
    const lastResult = results[results.length - 1];
    if (lastResult && lastResult.variantId === variantId) {
      lastResult.goals.push({
        goalId,
        achieved: true,
        value,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    if (this.analytics) {
      this.analytics.track("experiment_conversion", {
        experimentId,
        variantId,
        goalId,
        value,
        userId: this.userId
      });
    }
  }
  /**
   * 获取实验统计
   */
  getExperimentStats(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return /* @__PURE__ */ new Map();
    const results = this.results.get(experimentId) || [];
    const stats = /* @__PURE__ */ new Map();
    experiment.variants.forEach((variant) => {
      stats.set(variant.id, {
        variantId: variant.id,
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
        avgValue: 0,
        confidence: 0
      });
    });
    results.forEach((result) => {
      const variantStats = stats.get(result.variantId);
      if (!variantStats) return;
      variantStats.impressions++;
      if (result.goals.length > 0) {
        variantStats.conversions++;
        const totalValue = result.goals.reduce((sum, goal) => sum + (goal.value || 0), 0);
        variantStats.avgValue = ((variantStats.avgValue || 0) * (variantStats.conversions - 1) + totalValue) / variantStats.conversions;
      }
    });
    stats.forEach((variantStats) => {
      if (variantStats.impressions > 0) {
        variantStats.conversionRate = variantStats.conversions / variantStats.impressions;
        variantStats.confidence = this.calculateConfidence(variantStats, stats);
      }
    });
    return stats;
  }
  /**
   * 计算置信度
   */
  calculateConfidence(variant, allStats) {
    if (variant.impressions < 30) return 0;
    const control = Array.from(allStats.values()).find((s) => s.variantId !== variant.variantId);
    if (!control || control.impressions < 30) return 0;
    const p1 = variant.conversionRate;
    const p2 = control.conversionRate;
    const n1 = variant.impressions;
    const n2 = control.impressions;
    const pooledP = (variant.conversions + control.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));
    if (se === 0) return 0;
    const z = Math.abs(p1 - p2) / se;
    if (z < 1.645) return 0;
    if (z < 1.96) return 90;
    if (z < 2.576) return 95;
    return 99;
  }
  /**
   * 获取路由对应的实验
   */
  getExperimentForRoute(path) {
    for (const experiment of this.experiments.values()) {
      if (experiment.status === "running" && experiment.targetRoute === path) {
        return experiment;
      }
    }
    return null;
  }
  /**
   * 生成用户ID
   */
  generateUserId() {
    let userId = this.storage.getItem("ab_user_id");
    if (!userId) {
      userId = nanoid();
      this.storage.setItem("ab_user_id", userId);
    }
    return userId;
  }
  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return {
      id: this.userId,
      isNew: this.isNewUser(),
      device: this.getDevice(),
      location: this.getUserLocation()
    };
  }
  /**
   * 获取设备类型
   */
  getDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|phone/i.test(userAgent)) return "mobile";
    if (/ipad|tablet/i.test(userAgent)) return "tablet";
    return "desktop";
  }
  /**
   * 获取用户位置
   */
  getUserLocation() {
    return this.storage.getItem("user_location");
  }
  /**
   * 哈希字符串
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  /**
   * 保存实验
   */
  saveExperiments() {
    const data = Array.from(this.experiments.values());
    this.storage.setItem("ab_experiments", JSON.stringify(data));
  }
  /**
   * 加载实验
   */
  loadExperiments() {
    const data = this.storage.getItem("ab_experiments");
    if (!data) return;
    try {
      const experiments = JSON.parse(data);
      experiments.forEach((exp) => {
        this.experiments.set(exp.id, exp);
      });
    } catch (error) {
      console.error("Failed to load AB test experiments:", error);
    }
  }
  /**
   * 保存用户变体
   */
  saveUserVariants() {
    const data = {};
    this.userVariants.forEach((variants, userId) => {
      data[userId] = Object.fromEntries(variants);
    });
    this.storage.setItem("ab_user_variants", JSON.stringify(data));
  }
  /**
   * 加载用户变体
   */
  loadUserVariants() {
    const data = this.storage.getItem("ab_user_variants");
    if (!data) return;
    try {
      const userVariants = JSON.parse(data);
      Object.entries(userVariants).forEach(([userId, variants]) => {
        this.userVariants.set(userId, new Map(Object.entries(variants)));
      });
    } catch (error) {
      console.error("Failed to load user variants:", error);
    }
  }
  /**
   * 获取全部实验（只读）
   */
  getExperiments() {
    return Array.from(this.experiments.values());
  }
  /**
   * 导出结果
   */
  exportResults(experimentId) {
    if (experimentId) {
      return {
        experiment: this.experiments.get(experimentId),
        results: this.results.get(experimentId),
        stats: Object.fromEntries(this.getExperimentStats(experimentId))
      };
    }
    const allData = [];
    this.experiments.forEach((exp, id) => {
      allData.push({
        experiment: exp,
        results: this.results.get(id),
        stats: Object.fromEntries(this.getExperimentStats(id))
      });
    });
    return allData;
  }
}
class GoogleAnalyticsAdapter {
  track(event, properties) {
    if (typeof gtag === "function") {
      gtag("event", event, properties);
    }
  }
}
const ABTestPlugin = {
  install(app, options) {
    const abTest = new ABTestManager(options);
    app.config.globalProperties.$abTest = abTest;
    app.provide("abTest", abTest);
    app.mixin({
      mounted() {
        if (this.$options.name === "App" && this.$router) {
          abTest.initRouter(this.$router);
        }
      }
    });
  }
};
function useABTest() {
  const abTest = inject("abTest");
  if (!abTest) {
    throw new Error("ABTestManager not found");
  }
  const currentExperiments = computed(() => {
    return abTest.getExperiments().filter((exp) => exp.status === "running");
  });
  return {
    createExperiment: abTest.createExperiment.bind(abTest),
    updateExperiment: abTest.updateExperiment.bind(abTest),
    deleteExperiment: abTest.deleteExperiment.bind(abTest),
    startExperiment: abTest.startExperiment.bind(abTest),
    stopExperiment: abTest.stopExperiment.bind(abTest),
    recordConversion: abTest.recordConversion.bind(abTest),
    getExperimentStats: abTest.getExperimentStats.bind(abTest),
    exportResults: abTest.exportResults.bind(abTest),
    currentExperiments
  };
}

export { ABTestManager, ABTestPlugin, GoogleAnalyticsAdapter, useABTest };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
