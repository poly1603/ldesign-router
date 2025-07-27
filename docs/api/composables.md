# 组合式函数 API

`@ldesign/router` 提供了一系列组合式函数，让您可以在 Vue 组件中轻松访问路由功能。

## useRouter

获取路由器实例。

### 语法

```typescript
function useRouter(): LDesignRouter
```

### 返回值

返回当前的路由器实例。

### 示例

```vue
<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 导航到新页面
function goToUser(id: string) {
  router.push(`/user/${id}`)
}

// 返回上一页
function goBack() {
  router.back()
}
</script>
```

## useRoute

获取当前路由信息。

### 语法

```typescript
function useRoute(): Ref<RouteLocationNormalized>
```

### 返回值

返回当前路由的响应式引用。

### 示例

```vue
<script setup lang="ts">
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 监听路由变化
watch(() => route.value.params.id, (newId) => {
  console.log('用户ID变化:', newId)
})
</script>

<template>
  <div>
    <h1>{{ route.meta?.title }}</h1>
    <p>当前路径: {{ route.path }}</p>
    <p>路由参数: {{ JSON.stringify(route.params) }}</p>
    <p>查询参数: {{ JSON.stringify(route.query) }}</p>
  </div>
</template>
```

## usePermissions

权限管理相关功能。

### 语法

```typescript
function usePermissions(): {
  hasRole: (roles: string | string[]) => boolean
  hasPermission: (permissions: string | string[]) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  isAdmin: () => boolean
  isGuest: () => boolean
  currentUser: Ref<User | null>
}
```

### 返回值

- `hasRole` - 检查是否拥有指定角色
- `hasPermission` - 检查是否拥有指定权限
- `hasAnyRole` - 检查是否拥有任意指定角色
- `hasAnyPermission` - 检查是否拥有任意指定权限
- `isAdmin` - 检查是否为管理员
- `isGuest` - 检查是否为访客
- `currentUser` - 当前用户信息

### 示例

```vue
<script setup lang="ts">
import { usePermissions } from '@ldesign/router'

const {
  hasRole,
  hasPermission,
  isAdmin,
  currentUser
} = usePermissions()

function deleteUser() {
  if (hasRole('admin')) {
    // 删除用户逻辑
  }
}

function editUser() {
  if (hasPermission(['user:edit'])) {
    // 编辑用户逻辑
  }
}
</script>

<template>
  <div>
    <button v-if="hasRole('admin')" @click="deleteUser">
      删除用户
    </button>

    <button v-if="hasPermission('user:edit')" @click="editUser">
      编辑用户
    </button>

    <div v-if="isAdmin()" class="admin-panel">
      管理员面板
    </div>
  </div>
</template>
```

## useBreadcrumbs

面包屑导航功能。

### 语法

```typescript
function useBreadcrumbs(): {
  breadcrumbs: Ref<BreadcrumbItem[]>
  separator: Ref<string>
  addBreadcrumb: (item: BreadcrumbItem) => void
  removeBreadcrumb: (index: number) => void
  clearBreadcrumbs: () => void
  getBreadcrumbText: () => string
}
```

### 返回值

- `breadcrumbs` - 面包屑项列表
- `separator` - 分隔符
- `addBreadcrumb` - 添加面包屑项
- `removeBreadcrumb` - 移除面包屑项
- `clearBreadcrumbs` - 清空面包屑
- `getBreadcrumbText` - 获取面包屑文本

### 示例

```vue
<script setup lang="ts">
import { useBreadcrumbs } from '@ldesign/router'

const { breadcrumbs, separator } = useBreadcrumbs()
</script>

<template>
  <nav class="breadcrumb">
    <span v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>

      <span v-if="index < breadcrumbs.length - 1">
        {{ separator }}
      </span>
    </span>
  </nav>
</template>
```

## useDevice

设备检测功能。

### 语法

```typescript
function useDevice(): {
  deviceInfo: Ref<DeviceInfo>
  deviceType: Ref<DeviceType>
  isMobile: Ref<boolean>
  isTablet: Ref<boolean>
  isDesktop: Ref<boolean>
  deviceClass: Ref<string>
}
```

