# 路由器 API

本章节详细介绍 `@ldesign/router` 的核心 API，包括路由器类、配置选项和方法。

## createLDesignRouter

创建路由器实例的工厂函数。

### 语法

```typescript
function createLDesignRouter(options: RouterOptions): LDesignRouter
```

### 参数

#### RouterOptions

```typescript
interface RouterOptions {
  routes: RouteConfig[] // 路由配置数组
  history?: HistoryMode // 历史模式
  deviceRouter?: DeviceRouterConfig // 设备路由配置
  guards?: GuardConfig // 守卫配置
  permission?: PermissionConfig // 权限配置
  cache?: CacheConfig // 缓存配置
  breadcrumb?: BreadcrumbConfig // 面包屑配置
  tabs?: TabsConfig // 标签页配置
  animation?: AnimationConfig // 动画配置
  menu?: MenuConfig // 菜单配置
  devTools?: boolean // 开发工具
}
```

#### HistoryMode

```typescript
type HistoryMode = 'hash' | 'history' | 'memory'
```

### 示例

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    }
  ],
  history: 'history',
  permission: {
    enabled: true
  }
})
```

## LDesignRouter

主路由器类，提供路由管理的核心功能。

### 属性

#### currentRoute

当前路由的响应式引用。

```typescript
readonly currentRoute: Ref<RouteLocationNormalized>
```

#### options

路由器配置选项。

```typescript
readonly options: RouterOptions
```

#### 管理器属性

```typescript
readonly guardManager: GuardManager
readonly permissionManager: PermissionManager
readonly cacheManager: CacheManager
readonly breadcrumbManager: BreadcrumbManager
readonly tabsManager: TabsManager
readonly animationManager: AnimationManager
readonly deviceRouter: DeviceRouter
readonly menuManager: MenuManager
readonly devTools: DevTools
```

### 导航方法

#### push

导航到新的路由。

```typescript
push(to: RouteLocationRaw): Promise<NavigationFailure | void>
```

**参数:**
- `to` - 目标路由位置

**示例:**
```typescript
// 字符串路径
router.push('/user/123')

// 对象形式
router.push({ path: '/user/123' })
router.push({ name: 'User', params: { id: '123' } })
router.push({ path: '/user', query: { tab: 'profile' } })
```

#### replace

替换当前路由。

```typescript
replace(to: RouteLocationRaw): Promise<NavigationFailure | void>
```

**示例:**
```typescript
router.replace('/login')
router.replace({ name: 'Login' })
```

#### go

在历史记录中前进或后退。

```typescript
go(delta: number): void
```

**参数:**
- `delta` - 前进或后退的步数

**示例:**
```typescript
router.go(-1) // 后退一步
router.go(1) // 前进一步
router.go(-3) // 后退三步
```

#### back

后退一步。

```typescript
back(): void
```

#### forward

前进一步。

```typescript
forward(): void
```

### 路由管理

#### addRoute

添加新路由。

```typescript
addRoute(route: RouteConfig): () => void
addRoute(parentName: string, route: RouteConfig): () => void
```

**参数:**
- `route` - 路由配置
- `parentName` - 父路由名称（可选）

**返回值:**
- 移除路由的函数

**示例:**
```typescript
// 添加顶级路由
const removeRoute = router.addRoute({
  path: '/new-page',
  name: 'NewPage',
  component: NewPageComponent
})

// 添加子路由
router.addRoute('Parent', {
  path: 'child',
  name: 'Child',
  component: ChildComponent
})

// 移除路由
removeRoute()
```

#### removeRoute

移除路由。

```typescript
removeRoute(name: string): void
```

**参数:**
- `name` - 路由名称

**示例:**
```typescript
router.removeRoute('OldPage')
```

#### hasRoute

检查路由是否存在。

```typescript
hasRoute(name: string): boolean
```

**示例:**
```typescript
if (router.hasRoute('UserProfile')) {
  console.log('用户资料路由存在')
}
```

#### getRoutes

获取所有路由。

```typescript
getRoutes(): RouteConfig[]
```

**示例:**
```typescript
const allRoutes = router.getRoutes()
console.log('总路由数:', allRoutes.length)
```

#### resolve

解析路由位置。

```typescript
resolve(to: RouteLocationRaw): RouteLocation
```

**参数:**
- `to` - 要解析的路由位置

**返回值:**
- 解析后的路由位置

**示例:**
```typescript
const resolved = router.resolve('/user/123')
console.log('解析后的路径:', resolved.path)
console.log('匹配的路由:', resolved.matched)
```

### 导航守卫

#### beforeEach

添加全局前置守卫。

```typescript
beforeEach(guard: NavigationGuard): () => void
```

**参数:**
- `guard` - 导航守卫函数

**返回值:**
- 移除守卫的函数

**示例:**
```typescript
const removeGuard = router.beforeEach((to, from, next) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    next('/login')
  }
 else {
    next()
  }
})

