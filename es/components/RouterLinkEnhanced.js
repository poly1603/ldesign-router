/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, ref, computed, onMounted, onUnmounted, h, Transition } from 'vue';
import { useRouter, useRoute, useLink } from '../composables/index.js';
import { logger } from '../utils/logger.js';

class PreloadManager {
  static async preload(route, router) {
    const key = typeof route === "string" ? route : JSON.stringify(route);
    if (this.preloadCache.has(key)) {
      return;
    }
    if (this.pendingPreloads.has(key)) {
      return this.pendingPreloads.get(key);
    }
    const preloadPromise = (async () => {
      try {
        const resolved = router.resolve(route);
        const matched = resolved.matched[resolved.matched.length - 1];
        const component = matched?.components?.default;
        if (component && typeof component === "function") {
          await component();
          this.preloadCache.add(key);
        }
      } catch (error) {
        logger.warn("\u9884\u52A0\u8F7D\u5931\u8D25:", error);
      } finally {
        this.pendingPreloads.delete(key);
      }
    })();
    this.pendingPreloads.set(key, preloadPromise);
    return preloadPromise;
  }
  static isPreloaded(route) {
    const key = typeof route === "string" ? route : JSON.stringify(route);
    return this.preloadCache.has(key);
  }
}
PreloadManager.preloadCache = /* @__PURE__ */ new Set();
PreloadManager.pendingPreloads = /* @__PURE__ */ new Map();
const RouterLinkEnhanced = defineComponent({
  name: "RouterLinkEnhanced",
  props: {
    // 基础属性
    to: {
      type: [String, Object],
      required: true
    },
    replace: {
      type: Boolean,
      default: false
    },
    // 样式类
    activeClass: {
      type: String,
      default: "router-link-active"
    },
    exactActiveClass: {
      type: String,
      default: "router-link-exact-active"
    },
    inactiveClass: {
      type: String,
      default: ""
    },
    pendingClass: {
      type: String,
      default: "router-link-pending"
    },
    // 自定义渲染
    custom: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: "a"
    },
    // 预加载配置
    prefetch: {
      type: [Boolean, String],
      default: false
    },
    prefetchDelay: {
      type: Number,
      default: 100
    },
    prefetchPriority: {
      type: String,
      default: "auto"
    },
    // 权限和状态
    permission: {
      type: [String, Array, Function],
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    // 外部链接
    external: {
      type: Boolean,
      default: false
    },
    target: {
      type: String,
      default: void 0
    },
    rel: {
      type: String,
      default: void 0
    },
    // 导航行为
    append: {
      type: Boolean,
      default: false
    },
    exact: {
      type: Boolean,
      default: false
    },
    event: {
      type: [String, Array],
      default: "click"
    },
    // 钩子函数
    beforeNavigate: {
      type: Function,
      default: void 0
    },
    afterNavigate: {
      type: Function,
      default: void 0
    },
    // 自定义匹配逻辑
    isActiveMatch: {
      type: Function,
      default: void 0
    },
    isExactActiveMatch: {
      type: Function,
      default: void 0
    },
    // 无障碍
    ariaCurrentValue: {
      type: String,
      default: "page"
    },
    ariaLabel: {
      type: String,
      default: void 0
    },
    // 滚动行为
    scrollBehavior: {
      type: [Boolean, Object],
      default: void 0
    },
    // 动画
    transition: {
      type: [String, Object],
      default: void 0
    }
  },
  emits: ["click", "navigate", "prefetch"],
  setup(props, {
    slots,
    attrs,
    emit
  }) {
    const router = useRouter();
    const currentRoute = useRoute();
    const linkRef = ref();
    const isNavigating = ref(false);
    const prefetchTimer = ref();
    const targetLocation = computed(() => {
      if (props.append && typeof props.to === "string") {
        return currentRoute.value.path + props.to;
      }
      return props.to;
    });
    const link = useLink({
      to: targetLocation,
      replace: props.replace
    });
    const isExternal = computed(() => {
      if (props.external) return true;
      if (typeof targetLocation.value === "string") {
        return /^(https?:|mailto:|tel:)/.test(targetLocation.value);
      }
      return false;
    });
    const hasPermission = computed(() => {
      if (!props.permission) return true;
      if (typeof props.permission === "function") {
        return props.permission();
      }
      if (typeof props.permission === "string") {
        return true;
      }
      if (Array.isArray(props.permission)) {
        return true;
      }
      return true;
    });
    const isClickable = computed(() => {
      return !props.disabled && !props.loading && hasPermission.value;
    });
    const isActive = computed(() => {
      if (props.isActiveMatch) {
        return props.isActiveMatch(link.route.value);
      }
      return props.exact ? link.isExactActive.value : link.isActive.value;
    });
    const isExactActive = computed(() => {
      if (props.isExactActiveMatch) {
        return props.isExactActiveMatch(link.route.value);
      }
      return link.isExactActive.value;
    });
    const classes = computed(() => {
      const result = [];
      if (props.inactiveClass && !isActive.value) {
        result.push(props.inactiveClass);
      }
      if (isActive.value && props.activeClass) {
        result.push(props.activeClass);
      }
      if (isExactActive.value && props.exactActiveClass) {
        result.push(props.exactActiveClass);
      }
      if (isNavigating.value && props.pendingClass) {
        result.push(props.pendingClass);
      }
      if (props.disabled) {
        result.push("router-link-disabled");
      }
      if (props.loading) {
        result.push("router-link-loading");
      }
      return result;
    });
    const prefetchRoute = async () => {
      if (isExternal.value || !props.prefetch) return;
      emit("prefetch", targetLocation.value);
      await PreloadManager.preload(targetLocation.value, router);
    };
    const setupPrefetch = () => {
      if (!props.prefetch || isExternal.value) return;
      switch (props.prefetch) {
        case "immediate":
        case true:
          prefetchRoute();
          break;
        case "hover":
          break;
        case "visible":
          if (linkRef.value && "IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  prefetchRoute();
                  observer.disconnect();
                }
              });
            }, {
              rootMargin: "50px"
            });
            observer.observe(linkRef.value);
            onUnmounted(() => observer.disconnect());
          }
          break;
        case "idle":
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(() => prefetchRoute());
          } else {
            setTimeout(() => prefetchRoute(), 2e3);
          }
          break;
      }
    };
    const handleMouseEnter = () => {
      if (props.prefetch === "hover" && !PreloadManager.isPreloaded(targetLocation.value)) {
        clearTimeout(prefetchTimer.value);
        prefetchTimer.value = window.setTimeout(() => {
          prefetchRoute();
        }, props.prefetchDelay);
      }
    };
    const handleMouseLeave = () => {
      clearTimeout(prefetchTimer.value);
    };
    const handleNavigate = async (e) => {
      if (e) {
        emit("click", e);
      }
      if (!isClickable.value) {
        e?.preventDefault();
        return;
      }
      if (isExternal.value) {
        return;
      }
      e?.preventDefault();
      if (props.beforeNavigate) {
        const result = await props.beforeNavigate(targetLocation.value);
        if (result === false) {
          return;
        }
      }
      isNavigating.value = true;
      try {
        await link.navigate();
        if (props.scrollBehavior) {
          if (props.scrollBehavior === true) {
            window.scrollTo(0, 0);
          } else {
            window.scrollTo(props.scrollBehavior);
          }
        }
        if (props.afterNavigate) {
          props.afterNavigate(targetLocation.value);
        }
        emit("navigate", targetLocation.value);
      } finally {
        isNavigating.value = false;
      }
    };
    const setupEventListeners = () => {
      const events = Array.isArray(props.event) ? props.event : [props.event];
      const listeners = {};
      events.forEach((event) => {
        if (event === "click") {
          listeners.onClick = handleNavigate;
        } else {
          listeners[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = handleNavigate;
        }
      });
      return listeners;
    };
    onMounted(() => {
      setupPrefetch();
    });
    onUnmounted(() => {
      clearTimeout(prefetchTimer.value);
    });
    return () => {
      if (!hasPermission.value) {
        return null;
      }
      const href = isExternal.value ? typeof targetLocation.value === "string" ? targetLocation.value : "#" : link.href.value;
      const linkProps = {
        ...attrs,
        ref: linkRef,
        class: classes.value,
        "aria-current": isExactActive.value ? props.ariaCurrentValue : void 0,
        "aria-label": props.ariaLabel,
        "aria-disabled": props.disabled || void 0
      };
      if (isExternal.value) {
        linkProps.href = href;
        linkProps.target = props.target || "_blank";
        linkProps.rel = props.rel || (props.target === "_blank" ? "noopener noreferrer" : void 0);
      } else {
        linkProps.href = isClickable.value ? href : void 0;
        linkProps.role = !isClickable.value ? "link" : void 0;
        linkProps.tabindex = !isClickable.value ? -1 : void 0;
      }
      if (isClickable.value) {
        Object.assign(linkProps, setupEventListeners());
        linkProps.onMouseenter = handleMouseEnter;
        linkProps.onMouseleave = handleMouseLeave;
      }
      if (props.custom) {
        return slots.default?.({
          href,
          route: link.route.value,
          navigate: handleNavigate,
          isActive: isActive.value,
          isExactActive: isExactActive.value,
          isNavigating: isNavigating.value,
          isExternal: isExternal.value
        });
      }
      const content = slots.default?.({
        isActive: isActive.value,
        isExactActive: isExactActive.value,
        isNavigating: isNavigating.value
      }) || href;
      if (props.transition && !isExternal.value) {
        return h(Transition, typeof props.transition === "string" ? {
          name: props.transition
        } : props.transition, () => h(props.tag, linkProps, content));
      }
      return h(props.tag, linkProps, content);
    };
  }
});

export { RouterLinkEnhanced, RouterLinkEnhanced as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouterLinkEnhanced.js.map
