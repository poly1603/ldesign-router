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

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var constants = require('../core/constants.cjs');
var useDeviceComponent = require('./useDeviceComponent.cjs');
var useDeviceRoute = require('./useDeviceRoute.cjs');

function useRouter() {
  const router = vue.inject(constants.ROUTER_INJECTION_SYMBOL);
  if (!router) {
    throw new Error("useRouter() can only be used inside a component that has a router instance");
  }
  const isNavigating = vue.ref(false);
  const routeHistory = vue.ref([]);
  const enhancedRouter = Object.create(router);
  Object.assign(enhancedRouter, {
    // 导航状态
    isNavigating: vue.computed(() => isNavigating.value),
    // 历史导航能力
    canGoBack: vue.computed(() => window.history.length > 1),
    canGoForward: vue.computed(() => {
      return false;
    }),
    // 路由历史
    routeHistory: vue.computed(() => routeHistory.value),
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
  const route = vue.inject(constants.ROUTE_INJECTION_SYMBOL);
  if (!route) {
    throw new Error("useRoute() can only be used inside a component that has a router instance");
  }
  const currentRoute = vue.computed(() => {
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
  const enhancedRoute = vue.computed(() => ({
    ...currentRoute.value,
    // 判断是否是首页
    isHome: vue.computed(() => currentRoute.value.path === "/"),
    // 判断是否是 404 页面
    isNotFound: vue.computed(() => currentRoute.value.name === "NotFound" || currentRoute.value.matched.length === 0),
    // 生成面包屑
    breadcrumbs: vue.computed(() => {
      return currentRoute.value.matched.map((record) => ({
        name: record.name || "",
        path: record.path,
        meta: record.meta || {}
      }));
    }),
    // 获取父路由
    parent: vue.computed(() => {
      const matched = currentRoute.value.matched;
      return matched.length > 1 ? matched[matched.length - 2] : void 0;
    }),
    // 判断是否有参数
    hasParams: vue.computed(() => Object.keys(currentRoute.value.params).length > 0),
    // 判断是否有查询参数
    hasQuery: vue.computed(() => Object.keys(currentRoute.value.query).length > 0),
    // 获取所有参数键
    paramKeys: vue.computed(() => Object.keys(currentRoute.value.params)),
    // 获取所有查询参数键
    queryKeys: vue.computed(() => Object.keys(currentRoute.value.query)),
    // 获取匹配的路由名称
    matchedNames: vue.computed(() => currentRoute.value.matched.map((r) => r.name).filter(Boolean)),
    // 获取路由深度
    depth: vue.computed(() => currentRoute.value.matched.length),
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
  return vue.computed(() => route.value.params);
}
function useQuery() {
  const route = useRoute();
  return vue.computed(() => route.value.query);
}
function useHash() {
  const route = useRoute();
  return vue.computed(() => route.value.hash);
}
function useMeta() {
  const route = useRoute();
  return vue.computed(() => route.value.meta);
}
function useMatched() {
  const route = useRoute();
  return vue.computed(() => route.value.matched);
}
function useNavigation() {
  const router = useRouter();
  const isNavigating = vue.ref(false);
  const direction = vue.ref("unknown");
  const lastNavigationTime = vue.ref(0);
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
    isNavigating: vue.computed(() => isNavigating.value),
    direction: vue.computed(() => direction.value),
    lastNavigationTime: vue.computed(() => lastNavigationTime.value)
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
  vue.onActivated(setupGuard);
  vue.onDeactivated(cleanupGuard);
  vue.onBeforeUnmount(cleanupGuard);
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
  vue.onActivated(setupGuard);
  vue.onDeactivated(cleanupGuard);
  vue.onBeforeUnmount(cleanupGuard);
  setupGuard();
}
function useLink(options) {
  const router = useRouter();
  const currentRoute = useRoute();
  const to = vue.computed(() => {
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
  const route = vue.computed(() => {
    return router.resolve(to.value, currentRoute.value);
  });
  const href = vue.computed(() => {
    return route.value?.fullPath || "#";
  });
  const isActive = vue.computed(() => {
    if (!route.value || !currentRoute.value) return false;
    return currentRoute.value.path.startsWith(route.value.path);
  });
  const isExactActive = vue.computed(() => {
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
    vue.inject(constants.ROUTER_INJECTION_SYMBOL);
    return true;
  } catch {
    return false;
  }
}
function hasRoute() {
  try {
    vue.inject(constants.ROUTE_INJECTION_SYMBOL);
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

exports.useDeviceComponent = useDeviceComponent.useDeviceComponent;
exports.useDeviceRoute = useDeviceRoute.useDeviceRoute;
exports.default = index;
exports.hasRoute = hasRoute;
exports.hasRouter = hasRouter;
exports.onBeforeRouteLeave = onBeforeRouteLeave;
exports.onBeforeRouteUpdate = onBeforeRouteUpdate;
exports.useHash = useHash;
exports.useLink = useLink;
exports.useMatched = useMatched;
exports.useMeta = useMeta;
exports.useNavigation = useNavigation;
exports.useParams = useParams;
exports.useQuery = useQuery;
exports.useRoute = useRoute;
exports.useRouter = useRouter;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
