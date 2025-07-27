# 迁移指南

本指南帮助您从其他路由解决方案迁移到 `@ldesign/router`，或在不同版本间升级。

## 从 Vue Router 迁移

### 基础路由配置

**Vue Router 4.x:**
```typescript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

**@ldesign/router:**
```typescript
import { createLDesignRouter } from '@ldesign/router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue')
  }
]

const router = createLDesignRouter({
  history: 'web', // 简化的历史模式配置
  routes
})

export default router
```

### 导航守卫迁移

**Vue Router:**
```typescript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  }
 else {
    next()
  }
})
```

**@ldesign/router:**
```typescript
// 方式1: 传统守卫（完全兼容）
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  }
 else {
    next()
  }
})

// 方式2: 使用内置权限管理（推荐）
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true,
    mode: 'role',
    unauthorizedRedirect: '/login'
  }
})
```

### 组合式 API 迁移

**Vue Router:**
```typescript
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
```

**@ldesign/router:**
```typescript
// 完全兼容 Vue Router API
import { useRoute, useRouter } from '@ldesign/router'

// 额外的组合式 API
import { useCache, useDevice, usePermissions } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

const { hasRole, hasPermission } = usePermissions()
const { deviceType, isMobile } = useDevice()
const { getCacheStats } = useCache()
```

### 路由元信息扩展

**Vue Router:**
```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      title: '管理后台'
    }
  }
]
```

**@ldesign/router:**
```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      // Vue Router 兼容
      requiresAuth: true,
      title: '管理后台',

      // @ldesign/router 扩展
      roles: ['admin'],
      permissions: ['admin:read'],
      cache: true,
      breadcrumb: {
        title: '管理后台',
        icon: 'settings'
      },
      device: {
        mobile: MobileAdmin,
        desktop: DesktopAdmin
      }
    }
  }
]
```

## 从其他路由库迁移

### 从 React Router 概念迁移

如果您熟悉 React Router，以下对比可以帮助您快速上手：

**React Router:**
```jsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**@ldesign/router (Vue):**
```typescript
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/user/:id',
    component: User
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createLDesignRouter({ routes })
```

### 从 Next.js 路由迁移

**Next.js 文件系统路由:**
```
pages/
  index.js          → /
  user/
    [id].js         → /user/:id
    profile.js      → /user/profile
  admin/
    index.js        → /admin
    settings.js     → /admin/settings
```

**@ldesign/router 等效配置:**
```typescript
const routes = [
  {
    path: '/',
    component: () => import('@/pages/index.vue')
  },
  {
    path: '/user/:id',
    component: () => import('@/pages/user/[id].vue')
  },
  {
    path: '/user/profile',
    component: () => import('@/pages/user/profile.vue')
  },
  {
    path: '/admin',
    component: () => import('@/pages/admin/index.vue')
  },
  {
    path: '/admin/settings',
    component: () => import('@/pages/admin/settings.vue')
  }
]
```

## 版本升级指南

### 从 1.x 升级到 2.x

#### 破坏性变更

1. **配置结构变更**

**1.x:**
```typescript
const router = createLDesignRouter({
  routes,
  mode: 'history',
  base: '/app/',

  // 功能配置分散
  enablePermission: true,
  enableCache: true,
  enableDevice: true
})
```

**2.x:**
```typescript
const router = createLDesignRouter({
  routes,
  history: 'web',
  base: '/app/',

  // 功能配置集中
  permission: {
    enabled: true,
    mode: 'role'
  },
  cache: {
    enabled: true,
    strategy: 'lru'
  },
  device: {
    enabled: true
  }
})
```

2. **API 重命名**

**1.x:**
```typescript
// 旧 API
router.checkPermission(route)
router.getCacheInfo()
router.getDeviceType()
```

**2.x:**
```typescript
// 新 API
router.permissionManager.checkPermission(route)
router.cacheManager.getCacheStats()
router.deviceRouter.getDeviceInfo()
```

3. **组合式 API 变更**

**1.x:**
```typescript
import { usePermission, useRouterCache } from '@ldesign/router'

const { hasRole } = usePermission()
const { cacheStats } = useRouterCache()
```

**2.x:**
```typescript
import { useCache, usePermissions } from '@ldesign/router'

const { hasRole } = usePermissions() // 复数形式
const { getCacheStats } = useCache() // 方法调用
```

#### 迁移步骤

1. **更新依赖**

```bash
npm uninstall @ldesign/router@1.x
npm install @ldesign/router@2.x
```

2. **更新配置**

使用迁移脚本自动转换配置：

