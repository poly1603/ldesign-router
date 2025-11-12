# Vue 路由组件使用指南

> 📚 @ldesign/router-vue 提供的路由组件使用说明

---

## 📦 可用组件

### 1️⃣ RouterTabs - 多标签页管理

多标签页管理组件，支持标签的添加、删除、刷新、持久化等功能。

#### 基础用法

```vue
<template>
  <div>
    <!-- 基础使用 -->
    <RouterTabs />
    
    <!-- 主内容区域 -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterTabs, RouterView } from '@ldesign/router-vue'
</script>
```

#### 高级配置

```vue
<template>
  <RouterTabs
    :persistent="true"
    :max-tabs="15"
    :show-actions="true"
    :closable="true"
    :affix-tabs="['/dashboard', '/home']"
    @tab-click="handleTabClick"
    @tab-add="handleTabAdd"
    @tab-remove="handleTabRemove"
    @tab-refresh="handleTabRefresh"
  >
    <!-- 自定义标签内容 -->
    <template #tab="{ tab, isActive }">
      <span :class="{ 'active-tab': isActive }">
        {{ tab.title }}
      </span>
    </template>

    <!-- 自定义操作按钮 -->
    <template #actions="{ tabs, activeTab }">
      <button @click="refreshAll">全部刷新</button>
      <button @click="closeAll">关闭全部</button>
    </template>

    <!-- 自定义右键菜单 -->
    <template #contextMenu="{ tab, close }">
      <div @click="close">
        <div @click="customAction(tab)">自定义操作</div>
        <div @click="closeTab(tab)">关闭</div>
      </div>
    </template>
  </RouterTabs>
</template>

<script setup lang="ts">
import { RouterTabs, type RouterTab } from '@ldesign/router-vue'

const handleTabClick = (tab: RouterTab) => {
  console.log('标签被点击:', tab)
}

const handleTabAdd = (tab: RouterTab) => {
  console.log('标签已添加:', tab)
}

const handleTabRemove = (tab: RouterTab) => {
  console.log('标签已移除:', tab)
}

const handleTabRefresh = (tab: RouterTab) => {
  console.log('标签已刷新:', tab)
}
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `persistent` | `boolean` | `true` | 是否持久化标签到 localStorage |
| `storageKey` | `string` | `'router-tabs'` | localStorage 存储的键名 |
| `maxTabs` | `number` | `10` | 最大标签数量 |
| `showActions` | `boolean` | `true` | 是否显示操作按钮 |
| `closable` | `boolean` | `true` | 是否允许关闭标签 |
| `affixTabs` | `string[]` | `[]` | 固定的标签路径列表（不可关闭） |
| `rootClass` | `string \| string[] \| Record<string, boolean>` | `''` | 根元素类名 |
| `getTitle` | `(route) => string` | 自动从 meta.title 获取 | 获取标签标题的函数 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `tab-click` | `(tab: RouterTab)` | 标签被点击 |
| `tab-add` | `(tab: RouterTab)` | 标签被添加 |
| `tab-remove` | `(tab: RouterTab)` | 标签被移除 |
| `tab-refresh` | `(tab: RouterTab)` | 标签被刷新 |
| `max-tabs-reached` | `(maxTabs: number)` | 标签数量达到上限 |

#### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `tab` | `{ tab, isActive }` | 自定义标签内容 |
| `actions` | `{ tabs, activeTab }` | 自定义操作按钮 |
| `contextMenu` | `{ tab, close }` | 自定义右键菜单 |

#### 暴露的方法

```typescript
const tabsRef = ref<InstanceType<typeof RouterTabs>>()

// 添加标签
tabsRef.value?.addTab({ path: '/user/123', title: '用户详情' })

// 移除标签
tabsRef.value?.removeTab(tab)

// 关闭标签
tabsRef.value?.closeTab(tab)

// 刷新标签
tabsRef.value?.refreshTab(tab)

// 关闭其他标签
tabsRef.value?.closeOtherTabs(tab)

// 关闭左侧标签
tabsRef.value?.closeLeftTabs(tab)

// 关闭右侧标签
tabsRef.value?.closeRightTabs(tab)

