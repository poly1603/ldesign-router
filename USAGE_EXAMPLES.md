# 路由包功能使用示例

本文档提供了 `@ldesign/router-core` 所有核心功能的完整使用示例。

---

## 📊 1. 路由分析器 (Analytics)

### 基础使用

```typescript
import { createAnalyticsManager } from '@ldesign/router-core'

const analytics = createAnalyticsManager({
  enabled: true,
  enableInDev: false, // 开发环境不启用
  trackPerformance: true,
  trackErrors: true,
  sampleRate: 1, // 100% 采样
  maxRecords: 1000,
  batchInterval: 30000, // 30秒批量上报
  ignoredPaths: [/^\/api/, /^\/admin/],
  report: async (type, data) => {
    // 上报到分析服务
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
  },
})

// 在路由器中使用
router.beforeEach(analytics.createGuard())

// 获取统计数据
const stats = analytics.getStats()
console.log('总访问次数:', stats.totalVisits)
console.log('唯一路由数:', stats.uniqueRoutes)
console.log('平均停留时长:', stats.avgDuration, 'ms')
console.log('平均导航耗时:', stats.avgNavigationTime, 'ms')
console.log('最常访问路由:', stats.topRoutes)
console.log('错误总数:', stats.totalErrors)

// 手动记录性能
analytics.recordPerformance(route, {
  componentLoadTime: 150,
  guardTime: 20,
  renderTime: 80,
})

// 手动记录错误
analytics.recordError({
  type: 'component',
  message: 'Component failed to load',
  path: route.path,
  timestamp: Date.now(),
})
```

### 集成 Google Analytics

```typescript
const analytics = createAnalyticsManager({
  report: (type, data) => {
    if (type === 'visit') {
      // 发送页面浏览事件
      gtag('event', 'page_view', {
        page_path: data.path,
        page_title: data.name,
      })
    } else if (type === 'performance') {
      // 发送性能指标
      gtag('event', 'timing_complete', {
        name: 'route_navigation',
        value: data.duration,
        event_category: 'Navigation',
      })
    }
  },
})
```

---

## 💾 2. 路由缓存管理器 (Cache)

### 基础使用

```typescript
import { createRouteCacheManager } from '@ldesign/router-core'

const cache = createRouteCacheManager({
  max: 10, // 最多缓存 10 个路由
  strategy: 'auto',
  include: [
    '/dashboard',
    '/profile',
    /\/list\/.*/,
  ],
  exclude: [
    '/login',
    '/logout',
    '/admin',
  ],
  ttl: 5 * 60 * 1000, // 5 分钟过期
})

// 缓存组件实例
cache.set(route, componentInstance)

// 获取缓存
const cached = cache.get(route)
if (cached) {
  // 使用缓存的组件
  return cached
}

// 检查是否有缓存
if (cache.has(route)) {
  console.log('该路由有缓存')
}

// 刷新缓存（更新访问时间）
cache.refresh(route)

// 清理特定路由缓存
cache.delete(route)

// 清理所有 /list 开头的路由
cache.clear('/list')

// 获取统计信息
const stats = cache.getStats()
console.log('缓存命中率:', (stats.hitRate * 100).toFixed(2) + '%')
console.log('缓存大小:', stats.size, '/', stats.max)
console.log('内存占用:', (stats.memoryUsage / 1024).toFixed(2) + 'KB')
```

### React 组件缓存

```typescript
// 在 React 中使用
import { useEffect, useRef } from 'react'

function useRouteCache() {
  const cache = useRef(createRouteCacheManager())

  return {
    cache: cache.current,
    cleanup: () => cache.current.destroy(),
  }
}

// 组件中
function MyComponent() {
  const { cache } = useRouteCache()
  const route = useRoute()

  useEffect(() => {
    // 尝试从缓存恢复数据
    const cached = cache.get(route)
    if (cached) {
      // 恢复状态
    }

    return () => {
      // 保存当前状态到缓存
      cache.set(route, componentState)
    }
  }, [route])
}
```

