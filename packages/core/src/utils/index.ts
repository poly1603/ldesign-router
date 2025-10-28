/**
 * @ldesign/router-core 工具函数统一导出
 * 
 * @module utils
 */

// 路径处理工具
export {
  normalizePath,
  joinPaths,
  parsePathParams,
  buildPath,
  extractParamNames,
  normalizeParams,
} from './path'

// 查询参数处理工具
export {
  parseQuery,
  stringifyQuery,
  mergeQuery,
  normalizeQuery,
} from './query'

// URL 处理工具
export {
  parseURL,
  stringifyURL,
  normalizeURL,
  isSameURL,
} from './url'

export type {
  ParsedURL,
} from './url'

