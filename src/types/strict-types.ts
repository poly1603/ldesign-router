/**
 * 严格类型定义 - 消除 any 类型
 * 
 * 提供类型安全的替代方案
 */

/**
 * 未知对象类型（替代 any 对象）
 */
export type UnknownObject = Record<string, unknown>

/**
 * 未知记录类型
 */
export type UnknownRecord<K extends string | number | symbol = string> = Record<K, unknown>

/**
 * 可能为 null 的类型
 */
export type Nullable<T> = T | null | undefined

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可序列化类型
 */
export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable }

/**
 * JSON 值类型
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * 函数类型（替代 any 函数）
 */
export type AnyFunction = (...args: unknown[]) => unknown

/**
 * 异步函数类型
 */
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>

/**
 * 构造函数类型
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T

/**
 * 类类型
 */
export type Class<T = unknown> = Constructor<T> & { prototype: T }

/**
 * 事件处理器类型
 */
export type EventHandler<E = Event> = (event: E) => void | Promise<void>

/**
 * 回调函数类型
 */
export type Callback<T = void> = (error: Error | null, result?: T) => void

/**
 * 谓词函数类型
 */
export type Predicate<T> = (value: T) => boolean

/**
 * 映射函数类型
 */
export type Mapper<T, R> = (value: T, index?: number) => R

/**
 * 比较函数类型
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * 守卫函数类型
 */
export type TypeGuard<T, S extends T> = (value: T) => value is S

/**
 * Branded Types - 防止类型混淆
 */
export type Brand<T, B> = T & { __brand: B }

/**
 * 路由路径 Branded Type
 */
export type RoutePath = Brand<string, 'RoutePath'>

/**
 * 路由名称 Branded Type
 */
export type RouteName = Brand<string | symbol, 'RouteName'>

/**
 * 缓存键 Branded Type
 */
export type CacheKey = Brand<string, 'CacheKey'>

/**
 * 会话ID Branded Type
 */
export type SessionId = Brand<string, 'SessionId'>

/**
 * 时间戳 Branded Type
 */
export type Timestamp = Brand<number, 'Timestamp'>

/**
 * 持续时间 Branded Type
 */
export type Duration = Brand<number, 'Duration'>

/**
 * 创建 Branded Type
 */
export function brand<T, B>(value: T): Brand<T, B> {
  return value as Brand<T, B>
}

/**
 * 提取 Branded Type 的值
 */
export function unbrand<T, B>(value: Brand<T, B>): T {
  return value as T
}

/**
 * 类型窄化助手
 */
export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const isNull = (value: unknown): value is null => value === null
export const isUndefined = (value: unknown): value is undefined => value === undefined
export const isNullish = (value: unknown): value is null | undefined => value == null
export const isObject = (value: unknown): value is UnknownObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
export const isArray = Array.isArray
export const isFunction = (value: unknown): value is AnyFunction => typeof value === 'function'
export const isPromise = <T = unknown>(value: unknown): value is Promise<T> =>
  value instanceof Promise || (isObject(value) && isFunction((value as any).then))

/**
 * 类型断言助手
 */
export function assertString(value: unknown, name = 'value'): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(`Expected ${name} to be a string, got ${typeof value}`)
  }
}

export function assertNumber(value: unknown, name = 'value'): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(`Expected ${name} to be a number, got ${typeof value}`)
  }
}

export function assertObject(value: unknown, name = 'value'): asserts value is UnknownObject {
  if (!isObject(value)) {
    throw new TypeError(`Expected ${name} to be an object, got ${typeof value}`)
  }
}

export function assertFunction(value: unknown, name = 'value'): asserts value is AnyFunction {
  if (!isFunction(value)) {
    throw new TypeError(`Expected ${name} to be a function, got ${typeof value}`)
  }
}

/**
 * 安全的类型转换
 */
export function toNumber(value: unknown, defaultValue = 0): number {
  if (isNumber(value)) return value
  if (isString(value)) {
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }
  return defaultValue
}

export function toString(value: unknown, defaultValue = ''): string {
  if (isString(value)) return value
  if (isNullish(value)) return defaultValue
  return String(value)
}

export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value
  if (isString(value)) return value.toLowerCase() === 'true'
  return Boolean(value)
}

/**
 * 对象属性访问助手（类型安全）
 */
export function hasOwnProperty<T extends UnknownObject, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function getProperty<T extends UnknownObject, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  return hasOwnProperty(obj, key as string) ? obj[key] : undefined
}

export function getPropertyOrDefault<T extends UnknownObject, K extends keyof T, D>(
  obj: T,
  key: K,
  defaultValue: D
): T[K] | D {
  const value = getProperty(obj, key)
  return value !== undefined ? value : defaultValue
}

/**
 * 数组类型助手
 */
export function ensureArray<T>(value: T | T[]): T[] {
  return isArray(value) ? value : [value]
}

export function isArrayOf<T>(
  value: unknown,
  guard: TypeGuard<unknown, T>
): value is T[] {
  return isArray(value) && value.every(guard)
}

/**
 * 错误类型
 */
export class TypedError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: UnknownObject
  ) {
    super(message)
    this.name = 'TypedError'
  }
}

/**
 * 结果类型（类似 Rust 的 Result）
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }

export function Ok<T>(value: T): Result<T, never> {
  return { success: true, value }
}

export function Err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

export function isOk<T, E>(result: Result<T, E>): result is { success: true; value: T } {
  return result.success === true
}

export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}

/**
 * Option 类型（类似 Rust 的 Option）
 */
export type Option<T> = T | null | undefined

export function isSome<T>(value: Option<T>): value is T {
  return value != null
}

export function isNone<T>(value: Option<T>): value is null | undefined {
  return value == null
}

export function unwrap<T>(value: Option<T>, errorMessage = 'Unwrap failed'): T {
  if (isNone(value)) {
    throw new Error(errorMessage)
  }
  return value
}

export function unwrapOr<T>(value: Option<T>, defaultValue: T): T {
  return isSome(value) ? value : defaultValue
}

/**
 * 类型工具函数
 */
export const TypeUtils = {
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isObject,
  isArray,
  isFunction,
  isPromise,
  assertString,
  assertNumber,
  assertObject,
  assertFunction,
  toNumber,
  toString,
  toBoolean,
  hasOwnProperty,
  getProperty,
  getPropertyOrDefault,
  ensureArray,
  isArrayOf,
  isSome,
  isNone,
  unwrap,
  unwrapOr,
  Ok,
  Err,
  isOk,
  isErr
}

/**
 * 导出所有类型工具
 */
export default TypeUtils


