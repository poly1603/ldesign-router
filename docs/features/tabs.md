# 标签页管理

标签页管理提供了多标签页导航功能，类似于浏览器的标签页体验。`@ldesign/router` 内置了完整的标签页管理系统。

## 基础配置

### 启用标签页管理

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  tabs: {
    enabled: true,
    max: 10,
    persistent: true,
    closable: true,
    draggable: false,
    contextMenu: true,
    cache: true
  }
})
```

### 配置选项

```typescript
interface TabsConfig {
  enabled?: boolean // 是否启用标签页
  max?: number // 最大标签页数量，默认 10
  persistent?: boolean // 是否持久化，默认 true
  closable?: boolean // 是否可关闭，默认 true
  draggable?: boolean // 是否可拖拽，默认 false
  contextMenu?: boolean // 是否显示右键菜单，默认 true
  cache?: boolean // 是否缓存标签页，默认 true
}
```

## 路由配置

### 标签页路由配置

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      tab: false, // 首页不显示为标签页
      icon: 'home'
    }
  },
  {
    path: '/user',
    name: 'UserList',
    component: UserList,
    meta: {
      title: '用户列表',
      tab: true, // 显示为标签页
      icon: 'user',
      closable: true, // 可关闭
      cache: true // 缓存页面
    }
  },
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: {
      title: '用户详情',
      tab: true,
      icon: 'user-detail',
      // 动态标题
      tabTitle: route => `用户 ${route.params.id}`,
      // 动态标签页键（用于区分不同参数的同一路由）
      tabKey: route => `user-detail-${route.params.id}`
    }
  }
]
```

## 组件使用

### 基础标签页组件

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTabs } from '@ldesign/router'

const {
  tabs,
  activeTabId,
  activateTab,
  closeTab,
  closeOtherTabs,
  closeAllTabs,
  closeTabsToLeft,
  closeTabsToRight
} = useTabs()

// 缓存的标签页
const cachedTabs = computed(() => {
  return tabs.value
    .filter(tab => tab.cached)
    .map(tab => tab.name)
})

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentContextTab = ref(null)

const contextMenuItems = computed(() => [
  { key: 'refresh', label: '刷新', icon: 'refresh' },
  { key: 'close', label: '关闭', icon: 'close', disabled: !currentContextTab.value?.closable },
  { key: 'closeOthers', label: '关闭其他', icon: 'close-others' },
  { key: 'closeAll', label: '关闭所有', icon: 'close-all' },
  { key: 'closeLeft', label: '关闭左侧', icon: 'close-left' },
  { key: 'closeRight', label: '关闭右侧', icon: 'close-right' }
])

function showContextMenu(event: MouseEvent, tab: any) {
  currentContextTab.value = tab
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

function hideContextMenu() {
  contextMenuVisible.value = false
  currentContextTab.value = null
}

function handleContextMenuSelect(key: string) {
  const tab = currentContextTab.value
  if (!tab)
return

  switch (key) {
    case 'refresh':
      refreshTab(tab.id)
      break
    case 'close':
      closeTab(tab.id)
      break
    case 'closeOthers':
      closeOtherTabs(tab.id)
      break
    case 'closeAll':
      closeAllTabs()
      break
    case 'closeLeft':
      closeTabsToLeft(tab.id)
      break
    case 'closeRight':
      closeTabsToRight(tab.id)
      break
  }

  hideContextMenu()
}

function refreshTab(tabId: string) {
  // 刷新标签页逻辑
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    // 清除缓存并重新加载
    router.cacheManager.removeFromCache(tab.name)
    router.replace(tab.path)
  }
}
</script>

<template>
  <div class="tabs-container">
    <!-- 标签页头部 -->
    <div class="tabs-header">
      <div class="tabs-nav">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item" :class="[{
            'is-active': tab.id === activeTabId,
            'is-closable': tab.closable,
          }]"
          @click="activateTab(tab.id)"
          @contextmenu.prevent="showContextMenu($event, tab)"
        >
          <i v-if="tab.icon" :class="tab.icon" class="tab-icon" />
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="tab-close"
            :aria-label="`关闭 ${tab.title}`"
            @click.stop="closeTab(tab.id)"
          >
            ×
          </button>
        </div>
      </div>

      <!-- 标签页操作 -->
      <div class="tabs-actions">
        <button class="tabs-menu-btn" @click="showTabsMenu">
          <i class="icon-menu" />
        </button>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tabs-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="cachedTabs">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </div>

    <!-- 右键菜单 -->
    <context-menu
      v-if="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @select="handleContextMenuSelect"
      @close="hideContextMenu"
    />
  </div>
