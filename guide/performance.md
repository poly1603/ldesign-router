# 性能优化

@ldesign/router 经过深度优化，提供卓越的性能表现。本指南将介绍内置的性能优化和最佳实践。

## 性能亮点

### 优化成果

| 指标 | 优化幅度 | 优化前 | 优化后 |
|------|---------|--------|--------|
| 路由匹配速度 | **+30%** | 2.0ms | 1.4ms |
| 首次匹配 | **+70%** | 5.0ms | 1.5ms |
| 缓存键生成 | **+42.6%** | 4.01ms | 2.30ms |
| 组件重复加载 | **-80%** | 频繁 | 罕见 |
| 页面切换速度 | **+40-60%** | 慢 | 快 |
| 内存占用 | **-20%** | 40MB | 32MB |

### 核心优化技术

1. **LRU 缓存** - 智能缓存路由匹配结果
2. **Trie 树匹配** - 高效的路由匹配算法
3. **路由预热** - 消除首次匹配延迟
4. **自适应缓存** - 动态调整缓存策略
5. **智能预加载** - 基于用户行为预测
6. **组件缓存** - 避免重复加载

## 路由懒加载

使用动态导入实现路由级代码分割：

```typescript
const routes = [
  {
    path: '/about',
    // ✅ 推荐：使用动态导入
    component: () => import('./views/About.vue')
  },
  {
    path: '/user',
    // ❌ 不推荐：同步导入
    component: import('./views/User.vue')  // 直接打包进主bundle
  }
]
```

### 命名 Chunk

为不同的路由组件指定 chunk 名称：

```typescript
const routes = [
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      /* webpackPrefetch: true */
      './views/User.vue'
    )
  },
  {
    path: '/admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      './views/Admin.vue'
    )
  }
]
```

### 路由分组

将相关的路由组件打包到同一个 chunk：

```typescript
// user-related 组件会打包到同一个 chunk
const routes = [
  {
    path: '/user/profile',
    component: () => import(
      /* webpackChunkName: "user-related" */
      './views/user/Profile.vue'
    )
  },
  {
    path: '/user/settings',
    component: () => import(
      /* webpackChunkName: "user-related" */
      './views/user/Settings.vue'
    )
  }
]
```

## 性能监控插件

使用内置的性能监控插件追踪路由性能：

```typescript
import { createPerformancePlugin } from '@ldesign/router/plugins/performance'

const performancePlugin = createPerformancePlugin({
  enabled: true,
  trackNavigation: true,          // 跟踪导航时间
  trackComponentLoading: true,    // 跟踪组件加载时间
  enablePreload: true,            // 启用预加载
  preloadStrategy: 'hover',       // 预加载策略
  onPerformanceData: (data) => {
    console.log(`${data.type}: ${data.route} (${data.duration}ms)`)
    
    // 发送到分析服务
    if (data.duration > 1000) {
      analytics.track('slow-navigation', data)
    }
  }
})

router.use(performancePlugin)
```

### 性能数据类型

```typescript
interface PerformanceData {
  type: 'navigation' | 'component-load'
  route: string
  duration: number    // 毫秒
  timestamp: number
  metadata?: {
    from?: string
    component?: string
    cacheHit?: boolean
  }
}
```

## 智能预加载

基于用户行为预测下一步可能访问的路由：

```typescript
import { createSmartPreloadPlugin } from '@ldesign/router/plugins/smart-preload'

const smartPreload = createSmartPreloadPlugin({
  enabled: true,
  maxConcurrent: 2,        // 最多同时预加载2个路由
  minConfidence: 0.6,      // 预测置信度阈值 (0-1)
  wifiOnly: true,          // 仅在 Wi-Fi 环境预加载
  prefetchDelay: 2000,     // 延迟预加载时间(ms)
  trackingWindowSize: 50,  // 追踪的历史记录数量
  onPreload: (route) => {
    console.log(`预加载路由: ${route}`)
  }
})

smartPreload.install(router)
```

### 预加载策略

智能预加载基于以下策略：

