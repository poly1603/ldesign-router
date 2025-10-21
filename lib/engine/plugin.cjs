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

require('../components/DeviceUnsupported.cjs');
require('../components/ErrorBoundary.cjs');
var RouterLink = require('../components/RouterLink.cjs');
var RouterView = require('../components/RouterView.cjs');
var constants = require('../core/constants.cjs');
var history = require('../core/history.cjs');
var router = require('../core/router.cjs');

const nodeProcess = typeof process !== "undefined" ? process : void 0;
function getPresetConfig(preset) {
  const presets = {
    spa: {
      mode: "history",
      preload: {
        strategy: "hover",
        delay: 200,
        enabled: true
      },
      cache: {
        maxSize: 20,
        strategy: "memory",
        enabled: true
      },
      animation: {
        type: "fade",
        duration: 300,
        enabled: true
      },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePrefetch: true,
        cacheSize: 50
      }
    },
    mpa: {
      mode: "history",
      preload: false,
      cache: false,
      animation: false,
      performance: {
        enableLazyLoading: false,
        enableCodeSplitting: false,
        enablePrefetch: false
      }
    },
    mobile: {
      mode: "hash",
      preload: {
        strategy: "visible",
        enabled: true
      },
      cache: {
        maxSize: 10,
        strategy: "memory",
        enabled: true
      },
      animation: {
        type: "slide",
        duration: 250,
        enabled: true
      },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        cacheSize: 20
      }
    },
    desktop: {
      mode: "history",
      preload: {
        strategy: "hover",
        delay: 100,
        enabled: true
      },
      cache: {
        maxSize: 50,
        strategy: "memory",
        enabled: true
      },
      animation: {
        type: "fade",
        duration: 200,
        enabled: true
      },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePrefetch: true,
        cacheSize: 100
      }
    },
    admin: {
      mode: "history",
      preload: {
        strategy: "idle",
        enabled: true
      },
      cache: {
        maxSize: 30,
        strategy: "session",
        enabled: true
      },
      animation: {
        type: "scale",
        duration: 200,
        enabled: true
      },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: true,
        enablePrefetch: true,
        cacheSize: 50
      },
      security: {
        enableCSRFProtection: true,
        enableXSSProtection: true
      }
    },
    blog: {
      mode: "history",
      preload: {
        strategy: "visible",
        enabled: true
      },
      cache: {
        maxSize: 15,
        strategy: "local",
        enabled: true
      },
      animation: {
        type: "fade",
        duration: 300,
        enabled: true
      },
      performance: {
        enableLazyLoading: true,
        enableCodeSplitting: false,
        enablePrefetch: true,
        cacheSize: 30
      }
    }
  };
  return presets[preset] || {};
}
function mergeOptions(options) {
  const {
    preset,
    ...userOptions
  } = options;
  if (preset) {
    const presetConfig = getPresetConfig(preset);
    return {
      ...presetConfig,
      ...userOptions,
      // 深度合并嵌套对象
      preload: typeof userOptions.preload === "object" && userOptions.preload !== null ? {
        ...presetConfig.preload,
        ...userOptions.preload
      } : userOptions.preload ?? presetConfig.preload,
      cache: typeof userOptions.cache === "object" && userOptions.cache !== null ? {
        ...presetConfig.cache,
        ...userOptions.cache
      } : userOptions.cache ?? presetConfig.cache,
      animation: typeof userOptions.animation === "object" && userOptions.animation !== null ? {
        ...presetConfig.animation,
        ...userOptions.animation
      } : userOptions.animation ?? presetConfig.animation,
      performance: {
        ...presetConfig.performance,
        ...userOptions.performance
      },
      development: {
        ...presetConfig.development,
        ...userOptions.development
      },
      security: {
        ...presetConfig.security,
        ...userOptions.security
      }
    };
  }
  return options;
}
function createRouterEnginePlugin(options) {
  const mergedOptions = mergeOptions(options);
  const {
    name = "router",
    version = "1.0.0",
    routes,
    mode = "history",
    base = "/",
    scrollBehavior,
    linkActiveClass,
    linkExactActiveClass
  } = mergedOptions;
  return {
    name,
    version,
    dependencies: [],
    // 路由器插件通常不依赖其他插件
    async install(context) {
      try {
        const engine = context.engine || context;
        const performInstall = async () => {
          const vueApp2 = engine.getApp();
          if (!vueApp2) {
            throw new Error("Vue app not found. Make sure the engine has created a Vue app before installing router plugin.");
          }
          let history$1;
          switch (mode) {
            case "hash":
              history$1 = history.createWebHashHistory(base);
              break;
            case "memory":
              history$1 = history.createMemoryHistory(base);
              break;
            case "history":
            default:
              history$1 = history.createWebHistory(base);
              break;
          }
          const routerOptions = {
            history: history$1,
            routes,
            linkActiveClass: linkActiveClass || "router-link-active",
            linkExactActiveClass: linkExactActiveClass || "router-link-exact-active"
          };
          if (scrollBehavior) {
            routerOptions.scrollBehavior = scrollBehavior;
          }
          const router$1 = router.createRouter(routerOptions);
          vueApp2.provide(constants.ROUTER_INJECTION_SYMBOL, router$1);
          vueApp2.provide(constants.ROUTE_INJECTION_SYMBOL, router$1.currentRoute);
          vueApp2.component("RouterView", RouterView.RouterView);
          vueApp2.component("RouterLink", RouterLink.RouterLink);
          if (vueApp2.config && vueApp2.config.globalProperties) {
            vueApp2.config.globalProperties.$router = router$1;
            vueApp2.config.globalProperties.$route = router$1.currentRoute;
          }
          const routerAdapter = {
            install: (_engine) => {
            },
            push: router$1.push.bind(router$1),
            replace: router$1.replace.bind(router$1),
            go: router$1.go.bind(router$1),
            back: router$1.back.bind(router$1),
            forward: router$1.forward.bind(router$1),
            getCurrentRoute: () => router$1.currentRoute,
            getRoutes: router$1.getRoutes.bind(router$1),
            addRoute: router$1.addRoute.bind(router$1),
            removeRoute: router$1.removeRoute.bind(router$1),
            hasRoute: router$1.hasRoute.bind(router$1),
            resolve: router$1.resolve.bind(router$1),
            beforeEach: router$1.beforeEach.bind(router$1),
            beforeResolve: router$1.beforeResolve.bind(router$1),
            afterEach: router$1.afterEach.bind(router$1),
            onError: router$1.onError.bind(router$1),
            getRouter: () => router$1
            // 返回原始路由器实例
          };
          engine.router = routerAdapter;
          if (engine.state) {
            engine.state.set("router:currentRoute", router$1.currentRoute);
            engine.state.set("router:mode", mode);
            engine.state.set("router:base", base);
            router$1.afterEach((to, from) => {
              engine.state.set("router:currentRoute", to);
              if (engine.events) {
                engine.events.emit("router:navigated", {
                  to,
                  from
                });
              }
            });
          }
          router$1.onError((error) => {
            engine.logger.error("Router navigation error:", error);
            if (engine.events) {
              engine.events.emit("router:error", error);
            }
          });
          const isTestEnv = nodeProcess?.env?.NODE_ENV === "test";
          if (!isTestEnv) {
            await router$1.isReady();
          }
          if (engine.events) {
            engine.events.emit(`plugin:${name}:installed`, {
              router: router$1,
              mode,
              base,
              routesCount: routes.length
            });
          }
        };
        const vueApp = engine.getApp();
        if (vueApp) {
          await performInstall();
        } else {
          engine.events.once("app:created", async () => {
            try {
              await performInstall();
            } catch (error) {
              engine.logger.error(`Failed to install ${name} plugin after app creation:`, error);
            }
          });
        }
      } catch (error) {
        if (context.engine && context.engine.logger && typeof context.engine.logger.error === "function") {
          context.engine.logger.error(`Failed to install ${name} plugin:`, error);
        } else {
          console.error(`Failed to install ${name} plugin:`, error);
        }
        throw error;
      }
    },
    async uninstall(context) {
      try {
        const engine = context.engine || context;
        engine.logger.info(`Uninstalling ${name} plugin...`);
        if (engine.router) {
          engine.router = null;
        }
        if (engine.state) {
          engine.state.delete("router:currentRoute");
          engine.state.delete("router:mode");
          engine.state.delete("router:base");
        }
        if (engine.events) {
          engine.events.emit(`plugin:${name}:uninstalled`);
        }
        engine.logger.info(`${name} plugin uninstalled successfully`);
      } catch (error) {
        const engine = context.engine || context;
        if (engine && engine.logger && typeof engine.logger.error === "function") {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error);
        } else {
          console.error(`Failed to uninstall ${name} plugin:`, error);
        }
        throw error;
      }
    }
  };
}
function createSPARouter(routes, options) {
  return createRouterEnginePlugin({
    preset: "spa",
    routes,
    ...options
  });
}
function createMobileRouter(routes, options) {
  return createRouterEnginePlugin({
    preset: "mobile",
    routes,
    ...options
  });
}
function createDesktopRouter(routes, options) {
  return createRouterEnginePlugin({
    preset: "desktop",
    routes,
    ...options
  });
}
function createAdminRouter(routes, options) {
  return createRouterEnginePlugin({
    preset: "admin",
    routes,
    ...options
  });
}
function createBlogRouter(routes, options) {
  return createRouterEnginePlugin({
    preset: "blog",
    routes,
    ...options
  });
}
function createSimpleRouter(routes, mode = "history") {
  return createRouterEnginePlugin({
    routes,
    mode,
    preload: false,
    cache: false,
    animation: false
  });
}
function validateRouterConfig(options) {
  const errors = [];
  if (!options.routes || !Array.isArray(options.routes)) {
    errors.push("routes \u5FC5\u987B\u662F\u4E00\u4E2A\u6570\u7EC4");
  }
  if (options.routes && options.routes.length === 0) {
    errors.push("routes \u4E0D\u80FD\u4E3A\u7A7A");
  }
  if (options.mode && !["history", "hash", "memory"].includes(options.mode)) {
    errors.push('mode \u5FC5\u987B\u662F "history", "hash" \u6216 "memory" \u4E4B\u4E00');
  }
  if (options.preset && !["spa", "mpa", "mobile", "desktop", "admin", "blog"].includes(options.preset)) {
    errors.push("preset \u5FC5\u987B\u662F\u6709\u6548\u7684\u9884\u8BBE\u7C7B\u578B");
  }
  return errors;
}
var plugin = {
  createRouterEnginePlugin,
  createSPARouter,
  createMobileRouter,
  createDesktopRouter,
  createAdminRouter,
  createBlogRouter,
  createSimpleRouter,
  validateRouterConfig,
  getPresetConfig,
  mergeOptions
};
function routerPlugin(options) {
  return createRouterEnginePlugin(options);
}
function createDefaultRouterEnginePlugin(routes) {
  return createRouterEnginePlugin({
    routes,
    mode: "history",
    base: "/"
  });
}
function createSimpleSPARouter(routes, options) {
  const {
    mode = "history",
    base = "/",
    scrollBehavior
  } = options || {};
  let history$1;
  switch (mode) {
    case "hash":
      history$1 = history.createWebHashHistory(base);
      break;
    case "memory":
      history$1 = history.createMemoryHistory(base);
      break;
    default:
      history$1 = history.createWebHistory(base);
  }
  const routerOptions = {
    history: history$1,
    routes,
    linkActiveClass: "router-link-active",
    linkExactActiveClass: "router-link-exact-active"
  };
  if (scrollBehavior) {
    routerOptions.scrollBehavior = scrollBehavior;
  }
  const router$1 = router.createRouter(routerOptions);
  return router$1;
}
function createSimpleMobileRouter(routes, options) {
  const {
    mode = "hash",
    // 移动端默认使用 hash 模式
    base = "/",
    animation
  } = options || {};
  const router = createSimpleSPARouter(routes, {
    mode,
    base
  });
  if (animation) {
    router.options = {
      ...router.options,
      mode,
      animation
    };
  }
  return router;
}
function createSimpleAdminRouter(routes, options) {
  const {
    mode = "history",
    base = "/",
    security
  } = options || {};
  const router = createSimpleSPARouter(routes, {
    mode,
    base
  });
  if (security) {
    router.options = {
      ...router.options,
      mode,
      security
    };
  }
  return router;
}

exports.createAdminRouter = createAdminRouter;
exports.createBlogRouter = createBlogRouter;
exports.createDefaultRouterEnginePlugin = createDefaultRouterEnginePlugin;
exports.createDesktopRouter = createDesktopRouter;
exports.createMobileRouter = createMobileRouter;
exports.createRouterEnginePlugin = createRouterEnginePlugin;
exports.createSPARouter = createSPARouter;
exports.createSimpleAdminRouter = createSimpleAdminRouter;
exports.createSimpleMobileRouter = createSimpleMobileRouter;
exports.createSimpleRouter = createSimpleRouter;
exports.createSimpleSPARouter = createSimpleSPARouter;
exports.default = plugin;
exports.routerPlugin = routerPlugin;
exports.validateRouterConfig = validateRouterConfig;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=plugin.cjs.map
