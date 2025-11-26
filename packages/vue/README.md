# @ldesign/router-vue

Vue 3 路由库，基于 vue-router v4 和 @ldesign/router-core 构建，提供增强的功能和统一的 API。

## 特性

- 🎯 **基于 vue-router** - 利用成熟的 vue-router v4 生态
- 🚀 **增强功能** - 额外的高级功能和优化
- 📦 **轻量级** - 按需加载，Tree-shaking 友好
- 🔧 **TypeScript** - 完整的类型定义支持
- 🎨 **灵活扩展** - 插件系统，易于扩展
- 🎭 **丰富组件** - 7个组件（RouterView、RouterLink、RouterTabs、RouterBreadcrumb、RouterModal、RouterSkeleton、RouterGuard）
- 🔌 **实用 Composables** - 8个 Composables 简化开发

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

#### `useMeta()`

获取路由元信息。

```typescript
const meta = useMeta()

console.log(meta.value.title)
```

### 高级 Composables ✨

#### `useRouteCache()`

路由状态缓存，用于保存和恢复路由状态。

```vue
<script setup lang="ts">
import { useRouteCache } from '@ldesign/router-vue'

const { save, restore, clear, has } = useRouteCache({
  ttl: 5 * 60 * 1000, // 5分钟过期
  autoSave: true,      // 路由变化时自动保存
})

// 手动保存当前状态
function saveState() {
  save({
    scrollPosition: window.scrollY,
    formData: { name: 'John' }
  })
}

// 恢复状态
onMounted(() => {
  const cached = restore()
  if (cached) {
    window.scrollTo(0, cached.scrollPosition)
  }
})
</script>
```

#### `useRoutePermission()`

权限检查，用于控制路由访问权限。

```vue
<script setup lang="ts">
import { useRoutePermission } from '@ldesign/router-vue'

const { hasPermission, hasAnyPermission, hasAllPermissions } = useRoutePermission()

// 检查单个权限
const canEdit = hasPermission('edit')

// 检查任一权限
const canModify = hasAnyPermission(['edit', 'delete'])

// 检查所有权限
const canManage = hasAllPermissions(['view', 'edit', 'delete'])
</script>

<template>
  <button v-if="canEdit">编辑</button>
  <button v-if="canModify">修改</button>
</template>
```

#### `useRoutePrefetch()`

路由预取，用于提前加载路由组件。

```vue
<script setup lang="ts">
import { useRoutePrefetch } from '@ldesign/router-vue'

const { prefetch, prefetchOnHover, prefetchOnVisible } = useRoutePrefetch()

// 手动预取
function handleMouseEnter() {
  prefetch('/about')
}

// 悬停时预取
const hoverPrefetch = prefetchOnHover('/about')

// 可见时预取
const visiblePrefetch = prefetchOnVisible('/about')
</script>

<template>
  <a @mouseenter="hoverPrefetch">关于</a>
</template>
```

#### `useRouteHistory()`

历史记录管理，用于控制路由前进后退。

```vue
<script setup lang="ts">
import { useRouteHistory } from '@ldesign/router-vue'

const { canGoBack, canGoForward, goBack, goForward, history } = useRouteHistory()
</script>

<template>
  <button :disabled="!canGoBack" @click="goBack">后退</button>
  <button :disabled="!canGoForward" @click="goForward">前进</button>
  <div>历史记录: {{ history.length }}</div>
</template>
```

### 组件

#### `<RouterView>`

路由视图组件，支持过渡动画、缓存、错误边界等。

```vue
<template>
  <!-- 基础用法 -->
  <RouterView />
  
  <!-- 带过渡动画 -->
  <RouterView transition="fade" />
  
  <!-- 带缓存 -->
  <RouterView :cache="true" :cache-max="10" />
  
  <!-- 完整配置 -->
  <RouterView
    transition="slide-left"
    :cache="{ enabled: true, max: 10 }"
    error-boundary
    suspense
    @route-enter="handleEnter"
  />
</template>
```

#### `<RouterLink>`

路由链接组件。

```vue
<template>
  <RouterLink to="/about">关于</RouterLink>
  <RouterLink :to="{ name: 'User', params: { id: '123' } }">
    用户详情
  </RouterLink>
</template>
```

#### `<RouterTabs>` 

标签页导航组件。

```vue
<template>
  <RouterTabs
    v-model="activeTab"
    :tabs="tabs"
    closable
    @tab-close="handleClose"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterTabs } from '@ldesign/router-vue'

const activeTab = ref('/home')
const tabs = ref([
  { path: '/home', label: '首页' },
  { path: '/about', label: '关于' },
])

function handleClose(path: string) {
  tabs.value = tabs.value.filter(t => t.path !== path)
}
</script>
```

#### `<RouterBreadcrumb>`

面包屑导航组件。

