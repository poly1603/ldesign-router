# 性能优化

本指南介绍如何优化 `@ldesign/router` 的性能，提升应用的响应速度和用户体验。

## 路由懒加载

### 基础懒加载

```typescript
// ✅ 推荐：使用动态导入
// ❌ 不推荐：同步导入
import User from '@/views/User.vue'
import Admin from '@/views/Admin.vue'

const routes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/User.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue')
  }
]

const routes = [
  { path: '/user', component: User },
  { path: '/admin', component: Admin }
]
```

### 分组懒加载

```typescript
// 按功能模块分组
const routes = [
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/User.vue'
    )
  },
  {
    path: '/user/profile',
    component: () => import(
      /* webpackChunkName: "user" */
      '@/views/UserProfile.vue'
    )
  },
  {
    path: '/admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      '@/views/Admin.vue'
    )
  }
]
```

### 预加载策略

```typescript
// 预加载重要页面
const routes = [
  {
    path: '/dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */
      /* webpackPreload: true */
      '@/views/Dashboard.vue'
    )
  },
  {
    path: '/settings',
    component: () => import(
      /* webpackChunkName: "settings" */
      /* webpackPrefetch: true */
      '@/views/Settings.vue'
    )
  }
]
```

## 缓存优化

### 智能缓存配置

```typescript
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 20, // 根据应用规模调整
    ttl: 600000, // 10分钟缓存
    storage: 'memory', // 内存存储最快
    compress: true // 启用压缩节省内存
  }
})
```

### 缓存预热

```typescript
// 应用启动时预热重要页面缓存
async function preloadCache() {
  const criticalRoutes = [
    '/dashboard',
    '/user/profile',
    '/notifications'
  ]

  // 在空闲时间预加载
  requestIdleCallback(async () => {
    for (const path of criticalRoutes) {
      try {
        const resolved = router.resolve(path)
        if (resolved.matched.length > 0) {
          // 预加载组件
          await resolved.matched[0].components?.default?.()
        }
      }
 catch (error) {
        console.warn(`预加载失败: ${path}`, error)
      }
    }
  })
}

// 在应用挂载后执行
onMounted(() => {
  preloadCache()
})
```

### 缓存失效优化

```typescript
// 智能缓存失效
class SmartCacheManager {
  private dependencies = new Map<string, Set<string>>()

  // 建立缓存依赖关系
  addDependency(cacheKey: string, dependency: string) {
    if (!this.dependencies.has(dependency)) {
      this.dependencies.set(dependency, new Set())
    }
    this.dependencies.get(dependency)!.add(cacheKey)
  }

  // 数据更新时清除相关缓存
  invalidateByDependency(dependency: string) {
    const relatedCaches = this.dependencies.get(dependency)
    if (relatedCaches) {
      relatedCaches.forEach((cacheKey) => {
        router.cacheManager.removeFromCache(cacheKey)
      })
    }
  }
}

// 使用示例
const smartCache = new SmartCacheManager()

// 建立依赖关系
smartCache.addDependency('UserList', 'user-data')
smartCache.addDependency('UserDetail-123', 'user-data')

// 用户数据更新时
async function updateUser(userData: any) {
  await api.updateUser(userData)
  // 自动清除相关缓存
  smartCache.invalidateByDependency('user-data')
}
```

## 组件优化

### 组件拆分

```typescript
// ✅ 推荐：拆分大组件
// UserDashboard.vue
<template>
  <div class="user-dashboard">
    <UserHeader :user="user" />
    <UserStats :stats="stats" />
    <UserRecentActivity :activities="activities" />
  </div>
</template>

<script setup lang="ts">
// 只处理数据逻辑，UI 交给子组件
const user = await fetchUser()
const stats = await fetchUserStats()
const activities = await fetchRecentActivities()
</script>

// ❌ 不推荐：单个大组件
// UserDashboard.vue (500+ 行)
<template>
  <div class="user-dashboard">
    <!-- 所有 UI 都在这里 -->
  </div>
</template>
```

### 异步组件

```typescript
// 大型组件使用异步加载
const AsyncDataTable = defineAsyncComponent({
  loader: () => import('@/components/DataTable.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})

// 在路由中使用
{
  path: '/data',
  component: () => import('@/views/DataView.vue'),
  meta: {
    asyncComponents: ['DataTable', 'Chart']
  }
}
```

### 虚拟滚动

```vue
<!-- 大列表使用虚拟滚动 -->
<script setup lang="ts">
import VirtualList from '@/components/VirtualList.vue'

// 只渲染可见区域的项目
const items = ref([])
</script>

<template>
  <VirtualList
    v-slot="{ item, index }"
    :items="items"
    :item-height="60"
    :container-height="400"
  >
    <UserItem :key="item.id" :user="item" />
  </VirtualList>
</template>
```

