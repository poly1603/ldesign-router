/**
 * @ldesign/router-core 高级路径工具
 * 
 * @description
 * 提供高级的路径处理工具函数。
 * 
 * **特性**：
 * - 路径比较
 * - 路径包含关系判断
 * - 路径分段处理
 * - 路径拼接增强
 * - 路径模式匹配
 * - URL 安全检查
 * 
 * @module utils/path-advanced
 */

import { normalizePath } from './path'

/**
 * 路径段
 */
export interface PathSegment {
  /** 段值 */
  value: string
  
  /** 是否为参数 */
  isParam: boolean
  
  /** 是否为可选参数 */
  isOptional: boolean
  
  /** 是否为通配符 */
  isWildcard: boolean
  
  /** 参数名 (如果是参数) */
  paramName?: string
  
  /** 参数正则 (如果有验证) */
  paramRegex?: RegExp
}

/**
 * 路径比较选项
 */
export interface PathCompareOptions {
  /** 是否忽略查询参数 */
  ignoreQuery?: boolean
  
  /** 是否忽略hash */
  ignoreHash?: boolean
  
  /** 是否忽略尾部斜杠 */
  ignoreTrailingSlash?: boolean
  
  /** 是否大小写敏感 */
  caseSensitive?: boolean
}

/**
 * 路径关系
 */
export type PathRelation = 'same' | 'parent' | 'child' | 'sibling' | 'unrelated'

// ==================== 路径比较 ====================

/**
 * 比较两个路径是否相同
 */
export function isSamePath(
  path1: string,
  path2: string,
  options: PathCompareOptions = {},
): boolean {
  const {
    ignoreQuery = true,
    ignoreHash = true,
    ignoreTrailingSlash = true,
    caseSensitive = false,
  } = options

  let p1 = path1
  let p2 = path2

  // 移除查询参数
  if (ignoreQuery) {
    p1 = p1.split('?')[0]
    p2 = p2.split('?')[0]
  }

  // 移除hash
  if (ignoreHash) {
    p1 = p1.split('#')[0]
    p2 = p2.split('#')[0]
  }

  // 规范化路径
  p1 = normalizePath(p1, !ignoreTrailingSlash)
  p2 = normalizePath(p2, !ignoreTrailingSlash)

  // 大小写处理
  if (!caseSensitive) {
    p1 = p1.toLowerCase()
    p2 = p2.toLowerCase()
  }

  return p1 === p2
}

/**
 * 判断path1是否为path2的父路径
 */
export function isParentPath(path1: string, path2: string): boolean {
  const p1 = normalizePath(path1).replace(/\/$/, '')
  const p2 = normalizePath(path2).replace(/\/$/, '')

  if (p1 === p2) {
    return false
  }

  return p2.startsWith(p1 + '/')
}

/**
 * 判断path1是否为path2的子路径
 */
export function isChildPath(path1: string, path2: string): boolean {
  return isParentPath(path2, path1)
}

/**
 * 判断两个路径是否为兄弟路径 (同一父路径下)
 */
export function isSiblingPath(path1: string, path2: string): boolean {
  const parent1 = getParentPath(path1)
  const parent2 = getParentPath(path2)

  if (!parent1 || !parent2) {
    return false
  }

  return parent1 === parent2 && path1 !== path2
}

/**
 * 获取两个路径的关系
 */
export function getPathRelation(path1: string, path2: string): PathRelation {
  if (isSamePath(path1, path2)) {
    return 'same'
  }

  if (isParentPath(path1, path2)) {
    return 'parent'
  }

  if (isChildPath(path1, path2)) {
    return 'child'
  }

  if (isSiblingPath(path1, path2)) {
    return 'sibling'
  }

  return 'unrelated'
}

// ==================== 路径分段 ====================

/**
 * 分割路径为段
 */
export function splitPath(path: string): string[] {
  return normalizePath(path)
    .split('/')
    .filter(segment => segment !== '')
}

/**
 * 获取路径段详细信息
 */
