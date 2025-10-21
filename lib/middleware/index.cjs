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

var logger = require('../utils/logger.cjs');
var routeMiddleware = require('./route-middleware.cjs');

class MiddlewareManager {
  constructor() {
    this.middlewares = /* @__PURE__ */ new Map();
    this.sortedMiddlewares = [];
  }
  /**
   * 注册中间件
   */
  register(config) {
    this.middlewares.set(config.name, {
      priority: 100,
      enabled: true,
      ...config
    });
    this.updateSortedMiddlewares();
  }
  /**
   * 注册多个中间件
   */
  registerMultiple(configs) {
    configs.forEach((config) => this.register(config));
  }
  /**
   * 移除中间件
   */
  unregister(name) {
    this.middlewares.delete(name);
    this.updateSortedMiddlewares();
  }
  /**
   * 启用/禁用中间件
   */
  toggle(name, enabled) {
    const middleware = this.middlewares.get(name);
    if (middleware) {
      middleware.enabled = enabled;
      this.updateSortedMiddlewares();
    }
  }
  /**
   * 更新排序后的中间件列表
   */
  updateSortedMiddlewares() {
    this.sortedMiddlewares = Array.from(this.middlewares.values()).filter((m) => m.enabled).sort((a, b) => (a.priority || 100) - (b.priority || 100));
  }
  /**
   * 执行中间件链
   */
  async execute(to, from, next) {
    const applicableMiddlewares = this.sortedMiddlewares.filter((m) => !m.condition || m.condition(to));
    if (applicableMiddlewares.length === 0) {
      next();
      return;
    }
    let currentIndex = 0;
    const context = {
      data: {},
      index: 0,
      total: applicableMiddlewares.length
    };
    const executeNext = async () => {
      if (currentIndex >= applicableMiddlewares.length) {
        next();
        return;
      }
      const middleware = applicableMiddlewares[currentIndex];
      if (!middleware) {
        next();
        return;
      }
      context.index = currentIndex;
      currentIndex++;
      try {
        await middleware.handler(to, from, executeNext, context);
      } catch (error) {
        logger.logger.error(`\u4E2D\u95F4\u4EF6 "${middleware.name}" \u6267\u884C\u5931\u8D25:`, error);
        next(error);
      }
    };
    await executeNext();
  }
  /**
   * 获取所有中间件
   */
  getAll() {
    return Array.from(this.middlewares.values());
  }
  /**
   * 获取启用的中间件
   */
  getEnabled() {
    return this.sortedMiddlewares;
  }
  /**
   * 清空所有中间件
   */
  clear() {
    this.middlewares.clear();
    this.sortedMiddlewares = [];
  }
}
const authMiddleware = {
  name: "auth",
  priority: 10,
  handler: async (to, _from, next, context) => {
    if (to.meta?.requiresAuth) {
      const isAuthenticated = context.user || localStorage.getItem("token");
      if (!isAuthenticated) {
        next({
          name: "Login",
          query: {
            redirect: to.fullPath
          }
        });
        return;
      }
    }
    next();
  },
  condition: (route) => route.meta?.requiresAuth === true
};
const permissionMiddleware = {
  name: "permission",
  priority: 20,
  handler: async (to, _from, next, context) => {
    const requiredPermissions = to.meta?.permissions;
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = context.permissions || [];
      const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission));
      if (!hasPermission) {
        next({
          name: "Forbidden"
        });
        return;
      }
    }
    next();
  },
  condition: (route) => Array.isArray(route.meta?.permissions)
};
const roleMiddleware = {
  name: "role",
  priority: 15,
  handler: async (to, _from, next, context) => {
    const requiredRoles = to.meta?.roles;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = context.user?.role;
      if (!userRole || !requiredRoles.includes(userRole)) {
        next({
          name: "Unauthorized"
        });
        return;
      }
    }
    next();
  },
  condition: (route) => Array.isArray(route.meta?.roles)
};
const loggingMiddleware = {
  name: "logging",
  priority: 1,
  handler: async (to, from, next, _context) => {
    const startTime = performance.now();
    logger.logger.info(`[Navigation] ${from.path} -> ${to.path}`);
    next();
    const endTime = performance.now();
    const duration = endTime - startTime;
    logger.logger.info(`[Navigation Complete] ${to.path} (${duration.toFixed(2)}ms)`);
  }
};
const titleMiddleware = {
  name: "title",
  priority: 90,
  handler: async (to, _from, next, _context) => {
    if (to.meta?.title) {
      document.title = to.meta.title;
    }
    next();
  },
  condition: (route) => !!route.meta?.title
};
const progressMiddleware = {
  name: "progress",
  priority: 5,
  handler: async (_to, _from, next, _context) => {
    const progressBar = document.getElementById("router-progress");
    if (progressBar) {
      progressBar.style.display = "block";
      progressBar.style.width = "30%";
    }
    next();
    setTimeout(() => {
      if (progressBar) {
        progressBar.style.width = "100%";
        setTimeout(() => {
          progressBar.style.display = "none";
          progressBar.style.width = "0%";
        }, 200);
      }
    }, 100);
  }
};
function createCacheMiddleware(options) {
  const cache = /* @__PURE__ */ new Map();
  const maxAge = options.maxAge || 5 * 60 * 1e3;
  return {
    name: "cache",
    priority: 30,
    handler: async (to, _from, next, context) => {
      const cacheKey = to.fullPath;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < maxAge) {
        context.data.cached = cached.data;
      }
      next();
      if (!options.exclude?.includes(to.name)) {
        cache.set(cacheKey, {
          data: context.data,
          timestamp: Date.now()
        });
      }
    }
  };
}
function createRateLimitMiddleware(options) {
  const requests = /* @__PURE__ */ new Map();
  return {
    name: "rateLimit",
    priority: 5,
    handler: async (to, _from, next, _context) => {
      const key = to.path;
      const now = Date.now();
      const windowStart = now - options.windowMs;
      const userRequests = requests.get(key) || [];
      const validRequests = userRequests.filter((time) => time > windowStart);
      if (validRequests.length >= options.maxRequests) {
        next(new Error("\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5"));
        return;
      }
      validRequests.push(now);
      requests.set(key, validRequests);
      next();
    }
  };
}
const middlewareManager = new MiddlewareManager();
middlewareManager.registerMultiple([loggingMiddleware, progressMiddleware, authMiddleware, roleMiddleware, permissionMiddleware, titleMiddleware]);

