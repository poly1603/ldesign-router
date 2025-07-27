# 缓存管理

缓存管理是提升应用性能的重要手段。`@ldesign/router` 提供了智能的页面缓存系统，支持多种缓存策略和灵活的配置选项。

## 基础概念

### 缓存策略

- **LRU** (Least Recently Used) - 最近最少使用，默认策略
- **FIFO** (First In First Out) - 先进先出
- **Custom** - 自定义策略

### 存储方式

- **memory** - 内存存储（默认）
- **local** - localStorage 持久化
- **session** - sessionStorage 会话存储

## 基础配置

### 启用缓存管理

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'lru', // 缓存策略
    max: 10, // 最大缓存数量
    ttl: 300000, // 缓存时间 (5分钟)
    storage: 'memory' // 存储方式
  }
})
```

### 路由级缓存配置

```typescript
const routes: RouteConfig[] = [
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/List.vue'),
    meta: {
      cache: true, // 启用缓存
      cacheTTL: 600000 // 自定义缓存时间 (10分钟)
    }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: {
      cache: false // 禁用缓存
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      cache: true,
      cacheKey: 'dashboard' // 自定义缓存键
    }
  }
]
```

## 缓存操作

### 基础缓存操作

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()
const cacheManager = router.cacheManager

// 获取缓存统计
const stats = cacheManager.getCacheStats()
console.log('缓存统计:', stats)
// {
//   size: 5,
//   maxSize: 10,
//   hitRate: 85.5,
//   totalSize: 1024,
//   enabled: true
// }

// 清空所有缓存
cacheManager.clearCache()

// 移除特定缓存
cacheManager.removeFromCache('list-page')

// 检查是否已缓存
const isCached = cacheManager.isCached('detail-123')

// 获取所有缓存键
const cacheKeys = cacheManager.getCacheKeys()
```

### 组件内缓存控制

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const route = useRoute()
const items = ref([])

async function loadData() {
  // 加载数据逻辑
  items.value = await fetchItems()
}

async function refreshData() {
  // 清除当前页面缓存并重新加载
  const cacheKey = router.cacheManager.getCacheKey(route.value)
  router.cacheManager.removeFromCache(cacheKey)
  await loadData()
}

