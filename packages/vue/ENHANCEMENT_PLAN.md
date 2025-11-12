# Vue Router 模块优化和增强计划

> 📅 计划日期: 2025-11-11
> 
> 🎯 目标: 让 @ldesign/router-vue 在 Vue 3 中使用最简单，功能最丰富

---

## 📊 现状分析

### ✅ 已有功能

1. **基础路由功能**
   - 完整的 vue-router v4 API 适配
   - RouterView 和 RouterLink 组件
   - 基础 composables (useRouter, useRoute等)

2. **增强 Composables** (已添加)
   - useParams, useQuery, useHash, useMeta
   - useTypedParams, useTypedQuery, useTypedMeta
   - useNavigationState, useBreadcrumb
   - useRouteActive, usePathActive
   - useQueryParam, useParam, useHasQueryParam

3. **Engine 集成**
   - 路由导航事件广播
   - 设备适配支持

### 🔍 不足之处

1. **组件功能单一**
   - RouterView 缺少过渡动画、错误边界等功能
   - RouterLink 缺少预加载、权限控制等功能
   - 缺少高级组件如 RouterTabs, RouterBreadcrumb 等

2. **开发体验**
   - 缺少开发工具和调试辅助
   - 缺少路由导航提示
   - 类型提示不够完善

3. **性能优化**
   - 缺少路由预加载策略
   - 缺少组件缓存管理
   - 缺少懒加载优化

4. **功能完整性**
   - 缺少常用指令 (v-link, v-router-link)
   - 缺少全局路由配置
   - 缺少路由动画预设

---

## 🎯 优化目标

### 1. 极致简单 - 开箱即用

**目标**: 3 行代码完成路由配置

```vue
<script setup lang="ts">
import { createQuickRouter } from '@ldesign/router-vue'

const router = createQuickRouter({
  pages: import.meta.glob('./pages/**/*.vue')
})
</script>
```

### 2. 功能丰富 - 满足所有场景

**目标**: 提供 20+ 实用组件和 Composables

- 基础组件: RouterView, RouterLink
- 导航组件: RouterTabs, RouterBreadcrumb, RouterMenu
- 布局组件: RouterLayout, RouterSidebar
- 辅助组件: RouterTransition, RouterSuspense, RouterErrorBoundary

### 3. 性能优越 - 自动优化

**目标**: 零配置实现最佳性能

- 自动代码分割
- 智能预加载
- 路由缓存
- 按需加载

### 4. 类型完美 - 编译时检查

**目标**: 100% 类型安全

- 路径参数自动推断
- 查询参数类型检查
- 元信息类型完整

---

## 📦 实施计划

### 阶段一: 增强核心组件 (高优先级)

#### 1.1 增强 RouterView

**新增功能**:

```vue
<template>
  <RouterView
    <!-- 过渡动画 -->
    :transition="{
      name: 'fade',
      mode: 'out-in',
      duration: 300
    }"
    
    <!-- Suspense 支持 -->
    :suspense="{
      timeout: 3000,
      fallback: LoadingComponent
    }"
    
    <!-- 错误边界 -->
    :error-boundary="{
      fallback: ErrorComponent,
      onError: handleError
    }"
    
    <!-- KeepAlive 支持 -->
    :keep-alive="{
      include: /^(Home|User)$/,
      max: 10
    }"
    
    <!-- 自动滚动 -->
    scroll-behavior="smooth"
  />
</template>
```

**实现文件**: `components/RouterView.vue`

#### 1.2 增强 RouterLink

**新增功能**:

```vue
<template>
  <RouterLink
    to="/user/123"
    
    <!-- 预加载 -->
    prefetch="hover"
    
    <!-- 权限控制 -->
    :requires-auth="true"
    :requires-roles="['admin']"
    
    <!-- 外部链接支持 -->
    external
    target="_blank"
    
    <!-- 禁用状态 -->
    :disabled="!canAccess"
    
    <!-- 确认提示 -->
    confirm="确定要离开吗?"
    
    <!-- 自定义活跃状态 -->
    :exact="true"
    active-class="active"
  >
    User Profile
  </RouterLink>
</template>
```

**实现文件**: `components/RouterLink.vue`

---

### 阶段二: 新增高级组件 (高优先级)

#### 2.1 RouterTabs - 标签页导航

**功能**: 多标签页面管理

