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

class BatteryModule {
  constructor() {
    this.name = "battery";
    this.battery = null;
    this.eventHandlers = /* @__PURE__ */ new Map();
    this.customEventHandlers = /* @__PURE__ */ new Map();
    this.batteryInfo = this.getDefaultBatteryInfo();
  }
  /**
   * 初始化模块
   */
  async init() {
    if (typeof window === "undefined") return;
    try {
      this.battery = await index.safeNavigatorAccess(async (nav) => {
        if ("getBattery" in nav && nav.getBattery) {
          return await nav.getBattery();
        }
        const navAny = nav;
        return navAny.battery || navAny.mozBattery || navAny.webkitBattery;
      }, null);
      if (this.battery) {
        this.updateBatteryInfo();
        this.setupEventListeners();
      }
    } catch (error) {
      console.warn("Battery API not supported or failed to initialize:", error);
    }
  }
  /**
   * 销毁模块（优化：彻底清理所有引用）
   */
  async destroy() {
    this.removeEventListeners();
    this.battery = null;
    this.eventHandlers.clear();
    this.customEventHandlers.clear();
  }
  /**
   * 获取电池信息
   */
  getData() {
    this.updateBatteryInfo();
    return {
      ...this.batteryInfo
    };
  }
  /**
   * 获取电池电量（0-1）
   */
  getLevel() {
    return this.batteryInfo.level;
  }
  /**
   * 获取电池电量百分比（0-100）
   */
  getLevelPercentage() {
    return Math.round(this.batteryInfo.level * 100);
  }
  /**
   * 检查是否正在充电
   */
  isCharging() {
    return this.batteryInfo.charging;
  }
  /**
   * 获取充电时间（秒）
   */
  getChargingTime() {
    return this.batteryInfo.chargingTime;
  }
  /**
   * 获取放电时间（秒）
   */
  getDischargingTime() {
    return this.batteryInfo.dischargingTime;
  }
  /**
   * 获取充电时间（格式化）
   */
  getChargingTimeFormatted() {
    return this.formatTime(this.batteryInfo.chargingTime);
  }
  /**
   * 获取放电时间（格式化）
   */
  getDischargingTimeFormatted() {
    return this.formatTime(this.batteryInfo.dischargingTime);
  }
  /**
   * 检查电池是否电量低
   */
  isLowBattery(threshold = 0.2) {
    return this.batteryInfo.level <= threshold;
  }
  /**
   * 检查电池是否电量充足
   */
  isHighBattery(threshold = 0.8) {
    return this.batteryInfo.level >= threshold;
  }
  /**
   * 获取电池状态描述
   */
  getBatteryStatus() {
    if (this.batteryInfo.charging) {
      return "charging";
    }
    if (this.isLowBattery()) {
      return "low";
    }
    if (this.isHighBattery()) {
      return "high";
    }
    return "normal";
  }
  /**
   * 获取默认电池信息
   */
  getDefaultBatteryInfo() {
    return {
      level: 1,
      charging: false,
      chargingTime: Number.POSITIVE_INFINITY,
      dischargingTime: Number.POSITIVE_INFINITY
    };
  }
  /**
   * 更新电池信息
   */
  updateBatteryInfo() {
    if (!this.battery) return;
    const normalizeTime = (t) => {
      if (typeof t !== "number" || !Number.isFinite(t) || t < 0 || t === Number.MAX_VALUE) return Number.POSITIVE_INFINITY;
      return t;
    };
    this.batteryInfo = {
      level: typeof this.battery.level === "number" ? this.battery.level : 1,
      charging: !!this.battery.charging,
      chargingTime: normalizeTime(this.battery.chargingTime),
      dischargingTime: normalizeTime(this.battery.dischargingTime)
    };
    this.emit("batteryChange", this.batteryInfo);
  }
  /**
   * 格式化时间
   */
  formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "\u672A\u77E5";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (hours > 0) {
      return `${hours}\u5C0F\u65F6${minutes}\u5206\u949F`;
    }
    return `${minutes}\u5206\u949F`;
  }
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.battery || typeof this.battery.addEventListener !== "function") return;
    const events = ["chargingchange", "levelchange", "chargingtimechange", "dischargingtimechange"];
    events.forEach((event) => {
      const handler = () => {
        this.updateBatteryInfo();
      };
      this.eventHandlers.set(event, handler);
      if (this.battery) {
        this.battery.addEventListener(event, handler);
      }
    });
  }
  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    if (!this.battery || typeof this.battery.removeEventListener !== "function") return;
    this.eventHandlers.forEach((handler, event) => {
      if (this.battery) {
        this.battery.removeEventListener(event, handler);
      }
    });
    this.eventHandlers.clear();
  }
  /**
   * 添加自定义事件监听器
   */
  on(event, handler) {
    if (!this.customEventHandlers.has(event)) {
      this.customEventHandlers.set(event, /* @__PURE__ */ new Set());
    }
    this.customEventHandlers.get(event)?.add(handler);
  }
  /**
   * 移除自定义事件监听器
   */
  off(event, handler) {
    const handlers = this.customEventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.customEventHandlers.delete(event);
      }
    }
  }
  /**
   * 触发自定义事件
   */
  emit(event, data) {
    const handlers = this.customEventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.warn(`Error in battery event handler for ${event}:`, error);
        }
      });
    }
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.BatteryModule = BatteryModule;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=BatteryModule.cjs.map
