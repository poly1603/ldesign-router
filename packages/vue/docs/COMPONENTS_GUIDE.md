# Vue 组件使用指南

> @ldesign/router-vue 组件库完整使用文档

---

## 📦 组件总览

### 核心组件（4个）
- **RouterView** - 增强版路由视图
- **RouterLink** - 路由链接
- **RouterTabs** - 标签页导航
- **RouterBreadcrumb** - 面包屑导航

### 高级组件（3个）✨ 新增
- **RouterModal** - 基于 Teleport 的模态框
- **RouterSkeleton** - 骨架屏加载
- **RouterGuard** - 守卫可视化

---

## 🎯 高级组件详解

### RouterModal - 路由模态框

基于 Vue 3 Teleport 的模态框组件，支持作为路由弹窗使用。

#### 基础用法

```vue
<template>
  <RouterModal
    v-model="showModal"
    title="用户详情"
    width="600px"
  >
    <p>模态框内容</p>
  </RouterModal>
</template>

<script setup>
import { ref } from 'vue'
import { RouterModal } from '@ldesign/router-vue'

const showModal = ref(false)
</script>
```

#### 作为路由弹窗

```vue
<template>
  <RouterModal
    v-model="showModal"
    route-view
    close-to-back
    title="编辑用户"
  >
    <!-- 会自动渲染 <router-view /> -->
  </RouterModal>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showModal = ref(false)

// 监听路由变化控制模态框显示
watch(() => route.query.modal, (val) => {
  showModal.value = val === 'edit'
})
</script>
```

#### 自定义内容

```vue
<template>
  <RouterModal v-model="showModal">
    <template #header>
      <h2>自定义标题</h2>
    </template>
    
    <div>自定义内容</div>
    
    <template #footer>
      <button @click="handleSave">保存</button>
      <button @click="showModal = false">取消</button>
    </template>
  </RouterModal>
</template>
```

#### Props 完整列表

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | boolean | false | 是否显示 |
| title | string | '' | 标题 |
| width | string/number | '520px' | 宽度 |
| height | string/number | - | 高度 |
| to | string | 'body' | Teleport 目标 |
| transition | string | 'zoom' | 过渡动画 |
| maskClosable | boolean | true | 点击遮罩关闭 |
| escClosable | boolean | true | ESC 关闭 |
| lockScroll | boolean | true | 锁定背景滚动 |
| routeView | boolean | false | 作为路由弹窗 |
| closeToBack | boolean | false | 关闭时返回 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | value: boolean | 显示状态变化 |
| open | - | 打开时触发 |
| close | - | 关闭时触发 |
| opened | - | 打开后触发 |
| closed | - | 关闭后触发 |
| confirm | - | 确认按钮点击 |
| cancel | - | 取消按钮点击 |

---

### RouterSkeleton - 骨架屏

路由切换时的骨架屏加载组件，支持多种预设样式。

#### 基础用法

```vue
<template>
  <RouterSkeleton :loading="loading">
    <div>实际内容</div>
  </RouterSkeleton>
</template>

<script setup>
import { ref } from 'vue'
import { RouterSkeleton } from '@ldesign/router-vue'

const loading = ref(true)

// 模拟加载
setTimeout(() => {
  loading.value = false
}, 2000)
</script>
```

#### 预设样式

```vue
<!-- 头部 + 内容 -->
<RouterSkeleton
  :loading="loading"
  show-header
  show-content
  :rows="5"
/>

<!-- 卡片网格 -->
<RouterSkeleton
  :loading="loading"
  show-cards
  :card-count="6"
/>

<!-- 列表 -->
<RouterSkeleton
  :loading="loading"
  show-list
  :list-count="8"
/>

<!-- 表格 -->
<RouterSkeleton
  :loading="loading"
  show-table
  :table-rows="10"
  :table-columns="5"
/>
```

#### 动画效果

```vue
<!-- 波浪动画（默认） -->
<RouterSkeleton animation="wave" />

<!-- 脉冲动画 -->
<RouterSkeleton animation="pulse" />

<!-- 闪烁动画 -->
<RouterSkeleton animation="shimmer" />

<!-- 无动画 -->
<RouterSkeleton animation="none" />
```

#### 自动路由集成

```vue
<template>
  <RouterSkeleton
    auto-route-change
    :min-show-time="300"
  >
    <router-view />
  </RouterSkeleton>
</template>
```

#### Props 完整列表

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| loading | boolean | true | 是否加载中 |
| animation | string | 'wave' | 动画类型 |
| theme | string | 'light' | 主题（light/dark） |
| showHeader | boolean | false | 显示头部 |
| showContent | boolean | true | 显示内容 |
| showCards | boolean | false | 显示卡片 |
| showList | boolean | false | 显示列表 |
| showTable | boolean | false | 显示表格 |
| rows | number | 5 | 内容行数 |
| cardCount | number | 3 | 卡片数量 |
| listCount | number | 5 | 列表项数量 |
| minShowTime | number | 300 | 最小显示时间（ms） |
| autoRouteChange | boolean | false | 自动监听路由 |

---

### RouterGuard - 路由守卫可视化

可视化路由守卫状态，支持权限检查、加载状态等。

#### 基础用法

