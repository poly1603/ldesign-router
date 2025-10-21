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

exports.default = routeHelpers;
exports.defineMeta = defineMeta;
exports.defineNavigationGuard = defineNavigationGuard;
exports.defineRoute = defineRoute;
exports.defineRoutes = defineRoutes;
exports.navigateToName = navigateToName;
exports.navigateToPath = navigateToPath;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=route-helpers.cjs.map
