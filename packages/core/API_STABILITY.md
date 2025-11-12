# Core API 稳定性保证

> 📅 固化日期: 2025-11-11
> 
> 🔒 状态: **STABLE** - 以下 API 已固化，保证向后兼容

---

## 📜 稳定性承诺

### 承诺内容

1. **语义化版本控制**
   - 遵循 [SemVer 2.0.0](https://semver.org/)
   - 主版本号变更才会引入破坏性变更
   - 次版本号变更仅添加新功能（向后兼容）
   - 修订号变更仅修复 bug（向后兼容）

2. **弃用策略**
   - 任何 API 弃用至少保留 1 个主版本周期
   - 弃用 API 会标记 `@deprecated` 并在文档中说明
   - 提供迁移指南和替代方案

3. **变更流程**
   - 重大变更需要经过 RFC 流程
   - 提前至少 3 个月通知
   - 提供自动化迁移工具（如可能）

---

## 🔒 稳定 API 列表

### 1. 核心类型 (`types/`)

#### 1.1 基础类型 (`types/base.ts`)

**✅ STABLE**

```typescript
// 路由参数
export type RouteParams = Record<string, string | string[]>

// 查询参数
export type RouteQuery = Record<string, string | string[] | null | undefined>

// 路由元信息
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  icon?: string
  keepAlive?: boolean
  hidden?: boolean
  supportedDevices?: string[]
  unsupportedMessage?: string
  unsupportedRedirect?: string
  transition?: string
  [key: string]: unknown
}

// 类型推导
export type ExtractRouteParams<T extends string>
export type RouteParamsFor<T extends string>
export type TypedRouteParams<T>
export type TypedRouteQuery<T>
```

**保证**:
- ✅ 类型结构不会改变
- ✅ 现有字段不会删除
- ✅ 可以添加新的可选字段

#### 1.2 导航类型 (`types/navigation.ts`)

**✅ STABLE**

```typescript
// 路由位置
export interface RouteLocationBase {
  path: string
  name?: string | symbol
  params: RouteParams
  query: RouteQuery
  hash: string
  meta: RouteMeta
}

export interface RouteLocationNormalized extends RouteLocationBase {
  fullPath: string
  matched: RouteRecordNormalized[]
  redirectedFrom?: RouteLocationNormalized
}

export type RouteLocationRaw = string | {
  path?: string
  name?: string | symbol
  params?: RouteParams
  query?: RouteQuery
  hash?: string
  replace?: boolean
}

// 路由记录
export interface RouteRecordRaw extends RouteRecordBase {
  component?: Component
  components?: Record<string, Component>
  deviceComponents?: Record<string, Component>
  props?: boolean | Record<string, unknown> | ((route: RouteLocationNormalized) => Record<string, unknown>)
  beforeEnter?: NavigationGuard | NavigationGuard[]
  [key: string]: unknown
}

export interface RouteRecordNormalized extends RouteRecordBase {
  components: Record<string, Component>
  children: RouteRecordNormalized[]
  props: Record<string, boolean | Record<string, unknown> | ((route: RouteLocationNormalized) => Record<string, unknown>)>
  beforeEnter?: NavigationGuard
  aliasOf?: RouteRecordNormalized
  parent?: RouteRecordNormalized
}

// 导航守卫
export interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean): void
  (cb: NavigationGuardNextCallback): void
}

export type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => NavigationGuardReturn | Promise<NavigationGuardReturn>

export type NavigationHookAfter = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => void | Promise<void>

export enum NavigationFailureType {
  aborted = 'aborted',
  cancelled = 'cancelled',
  duplicated = 'duplicated'
}

export interface NavigationFailure {
  type: NavigationFailureType
  from: RouteLocationNormalized
  to: RouteLocationNormalized
}
```

**保证**:
- ✅ 接口结构稳定
- ✅ 所有必需字段保持不变
- ✅ 可以添加新的可选字段

#### 1.3 历史类型 (`types/history.ts`)

**✅ STABLE**

```typescript
export interface HistoryLocation {
  path: string
  hash?: string
  state?: HistoryState
}

export type HistoryState = Record<string, unknown>

export enum NavigationType {
  pop = 'pop',
  push = 'push',
  replace = 'replace'
}

export type NavigationDirection = 'forward' | 'back' | 'unknown'

export interface NavigationInformation {
  type: NavigationType
  direction: NavigationDirection
  delta: number
}

export type NavigationCallback = (
  to: HistoryLocation,
  from: HistoryLocation | null,
  information: NavigationInformation
) => void

export interface RouterHistory {
  readonly location: HistoryLocation
  readonly state: HistoryState
  
  push(to: string, state?: HistoryState): void
  replace(to: string, state?: HistoryState): void
  go(delta: number): void
  back(): void
  forward(): void
  
  listen(callback: NavigationCallback): () => void
  destroy(): void
}
```

**保证**:
- ✅ 接口方法签名不变
- ✅ 枚举值不会删除
- ✅ 行为保持一致

---

### 2. 核心路由器 (`router/`)

#### 2.1 Router 类 (`router/router.ts`)

**✅ STABLE**

```typescript
export interface RouterOptions {
  routes: RouteRecordRaw[]
  history: RouterHistory
  scrollBehavior?: ScrollStrategy
  enableCache?: boolean
  cacheSize?: number
  guardTimeout?: number
  strict?: boolean
}

export class Router {
  // 导航方法
  push(to: RouteLocationRaw, options?: NavigationOptions): Promise<void>
  replace(to: RouteLocationRaw, options?: NavigationOptions): Promise<void>
  back(): void
  forward(): void
  go(delta: number): void
  
  // 守卫注册
  beforeEach(guard: Guard): () => void
  afterEach(hook: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void): () => void
  
  // 路由管理
  addRoute(route: RouteRecordRaw): void
  removeRoute(name: string | symbol): void
  getRoutes(): RouteRecordRaw[]
  hasRoute(name: string | symbol): boolean
  
  // 状态访问
  get current(): RouteLocationNormalized
  get ready(): boolean
  isReadyAsync(): Promise<void>
  
  // 工具方法
  resolve(to: RouteLocationRaw): RouteLocationNormalized
  getCacheStats(): CacheStats
  clearCache(): void
  getGuardStats(): GuardStats
  
  // 错误处理
  onError(handler: (error: Error) => void): () => void
  
  // 事件系统
  on(event: RouterEventType, handler: EventHandler): () => void
  
  // 销毁
  destroy(): void
}

export function createRouter(options: RouterOptions): Router
```

**保证**:
- ✅ 所有公共方法签名稳定
- ✅ 方法行为保持一致
- ✅ 返回值类型不变

---

### 3. 历史管理 (`history/`)

#### 3.1 历史工厂函数

**✅ STABLE**

```typescript
// HTML5 History
export function createWebHistory(base?: string): RouterHistory

// Hash History
export function createWebHashHistory(base?: string): RouterHistory

// Memory History
export function createMemoryHistory(base?: string): RouterHistory

// 增强 History
export interface AdvancedHistoryOptions {
  maxSize?: number
  enablePersistence?: boolean
  persistenceKey?: string
  enableInterceptors?: boolean
}

export function createAdvancedHistory(
  base?: string,
  options?: AdvancedHistoryOptions
): RouterHistory
```

**保证**:
- ✅ 工厂函数签名稳定
- ✅ 返回的 History 实例符合 RouterHistory 接口
- ✅ 行为一致性

---

### 4. 工具函数 (`utils/`)

#### 4.1 路径处理 (`utils/path.ts`)

**✅ STABLE**

```typescript
export function normalizePath(path: string): string
export function joinPaths(...paths: string[]): string
export function buildPath(path: string, params: RouteParams): string
export function parsePathParams(path: string): string[]
export function extractParamNames(path: string): string[]
export function normalizeParams(params: RouteParams): RouteParams
```

#### 4.2 查询处理 (`utils/query.ts`)

**✅ STABLE**

```typescript
export function parseQuery(search: string): RouteQuery
export function stringifyQuery(query: RouteQuery): string
export function mergeQuery(a: RouteQuery, b: RouteQuery): RouteQuery
export function normalizeQuery(query: RouteQuery): RouteQuery
```

#### 4.3 URL 处理 (`utils/url.ts`)

**✅ STABLE**

```typescript
export interface ParsedURL {
  path: string
  query: RouteQuery
  hash: string
}

export function parseURL(url: string): ParsedURL
export function stringifyURL(url: ParsedURL): string
export function normalizeURL(url: string): string
export function isSameURL(a: string, b: string): boolean
```

#### 4.4 路径匹配 (`utils/matcher.ts`)

**✅ STABLE**

```typescript
export interface MatchResult {
  matched: boolean
  params: RouteParams
  score: number
  segments: number
}

export interface MatcherOptions {
  enableCache?: boolean
  cacheSize?: number
}

export class PathMatcher {
  constructor(pattern: string)
  match(path: string): MatchResult
  getPattern(): string
  getParamNames(): string[]
  getScore(): number
}

export class MatcherRegistry {
  constructor(options?: MatcherOptions)
  addRoute(path: string, route: RouteRecord): void
  removeRoute(path: string): void
  match(path: string): MatchResult
  getPatterns(): string[]
  has(path: string): boolean
  clear(): void
  get size(): number
}

export function createMatcher(pattern: string): PathMatcher
export function createMatcherRegistry(options?: MatcherOptions): MatcherRegistry
export function matchPath(patterns: string[], path: string): { pattern: string; result: MatchResult } | null
export function isMatch(pattern: string, path: string): boolean
export function extractParams(pattern: string, path: string): RouteParams | null
export function compareMatchResults(a: MatchResult, b: MatchResult): number
```

**保证**:
- ✅ 所有工具函数签名稳定
- ✅ 返回值类型不变
- ✅ 行为一致性

---

### 5. 错误处理 (`utils/errors.ts`)

**✅ STABLE**

```typescript
export enum RouterErrorCode {
  NAVIGATION_CANCELLED = 'ERR_NAVIGATION_CANCELLED',
  NAVIGATION_ABORTED = 'ERR_NAVIGATION_ABORTED',
  NAVIGATION_DUPLICATED = 'ERR_NAVIGATION_DUPLICATED',
  NAVIGATION_FAILED = 'ERR_NAVIGATION_FAILED',
  GUARD_REJECTED = 'ERR_GUARD_REJECTED',
  GUARD_ERROR = 'ERR_GUARD_ERROR',
  GUARD_TIMEOUT = 'ERR_GUARD_TIMEOUT',
  NO_MATCH = 'ERR_NO_MATCH',
  INVALID_PARAMS = 'ERR_INVALID_PARAMS',
  INVALID_PATH = 'ERR_INVALID_PATH',
  INVALID_ROUTE_CONFIG = 'ERR_INVALID_ROUTE_CONFIG',
  DUPLICATE_ROUTE = 'ERR_DUPLICATE_ROUTE',
  MISSING_REQUIRED_FIELD = 'ERR_MISSING_REQUIRED_FIELD',
  COMPONENT_LOAD_FAILED = 'ERR_COMPONENT_LOAD_FAILED',
  COMPONENT_NOT_FOUND = 'ERR_COMPONENT_NOT_FOUND',
  HISTORY_NOT_SUPPORTED = 'ERR_HISTORY_NOT_SUPPORTED',
  HISTORY_OPERATION_FAILED = 'ERR_HISTORY_OPERATION_FAILED'
}

export class RouterError extends Error {
  type: RouterErrorType
  code: RouterErrorCode | string
  details?: unknown
  timestamp: number
  recoverable: boolean
  
  toJSON(): Record<string, unknown>
}

export class NavigationError extends RouterError
export class GuardError extends RouterError
export class MatcherError extends RouterError
export class ConfigError extends RouterError
export class ComponentError extends RouterError
export class HistoryError extends RouterError

// 工厂函数
export function createNavigationCancelledError(to, from): NavigationError
export function createNavigationAbortedError(to, from): NavigationError
export function createNavigationDuplicatedError(to, from): NavigationError
export function createGuardError(name, error): GuardError
export function createGuardTimeoutError(name, timeout): GuardError
export function createNoMatchError(path): MatcherError
// ... 更多工厂函数
```

**保证**:
- ✅ 错误码不会删除
- ✅ 错误类结构稳定
- ✅ 工厂函数签名不变

---

### 6. 增强功能 (`features/`)

#### 6.1 守卫管理 (`features/guards.ts`)

**✅ STABLE**

```typescript
export interface GuardManagerOptions {
  timeout?: number
  stopOnError?: boolean
  onError?: (error: RouterError) => void
}

export class GuardManager {
  constructor(options?: GuardManagerOptions)
  
  beforeEach(guard: Guard, options?: GuardOptions): () => void
  afterEach(hook: AfterHook, options?: GuardOptions): () => void
  beforeEnter(guard: Guard, options?: GuardOptions): () => void
  beforeRouteEnter(guard: Guard, options?: GuardOptions): () => void
  beforeRouteUpdate(guard: Guard, options?: GuardOptions): () => void
  beforeRouteLeave(guard: Guard, options?: GuardOptions): () => void
  
  runBeforeGuards(to, from): Promise<GuardResult>
  runAfterHooks(to, from): Promise<void>
  
  getGuards(type?: GuardType): GuardRegistration[]
  getGuardCount(type?: GuardType): number
  clear(type?: GuardType): void
  destroy(): void
}

export function createGuardManager(options?: GuardManagerOptions): GuardManager
export function composeGuards(...guards: Guard[]): Guard
export function conditionalGuard(condition, guard): Guard
export function pathGuard(pattern, guard): Guard
export function nameGuard(names, guard): Guard
export function metaGuard(key, value, guard): Guard
```

**保证**:
- ✅ API 签名稳定
- ✅ 守卫执行顺序不变
- ✅ 行为一致性

---

## 🔄 半稳定 API

以下 API 处于半稳定状态，可能在次版本中有所调整（向后兼容）：

### 1. 高级功能

- ✨ **插件系统** (`router/plugin.ts`) - 可能添加新的钩子
- ✨ **链式 API** (`router/chainable.ts`) - 可能添加新的链式方法
- ✨ **Promise API** (`router/promise.ts`) - 可能添加新的工具函数
- ✨ **性能监控** (`features/performance.ts`) - 可能调整监控指标
- ✨ **缓存管理** (`features/cache.ts`, `features/match-cache.ts`) - 可能优化缓存策略

### 2. 实验性功能

- 🧪 **SSR 支持** (`features/ssr.ts`) - API 可能变化
- 🧪 **分析统计** (`features/analytics.ts`) - API 可能变化
- 🧪 **优化工具** (`utils/optimization.ts`) - API 可能变化

---

## 📝 版本计划

### v1.0.0 (当前)
- ✅ 核心 API 固化
- ✅ 基础功能完善
- ✅ 文档完整

### v1.x.x (维护期)
- 🐛 Bug 修复
- 📚 文档改进
- ⚡ 性能优化（不改变 API）

### v2.0.0 (未来)
- 🚀 重大新功能
- 🔄 API 优化（可能有破坏性变更）
- 📖 完整的迁移指南

---

## 🛡️ 兼容性保证

### 支持的环境

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0
- **浏览器**: 现代浏览器（ES2015+）

### 依赖稳定性

- `mitt`: ^3.0.1 (事件发射器)
- `nanoid`: ^5.0.9 (ID 生成)

**承诺**: 依赖库的主版本变更会谨慎处理，确保向后兼容。

---

## 📖 使用建议

### 1. 使用稳定 API

✅ **推荐**: 在生产环境中只使用标记为 STABLE 的 API

```typescript
import { 
  createRouter, 
  createWebHistory,
  type RouteRecordRaw 
} from '@ldesign/router-core'

// 这些 API 是稳定的
const router = createRouter({
  history: createWebHistory(),
  routes: [/* ... */]
})
```

### 2. 谨慎使用实验性功能

⚠️ **注意**: 实验性功能可能在次版本中变化

```typescript
import { createSSRManager } from '@ldesign/router-core'

// 🧪 实验性功能，API 可能变化
const ssrManager = createSSRManager(/* ... */)
```

### 3. 关注变更日志

📰 **建议**: 升级前阅读 CHANGELOG.md

---

## 🤝 反馈机制

如果你发现 API 设计问题或有改进建议：

1. 📧 提交 Issue: 描述问题和建议
2. 💬 参与讨论: RFC 流程
3. 🔧 提交 PR: 改进实现

---

## 📜 法律声明

本文档构成 @ldesign/router-core 的 API 稳定性承诺的一部分。
虽然我们会尽最大努力遵守承诺，但在极端情况下（如安全漏洞）
可能需要紧急修改 API。此类情况会通过安全公告提前通知。

---

**最后更新**: 2025-11-11

**维护者**: @ldesign-team
