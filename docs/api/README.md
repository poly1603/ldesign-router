# API 参考

## @ldesign/router-core

框架无关的核心路由库。

### 路由器

#### `createRouter(options)`

创建路由器实例。

```typescript
interface RouterOptions {
  routes: RouteRecordRaw[]
  history: RouterHistory
  scrollBehavior?: ScrollStrategy
  enableCache?: boolean
  cacheSize?: number
  guardTimeout?: number
  strict?: boolean
  useTrie?: boolean
  enableMatchStats?: boolean
  enableMemoryManagement?: boolean
}

const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  useTrie: true,
})
```

### 历史管理

#### `createWebHistory(base?)`

创建 HTML5 历史模式实例。

```typescript
const history = createWebHistory('/app/')
```

#### `createWebHashHistory(base?)`

创建 Hash 历史模式实例。

```typescript
const history = createWebHashHistory()
```

#### `createMemoryHistory(base?)`

创建内存历史模式实例（用于 SSR）。

```typescript
const history = createMemoryHistory()
```

### 工具函数

#### `normalizePath(path)`

标准化路径，移除末尾斜杠，确保开头斜杠。

```typescript
normalizePath('/about/')  // => '/about'
normalizePath('about')    // => '/about'
```

#### `joinPaths(...paths)`

连接多个路径片段。

```typescript
joinPaths('/api', 'users', '123')  // => '/api/users/123'
```

#### `buildPath(pattern, params)`

根据模式和参数构建路径。

```typescript
buildPath('/user/:id', { id: '123' })  // => '/user/123'
```

#### `parseQuery(queryString)`

解析查询字符串为对象。

```typescript
parseQuery('page=1&sort=desc')  // => { page: '1', sort: 'desc' }
```

#### `stringifyQuery(query)`

将对象序列化为查询字符串。

```typescript
stringifyQuery({ page: '1', sort: 'desc' })  // => 'page=1&sort=desc'
```

### 类型定义

#### `RouteRecordRaw`

原始路由配置。

```typescript
interface RouteRecordRaw {
  path: string
  name?: string
  component?: Component | (() => Promise<Component>)
  components?: Record<string, Component>
  redirect?: string | RouteLocationRaw
  children?: RouteRecordRaw[]
  meta?: RouteMeta
  beforeEnter?: NavigationGuard
  props?: boolean | Record<string, any> | ((route: RouteLocationNormalized) => Record<string, any>)
}
```

#### `RouteLocationNormalized`

标准化后的路由位置。

```typescript
interface RouteLocationNormalized {
  path: string
  fullPath: string
  name?: string
  params: RouteParams
  query: RouteQuery
  hash: string
  meta: RouteMeta
  matched: RouteRecordNormalized[]
}
```

#### `NavigationGuard`

导航守卫函数。

```typescript
type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => void | boolean | RouteLocationRaw | Promise<void | boolean | RouteLocationRaw>
```

---

## @ldesign/router-vue

Vue 3 路由适配器。

### 创建路由器

#### `createRouter(options)`

创建 Vue 路由器实例。

```typescript
import { createRouter, createWebHistory } from '@ldesign/router-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [...],
})
```

### Composables

#### `useRouter()`

获取路由器实例。

```typescript
const router = useRouter()
router.push('/about')
router.replace({ name: 'home' })
router.back()
router.forward()
```

#### `useRoute()`

获取当前路由响应式对象。

```typescript
const route = useRoute()
console.log(route.path)
console.log(route.params)
console.log(route.query)
```

#### `useParams()`

获取路由参数响应式对象。

```typescript
const params = useParams()
console.log(params.id)
```

#### `useQuery()`

获取查询参数响应式对象。

```typescript
const query = useQuery()
console.log(query.page)
```

#### `useMeta()`

获取路由元信息响应式对象。

```typescript
const meta = useMeta()
console.log(meta.title)
```

#### `useRouteMatch(pattern)`

检查当前路由是否匹配指定模式。

```typescript
const isMatch = useRouteMatch('/user/:id')
```

### 组件

#### `<RouterView>`

渲染匹配的路由组件。

```vue
<RouterView />
<RouterView name="sidebar" />
```

Props:
- `name?: string` - 命名视图名称
- `route?: RouteLocationNormalized` - 要渲染的路由

#### `<RouterLink>`

导航链接组件。