---

## 🎨 3. 路由过渡动画管理器 (Transition)

### 基础使用

```typescript
import { createTransitionManager } from '@ldesign/router-core'

const transition = createTransitionManager({
  default: {
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
  },
  autoDirection: true, // 根据导航方向自动选择动画
  autoDepth: true, // 根据路由深度自动选择动画
  enabled: true,
  disableOnMobile: false,
  disableOnSlowNetwork: true,
  routes: {
    '/home': { type: 'fade', duration: 200 },
    '/profile': { type: 'zoom', direction: 'in' },
    '/settings': { type: 'slide', direction: 'up' },
    '/*/detail': { type: 'slide', direction: 'left' },
  },
})

// 获取过渡配置
const config = transition.getTransition(toRoute, fromRoute, 'forward')

// 获取预设动画
const fadeConfig = transition.getPreset('fade')
const slideLeftConfig = transition.getPreset('slide-left')

// 注册自定义动画
transition.registerTransition('custom-bounce', {
  type: 'custom',
  duration: 400,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  customClass: {
    enter: 'bounce-enter',
    enterActive: 'bounce-enter-active',
    leave: 'bounce-leave',
    leaveActive: 'bounce-leave-active',
  },
})

// 生成 CSS 类名
const classes = transition.generateClasses(config)

// 生成 CSS 样式
const css = transition.generateCSS(config)
```

### React 中使用

```typescript
import { CSSTransition } from 'react-transition-group'

function AnimatedRoutes() {
  const transition = useRef(createTransitionManager())
  const location = useLocation()
  const [prevLocation, setPrevLocation] = useState(location)
  const [direction, setDirection] = useState<NavigationDirection>('forward')

  useEffect(() => {
    // 判断导航方向
    const dir = location.key > prevLocation.key ? 'forward' : 'backward'
    setDirection(dir)
    setPrevLocation(location)
  }, [location])

  const config = transition.current.getTransition(
    location as any,
    prevLocation as any,
    direction
  )

  const classes = transition.current.generateClasses(config)

  return (
    <CSSTransition
      key={location.pathname}
      timeout={config.duration || 300}
      classNames={{
        enter: classes.enter,
        enterActive: classes.enterActive,
        exit: classes.leave,
        exitActive: classes.leaveActive,
      }}
    >
      <Routes location={location}>
        {/* 路由配置 */}
      </Routes>
    </CSSTransition>
  )
}
```

### Vue 中使用

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      :mode="transitionMode"
      :duration="transitionDuration"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createTransitionManager } from '@ldesign/router-core'

const route = useRoute()
const router = useRouter()
const transitionManager = createTransitionManager({
  autoDirection: true,
  autoDepth: true,
})

const transitionName = ref('fade')
const transitionMode = ref('out-in')
const transitionDuration = ref(300)

let prevRoute = route

router.beforeEach((to, from) => {
  const direction = // 判断方向逻辑
  const config = transitionManager.getTransition(to, from, direction)
  
  transitionName.value = `router-transition-${config.type}${config.direction ? '-' + config.direction : ''}`
  transitionMode.value = config.mode || 'out-in'
  transitionDuration.value = config.duration || 300
})
</script>

<style>
/* 使用生成的 CSS */
</style>
```

---

## 💾 4. 路由状态持久化管理器 (Persistence)

### 基础使用

```typescript
import { createPersistenceManager } from '@ldesign/router-core'

const persistence = createPersistenceManager({
  storage: 'localStorage', // 或 'sessionStorage' 或 'memory'
  keyPrefix: 'my-app-router',
  enabled: true,
  autoSave: true,
  autoSaveDelay: 1000,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 天
  include: [
    '/dashboard',
    '/profile',
    /\/form\/.*/,
  ],
  exclude: [
    '/login',
    '/logout',
  ],
  serializer: {
    include: ['path', 'query', 'params', 'meta'],
    exclude: ['matched'],
  },
  version: '1.0.0',
  maxItems: 50,
})

