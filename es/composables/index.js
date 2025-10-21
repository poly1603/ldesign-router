/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { inject, ref, computed, onActivated, onDeactivated, onBeforeUnmount } from 'vue';
import { ROUTER_INJECTION_SYMBOL, ROUTE_INJECTION_SYMBOL } from '../core/constants.js';
export { useDeviceComponent } from './useDeviceComponent.js';
export { useDeviceRoute } from './useDeviceRoute.js';

function useRouter() {
  const router = inject(ROUTER_INJECTION_SYMBOL);
  if (!router) {
    throw new Error("useRouter() can only be used inside a component that has a router instance");
  }
  const isNavigating = ref(false);
  const routeHistory = ref([]);
  const enhancedRouter = Object.create(router);
  Object.assign(enhancedRouter, {
    // 导航状态
    isNavigating: computed(() => isNavigating.value),
    // 历史导航能力
    canGoBack: computed(() => window.history.length > 1),
    canGoForward: computed(() => {
      return false;
    }),
    // 路由历史
    routeHistory: computed(() => routeHistory.value),
    // 便捷方法：回到首页
    goHome: async () => {
      isNavigating.value = true;
      try {
        await router.push("/");
      } finally {
        isNavigating.value = false;
      }
    },
    // 便捷方法：刷新当前路由
    reload: async () => {
      const currentRoute = router.currentRoute.value;
      isNavigating.value = true;
      try {
        await router.replace({
          path: "/redirect",
          query: {
            to: currentRoute.fullPath
          }
        });
        await router.replace(currentRoute.fullPath);
      } finally {
        isNavigating.value = false;
      }
    },
    // 预取路由
    prefetch: async (to) => {
      try {
        const route = router.resolve(to);
        const matched = route.matched[route.matched.length - 1];
        const component = matched?.components?.default;
        if (component && typeof component === "function") {
          await component();
        }
      } catch (error) {
        console.warn("\u8DEF\u7531\u9884\u53D6\u5931\u8D25:", error);
      }
    }
  });
  const originalPush = router.push.bind(router);
  const originalReplace = router.replace.bind(router);
  enhancedRouter.push = async (...args) => {
    isNavigating.value = true;
    try {
      const result = await originalPush(...args);
      routeHistory.value.push(router.currentRoute.value);
      if (routeHistory.value.length > 50) {
        routeHistory.value.shift();
      }
      return result;
    } finally {
      isNavigating.value = false;
    }
  };
  enhancedRouter.replace = async (...args) => {
    isNavigating.value = true;
    try {
      return await originalReplace(...args);
    } finally {
      isNavigating.value = false;
    }
  };
  return enhancedRouter;
}
function useRoute() {
  const route = inject(ROUTE_INJECTION_SYMBOL);
  if (!route) {
    throw new Error("useRoute() can only be used inside a component that has a router instance");
  }
  const currentRoute = computed(() => {
    const r = route.value;
    if (!r) {
      return {
        path: "/",
        name: "",
        params: {},
        query: {},
        hash: "",
        fullPath: "/",
        matched: [],
        meta: {}
      };
    }
    return r;
  });
  const enhancedRoute = computed(() => ({
    ...currentRoute.value,
    // 判断是否是首页
    isHome: computed(() => currentRoute.value.path === "/"),
    // 判断是否是 404 页面
    isNotFound: computed(() => currentRoute.value.name === "NotFound" || currentRoute.value.matched.length === 0),
    // 生成面包屑
    breadcrumbs: computed(() => {
      return currentRoute.value.matched.map((record) => ({
        name: record.name || "",
        path: record.path,
        meta: record.meta || {}
      }));
    }),
    // 获取父路由
    parent: computed(() => {
      const matched = currentRoute.value.matched;
      return matched.length > 1 ? matched[matched.length - 2] : void 0;
    }),
    // 判断是否有参数
    hasParams: computed(() => Object.keys(currentRoute.value.params).length > 0),
    // 判断是否有查询参数
    hasQuery: computed(() => Object.keys(currentRoute.value.query).length > 0),
    // 获取所有参数键
    paramKeys: computed(() => Object.keys(currentRoute.value.params)),
    // 获取所有查询参数键
    queryKeys: computed(() => Object.keys(currentRoute.value.query)),
    // 获取匹配的路由名称
    matchedNames: computed(() => currentRoute.value.matched.map((r) => r.name).filter(Boolean)),
    // 获取路由深度
    depth: computed(() => currentRoute.value.matched.length),
    // 检查是否是指定路由
    is: (name) => {
      const names = Array.isArray(name) ? name : [name];
      return names.includes(currentRoute.value.name);
    },
    // 获取单个参数
    getParam: (key, defaultValue) => {
      return currentRoute.value.params[key] ?? defaultValue;
    },
    // 获取单个查询参数
    getQuery: (key, defaultValue) => {
      return currentRoute.value.query[key] ?? defaultValue;
    }
  }));
  return enhancedRoute.value;
}
function useParams() {
  const route = useRoute();
  return computed(() => route.value.params);
}
function useQuery() {
  const route = useRoute();
  return computed(() => route.value.query);
}
function useHash() {
  const route = useRoute();
  return computed(() => route.value.hash);
}
function useMeta() {
  const route = useRoute();
  return computed(() => route.value.meta);
}
function useMatched() {
  const route = useRoute();
  return computed(() => route.value.matched);
}
function useNavigation() {
  const router = useRouter();
  const isNavigating = ref(false);
  const direction = ref("unknown");
  const lastNavigationTime = ref(0);
  return {
    /**
     * 导航到指定路由
     */
    push: router.push.bind(router),
    /**
     * 替换当前路由
     */
    replace: router.replace.bind(router),
    /**
     * 历史导航
     */
    go: router.go.bind(router),
    /**
     * 后退
     */
    back: router.back.bind(router),
    /**
     * 前进
     */
    forward: router.forward.bind(router),
    /**
     * 导航状态
     */
    isNavigating: computed(() => isNavigating.value),
    direction: computed(() => direction.value),
    lastNavigationTime: computed(() => lastNavigationTime.value)
  };
}
function onBeforeRouteUpdate(guard) {
  const router = useRouter();
  const route = useRoute();
  let removeGuard;
  const setupGuard = () => {
    removeGuard = router.beforeEach((to, from, next) => {
      const lastMatchedRecord = route.value.matched[route.value.matched.length - 1];
      if (lastMatchedRecord && to.matched.includes(lastMatchedRecord)) {
        guard(to, from, next);
      } else {
        next();
      }
    });
  };
  const cleanupGuard = () => {
    if (removeGuard) {
      removeGuard();
      removeGuard = void 0;
    }
  };
  onActivated(setupGuard);
  onDeactivated(cleanupGuard);
  onBeforeUnmount(cleanupGuard);
  setupGuard();
}
function onBeforeRouteLeave(guard) {
  const router = useRouter();
  const route = useRoute();
  let removeGuard;
  const setupGuard = () => {
    removeGuard = router.beforeEach((to, from, next) => {
      const lastMatchedRecord = route.value.matched[route.value.matched.length - 1];
      if (lastMatchedRecord && from.matched.includes(lastMatchedRecord) && !to.matched.includes(lastMatchedRecord)) {
        guard(to, from, next);
      } else {
        next();
      }
    });
  };
  const cleanupGuard = () => {
    if (removeGuard) {
      removeGuard();
      removeGuard = void 0;
    }
  };
  onActivated(setupGuard);
  onDeactivated(cleanupGuard);
  onBeforeUnmount(cleanupGuard);
  setupGuard();
}
function useLink(options) {
  const router = useRouter();
  const currentRoute = useRoute();
  const to = computed(() => {
    if (!options.to) {
      return "";
    }
    if (typeof options.to === "string") {
      return options.to;
    } else if (typeof options.to === "object" && options.to && "value" in options.to) {
      return options.to.value;
    } else {
      return options.to;
    }
  });
  const route = computed(() => {
    return router.resolve(to.value, currentRoute.value);
  });
  const href = computed(() => {
    return route.value?.fullPath || "#";
  });
  const isActive = computed(() => {
    if (!route.value || !currentRoute.value) return false;
    return currentRoute.value.path.startsWith(route.value.path);
  });
  const isExactActive = computed(() => {
    if (!route.value || !currentRoute.value) return false;
    return currentRoute.value.path === route.value.path && JSON.stringify(currentRoute.value.query) === JSON.stringify(route.value.query) && currentRoute.value.hash === route.value.hash;
  });
  const navigate = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (options.replace) {
      await router.replace(to.value);
    } else {
      await router.push(to.value);
    }
  };
  return {
    href,
    route,
    isActive,
    isExactActive,
    navigate
  };
}
function hasRouter() {
  try {
    inject(ROUTER_INJECTION_SYMBOL);
    return true;
  } catch {
    return false;
  }
}
function hasRoute() {
  try {
    inject(ROUTE_INJECTION_SYMBOL);
    return true;
  } catch {
    return false;
  }
}
var index = {
  useRouter,
  useRoute,
  useParams,
  useQuery,
  useHash,
  useMeta,
  useMatched,
  useNavigation,
  useLink,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  hasRouter,
  hasRoute
};

export { index as default, hasRoute, hasRouter, onBeforeRouteLeave, onBeforeRouteUpdate, useHash, useLink, useMatched, useMeta, useNavigation, useParams, useQuery, useRoute, useRouter };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
