# 路由优化快速集成指南

本指南将帮助您快速集成刚刚实现的路由优化功能。

## 1. 新增功能概览

### ✅ 已完成
- **服务容器系统** (`container/`): 完整的依赖注入支持
- **高级性能监控** (`features/advanced-performance.ts`): 多维度性能跟踪

### 📝 待集成
- **中间件系统**: 需要创建 `features/middleware.ts`
- **Router类增强**: 需要修改 `router/router.ts` 集成服务容器

## 2. 立即可用的功能

### 2.1 使用服务容器

```typescript
import { 
  createRouterServiceContainer,
  ROUTER_SERVICES,
  RouterServiceLifetime 
} from '@ldesign/router-core/container'

// 创建容器
const container = createRouterServiceContainer()

// 注册服务
container.singleton(ROUTER_SERVICES.MATCHER, (c) => {
  return createMatcherRegistry({
    enableCache: true,
    cacheSize: 1000
  })
})

// 解析服务
const matcher = container.resolve(ROUTER_SERVICES.MATCHER)

// 创建作用域
const scope = container.createScope()
// ... 使用作用域服务
scope.dispose() // 清理

// 获取统计
const stats = container.getStats()
console.log('服务统计:', stats)
```

### 2.2 使用高级性能监控

```typescript
import { createAdvancedPerformanceMonitor } from '@ldesign/router-core'

// 创建监控器
const perfMonitor = createAdvancedPerformanceMonitor({
  thresholds: {
    navigation: 100,  // 导航超过 100ms 告警
    match: 10,        // 匹配超过 10ms 告警
    guard: 50         // 守卫超过 50ms 告警
  },
  sampleRate: 1.0,    // 100% 采样（开发环境）
  detailed: true
})

// 在路由导航后记录性能
router.afterEach((to, from) => {
  const metrics = {
    resolveTime: 5,
    matchTime: 3,
    guardTime: 20,
    totalTime: 28,
    cacheHit: true
  }
  
  perfMonitor.recordNavigation(to.path, metrics)
})

// 获取性能报告
console.log(perfMonitor.getReport())

// 获取统计信息
const stats = perfMonitor.getStats()
console.log(`平均导航时间: ${stats.avgNavigationTime}ms`)
console.log(`缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`)
```

## 3. 增强现有Router（推荐）

修改 `packages/core/src/router/router.ts`：