```vue
<template>
  <RouterBreadcrumb
    separator=">"
    :items="breadcrumbs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '@ldesign/router-vue'

const route = useRoute()
const breadcrumbs = computed(() => [
  { path: '/', label: '首页' },
  { path: route.path, label: route.meta.title }
])
</script>
```

### 高级组件 ✨

#### `<RouterModal>`

基于 Teleport 的模态框组件。

```vue
<template>
  <!-- 基础模态框 -->
  <RouterModal
    v-model="showModal"
    title="用户详情"
    width="600px"
  >
    <p>模态框内容</p>
  </RouterModal>
  
  <!-- 作为路由弹窗 -->
  <RouterModal
    v-model="showRouteModal"
    route-view
    close-to-back
    title="编辑"
  >
    <!-- 自动渲染 router-view -->
  </RouterModal>
  
  <!-- 完整配置 -->
  <RouterModal
    v-model="show"
    title="确认"
    width="400px"
    transition="zoom"
    :mask-closable="false"
    show-footer
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <p>确定要删除吗？</p>
  </RouterModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterModal } from '@ldesign/router-vue'

const showModal = ref(false)
const showRouteModal = ref(false)
</script>
```

#### `<RouterSkeleton>`

骨架屏加载组件。

```vue
<template>
  <!-- 内容骨架屏 -->
  <RouterSkeleton
    :loading="loading"
    show-content
    :rows="8"
  >
    <div>实际内容</div>
  </RouterSkeleton>
  
  <!-- 卡片骨架屏 -->
  <RouterSkeleton
    :loading="loading"
    show-cards
    :card-count="6"
    animation="wave"
  />
  
  <!-- 列表骨架屏 -->
  <RouterSkeleton
    :loading="loading"
    show-list
    :list-count="10"
  />
  
  <!-- 自动路由集成 -->
  <RouterSkeleton
    auto-route-change
    :min-show-time="300"
  >
    <router-view />
  </RouterSkeleton>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterSkeleton } from '@ldesign/router-vue'

const loading = ref(true)
</script>
```

#### `<RouterGuard>`

路由守卫可视化组件。

```vue
<template>
  <!-- 权限守卫 -->
  <RouterGuard
    :guard="checkAuth"
    :permission="hasPermission"
  >
    <div>受保护的内容</div>
  </RouterGuard>
  
  <!-- 自定义状态显示 -->
  <RouterGuard :guard="checkAuth">
    <template #checking>
      <div>验证中...</div>
    </template>
    
    <template #failed="{ reason, retry }">
      <div>
        <p>{{ reason }}</p>
        <button @click="retry">重试</button>
      </div>
    </template>
    
    <template #unauthorized="{ login }">
      <div>
        <p>需要登录</p>
        <button @click="login">去登录</button>
      </div>
    </template>
    
    <div>受保护的内容</div>
  </RouterGuard>
  
  <!-- 全屏守卫 -->
  <RouterGuard
    :guard="checkAuth"
    fullscreen
    login-path="/login"
    :max-retries="3"
  >
    <router-view />
  </RouterGuard>
</template>

<script setup lang="ts">
import { RouterGuard } from '@ldesign/router-vue'

const checkAuth = async () => {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  // 验证 token
  const valid = await validateToken(token)
  return valid
}

const hasPermission = () => {
  const user = getUserInfo()
  return user.role === 'admin'
}
</script>
```

## 完整示例

### 完整的应用配置

```vue
<template>
  <div id="app">
    <!-- 面包屑 -->
    <RouterBreadcrumb />
    
    <!-- 标签页导航 -->
    <RouterTabs
      v-model="activeTab"
      :tabs="tabs"
      closable
    />
    
    <!-- 路由守卫 + 骨架屏 + 路由视图 -->
    <RouterGuard :guard="checkAuth">
      <RouterSkeleton
        :loading="loading"
        show-content
      >
        <RouterView
          transition="fade"
          :cache="true"
        />
      </RouterSkeleton>
    </RouterGuard>
    
    <!-- 模态框 -->
    <RouterModal
      v-model="showModal"
      route-view
      close-to-back
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '@ldesign/router-vue'
import {
  RouterView,
  RouterTabs,
  RouterBreadcrumb,
  RouterGuard,
  RouterSkeleton,
  RouterModal,
} from '@ldesign/router-vue'

const route = useRoute()
const activeTab = ref('/')
const loading = ref(false)
const showModal = ref(false)
const tabs = ref([
  { path: '/', label: '首页' }
])

const checkAuth = async () => {
  // 权限检查逻辑
  return true
}

// 监听路由变化
watch(() => route.path, (path) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>
```

## 文档

更多详细文档请参阅：

- [组件使用指南](./docs/COMPONENTS_GUIDE.md) - 完整的组件使用文档
- [Composables 指南](./docs/COMPOSABLES_GUIDE.md) - Composables 使用示例
- [Core 包文档](../core/README.md) - 核心功能文档
- [最佳实践](../core/docs/BEST_PRACTICES.md) - 性能优化和最佳实践


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

