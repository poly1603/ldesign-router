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

var vue = require('vue');
var DeviceDetector = require('../../core/DeviceDetector.cjs');
require('node:process');

function useDevice(options = {}) {
  const deviceInfo = vue.ref();
  const deviceType = vue.ref("desktop");
  const orientation = vue.ref("landscape");
  let detector = null;
  let isInitialized = false;
  let cleanupFunctions = [];
  const isMobile = vue.readonly(vue.computed(() => deviceType.value === "mobile"));
  const isTablet = vue.readonly(vue.computed(() => deviceType.value === "tablet"));
  const isDesktop = vue.readonly(vue.computed(() => deviceType.value === "desktop"));
  const isTouchDevice = vue.readonly(vue.computed(() => deviceInfo.value?.features?.touch ?? false));
  const updateDeviceInfo = (info) => {
    if (deviceInfo.value?.type !== info.type) {
      deviceType.value = info.type;
    }
    if (deviceInfo.value?.orientation !== info.orientation) {
      orientation.value = info.orientation;
    }
    deviceInfo.value = info;
  };
  const refresh = () => {
    if (detector && isInitialized) {
      const currentInfo = detector.getDeviceInfo();
      updateDeviceInfo(currentInfo);
    }
  };
  const initDetector = () => {
    if (detector || isInitialized) {
      return;
    }
    try {
      detector = new DeviceDetector.DeviceDetector(options);
      isInitialized = true;
      updateDeviceInfo(detector.getDeviceInfo());
      const deviceChangeHandler = (info) => {
        updateDeviceInfo(info);
      };
      const orientationChangeHandler = (newOrientation) => {
        if (orientation.value !== newOrientation) {
          orientation.value = newOrientation;
        }
      };
      detector.on("deviceChange", deviceChangeHandler);
      detector.on("orientationChange", orientationChangeHandler);
      cleanupFunctions.push(() => detector?.off("deviceChange", deviceChangeHandler), () => detector?.off("orientationChange", orientationChangeHandler));
    } catch (error) {
      console.error("Failed to initialize device detector:", error);
      isInitialized = false;
    }
  };
  const destroyDetector = async () => {
    try {
      cleanupFunctions.forEach((cleanup) => cleanup());
      cleanupFunctions = [];
      if (detector) {
        await detector.destroy();
        detector = null;
      }
      isInitialized = false;
    } catch (error) {
      console.error("Failed to destroy device detector:", error);
    }
  };
  vue.onMounted(() => {
    initDetector();
  });
  vue.onUnmounted(() => {
    destroyDetector();
  });
  return {
    deviceType: vue.readonly(deviceType),
    orientation: vue.readonly(orientation),
    deviceInfo: vue.readonly(deviceInfo),
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    refresh
  };
}
function useNetwork() {
  const networkInfo = vue.ref(null);
  const isOnline = vue.ref(true);
  const connectionType = vue.ref("unknown");
  const isLoaded = vue.ref(false);
  let detector = null;
  let networkModule = null;
  const loadModule = async () => {
    if (!detector) {
      detector = new DeviceDetector.DeviceDetector();
    }
    try {
      networkModule = await detector.loadModule("network");
      if (networkModule && typeof networkModule.getData === "function") {
        networkInfo.value = networkModule.getData();
        isOnline.value = networkInfo.value?.status === "online";
        connectionType.value = networkInfo.value?.type || "unknown";
        isLoaded.value = true;
      }
    } catch (error) {
      console.warn("Failed to load network module:", error);
      throw error;
    }
  };
  const unloadModule = async () => {
    if (detector) {
      await detector.unloadModule("network");
      networkModule = null;
      networkInfo.value = null;
      isLoaded.value = false;
    }
  };
  const destroyNetwork = async () => {
    if (detector) {
      await detector.destroy();
      detector = null;
      networkModule = null;
    }
  };
  vue.onUnmounted(() => {
    destroyNetwork();
  });
  return {
    networkInfo: vue.readonly(networkInfo),
    isOnline: vue.readonly(isOnline),
    connectionType: vue.readonly(connectionType),
    isLoaded: vue.readonly(isLoaded),
    loadModule,
    unloadModule
  };
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.useDevice = useDevice;
exports.useNetwork = useNetwork;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=useDevice.cjs.map
