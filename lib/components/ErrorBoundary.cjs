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

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
const DefaultErrorComponent = vue.defineComponent({
  name: "DefaultErrorComponent",
  props: {
    error: {
      type: Object,
      required: true
    },
    onRetry: {
      type: Function,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const isDetailsVisible = vue.ref(false);
    const toggleDetails = () => {
      isDetailsVisible.value = !isDetailsVisible.value;
    };
    const getErrorMessage = (error) => {
      if (error.type === "navigation") {
        return "\u9875\u9762\u5BFC\u822A\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5";
      }
      if (error.type === "async") {
        return "\u9875\u9762\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5";
      }
      if (error.type === "render") {
        return "\u9875\u9762\u6E32\u67D3\u51FA\u9519\uFF0C\u8BF7\u5237\u65B0\u9875\u9762";
      }
      return "\u53D1\u751F\u672A\u77E5\u9519\u8BEF\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458";
    };
    return () => vue.h("div", {
      class: "route-error-boundary"
    }, [vue.h("div", {
      class: "error-container"
    }, [vue.h("div", {
      class: "error-icon"
    }, "\u26A0\uFE0F"), vue.h("h2", {
      class: "error-title"
    }, "\u7CDF\u7CD5\uFF01\u51FA\u73B0\u4E86\u4E00\u4E9B\u95EE\u9898"), vue.h("p", {
      class: "error-message"
    }, getErrorMessage(props.error)), vue.h("div", {
      class: "error-actions"
    }, [vue.h("button", {
      class: "retry-button",
      onClick: props.onRetry
    }, "\u91CD\u8BD5"), props.showDetails && vue.h("button", {
      class: "details-button",
      onClick: toggleDetails
    }, isDetailsVisible.value ? "\u9690\u85CF\u8BE6\u60C5" : "\u663E\u793A\u8BE6\u60C5")]), props.showDetails && isDetailsVisible.value && vue.h("div", {
      class: "error-details"
    }, [vue.h("pre", {
      class: "error-stack"
    }, props.error.stack || props.error.error.stack), vue.h("div", {
      class: "error-meta"
    }, [vue.h("p", `\u8DEF\u7531: ${props.error.route}`), vue.h("p", `\u65F6\u95F4: ${new Date(props.error.timestamp).toLocaleString()}`), vue.h("p", `\u7C7B\u578B: ${props.error.type}`)])])])]);
  }
});
const ErrorBoundary = vue.defineComponent({
  name: "RouterErrorBoundary",
  props: {
    fallback: {
      type: Object,
      default: () => DefaultErrorComponent
    },
    onError: {
      type: Function
    },
    showDetails: {
      type: Boolean,
      default: typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('components/ErrorBoundary.cjs', document.baseURI).href)) }) !== "undefined" && undefined?.DEV || false
    },
    retryDelay: {
      type: Number,
      default: 1e3
    },
    maxRetries: {
      type: Number,
      default: 3
    },
    autoRetry: {
      type: Boolean,
      default: false
    },
    errorMessages: {
      type: Object,
      default: () => ({})
    },
    logErrors: {
      type: Boolean,
      default: true
    }
  },
  setup(props, {
    slots
  }) {
    const hasError = vue.ref(false);
    const errorInfo = vue.ref(null);
    const retryCount = vue.ref(0);
    const isRetrying = vue.ref(false);
    const reset = () => {
      hasError.value = false;
      errorInfo.value = null;
      retryCount.value = 0;
      isRetrying.value = false;
    };
    const retry = async () => {
      if (isRetrying.value) return;
      isRetrying.value = true;
      retryCount.value++;
      setTimeout(() => {
        reset();
      }, props.retryDelay);
    };
    const classifyError = (error) => {
      const message = error.message.toLowerCase();
      if (message.includes("navigation") || message.includes("route")) {
        return "navigation";
      }
      if (message.includes("async") || message.includes("promise") || message.includes("fetch")) {
        return "async";
      }
      if (message.includes("render") || message.includes("component")) {
        return "render";
      }
      return "unknown";
    };
    vue.onErrorCaptured((error, instance) => {
      const route = window.location.pathname;
      errorInfo.value = {
        error,
        route,
        timestamp: Date.now(),
        component: instance?.$options.name || "Unknown",
        type: classifyError(error),
        stack: error.stack
      };
      hasError.value = true;
      if (props.logErrors) {
        console.error("[RouterErrorBoundary] Caught error:", {
          error,
          route,
          component: errorInfo.value.component,
          type: errorInfo.value.type
        });
      }
      if (props.onError) {
        props.onError(errorInfo.value);
      }
      if (props.autoRetry && retryCount.value < props.maxRetries) {
        setTimeout(() => retry(), props.retryDelay * (retryCount.value + 1));
      }
      return false;
    });
    return () => {
      if (hasError.value && errorInfo.value) {
        return vue.h(props.fallback, {
          error: errorInfo.value,
          onRetry: retry,
          showDetails: props.showDetails
        });
      }
      return slots.default?.();
    };
  }
});
class RouteErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = /* @__PURE__ */ new Set();
    this.setupGlobalHandlers();
  }
  static getInstance() {
    if (!RouteErrorHandler.instance) {
      RouteErrorHandler.instance = new RouteErrorHandler();
    }
    return RouteErrorHandler.instance;
  }
  /**
   * 设置全局错误处理器
   */
  setupGlobalHandlers() {
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError({
        error: new Error(event.reason),
        route: window.location.pathname,
        timestamp: Date.now(),
        type: "async"
      });
    });
    window.addEventListener("error", (event) => {
      this.handleError({
        error: event.error || new Error(event.message),
        route: window.location.pathname,
        timestamp: Date.now(),
        type: "unknown"
      });
    });
  }
  /**
   * 处理错误
   */
  handleError(error) {
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    this.listeners.forEach((listener) => listener(error));
  }
  /**
   * 添加错误监听器
   */
  onError(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * 获取所有错误
   */
  getErrors() {
    return [...this.errors];
  }
  /**
   * 获取最近的错误
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }
  /**
   * 清除所有错误
   */
  clearErrors() {
    this.errors = [];
  }
  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      byRoute: {}
    };
    this.errors.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.byRoute[error.route] = (stats.byRoute[error.route] || 0) + 1;
    });
    return stats;
  }
}
function withErrorBoundary(component, options) {
  return vue.defineComponent({
    name: `WithErrorBoundary(${component.name || "Anonymous"})`,
    setup(_, {
      attrs,
      slots
    }) {
      return () => vue.h(ErrorBoundary, options, {
        default: () => vue.h(component, attrs, slots)
      });
    }
  });
}
const ErrorRecoveryStrategies = {
  /**
   * 重新加载页面
   */
  reload: () => {
    window.location.reload();
  },
  /**
   * 导航到首页
   */
  goHome: (router) => {
    router.push("/");
  },
  /**
   * 返回上一页
   */
  goBack: (router) => {
    router.back();
  },
  /**
   * 清除缓存并重试
   */
  clearCacheAndRetry: () => {
    localStorage.clear();
    sessionStorage.clear();
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  }
};

exports.ErrorBoundary = ErrorBoundary;
exports.ErrorRecoveryStrategies = ErrorRecoveryStrategies;
exports.RouteErrorHandler = RouteErrorHandler;
exports.default = ErrorBoundary;
exports.withErrorBoundary = withErrorBoundary;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=ErrorBoundary.cjs.map
