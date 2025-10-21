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

var guard = require('./guard.cjs');
var plugin = require('./plugin.cjs');
var resolver = require('./resolver.cjs');
var utils = require('./utils.cjs');



exports.DeviceRouteGuard = guard.DeviceRouteGuard;
exports.createDeviceRouterPlugin = plugin.createDeviceRouterPlugin;
exports.DeviceComponentResolver = resolver.DeviceComponentResolver;
exports.checkDeviceSupport = utils.checkDeviceSupport;
exports.createUnsupportedDeviceRoute = utils.createUnsupportedDeviceRoute;
exports.resolveDeviceComponent = utils.resolveDeviceComponent;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