```vue
<template>
  <RouterTabs
    <!-- 持久化 -->
    persistent
    storage-key="app-tabs"
    
    <!-- 最大标签数 -->
    :max="10"
    
    <!-- 关闭策略 -->
    closable
    close-others
    close-all
    
    <!-- 右键菜单 -->
    :context-menu="[
      { label: '刷新', action: 'refresh' },
      { label: '关闭', action: 'close' },
      { label: '关闭其他', action: 'closeOthers' },
      { label: '关闭所有', action: 'closeAll' }
    ]"
    
    <!-- 自定义渲染 -->
    #tab="{ route, active, close }"
  >
    <div :class="{ active }">
      <Icon :name="route.meta.icon" />
      {{ route.meta.title }}
      <CloseButton @click="close" />
    </div>
  </RouterTabs>
</template>
```

**实现文件**: `components/RouterTabs.vue`

#### 2.2 RouterBreadcrumb - 面包屑导航

**功能**: 自动生成面包屑

```vue
<template>
  <RouterBreadcrumb
    <!-- 分隔符 -->
    separator="/"
    
    <!-- 首页链接 -->
    show-home
    home-title="首页"
    
    <!-- 最大显示数 -->
    :max-items="5"
    
    <!-- 自定义渲染 -->
    #item="{ item, isLast }"
  >
    <span :class="{ 'text-muted': isLast }">
      {{ item.meta?.breadcrumb || item.meta?.title || item.name }}
    </span>
  </RouterBreadcrumb>
</template>
```

**实现文件**: `components/RouterBreadcrumb.vue`

#### 2.3 RouterMenu - 菜单导航

**功能**: 自动生成导航菜单

```vue
<template>
  <RouterMenu
    <!-- 菜单模式 -->
    mode="vertical"
    
    <!-- 折叠控制 -->
    :collapsed="isCollapsed"
    
    <!-- 权限过滤 -->
    check-permission
    
    <!-- 自动高亮 -->
    active-match="path"
    
    <!-- 图标支持 -->
    show-icon
    
    <!-- 徽章支持 -->
    show-badge
    
    <!-- 自定义渲染 -->
    #item="{ route, active, children }"
  >
    <MenuItem
      :active="active"
      :icon="route.meta.icon"
      :badge="route.meta.badge"
    >
      {{ route.meta.title }}
    </MenuItem>
  </RouterMenu>
</template>
```

**实现文件**: `components/RouterMenu.vue`

#### 2.4 RouterLayout - 布局管理

**功能**: 常见布局模式

```vue
<template>
  <RouterLayout
    <!-- 布局类型 -->
    layout="sidebar"
    
    <!-- 响应式配置 -->
    :responsive="{
      mobile: 'drawer',
      tablet: 'collapsed',
      desktop: 'expanded'
    }"
    
    <!-- 插槽 -->
    #header
    #sidebar
    #content
    #footer
  >
    <template #header>
      <AppHeader />
    </template>
    
    <template #sidebar>
      <RouterMenu :routes="routes" />
    </template>
    
    <template #content>
      <RouterView />
    </template>
  </RouterLayout>
</template>
```

**实现文件**: `components/RouterLayout.vue`

---

### 阶段三: 新增实用 Composables (中优先级)

#### 3.1 路由守卫相关

```typescript
// useBeforeRouteEnter - 组件进入守卫
export function useBeforeRouteEnter(
  guard: NavigationGuard
): void

// useBeforeRouteUpdate - 组件更新守卫  
export function useBeforeRouteUpdate(
  guard: NavigationGuard
): void

// useBeforeRouteLeave - 组件离开守卫
export function useBeforeRouteLeave(
  guard: NavigationGuard
): void

// useRouteGuard - 统一守卫注册
export function useRouteGuard(
  type: 'enter' | 'update' | 'leave',
  guard: NavigationGuard
): void
```

#### 3.2 路由缓存相关

```typescript
// useRouteCache - 路由缓存控制
export function useRouteCache(): {
  cache: (name: string) => void
  uncache: (name: string) => void
  clearCache: () => void
  getCached: () => string[]
}

// useKeepAlive - KeepAlive 控制
export function useKeepAlive(
  options?: KeepAliveOptions
): {
  include: Ref<string[]>
  exclude: Ref<string[]>
  max: Ref<number>
}
```

#### 3.3 路由动画相关

