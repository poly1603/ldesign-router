/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { logger } from './logger.js';

var ErrorType;
(function(ErrorType2) {
  ErrorType2["NAVIGATION"] = "NAVIGATION";
  ErrorType2["GUARD"] = "GUARD";
  ErrorType2["MIDDLEWARE"] = "MIDDLEWARE";
  ErrorType2["COMPONENT"] = "COMPONENT";
  ErrorType2["NETWORK"] = "NETWORK";
  ErrorType2["PERMISSION"] = "PERMISSION";
  ErrorType2["VALIDATION"] = "VALIDATION";
  ErrorType2["STATE"] = "STATE";
  ErrorType2["MEMORY"] = "MEMORY";
  ErrorType2["PERFORMANCE"] = "PERFORMANCE";
  ErrorType2["UNKNOWN"] = "UNKNOWN";
})(ErrorType || (ErrorType = {}));
var ErrorSeverity;
(function(ErrorSeverity2) {
  ErrorSeverity2["LOW"] = "low";
  ErrorSeverity2["MEDIUM"] = "medium";
  ErrorSeverity2["HIGH"] = "high";
  ErrorSeverity2["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
class ErrorManager {
  constructor(config) {
    this.errorHistory = [];
    this.listeners = /* @__PURE__ */ new Set();
    this.isRecovering = false;
    this.config = {
      maxErrorHistory: 100,
      enableAutoRecovery: true,
      enableErrorReporting: false,
      ...config
    };
    this.recoveryStrategies = config?.recoveryStrategies || this.getDefaultRecoveryStrategies();
    this.setupGlobalErrorHandlers();
  }
  /**
   * 获取单例实例
   */
  static getInstance(config) {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager(config);
    }
    return ErrorManager.instance;
  }
  /**
   * 设置全局错误处理器
   */
  setupGlobalErrorHandlers() {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.handleError({
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.HIGH,
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });
      window.addEventListener("unhandledrejection", (event) => {
        this.handleError({
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.HIGH,
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          context: {
            reason: event.reason,
            promise: event.promise
          }
        });
      });
    }
  }
  /**
   * 获取默认恢复策略
   */
  getDefaultRecoveryStrategies() {
    const strategies = /* @__PURE__ */ new Map();
    strategies.set(ErrorType.NAVIGATION, {
      shouldRecover: (error) => error.retryCount < 3,
      recover: async (error) => {
        logger.info("Attempting to recover from navigation error", error);
        if (typeof window !== "undefined" && window.history.length > 1) {
          window.history.back();
        } else if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
      fallback: () => {
        logger.warn("Navigation recovery failed, redirecting to home");
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    });
    strategies.set(ErrorType.NETWORK, {
      shouldRecover: (error) => error.retryable !== false && (error.retryCount || 0) < 3,
      recover: async (error) => {
        logger.info("Attempting to recover from network error", error);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * (error.retryCount || 1)));
      }
    });
    strategies.set(ErrorType.COMPONENT, {
      shouldRecover: () => true,
      recover: (error) => {
        logger.info("Component error detected, attempting recovery", error);
      }
    });
    return strategies;
  }
  /**
   * 处理错误
   */
  handleError(errorData) {
    const error = {
      severity: ErrorSeverity.MEDIUM,
      timestamp: Date.now(),
      recoverable: true,
      retryable: false,
      retryCount: 0,
      maxRetries: 3,
      ...errorData,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : void 0,
      url: typeof window !== "undefined" ? window.location.href : void 0
    };
    this.logError(error);
    this.addToHistory(error);
    this.notifyListeners(error);
    if (this.config.enableAutoRecovery && !this.isRecovering) {
      this.attemptRecovery(error);
    }
    if (this.config.enableErrorReporting) {
      this.reportError(error);
    }
  }
  /**
   * 记录错误日志
   */
  logError(error) {
    const logMessage = `[${error.type}] ${error.message}`;
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error(logMessage, error);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, error);
        break;
      case ErrorSeverity.LOW:
        logger.info(logMessage, error);
        break;
    }
  }
  /**
   * 添加到错误历史
   */
  addToHistory(error) {
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory.shift();
    }
  }
  /**
   * 通知错误监听器
   */
  notifyListeners(error) {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        logger.error("Error in error listener", e);
      }
    });
  }
  /**
   * 尝试错误恢复
   */
  async attemptRecovery(error) {
    if (!error.recoverable) return;
    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) return;
    if (!strategy.shouldRecover(error)) {
      if (strategy.fallback) {
        strategy.fallback();
      }
      return;
    }
    this.isRecovering = true;
    try {
      await strategy.recover(error);
      logger.info("Successfully recovered from error", error);
    } catch (recoveryError) {
      logger.error("Recovery failed", recoveryError);
      if (strategy.fallback) {
        strategy.fallback();
      } else if (this.config.globalFallback) {
        this.config.globalFallback();
      }
    } finally {
      this.isRecovering = false;
    }
  }
  /**
   * 上报错误到服务器
   */
  async reportError(error) {
    if (!this.config.reportingEndpoint) return;
    try {
      await fetch(this.config.reportingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...error,
          // 移除敏感信息
          stack: error.stack?.substring(0, 500)
        })
      });
    } catch (e) {
      logger.error("Failed to report error", e);
    }
  }
  /**
   * 添加错误监听器
   */
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.removeListener(listener);
  }
  /**
   * 移除错误监听器
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(type, strategy) {
    this.recoveryStrategies.set(type, strategy);
  }
  /**
   * 获取错误历史
   */
  getErrorHistory(filter) {
    if (!filter) return [...this.errorHistory];
    return this.errorHistory.filter((error) => {
      if (filter.type && error.type !== filter.type) return false;
      if (filter.severity && error.severity !== filter.severity) return false;
      return true;
    });
  }
  /**
   * 清除错误历史
   */
  clearHistory() {
    this.errorHistory = [];
  }
  /**
   * 获取错误统计
   */
  getStatistics() {
    const stats = {
      total: this.errorHistory.length,
      byType: {},
      bySeverity: {},
      recentErrors: this.errorHistory.slice(-10)
    };
    this.errorHistory.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });
    return stats;
  }
  /**
   * 创建自定义错误
   */
  static createError(type, message, options) {
    const error = new Error(message);
    error.__errorDetails = {
      type,
      message,
      ...options
    };
    return error;
  }
  /**
   * 包装函数以捕获错误
   */
  static wrapFunction(fn, errorType = ErrorType.UNKNOWN) {
    return (...args) => {
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.catch((error) => {
            ErrorManager.getInstance().handleError({
              type: errorType,
              message: error.message || "Unknown error",
              stack: error.stack,
              context: {
                args
              }
            });
            throw error;
          });
        }
        return result;
      } catch (error) {
        ErrorManager.getInstance().handleError({
          type: errorType,
          message: error.message || "Unknown error",
          stack: error.stack,
          context: {
            args
          }
        });
        throw error;
      }
    };
  }
  /**
   * 装饰器：错误处理
   */
  static errorHandler(errorType = ErrorType.UNKNOWN) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = function(...args) {
        try {
          const result = originalMethod.apply(this, args);
          if (result instanceof Promise) {
            return result.catch((error) => {
              ErrorManager.getInstance().handleError({
                type: errorType,
                message: error.message || "Unknown error",
                stack: error.stack,
                context: {
                  class: target.constructor.name,
                  method: propertyKey,
                  args
                }
              });
              throw error;
            });
          }
          return result;
        } catch (error) {
          ErrorManager.getInstance().handleError({
            type: errorType,
            message: error.message || "Unknown error",
            stack: error.stack,
            context: {
              class: target.constructor.name,
              method: propertyKey,
              args
            }
          });
          throw error;
        }
      };
      return descriptor;
    };
  }
}
const errorManager = ErrorManager.getInstance();
const handleError = errorManager.handleError.bind(errorManager);
const addErrorListener = errorManager.addListener.bind(errorManager);
const getErrorHistory = errorManager.getErrorHistory.bind(errorManager);
const getErrorStatistics = errorManager.getStatistics.bind(errorManager);

export { ErrorManager, ErrorSeverity, ErrorType, addErrorListener, errorManager as default, errorManager, getErrorHistory, getErrorStatistics, handleError };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=error-manager.js.map
