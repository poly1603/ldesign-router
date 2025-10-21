/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
export { CodeQualityChecker, IssueSeverity, QualityIssueType, codeQualityChecker } from './code-quality.js';
export { ErrorManager, ErrorSeverity, ErrorType, addErrorListener, errorManager, getErrorHistory, getErrorStatistics, handleError } from './error-manager.js';
export { Logger, analyticsLogger, debugLogger, logger, performanceLogger, securityLogger } from './logger.js';

function normalizePath(path) {
  if (typeof path !== "string") {
    throw new TypeError("\u8DEF\u5F84\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B");
  }
  if (!path || path === "") {
    return "/";
  }
  path = path.replace(/\/+/g, "/");
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  const segments = path.split("/").filter(Boolean);
  const normalizedSegments = [];
  for (const segment of segments) {
    if (segment === "..") {
      if (normalizedSegments.length > 0) {
        normalizedSegments.pop();
      }
    } else if (segment !== ".") {
      normalizedSegments.push(segment);
    }
  }
  return normalizedSegments.length === 0 ? "/" : `/${normalizedSegments.join("/")}`;
}
function joinPaths(...paths) {
  return normalizePath(paths.filter(Boolean).join("/"));
}
function parsePathParams(pattern, path) {
  const params = {};
  const patternSegments = pattern.split("/");
  const pathSegments = path.split("/");
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];
    if (patternSegment && patternSegment.startsWith(":")) {
      const paramName = patternSegment.slice(1).replace(/\?$/, "");
      if (pathSegment !== void 0) {
        params[paramName] = decodeURIComponent(pathSegment);
      }
    }
  }
  return params;
}
function buildPath(pattern, params = {}) {
  return pattern.replace(/:([^/?]+)(\?)?/g, (_match, paramName, optional) => {
    const value = params[paramName];
    if (value === void 0 || value === null) {
      if (optional) return "";
      throw new Error(`Missing required parameter: ${paramName}`);
    }
    return encodeURIComponent(String(value));
  });
}
function parseQuery(search) {
  const query = {};
  if (typeof search !== "string" || !search || search === "?") {
    return query;
  }
  const queryString = search.startsWith("?") ? search.slice(1) : search;
  if (!queryString) {
    return query;
  }
  const pairs = queryString.split(/[&;]/);
  for (const pair of pairs) {
    if (!pair) continue;
    try {
      const equalIndex = pair.indexOf("=");
      let key;
      let value;
      if (equalIndex === -1) {
        key = decodeURIComponent(pair);
        value = "";
      } else {
        key = decodeURIComponent(pair.slice(0, equalIndex));
        value = decodeURIComponent(pair.slice(equalIndex + 1));
      }
      if (key) {
        if (query[key] === void 0) {
          query[key] = value;
        } else {
          const existing = query[key];
          if (Array.isArray(existing)) {
            existing.push(value);
          } else {
            query[key] = [existing, value];
          }
        }
      }
    } catch (error) {
      console.warn(`\u67E5\u8BE2\u53C2\u6570\u89E3\u6790\u5931\u8D25: ${pair}`, error);
      continue;
    }
  }
  return query;
}
function stringifyQuery(query) {
  const pairs = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === void 0) {
      continue;
    }
    const encodedKey = encodeURIComponent(key);
    if (Array.isArray(value)) {
      for (const item of value) {
        pairs.push(`${encodedKey}=${encodeURIComponent(String(item))}`);
      }
    } else {
      pairs.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
    }
  }
  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
}
function mergeQuery(target, source) {
  return {
    ...target,
    ...source
  };
}
function parseURL(url) {
  const [pathAndQuery, hash = ""] = url.split("#");
  const pathAndQueryDefined = pathAndQuery || "";
  const [path, search = ""] = pathAndQueryDefined.split("?");
  return {
    path: normalizePath(path || "/"),
    query: parseQuery(search),
    hash: hash ? `#${hash}` : ""
  };
}
function stringifyURL(path, query, hash) {
  let url = normalizePath(path);
  if (query && Object.keys(query).length > 0) {
    url += stringifyQuery(query);
  }
  if (hash) {
    url += hash.startsWith("#") ? hash : `#${hash}`;
  }
  return url;
}
function normalizeParams(params) {
  const normalized = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== void 0) {
      normalized[key] = Array.isArray(value) ? value.map(String) : String(value);
    }
  }
  return normalized;
}
function isSameRouteLocation(a, b) {
  return a.path === b.path && a.hash === b.hash && JSON.stringify(a.query) === JSON.stringify(b.query) && JSON.stringify(a.params) === JSON.stringify(b.params);
}
function resolveRouteLocation(raw) {
  if (typeof raw === "string") {
    const {
      path,
      query,
      hash
    } = parseURL(raw);
    return {
      path,
      query,
      hash
    };
  }
  if ("path" in raw) {
    return {
      path: normalizePath(raw.path),
      query: raw.query || {},
      hash: raw.hash || ""
    };
  }
  if ("name" in raw) {
    return {
      name: raw.name,
      params: normalizeParams(raw.params || {}),
      query: raw.query || {},
      hash: raw.hash || ""
    };
  }
  throw new Error("Invalid route location");
}
function createNavigationFailure(type, from, to, message) {
  const error = new Error(message || "Navigation failed");
  error.type = type;
  error.from = from;
  error.to = to;
  return error;
}
function isNavigationFailure(error, type) {
  return error && typeof error === "object" && "type" in error && "from" in error && "to" in error && (type === void 0 || error.type === type);
}
function matchPath(pattern, path) {
  if (pattern.includes("?")) {
    const basePattern = pattern.replace(/:[^/]+\?/g, "");
    const fullPattern = pattern.replace(/\?/g, "");
    if (matchPathSimple(basePattern, path)) {
      return true;
    }
    return matchPathSimple(fullPattern, path);
  }
  return matchPathSimple(pattern, path);
}
function matchPathSimple(pattern, path) {
  const patternRegex = pattern.replace(/:[^/]+/g, "([^/]+)").replace(/\*/g, "(.*)");
  const regex = new RegExp(`^${patternRegex}$`);
  return regex.test(path);
}
function extractParams(pattern, path) {
  const params = {};
  const paramNames = [];
  const optionalParams = /* @__PURE__ */ new Set();
  pattern.replace(/:([^/?]+)(\?)?/g, (match, name, optional) => {
    paramNames.push(name);
    if (optional) {
      optionalParams.add(name);
    }
    return match;
  });
  let patternRegex = pattern.replace(/:[^/]+\?/g, "([^/]*)").replace(/:[^/]+/g, "([^/]+)").replace(/\*/g, "(.*)");
  if (pattern.includes("?")) {
    patternRegex = patternRegex.replace(/\/\(\[.*?\]\*\)$/, "/?([^/]*)");
  }
  const regex = new RegExp(`^${patternRegex}$`);
  const matches = path.match(regex);
  if (matches) {
    paramNames.forEach((name, index) => {
      const value = matches[index + 1];
      if (value !== void 0 && value !== "") {
        params[name] = decodeURIComponent(value);
      } else if (optionalParams.has(name)) {
        params[name] = void 0;
      }
    });
  }
  return params;
}
function cloneRouteLocation(location) {
  return {
    ...location,
    params: {
      ...location.params
    },
    query: {
      ...location.query
    },
    meta: {
      ...location.meta
    },
    matched: [...location.matched]
  };
}
function getRouteDepth(route) {
  return route.path.split("/").filter(Boolean).length;
}
function isChildRoute(parent, child) {
  const parentPath = normalizePath(parent);
  const childPath = normalizePath(child);
  return childPath.startsWith(`${parentPath}/`) || childPath === parentPath;
}
var index = {
  // 路径处理
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,
  // 查询参数处理
  parseQuery,
  stringifyQuery,
  mergeQuery,
  // URL 处理
  parseURL,
  stringifyURL,
  // 路由位置处理
  normalizeParams,
  isSameRouteLocation,
  resolveRouteLocation,
  // 导航失败处理
  createNavigationFailure,
  isNavigationFailure,
  // 路由匹配
  matchPath,
  extractParams,
  // 工具函数
  cloneRouteLocation,
  getRouteDepth,
  isChildRoute
};

export { buildPath, cloneRouteLocation, createNavigationFailure, index as default, extractParams, getRouteDepth, isChildRoute, isNavigationFailure, isSameRouteLocation, joinPaths, matchPath, mergeQuery, normalizeParams, normalizePath, parsePathParams, parseQuery, parseURL, resolveRouteLocation, stringifyQuery, stringifyURL };
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