### 返回值

- `deviceInfo` - 设备信息
- `deviceType` - 设备类型
- `isMobile` - 是否为移动设备
- `isTablet` - 是否为平板设备
- `isDesktop` - 是否为桌面设备
- `deviceClass` - 设备CSS类名

### 示例

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/router'

const {
  deviceInfo,
  deviceType,
  isMobile,
  isTablet,
  isDesktop,
  deviceClass
} = useDevice()

// 监听设备变化
watch(deviceType, (newType) => {
  console.log('设备类型变化:', newType)
})
</script>

<template>
  <div :class="deviceClass">
    <h1>设备信息</h1>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕宽度: {{ deviceInfo.width }}px</p>
    <p>屏幕高度: {{ deviceInfo.height }}px</p>

    <div v-if="isMobile" class="mobile-content">
      移动端专用内容
    </div>

    <div v-else-if="isTablet" class="tablet-content">
      平板端专用内容
    </div>

    <div v-else class="desktop-content">
      桌面端专用内容
    </div>
  </div>
</template>
```

## useTabs

标签页管理功能。

### 语法

```typescript
function useTabs(): {
  tabs: Ref<TabItem[]>
  activeTabId: Ref<string | null>
  addTab: (tab: TabItem) => void
  closeTab: (id: string) => void
  closeOtherTabs: (keepId?: string) => void
  closeAllTabs: () => void
  switchTab: (id: string) => void
  moveTab: (fromIndex: number, toIndex: number) => void
}
```

### 返回值

- `tabs` - 标签页列表
- `activeTabId` - 当前活跃标签页ID
- `addTab` - 添加标签页
- `closeTab` - 关闭标签页
- `closeOtherTabs` - 关闭其他标签页
- `closeAllTabs` - 关闭所有标签页
- `switchTab` - 切换标签页
- `moveTab` - 移动标签页

### 示例

```vue
<script setup lang="ts">
import { useTabs } from '@ldesign/router'

const {
  tabs,
  activeTabId,
  closeTab,
  switchTab
} = useTabs()
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item" :class="[{ active: tab.id === activeTabId }]"
        @click="switchTab(tab.id)"
      >
        <span>{{ tab.title }}</span>
        <button
          v-if="tab.closable"
          class="close-btn"
          @click.stop="closeTab(tab.id)"
        >
          ×
        </button>
      </div>
    </div>

    <div class="tabs-content">
      <router-view />
    </div>
  </div>
</template>
```

## useCache

缓存管理功能。

### 语法

```typescript
function useCache(): {
  cacheStats: Ref<CacheStats>
  clearCache: () => void
  removeFromCache: (key: string) => void
  isCached: (key: string) => boolean
  getCacheKeys: () => string[]
}
```

### 返回值

- `cacheStats` - 缓存统计信息
- `clearCache` - 清空所有缓存
- `removeFromCache` - 移除指定缓存
- `isCached` - 检查是否已缓存
- `getCacheKeys` - 获取所有缓存键

### 示例

```vue
<script setup lang="ts">
import { useCache } from '@ldesign/router'

const {
  cacheStats,
  clearCache,
  removeFromCache,
  getCacheKeys
} = useCache()

const cacheKeys = computed(() => getCacheKeys())
</script>

<template>
  <div class="cache-panel">
    <h3>缓存管理</h3>
    <div>缓存数量: {{ cacheStats.size }}/{{ cacheStats.maxSize }}</div>
    <div>命中率: {{ cacheStats.hitRate }}%</div>

    <button @click="clearCache">
      清空缓存
    </button>

    <ul>
      <li v-for="key in cacheKeys" :key="key">
        {{ key }}
        <button @click="removeFromCache(key)">
          删除
        </button>
      </li>
    </ul>
  </div>