```vue
<template>
  <RouterGuard
    :guard="checkAuth"
    :permission="hasPermission"
  >
    <div>受保护的内容</div>
  </RouterGuard>
</template>

<script setup>
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

#### 自定义状态显示

```vue
<template>
  <RouterGuard :guard="checkAuth">
    <!-- 检查中状态 -->
    <template #checking>
      <div class="custom-loading">
        <span>验证中...</span>
      </div>
    </template>
    
    <!-- 失败状态 -->
    <template #failed="{ reason, retry }">
      <div class="custom-error">
        <p>{{ reason }}</p>
        <button @click="retry">重试</button>
      </div>
    </template>
    
    <!-- 未授权状态 -->
    <template #unauthorized="{ login }">
      <div class="custom-unauthorized">
        <p>需要登录</p>
        <button @click="login">去登录</button>
      </div>
    </template>
    
    <!-- 通过后显示的内容 -->
    <div>受保护的内容</div>
  </RouterGuard>
</template>
```

#### 全屏守卫

```vue
<template>
  <RouterGuard
    :guard="checkAuth"
    fullscreen
    unauthorized-title="访问受限"
    unauthorized-message="您没有权限访问此页面"
    login-path="/login"
  >
    <router-view />
  </RouterGuard>
</template>
```

#### 自动重试

```vue
<template>
  <RouterGuard
    :guard="checkNetwork"
    :max-retries="3"
    :check-interval="5000"
    show-retry
  >
    <div>内容</div>
  </RouterGuard>
</template>

<script setup>
const checkNetwork = async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch {
    return false
  }
}
</script>
```

#### Props 完整列表

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| guard | Function | - | 守卫检查函数 |
| permission | Function | - | 权限检查函数 |
| initialState | string | 'checking' | 初始状态 |
| autoCheck | boolean | true | 自动检查 |
| checkInterval | number | 0 | 检查间隔（ms） |
| maxRetries | number | 3 | 最大重试次数 |
| fullscreen | boolean | false | 全屏显示 |
| showRetry | boolean | true | 显示重试按钮 |
| showGoBack | boolean | true | 显示返回按钮 |
| loginPath | string | '/login' | 登录路径 |
| redirectOnFail | string | - | 失败后重定向 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| state-change | state: GuardState | 状态变化 |
| check-start | - | 开始检查 |
| check-complete | passed: boolean | 检查完成 |
| passed | - | 守卫通过 |
| failed | reason: string | 守卫失败 |
| unauthorized | - | 权限不足 |
| retry | attempt: number | 重试 |
| login | - | 登录点击 |

---

## 🎨 组件组合使用

### 示例：完整的路由页面

```vue
<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <RouterBreadcrumb />
    
    <!-- 标签页导航 -->
    <RouterTabs
      v-model="activeTab"
      :tabs="tabs"
      closable
    />
    
    <!-- 路由守卫 + 骨架屏 -->
    <RouterGuard :guard="checkAuth">
      <RouterSkeleton
        :loading="loading"
        show-content
        :rows="8"
      >
        <router-view />
      </RouterSkeleton>
    </RouterGuard>
    
    <!-- 模态框 -->
    <RouterModal
      v-model="showModal"
      title="详情"
      width="800px"
    >
      <router-view name="modal" />
    </RouterModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  RouterBreadcrumb,
  RouterTabs,
  RouterGuard,
  RouterSkeleton,
  RouterModal
} from '@ldesign/router-vue'

const activeTab = ref('/home')
const loading = ref(true)
const showModal = ref(false)

const tabs = [
  { path: '/home', label: '首页' },
  { path: '/about', label: '关于' },
  { path: '/contact', label: '联系' }
]

const checkAuth = async () => {
  // 权限检查逻辑
  return true
}
</script>
```

---

## 📱 响应式设计

所有组件都支持响应式设计，在移动端有优化的显示效果：

```vue
<template>
  <!-- 模态框在移动端全屏 -->
  <RouterModal
    v-model="show"
    :width="isMobile ? '100%' : '600px'"
  />
  
  <!-- 骨架屏在移动端单列 -->
  <RouterSkeleton
    show-cards
    :card-count="isMobile ? 1 : 3"
  />
</template>

<script setup>
import { ref, computed } from 'vue'

const isMobile = computed(() => window.innerWidth < 768)
</script>
```

---

## ♿ 无障碍访问

所有组件都遵循 WCAG 2.1 标准：

```vue
<!-- RouterModal 支持 ARIA 属性 -->
<RouterModal
  v-model="show"
  close-aria-label="关闭对话框"
  role="dialog"
  aria-labelledby="modal-title"
/>

<!-- RouterGuard 提供语义化状态 -->
<RouterGuard :guard="check">
  <div role="main" aria-live="polite">
    内容
  </div>
</RouterGuard>
```

---

## 🎭 主题定制

```vue
<template>
  <div :class="theme">
    <!-- 深色模式骨架屏 -->
    <RouterSkeleton theme="dark" />
    
    <!-- 自定义颜色 -->
    <RouterSkeleton
      base-color="#1a1a1a"
      highlight-color="#2a2a2a"
    />
  </div>
</template>

<style>
.dark {
  --skeleton-base-color: #2c2c2c;
  --skeleton-highlight-color: #3a3a3a;
}
</style>
```

---

## 🚀 性能优化建议

1. **懒加载模态框内容**
```vue
<RouterModal v-model="show">
  <Suspense>
    <AsyncComponent />
  </Suspense>
</RouterModal>
```

2. **骨架屏最小显示时间**
```vue
<RouterSkeleton
  :loading="loading"
  :min-show-time="300"
/>
```

3. **守卫结果缓存**
```vue
<RouterGuard
  :guard="cachedCheck"
  :check-interval="30000"
/>
```

---

## 📖 更多资源

- [Core 包文档](../../core/README.md)
- [Composables 使用指南](../COMPOSABLES_GUIDE.md)
- [最佳实践](../../core/docs/BEST_PRACTICES.md)
- [API 参考](../API_REFERENCE.md)