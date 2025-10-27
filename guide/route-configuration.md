# 路由配置

学习如何配置路由以构建单页应用。

## 基础路由

最简单的路由配置包含路径和组件：

```typescript
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    component: About
  }
]
```

## 路由记录属性

### path（必需）

路由的路径，支持静态路径和动态参数：

```typescript
const routes = [
  { path: '/', component: Home },                    // 静态路径
  { path: '/user/:id', component: User },            // 动态参数
  { path: '/post/:id(\\d+)', component: Post },      // 带正则的参数
  { path: '/:pathMatch(.*)*', component: NotFound }  // 通配符
]
```

### name

为路由指定一个唯一的名称，方便编程式导航：

```typescript
const routes = [
  {
    path: '/user/:id',
    name: 'user',
    component: User
  }
]

// 使用名称导航
router.push({ name: 'user', params: { id: 123 } })
```

### component

要渲染的组件，可以是组件对象或异步组件：

```typescript
import Home from './views/Home.vue'

const routes = [
  // 同步组件
  {
    path: '/',
    component: Home
  },
  
  // 异步组件（推荐）
  {
    path: '/about',
    component: () => import('./views/About.vue')
  },
  
  // 带命名的异步组件
  {
    path: '/user',
    component: () => import(
      /* webpackChunkName: "user" */
      './views/User.vue'
    )
  }
]
```

### components

命名视图，可以同时渲染多个组件：

```typescript
const routes = [
  {
    path: '/user/:id',
    components: {
      default: UserProfile,
      sidebar: UserSidebar,
      footer: UserFooter
    }
  }
]
```

```vue
<template>
  <RouterView />              <!-- 渲染 UserProfile -->
  <RouterView name="sidebar" />   <!-- 渲染 UserSidebar -->
  <RouterView name="footer" />    <!-- 渲染 UserFooter -->
</template>
```

### redirect

重定向到另一个路由：

```typescript
const routes = [
  // 字符串形式
  { path: '/home', redirect: '/' },
  
  // 对象形式
  { path: '/home', redirect: { name: 'homepage' } },
  
  // 函数形式
  {
    path: '/user/:id',
    redirect: to => {
      // to 是目标路由
      return { name: 'profile', params: { id: to.params.id } }
    }
  }
]
```

### alias

为路由指定别名：

```typescript
const routes = [
  {
    path: '/home',
    component: Home,
    alias: ['/index', '/']
  }
]

// 以下三个路径都会渲染 Home 组件
// /home
// /index
// /
```

### children

嵌套路由配置：

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: '',                    // 默认子路由
        component: UserProfile
      },
      {
        path: 'posts',               // /user/posts
        component: UserPosts
      },
      {
        path: 'settings',            // /user/settings
        component: UserSettings
      }
    ]
  }
]
```

详见[嵌套路由](/guide/nested-routes)。

### meta

路由元信息，可以存储任意数据：

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台',
      icon: 'dashboard',
      order: 1
    }
  }
]

// 在组件中访问
import { useRoute } from '@ldesign/router'

const route = useRoute()
console.log(route.meta.title)  // '管理后台'
```

### beforeEnter

路由级别的守卫：

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (hasAdminPermission()) {
        next()
      } else {
        next('/403')
      }
    }
  }
]
```

支持数组形式：

```typescript
const checkAuth = (to, from, next) => {
  if (isAuthenticated()) {
    next()
  } else {
    next('/login')
  }
}

const checkRole = (to, from, next) => {
  if (hasRequiredRole(to.meta.role)) {
    next()
  } else {
    next('/403')
  }
}

const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: { role: 'admin' },
    beforeEnter: [checkAuth, checkRole]
  }
]
```

## 路由模式

### History 模式（推荐）

使用 HTML5 History API，URL 更加美观：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// URL: https://example.com/about
```

#### 带基础路径

```typescript
const router = createRouter({
  history: createWebHistory('/my-app/'),
  routes
})

// URL: https://example.com/my-app/about
```

### Hash 模式

使用 URL hash，无需服务器配置：

```typescript
import { createRouter, createWebHashHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// URL: https://example.com/#/about
```

### Memory 模式

不修改 URL，适用于非浏览器环境：

