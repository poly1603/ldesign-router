/**
 * 路由服务容器实现
 * 
 * 参考 @ldesign/engine 的服务容器模式，为路由系统提供完整的依赖注入功能
 * 
 * @module router/container/router-service-container
 */

import type {
  RouterServiceContainer,
  RouterServiceIdentifier,
  RouterServiceDescriptor,
  RouterServiceProvider,
  Constructor,
  Factory,
  ResolveOptions,
  RouterServiceContainerStats,
} from './types'
import { RouterServiceLifetime } from './types'

/**
 * 路由服务实例类型
 */
type ServiceInstance = unknown

/**
 * 路由服务容器实现类
 * 
 * 特性:
 * - 支持三种生命周期: 单例、瞬态、作用域
 * - 支持构造函数、工厂函数和实例注册
 * - 循环依赖检测和错误提示
 * - 作用域隔离（用于导航上下文）
 * - 性能统计和监控
 * - 自动资源清理
 * 
 * @example
 * ```typescript
 * const container = new RouterServiceContainerImpl()
 * 
 * // 注册单例服务
 * container.singleton('matcher', MatcherRegistry)
 * 
 * // 注册工厂函数
 * container.singleton('cache', (c) => {
 *   const matcher = c.resolve('matcher')
 *   return new CacheManager(matcher)
 * })
 * 
 * // 解析服务
 * const matcher = container.resolve('matcher')
 * ```
 */
export class RouterServiceContainerImpl implements RouterServiceContainer {
  /** 服务描述符存储 */
  private descriptors = new Map<RouterServiceIdentifier, RouterServiceDescriptor>()

  /** 单例实例缓存 */
  private singletons = new Map<RouterServiceIdentifier, ServiceInstance>()

  /** 作用域实例缓存 */
  private scopedInstances = new Map<RouterServiceIdentifier, ServiceInstance>()

  /** 父容器（用于作用域） */
  private parent: RouterServiceContainerImpl | null = null

  /** 子容器列表（用于清理） */
  private children = new Set<RouterServiceContainerImpl>()

  /** 正在解析的服务集合（循环依赖检测） */
  private resolving = new Set<RouterServiceIdentifier>()

  /** 解析路径栈（详细的循环依赖信息） */
  private resolvingStack: RouterServiceIdentifier[] = []

  /** 性能统计: 服务解析计数 */
  private resolveCount = new Map<RouterServiceIdentifier, number>()

  /** 性能统计: 服务解析时间 */
  private resolveTimeStats = new Map<
    RouterServiceIdentifier,
    { totalTime: number; count: number }
  >()

  /** 服务提供者列表 */
  private providers: RouterServiceProvider[] = []

  /** 是否已销毁 */
  private disposed = false

  /**
   * 构造函数
   * 
   * @param parent - 父容器（用于创建作用域）
   */
  constructor(parent?: RouterServiceContainerImpl) {
    this.parent = parent || null
    if (this.parent) {
      this.parent.children.add(this)
    }
  }

