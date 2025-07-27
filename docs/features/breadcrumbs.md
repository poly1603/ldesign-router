# 面包屑导航

面包屑导航是一种辅助导航模式，显示用户在网站中的当前位置。`@ldesign/router` 提供了自动生成和管理面包屑导航的功能。

## 基础配置

### 启用面包屑导航

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  breadcrumb: {
    enabled: true,
    separator: '/',
    showHome: true,
    homeText: '首页',
    homePath: '/',
    maxItems: 10
  }
})
```

### 配置选项

```typescript
interface BreadcrumbConfig {
  enabled?: boolean // 是否启用面包屑
  separator?: string // 分隔符，默认 '/'
  showHome?: boolean // 是否显示首页，默认 true
  homeText?: string // 首页文本，默认 '首页'
  homePath?: string // 首页路径，默认 '/'
  maxItems?: number // 最大显示项数，默认 10
}
```

## 路由配置

### 基础路由配置

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      breadcrumb: true // 显示在面包屑中
    }
  },
  {
    path: '/user',
    name: 'User',
    component: UserLayout,
    meta: {
      title: '用户管理',
      breadcrumb: true
    },
    children: [
      {
        path: '',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户列表',
          breadcrumb: true
        }
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: UserDetail,
        meta: {
          title: '用户详情',
          breadcrumb: true,
          breadcrumbTitle: route => `用户 ${route.params.id}` // 动态标题
        }
      }
    ]
  }
]
```

### 自定义面包屑

```typescript
const routes = [
  {
    path: '/product/:category/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: {
      title: '商品详情',
      breadcrumb: true,
      // 自定义面包屑路径
      breadcrumbPath: [
        { title: '首页', path: '/' },
        { title: '商品分类', path: '/product' },
        { title: route => route.params.category, path: route => `/product/${route.params.category}` },
        { title: route => `商品 ${route.params.id}` }
      ]
    }
  }
]
```

## 组件使用

### 基础面包屑组件

```vue
<script setup lang="ts">
import { useBreadcrumb } from '@ldesign/router'

const { breadcrumbs, separator } = useBreadcrumb()
</script>

<template>
  <nav class="breadcrumb" aria-label="面包屑导航">
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
        :class="{ 'is-active': index === breadcrumbs.length - 1 }"
      >
        <router-link
          v-if="item.path && index < breadcrumbs.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon" />
          {{ item.title }}
        </router-link>
        <span v-else class="breadcrumb-text">
          <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon" />
          {{ item.title }}
        </span>

        <span
          v-if="index < breadcrumbs.length - 1"
          class="breadcrumb-separator"
          aria-hidden="true"
        >
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  padding: 0.5rem 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-link:hover {
  color: #40a9ff;
}

.breadcrumb-text {
  color: #666;
}

.breadcrumb-item.is-active .breadcrumb-text {
  color: #333;
  font-weight: 500;
}

.breadcrumb-icon {
  margin-right: 0.25rem;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #ccc;
}
</style>
```

### 高级面包屑组件

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useBreadcrumb, useRouter } from '@ldesign/router'

const router = useRouter()
const { breadcrumbs, separator } = useBreadcrumb()

// 是否需要折叠
const shouldCollapse = computed(() => breadcrumbs.value.length > 4)

// 折叠的中间项
const collapsedItems = computed(() => {
  if (!shouldCollapse.value)
return []
  return breadcrumbs.value.slice(1, -1)
})

function handleDropdownCommand(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="advanced-breadcrumb">
    <!-- 折叠的面包屑 -->
    <div v-if="shouldCollapse" class="breadcrumb-collapsed">
      <router-link :to="breadcrumbs[0].path" class="breadcrumb-link">
        {{ breadcrumbs[0].title }}
      </router-link>

      <span class="breadcrumb-separator">{{ separator }}</span>

      <el-dropdown @command="handleDropdownCommand">
        <span class="breadcrumb-dropdown">
          <i class="el-icon-more" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in collapsedItems"
              :key="index"
              :command="item.path"
            >
              {{ item.title }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <span class="breadcrumb-separator">{{ separator }}</span>

      <span class="breadcrumb-text">
        {{ breadcrumbs[breadcrumbs.length - 1].title }}
      </span>
    </div>

    <!-- 完整的面包屑 -->
    <ol v-else class="breadcrumb-list">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
      >
        <router-link
          v-if="item.path && index < breadcrumbs.length - 1"
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.title }}
        </router-link>
        <span v-else class="breadcrumb-text">
          {{ item.title }}
        </span>

        <span
          v-if="index < breadcrumbs.length - 1"
          class="breadcrumb-separator"
        >
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>
```

## 组合式函数

### useBreadcrumb

```typescript
import { useBreadcrumb } from '@ldesign/router'

