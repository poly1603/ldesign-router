/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, computed } from 'vue';
import { logger } from '../../utils/logger.js';

class I18nRouteManager {
  constructor(router, config) {
    this.currentLocale = ref("");
    this.originalRoutes = [];
    this.localizedRoutes = /* @__PURE__ */ new Map();
    this.router = router;
    this.config = {
      detectBrowserLanguage: true,
      strategy: "non-default",
      preserveRouteOnLocaleChange: true,
      pathLocalization: {},
      storageKey: "router-locale",
      onLocaleChange: () => {
      },
      fallbackRoute: "/404",
      ...config
    };
    this.originalRoutes = [...router.getRoutes().map((r) => this.routeToRaw(r))];
    this.initializeLocale();
    this.generateLocalizedRoutes();
    this.setupNavigationGuards();
  }
  /**
   * 初始化语言设置
   */
  initializeLocale() {
    let locale = this.config.defaultLocale;
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored && this.config.locales.includes(stored)) {
        locale = stored;
      }
    }
    if (this.config.detectBrowserLanguage && !localStorage.getItem(this.config.storageKey)) {
      const browserLang = this.detectBrowserLanguage();
      if (browserLang && this.config.locales.includes(browserLang)) {
        locale = browserLang;
      }
    }
    this.currentLocale.value = locale;
  }
  /**
   * 检测浏览器语言
   */
  detectBrowserLanguage() {
    if (typeof navigator === "undefined") return null;
    const lang = navigator.language?.toLowerCase();
    if (this.config.locales.includes(lang)) {
      return lang;
    }
    const shortLang = lang?.split("-")[0];
    if (shortLang && this.config.locales.includes(shortLang)) {
      return shortLang;
    }
    if (navigator.languages) {
      for (const l of navigator.languages) {
        const lower = l.toLowerCase();
        if (this.config.locales.includes(lower)) {
          return lower;
        }
        const short = lower.split("-")[0];
        if (short && this.config.locales.includes(short)) {
          return short;
        }
      }
    }
    return null;
  }
  /**
   * 生成本地化路由
   */
  generateLocalizedRoutes() {
    for (const locale of this.config.locales) {
      const routes = this.createLocalizedRoutes(this.originalRoutes, locale);
      this.localizedRoutes.set(locale, routes);
    }
    this.applyLocalizedRoutes(this.currentLocale.value);
  }
  /**
   * 创建特定语言的路由
   */
  createLocalizedRoutes(routes, locale) {
    return routes.map((route) => {
      const localizedRoute = {
        ...route
      };
      if (localizedRoute.path) {
        localizedRoute.path = this.localizePath(localizedRoute.path, locale);
      }
      if (this.shouldAddPrefix(locale) && !localizedRoute.path.startsWith(`/${locale}`)) {
        localizedRoute.path = `/${locale}${localizedRoute.path}`;
      }
      if (localizedRoute.alias) {
        const aliases = Array.isArray(localizedRoute.alias) ? localizedRoute.alias : [localizedRoute.alias];
        localizedRoute.alias = aliases.map((alias) => {
          const localized = this.localizePath(alias, locale);
          return this.shouldAddPrefix(locale) ? `/${locale}${localized}` : localized;
        });
      }
      if (localizedRoute.redirect) {
        if (typeof localizedRoute.redirect === "string") {
          const localized = this.localizePath(localizedRoute.redirect, locale);
          localizedRoute.redirect = this.shouldAddPrefix(locale) ? `/${locale}${localized}` : localized;
        }
      }
      localizedRoute.meta = {
        ...localizedRoute.meta,
        locale
      };
      if (localizedRoute.children) {
        localizedRoute.children = this.createLocalizedRoutes(localizedRoute.children, locale);
      }
      return localizedRoute;
    });
  }
  /**
   * 本地化路径
   */
  localizePath(path, locale) {
    const pathMap = this.config.pathLocalization[path];
    if (pathMap && pathMap[locale]) {
      return pathMap[locale];
    }
    const segments = path.split("/");
    const localizedSegments = segments.map((segment) => {
      if (segment.startsWith(":") || segment === "*") {
        return segment;
      }
      const segmentMap = this.config.pathLocalization[`/${segment}`];
      if (segmentMap && segmentMap[locale]) {
        return segmentMap[locale].substring(1);
      }
      return segment;
    });
    return localizedSegments.join("/");
  }
  /**
   * 是否应该添加语言前缀
   */
  shouldAddPrefix(locale) {
    switch (this.config.strategy) {
      case "always":
        return true;
      case "never":
        return false;
      case "non-default":
        return locale !== this.config.defaultLocale;
      default:
        return false;
    }
  }
  /**
   * 应用本地化路由
   */
  applyLocalizedRoutes(locale) {
    const currentRoutes = this.router.getRoutes();
    currentRoutes.forEach((route) => {
      if (route.name) {
        this.router.removeRoute(route.name);
      }
    });
    const localizedRoutes = this.localizedRoutes.get(locale) || [];
    localizedRoutes.forEach((route) => {
      this.router.addRoute(route);
    });
    logger.info(`Applied routes for locale: ${locale}`);
  }
  /**
   * 设置导航守卫
   */
  setupNavigationGuards() {
    this.router.beforeEach((to, _from, next) => {
      const urlLocale = this.extractLocaleFromPath(to.path);
      if (urlLocale && urlLocale !== this.currentLocale.value) {
        this.setLocale(urlLocale);
      }
      if (this.shouldAddPrefix(this.currentLocale.value) && !urlLocale) {
        const newPath = `/${this.currentLocale.value}${to.path}`;
        next(newPath);
        return;
      }
      next();
    });
  }
  /**
   * 从路径中提取语言
   */
  extractLocaleFromPath(path) {
    const segments = path.split("/").filter(Boolean);
    const firstSegment = segments[0];
    if (segments.length > 0 && firstSegment && this.config.locales.includes(firstSegment)) {
      return firstSegment;
    }
    return null;
  }
  /**
   * 路由记录转换为原始格式
   */
  routeToRaw(route) {
    return {
      path: route.path,
      name: route.name,
      component: route.component,
      components: route.components,
      redirect: route.redirect,
      alias: route.alias,
      meta: route.meta,
      beforeEnter: route.beforeEnter,
      props: route.props,
      children: route.children
    };
  }
  // ==================== 公共 API ====================
  /**
   * 获取当前语言
   */
  getLocale() {
    return this.currentLocale.value;
  }
  /**
   * 设置语言
   */
  setLocale(locale) {
    if (!this.config.locales.includes(locale)) {
      logger.warn(`Locale "${locale}" is not supported`);
      return;
    }
    const oldLocale = this.currentLocale.value;
    if (locale === oldLocale) return;
    const currentRoute = this.router.currentRoute.value;
    const routeWithoutLocale = this.removeLocaleFromRoute(currentRoute);
    this.currentLocale.value = locale;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.config.storageKey, locale);
    }
    this.applyLocalizedRoutes(locale);
    if (this.config.preserveRouteOnLocaleChange) {
      const newPath = this.localizeCurrentPath(routeWithoutLocale, locale);
      this.router.push(newPath).catch(() => {
        const homePath = this.shouldAddPrefix(locale) ? `/${locale}/` : "/";
        this.router.push(homePath);
      });
    }
    this.config.onLocaleChange(locale, oldLocale);
    logger.info(`Locale changed from ${oldLocale} to ${locale}`);
  }
  /**
   * 移除路由中的语言信息
   */
  removeLocaleFromRoute(route) {
    const locale = this.extractLocaleFromPath(route.path);
    if (locale) {
      return route.path.substring(locale.length + 1) || "/";
    }
    return route.path;
  }
  /**
   * 本地化当前路径
   */
  localizeCurrentPath(path, locale) {
    const localizedPath = this.localizePath(path, locale);
    return this.shouldAddPrefix(locale) ? `/${locale}${localizedPath}` : localizedPath;
  }
  /**
   * 获取本地化路径
   */
  getLocalizedPath(path, locale) {
    const targetLocale = locale || this.currentLocale.value;
    const localizedPath = this.localizePath(path, targetLocale);
    return this.shouldAddPrefix(targetLocale) ? `/${targetLocale}${localizedPath}` : localizedPath;
  }
  /**
   * 获取所有语言的路径
   */
  getAllLocalizedPaths(path) {
    const result = {};
    for (const locale of this.config.locales) {
      result[locale] = this.getLocalizedPath(path, locale);
    }
    return result;
  }
  /**
   * 切换到下一个语言
   */
  nextLocale() {
    const currentIndex = this.config.locales.indexOf(this.currentLocale.value);
    const nextIndex = (currentIndex + 1) % this.config.locales.length;
    const nextLocale = this.config.locales[nextIndex];
    if (nextLocale) this.setLocale(nextLocale);
  }
  /**
   * 获取语言切换链接
   */
  getLocaleSwitchLinks() {
    const currentRoute = this.router.currentRoute.value;
    const pathWithoutLocale = this.removeLocaleFromRoute(currentRoute);
    return this.config.locales.map((locale) => ({
      locale,
      path: this.localizeCurrentPath(pathWithoutLocale, locale),
      active: locale === this.currentLocale.value
    }));
  }
}
let i18nManager = null;
function setupI18nRouter(router, config) {
  i18nManager = new I18nRouteManager(router, config);
  return i18nManager;
}
function getI18nManager() {
  return i18nManager;
}
function useI18nRoute() {
  if (!i18nManager) {
    throw new Error("I18n router not initialized. Call setupI18nRouter first.");
  }
  const currentLocale = computed(() => i18nManager.getLocale());
  return {
    // 当前语言
    locale: currentLocale,
    // 设置语言
    setLocale: (locale) => i18nManager.setLocale(locale),
    // 切换到下一个语言
    nextLocale: () => i18nManager.nextLocale(),
    // 获取本地化路径
    localizePath: (path, locale) => i18nManager.getLocalizedPath(path, locale),
    // 获取所有语言的路径
    getAllPaths: (path) => i18nManager.getAllLocalizedPaths(path),
    // 获取语言切换链接
    getSwitchLinks: () => i18nManager.getLocaleSwitchLinks(),
    // 支持的语言列表
    locales: i18nManager.config.locales,
    // 默认语言
    defaultLocale: i18nManager.config.defaultLocale
  };
}
const I18nRouterPlugin = {
  install(app, options) {
    const manager = setupI18nRouter(options.router, options.config);
    app.config.globalProperties.$i18n = manager;
    app.provide("i18nRouter", manager);
  }
};

export { I18nRouteManager, I18nRouterPlugin, getI18nManager, setupI18nRouter, useI18nRoute };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
