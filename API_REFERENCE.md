# @ldesign/router API 速查手册

快速查找所有可用的 API、类型和工具函数。

---

## 📚 核心 API

### 创建路由器

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})
```

| API | 说明 | 类型 |
|-----|------|------|
| `createRouter` | 创建路由器实例 | `(options: RouterOptions) => Router` |
| `createWebHistory` | 创建 HTML5 History 模式 | `(base?: string) => RouterHistory` |
| `createWebHashHistory` | 创建 Hash 模式 | `(base?: string) => RouterHistory` |
| `createMemoryHistory` | 创建内存模式（SSR） | `(base?: string) => RouterHistory` |

---

## 🎣 Composables API

### 核心 Composables

| Composable | 说明 | 返回值 |
|------------|------|--------|
| `useRouter()` | 获取路由器实例 | `Router` |
| `useRoute()` | 获取当前路由 | `ComputedRef<RouteLocationNormalized>` |
| `useParams()` | 获取路由参数 | `ComputedRef<RouteParams>` |
| `useQuery()` | 获取查询参数 | `ComputedRef<RouteQuery>` |
| `useHash()` | 获取哈希值 | `ComputedRef<string>` |
| `useMeta()` | 获取路由元信息 | `ComputedRef<RouteMeta>` |
| `useMatched()` | 获取匹配的路由记录 | `ComputedRef<RouteRecordNormalized[]>` |
| `useLink(options)` | 创建路由链接 | `UseLinkReturn` |
| `useNavigation()` | 导航控制 | `NavigationControl` |

### 守卫 Composables

| Composable | 说明 | 参数 |
|------------|------|------|
| `onBeforeRouteUpdate(guard)` | 路由更新守卫 | `NavigationGuard` |
| `onBeforeRouteLeave(guard)` | 路由离开守卫 | `NavigationGuard` |

### 设备适配 Composables

| Composable | 说明 | 返回值 |
|------------|------|--------|
| `useDeviceRoute()` | 设备路由功能 | `UseDeviceRouteReturn` |
| `useDeviceComponent()` | 设备组件解析 | `UseDeviceComponentReturn` |

### 🆕 SSR Composables (v1.1.0)

| Composable | 说明 | 返回值 |
|------------|------|--------|
| `useSSRData(key, fetcher)` | SSR 数据获取 | `Ref<T>` |
| `useAsyncData(fetcher, options)` | 异步数据（SSR友好） | `{ data, loading, error, refresh }` |
| `useSSRContext()` | 获取 SSR 上下文 | `SSRContext \| null` |

### 🆕 SEO Composables (v1.1.0)

| Composable | 说明 | 参数 |
|------------|------|------|
| `useSEO()` | 获取 SEO 管理器 | - |
| `useRouteSEO(route, config)` | 路由 SEO | `Ref<Route>, SEOConfig` |
| `usePageMeta(meta)` | 页面 meta 标签 | `SEOConfig` |
| `useStructuredData(data)` | 结构化数据 | `any \| any[]` |

---

## 🧩 组件

### 核心组件

| 组件 | 说明 | Props |
|------|------|-------|
| `<RouterView />` | 路由视图容器 | name, keepAlive, transition, loading 等 |
| `<RouterLink />` | 路由链接 | to, replace, activeClass, custom 等 |
| `<ErrorBoundary />` | 错误边界 | fallback, onError |
| `<DeviceUnsupported />` | 设备不支持提示 | device, message, supportedDevices 等 |

### RouterView Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | string | 'default' | 视图名称 |
| `keepAlive` | boolean \| KeepAliveProps | false | 是否缓存 |
| `include` | string \| RegExp \| Array | - | 缓存包含 |
| `exclude` | string \| RegExp \| Array | - | 缓存排除 |
| `max` | number | - | 最大缓存数 |
| `transition` | string \| TransitionProps | - | 过渡动画 |
| `loading` | boolean | false | 加载状态 |

### RouterLink Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `to` | RouteLocationRaw | - | 目标路由（必需） |
| `replace` | boolean | false | 替换模式 |
| `activeClass` | string | 'router-link-active' | 激活类名 |
| `exactActiveClass` | string | 'router-link-exact-active' | 精确激活类名 |
| `custom` | boolean | false | 自定义渲染 |

---

## 🔌 插件

### 内置插件

| 插件 | 说明 | 导入路径 |
|------|------|----------|
| `createAnimationPlugin` | 动画插件 | `@ldesign/router/plugins/animation` |
| `createCachePlugin` | 缓存插件 | `@ldesign/router/plugins/cache` |
| `createPerformancePlugin` | 性能插件 | `@ldesign/router/plugins/performance` |
| `createPreloadPlugin` | 预加载插件 | `@ldesign/router/plugins/preload` |

### 🆕 新增插件 (v1.1.0)

| 插件 | 说明 | 导入路径 |
|------|------|----------|
| `createSEOPlugin` | SEO 插件 | `@ldesign/router/features/seo` |
| `createSmartPreloadPlugin` | 智能预加载 | `@ldesign/router/plugins/smart-preload` |

---

## 🛠️ 工具函数

### 路径处理

| 函数 | 说明 | 签名 |
|------|------|------|
| `normalizePath` | 规范化路径 | `(path: string) => string` |
| `joinPaths` | 连接路径 | `(...paths: string[]) => string` |
| `buildPath` | 构建路径 | `(pattern: string, params: RouteParams) => string` |
| `parsePathParams` | 解析参数 | `(pattern: string, path: string) => RouteParams` |

### 查询参数

| 函数 | 说明 | 签名 |
|------|------|------|
| `parseQuery` | 解析查询串 | `(search: string) => RouteQuery` |
| `stringifyQuery` | 序列化查询 | `(query: RouteQuery) => string` |
| `mergeQuery` | 合并查询 | `(target: RouteQuery, source: RouteQuery) => RouteQuery` |

### URL 处理

| 函数 | 说明 | 签名 |
|------|------|------|
| `parseURL` | 解析 URL | `(url: string) => { path, query, hash }` |
| `stringifyURL` | 序列化 URL | `(path: string, query?: RouteQuery, hash?: string) => string` |

### 路由匹配

| 函数 | 说明 | 签名 |
|------|------|------|
| `matchPath` | 匹配路径 | `(pattern: string, path: string) => boolean` |
| `extractParams` | 提取参数 | `(pattern: string, path: string) => RouteParams` |

### 导航失败

| 函数 | 说明 | 签名 |
|------|------|------|
| `createNavigationFailure` | 创建失败对象 | `(type, from, to, message?) => NavigationFailure` |
| `isNavigationFailure` | 判断是否失败 | `(error: any, type?) => boolean` |

### 🆕 SSR 工具 (v1.1.0)

| 函数 | 说明 | 签名 |
|------|------|------|
| `isSSR` | 判断是否服务端 | `() => boolean` |
| `isClient` | 判断是否客户端 | `() => boolean` |
| `waitForAsyncComponents` | 等待组件加载 | `(router, url) => Promise<void>` |
| `createSSRRouter` | 创建SSR路由器 | `(options) => Promise<Router>` |

### 🆕 内存工具 (v1.1.0)

| 函数 | 说明 | 签名 |
|------|------|------|
| `createMemoryLeakDetector` | 创建泄漏检测器 | `(config?) => MemoryLeakDetector` |
| `estimateObjectSize` | 估算对象大小 | `(obj: any) => number` |
| `hasCircularReference` | 检查循环引用 | `(obj: any) => boolean` |

---

## 📘 类型定义

### 核心类型

| 类型 | 说明 |
|------|------|
| `Router` | 路由器接口 |
| `RouteLocationNormalized` | 标准化路由位置 |
| `RouteLocationRaw` | 原始路由位置 |
| `RouteRecordRaw` | 路由配置 |
| `RouteRecordNormalized` | 标准化路由记录 |
| `RouteParams` | 路由参数 |
| `RouteQuery` | 查询参数 |
| `RouteMeta` | 路由元信息 |
| `NavigationGuard` | 导航守卫函数 |
| `NavigationFailure` | 导航失败 |
| `RouterHistory` | 历史管理器 |

### 🆕 新增类型 (v1.1.0)

| 类型 | 说明 | 模块 |
|------|------|------|
| `SEOConfig` | SEO 配置 | `features/seo` |
| `SSRContext` | SSR 上下文 | `ssr` |
| `SmartPreloadConfig` | 智能预加载配置 | `plugins/smart-preload` |
| `RouteAccessStats` | 路由统计 | `analytics/advanced-analytics` |
| `ConversionFunnel` | 转化漏斗 | `analytics/advanced-analytics` |
| `MemoryLeakReport` | 泄漏报告 | `utils/memory-leak-detector` |
| `TransitionType` | 动画类型 | `features/route-transition` |

---

## 🎨 常量

### 导航失败类型

```typescript
enum NavigationFailureType {
  aborted = 4,      // 导航被守卫中止
  cancelled = 8,    // 导航被新导航取消
  duplicated = 16   // 重复导航
}
```

### 动画类型

```typescript
enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale'
}
```

### 缓存策略

```typescript
enum CacheStrategy {
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage'
}
```

### 预加载策略

```typescript
enum PreloadStrategy {
  HOVER = 'hover',
  VISIBLE = 'visible',
  IDLE = 'idle'
}
```

---

## 🆕 v1.1.0 新增 API 汇总

### 类（8个）
1. `SEOManager` - SEO 管理
2. `SmartPreloadPlugin` - 智能预加载
3. `SSRManager` - SSR 管理
4. `AdvancedRouteAnalyzer` - 高级分析
5. `MemoryLeakDetector` - 泄漏检测
6. `PerformancePanel` - 性能面板

### 函数（25+）
1. SEO: `createSEOManager`, `createSEOPlugin`, `createSEOVuePlugin`
2. SSR: `createSSRManager`, `createSSRRouter`, `isSSR`, `isClient`, `waitForAsyncComponents`
3. 预加载: `createSmartPreloadPlugin`
4. 分析: `createAdvancedAnalyzer`
5. 内存: `createMemoryLeakDetector`, `estimateObjectSize`, `hasCircularReference`
6. 调试: `createPerformancePanel`
7. 动画: `injectTransitionStyles`, `getTransitionClasses`

### Composables（8个）
1. SEO: `useSEO`, `useRouteSEO`, `usePageMeta`, `useStructuredData`
2. SSR: `useSSRData`, `useAsyncData`, `useSSRContext`

### 类型（30+）
详见各模块的类型定义文件

---

## 📖 使用模式

### 模式 1：基础路由

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})

app.use(router)
```