function clearPageCache() {
  const cacheKey = router.cacheManager.getCacheKey(route.value)
  router.cacheManager.removeFromCache(cacheKey)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <h1>列表页面</h1>
    <button @click="refreshData">
      刷新数据
    </button>
    <button @click="clearPageCache">
      清除页面缓存
    </button>

    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

## 高级配置

### 自定义缓存策略

```typescript
// 自定义缓存策略
class CustomCacheStrategy {
  private accessCount = new Map<string, number>()

  shouldEvict(cacheMap: Map<string, any>, newKey: string): string | null {
    // 找到访问次数最少的缓存项
    let minCount = Infinity
    let evictKey = null

    for (const [key, item] of cacheMap) {
      const count = this.accessCount.get(key) || 0
      if (count < minCount) {
        minCount = count
        evictKey = key
      }
    }

    return evictKey
  }

  onAccess(key: string) {
    const count = this.accessCount.get(key) || 0
    this.accessCount.set(key, count + 1)
  }
}

const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'custom',
    customStrategy: new CustomCacheStrategy()
  }
})
```

### 条件缓存

```typescript
// 基于条件的缓存控制
function shouldCache(route: RouteLocationNormalized) {
  // 只缓存列表页面
  if (route.name?.toString().includes('List')) {
    return true
  }

  // 不缓存包含敏感信息的页面
  if (route.meta?.sensitive) {
    return false
  }

  // 根据用户角色决定是否缓存
  const user = getCurrentUser()
  if (user?.role === 'admin') {
    return false // 管理员页面不缓存
  }

  return true
}

const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    shouldCache
  }
})
```

### 缓存预热

```typescript
// 预热重要页面的缓存
async function preloadCache() {
  const importantRoutes = [
    '/dashboard',
    '/user/profile',
    '/settings'
  ]

  for (const path of importantRoutes) {
    try {
      await router.push(path)
      // 等待组件加载完成
      await nextTick()
    }
 catch (error) {
      console.warn(`预热缓存失败: ${path}`, error)
    }
  }
}

// 应用启动时预热缓存
onMounted(() => {
  preloadCache()
})
```

## 缓存监控

### 缓存事件监听

```typescript
// 监听缓存事件
router.cacheManager.on('cache:hit', (key) => {
  console.log(`缓存命中: ${key}`)
})

router.cacheManager.on('cache:miss', (key) => {
  console.log(`缓存未命中: ${key}`)
})

router.cacheManager.on('cache:evict', (key) => {
  console.log(`缓存淘汰: ${key}`)
})

router.cacheManager.on('cache:clear', () => {
  console.log('缓存已清空')
})
```

### 缓存性能监控

```typescript
// 缓存性能监控组件
const CacheMonitor = {
  template: `
    <div class="cache-monitor">
      <h3>缓存监控</h3>
      <div>缓存大小: {{ stats.size }}/{{ stats.maxSize }}</div>
      <div>命中率: {{ stats.hitRate }}%</div>
      <div>总大小: {{ formatSize(stats.totalSize) }}</div>
      <div>状态: {{ stats.enabled ? '启用' : '禁用' }}</div>

      <h4>缓存项列表</h4>
      <ul>
        <li v-for="key in cacheKeys" :key="key">
          {{ key }}
          <button @click="removeCache(key)">删除</button>
        </li>
      </ul>

      <button @click="clearAll">清空所有缓存</button>
    </div>
  `,
  setup() {
    const router = useRouter()
    const cacheManager = router.cacheManager

    const stats = ref(cacheManager.getCacheStats())
    const cacheKeys = ref(cacheManager.getCacheKeys())

    const updateStats = () => {
      stats.value = cacheManager.getCacheStats()
      cacheKeys.value = cacheManager.getCacheKeys()
    }

    const removeCache = (key: string) => {
      cacheManager.removeFromCache(key)
      updateStats()
    }

    const clearAll = () => {
      cacheManager.clearCache()
      updateStats()
    }

    const formatSize = (bytes: number) => {
      return `${(bytes / 1024).toFixed(2)} KB`
    }

    // 定期更新统计信息
    onMounted(() => {
      const timer = setInterval(updateStats, 1000)
      onUnmounted(() => clearInterval(timer))
    })

    return {
      stats,
      cacheKeys,
      removeCache,
      clearAll,
      formatSize
    }
  }
}
```

## 缓存优化

### 智能缓存键生成

```typescript
// 自定义缓存键生成策略
function generateCacheKey(route: RouteLocationNormalized) {
  const { name, params, query } = route

  // 基础键
  let key = name?.toString() || route.path

  // 包含重要参数
  if (params.id) {
    key += `-${params.id}`
  }

  // 包含影响内容的查询参数
  const importantQueries = ['page', 'size', 'sort']
  const queryParts = importantQueries
    .filter(q => query[q])
    .map(q => `${q}=${query[q]}`)

  if (queryParts.length > 0) {
    key += `-${queryParts.join('-')}`
  }

  return key
}

const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    generateCacheKey
  }
})
```

### 缓存分组

```typescript
// 按功能模块分组缓存
const cacheGroups = {
  user: ['UserList', 'UserDetail', 'UserProfile'],
  product: ['ProductList', 'ProductDetail', 'ProductEdit'],
  order: ['OrderList', 'OrderDetail', 'OrderHistory']
}

// 清除特定分组的缓存
function clearCacheGroup(group: string) {
  const routes = cacheGroups[group] || []
  routes.forEach((routeName) => {
    router.cacheManager.removeFromCache(routeName)
  })
}

// 使用示例
clearCacheGroup('user') // 清除所有用户相关页面的缓存
```

### 缓存压缩

```typescript
// 启用缓存压缩以节省内存
import { compress, decompress } from 'lz-string'

const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    compress: true,
    compressor: {
      compress: (data: any) => compress(JSON.stringify(data)),
      decompress: (data: string) => JSON.parse(decompress(data))
    }
  }
})
```

## 最佳实践

### 1. 合理设置缓存大小

```typescript
// 根据应用规模设置合理的缓存大小
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    max: 15, // 中型应用推荐 10-20
    ttl: 600000 // 10分钟，根据数据更新频率调整
  }
})
```

### 2. 缓存失效策略

```typescript
// 数据更新时主动清除相关缓存
async function updateUser(userId: string, userData: any) {
  await api.updateUser(userId, userData)

  // 清除相关页面缓存
  router.cacheManager.removeFromCache(`UserDetail-${userId}`)
  router.cacheManager.removeFromCache('UserList')
}
```

### 3. 敏感页面不缓存

```typescript
const routes: RouteConfig[] = [
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentView,
    meta: {
      cache: false, // 支付页面不缓存
      sensitive: true
    }
  },
  {
    path: '/admin/logs',
    name: 'AdminLogs',
    component: LogsView,
    meta: {
      cache: false // 日志页面不缓存，确保数据实时性
    }
  }
]
```

### 4. 缓存预加载

```typescript
// 在用户可能访问的页面进行预加载
async function preloadRelatedPages(currentRoute: string) {
  const relatedPages = {
    '/user/list': ['/user/create', '/user/import'],
    '/product/list': ['/product/create', '/product/categories']
  }

  const related = relatedPages[currentRoute]
  if (related) {
    related.forEach((path) => {
      // 预加载但不跳转
      router.resolve(path)
    })
  }
}
```

### 5. 错误处理

```typescript
// 缓存操作的错误处理
try {
  const cacheItem = router.cacheManager.getCacheItem(key)
  if (cacheItem) {
    return cacheItem.component
  }
}
 catch (error) {
  console.error('缓存读取失败:', error)
  // 降级到正常加载
  return await import('./Component.vue')
}
```

缓存管理是性能优化的重要工具，合理使用可以显著提升应用的响应速度和用户体验。
