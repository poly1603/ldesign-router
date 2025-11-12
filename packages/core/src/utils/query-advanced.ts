/**
 * @ldesign/router-core 高级查询参数工具
 * 
 * @description
 * 提供高级的查询参数处理,支持数组、嵌套对象、类型转换等。
 * 
 * **特性**：
 * - 数组参数支持 (?ids=1&ids=2)
 * - 嵌套对象支持 (?filter[name]=foo)
 * - 自定义序列化/反序列化
 * - 类型转换 (string, number, boolean, date)
 * - 默认值支持
 * - 参数验证
 * 
 * @module utils/query-advanced
 */

/**
 * 查询参数值类型
 */
export type QueryValue = string | number | boolean | Date | null | undefined

/**
 * 查询参数对象
 */
export type QueryObject = Record<string, QueryValue | QueryValue[] | QueryObject>

/**
 * 查询参数配置
 */
export interface QueryParamConfig {
  /** 参数类型 */
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  
  /** 默认值 */
  default?: any
  
  /** 是否必需 */
  required?: boolean
  
  /** 验证函数 */
  validate?: (value: any) => boolean
  
  /** 转换函数 */
  transform?: (value: any) => any
  
  /** 数组分隔符 */
  arraySeparator?: string
  
  /** 是否允许多个值 */
  multiple?: boolean
}

/**
 * 查询参数配置映射
 */
export type QueryParamsConfig = Record<string, QueryParamConfig>

/**
 * 序列化选项
 */
export interface StringifyOptions {
  /** 是否编码 */
  encode?: boolean
  
  /** 数组格式: 'brackets' | 'repeat' | 'comma' */
  arrayFormat?: 'brackets' | 'repeat' | 'comma'
  
  /** 是否排序键 */
  sort?: boolean
  
  /** 是否跳过null值 */
  skipNull?: boolean
  
  /** 是否跳过空字符串 */
  skipEmptyString?: boolean
}

/**
 * 解析选项
 */
export interface ParseOptions {
  /** 是否解码 */
  decode?: boolean
  
  /** 数组格式 */
  arrayFormat?: 'brackets' | 'repeat' | 'comma'
  
  /** 逗号分隔符 (用于comma格式) */
  commaSeparator?: string
}

// ==================== 解析 ====================

/**
 * 解析查询字符串 (增强版)
 */
export function parseQueryEnhanced(
  query: string,
  options: ParseOptions = {},
): QueryObject {
  const {
    decode = true,
    arrayFormat = 'brackets',
    commaSeparator = ',',
  } = options

  const result: QueryObject = {}

  if (!query || query.trim() === '') {
    return result
  }

  // 移除开头的 ?
  const cleanQuery = query.startsWith('?') ? query.slice(1) : query

  // 分割参数
  const pairs = cleanQuery.split('&')

  for (const pair of pairs) {
    if (!pair) continue

    const [key, value = ''] = pair.split('=')
    const decodedKey = decode ? decodeURIComponent(key) : key
    const decodedValue = decode ? decodeURIComponent(value) : value

    // 处理嵌套对象 (filter[name]=foo)
    if (decodedKey.includes('[')) {
      setNestedValue(result, decodedKey, decodedValue)
      continue
    }

    // 处理数组格式
    if (arrayFormat === 'brackets' && decodedKey.endsWith('[]')) {
      const actualKey = decodedKey.slice(0, -2)
      if (!result[actualKey]) {
        result[actualKey] = []
      }
      (result[actualKey] as any[]).push(decodedValue)
      continue
    }

    if (arrayFormat === 'repeat') {
      if (result[decodedKey]) {
        if (Array.isArray(result[decodedKey])) {
          (result[decodedKey] as any[]).push(decodedValue)
        } else {
          result[decodedKey] = [result[decodedKey], decodedValue]
        }
      } else {
        result[decodedKey] = decodedValue
      }
      continue
    }

    if (arrayFormat === 'comma' && decodedValue.includes(commaSeparator)) {
      result[decodedKey] = decodedValue.split(commaSeparator)
      continue
    }

    // 普通键值对
    result[decodedKey] = decodedValue
  }

  return result
}

