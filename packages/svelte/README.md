# @ldesign/router-svelte

Svelte 路由库，提供响应式路由功能，基于 @ldesign/router-core。

## 📦 安装

```bash
pnpm add @ldesign/router-svelte
```

## 🚀 快速开始

### 1. 创建路由器

```typescript
// src/router.ts
import { createRouter, createWebHistory } from '@ldesign/router-svelte'
import Home from './routes/Home.svelte'
import About from './routes/About.svelte'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: () => import('./routes/User.svelte') },
  ],
})
```

### 2. 在应用中使用

```svelte
<!-- src/App.svelte -->
<script>
  import { RouterProvider, RouterView } from '@ldesign/router-svelte'
  import { router } from './router'
</script>

<RouterProvider {router}>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>
  
  <main>
    <RouterView />
  </main>
</RouterProvider>
```

### 3. 在组件中使用路由

```svelte
<!-- src/routes/User.svelte -->
<script>
  import { getRouter, params, query } from '@ldesign/router-svelte'
  
  const router = getRouter()
  
  // 使用 Svelte stores（自动响应式）
  $: userId = $params.id
  $: page = $query.page || '1'
  
  function goToAbout() {
    router.push('/about')
  }
</script>

<div>
  <h1>用户 ID: {userId}</h1>
  <p>页码: {page}</p>
  <button on:click={goToAbout}>前往关于页</button>
</div>
```

## 📚 API 文档

### 路由器

#### createRouter(options)

创建路由器实例。

```typescript
import { createRouter, createWebHistory } from '@ldesign/router-svelte'

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
})
```

**选项：**

- `routes`: 路由配置数组
- `history`: 历史管理器（HTML5、Hash 或 Memory）
- `scrollBehavior`: 滚动行为配置
- `strict`: 严格尾部斜杠匹配
- `sensitive`: 大小写敏感匹配

### 组件

#### `<RouterProvider>`

提供路由器上下文。

```svelte
<RouterProvider {router}>
  <!-- 你的应用 -->
</RouterProvider>
```

#### `<RouterView>`

渲染当前路由匹配的组件。

```svelte
<RouterView />
```

#### `<RouterLink>`

路由导航链接。

```svelte
<RouterLink to="/about">关于</RouterLink>
<RouterLink to="/user/123" replace>用户</RouterLink>
```

**Props：**

- `to`: 目标路由（字符串或对象）
- `replace`: 是否替换历史记录（默认 false）
- `activeClass`: 活跃链接类名
- `exactActiveClass`: 精确活跃链接类名

### Stores

Svelte 使用 stores 提供响应式状态，使用 `$` 前缀自动订阅。

#### getRouter()

获取路由器实例。

```svelte
<script>
  import { getRouter } from '@ldesign/router-svelte'
  
  const router = getRouter()
  
  function navigate() {
    router.push('/about')
  }
</script>
```

#### route()

获取当前路由 store。

```svelte
<script>
  import { route } from '@ldesign/router-svelte'
  const currentRoute = route()
</script>

<p>当前路径: {$currentRoute.path}</p>
<p>完整路径: {$currentRoute.fullPath}</p>
```

#### params()

获取路由参数 store。

```svelte
<script>
  import { params } from '@ldesign/router-svelte'
  const routeParams = params()
</script>

<p>用户 ID: {$routeParams.id}</p>
```

#### query()

获取查询参数 store。

```svelte
<script>
  import { query } from '@ldesign/router-svelte'
  const queryParams = query()
</script>

<p>页码: {$queryParams.page || '1'}</p>
```

#### hash()

获取哈希值 store。

```svelte
<script>
  import { hash } from '@ldesign/router-svelte'
  const routeHash = hash()
</script>

<p>锚点: {$routeHash}</p>
```

#### meta()

获取路由元信息 store。

```svelte
<script>
  import { meta } from '@ldesign/router-svelte'
  const routeMeta = meta()
</script>

<h1>{$routeMeta.title || '默认标题'}</h1>
```

### 路由器方法

```typescript
const router = getRouter()

// 导航
await router.push('/about')
await router.push({ path: '/user/123', query: { page: '2' } })
await router.replace('/home')

// 历史控制
router.back()
router.forward()
router.go(-2)

// 路由管理
const removeRoute = router.addRoute({ path: '/new', component: NewPage })
router.removeRoute('routeName')
const hasRoute = router.hasRoute('routeName')
const routes = router.getRoutes()

// 路由解析
const resolved = router.resolve('/about')

// 导航守卫
const removeGuard = router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)
  next()
})

const removeHook = router.afterEach((to, from) => {
  console.log('导航完成')
})

// 错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

// 等待路由就绪
await router.isReady()
```

## 🌟 特性

### 响应式 Stores

利用 Svelte 的 stores 提供自动响应式：

```svelte
<script>
  import { params, query } from '@ldesign/router-svelte'
  
  const routeParams = params()
  const queryParams = query()
  
  // 自动响应路由变化
  $: console.log('参数变化:', $routeParams)
  $: console.log('查询变化:', $queryParams)
</script>

<div>
  <p>ID: {$routeParams.id}</p>
  <p>Page: {$queryParams.page}</p>
</div>
```

### 导航守卫

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  document.title = to.meta.title || '默认标题'
})
```

### 动态路由

```typescript
const routes = [
  { path: '/user/:id', component: User },
  { path: '/post/:id/:slug', component: Post },
]
```

在组件中访问：

```svelte
<script>
  import { params } from '@ldesign/router-svelte'
  const routeParams = params()
</script>

<p>用户 ID: {$routeParams.id}</p>
```

### 嵌套路由

```typescript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      { path: 'overview', component: Overview },
      { path: 'stats', component: Stats },
    ],
  },
]
```

### 历史模式

```typescript
// HTML5 History 模式
import { createWebHistory } from '@ldesign/router-svelte'
const history = createWebHistory('/app/')

// Hash 模式
import { createWebHashHistory } from '@ldesign/router-svelte'
const history = createWebHashHistory()

// Memory 模式（SSR/测试）
import { createMemoryHistory } from '@ldesign/router-svelte'
const history = createMemoryHistory()
```

## 🔄 与其他框架对比

| 功能 | Svelte | Vue | React |
|------|--------|-----|-------|
| 获取路由器 | `getRouter()` | `useRouter()` | `useRouter()` |
| 当前路由 | `$route` store | `useRoute()` | `useRoute()` |
| 路由参数 | `$params` store | `useParams()` | `useParams()` |
| 导航链接 | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` |

## 📝 示例

### 完整示例应用

```typescript
// src/router.ts
import { createRouter, createWebHistory } from '@ldesign/router-svelte'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./routes/Home.svelte'),
      meta: { title: '首页' },
    },
    {
      path: '/about',
      component: () => import('./routes/About.svelte'),
      meta: { title: '关于' },
    },
    {
      path: '/user/:id',
      component: () => import('./routes/User.svelte'),
      meta: { title: '用户详情' },
    },
  ],
})

// 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || '默认标题'
})
```

```svelte
<!-- src/App.svelte -->
<script>
  import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-svelte'
  import { router } from './router'
</script>

<RouterProvider {router}>
  <div class="app">
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/user/123">用户</RouterLink>
    </nav>
    
    <main>
      <RouterView />
    </main>
  </div>
</RouterProvider>

<style>
  .app {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }
  
  main {
    padding: 2rem;
  }
</style>
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 🔗 相关链接

- [@ldesign/router-core](../core)
- [@ldesign/router-vue](../vue)
- [@ldesign/router-react](../react)
- [Svelte 文档](https://svelte.dev/)