// 保存路由状态
persistence.save(route, {
  scrollPosition: window.scrollY,
  formData: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  selectedTab: 'profile',
})

// 恢复路由状态
const state = persistence.restore(route)
if (state) {
  // 恢复滚动位置
  if (state.data?.scrollPosition) {
    window.scrollTo(0, state.data.scrollPosition)
  }
  
  // 恢复表单数据
  if (state.data?.formData) {
    form.setValues(state.data.formData)
  }
}

// 删除特定路由状态
persistence.delete(route)

// 清理所有表单路由的状态
persistence.clear(/^\/form/)

// 获取统计信息
const stats = persistence.getStats()
console.log('总存储项:', stats.total)
console.log('存储大小:', (stats.size / 1024).toFixed(2) + 'KB')
console.log('过期项:', stats.expired)

// 手动清理过期数据
const cleaned = persistence.cleanup()
console.log('清理了', cleaned, '个过期项')

// 销毁时自动保存
window.addEventListener('beforeunload', () => {
  persistence.destroy()
})
```

### 表单数据持久化

```typescript
// 在表单组件中使用
function FormPage() {
  const route = useRoute()
  const persistence = useRef(createPersistenceManager())
  const [formData, setFormData] = useState({})

  // 恢复表单数据
  useEffect(() => {
    const state = persistence.current.restore(route)
    if (state?.data?.formData) {
      setFormData(state.data.formData)
    }
  }, [])

  // 自动保存表单数据
  useEffect(() => {
    const timer = setTimeout(() => {
      persistence.current.save(route, {
        formData,
        timestamp: Date.now(),
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [formData])

  return (
    <form>
      {/* 表单字段 */}
    </form>
  )
}
```

### 滚动位置恢复

```typescript
// 全局滚动位置管理
const scrollPersistence = createPersistenceManager({
  keyPrefix: 'scroll-position',
  ttl: 24 * 60 * 60 * 1000, // 1 天
})

router.beforeEach((to, from) => {
  // 保存当前页面的滚动位置
  scrollPersistence.save(from, {
    x: window.scrollX,
    y: window.scrollY,
  })
})

router.afterEach((to) => {
  // 恢复目标页面的滚动位置
  const state = scrollPersistence.restore(to)
  if (state?.data) {
    nextTick(() => {
      window.scrollTo(state.data.x, state.data.y)
    })
  } else {
    // 新页面，滚动到顶部
    window.scrollTo(0, 0)
  }
})
```

---

## 🔄 5. 组合使用示例

### 完整的路由增强配置

```typescript
import {
  createAnalyticsManager,
  createRouteCacheManager,
  createTransitionManager,
  createPersistenceManager,
} from '@ldesign/router-core'

// 创建所有管理器
const analytics = createAnalyticsManager({
  enabled: process.env.NODE_ENV === 'production',
  report: (type, data) => {
    // 上报到分析服务
  },
})

const cache = createRouteCacheManager({
  max: 10,
  ttl: 5 * 60 * 1000,
})

const transition = createTransitionManager({
  autoDirection: true,
  autoDepth: true,
})

const persistence = createPersistenceManager({
  storage: 'localStorage',
  ttl: 7 * 24 * 60 * 60 * 1000,
})

// 在路由器中集成
router.beforeEach(async (to, from, next) => {
  // 1. 开始性能追踪
  analytics.startNavigation()
  
  // 2. 记录访问
  analytics.recordVisit(to, from)
  
  // 3. 保存当前路由状态
  persistence.save(from, {
    scrollPosition: window.scrollY,
    // 其他状态...
  })
  
  next()
})

router.afterEach((to, from) => {
  // 4. 记录性能
  analytics.recordPerformance(to)
  
  // 5. 恢复路由状态
  const state = persistence.restore(to)
  if (state) {
    // 恢复状态...
  }
  
  // 6. 获取过渡动画配置
  const transitionConfig = transition.getTransition(to, from)
  // 应用动画...
})

// 错误处理
router.onError((error) => {
  analytics.recordError({
    type: 'navigation',
    message: error.message,
    stack: error.stack,
    path: router.currentRoute.value.path,
    timestamp: Date.now(),
  })
})
```

### React 完整示例

```typescript
// RouterProvider.tsx
import { createContext, useContext, useRef } from 'react'

interface RouterManagers {
  analytics: AnalyticsManager
  cache: RouteCacheManager
  transition: TransitionManager
  persistence: PersistenceManager
}

const RouterManagersContext = createContext<RouterManagers | null>(null)

export function RouterManagersProvider({ children }) {
  const managers = useRef<RouterManagers>({
    analytics: createAnalyticsManager({ enabled: true }),
    cache: createRouteCacheManager({ max: 10 }),
    transition: createTransitionManager({ autoDirection: true }),
    persistence: createPersistenceManager({ storage: 'localStorage' }),
  })

  useEffect(() => {
    return () => {
      // 清理资源
      managers.current.analytics.destroy()
      managers.current.cache.destroy()
      managers.current.persistence.destroy()
    }
  }, [])

  return (
    <RouterManagersContext.Provider value={managers.current}>
      {children}
    </RouterManagersContext.Provider>
  )
}

export function useRouterManagers() {
  const managers = useContext(RouterManagersContext)
  if (!managers) {
    throw new Error('useRouterManagers must be used within RouterManagersProvider')
  }
  return managers
}

// 使用
function App() {
  return (
    <RouterManagersProvider>
      <BrowserRouter>
        <Routes>
          {/* 路由配置 */}
        </Routes>
      </BrowserRouter>
    </RouterManagersProvider>
  )
}
```

### Vue 完整示例

```typescript
// plugins/router-managers.ts
import { inject, provide } from 'vue'
import type { App } from 'vue'
import {
  createAnalyticsManager,
  createRouteCacheManager,
  createTransitionManager,
  createPersistenceManager,
} from '@ldesign/router-core'

const MANAGERS_KEY = Symbol('router-managers')

export interface RouterManagers {
  analytics: AnalyticsManager
  cache: RouteCacheManager
  transition: TransitionManager
  persistence: PersistenceManager
}

export function createRouterManagers(): RouterManagers {
  return {
    analytics: createAnalyticsManager({ enabled: true }),
    cache: createRouteCacheManager({ max: 10 }),
    transition: createTransitionManager({ autoDirection: true }),
    persistence: createPersistenceManager({ storage: 'localStorage' }),
  }
}

export function installRouterManagers(app: App) {
  const managers = createRouterManagers()
  
  app.provide(MANAGERS_KEY, managers)
  
  // 清理
  app.onUnmount(() => {
    managers.analytics.destroy()
    managers.cache.destroy()
    managers.persistence.destroy()
  })
}

export function useRouterManagers(): RouterManagers {
  const managers = inject<RouterManagers>(MANAGERS_KEY)
  if (!managers) {
    throw new Error('Router managers not installed')
  }
  return managers
}

// 在 main.ts 中使用
import { createApp } from 'vue'
import { installRouterManagers } from './plugins/router-managers'

const app = createApp(App)
installRouterManagers(app)
app.mount('#app')
```

---

## 📊 6. 监控仪表盘示例

```typescript
// Dashboard.tsx - 路由监控仪表盘
function RouterDashboard() {
  const { analytics, cache, persistence } = useRouterManagers()
  const [stats, setStats] = useState({
    analytics: analytics.getStats(),
    cache: cache.getStats(),
    persistence: persistence.getStats(),
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setStats({
        analytics: analytics.getStats(),
        cache: cache.getStats(),
        persistence: persistence.getStats(),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="dashboard">
      <div className="card">
        <h3>路由分析</h3>
        <p>总访问: {stats.analytics.totalVisits}</p>
        <p>唯一路由: {stats.analytics.uniqueRoutes}</p>
        <p>平均停留: {stats.analytics.avgDuration.toFixed(0)}ms</p>
        <p>错误数: {stats.analytics.totalErrors}</p>
      </div>

      <div className="card">
        <h3>缓存状态</h3>
        <p>缓存大小: {stats.cache.size} / {stats.cache.max}</p>
        <p>命中率: {(stats.cache.hitRate * 100).toFixed(2)}%</p>
        <p>内存占用: {(stats.cache.memoryUsage / 1024).toFixed(2)}KB</p>
      </div>

      <div className="card">
        <h3>持久化状态</h3>
        <p>总项数: {stats.persistence.total}</p>
        <p>存储大小: {(stats.persistence.size / 1024).toFixed(2)}KB</p>
        <p>过期项: {stats.persistence.expired}</p>
      </div>
    </div>
  )
}
```

---

## 🎯 7. 最佳实践

### 生产环境配置

```typescript
const isProduction = process.env.NODE_ENV === 'production'

// 生产环境：启用所有功能，优化性能
const productionConfig = {
  analytics: {
    enabled: true,
    enableInDev: false,
    sampleRate: 0.1, // 10% 采样
    batchInterval: 60000, // 1 分钟上报
  },
  cache: {
    max: 20,
    ttl: 10 * 60 * 1000, // 10 分钟
  },
  transition: {
    disableOnMobile: true,
    disableOnSlowNetwork: true,
  },
  persistence: {
    storage: 'localStorage',
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 天
    maxItems: 50,
  },
}

// 开发环境：禁用部分功能，方便调试
const developmentConfig = {
  analytics: {
    enabled: true,
    enableInDev: true,
    sampleRate: 1, // 100% 采样
  },
  cache: {
    max: 5,
    ttl: 0, // 不过期
  },
  transition: {
    disableOnMobile: false,
    disableOnSlowNetwork: false,
  },
  persistence: {
    storage: 'sessionStorage',
    ttl: 0,
  },
}

const config = isProduction ? productionConfig : developmentConfig
```

### 内存管理

```typescript
// 定期清理缓存
setInterval(() => {
  cache.getStats().hitRate < 0.5 && cache.clear()
  persistence.cleanup()
}, 5 * 60 * 1000) // 每 5 分钟

// 监听内存压力
if ('performance' in window && 'memory' in performance) {
  const checkMemory = () => {
    const memory = (performance as any).memory
    const usedMemory = memory.usedJSHeapSize / memory.jsHeapSizeLimit

    if (usedMemory > 0.9) {
      console.warn('Memory pressure detected, clearing caches')
      cache.clear()
      persistence.clear()
    }
  }

  setInterval(checkMemory, 60000) // 每分钟检查
}
```

### 错误恢复

```typescript
// 全局错误处理
window.addEventListener('error', (event) => {
  analytics.recordError({
    type: 'navigation',
    message: event.error?.message || 'Unknown error',
    stack: event.error?.stack,
    path: router.currentRoute.value.path,
    timestamp: Date.now(),
  })
})

// 路由错误处理
router.onError((error, to) => {
  analytics.recordError({
    type: 'navigation',
    message: error.message,
    stack: error.stack,
    path: to.path,
    timestamp: Date.now(),
  })

  // 清除可能损坏的缓存
  cache.delete(to)
  persistence.delete(to)
})
```

---

## 🚀 性能优化建议

1. **Analytics**: 使用采样降低性能开销
2. **Cache**: 根据业务设置合理的 max 和 ttl
3. **Transition**: 在慢速设备上禁用动画
4. **Persistence**: 使用 autoSave 减少写入次数

更多示例请参考各个包的 `examples/` 目录。
