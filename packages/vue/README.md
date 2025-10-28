# @ldesign/router-vue

Vue 3 路由库，基于 vue-router v4 和 @ldesign/router-core 构建，提供增强的功能和统一的 API。

## 特性

- 🎯 **基于 vue-router** - 利用成熟的 vue-router v4 生态
- 🚀 **增强功能** - 额外的高级功能和优化
- 📦 **轻量级** - 按需加载，Tree-shaking 友好
- 🔧 **TypeScript** - 完整的类型定义支持
- 🎨 **灵活扩展** - 插件系统，易于扩展

## 安装

```bash
pnpm add @ldesign/router-vue vue-router
```

## 快速开始

### 基础用法

```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from '@ldesign/router-vue'
import App from './App.vue'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./views/About.vue'),
    meta: { title: '关于' }
  },
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 在组件中使用

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

### 使用 Composables

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

### 路由守卫

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from '@ldesign/router-vue'

// 离开路由前
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

// 路由更新时
onBeforeRouteUpdate((to, from, next) => {
  // 处理路由参数变化
  console.log('路由更新:', to.params)
  next()
})
</script>
```

## API 参考

### 路由器创建

#### `createRouter(options)`

创建路由器实例。

```typescript
import { createRouter, createWebHistory } from '@ldesign/router-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})
```

### 历史模式

#### `createWebHistory(base?)`

创建 HTML5 History 模式。

```typescript
import { createWebHistory } from '@ldesign/router-vue'

const history = createWebHistory('/app/')
```

#### `createWebHashHistory(base?)`

创建 Hash 模式。

```typescript
import { createWebHashHistory } from '@ldesign/router-vue'

const history = createWebHashHistory()
```

#### `createMemoryHistory(base?)`

创建 Memory 模式（用于 SSR 或测试）。

```typescript
import { createMemoryHistory } from '@ldesign/router-vue'

const history = createMemoryHistory()
```

### Composables

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

console.log(route.path)
console.log(route.params)
console.log(route.query)
console.log(route.meta)
```

#### `useParams()`

获取路由参数。

```typescript
const params = useParams()

console.log(params.value.id)
```

#### `useQuery()`

获取查询参数。

```typescript
const query = useQuery()

console.log(query.value.search)
```

#### `useHash()`

获取哈希值。

```typescript
const hash = useHash()

console.log(hash.value)
```

#### `useMeta()`

获取路由元信息。

```typescript
const meta = useMeta()

console.log(meta.value.title)
```

### 组件

#### `<RouterView>`

路由视图组件。

```vue
<template>
  <RouterView />
</template>
```

#### `<RouterLink>`

路由链接组件。

```vue
<template>
  <RouterLink to="/about">关于</RouterLink>
  <RouterLink :to="{ name: 'Home' }">首页</RouterLink>
</template>
```

### 工具函数

```typescript
import {
  normalizePath,
  joinPaths,
  buildPath,
  parseQuery,
  stringifyQuery,
} from '@ldesign/router-vue'

// 路径处理
normalizePath('/about/') // => '/about'
joinPaths('/api', 'users') // => '/api/users'
buildPath('/user/:id', { id: '123' }) // => '/user/123'

// 查询参数
parseQuery('page=1&sort=desc') // => { page: '1', sort: 'desc' }
stringifyQuery({ page: '1' }) // => 'page=1'
```

## 与 vue-router 的关系

`@ldesign/router-vue` 是基于 vue-router v4 构建的增强版本：

- **兼容性**: 完全兼容 vue-router 的 API
- **增强功能**: 提供额外的高级功能
- **统一接口**: 与 @ldesign/router-react 提供一致的 API

你可以将其视为 vue-router 的超集，所有 vue-router 的功能都可以正常使用。

## 与 @ldesign/router-core 的关系

`@ldesign/router-vue` 使用 `@ldesign/router-core` 提供的框架无关功能：

- 类型定义
- 工具函数（路径、查询参数、URL 处理）
- 历史管理基础类

这使得代码更加模块化，并且可以在不同框架间共享核心逻辑。

## 迁移指南

### 从 vue-router 迁移

如果你正在使用 vue-router，迁移到 @ldesign/router-vue 非常简单：

1. 安装包：
```bash
pnpm add @ldesign/router-vue
```

2. 更新导入：
```typescript
// 之前
import { createRouter, createWebHistory } from 'vue-router'

// 现在
import { createRouter, createWebHistory } from '@ldesign/router-vue'
```

3. 其他代码无需修改！

### 从旧版 @ldesign/router 迁移

如果你正在使用旧版的 `@ldesign/router`（Vue 专用版本），现在应该迁移到 `@ldesign/router-vue`：

1. 安装新包：
```bash
pnpm add @ldesign/router-vue vue-router
```

2. 更新导入：
```typescript
// 之前
import { createRouter } from '@ldesign/router'

// 现在
import { createRouter } from '@ldesign/router-vue'
```

3. API 保持一致，无需其他修改

## 许可证

MIT