## 数据加载优化

### 数据预加载

```typescript
// 路由级数据预加载
const routes = [
  {
    path: '/user/:id',
    component: UserDetail,
    beforeEnter: async (to) => {
      // 预加载用户数据
      const userId = to.params.id
      try {
        const userData = await fetchUser(userId)
        // 将数据存储到路由元信息中
        to.meta.userData = userData
      } catch (error) {
        console.error('预加载用户数据失败:', error)
      }
    }
  }
]

// 在组件中使用预加载的数据
<script setup lang="ts">
const route = useRoute()
const user = ref(route.meta.userData || null)

// 如果没有预加载数据，则重新获取
if (!user.value) {
  user.value = await fetchUser(route.params.id)
}
</script>
```

### 并行数据加载

```typescript
// ✅ 推荐：并行加载多个数据源
async function loadDashboardData() {
  const [user, stats, notifications, activities] = await Promise.all([
    fetchUser(),
    fetchUserStats(),
    fetchNotifications(),
    fetchRecentActivities()
  ])

  return { user, stats, notifications, activities }
}

// ❌ 不推荐：串行加载
async function loadDashboardData() {
  const user = await fetchUser()
  const stats = await fetchUserStats()
  const notifications = await fetchNotifications()
  const activities = await fetchRecentActivities()

  return { user, stats, notifications, activities }
}
```

### 数据缓存

```typescript
// 实现数据层缓存
class DataCache {
  private cache = new Map()
  private ttl = new Map()

  async get<T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> {
    const now = Date.now()

    // 检查缓存是否有效
    if (this.cache.has(key) && this.ttl.get(key)! > now) {
      return this.cache.get(key)
    }

    // 获取新数据
    const data = await fetcher()
    this.cache.set(key, data)
    this.ttl.set(key, now + ttl)

    return data
  }

  invalidate(key: string) {
    this.cache.delete(key)
    this.ttl.delete(key)
  }
}

const dataCache = new DataCache()

// 使用缓存
function fetchUserWithCache(userId: string) {
  return dataCache.get(
    `user-${userId}`,
    () => api.fetchUser(userId),
    600000 // 10分钟缓存
  )
}
```

## 渲染优化

### 虚拟化长列表

```vue
<script setup lang="ts">
interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
}

const props = defineProps<Props>()
const container = ref<HTMLElement>()

const scrollTop = ref(0)
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  return Math.min(startIndex.value + visibleCount + 1, props.items.length)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    ...item,
    index: startIndex.value + index
  }))
})

const totalHeight = computed(() => props.items.length * props.itemHeight)
const offsetY = computed(() => startIndex.value * props.itemHeight)

onMounted(() => {
  container.value?.addEventListener('scroll', (e) => {
    scrollTop.value = (e.target as HTMLElement).scrollTop
  })
})
</script>

<template>
  <div ref="container" class="virtual-list">
    <div
      class="virtual-list-phantom"
      :style="{ height: `${totalHeight}px` }"
    />

    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-list-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot :item="item" :index="item.index" />
      </div>
    </div>
  </div>
</template>
```

### 图片懒加载

```vue
<script setup lang="ts">
// 自定义懒加载指令
const vLazy = {
  mounted(el: HTMLImageElement, binding: any) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.unobserve(el)
        }
      })
    })

    observer.observe(el)
  }
}

function onImageLoad() {
  // 图片加载完成
}

function onImageError() {
  // 图片加载失败，显示默认图片
}
</script>

<template>
  <img
    v-lazy="imageSrc"
    :alt="alt"
    class="lazy-image"
    @load="onImageLoad"
    @error="onImageError"
  >
</template>
```

## 内存优化

### 组件清理

```typescript
// 组件卸载时清理资源
<script setup lang="ts">
const timer = ref<number>()
const observer = ref<IntersectionObserver>()
const eventListeners = ref<Array<() => void>>([])

onMounted(() => {
  // 设置定时器
  timer.value = setInterval(() => {
    // 定时任务
  }, 1000)

  // 创建观察器
  observer.value = new IntersectionObserver(() => {
    // 观察逻辑
  })

  // 添加事件监听
  const handleResize = () => {
    // 处理窗口大小变化
  }
  window.addEventListener('resize', handleResize)
  eventListeners.value.push(() => {
    window.removeEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  // 清理定时器
  if (timer.value) {
    clearInterval(timer.value)
  }

  // 清理观察器
  if (observer.value) {
    observer.value.disconnect()
  }

  // 清理事件监听
  eventListeners.value.forEach(cleanup => cleanup())
})
</script>
```

