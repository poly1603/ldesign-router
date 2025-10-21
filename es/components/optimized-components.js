/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, shallowRef, watchEffect, unref, markRaw, onUnmounted, h, shallowReactive } from 'vue';
import { ObjectPool } from '../core/matcher/optimized-trie.js';

class VNodeCache {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.maxSize = 50;
    this.accessOrder = [];
  }
  get(key) {
    const vnode = this.cache.get(key);
    if (vnode) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(key);
    }
    return vnode;
  }
  set(key, vnode) {
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      const lru = this.accessOrder.shift();
      if (lru) {
        this.cache.delete(lru);
      }
    }
    this.cache.set(key, vnode);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  getSize() {
    return this.cache.size;
  }
}
const OptimizedRouterView = defineComponent({
  name: "OptimizedRouterView",
  props: {
    name: {
      type: String,
      default: "default"
    },
    // 使用浅层响应式减少开销
    route: {
      type: Object,
      required: false
    }
  },
  setup(props) {
    const currentComponent = shallowRef(null);
    const pendingComponent = shallowRef(null);
    const vnodeCache = new VNodeCache();
    const loaderPool = new ObjectPool(() => Promise.resolve(), (_promise) => {
    }, 5);
    const error = shallowRef(null);
    watchEffect(() => {
      const route = unref(props.route);
      if (!route) return;
      const matched = route.matched[route.matched.length - 1];
      if (!matched) {
        currentComponent.value = null;
        return;
      }
      const component = matched.components?.[props.name];
      if (!component) {
        currentComponent.value = null;
        return;
      }
      if (typeof component === "function") {
        pendingComponent.value = component;
        const loader = loaderPool.acquire();
        Promise.resolve(component()).then((loaded) => {
          if (pendingComponent.value === component) {
            currentComponent.value = markRaw(loaded.default || loaded);
            pendingComponent.value = null;
          }
          loaderPool.release(loader);
        }).catch((err) => {
          error.value = err;
          loaderPool.release(loader);
        });
      } else {
        currentComponent.value = markRaw(component);
      }
    });
    onUnmounted(() => {
      vnodeCache.clear();
      loaderPool.clear();
    });
    return () => {
      const component = currentComponent.value;
      if (error.value) {
        return h("div", {
          class: "router-error"
        }, [h("h3", "Component Error"), h("pre", error.value.message)]);
      }
      if (!component) {
        return null;
      }
      const cacheKey = `${props.name}_${component.name || "anonymous"}`;
      let vnode = vnodeCache.get(cacheKey);
      if (!vnode) {
        vnode = h(component, {
          key: cacheKey
        });
        vnodeCache.set(cacheKey, vnode);
      }
      return vnode;
    };
  }
});
const OptimizedRouterLink = defineComponent({
  name: "OptimizedRouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: {
      type: String,
      default: "router-link-active"
    },
    exactActiveClass: {
      type: String,
      default: "router-link-exact-active"
    },
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  setup(props, {
    slots
  }) {
    const link = shallowReactive({
      href: "",
      route: null,
      isActive: false,
      isExactActive: false
    });
    const hrefCache = /* @__PURE__ */ new Map();
    const classCache = /* @__PURE__ */ new Map();
    const computeHref = (to) => {
      const key = typeof to === "string" ? to : JSON.stringify(to);
      if (!hrefCache.has(key)) {
        const href = typeof to === "string" ? to : to.path || "/";
        hrefCache.set(key, href);
        if (hrefCache.size > 100) {
          const firstKey = hrefCache.keys().next().value;
          if (firstKey !== void 0) {
            hrefCache.delete(firstKey);
          }
        }
      }
      return hrefCache.get(key);
    };
    const computeClass = (isActive, isExactActive) => {
      const key = `${isActive}_${isExactActive}`;
      if (!classCache.has(key)) {
        const classes = [];
        if (isActive) classes.push(props.activeClass);
        if (isExactActive) classes.push(props.exactActiveClass);
        classCache.set(key, classes);
      }
      return classCache.get(key);
    };
    watchEffect(() => {
      link.href = computeHref(props.to);
      link.isActive = false;
      link.isExactActive = false;
    });
    const handleClick = (e) => {
      if (props.custom) return;
      e.preventDefault();
      console.log("Navigate to:", props.to);
    };
    onUnmounted(() => {
      hrefCache.clear();
      classCache.clear();
    });
    return () => {
      const children = slots.default?.({
        href: link.href,
        route: link.route,
        navigate: handleClick,
        isActive: link.isActive,
        isExactActive: link.isExactActive
      });
      if (props.custom) {
        return children;
      }
      const classes = computeClass(link.isActive, link.isExactActive);
      return h("a", {
        href: link.href,
        class: classes,
        "aria-current": link.isExactActive ? props.ariaCurrentValue : void 0,
        onClick: handleClick
      }, children);
    };
  }
});
const OptimizedKeepAlive = defineComponent({
  name: "OptimizedKeepAlive",
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: {
      type: Number,
      default: 10
      // 默认缓存10个组件
    }
  },
  setup(props, {
    slots
  }) {
    const keys = /* @__PURE__ */ new Set();
    const cache = /* @__PURE__ */ new Map();
    const shouldCache = (name) => {
      if (props.include) {
        if (typeof props.include === "string") {
          return name === props.include;
        }
        if (props.include instanceof RegExp) {
          return props.include.test(name);
        }
        if (Array.isArray(props.include)) {
          return props.include.includes(name);
        }
      }
      if (props.exclude) {
        if (typeof props.exclude === "string") {
          return name !== props.exclude;
        }
        if (props.exclude instanceof RegExp) {
          return !props.exclude.test(name);
        }
        if (Array.isArray(props.exclude)) {
          return !props.exclude.includes(name);
        }
      }
      return true;
    };
    const pruneCache = () => {
      if (cache.size <= props.max) return;
      const keysArray = Array.from(keys);
      const toRemove = keysArray.slice(0, cache.size - props.max);
      toRemove.forEach((key) => {
        keys.delete(key);
        cache.delete(key);
      });
    };
    return () => {
      const children = slots.default?.();
      if (!children || children.length === 0) {
        return null;
      }
      const child = children[0];
      if (!child) return null;
      const key = child.type?.name || "default";
      if (!shouldCache(key)) {
        return child;
      }
      if (cache.has(key)) {
        keys.delete(key);
        keys.add(key);
        return cache.get(key);
      }
      keys.add(key);
      cache.set(key, child);
      pruneCache();
      return child;
    };
  }
});
const MemoryStats = defineComponent({
  name: "MemoryStats",
  setup() {
    const stats = shallowReactive({
      usedMemory: 0,
      totalMemory: 0,
      percentage: 0
    });
    let interval = null;
    const updateStats = () => {
      if (typeof performance !== "undefined" && "memory" in performance) {
        const memory = performance.memory;
        stats.usedMemory = memory.usedJSHeapSize;
        stats.totalMemory = memory.totalJSHeapSize;
        stats.percentage = stats.usedMemory / stats.totalMemory * 100;
      }
    };
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      interval = window.setInterval(updateStats, 1e3);
      updateStats();
    }
    onUnmounted(() => {
      if (interval) {
        clearInterval(interval);
      }
    });
    return () => {
      if (typeof process === "undefined" || process.env?.NODE_ENV !== "development") {
        return null;
      }
      return h("div", {
        style: {
          position: "fixed",
          bottom: "10px",
          right: "10px",
          padding: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          fontSize: "12px",
          borderRadius: "4px",
          fontFamily: "monospace"
        }
      }, [h("div", `Memory: ${(stats.usedMemory / 1024 / 1024).toFixed(2)} MB`), h("div", `Total: ${(stats.totalMemory / 1024 / 1024).toFixed(2)} MB`), h("div", `Usage: ${stats.percentage.toFixed(1)}%`), h("div", {
        style: {
          width: "100px",
          height: "4px",
          background: "#333",
          marginTop: "5px"
        }
      }, [h("div", {
        style: {
          width: `${stats.percentage}%`,
          height: "100%",
          background: stats.percentage > 80 ? "red" : stats.percentage > 60 ? "orange" : "green"
        }
      })])]);
    };
  }
});

export { MemoryStats, OptimizedKeepAlive, OptimizedRouterLink, OptimizedRouterView };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=optimized-components.js.map
