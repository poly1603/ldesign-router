/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class MiddlewareComposer {
  constructor() {
    this.middlewares = [];
    this.executionCount = 0;
    this.errorHandlers = [];
  }
  /**
   * 注册中间件
   */
  use(middleware, config) {
    const wrapper = {
      middleware,
      config: {
        name: config?.name || `middleware_${this.middlewares.length}`,
        enabled: config?.enabled ?? true,
        priority: config?.priority ?? 0,
        condition: config?.condition || (() => true)
      }
    };
    this.middlewares.push(wrapper);
    this.middlewares.sort((a, b) => b.config.priority - a.config.priority);
    return this;
  }
  /**
   * 批量注册中间件
   */
  useMultiple(middlewares) {
    for (const item of middlewares) {
      if (Array.isArray(item)) {
        this.use(item[0], item[1]);
      } else {
        this.use(item);
      }
    }
    return this;
  }
  /**
   * 执行中间件链
   */
  async execute(context) {
    const activeMiddlewares = this.middlewares.filter((wrapper) => wrapper.config.enabled && wrapper.config.condition(context));
    if (activeMiddlewares.length === 0) {
      return;
    }
    let index = 0;
    this.executionCount++;
    const dispatch = async (i) => {
      if (i <= index && i !== 0) {
        throw new Error(`next() called multiple times in middleware "${activeMiddlewares[index - 1]?.config.name}"`);
      }
      if (context.aborted) {
        return;
      }
      index = i;
      const wrapper = activeMiddlewares[i];
      if (!wrapper) {
        return;
      }
      try {
        await Promise.resolve(wrapper.middleware(context, () => dispatch(i + 1)));
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
    await dispatch(0);
  }
  /**
   * 注册错误处理器
   */
  onError(handler) {
    this.errorHandlers.push(handler);
    return this;
  }
  /**
   * 处理错误
   */
  handleError(error, context) {
    context.error = error;
    for (const handler of this.errorHandlers) {
      try {
        handler(error, context);
      } catch (handlerError) {
        console.error("Error in middleware error handler:", handlerError);
      }
    }
  }
  /**
   * 移除中间件
   */
  remove(name) {
    const index = this.middlewares.findIndex((w) => w.config.name === name);
    if (index !== -1) {
      this.middlewares.splice(index, 1);
      return true;
    }
    return false;
  }
  /**
   * 清空所有中间件
   */
  clear() {
    this.middlewares = [];
    this.errorHandlers = [];
  }
  /**
   * 获取中间件列表
   */
  getMiddlewares() {
    return [...this.middlewares];
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalMiddlewares: this.middlewares.length,
      activeMiddlewares: this.middlewares.filter((w) => w.config.enabled).length,
      executionCount: this.executionCount
    };
  }
}
function createLoggerMiddleware(options) {
  const verbose = options?.verbose ?? false;
  const logger = options?.logger || console.info;
  return async (context, next) => {
    const start = Date.now();
    logger(`\u{1F680} Navigation: ${context.from.path} \u2192 ${context.to.path}`, verbose ? context : void 0);
    await next();
    const duration = Date.now() - start;
    logger(`\u2705 Navigation completed in ${duration}ms`, verbose ? {
      duration,
      path: context.to.path
    } : void 0);
  };
}
function createPerformanceMiddleware(options) {
  const threshold = options?.threshold ?? 500;
  return async (context, next) => {
    const start = performance.now();
    await next();
    const duration = performance.now() - start;
    if (duration > threshold) {
      options?.onSlow?.(duration, context);
      console.warn(`\u26A0\uFE0F Slow navigation detected: ${context.to.path} took ${duration.toFixed(2)}ms`);
    }
    context.meta.navigationDuration = duration;
  };
}
function createAuthMiddleware(options) {
  const {
    checkAuth,
    redirectTo = "/login",
    requiresAuth
  } = options;
  return async (context, next) => {
    const needsAuth = requiresAuth ? requiresAuth(context) : context.to.meta?.requiresAuth === true;
    if (!needsAuth) {
      await next();
      return;
    }
    const isAuthenticated = await Promise.resolve(checkAuth());
    if (!isAuthenticated) {
      context.aborted = true;
      context.redirectTo = redirectTo;
      return;
    }
    await next();
  };
}
function createPermissionMiddleware(options) {
  const {
    checkPermission,
    redirectTo = "/403",
    getRequiredPermissions
  } = options;
  return async (context, next) => {
    const requiredPermissions = getRequiredPermissions ? getRequiredPermissions(context) : context.to.meta?.permissions;
    if (!requiredPermissions || requiredPermissions.length === 0) {
      await next();
      return;
    }
    const hasPermission = await Promise.resolve(checkPermission(requiredPermissions));
    if (!hasPermission) {
      context.aborted = true;
      context.redirectTo = redirectTo;
      return;
    }
    await next();
  };
}
function createTitleMiddleware(options) {
  const {
    defaultTitle = "",
    suffix = "",
    prefix = ""
  } = options || {};
  return async (context, next) => {
    await next();
    if (typeof document !== "undefined") {
      const title = context.to.meta?.title;
      const fullTitle = title ? `${prefix}${title}${suffix}` : `${prefix}${defaultTitle}${suffix}`;
      document.title = fullTitle;
    }
  };
}
function createProgressMiddleware(options) {
  let progressBar = null;
  return async (_context, next) => {
    const showDelay = options?.showDelay ?? 200;
    const timer = setTimeout(() => {
      if (typeof document !== "undefined" && !progressBar) {
        progressBar = document.createElement("div");
        progressBar.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 0%;
          height: ${options?.height || "2px"};
          background: ${options?.color || "#4CAF50"};
          transition: width 0.3s;
          z-index: 9999;
        `;
        document.body.appendChild(progressBar);
        setTimeout(() => {
          if (progressBar) {
            progressBar.style.width = "70%";
          }
        }, 10);
      }
    }, showDelay);
    try {
      await next();
      if (progressBar) {
        progressBar.style.width = "100%";
        setTimeout(() => {
          if (progressBar) {
            progressBar.remove();
            progressBar = null;
          }
        }, 300);
      }
    } catch (error) {
      if (progressBar) {
        progressBar.remove();
        progressBar = null;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
}
function createScrollMiddleware(options) {
  const scrollPositions = /* @__PURE__ */ new Map();
  return async (context, next) => {
    if (typeof window !== "undefined") {
      const key = context.from.fullPath || context.from.path;
      scrollPositions.set(key, {
        x: window.scrollX,
        y: window.scrollY
      });
    }
    await next();
    if (typeof window !== "undefined") {
      const behavior = options?.behavior || "auto";
      let scrollTo;
      if (options?.position === "saved") {
        const key = context.to.fullPath || context.to.path;
        scrollTo = scrollPositions.get(key);
      } else if (options?.position && typeof options.position === "object") {
        scrollTo = options.position;
      } else {
        scrollTo = {
          x: 0,
          y: 0
        };
      }
      if (scrollTo) {
        window.scrollTo({
          left: scrollTo.x,
          top: scrollTo.y,
          behavior
        });
      }
    }
  };
}
function createMiddlewareComposer() {
  return new MiddlewareComposer();
}
function createRouteContext(to, from) {
  return {
    to,
    from,
    state: {},
    aborted: false,
    startTime: Date.now(),
    meta: {}
  };
}

export { MiddlewareComposer, createAuthMiddleware, createLoggerMiddleware, createMiddlewareComposer, createPerformanceMiddleware, createPermissionMiddleware, createProgressMiddleware, createRouteContext, createScrollMiddleware, createTitleMiddleware, MiddlewareComposer as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=route-middleware.js.map