export function getPathSegments(path: string): PathSegment[] {
  const parts = splitPath(path)
  const segments: PathSegment[] = []

  for (const part of parts) {
    const segment: PathSegment = {
      value: part,
      isParam: false,
      isOptional: false,
      isWildcard: false,
    }

    // 通配符
    if (part === '*' || part === '**') {
      segment.isWildcard = true
    }
    // 动态参数
    else if (part.startsWith(':')) {
      segment.isParam = true
      
      // 可选参数
      if (part.endsWith('?')) {
        segment.isOptional = true
        segment.paramName = part.slice(1, -1)
      }
      // 带正则验证的参数
      else if (part.includes('(') && part.includes(')')) {
        const match = part.match(/:(\w+)\((.+)\)/)
        if (match) {
          segment.paramName = match[1]
          segment.paramRegex = new RegExp(match[2])
        }
      }
      // 普通参数
      else {
        segment.paramName = part.slice(1)
      }
    }

    segments.push(segment)
  }

  return segments
}

/**
 * 获取路径深度
 */
export function getPathDepth(path: string): number {
  return splitPath(path).length
}

/**
 * 获取父路径
 */
export function getParentPath(path: string): string | null {
  const segments = splitPath(path)
  
  if (segments.length <= 1) {
    return null
  }

  return '/' + segments.slice(0, -1).join('/')
}

/**
 * 获取路径的最后一段
 */
export function getLastPathSegment(path: string): string | null {
  const segments = splitPath(path)
  return segments.length > 0 ? segments[segments.length - 1] : null
}

/**
 * 获取路径的第一段
 */
export function getFirstPathSegment(path: string): string | null {
  const segments = splitPath(path)
  return segments.length > 0 ? segments[0] : null
}

// ==================== 路径拼接 ====================

/**
 * 安全拼接路径
 */
export function joinPathsSafe(...paths: string[]): string {
  if (paths.length === 0) {
    return '/'
  }

  // 过滤空值
  const validPaths = paths.filter(p => p && p.trim() !== '')
  
  if (validPaths.length === 0) {
    return '/'
  }

  let result = validPaths[0]

  for (let i = 1; i < validPaths.length; i++) {
    const current = validPaths[i]
    
    // 如果当前路径是绝对路径,直接使用
    if (current.startsWith('/')) {
      result = current
      continue
    }

    // 移除result的尾部斜杠
    result = result.replace(/\/$/, '')
    
    // 拼接
    result += '/' + current
  }

  return normalizePath(result)
}

/**
 * 解析相对路径
 */
export function resolveRelativePath(from: string, to: string): string {
  // 如果to是绝对路径,直接返回
  if (to.startsWith('/')) {
    return normalizePath(to)
  }

  const fromSegments = splitPath(from)
  const toSegments = to.split('/').filter(Boolean)

  for (const segment of toSegments) {
    if (segment === '.') {
      // 当前目录,跳过
      continue
    } else if (segment === '..') {
      // 上级目录
      fromSegments.pop()
    } else {
      // 添加段
      fromSegments.push(segment)
    }
  }

  return '/' + fromSegments.join('/')
}

/**
 * 计算相对路径
 */
export function getRelativePath(from: string, to: string): string {
  const fromSegments = splitPath(from)
  const toSegments = splitPath(to)

  // 找到公共前缀
  let commonLength = 0
  const minLength = Math.min(fromSegments.length, toSegments.length)

  for (let i = 0; i < minLength; i++) {
    if (fromSegments[i] === toSegments[i]) {
      commonLength++
    } else {
      break
    }
  }

  // 计算需要返回的层数
  const upLevels = fromSegments.length - commonLength
  
  // 构建相对路径
  const upParts = Array(upLevels).fill('..')
  const remainingParts = toSegments.slice(commonLength)

  return [...upParts, ...remainingParts].join('/')
}

// ==================== 路径模式匹配 ====================

/**
 * 匹配路径模式
 */
export function matchPathPattern(path: string, pattern: string): boolean {
  const pathSegments = splitPath(path)
  const patternSegments = splitPath(pattern)

  // 如果模式包含 **,特殊处理
  if (pattern.includes('**')) {
    return matchGlobPattern(path, pattern)
  }

  // 段数不匹配且没有可选参数
  if (pathSegments.length !== patternSegments.length) {
    // 检查是否有可选参数
    const hasOptional = patternSegments.some(s => s.endsWith('?'))
    if (!hasOptional) {
      return false
    }
  }

  for (let i = 0; i < patternSegments.length; i++) {
    const pathSeg = pathSegments[i]
    const patternSeg = patternSegments[i]

    // 通配符匹配任意
    if (patternSeg === '*') {
      continue
    }

    // 可选参数
    if (patternSeg.startsWith(':') && patternSeg.endsWith('?')) {
      if (!pathSeg) {
        continue
      }
      // 验证参数
      if (patternSeg.includes('(')) {
        const match = patternSeg.match(/:(\w+)\((.+)\)\?/)
        if (match) {
          const regex = new RegExp(match[2])
          if (!regex.test(pathSeg)) {
            return false
          }
        }
      }
      continue
    }

    // 动态参数
    if (patternSeg.startsWith(':')) {
      if (!pathSeg) {
        return false
      }
      // 验证参数
      if (patternSeg.includes('(')) {
        const match = patternSeg.match(/:(\w+)\((.+)\)/)
        if (match) {
          const regex = new RegExp(match[2])
          if (!regex.test(pathSeg)) {
            return false
          }
        }
      }
      continue
    }

    // 精确匹配
    if (pathSeg !== patternSeg) {
      return false
    }
  }

  return true
}

