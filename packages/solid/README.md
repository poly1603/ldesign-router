# @ldesign/router-solid

Solid.js 路由库，提供细粒度响应式路由功能，基于 @solidjs/router 和 @ldesign/router-core。

## 📦 安装

```bash
pnpm add @ldesign/router-solid
```

## 🚀 快速开始

### 1. 创建路由器

```typescript
// src/router.ts
import { createRouter, createWebHistory } from '@ldesign/router-solid'
import Home from './pages/Home'
import About from './pages/About'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: () => import('./pages/User') },
  ],
})
```

### 2. 在应用中使用

```tsx
// src/App.tsx
import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-solid'
import { router } from './router'

export default function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      
      <main>
        <RouterView />
      </main>
    </RouterProvider>
  )
}
```

### 3. 在组件中使用路由

```tsx
// src/pages/User.tsx
import { useRouter, useParams, useQuery } from '@ldesign/router-solid'

export default function User() {
  const router = useRouter()
  const params = useParams()
  const query = useQuery()
  
  // Solid.js signals - 自动响应式
  const userId = () => params().id
  const page = () => query().page || '1'
  
  const goToAbout = () => {
    router.push('/about')
  }
  
  return (
    <div>
      <h1>用户 ID: {userId()}</h1>
      <p>页码: {page()}</p>
      <button onClick={goToAbout}>前往关于页</button>
    </div>
  )
}
```

## 📚 API 文档

### 路由器

#### createRouter(options)

创建路由器实例。

```typescript
import { createRouter, createWebHistory } from '@ldesign/router-solid'

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
- `base`: 基础路径
- `scrollBehavior`: 滚动行为配置
- `strict`: 严格尾部斜杠匹配
- `sensitive`: 大小写敏感匹配

### 组件

#### `<RouterProvider>`

提供路由器上下文。

```tsx
<RouterProvider router={router}>
  {/* 你的应用 */}
</RouterProvider>
```

#### `<RouterView>`

渲染当前路由匹配的组件。

```tsx
<RouterView />
```

#### `<RouterLink>`

路由导航链接。

```tsx
<RouterLink to="/about">关于</RouterLink>
<RouterLink to="/user/123" replace>用户</RouterLink>
<RouterLink to="/docs" activeClass="text-blue-500">文档</RouterLink>
```

**Props：**

- `to`: 目标路由（字符串或对象）
- `replace`: 是否替换历史记录（默认 false）
- `class`: 自定义类名
- `activeClass`: 活跃链接类名
- `inactiveClass`: 非活跃链接类名

### Hooks

Solid.js 使用细粒度响应式 signals，所有 hooks 返回 `Accessor` 函数。

#### useRouter()

获取路由器实例。

```tsx
import { useRouter } from '@ldesign/router-solid'

function MyComponent() {
  const router = useRouter()
  
  const navigate = () => {
    router.push('/about')
  }
  
  return <button onClick={navigate}>Go to About</button>
}
```

#### useRoute()

获取当前路由信息。

```tsx
import { useRoute } from '@ldesign/router-solid'

function MyComponent() {
  const route = useRoute()
  
  return (
    <div>
      <p>路径: {route.path()}</p>
      <p>完整路径: {route.fullPath()}</p>
    </div>
  )
}
```

#### useParams()

获取路由参数。

```tsx
import { useParams } from '@ldesign/router-solid'

function UserPage() {
  const params = useParams()
  
  return <p>用户 ID: {params().id}</p>
}
```

#### useQuery()

获取查询参数。

```tsx
import { useQuery } from '@ldesign/router-solid'

function SearchPage() {
  const query = useQuery()
  
  return <p>搜索: {query().q}</p>
}
```

#### useHash()

获取哈希值。

```tsx
import { useHash } from '@ldesign/router-solid'

function MyComponent() {
  const hash = useHash()
  
  return <p>锚点: {hash()}</p>
}
```

#### useMeta()

获取路由元信息。

```tsx
import { useMeta } from '@ldesign/router-solid'

function MyComponent() {
  const meta = useMeta()
  
  return <h1>{meta().title || '默认标题'}</h1>
}
```

### 路由器方法

```typescript
const router = useRouter()

// 导航
await router.push('/about')
await router.push({ path: '/user/123', query: { page: '2' } })
await router.replace('/home')