```typescript
// useRouteTransition - 路由过渡动画
export function useRouteTransition(): {
  name: Ref<string>
  mode: Ref<'in-out' | 'out-in'>
  duration: Ref<number>
  setTransition: (config: TransitionConfig) => void
}

// usePageTransition - 页面过渡效果
export function usePageTransition(
  type?: 'fade' | 'slide' | 'zoom' | 'custom'
): TransitionProps
```

#### 3.4 路由预加载相关

```typescript
// usePrefetch - 路由预加载
export function usePrefetch(): {
  prefetch: (to: RouteLocationRaw) => Promise<void>
  prefetchAll: () => Promise<void>
  isPrefetched: (path: string) => boolean
}

// useRoutePreload - 智能预加载
export function useRoutePreload(
  options?: PreloadOptions
): {
  enable: () => void
  disable: () => void
  preload: (routes: string[]) => Promise<void>
}
```

#### 3.5 路由状态相关

```typescript
// useRouteHistory - 路由历史
export function useRouteHistory(): {
  history: Ref<RouteLocation[]>
  canGoBack: Ref<boolean>
  canGoForward: Ref<boolean>
  goBack: () => void
  goForward: () => void
  go: (n: number) => void
}

// useRouteTitle - 页面标题管理
export function useRouteTitle(
  template?: string
): {
  title: Ref<string>
  setTitle: (title: string) => void
}

// useRouteProgress - 路由进度条
export function useRouteProgress(): {
  start: () => void
  finish: () => void
  fail: () => void
  set: (percent: number) => void
}
```

---

### 阶段四: 新增指令 (中优先级)

#### 4.1 v-route-link - 路由链接指令

```vue
<template>
  <!-- 简单用法 -->
  <div v-route-link="'/user/123'">
    User Profile
  </div>
  
  <!-- 配置用法 -->
  <div v-route-link="{
    to: '/user/123',
    prefetch: true,
    activeClass: 'active'
  }">
    User Profile
  </div>
</template>
```

#### 4.2 v-route-active - 活跃状态指令

```vue
<template>
  <!-- 路径匹配 -->
  <div v-route-active="'/dashboard'">
    Dashboard
  </div>
  
  <!-- 名称匹配 -->
  <div v-route-active:name="'dashboard'">
    Dashboard
  </div>
  
  <!-- 自定义类名 -->
  <div v-route-active:path="{ 
    path: '/dashboard',
    activeClass: 'is-active'
  }">
    Dashboard
  </div>
</template>
```

#### 4.3 v-route-guard - 守卫指令

```vue
<template>
  <!-- 权限守卫 -->
  <button v-route-guard:auth>
    管理员功能
  </button>
  
  <!-- 角色守卫 -->
  <button v-route-guard:role="['admin', 'editor']">
    编辑功能
  </button>
  
  <!-- 自定义守卫 -->
  <button v-route-guard="canAccess">
    特殊功能
  </button>
</template>
```

---

### 阶段五: 优化开发体验 (低优先级)

#### 5.1 快速创建路由

```typescript
// createQuickRouter - 快速创建路由器
export function createQuickRouter(options: QuickRouterOptions): Router {
  return createRouter({
    history: createWebHistory(),
    routes: autoGenerateRoutes(options.pages),
    ...defaultOptions
  })
}

// autoGenerateRoutes - 自动生成路由
export function autoGenerateRoutes(
  pages: Record<string, any>
): RouteRecordRaw[]
```

#### 5.2 路由配置辅助

```typescript
// defineRoutes - 定义路由（类型安全）
export function defineRoutes<T extends RouteRecordRaw[]>(
  routes: T
): T

// defineRoute - 定义单个路由（类型安全）
export function defineRoute<T extends RouteRecordRaw>(
  route: T
): T

// mergeRoutes - 合并路由配置
export function mergeRoutes(...routes: RouteRecordRaw[][]): RouteRecordRaw[]
```

#### 5.3 开发工具

```typescript
// useRouterDevtools - 开发工具钩子
export function useRouterDevtools(): {
  inspectRoute: (path: string) => RouteInspectInfo
  logNavigation: (enabled: boolean) => void
  getPerformance: () => PerformanceMetrics
  exportRoutes: () => string
}
```

---

### 阶段六: 性能优化 (低优先级)

#### 6.1 自动代码分割

