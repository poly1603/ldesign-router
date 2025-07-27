# 权限管理

权限管理是企业级应用的核心功能之一。`@ldesign/router` 提供了灵活而强大的权限控制系统，支持基于角色和权限的访问控制。

## 基础概念

### 权限模式

权限管理支持三种模式：

- **role** - 仅基于角色检查
- **permission** - 仅基于权限检查
- **both** - 同时检查角色和权限（默认）

### 核心组件

- **User** - 用户信息，包含角色和权限
- **Role** - 角色定义，可包含多个权限
- **Permission** - 具体的权限项

## 基础配置

### 启用权限管理

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true,
    mode: 'both',
    defaultRole: 'guest',
    guestRole: 'guest',
    adminRole: 'admin',
    redirectPath: '/login',
    checkRole: (roles: string[]) => {
      const userRoles = getCurrentUser()?.roles || []
      return roles.some(role => userRoles.includes(role))
    },
    checkPermission: (permissions: string[]) => {
      const userPermissions = getCurrentUser()?.permissions || []
      return permissions.every(permission =>
        userPermissions.includes(permission)
      )
    }
  }
})
```

### 路由级权限配置

```typescript
const routes: RouteConfig[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      requiresAuth: true, // 需要认证
      roles: ['admin'], // 需要管理员角色
      permissions: ['admin:access'] // 需要管理员访问权限
    }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: {
      requiresAuth: true,
      roles: ['user', 'admin'], // 用户或管理员都可以访问
      permissions: ['profile:view']
    }
  }
]
```

## 用户管理

### 用户数据结构

```typescript
interface User {
  id: string
  name: string
  email?: string
  roles: string[]
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  inherits?: string[] // 继承的角色
}

interface Permission {
  id: string
  name: string
  description?: string
  resource?: string // 资源类型
  action?: string // 操作类型
}
```

### 设置当前用户

```typescript
// 登录成功后设置用户信息
router.permissionManager.setCurrentUser({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  roles: ['admin', 'user'],
  permissions: [
    'admin:access',
    'user:view',
    'user:edit',
    'profile:view',
    'profile:edit'
  ]
})
```

### 管理角色和权限

```typescript
// 添加角色
router.permissionManager.addRole({
  id: 'editor',
  name: 'Editor',
  description: '编辑者角色',
  permissions: ['content:view', 'content:edit'],
  inherits: ['user'] // 继承用户角色的权限
})

// 添加权限
router.permissionManager.addPermission({
  id: 'content:publish',
  name: 'Publish Content',
  description: '发布内容权限',
  resource: 'content',
  action: 'publish'
})
```

## 权限检查

### 路由级权限检查

权限检查会在路由导航时自动执行：

```typescript
// 自动权限检查流程
router.beforeEach((to, from, next) => {
  const hasPermission = router.permissionManager.checkRoutePermission(to)

  if (!hasPermission) {
    // 重定向到登录页或无权限页面
    next(router.permissionManager.getRedirectPath())
  }
 else {
    next()
  }
})
```

### 组件内权限检查

```vue
<script setup lang="ts">
import { usePermission } from '@ldesign/router'

const { hasRole, hasPermission, hasAnyRole, hasAnyPermission } = usePermission()

function deleteUser() {
  // 删除用户逻辑
}

function editUser() {
  // 编辑用户逻辑
}

function moderateContent() {
  // 内容审核逻辑
}
</script>

<template>
  <div>
    <h1>用户管理</h1>

    <!-- 基于角色显示 -->
    <button v-if="hasRole(['admin'])" @click="deleteUser">
      删除用户
    </button>

    <!-- 基于权限显示 -->
    <button v-if="hasPermission(['user:edit'])" @click="editUser">
      编辑用户
    </button>

    <!-- 组合权限检查 -->
    <button v-if="hasAnyRole(['admin', 'moderator'])" @click="moderateContent">
      内容审核
    </button>
  </div>
</template>
```

### 程序化权限检查

```typescript
import { usePermission } from '@ldesign/router'

const {
  hasRole,
  hasPermission,
  hasAnyRole,
  hasAnyPermission,
  isAdmin,
  isGuest
} = usePermission()

// 检查单个角色
if (hasRole('admin')) {
  console.log('用户是管理员')
}

// 检查多个角色（需要全部拥有）
if (hasRole(['admin', 'moderator'])) {
  console.log('用户同时拥有管理员和审核员角色')
}

// 检查任意角色（拥有其中一个即可）
if (hasAnyRole(['admin', 'moderator'])) {
  console.log('用户是管理员或审核员')
}

// 检查权限
if (hasPermission(['user:delete'])) {
  console.log('用户有删除权限')
}

// 检查任意权限
if (hasAnyPermission(['user:view', 'user:edit'])) {
  console.log('用户有查看或编辑权限')
}

// 检查是否为管理员
if (isAdmin()) {
  console.log('用户是管理员')
}