// 历史控制
router.back()
router.forward()
router.go(-2)

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
```

## 🌟 特性

### 细粒度响应式

利用 Solid.js 的 signals 提供细粒度响应式：

```tsx
import { useParams, useQuery } from '@ldesign/router-solid'
import { createEffect } from 'solid-js'

function MyComponent() {
  const params = useParams()
  const query = useQuery()
  
  // 自动响应变化
  createEffect(() => {
    console.log('参数变化:', params())
  })
  
  createEffect(() => {
    console.log('查询变化:', query())
  })
  
  return (
    <div>
      <p>ID: {params().id}</p>
      <p>Page: {query().page}</p>
    </div>
  )
}
```

### 导航守卫

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
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

```tsx
import { useParams } from '@ldesign/router-solid'

function User() {
  const params = useParams()
  
  return <p>用户 ID: {params().id}</p>
}
```

### 嵌套路由

```typescript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      { path: '/overview', component: Overview },
      { path: '/stats', component: Stats },
    ],
  },
]
```

### 历史模式

```typescript
// HTML5 History 模式
import { createWebHistory } from '@ldesign/router-solid'
const history = createWebHistory('/app/')

// Hash 模式
import { createWebHashHistory } from '@ldesign/router-solid'
const history = createWebHashHistory()

// Memory 模式（SSR/测试）
import { createMemoryHistory } from '@ldesign/router-solid'
const history = createMemoryHistory()
```

## 🔄 与其他框架对比

| 功能 | Solid.js | Vue | React | Svelte |
|------|----------|-----|-------|--------|
| 获取路由器 | `useRouter()` | `useRouter()` | `useRouter()` | `getRouter()` |
| 当前路由 | `useRoute()` | `useRoute()` | `useRoute()` | `$route` store |
| 路由参数 | `useParams()` | `useParams()` | `useParams()` | `$params` store |
| 导航链接 | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` |

## 📝 示例

### 完整示例应用

```typescript
// src/router.ts
import { createRouter, createWebHistory } from '@ldesign/router-solid'
import { lazy } from 'solid-js'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const User = lazy(() => import('./pages/User'))

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
      meta: { title: '首页' },
    },
    {
      path: '/about',
      component: About,
      meta: { title: '关于' },
    },
    {
      path: '/user/:id',
      component: User,
      meta: { title: '用户详情' },
    },
  ],
})

// 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || '默认标题'
})
```

```tsx
// src/App.tsx
import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-solid'
import { router } from './router'
import './App.css'

export default function App() {
  return (
    <RouterProvider router={router}>
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
  )
}
```

```tsx
// src/pages/User.tsx
import { useParams, useQuery, useRouter } from '@ldesign/router-solid'
import { createEffect } from 'solid-js'

export default function User() {
  const router = useRouter()
  const params = useParams()
  const query = useQuery()
  
  createEffect(() => {
    console.log('用户 ID 变化:', params().id)
  })
  
  const goHome = () => {
    router.push('/')
  }
  
  return (
    <div>
      <h1>用户详情</h1>
      <p>ID: {params().id}</p>
      <p>页码: {query().page || '1'}</p>
      <button onClick={goHome}>返回首页</button>
    </div>
  )
}
```

## 💡 最佳实践

### 1. 使用 lazy 加载组件

```typescript
import { lazy } from 'solid-js'

const routes = [
  {
    path: '/about',
    component: lazy(() => import('./pages/About')),
  },
]
```

### 2. 类型安全的路由参数

```typescript
interface UserParams {
  id: string
}

function User() {
  const params = useParams<UserParams>()
  // params().id 现在有正确的类型
}
```

### 3. 响应式路由监听

```tsx
import { createEffect } from 'solid-js'
import { useRoute } from '@ldesign/router-solid'

function MyComponent() {
  const route = useRoute()
  
  createEffect(() => {
    // 当路由变化时自动执行
    console.log('路由变化:', route.path())
  })
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 🔗 相关链接

- [@ldesign/router-core](../core)
- [@ldesign/router-vue](../vue)
- [@ldesign/router-react](../react)
- [@ldesign/router-svelte](../svelte)
- [Solid.js 文档](https://www.solidjs.com/)
- [@solidjs/router 文档](https://github.com/solidjs/solid-router)


