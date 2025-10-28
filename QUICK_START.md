# 快速入门指南

快速了解如何使用 @ldesign/router 多框架路由库。

## 📦 包说明

| 包名 | 用途 | 依赖 |
|------|------|------|
| `@ldesign/router-core` | 框架无关核心 | mitt, nanoid |
| `@ldesign/router-vue` | Vue 3 路由 | core, vue, vue-router |
| `@ldesign/router-react` | React 路由 | core, react, react-router-dom |

## 🚀 Vue 3 快速开始

### 1. 安装

```bash
pnpm add @ldesign/router-vue vue-router
```

### 2. 创建路由

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router-vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})

export default router
```

### 3. 在 main.ts 中使用

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 4. 在组件中使用

```vue
<template>
  <div>
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from '@ldesign/router-vue'
</script>
```

### 5. 使用 Composables

```vue
<script setup lang="ts">
import { useRouter, useRoute, useParams, useQuery } from '@ldesign/router-vue'

const router = useRouter()
const route = useRoute()
const params = useParams()
const query = useQuery()

// 编程式导航
function goToAbout() {
  router.push('/about')
}

// 访问路由信息
console.log('当前路径:', route.path)
console.log('路由参数:', params.value)
console.log('查询参数:', query.value)
</script>
```

---

## ⚛️ React 快速开始

### 1. 安装

```bash
pnpm add @ldesign/router-react react-router-dom
```

### 2. 创建路由

```typescript
// router/index.ts
import { createRouter } from '@ldesign/router-react'
import Home from '../pages/Home'
import About from '../pages/About'

export const router = createRouter({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/about',
      component: About
    }
  ]
})
```

### 3. 在 main.tsx 中使用

```typescript
// main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@ldesign/router-react'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```

### 4. 在组件中使用

```typescript
// App.tsx
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

### 5. 使用 Hooks

```typescript
// Profile.tsx
import React from 'react'
import { useRouter, useRoute, useParams, useQuery } from '@ldesign/router-react'

function Profile() {
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

  return <div>Profile Page</div>
}
```

---

## 🛠️ 核心功能

### 路径处理

```typescript
import { normalizePath, joinPaths, buildPath } from '@ldesign/router-core'

normalizePath('/about/')  // => '/about'
joinPaths('/api', 'users', '123')  // => '/api/users/123'
buildPath('/user/:id', { id: '123' })  // => '/user/123'
```

### 查询参数

```typescript
import { parseQuery, stringifyQuery } from '@ldesign/router-core'

parseQuery('page=1&sort=desc')  // => { page: '1', sort: 'desc' }
stringifyQuery({ page: '1', sort: 'desc' })  // => 'page=1&sort=desc'
```

### URL 处理

```typescript
import { parseURL, stringifyURL } from '@ldesign/router-core'

parseURL('/about?page=1#section')
// => { path: '/about', query: { page: '1' }, hash: 'section', fullPath: '/about?page=1#section' }

stringifyURL({ path: '/about', query: { page: '1' }, hash: 'section' })
// => '/about?page=1#section'
```

### 历史管理

```typescript
import { createWebHistory, createWebHashHistory, createMemoryHistory } from '@ldesign/router-core'

// HTML5 History（推荐）
const history = createWebHistory('/base/')

// Hash History（兼容性好）
const history = createWebHashHistory('/base/')

// Memory History（SSR/测试）
const history = createMemoryHistory('/base/')
```

---

## 🔥 常见场景

### 嵌套路由

**Vue:**
```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'settings', component: UserSettings }
    ]
  }
]
```

**React:**
```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'settings', component: UserSettings }
    ]
  }
]
```

### 动态路由

**Vue:**
```typescript
const routes = [
  { path: '/user/:id', component: UserDetail }
]

// 在组件中
const params = useParams()
console.log(params.value.id)
```

**React:**
```typescript
const routes = [
  { path: '/user/:id', component: UserDetail }
]

// 在组件中
const params = useParams()
console.log(params.id)
```

### 路由守卫

**Vue:**
```vue
<script setup lang="ts">
import { onBeforeRouteLeave } from '@ldesign/router-vue'

onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges()) {
    if (confirm('有未保存的更改，确定离开？')) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>
```

**React:**
```typescript
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

---

## 📚 API 对比

| 功能 | Vue | React |
|------|-----|-------|
| 创建路由器 | `createRouter()` | `createRouter()` |
| 历史模式 | `createWebHistory()` | `createWebHistory()` |
| 获取路由器 | `useRouter()` | `useRouter()` |
| 获取路由 | `useRoute()` | `useRoute()` |
| 路由参数 | `useParams()` | `useParams()` |
| 查询参数 | `useQuery()` | `useQuery()` |
| 哈希值 | `useHash()` | `useHash()` |
| 元信息 | `useMeta()` | `useMeta()` |
| 组件 | `<RouterView>` | `<RouterView>` |
| 链接 | `<RouterLink>` | `<RouterLink>` |

---

## 🎯 下一步

1. 查看完整文档：
   - [Core 包文档](./packages/core/README.md)
   - [Vue 包文档](./packages/vue/README.md)
   - [React 包文档](./packages/react/README.md)

2. 探索高级功能：
   - 路由守卫
   - 懒加载
   - 滚动行为
   - 元信息

3. 查看示例：
   - Vue 完整示例
   - React 完整示例
   - 对比示例

---

## ❓ 常见问题

### 为什么选择这个库？

- ✅ 统一的 API 设计
- ✅ 框架无关的核心
- ✅ 完整的 TypeScript 支持
- ✅ 基于成熟的官方路由库

### 如何从 vue-router/react-router 迁移？

这个库是对官方路由库的封装，迁移非常简单：
1. 安装对应的包
2. 更改导入语句
3. 其他代码无需修改

### 性能如何？

- 核心包非常轻量（约 15KB）
- 基于官方路由库，性能优秀
- 支持 Tree-shaking

---

**准备好了吗？开始使用 @ldesign/router 吧！** 🚀