// 关闭所有标签
tabsRef.value?.closeAllTabs()
```

#### 右键菜单功能

RouterTabs 内置了完整的右键菜单功能：

- **刷新** - 重新加载当前标签页
- **关闭** - 关闭选中的标签（固定标签不可关闭）
- **关闭其他** - 关闭除选中标签外的所有标签
- **关闭左侧** - 关闭选中标签左侧的所有标签
- **关闭右侧** - 关闭选中标签右侧的所有标签
- **关闭所有** - 关闭所有非固定标签

---

### 2️⃣ RouterBreadcrumb - 面包屑导航

自动根据当前路由生成面包屑导航，支持自定义样式和行为。

#### 基础用法

```vue
<template>
  <div>
    <!-- 基础使用 -->
    <RouterBreadcrumb />
    
    <!-- 主内容区域 -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterBreadcrumb, RouterView } from '@ldesign/router-vue'
</script>
```

#### 高级配置

```vue
<template>
  <RouterBreadcrumb
    separator=">"
    :show-home="true"
    home-text="首页"
    home-path="/"
    :max-items="5"
    :hide-last="false"
    :replace="false"
    @item-click="handleItemClick"
    @ellipsis-click="handleEllipsisClick"
  >
    <!-- 自定义首页 -->
    <template #home="{ route }">
      <HomeIcon />
      <span>{{ route.title }}</span>
    </template>

    <!-- 自定义分隔符 -->
    <template #separator>
      <ArrowRightIcon />
    </template>

    <!-- 自定义面包屑项 -->
    <template #item="{ item, index, isLast }">
      <span :class="{ 'font-bold': isLast }">
        {{ item.title }}
      </span>
    </template>

    <!-- 自定义省略号 -->
    <template #ellipsis>
      <MoreIcon />
    </template>
  </RouterBreadcrumb>
</template>

<script setup lang="ts">
import { RouterBreadcrumb, type BreadcrumbItem } from '@ldesign/router-vue'

const handleItemClick = (item: BreadcrumbItem) => {
  console.log('面包屑项被点击:', item)
}

const handleEllipsisClick = () => {
  console.log('省略号被点击，展开/折叠中间项')
}
</script>
```

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `separator` | `string` | `'/'` | 分隔符 |
| `showHome` | `boolean` | `true` | 是否显示首页链接 |
| `homeText` | `string` | `'首页'` | 首页文本 |
| `homePath` | `string` | `'/'` | 首页路径 |
| `maxItems` | `number` | `0` | 最大显示项数（0 表示不限制） |
| `hideLast` | `boolean` | `false` | 是否隐藏最后一项 |
| `rootClass` | `string \| string[] \| Record<string, boolean>` | `''` | 根元素类名 |
| `getTitle` | `(route) => string` | 自动从 meta.title 获取 | 获取面包屑标题的函数 |
| `filter` | `(route) => boolean` | `() => true` | 过滤面包屑项的函数 |
| `replace` | `boolean` | `false` | 是否替换导航（不添加历史记录） |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `item-click` | `(item: BreadcrumbItem)` | 面包屑项被点击 |
| `ellipsis-click` | `()` | 省略号被点击（展开/折叠） |

#### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `home` | `{ route }` | 自定义首页链接 |
| `separator` | `-` | 自定义分隔符 |
| `item` | `{ item, index, isLast }` | 自定义面包屑项 |
| `ellipsis` | `-` | 自定义省略号 |

#### 自动面包屑生成

面包屑会自动从当前路由的 `matched` 数组生成：

```typescript
const routes = [
  {
    path: '/',
    name: 'home',
    meta: { title: '首页' }
  },
  {
    path: '/user',
    name: 'user',
    meta: { title: '用户管理' },
    children: [
      {
        path: ':id',
        name: 'user-detail',
        meta: { title: '用户详情' }
      }
    ]
  }
]

// 访问 /user/123 时，自动生成：
// 首页 / 用户管理 / 用户详情
```

#### 过滤面包屑项

使用 `filter` prop 来控制哪些路由应该显示在面包屑中：

```vue
<template>
  <RouterBreadcrumb
    :filter="(route) => route.meta?.showInBreadcrumb !== false"
  />
