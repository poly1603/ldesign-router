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

var DeviceDetector = require('./core/DeviceDetector.cjs');
require('node:process');
require('./utils/MemoryManager.cjs');
require('vue');
require('./vue/components/DeviceInfo.vue.cjs');
require('./vue/components/NetworkStatus.vue.cjs');

function createDeviceDetector(options) {
  return new DeviceDetector.DeviceDetector(options);
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.DeviceDetector = DeviceDetector.DeviceDetector;
exports.default = DeviceDetector.DeviceDetector;
exports.createDeviceDetector = createDeviceDetector;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
