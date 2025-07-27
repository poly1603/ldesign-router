# 最佳实践

本指南总结了使用 `@ldesign/router` 的最佳实践，帮助您构建高质量、可维护的路由应用。

## 路由设计原则

### 1. 清晰的路由结构

```typescript
// ✅ 推荐：清晰的层级结构
const routes = [
  {
    path: '/user',
    name: 'User',
    component: UserLayout,
    children: [
      {
        path: '',
        name: 'UserList',
        component: UserList
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: UserDetail
      },
      {
        path: ':id/edit',
        name: 'UserEdit',
        component: UserEdit
      }
    ]
  }
]

// ❌ 不推荐：扁平化结构
const routes = [
  { path: '/user-list', name: 'UserList', component: UserList },
  { path: '/user-detail/:id', name: 'UserDetail', component: UserDetail },
  { path: '/user-edit/:id', name: 'UserEdit', component: UserEdit }
]
```

### 2. 语义化的路由命名

```typescript
// ✅ 推荐：语义化命名
{
  path: '/product/:id',
  name: 'ProductDetail',  // 清晰表达功能
  component: ProductDetail
}

// ❌ 不推荐：模糊命名
{
  path: '/product/:id',
  name: 'Product',  // 不明确是列表还是详情
  component: ProductDetail
}
```

### 3. 合理的参数设计

```typescript
// ✅ 推荐：使用路径参数表示资源ID
{
  path: '/user/:id/orders/:orderId',
  name: 'UserOrderDetail'
}

// ✅ 推荐：使用查询参数表示过滤条件
{
  path: '/users',
  name: 'UserList'
  // 访问: /users?page=1&size=20&status=active
}

// ❌ 不推荐：将过滤条件放在路径中
{
  path: '/users/:page/:size/:status',
  name: 'UserList'
}
```

## 权限管理最佳实践

### 1. 细粒度权限设计

```typescript
// ✅ 推荐：细粒度权限
const permissions = [
  'user:view', // 查看用户
  'user:create', // 创建用户
  'user:edit', // 编辑用户
  'user:delete', // 删除用户
  'user:export' // 导出用户
]

// ❌ 不推荐：粗粒度权限
const permissions = [
  'user:manage' // 过于宽泛
]
```

### 2. 权限检查缓存

```typescript
// ✅ 推荐：使用计算属性缓存权限检查
const { hasPermission } = usePermissions()

const userPermissions = computed(() => ({
  canView: hasPermission(['user:view']),
  canEdit: hasPermission(['user:edit']),
  canDelete: hasPermission(['user:delete'])
}))

// 在模板中使用
// <button v-if="userPermissions.canEdit">编辑</button>

// ❌ 不推荐：在模板中重复调用
// <button v-if="hasPermission(['user:edit'])">编辑</button>
// <div v-if="hasPermission(['user:edit'])">编辑表单</div>
```

### 3. 权限错误处理

```typescript
// ✅ 推荐：友好的权限错误处理
router.beforeEach((to, from, next) => {
  const hasPermission = router.permissionManager.checkRoutePermission(to)

  if (!hasPermission) {
    // 记录访问尝试
    console.warn(`无权限访问: ${to.path}`)

    // 显示友好错误页面
    next({
      path: '/403',
      query: {
        redirect: to.fullPath,
        message: '您没有权限访问此页面'
      }
    })
  }
 else {
    next()
  }
})
```

## 缓存策略最佳实践

### 1. 合理的缓存配置

```typescript
// ✅ 推荐：根据应用规模配置缓存
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 15, // 中型应用推荐 10-20
    ttl: 600000, // 10分钟，根据数据更新频率调整
    storage: 'memory'
  }
})
```

### 2. 缓存失效策略

```typescript
// ✅ 推荐：数据更新时主动清除相关缓存
async function updateUser(userId: string, userData: any) {
  await api.updateUser(userId, userData)

  // 清除相关页面缓存
  const cacheManager = router.cacheManager
  cacheManager.removeFromCache(`UserDetail-${userId}`)
  cacheManager.removeFromCache('UserList')

  // 通知其他组件数据已更新
  eventBus.emit('user:updated', { userId, userData })
}
```

