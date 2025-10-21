/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function defineRoute(route) {
  return route;
}
function defineRoutes(routes) {
  return routes;
}
function navigateToPath(path, options) {
  if (!options) {
    return path;
  }
  const {
    params,
    query,
    hash,
    ...rest
  } = options;
  return {
    path,
    params,
    query,
    hash,
    ...rest
  };
}
function navigateToName(name, options) {
  const {
    params,
    query,
    hash,
    ...rest
  } = options || {};
  return {
    name,
    params,
    query,
    hash,
    ...rest
  };
}
function defineNavigationGuard(guard) {
  return guard;
}
function defineMeta(meta) {
  return meta;
}
var routeHelpers = {
  defineRoute,
  defineRoutes,
  navigateToPath,
  navigateToName,
  defineNavigationGuard,
  defineMeta
};

export { routeHelpers as default, defineMeta, defineNavigationGuard, defineRoute, defineRoutes, navigateToName, navigateToPath };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=route-helpers.js.map