const {
  breadcrumbs, // 面包屑项列表
  separator, // 分隔符
  addBreadcrumb, // 添加面包屑项
  removeBreadcrumb, // 移除面包屑项
  clearBreadcrumbs, // 清空面包屑
  getBreadcrumbText // 获取面包屑文本
} = useBreadcrumb()
```

### 手动管理面包屑

```vue
<script setup lang="ts">
import { useBreadcrumb } from '@ldesign/router'

const { breadcrumbs, addBreadcrumb, removeBreadcrumb } = useBreadcrumb()

// 添加自定义面包屑项
function addCustomBreadcrumb() {
  addBreadcrumb({
    title: '自定义页面',
    path: '/custom',
    icon: 'custom-icon'
  })
}

// 移除最后一个面包屑项
function removeLastBreadcrumb() {
  if (breadcrumbs.value.length > 0) {
    removeBreadcrumb(breadcrumbs.value.length - 1)
  }
}
</script>
```

## 高级功能

### 动态面包屑标题

```typescript
// 在路由配置中使用函数
const routes = [
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: {
      title: '订单详情',
      breadcrumb: true,
      breadcrumbTitle: async (route) => {
        // 异步获取订单信息
        const order = await getOrderById(route.params.id)
        return `订单 ${order.orderNumber}`
      }
    }
  }
]
```

### 面包屑权限控制

```typescript
// 根据权限过滤面包屑项
function filterBreadcrumbsByPermission(breadcrumbs: BreadcrumbItem[]) {
  return breadcrumbs.filter((item) => {
    if (!item.meta?.permissions)
return true
    return hasPermission(item.meta.permissions)
  })
}
```

### 面包屑缓存

```typescript
// 缓存面包屑数据
const breadcrumbCache = new Map()

function getCachedBreadcrumb(routePath: string) {
  if (breadcrumbCache.has(routePath)) {
    return breadcrumbCache.get(routePath)
  }

  const breadcrumb = generateBreadcrumb(routePath)
  breadcrumbCache.set(routePath, breadcrumb)
  return breadcrumb
}
```

## 样式定制

### CSS 变量

```css
:root {
  --breadcrumb-font-size: 14px;
  --breadcrumb-color: #666;
  --breadcrumb-link-color: #1890ff;
  --breadcrumb-link-hover-color: #40a9ff;
  --breadcrumb-separator-color: #ccc;
  --breadcrumb-active-color: #333;
  --breadcrumb-spacing: 0.5rem;
}

.breadcrumb {
  font-size: var(--breadcrumb-font-size);
  color: var(--breadcrumb-color);
}

.breadcrumb-link {
  color: var(--breadcrumb-link-color);
}

.breadcrumb-link:hover {
  color: var(--breadcrumb-link-hover-color);
}

.breadcrumb-separator {
  color: var(--breadcrumb-separator-color);
  margin: 0 var(--breadcrumb-spacing);
}
```

### 主题适配

```css
/* 深色主题 */
[data-theme="dark"] {
  --breadcrumb-color: #ccc;
  --breadcrumb-link-color: #177ddc;
  --breadcrumb-link-hover-color: #40a9ff;
  --breadcrumb-separator-color: #666;
  --breadcrumb-active-color: #fff;
}
```

## 无障碍访问

### ARIA 支持

```vue
<template>
  <nav
    class="breadcrumb"
    role="navigation"
    aria-label="面包屑导航"
  >
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
      >
        <router-link
          v-if="item.path && index < breadcrumbs.length - 1"
          :to="item.path"
          class="breadcrumb-link"
          :aria-label="`导航到 ${item.title}`"
        >
          {{ item.title }}
        </router-link>
        <span
          v-else
          class="breadcrumb-text"
          aria-current="page"
        >
          {{ item.title }}
        </span>

        <span
          v-if="index < breadcrumbs.length - 1"
          class="breadcrumb-separator"
          aria-hidden="true"
        >
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>
```

## 最佳实践

### 1. 合理的层级深度

```typescript
// ✅ 推荐：合理的层级
首页 / 用户管理 / 用户列表 / 用户详情

// ❌ 不推荐：层级过深
首页 / 系统 / 用户 / 管理 / 列表 / 详情 / 编辑
```

### 2. 清晰的标题

```typescript
// ✅ 推荐：清晰的标题
{
  title: '用户详情',
  breadcrumbTitle: (route) => `用户 ${route.params.name}`
}

// ❌ 不推荐：模糊的标题
{
  title: '详情',
  breadcrumbTitle: 'Detail'
}
```

### 3. 性能优化

```typescript
// 使用计算属性缓存面包屑
const breadcrumbs = computed(() => {
  return generateBreadcrumbs(route.value)
})

// 避免在每次路由变化时重新计算
const memoizedBreadcrumbs = useMemo(() => {
  return generateBreadcrumbs(route.value)
}, [route.value.path])
```

面包屑导航是提升用户体验的重要组件，通过合理的配置和使用，可以帮助用户更好地理解当前位置和导航路径。
