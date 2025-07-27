# 调试技巧

本章节介绍如何调试 `@ldesign/router` 相关的问题，包括常用的调试方法和工具。

## 开发工具

### 启用开发工具

```typescript
const router = createLDesignRouter({
  routes,
  devTools: process.env.NODE_ENV === 'development'
})
```

### 开发工具功能

- **路由检查器** - 查看当前路由状态
- **性能监控** - 监控路由切换性能
- **错误跟踪** - 跟踪路由相关错误
- **缓存查看器** - 查看缓存状态

## 浏览器调试

### 控制台调试

```typescript
// 在浏览器控制台中访问路由器实例
window.router = router

// 查看当前路由
console.log(router.currentRoute.value)

// 查看所有路由
console.log(router.getRoutes())

// 查看权限状态
console.log(router.permissionManager.getCurrentUser())

// 查看缓存状态
console.log(router.cacheManager.getCacheStats())
```

### Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 在 DevTools 中查看路由状态
3. 监控组件的生命周期
4. 查看响应式数据变化

## 日志调试

### 启用详细日志

```typescript
if (process.env.NODE_ENV === 'development') {
  // 导航日志
  router.beforeEach((to, from, next) => {
    console.group('🧭 Navigation')
    console.log('From:', from.path)
    console.log('To:', to.path)
    console.log('Meta:', to.meta)
    console.groupEnd()
    next()
  })

  // 权限检查日志
  router.permissionManager.onPermissionCheck((result) => {
    console.log('🔐 Permission Check:', result)
  })

  // 缓存操作日志
  router.cacheManager.on('cache:hit', (key) => {
    console.log('💾 Cache Hit:', key)
  })

  router.cacheManager.on('cache:miss', (key) => {
    console.log('💾 Cache Miss:', key)
  })
}
```

### 自定义日志器

```typescript
class RouterLogger {
  private enabled = process.env.NODE_ENV === 'development'

  log(message: string, data?: any) {
    if (!this.enabled)
return
    console.log(`[Router] ${message}`, data)
  }

  warn(message: string, data?: any) {
    if (!this.enabled)
return
    console.warn(`[Router] ${message}`, data)
  }

  error(message: string, error?: any) {
    if (!this.enabled)
return
    console.error(`[Router] ${message}`, error)
  }

  group(title: string) {
    if (!this.enabled)
return
    console.group(`[Router] ${title}`)
  }

  groupEnd() {
    if (!this.enabled)
return
    console.groupEnd()
  }
}

const logger = new RouterLogger()
```

## 错误调试

### 错误边界

```vue
<script setup lang="ts">
function handleError(error: Error, instance: any, info: string) {
  console.error('路由组件错误:', error)
  console.error('错误信息:', info)

  // 发送错误报告
  errorReporting.captureException(error, {
    tags: { type: 'router-component' },
    extra: { info, route: router.currentRoute.value }
  })
}
</script>

<template>
  <div>
    <error-boundary @error="handleError">
      <router-view />
    </error-boundary>
  </div>
</template>
```

### 导航错误处理

```typescript
router.onError((error) => {
  console.error('路由错误:', error)

  // 根据错误类型处理
  if (error.name === 'ChunkLoadError') {
    // 代码分割加载失败
    console.warn('组件加载失败，尝试刷新页面')
    window.location.reload()
  }
 else if (error.name === 'NavigationDuplicated') {
    // 重复导航，可以忽略
    console.warn('重复导航:', error.message)
  }
 else {
    // 其他错误
    showErrorMessage('页面加载失败，请稍后重试')
  }
})
```

## 性能调试

### 路由性能监控

```typescript
class RoutePerformanceMonitor {
  private startTime = 0

  start() {
    this.startTime = performance.now()
  }

  end(routeName: string) {
    const endTime = performance.now()
    const duration = endTime - this.startTime

    console.log(`路由 ${routeName} 加载耗时: ${duration.toFixed(2)}ms`)

    if (duration > 1000) {
      console.warn(`路由 ${routeName} 加载较慢，建议优化`)
    }
  }
}

const monitor = new RoutePerformanceMonitor()

router.beforeEach((to, from, next) => {
  monitor.start()
  next()
})

router.afterEach((to) => {
  monitor.end(to.name as string)
})
```

### 内存使用监控

```typescript
function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log('内存使用情况:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    })
  }
}

// 定期监控内存使用
setInterval(monitorMemoryUsage, 10000)
```

## 权限调试

### 权限检查调试

```typescript
function debugPermissionCheck(route: RouteLocationNormalized) {
  const user = router.permissionManager.getCurrentUser()

  console.group('🔐 Permission Debug')
  console.log('Route:', route.path)
  console.log('User:', user)
  console.log('Required Auth:', route.meta?.requiresAuth)
  console.log('Required Roles:', route.meta?.roles)
  console.log('Required Permissions:', route.meta?.permissions)

  if (route.meta?.roles) {
    const hasRole = router.permissionManager.hasRole(route.meta.roles)
    console.log('Role Check Result:', hasRole)
  }

  if (route.meta?.permissions) {
    const hasPermission = router.permissionManager.hasPermission(route.meta.permissions)
    console.log('Permission Check Result:', hasPermission)
  }

  console.groupEnd()
}
```