  /**
   * 注册服务
   */
  register<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T> | T,
    lifetime: RouterServiceLifetime = RouterServiceLifetime.Singleton
  ): void {
    this.checkDisposed()

    const descriptor: RouterServiceDescriptor<T> = {
      identifier,
      implementation,
      lifetime,
      isFactory:
        typeof implementation === 'function' && !this.isConstructor(implementation),
    }

    this.descriptors.set(identifier, descriptor)
  }

  /**
   * 注册单例服务
   */
  singleton<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T> | T
  ): void {
    this.register(identifier, implementation, RouterServiceLifetime.Singleton)
  }

  /**
   * 注册瞬态服务
   */
  transient<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T>
  ): void {
    this.register(identifier, implementation, RouterServiceLifetime.Transient)
  }

  /**
   * 注册作用域服务
   */
  scoped<T>(
    identifier: RouterServiceIdentifier<T>,
    implementation: Constructor<T> | Factory<T>
  ): void {
    this.register(identifier, implementation, RouterServiceLifetime.Scoped)
  }

  /**
   * 解析服务
   */
  resolve<T>(
    identifier: RouterServiceIdentifier<T>,
    options?: ResolveOptions<T>
  ): T {
    this.checkDisposed()

    // 检查循环依赖
    if (this.resolving.has(identifier)) {
      const cycle = this.findCycle(identifier)
      throw new Error(
        `Circular dependency detected in router services: ${cycle
          .map((id) => String(id))
          .join(' → ')}`
      )
    }

    // 查找服务描述符
    const descriptor = this.findDescriptor(identifier)

    if (!descriptor) {
      if (options?.optional) {
        return options.defaultValue as T
      }
      throw new Error(`Router service "${String(identifier)}" not registered`)
    }

    // 标记为正在解析
    this.resolving.add(identifier)
    this.resolvingStack.push(identifier)

    // 性能监控
    const startTime = performance.now()

    try {
      const result = this.resolveDescriptor(descriptor, options) as T

      // 更新统计
      this.updateResolveStats(identifier, startTime)

      return result
    } finally {
      // 解析完成，移除标记
      this.resolving.delete(identifier)
      this.resolvingStack.pop()
    }
  }

  /**
   * 异步解析服务
   */
  async resolveAsync<T>(
    identifier: RouterServiceIdentifier<T>,
    options?: ResolveOptions<T>
  ): Promise<T> {
    this.checkDisposed()

    // 检查循环依赖
    if (this.resolving.has(identifier)) {
      const cycle = this.findCycle(identifier)
      throw new Error(
        `Circular dependency detected in router services: ${cycle
          .map((id) => String(id))
          .join(' → ')}`
      )
    }

    // 查找服务描述符
    const descriptor = this.findDescriptor(identifier)

    if (!descriptor) {
      if (options?.optional) {
        return options.defaultValue as T
      }
      throw new Error(`Router service "${String(identifier)}" not registered`)
    }

    // 标记为正在解析
    this.resolving.add(identifier)
    this.resolvingStack.push(identifier)

    try {
      return (await this.resolveDescriptorAsync(descriptor, options)) as T
    } finally {
      // 解析完成，移除标记
      this.resolving.delete(identifier)
      this.resolvingStack.pop()
    }
  }

  /**
   * 检查服务是否已注册
   */
  has<T>(identifier: RouterServiceIdentifier<T>): boolean {
    if (this.descriptors.has(identifier)) {
      return true
    }

    // 检查父容器
    if (this.parent) {
      return this.parent.has(identifier)
    }

    return false
  }

  /**
   * 注册服务提供者
   */
  async addProvider(provider: RouterServiceProvider): Promise<void> {
    this.checkDisposed()

    this.providers.push(provider)

    // 按优先级排序
    this.providers.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // 注册服务
    await provider.register(this)

    // 启动服务
    if (provider.boot) {
      await provider.boot(this)
    }
  }

  /**
   * 创建导航作用域
   */
  createScope(): RouterServiceContainer {
    this.checkDisposed()
    return new RouterServiceContainerImpl(this)
  }

  /**
   * 清理容器
   */
  clear(): void {
    this.descriptors.clear()
    this.singletons.clear()
    this.scopedInstances.clear()
    this.resolving.clear()
    this.resolvingStack = []
    this.resolveCount.clear()
    this.resolveTimeStats.clear()
  }

  /**
   * 销毁容器
   */
  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    // 销毁所有子容器
    for (const child of this.children) {
      child.dispose()
    }
    this.children.clear()

    // 清理服务提供者
    for (const provider of this.providers) {
      if (provider.dispose) {
        void provider.dispose()
      }
    }
    this.providers = []

    // 清理所有资源
    this.clear()

    // 从父容器中移除
    if (this.parent) {
      this.parent.children.delete(this)
      this.parent = null
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): RouterServiceContainerStats {
    let totalResolves = 0
    const services: Array<{
      identifier: string
      count: number
      avgTime: number
    }> = []

    // 统计所有服务的解析次数和平均时间
    this.resolveCount.forEach((count, identifier) => {
      totalResolves += count
      const timeStats = this.resolveTimeStats.get(identifier)
      const avgTime = timeStats ? timeStats.totalTime / timeStats.count : 0
      services.push({
        identifier: String(identifier),
        count,
        avgTime,
      })
    })

    // 按解析次数排序
    const topServices = [...services]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 按平均时间排序
    const slowestServices = [...services]
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)

    return {
      totalResolves,
      topServices,
      slowestServices,
      serviceCount: this.descriptors.size,
      scopeCount: this.children.size,
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 检查容器是否已销毁
   */
  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error('Router service container has been disposed')
    }
  }

  /**
   * 查找服务描述符
   */
  private findDescriptor(
    identifier: RouterServiceIdentifier
  ): RouterServiceDescriptor | undefined {
    // 先查找当前容器
    const descriptor = this.descriptors.get(identifier)
    if (descriptor) {
      return descriptor
    }

    // 查找父容器
    if (this.parent) {
      return this.parent.findDescriptor(identifier)
    }

    return undefined
  }

  /**
   * 解析服务描述符
   */
  private resolveDescriptor<T>(
    descriptor: RouterServiceDescriptor<T>,
    options?: ResolveOptions<T>
  ): T {
    const { identifier, implementation, lifetime, isFactory } = descriptor

    // 处理单例
    if (lifetime === RouterServiceLifetime.Singleton) {
      const cached = this.getSingleton(identifier)
      if (cached) {
        return cached as T
      }

      const instance = this.createInstance(implementation, isFactory)
      this.setSingleton(identifier, instance as ServiceInstance)
      return instance
    }

    // 处理作用域服务
    if (lifetime === RouterServiceLifetime.Scoped) {
      if (this.scopedInstances.has(identifier)) {
        return this.scopedInstances.get(identifier) as T
      }

      const instance = this.createInstance(implementation, isFactory)
      this.scopedInstances.set(identifier, instance as ServiceInstance)
      return instance
    }

    // 处理瞬态服务
    return this.createInstance(implementation, isFactory)
  }

  /**
   * 异步解析服务描述符
   */
  private async resolveDescriptorAsync<T>(
    descriptor: RouterServiceDescriptor<T>,
    options?: ResolveOptions<T>
  ): Promise<T> {
    const { identifier, implementation, lifetime, isFactory } = descriptor

    // 处理单例
    if (lifetime === RouterServiceLifetime.Singleton) {
      const cached = this.getSingleton(identifier)
      if (cached) {
        return cached as T
      }

      const instance = await this.createInstanceAsync(implementation, isFactory)
      this.setSingleton(identifier, instance as ServiceInstance)
      return instance
    }

    // 处理作用域服务
    if (lifetime === RouterServiceLifetime.Scoped) {
      if (this.scopedInstances.has(identifier)) {
        return this.scopedInstances.get(identifier) as T
      }

      const instance = await this.createInstanceAsync(implementation, isFactory)
      this.scopedInstances.set(identifier, instance as ServiceInstance)
      return instance
    }

    // 处理瞬态服务
    return await this.createInstanceAsync(implementation, isFactory)
  }

  /**
   * 创建服务实例
   */
  private createInstance<T>(
    implementation: Constructor<T> | Factory<T> | T,
    isFactory?: boolean
  ): T {
    // 如果是值类型，直接返回
    if (!isFactory && typeof implementation !== 'function') {
      return implementation as T
    }

    // 如果是工厂函数
    if (isFactory) {
      return (implementation as Factory<T>)(this) as T
    }

    // 如果是构造函数
    const ctor = implementation as Constructor<T>
    return new ctor()
  }

  /**
   * 异步创建服务实例
   */
  private async createInstanceAsync<T>(
    implementation: Constructor<T> | Factory<T> | T,
    isFactory?: boolean
  ): Promise<T> {
    // 如果是值类型，直接返回
    if (!isFactory && typeof implementation !== 'function') {
      return implementation as T
    }

    // 如果是工厂函数
    if (isFactory) {
      return await (implementation as Factory<T>)(this)
    }

    // 如果是构造函数
    const ctor = implementation as Constructor<T>
    return new ctor()
  }

  /**
   * 获取单例实例
   */
  private getSingleton(
    identifier: RouterServiceIdentifier
  ): ServiceInstance | undefined {
    // 查找当前容器
    if (this.singletons.has(identifier)) {
      return this.singletons.get(identifier)
    }

    // 查找父容器
    if (this.parent) {
      return this.parent.getSingleton(identifier)
    }

    return undefined
  }

  /**
   * 设置单例实例
   */
  private setSingleton(
    identifier: RouterServiceIdentifier,
    instance: ServiceInstance
  ): void {
    // 单例总是存储在最顶层容器
    if (this.parent) {
      this.parent.setSingleton(identifier, instance)
    } else {
      this.singletons.set(identifier, instance)
    }
  }

  /**
   * 检查是否为构造函数
   */
  private isConstructor(fn: unknown): boolean {
    try {
      return !!(fn as any).prototype && !!(fn as any).prototype.constructor
    } catch {
      return false
    }
  }

  /**
   * 查找循环依赖路径
   */
  private findCycle(identifier: RouterServiceIdentifier): RouterServiceIdentifier[] {
    const firstIndex = this.resolvingStack.indexOf(identifier)

    if (firstIndex === -1) {
      return [identifier]
    }

    const cycle = this.resolvingStack.slice(firstIndex)
    cycle.push(identifier)
    return cycle
  }

  /**
   * 更新解析统计信息
   */
  private updateResolveStats(
    identifier: RouterServiceIdentifier,
    startTime: number
  ): void {
    // 更新解析计数
    const count = this.resolveCount.get(identifier) || 0
    this.resolveCount.set(identifier, count + 1)

    // 更新时间统计
    const duration = performance.now() - startTime
    const timeStats = this.resolveTimeStats.get(identifier)

    if (timeStats) {
      timeStats.totalTime += duration
      timeStats.count += 1
    } else {
      this.resolveTimeStats.set(identifier, {
        totalTime: duration,
        count: 1,
      })
    }
  }
}

/**
 * 创建路由服务容器
 * 
 * @returns 新的路由服务容器实例
 * 
 * @example
 * ```typescript
 * const container = createRouterServiceContainer()
 * 
 * // 注册服务
 * container.singleton('matcher', MatcherRegistry)
 * 
 * // 解析服务
 * const matcher = container.resolve('matcher')
 * ```
 */
export function createRouterServiceContainer(): RouterServiceContainer {
  return new RouterServiceContainerImpl()
}
