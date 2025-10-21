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

/*!
 * ***********************************
 * @ldesign/device v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:55 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class EventEmitter {
  constructor() {
    this.events = /* @__PURE__ */ new Map();
    this.maxListeners = 100;
    this.wildcardListeners = [];
    this.isSorted = /* @__PURE__ */ new Map();
    this.performanceMetrics = {
      totalEmits: 0,
      totalListenerCalls: 0,
      errors: 0,
      averageListenersPerEvent: 0
    };
    this.enablePerformanceTracking = false;
  }
  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max) {
    this.maxListeners = max;
    return this;
  }
  /**
   * 设置错误处理器
   */
  setErrorHandler(handler) {
    this.errorHandler = handler;
    return this;
  }
  /**
   * 启用性能监控
   */
  enablePerformanceMonitoring(enable = true) {
    this.enablePerformanceTracking = enable;
    return this;
  }
  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics
    };
  }
  /**
   * 重置性能指标
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalEmits: 0,
      totalListenerCalls: 0,
      errors: 0,
      averageListenersPerEvent: 0
    };
    return this;
  }
  /**
   * 添加事件监听器（支持优先级和命名空间）
   * 
   * @param event - 事件名称（支持 '*' 通配符）
   * @param listener - 监听器函数
   * @param options - 配置选项
   * @param options.priority - 优先级（数字越大优先级越高，默认0）
   * @param options.namespace - 命名空间（用于批量移除）
   */
  on(event, listener, options = {}) {
    const {
      priority = 0,
      namespace
    } = options;
    const wrapper = {
      listener,
      priority,
      once: false,
      namespace
    };
    if (event === "*") {
      this.wildcardListeners.push(wrapper);
      return this;
    }
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    const listeners = this.events.get(event);
    if (!listeners) return this;
    if (listeners.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${String(event)}. Consider using removeAllListeners() or increasing maxListeners.`);
    }
    listeners.push(wrapper);
    this.isSorted.set(event, false);
    return this;
  }
  /**
   * 添加一次性事件监听器
   */
  once(event, listener, options = {}) {
    const {
      priority = 0,
      namespace
    } = options;
    const wrapper = {
      listener,
      priority,
      once: true,
      namespace
    };
    if (event === "*") {
      this.wildcardListeners.push(wrapper);
      return this;
    }
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.push(wrapper);
    }
    this.isSorted.set(event, false);
    return this;
  }
  /**
   * 移除事件监听器
   */
  off(event, listener) {
    if (event === "*") {
      if (listener) {
        this.wildcardListeners = this.wildcardListeners.filter((w) => w.listener !== listener);
      } else {
        this.wildcardListeners = [];
      }
      return this;
    }
    const listeners = this.events.get(event);
    if (!listeners) return this;
    if (listener) {
      const filtered = listeners.filter((w) => w.listener !== listener);
      if (filtered.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, filtered);
      }
    } else {
      this.events.delete(event);
    }
    return this;
  }
  /**
   * 移除指定命名空间的所有监听器
   */
  offNamespace(namespace) {
    for (const [event, listeners] of this.events.entries()) {
      const filtered = listeners.filter((w) => w.namespace !== namespace);
      if (filtered.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, filtered);
      }
    }
    this.wildcardListeners = this.wildcardListeners.filter((w) => w.namespace !== namespace);
    return this;
  }
  /**
   * 移除监听器包装器（内部方法）
   */
  removeWrapper(event, wrapper) {
    if (event === "*") {
      this.wildcardListeners = this.wildcardListeners.filter((w) => w !== wrapper);
      return;
    }
    const listeners = this.events.get(event);
    if (listeners) {
      const filtered = listeners.filter((w) => w !== wrapper);
      if (filtered.length === 0) {
        this.events.delete(event);
      } else {
        this.events.set(event, filtered);
      }
    }
  }
  /**
   * 触发事件（支持通配符监听器）
   *
   * 优化: 按优先级顺序执行监听器，避免创建新数组
   */
  emit(event, data) {
    const listeners = this.events.get(event);
    const hasListeners = listeners && listeners.length > 0;
    const hasWildcard = this.wildcardListeners.length > 0;
    if (!hasListeners && !hasWildcard) {
      return this;
    }
    if (hasListeners && !this.isSorted.get(event)) {
      listeners?.sort((a, b) => b.priority - a.priority);
      this.isSorted.set(event, true);
    }
    if (hasWildcard && this.wildcardListeners.length > 1) {
      this.wildcardListeners.sort((a, b) => b.priority - a.priority);
    }
    if (this.enablePerformanceTracking) {
      const totalListeners = (listeners ? listeners.length : 0) + this.wildcardListeners.length;
      this.performanceMetrics.totalEmits++;
      this.performanceMetrics.totalListenerCalls += totalListeners;
      const alpha = 0.1;
      this.performanceMetrics.averageListenersPerEvent = this.performanceMetrics.averageListenersPerEvent * (1 - alpha) + totalListeners * alpha;
    }
    const toRemove = [];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        const wrapper = listeners[i];
        try {
          wrapper.listener(data);
          if (wrapper.once) {
            toRemove.push(wrapper);
          }
        } catch (error) {
          this.handleListenerError(error, event);
        }
      }
    }
    if (hasWildcard) {
      for (let i = 0; i < this.wildcardListeners.length; i++) {
        const wrapper = this.wildcardListeners[i];
        try {
          wrapper.listener(data);
          if (wrapper.once) {
            toRemove.push(wrapper);
          }
        } catch (error) {
          this.handleListenerError(error, event);
        }
      }
    }
    if (toRemove.length > 0) {
      for (let i = 0; i < toRemove.length; i++) {
        this.removeWrapper(event, toRemove[i]);
      }
    }
    return this;
  }
  /**
   * 获取事件的监听器数量
   */
  listenerCount(event) {
    if (event === "*") {
      return this.wildcardListeners.length;
    }
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }
  /**
   * 获取所有事件名称
   */
  eventNames() {
    const names = Array.from(this.events.keys());
    if (this.wildcardListeners.length > 0) {
      names.push("*");
    }
    return names;
  }
  /**
   * 移除所有事件监听器（支持通配符模式）
   */
  removeAllListeners(event) {
    if (event === "*") {
      this.wildcardListeners = [];
    } else if (event) {
      const eventStr = event;
      if (eventStr.includes("*")) {
        const prefix = eventStr.replace("*", "");
        const keysToDelete = [];
        for (const key of this.events.keys()) {
          if (String(key).startsWith(prefix)) {
            keysToDelete.push(String(key));
          }
        }
        for (const key of keysToDelete) {
          this.events.delete(key);
          this.isSorted.delete(key);
        }
      } else {
        this.events.delete(eventStr);
        this.isSorted.delete(eventStr);
      }
    } else {
      this.events.clear();
      this.wildcardListeners = [];
      this.isSorted.clear();
    }
    return this;
  }
  /**
   * 获取指定事件的所有监听器
   */
  listeners(event) {
    if (event === "*") {
      return this.wildcardListeners.map((w) => w.listener);
    }
    const listeners = this.events.get(event);
    return listeners ? listeners.map((w) => w.listener) : [];
  }
  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners(event) {
    return this.listenerCount(event) > 0;
  }
  /**
   * 检测内存泄漏（监听器过多的事件）
   * 
   * @param threshold - 阈值，默认50
   * @returns 监听器过多的事件列表
   */
  detectMemoryLeaks(threshold = 50) {
    const leaks = [];
    for (const [event, listeners] of this.events.entries()) {
      if (listeners.length > threshold) {
        leaks.push({
          event: String(event),
          count: listeners.length
        });
      }
    }
    if (this.wildcardListeners.length > threshold) {
      leaks.push({
        event: "*",
        count: this.wildcardListeners.length
      });
    }
    return leaks;
  }
  /**
   * 获取所有监听器总数
   */
  getTotalListenerCount() {
    let total = this.wildcardListeners.length;
    for (const listeners of this.events.values()) {
      total += listeners.length;
    }
    return total;
  }
  /**
   * 处理监听器错误
   */
  handleListenerError(error, event) {
    if (this.enablePerformanceTracking) {
      this.performanceMetrics.errors++;
    }
    const err = error instanceof Error ? error : new Error(String(error));
    if (this.errorHandler) {
      this.errorHandler(err, event);
    } else {
      console.error(`Error in event listener for "${event}":`, err);
    }
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.EventEmitter = EventEmitter;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=EventEmitter.cjs.map
