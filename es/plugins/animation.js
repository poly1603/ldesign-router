/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
const ANIMATION_PRESETS = {
  fade: {
    type: "fade",
    duration: 300,
    easing: "ease-in-out",
    enterClass: "router-fade-enter",
    enterActiveClass: "router-fade-enter-active",
    enterToClass: "router-fade-enter-to",
    leaveClass: "router-fade-leave",
    leaveActiveClass: "router-fade-leave-active",
    leaveToClass: "router-fade-leave-to"
  },
  slide: {
    type: "slide",
    duration: 400,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    enterClass: "router-slide-enter",
    enterActiveClass: "router-slide-enter-active",
    enterToClass: "router-slide-enter-to",
    leaveClass: "router-slide-leave",
    leaveActiveClass: "router-slide-leave-active",
    leaveToClass: "router-slide-leave-to"
  },
  scale: {
    type: "scale",
    duration: 350,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    enterClass: "router-scale-enter",
    enterActiveClass: "router-scale-enter-active",
    enterToClass: "router-scale-enter-to",
    leaveClass: "router-scale-leave",
    leaveActiveClass: "router-scale-leave-active",
    leaveToClass: "router-scale-leave-to"
  },
  flip: {
    type: "flip",
    duration: 600,
    easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    enterClass: "router-flip-enter",
    enterActiveClass: "router-flip-enter-active",
    enterToClass: "router-flip-enter-to",
    leaveClass: "router-flip-leave",
    leaveActiveClass: "router-flip-leave-active",
    leaveToClass: "router-flip-leave-to"
  },
  none: {
    type: "none",
    duration: 0
  }
};
class AnimationManager {
  // 默认动画类型，用于后续扩展
  // private defaultAnimation: AnimationType = 'fade'
  constructor() {
    this.animations = /* @__PURE__ */ new Map();
    this.customAnimations = /* @__PURE__ */ new Map();
    for (const [name, config] of Object.entries(ANIMATION_PRESETS)) {
      this.animations.set(name, config);
    }
  }
  /**
   * 设置默认动画
   */
  setDefaultAnimation(_animation) {
  }
  /**
   * 注册自定义动画
   */
  register(name, config) {
    this.customAnimations.set(name, config);
    this.animations.set(name, config);
  }
  /**
   * 获取动画配置
   */
  get(name) {
    return this.animations.get(name);
  }
  /**
   * 获取所有动画名称
   */
  getNames() {
    return Array.from(this.animations.keys());
  }
  /**
   * 根据路由变化选择动画
   */
  selectAnimation(to, from) {
    if (to.meta.transition) {
      const config = this.get(to.meta.transition);
      if (config) return config;
    }
    const toDepth = to.path.split("/").length;
    const fromDepth = from.path.split("/").length;
    if (toDepth > fromDepth) {
      return this.get("slide") || ANIMATION_PRESETS.slide;
    } else if (toDepth < fromDepth) {
      const slideConfig = this.get("slide") || ANIMATION_PRESETS.slide;
      return {
        ...slideConfig,
        enterClass: slideConfig.leaveClass || "",
        enterActiveClass: slideConfig.leaveActiveClass || "",
        enterToClass: slideConfig.leaveToClass || "",
        leaveClass: slideConfig.enterClass || "",
        leaveActiveClass: slideConfig.enterActiveClass || "",
        leaveToClass: slideConfig.enterToClass || ""
      };
    }
    return this.get("fade") || ANIMATION_PRESETS.fade;
  }
  /**
   * 生成 CSS 样式
   */
  generateCSS() {
    let css = "";
    css += `
/* \u6DE1\u5165\u6DE1\u51FA\u52A8\u753B */
.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity ${ANIMATION_PRESETS.fade.duration}ms ${ANIMATION_PRESETS.fade.easing};
}

.router-fade-enter-from,
.router-fade-leave-to {
  opacity: 0;
}

.router-fade-enter-to,
.router-fade-leave-from {
  opacity: 1;
}
`;
    css += `
/* \u6ED1\u52A8\u52A8\u753B */
.router-slide-enter-active,
.router-slide-leave-active {
  transition: transform ${ANIMATION_PRESETS.slide.duration}ms ${ANIMATION_PRESETS.slide.easing};
}

.router-slide-enter-from {
  transform: translateX(100%);
}

.router-slide-leave-to {
  transform: translateX(-100%);
}

.router-slide-enter-to,
.router-slide-leave-from {
  transform: translateX(0);
}
`;
    css += `
/* \u7F29\u653E\u52A8\u753B */
.router-scale-enter-active,
.router-scale-leave-active {
  transition: transform ${ANIMATION_PRESETS.scale.duration}ms ${ANIMATION_PRESETS.scale.easing},
              opacity ${ANIMATION_PRESETS.scale.duration}ms ${ANIMATION_PRESETS.scale.easing};
}

.router-scale-enter-from {
  transform: scale(0.8);
  opacity: 0;
}

.router-scale-leave-to {
  transform: scale(1.2);
  opacity: 0;
}

.router-scale-enter-to,
.router-scale-leave-from {
  transform: scale(1);
  opacity: 1;
}
`;
    css += `
/* \u7FFB\u8F6C\u52A8\u753B */
.router-flip-enter-active,
.router-flip-leave-active {
  transition: transform ${ANIMATION_PRESETS.flip.duration}ms ${ANIMATION_PRESETS.flip.easing};
  transform-style: preserve-3d;
}

.router-flip-enter-from {
  transform: rotateY(-90deg);
}

.router-flip-leave-to {
  transform: rotateY(90deg);
}

.router-flip-enter-to,
.router-flip-leave-from {
  transform: rotateY(0deg);
}
`;
    css += `
/* \u901A\u7528\u6837\u5F0F */
.router-view {
  position: relative;
}

.router-view > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* \u54CD\u5E94\u5F0F\u52A8\u753B */
@media (prefers-reduced-motion: reduce) {
  .router-fade-enter-active,
  .router-fade-leave-active,
  .router-slide-enter-active,
  .router-slide-leave-active,
  .router-scale-enter-active,
  .router-scale-leave-active,
  .router-flip-enter-active,
  .router-flip-leave-active {
    transition: none !important;
  }
}
`;
    return css;
  }
  /**
   * 注入样式到页面
   */
  injectStyles() {
    if (typeof document === "undefined") return;
    const styleId = "ldesign-router-animations";
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = this.generateCSS();
  }
}
function createAnimationPlugin(options = {}) {
  const {
    defaultAnimation = "fade",
    customAnimations = {},
    autoInjectStyles = true,
    smartSelection = true
  } = options;
  const manager = new AnimationManager();
  if (defaultAnimation) {
    manager.setDefaultAnimation(defaultAnimation);
  }
  for (const [name, config] of Object.entries(customAnimations)) {
    manager.register(name, config);
  }
  return {
    install(app, router) {
      if (autoInjectStyles) {
        manager.injectStyles();
      }
      app.provide("animationManager", manager);
      app.config.globalProperties.$animationManager = manager;
      if (smartSelection) {
        router.beforeEach((to, from, next) => {
          if (!to.meta.transition) {
            const animation = manager.selectAnimation(to, from);
            to.meta.transition = animation.type;
          }
          next();
        });
      }
    },
    manager
  };
}
function createAnimationConfig(config) {
  return {
    type: "fade",
    duration: 300,
    easing: "ease-in-out",
    ...config
  };
}
function supportsAnimations() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  const testElement = document.createElement("div");
  return "transition" in testElement.style;
}
function getAnimationDuration(element) {
  if (typeof window === "undefined") return 0;
  const computedStyle = window.getComputedStyle(element);
  const duration = computedStyle.transitionDuration || computedStyle.animationDuration;
  const match = duration.match(/^([\d.]+)(s|ms)$/);
  if (!match) return 0;
  const value = Number.parseFloat(match[1] || "0");
  const unit = match[2];
  return unit === "s" ? value * 1e3 : value;
}
var animation = {
  createAnimationPlugin,
  AnimationManager,
  ANIMATION_PRESETS,
  createAnimationConfig,
  supportsAnimations,
  getAnimationDuration
};

export { ANIMATION_PRESETS, AnimationManager, createAnimationConfig, createAnimationPlugin, animation as default, getAnimationDuration, supportsAnimations };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=animation.js.map
