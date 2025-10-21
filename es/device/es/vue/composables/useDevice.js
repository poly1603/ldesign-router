/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, readonly, computed, onMounted, onUnmounted } from 'vue';
import { DeviceDetector } from '../../core/DeviceDetector.js';
import 'node:process';

function useDevice(options = {}) {
  const deviceInfo = ref();
  const deviceType = ref("desktop");
  const orientation = ref("landscape");
  let detector = null;
  let isInitialized = false;
  let cleanupFunctions = [];
  const isMobile = readonly(computed(() => deviceType.value === "mobile"));
  const isTablet = readonly(computed(() => deviceType.value === "tablet"));
  const isDesktop = readonly(computed(() => deviceType.value === "desktop"));
  const isTouchDevice = readonly(computed(() => deviceInfo.value?.features?.touch ?? false));
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
      detector = new DeviceDetector(options);
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
  onMounted(() => {
    initDetector();
  });
  onUnmounted(() => {
    destroyDetector();
  });
  return {
    deviceType: readonly(deviceType),
    orientation: readonly(orientation),
    deviceInfo: readonly(deviceInfo),
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    refresh
  };
}
function useNetwork() {
  const networkInfo = ref(null);
  const isOnline = ref(true);
  const connectionType = ref("unknown");
  const isLoaded = ref(false);
  let detector = null;
  let networkModule = null;
  const loadModule = async () => {
    if (!detector) {
      detector = new DeviceDetector();
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
  onUnmounted(() => {
    destroyNetwork();
  });
  return {
    networkInfo: readonly(networkInfo),
    isOnline: readonly(isOnline),
    connectionType: readonly(connectionType),
    isLoaded: readonly(isLoaded),
    loadModule,
    unloadModule
  };
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { useDevice, useNetwork };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=useDevice.js.map