/**
 * 设置嵌套值
 */
function setNestedValue(obj: QueryObject, key: string, value: string): void {
  const parts = key.match(/([^\[\]]+)/g)
  if (!parts || parts.length === 0) return

  let current: any = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    
    if (!current[part]) {
      // 判断下一个是数字还是字符串
      const nextPart = parts[i + 1]
      current[part] = /^\d+$/.test(nextPart) ? [] : {}
    }
    
    current = current[part]
  }

  const lastPart = parts[parts.length - 1]
  current[lastPart] = value
}

// ==================== 序列化 ====================

/**
 * 序列化查询参数 (增强版)
 */
export function stringifyQueryEnhanced(
  query: QueryObject,
  options: StringifyOptions = {},
): string {
  const {
    encode = true,
    arrayFormat = 'brackets',
    sort = false,
    skipNull = true,
    skipEmptyString = false,
  } = options

  const pairs: string[] = []

  // 获取键列表
  let keys = Object.keys(query)
  if (sort) {
    keys = keys.sort()
  }

  for (const key of keys) {
    const value = query[key]

    // 跳过null
    if (skipNull && value === null) {
      continue
    }

    // 跳过undefined
    if (value === undefined) {
      continue
    }

    // 跳过空字符串
    if (skipEmptyString && value === '') {
      continue
    }

    const encodedKey = encode ? encodeURIComponent(key) : key

    // 处理数组
    if (Array.isArray(value)) {
      if (arrayFormat === 'brackets') {
        for (const item of value) {
          pairs.push(`${encodedKey}[]=${encode ? encodeURIComponent(String(item)) : item}`)
        }
      } else if (arrayFormat === 'repeat') {
        for (const item of value) {
          pairs.push(`${encodedKey}=${encode ? encodeURIComponent(String(item)) : item}`)
        }
      } else if (arrayFormat === 'comma') {
        const items = value.map(item => encode ? encodeURIComponent(String(item)) : String(item))
        pairs.push(`${encodedKey}=${items.join(',')}`)
      }
      continue
    }

    // 处理嵌套对象
    if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      const nested = flattenObject(value as QueryObject, key)
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        const encodedNestedKey = encode ? encodeURIComponent(nestedKey) : nestedKey
        const encodedNestedValue = encode ? encodeURIComponent(String(nestedValue)) : String(nestedValue)
        pairs.push(`${encodedNestedKey}=${encodedNestedValue}`)
      }
      continue
    }

    // 处理Date
    if (value instanceof Date) {
      const encodedValue = encode ? encodeURIComponent(value.toISOString()) : value.toISOString()
      pairs.push(`${encodedKey}=${encodedValue}`)
      continue
    }

    // 处理其他类型
    const encodedValue = encode ? encodeURIComponent(String(value)) : String(value)
    pairs.push(`${encodedKey}=${encodedValue}`)
  }

  return pairs.join('&')
}

/**
 * 扁平化对象
 */