### 模式 2：完整配置（推荐）

```typescript
import { 
  createRouter, 
  createWebHistory,
  createSEOPlugin,
  createSmartPreloadPlugin,
  createPerformancePanel
} from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

// SEO 优化
const seoPlugin = createSEOPlugin({
  titleTemplate: '%s | 网站名',
  baseUrl: 'https://example.com'
})
seoPlugin.install(router)

// 智能预加载
const smartPreload = createSmartPreloadPlugin({
  enabled: true,
  maxConcurrent: 2
})
smartPreload.install(router)

// 性能监控（仅开发）
if (import.meta.env.DEV) {
  const panel = createPerformancePanel()
  panel.attach(router)
}

app.use(router)
```

### 模式 3：SSR 应用

```typescript
// server.ts
import { createSSRRouter, createMemoryHistory, SSRManager } from '@ldesign/router'

const createApp = async () => {
  const router = await createSSRRouter({
    history: createMemoryHistory(),
    routes: [...]
  })
  
  const ssrManager = new SSRManager({ cache: { enabled: true } })
  
  return { router, ssrManager }
}

// client.ts
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

// 恢复 SSR 状态
const ssrManager = new SSRManager()
const state = ssrManager.deserializeState()
```

---

## 🔍 快速搜索

### 我想...

