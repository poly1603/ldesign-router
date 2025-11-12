# 新增功能使用指南

本文档介绍 @ldesign/router-core 新增的高级功能。

## 1. 路由验证器 (Route Validator)

在开发模式下验证路由配置的正确性。

```typescript
import { validateRoutes, generateReport } from '@ldesign/router-core'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/user/:id', name: 'user', component: User },
  { path: '*', component: NotFound },
]

// 验证路由
const result = validateRoutes(routes, {
  strict: true,
  checkBestPractices: true,
})

// 生成报告
console.log(generateReport(result))
```

### 验证规则

- **基础验证**: 路径格式、名称类型、必需字段
- **冲突检测**: 路径冲突、命名冲突
- **循环检测**: 循环重定向检测
- **最佳实践**: 命名路由建议、路由深度检查

### 自定义规则

```typescript
import { createValidator, check404Route, checkRootRoute } from '@ldesign/router-core'

const validator = createValidator({
  customRules: [check404Route, checkRootRoute],
})

const result = validator.validate(routes)
```

---

## 2. 链式 API (Chainable API)

流畅的链式调用构建路由。

```typescript
import { route, createChainableRouter } from '@ldesign/router-core'

// 单个路由构建
const userRoute = route('/user/:id', builder => {
  builder
    .name('user')
    .component(UserComponent)
    .title('User Profile')
    .requiresAuth()
    .roles(['user', 'admin'])
    .addGuard(authGuard)
})

// 路由器链式配置
const router = createChainableRouter()
  .page('/', Home, 'home')
  .route('/user/:id', builder => {
    builder
      .name('user')
      .component(User)
      .requiresAuth()
      .child('profile', child => {
        child.name('user-profile').component(Profile)
      })
      .child('settings', child => {
        child.name('user-settings').component(Settings)
      })
  })
  .group('/admin', group => {
    group
      .page('/users', AdminUsers, 'admin-users')
      .page('/settings', AdminSettings, 'admin-settings')
  })
  .redirectTo('/old-path', '/new-path')

const routes = router.getRoutes()
```

### 路由组合器

```typescript
import { compose } from '@ldesign/router-core'

const authRoutes = compose()
  .add(loginRoute)
  .add(registerRoute)

const adminRoutes = compose()
  .add(dashboardRoute)
  .add(usersRoute)

const allRoutes = compose()
  .merge(authRoutes, adminRoutes)
  .filter(route => !route.meta?.deprecated)
  .getRoutes()
```

---

## 3. Promise API

基于 Promise 的导航 API,更好地处理异步导航。

```typescript
import { 
  createPromiseRouter, 
  createNavigationController,
  waitForNavigation,
  safeNavigate,
} from '@ldesign/router-core'

const promiseRouter = createPromiseRouter()

// 设置导航处理器
promiseRouter.setNavigateHandler(async (to, options) => {
  // 实际的导航逻辑
  return {
    success: true,
    to,
    duration: 100,
  }
})

// Promise 导航
try {
  const result = await promiseRouter.push('/user/123', {
    timeout: 5000,
    meta: { source: 'menu' },
  })
  
  console.log('导航成功', result.duration)
} catch (error) {
  console.error('导航失败', error)
}

// 带取消控制的导航
const controller = createNavigationController()
const signal = controller.start()

promiseRouter.push('/slow-page', { signal }).catch(() => {
  console.log('导航被取消')
})

// 1秒后取消
setTimeout(() => controller.cancel(), 1000)

// 条件导航
await promiseRouter.navigateIf(
  () => user.isAuthenticated,
  '/dashboard',
)

// 重试导航
await promiseRouter.navigateWithRetry('/api/data', {
  maxRetries: 3,
  retryDelay: 1000,
})

// 批量导航
const results = await promiseRouter.navigateAll([
  '/page1',
  '/page2',
  '/page3',
])

// 顺序导航
await promiseRouter.navigateSequence([
  '/step1',
  '/step2',
  '/step3',
])

// 安全导航(不抛出错误)
const result = await safeNavigate(promiseRouter, '/may-fail')
if (!result.success) {
  console.log('导航失败但未抛出错误')
}

// 等待所有导航完成
await waitForNavigation(promiseRouter, 10000)
```

---

## 4. 增强类型系统

提供严格的类型检查和类型推导。