/**
 * 匹配glob模式
 */
function matchGlobPattern(path: string, pattern: string): boolean {
  // 转换为正则表达式
  let regex = pattern
    .replace(/\*\*/g, '§§') // 临时占位符
    .replace(/\*/g, '[^/]+')  // * -> 匹配一个段
    .replace(/§§/g, '.*')     // ** -> 匹配任意段
    .replace(/\//g, '\\/')

  // 处理参数
  regex = regex.replace(/:(\w+)/g, '([^/]+)')

  return new RegExp(`^${regex}$`).test(path)
}

/**
 * 检查路径是否匹配任一模式
 */
export function matchesAnyPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => matchPathPattern(path, pattern))
}

// ==================== URL 安全检查 ====================

/**
 * 检查URL是否安全
 */
export function isUrlSafe(url: string): boolean {
  // 检查是否包含危险协议
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = url.toLowerCase().trim()

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return false
    }
  }

  // 检查是否包含特殊字符
  const dangerousPatterns = [
    /<script/i,
    /on\w+=/i, // 事件处理器
    /javascript:/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) {
      return false
    }
  }

  return true
}

/**
 * 清理路径中的危险字符
 */
export function sanitizePath(path: string): string {
  return path
    // 移除多余的斜杠
    .replace(/\/+/g, '/')
    // 移除 ../
    .replace(/\.\.+/g, '')
    // 移除特殊字符
    .replace(/[<>'"]/g, '')
}

/**
 * 验证路径格式
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false
  }

  // 路径不能为空
  if (path.trim() === '') {
    return false
  }

  // 路径应该以 / 开头或为相对路径
  if (!path.startsWith('/') && !path.startsWith('.')) {
    // 允许不以 / 开头的相对路径
  }

  // 不能包含连续的斜杠(除非是协议部分)
  if (path.includes('//') && !path.startsWith('http')) {
    return false
  }

  return true
}

// ==================== 其他工具 ====================

/**
 * 标准化路径数组
 */
export function normalizePathArray(paths: string[]): string[] {
  return paths.map(p => normalizePath(p))
}

/**
 * 去重路径数组
 */
export function uniquePaths(paths: string[]): string[] {
  const normalized = normalizePathArray(paths)
  return [...new Set(normalized)]
}

/**
 * 排序路径数组 (按深度和字母顺序)
 */
export function sortPaths(paths: string[]): string[] {
  return [...paths].sort((a, b) => {
    const depthA = getPathDepth(a)
    const depthB = getPathDepth(b)

    if (depthA !== depthB) {
      return depthA - depthB
    }

    return a.localeCompare(b)
  })
}

/**
 * 查找公共父路径
 */
export function findCommonParent(paths: string[]): string | null {
  if (paths.length === 0) {
    return null
  }

  if (paths.length === 1) {
    return getParentPath(paths[0])
  }

  const segmentArrays = paths.map(p => splitPath(p))
  const minLength = Math.min(...segmentArrays.map(s => s.length))

  const commonSegments: string[] = []

  for (let i = 0; i < minLength; i++) {
    const segment = segmentArrays[0][i]
    
    if (segmentArrays.every(arr => arr[i] === segment)) {
      commonSegments.push(segment)
    } else {
      break
    }
  }

  return commonSegments.length > 0 ? '/' + commonSegments.join('/') : '/'
}

/**
 * 扩展路径 (添加后缀)
 */
export function extendPath(path: string, suffix: string): string {
  return joinPathsSafe(path, suffix)
}

/**
 * 截断路径到指定深度
 */
export function truncatePath(path: string, depth: number): string {
  const segments = splitPath(path)
  return '/' + segments.slice(0, depth).join('/')
}
