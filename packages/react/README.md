# @ldesign/router-react

React 路由库，基于 react-router-dom v6 和 @ldesign/router-core 构建，提供与 Vue 版本一致的 API 和增强功能。

## 特性

- 🎯 **基于 react-router** - 利用成熟的 react-router-dom v6 生态
- 🚀 **一致的 API** - 与 @ldesign/router-vue 提供相似的使用体验
- 📦 **轻量级** - 按需加载，Tree-shaking 友好
- 🔧 **TypeScript** - 完整的类型定义支持
- ⚡ **React 18+** - 支持最新的 React 特性

## 安装

```bash
pnpm add @ldesign/router-react react-router-dom
```

## 快速开始

### 基础用法

```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@ldesign/router-react'
import App from './App'

// 定义路由
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    component: () => import('./pages/About'),
    meta: { title: '关于' }
  },
]

// 创建路由器
const router = createRouter({
  routes,
  basename: '/app',
})

// 创建应用
const root = createRoot(document.getElementById('root')!)
root.render(
  <RouterProvider router={router} />
)
```

### 在组件中使用

```typescript
import React from 'react'
import { RouterView, RouterLink } from '@ldesign/router-react'

function App() {
  return (
    <div>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      <RouterView />
    </div>
  )
}

export default App
```

### 使用 Hooks

```typescript
import React from 'react'
import { useRouter, useRoute, useParams, useQuery } from '@ldesign/router-react'

function UserProfile() {
  const router = useRouter()
  const route = useRoute()
  const params = useParams()
  const query = useQuery()

  // 编程式导航
  const goToAbout = () => {
    router.push('/about')
  }

  // 访问路由信息
  console.log('当前路径:', route.path)
  console.log('路由参数:', params)
  console.log('查询参数:', query)

  return (
    <div>
      <h1>用户 ID: {params.id}</h1>
      <button onClick={goToAbout}>前往关于页面</button>
    </div>
  )
}
```

## API 参考

### 路由器创建

#### `createRouter(options)`

创建路由器实例。

```typescript
import { createRouter } from '@ldesign/router-react'

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
  basename: '/app',
})
```

### 组件

#### `<RouterProvider>`

提供路由上下文。

```typescript
import { RouterProvider } from '@ldesign/router-react'

<RouterProvider router={router} />
```

#### `<RouterView>`

路由视图组件，基于 `<Outlet>`。

```typescript
<RouterView />
```

#### `<RouterLink>`

路由链接组件，基于 `<Link>`。

```typescript
<RouterLink to="/about">关于</RouterLink>
<RouterLink to={{ path: '/user', query: { id: '123' } }}>用户</RouterLink>
```

### Hooks

#### `useRouter()`

获取路由器实例。

```typescript
const router = useRouter()

router.push('/about')
router.back()
router.forward()
```

#### `useRoute()`

获取当前路由信息。

```typescript
const route = useRoute()

console.log(route.path)      // 当前路径
console.log(route.params)    // 路由参数
console.log(route.query)     // 查询参数
console.log(route.hash)      // 哈希值
console.log(route.meta)      // 元信息
console.log(route.fullPath)  // 完整路径
```

#### `useNavigate()`

获取导航函数。

```typescript
const navigate = useNavigate()

navigate('/about')
navigate({ path: '/user', query: { id: '123' } })
```

#### `useParams()`

获取路由参数。

```typescript
const params = useParams()

console.log(params.id)
```

#### `useQuery()`

获取查询参数。

```typescript
const query = useQuery()

console.log(query.search)
console.log(query.page)
```

#### `useHash()`

获取哈希值。

```typescript
const hash = useHash()

console.log(hash)
```

#### `useMeta()`

获取路由元信息。

```typescript
const meta = useMeta()

console.log(meta.title)
console.log(meta.requiresAuth)
```

### 工具函数

```typescript
import {
  normalizePath,
  joinPaths,
  buildPath,
  parseQuery,
  stringifyQuery,
} from '@ldesign/router-react'

// 路径处理
normalizePath('/about/') // => '/about'
joinPaths('/api', 'users') // => '/api/users'
buildPath('/user/:id', { id: '123' }) // => '/user/123'

// 查询参数
parseQuery('page=1&sort=desc') // => { page: '1', sort: 'desc' }
stringifyQuery({ page: '1' }) // => 'page=1'
```

## 与 Vue 版本的 API 对比

`@ldesign/router-react` 提供了与 `@ldesign/router-vue` 高度一致的 API：

| 功能 | Vue | React |
|------|-----|-------|
| 路由器创建 | `createRouter()` | `createRouter()` |
| 历史模式 | `createWebHistory()` | `createWebHistory()` |
| 组件 | `<RouterView>` | `<RouterView>` |
| 组件 | `<RouterLink>` | `<RouterLink>` |
| 获取路由器 | `useRouter()` | `useRouter()` |
| 获取路由 | `useRoute()` | `useRoute()` |
| 路由参数 | `useParams()` | `useParams()` |
| 查询参数 | `useQuery()` | `useQuery()` |
| 哈希值 | `useHash()` | `useHash()` |
| 元信息 | `useMeta()` | `useMeta()` |

这使得在不同框架之间切换时，学习成本降到最低。

## 与 react-router-dom 的关系

`@ldesign/router-react` 是基于 react-router-dom v6 构建的增强版本：

- **兼容性**: 完全兼容 react-router-dom 的 API
- **增强功能**: 提供额外的便利功能和统一接口
- **简化使用**: 更简洁的 API 设计

你可以将其视为 react-router-dom 的封装，底层使用成熟的 react-router-dom，上层提供更友好的接口。

## 与 @ldesign/router-core 的关系

`@ldesign/router-react` 使用 `@ldesign/router-core` 提供的框架无关功能：

- 类型定义
- 工具函数（路径、查询参数、URL 处理）
- 历史管理基础类

这使得代码更加模块化，并且可以在不同框架间共享核心逻辑。

## 示例

### 嵌套路由

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: 'profile',
        component: UserProfile,
      },
      {
        path: 'settings',
        component: UserSettings,
      },
    ],
  },
]
```

### 路由守卫

```typescript
// 在组件中使用 useEffect 实现路由守卫
import { useEffect } from 'react'
import { useRouter } from '@ldesign/router-react'

function ProtectedPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  return <div>受保护的页面</div>
}
```

### 动态路由

```typescript
const routes = [
  {
    path: '/user/:id',
    component: UserDetail,
  },
]

function UserDetail() {
  const params = useParams()
  
  return <div>用户 ID: {params.id}</div>
}
```

## 许可证

MIT

