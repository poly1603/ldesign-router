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

class DeviceComponentResolver {
  constructor(getCurrentDevice) {
    this.getCurrentDevice = getCurrentDevice;
  }
  /**
   * 解析路由记录的组件
   */
  resolveComponent(record, viewName = "default") {
    const currentDevice = this.getCurrentDevice();
    const deviceComponentResult = this.resolveDeviceSpecificComponentWithFallback(record, currentDevice);
    if (deviceComponentResult) {
      return {
        component: deviceComponentResult.component,
        deviceType: deviceComponentResult.deviceType,
        isFallback: deviceComponentResult.isFallback,
        source: "deviceComponents"
      };
    }
    const regularComponent = this.resolveRegularComponent(record, viewName);
    if (regularComponent) {
      return {
        component: regularComponent,
        deviceType: currentDevice,
        isFallback: false,
        source: "component"
      };
    }
    return null;
  }
  /**
   * 解析设备特定组件
   */
  // 解析设备特定组件，预留扩展接口
  // private resolveDeviceSpecificComponent(
  //   record: RouteRecordNormalized,
  //   device: DeviceType,
  // ): RouteComponent | null {
  //   // 检查路由记录是否有设备特定组件配置
  //   const deviceComponents = (record as any).deviceComponents
  //   if (!deviceComponents) {
  //     return null
  //   }
  //   // 优先使用当前设备的组件
  //   if (deviceComponents[device]) {
  //     return deviceComponents[device]
  //   }
  //   // 回退策略：desktop -> tablet -> mobile
  //   const fallbackOrder: DeviceType[] = ['desktop', 'tablet', 'mobile']
  //   for (const fallbackDevice of fallbackOrder) {
  //     if (fallbackDevice !== device && deviceComponents[fallbackDevice]) {
  //       return deviceComponents[fallbackDevice]
  //     }
  //   }
  //   return null
  // }
  /**
   * 解析设备特定组件（包含回退信息）
   */
  resolveDeviceSpecificComponentWithFallback(record, device) {
    const deviceComponents = record.deviceComponents;
    if (!deviceComponents || typeof deviceComponents !== "object") {
      return null;
    }
    if (deviceComponents[device]) {
      return {
        component: deviceComponents[device],
        deviceType: device,
        isFallback: false
      };
    }
    const fallbackOrder = ["desktop", "tablet", "mobile"];
    for (const fallbackDevice of fallbackOrder) {
      if (fallbackDevice !== device && deviceComponents[fallbackDevice]) {
        return {
          component: deviceComponents[fallbackDevice],
          deviceType: fallbackDevice,
          isFallback: true
        };
      }
    }
    return null;
  }
  /**
   * 解析常规组件
   */
  resolveRegularComponent(record, viewName) {
    if (!record.components) {
      return null;
    }
    return record.components[viewName] || null;
  }
  /**
   * 创建错误组件
   */
  // createErrorComponent method removed
  /**
   * 检查组件是否支持当前设备
   */
  isComponentSupportedOnDevice(record, device) {
    const deviceComponents = record.deviceComponents;
    if (deviceComponents) {
      return !!deviceComponents[device] || this.hasAnyDeviceComponent(deviceComponents);
    }
    return !!record.components;
  }
  /**
   * 检查是否有任何设备组件可用作回退
   */
  hasAnyDeviceComponent(deviceComponents) {
    const devices = ["desktop", "tablet", "mobile"];
    return devices.some((device) => !!deviceComponents[device]);
  }
}
function createDeviceComponentResolver(getCurrentDevice) {
  return new DeviceComponentResolver(getCurrentDevice);
}

exports.DeviceComponentResolver = DeviceComponentResolver;
exports.createDeviceComponentResolver = createDeviceComponentResolver;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=resolver.cjs.map
