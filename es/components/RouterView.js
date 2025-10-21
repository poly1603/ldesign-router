/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineComponent, inject, provide, shallowRef, ref, computed, watch, markRaw, h, KeepAlive, Transition } from 'vue';
import { ROUTER_INJECTION_SYMBOL, ROUTE_INJECTION_SYMBOL } from '../core/constants.js';

const ROUTER_VIEW_DEPTH_SYMBOL = Symbol("RouterViewDepth");
const RouterView = defineComponent({
  name: "RouterView",
  props: {
    name: {
      type: String,
      default: "default"
    },
    // keep-alive 支持
    keepAlive: {
      type: [Boolean, Object],
      default: false
    },
    include: {
      type: [String, RegExp, Array],
      default: void 0
    },
    exclude: {
      type: [String, RegExp, Array],
      default: void 0
    },
    max: {
      type: Number,
      default: void 0
    },
    // transition 动画支持
    transition: {
      type: [String, Object],
      default: void 0
    },
    // 新增：mode 属性用于过渡
    mode: {
      type: String,
      default: "out-in"
    },
    // loading 状态支持
    loading: {
      type: Boolean,
      default: false
    },
    // 新增：懒加载配置
    lazy: {
      type: Boolean,
      default: true
    },
    // 新增：错误处理
    onError: {
      type: Function,
      default: void 0
    },
    // 新增：Suspense 支持
    suspense: {
      type: Boolean,
      default: false
    },
    // 新增：超时控制
    timeout: {
      type: Number,
      default: void 0
    },
    // 新增：缓存策略
    cacheStrategy: {
      type: String,
      default: "matched"
    }
  },
  // 提供子组件可能需要的数据
  inheritAttrs: false,
  setup(props, {
    slots
  }) {
    const router = inject(ROUTER_INJECTION_SYMBOL);
    const route = inject(ROUTE_INJECTION_SYMBOL);
    const parentDepth = inject(ROUTER_VIEW_DEPTH_SYMBOL, 0);
    const currentDepth = parentDepth + 1;
    provide(ROUTER_VIEW_DEPTH_SYMBOL, currentDepth);
    if (!router || !route) {
      throw new Error("RouterView must be used within a Router");
    }
    const currentComponent = shallowRef(null);
    const isLoading = ref(false);
    const error = shallowRef(null);
    const componentCache = /* @__PURE__ */ new Map();
    const loadingPromises = /* @__PURE__ */ new Map();
    const loadComponent = async (componentDef2, cacheKey) => {
      try {
        if (!componentDef2) return null;
        if (componentCache.has(cacheKey)) {
          return componentCache.get(cacheKey);
        }
        if (loadingPromises.has(cacheKey)) {
          return await loadingPromises.get(cacheKey);
        }
        if (typeof componentDef2 === "function") {
          const loadPromise = componentDef2().then((result) => {
            const component = result && typeof result === "object" && "default" in result ? result.default : result;
            componentCache.set(cacheKey, component);
            loadingPromises.delete(cacheKey);
            return component;
          });
          loadingPromises.set(cacheKey, loadPromise);
          return await loadPromise;
        }
        componentCache.set(cacheKey, componentDef2);
        return componentDef2;
      } catch (error2) {
        loadingPromises.delete(cacheKey);
        console.error("Failed to load component:", error2);
        throw error2;
      }
    };
    const matchedRecord = computed(() => {
      const matched = route.value?.matched;
      if (!matched?.length) return null;
      return matched[currentDepth - 1];
    });
    const componentDef = computed(() => {
      return matchedRecord.value?.components?.[props.name];
    });
    watch(componentDef, async (newComponentDef, oldComponentDef) => {
      if (!newComponentDef) {
        currentComponent.value = null;
        isLoading.value = false;
        error.value = null;
        return;
      }
      if (newComponentDef === oldComponentDef && currentComponent.value) {
        return;
      }
      const cacheKey = `${String(matchedRecord.value?.name ?? "default")}_${String(props.name)}`;
      try {
        if (typeof newComponentDef === "function" && props.loading) {
          isLoading.value = true;
        }
        const loadedComponent = await loadComponent(newComponentDef, cacheKey);
        if (loadedComponent) {
          currentComponent.value = markRaw(loadedComponent);
          error.value = null;
        }
        isLoading.value = false;
      } catch (err) {
        console.error("Failed to load component:", err);
        error.value = err;
        currentComponent.value = null;
        isLoading.value = false;
      }
    }, {
      immediate: true
    });
    return () => {
      const component = currentComponent.value;
      if (error.value) {
        return slots.error?.({
          error: error.value
        }) || h("div", {
          class: "router-view-error"
        }, `\u7EC4\u4EF6\u52A0\u8F7D\u5931\u8D25: ${error.value.message}`);
      }
      if (isLoading.value && props.loading) {
        return slots.loading?.() || h("div", {
          class: "router-view-loading"
        }, "\u52A0\u8F7D\u4E2D...");
      }
      const renderComponent = () => {
        if (!component) return null;
        const componentKey = matchedRecord.value?.name ? String(matchedRecord.value.name) : route.value?.path || "default";
        return h(component, {
          key: componentKey
        });
      };
      const wrapWithTransition = (vnode) => {
        if (!props.transition) return vnode;
        const transitionProps = typeof props.transition === "string" ? {
          name: props.transition,
          mode: "out-in"
        } : {
          mode: "out-in",
          ...props.transition
        };
        return h(Transition, transitionProps, () => vnode);
      };
      const wrapWithKeepAlive = (vnode) => {
        if (!props.keepAlive) return vnode;
        const keepAliveProps = {};
        if (props.include !== void 0) keepAliveProps.include = props.include;
        if (props.exclude !== void 0) keepAliveProps.exclude = props.exclude;
        if (props.max !== void 0) keepAliveProps.max = props.max;
        return h(KeepAlive, keepAliveProps, () => vnode);
      };
      if (slots.default) {
        const slotContent = slots.default({
          Component: component,
          route: route.value || {}
        });
        return wrapWithKeepAlive(slotContent);
      }
      const componentVNode = renderComponent();
      return wrapWithKeepAlive(wrapWithTransition(componentVNode));
    };
  }
});

export { RouterView, RouterView as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouterView.js.map
