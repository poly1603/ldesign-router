# 开发工具

开发工具提供了强大的调试和监控功能，帮助开发者快速定位和解决路由相关的问题。`@ldesign/router` 内置了完整的开发工具套件。

## 基础配置

### 启用开发工具

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  devTools: process.env.NODE_ENV === 'development'
})
```

### 详细配置

```typescript
const router = createLDesignRouter({
  routes,
  devTools: {
    enabled: process.env.NODE_ENV === 'development',
    position: 'bottom',
    size: 'medium',
    features: {
      routeInspector: true,
      performanceMonitor: true,
      errorTracker: true,
      cacheViewer: true,
      animationDebugger: true
    }
  }
})
```

### 配置选项

```typescript
interface DevToolsConfig {
  enabled?: boolean // 是否启用开发工具
  position?: 'top' | 'bottom' | 'left' | 'right' // 面板位置
  size?: 'small' | 'medium' | 'large' // 面板大小
  features?: { // 功能开关
    routeInspector?: boolean
    performanceMonitor?: boolean
    errorTracker?: boolean
    cacheViewer?: boolean
    animationDebugger?: boolean
  }
}
```

## 功能模块

### 路由检查器

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const currentRoute = useRoute()

const routeHistory = computed(() => {
  return router.devTools.getRouteHistory()
})

const routeTree = computed(() => {
  return router.devTools.getRouteTree()
})

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<template>
  <div class="route-inspector">
    <h3>路由检查器</h3>

    <!-- 当前路由信息 -->
    <div class="current-route">
      <h4>当前路由</h4>
      <div class="route-info">
        <div class="info-item">
          <label>路径:</label>
          <span>{{ currentRoute.path }}</span>
        </div>
        <div class="info-item">
          <label>名称:</label>
          <span>{{ currentRoute.name }}</span>
        </div>
        <div class="info-item">
          <label>参数:</label>
          <pre>{{ JSON.stringify(currentRoute.params, null, 2) }}</pre>
        </div>
        <div class="info-item">
          <label>查询:</label>
          <pre>{{ JSON.stringify(currentRoute.query, null, 2) }}</pre>
        </div>
        <div class="info-item">
          <label>元信息:</label>
          <pre>{{ JSON.stringify(currentRoute.meta, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 路由历史 -->
    <div class="route-history">
      <h4>路由历史</h4>
      <div class="history-list">
        <div
          v-for="(route, index) in routeHistory"
          :key="index"
          class="history-item" :class="[{ 'is-current': index === routeHistory.length - 1 }]"
        >
          <span class="route-path">{{ route.path }}</span>
          <span class="route-time">{{ formatTime(route.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- 路由树 -->
    <div class="route-tree">
      <h4>路由树</h4>
      <route-tree-node
        v-for="route in routeTree"
        :key="route.path"
        :route="route"
      />
    </div>
  </div>
</template>
```

### 性能监控

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()
const chartCanvas = ref<HTMLCanvasElement>()

const performanceData = computed(() => {
  return router.devTools.getPerformanceData()
})

const averageNavigationTime = computed(() => {
  const data = performanceData.value
  return data.totalTime / data.count
})

const slowestNavigation = computed(() => {
  return performanceData.value.slowest
})

const totalNavigations = computed(() => {
  return performanceData.value.count
})

const recentNavigations = computed(() => {
  return performanceData.value.recent.slice(0, 10)
})

