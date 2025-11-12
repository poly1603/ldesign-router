# @ldesign/router-core 快速参考

## 📦 安装

```bash
npm install @ldesign/router-core
```

## 🚀 快速开始

```typescript
import { createEnhancedRouter, createWebHistory } from '@ldesign/router-core'

const router = createEnhancedRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User },
  ],
  history: createWebHistory(),
})
```

## 📚 核心功能速查

### 1. 路由验证
```typescript
import { validateRoutes, generateReport } from '@ldesign/router-core'

const result = validateRoutes(routes, { strict: true })
if (!result.valid) {
  console.warn(generateReport(result))
}
```

### 2. 链式API
```typescript
import { createChainableRouter } from '@ldesign/router-core'

const routes = createChainableRouter()
  .page('/', Home, 'home')
  .route('/user/:id', b => b.name('user').component(User))
  .group('/admin', g => {
    g.page('/users', AdminUsers)
      .page('/settings', AdminSettings)
  })
  .getRoutes()
```

### 3. Promise导航
```typescript
import { createPromiseRouter } from '@ldesign/router-core'

const promiseRouter = createPromiseRouter()

await promiseRouter.push('/dashboard')
await promiseRouter.navigateWithRetry('/api', { maxRetries: 3 })
```

### 4. 类型安全
```typescript
import { defineRoute, createTypedRoute } from '@ldesign/router-core'

const route = defineRoute({
  path: '/user/:id',
  name: 'user' as const,
  component: User,
  meta: { requiresAuth: true },
})

const location = createTypedRoute('user', { id: '123' })
```

### 5. 历史增强
```typescript
import { createEnhancedHistory } from '@ldesign/router-core'

const history = createEnhancedHistory({
  base: createWebHistory(),
  maxHistory: 100,
  persistence: { enabled: true },
})

// 拦截
history.addInterceptor(async (to, from, direction) => {
  return confirm('Continue?')
})
```

### 6. 懒加载
```typescript
import { LazyLoadManager, LoadProgressTracker } from '@ldesign/router-core'

const loader = new LazyLoadManager({ maxRetries: 3 })
const component = await loader.load(() => import('./User.vue'))

const tracker = new LoadProgressTracker()
tracker.onProgress(p => console.log(`${p * 100}%`))
```

### 7. 性能监控
```typescript
import { createPerformanceMonitor } from '@ldesign/router-core'

const monitor = createPerformanceMonitor({
  slowNavigationThreshold: 1000,
})

monitor.recordNavigation(metrics)
const stats = monitor.getStats()
```

### 8. 路径匹配优化
```typescript
import { createTrieMatcher } from '@ldesign/router-core'

const matcher = createTrieMatcher()
matcher.insert('/user/:id', { component: User })

const result = matcher.match('/user/123')
// { data, params: { id: '123' } }
```

### 9. 内存监控
```typescript
import { createMemoryMonitor } from '@ldesign/router-core'

const monitor = createMemoryMonitor(5000)
monitor.start()

monitor.onMemoryChange(usage => {
  if (monitor.detectLeak()) {
    console.warn('Memory leak!')
  }
})
```

### 10. I18n路由
```typescript
import { createI18nRouter } from '@ldesign/router-core'

const i18n = createI18nRouter({
  defaultLocale: 'en',
  locales: ['en', 'zh'],
  translations: {
    '/about': { en: '/about', zh: '/关于' },
  },
})

i18n.setLocale('zh')
const path = i18n.translatePath('/about') // '/zh/关于'
```

### 11. 守卫管理
```typescript
import { createGuardManager, composeGuards } from '@ldesign/router-core'

const guards = createGuardManager()

guards.register('auth', async (to, from) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    return '/login'
  }
})

const combined = composeGuards(authGuard, roleGuard)
```

### 12. 滚动管理
```typescript
import { createScrollManager, alwaysScrollToTop } from '@ldesign/router-core'

const scroll = createScrollManager({
  behavior: alwaysScrollToTop(),
})

scroll.savePosition('/user/123')
scroll.restorePosition('/user/123')
```