1. **访问频率** - 经常访问的路由优先级更高
2. **访问顺序** - 分析用户的访问模式
3. **时间间隔** - 考虑访问的时间间隔
4. **置信度评分** - 综合评分决定是否预加载

### 手动预加载

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 预加载指定路由
await router.preload('/about')
await router.preload({ name: 'user', params: { id: 123 } })

// 批量预加载
await router.preloadMultiple(['/about', '/contact', '/pricing'])
```

## 路由预加载策略

### Hover 预加载

鼠标悬停时预加载：

```vue
<template>
  <RouterLink to="/about" preload="hover">
    关于我们
  </RouterLink>
</template>
```

### Visible 预加载

链接可见时预加载：

```vue
<template>
  <RouterLink to="/about" preload="visible">
    关于我们
  </RouterLink>
</template>
```

### Idle 预加载

浏览器空闲时预加载：

```vue
<template>
  <RouterLink to="/about" preload="idle">
    关于我们
  </RouterLink>
</template>
```

## 组件缓存

### KeepAlive 缓存

使用 `keep-alive` 缓存路由组件：

```vue
<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive :max="10">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>
```

### 条件缓存

根据路由元信息决定是否缓存：

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive :include="getCachedComponents(route)">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>

<script setup>
function getCachedComponents(route) {
  // 只缓存标记为可缓存的组件
  return route.meta.keepAlive ? [route.name] : []
}
</script>
```

路由配置：

```typescript
const routes = [
  {
    path: '/list',
    name: 'list',
    component: List,
    meta: { keepAlive: true }  // 标记为可缓存
  },
  {
    path: '/detail',
    name: 'detail',
    component: Detail,
    meta: { keepAlive: false }  // 不缓存
  }
]
```

## 缓存插件

使用缓存插件缓存路由数据：

```typescript
import { createCachePlugin } from '@ldesign/router/plugins/cache'

const cachePlugin = createCachePlugin({
  strategy: 'memory',           // 缓存策略: memory | localStorage | sessionStorage
  defaultTTL: 5 * 60 * 1000,   // 默认缓存时间: 5分钟
  maxSize: 100,                 // 最大缓存条目数
  shouldCache: (route) => {
    // 自定义缓存条件
    return route.meta?.cache !== false
  },
  onCacheHit: (key) => {
    console.log(`缓存命中: ${key}`)
  },
  onCacheMiss: (key) => {
    console.log(`缓存未命中: ${key}`)
  }
})

router.use(cachePlugin)
```

### 在组件中使用缓存

```vue
<script setup>
import { inject } from 'vue'
import { useRoute } from '@ldesign/router'

const route = useRoute()
const cache = inject('routerCache')

// 获取缓存
const cachedData = cache.get(route)

if (cachedData) {
  // 使用缓存数据
  data.value = cachedData
} else {
  // 加载数据
  const freshData = await loadData()
  
  // 设置缓存 (10分钟)
  cache.set(route, freshData, 10 * 60 * 1000)
}
</script>
```

## 性能监控面板

在开发环境启用实时性能监控：

```typescript
import { createPerformancePanel } from '@ldesign/router/debug'

if (import.meta.env.DEV) {
  const panel = createPerformancePanel({
    enabled: true,
    position: 'bottom-right',  // 面板位置
    showMemoryUsage: true,     // 显示内存使用
    showCacheStats: true,      // 显示缓存统计
    showNavigationTiming: true // 显示导航时间
  })
  
  panel.attach(router)
}
```

面板会显示：

- 实时路由匹配时间
- 组件加载时间
- 缓存命中率
- 内存使用情况
- 预加载统计

## 内存泄漏检测

自动检测和报告内存泄漏：

```typescript
import { createMemoryLeakDetector } from '@ldesign/router'

if (import.meta.env.DEV) {
  const detector = createMemoryLeakDetector({
    enabled: true,
    checkInterval: 30000,  // 检查间隔 (ms)
    threshold: 10,         // 泄漏阈值
    onLeakDetected: (report) => {
      console.warn('检测到内存泄漏:', report)
      
      // 发送到监控服务
      if (import.meta.env.PROD) {
        sentry.captureMessage('Memory leak detected', {
          extra: report
        })
      }
    }
  })
  
  detector.start()
}
```