```vue
<RouterLink to="/about">关于</RouterLink>
<RouterLink :to="{ name: 'user', params: { id: '123' } }">用户</RouterLink>
```

Props:
- `to: string | RouteLocationRaw` - 目标路由
- `replace?: boolean` - 是否替换历史
- `activeClass?: string` - 激活时的 class
- `exactActiveClass?: string` - 精确匹配激活时的 class

### 守卫钩子

#### `onBeforeRouteLeave(guard)`

组件内离开守卫。

```typescript
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges()) {
    return confirm('确定离开？')
  }
})
```

#### `onBeforeRouteUpdate(guard)`

组件内更新守卫。

```typescript
onBeforeRouteUpdate((to, from) => {
  fetchData(to.params.id)
})
```

---

## 增强功能

### 懒加载

#### `LazyLoadManager`

管理组件懒加载。

```typescript
import { LazyLoadManager } from '@ldesign/router-core'

const manager = new LazyLoadManager()

const AsyncComponent = manager.create(
  () => import('./MyComponent.vue'),
  {
    retries: 3,
    timeout: 5000,
    onError: (error) => console.error(error),
  }
)
```

### 预取

#### `createPrefetchManager(options)`

创建预取管理器。

```typescript
const prefetch = createPrefetchManager({
  strategy: 'hover',
  maxConcurrent: 3,
  networkTypes: ['4g', 'wifi'],
})

// 手动预取
prefetch.prefetch('/about')

// 预取多个
prefetch.prefetchAll(['/about', '/contact'])
```

### 权限控制

#### `createPermissionManager()`

创建权限管理器。

```typescript
const permissions = createPermissionManager()

// 设置权限
permissions.setPermissions(['read', 'write', 'delete'])
permissions.setRoles(['admin', 'editor'])

// 检查权限
permissions.check('read')  // true
permissions.checkAny(['read', 'admin'])  // true
permissions.checkAll(['read', 'write'])  // true

// 检查角色
permissions.hasRole('admin')  // true
```

### 性能监控

#### `createPerformanceMonitor(options)`

创建性能监控器。

```typescript
const monitor = createPerformanceMonitor({
  enableWarnings: true,
  thresholds: {
    navigation: 100,
    guardExecution: 50,
    componentLoad: 200,
  },
})

// 记录导航
monitor.startNavigation('/about')
const metrics = monitor.endNavigation()

// 获取统计
const stats = monitor.getStats()
console.log(stats.averageNavigationTime)
```

### 缓存

#### `createRouteCacheManager(options)`

创建路由缓存管理器。

```typescript
const cache = createRouteCacheManager({
  strategy: 'lru',
  maxSize: 100,
  ttl: 60000,
})

// 缓存组件状态
cache.set('/user/123', componentState)

// 获取缓存
const state = cache.get('/user/123')

// 清理过期缓存
cache.cleanup()
```

### 滚动行为

#### `createScrollManager(options)`

创建滚动管理器。

```typescript
const scroll = createScrollManager({
  strategy: 'auto',
  behavior: 'smooth',
})

// 内置策略
import {
  alwaysScrollToTop,
  keepScrollPosition,
  scrollToHashOrTop,
} from '@ldesign/router-core'

const router = createRouter({
  scrollBehavior: scrollToHashOrTop,
})
```

---

## 错误处理

### `RouterError`

路由错误基类。

```typescript
class RouterError extends Error {
  code: RouterErrorCode
  details?: Record<string, unknown>
}
```

### 错误类型

```typescript
enum RouterErrorCode {
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  NAVIGATION_ABORTED = 'NAVIGATION_ABORTED',
  NAVIGATION_DUPLICATED = 'NAVIGATION_DUPLICATED',
  NAVIGATION_GUARD_REDIRECT = 'NAVIGATION_GUARD_REDIRECT',
  NO_MATCH = 'NO_MATCH',
  INVALID_PARAMS = 'INVALID_PARAMS',
  COMPONENT_LOAD_ERROR = 'COMPONENT_LOAD_ERROR',
}
```

### 错误管理

```typescript
import { createErrorManager } from '@ldesign/router-core'

const errorManager = createErrorManager()

errorManager.onError((error) => {
  console.error('Router error:', error)
  // 上报错误
  reportError(error)
})

// 处理错误
errorManager.handle(error)
```
