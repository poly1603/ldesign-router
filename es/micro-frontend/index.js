/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import mitt from 'mitt';
import { reactive, inject, ref, watch, h } from 'vue';

class MicroFrontendRouter {
  constructor(config) {
    this.apps = /* @__PURE__ */ new Map();
    this.appStates = /* @__PURE__ */ new Map();
    this.activeApps = /* @__PURE__ */ new Set();
    this.eventBus = mitt();
    this.router = null;
    this.appContainers = /* @__PURE__ */ new Map();
    this.appScripts = /* @__PURE__ */ new Map();
    this.appStyles = /* @__PURE__ */ new Map();
    this.globalState = reactive({});
    this.stateWatchers = /* @__PURE__ */ new Map();
    this.config = config;
    this.registerApps(config.apps);
  }
  /**
   * 注册微应用
   */
  registerApps(apps) {
    apps.forEach((app) => this.registerApp(app));
  }
  /**
   * 注册单个微应用
   */
  registerApp(app) {
    this.apps.set(app.name, app);
    this.appStates.set(app.name, {
      loading: false,
      mounted: false,
      error: null
    });
    if (app.prefetch || this.config.prefetch) {
      this.prefetchApp(app);
    }
  }
  /**
   * 注销微应用
   */
  unregisterApp(name) {
    const app = this.apps.get(name);
    if (!app) return;
    if (this.activeApps.has(name)) {
      this.unmountApp(name);
    }
    this.apps.delete(name);
    this.appStates.delete(name);
    this.appContainers.delete(name);
    this.appScripts.delete(name);
    this.appStyles.delete(name);
  }
  /**
   * 启动微前端
   */
  async start(router) {
    if (router) {
      this.router = router;
      this.setupRouterIntegration(router);
    }
    this.listenRouteChange();
    await this.reroute();
  }
  /**
   * 设置路由集成
   */
  setupRouterIntegration(router) {
    this.apps.forEach((app, name) => {
      const route = {
        path: this.getAppPath(app),
        name: `micro-${name}`,
        component: {
          name: `MicroApp-${name}`,
          setup: () => {
            const container = ref();
            watch(container, async (el) => {
              if (el) {
                await this.mountApp(name, el);
              }
            });
            return () => ({
              render() {
                return h("div", {
                  ref: container,
                  id: `micro-app-${name}`,
                  class: "micro-app-container"
                });
              }
            });
          }
        },
        meta: {
          microApp: name
        }
      };
      router.addRoute(route);
    });
  }
  /**
   * 获取应用路径
   */
  getAppPath(app) {
    if (typeof app.activeRule === "string") {
      return app.activeRule;
    }
    return `/${app.name}`;
  }
  /**
   * 监听路由变化
   */
  listenRouteChange() {
    if (this.router) {
      this.router.afterEach((_to) => {
        this.reroute();
      });
    } else {
      window.addEventListener("popstate", () => this.reroute());
      window.addEventListener("hashchange", () => this.reroute());
    }
  }
  /**
   * 路由变化处理
   */
  async reroute() {
    const currentApps = this.getActiveApps();
    const toMount = /* @__PURE__ */ new Set();
    const toUnmount = /* @__PURE__ */ new Set();
    currentApps.forEach((name) => {
      if (!this.activeApps.has(name)) {
        toMount.add(name);
      }
    });
    this.activeApps.forEach((name) => {
      if (!currentApps.has(name)) {
        toUnmount.add(name);
      }
    });
    for (const name of toUnmount) {
      await this.unmountApp(name);
    }
    for (const name of toMount) {
      await this.mountApp(name);
    }
  }
  /**
   * 获取当前激活的应用
   */
  getActiveApps() {
    const activeApps = /* @__PURE__ */ new Set();
    const location = window.location;
    this.apps.forEach((app, name) => {
      if (this.isAppActive(app, location)) {
        activeApps.add(name);
      }
    });
    return activeApps;
  }
  /**
   * 判断应用是否激活
   */
  isAppActive(app, location) {
    const {
      activeRule
    } = app;
    if (typeof activeRule === "string") {
      return location.pathname.startsWith(activeRule);
    }
    if (activeRule instanceof RegExp) {
      return activeRule.test(location.pathname);
    }
    if (typeof activeRule === "function") {
      return activeRule(location);
    }
    return false;
  }
  /**
   * 挂载应用
   */
  async mountApp(name, container) {
    const app = this.apps.get(name);
    if (!app) return;
    const state = this.appStates.get(name);
    if (state.mounted) return;
    state.loading = true;
    if (app.loader) app.loader(true);
    try {
      if (this.config.lifeCycles?.beforeMount) {
        await this.config.lifeCycles.beforeMount(app);
      }
      if (app.beforeMount) {
        await app.beforeMount(app);
      }
      await this.loadApp(app);
      const appContainer = container || this.createContainer(app);
      this.appContainers.set(name, appContainer);
      if (app.sandbox !== false) {
        this.createSandbox(app);
      }
      await this.doMount(app, appContainer);
      state.mounted = true;
      this.activeApps.add(name);
      if (app.afterMount) {
        await app.afterMount(app);
      }
      if (this.config.lifeCycles?.afterMount) {
        await this.config.lifeCycles.afterMount(app);
      }
      this.eventBus.emit("app:mounted", {
        name,
        app
      });
    } catch (error) {
      state.error = error;
      this.eventBus.emit("app:error", {
        name,
        error
      });
      throw error;
    } finally {
      state.loading = false;
      if (app.loader) app.loader(false);
    }
  }
  /**
   * 卸载应用
   */
  async unmountApp(name) {
    const app = this.apps.get(name);
    if (!app) return;
    const state = this.appStates.get(name);
    if (!state.mounted) return;
    try {
      if (this.config.lifeCycles?.beforeUnmount) {
        await this.config.lifeCycles.beforeUnmount(app);
      }
      if (app.beforeUnmount) {
        await app.beforeUnmount(app);
      }
      await this.doUnmount(app);
      const container = this.appContainers.get(name);
      if (container) {
        container.innerHTML = "";
      }
      this.destroySandbox(app);
      state.mounted = false;
      this.activeApps.delete(name);
      if (app.afterUnmount) {
        await app.afterUnmount(app);
      }
      if (this.config.lifeCycles?.afterUnmount) {
        await this.config.lifeCycles.afterUnmount(app);
      }
      this.eventBus.emit("app:unmounted", {
        name,
        app
      });
    } catch (error) {
      state.error = error;
      this.eventBus.emit("app:error", {
        name,
        error
      });
      throw error;
    }
  }
  /**
   * 加载应用资源
   */
  async loadApp(app) {
    const {
      entry
    } = app;
    if (typeof entry === "string") {
      const response = await fetch(entry);
      const html = await response.text();
      await this.parseHTML(app, html);
    }
  }
  /**
   * 解析 HTML
   */
  async parseHTML(app, html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const scripts = Array.from(doc.querySelectorAll("script"));
    const scriptElements = [];
    for (const script of scripts) {
      const scriptEl = document.createElement("script");
      if (script.src) {
        const response = await fetch(script.src);
        scriptEl.textContent = await response.text();
      } else {
        scriptEl.textContent = script.textContent;
      }
      scriptElements.push(scriptEl);
    }
    this.appScripts.set(app.name, scriptElements);
    const styles = Array.from(doc.querySelectorAll("style"));
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    const styleElements = [];
    for (const style of styles) {
      const styleEl = document.createElement("style");
      styleEl.textContent = style.textContent;
      styleElements.push(styleEl);
    }
    for (const link of links) {
      if (link.href) {
        const response = await fetch(link.href);
        const styleEl = document.createElement("style");
        styleEl.textContent = await response.text();
        styleElements.push(styleEl);
      }
    }
    this.appStyles.set(app.name, styleElements);
  }
  /**
   * 创建容器
   */
  createContainer(app) {
    let container;
    if (typeof app.container === "string") {
      container = document.querySelector(app.container);
      if (!container) {
        container = document.createElement("div");
        container.id = app.container.replace("#", "");
        document.body.appendChild(container);
      }
    } else {
      container = app.container;
    }
    return container;
  }
  /**
   * 创建沙箱
   */
  createSandbox(_app) {
  }
  /**
   * 样式隔离（暂时禁用）
   */
  // @ts-expect-error - 保留用于未来功能
  _applySandboxStyles(app) {
    const styles = this.appStyles.get(app.name);
    if (styles) {
      styles.forEach((style) => {
        style.textContent = this.scopeCSS(style.textContent, app.name);
      });
    }
  }
  /**
   * 销毁沙箱
   */
  destroySandbox(app) {
    const styles = this.appStyles.get(app.name);
    if (styles) {
      styles.forEach((style) => style.remove());
    }
    const scripts = this.appScripts.get(app.name);
    if (scripts) {
      scripts.forEach((script) => script.remove());
    }
  }
  /**
   * CSS 作用域处理
   */
  scopeCSS(css, scope) {
    const scopeClass = `micro-app-${scope}`;
    return css.replace(/([^{}]+)\{/g, (match, selector) => {
      if (selector.trim().startsWith("@")) {
        return match;
      }
      const scopedSelector = selector.split(",").map((s) => `.${scopeClass} ${s.trim()}`).join(",");
      return `${scopedSelector}{`;
    });
  }
  /**
   * 执行挂载
   */
  async doMount(app, container) {
    container.classList.add(`micro-app-${app.name}`);
    const styles = this.appStyles.get(app.name);
    if (styles) {
      styles.forEach((style) => document.head.appendChild(style));
    }
    const scripts = this.appScripts.get(app.name);
    if (scripts) {
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        container.appendChild(newScript);
      });
    }
    if (app.props) {
      window[`__MICRO_APP_PROPS_${app.name}__`] = app.props;
    }
  }
  /**
   * 执行卸载
   */
  async doUnmount(app) {
    delete window[`__MICRO_APP_PROPS_${app.name}__`];
  }
  /**
   * 预加载应用
   */
  async prefetchApp(app) {
    try {
      await this.loadApp(app);
    } catch (error) {
      console.warn(`Failed to prefetch app ${app.name}:`, error);
    }
  }
  /**
   * 跨应用通信 - 发送消息
   */
  sendMessage(target, message) {
    const targets = Array.isArray(target) ? target : [target];
    targets.forEach((appName) => {
      this.eventBus.emit(`message:${appName}`, message);
    });
    if (target === "*") {
      this.eventBus.emit("message:broadcast", message);
    }
  }
  /**
   * 跨应用通信 - 监听消息
   */
  onMessage(appName, handler) {
    this.eventBus.on(`message:${appName}`, handler);
    this.eventBus.on("message:broadcast", handler);
    return () => {
      this.eventBus.off(`message:${appName}`, handler);
      this.eventBus.off("message:broadcast", handler);
    };
  }
  /**
   * 全局状态管理 - 设置状态
   */
  setGlobalState(key, value) {
    this.globalState[key] = value;
    const watchers = this.stateWatchers.get(key);
    if (watchers) {
      watchers.forEach((watcher) => watcher(value));
    }
  }
  /**
   * 全局状态管理 - 获取状态
   */
  getGlobalState(key) {
    if (key) {
      return this.globalState[key];
    }
    return {
      ...this.globalState
    };
  }
  /**
   * 全局状态管理 - 监听状态变化
   */
  watchGlobalState(key, watcher) {
    if (!this.stateWatchers.has(key)) {
      this.stateWatchers.set(key, []);
    }
    this.stateWatchers.get(key).push(watcher);
    return () => {
      const watchers = this.stateWatchers.get(key);
      if (watchers) {
        const index = watchers.indexOf(watcher);
        if (index > -1) {
          watchers.splice(index, 1);
        }
      }
    };
  }
  /**
   * 导航到子应用
   */
  navigateToApp(appName, path) {
    const app = this.apps.get(appName);
    if (!app) {
      throw new Error(`App ${appName} not found`);
    }
    const basePath = this.getAppPath(app);
    const fullPath = path ? `${basePath}${path}` : basePath;
    if (this.router) {
      this.router.push(fullPath);
    } else {
      window.history.pushState({}, "", fullPath);
      this.reroute();
    }
  }
  /**
   * 获取应用状态
   */
  getAppState(name) {
    return this.appStates.get(name);
  }
  /**
   * 获取所有应用
   */
  getApps() {
    return Array.from(this.apps.values());
  }
  /**
   * 获取激活的应用
   */
  getActiveAppNames() {
    return Array.from(this.activeApps);
  }
  /**
   * 监听应用事件
   */
  on(event, handler) {
    this.eventBus.on(event, handler);
    return () => this.eventBus.off(event, handler);
  }
  /**
   * 销毁
   */
  async destroy() {
    for (const name of this.activeApps) {
      await this.unmountApp(name);
    }
    this.apps.clear();
    this.appStates.clear();
    this.activeApps.clear();
    this.appContainers.clear();
    this.appScripts.clear();
    this.appStyles.clear();
    this.globalState = reactive({});
    this.stateWatchers.clear();
    this.eventBus.all?.clear?.();
  }
}
const MicroFrontendPlugin = {
  install(app, options) {
    const microRouter = new MicroFrontendRouter(options);
    app.config.globalProperties.$microRouter = microRouter;
    app.provide("microRouter", microRouter);
    app.mixin({
      mounted() {
        if (this.$options.name === "App") {
          microRouter.start(this.$router);
        }
      }
    });
  }
};
function useMicroFrontend() {
  const microRouter = inject("microRouter");
  if (!microRouter) {
    throw new Error("MicroFrontendRouter not found");
  }
  return {
    registerApp: microRouter.registerApp.bind(microRouter),
    unregisterApp: microRouter.unregisterApp.bind(microRouter),
    navigateToApp: microRouter.navigateToApp.bind(microRouter),
    sendMessage: microRouter.sendMessage.bind(microRouter),
    onMessage: microRouter.onMessage.bind(microRouter),
    setGlobalState: microRouter.setGlobalState.bind(microRouter),
    getGlobalState: microRouter.getGlobalState.bind(microRouter),
    watchGlobalState: microRouter.watchGlobalState.bind(microRouter),
    getAppState: microRouter.getAppState.bind(microRouter),
    getApps: microRouter.getApps.bind(microRouter),
    getActiveAppNames: microRouter.getActiveAppNames.bind(microRouter),
    on: microRouter.on.bind(microRouter)
  };
}

export { MicroFrontendPlugin, MicroFrontendRouter, useMicroFrontend };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