### 13. 插件系统
```typescript
import { createPluginManager, loggerPlugin } from '@ldesign/router-core'

const plugins = createPluginManager()

plugins.use(loggerPlugin({ level: 'info' }))
plugins.use(myCustomPlugin)
```

### 14. 代码分割
```typescript
import { createRouteBasedSplit } from '@ldesign/router-core'

const strategy = createRouteBasedSplit()
const chunkName = strategy.getChunkName('/user/123') // 'user'
```

### 15. DevTools
```typescript
import { createDevToolsConnector } from '@ldesign/router-core'

const devtools = createDevToolsConnector()
devtools.logNavigation('/home', '/user', 150)
devtools.logError(error)
```

## 🎯 常见场景

### 场景1: 带认证的完整路由

```typescript
import {
  createEnhancedRouter,
  createEnhancedHistory,
  createChainableRouter,
  validateRoutes,
} from '@ldesign/router-core'

// 1. 定义路由
const routes = createChainableRouter()
  .route('/', b => b.name('home').component(Home))
  .route('/login', b => b.name('login').component(Login))
  .route('/dashboard', b => {
    b.name('dashboard')
      .component(Dashboard)
      .requiresAuth()
      .roles(['admin', 'user'])
  })
  .getRoutes()

// 2. 验证路由
const validation = validateRoutes(routes)

// 3. 创建增强历史
const history = createEnhancedHistory({
  base: createWebHistory(),
  persistence: { enabled: true },
})

// 4. 创建路由器
const router = createEnhancedRouter({ routes, history })

// 5. 添加守卫
router.beforeEach((to, from, next) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 场景2: 国际化应用

```typescript
import { createI18nRouter, defineRouteModule } from '@ldesign/router-core'

// I18n配置
const i18n = createI18nRouter({
  defaultLocale: 'en',
  locales: ['en', 'zh', 'ja'],
  translations: {
    '/about': { en: '/about', zh: '/关于', ja: '/について' },
    '/contact': { en: '/contact', zh: '/联系', ja: '/お問い合わせ' },
  },
})

// 路由模块
const routes = defineRouteModule({
  name: 'main',
  routes: [
    { path: '/', component: Home },
    { path: i18n.translatePath('/about'), component: About },
  ],
})

// 切换语言
function switchLanguage(locale: string) {
  i18n.setLocale(locale)
  const newPath = i18n.translatePath(currentPath)
  router.push(newPath)
}
```

### 场景3: 大型应用优化

```typescript
import {
  createTrieMatcher,
  createMemoryMonitor,
  createPerformanceMonitor,
  LazyLoadManager,
} from '@ldesign/router-core'

// Trie树匹配
const matcher = createTrieMatcher()
routes.forEach(r => matcher.insert(r.path, r))

// 内存监控
const memMonitor = createMemoryMonitor(10000)
memMonitor.start()
memMonitor.onMemoryChange(usage => {
  if (memMonitor.detectLeak()) {
    console.warn('Memory leak detected!')
  }
})

// 性能监控
const perfMonitor = createPerformanceMonitor()
router.afterEach((to, from) => {
  // 记录性能
})

// 懒加载
const loader = new LazyLoadManager()
const components = await loader.loadAll([
  () => import('./A'),
  () => import('./B'),
])
```

## 📝 TypeScript类型

```typescript
import type {
  RouteRecordRaw,
  RouteLocationRaw,
  NavigationGuard,
  TypedRouteRecordRaw,
  ExtendedRouteMeta,
  HistoryEntry,
  MemoryUsage,
  I18nRouteConfig,
} from '@ldesign/router-core'
```

## 🔗 相关文档

- [新功能使用指南](./NEW_FEATURES.md) - 详细教程
- [优化状态](./OPTIMIZATION_STATUS.md) - 完成进度
- [最终状态](./FINAL_STATUS.md) - 完整总结

## 💡 提示

- 开发环境启用 `validateRoutes()` 和性能监控
- 生产环境使用历史持久化和内存监控
- 大型应用考虑Trie树匹配和代码分割
- 国际化应用使用I18n路由管理器
