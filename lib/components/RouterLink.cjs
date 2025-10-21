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
var index = require('../composables/index.cjs');

const RouterLink = vue.defineComponent({
  name: "RouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: {
      type: Boolean,
      default: false
    },
    activeClass: {
      type: String,
      default: "router-link-active"
    },
    exactActiveClass: {
      type: String,
      default: "router-link-exact-active"
    },
    custom: {
      type: Boolean,
      default: false
    },
    // 预加载支持
    preload: {
      type: [Boolean, String],
      default: false
    },
    preloadDelay: {
      type: Number,
      default: 50
      // 延迟预加载，避免误触
    },
    // 权限控制
    permission: {
      type: [String, Function],
      default: void 0
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
    // 新增：禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    // 新增：加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 新增：点击事件拦截
    beforeNavigate: {
      type: Function,
      default: void 0
    },
    // 新增：自定义激活匹配逻辑
    isActiveMatch: {
      type: Function,
      default: void 0
    },
    // 新增：预取优先级
    prefetchPriority: {
      type: String,
      default: "auto"
    },
    // 新增：无障碍属性
    ariaCurrentValue: {
      type: String,
      default: "page"
    },
    // 新增：自动滚动
    scrollToTop: {
      type: Boolean,
      default: false
    },
    // 新增：动画配置
    transition: {
      type: [Boolean, String, Object],
      default: false
    }
  },
  setup(props, {
    slots,
    attrs
  }) {
    const router = index.useRouter();
    const link = index.useLink({
      to: props.to,
      replace: props.replace
    });
    const linkRef = vue.ref();
    const isExternal = vue.computed(() => {
      if (props.external) return true;
      if (typeof props.to === "string") {
        return /^https?:\/\//.test(props.to) || props.to.startsWith("mailto:") || props.to.startsWith("tel:");
      }
      return false;
    });
    const hasPermission = vue.computed(() => {
      if (!props.permission) return true;
      if (typeof props.permission === "string") {
        return true;
      }
      if (typeof props.permission === "function") {
        return props.permission();
      }
      return true;
    });
    const classes = vue.computed(() => {
      const result = [];
      if (!isExternal.value && link.isActive.value) {
        result.push(props.activeClass);
      }
      if (!isExternal.value && link.isExactActive.value) {
        result.push(props.exactActiveClass);
      }
      return result;
    });
    const preloadRoute = async () => {
      if (!props.preload || isExternal.value) return;
      try {
        const route = router.resolve(props.to);
        const matched = route.matched[route.matched.length - 1];
        const component = matched?.components?.default;
        if (component && typeof component === "function") {
          await component();
        }
      } catch (error) {
        console.warn("Failed to preload route:", error);
      }
    };
    const handleMouseEnter = () => {
      if (props.preload === "hover" || props.preload === true) {
        preloadRoute();
      }
    };
    let observer = null;
    vue.onMounted(() => {
      if (props.preload === "visible" && linkRef.value) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preloadRoute();
              observer?.disconnect();
            }
          });
        });
        observer.observe(linkRef.value);
      }
    });
    vue.onUnmounted(() => {
      observer?.disconnect();
    });
    return () => {
      if (!hasPermission.value) {
        return null;
      }
      const href = isExternal.value ? props.to : link.href.value;
      const children = slots.default?.({
        href,
        route: isExternal.value ? null : link.route.value,
        navigate: isExternal.value ? void 0 : link.navigate,
        isActive: isExternal.value ? false : link.isActive.value,
        isExactActive: isExternal.value ? false : link.isExactActive.value,
        isExternal: isExternal.value
      });
      if (props.custom) {
        return children;
      }
      const linkProps = {
        ...attrs,
        ref: linkRef,
        href,
        class: classes.value,
        onMouseenter: handleMouseEnter
      };
      if (isExternal.value) {
        if (props.target) {
          linkProps.target = props.target;
        } else if (/^https?:\/\//.test(href)) {
          linkProps.target = "_blank";
          linkProps.rel = "noopener noreferrer";
        }
        return vue.h("a", linkProps, children);
      }
      linkProps.onClick = (e) => {
        e.preventDefault();
        link.navigate();
      };
      return vue.h("a", linkProps, children);
    };
  }
});

exports.RouterLink = RouterLink;
exports.default = RouterLink;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=RouterLink.cjs.map