### 内存泄漏检测

```typescript
// 开发环境下的内存泄漏检测
if (process.env.NODE_ENV === 'development') {
  let componentCount = 0

  const originalMount = app.mount
  app.mount = function (...args) {
    componentCount++
    console.log(`组件挂载: ${componentCount}`)
    return originalMount.apply(this, args)
  }

  const originalUnmount = app.unmount
  app.unmount = function (...args) {
    componentCount--
    console.log(`组件卸载: ${componentCount}`)
    return originalUnmount.apply(this, args)
  }

  // 定期检查内存使用
  setInterval(() => {
    if (performance.memory) {
      console.log('内存使用:', {
        used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      })
    }
  }, 10000)
}
```

## 网络优化

### 请求合并

```typescript
// 合并多个请求
class RequestBatcher {
  private batches = new Map<string, any[]>()
  private timers = new Map<string, number>()

  batch<T>(key: string, request: () => Promise<T>, delay = 50): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, [])
      }

      this.batches.get(key)!.push({ resolve, reject, request })

      // 清除之前的定时器
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key)!)
      }

      // 设置新的定时器
      this.timers.set(key, setTimeout(() => {
        this.executeBatch(key)
      }, delay))
    })
  }

  private async executeBatch(key: string) {
    const batch = this.batches.get(key)
    if (!batch || batch.length === 0)
return

    this.batches.delete(key)
    this.timers.delete(key)

    try {
      // 并行执行所有请求
      const results = await Promise.allSettled(
        batch.map(item => item.request())
      )

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batch[index].resolve(result.value)
        }
 else {
          batch[index].reject(result.reason)
        }
      })
    }
 catch (error) {
      batch.forEach(item => item.reject(error))
    }
  }
}

const requestBatcher = new RequestBatcher()

// 使用示例
function fetchUser(id: string) {
  return requestBatcher.batch(
    'user-requests',
    () => api.fetchUser(id)
  )
}
```

### 请求缓存

```typescript
// HTTP 请求缓存
class HttpCache {
  private cache = new Map<string, any>()
  private pending = new Map<string, Promise<any>>()

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = this.getCacheKey(url, options)

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // 检查是否有相同请求正在进行
    if (this.pending.has(cacheKey)) {
      return this.pending.get(cacheKey)
    }

    // 发起新请求
    const promise = fetch(url, options)
      .then(response => response.json())
      .then((data) => {
        this.cache.set(cacheKey, data)
        this.pending.delete(cacheKey)
        return data
      })
      .catch((error) => {
        this.pending.delete(cacheKey)
        throw error
      })

    this.pending.set(cacheKey, promise)
    return promise
  }

  private getCacheKey(url: string, options: RequestInit): string {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`
  }
}

const httpCache = new HttpCache()
```

## 性能监控

### 路由性能监控

```typescript
// 路由切换性能监控
class RoutePerformanceMonitor {
  private navigationStart = 0

  init(router: LDesignRouter) {
    router.beforeEach((to, from, next) => {
      this.navigationStart = performance.now()
      next()
    })

    router.afterEach((to, from) => {
      const duration = performance.now() - this.navigationStart

      // 记录性能数据
      this.recordNavigation({
        from: from.path,
        to: to.path,
        duration,
        timestamp: Date.now()
      })

      // 性能警告
      if (duration > 1000) {
        console.warn(`路由切换较慢: ${from.path} -> ${to.path} (${duration.toFixed(2)}ms)`)
      }
    })
  }

  private recordNavigation(data: any) {
    // 发送到分析服务
    analytics.track('route_navigation', data)

    // 本地存储用于调试
    if (process.env.NODE_ENV === 'development') {
      console.log('路由性能:', data)
    }
  }
}

const performanceMonitor = new RoutePerformanceMonitor()
performanceMonitor.init(router)
```

### 组件渲染性能监控

```typescript
// 组件渲染性能监控
const usePerformanceMonitor = (componentName: string) => {
  const renderStart = ref(0)

  onBeforeMount(() => {
    renderStart.value = performance.now()
  })

  onMounted(() => {
    const renderTime = performance.now() - renderStart.value

    if (renderTime > 100) {
      console.warn(`${componentName} 渲染较慢: ${renderTime.toFixed(2)}ms`)
    }

    // 记录性能数据
    analytics.track('component_render', {
      component: componentName,
      renderTime,
      timestamp: Date.now()
    })
  })
}

// 在组件中使用
<script setup lang="ts">
usePerformanceMonitor('UserDashboard')
</script>
```

通过实施这些性能优化策略，可以显著提升应用的响应速度和用户体验。记住，性能优化是一个持续的过程，需要根据实际使用情况不断调整和改进。
