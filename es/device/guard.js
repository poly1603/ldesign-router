/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class DeviceRouteGuard {
  constructor(getCurrentDevice, options = {}) {
    this.defaultCheckSupportedDevices = (supportedDevices, currentDevice, _route) => {
      return supportedDevices.includes(currentDevice);
    };
    this.defaultOnUnsupportedDevice = (currentDevice, route) => {
      if (route.meta.unsupportedRedirect) {
        return {
          path: route.meta.unsupportedRedirect,
          query: {
            from: route.fullPath,
            device: currentDevice,
            reason: "unsupported_device"
          }
        };
      }
      return {
        path: "/device-unsupported",
        query: {
          from: route.fullPath,
          device: currentDevice,
          message: route.meta.unsupportedMessage || "\u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u5728\u6B64\u8BBE\u5907\u4E0A\u67E5\u770B"
        }
      };
    };
    this.getCurrentDevice = getCurrentDevice;
    this.options = {
      checkSupportedDevices: this.defaultCheckSupportedDevices,
      onUnsupportedDevice: this.defaultOnUnsupportedDevice,
      ...options
    };
  }
  /**
   * 创建导航守卫
   */
  createGuard() {
    return async (to, _from, next) => {
      const currentDevice = this.getCurrentDevice();
      const supportedDevices = this.getSupportedDevices(to);
      if (!supportedDevices || supportedDevices.length === 0) {
        next();
        return;
      }
      const isSupported = this.options.checkSupportedDevices(supportedDevices, currentDevice, to);
      if (isSupported) {
        next();
      } else {
        const result = this.options.onUnsupportedDevice(currentDevice, to);
        if (result) {
          next(result);
        } else {
          next(false);
        }
      }
    };
  }
  /**
   * 获取路由支持的设备类型
   */
  getSupportedDevices(route) {
    if (route.meta.supportedDevices) {
      return route.meta.supportedDevices;
    }
    for (const record of route.matched) {
      if (record.meta.supportedDevices) {
        return record.meta.supportedDevices;
      }
    }
    return void 0;
  }
}
function createDeviceGuard(getCurrentDevice, options) {
  const guard = new DeviceRouteGuard(getCurrentDevice, options);
  return guard.createGuard();
}

export { DeviceRouteGuard, createDeviceGuard };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=guard.js.map
