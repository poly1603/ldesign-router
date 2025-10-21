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
var index = require('../utils/index.cjs');

class NetworkModule extends EventEmitter.EventEmitter {
  constructor() {
    super();
    this.name = "network";
    this.connection = null;
    this.networkInfo = this.detectNetworkInfo();
  }
  /**
   * 初始化模块
   */
  async init() {
    if (typeof window === "undefined") return;
    this.connection = index.safeNavigatorAccess((nav) => {
      const navAny = nav;
      return navAny.connection || navAny.mozConnection || navAny.webkitConnection;
    }, null);
    this.setupEventListeners();
    this.updateNetworkInfo();
  }
  /**
   * 销毁模块（优化：彻底清理所有引用）
   */
  async destroy() {
    this.removeEventListeners();
    this.connection = null;
    this.onlineHandler = void 0;
    this.offlineHandler = void 0;
    this.changeHandler = void 0;
  }
  /**
   * 获取网络信息
   */
  getData() {
    return {
      ...this.networkInfo
    };
  }
  /**
   * 获取网络信息（别名方法，用于测试兼容性）
   */
  getNetworkInfo() {
    const connection = this.connection ?? index.safeNavigatorAccess((nav) => {
      const navAny = nav;
      return navAny.connection || navAny.mozConnection || navAny.webkitConnection;
    }, null);
    const online = typeof navigator !== "undefined" ? !!navigator.onLine : true;
    const effectiveType = connection?.effectiveType || connection?.type || "unknown";
    const status = online ? "online" : "offline";
    const info = {
      status,
      type: this.parseConnectionType(effectiveType),
      online,
      effectiveType,
      supported: !!connection
    };
    info.downlink = typeof connection?.downlink === "number" ? connection.downlink : 0;
    info.rtt = typeof connection?.rtt === "number" ? Math.max(0, connection.rtt) : 0;
    if (typeof connection?.saveData === "boolean") info.saveData = connection.saveData;
    return info;
  }
  /**
   * 获取网络连接状态
   */
  getStatus() {
    return this.networkInfo.status;
  }
  /**
   * 获取网络连接类型
   */
  getConnectionType() {
    return this.networkInfo.type;
  }
  /**
   * 获取下载速度（Mbps）
   */
  getDownlink() {
    return this.networkInfo.downlink;
  }
  /**
   * 获取往返时间（毫秒）
   */
  getRTT() {
    return this.networkInfo.rtt;
  }
  /**
   * 是否为计量连接
   */
  isSaveData() {
    return this.networkInfo.saveData;
  }
  /**
   * 检查是否在线
   */
  isOnline() {
    return this.networkInfo.status === "online";
  }
  /**
   * 检查是否离线
   */
  isOffline() {
    return this.networkInfo.status === "offline";
  }
  /**
   * 检测网络信息
   */
  detectNetworkInfo() {
    if (typeof window === "undefined") {
      return {
        status: "online",
        type: "unknown",
        online: true,
        effectiveType: "unknown",
        supported: false
      };
    }
    const status = navigator.onLine ? "online" : "offline";
    const connection = index.safeNavigatorAccess((nav) => {
      const navAny = nav;
      return navAny.connection || navAny.mozConnection || navAny.webkitConnection;
    }, null);
    const info = {
      online: status === "online",
      effectiveType: connection?.effectiveType || connection?.type || "unknown",
      supported: !!connection,
      // 扩展字段（内部使用）
      status,
      type: this.parseConnectionType(connection?.effectiveType || connection?.type)
    };
    if (connection) {
      if (typeof connection.downlink === "number") {
        info.downlink = connection.downlink;
      } else {
        info.downlink = 0;
      }
      if (typeof connection.rtt === "number") {
        info.rtt = Math.max(0, connection.rtt);
      } else {
        info.rtt = 0;
      }
      if (typeof connection.saveData === "boolean") {
        info.saveData = connection.saveData;
      }
    } else {
      info.downlink = 0;
      info.rtt = 0;
    }
    return info;
  }
  /**
   * 解析连接类型
   */
  parseConnectionType(type) {
    if (!type) return "unknown";
    const typeMap = {
      "slow-2g": "cellular",
      "2g": "cellular",
      "3g": "cellular",
      "4g": "cellular",
      "5g": "cellular",
      "wifi": "wifi",
      "ethernet": "ethernet",
      "bluetooth": "bluetooth"
    };
    return typeMap[type.toLowerCase()] || "unknown";
  }
  /**
   * 更新网络信息
   */
  updateNetworkInfo() {
    const oldInfo = this.networkInfo;
    const newInfo = this.detectNetworkInfo();
    const hasChanged = oldInfo.online !== newInfo.online || oldInfo.status !== newInfo.status || oldInfo.type !== newInfo.type || oldInfo.effectiveType !== newInfo.effectiveType || oldInfo.downlink !== newInfo.downlink || oldInfo.rtt !== newInfo.rtt || oldInfo.saveData !== newInfo.saveData;
    this.networkInfo = newInfo;
    if (hasChanged) {
      this.emit("networkChange", this.getNetworkInfo());
    }
  }
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (typeof window === "undefined") return;
    this.onlineHandler = () => {
      this.updateNetworkInfo();
    };
    this.offlineHandler = () => {
      this.updateNetworkInfo();
    };
    window.addEventListener("online", this.onlineHandler);
    window.addEventListener("offline", this.offlineHandler);
    window.ononline = this.onlineHandler;
    window.onoffline = this.offlineHandler;
    if (this.connection && "addEventListener" in this.connection) {
      this.changeHandler = () => {
        this.updateNetworkInfo();
      };
      if (this.connection?.addEventListener) {
        this.connection.addEventListener("change", this.changeHandler);
      }
    }
  }
  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    if (typeof window === "undefined") return;
    if (this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      window.ononline = null;
      this.onlineHandler = void 0;
    }
    if (this.offlineHandler) {
      window.removeEventListener("offline", this.offlineHandler);
      window.onoffline = null;
      this.offlineHandler = void 0;
    }
    if (this.connection?.removeEventListener && this.changeHandler) {
      this.connection.removeEventListener("change", this.changeHandler);
      this.changeHandler = void 0;
    }
    this.connection = null;
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.NetworkModule = NetworkModule;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=NetworkModule.cjs.map
