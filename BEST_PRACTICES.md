# @ldesign/router 最佳实践指南

本指南汇总了使用 `@ldesign/router` 的最佳实践和性能优化建议。

---

## 📚 目录

1. [路由配置最佳实践](#路由配置最佳实践)
2. [性能优化建议](#性能优化建议)
3. [SEO 优化指南](#seo-优化指南)
4. [SSR 使用指南](#ssr-使用指南)
5. [错误处理策略](#错误处理策略)
6. [内存管理建议](#内存管理建议)
7. [安全性考虑](#安全性考虑)
8. [常见问题解答](#常见问题解答)

---

## 路由配置最佳实践

### 1. 路由结构组织

✅ **推荐做法**：

```typescript
// 按功能模块组织路由
const routes = [
  {
    path: '/user',
    component: UserLayout,
    meta: { title: '用户中心' },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('./views/user/Profile.vue'),
        meta: { title: '个人资料', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('./views/user/Settings.vue'),
        meta: { title: '设置', requiresAuth: true }
      }
    ]
  }
]
```

❌ **避免做法**：

```typescript
// 扁平化所有路由，难以维护
const routes = [
  { path: '/user-profile', component: UserProfile },
  { path: '/user-settings', component: UserSettings },
  { path: '/user-orders', component: UserOrders },
  // ... 数十个路由
]
```

### 2. 命名路由使用

✅ **推荐做法**：

```typescript
// 使用命名路由，便于维护和重构
{
  path: '/user/:id',
  name: 'UserDetail',
  component: UserDetail
}

// 导航时使用名称
router.push({ name: 'UserDetail', params: { id: '123' } })
```

### 3. 路由懒加载

✅ **推荐做法**：

```typescript
// 使用动态 import 实现代码分割
{
  path: '/dashboard',
  component: () => import(
    /* webpackChunkName: "dashboard" */
    './views/Dashboard.vue'
  )
}
```

### 4. 路由元信息规范

✅ **推荐做法**：

```typescript
{
  path: '/admin',
  meta: {
    title: '管理后台',
    requiresAuth: true,
    roles: ['admin'],
    keepAlive: false,
    preload: 'hover',
    noIndex: true,  // SEO：不索引
    seo: {
      openGraph: {
        image: '/admin-og.jpg'
      }
    }
  }
}
```

---

## 性能优化建议

### 1. 启用路由预热

```typescript
import { createRouter } from '@ldesign/router'

const router = createRouter({ ... })

// 应用启动后预热常用路由
router.isReady().then(() => {
  // 方案1：手动指定路由
  router.options.history.matcher?.preheat([
    '/home',
    '/products',
    '/about'
  ])
  
  // 方案2：自动预热热点路由
  router.options.history.matcher?.preheat()
})
```

**效果**：首次访问速度提升 60-80%

### 2. 使用智能预加载

```typescript
import { createSmartPreloadPlugin } from '@ldesign/router/plugins/smart-preload'

const smartPreload = createSmartPreloadPlugin({
  enabled: true,
  maxConcurrent: 2,
  minConfidence: 0.6,
  wifiOnly: true,  // 仅Wi-Fi预加载
  considerMemory: true  // 考虑设备内存
})

smartPreload.install(router)
```

**效果**：页面切换速度提升 40-60%

### 3. 合理配置 KeepAlive

```vue
<template>
  <!-- 仅缓存需要的组件 -->
  <RouterView 
    :keep-alive="true"
    :max="5"
    :include="['Home', 'ProductList']"
  />
</template>
```

❌ **避免**：

```vue
<!-- 缓存所有组件，导致内存占用过高 -->
<RouterView :keep-alive="true" />
```

### 4. 使用性能监控

```typescript
// 开发环境启用性能监控
if (import.meta.env.DEV) {
  const { createPerformancePanel } = await import('@ldesign/router/debug')
  const panel = createPerformancePanel()
  panel.attach(router)
}
```

### 5. 启用内存泄漏检测

```typescript
// 开发环境检测内存泄漏
if (import.meta.env.DEV) {
  const { createMemoryLeakDetector } = await import('@ldesign/router')
  const detector = createMemoryLeakDetector({
    interval: 30000,
    onLeakDetected: (report) => {
      console.warn('🚨 内存泄漏:', report)
    }
  })
  detector.start()
}
```

---

## SEO 优化指南

### 1. 基础 SEO 配置

```typescript
import { createSEOPlugin } from '@ldesign/router/features/seo'

const seoPlugin = createSEOPlugin({
  titleTemplate: '%s | 我的网站',
  baseUrl: 'https://example.com',
  defaultDescription: '网站默认描述',
  defaultImage: 'https://example.com/og-image.jpg',
  openGraph: {
    siteName: '我的网站',
    locale: 'zh_CN',
    type: 'website'
  },
  twitter: {
    site: '@mywebsite',
    card: 'summary_large_image'
  }
})

seoPlugin.install(router)
```

### 2. 路由级 SEO 配置

```typescript
{
  path: '/blog/:id',
  component: BlogPost,
  meta: {
    title: '博客文章',
    description: '阅读我们的最新博客文章',
    sitemapPriority: 0.8,
    sitemapChangefreq: 'weekly',
    seo: {
      meta: {
        keywords: ['博客', '技术', '分享']
      },
      openGraph: {
        type: 'article',
        image: '/blog-og.jpg'
      },
      structuredData: {
        '@type': 'BlogPosting',
        headline: '文章标题',
        author: {
          '@type': 'Person',
          name: '作者'
        }
      }
    }
  }
}
```

### 3. 生成 Sitemap

```typescript
// 服务端代码
import { SEOManager } from '@ldesign/router/features/seo'

const seoManager = new SEOManager({ baseUrl: 'https://example.com' })

app.get('/sitemap.xml', (req, res) => {
  const routes = router.getRoutes()
  const sitemap = seoManager.generateSitemap(routes, 'https://example.com')
  
  res.header('Content-Type', 'application/xml')
  res.send(sitemap)
})
```

---

## SSR 使用指南

### 1. 基础 SSR 设置

```typescript
// server.ts
import { createSSRManager } from '@ldesign/router/ssr'

const ssrManager = createSSRManager({
  cache: {
    enabled: true,
    ttl: 300  // 缓存5分钟
  }
})

app.get('*', async (req, res) => {
  const context = await ssrManager.renderRoute(req.url, router)
  
  const html = renderToString(app, context)
  const stateHTML = ssrManager.serializeState(context.state)
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="app">${html}</div>
        ${stateHTML}
      </body>
    </html>
  `)
})
```

### 2. 数据预取

```vue
<script setup>
import { useSSRData } from '@ldesign/router/ssr'

// 服务端预取，客户端恢复
const data = useSSRData('pageData', async () => {
  const res = await fetch('/api/data')
  return res.json()
})
</script>
```

### 3. 异步数据处理

```vue
<script setup>
import { useAsyncData } from '@ldesign/router/ssr'

const { data, loading, error, refresh } = useAsyncData(
  async () => {
    const res = await fetch('/api/data')
    return res.json()
  },
  { 
    lazy: false,  // 立即加载
    key: 'pageData'  // SSR 注水键
  }
)
</script>
```

---

## 错误处理策略

### 1. 全局错误处理

```typescript
router.onError((error) => {
  console.error('路由错误:', error)
  
  // 组件加载失败 - 刷新页面
  if (error.message.includes('Loading chunk')) {
    alert('页面加载失败，即将刷新')
    setTimeout(() => window.location.reload(), 1000)
  }
  
  // 权限错误 - 重定向到登录
  if (error.message.includes('permission')) {
    router.push('/login')
  }
})
```

### 2. 守卫错误处理

```typescript
router.beforeEach((to, from, next) => {
  try {
    // 权限检查
    if (to.meta.requiresAuth && !isAuthenticated()) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    
    next()
  } catch (error) {
    console.error('守卫错误:', error)
    next(false)  // 取消导航
  }
})
```

### 3. 组件级错误边界

```vue
<template>
  <ErrorBoundary @error="handleError">
    <RouterView />
  </ErrorBoundary>
</template>

<script setup>
import { ErrorBoundary } from '@ldesign/router'

const handleError = (error: Error) => {
  console.error('组件错误:', error)
  // 显示友好的错误页面
}
</script>
```

---

## 内存管理建议

### 1. 使用内存泄漏检测

```typescript
// 开发环境启用
if (import.meta.env.DEV) {
  const { createMemoryLeakDetector } = await import('@ldesign/router')
  
  const detector = createMemoryLeakDetector({
    enabled: true,
    interval: 30000,
    severityThreshold: 5,
    onLeakDetected: (report) => {
      console.warn('内存泄漏检测:', report)
      
      // 发送到监控系统
      if (report.severity >= 8) {
        analytics.track('memory_leak_critical', report)
      }
    }
  })
  
  detector.start()
}
```

### 2. 清理资源

```vue
<script setup>
import { onBeforeRouteLeave } from '@ldesign/router'
import { onUnmounted } from 'vue'

// 定时器
const timerId = setInterval(() => {}, 1000)

// 事件监听器
const handler = () => {}
window.addEventListener('resize', handler)

// 路由离开时清理
onBeforeRouteLeave((to, from, next) => {
  clearInterval(timerId)
  window.removeEventListener('resize', handler)
  next()
})

// 或使用组件卸载钩子
onUnmounted(() => {
  clearInterval(timerId)
  window.removeEventListener('resize', handler)
})
</script>
```

### 3. 控制缓存大小

```vue
<template>
  <!-- 限制缓存组件数量 -->
  <RouterView 
    :keep-alive="true"
    :max="5"
    :exclude="['HeavyComponent']"
  />
</template>
```

---

## 安全性考虑

### 1. 路由权限控制

```typescript
// 全局权限守卫
router.beforeEach((to, from, next) => {
  // 检查登录状态
  if (to.meta.requiresAuth && !store.state.user) {
    next('/login')
    return
  }
  
  // 检查角色权限
  if (to.meta.roles) {
    const userRole = store.state.user?.role
    if (!to.meta.roles.includes(userRole)) {
      next('/403')
      return
    }
  }
  
  next()
})
```

### 2. 参数验证

```typescript
router.beforeEach((to, from, next) => {
  // 验证必需参数
  if (to.name === 'UserDetail' && !to.params.id) {
    next('/404')
    return
  }
  
  // 验证参数格式
  if (to.params.id && !/^\d+$/.test(to.params.id as string)) {
    next('/404')
    return
  }
  
  next()
})
```

### 3. XSS 防护

```typescript
// 清理查询参数
router.beforeEach((to, from, next) => {
  const cleanQuery: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(to.query)) {
    if (typeof value === 'string') {
      // 移除潜在的XSS代码
      cleanQuery[key] = value
        .replace(/<script>/gi, '')
        .replace(/<\/script>/gi, '')
    }
  }
  
  if (JSON.stringify(cleanQuery) !== JSON.stringify(to.query)) {
    next({ ...to, query: cleanQuery })
    return
  }
  
  next()
})
```

---

## 常见问题解答

### Q: 如何处理404页面？

```typescript
// 配置通配符路由（必须放在最后）
{
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('./views/NotFound.vue'),
  meta: { title: '页面未找到', noIndex: true }
}
```

### Q: 如何实现页面标题自动更新？

```typescript
// 方案1：使用 SEO 插件（推荐）
import { createSEOPlugin } from '@ldesign/router/features/seo'

app.use(createSEOVuePlugin({
  titleTemplate: '%s | 网站名'
}))

// 方案2：手动实现
router.afterEach((to) => {
  document.title = to.meta.title || '默认标题'
})
```

### Q: 如何处理路由加载失败？

```typescript
router.onError((error) => {
  if (error.message.includes('Loading chunk')) {
    // 提示用户
    const shouldReload = confirm('页面加载失败，是否刷新？')
    if (shouldReload) {
      window.location.reload()
    }
  }
})
```

### Q: 如何实现路由级数据预取？

```typescript
// 方案1：使用 SSR Composable
import { useAsyncData } from '@ldesign/router/ssr'

const { data, loading } = useAsyncData(async () => {
  return await fetchData()
})

// 方案2：使用路由守卫
{
  path: '/user/:id',
  beforeEnter: async (to, from, next) => {
    try {
      const data = await fetchUserData(to.params.id)
      to.meta.userData = data
      next()
    } catch (error) {
      next('/error')
    }
  }
}
```

### Q: 如何优化大型应用的路由性能？

1. **启用路由预热**
2. **使用智能预加载**
3. **合理配置缓存**
4. **监控性能指标**
5. **定期分析路由访问模式**

---

## 🎯 性能检查清单

部署前检查：

- [ ] 所有路由都使用懒加载
- [ ] 启用路由预热
- [ ] 配置智能预加载
- [ ] 限制 KeepAlive 缓存数量
- [ ] 添加全局错误处理
- [ ] 配置 SEO meta 标签
- [ ] 生成 Sitemap
- [ ] 移除开发调试工具

---

## 📖 更多资源

- [完整 API 文档](./docs/api/)
- [优化总结报告](./OPTIMIZATION_SUMMARY.md)
- [性能测试脚本](./scripts/performance-comparison.js)
- [示例应用](./examples/)

---

**最后更新**: 2025-10-25  
**维护者**: LDesign Team