// 移除守卫
removeGuard()
```

#### beforeResolve

添加全局解析守卫。

```typescript
beforeResolve(guard: NavigationGuard): () => void
```

#### afterEach

添加全局后置守卫。

```typescript
afterEach(guard: NavigationHookAfter): () => void
```

**示例:**
```typescript
router.afterEach((to, from) => {
  // 更新页面标题
  document.title = to.meta?.title || 'My App'

  // 发送页面访问统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name
  })
})
```

### 错误处理

#### onError

注册错误处理器。

```typescript
onError(handler: (error: Error) => void): void
```

**示例:**
```typescript
router.onError((error) => {
  console.error('路由错误:', error)

  // 发送错误报告
  errorReporting.captureException(error)
})
```

#### isReady

等待路由器准备就绪。

```typescript
isReady(): Promise<void>
```

**示例:**
```typescript
await router.isReady()
console.log('路由器已准备就绪')
```

### 实用方法

#### install

Vue 插件安装方法。

```typescript
install(app: App): void
```

**示例:**
```typescript
import { createApp } from 'vue'
import router from './router'

const app = createApp(App)
app.use(router)
```

#### getMatchedComponents

获取匹配的组件。

```typescript
getMatchedComponents(to?: RouteLocationRaw): Component[]
```

#### getCurrentLocation

获取当前位置。

```typescript
getCurrentLocation(): RouteLocation
```

## 类型定义

### RouteConfig

```typescript
interface RouteConfig {
  path: string
  name?: string
  component?: Component
  components?: Record<string, Component>
  children?: RouteConfig[]
  meta?: RouteMeta
  redirect?: string | RouteLocation
  alias?: string | string[]
  beforeEnter?: NavigationGuard
  props?: boolean | Record<string, any> | Function
}
```

### RouteMeta

```typescript
interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  roles?: string[]
  permissions?: string[]
  cache?: boolean
  animation?: string
  breadcrumb?: boolean
  tab?: boolean
  menu?: boolean
  layout?: string
  keepAlive?: boolean
  [key: string]: any
}
```

### RouteLocation

```typescript
interface RouteLocation {
  path: string
  name?: string
  params: Record<string, string>
  query: Record<string, string | string[]>
  hash: string
  fullPath: string
  matched: RouteRecord[]
  meta: RouteMeta
  redirectedFrom?: RouteLocation
}
```

### NavigationGuard

```typescript
type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => void | Promise<void> | boolean | RouteLocationRaw
```

### NavigationGuardNext

```typescript
interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean): void
}
```

## 配置接口

### DeviceRouterConfig

```typescript
interface DeviceRouterConfig {
  enabled?: boolean
  breakpoints?: {
    mobile?: number
    tablet?: number
  }
  defaultDevice?: DeviceType
}
```

### PermissionConfig

```typescript
interface PermissionConfig {
  enabled?: boolean
  mode?: 'role' | 'permission' | 'both'
  defaultRole?: string
  guestRole?: string
  adminRole?: string
  redirectPath?: string
  checkRole?: (roles: string[]) => boolean
  checkPermission?: (permissions: string[]) => boolean
}
```

### CacheConfig

```typescript
interface CacheConfig {
  enabled?: boolean
  strategy?: 'lru' | 'fifo' | 'custom'
  max?: number
  ttl?: number
  storage?: 'memory' | 'local' | 'session'
}
```

### BreadcrumbConfig

```typescript
interface BreadcrumbConfig {
  enabled?: boolean
  separator?: string
  showHome?: boolean
  homeText?: string
  homePath?: string
  maxItems?: number
}
```

### TabsConfig

```typescript
interface TabsConfig {
  enabled?: boolean
  max?: number
  persistent?: boolean
  closable?: boolean
  draggable?: boolean
  contextMenu?: boolean
  cache?: boolean
}
```

### AnimationConfig

```typescript
interface AnimationConfig {
  enabled?: boolean
  type?: 'fade' | 'slide' | 'zoom' | 'custom'
  duration?: number
  easing?: string
  direction?: string
}
```

### MenuConfig

```typescript
interface MenuConfig {
  enabled?: boolean
  mode?: 'sidebar' | 'horizontal' | 'dropdown'
  collapsible?: boolean
  defaultCollapsed?: boolean
  width?: number
  accordion?: boolean
}
```

## 使用示例

### 完整配置示例

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: {
        title: '首页',
        icon: 'home'
      }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin']
      },
      children: [
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/Users.vue'),
          meta: {
            title: '用户管理',
            permissions: ['user:view']
          }
        }
      ]
    }
  ],

  history: 'history',

  permission: {
    enabled: true,
    mode: 'both',
    checkRole: roles => userHasRole(roles),
    checkPermission: permissions => userHasPermission(permissions),
    redirectPath: '/login'
  },

  cache: {
    enabled: true,
    strategy: 'lru',
    max: 15,
    ttl: 300000
  },

  breadcrumb: {
    enabled: true,
    showHome: true,
    homeText: '首页'
  },

  tabs: {
    enabled: true,
    max: 10,
    persistent: true
  },

  animation: {
    enabled: true,
    type: 'slide',
    duration: 300
  },

  devTools: process.env.NODE_ENV === 'development'
})

export default router
```
