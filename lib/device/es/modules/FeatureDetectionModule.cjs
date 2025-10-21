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

var EventEmitter = require('../core/EventEmitter.cjs');

class FeatureDetectionModule extends EventEmitter.EventEmitter {
  constructor() {
    super(...arguments);
    this.name = "feature";
    this.features = null;
    this.mediaQueryListeners = /* @__PURE__ */ new Map();
    this.isInitialized = false;
  }
  /**
   * 初始化模块
   */
  async init() {
    if (this.isInitialized) return;
    this.features = await this.detectFeatures();
    this.setupMediaQueryListeners();
    this.isInitialized = true;
  }
  /**
   * 获取特性检测数据
   */
  getData() {
    if (!this.features) {
      throw new Error("FeatureDetectionModule not initialized");
    }
    return {
      ...this.features
    };
  }
  /**
   * 检查是否支持暗黑模式
   */
  isDarkMode() {
    return this.features?.preferences.darkMode ?? false;
  }
  /**
   * 检查是否偏好减少动画
   */
  prefersReducedMotion() {
    return this.features?.preferences.reducedMotion ?? false;
  }
  /**
   * 检查是否支持 WebP
   */
  supportsWebP() {
    return this.features?.media.webp ?? false;
  }
  /**
   * 检查是否支持 AVIF
   */
  supportsAVIF() {
    return this.features?.media.avif ?? false;
  }
  /**
   * 获取 CPU 核心数
   */
  getCPUCores() {
    return this.features?.hardware.cpuCores ?? 1;
  }
  /**
   * 获取设备内存（GB）
   */
  getDeviceMemory() {
    return this.features?.hardware.deviceMemory ?? 0;
  }
  /**
   * 销毁模块
   */
  async destroy() {
    this.removeMediaQueryListeners();
    this.removeAllListeners();
    this.features = null;
    this.isInitialized = false;
  }
  /**
   * 检测所有特性
   */
  async detectFeatures() {
    return {
      storage: this.detectStorage(),
      media: await this.detectMediaSupport(),
      css: this.detectCSSFeatures(),
      apis: this.detectAPIs(),
      pwa: this.detectPWACapabilities(),
      sensors: this.detectSensors(),
      preferences: this.detectPreferences(),
      capabilities: this.detectCapabilities(),
      hardware: this.detectHardware()
    };
  }
  /**
   * 检测存储支持
   */
  detectStorage() {
    return {
      localStorage: this.checkLocalStorage(),
      sessionStorage: this.checkSessionStorage(),
      indexedDB: this.checkIndexedDB(),
      cookies: this.checkCookies(),
      cacheAPI: "caches" in window,
      fileSystemAccess: "showOpenFilePicker" in window
    };
  }
  /**
   * 检测媒体格式支持
   */
  async detectMediaSupport() {
    return {
      webp: await this.checkImageFormat("webp"),
      avif: await this.checkImageFormat("avif"),
      jxl: false,
      // JPEG XL 还没有广泛支持
      heic: false,
      // HEIC 主要在 iOS Safari 中支持
      webm: this.checkVideoFormat("video/webm"),
      mp4: this.checkVideoFormat("video/mp4"),
      hls: this.checkHLSSupport()
    };
  }
  /**
   * 检测 API 支持
   */
  detectAPIs() {
    return {
      serviceWorker: "serviceWorker" in navigator,
      webWorker: typeof Worker !== "undefined",
      webRTC: "RTCPeerConnection" in window,
      webSocket: "WebSocket" in window,
      webGL: this.checkWebGL(),
      webGL2: this.checkWebGL2(),
      webGPU: "gpu" in navigator,
      webAssembly: typeof WebAssembly !== "undefined",
      webXR: "xr" in navigator,
      webAudio: "AudioContext" in window || "webkitAudioContext" in window,
      intersectionObserver: "IntersectionObserver" in window,
      resizeObserver: "ResizeObserver" in window,
      mutationObserver: "MutationObserver" in window
    };
  }
  /**
   * 检测传感器支持
   */
  detectSensors() {
    return {
      accelerometer: "Accelerometer" in window,
      gyroscope: "Gyroscope" in window,
      magnetometer: "Magnetometer" in window,
      ambientLight: "AmbientLightSensor" in window
    };
  }
  /**
   * 检测 CSS 特性支持
   */
  detectCSSFeatures() {
    if (typeof window === "undefined" || !CSS || !CSS.supports) {
      return {
        grid: false,
        flexbox: false,
        cssVariables: false,
        containerQueries: false,
        hasSelector: false,
        subgrid: false
      };
    }
    return {
      grid: CSS.supports("display", "grid"),
      flexbox: CSS.supports("display", "flex"),
      cssVariables: CSS.supports("--test", "value"),
      containerQueries: CSS.supports("container-type", "inline-size"),
      hasSelector: CSS.supports("selector(:has(div))"),
      subgrid: CSS.supports("grid-template-rows", "subgrid")
    };
  }
  /**
   * 检测 PWA 能力
   */
  detectPWACapabilities() {
    const pushNotifications = "PushManager" in window;
    const backgroundSync = "sync" in (ServiceWorkerRegistration.prototype || {});
    const periodicBackgroundSync = "periodicSync" in (ServiceWorkerRegistration.prototype || {});
    const installable = "onbeforeinstallprompt" in window;
    return {
      pushNotifications,
      backgroundSync,
      periodicBackgroundSync,
      installable
    };
  }
  /**
   * 检测用户偏好
   */
  detectPreferences() {
    return {
      darkMode: this.checkDarkMode(),
      reducedMotion: this.checkReducedMotion(),
      reducedTransparency: this.checkReducedTransparency(),
      highContrast: this.checkHighContrast()
    };
  }
  /**
   * 检测设备能力
   */
  detectCapabilities() {
    return {
      touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      pointer: this.detectPointerType(),
      hover: this.checkHoverCapability(),
      vibration: "vibrate" in navigator,
      clipboard: "clipboard" in navigator,
      share: "share" in navigator,
      notifications: "Notification" in window
    };
  }
  /**
   * 检测硬件信息
   */
  detectHardware() {
    return {
      cpuCores: navigator.hardwareConcurrency || 1,
      deviceMemory: navigator.deviceMemory || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }
  /**
   * 检查 LocalStorage 支持
   */
  checkLocalStorage() {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * 检查 SessionStorage 支持
   */
  checkSessionStorage() {
    try {
      const test = "__test__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * 检查 IndexedDB 支持
   */
  checkIndexedDB() {
    return "indexedDB" in window;
  }
  /**
   * 检查 Cookies 支持
   */
  checkCookies() {
    return navigator.cookieEnabled;
  }
  /**
   * 检查图片格式支持
   */
  checkImageFormat(format) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width === 1);
      img.onerror = () => resolve(false);
      const formats = {
        webp: "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
        avif: "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A="
      };
      img.src = formats[format];
    });
  }
  /**
   * 检查视频格式支持
   */
  checkVideoFormat(mimeType) {
    const video = document.createElement("video");
    return video.canPlayType(mimeType) !== "";
  }
  /**
   * 检查 HLS 支持
   */
  checkHLSSupport() {
    const video = document.createElement("video");
    return video.canPlayType("application/vnd.apple.mpegurl") !== "";
  }
  /**
   * 检查 WebGL 支持
   */
  checkWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  }
  /**
   * 检查 WebGL2 支持
   */
  checkWebGL2() {
    try {
      const canvas = document.createElement("canvas");
      return !!canvas.getContext("webgl2");
    } catch {
      return false;
    }
  }
  /**
   * 检查暗黑模式
   */
  checkDarkMode() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  /**
   * 检查减少动画偏好
   */
  checkReducedMotion() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /**
   * 检查减少透明度偏好
   */
  checkReducedTransparency() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
  }
  /**
   * 检查高对比度偏好
   */
  checkHighContrast() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-contrast: high)").matches;
  }
  /**
   * 检测指针类型
   */
  detectPointerType() {
    if (typeof window === "undefined") return "none";
    if (window.matchMedia("(pointer: fine)").matches) return "fine";
    if (window.matchMedia("(pointer: coarse)").matches) return "coarse";
    return "none";
  }
  /**
   * 检查悬停能力
   */
  checkHoverCapability() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover)").matches;
  }
  /**
   * 设置媒体查询监听器
   */
  setupMediaQueryListeners() {
    if (typeof window === "undefined") return;
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const darkModeHandler = (e) => {
      if (this.features) {
        this.features.preferences.darkMode = e.matches;
        this.emit("darkModeChange", e.matches);
        this.emit("featureChange", this.features);
      }
    };
    darkModeQuery.addEventListener("change", darkModeHandler);
    this.mediaQueryListeners.set("darkMode", darkModeQuery);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotionHandler = (e) => {
      if (this.features) {
        this.features.preferences.reducedMotion = e.matches;
        this.emit("reducedMotionChange", e.matches);
        this.emit("featureChange", this.features);
      }
    };
    reducedMotionQuery.addEventListener("change", reducedMotionHandler);
    this.mediaQueryListeners.set("reducedMotion", reducedMotionQuery);
  }
  /**
   * 移除媒体查询监听器
   */
  removeMediaQueryListeners() {
    this.mediaQueryListeners.clear();
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.FeatureDetectionModule = FeatureDetectionModule;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=FeatureDetectionModule.cjs.map