### 3. 敏感页面不缓存

```typescript
// ✅ 推荐：敏感页面禁用缓存
const routes = [
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentView,
    meta: {
      cache: false, // 支付页面不缓存
      sensitive: true
    }
  },
  {
    path: '/admin/logs',
    name: 'AdminLogs',
    component: LogsView,
    meta: {
      cache: false // 日志页面不缓存，确保数据实时性
    }
  }
]
```

## 性能优化最佳实践

### 1. 路由懒加载

```typescript
// ✅ 推荐：使用动态导入进行懒加载
// ❌ 不推荐：同步导入所有组件
import User from '@/views/User.vue'
import Admin from '@/views/Admin.vue'

const routes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/User.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    // 按模块分组懒加载
    component: () => import(/* webpackChunkName: "admin" */ '@/views/Admin.vue')
  }
]

const routes = [
  { path: '/user', name: 'User', component: User },
  { path: '/admin', name: 'Admin', component: Admin }
]
```

### 2. 预加载策略

```typescript
// ✅ 推荐：预加载用户可能访问的页面
async function preloadRelatedPages(currentRoute: string) {
  const relatedPages = {
    '/user/list': ['/user/create', '/user/import'],
    '/product/list': ['/product/create', '/product/categories']
  }

  const related = relatedPages[currentRoute]
  if (related) {
    // 在空闲时间预加载
    requestIdleCallback(() => {
      related.forEach((path) => {
        router.resolve(path)
      })
    })
  }
}
```

### 3. 组件拆分

```typescript
// ✅ 推荐：将大组件拆分为小组件
// UserDetail.vue
<template>
  <div class="user-detail">
    <UserBasicInfo :user="user" />
    <UserPermissions :permissions="user.permissions" />
    <UserActivityLog :activities="activities" />
  </div>
</template>

// ❌ 不推荐：单个大组件包含所有功能
// UserDetail.vue (500+ 行代码)
<template>
  <div class="user-detail">
    <!-- 所有用户相关的UI都在这里 -->
  </div>
</template>
```

## 错误处理最佳实践

### 1. 全局错误处理

```typescript
// ✅ 推荐：设置全局错误处理
router.onError((error) => {
  console.error('路由错误:', error)

  // 发送错误报告
  errorReporting.captureException(error, {
    tags: {
      section: 'router'
    },
    extra: {
      currentRoute: router.currentRoute.value.path
    }
  })

  // 显示用户友好的错误信息
  notification.error({
    title: '页面加载失败',
    message: '请刷新页面重试，如果问题持续存在请联系技术支持'
  })
})
```

### 2. 路由守卫错误处理

```typescript
// ✅ 推荐：在守卫中处理异步错误
router.beforeEach(async (to, from, next) => {
  try {
    // 检查用户认证状态
    if (to.meta?.requiresAuth) {
      const isAuthenticated = await checkAuthStatus()
      if (!isAuthenticated) {
        next('/login')
        return
      }
    }

    // 检查权限
    const hasPermission = await checkPermissions(to.meta?.permissions)
    if (!hasPermission) {
      next('/403')
      return
    }

    next()
  }
 catch (error) {
    console.error('导航守卫错误:', error)
    next('/error')
  }
})
```

## 代码组织最佳实践

### 1. 路由模块化

```typescript
// routes/index.ts
import { userRoutes } from './user'
import { adminRoutes } from './admin'
import { productRoutes } from './product'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  ...userRoutes,
  ...adminRoutes,
  ...productRoutes
]

// routes/user.ts
export const userRoutes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      // 用户相关路由
    ]
  }
]
```

### 2. 路由元信息标准化