</template>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-header {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.tabs-nav {
  display: flex;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-bottom: none;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: all 0.3s;
}

.tab-item:hover {
  background: #f0f0f0;
}

.tab-item.is-active {
  background: #fff;
  border-bottom: 2px solid #1890ff;
}

.tab-icon {
  margin-right: 4px;
}

.tab-title {
  margin-right: 8px;
}

.tab-close {
  display: none;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 2px;
  font-size: 14px;
  line-height: 1;
}

.tab-item.is-closable:hover .tab-close {
  display: block;
}

.tab-close:hover {
  background: #ff4d4f;
  color: #fff;
}

.tabs-actions {
  padding: 0 8px;
}

.tabs-menu-btn {
  padding: 4px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 2px;
}

.tabs-menu-btn:hover {
  background: #e6f7ff;
}

.tabs-content {
  flex: 1;
  overflow: hidden;
}
</style>
```

### 可拖拽标签页

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'
import { useTabs } from '@ldesign/router'

const { tabs, activeTabId, activateTab, closeTab, moveTab } = useTabs()

const tabsList = computed({
  get: () => tabs.value,
  set: (newTabs) => {
    // 更新标签页顺序
    newTabs.forEach((tab, index) => {
      const oldIndex = tabs.value.findIndex(t => t.id === tab.id)
      if (oldIndex !== index) {
        moveTab(oldIndex, index)
      }
    })
  }
})

function handleDragEnd(event: any) {
  const { oldIndex, newIndex } = event
  if (oldIndex !== newIndex) {
    moveTab(oldIndex, newIndex)
  }
}
</script>

<template>
  <div class="draggable-tabs">
    <draggable
      v-model="tabsList"
      item-key="id"
      class="tabs-nav"
      @end="handleDragEnd"
    >
      <template #item="{ element: tab }">
        <div
          class="tab-item" :class="[{ 'is-active': tab.id === activeTabId }]"
          @click="activateTab(tab.id)"
        >
          <i v-if="tab.icon" :class="tab.icon" />
          <span>{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="tab-close"
            @click.stop="closeTab(tab.id)"
          >
            ×
          </button>
        </div>
      </template>
    </draggable>
  </div>
</template>
```

## 组合式函数

### useTabs

```typescript
import { useTabs } from '@ldesign/router'

const {
  tabs, // 标签页列表
  activeTabId, // 当前活跃标签页ID
  addTab, // 添加标签页
  closeTab, // 关闭标签页
  closeOtherTabs, // 关闭其他标签页
  closeAllTabs, // 关闭所有标签页
  closeTabsToLeft, // 关闭左侧标签页
  closeTabsToRight, // 关闭右侧标签页
  activateTab, // 激活标签页
  moveTab, // 移动标签页
  refreshTab, // 刷新标签页
  pinTab, // 固定标签页
  unpinTab // 取消固定标签页
} = useTabs()
```

### 手动管理标签页

```vue
<script setup lang="ts">
import { useRouter, useTabs } from '@ldesign/router'

const router = useRouter()
const { addTab, closeTab, activateTab } = useTabs()

// 手动添加标签页
function openUserDetail(userId: string) {
  const route = router.resolve({
    name: 'UserDetail',
    params: { id: userId }
  })

  addTab({
    id: `user-detail-${userId}`,
    title: `用户 ${userId}`,
    path: route.path,
    name: route.name,
    icon: 'user',
    closable: true,
    cached: true,
    meta: route.meta
  })

  activateTab(`user-detail-${userId}`)
}

// 批量关闭标签页
function closeUserTabs() {
  tabs.value
    .filter(tab => tab.name?.startsWith('User'))
    .forEach(tab => closeTab(tab.id))
}
</script>
```

## 高级功能

### 标签页持久化

```typescript
// 自动保存标签页状态
function saveTabsState() {
  const tabsData = tabs.value.map(tab => ({
    id: tab.id,
    title: tab.title,
    path: tab.path,
    name: tab.name,
    icon: tab.icon,
    closable: tab.closable,
    pinned: tab.pinned
  }))

  localStorage.setItem('router-tabs', JSON.stringify({
    tabs: tabsData,
    activeTabId: activeTabId.value
  }))
}

// 恢复标签页状态
function restoreTabsState() {
  const saved = localStorage.getItem('router-tabs')
  if (saved) {
    const { tabs: savedTabs, activeTabId: savedActiveId } = JSON.parse(saved)

    savedTabs.forEach(tab => addTab(tab))
    if (savedActiveId) {
      activateTab(savedActiveId)
    }
  }
}
```

### 标签页分组

```typescript
// 按模块分组标签页
const groupedTabs = computed(() => {
  const groups = {}

  tabs.value.forEach((tab) => {
    const module = tab.meta?.module || 'default'
    if (!groups[module]) {
      groups[module] = []
    }
    groups[module].push(tab)
  })

  return groups
})
```

### 标签页搜索

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTabs } from '@ldesign/router'