```typescript
// migration-helper.ts
export function migrateConfig(oldConfig: any) {
  const newConfig: any = {
    routes: oldConfig.routes,
    history: oldConfig.mode === 'history' ? 'web' : 'hash',
    base: oldConfig.base
  }

  if (oldConfig.enablePermission) {
    newConfig.permission = {
      enabled: true,
      mode: oldConfig.permissionMode || 'role'
    }
  }

  if (oldConfig.enableCache) {
    newConfig.cache = {
      enabled: true,
      strategy: oldConfig.cacheStrategy || 'lru'
    }
  }

  if (oldConfig.enableDevice) {
    newConfig.device = {
      enabled: true
    }
  }

  return newConfig
}
```

3. **更新代码**

使用 codemod 脚本批量更新：

```bash
# 安装 codemod 工具
npm install -g @ldesign/router-codemod

# 运行迁移
ldesign-router-codemod v1-to-v2 src/
```

或手动更新：

```typescript
// 查找并替换
// usePermission → usePermissions
// useRouterCache → useCache
// router.checkPermission → router.permissionManager.checkPermission
// router.getCacheInfo → router.cacheManager.getCacheStats
```

### 从 2.x 升级到 3.x

#### 新增功能

1. **TypeScript 严格模式支持**
2. **性能优化**
3. **新的开发工具**
4. **增强的设备适配**

#### 向后兼容

3.x 版本完全向后兼容 2.x，可以直接升级：

```bash
npm update @ldesign/router
```

#### 推荐的新功能采用

```typescript
// 启用新的开发工具
const router = createLDesignRouter({
  routes,
  devtools: {
    enabled: process.env.NODE_ENV === 'development',
    performance: true,
    inspector: true
  }
})

// 使用新的设备适配 API
const { deviceInfo, orientation } = useDevice()
```

## 迁移工具

### 自动迁移脚本

```typescript
// migrate.ts
import fs from 'node:fs'
import path from 'node:path'

class RouterMigrator {
  private replacements = [
    [/usePermission/g, 'usePermissions'],
    [/useRouterCache/g, 'useCache'],
    [/router\.checkPermission/g, 'router.permissionManager.checkPermission'],
    [/router\.getCacheInfo/g, 'router.cacheManager.getCacheStats']
  ]

  migrateFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf-8')

    this.replacements.forEach(([pattern, replacement]) => {
      content = content.replace(pattern, replacement)
    })

    fs.writeFileSync(filePath, content)
    console.log(`已迁移: ${filePath}`)
  }

  migrateDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        this.migrateDirectory(fullPath)
      }
 else if (file.endsWith('.vue') || file.endsWith('.ts')) {
        this.migrateFile(fullPath)
      }
    })
  }
}

// 使用
const migrator = new RouterMigrator()
migrator.migrateDirectory('./src')
```

### 配置验证工具

```typescript
// config-validator.ts
export function validateConfig(config: any): string[] {
  const errors: string[] = []

  // 检查必需字段
  if (!config.routes) {
    errors.push('缺少 routes 配置')
  }

  // 检查废弃的配置
  if (config.mode) {
    errors.push('mode 已废弃，请使用 history')
  }

  if (config.enablePermission) {
    errors.push('enablePermission 已废弃，请使用 permission.enabled')
  }

  // 检查配置格式
  if (config.permission && typeof config.permission !== 'object') {
    errors.push('permission 配置必须是对象')
  }

  return errors
}

// 使用
const errors = validateConfig(routerConfig)
if (errors.length > 0) {
  console.error('配置错误:', errors)
}
```

## 迁移检查清单

### 迁移前准备

- [ ] 备份现有代码
- [ ] 阅读版本更新日志
- [ ] 检查依赖兼容性
- [ ] 准备测试环境

### 迁移过程

- [ ] 更新依赖版本
- [ ] 更新路由配置
- [ ] 更新 API 调用
- [ ] 更新类型定义
- [ ] 运行迁移脚本

### 迁移后验证

- [ ] 运行所有测试
- [ ] 检查 TypeScript 类型错误
- [ ] 验证路由功能
- [ ] 验证权限系统
- [ ] 验证缓存功能
- [ ] 验证设备适配
- [ ] 性能测试

### 常见迁移问题

1. **类型错误**
   - 更新 TypeScript 类型定义
   - 检查泛型参数

2. **运行时错误**
   - 检查 API 调用
   - 验证配置格式

3. **功能异常**
   - 检查路由配置
   - 验证守卫逻辑

4. **性能问题**
   - 检查缓存配置
   - 优化组件加载

## 获取迁移帮助

如果在迁移过程中遇到问题：

1. **查看迁移文档**：详细阅读版本更新说明
2. **使用迁移工具**：利用自动化工具减少手动工作
3. **社区支持**：在 GitHub Discussions 中寻求帮助
4. **专业支持**：联系技术支持团队

### 提交迁移问题时请包含：

- 源版本和目标版本
- 详细的错误信息
- 相关配置代码
- 迁移步骤记录
- 环境信息

这样可以帮助我们更快地协助您完成迁移。
