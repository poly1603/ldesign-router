# 快速开始

本指南将帮助你快速上手 `@ldesign/router` 路由库。

## 安装

### Vue 3

```bash
pnpm add @ldesign/router-vue vue-router
```

### React

```bash
pnpm add @ldesign/router-react react-router-dom
```

### 其他框架

```bash
# Svelte
pnpm add @ldesign/router-svelte

# Solid.js
pnpm add @ldesign/router-solid @solidjs/router

# 仅核心库（框架无关）
pnpm add @ldesign/router-core
```

## 基础用法

### Vue 3

```typescript
// router/index.ts
import { createRouter, createWebHistory } from '@ldesign/router-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue'),
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => import('../views/User.vue'),
    },
  ],
})

export default router
```

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useRouter, useRoute, useParams } from '@ldesign/router-vue'

const router = useRouter()
const route = useRoute()
const params = useParams()

// 编程式导航
const goToUser = (id: string) => {
  router.push({ name: 'user', params: { id } })
}

// 获取当前路由参数
console.log(params.id)
</script>

<template>
  <div>
    <h1>当前路由: {{ route.path }}</h1>
    <button @click="goToUser('123')">查看用户</button>
  </div>
</template>
```

## 路由配置

### 动态路由

```typescript
const routes = [
  // 必需参数
  { path: '/user/:id', component: UserProfile },
  
  // 可选参数
  { path: '/user/:id?', component: UserProfile },
  
  // 多个参数
  { path: '/user/:userId/post/:postId', component: PostDetail },
  
  // 通配符
  { path: '/files/:path*', component: FileExplorer },
]
```

### 嵌套路由

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: '', component: UserHome },
      { path: 'profile', component: UserProfile },
      { path: 'settings', component: UserSettings },
    ],
  },
]
```

### 路由元信息

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台',
    },
  },
]
```

## 导航守卫

### 全局守卫

```typescript
// 前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'login' })
  } else {
    next()
  }
})

// 后置钩子
router.afterEach((to, from) => {
  document.title = to.meta.title || '默认标题'
})
```

### 路由级守卫

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (hasAdminPermission()) {
        next()
      } else {
        next({ name: 'forbidden' })
      }
    },
  },
]
```

### 组件内守卫

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from '@ldesign/router-vue'

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges()) {
    return confirm('确定要离开吗？')
  }
})

onBeforeRouteUpdate((to, from) => {
  // 路由参数变化时触发
  fetchData(to.params.id)
})
</script>
```

## 高级功能

### 懒加载

```typescript
import { LazyLoadManager } from '@ldesign/router-core'

const lazyManager = new LazyLoadManager()

const routes = [
  {
    path: '/dashboard',
    component: lazyManager.create(() => import('./Dashboard.vue'), {
      retries: 3,
      timeout: 5000,
    }),
  },
]
```

### 预取

```typescript
import { createPrefetchManager } from '@ldesign/router-core'

const prefetch = createPrefetchManager({
  strategy: 'hover',  // 'hover' | 'visible' | 'idle'
})

// 手动预取
prefetch.prefetch('/about')
```

### 权限控制

```typescript
import { createPermissionManager } from '@ldesign/router-core'

const permissions = createPermissionManager()

// 设置用户权限
permissions.setPermissions(['read', 'write'])
permissions.setRoles(['admin'])

// 在路由守卫中检查
router.beforeEach((to, from, next) => {
  if (to.meta.permission && !permissions.check(to.meta.permission)) {
    next({ name: 'forbidden' })
  } else {
    next()
  }
})
```

## 性能优化

### 启用 Trie 树匹配器

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  useTrie: true,  // 启用高性能 Trie 树匹配
  enableCache: true,
  cacheSize: 1000,
})
```

### 性能监控

```typescript
import { createPerformanceMonitor } from '@ldesign/router-core'

const monitor = createPerformanceMonitor({
  enableWarnings: true,
  thresholds: {
    navigation: 100,  // 导航超过 100ms 发出警告
    guardExecution: 50,
  },
})

router.beforeEach((to, from, next) => {
  monitor.startNavigation(to.path)
  next()
})

router.afterEach((to) => {
  const metrics = monitor.endNavigation()
  console.log('导航耗时:', metrics.duration)
})
```

## 下一步

- 查看 [API 参考](../api/README.md)
- 了解 [核心概念](./core-concepts.md)
- 探索 [高级用法](./advanced.md)
