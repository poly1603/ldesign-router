/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function checkDeviceSupport(route, currentDevice) {
  const supportedDevices = getSupportedDevicesFromRoute(route);
  if (!supportedDevices || supportedDevices.length === 0) {
    return true;
  }
  return supportedDevices.includes(currentDevice);
}
function getSupportedDevicesFromRoute(route) {
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
function resolveDeviceComponent(deviceComponents, currentDevice) {
  if (deviceComponents[currentDevice]) {
    return {
      component: deviceComponents[currentDevice],
      deviceType: currentDevice,
      isFallback: false,
      source: "deviceComponents"
    };
  }
  const fallbackOrder = ["desktop", "tablet", "mobile"];
  for (const fallbackDevice of fallbackOrder) {
    if (fallbackDevice !== currentDevice && deviceComponents[fallbackDevice]) {
      return {
        component: deviceComponents[fallbackDevice],
        deviceType: fallbackDevice,
        isFallback: true,
        source: "deviceComponents"
      };
    }
  }
  return null;
}
function createUnsupportedDeviceRoute(originalRoute, currentDevice, customMessage) {
  const message = customMessage || originalRoute.meta.unsupportedMessage || "\u5F53\u524D\u7CFB\u7EDF\u4E0D\u652F\u6301\u5728\u6B64\u8BBE\u5907\u4E0A\u67E5\u770B";
  if (originalRoute.meta.unsupportedRedirect) {
    return {
      path: originalRoute.meta.unsupportedRedirect,
      query: {
        from: originalRoute.fullPath,
        device: currentDevice,
        reason: "unsupported_device"
      }
    };
  }
  return {
    path: "/device-unsupported",
    query: {
      from: originalRoute.fullPath,
      device: currentDevice,
      message
    }
  };
}
function hasDeviceSpecificConfig(route) {
  if (route.meta.supportedDevices && route.meta.supportedDevices.length > 0) {
    return true;
  }
  for (const record of route.matched) {
    if (record.deviceComponents) {
      return true;
    }
    if (record.meta.supportedDevices && record.meta.supportedDevices.length > 0) {
      return true;
    }
  }
  return false;
}
function getDeviceFriendlyName(device) {
  const names = {
    mobile: "\u79FB\u52A8\u8BBE\u5907",
    tablet: "\u5E73\u677F\u8BBE\u5907",
    desktop: "\u684C\u9762\u8BBE\u5907",
    tv: "\u7535\u89C6\u8BBE\u5907",
    watch: "\u667A\u80FD\u624B\u8868",
    unknown: "\u672A\u77E5\u8BBE\u5907"
  };
  return names[device] || device;
}
function createDeviceInfo(device) {
  return {
    type: device,
    name: getDeviceFriendlyName(device),
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop"
  };
}
function isValidDeviceType(device) {
  return ["mobile", "tablet", "desktop"].includes(device);
}
function getDevicePriority(device) {
  const priorities = {
    desktop: 1,
    tablet: 2,
    mobile: 3,
    tv: 4,
    watch: 5,
    unknown: 999
  };
  return priorities[device] || 999;
}
function sortDevicesByPriority(devices) {
  return [...devices].sort((a, b) => getDevicePriority(a) - getDevicePriority(b));
}

export { checkDeviceSupport, createDeviceInfo, createUnsupportedDeviceRoute, getDeviceFriendlyName, getDevicePriority, getSupportedDevicesFromRoute, hasDeviceSpecificConfig, isValidDeviceType, resolveDeviceComponent, sortDevicesByPriority };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=utils.js.map
