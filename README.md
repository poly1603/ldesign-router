# @ldesign/router

现代化的 Vue 3 企业级路由管理器，专注于路由核心功能。

## ✨ 特性

- 🧭 **企业级路由管理** - 基于 Vue Router 的增强路由器
- 🔐 **权限控制** - 细粒度的路由权限管理
- 📱 **设备适配** - 智能设备检测和路由适配
- 💾 **缓存管理** - 智能的页面缓存策略
- 🍞 **面包屑导航** - 自动生成面包屑导航
- 📑 **标签页管理** - 多标签页导航支持
- 🎬 **路由动画** - 丰富的页面切换动画
- 🔧 **开发工具** - 强大的调试和监控工具

## 📦 安装

```bash
pnpm add @ldesign/router
```

## 🚀 快速开始

### 基础用法

```typescript
import { createApp } from 'vue'
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 权限控制

```typescript
const router = createLDesignRouter({
  routes: [
    {
      path: '/admin',
      name: 'Admin',
      component: AdminView,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        permissions: ['admin:access']
      }
    }
  ],
  permission: {
    enabled: true,
    checkRole: roles => userHasRole(roles),
    checkPermission: permissions => userHasPermission(permissions)
  }
})
```

### 设备适配

```typescript
const router = createLDesignRouter({
  routes: [
    {
      path: '/product/:id',
      name: 'Product',
      components: {
        desktop: () => import('./views/ProductDesktop.vue'),
        mobile: () => import('./views/ProductMobile.vue')
      }
    }
  ],
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    }
  }
})
```

## 📚 API 参考

### createLDesignRouter(options)

创建路由器实例。

#### 参数

- `options.routes` - 路由配置数组
- `options.history` - 历史模式 ('hash' | 'history' | 'memory')
- `options.permission` - 权限管理配置
- `options.deviceRouter` - 设备路由配置
- `options.cache` - 缓存管理配置
- `options.breadcrumb` - 面包屑配置
- `options.tabs` - 标签页配置
- `options.animation` - 动画配置
- `options.menu` - 菜单配置

### 组合式函数

```typescript
import {
  useBreadcrumb,
  useDeviceRouter,
  usePermission,
  useRoute,
  useRouter,
  useTabs
} from '@ldesign/router'

// 在组件中使用
const router = useRouter()
const route = useRoute()
const { hasPermission } = usePermission()
const { breadcrumbs } = useBreadcrumb()
```

## 🔄 从旧版本迁移

### 主题管理迁移

**旧版本：**
```typescript
const router = createLDesignRouter({
  themeManager: { enabled: true }
})
```

**新版本：**
```typescript
// 使用独立的主题管理
import { createThemeManager } from '@ldesign/color'

const router = createLDesignRouter({ routes })
const themeManager = createThemeManager()
```

### 国际化迁移

**旧版本：**
```typescript
const router = createLDesignRouter({
  i18nManager: { enabled: true }
})
```

**新版本：**
```typescript
// 使用应用层的国际化
import { createI18n } from 'vue-i18n'

const router = createLDesignRouter({ routes })
const i18n = createI18n({ locale: 'zh-CN' })
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage
```

## 📄 许可证

[MIT License](../../LICENSE) © 2024 LDesign Team

## 🔗 相关链接

- [文档](https://ldesign.dev/guide/router)
- [API 参考](https://ldesign.dev/api/router)
- [示例](https://ldesign.dev/examples/router)
- [更新日志](./CHANGELOG.md)