function drawChart() {
  if (!chartCanvas.value)
return

  const ctx = chartCanvas.value.getContext('2d')
  const data = performanceData.value.timeline

  // 绘制性能趋势图
  ctx.clearRect(0, 0, 400, 200)
  ctx.strokeStyle = '#1890ff'
  ctx.lineWidth = 2

  ctx.beginPath()
  data.forEach((point, index) => {
    const x = (index / (data.length - 1)) * 400
    const y = 200 - (point.time / 2000) * 200

    if (index === 0) {
      ctx.moveTo(x, y)
    }
 else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
}

onMounted(() => {
  drawChart()
})

watch(performanceData, drawChart)
</script>

<template>
  <div class="performance-monitor">
    <h3>性能监控</h3>

    <!-- 性能指标 -->
    <div class="metrics">
      <div class="metric-item">
        <label>平均导航时间:</label>
        <span>{{ averageNavigationTime }}ms</span>
      </div>
      <div class="metric-item">
        <label>最慢导航:</label>
        <span>{{ slowestNavigation.path }} ({{ slowestNavigation.time }}ms)</span>
      </div>
      <div class="metric-item">
        <label>总导航次数:</label>
        <span>{{ totalNavigations }}</span>
      </div>
    </div>

    <!-- 性能图表 -->
    <div class="performance-chart">
      <h4>导航时间趋势</h4>
      <canvas ref="chartCanvas" width="400" height="200" />
    </div>

    <!-- 性能详情 -->
    <div class="performance-details">
      <h4>最近导航</h4>
      <table class="performance-table">
        <thead>
          <tr>
            <th>路径</th>
            <th>时间</th>
            <th>组件加载</th>
            <th>权限检查</th>
            <th>总耗时</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="nav in recentNavigations"
            :key="nav.id"
            :class="{ 'is-slow': nav.totalTime > 1000 }"
          >
            <td>{{ nav.path }}</td>
            <td>{{ formatTime(nav.timestamp) }}</td>
            <td>{{ nav.componentLoadTime }}ms</td>
            <td>{{ nav.permissionCheckTime }}ms</td>
            <td>{{ nav.totalTime }}ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

### 错误跟踪

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()
const errorFilter = ref('all')

const errorData = computed(() => {
  return router.devTools.getErrorData()
})

const totalErrors = computed(() => {
  return errorData.value.total
})

const recentErrors = computed(() => {
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  return errorData.value.errors.filter(error =>
    error.timestamp > oneDayAgo
  ).length
})

const errorRate = computed(() => {
  const total = router.devTools.getTotalNavigations()
  return total > 0 ? ((totalErrors.value / total) * 100).toFixed(2) : 0
})

const errorList = computed(() => {
  let errors = errorData.value.errors

  if (errorFilter.value !== 'all') {
    errors = errors.filter(error => error.level === errorFilter.value)
  }

  return errors.slice(0, 20) // 显示最近20个错误
})

function clearErrors() {
  router.devTools.clearErrors()
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}
</script>

<template>
  <div class="error-tracker">
    <h3>错误跟踪</h3>

    <!-- 错误统计 -->
    <div class="error-stats">
      <div class="stat-item">
        <label>总错误数:</label>
        <span class="error-count">{{ totalErrors }}</span>
      </div>
      <div class="stat-item">
        <label>最近24小时:</label>
        <span>{{ recentErrors }}</span>
      </div>
      <div class="stat-item">
        <label>错误率:</label>
        <span>{{ errorRate }}%</span>
      </div>
    </div>

    <!-- 错误列表 -->
    <div class="error-list">
      <h4>错误列表</h4>
      <div
        v-for="error in errorList"
        :key="error.id"
        class="error-item" :class="[`error-${error.level}`]"
      >
        <div class="error-header">
          <span class="error-type">{{ error.type }}</span>
          <span class="error-time">{{ formatTime(error.timestamp) }}</span>
          <span class="error-level" :class="[`level-${error.level}`]">
            {{ error.level }}
          </span>
        </div>
        <div class="error-message">
          {{ error.message }}
        </div>
        <div class="error-stack">
          <details>
            <summary>堆栈信息</summary>
            <pre>{{ error.stack }}</pre>
          </details>
        </div>
        <div class="error-context">
          <div>路由: {{ error.route }}</div>
          <div>用户代理: {{ error.userAgent }}</div>
        </div>
      </div>
    </div>

    <!-- 错误过滤 -->
    <div class="error-filters">
      <select v-model="errorFilter">
        <option value="all">
          所有错误
        </option>
        <option value="error">
          错误
        </option>
        <option value="warning">
          警告
        </option>
        <option value="info">
          信息
        </option>
      </select>
      <button @click="clearErrors">
        清空错误
      </button>
    </div>
  </div>
</template>
```

### 缓存查看器

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()
const inspectedItem = ref(null)

const cacheStats = computed(() => {
  return router.cacheManager.getCacheStats()
})

const cacheItems = computed(() => {
  return router.devTools.getCacheItems()
})

function inspectCacheItem(item: any) {
  inspectedItem.value = item
}

function removeCacheItem(key: string) {
  router.cacheManager.removeFromCache(key)
}

function closeInspector() {
  inspectedItem.value = null
}

function formatSize(bytes: number) {
  if (bytes < 1024)
return `${bytes} B`
  if (bytes < 1024 * 1024)
return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<template>
  <div class="cache-viewer">
    <h3>缓存查看器</h3>

    <!-- 缓存统计 -->
    <div class="cache-stats">
      <div class="stat-item">
        <label>缓存大小:</label>
        <span>{{ cacheStats.size }}/{{ cacheStats.maxSize }}</span>
      </div>
      <div class="stat-item">
        <label>命中率:</label>
        <span>{{ cacheStats.hitRate }}%</span>
      </div>
      <div class="stat-item">
        <label>总大小:</label>
        <span>{{ formatSize(cacheStats.totalSize) }}</span>
      </div>
    </div>

    <!-- 缓存项列表 -->
    <div class="cache-items">
      <h4>缓存项</h4>
      <table class="cache-table">
        <thead>
          <tr>
            <th>键</th>
            <th>大小</th>
            <th>创建时间</th>
            <th>最后访问</th>
            <th>访问次数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cacheItems" :key="item.key">
            <td>{{ item.key }}</td>
            <td>{{ formatSize(item.size) }}</td>
            <td>{{ formatTime(item.createdAt) }}</td>
            <td>{{ formatTime(item.lastAccessed) }}</td>
            <td>{{ item.accessCount }}</td>
            <td>
              <button @click="inspectCacheItem(item)">
                查看
              </button>
              <button @click="removeCacheItem(item.key)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 缓存详情模态框 -->
    <div v-if="inspectedItem" class="cache-modal">
      <div class="modal-content">
        <h4>缓存项详情</h4>
        <div class="cache-detail">
          <div>键: {{ inspectedItem.key }}</div>
          <div>类型: {{ inspectedItem.type }}</div>
          <div>大小: {{ formatSize(inspectedItem.size) }}</div>
          <div>TTL: {{ inspectedItem.ttl }}ms</div>
          <div>数据:</div>
          <pre>{{ JSON.stringify(inspectedItem.data, null, 2) }}</pre>
        </div>
        <button @click="closeInspector">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
```

## 开发工具 API

### 程序化访问

```typescript
// 获取开发工具实例
const devTools = router.devTools

// 路由检查
const currentRoute = devTools.getCurrentRoute()
const routeHistory = devTools.getRouteHistory()
const routeTree = devTools.getRouteTree()

// 性能监控
const performanceData = devTools.getPerformanceData()
const navigationTiming = devTools.getNavigationTiming()

// 错误跟踪
const errorData = devTools.getErrorData()
devTools.logError(error, context)
devTools.clearErrors()

// 缓存查看
const cacheItems = devTools.getCacheItems()
const cacheStats = devTools.getCacheStats()

// 动画调试
const animationState = devTools.getAnimationState()
devTools.setAnimationDebugMode(true)
```

### 自定义插件

```typescript
// 创建自定义开发工具插件
const customPlugin = {
  name: 'CustomPlugin',

  install(devTools: DevTools) {
    // 添加自定义面板
    devTools.addPanel({
      id: 'custom-panel',
      title: '自定义面板',
      component: CustomPanelComponent
    })

    // 添加自定义指标
    devTools.addMetric({
      id: 'custom-metric',
      name: '自定义指标',
      getValue: () => getCustomMetricValue()
    })
  }
}

// 注册插件
router.devTools.use(customPlugin)
```

## 最佳实践

### 1. 生产环境安全

```typescript
// 确保开发工具不会泄露到生产环境
const router = createLDesignRouter({
  routes,
  devTools: process.env.NODE_ENV === 'development' && {
    enabled: true,
    // 开发环境配置
  }
})

// 运行时检查
if (process.env.NODE_ENV === 'production' && router.devTools?.enabled) {
  console.warn('开发工具在生产环境中被启用，这可能存在安全风险')
}
```

### 2. 性能影响最小化

```typescript
// 使用懒加载减少开发工具对性能的影响
const devTools = {
  enabled: process.env.NODE_ENV === 'development',
  lazy: true, // 懒加载开发工具
  features: {
    routeInspector: true,
    performanceMonitor: false, // 在不需要时禁用性能监控
    errorTracker: true,
    cacheViewer: true,
    animationDebugger: false
  }
}
```

### 3. 团队协作

```typescript
// 团队共享的开发工具配置
const teamDevToolsConfig = {
  enabled: process.env.NODE_ENV === 'development',
  position: 'bottom',
  size: 'medium',
  features: {
    routeInspector: true,
    performanceMonitor: true,
    errorTracker: true,
    cacheViewer: process.env.VITE_CACHE_DEBUG === 'true',
    animationDebugger: process.env.VITE_ANIMATION_DEBUG === 'true'
  }
}

// 个人定制配置
const personalConfig = {
  ...teamDevToolsConfig,
  ...JSON.parse(localStorage.getItem('devtools-config') || '{}')
}
```

开发工具是提高开发效率和代码质量的重要工具，通过合理的配置和使用，可以帮助开发者快速定位问题并优化应用性能。