const { tabs, activateTab } = useTabs()
const searchQuery = ref('')

const filteredTabs = computed(() => {
  if (!searchQuery.value)
return []

  return tabs.value.filter(tab =>
    tab.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="tabs-search">
    <input
      v-model="searchQuery"
      placeholder="搜索标签页..."
      class="search-input"
    >

    <div class="search-results">
      <div
        v-for="tab in filteredTabs"
        :key="tab.id"
        class="search-item"
        @click="activateTab(tab.id)"
      >
        <i v-if="tab.icon" :class="tab.icon" />
        <span>{{ tab.title }}</span>
      </div>
    </div>
  </div>
</template>
```

## 性能优化

### 虚拟滚动标签页

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useTabs } from '@ldesign/router'

const { tabs, activeTabId, activateTab } = useTabs()

const visibleTabsCount = computed(() => {
  return Math.floor(window.innerWidth / 120) // 每个标签页约120px
})
</script>

<template>
  <virtual-list
    :items="tabs"
    :item-height="40"
    :visible-count="visibleTabsCount"
    class="tabs-virtual-list"
  >
    <template #default="{ item: tab }">
      <div
        class="tab-item" :class="[{ 'is-active': tab.id === activeTabId }]"
        @click="activateTab(tab.id)"
      >
        <span>{{ tab.title }}</span>
      </div>
    </template>
  </virtual-list>
</template>
```

### 标签页懒加载

```typescript
// 延迟加载非活跃标签页的内容
function shouldLoadTab(tabId: string) {
  return tabId === activeTabId.value
    || recentlyActiveTabs.includes(tabId)
}
```

## 最佳实践

### 1. 合理的标签页数量

```typescript
// 限制标签页数量，避免性能问题
const MAX_TABS = 10

function addTab(tab: TabItem) {
  if (tabs.value.length >= MAX_TABS) {
    // 关闭最旧的非固定标签页
    const oldestTab = tabs.value.find(t => !t.pinned)
    if (oldestTab) {
      closeTab(oldestTab.id)
    }
  }

  // 添加新标签页
  tabs.value.push(tab)
}
```

### 2. 智能标签页标题

```typescript
// 根据内容动态更新标签页标题
function updateTabTitle(tabId: string, newTitle: string) {
  const tab = tabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.title = newTitle
    saveTabsState() // 持久化更新
  }
}
```

### 3. 标签页状态管理

```typescript
// 统一管理标签页状态
const tabStates = reactive({
  loading: new Set(),
  error: new Set(),
  modified: new Set()
})

function setTabLoading(tabId: string, loading: boolean) {
  if (loading) {
    tabStates.loading.add(tabId)
  }
 else {
    tabStates.loading.delete(tabId)
  }
}
```

标签页管理是现代 Web 应用的重要功能，通过合理的配置和使用，可以显著提升用户的操作效率和体验。
