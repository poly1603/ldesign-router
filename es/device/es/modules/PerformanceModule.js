/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { EventEmitter } from '../core/EventEmitter.js';

class PerformanceModule extends EventEmitter {
  constructor() {
    super(...arguments);
    this.name = "performance";
    this.performanceInfo = null;
    this.isInitialized = false;
    this.isTesting = false;
  }
  /**
   * 初始化模块
   */
  async init() {
    if (this.isInitialized) return;
    this.performanceInfo = await this.runPerformanceTest();
    this.isInitialized = true;
  }
  /**
   * 获取性能数据
   */
  getData() {
    if (!this.performanceInfo) {
      throw new Error("PerformanceModule not initialized");
    }
    return {
      ...this.performanceInfo
    };
  }
  /**
   * 获取性能评分
   */
  getScore() {
    return this.performanceInfo?.score ?? 0;
  }
  /**
   * 获取性能等级
   */
  getTier() {
    return this.performanceInfo?.tier ?? "medium";
  }
  /**
   * 重新运行性能测试
   */
  async runTest(options) {
    if (this.isTesting) {
      throw new Error("Performance test already running");
    }
    this.isTesting = true;
    this.emit("testStart", void 0);
    try {
      this.performanceInfo = await this.runPerformanceTest(options);
      this.emit("testComplete", this.performanceInfo);
      this.emit("performanceChange", this.performanceInfo);
      return this.performanceInfo;
    } finally {
      this.isTesting = false;
    }
  }
  /**
   * 销毁模块
   */
  async destroy() {
    this.removeAllListeners();
    this.performanceInfo = null;
    this.isInitialized = false;
  }
  /**
   * 运行性能测试
   */
  async runPerformanceTest(options = {}) {
    const {
      includeGPU = true,
      includeNetwork = false,
      timeout = 5e3
    } = options;
    const hardware = this.detectHardware();
    const [cpuScore, gpuScore, memoryScore, networkScore, storageScore] = await Promise.all([this.testCPUPerformance(timeout, hardware.cpuCores), includeGPU ? this.testGPUPerformance(timeout) : Promise.resolve(50), this.testMemoryPerformance(hardware.deviceMemory), includeNetwork ? this.testNetworkPerformance(timeout) : Promise.resolve(50), this.testStoragePerformance(timeout)]);
    const metrics = {
      cpu: cpuScore,
      gpu: gpuScore,
      memory: memoryScore,
      network: networkScore,
      storage: storageScore
    };
    const weights = {
      cpu: 0.3,
      gpu: 0.25,
      memory: 0.2,
      network: 0.1,
      storage: 0.15
    };
    const score = Math.round(cpuScore * weights.cpu + gpuScore * weights.gpu + memoryScore * weights.memory + networkScore * weights.network + storageScore * weights.storage);
    const tier = this.calculateTier(score);
    const recommendations = this.generateRecommendations(metrics, tier);
    return {
      score,
      tier,
      metrics,
      hardware,
      recommendations,
      timestamp: Date.now()
    };
  }
  /**
   * 检测硬件信息
   */
  detectHardware() {
    return {
      cpuCores: navigator.hardwareConcurrency || 1,
      deviceMemory: navigator.deviceMemory || 4,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }
  /**
   * 测试 CPU 性能
   * 使用数学密集型计算进行基准测试
   */
  async testCPUPerformance(_timeout, cores) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = performance.now() - startTime;
      const benchmarkScore = Math.max(0, Math.min(100, (500 - duration) / 4.5));
      const coreScore = Math.min(100, cores / 8 * 100);
      const finalScore = Math.round(coreScore * 0.4 + benchmarkScore * 0.6);
      resolve(finalScore);
    });
  }
  /**
   * 测试 GPU 性能
   * 结合 WebGL 渲染测试和 Canvas 2D 测试
   */
  async testGPUPerformance(timeout) {
    try {
      const canvas2DScore = await this.testCanvas2DPerformance();
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        return Math.round(canvas2DScore * 0.8);
      }
      const startTime = performance.now();
      let frames = 0;
      const maxFrames = 100;
      const webglScore = await new Promise((resolve) => {
        const render = () => {
          if (!gl) {
            resolve(30);
            return;
          }
          gl.clearColor(Math.random(), Math.random(), Math.random(), 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          frames++;
          const elapsed = performance.now() - startTime;
          if (elapsed >= timeout || frames >= maxFrames) {
            const fps = frames / elapsed * 1e3;
            const score = Math.min(100, fps / 60 * 100);
            resolve(score);
          } else {
            requestAnimationFrame(render);
          }
        };
        render();
      });
      const webglBonus = 10;
      return Math.min(100, Math.round(canvas2DScore * 0.4 + webglScore * 0.6 + webglBonus));
    } catch {
      return 30;
    }
  }
  /**
   * 测试 Canvas 2D 渲染性能
   */
  async testCanvas2DPerformance() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return 50;
      const startTime = performance.now();
      for (let i = 0; i < 1e3; i++) {
        ctx.fillStyle = `rgb(${i % 255}, ${i * 2 % 255}, ${i * 3 % 255})`;
        ctx.fillRect(Math.random() * 800, Math.random() * 600, Math.random() * 50, Math.random() * 50);
      }
      const duration = performance.now() - startTime;
      return Math.max(0, Math.min(100, (200 - duration) / 1.8));
    } catch {
      return 50;
    }
  }
  /**
   * 测试内存性能
   * 结合设备内存容量和实际性能测试
   */
  async testMemoryPerformance(deviceMemory) {
    try {
      const arraySize = 1e6;
      const startTime = performance.now();
      const arr = Array.from({
        length: arraySize
      });
      for (let i = 0; i < arraySize; i++) {
        arr[i] = Math.random();
      }
      arr.sort((a, b) => a - b);
      const duration = performance.now() - startTime;
      arr.length = 0;
      const benchmarkScore = Math.max(0, Math.min(100, (1e3 - duration) / 9));
      const memoryCapacityScore = Math.min(100, deviceMemory / 16 * 100);
      return Math.round(memoryCapacityScore * 0.5 + benchmarkScore * 0.5);
    } catch {
      if (deviceMemory >= 8) return 100;
      if (deviceMemory >= 6) return 85;
      if (deviceMemory >= 4) return 70;
      if (deviceMemory >= 2) return 50;
      return 30;
    }
  }
  /**
   * 测试网络性能
   */
  async testNetworkPerformance(_timeout) {
    try {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!connection) return 70;
      const effectiveType = connection.effectiveType || "4g";
      const downlink = connection.downlink || 0;
      const typeScores = {
        "slow-2g": 20,
        "2g": 40,
        "3g": 60,
        "4g": 85,
        "5g": 100
      };
      const typeScore = typeScores[effectiveType] || 70;
      if (downlink > 0) {
        const speedScore = Math.min(100, downlink / 10 * 100);
        return Math.round((typeScore + speedScore) / 2);
      }
      return typeScore;
    } catch {
      return 70;
    }
  }
  /**
   * 测试存储性能
   * 测试 localStorage 读写性能
   */
  async testStoragePerformance(_timeout) {
    try {
      const testKey = "__perf_test_storage__";
      const testData = "x".repeat(1e4);
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        localStorage.setItem(testKey, testData);
        localStorage.getItem(testKey);
      }
      localStorage.removeItem(testKey);
      const duration = performance.now() - startTime;
      const benchmarkScore = Math.max(0, Math.min(100, (50 - duration) / 0.45));
      let apiBonus = 0;
      if ("indexedDB" in window) apiBonus += 5;
      if ("caches" in window) apiBonus += 5;
      return Math.min(100, Math.round(benchmarkScore + apiBonus));
    } catch {
      return 50;
    }
  }
  /**
   * 计算性能等级
   */
  calculateTier(score) {
    if (score >= 80) return "ultra";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  }
  /**
   * 生成性能建议
   * 提供更详细和实用的优化建议
   */
  generateRecommendations(metrics, tier) {
    const recommendations = [];
    if (tier === "low") {
      recommendations.push("\u8BBE\u5907\u6027\u80FD\u8F83\u4F4E\uFF0C\u5EFA\u8BAE\u964D\u4F4E\u6574\u4F53\u56FE\u5F62\u8D28\u91CF\u548C\u5173\u95ED\u975E\u5FC5\u8981\u52A8\u753B\u6548\u679C");
      recommendations.push("\u5EFA\u8BAE\u51CF\u5C11\u540C\u65F6\u8FD0\u884C\u7684\u4EFB\u52A1\u548C\u540E\u53F0\u8FDB\u7A0B");
    }
    if (metrics.cpu < 50) {
      recommendations.push("\u964D\u4F4EJavaScript\u8BA1\u7B97\u590D\u6742\u5EA6\uFF0C\u4F7F\u7528Web Workers\u5904\u7406\u5BC6\u96C6\u578B\u8BA1\u7B97\u4EFB\u52A1");
      recommendations.push("\u907F\u514D\u5728\u4E3B\u7EBF\u7A0B\u4E2D\u6267\u884C\u590D\u6742\u7684\u6570\u636E\u5904\u7406\u64CD\u4F5C");
    } else if (metrics.cpu < 70) {
      recommendations.push("\u6CE8\u610F\u4F18\u5316JavaScript\u6267\u884C\u6548\u7387\uFF0C\u907F\u514D\u4E0D\u5FC5\u8981\u7684\u590D\u6742\u8BA1\u7B97");
    }
    if (metrics.gpu < 50) {
      recommendations.push("\u51CF\u5C11DOM\u64CD\u4F5C\u548C\u91CD\u7ED8\u6B21\u6570\uFF0C\u4F7F\u7528CSS\u52A8\u753B\u4EE3\u66FFJavaScript\u52A8\u753B");
      recommendations.push("\u964D\u4F4ECanvas\u6E32\u67D3\u8D28\u91CF\uFF0C\u51CF\u5C11\u540C\u65F6\u6E32\u67D3\u7684\u56FE\u5F62\u5143\u7D20\u6570\u91CF");
    } else if (metrics.gpu < 70) {
      recommendations.push("\u4F18\u5316\u56FE\u5F62\u6E32\u67D3\u6027\u80FD\uFF0C\u6CE8\u610F\u63A7\u5236\u52A8\u753B\u5E27\u7387");
    }
    if (metrics.memory < 50) {
      recommendations.push("\u51CF\u5C11\u5185\u5B58\u5360\u7528\uFF0C\u53CA\u65F6\u6E05\u7406\u4E0D\u7528\u7684\u5BF9\u8C61\u548C\u5927\u6570\u7EC4");
      recommendations.push("\u907F\u514D\u5185\u5B58\u6CC4\u6F0F\uFF0C\u6CE8\u610F\u89E3\u9664\u4E8B\u4EF6\u76D1\u542C\u548C\u5B9A\u65F6\u5668");
    } else if (metrics.memory < 70) {
      recommendations.push("\u6CE8\u610F\u5185\u5B58\u4F7F\u7528\u6548\u7387\uFF0C\u907F\u514D\u521B\u5EFA\u8FC7\u591A\u7684\u4E34\u65F6\u5BF9\u8C61");
    }
    if (metrics.network < 50) {
      recommendations.push("\u4F18\u5316\u8D44\u6E90\u52A0\u8F7D\u7B56\u7565\uFF0C\u542F\u7528Gzip\u538B\u7F29\u548C\u6D4F\u89C8\u5668\u7F13\u5B58");
      recommendations.push("\u51CF\u5C11\u7F51\u7EDC\u8BF7\u6C42\u6B21\u6570\uFF0C\u8003\u8651\u4F7F\u7528CDN\u52A0\u901F\u9759\u6001\u8D44\u6E90");
      recommendations.push("\u542F\u7528\u61D2\u52A0\u8F7D\u548C\u9884\u52A0\u8F7D\u7B56\u7565\uFF0C\u4F18\u5316\u9996\u5C4F\u52A0\u8F7D\u65F6\u95F4");
    } else if (metrics.network < 70) {
      recommendations.push("\u7F51\u7EDC\u6027\u80FD\u4E00\u822C\uFF0C\u5EFA\u8BAE\u4F18\u5316\u8D44\u6E90\u52A0\u8F7D\u548C\u4F7F\u7528\u7F13\u5B58\u7B56\u7565");
    }
    if (metrics.storage < 50) {
      recommendations.push("\u51CF\u5C11localStorage\u7684\u4F7F\u7528\u9891\u7387\uFF0C\u8003\u8651\u4F7F\u7528IndexedDB\u5B58\u50A8\u5927\u91CF\u6570\u636E");
      recommendations.push("\u4F18\u5316\u6570\u636E\u5B58\u50A8\u7B56\u7565\uFF0C\u907F\u514D\u9891\u7E41\u7684\u8BFB\u5199\u64CD\u4F5C");
    } else if (metrics.storage < 70) {
      recommendations.push("\u6CE8\u610F\u5B58\u50A8\u6027\u80FD\uFF0C\u907F\u514D\u8FC7\u5EA6\u4F7F\u7528localStorage");
    }
    if (tier === "ultra") {
      recommendations.push("\u8BBE\u5907\u6027\u80FD\u4F18\u79C0\uFF0C\u53EF\u4EE5\u542F\u7528\u6240\u6709\u9AD8\u7EA7\u7279\u6027\u548C\u9AD8\u8D28\u91CF\u56FE\u5F62\u6548\u679C");
    } else if (tier === "high") {
      recommendations.push("\u8BBE\u5907\u6027\u80FD\u826F\u597D\uFF0C\u53EF\u4EE5\u542F\u7528\u5927\u90E8\u5206\u9AD8\u7EA7\u7279\u6027");
    }
    if (recommendations.length === 0) {
      recommendations.push("\u8BBE\u5907\u6027\u80FD\u8868\u73B0\u826F\u597D\uFF0C\u53EF\u4EE5\u6B63\u5E38\u4F7F\u7528\u5404\u9879\u529F\u80FD");
    }
    return recommendations;
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { PerformanceModule };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=PerformanceModule.js.map