```typescript
import { createRouter, createMemoryHistory } from '@ldesign/router'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})
```

## 路由器选项

### scrollBehavior

自定义滚动行为：

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回期望的滚动位置
    if (savedPosition) {
      // 浏览器后退/前进时，恢复之前的滚动位置
      return savedPosition
    } else if (to.hash) {
      // 滚动到锚点
      return { el: to.hash, behavior: 'smooth' }
    } else {
      // 滚动到顶部
      return { top: 0 }
    }
  }
})
```

详见[滚动行为](/guide/scroll-behavior)。

### linkActiveClass

自定义活跃链接的 CSS 类名：

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active'  // 默认 'router-link-active'
})
```

### linkExactActiveClass

自定义精确活跃链接的 CSS 类名：

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkExactActiveClass: 'exact-active'  // 默认 'router-link-exact-active'
})
```

### parseQuery / stringifyQuery

自定义查询参数的解析和字符串化：

```typescript
import qs from 'qs'

const router = createRouter({
  history: createWebHistory(),
  routes,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify
})
```

## 动态路由

### 添加路由

```typescript
// 添加单个路由
router.addRoute({
  path: '/new',
  name: 'new',
  component: NewComponent
})

// 添加嵌套路由
router.addRoute('parent', {
  path: 'child',
  component: ChildComponent
})
```

### 删除路由

```typescript
// 通过名称删除
router.removeRoute('routeName')

// 通过添加同名路由替换
router.addRoute({ path: '/about', name: 'about', component: About })
router.addRoute({ path: '/other', name: 'about', component: Other })  // 替换上面的路由
```

### 检查路由

```typescript
// 检查路由是否存在
router.hasRoute('routeName')  // true/false

// 获取所有路由
const routes = router.getRoutes()
```

## 完整示例

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import type { RouteRecordRaw } from '@ldesign/router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue'),
    meta: { title: '关于我们' }
  },
  {
    path: '/user',
    component: () => import('./layouts/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'userProfile',
        component: () => import('./views/user/Profile.vue'),
        meta: { requiresAuth: true, title: '个人资料' }
      },
      {
        path: 'posts',
        name: 'userPosts',
        component: () => import('./views/user/Posts.vue'),
        meta: { requiresAuth: true, title: '我的文章' }
      }
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./views/Admin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台'
    },
    beforeEnter: (to, from, next) => {
      if (hasAdminRole()) {
        next()
      } else {
        next('/403')
      }
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('./views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || 'App'
  
  // 检查认证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

## 最佳实践

### 1. 使用路由懒加载

```typescript
// ✅ 推荐：按需加载
{
  path: '/about',
  component: () => import('./views/About.vue')
}

// ❌ 不推荐：直接导入
import About from './views/About.vue'
{
  path: '/about',
  component: About
}
```

### 2. 使用命名路由

```typescript
// ✅ 推荐：使用名称
router.push({ name: 'user', params: { id: 123 } })

// ❌ 不推荐：使用路径
router.push(`/user/${123}`)
```

### 3. 合理使用路由元信息

```typescript
// ✅ 推荐：使用 meta 存储路由相关信息
{
  path: '/admin',
  meta: {
    requiresAuth: true,
    roles: ['admin'],
    title: '管理后台'
  }
}

// ❌ 不推荐：使用自定义属性
{
  path: '/admin',
  requiresAuth: true,  // 非标准属性
  roles: ['admin']     // 可能导致类型错误
}
```

### 4. 组织路由文件

对于大型应用，建议将路由配置拆分到多个文件：

```typescript
// router/index.ts
import { createRouter } from '@ldesign/router'
import homeRoutes from './modules/home'
import userRoutes from './modules/user'
import adminRoutes from './modules/admin'

const routes = [
  ...homeRoutes,
  ...userRoutes,
  ...adminRoutes
]

export default createRouter({ routes })

// router/modules/user.ts
export default [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [...]
  }
]
```

## 下一步

- [导航](/guide/navigation) - 学习如何在路由之间导航
- [路由参数](/guide/route-params) - 了解如何使用动态参数
- [嵌套路由](/guide/nested-routes) - 构建多层级路由
- [路由守卫](/guide/guards) - 控制路由访问

