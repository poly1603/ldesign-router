# 配置选项

本章节详细介绍 `@ldesign/router` 的所有配置选项，帮助您根据项目需求进行定制。

## 基础配置

### RouterOptions

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

### 历史模式

```typescript
type HistoryMode = 'hash' | 'history' | 'memory'
```

**选项说明:**
- `hash` - 使用 URL hash 模式 (默认)
- `history` - 使用 HTML5 History API
- `memory` - 内存模式，用于 SSR 或测试

**示例:**
```typescript
const router = createLDesignRouter({
  routes,
  history: 'history' // 使用 HTML5 History 模式
})
```

## 设备路由配置

### DeviceRouterConfig

```typescript
interface DeviceRouterConfig {
  enabled?: boolean // 是否启用设备路由
  breakpoints?: { // 断点配置
    mobile?: number // 移动设备断点 (默认: 768)
    tablet?: number // 平板设备断点 (默认: 1024)
  }
  defaultDevice?: DeviceType // 默认设备类型 (默认: 'desktop')
}
```

**示例:**
```typescript
const router = createLDesignRouter({
  routes,
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    },
    defaultDevice: 'desktop'
  }
})
```

## 权限管理配置

### PermissionConfig

```typescript
interface PermissionConfig {
  enabled?: boolean // 是否启用权限管理
  mode?: 'role' | 'permission' | 'both' // 权限模式
  defaultRole?: string // 默认角色
  guestRole?: string // 访客角色
  adminRole?: string // 管理员角色
  redirectPath?: string // 无权限时重定向路径
  checkRole?: (roles: string[]) => boolean // 角色检查函数
  checkPermission?: (permissions: string[]) => boolean // 权限检查函数
}
```

**权限模式说明:**
- `role` - 仅基于角色检查
- `permission` - 仅基于权限检查
- `both` - 同时检查角色和权限 (默认)

**示例:**
```typescript
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true,
    mode: 'both',
    defaultRole: 'guest',
    guestRole: 'guest',
    adminRole: 'admin',
    redirectPath: '/login',
    checkRole: (roles) => {
      const userRoles = getCurrentUser()?.roles || []
      return roles.some(role => userRoles.includes(role))
    },
    checkPermission: (permissions) => {
      const userPermissions = getCurrentUser()?.permissions || []
      return permissions.every(permission =>
        userPermissions.includes(permission)
      )
    }
  }
})
```

## 缓存管理配置

### CacheConfig

```typescript
interface CacheConfig {
  enabled?: boolean // 是否启用缓存
  strategy?: 'lru' | 'fifo' | 'custom' // 缓存策略
  max?: number // 最大缓存数量
  ttl?: number // 缓存时间 (毫秒)
  storage?: 'memory' | 'local' | 'session' // 存储方式
}
```

**缓存策略说明:**
- `lru` - 最近最少使用 (默认)
- `fifo` - 先进先出
- `custom` - 自定义策略

**存储方式说明:**
- `memory` - 内存存储 (默认)
- `local` - localStorage 持久化
- `session` - sessionStorage 会话存储

**示例:**
```typescript
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 10,
    ttl: 300000, // 5分钟
    storage: 'memory'
  }
})
```

## 面包屑配置

### BreadcrumbConfig

```typescript
interface BreadcrumbConfig {
  enabled?: boolean // 是否启用面包屑
  separator?: string // 分隔符
  showHome?: boolean // 是否显示首页
  homeText?: string // 首页文本
  homePath?: string // 首页路径
  maxItems?: number // 最大显示项数
}
```

**示例:**
```typescript
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

## 标签页配置

### TabsConfig

```typescript
interface TabsConfig {
  enabled?: boolean // 是否启用标签页
  max?: number // 最大标签页数量
  persistent?: boolean // 是否持久化
  closable?: boolean // 是否可关闭
  draggable?: boolean // 是否可拖拽
  contextMenu?: boolean // 是否显示右键菜单
  cache?: boolean // 是否缓存标签页
}
```

**示例:**
```typescript
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