- **创建路由器** → `createRouter`
- **导航到某个页面** → `router.push()` 或 `<RouterLink>`
- **获取当前路由** → `useRoute()`
- **获取路由参数** → `useParams()`
- **添加权限检查** → `router.beforeEach()` + `meta.requiresAuth`
- **优化SEO** → `createSEOPlugin()`
- **提升性能** → `createSmartPreloadPlugin()` + `matcher.preheat()`
- **SSR支持** → `useSSRData()` + `createSSRManager()`
- **监控性能** → `createPerformancePanel()`
- **检测内存泄漏** → `createMemoryLeakDetector()`
- **分析用户行为** → `createAdvancedAnalyzer()`
- **添加动画** → `<RouterView transition="fade" />`

---

## 📦 导入路径

### 核心导出

```typescript
import { createRouter, useRouter, useRoute } from '@ldesign/router'
```

### 子模块导出

```typescript
// SEO
import { createSEOPlugin } from '@ldesign/router/features/seo'

// SSR
import { useSSRData } from '@ldesign/router/ssr'

// 智能预加载
import { createSmartPreloadPlugin } from '@ldesign/router/plugins/smart-preload'

// 分析工具
import { createAdvancedAnalyzer } from '@ldesign/router/analytics'

// 调试工具
import { createPerformancePanel } from '@ldesign/router/debug'

// 设备适配
import { useDeviceRoute } from '@ldesign/router/composables'
```

---

**版本**: v1.1.0  
**最后更新**: 2025-10-25