exports.MiddlewareComposer = routeMiddleware.MiddlewareComposer;
exports.createAuthMiddlewareV2 = routeMiddleware.createAuthMiddleware;
exports.createLoggerMiddleware = routeMiddleware.createLoggerMiddleware;
exports.createMiddlewareComposer = routeMiddleware.createMiddlewareComposer;
exports.createPerformanceMiddleware = routeMiddleware.createPerformanceMiddleware;
exports.createPermissionMiddleware = routeMiddleware.createPermissionMiddleware;
exports.createProgressMiddlewareV2 = routeMiddleware.createProgressMiddleware;
exports.createRouteContext = routeMiddleware.createRouteContext;
exports.createScrollMiddleware = routeMiddleware.createScrollMiddleware;
exports.createTitleMiddlewareV2 = routeMiddleware.createTitleMiddleware;
exports.MiddlewareManager = MiddlewareManager;
exports.authMiddleware = authMiddleware;
exports.createCacheMiddleware = createCacheMiddleware;
exports.createRateLimitMiddleware = createRateLimitMiddleware;
exports.loggingMiddleware = loggingMiddleware;
exports.middlewareManager = middlewareManager;
exports.permissionMiddleware = permissionMiddleware;
exports.progressMiddleware = progressMiddleware;
exports.roleMiddleware = roleMiddleware;
exports.titleMiddleware = titleMiddleware;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
