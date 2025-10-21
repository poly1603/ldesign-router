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
import { safeNavigatorAccess } from '../utils/index.js';

class GeolocationModule extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = "geolocation";
    this.geolocationInfo = null;
    this.watchId = null;
    this.options = {
      enableHighAccuracy: true,
      timeout: 1e4,
      maximumAge: 3e5,
      // 5 minutes
      ...options
    };
  }
  /**
   * 初始化模块
   */
  async init() {
    if (typeof window === "undefined") return;
    if (!this.isSupported()) {
      return;
    }
    try {
      this.getCurrentPosition().catch((error) => {
        if (error.message !== "Permission denied") {
          console.warn("Failed to get initial position:", error);
        }
      });
    } catch (error) {
      if (error.message !== "Permission denied") {
        console.warn("Failed to get initial position:", error);
      }
    }
  }
  /**
   * 销毁模块
   */
  async destroy() {
    this.stopWatching();
  }
  /**
   * 获取地理位置信息
   */
  getData() {
    return this.geolocationInfo ? {
      ...this.geolocationInfo
    } : null;
  }
  /**
   * 检查是否支持地理位置 API
   */
  isSupported() {
    return safeNavigatorAccess((nav) => {
      const g = nav.geolocation;
      return !!(g && typeof g.getCurrentPosition === "function");
    }, false);
  }
  /**
   * 获取当前位置
   */
  async getCurrentPosition(options) {
    const positionOptions = options ? {
      ...this.options,
      ...options
    } : this.options;
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition((position) => {
        const info = this.parsePosition(position);
        this.geolocationInfo = info;
        this.emit("positionChange", info);
        resolve(info);
      }, (error) => {
        reject(this.parseGeolocationError(error));
      }, positionOptions);
    });
  }
  /**
   * 开始监听位置变化
   */
  startWatching(callback) {
    if (!this.isSupported()) {
      throw new Error("Geolocation API is not supported");
    }
    if (this.watchId !== null) {
      this.stopWatching();
    }
    this.watchId = navigator.geolocation.watchPosition((position) => {
      const info = this.parsePosition(position);
      this.geolocationInfo = info;
      this.emit("positionChange", info);
      callback?.(info);
    }, (error) => {
      console.error("Geolocation watch error:", this.parseGeolocationError(error));
    }, this.options);
  }
  /**
   * 停止监听位置变化
   */
  stopWatching() {
    if (this.watchId !== null && this.isSupported()) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  /**
   * 监听位置变化（别名方法，用于测试兼容性）
   */
  watchPosition(callback) {
    if (!this.isSupported()) {
      throw new Error("Geolocation API is not supported");
    }
    if (this.watchId !== null) {
      this.stopWatching();
    }
    this.watchId = navigator.geolocation.watchPosition((position) => {
      const info = this.parsePosition(position);
      this.geolocationInfo = info;
      this.emit("positionChange", info);
      callback(info);
    }, (error) => {
      console.error("Geolocation watch error:", this.parseGeolocationError(error));
    }, this.options);
    return this.watchId;
  }
  /**
   * 清除位置监听（别名方法，用于测试兼容性）
   */
  clearWatch(watchId) {
    if (this.isSupported()) {
      navigator.geolocation.clearWatch(watchId);
      if (this.watchId === watchId) {
        this.watchId = null;
      }
    }
  }
  /**
   * 获取纬度
   */
  getLatitude() {
    return this.geolocationInfo?.latitude ?? null;
  }
  /**
   * 获取经度
   */
  getLongitude() {
    return this.geolocationInfo?.longitude ?? null;
  }
  /**
   * 获取精度（米）
   */
  getAccuracy() {
    return this.geolocationInfo?.accuracy ?? null;
  }
  /**
   * 获取海拔（米）
   */
  getAltitude() {
    return this.geolocationInfo?.altitude ?? null;
  }
  /**
   * 获取海拔精度（米）
   */
  getAltitudeAccuracy() {
    return this.geolocationInfo?.altitudeAccuracy ?? null;
  }
  /**
   * 获取方向（度）
   */
  getHeading() {
    return this.geolocationInfo?.heading ?? null;
  }
  /**
   * 获取速度（米/秒）
   */
  getSpeed() {
    return this.geolocationInfo?.speed ?? null;
  }
  /**
   * 计算两点之间的距离（米）
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const \u03C61 = lat1 * Math.PI / 180;
    const \u03C62 = lat2 * Math.PI / 180;
    const \u0394\u03C6 = (lat2 - lat1) * Math.PI / 180;
    const \u0394\u03BB = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(\u0394\u03C6 / 2) * Math.sin(\u0394\u03C6 / 2) + Math.cos(\u03C61) * Math.cos(\u03C62) * Math.sin(\u0394\u03BB / 2) * Math.sin(\u0394\u03BB / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  /**
   * 计算与当前位置的距离
   */
  getDistanceFromCurrent(latitude, longitude) {
    if (!this.geolocationInfo) return null;
    return this.calculateDistance(this.geolocationInfo.latitude, this.geolocationInfo.longitude, latitude, longitude);
  }
  /**
   * 解析位置信息
   */
  parsePosition(position) {
    const {
      coords
    } = position;
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude ?? null,
      altitudeAccuracy: coords.altitudeAccuracy ?? null,
      heading: coords.heading ?? null,
      speed: coords.speed ?? null,
      // 一些测试期望包含时间戳
      timestamp: typeof position.timestamp === "number" ? position.timestamp : Date.now()
    };
  }
  /**
   * 解析地理位置错误
   */
  parseGeolocationError(error) {
    const errorMessages = {
      [error.PERMISSION_DENIED]: "Permission denied",
      [error.POSITION_UNAVAILABLE]: "Position unavailable",
      [error.TIMEOUT]: "Request timeout"
    };
    const message = errorMessages[error.code] || "An unknown error occurred";
    return new Error(message);
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { GeolocationModule };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=GeolocationModule.js.map
