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

var index = require('./es/index.cjs');
var guard = require('./guard.cjs');
var resolver = require('./resolver.cjs');

class DeviceRouterPlugin {
  constructor(router, options = {}) {
    this.templateResolver = null;
    this.guardRemover = null;
    this.router = router;
    this.options = this.normalizeOptions(options);
    this.deviceDetector = index.createDeviceDetector();
    this.componentResolver = new resolver.DeviceComponentResolver(() => this.deviceDetector.detectDeviceType());
    this.deviceGuard = new guard.DeviceRouteGuard(() => this.deviceDetector.detectDeviceType(), this.options.guardOptions);
  }
  /**
   * 安装插件
   */
  install() {
    if (this.options.enableDeviceGuard) {
      this.guardRemover = this.router.beforeEach(this.deviceGuard.createGuard());
    }
    this.extendRouter();
    console.warn("DeviceRouterPlugin installed successfully");
  }
  /**
   * 卸载插件
   */
  uninstall() {
    if (this.guardRemover) {
      this.guardRemover();
      this.guardRemover = null;
    }
    if (this.templateResolver) {
      this.templateResolver.destroy();
    }
    console.warn("DeviceRouterPlugin uninstalled successfully");
  }
  /**
   * 扩展路由器功能
   */
  extendRouter() {
    const originalResolve = this.router.resolve.bind(this.router);
    this.router.resolve = (to, currentLocation) => {
      const resolved = originalResolve(to, currentLocation);
      if (this.options.enableDeviceDetection) {
        resolved.matched = resolved.matched.map((record) => {
          const resolution = this.componentResolver.resolveComponent(record);
          if (resolution) {
            const updatedRecord = {
              ...record
            };
            if (updatedRecord.components) {
              updatedRecord.components.default = resolution.component;
            }
            return updatedRecord;
          }
          return record;
        });
      }
      return resolved;
    };
  }
  /**
   * 获取当前设备类型
   */
  getCurrentDevice() {
    return this.deviceDetector.detectDeviceType();
  }
  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return this.deviceDetector.getDeviceInfo();
  }
  /**
   * 检查路由是否支持当前设备
   */
  isRouteSupported(routePath) {
    try {
      const resolved = this.router.resolve(routePath);
      const currentDevice = this.getCurrentDevice();
      const supportedDevices = resolved.meta.supportedDevices;
      if (!supportedDevices || supportedDevices.length === 0) {
        return true;
      }
      return supportedDevices.includes(currentDevice);
    } catch {
      return false;
    }
  }
  /**
   * 监听设备变化
   */
  onDeviceChange(callback) {
    const unsubscribe = this.deviceDetector.onChange((info) => {
      callback(info.type);
    });
    return unsubscribe;
  }
  /**
   * 标准化选项
   */
  normalizeOptions(options) {
    return {
      defaultSupportedDevices: ["mobile", "tablet", "desktop"],
      defaultUnsupportedMessage: "\u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u5728\u6B64\u8BBE\u5907\u4E0A\u67E5\u770B",
      defaultUnsupportedRedirect: "/device-unsupported",
      enableDeviceDetection: true,
      enableDeviceGuard: true,
      guardOptions: {},
      ...options
    };
  }
}
function createDeviceRouterPlugin(options) {
  return {
    install(router) {
      const plugin = new DeviceRouterPlugin(router, options);
      plugin.install();
      router.devicePlugin = plugin;
      return plugin;
    }
  };
}

exports.DeviceRouterPlugin = DeviceRouterPlugin;
exports.createDeviceRouterPlugin = createDeviceRouterPlugin;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.cjs.map
