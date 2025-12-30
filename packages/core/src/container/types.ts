/**
 * 路由服务容器类型定义
 * 
 * 基于 @ldesign/engine 的服务容器模式，为路由系统提供依赖注入支持
 * 
 * @module router/container/types
 */

/**
 * 路由服务标识符
 */
export type RouterServiceIdentifier<T = unknown> = string | symbol | Constructor<T>

/**
 * 构造函数类型
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T

/**
 * 工厂函数类型
 */
export type Factory<T = unknown> = (container: RouterServiceContainer) => T | Promise<T>

/**
 * 路由服务生命周期
 */
export enum RouterServiceLifetime {
  /** 单例 - 整个路由器生命周期只创建一次 */
  Singleton = 'singleton',
  /** 瞬态 - 每次请求都创建新实例 */
  Transient = 'transient',
  /** 作用域 - 在同一导航作用域内共享实例 */
  Scoped = 'scoped',
}

/**
 * 路由服务描述符
 */
export interface RouterServiceDescriptor<T = unknown> {
  /** 服务标识 */
  identifier: RouterServiceIdentifier<T>
  /** 服务实现 */
  implementation: Constructor<T> | Factory<T> | T
  /** 生命周期 */
  lifetime: RouterServiceLifetime
  /** 是否为工厂函数 */
  isFactory?: boolean
  /** 服务元数据 */
  metadata?: Record<string, unknown>
  /** 依赖服务列表 */
  dependencies?: RouterServiceIdentifier[]
}

/**
 * 服务解析选项
 */
export interface ResolveOptions<T = unknown> {
  /** 是否为可选依赖 */
  optional?: boolean
  /** 默认值（当服务不存在时） */
  defaultValue?: T
  /** 是否允许多个实例 */
  multiple?: boolean
}

/**
 * 路由服务提供者
 */
export interface RouterServiceProvider {
  /** 提供者名称 */
  name: string
  /** 优先级（越大越优先） */
  priority?: number
  /** 注册服务 */
  register(container: RouterServiceContainer): void | Promise<void>
  /** 启动服务 */
  boot?(container: RouterServiceContainer): void | Promise<void>
  /** 清理资源 */
  dispose?(): void | Promise<void>
}

/**
 * 路由服务容器接口
 */
export interface RouterServiceContainer {
  /**
   * 注册服务
   */
  register<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T> | T,
    lifetime?: RouterServiceLifetime
  ): void

  /**
   * 注册单例服务
   */
  singleton<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T> | T
  ): void

  /**
   * 注册瞬态服务
   */
  transient<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T>
  ): void

  /**
   * 注册作用域服务
   */
  scoped<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T>
  ): void

  /**
   * 解析服务
   */
  resolve<T>(
    identifier: RouterServiceIdentifier<T>,
    options?: ResolveOptions<T>
  ): T

  /**
   * 异步解析服务
   */
  resolveAsync<T>(
    identifier: RouterServiceIdentifier<T>,
    options?: ResolveOptions<T>
  ): Promise<T>

  /**
   * 检查服务是否已注册
   */
  has<T>(identifier: RouterServiceIdentifier<T>): boolean

  /**
   * 注册服务提供者
   */
  addProvider(provider: RouterServiceProvider): Promise<void>

  /**
   * 创建导航作用域
   */
  createScope(): RouterServiceContainer

  /**
   * 清理容器
   */
  clear(): void

  /**
   * 销毁容器
   */
  dispose(): void

  /**
   * 获取解析统计
   */
  getStats(): RouterServiceContainerStats
}

/**
 * 容器统计信息
 */
export interface RouterServiceContainerStats {
  /** 总解析次数 */
  totalResolves: number
  /** 最热门服务 */
  topServices: Array<{
    identifier: string
    count: number
    avgTime: number
  }>
  /** 最慢服务 */
  slowestServices: Array<{
    identifier: string
    avgTime: number
    count: number
  }>
  /** 服务数量 */
  serviceCount: number
  /** 作用域数量 */
  scopeCount: number
}

/**
 * 内置路由服务标识符
 */
export const ROUTER_SERVICES = {
  /** 路由匹配器 */
  MATCHER: Symbol('router:matcher'),
  /** 路由缓存管理器 */
  CACHE_MANAGER: Symbol('router:cache-manager'),
  /** 守卫管理器 */
  GUARD_MANAGER: Symbol('router:guard-manager'),
  /** 滚动管理器 */
  SCROLL_MANAGER: Symbol('router:scroll-manager'),
  /** 错误管理器 */
  ERROR_MANAGER: Symbol('router:error-manager'),
  /** 性能监控器 */
  PERFORMANCE_MONITOR: Symbol('router:performance-monitor'),
  /** 内存管理器 */
  MEMORY_MANAGER: Symbol('router:memory-manager'),
  /** 别名管理器 */
  ALIAS_MANAGER: Symbol('router:alias-manager'),
  /** 标准化器 */
  NORMALIZER: Symbol('router:normalizer'),
  /** 历史管理器 */
  HISTORY: Symbol('router:history'),
  /** 插件管理器 */
  PLUGIN_MANAGER: Symbol('router:plugin-manager'),
  /** 中间件管理器 */
  MIDDLEWARE_MANAGER: Symbol('router:middleware-manager'),
} as const