```typescript
import { 
  createRouterServiceContainer, 
  ROUTER_SERVICES,
  type RouterServiceContainer 
} from '../container'
import { createAdvancedPerformanceMonitor } from '../features/advanced-performance'

export class Router {
  // 添加服务容器
  private container: RouterServiceContainer
  private perfMonitor?: AdvancedPerformanceMonitor

  constructor(options: RouterOptions) {
    this.history = options.history
    this.routes = options.routes
    this.useTrie = options.useTrie ?? false

    // 1. 创建服务容器
    this.container = createRouterServiceContainer()

    // 2. 注册核心服务
    this.registerCoreServices(options)

    // 3. 从容器解析服务（保持现有逻辑）
    if (this.useTrie) {
      this.matcher = this.container.resolve(ROUTER_SERVICES.MATCHER)
    } else {
      this.matcher = createMatcherRegistry({
        enableCache: options.enableCache !== false,
        cacheSize: options.cacheSize || 1000,
      })
      // 手动注册到容器
      this.container.singleton(ROUTER_SERVICES.MATCHER, this.matcher)
    }

    // 解析其他服务
    this.errorManager = this.container.resolve(ROUTER_SERVICES.ERROR_MANAGER)
    this.normalizer = this.container.resolve(ROUTER_SERVICES.NORMALIZER)
    this.cacheManager = this.container.resolve(ROUTER_SERVICES.CACHE_MANAGER)
    this.guardManager = this.container.resolve(ROUTER_SERVICES.GUARD_MANAGER)
    this.scrollManager = this.container.resolve(ROUTER_SERVICES.SCROLL_MANAGER)
    this.aliasManager = this.container.resolve(ROUTER_SERVICES.ALIAS_MANAGER)

    // 4. 初始化性能监控
    if (options.enablePerformanceMonitor) {
      this.perfMonitor = this.container.resolve(ROUTER_SERVICES.PERFORMANCE_MONITOR)
    }

    // 其余初始化逻辑保持不变...
    this.initializeRoutes()
    this.currentRoute = this.createInitialRoute()
    this.setupHistoryListener()
  }

  /**
   * 注册核心服务到容器
   */
  private registerCoreServices(options: RouterOptions): void {
    const { container } = this

    // 匹配器（单例）
    if (options.useTrie) {
      container.singleton(ROUTER_SERVICES.MATCHER, () => {
        return createTrieRouterMatcher({
          enableCache: options.enableCache !== false,
          cacheSize: options.cacheSize || 1000,
          enableStats: options.enableMatchStats ?? false,
        })
      })
    }

    // 错误管理器（单例）
    container.singleton(ROUTER_SERVICES.ERROR_MANAGER, () => {
      return createErrorManager()
    })

    // 标准化器（单例）
    container.singleton(ROUTER_SERVICES.NORMALIZER, () => {
      return createNormalizer({ strict: options.strict })
    })

    // 缓存管理器（单例）
    container.singleton(ROUTER_SERVICES.CACHE_MANAGER, () => {
      return createMatchCacheManager({
        maxSize: options.cacheSize || 1000,
        enableStats: true,
      })
    })

    // 守卫管理器（单例）
    container.singleton(ROUTER_SERVICES.GUARD_MANAGER, () => {
      return createGuardManager({
        timeout: options.guardTimeout || 10000,
      })
    })

    // 滚动管理器（单例）
    container.singleton(ROUTER_SERVICES.SCROLL_MANAGER, () => {
      return createScrollManager({
        strategy: options.scrollBehavior,
      })
    })

    // 别名管理器（单例）
    container.singleton(ROUTER_SERVICES.ALIAS_MANAGER, () => {
      return createAliasManager()
    })

    // 性能监控器（单例）
    if (options.enablePerformanceMonitor) {
      container.singleton(ROUTER_SERVICES.PERFORMANCE_MONITOR, () => {
        return createAdvancedPerformanceMonitor({
          enabled: true,
          thresholds: options.performanceThresholds,
          sampleRate: options.performanceSampleRate || 1.0,
        })
      })
    }

    // 内存管理器（单例）
    if (options.enableMemoryManagement !== false) {
      const memoryManager = createMemoryManager({
        cleanupInterval: options.memoryCleanupInterval || 60000,
        memoryThreshold: options.memoryThreshold || 0.8,
      })
      
      container.singleton(ROUTER_SERVICES.MEMORY_MANAGER, memoryManager)
    }
  }

  /**
   * 在导航中记录性能
   */
  private async performNavigation(
    to: RouteLocationRaw,
    options: NavigationOptions
  ): Promise<void> {
    const from = this.currentRoute
    const startTime = performance.now()
    let resolveTime = 0
    let matchTime = 0
    let guardTime = 0

    try {
      // 1. 解析目标路由
      const resolveStart = performance.now()
      const targetRoute = await this.resolveRoute(to)
      resolveTime = performance.now() - resolveStart

      // 记录匹配时间（在 resolveRoute 中）
      matchTime = this.lastMatchTime || 0

      // 2. 检查是否重复导航
      if (this.isSameRoute(targetRoute, from)) {
        return
      }

      // 3. 触发 beforeEach 事件
      await this.emit('beforeEach', targetRoute, from)

      // 4. 执行守卫
      const guardStart = performance.now()
      if (!options.skipGuards) {
        const guardResult = await this.guardManager.runBeforeGuards(targetRoute, from)
        guardTime = performance.now() - guardStart

        if (!guardResult.allowed) {
          if (guardResult.redirect) {
            return this.navigate(guardResult.redirect, options)
          }
          if (guardResult.error) {
            throw guardResult.error
          }
          throw createNavigationCancelledError(targetRoute, from)
        }
      } else {
        guardTime = performance.now() - guardStart
      }

      // 5-9. 其余导航逻辑...
      // ... 保持现有代码 ...

      // 记录性能指标
      if (this.perfMonitor) {
        this.perfMonitor.recordNavigation(targetRoute.path, {
          resolveTime,
          matchTime,
          guardTime,
          totalTime: performance.now() - startTime,
          cacheHit: this.lastMatchCached || false,
        })
      }

    } catch (error) {
      this.handleError(error as Error)
      throw error
    }
  }

  /**
   * 获取服务容器（公开API）
   */
  getContainer(): RouterServiceContainer {
    return this.container
  }

  /**
   * 获取性能监控器（公开API）
   */
  getPerformanceMonitor(): AdvancedPerformanceMonitor | undefined {
    return this.perfMonitor
  }

  /**
   * 销毁路由器
   */
  destroy(): void {
    // 销毁性能监控器
    if (this.perfMonitor) {
      this.perfMonitor.destroy()
    }

    // 销毁服务容器
    this.container.dispose()

    // 其余销毁逻辑...
    this.cacheManager.destroy()
    this.guardManager.destroy()
    this.scrollManager.destroy()
    this.errorManager.destroy()
    this.aliasManager.clear()
    this.events.clear()
  }
}
```

## 4. 扩展 RouterOptions 类型

在 `packages/core/src/router/router.ts` 中添加新选项：

```typescript
export interface RouterOptions {
  // ... 现有选项 ...

  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean

  /** 性能阈值配置 */
  performanceThresholds?: Partial<PerformanceThresholds>

  /** 性能采样率 (0-1) */
  performanceSampleRate?: number
}
```

