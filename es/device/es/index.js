/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { DeviceDetector } from './core/DeviceDetector.js';
import 'node:process';
import './utils/MemoryManager.js';
import 'vue';
import './vue/components/DeviceInfo.vue.js';
import './vue/components/NetworkStatus.vue.js';

function createDeviceDetector(options) {
  return new DeviceDetector(options);
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { DeviceDetector, createDeviceDetector, DeviceDetector as default };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