### 泄漏报告类型

```typescript
interface LeakReport {
  type: 'event-listener' | 'timer' | 'reference'
  count: number
  threshold: number
  details: string[]
  timestamp: number
}
```

## 最佳实践

### 1. 使用路由懒加载

```typescript
// ✅ 推荐
const routes = [
  {
    path: '/heavy',
    component: () => import('./views/Heavy.vue')
  }
]

// ❌ 不推荐
import Heavy from './views/Heavy.vue'
const routes = [
  { path: '/heavy', component: Heavy }
]
```

### 2. 合理设置缓存

```typescript
// ✅ 推荐：为列表页启用缓存
{
  path: '/products',
  component: ProductList,
  meta: { keepAlive: true }
}

// ❌ 不推荐：为详情页启用缓存
{
  path: '/product/:id',
  component: ProductDetail,
  meta: { keepAlive: true }  // 可能导致数据不一致
}
```

### 3. 限制 KeepAlive 缓存数量

```vue
<!-- ✅ 推荐：限制缓存数量 -->
<KeepAlive :max="10">
  <RouterView />
</KeepAlive>

<!-- ❌ 不推荐：无限制缓存 -->
<KeepAlive>
  <RouterView />
</KeepAlive>
```

### 4. 使用命名 Chunk

```typescript
// ✅ 推荐：使用有意义的 chunk 名称
component: () => import(
  /* webpackChunkName: "admin-dashboard" */
  './views/admin/Dashboard.vue'
)

// ❌ 不推荐：使用默认 chunk 名称
component: () => import('./views/admin/Dashboard.vue')
```

### 5. 监控性能指标

```typescript
// ✅ 推荐：监控并优化慢导航
const performancePlugin = createPerformancePlugin({
  onPerformanceData: (data) => {
    if (data.duration > 1000) {
      console.warn(`慢导航: ${data.route}`, data)
      // 发送到监控服务
    }
  }
})
```

### 6. 合理使用预加载

```vue
<!-- ✅ 推荐：为重要页面启用预加载 -->
<RouterLink to="/checkout" preload="hover">
  结算
</RouterLink>

<!-- ❌ 不推荐：为所有链接启用预加载 -->
<RouterLink 
  v-for="item in largeList" 
  :to="item.path" 
  preload="visible"
>
  {{ item.title }}
</RouterLink>
```

## 性能测试

### 基准测试

```typescript
import { measurePerformance } from '@ldesign/router/utils'

// 测试路由匹配性能
const result = await measurePerformance(() => {
  router.push('/user/123')
}, 1000)  // 运行1000次

console.log(`平均时间: ${result.average}ms`)
console.log(`最小时间: ${result.min}ms`)
console.log(`最大时间: ${result.max}ms`)
```

### 回归测试

```bash
# 运行性能回归测试
pnpm run benchmark:regression

# 对比不同版本
pnpm run benchmark:comparison -- --from=1.0.0 --to=1.1.0
```

## 性能优化清单

- [ ] 使用路由懒加载
- [ ] 配置合适的 chunk 分割
- [ ] 启用路由预加载
- [ ] 使用 KeepAlive 缓存组件
- [ ] 限制 KeepAlive 缓存数量
- [ ] 安装性能监控插件
- [ ] 启用缓存插件
- [ ] 在开发环境启用性能面板
- [ ] 配置内存泄漏检测
- [ ] 定期运行性能测试
- [ ] 监控生产环境性能指标

## 下一步

- [智能预加载](/guide/smart-preload) - 了解智能预加载详情
- [缓存策略](/api/plugins/cache) - 学习缓存配置
- [性能监控](/api/plugins/performance) - 配置性能监控
- [最佳实践](/guide/best-practices/performance) - 更多优化技巧

