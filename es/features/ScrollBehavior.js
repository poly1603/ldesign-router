/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class ScrollBehaviorManager {
  constructor(options = {}) {
    this.savedPositions = /* @__PURE__ */ new Map();
    this.isScrolling = false;
    this.options = {
      smooth: true,
      delay: 0,
      savePosition: true,
      maxSavedPositions: 100,
      anchorOffset: 0,
      exclude: [],
      custom: void 0,
      ...options
    };
  }
  /**
   * 保存当前滚动位置
   */
  saveScrollPosition(route) {
    if (!this.options.savePosition) return;
    if (this.options.exclude.includes(route.name)) return;
    const position = {
      left: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft,
      top: window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    };
    this.savedPositions.set(route.fullPath, {
      position,
      timestamp: Date.now()
    });
    if (this.savedPositions.size > this.options.maxSavedPositions) {
      const entries = Array.from(this.savedPositions.entries());
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const oldest = sorted[0];
      if (oldest) {
        this.savedPositions.delete(oldest[0]);
      }
    }
  }
  /**
   * 获取保存的滚动位置
   */
  getSavedPosition(route) {
    const record = this.savedPositions.get(route.fullPath);
    return record ? record.position : null;
  }
  /**
   * 处理滚动行为
   */
  async handleScroll(to, from, savedPosition) {
    if (this.isScrolling) {
      return;
    }
    this.saveScrollPosition(from);
    let scrollPosition;
    if (this.options.custom) {
      scrollPosition = this.options.custom(to, from, savedPosition || this.getSavedPosition(to));
    } else if (savedPosition) {
      scrollPosition = savedPosition;
    } else if (to.hash) {
      const el = typeof document !== "undefined" ? document.querySelector(to.hash) : null;
      scrollPosition = {
        left: 0,
        top: this.options.anchorOffset || 0,
        el
      };
    } else if (this.options.savePosition) {
      const saved = this.getSavedPosition(to);
      scrollPosition = saved || {
        left: 0,
        top: 0
      };
    } else {
      scrollPosition = {
        left: 0,
        top: 0
      };
    }
    if (scrollPosition === false) {
      return;
    }
    await this.performScroll(scrollPosition);
  }
  /**
   * 执行滚动
   */
  async performScroll(position) {
    this.isScrolling = true;
    if (this.options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }
    try {
      if ("el" in position && position.el) {
        const element = document.querySelector(position.selector || position.el);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY + (position.top || 0);
          this.scrollTo({
            left: 0,
            top
          });
        }
        return;
      }
      if ("selector" in position && position.selector) {
        const element = document.querySelector(position.selector);
        if (element) {
          element.scrollIntoView({
            behavior: this.options.smooth ? "smooth" : "auto",
            block: "start"
          });
        }
        return;
      }
      this.scrollTo(position);
    } finally {
      setTimeout(() => {
        this.isScrolling = false;
      }, 300);
    }
  }
  /**
   * 滚动到指定位置
   */
  scrollTo(position) {
    const options = {
      left: position.left || 0,
      top: position.top || 0,
      behavior: this.options.smooth ? "smooth" : "auto"
    };
    window.scrollTo(options);
  }
  /**
   * 滚动到顶部
   */
  scrollToTop(_smooth = true) {
    this.scrollTo({
      left: 0,
      top: 0
    });
  }
  /**
   * 滚动到底部
   */
  scrollToBottom(_smooth = true) {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollTo({
      left: 0,
      top: height
    });
  }
  /**
   * 滚动到元素
   */
  scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY + offset;
      this.scrollTo({
        left: 0,
        top
      });
    }
  }
  /**
   * 清除保存的位置
   */
  clearSavedPositions() {
    this.savedPositions.clear();
  }
  /**
   * 获取当前滚动位置
   */
  getCurrentPosition() {
    return {
      left: window.scrollX || window.pageXOffset || document.documentElement.scrollLeft,
      top: window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    };
  }
  /**
   * 是否在顶部
   */
  isAtTop() {
    return this.getCurrentPosition().top === 0;
  }
  /**
   * 是否在底部
   */
  isAtBottom() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || window.pageYOffset;
    const clientHeight = window.innerHeight;
    return scrollTop + clientHeight >= scrollHeight - 1;
  }
}
function createScrollBehavior(options) {
  return new ScrollBehaviorManager(options);
}
let defaultManager = null;
function getScrollManager() {
  if (!defaultManager) {
    defaultManager = new ScrollBehaviorManager();
  }
  return defaultManager;
}
const ScrollBehaviorPlugin = {
  install(app, options) {
    const manager = createScrollBehavior(options);
    app.config.globalProperties.$scrollBehavior = manager;
    app.provide("scrollBehavior", manager);
  }
};

export { ScrollBehaviorManager, ScrollBehaviorPlugin, createScrollBehavior, getScrollManager };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=ScrollBehavior.js.map
