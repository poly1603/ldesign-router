/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import { ROUTER_INJECTION_SYMBOL, ROUTE_INJECTION_SYMBOL } from '../core/constants.js';
import { getDeviceFriendlyName, checkDeviceSupport } from '../device/utils.js';

function useRoute() {
  const route = inject(ROUTE_INJECTION_SYMBOL);
  if (!route) {
    throw new Error("useRoute() can only be used inside a component that has a router instance");
  }
  return route;
}
function useRouter() {
  const router = inject(ROUTER_INJECTION_SYMBOL);
  if (!router) {
    throw new Error("useRouter() can only be used inside a component that has a router instance");
  }
  return router;
}
function useDeviceRoute(options = {}) {
  const {
    autoDetect = true,
    autoRecheck = true
  } = options;
  const router = useRouter();
  const route = useRoute();
  const devicePlugin = router.devicePlugin;
  if (!devicePlugin) {
    console.warn("DeviceRouterPlugin not found. Please install the plugin first.");
  }
  const currentDevice = ref("desktop");
  if (devicePlugin && autoDetect) {
    currentDevice.value = devicePlugin.getCurrentDevice();
  }
  const currentDeviceName = computed(() => {
    return getDeviceFriendlyName(currentDevice.value);
  });
  const isCurrentRouteSupported = computed(() => {
    return checkDeviceSupport(route.value, currentDevice.value);
  });
  const supportedDevices = computed(() => {
    const meta = route.value.meta;
    if (meta.supportedDevices && Array.isArray(meta.supportedDevices)) {
      return meta.supportedDevices;
    }
    for (const record of route.value.matched) {
      if (record.meta.supportedDevices && Array.isArray(record.meta.supportedDevices)) {
        return record.meta.supportedDevices;
      }
    }
    return ["mobile", "tablet", "desktop"];
  });
  const isRouteSupported = (_path) => {
    if (!devicePlugin) return true;
    return devicePlugin.isSupported(currentDevice.value);
  };
  const isRouteSupportedOnDevice = (path, device) => {
    try {
      const resolved = router.resolve(path);
      const supportedDevices2 = resolved.meta.supportedDevices;
      if (!supportedDevices2 || supportedDevices2.length === 0) {
        return true;
      }
      return supportedDevices2.includes(device);
    } catch {
      return false;
    }
  };
  const getDeviceInfo = () => {
    if (devicePlugin) {
      return devicePlugin.getDeviceInfo();
    }
    return {
      type: "desktop",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      screenWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
      screenHeight: typeof window !== "undefined" ? window.innerHeight : 1080
    };
  };
  const onDeviceChange = (_callback) => {
    if (!devicePlugin) {
      return () => {
      };
    }
    return () => {
    };
  };
  const goToUnsupportedPage = (message) => {
    const query = {
      from: route.value.fullPath,
      device: currentDevice.value
    };
    if (message) {
      query.message = message;
    }
    router.push({
      path: "/device-unsupported",
      query
    });
  };
  if (autoRecheck) {
    watch(currentDevice, (newDevice) => {
      if (!isCurrentRouteSupported.value) {
        console.warn(`Current route is not supported on ${newDevice}`);
      }
    });
  }
  let unwatch = null;
  onMounted(() => {
    if (devicePlugin && autoDetect) {
      unwatch = onDeviceChange();
    }
  });
  onUnmounted(() => {
    if (unwatch) {
      unwatch();
    }
  });
  const deviceType = computed(() => currentDevice.value);
  const isMobile = computed(() => currentDevice.value === "mobile");
  const isTablet = computed(() => currentDevice.value === "tablet");
  const isDesktop = computed(() => currentDevice.value === "desktop");
  return {
    currentDevice,
    deviceType,
    currentDeviceName,
    isMobile,
    isTablet,
    isDesktop,
    isCurrentRouteSupported,
    supportedDevices,
    isRouteSupported,
    isRouteSupportedOnDevice,
    getDeviceInfo,
    onDeviceChange,
    goToUnsupportedPage
  };
}

export { useDeviceRoute };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=useDeviceRoute.js.map
