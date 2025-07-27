---
layout: home

hero:
  name: "@ldesign/router"
  text: "企业级路由管理器"
  tagline: "专注路由核心功能，提供强大而灵活的企业级路由解决方案"
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看功能
      link: /features/guards
    - theme: alt
      text: API 参考
      link: /api/router

features:
  - icon: 🧭
    title: 企业级路由管理
    details: 基于 Vue Router 的增强路由器，提供完整的路由配置、匹配和导航功能
  - icon: 🔐
    title: 权限控制
    details: 细粒度的路由权限管理，支持基于角色和权限的访问控制
  - icon: 📱
    title: 设备适配
    details: 智能设备检测和路由适配，为不同设备提供最佳的用户体验
  - icon: 💾
    title: 缓存管理
    details: 智能的页面缓存策略，支持 LRU、FIFO 等多种缓存算法
  - icon: 🍞
    title: 面包屑导航
    details: 自动生成面包屑导航，支持自定义配置和动态更新
  - icon: 📑
    title: 标签页管理
    details: 多标签页导航支持，包含拖拽排序、右键菜单等丰富功能
  - icon: 🎬
    title: 路由动画
    details: 丰富的页面切换动画，支持多种动画类型和自定义动画
  - icon: 🔧
    title: 开发工具
    details: 强大的调试和监控工具，帮助开发者快速定位和解决问题
  - icon: ⚡
    title: 高性能
    details: 优化的代码结构和运行时性能，确保最佳的用户体验
---

## 🎯 专注核心功能

在 v2.0 重构中，我们移除了主题管理和国际化功能，专注于路由管理的核心职责：

- **移除 ThemeManager** - 推荐使用独立的 `@ldesign/color` 包
- **移除 I18nManager** - 推荐使用标准的 `vue-i18n` 解决方案
- **简化 API 设计** - 更直观、更易用的配置选项

## 🚀 快速体验

```typescript
import { createApp } from 'vue'
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('./views/Admin.vue'),
      meta: {
        requiresAuth: true,
        roles: ['admin']
      }
    }
  ],
  permission: {
    enabled: true,
    checkRole: roles => userHasRole(roles)
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 📦 模块化架构

重构后的架构更加清晰和模块化：

```
@ldesign/router
├── core/           # 核心路由功能
├── managers/       # 功能管理器
├── features/       # 特性功能
├── composables/    # 组合式函数
└── types/          # 类型定义
```

## 🔄 从 v1.x 迁移

如果您正在使用 v1.x 版本，请查看我们的 [迁移指南](/guide/migration) 了解如何升级到 v2.x。

### 主题管理迁移

```typescript
// v1.x (旧版本)
import { createLDesignRouter, useTheme } from '@ldesign/router'

// v2.x (新版本)
import { createLDesignRouter } from '@ldesign/router'
import { createThemeManager, useTheme } from '@ldesign/color'
```

### 国际化迁移

```typescript
// v1.x (旧版本)
import { createLDesignRouter, useI18n } from '@ldesign/router'

// v2.x (新版本)
import { createLDesignRouter } from '@ldesign/router'
import { createI18n } from 'vue-i18n'
```

## 🌟 核心优势

- **专业化** - 专注路由管理，功能更加专业和强大
- **模块化** - 清晰的代码组织，易于维护和扩展
- **类型安全** - 完整的 TypeScript 支持
- **高性能** - 优化的运行时性能和更小的包体积
- **易于使用** - 简化的 API 和丰富的文档

## 📚 学习路径

1. **[快速开始](/guide/getting-started)** - 5分钟上手指南
2. **[核心概念](/guide/core-concepts)** - 理解路由管理的核心概念
3. **[功能指南](/features/guards)** - 深入了解各项功能
4. **[API 参考](/api/router)** - 完整的 API 文档
5. **[最佳实践](/guide/best-practices)** - 推荐的使用模式

## 🤝 社区支持

- [GitHub Issues](https://github.com/poly1603/ldesign/issues) - 报告问题和建议
- [GitHub Discussions](https://github.com/poly1603/ldesign/discussions) - 社区讨论
- [更新日志](/changelog) - 查看最新变更

---

<div style="text-align: center; margin-top: 2rem;">
  <p>Made with ❤️ by <a href="https://github.com/poly1603">LDesign Team</a></p>
</div>