</template>
```

## useAnimation

路由动画功能。

### 语法

```typescript
function useAnimation(): {
  animationConfig: Ref<AnimationConfig>
  getTransitionName: (to: RouteLocation, from: RouteLocation) => string
  setAnimation: (config: Partial<AnimationConfig>) => void
}
```

### 返回值

- `animationConfig` - 动画配置
- `getTransitionName` - 获取过渡动画名称
- `setAnimation` - 设置动画配置

### 示例

```vue
<script setup lang="ts">
import { useAnimation, useRoute } from '@ldesign/router'

const route = useRoute()
const { getTransitionName } = useAnimation()
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="getTransitionName(route, $route)"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

## useMenu

菜单管理功能。

### 语法

```typescript
function useMenu(): {
  menuItems: Ref<MenuItem[]>
  activeMenuId: Ref<string | null>
  collapsed: Ref<boolean>
  toggleCollapse: () => void
  setActiveMenu: (id: string) => void
}
```

### 返回值

- `menuItems` - 菜单项列表
- `activeMenuId` - 当前活跃菜单ID
- `collapsed` - 是否折叠
- `toggleCollapse` - 切换折叠状态
- `setActiveMenu` - 设置活跃菜单

### 示例

```vue
<script setup lang="ts">
import { useMenu } from '@ldesign/router'

const {
  menuItems,
  activeMenuId,
  collapsed,
  toggleCollapse,
  setActiveMenu
} = useMenu()
</script>

<template>
  <aside class="sidebar" :class="[{ collapsed }]">
    <button class="collapse-btn" @click="toggleCollapse">
      {{ collapsed ? '展开' : '折叠' }}
    </button>

    <nav class="menu">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item" :class="[{ active: item.id === activeMenuId }]"
        @click="setActiveMenu(item.id)"
      >
        <i :class="item.icon" />
        <span v-if="!collapsed">{{ item.title }}</span>
      </div>
    </nav>
  </aside>
</template>
```

## 类型定义

### BreadcrumbItem

```typescript
interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
  disabled?: boolean
  meta?: Record<string, any>
}
```

### DeviceInfo

```typescript
interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  userAgent: string
  pixelRatio: number
}
```

### DeviceType

```typescript
type DeviceType = 'mobile' | 'tablet' | 'desktop'
```

### TabItem

```typescript
interface TabItem {
  id: string
  title: string
  path: string
  icon?: string
  closable?: boolean
  cached?: boolean
  meta?: Record<string, any>
}
```

### CacheStats

```typescript
interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  totalSize: number
  enabled: boolean
}
```

### MenuItem

```typescript
interface MenuItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: MenuItem[]
  meta?: Record<string, any>
}
```

### AnimationConfig

```typescript
interface AnimationConfig {
  enabled: boolean
  type: 'fade' | 'slide' | 'zoom' | 'custom'
  duration: number
  easing: string
  direction?: string
}
```

## 最佳实践

### 1. 响应式数据使用

```typescript
// ✅ 推荐：使用 .value 访问响应式数据
const route = useRoute()
const userId = computed(() => route.value.params.id)

// ❌ 不推荐：直接解构响应式对象
const { params } = useRoute() // 失去响应性
```

### 2. 权限检查缓存

```typescript
// ✅ 推荐：使用计算属性缓存权限检查结果
const { hasPermission } = usePermissions()
const canEdit = computed(() => hasPermission(['user:edit']))

// ❌ 不推荐：在模板中重复调用
// <button v-if="hasPermission(['user:edit'])">
```

### 3. 组合式函数组合使用

```typescript
// 创建自定义组合式函数
function useUserManagement() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const { addTab } = useTabs()

  const openUserDetail = (userId: string) => {
    if (hasPermission(['user:view'])) {
      const path = `/user/${userId}`
      router.push(path)
      addTab({
        id: `user-${userId}`,
        title: `用户 ${userId}`,
        path,
        closable: true
      })
    }
  }

  return {
    openUserDetail
  }
}
```

组合式函数提供了灵活而强大的方式来访问路由功能，通过合理使用这些函数，可以构建出功能丰富且易于维护的应用。