```typescript
// setupCodeSplitting - 配置代码分割
export function setupCodeSplitting(options?: CodeSplitOptions): void

// lazyRoute - 懒加载路由
export function lazyRoute(
  loader: () => Promise<any>,
  options?: LazyOptions
): Component
```

#### 6.2 预加载策略

```typescript
// setupPrefetch - 配置预加载
export function setupPrefetch(options: PrefetchOptions): void

// prefetchRoute - 预加载路由
export function prefetchRoute(to: RouteLocationRaw): Promise<void>

// prefetchOnIdle - 空闲时预加载
export function prefetchOnIdle(routes: string[]): void
```

#### 6.3 缓存优化

```typescript
// setupRouteCache - 配置路由缓存
export function setupRouteCache(options: CacheOptions): void

// cacheRoute - 缓存路由组件
export function cacheRoute(name: string): void

// clearRouteCache - 清除路由缓存
export function clearRouteCache(name?: string): void
```

---

## 📈 实施优先级

### 高优先级 (立即实施)

1. ✅ 增强 RouterView (过渡动画、Suspense、错误边界)
2. ✅ 增强 RouterLink (预加载、权限控制)
3. ✅ RouterTabs 组件
4. ✅ RouterBreadcrumb 组件
5. ✅ 基础指令 (v-route-link, v-route-active)

### 中优先级 (1-2周内)

1. ⏳ RouterMenu 组件
2. ⏳ RouterLayout 组件
3. ⏳ 路由守卫 Composables
4. ⏳ 路由缓存 Composables
5. ⏳ 路由动画 Composables

### 低优先级 (1-2月内)

1. ⏳ 快速创建路由 API
2. ⏳ 开发工具集成
3. ⏳ 性能优化工具
4. ⏳ 完整的类型支持
5. ⏳ 文档和示例

---

## 🎨 设计原则

### 1. 约定优于配置

提供合理的默认值，减少配置负担

```typescript
// ✅ 好 - 零配置
<RouterView />

// ❌ 差 - 需要大量配置
<RouterView 
  :transition="..." 
  :suspense="..." 
  :error-boundary="..."
/>
```

### 2. 渐进式增强

基础功能简单，高级功能可选

```typescript
// 基础用法
<RouterLink to="/user">User</RouterLink>

// 高级用法
<RouterLink 
  to="/user" 
  prefetch 
  :requires-auth="true"
>
  User
</RouterLink>
```

### 3. 组合优于继承

使用 Composables 而不是 Mixins

```typescript
// ✅ 好 - Composable
const { params } = useParams()
const { query } = useQuery()

// ❌ 差 - Mixin
mixins: [routeMixin]
```

### 4. 类型完整性

100% TypeScript 支持

```typescript
// 类型自动推断
const userId = useParam('id') // string
const page = useQueryParam('page', '1') // string
```

---

## 📝 文档计划

### 1. 快速开始

- 5 分钟上手指南
- 基础路由配置
- 常见场景示例

### 2. API 文档

- Composables API
- Components API
- Directives API
- Types API

### 3. 高级指南

- 路由守卫
- 路由动画
- 性能优化
- 最佳实践

### 4. 示例项目

- 基础示例
- 完整应用示例
- 最佳实践示例

---

## 🎯 成功指标

### 用户体验指标

- ✅ 路由配置时间 < 5 分钟
- ✅ 常见功能无需查文档
- ✅ 类型提示覆盖率 > 95%
- ✅ 构建体积增加 < 10KB (gzipped)

### 开发体验指标

- ✅ 代码提示准确率 > 90%
- ✅ 编译时错误捕获率 > 80%
- ✅ API 学习曲线 < 1 小时
- ✅ 文档完整度 > 95%

### 性能指标

- ✅ 首屏加载时间 < 2s
- ✅ 路由切换时间 < 100ms
- ✅ 内存占用 < 50MB
- ✅ 代码分割率 > 80%

---

## 🚀 下一步行动

### 本周 (Week 1)

1. 实现增强的 RouterView 组件
2. 实现增强的 RouterLink 组件
3. 开始实现 RouterTabs 组件

### 下周 (Week 2)

1. 完成 RouterTabs 组件
2. 实现 RouterBreadcrumb 组件
3. 实现基础指令

### 本月内 (Month 1)

1. 完成所有高优先级功能
2. 编写完整文档
3. 创建示例项目

---

**维护者**: @ldesign-team

**最后更新**: 2025-11-11