### 权限状态可视化

```vue
<script setup lang="ts">
import { usePermission, useRoute } from '@ldesign/router'

const route = useRoute()
const { currentUser } = usePermission()
const showDebugInfo = process.env.NODE_ENV === 'development'
</script>

<template>
  <div v-if="showDebugInfo" class="permission-debug">
    <h3>权限调试信息</h3>
    <div>当前用户: {{ currentUser?.name }}</div>
    <div>用户角色: {{ currentUser?.roles?.join(', ') }}</div>
    <div>用户权限: {{ currentUser?.permissions?.join(', ') }}</div>
    <div>当前路由: {{ route.path }}</div>
    <div>需要认证: {{ route.meta?.requiresAuth ? '是' : '否' }}</div>
    <div>需要角色: {{ route.meta?.roles?.join(', ') || '无' }}</div>
    <div>需要权限: {{ route.meta?.permissions?.join(', ') || '无' }}</div>
  </div>
</template>
```

## 缓存调试

### 缓存状态监控

```typescript
function debugCacheStatus() {
  const stats = router.cacheManager.getCacheStats()
  const keys = router.cacheManager.getCacheKeys()

  console.group('💾 Cache Debug')
  console.log('Cache Stats:', stats)
  console.log('Cache Keys:', keys)
  console.log('Hit Rate:', `${stats.hitRate}%`)
  console.groupEnd()
}

// 定期输出缓存状态
setInterval(debugCacheStatus, 5000)
```

### 缓存可视化组件

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()
const showDebugInfo = process.env.NODE_ENV === 'development'
const stats = ref(router.cacheManager.getCacheStats())
const cacheKeys = ref(router.cacheManager.getCacheKeys())

function updateStats() {
  stats.value = router.cacheManager.getCacheStats()
  cacheKeys.value = router.cacheManager.getCacheKeys()
}

function removeCache(key: string) {
  router.cacheManager.removeFromCache(key)
  updateStats()
}

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(2)} KB`
}

onMounted(() => {
  const timer = setInterval(updateStats, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <div v-if="showDebugInfo" class="cache-debug">
    <h3>缓存调试信息</h3>
    <div>缓存大小: {{ stats.size }}/{{ stats.maxSize }}</div>
    <div>命中率: {{ stats.hitRate }}%</div>
    <div>总大小: {{ formatSize(stats.totalSize) }}</div>

    <h4>缓存项列表</h4>
    <ul>
      <li v-for="key in cacheKeys" :key="key">
        {{ key }}
        <button @click="removeCache(key)">
          删除
        </button>
      </li>
    </ul>
  </div>
</template>
```

## 网络调试

### 组件加载监控

```typescript
const originalImport = window.import || (() => {})

window.import = function (specifier: string) {
  console.log('🔄 Loading component:', specifier)
  const startTime = performance.now()

  return originalImport.call(this, specifier)
    .then((module) => {
      const endTime = performance.now()
      console.log(`✅ Component loaded: ${specifier} (${(endTime - startTime).toFixed(2)}ms)`)
      return module
    })
    .catch((error) => {
      console.error(`❌ Component load failed: ${specifier}`, error)
      throw error
    })
}
```

## 调试工具集成

### Sentry 集成

```typescript
import * as Sentry from '@sentry/vue'

// 路由错误上报
router.onError((error) => {
  Sentry.captureException(error, {
    tags: { type: 'router' },
    extra: {
      currentRoute: router.currentRoute.value,
      timestamp: Date.now()
    }
  })
})

// 性能监控
router.beforeEach((to, from, next) => {
  Sentry.addBreadcrumb({
    message: `Navigation: ${from.path} → ${to.path}`,
    category: 'navigation',
    level: 'info'
  })
  next()
})
```

### 自定义调试面板

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import RouteDebug from './RouteDebug.vue'
import PermissionDebug from './PermissionDebug.vue'
import CacheDebug from './CacheDebug.vue'

const showDebugPanel = ref(process.env.NODE_ENV === 'development')
const activeTab = ref('route')

const tabs = [
  { key: 'route', label: '路由', component: RouteDebug },
  { key: 'permission', label: '权限', component: PermissionDebug },
  { key: 'cache', label: '缓存', component: CacheDebug }
]

const activeTabComponent = computed(() => {
  return tabs.find(tab => tab.key === activeTab.value)?.component
})

function togglePanel() {
  showDebugPanel.value = !showDebugPanel.value
}
</script>

<template>
  <div v-if="showDebugPanel" class="debug-panel">
    <div class="debug-header">
      <h3>Router Debug Panel</h3>
      <button @click="togglePanel">
        关闭
      </button>
    </div>

    <div class="debug-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="debug-content">
      <component :is="activeTabComponent" />
    </div>
  </div>
</template>
```

通过这些调试技巧和工具，可以快速定位和解决路由相关的问题，提高开发效率。
