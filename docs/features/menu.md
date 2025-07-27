# 菜单管理

菜单管理提供了自动生成和管理应用菜单的功能。`@ldesign/router` 可以根据路由配置自动生成菜单，并提供丰富的定制选项。

## 基础配置

### 启用菜单管理

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  menu: {
    enabled: true,
    mode: 'sidebar',
    collapsible: true,
    defaultCollapsed: false,
    width: 240,
    accordion: false
  }
})
```

### 配置选项

```typescript
interface MenuConfig {
  enabled?: boolean // 是否启用菜单，默认 false
  mode?: MenuMode // 菜单模式，默认 'sidebar'
  collapsible?: boolean // 是否可折叠，默认 true
  defaultCollapsed?: boolean // 默认是否折叠，默认 false
  width?: number // 菜单宽度（像素），默认 240
  accordion?: boolean // 是否手风琴模式，默认 false
}

type MenuMode = 'sidebar' | 'horizontal' | 'dropdown'
```

## 路由配置

### 菜单路由配置

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      icon: 'home',
      menu: true, // 显示在菜单中
      order: 1 // 菜单排序
    }
  },
  {
    path: '/user',
    name: 'User',
    component: UserLayout,
    meta: {
      title: '用户管理',
      icon: 'user',
      menu: true,
      order: 2
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户列表',
          icon: 'list',
          menu: true,
          order: 1
        }
      },
      {
        path: 'roles',
        name: 'UserRoles',
        component: UserRoles,
        meta: {
          title: '角色管理',
          icon: 'role',
          menu: true,
          order: 2,
          permissions: ['user:role:view'] // 权限控制
        }
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '系统设置',
      icon: 'settings',
      menu: true,
      order: 99,
      roles: ['admin'] // 角色控制
    }
  }
]
```

### 菜单分组

```typescript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '仪表盘',
      icon: 'dashboard',
      menu: true,
      group: 'overview' // 菜单分组
    }
  },
  {
    path: '/user',
    name: 'User',
    component: UserLayout,
    meta: {
      title: '用户管理',
      icon: 'user',
      menu: true,
      group: 'management'
    }
  },
  {
    path: '/system',
    name: 'System',
    component: SystemLayout,
    meta: {
      title: '系统管理',
      icon: 'system',
      menu: true,
      group: 'management'
    }
  }
]

// 菜单分组配置
const menuGroups = {
  overview: {
    title: '概览',
    icon: 'overview',
    order: 1
  },
  management: {
    title: '管理',
    icon: 'management',
    order: 2
  }
}
```

## 组件使用

### 侧边栏菜单

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useMenu } from '@ldesign/router'

const {
  menuItems,
  collapsed,
  toggleCollapse,
  menuGroups
} = useMenu()

const menuWidth = computed(() => {
  return collapsed.value ? '64px' : '240px'
})
</script>

<template>
  <aside
    class="sidebar-menu" :class="[{ 'is-collapsed': collapsed }]"
    :style="{ width: menuWidth }"
  >
    <!-- 菜单头部 -->
    <div class="menu-header">
      <div class="logo">
        <img src="/logo.svg" alt="Logo">
        <span v-if="!collapsed" class="logo-text">LDesign</span>
      </div>
      <button class="collapse-btn" @click="toggleCollapse">
        <i :class="collapsed ? 'icon-expand' : 'icon-collapse'" />
      </button>
    </div>

    <!-- 菜单内容 -->
    <nav class="menu-nav">
      <menu-group
        v-for="group in menuGroups"
        :key="group.key"
        :group="group"
        :collapsed="collapsed"
      />
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-menu {
  height: 100vh;
  background: #001529;
  color: #fff;
  transition: width 0.3s;
  overflow: hidden;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #1f1f1f;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: bold;
}

.collapse-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
}

.menu-nav {
  padding: 16px 0;
}

