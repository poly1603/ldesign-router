/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class Logger {
  constructor(config) {
    this.isDevelopment = typeof import.meta !== "undefined" && import.meta.env?.DEV || false;
    this.isTest = typeof import.meta !== "undefined" && import.meta.env?.MODE === "test" || false;
    this.config = {
      enabled: this.isDevelopment || this.isTest,
      level: "info",
      timestamp: true,
      ...config
    };
  }
  shouldLog(level) {
    if (!this.config.enabled) return false;
    const levels = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const targetLevelIndex = levels.indexOf(level);
    return targetLevelIndex >= currentLevelIndex;
  }
  format(level, message, ..._args) {
    let output = "";
    if (this.config.timestamp) {
      output += `[${(/* @__PURE__ */ new Date()).toISOString()}] `;
    }
    if (this.config.prefix) {
      output += `[${this.config.prefix}] `;
    }
    output += `[${level.toUpperCase()}] ${message}`;
    return output;
  }
  debug(message, ...args) {
    if (this.shouldLog("debug")) {
      const formatted = this.format("debug", message, ...args);
      console.info(formatted, ...args);
    }
  }
  info(message, ...args) {
    if (this.shouldLog("info")) {
      const formatted = this.format("info", message, ...args);
      console.info(formatted, ...args);
    }
  }
  warn(message, ...args) {
    if (this.shouldLog("warn")) {
      const formatted = this.format("warn", message, ...args);
      console.warn(formatted, ...args);
    }
  }
  error(message, error, ...args) {
    if (this.shouldLog("error")) {
      const formatted = this.format("error", message, ...args);
      if (error instanceof Error) {
        console.error(formatted, error.stack || error.message, ...args);
      } else if (error) {
        console.error(formatted, error, ...args);
      } else {
        console.error(formatted, ...args);
      }
    }
  }
  group(label) {
    if (this.config.enabled && console.group) {
      console.group(label);
    }
  }
  groupEnd() {
    if (this.config.enabled && console.groupEnd) {
      console.groupEnd();
    }
  }
  table(data) {
    if (this.config.enabled && console.table) {
      console.table(data);
    }
  }
  time(label) {
    if (this.config.enabled && console.time) {
      console.time(label);
    }
  }
  timeEnd(label) {
    if (this.config.enabled && console.timeEnd) {
      console.timeEnd(label);
    }
  }
  clear() {
    if (this.config.enabled && console.clear) {
      console.clear();
    }
  }
  /**
   * 创建子日志器
   */
  createChild(prefix, config) {
    return new Logger({
      ...this.config,
      ...config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix
    });
  }
  /**
   * 设置日志级别
   */
  setLevel(level) {
    this.config.level = level;
  }
  /**
   * 启用/禁用日志
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
  }
}
const defaultLogger = new Logger({
  prefix: "Router"
});
const logger = {
  debug: defaultLogger.debug.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  group: defaultLogger.group.bind(defaultLogger),
  groupEnd: defaultLogger.groupEnd.bind(defaultLogger),
  table: defaultLogger.table.bind(defaultLogger),
  time: defaultLogger.time.bind(defaultLogger),
  timeEnd: defaultLogger.timeEnd.bind(defaultLogger),
  clear: defaultLogger.clear.bind(defaultLogger),
  createChild: defaultLogger.createChild.bind(defaultLogger),
  setLevel: defaultLogger.setLevel.bind(defaultLogger),
  setEnabled: defaultLogger.setEnabled.bind(defaultLogger)
};
const performanceLogger = defaultLogger.createChild("Performance");
const securityLogger = defaultLogger.createChild("Security");
const debugLogger = defaultLogger.createChild("Debug");
const analyticsLogger = defaultLogger.createChild("Analytics");

export { Logger, analyticsLogger, debugLogger, logger as default, logger, performanceLogger, securityLogger };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=logger.js.map
