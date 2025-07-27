# 快速开始

本指南将帮助您在 5 分钟内上手 `@ldesign/router`，从安装到创建第一个路由应用。

## 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **Vue** >= 3.3.0
- **TypeScript** >= 5.0.0 (推荐)

## 安装

使用您喜欢的包管理器安装 `@ldesign/router`：

::: code-group

```bash [pnpm]
pnpm add @ldesign/router
```

```bash [npm]
npm install @ldesign/router
```

```bash [yarn]
yarn add @ldesign/router
```

:::

## 基础使用

### 1. 创建路由器

首先创建一个路由器实例：

```typescript
// router/index.ts
import { createLDesignRouter } from '@ldesign/router'
import type { RouteConfig } from '@ldesign/router'

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于我们'
    }
  }
]

export default createLDesignRouter({
  routes,
  history: 'history', // 使用 HTML5 History 模式
})
```

### 2. 在 Vue 应用中使用

```typescript
// main.ts
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 3. 创建布局组件

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">
        首页
      </router-link>
      <router-link to="/about">
        关于
      </router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
nav {
  padding: 1rem;
  background: #f5f5f5;
}

nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: #333;
}

nav a.router-link-active {
  color: #1890ff;
  font-weight: bold;
}

main {
  padding: 2rem;
}
</style>
```

## 启用核心功能

### 权限管理

```typescript
const router = createLDesignRouter({
  routes: [
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ],
  permission: {
    enabled: true,
    checkRole: (roles: string[]) => {
      const userRoles = getCurrentUserRoles()
      return roles.some(role => userRoles.includes(role))
    },
    redirectPath: '/login'
  }
})
```

### 面包屑导航

```typescript
const router = createLDesignRouter({
  routes,
  breadcrumb: {
    enabled: true,
    showHome: true,
    homeText: '首页',
    separator: '/'
  }
})
```

### 缓存管理

```typescript
const router = createLDesignRouter({
  routes: [
    {
      path: '/list',
      name: 'List',
      component: () => import('@/views/List.vue'),
      meta: {
        cache: true // 启用缓存
      }
    }
  ],
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 10
  }
})
```

## 使用组合式函数

在组件中使用路由相关的组合式函数：

```vue
<script setup lang="ts">
import {
  useBreadcrumbs,
  useDevice,
  usePermissions,
  useRoute
} from '@ldesign/router'

// 获取当前路由
const route = useRoute()

// 获取面包屑导航
const { breadcrumbs } = useBreadcrumbs()

// 获取设备信息
const { deviceType, isMobile } = useDevice()

// 获取权限相关功能
const { hasPermission } = usePermissions()
</script>

<template>
  <div>
    <h1>{{ route.meta?.title }}</h1>

    <!-- 面包屑导航 -->
    <nav class="breadcrumb">
      <span v-for="(item, index) in breadcrumbs" :key="index">
        <router-link v-if="item.path" :to="item.path">
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
        <span v-if="index < breadcrumbs.length - 1"> / </span>
      </span>
    </nav>

    <!-- 设备信息 -->
    <div class="device-info">
      <p>当前设备: {{ deviceType }}</p>
      <p>是否移动设备: {{ isMobile ? '是' : '否' }}</p>
    </div>

    <!-- 权限检查 -->
    <div v-if="hasPermission(['admin'])" class="admin-panel">
      <h2>管理员面板</h2>
      <p>只有管理员可以看到这个内容</p>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  margin: 1rem 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.device-info {
  margin: 1rem 0;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 4px;
}

.admin-panel {
  margin: 1rem 0;
  padding: 1rem;
  background: #fff3e0;
  border-radius: 4px;
  border-left: 4px solid #ff9800;
}
</style>
```

## 编程式导航

在组件中使用编程式导航：

```vue
<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 导航到指定路由
function goToHome() {
  router.push('/')
}

// 返回上一页
function goBack() {
  router.back()
}

// 前进到下一页
function goForward() {
  router.forward()
}

// 带参数导航
function goToProduct() {
  router.push({
    name: 'Product',
    params: { id: '123' },
    query: { tab: 'details' }
  })
}
</script>

<template>
  <div>
    <button @click="goToHome">
      回到首页
    </button>
    <button @click="goBack">
      返回
    </button>
    <button @click="goForward">
      前进
    </button>
    <button @click="goToProduct">
      查看产品
    </button>
  </div>
</template>
```

## 设备适配

为不同设备提供不同的组件：

```typescript
const routes: RouteConfig[] = [
  {
    path: '/product/:id',
    name: 'Product',
    components: {
      desktop: () => import('@/views/ProductDesktop.vue'),
      tablet: () => import('@/views/ProductTablet.vue'),
      mobile: () => import('@/views/ProductMobile.vue')
    }
  }
]

const router = createLDesignRouter({
  routes,
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    }
  }
})
```

## 路由动画

添加页面切换动画：

```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'slide',
    duration: 300,
    direction: 'right'
  }
})
```

在组件中使用：

```vue
<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()
const animationName = computed(() => {
  return router.animationManager.getTransitionOptions(
    router.currentRoute,
    router.currentRoute
  ).name
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="animationName"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

## 开发工具

在开发环境中启用调试工具：

```typescript
const router = createLDesignRouter({
  routes,
  devTools: process.env.NODE_ENV === 'development'
})
```

## 下一步

现在您已经成功创建了一个基于 `@ldesign/router` 的应用！接下来您可以：

- 📖 阅读 [核心概念](/guide/core-concepts) 深入理解路由管理
- 🔐 了解 [权限管理](/features/permissions) 实现访问控制
- 💾 探索 [缓存管理](/features/caching) 优化性能
- 🍞 使用 [面包屑导航](/features/breadcrumbs) 改善用户体验
- 📑 配置 [标签页管理](/features/tabs) 支持多标签页
- 🎬 添加 [路由动画](/features/animations) 提升交互体验

## 常见问题

### TypeScript 支持

`@ldesign/router` 提供完整的 TypeScript 支持。确保在 `tsconfig.json` 中包含正确的类型：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/router"]
  }
}
```

### Vite 配置

如果您使用 Vite，建议添加以下别名配置：

```typescript
// vite.config.ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 与 Vue Router 的关系

`@ldesign/router` 是基于 Vue Router 构建的增强版本，提供了更多企业级功能。如果您熟悉 Vue Router，可以很容易地迁移到 `@ldesign/router`。
