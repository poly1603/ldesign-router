/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function createPermissionGuard(options) {
  const {
    checker,
    redirectTo = "/login",
    errorMessage = "\u6CA1\u6709\u8BBF\u95EE\u6743\u9650",
    permissionField = "requiresAuth"
  } = options;
  return async (to, _from, next) => {
    const requiresPermission = to.matched.some((record) => {
      return record.meta[permissionField] || record.meta.permissions;
    });
    if (!requiresPermission) {
      next();
      return;
    }
    try {
      const permissions = to.meta.permissions || to.meta.roles || [];
      const hasPermission = await checker(Array.isArray(permissions) ? permissions : [permissions], to);
      if (hasPermission) {
        next();
      } else {
        console.warn(errorMessage, {
          route: to.path,
          permissions
        });
        next(redirectTo);
      }
    } catch (error) {
      console.error("\u6743\u9650\u68C0\u67E5\u5931\u8D25:", error);
      next(redirectTo);
    }
  };
}
function createAuthGuard(options) {
  const {
    checker,
    redirectTo = "/login",
    authField = "requiresAuth"
  } = options;
  return async (to, _from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta[authField]);
    if (!requiresAuth) {
      next();
      return;
    }
    try {
      const isAuthenticated = await checker();
      if (isAuthenticated) {
        next();
      } else {
        console.warn("\u7528\u6237\u672A\u8BA4\u8BC1\uFF0C\u91CD\u5B9A\u5411\u5230\u767B\u5F55\u9875\u9762");
        next({
          ...typeof redirectTo === "object" ? redirectTo : {
            path: redirectTo
          },
          query: {
            redirect: to.fullPath
          }
        });
      }
    } catch (error) {
      console.error("\u8BA4\u8BC1\u68C0\u67E5\u5931\u8D25:", error);
      next(redirectTo);
    }
  };
}
function createLoadingGuard(options = {}) {
  const {
    showLoading,
    hideLoading,
    minLoadingTime = 300
  } = options;
  let loadingStartTime = 0;
  const beforeEach = (to, _from, next) => {
    loadingStartTime = Date.now();
    if (showLoading) {
      showLoading(to);
    }
    next();
  };
  const afterEach = (to, _from) => {
    const loadingTime = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, minLoadingTime - loadingTime);
    setTimeout(() => {
      if (hideLoading) {
        hideLoading(to);
      }
    }, remainingTime);
  };
  return {
    beforeEach,
    afterEach
  };
}
function createTitleGuard(options = {}) {
  const {
    defaultTitle = "",
    titleTemplate = (title) => title,
    titleField = "title"
  } = options;
  return (to, _from, next) => {
    let title = "";
    for (let i = to.matched.length - 1; i >= 0; i--) {
      const record = to.matched[i];
      if (record && record.meta[titleField]) {
        title = record.meta[titleField];
        break;
      }
    }
    if (!title) {
      title = defaultTitle;
    }
    if (title) {
      document.title = titleTemplate(title);
    }
    next();
  };
}
function createScrollGuard(options = {}) {
  const {
    behavior = "auto",
    scrollToTop = true,
    savePosition = true
  } = options;
  const savedPositions = /* @__PURE__ */ new Map();
  const beforeEach = (_to, from, next) => {
    if (savePosition && from.path !== "/") {
      savedPositions.set(from.fullPath, {
        x: window.scrollX,
        y: window.scrollY
      });
    }
    next();
  };
  const afterEach = (to, _from) => {
    setTimeout(() => {
      const savedPosition = savedPositions.get(to.fullPath);
      if (savedPosition) {
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior
        });
      } else if (scrollToTop) {
        window.scrollTo({
          left: 0,
          top: 0,
          behavior
        });
      }
    }, 0);
  };
  return {
    beforeEach,
    afterEach
  };
}
function createProgressGuard(options = {}) {
  const {
    color = "#3b82f6",
    height = "2px",
    minTime = 300,
    maxTime = 3e3
  } = options;
  let progressBar = null;
  let progressTimer = null;
  const createProgressBar = () => {
    if (progressBar) return;
    progressBar = document.createElement("div");
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: ${height};
      background-color: ${color};
      transition: width 0.3s ease;
      z-index: 9999;
    `;
    document.body.appendChild(progressBar);
  };
  const updateProgress = (percent) => {
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  };
  const removeProgressBar = () => {
    if (progressBar) {
      progressBar.remove();
      progressBar = null;
    }
    if (progressTimer) {
      clearTimeout(progressTimer);
      progressTimer = null;
    }
  };
  const beforeEach = (_to, _from, next) => {
    createProgressBar();
    updateProgress(10);
    let progress = 10;
    const increment = 80 / (maxTime / 100);
    const timer = setInterval(() => {
      progress += increment;
      if (progress >= 90) {
        clearInterval(timer);
        progress = 90;
      }
      updateProgress(progress);
    }, 100);
    progressTimer = timer;
    next();
  };
  const afterEach = (_to, _from) => {
    updateProgress(100);
    setTimeout(() => {
      removeProgressBar();
    }, minTime);
  };
  return {
    beforeEach,
    afterEach
  };
}
function combineGuards(...guards) {
  return async (to, from, next) => {
    let index = 0;
    const runNext = (result) => {
      if (result === false || result instanceof Error || result && typeof result === "object") {
        next(result);
        return;
      }
      if (index >= guards.length) {
        next();
        return;
      }
      const guard = guards[index++];
      if (guard) {
        guard(to, from, runNext);
      } else {
        runNext();
      }
    };
    runNext();
  };
}
var index = {
  createPermissionGuard,
  createAuthGuard,
  createLoadingGuard,
  createTitleGuard,
  createScrollGuard,
  createProgressGuard,
  combineGuards
};

export { combineGuards, createAuthGuard, createLoadingGuard, createPermissionGuard, createProgressGuard, createScrollGuard, createTitleGuard, index as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
