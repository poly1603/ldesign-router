/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { CacheStrategy, PreloadStrategy, AnimationType } from '../core/constants.js';

const OPTIMIZED_CACHE_CONFIG = {
  /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
  maxSize: 3,
  /** 缓存策略 - 使用 LRU（最近最少使用）策略 */
  strategy: CacheStrategy.MEMORY,
  /** 最大缓存项数量 */
  maxItems: 50,
  /** 缓存过期时间（毫秒） */
  ttl: 5 * 60 * 1e3,
  // 5分钟
  /** 是否自动清理过期项 */
  autoCleanup: true,
  /** 清理间隔（毫秒） */
  cleanupInterval: 6e4
  // 1分钟
};
const OPTIMIZED_MEMORY_THRESHOLDS = {
  /** 警告阈值（MB） - 从 30MB 降低到 15MB */
  warning: 15,
  /** 严重阈值（MB） - 从 60MB 降低到 30MB */
  critical: 30,
  /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
  maxCache: 3,
  /** 最大监听器数量 - 从 500 降低到 200 */
  maxListeners: 200
};
const MEMORY_MONITOR_CONFIG = {
  /** 监控间隔（毫秒） - 从 30秒 增加到 2分钟，减少CPU占用 */
  monitorInterval: 12e4,
  /** 是否启用自动GC */
  enableAutoGC: false,
  // 默认关闭，避免性能影响
  /** GC触发阈值（MB） */
  gcThreshold: 25,
  /** 清理策略 */
  cleanupStrategy: "moderate"
};
const OPTIMIZED_PRELOAD_CONFIG = {
  /** 是否启用预加载 */
  enabled: true,
  /** 预加载策略 */
  strategy: PreloadStrategy.IDLE,
  /** 最大并发预加载数 - 从 5 降低到 2 */
  maxConcurrent: 2,
  /** 空闲超时时间（毫秒） - 从 1秒 增加到 2秒 */
  idleTimeout: 2e3,
  /** 预加载优先级队列大小 */
  queueSize: 10,
  /** 是否自动预加载相关路由 */
  autoPreloadRelated: false,
  // 默认关闭以节省资源
  /** 网络状态检查 */
  checkNetworkStatus: true,
  /** 只在 WiFi 下预加载 */
  wifiOnly: false
};
const OPTIMIZED_ANIMATION_CONFIG = {
  /** 是否启用动画 */
  enabled: true,
  /** 默认动画类型 */
  defaultAnimation: AnimationType.FADE,
  /** 动画时长（毫秒） - 从 300ms 降低到 200ms */
  duration: 200,
  /** 是否使用 CSS 动画（性能更好） */
  useCSS: true,
  /** 是否启用硬件加速 */
  hardwareAcceleration: true,
  /** 是否在低端设备禁用动画 */
  disableOnLowEnd: true
};
const OPTIMIZED_PERFORMANCE_CONFIG = {
  /** 是否启用性能监控 */
  enabled: true,
  /** 警告阈值（毫秒） */
  warningThreshold: 500,
  // 从 1000ms 降低到 500ms
  /** 错误阈值（毫秒） */
  errorThreshold: 2e3,
  // 从 3000ms 降低到 2000ms
  /** 采样率（0-1） */
  sampleRate: 0.1,
  // 只采样 10% 的导航以减少开销
  /** 是否记录详细信息 */
  detailed: false,
  // 默认关闭详细记录
  /** 最大记录数量 */
  maxRecords: 100,
  /** 是否发送到服务器 */
  sendToServer: false
};
const OPTIMIZED_ROUTER_CONFIG = {
  /** 是否启用严格模式 */
  strict: false,
  // 关闭严格模式以提高性能
  /** 是否启用路径大小写敏感 */
  sensitive: false,
  /** 最大路由深度 */
  maxDepth: 5,
  /** 最大动态段数量 */
  maxDynamicSegments: 3,
  /** 是否启用路由缓存 */
  enableCache: true,
  /** 路由缓存大小 */
  routeCacheSize: 100,
  /** 是否启用智能匹配 */
  smartMatching: true,
  /** 是否启用路由压缩 */
  compress: true
};
const DEV_CONFIG = {
  /** 是否启用调试模式 */
  debug: typeof import.meta !== "undefined" && import.meta.env?.DEV || false,
  /** 是否启用性能分析 */
  profiling: false,
  /** 是否启用详细日志 */
  verboseLogging: false,
  /** 是否启用热重载 */
  hotReload: true,
  /** 是否显示性能指标 */
  showMetrics: false
};
const PROD_CONFIG = {
  /** 是否压缩资源 */
  compress: true,
  /** 是否启用 CDN */
  useCDN: false,
  /** 是否启用服务工作器 */
  serviceWorker: false,
  /** 是否启用预渲染 */
  prerender: false,
  /** 是否启用代码分割 */
  codeSplitting: true,
  /** 是否内联关键 CSS */
  inlineCSS: false
};
function getOptimizedConfig(env = "production") {
  const isDev = env === "development";
  return {
    cache: OPTIMIZED_CACHE_CONFIG,
    memory: {
      thresholds: OPTIMIZED_MEMORY_THRESHOLDS,
      monitor: MEMORY_MONITOR_CONFIG
    },
    preload: OPTIMIZED_PRELOAD_CONFIG,
    animation: OPTIMIZED_ANIMATION_CONFIG,
    performance: {
      ...OPTIMIZED_PERFORMANCE_CONFIG,
      enabled: !isDev || DEV_CONFIG.showMetrics
    },
    router: OPTIMIZED_ROUTER_CONFIG,
    env: isDev ? DEV_CONFIG : PROD_CONFIG
  };
}
const PERFORMANCE_TIPS = {
  cache: "\u4F7F\u7528 LRU \u7F13\u5B58\u7B56\u7565\uFF0C\u9650\u5236\u7F13\u5B58\u5927\u5C0F\u5728 3MB \u4EE5\u5185",
  memory: "\u76D1\u63A7\u5185\u5B58\u4F7F\u7528\uFF0C\u8D85\u8FC7 15MB \u65F6\u89E6\u53D1\u8B66\u544A",
  preload: "\u9650\u5236\u5E76\u53D1\u9884\u52A0\u8F7D\u6570\u4E3A 2\uFF0C\u53EA\u5728\u7A7A\u95F2\u65F6\u9884\u52A0\u8F7D",
  animation: "\u4F7F\u7528 CSS \u52A8\u753B\uFF0C\u542F\u7528\u786C\u4EF6\u52A0\u901F",
  monitoring: "\u751F\u4EA7\u73AF\u5883\u53EA\u91C7\u6837 10% \u7684\u5BFC\u822A\u6570\u636E",
  general: ["\u4F7F\u7528\u4EE3\u7801\u5206\u5272\u51CF\u5C11\u521D\u59CB\u5305\u5927\u5C0F", "\u542F\u7528\u8DEF\u7531\u7EA7\u522B\u7684\u61D2\u52A0\u8F7D", "\u907F\u514D\u6DF1\u5C42\u5D4C\u5957\u8DEF\u7531\uFF08\u8D85\u8FC75\u5C42\uFF09", "\u5B9A\u671F\u6E05\u7406\u672A\u4F7F\u7528\u7684\u8DEF\u7531\u548C\u7F13\u5B58", "\u5728\u4F4E\u7AEF\u8BBE\u5907\u4E0A\u7981\u7528\u52A8\u753B\u548C\u9884\u52A0\u8F7D"]
};
var performanceDefaults = getOptimizedConfig();

export { DEV_CONFIG, MEMORY_MONITOR_CONFIG, OPTIMIZED_ANIMATION_CONFIG, OPTIMIZED_CACHE_CONFIG, OPTIMIZED_MEMORY_THRESHOLDS, OPTIMIZED_PERFORMANCE_CONFIG, OPTIMIZED_PRELOAD_CONFIG, OPTIMIZED_ROUTER_CONFIG, PERFORMANCE_TIPS, PROD_CONFIG, performanceDefaults as default, getOptimizedConfig };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=performance-defaults.js.map
