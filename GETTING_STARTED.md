# @ldesign/router 快速开始指南

## 概述

@ldesign/router 是一个支持多框架的路由库，为 **Vue 3**、**React**、**Svelte** 和 **Solid.js** 提供统一的 API 接口。

## 安装

根据你使用的框架选择对应的包：

### Vue 3
```bash
pnpm add @ldesign/router-vue vue-router
# 或
npm install @ldesign/router-vue vue-router
```

### React
```bash
pnpm add @ldesign/router-react react-router-dom
# 或
npm install @ldesign/router-react react-router-dom
```

### Svelte
```bash
pnpm add @ldesign/router-svelte
# 或
npm install @ldesign/router-svelte
```

### Solid.js
```bash
pnpm add @ldesign/router-solid @solidjs/router
# 或
npm install @ldesign/router-solid @solidjs/router
```

## 基础使用

### Vue 3 示例

```vue
<!-- App.vue -->
<script setup lang="ts">
import { RouterView, RouterLink } from '@ldesign/router-vue'
</script>

<template>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>
  <RouterView />
</template>
```

```typescript
// router.ts
import { createRouter, createWebHistory } from '@ldesign/router-vue'
import Home from './views/Home.vue'
import About from './views/About.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: () => import('./views/User.vue') },
  ],
})
```

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### React 示例

```tsx
// App.tsx
import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-react'
import { router } from './router'

export default function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      <RouterView />
    </RouterProvider>
  )
}
```

```typescript
// router.ts
import { createRouter } from '@ldesign/router-react'
import Home from './pages/Home'
import About from './pages/About'

export const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: () => import('./pages/User') },
  ],
})
```

### Svelte 示例

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-svelte'
  import { router } from './router'
</script>

<RouterProvider {router}>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>
  <RouterView />
</RouterProvider>
```

```typescript
// router.ts
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

### Solid.js 示例

```tsx
// App.tsx
import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-solid'
import { router } from './router'

export default function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      <RouterView />
    </RouterProvider>
  )
}
```

```typescript
// router.ts
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

## 获取路由信息

### Vue 3

```vue
<script setup lang="ts">
import { useRouter, useRoute, useParams } from '@ldesign/router-vue'

const router = useRouter()
const route = useRoute()
const params = useParams()

// 使用 .value 访问
console.log(route.value.path)
console.log(params.value.id)
</script>
```

### React

```tsx
import { useRouter, useRoute, useParams } from '@ldesign/router-react'

function MyComponent() {
  const router = useRouter()
  const route = useRoute()
  const params = useParams()

  // 直接访问
  console.log(route.path)
  console.log(params.id)
}
```

### Svelte

```svelte
<script lang="ts">
  import { getRouter, params, query } from '@ldesign/router-svelte'
  
  const router = getRouter()
  const routeParams = params()
  const queryParams = query()
  
  // 使用 $ 前缀自动订阅
  $: console.log($routeParams.id)
  $: console.log($queryParams.page)
</script>

<p>用户 ID: {$routeParams.id}</p>
```

### Solid.js

```tsx
import { useRouter, useParams, useQuery } from '@ldesign/router-solid'

function MyComponent() {
  const router = useRouter()
  const params = useParams()
  const query = useQuery()

  // 调用函数获取值
  console.log(params().id)
  console.log(query().page)

  return <p>用户 ID: {params().id}</p>
}
```

## 程序化导航

所有框架都支持相同的导航方法：

```typescript
// 导航到新页面
router.push('/about')
router.push({ path: '/user/123', query: { page: '2' } })

// 替换当前页面
router.replace('/home')

// 历史记录控制
router.back()
router.forward()
router.go(-2)
```

## 导航守卫

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

## 动态路由

```typescript
const routes = [
  { path: '/user/:id', component: User },
  { path: '/post/:id/:slug', component: Post },
]
```

## 嵌套路由

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

## 历史模式

```typescript
// HTML5 History 模式
import { createWebHistory } from '@ldesign/router-*'
const history = createWebHistory('/app/')

// Hash 模式
import { createWebHashHistory } from '@ldesign/router-*'
const history = createWebHashHistory()

// Memory 模式（SSR/测试）
import { createMemoryHistory } from '@ldesign/router-*'
const history = createMemoryHistory()
```

## API 对比

| 功能 | Vue 3 | React | Svelte | Solid.js |
|------|-------|-------|--------|----------|
| 创建路由器 | `createRouter()` | `createRouter()` | `createRouter()` | `createRouter()` |
| 上下文提供 | `app.use(router)` | `<RouterProvider>` | `<RouterProvider>` | `<RouterProvider>` |
| 获取路由器 | `useRouter()` | `useRouter()` | `getRouter()` | `useRouter()` |
| 当前路由 | `useRoute()` + `.value` | `useRoute()` | `$route` store | `useRoute()` + `()` |
| 路由参数 | `useParams()` + `.value` | `useParams()` | `$params` store | `useParams()` + `()` |
| 查询参数 | `useQuery()` + `.value` | `useQuery()` | `$query` store | `useQuery()` + `()` |

## 下一步

- 查看各包的详细文档：
  - [Vue 包文档](./packages/vue/README.md)
  - [React 包文档](./packages/react/README.md)
  - [Svelte 包文档](./packages/svelte/README.md)
  - [Solid.js 包文档](./packages/solid/README.md)
- 运行示例项目
- 阅读 [最佳实践](./BEST_PRACTICES.md)

## 获取帮助

- [GitHub Issues](https://github.com/ldesign/ldesign/issues)
- [文档网站](https://ldesign.dev)

## 许可证

MIT