.is-collapsed .logo-text {
  display: none;
}
</style>
```

### 菜单项组件

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '@ldesign/router'

const props = defineProps<{
  item: MenuItem
  level?: number
  collapsed?: boolean
}>()

const route = useRoute()
const submenuOpen = ref(false)

const isActive = computed(() => {
  return route.value.path === props.item.path
    || route.value.path.startsWith(`${props.item.path}/`)
})

function toggleSubmenu() {
  submenuOpen.value = !submenuOpen.value
}

function handleClick() {
  // 菜单项点击事件
  console.log('菜单项点击:', props.item.title)
}
</script>

<template>
  <div class="menu-item-wrapper">
    <!-- 有子菜单的项 -->
    <div
      v-if="item.children && item.children.length > 0"
      class="menu-item has-children" :class="[{ 'is-active': isActive }]"
      @click="toggleSubmenu"
    >
      <div class="menu-item-content">
        <i v-if="item.icon" :class="item.icon" class="menu-icon" />
        <span v-if="!collapsed" class="menu-title">{{ item.title }}</span>
        <i
          v-if="!collapsed"
          :class="[{ 'is-open': submenuOpen }]"
          class="icon-arrow-down submenu-arrow"
        />
      </div>
    </div>

    <!-- 普通菜单项 -->
    <router-link
      v-else
      :to="item.path"
      class="menu-item" :class="[{ 'is-active': isActive }]"
      @click="handleClick"
    >
      <div class="menu-item-content">
        <i v-if="item.icon" :class="item.icon" class="menu-icon" />
        <span v-if="!collapsed" class="menu-title">{{ item.title }}</span>
        <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
      </div>
    </router-link>

    <!-- 子菜单 -->
    <transition name="submenu">
      <div
        v-if="item.children && submenuOpen && !collapsed"
        class="submenu"
      >
        <menu-item
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :level="level + 1"
          :collapsed="collapsed"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.menu-item {
  display: block;
  padding: 0;
  margin: 4px 8px;
  border-radius: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.3s;
  cursor: pointer;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-item.is-active {
  background: #1890ff;
  color: #fff;
}

.menu-item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.menu-icon {
  width: 16px;
  text-align: center;
  margin-right: 12px;
}

.menu-title {
  flex: 1;
}

.menu-badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}

.submenu-arrow {
  transition: transform 0.3s;
}

.submenu-arrow.is-open {
  transform: rotate(180deg);
}

.submenu {
  padding-left: 16px;
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### 水平菜单

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMenu, useRoute } from '@ldesign/router'

const { menuItems } = useMenu()
const route = useRoute()
const activeSubmenu = ref(null)

const topLevelItems = computed(() => {
  return menuItems.value.filter(item => !item.parent)
})

function isActiveItem(item: MenuItem) {
  return route.value.path === item.path
    || route.value.path.startsWith(`${item.path}/`)
}

function showSubmenu(item: MenuItem) {
  if (item.children) {
    activeSubmenu.value = item.id
  }
}

function hideSubmenu() {
  activeSubmenu.value = null
}
</script>

<template>
  <nav class="horizontal-menu">
    <div class="menu-container">
      <div
        v-for="item in topLevelItems"
        :key="item.id"
        class="menu-item-wrapper"
        @mouseenter="showSubmenu(item)"
        @mouseleave="hideSubmenu"
      >
        <router-link
          :to="item.path"
          class="menu-item" :class="[{ 'is-active': isActiveItem(item) }]"
        >
          <i v-if="item.icon" :class="item.icon" />
          <span>{{ item.title }}</span>
          <i v-if="item.children" class="icon-arrow-down" />
        </router-link>

        <!-- 下拉子菜单 -->
        <div
          v-if="item.children && activeSubmenu === item.id"
          class="submenu-dropdown"
        >
          <router-link
            v-for="child in item.children"
            :key="child.id"
            :to="child.path"
            class="submenu-item"
          >
            <i v-if="child.icon" :class="child.icon" />
            <span>{{ child.title }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.horizontal-menu {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
}

.menu-container {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.menu-item-wrapper {
  position: relative;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.menu-item:hover,
.menu-item.is-active {
  color: #1890ff;
}

.submenu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background 0.3s;
}

.submenu-item:hover {
  background: #f5f5f5;
}
</style>
```

## 组合式函数

### useMenu

```typescript
import { useMenu } from '@ldesign/router'

const {
  menuItems, // 菜单项列表
  collapsed, // 是否折叠
  toggleCollapse, // 切换折叠状态
  setCollapsed, // 设置折叠状态
  addMenuItem, // 添加菜单项
  removeMenuItem, // 移除菜单项
  getActiveMenuItem, // 获取当前活跃菜单项
  menuGroups // 菜单分组
} = useMenu()
```

### 菜单权限过滤

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useMenu, usePermission } from '@ldesign/router'

const { menuItems } = useMenu()
const { hasPermission, hasRole } = usePermission()

// 根据权限过滤菜单
const filteredMenuItems = computed(() => {
  return filterMenuByPermission(menuItems.value)
})

function filterMenuByPermission(items: MenuItem[]): MenuItem[] {
  return items.filter((item) => {
    // 检查角色权限
    if (item.meta?.roles && !hasRole(item.meta.roles)) {
      return false
    }

    // 检查具体权限
    if (item.meta?.permissions && !hasPermission(item.meta.permissions)) {
      return false
    }

    // 递归过滤子菜单
    if (item.children) {
      item.children = filterMenuByPermission(item.children)
    }

    return true
  })
}
</script>
```

## 高级功能

### 动态菜单

```typescript
// 动态添加菜单项
function addDynamicMenuItem(parentId: string, menuItem: MenuItem) {
  const { addMenuItem } = useMenu()

  addMenuItem({
    id: `dynamic-${Date.now()}`,
    title: menuItem.title,
    path: menuItem.path,
    icon: menuItem.icon,
    parent: parentId,
    dynamic: true // 标记为动态菜单
  })
}