function flattenObject(
  obj: QueryObject,
  prefix: string = '',
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}[${key}]` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value as QueryObject, newKey))
    } else {
      result[newKey] = value
    }
  }

  return result
}

// ==================== 类型转换 ====================

/**
 * 转换查询参数类型
 */
export function transformQuery(
  query: QueryObject,
  config: QueryParamsConfig,
): QueryObject {
  const result: QueryObject = {}

  for (const [key, paramConfig] of Object.entries(config)) {
    let value = query[key]

    // 使用默认值
    if (value === undefined || value === null) {
      if (paramConfig.default !== undefined) {
        value = paramConfig.default
      } else if (paramConfig.required) {
        throw new Error(`Required query parameter "${key}" is missing`)
      } else {
        continue
      }
    }

    // 类型转换
    if (paramConfig.type) {
      value = convertType(value, paramConfig.type)
    }

    // 自定义转换
    if (paramConfig.transform) {
      value = paramConfig.transform(value)
    }

    // 验证
    if (paramConfig.validate && !paramConfig.validate(value)) {
      throw new Error(`Query parameter "${key}" validation failed`)
    }

    result[key] = value
  }

  return result
}

/**
 * 转换类型
 */
function convertType(value: any, type: string): any {
  if (Array.isArray(value)) {
    return value.map(v => convertSingleType(v, type))
  }
  
  return convertSingleType(value, type)
}

/**
 * 转换单个值的类型
 */
function convertSingleType(value: any, type: string): any {
  switch (type) {
    case 'string':
      return String(value)
    
    case 'number':
      const num = Number(value)
      return isNaN(num) ? 0 : num
    
    case 'boolean':
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        return lower === 'true' || lower === '1' || lower === 'yes'
      }
      return Boolean(value)
    
    case 'date':
      if (value instanceof Date) return value
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    
    default:
      return value
  }
}

// ==================== 工具函数 ====================

/**
 * 合并查询参数
 */
export function mergeQueryEnhanced(
  ...queries: QueryObject[]
): QueryObject {
  const result: QueryObject = {}

  for (const query of queries) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue
      }

      // 如果都是数组,合并数组
      if (Array.isArray(result[key]) && Array.isArray(value)) {
        result[key] = [...(result[key] as any[]), ...value]
        continue
      }

      // 如果都是对象,递归合并
      if (
        typeof result[key] === 'object' &&
        typeof value === 'object' &&
        result[key] !== null &&
        value !== null &&
        !Array.isArray(result[key]) &&
        !Array.isArray(value) &&
        !(result[key] instanceof Date) &&
        !(value instanceof Date)
      ) {
        result[key] = mergeQueryEnhanced(result[key] as QueryObject, value as QueryObject)
        continue
      }

      // 否则直接覆盖
      result[key] = value
    }
  }

  return result
}

/**
 * 比较查询参数
 */
export function isSameQuery(
  query1: QueryObject,
  query2: QueryObject,
): boolean {
  const keys1 = Object.keys(query1).sort()
  const keys2 = Object.keys(query2).sort()

  if (keys1.length !== keys2.length) {
    return false
  }

  for (let i = 0; i < keys1.length; i++) {
    if (keys1[i] !== keys2[i]) {
      return false
    }

    const value1 = query1[keys1[i]]
    const value2 = query2[keys1[i]]

    if (!isEqual(value1, value2)) {
      return false
    }
  }

  return true
}

/**
 * 深度比较值
 */
function isEqual(value1: any, value2: any): boolean {
  // 类型不同
  if (typeof value1 !== typeof value2) {
    return false
  }

  // 基本类型
  if (typeof value1 !== 'object' || value1 === null) {
    return value1 === value2
  }

  // 日期
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime()
  }

  // 数组
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false
    }
    for (let i = 0; i < value1.length; i++) {
      if (!isEqual(value1[i], value2[i])) {
        return false
      }
    }
    return true
  }

  // 对象
  const keys1 = Object.keys(value1)
  const keys2 = Object.keys(value2)
  
  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(value1[key], value2[key])) {
      return false
    }
  }

  return true
}

/**
 * 从查询中提取指定键
 */
export function pickQuery(
  query: QueryObject,
  keys: string[],
): QueryObject {
  const result: QueryObject = {}

  for (const key of keys) {
    if (key in query) {
      result[key] = query[key]
    }
  }

  return result
}

/**
 * 从查询中排除指定键
 */
export function omitQuery(
  query: QueryObject,
  keys: string[],
): QueryObject {
  const result: QueryObject = {}

  for (const [key, value] of Object.entries(query)) {
    if (!keys.includes(key)) {
      result[key] = value
    }
  }

  return result
}
