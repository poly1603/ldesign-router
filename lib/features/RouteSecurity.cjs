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

class AuthManager {
  constructor(config = {}) {
    this.token = null;
    this.state = vue.reactive({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    this.config = {
      enabled: true,
      loginRoute: "/login",
      tokenKey: "auth-token",
      tokenStorage: "localStorage",
      refreshToken: true,
      tokenExpiry: 36e5,
      // 1小时
      ...config
    };
    this.loadToken();
  }
  // 加载token
  loadToken() {
    const storage = this.getStorage();
    const tokenKey = this.config?.tokenKey;
    if (tokenKey) {
      this.token = storage.getItem(tokenKey);
    }
    if (this.token) {
      this.state.isAuthenticated = true;
      this.validateToken();
      if (this.config?.refreshToken) {
        this.setupTokenRefresh();
      }
    }
  }
  // 获取存储
  getStorage() {
    switch (this.config?.tokenStorage) {
      case "sessionStorage":
        return sessionStorage;
      case "cookie":
        return {
          getItem: (key) => this.getCookie(key),
          setItem: (key, value) => this.setCookie(key, value),
          removeItem: (key) => this.deleteCookie(key),
          clear: () => {
          },
          key: () => null,
          length: 0
        };
      default:
        return localStorage;
    }
  }
  // Cookie操作
  getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] || null : null;
  }
  setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1e3);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
  }
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
  // 验证token
  async validateToken() {
    if (!this.token) return false;
    try {
      const payload = this.parseJWT(this.token);
      if (payload.exp && payload.exp < Date.now() / 1e3) {
        this.logout();
        return false;
      }
      this.state.user = payload.user || {
        id: payload.sub
      };
      return true;
    } catch (error) {
      console.error("Invalid token:", error);
      this.logout();
      return false;
    }
  }
  // 解析JWT
  parseJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) {
        throw new Error("Invalid JWT format");
      }
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(atob(base64).split("").map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join(""));
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error("Invalid JWT token");
    }
  }
  // 设置token刷新
  setupTokenRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    const refreshInterval = (this.config?.tokenExpiry || 36e5) * 0.8;
    this.refreshTimer = setInterval(() => {
      this.refreshToken();
    }, refreshInterval);
  }
  // 刷新token
  async refreshToken() {
  }
  // 登录
  async login(_credentials) {
    this.state.loading = true;
    this.state.error = null;
    try {
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        sub: "123",
        user: {
          id: "123",
          name: "Test User"
        },
        exp: Math.floor(Date.now() / 1e3) + 3600
      }))}.signature`;
      this.setToken(token);
      this.state.user = {
        id: "123",
        name: "Test User"
      };
      return true;
    } catch (error) {
      this.state.error = error;
      return false;
    } finally {
      this.state.loading = false;
    }
  }
  // 设置token
  setToken(token) {
    this.token = token;
    this.state.isAuthenticated = true;
    const storage = this.getStorage();
    const tokenKey = this.config?.tokenKey;
    if (tokenKey) {
      storage.setItem(tokenKey, token);
    }
    if (this.config?.refreshToken) {
      this.setupTokenRefresh();
    }
  }
  // 登出
  logout() {
    this.token = null;
    this.state.isAuthenticated = false;
    this.state.user = null;
    const storage = this.getStorage();
    const tokenKey = this.config?.tokenKey;
    if (tokenKey) {
      storage.removeItem(tokenKey);
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = void 0;
    }
  }
  // 获取认证头
  getAuthHeader() {
    if (!this.token) return {};
    return {
      Authorization: `Bearer ${this.token}`
    };
  }
  // 创建认证守卫
  createAuthGuard(options = {}) {
    return async (to, _from, _next) => {
      const requiresAuth = options.requiresAuth ?? to.meta?.requiresAuth ?? true;
      if (!requiresAuth) {
        return true;
      }
      if (!this.state.isAuthenticated) {
        const loginRoute = this.config?.loginRoute || "/login";
        return {
          path: loginRoute,
          query: {
            redirect: to.fullPath
          }
        };
      }
      const isValid = await this.validateToken();
      if (!isValid) {
        const loginRoute = this.config?.loginRoute || "/login";
        return {
          path: loginRoute,
          query: {
            redirect: to.fullPath
          }
        };
      }
      return true;
    };
  }
}
class PermissionManager {
  constructor(config = {}) {
    this.permissions = /* @__PURE__ */ new Set();
    this.roles = /* @__PURE__ */ new Set();
    this.permissionCache = /* @__PURE__ */ new Map();
    this.config = {
      enabled: true,
      mode: "mixed",
      defaultRole: "guest",
      roleHierarchy: {},
      cachePermissions: true,
      ...config
    };
    if (this.config?.defaultRole) {
      this.addRole(this.config?.defaultRole);
    }
  }
  // 添加角色
  addRole(role) {
    this.roles.add(role);
    if (this.config?.roleHierarchy?.[role]) {
      this.config?.roleHierarchy[role].forEach((inheritedRole) => {
        this.roles.add(inheritedRole);
      });
    }
    if (this.config?.cachePermissions) {
      this.permissionCache.clear();
    }
  }
  // 移除角色
  removeRole(role) {
    this.roles.delete(role);
    if (this.config?.roleHierarchy?.[role]) {
      this.config?.roleHierarchy[role].forEach((inheritedRole) => {
        this.roles.delete(inheritedRole);
      });
    }
    if (this.config?.cachePermissions) {
      this.permissionCache.clear();
    }
  }
  // 设置角色
  setRoles(roles) {
    this.roles.clear();
    roles.forEach((role) => this.addRole(role));
  }
  // 添加权限
  addPermission(permission) {
    this.permissions.add(permission);
    if (this.config?.cachePermissions) {
      this.permissionCache.clear();
    }
  }
  // 移除权限
  removePermission(permission) {
    this.permissions.delete(permission);
    if (this.config?.cachePermissions) {
      this.permissionCache.clear();
    }
  }
  // 设置权限
  setPermissions(permissions) {
    this.permissions.clear();
    permissions.forEach((p) => this.permissions.add(p));
    if (this.config?.cachePermissions) {
      this.permissionCache.clear();
    }
  }
  // 检查权限
  hasPermission(permission) {
    if (!this.config?.enabled) return true;
    const permissions = Array.isArray(permission) ? permission : [permission];
    const cacheKey = permissions.join(",");
    if (this.config?.cachePermissions && this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey);
    }
    let result = false;
    switch (this.config?.mode) {
      case "role":
        result = permissions.every((p) => this.roles.has(p));
        break;
      case "permission":
        result = permissions.every((p) => this.permissions.has(p));
        break;
      case "mixed":
        result = permissions.every((p) => this.permissions.has(p) || this.roles.has(p));
        break;
    }
    if (this.config?.cachePermissions) {
      this.permissionCache.set(cacheKey, result);
    }
    return result;
  }
  // 检查角色
  hasRole(role) {
    const roles = Array.isArray(role) ? role : [role];
    return roles.every((r) => this.roles.has(r));
  }
  // 检查任一权限
  hasAnyPermission(permissions) {
    return permissions.some((p) => this.hasPermission(p));
  }
  // 检查任一角色
  hasAnyRole(roles) {
    return roles.some((r) => this.hasRole(r));
  }
  // 创建权限守卫
  createPermissionGuard() {
    return (to, _from, _next) => {
      const requiredPermissions = to.meta?.permissions;
      const requiredRoles = to.meta?.roles;
      const requiresAny = to.meta?.requiresAny;
      if (!requiredPermissions && !requiredRoles) {
        return true;
      }
      let hasAccess = true;
      if (requiredPermissions) {
        hasAccess = requiresAny ? this.hasAnyPermission(requiredPermissions) : this.hasPermission(requiredPermissions);
      }
      if (hasAccess && requiredRoles) {
        hasAccess = requiresAny ? this.hasAnyRole(requiredRoles) : this.hasRole(requiredRoles);
      }
      if (!hasAccess) {
        return {
          path: "/403",
          query: {
            from: to.fullPath
          }
        };
      }
      return true;
    };
  }
}
class CSRFProtection {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      tokenName: "csrf-token",
      headerName: "X-CSRF-Token",
      cookieName: "XSRF-TOKEN",
      validateMethods: ["POST", "PUT", "DELETE", "PATCH"],
      ...config
    };
    this.token = this.generateToken();
    this.setupToken();
  }
  // 生成CSRF token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  // 设置token
  setupToken() {
    const cookieName = this.config?.cookieName;
    if (cookieName) {
      this.setCookie(cookieName, this.token);
    }
    const tokenName = this.config?.tokenName;
    if (tokenName) {
      let meta = document.querySelector(`meta[name="${tokenName}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", tokenName);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", this.token);
    }
  }
  // 设置cookie
  setCookie(name, value) {
    document.cookie = `${name}=${value};path=/;SameSite=Strict;Secure`;
  }
  // 获取token
  getToken() {
    return this.token;
  }
  // 刷新token
  refreshToken() {
    this.token = this.generateToken();
    this.setupToken();
  }
  // 验证请求
  validateRequest(method, token) {
    if (!this.config?.enabled) return true;
    if (!this.config?.validateMethods?.includes(method.toUpperCase())) {
      return true;
    }
    return token === this.token;
  }
  // 获取请求头
  getHeaders() {
    if (!this.config?.enabled) return {};
    const headerName = this.config?.headerName;
    if (!headerName) {
      return {};
    }
    return {
      [headerName]: this.token
    };
  }
  // 拦截器
  createInterceptor() {
    return {
      request: (config) => {
        if (this.config?.validateMethods?.includes(config.method?.toUpperCase())) {
          config.headers = {
            ...config.headers,
            ...this.getHeaders()
          };
        }
        return config;
      },
      response: (response) => {
        const headerName = this.config?.headerName;
        if (headerName) {
          const newToken = response.headers?.[headerName.toLowerCase()];
          if (newToken && newToken !== this.token) {
            this.token = newToken;
            this.setupToken();
          }
        }
        return response;
      }
    };
  }
}
class XSSProtection {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      sanitizeParams: true,
      sanitizeQuery: true,
      whitelist: [],
      ...config
    };
    this.sanitizer = config.customSanitizer || this.defaultSanitizer;
  }
  // 默认清理器
  defaultSanitizer(value) {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;"
    };
    return String(value).replace(/[&<>"'`=/]/g, (s) => entityMap[s] || s);
  }
  // 清理值
  sanitize(value) {
    if (!this.config?.enabled) return value;
    if (typeof value === "string") {
      if (this.config?.whitelist?.some((pattern) => new RegExp(pattern).test(value))) {
        return value;
      }
      return this.sanitizer(value);
    }
    if (Array.isArray(value)) {
      return value.map((v) => this.sanitize(v));
    }
    if (value && typeof value === "object") {
      const sanitized = {};
      for (const key in value) {
        sanitized[key] = this.sanitize(value[key]);
      }
      return sanitized;
    }
    return value;
  }
  // 清理路由参数
  sanitizeRoute(route) {
    if (!this.config?.enabled) return route;
    const sanitized = {
      ...route
    };
    if (this.config?.sanitizeParams && route.params) {
      sanitized.params = this.sanitize(route.params);
    }
    if (this.config?.sanitizeQuery && route.query) {
      sanitized.query = this.sanitize(route.query);
    }
    return sanitized;
  }
  // 创建XSS守卫
  createXSSGuard() {
    return (to, _from, _next) => {
      if (!this.config?.enabled) return true;
      const sanitized = this.sanitizeRoute(to);
      if (JSON.stringify(to) !== JSON.stringify(sanitized)) {
        console.warn("XSS content detected and sanitized in route:", to.fullPath);
        return sanitized;
      }
      return true;
    };
  }
  // 验证内容
  validate(content) {
    const threats = [];
    if (/<script[^>]*>.*?<\/script>/i.test(content)) {
      threats.push("Script tags detected");
    }
    if (/on\w+\s*=/i.test(content)) {
      threats.push("Event handlers detected");
    }
    if (/javascript:/i.test(content)) {
      threats.push("JavaScript protocol detected");
    }
    if (/data:text\/html/i.test(content)) {
      threats.push("Data URI detected");
    }
    return {
      safe: threats.length === 0,
      threats,
      sanitized: threats.length > 0 ? this.sanitizer(content) : content
    };
  }
}
class RouteSecurityManager {
  constructor(router, config = {}) {
    this.guardCleanups = [];
    this.router = router;
    this.config = config;
    this.authManager = new AuthManager(config.auth);
    this.permissionManager = new PermissionManager(config.permission);
    this.csrfProtection = new CSRFProtection(config.csrf);
    this.xssProtection = new XSSProtection(config.xss);
    this.setupGuards();
  }
  // 设置守卫
  setupGuards() {
    if (this.config?.auth?.enabled) {
      const cleanup = this.router.beforeEach(this.authManager.createAuthGuard());
      this.guardCleanups.push(cleanup);
    }
    if (this.config?.permission?.enabled) {
      const cleanup = this.router.beforeEach(this.permissionManager.createPermissionGuard());
      this.guardCleanups.push(cleanup);
    }
    if (this.config?.xss?.enabled) {
      const cleanup = this.router.beforeEach(this.xssProtection.createXSSGuard());
      this.guardCleanups.push(cleanup);
    }
  }
  // 登录
  async login(credentials) {
    const success = await this.authManager.login(credentials);
    return success;
  }
  // 登出
  logout() {
    this.authManager.logout();
    this.permissionManager.setRoles([this.config?.permission?.defaultRole || "guest"]);
    this.permissionManager.setPermissions([]);
  }
  // 检查权限
  can(permission) {
    return this.permissionManager.hasPermission(permission);
  }
  // 检查角色
  hasRole(role) {
    return this.permissionManager.hasRole(role);
  }
  // 设置用户权限
  setUserPermissions(permissions) {
    this.permissionManager.setPermissions(permissions);
  }
  // 设置用户角色
  setUserRoles(roles) {
    this.permissionManager.setRoles(roles);
  }
  // 获取安全头
  getSecurityHeaders() {
    return {
      ...this.authManager.getAuthHeader(),
      ...this.csrfProtection.getHeaders(),
      "X-XSS-Protection": "1; mode=block",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };
  }
  // 验证内容安全
  validateContent(content) {
    return this.xssProtection.validate(content);
  }
  // 清理不安全内容
  sanitize(value) {
    return this.xssProtection.sanitize(value);
  }
  // 获取当前用户
  getCurrentUser() {
    return this.authManager.state.user;
  }
  // 是否已认证
  isAuthenticated() {
    return this.authManager.state.isAuthenticated;
  }
  // 清理
  destroy() {
    this.guardCleanups.forEach((cleanup) => cleanup());
    this.authManager.logout();
  }
}
let defaultSecurityManager = null;
function setupRouteSecurity(router, config) {
  if (!defaultSecurityManager) {
    defaultSecurityManager = new RouteSecurityManager(router, config);
  }
  return defaultSecurityManager;
}
function checkPermission(permission) {
  if (!defaultSecurityManager) {
    throw new Error("Route security manager not initialized");
  }
  return defaultSecurityManager.can(permission);
}
function isAuthenticated() {
  return defaultSecurityManager?.isAuthenticated() || false;
}
function getCurrentUser() {
  return defaultSecurityManager?.getCurrentUser() || null;
}
function sanitizeContent(value) {
  return defaultSecurityManager?.sanitize(value) || value;
}

exports.AuthManager = AuthManager;
exports.CSRFProtection = CSRFProtection;
exports.PermissionManager = PermissionManager;
exports.RouteSecurityManager = RouteSecurityManager;
exports.XSSProtection = XSSProtection;
exports.checkPermission = checkPermission;
exports.getCurrentUser = getCurrentUser;
exports.isAuthenticated = isAuthenticated;
exports.sanitizeContent = sanitizeContent;
exports.setupRouteSecurity = setupRouteSecurity;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouteSecurity.cjs.map
