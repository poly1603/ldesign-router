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

var index = require('../utils/index.cjs');
var MemoryManager = require('../utils/MemoryManager.cjs');
var EventEmitter = require('./EventEmitter.cjs');
var ModuleLoader = require('./ModuleLoader.cjs');

const _DeviceDetector = class _DeviceDetector2 extends EventEmitter.EventEmitter {
  /**
   * 构造函数 - 创建设备检测器实例
   *
   * @param options 配置选项
   * @param options.enableResize 是否启用窗口大小变化监听，默认 true
   * @param options.enableOrientation 是否启用屏幕方向变化监听，默认 true
   * @param options.modules 要加载的扩展模块列表，如 ['network', 'battery', 'geolocation']
   * @param options.breakpoints 设备类型断点配置，用于判断设备类型
   * @param options.debounceDelay 事件防抖时间（毫秒），默认 100ms
   *
   * @example
   * ```typescript
   * // 基础配置
   * const detector = new DeviceDetector()
   *
   * // 自定义配置
   * const detector = new DeviceDetector({
   *   enableResize: true,
   *   enableOrientation: true,
   *   modules: ['network', 'battery'],
   *   breakpoints: {
   *     mobile: 768,
   *     tablet: 1024
   *   },
   *   debounceDelay: 200
   * })
   * ```
   */
  constructor(options = {}) {
    super();
    this.isDestroyed = false;
    this.webglCacheExpireTime = 0;
    this.lastDetectionTime = 0;
    this.minDetectionInterval = 16;
    this.cacheExpireTime = 6e4;
    this.webglCacheLifetime = 3e5;
    this.cacheTimestamp = 0;
    this.errorCount = 0;
    this.maxErrors = 5;
    this.lastErrorTime = 0;
    this.errorCooldown = 5e3;
    this.maxMetricsHistory = 100;
    this.metricsHistory = [];
    this.detectionMetrics = {
      detectionCount: 0,
      averageDetectionTime: 0,
      lastDetectionDuration: 0
    };
    this.moduleEventUnsubscribers = /* @__PURE__ */ new Map();
    this.options = {
      enableResize: true,
      enableOrientation: true,
      breakpoints: {
        mobile: 768,
        tablet: 1024
      },
      debounceDelay: 100,
      ...options
    };
    this.timerManager = new MemoryManager.SafeTimerManager();
    this.moduleLoader = new ModuleLoader.ModuleLoader();
    this.currentDeviceInfo = this.detectDevice();
    this.setupEventListeners();
    MemoryManager.memoryManager.addGCCallback(() => this.cleanupCache());
  }
  /**
   * 获取当前设备类型
   */
  getDeviceType() {
    return this.currentDeviceInfo.type;
  }
  /**
   * 获取当前屏幕方向
   */
  getOrientation() {
    return this.currentDeviceInfo.orientation;
  }
  /**
   * 获取完整的设备信息
   *
   * 返回当前设备的完整信息对象，包括：
   * - 设备类型（desktop、mobile、tablet）
   * - 屏幕尺寸和分辨率信息
   * - 浏览器和操作系统信息
   * - 设备方向和像素比
   * - 触摸支持情况
   *
   * @returns DeviceInfo 设备信息对象
   *
   * @example
   * ```typescript
   * const detector = new DeviceDetector()
   * const deviceInfo = detector.getDeviceInfo()
   *
   *  // 'mobile' | 'tablet' | 'desktop'
   * 
   * 
   * 
   * 
   * ```
   */
  getDeviceInfo() {
    return {
      ...this.currentDeviceInfo
    };
  }
  /**
   * 获取检测性能指标
   */
  getDetectionMetrics() {
    return {
      ...this.detectionMetrics
    };
  }
  /**
   * 检查是否为移动设备
   */
  isMobile() {
    return this.currentDeviceInfo.type === "mobile";
  }
  /**
   * 检查是否为平板设备
   */
  isTablet() {
    return this.currentDeviceInfo.type === "tablet";
  }
  /**
   * 检查是否为桌面设备
   */
  isDesktop() {
    return this.currentDeviceInfo.type === "desktop";
  }
  /**
   * 检查是否为触摸设备
   */
  isTouchDevice() {
    return this.currentDeviceInfo.isTouchDevice;
  }
  /**
   * 刷新设备信息
   */
  refresh() {
    this.lastDetectionTime = 0;
    this.handleDeviceChange();
  }
  /**
   * 动态加载扩展模块
   */
  async loadModule(name) {
    if (this.isDestroyed) {
      throw new Error("DeviceDetector has been destroyed");
    }
    const instance = await this.moduleLoader.loadModuleInstance(name);
    try {
      const unsubs = [];
      const withEvents = instance;
      const hasOn = typeof withEvents.on === "function";
      const hasOff = typeof withEvents.off === "function";
      if (hasOn && hasOff) {
        if (name === "network") {
          const handler = (info) => this.emit("networkChange", info);
          withEvents.on?.("networkChange", handler);
          unsubs.push(() => withEvents.off?.("networkChange", handler));
        }
        if (name === "battery") {
          const handler = (info) => this.emit("batteryChange", info);
          withEvents.on?.("batteryChange", handler);
          unsubs.push(() => withEvents.off?.("batteryChange", handler));
        }
        if (name === "geolocation") {
          const handler = (info) => this.emit("positionChange", info);
          withEvents.on?.("positionChange", handler);
          unsubs.push(() => withEvents.off?.("positionChange", handler));
        }
      }
      if (unsubs.length > 0) {
        this.moduleEventUnsubscribers.set(name, unsubs);
      }
    } catch {
    }
    return instance;
  }
  /**
   * 卸载扩展模块
   */
  async unloadModule(name) {
    const unsubs = this.moduleEventUnsubscribers.get(name);
    if (unsubs && unsubs.length) {
      unsubs.forEach((fn) => {
        try {
          fn();
        } catch {
        }
      });
      this.moduleEventUnsubscribers.delete(name);
    }
    await this.moduleLoader.unload(name);
  }
  /**
   * 检查模块是否已加载
   */
  isModuleLoaded(name) {
    return this.moduleLoader.isLoaded(name);
  }
  /**
   * 获取已加载的模块列表
   */
  getLoadedModules() {
    return this.moduleLoader.getLoadedModules();
  }
  /**
   * 销毁检测器，清理资源
   */
  async destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.removeEventListeners();
    this.timerManager.clearAll();
    this.moduleEventUnsubscribers.forEach((unsubs) => {
      unsubs.forEach((fn) => {
        try {
          fn();
        } catch {
        }
      });
    });
    this.moduleEventUnsubscribers.clear();
    await this.moduleLoader.unloadAll();
    this.removeAllListeners();
    this.cleanupCache();
    this.metricsHistory.length = 0;
    MemoryManager.memoryManager.removeGCCallback(() => this.cleanupCache());
  }
  /**
   * 清理缓存
   */
  cleanupCache() {
    this.cachedUserAgent = void 0;
    this.cachedOS = void 0;
    this.cachedBrowser = void 0;
    this.cachedWebGLSupport = void 0;
    this.cacheTimestamp = 0;
    this.webglCacheExpireTime = 0;
  }
  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(detectionTime) {
    this.detectionMetrics.detectionCount++;
    this.detectionMetrics.lastDetectionDuration = detectionTime;
    this.metricsHistory.push(detectionTime);
    if (this.metricsHistory.length > this.maxMetricsHistory) {
      this.metricsHistory.shift();
    }
    const sum = this.metricsHistory.reduce((a, b) => a + b, 0);
    this.detectionMetrics.averageDetectionTime = sum / this.metricsHistory.length;
  }
  /**
   * 处理检测错误
   */
  handleDetectionError(error) {
    this.errorCount++;
    this.lastErrorTime = performance.now();
    console.warn("Device detection error:", error);
    if (this.errorCount >= this.maxErrors) {
      this.emit("error", {
        message: "Too many detection errors",
        count: this.errorCount,
        lastError: error
      });
    }
  }
  /**
   * 检测设备信息
   */
  detectDevice() {
    if (typeof window === "undefined") {
      return {
        type: "desktop",
        orientation: "landscape",
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        isTouchDevice: false,
        userAgent: "",
        os: {
          name: "unknown",
          version: "unknown"
        },
        browser: {
          name: "unknown",
          version: "unknown"
        },
        screen: {
          width: 1920,
          height: 1080,
          pixelRatio: 1,
          availWidth: 1920,
          availHeight: 1080
        },
        features: {
          touch: false
        }
      };
    }
    const now = performance.now();
    if (this.errorCount >= this.maxErrors && now - this.lastErrorTime < this.errorCooldown) {
      return this.currentDeviceInfo;
    }
    if (now - this.lastDetectionTime < this.minDetectionInterval) {
      return this.currentDeviceInfo;
    }
    const startTime = now;
    this.lastDetectionTime = now;
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      let os = this.cachedOS;
      let browser = this.cachedBrowser;
      const cacheExpired = now - this.cacheTimestamp > this.cacheExpireTime;
      if (this.cachedUserAgent !== userAgent || cacheExpired) {
        this.cachedUserAgent = userAgent;
        this.cachedOS = os = index.parseOS(userAgent);
        this.cachedBrowser = browser = index.parseBrowser(userAgent);
        this.cacheTimestamp = now;
      }
      const pixelRatio = index.getPixelRatio();
      const touchDevice = index.isTouchDevice();
      const deviceInfo = {
        type: index.getDeviceTypeByWidth(width, this.options.breakpoints),
        orientation: index.getScreenOrientation(),
        width,
        height,
        pixelRatio,
        isTouchDevice: touchDevice,
        userAgent,
        os: os || {
          name: "unknown",
          version: "unknown"
        },
        browser: browser || {
          name: "unknown",
          version: "unknown"
        },
        screen: {
          width,
          height,
          pixelRatio,
          availWidth: window.screen?.availWidth || width,
          availHeight: window.screen?.availHeight || height
        },
        features: {
          touch: touchDevice,
          webgl: typeof window !== "undefined" ? this.detectWebGL() : false
        }
      };
      const detectionTime = performance.now() - startTime;
      this.updatePerformanceMetrics(detectionTime);
      this.errorCount = 0;
      return deviceInfo;
    } catch (error) {
      this.handleDetectionError(error);
      return this.currentDeviceInfo;
    }
  }
  /**
   * 检测 WebGL 支持
   *
   * 优化: 缓存检测结果,复用canvas元素，减少内存分配
   */
  detectWebGL() {
    const now = Date.now();
    if (this.cachedWebGLSupport !== void 0 && this.webglCacheExpireTime > 0 && now - this.webglCacheExpireTime < this.webglCacheLifetime) {
      return this.cachedWebGLSupport;
    }
    try {
      const canvas = _DeviceDetector2.canvasPool.pop() || document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const gl = canvas.getContext("webgl", {
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        depth: false,
        stencil: false
      }) || canvas.getContext("experimental-webgl", {
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        depth: false,
        stencil: false
      });
      this.cachedWebGLSupport = !!gl;
      if (gl && "getExtension" in gl) {
        const loseContext = gl.getExtension("WEBGL_lose_context");
        loseContext?.loseContext();
      }
      if (_DeviceDetector2.canvasPool.length < _DeviceDetector2.maxCanvasPool) {
        canvas.width = 1;
        canvas.height = 1;
        _DeviceDetector2.canvasPool.push(canvas);
      }
      this.webglCacheExpireTime = now;
      return this.cachedWebGLSupport;
    } catch {
      this.cachedWebGLSupport = false;
      this.webglCacheExpireTime = now;
      return false;
    }
  }
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (typeof window === "undefined") return;
    if (this.options.enableResize) {
      this.resizeHandler = index.debounce(() => {
        if (!this.isDestroyed) {
          this.handleDeviceChange();
        }
      }, this.options.debounceDelay ?? 100);
      window.addEventListener("resize", this.resizeHandler, {
        passive: true
      });
    }
    if (this.options.enableOrientation) {
      this.orientationHandler = index.debounce(() => {
        if (!this.isDestroyed) {
          this.handleDeviceChange();
        }
      }, this.options.debounceDelay ?? 100);
      window.addEventListener("orientationchange", this.orientationHandler, {
        passive: true
      });
      if (!this.options.enableResize) {
        window.addEventListener("resize", this.orientationHandler, {
          passive: true
        });
      }
    }
  }
  /**
   * 处理设备变化 - 优化版本
   */
  handleDeviceChange() {
    if (this.isDestroyed) {
      return;
    }
    try {
      const oldDeviceInfo = this.currentDeviceInfo;
      const newDeviceInfo = this.detectDevice();
      if (this.hasDeviceInfoChanged(oldDeviceInfo, newDeviceInfo)) {
        this.currentDeviceInfo = newDeviceInfo;
        if (oldDeviceInfo.type !== newDeviceInfo.type) {
          this.emit("deviceChange", newDeviceInfo);
        }
        if (oldDeviceInfo.orientation !== newDeviceInfo.orientation) {
          this.emit("orientationChange", newDeviceInfo.orientation);
        }
        if (oldDeviceInfo.width !== newDeviceInfo.width || oldDeviceInfo.height !== newDeviceInfo.height) {
          this.emit("resize", {
            width: newDeviceInfo.width,
            height: newDeviceInfo.height
          });
        }
      }
    } catch (error) {
      this.handleDetectionError(error);
    }
  }
  /**
   * 检查设备信息是否发生变化
   */
  hasDeviceInfoChanged(oldInfo, newInfo) {
    return oldInfo.type !== newInfo.type || oldInfo.orientation !== newInfo.orientation || oldInfo.width !== newInfo.width || oldInfo.height !== newInfo.height || oldInfo.pixelRatio !== newInfo.pixelRatio;
  }
  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    if (typeof window === "undefined") return;
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = void 0;
    }
    if (this.orientationHandler) {
      window.removeEventListener("orientationchange", this.orientationHandler);
      if (!this.options.enableResize) {
        window.removeEventListener("resize", this.orientationHandler);
      }
      this.orientationHandler = void 0;
    }
  }
};
_DeviceDetector.canvasPool = [];
_DeviceDetector.maxCanvasPool = 2;
let DeviceDetector = _DeviceDetector;
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.DeviceDetector = DeviceDetector;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=DeviceDetector.cjs.map