// 检查是否为访客
if (isGuest()) {
  console.log('用户是访客')
}
```

## 高级功能

### 动态权限更新

```typescript
// 权限变更时更新用户信息
async function updateUserPermissions(userId: string) {
  const updatedUser = await fetchUserPermissions(userId)
  router.permissionManager.setCurrentUser(updatedUser)
}

// 监听权限变更
router.permissionManager.onPermissionChange((user) => {
  console.log('用户权限已更新:', user)
})
```

### 角色继承

```typescript
// 定义角色继承关系
const roles = [
  {
    id: 'user',
    name: 'User',
    permissions: ['profile:view', 'profile:edit']
  },
  {
    id: 'moderator',
    name: 'Moderator',
    permissions: ['content:moderate'],
    inherits: ['user'] // 继承用户角色的所有权限
  },
  {
    id: 'admin',
    name: 'Admin',
    permissions: ['admin:access', 'user:manage'],
    inherits: ['moderator'] // 继承审核员角色的所有权限
  }
]

// 设置角色
roles.forEach((role) => {
  router.permissionManager.addRole(role)
})
```

### 条件权限

```typescript
// 基于条件的权限检查
function checkConditionalPermission(resource: any) {
  const user = router.permissionManager.getCurrentUser()

  // 用户只能编辑自己的资源
  if (resource.ownerId === user?.id) {
    return true
  }

  // 管理员可以编辑所有资源
  if (router.permissionManager.isAdmin()) {
    return true
  }

  return false
}
```

### 权限缓存

```typescript
// 启用权限缓存以提高性能
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true,
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟缓存
      maxSize: 1000
    }
  }
})
```

## 权限指令

创建自定义指令简化权限控制：

```typescript
// directives/permission.ts
import { Directive } from 'vue'
import { usePermission } from '@ldesign/router'

export const vPermission: Directive = {
  mounted(el, binding) {
    const { hasPermission } = usePermission()
    const permissions = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    if (!hasPermission(permissions)) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const { hasPermission } = usePermission()
    const permissions = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    el.style.display = hasPermission(permissions) ? '' : 'none'
  }
}

export const vRole: Directive = {
  mounted(el, binding) {
    const { hasRole } = usePermission()
    const roles = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    if (!hasRole(roles)) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const { hasRole } = usePermission()
    const roles = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    el.style.display = hasRole(roles) ? '' : 'none'
  }
}
```

在组件中使用指令：

```vue
<template>
  <div>
    <!-- 基于权限显示 -->
    <button v-permission="'user:delete'">
      删除用户
    </button>

    <!-- 基于角色显示 -->
    <div v-role="'admin'">
      管理员专用内容
    </div>

    <!-- 多个权限 -->
    <button v-permission="['user:edit', 'user:view']">
      编辑用户
    </button>
  </div>
</template>
```

## 最佳实践

### 1. 权限粒度设计

```typescript
// 推荐：细粒度权限设计
const permissions = [
  'user:view', // 查看用户
  'user:create', // 创建用户
  'user:edit', // 编辑用户
  'user:delete', // 删除用户
  'user:export', // 导出用户
]

// 不推荐：粗粒度权限设计
const permissions = [
  'user:manage' // 管理用户（过于宽泛）
]
```

### 2. 角色层次设计

```typescript
// 清晰的角色层次
const roleHierarchy = {
  guest: [],
  user: ['profile:view', 'profile:edit'],
  moderator: ['content:moderate', ...user],
  admin: ['admin:access', 'user:manage', ...moderator]
}
```

### 3. 错误处理

```typescript
// 权限检查失败时的处理
router.beforeEach((to, from, next) => {
  try {
    const hasPermission = router.permissionManager.checkRoutePermission(to)

    if (!hasPermission) {
      // 记录访问尝试
      console.warn(`用户尝试访问无权限页面: ${to.path}`)

      // 显示友好的错误信息
      next({
        path: '/403',
        query: { redirect: to.fullPath }
      })
    }
 else {
      next()
    }
  }
 catch (error) {
    console.error('权限检查失败:', error)
    next('/error')
  }
})
```

### 4. 性能优化

```typescript
// 使用计算属性缓存权限检查结果
const userPermissions = computed(() => {
  const user = router.permissionManager.getCurrentUser()
  return new Set(user?.permissions || [])
})

function hasPermission(permission: string) {
  return userPermissions.value.has(permission)
}
```

## 调试和监控

### 权限调试

```typescript
// 开发环境下启用权限调试
if (process.env.NODE_ENV === 'development') {
  router.permissionManager.enableDebug()
}

// 监听权限检查事件
router.permissionManager.onPermissionCheck((result) => {
  console.log('权限检查:', result)
})
```

### 权限统计

```typescript
// 获取权限统计信息
const stats = router.permissionManager.getPermissionStats()
console.log('权限统计:', stats)
// {
//   users: 1,
//   roles: 3,
//   permissions: 15,
//   enabled: true
// }
```

权限管理是构建安全可靠的企业级应用的基础。通过合理的权限设计和实现，可以确保应用的安全性和用户体验。