```typescript
// ✅ 推荐：标准化的元信息结构
interface StandardRouteMeta {
  title: string // 页面标题（必需）
  icon?: string // 图标
  requiresAuth?: boolean // 是否需要认证
  roles?: string[] // 所需角色
  permissions?: string[] // 所需权限
  cache?: boolean // 是否缓存
  breadcrumb?: boolean // 是否显示面包屑
  menu?: boolean // 是否显示在菜单中
  layout?: string // 布局类型
  description?: string // 页面描述
}

const routes = [
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: {
      title: '用户详情',
      icon: 'user',
      requiresAuth: true,
      permissions: ['user:view'],
      cache: true,
      breadcrumb: true,
      description: '查看用户详细信息'
    } as StandardRouteMeta
  }
]
```

### 3. 组合式函数封装

```typescript
// composables/useUserManagement.ts
export function useUserManagement() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const { addTab } = useTabs()

  const openUserDetail = (userId: string) => {
    if (!hasPermission(['user:view'])) {
      notification.warning({ message: '没有查看用户的权限' })
      return
    }

    const path = `/user/${userId}`
    router.push(path)

    addTab({
      id: `user-${userId}`,
      title: `用户 ${userId}`,
      path,
      closable: true
    })
  }

  const editUser = (userId: string) => {
    if (!hasPermission(['user:edit'])) {
      notification.warning({ message: '没有编辑用户的权限' })
      return
    }

    router.push(`/user/${userId}/edit`)
  }

  return {
    openUserDetail,
    editUser
  }
}
```

## 测试最佳实践

### 1. 路由测试

```typescript
// tests/router.test.ts
import { createRouter, createWebHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { routes } from '@/router'

describe('Router', () => {
  let router

  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes
    })

    router.push('/')
    await router.isReady()
  })

  it('should navigate to user detail', async () => {
    await router.push('/user/123')
    expect(router.currentRoute.value.name).toBe('UserDetail')
    expect(router.currentRoute.value.params.id).toBe('123')
  })

  it('should redirect to login for protected routes', async () => {
    // 模拟未认证状态
    mockAuthState(false)

    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
```

### 2. 权限测试

```typescript
// tests/permissions.test.ts
import { usePermissions } from '@ldesign/router'
import { setCurrentUser } from '@/auth'

describe('Permissions', () => {
  it('should check user permissions correctly', () => {
    setCurrentUser({
      id: '1',
      roles: ['admin'],
      permissions: ['user:view', 'user:edit']
    })

    const { hasRole, hasPermission } = usePermissions()

    expect(hasRole('admin')).toBe(true)
    expect(hasRole('user')).toBe(false)
    expect(hasPermission(['user:view'])).toBe(true)
    expect(hasPermission(['user:delete'])).toBe(false)
  })
})
```

## 部署最佳实践

### 1. 环境配置

```typescript
// config/router.ts
function getRouterConfig() {
  const baseConfig = {
    routes,
    history: 'history' as const
  }

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      devTools: true,
      cache: {
        enabled: true,
        max: 5 // 开发环境减少缓存
      }
    }
  }

  return {
    ...baseConfig,
    devTools: false,
    cache: {
      enabled: true,
      max: 20,
      ttl: 600000
    }
  }
}

export const router = createLDesignRouter(getRouterConfig())
```

### 2. 性能监控

```typescript
// 添加性能监控
router.afterEach((to, from) => {
  // 记录页面访问
  analytics.track('page_view', {
    path: to.path,
    name: to.name,
    duration: performance.now() - navigationStart
  })

  // 监控路由切换性能
  if (performance.mark) {
    performance.mark('route-change-end')
    performance.measure('route-change', 'route-change-start', 'route-change-end')
  }
})

router.beforeEach((to, from, next) => {
  if (performance.mark) {
    performance.mark('route-change-start')
  }
  next()
})
```

遵循这些最佳实践，可以帮助您构建出高质量、可维护、性能优秀的路由应用。记住，最佳实践应该根据具体项目需求进行调整，不要盲目遵循。