## 动画配置

### AnimationConfig

```typescript
interface AnimationConfig {
  enabled?: boolean // 是否启用动画
  type?: 'fade' | 'slide' | 'zoom' | 'custom' // 动画类型
  duration?: number // 动画时长 (毫秒)
  easing?: string // 缓动函数
  direction?: string // 动画方向
}
```

**动画类型说明:**
- `fade` - 淡入淡出 (默认)
- `slide` - 滑动
- `zoom` - 缩放
- `custom` - 自定义

**示例:**
```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'slide',
    duration: 300,
    easing: 'ease-in-out',
    direction: 'right'
  }
})
```

## 菜单配置

### MenuConfig

```typescript
interface MenuConfig {
  enabled?: boolean // 是否启用菜单
  mode?: 'sidebar' | 'horizontal' | 'dropdown' // 菜单模式
  collapsible?: boolean // 是否可折叠
  defaultCollapsed?: boolean // 默认是否折叠
  width?: number // 菜单宽度 (像素)
  accordion?: boolean // 是否手风琴模式
}
```

**菜单模式说明:**
- `sidebar` - 侧边栏模式 (默认)
- `horizontal` - 水平模式
- `dropdown` - 下拉模式

**示例:**
```typescript
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

## 开发工具配置

### 开发工具

```typescript
// 简单启用/禁用
devTools: boolean

// 或者详细配置
devTools: {
  enabled: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  size: 'small' | 'medium' | 'large'
  features: {
    routeInspector: boolean
    performanceMonitor: boolean
    errorTracker: boolean
    cacheViewer: boolean
    animationDebugger: boolean
  }
}
```

**示例:**
```typescript
const router = createLDesignRouter({
  routes,
  // 简单配置
  devTools: process.env.NODE_ENV === 'development'

  // 或详细配置
  devTools: {
    enabled: process.env.NODE_ENV === 'development',
    position: 'bottom',
    size: 'medium',
    features: {
      routeInspector: true,
      performanceMonitor: true,
      errorTracker: true,
      cacheViewer: true,
      animationDebugger: false
    }
  }
})
```

## 完整配置示例

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  // 基础配置
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

  // 历史模式
  history: 'history',

  // 设备路由
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    }
  },

  // 权限管理
  permission: {
    enabled: true,
    mode: 'both',
    checkRole: roles => userHasRole(roles),
    checkPermission: permissions => userHasPermission(permissions),
    redirectPath: '/login'
  },

  // 缓存管理
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 15,
    ttl: 300000
  },

  // 面包屑导航
  breadcrumb: {
    enabled: true,
    showHome: true,
    homeText: '首页'
  },

  // 标签页管理
  tabs: {
    enabled: true,
    max: 10,
    persistent: true
  },

  // 路由动画
  animation: {
    enabled: true,
    type: 'slide',
    duration: 300
  },

  // 菜单管理
  menu: {
    enabled: true,
    mode: 'sidebar',
    collapsible: true
  },

  // 开发工具
  devTools: process.env.NODE_ENV === 'development'
})

export default router
```

## 环境变量配置

您可以使用环境变量来控制不同环境下的配置：

```typescript
// .env.development
VITE_ROUTER_DEV_TOOLS = true
VITE_ROUTER_CACHE_ENABLED = true

// .env.production
VITE_ROUTER_DEV_TOOLS = false
VITE_ROUTER_CACHE_ENABLED = true
```

```typescript
// 在配置中使用环境变量
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: import.meta.env.VITE_ROUTER_CACHE_ENABLED === 'true'
  },
  devTools: import.meta.env.VITE_ROUTER_DEV_TOOLS === 'true'
})
```

## 配置验证

`@ldesign/router` 会在开发环境中验证配置的正确性：

```typescript
// 开发环境下会显示配置警告
if (process.env.NODE_ENV === 'development') {
  validateRouterOptions(options)
}
```

通过合理配置这些选项，您可以根据项目需求定制出最适合的路由管理方案。