// 根据用户角色动态生成菜单
function generateRoleBasedMenu(userRole: string) {
  const roleMenus = {
    admin: [
      { title: '用户管理', path: '/admin/users', icon: 'user' },
      { title: '系统设置', path: '/admin/settings', icon: 'settings' }
    ],
    user: [
      { title: '个人中心', path: '/profile', icon: 'profile' },
      { title: '我的订单', path: '/orders', icon: 'order' }
    ]
  }

  return roleMenus[userRole] || []
}
```

### 菜单搜索

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMenu, useRouter } from '@ldesign/router'

const { menuItems } = useMenu()
const router = useRouter()
const searchQuery = ref('')

const searchResults = computed(() => {
  if (!searchQuery.value)
return []

  const query = searchQuery.value.toLowerCase()
  return flattenMenuItems(menuItems.value)
    .filter(item =>
      item.title.toLowerCase().includes(query)
      || item.path.toLowerCase().includes(query)
    )
    .slice(0, 10) // 限制结果数量
})

function flattenMenuItems(items: MenuItem[]): MenuItem[] {
  const result = []

  for (const item of items) {
    result.push(item)
    if (item.children) {
      result.push(...flattenMenuItems(item.children))
    }
  }

  return result
}

function navigateToItem(item: MenuItem) {
  router.push(item.path)
  searchQuery.value = ''
}
</script>

<template>
  <div class="menu-search">
    <input
      v-model="searchQuery"
      placeholder="搜索菜单..."
      class="search-input"
    >

    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="item in searchResults"
        :key="item.id"
        class="search-item"
        @click="navigateToItem(item)"
      >
        <i v-if="item.icon" :class="item.icon" />
        <span>{{ item.title }}</span>
        <span class="search-path">{{ item.path }}</span>
      </div>
    </div>
  </div>
</template>
```

### 菜单收藏

```typescript
// 菜单收藏功能
function useFavoriteMenu() {
  const favorites = ref<string[]>([])

  const addToFavorites = (menuId: string) => {
    if (!favorites.value.includes(menuId)) {
      favorites.value.push(menuId)
      saveFavorites()
    }
  }

  const removeFromFavorites = (menuId: string) => {
    const index = favorites.value.indexOf(menuId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  const isFavorite = (menuId: string) => {
    return favorites.value.includes(menuId)
  }

  const saveFavorites = () => {
    localStorage.setItem('menu-favorites', JSON.stringify(favorites.value))
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem('menu-favorites')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  }

  // 初始化时加载收藏
  onMounted(loadFavorites)

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  }
}
```

## 最佳实践

### 1. 菜单层级控制

```typescript
// 限制菜单层级深度
const MAX_MENU_DEPTH = 3

function validateMenuDepth(items: MenuItem[], depth = 1): MenuItem[] {
  return items.map((item) => {
    if (depth >= MAX_MENU_DEPTH) {
      // 超过最大深度时，将子菜单提升为同级
      return { ...item, children: undefined }
    }

    if (item.children) {
      item.children = validateMenuDepth(item.children, depth + 1)
    }

    return item
  })
}
```

### 2. 菜单性能优化

```typescript
// 虚拟滚动大量菜单项
function useVirtualMenu(items: MenuItem[]) {
  const visibleItems = ref([])
  const scrollTop = ref(0)
  const itemHeight = 40
  const containerHeight = 400

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight))
  const endIndex = computed(() => Math.min(startIndex.value + visibleCount, items.length))

  watch([startIndex, endIndex], () => {
    visibleItems.value = items.slice(startIndex.value, endIndex.value)
  })

  return {
    visibleItems,
    scrollTop,
    itemHeight,
    totalHeight: items.length * itemHeight
  }
}
```

### 3. 菜单状态持久化

```typescript
// 保存菜单状态
function saveMenuState() {
  const { collapsed, activeMenuItem } = useMenu()

  const state = {
    collapsed: collapsed.value,
    activeMenuItem: activeMenuItem.value?.id,
    timestamp: Date.now()
  }

  localStorage.setItem('menu-state', JSON.stringify(state))
}

// 恢复菜单状态
function restoreMenuState() {
  const saved = localStorage.getItem('menu-state')
  if (saved) {
    const state = JSON.parse(saved)

    // 检查状态是否过期（24小时）
    if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
      setCollapsed(state.collapsed)
      if (state.activeMenuItem) {
        setActiveMenuItem(state.activeMenuItem)
      }
    }
  }
}
```

菜单管理是应用导航的核心组件，通过合理的配置和使用，可以为用户提供清晰、高效的导航体验。
