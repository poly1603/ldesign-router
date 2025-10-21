/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { SUPPORTS_HISTORY } from './constants.js';

class BaseHistory {
  constructor(base = "") {
    this.listeners = [];
    this._base = this.normalizeBase(base);
    this._location = this.getCurrentLocation();
    this._state = this.getCurrentState();
  }
  get base() {
    return this._base;
  }
  get location() {
    return this._location;
  }
  get state() {
    return this._state;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  listen(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }
  destroy() {
    this.listeners = [];
  }
  normalizeBase(base) {
    if (!base) return "";
    base = base.replace(/^\/+/, "/").replace(/\/+$/, "");
    return base === "/" ? "" : base;
  }
  triggerListeners(to, from, info) {
    for (const listener of this.listeners) {
      listener(to, from, info);
    }
  }
  createNavigationInfo(type, delta = 0) {
    return {
      type,
      direction: this.getNavigationDirection(delta),
      delta
    };
  }
  getNavigationDirection(delta) {
    if (delta > 0) return "forward";
    if (delta < 0) return "backward";
    return "unknown";
  }
  /**
   * 清理状态数据，确保只包含可序列化的内容（优化版）
   */
  sanitizeStateData(data) {
    if (!data || typeof data !== "object") {
      return data || {};
    }
    const cache = /* @__PURE__ */ new WeakSet();
    const sanitize = (obj, depth = 0) => {
      if (depth > 10) return void 0;
      if (obj === null || obj === void 0) return obj;
      const type = typeof obj;
      if (type === "string" || type === "number" || type === "boolean") {
        return obj;
      }
      if (type === "object") {
        if (cache.has(obj)) return void 0;
        cache.add(obj);
        if (Array.isArray(obj)) {
          return obj.map((item) => sanitize(item, depth + 1)).filter((item) => item !== void 0);
        }
        if (obj.constructor === Object) {
          const result = {};
          for (const [key, value] of Object.entries(obj)) {
            const sanitized = sanitize(value, depth + 1);
            if (sanitized !== void 0) {
              result[key] = sanitized;
            }
          }
          return result;
        }
      }
      return void 0;
    };
    return sanitize(data) || {};
  }
}
class HTML5History extends BaseHistory {
  constructor(base) {
    super(base);
    this.lastNavTime = 0;
    this.NAV_THROTTLE = 50;
    this.setupPopstateListener();
  }
  push(to, data) {
    const now = Date.now();
    if (now - this.lastNavTime < this.NAV_THROTTLE) {
      return;
    }
    this.lastNavTime = now;
    const from = this._location;
    const url = this.buildURL(to);
    const serializableData = this.sanitizeStateData(data || {});
    history.pushState(serializableData, "", url);
    this._location = to;
    this._state = data || {};
    this.triggerListeners(to, from, this.createNavigationInfo("push"));
  }
  replace(to, data) {
    const from = this._location;
    const url = this.buildURL(to);
    const serializableData = this.sanitizeStateData(data || {});
    history.replaceState(serializableData, "", url);
    this._location = to;
    this._state = data || {};
    this.triggerListeners(to, from, this.createNavigationInfo("replace"));
  }
  go(delta, _triggerListeners = true) {
    history.go(delta);
  }
  destroy() {
    super.destroy();
    if (this.popstateListener) {
      window.removeEventListener("popstate", this.popstateListener);
    }
  }
  getCurrentLocation() {
    const {
      pathname,
      search,
      hash
    } = window.location;
    return {
      pathname: this.stripBase(pathname),
      search,
      hash
    };
  }
  getCurrentState() {
    return history.state || {};
  }
  setupPopstateListener() {
    let isProcessing = false;
    this.popstateListener = (event) => {
      if (isProcessing) return;
      isProcessing = true;
      const from = this._location;
      const to = this.getCurrentLocation();
      this._location = to;
      this._state = event.state || {};
      this.triggerListeners(to, from, this.createNavigationInfo("pop"));
      requestAnimationFrame(() => {
        isProcessing = false;
      });
    };
    window.addEventListener("popstate", this.popstateListener, {
      passive: true
    });
  }
  buildURL(location) {
    const {
      pathname,
      search,
      hash
    } = location;
    return this._base + pathname + search + hash;
  }
  stripBase(pathname) {
    if (!this._base) return pathname;
    if (pathname.startsWith(this._base)) {
      return pathname.slice(this._base.length) || "/";
    }
    return pathname;
  }
}
class HashHistory extends BaseHistory {
  constructor(base) {
    super(base);
    this.setupHashchangeListener();
  }
  push(to, data) {
    const from = {
      ...this._location
    };
    const url = this.buildHashURL(to);
    if (SUPPORTS_HISTORY) {
      const serializableData = this.sanitizeStateData(data || {});
      history.pushState(serializableData, "", url);
    } else {
      window.location.hash = this.buildHash(to);
    }
    this._location = to;
    this._state = data || {};
    this.triggerListeners(to, from, this.createNavigationInfo("push"));
  }
  replace(to, data) {
    const from = {
      ...this._location
    };
    const url = this.buildHashURL(to);
    if (SUPPORTS_HISTORY) {
      const serializableData = this.sanitizeStateData(data || {});
      history.replaceState(serializableData, "", url);
    } else {
      window.location.replace(url);
    }
    this._location = to;
    this._state = data || {};
    this.triggerListeners(to, from, this.createNavigationInfo("replace"));
  }
  go(delta, _triggerListeners = true) {
    history.go(delta);
  }
  destroy() {
    super.destroy();
    if (this.hashchangeListener) {
      window.removeEventListener("hashchange", this.hashchangeListener);
    }
  }
  getCurrentLocation() {
    const hash = window.location.hash.slice(1);
    const [pathname, search] = hash.split("?");
    return {
      pathname: pathname || "/",
      search: search ? `?${search}` : "",
      hash: ""
    };
  }
  getCurrentState() {
    return SUPPORTS_HISTORY ? history.state || {} : {};
  }
  setupHashchangeListener() {
    this.hashchangeListener = () => {
      const from = {
        ...this._location
      };
      const to = this.getCurrentLocation();
      this._location = to;
      this._state = this.getCurrentState();
      this.triggerListeners(to, from, this.createNavigationInfo("pop"));
    };
    window.addEventListener("hashchange", this.hashchangeListener);
  }
  buildHashURL(location) {
    const hash = this.buildHash(location);
    return `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}#${hash}`;
  }
  buildHash(location) {
    const {
      pathname,
      search
    } = location;
    return pathname + search;
  }
}
class MemoryHistory extends BaseHistory {
  constructor(base, initialLocation) {
    super(base);
    this.stack = [];
    this.index = -1;
    this.MAX_STACK_SIZE = 100;
    const location = initialLocation || {
      pathname: "/",
      search: "",
      hash: ""
    };
    this.stack.push({
      location,
      state: {}
    });
    this.index = 0;
    this._location = location;
  }
  push(to, data) {
    const from = this._location;
    this.stack = this.stack.slice(0, this.index + 1);
    if (this.stack.length >= this.MAX_STACK_SIZE) {
      this.stack.shift();
      this.index--;
    }
    this.stack.push({
      location: to,
      state: data || {}
    });
    this.index++;
    this._location = to;
    this._state = data || {};
    this.triggerListeners(to, from, this.createNavigationInfo("push"));
  }
  replace(to, data) {
    const from = {
      ...this._location
    };
    this.stack[this.index] = {
      location: to,
      state: data || {}
    };
    this._location = to;
    this._state = data || {};
    this.triggerListeners(to, from, this.createNavigationInfo("replace"));
  }
  go(delta, triggerListeners = true) {
    const newIndex = this.index + delta;
    if (newIndex < 0 || newIndex >= this.stack.length) {
      return;
    }
    const from = {
      ...this._location
    };
    const stackEntry = this.stack[newIndex];
    if (!stackEntry) {
      return;
    }
    const {
      location,
      state
    } = stackEntry;
    this.index = newIndex;
    this._location = location;
    this._state = state;
    if (triggerListeners) {
      this.triggerListeners(location, from, this.createNavigationInfo("pop", delta));
    }
  }
  getCurrentLocation() {
    return this._location;
  }
  getCurrentState() {
    return this._state;
  }
}
function createWebHistory(base) {
  if (typeof window === "undefined") {
    throw new TypeError("createWebHistory() can only be used in browser environment");
  }
  if (!SUPPORTS_HISTORY) {
    console.warn("HTML5 History API is not supported, falling back to hash mode");
    return createWebHashHistory(base);
  }
  return new HTML5History(base);
}
function createWebHashHistory(base) {
  if (typeof window === "undefined") {
    throw new TypeError("createWebHashHistory() can only be used in browser environment");
  }
  return new HashHistory(base);
}
function createMemoryHistory(base, initialLocation) {
  return new MemoryHistory(base, initialLocation);
}

export { createMemoryHistory, createWebHashHistory, createWebHistory };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=history.js.map