## 5. 使用示例

### 5.1 创建增强的路由器

```typescript
import { createRouter, createWebHistory } from '@ldesign/router-core'

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User },
  ],
  history: createWebHistory(),
  
  // 性能优化
  useTrie: true,
  enableCache: true,
  cacheSize: 1000,
  enableMatchStats: true,
  
  // 性能监控
  enablePerformanceMonitor: true,
  performanceThresholds: {
    navigation: 100,
    match: 10,
    guard: 50,
  },
  performanceSampleRate: 1.0, // 开发环境 100%，生产环境建议 0.1
  
  // 内存管理
  enableMemoryManagement: true,
  memoryCleanupInterval: 60000,
  memoryThreshold: 0.8,
})

// 获取服务容器
const container = router.getContainer()

// 注册自定义服务
container.singleton('analytics', AnalyticsService)

// 在守卫中使用服务
router.beforeEach((to, from, next) => {
  const analytics = container.resolve('analytics')
  analytics.track('navigation', { to: to.path, from: from.path })
  next()
})

// 获取性能报告
const perfMonitor = router.getPerformanceMonitor()
if (perfMonitor) {
  console.log(perfMonitor.getReport())
}
```

### 5.2 开发工具集成

```typescript
// 在浏览器控制台中暴露调试工具
if (process.env.NODE_ENV === 'development') {
  window.$router = {
    // 路由器实例
    instance: router,
    
    // 健康检查
    health() {
      return router.healthCheck()
    },
    
    // 性能报告
    performance() {
      const perfMonitor = router.getPerformanceMonitor()
      return perfMonitor ? perfMonitor.getReport() : '性能监控未启用'
    },
    
    // 缓存统计
    cache() {
      return router.getCacheStats()
    },
    
    // 内存统计
    memory() {
      return {
        usage: router.getMemoryUsage(),
        stats: router.getMemoryStats(),
      }
    },
    
    // 容器统计
    container() {
      return router.getContainer().getStats()
    },
    
    // 路由分析
    analyze() {
      return router.analyzeRoutes()
    },
  }
  
  console.log('路由调试工具已挂载到 window.$router')
}
```

## 6. 性能最佳实践

### 6.1 生产环境配置

```typescript
const router = createRouter({
  routes,
  history: createWebHistory(),
  
  // 启用高性能模式
  useTrie: true,
  enableCache: true,
  cacheSize: 2000,
  
  // 降低监控开销
  enablePerformanceMonitor: true,
  performanceSampleRate: 0.1,  // 仅 10% 采样
  
  // 启用内存管理
  enableMemoryManagement: true,
  memoryCleanupInterval: 300000,  // 5 分钟
  memoryThreshold: 0.75,
})
```

### 6.2 开发环境配置

```typescript
const router = createRouter({
  routes,
  history: createWebHistory(),
  
  // 启用所有监控
  enablePerformanceMonitor: true,
  performanceSampleRate: 1.0,  // 100% 采样
  enableMatchStats: true,
  
  // 详细调试
  strict: true,
  
  // 开启内存监控
  enableMemoryManagement: true,
  memoryCleanupInterval: 30000,  // 30 秒（快速检测泄漏）
})

// 定期输出性能报告
setInterval(() => {
  const perfMonitor = router.getPerformanceMonitor()
  if (perfMonitor) {
    console.log(perfMonitor.getReport())
  }
}, 60000)  // 每分钟
```

## 7. 下一步

1. **实现中间件系统**:
   - 创建 `packages/core/src/features/middleware.ts`
   - 参考总结文档中的设计

2. **集成到 Router**:
   - 修改 `packages/core/src/router/router.ts`
   - 按照本指南的建议进行集成

3. **编写测试**:
   - 为服务容器编写单元测试
   - 为性能监控编写单元测试

4. **更新文档**:
   - 更新 API 文档
   - 添加迁移指南

## 8. 故障排查

### 8.1 服务容器问题

**问题**: 循环依赖错误
```
Error: Circular dependency detected in router services: A → B → A
```

**解决**: 检查服务注册时的工厂函数，避免在工厂函数中直接解析依赖它的服务。

### 8.2 性能监控问题

**问题**: 性能监控影响应用性能

**解决**: 降低采样率
```typescript
createAdvancedPerformanceMonitor({
  sampleRate: 0.1  // 降低到 10%
})
```

### 8.3 内存问题

**问题**: 内存持续增长

**解决**:
1. 启用内存管理
2. 降低缓存大小
3. 检查事件监听器是否正确移除

```typescript
// 检查内存泄漏
const leaks = router.detectMemoryLeaks()
if (leaks > 0) {
  console.warn(`检测到 ${leaks} 个潜在的内存泄漏`)
  router.cleanupMemory()
}
```

---

**版本**: 1.0.0  
**更新**: 2025-12-29
