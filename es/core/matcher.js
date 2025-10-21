/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { OPTIONAL_PARAM_RE, PARAM_RE } from './constants.js';
import { LRUCache } from './matcher/lru-cache.js';

class RouteMatcher {
  constructor(cacheSize = 100) {
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalMatches: 0,
      averageMatchTime: 0
    };
    this.objectPool = {
      matchResults: [],
      segments: []
    };
    this.hotspots = /* @__PURE__ */ new Map();
    this.adaptiveCacheConfig = {
      minSize: 50,
      maxSize: 200,
      currentSize: 100,
      adjustmentInterval: 6e4,
      // 1分钟调整一次
      lastAdjustment: Date.now()
    };
    this.preheated = false;
    this.preheatRoutes = [];
    this.root = this.createNode();
    this.routes = /* @__PURE__ */ new Map();
    this.rawRoutes = /* @__PURE__ */ new Map();
    this.lruCache = new LRUCache(cacheSize);
    this.compiledPaths = /* @__PURE__ */ new Map();
    this.adaptiveCacheConfig.currentSize = cacheSize;
    for (let i = 0; i < 10; i++) {
      this.objectPool.segments.push([]);
    }
    this.startAdaptiveCacheAdjustment();
  }
  /**
   * 创建新节点 - 优化：减少初始内存分配
   */
  createNode() {
    return {
      children: /* @__PURE__ */ new Map(),
      weight: 0,
      accessCount: 0
    };
  }
  /**
   * 获取缓存键（优化版：使用更高效的键生成）
   */
  getCacheKey(path, query) {
    if (!query || Object.keys(query).length === 0) {
      return path;
    }
    const queryParts = [];
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0 && value !== null) {
        queryParts.push(`${key}=${value}`);
      }
    }
    return queryParts.length ? `${path}?${queryParts.join("&")}` : path;
  }
  /**
   * 编译路径为正则表达式（用于快速匹配）
   */
  compilePath(path) {
    const cached = this.compiledPaths.get(path);
    if (cached) return cached;
    const paramNames = [];
    let weight = 0;
    let isStatic = true;
    const regexPattern = path.split("/").map((segment) => {
      if (!segment) return "";
      if (segment.startsWith(":")) {
        isStatic = false;
        const paramName = segment.slice(1).replace(/\?$/, "");
        const isOptional = segment.endsWith("?");
        paramNames.push(paramName);
        weight += isOptional ? 1 : 2;
        return isOptional ? "([^/]*)?" : "([^/]+)";
      }
      if (segment === "*") {
        isStatic = false;
        paramNames.push("pathMatch");
        weight += 0.5;
        return "(.*)";
      }
      weight += 3;
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("/");
    const regex = new RegExp(`^${regexPattern}$`);
    const compiled = {
      regex,
      paramNames,
      isStatic,
      weight
    };
    this.compiledPaths.set(path, compiled);
    return compiled;
  }
  /**
   * 获取性能统计
   */
  getStats() {
    return {
      ...this.stats,
      cacheStats: this.lruCache.getStats(),
      compiledPathsCount: this.compiledPaths.size,
      routesCount: this.routes.size,
      hotspots: this.getTopHotspots(10),
      adaptiveCache: {
        currentSize: this.adaptiveCacheConfig.currentSize,
        minSize: this.adaptiveCacheConfig.minSize,
        maxSize: this.adaptiveCacheConfig.maxSize
      },
      preheated: this.preheated
    };
  }
  /**
   * 启动自适应缓存调整
   */
  startAdaptiveCacheAdjustment() {
    if (typeof window === "undefined") return;
    setInterval(() => {
      this.adjustCacheSize();
    }, this.adaptiveCacheConfig.adjustmentInterval);
  }
  /**
   * 自适应调整缓存大小
   */
  adjustCacheSize() {
    const now = Date.now();
    const hitRate = this.stats.totalMatches > 0 ? this.stats.cacheHits / this.stats.totalMatches : 0;
    const {
      minSize,
      maxSize,
      currentSize
    } = this.adaptiveCacheConfig;
    let newSize = currentSize;
    if (hitRate > 0.9 && currentSize < maxSize) {
      newSize = Math.min(currentSize + 20, maxSize);
    } else if (hitRate < 0.5 && currentSize > minSize) {
      newSize = Math.max(currentSize - 20, minSize);
    }
    if (newSize !== currentSize) {
      this.lruCache.resize(newSize);
      this.adaptiveCacheConfig.currentSize = newSize;
    }
    this.adaptiveCacheConfig.lastAdjustment = now;
  }
  /**
   * 记录热点访问
   */
  recordHotspot(path, matchTime) {
    const hotspot = this.hotspots.get(path);
    if (hotspot) {
      hotspot.hits++;
      hotspot.lastAccess = Date.now();
      hotspot.avgMatchTime = (hotspot.avgMatchTime * (hotspot.hits - 1) + matchTime) / hotspot.hits;
    } else {
      this.hotspots.set(path, {
        hits: 1,
        lastAccess: Date.now(),
        avgMatchTime: matchTime
      });
    }
    if (this.hotspots.size > 500) {
      this.cleanupHotspots();
    }
  }
  /**
   * 清理过期的热点记录
   */
  cleanupHotspots() {
    const now = Date.now();
    const timeout = 5 * 60 * 1e3;
    for (const [path, hotspot] of this.hotspots.entries()) {
      if (now - hotspot.lastAccess > timeout) {
        this.hotspots.delete(path);
      }
    }
  }
  /**
   * 获取TOP热点路由
   */
  getTopHotspots(count) {
    return Array.from(this.hotspots.entries()).sort((a, b) => b[1].hits - a[1].hits).slice(0, count).map(([path, data]) => ({
      path,
      hits: data.hits
    }));
  }
  /**
   * 预热路由（提前编译和缓存热门路由）
   */
  preheat(routes) {
    if (this.preheated) return;
    const routesToPreheat = routes || this.getTopHotspots(20).map((h) => h.path);
    for (const path of routesToPreheat) {
      try {
        this.compilePath(path);
        this.matchByPath(path);
      } catch {
      }
    }
    this.preheatRoutes = routesToPreheat;
    this.preheated = true;
  }
  /**
   * 重置预热状态
   */
  resetPreheat() {
    this.preheated = false;
    this.preheatRoutes = [];
  }
  /**
   * 清理缓存和统计
   */
  clearCache() {
    this.lruCache.clear();
    this.compiledPaths.clear();
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalMatches: 0,
      averageMatchTime: 0
    };
    this.objectPool.matchResults.length = 0;
    this.objectPool.segments.forEach((arr) => arr.length = 0);
  }
  /**
   * 添加路由记录
   */
  addRoute(record, parent) {
    const normalized = this.normalizeRecord(record, parent);
    if (normalized.name) {
      this.routes.set(normalized.name, normalized);
      this.rawRoutes.set(normalized.name, record);
    } else {
      const internalName = Symbol(`route_${normalized.path}_${Date.now()}`);
      normalized.name = internalName;
      this.routes.set(internalName, normalized);
      this.rawRoutes.set(internalName, record);
    }
    this.addToTrie(normalized);
    if (record.children) {
      for (const child of record.children) {
        const childRecord = this.normalizeRecord(child, normalized);
        if (child.path === "") {
          this.addDefaultChildToTrie(normalized, childRecord);
          if (childRecord.name) {
            this.routes.set(childRecord.name, childRecord);
            this.rawRoutes.set(childRecord.name, child);
          }
        } else {
          this.addRoute(child, normalized);
        }
      }
    }
    return normalized;
  }
  /**
   * 移除路由记录
   */
  removeRoute(name) {
    const record = this.routes.get(name);
    if (record) {
      this.routes.delete(name);
      this.removeFromTrie(record);
    }
  }
  /**
   * 获取所有路由记录
   */
  getRoutes() {
    return Array.from(this.routes.values()).map((route) => {
      if (typeof route.name === "symbol") {
        return {
          ...route,
          name: void 0
        };
      }
      return route;
    });
  }
  /**
   * 检查路由是否存在
   */
  hasRoute(name) {
    return this.routes.has(name);
  }
  /**
   * 根据路径匹配路由（优化版）
   */
  matchByPath(path) {
    const startTime = performance.now();
    this.stats.totalMatches++;
    const cacheKey = this.getCacheKey(path);
    const cached = this.lruCache.get(cacheKey);
    if (cached !== void 0) {
      this.stats.cacheHits++;
      const matchTime2 = performance.now() - startTime;
      this.updateAverageMatchTime(matchTime2);
      this.recordHotspot(path, matchTime2);
      return cached;
    }
    this.stats.cacheMisses++;
    if (path === "/" || path === "") {
      const rootMatch = this.matchRootPath();
      if (rootMatch) {
        this.lruCache.set(cacheKey, rootMatch);
        const matchTime2 = performance.now() - startTime;
        this.updateAverageMatchTime(matchTime2);
        this.recordHotspot(path, matchTime2);
        return rootMatch;
      }
    }
    const hasNestedRoutes = this.hasNestedRoutesForPath(path);
    if (!hasNestedRoutes) {
      const fastMatch = this.fastMatch(path);
      if (fastMatch) {
        this.lruCache.set(cacheKey, fastMatch);
        const matchTime2 = performance.now() - startTime;
        this.updateAverageMatchTime(matchTime2);
        this.recordHotspot(path, matchTime2);
        return fastMatch;
      }
    }
    const segments = this.getPooledSegments();
    this.fillSegments(segments, path);
    const result = this.matchSegments(this.root, segments, 0, {}, [], []);
    this.releasePooledSegments(segments);
    this.lruCache.set(cacheKey, result);
    const matchTime = performance.now() - startTime;
    this.updateAverageMatchTime(matchTime);
    this.recordHotspot(path, matchTime);
    return result;
  }
  /**
   * 优化：快速匹配根路径
   */
  matchRootPath() {
    if (this.root.record) {
      const matched = [this.root.record];
      let finalRecord = this.root.record;
      if (this.root.defaultChild) {
        matched.push(this.root.defaultChild);
        finalRecord = this.root.defaultChild;
      }
      return {
        record: finalRecord,
        matched,
        params: {},
        segments: []
      };
    }
    return null;
  }
  /**
   * 优化：使用对象池管理segments数组
   */
  getPooledSegments() {
    return this.objectPool.segments.pop() || [];
  }
  releasePooledSegments(segments) {
    segments.length = 0;
    if (this.objectPool.segments.length < 20) {
      this.objectPool.segments.push(segments);
    }
  }
  fillSegments(segments, path) {
    const parts = path.split("/");
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part && part !== "") {
        segments.push(part);
      }
    }
  }
  /**
   * 快速匹配（使用预编译的正则表达式）
   */
  fastMatch(path) {
    const sortedRoutes = Array.from(this.routes.values()).sort((a, b) => {
      const aCompiled = this.compilePath(a.path);
      const bCompiled = this.compilePath(b.path);
      return bCompiled.weight - aCompiled.weight;
    });
    for (const route of sortedRoutes) {
      const compiled = this.compilePath(route.path);
      const match = path.match(compiled.regex);
      if (match) {
        const params = {};
        for (let i = 0; i < compiled.paramNames.length; i++) {
          const paramName = compiled.paramNames[i];
          const paramValue = match[i + 1];
          if (paramName && paramValue !== void 0) {
            params[paramName] = paramValue;
          }
        }
        return {
          record: route,
          matched: [route],
          // 快速匹配只返回单个路由
          params,
          segments: this.parsePathSegments(path)
        };
      }
    }
    return null;
  }
  /**
   * 更新平均匹配时间
   */
  updateAverageMatchTime(time) {
    this.stats.averageMatchTime = (this.stats.averageMatchTime * (this.stats.totalMatches - 1) + time) / this.stats.totalMatches;
  }
  /**
   * 根据名称匹配路由
   */
  matchByName(name) {
    return this.routes.get(name) || null;
  }
  /**
   * 解析路由位置
   */
  resolve(to, _currentLocation) {
    if (typeof to === "string") {
      return this.resolveByPath(to);
    }
    if ("path" in to) {
      return this.resolveByPath(to.path, to.query, to.hash);
    }
    if ("name" in to) {
      return this.resolveByName(to.name, to.params, to.query, to.hash);
    }
    throw new Error("Invalid route location");
  }
  /**
   * 标准化路由记录
   */
  normalizeRecord(record, parent) {
    const path = this.normalizePath(record.path, parent?.path);
    return {
      path,
      name: record.name,
      components: record.component ? {
        default: record.component
      } : record.components || {},
      children: [],
      meta: record.meta || {},
      props: this.normalizeProps(record.props),
      beforeEnter: Array.isArray(record.beforeEnter) ? record.beforeEnter[0] : record.beforeEnter,
      aliasOf: void 0,
      redirect: record.redirect
    };
  }
  /**
   * 标准化路径
   */
  normalizePath(path, parentPath) {
    if (path.startsWith("/")) {
      return path;
    }
    if (!parentPath) {
      return `/${path}`;
    }
    if (path === "") {
      return "";
    }
    return `${parentPath.replace(/\/$/, "")}/${path}`;
  }
  /**
   * 标准化属性配置
   */
  normalizeProps(props) {
    if (!props) return {};
    if (typeof props === "boolean") return {
      default: props
    };
    if (typeof props === "object" && props !== null) return props;
    return {};
  }
  /**
   * 添加默认子路由到 Trie 树
   */
  addDefaultChildToTrie(parentRecord, childRecord) {
    const segments = this.parsePathSegments(parentRecord.path);
    let node = this.root;
    for (const segment of segments) {
      node = this.addSegmentToNode(node, segment);
    }
    node.defaultChild = childRecord;
  }
  /**
   * 添加到 Trie 树（优化版）
   */
  addToTrie(record) {
    const segments = this.parsePathSegments(record.path);
    let node = this.root;
    this.compilePath(record.path);
    for (const segment of segments) {
      node = this.addSegmentToNode(node, segment);
      if (node.weight !== void 0) {
        node.weight++;
      }
    }
    node.record = record;
  }
  /**
   * 检查路径是否可能有嵌套路由
   */
  hasNestedRoutesForPath(path) {
    if (path === "/" || path === "") {
      for (const [name, route] of this.rawRoutes.entries()) {
        const normalizedRoute = this.routes.get(name);
        if (normalizedRoute?.path === "/" && Array.isArray(route.children) && route.children.length > 0) {
          return true;
        }
      }
    }
    const segments = this.parsePathSegments(path);
    for (let i = 0; i < segments.length; i++) {
      const parentPath = i === 0 ? "/" : `/${segments.slice(0, i).join("/")}`;
      for (const [name, route] of this.rawRoutes.entries()) {
        const normalizedRoute = this.routes.get(name);
        if (normalizedRoute?.path === parentPath && Array.isArray(route.children) && route.children.length > 0) {
          for (const child of route.children) {
            const childPath = this.normalizePath(child.path, parentPath);
            if (childPath === path) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  /**
   * 从 Trie 树移除
   */
  removeFromTrie(record) {
    const segments = this.parsePathSegments(record.path);
    let node = this.root;
    for (const segment of segments) {
      const child = this.findChildNode(node, segment);
      if (!child) return;
      node = child;
    }
    delete node.record;
  }
  /**
   * 解析路径段
   */
  parsePathSegments(path) {
    return path.split("/").filter((segment) => segment !== "");
  }
  /**
   * 添加段到节点
   */
  addSegmentToNode(node, segment) {
    if (segment.startsWith(":")) {
      if (!node.paramChild) {
        node.paramChild = this.createNode();
        node.paramChild.paramName = segment.slice(1).replace(OPTIONAL_PARAM_RE, "");
        node.paramChild.isOptional = OPTIONAL_PARAM_RE.test(segment);
      }
      return node.paramChild;
    }
    if (segment === "*") {
      if (!node.wildcardChild) {
        node.wildcardChild = this.createNode();
      }
      return node.wildcardChild;
    }
    if (!node.children.has(segment)) {
      node.children.set(segment, this.createNode());
    }
    return node.children.get(segment);
  }
  /**
   * 查找子节点
   */
  findChildNode(node, segment) {
    if (node.children.has(segment)) {
      return node.children.get(segment);
    }
    if (node.paramChild) {
      return node.paramChild;
    }
    if (node.wildcardChild) {
      return node.wildcardChild;
    }
    return null;
  }
  /**
   * 匹配路径段
   */
  matchSegments(node, segments, index, params, matchedSegments, matchedRecords = []) {
    if (index >= segments.length) {
      if (node.record) {
        let allMatched = [...matchedRecords, node.record];
        let finalRecord = node.record;
        if (node.defaultChild) {
          allMatched = [...allMatched, node.defaultChild];
          finalRecord = node.defaultChild;
        }
        return {
          record: finalRecord,
          matched: allMatched,
          params: {
            ...params
          },
          segments: [...matchedSegments]
        };
      }
      if (node.paramChild?.isOptional && node.paramChild.record) {
        const allMatched = [...matchedRecords, node.paramChild.record];
        return {
          record: node.paramChild.record,
          matched: allMatched,
          params: {
            ...params
          },
          segments: [...matchedSegments]
        };
      }
      return null;
    }
    const segment = segments[index];
    if (!segment) {
      return null;
    }
    const staticChild = node.children.get(segment);
    if (staticChild) {
      const newMatchedRecords = node.record ? [...matchedRecords, node.record] : matchedRecords;
      const result = this.matchSegments(staticChild, segments, index + 1, params, [...matchedSegments, segment], newMatchedRecords);
      if (result) return result;
    }
    if (node.paramChild) {
      const paramName = node.paramChild.paramName;
      const newParams = {
        ...params,
        [paramName]: segment
      };
      const newMatchedRecords = node.record ? [...matchedRecords, node.record] : matchedRecords;
      const result = this.matchSegments(node.paramChild, segments, index + 1, newParams, [...matchedSegments, segment], newMatchedRecords);
      if (result) return result;
    }
    if (node.wildcardChild) {
      const remainingPath = segments.slice(index).join("/");
      const newParams = {
        ...params,
        pathMatch: remainingPath
      };
      const newMatchedRecords = node.record ? [...matchedRecords, node.record] : matchedRecords;
      const allMatched = [...newMatchedRecords, node.wildcardChild.record];
      return {
        record: node.wildcardChild.record,
        matched: allMatched,
        params: newParams,
        segments: [...matchedSegments, ...segments.slice(index)]
      };
    }
    return null;
  }
  /**
   * 根据路径解析（优化版）
   */
  resolveByPath(path, query, hash) {
    const match = this.matchByPath(path);
    if (!match) {
      throw new Error(`No match found for path: ${path}`);
    }
    let cleanPath = path;
    let urlQuery = {};
    let urlHash = "";
    try {
      const url = new URL(path, "http://localhost");
      cleanPath = url.pathname;
      urlHash = url.hash;
      if (url.searchParams && typeof url.searchParams.entries === "function") {
        urlQuery = Object.fromEntries(url.searchParams.entries());
      } else {
        const searchString = url.search.slice(1);
        if (searchString) {
          const pairs = searchString.split("&");
          for (const pair of pairs) {
            const [key, value] = pair.split("=").map(decodeURIComponent);
            if (key) {
              urlQuery[key] = value || "";
            }
          }
        }
      }
    } catch {
      const [pathPart, ...rest] = path.split("?");
      cleanPath = pathPart || "/";
      if (rest.length > 0) {
        const queryAndHash = rest.join("?");
        const [queryPart, hashPart] = queryAndHash.split("#");
        if (queryPart) {
          const pairs = queryPart.split("&");
          for (const pair of pairs) {
            const [key, value] = pair.split("=").map(decodeURIComponent);
            if (key) {
              urlQuery[key] = value || "";
            }
          }
        }
        if (hashPart) {
          urlHash = `#${hashPart}`;
        }
      }
    }
    return {
      path: cleanPath,
      name: match.record.name,
      params: match.params,
      query: {
        ...urlQuery,
        ...query || {}
      },
      hash: urlHash || hash || "",
      fullPath: this.buildFullPath(cleanPath, {
        ...urlQuery,
        ...query || {}
      }, urlHash || hash),
      matched: match.matched,
      meta: match.record.meta
    };
  }
  /**
   * 根据名称解析
   */
  resolveByName(name, params, query, hash) {
    const record = this.matchByName(name);
    if (!record) {
      throw new Error(`No route found with name: ${String(name)}`);
    }
    const path = this.buildPathFromParams(record.path, params || {});
    return {
      path,
      name: record.name,
      params: params || {},
      query: query || {},
      hash: hash || "",
      fullPath: this.buildFullPath(path, query, hash),
      matched: [record],
      meta: record.meta
    };
  }
  /**
   * 从参数构建路径
   */
  buildPathFromParams(pattern, params) {
    return pattern.replace(PARAM_RE, (_match, paramName, optional) => {
      const value = params[paramName];
      if (value === void 0 || value === null) {
        if (optional) return "";
        throw new Error(`Missing required parameter: ${paramName}`);
      }
      return String(value);
    });
  }
  /**
   * 构建完整路径
   */
  buildFullPath(path, query, hash) {
    let fullPath = path;
    if (query && Object.keys(query).length > 0) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== null && value !== void 0) {
          queryParams.append(key, String(value));
        }
      }
      const queryString = queryParams.toString();
      if (queryString) {
        fullPath += `?${queryString}`;
      }
    }
    if (hash) {
      fullPath += `#${hash.replace(/^#/, "")}`;
    }
    return fullPath;
  }
}

export { RouteMatcher };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=matcher.js.map