```typescript
import { 
  defineRoute, 
  defineRouteGroup,
  defineRouteModule,
  createTypedRoute,
  type TypedRouteRecordRaw,
  type ExtendedRouteMeta,
} from '@ldesign/router-core'

// 类型安全的路由定义
const userRoute = defineRoute({
  path: '/user/:id',
  name: 'user' as const,
  component: UserComponent,
  meta: {
    title: 'User',
    requiresAuth: true,
    roles: ['user', 'admin'],
  } satisfies ExtendedRouteMeta,
})

// 类型推导的参数
type UserParams = { id: string } // 自动从路径推导

// 类型安全的导航
const location = createTypedRoute(
  'user',
  { id: '123' }, // ✓ 类型检查通过
  { tab: 'profile' }
)

// 路由组
const adminRoutes = defineRouteGroup({
  prefix: '/admin',
  meta: {
    requiresAuth: true,
    roles: ['admin'],
  },
  routes: [
    defineRoute({ 
      path: 'users', 
      name: 'admin-users',
      component: AdminUsers,
    }),
    defineRoute({ 
      path: 'settings', 
      name: 'admin-settings',
      component: AdminSettings,
    }),
  ],
  guards: [adminGuard],
})

// 路由模块
const authModule = defineRouteModule({
  name: 'auth',
  routes: [
    defineRoute({ path: '/login', name: 'login', component: Login }),
    defineRoute({ path: '/register', name: 'register', component: Register }),
  ],
  guards: [guestGuard],
  meta: {
    layout: 'auth',
  },
})

// 类型守卫
import { isNamedRoute, isPathRoute } from '@ldesign/router-core'

if (isNamedRoute(location)) {
  console.log('命名路由:', location.name)
}

if (isPathRoute(location)) {
  console.log('路径路由:', location.path)
}

// 元数据合并
import { mergeRouteMeta } from '@ldesign/router-core'

const baseMeta = { requiresAuth: true }
const pageMeta = { title: 'Dashboard', roles: ['admin'] }
const merged = mergeRouteMeta(baseMeta, pageMeta)
```

### 类型推导示例

```typescript
// 路径参数自动推导
type Params1 = ExtractRouteParamsFromPath<'/user/:id'>
// { id: string }

type Params2 = ExtractRouteParamsFromPath<'/blog/:category/:slug'>
// { category: string; slug: string }

// 命名路由类型映射
type AppRoutes = NamedRoutes<{
  home: {}
  user: { params: { id: string } }
  post: { params: { id: string }; query: { tab?: string } }
}>

// 使用时享受完整的类型提示
const userLocation: AppRoutes['user'] = {
  name: 'user',
  params: { id: '123' }, // ✓ 类型正确
}
```

---

## 5. 组合使用示例

### 完整的类型安全路由系统

```typescript
import {
  createChainableRouter,
  createPromiseRouter,
  createValidator,
  defineRouteModule,
  type ExtendedRouteMeta,
} from '@ldesign/router-core'

// 1. 定义类型化的路由模块
const authModule = defineRouteModule({
  name: 'auth',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Login' },
    },
  ],
})

// 2. 使用链式 API 构建路由
const router = createChainableRouter()
  .routes(authModule.routes)
  .route('/dashboard', builder => {
    builder
      .name('dashboard')
      .component(Dashboard)
      .requiresAuth()
      .title('Dashboard')
  })

const routes = router.getRoutes()

// 3. 验证路由配置
const validator = createValidator({ strict: true })
const validation = validator.validate(routes)

if (!validation.valid) {
  console.error('路由配置错误:', validation.issues)
}

// 4. 创建 Promise 路由器进行导航
const promiseRouter = createPromiseRouter()

promiseRouter.setNavigateHandler(async (to, options) => {
  // 实际导航逻辑
  return {
    success: true,
    to,
    duration: Date.now(),
  }
})

// 5. 类型安全的导航
await promiseRouter.push({ name: 'dashboard' })
```

### 开发模式路由调试

```typescript
import {
  validateRoutes,
  generateReport,
  check404Route,
  checkRootRoute,
} from '@ldesign/router-core'

// 开发模式下的完整验证
if (process.env.NODE_ENV === 'development') {
  const result = validateRoutes(routes, {
    strict: true,
    checkBestPractices: true,
    customRules: [check404Route, checkRootRoute],
  })

  if (!result.valid) {
    console.warn(generateReport(result))
  }
}
```

---

## 6. 迁移指南

### 从普通路由配置迁移到链式 API

**之前:**
```typescript
const routes = [
  {
    path: '/user/:id',
    name: 'user',
    component: User,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'profile',
        name: 'user-profile',
        component: Profile,
      },
    ],
  },
]
```

**之后:**
```typescript
const router = createChainableRouter()
  .route('/user/:id', builder => {
    builder
      .name('user')
      .component(User)
      .requiresAuth()
      .child('profile', child => {
        child.name('user-profile').component(Profile)
      })
  })

const routes = router.getRoutes()
```

### 从回调导航迁移到 Promise API

**之前:**
```typescript
router.push('/page', () => {
  console.log('导航完成')
}, (error) => {
  console.error('导航失败', error)
})
```

**之后:**
```typescript
try {
  const result = await promiseRouter.push('/page')
  console.log('导航完成', result)
} catch (error) {
  console.error('导航失败', error)
}
```

---

## 总结

新增的功能提供了:

1. **路由验证器**: 开发时的路由配置验证和最佳实践检查
2. **链式 API**: 更流畅的路由构建体验
3. **Promise API**: 现代化的异步导航处理
4. **增强类型系统**: 完整的 TypeScript 类型支持和推导

这些功能可以独立使用,也可以组合使用,提供了灵活且类型安全的路由开发体验。