</template>
```

#### 自定义标题

使用 `getTitle` prop 自定义标题获取逻辑：

```vue
<template>
  <RouterBreadcrumb
    :get-title="(route) => {
      // 优先使用 breadcrumbTitle
      if (route.meta?.breadcrumbTitle) {
        return route.meta.breadcrumbTitle
      }
      // 其次使用 title
      if (route.meta?.title) {
        return route.meta.title
      }
      // 最后使用 name
      return route.name || route.path
    }"
  />
</template>
```

---

## 🎨 样式自定义

### RouterTabs 样式变量

```css
.router-tabs {
  /* 背景色 */
  --tabs-bg: #fff;
  
  /* 边框色 */
  --tabs-border: #dcdfe6;
  
  /* 标签背景色 */
  --tab-bg: #f4f4f5;
  --tab-bg-active: #fff;
  --tab-bg-hover: #ecf5ff;
  
  /* 标签文字色 */
  --tab-color: #606266;
  --tab-color-active: #409eff;
  
  /* 固定标签背景色 */
  --tab-affix-bg: #fdf6ec;
  --tab-affix-border: #f5dab1;
}
```

### RouterBreadcrumb 样式变量

```css
.router-breadcrumb {
  /* 文字颜色 */
  --breadcrumb-color: #606266;
  --breadcrumb-color-active: #303133;
  --breadcrumb-color-disabled: #c0c4cc;
  
  /* Hover 颜色 */
  --breadcrumb-hover-color: #409eff;
  
  /* 分隔符颜色 */
  --breadcrumb-separator-color: #c0c4cc;
  
  /* 字体大小 */
  --breadcrumb-font-size: 14px;
}
```

---

## 💡 最佳实践

### 1. 结合使用 RouterTabs 和 RouterBreadcrumb

```vue
<template>
  <div class="app-layout">
    <!-- 头部 -->
    <header class="app-header">
      <!-- 面包屑 -->
      <RouterBreadcrumb class="breadcrumb" />
      
      <!-- 其他头部内容 -->
      <div class="header-actions">
        <!-- ... -->
      </div>
    </header>

    <!-- 标签页 -->
    <RouterTabs class="tabs" />

    <!-- 主内容区 -->
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.breadcrumb {
  flex: 1;
}

.tabs {
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
```

### 2. 持久化配置

```typescript
// 使用不同的 storageKey 避免冲突
<RouterTabs storage-key="admin-tabs" />
<RouterTabs storage-key="user-tabs" />
```

### 3. 固定重要标签

```vue
<template>
  <RouterTabs :affix-tabs="affixTabs" />
</template>

<script setup lang="ts">
const affixTabs = [
  '/',           // 首页
  '/dashboard',  // 仪表盘
  '/workspace',  // 工作台
]
</script>
```

### 4. 自定义标题获取

```typescript
const getTabTitle = (route: RouteLocationNormalizedLoaded) => {
  // 动态路由参数
  if (route.params.id) {
    return `用户 #${route.params.id}`
  }
  
  // 查询参数
  if (route.query.name) {
    return `搜索: ${route.query.name}`
  }
  
  // 默认标题
  return route.meta?.title || route.name || route.path
}
```

### 5. 限制面包屑长度

```vue
<template>
  <!-- 最多显示 5 个项，中间项自动折叠 -->
  <RouterBreadcrumb :max-items="5" />
</template>
```

---

## 🔧 TypeScript 支持

完整的 TypeScript 类型定义：

```typescript
import type {
  RouterTab,
  RouterTabsProps,
  RouterTabsEmits,
  BreadcrumbItem,
  RouterBreadcrumbProps,
  RouterBreadcrumbEmits,
} from '@ldesign/router-vue'

// RouterTab 类型
const tab: RouterTab = {
  path: '/user/123',
  name: 'user-detail',
  title: '用户详情',
  affix: false,
  query: { tab: 'profile' },
  params: { id: '123' },
  meta: { icon: 'user' }
}

// BreadcrumbItem 类型
const breadcrumb: BreadcrumbItem = {
  path: '/user',
  name: 'user',
  title: '用户管理',
  disabled: false,
  query: {},
  params: {},
  meta: {}
}
```

---

## 📚 相关文档

- [Vue 路由增强计划](./ENHANCEMENT_PLAN.md)
- [API 文档](./API.md)
- [示例项目](../../examples/vue/)

---

**维护者**: @ldesign-team

**最后更新**: 2025-11-11
