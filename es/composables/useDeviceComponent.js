/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, computed, watch, inject } from 'vue';
import { ROUTE_INJECTION_SYMBOL } from '../core/constants.js';
import { useDeviceRoute } from './useDeviceRoute.js';

function useRoute() {
  const route = inject(ROUTE_INJECTION_SYMBOL);
  if (!route) {
    throw new Error("useRoute() can only be used inside a component that has a router instance");
  }
  return route;
}
function useDeviceComponent(options = {}) {
  const {
    viewName = "default",
    autoResolve = true,
    fallbackComponent
  } = options;
  const route = useRoute();
  const {
    currentDevice
  } = useDeviceRoute();
  const loading = ref(false);
  const error = ref(null);
  const getDeviceComponent = (device) => {
    const currentRecord = route.value.matched[route.value.matched.length - 1];
    if (!currentRecord) return null;
    const deviceComponents = currentRecord.deviceComponents;
    return deviceComponents?.[device] || null;
  };
  const resolution = computed(() => {
    const currentRecord = route.value.matched[route.value.matched.length - 1];
    if (!currentRecord) return null;
    try {
      const deviceComponents = currentRecord.deviceComponents;
      if (deviceComponents) {
        const deviceComponent = getDeviceComponent(currentDevice.value);
        if (deviceComponent) {
          return {
            component: deviceComponent,
            deviceType: currentDevice.value,
            isFallback: false,
            source: "deviceComponents"
          };
        }
        const fallbackOrder = ["desktop", "tablet", "mobile"];
        for (const fallbackDevice of fallbackOrder) {
          if (fallbackDevice !== currentDevice.value) {
            const fallbackComp = deviceComponents[fallbackDevice];
            if (fallbackComp) {
              return {
                component: fallbackComp,
                deviceType: fallbackDevice,
                isFallback: true,
                source: "deviceComponents"
              };
            }
          }
        }
      }
      if (currentRecord.components && currentRecord.components[viewName]) {
        return {
          component: currentRecord.components[viewName],
          deviceType: currentDevice.value,
          isFallback: false,
          source: "component"
        };
      }
      return null;
    } catch (err) {
      error.value = err;
      return null;
    }
  });
  const resolvedComponent = computed(() => {
    if (resolution.value) {
      return resolution.value.component;
    }
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return null;
  });
  const resolveComponent = async () => {
    loading.value = true;
    error.value = null;
    try {
      const comp = resolvedComponent.value;
      if (!comp) return null;
      if (typeof comp === "function") {
        const loadedComp = typeof comp === "function" && "then" in comp ? await comp() : comp;
        return loadedComp;
      }
      return comp;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      loading.value = false;
    }
  };
  const hasDeviceComponent = (device) => {
    const currentRecord = route.value.matched[route.value.matched.length - 1];
    if (!currentRecord) return false;
    const deviceComponents = currentRecord.deviceComponents;
    return !!(deviceComponents && deviceComponents[device]);
  };
  if (autoResolve) {
    watch([route, currentDevice], () => {
      if (resolvedComponent.value) {
        resolveComponent();
      }
    }, {
      immediate: true
    });
  }
  return {
    resolvedComponent,
    resolution,
    loading,
    error,
    resolveComponent,
    hasDeviceComponent,
    getDeviceComponent
  };
}

export { useDeviceComponent };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=useDeviceComponent.js.map
