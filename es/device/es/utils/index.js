/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { MemoryManager, ObjectPool, SafeTimerManager, memoryManager } from './MemoryManager.js';

class LRUCache {
  constructor(maxSize = 50, ttl = 3e5) {
    this.cache = /* @__PURE__ */ new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (entry === void 0) {
      this.stats.misses++;
      return void 0;
    }
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return void 0;
    }
    this.stats.hits++;
    if (now - entry.timestamp > this.ttl * 0.1) {
      this.cache.delete(key);
      this.cache.set(key, {
        value: entry.value,
        timestamp: now
      });
    }
    return entry.value;
  }
  set(key, value) {
    const now = Date.now();
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
      }
    }
    this.cache.set(key, {
      value,
      timestamp: now
    });
  }
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }
  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }
  /**
   * 清理过期项（优化：惰性清理，直接在迭代中删除）
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }
  }
}
const userAgentCache = new LRUCache(20);
function parseUserAgent(userAgent) {
  const cached = userAgentCache.get(userAgent);
  if (cached) {
    return cached;
  }
  const os = {
    name: "unknown",
    version: "unknown"
  };
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) {
    os.name = "Windows";
    const version = windowsMatch[1];
    const versionMap = {
      "10.0": "10",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
      "6.0": "Vista",
      "5.1": "XP"
    };
    os.version = versionMap[version] || version;
  } else if (/Mac OS X/.test(userAgent)) {
    os.name = "macOS";
    const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (macMatch) {
      os.version = macMatch[1].replace(/_/g, ".");
    }
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    os.name = "iOS";
    const iosMatch = userAgent.match(/OS (\d+[._]\d+[._]?\d*)/);
    if (iosMatch) {
      os.version = iosMatch[1].replace(/_/g, ".");
    }
  } else if (/Android/.test(userAgent)) {
    os.name = "Android";
    const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
    if (androidMatch) {
      os.version = androidMatch[1];
    }
  } else if (/Linux/.test(userAgent)) {
    os.name = "Linux";
  }
  const browser = {
    name: "unknown",
    version: "unknown"
  };
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  if (chromeMatch && !/Edg/.test(userAgent)) {
    browser.name = "Chrome";
    browser.version = chromeMatch[1];
  } else if (/Edg/.test(userAgent)) {
    browser.name = "Edge";
    const edgeMatch = userAgent.match(/Edg\/(\d+)/);
    if (edgeMatch) {
      browser.version = edgeMatch[1];
    }
  } else if (/Firefox/.test(userAgent)) {
    browser.name = "Firefox";
    const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
    if (firefoxMatch) {
      browser.version = firefoxMatch[1];
    }
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser.name = "Safari";
    const safariMatch = userAgent.match(/Version\/(\d+)/);
    if (safariMatch) {
      browser.version = safariMatch[1];
    }
  }
  const result = {
    os,
    browser
  };
  userAgentCache.set(userAgent, result);
  return result;
}
function debounce(func, wait, immediate = false) {
  let timeout = null;
  let result;
  const debounced = (...args) => {
    const callNow = immediate && !timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        result = func(...args);
      }
    }, wait);
    if (callNow) {
      result = func(...args);
    }
    return result;
  };
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints || 0) > 0;
}
function getDeviceTypeByWidth(width, breakpoints = {
  mobile: 768,
  tablet: 1024
}) {
  if (width < breakpoints.mobile) return "mobile";
  if (width < breakpoints.tablet) return "tablet";
  return "desktop";
}
function getScreenOrientation(width, height) {
  if (typeof window === "undefined" && (width === void 0)) {
    return "landscape";
  }
  if (typeof window !== "undefined" && screen.orientation) {
    return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? "portrait" : "landscape";
  }
  if (typeof window !== "undefined") return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  return "landscape";
}
function parseOS(userAgent) {
  return parseUserAgent(userAgent).os;
}
function parseBrowser(userAgent) {
  return parseUserAgent(userAgent).browser;
}
function getPixelRatio() {
  if (typeof window === "undefined") return 1;
  return window.devicePixelRatio || 1;
}
function safeNavigatorAccess(accessorOrProperty, fallback) {
  if (typeof navigator === "undefined") return fallback;
  try {
    if (typeof accessorOrProperty === "function") {
      return accessorOrProperty(navigator);
    } else {
      return navigator[accessorOrProperty] ?? fallback;
    }
  } catch {
    return fallback;
  }
}
async function asyncPool(poolLimit, array, iteratorFn) {
  const len = array.length;
  const results = Array.from({
    length: len
  });
  const executing = [];
  for (let i = 0; i < len; i++) {
    const item = array[i];
    const p = (async () => {
      results[i] = await iteratorFn(item, i);
    })();
    if (poolLimit <= len) {
      const e = p.then(() => {
        const idx = executing.indexOf(e);
        if (idx !== -1) {
          executing.splice(idx, 1);
        }
      });
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  await Promise.all(executing);
  return results;
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

export { asyncPool, debounce, getDeviceTypeByWidth, getPixelRatio, getScreenOrientation, isTouchDevice, parseBrowser, parseOS, safeNavigatorAccess };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
