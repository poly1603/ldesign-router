# Changelog

All notable changes to `@ldesign/router` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-XX

### 🎯 重大变更 (Breaking Changes)

#### 移除功能
- **移除 ThemeManager** - 主题管理功能已移至独立的 `@ldesign/color` 包
- **移除 I18nManager** - 国际化功能建议使用应用层解决方案（如 vue-i18n）
- **移除 PluginManager** - 简化架构，专注路由核心功能

#### API 变更
- `RouterOptions` 中移除 `themeManager` 和 `i18nManager` 配置项
- 组合式函数中移除 `useTheme()` 和 `useI18n()`
- 移除主题和国际化相关的类型定义

### ✨ 新增功能

#### 架构重构
- **新目录结构** - 重新组织代码结构，提高可维护性
  - `core/` - 核心路由功能
  - `managers/` - 功能管理器
  - `features/` - 特性功能
  - `composables/` - 组合式函数
  - `types/` - 类型定义

#### 增强功能
- **改进的权限管理** - 更灵活的权限检查机制
- **优化的缓存策略** - 支持多种缓存策略（LRU、FIFO、自定义）
- **增强的设备检测** - 更准确的设备类型识别
- **改进的开发工具** - 更强大的调试和监控功能

### 🔧 改进

#### 性能优化
- 减少包体积，移除非核心功能
- 优化路由匹配算法
- 改进内存管理

#### 开发体验
- 更清晰的 TypeScript 类型定义
- 简化的 API 设计
- 更好的错误提示

### 📚 文档更新
- 重写 README 文档
- 添加迁移指南
- 更新 API 参考文档

### 🔄 迁移指南

#### 主题管理迁移

**旧版本 (v1.x):**
```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  themeManager: {
    enabled: true,
    defaultTheme: 'dark'
  }
})

// 使用主题
import { useTheme } from '@ldesign/router'
const { setTheme } = useTheme()
```

**新版本 (v2.x):**
```typescript
import { createLDesignRouter } from '@ldesign/router'
import { createThemeManager } from '@ldesign/color'

const router = createLDesignRouter({ routes })
const themeManager = createThemeManager({
  defaultTheme: 'dark'
})

// 使用主题
import { useTheme } from '@ldesign/color'
const { setTheme } = useTheme()
```

#### 国际化迁移

**旧版本 (v1.x):**
```typescript
const router = createLDesignRouter({
  routes,
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN'
  }
})

import { useI18n } from '@ldesign/router'
const { t } = useI18n()
```

**新版本 (v2.x):**
```typescript
import { createI18n } from 'vue-i18n'

const router = createLDesignRouter({ routes })
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})

// 在 Vue 应用中使用
app.use(router)
app.use(i18n)
```

### 🐛 修复
- 修复路由匹配中的边界情况
- 修复缓存管理中的内存泄漏
- 修复设备检测的准确性问题

### 📦 依赖更新
- 更新 Vue 依赖到最新版本
- 移除不必要的依赖项
- 优化 peer dependencies

---

## [1.x.x] - 历史版本

### 功能特性
- 集成主题管理
- 集成国际化支持
- 基础路由功能
- 权限管理
- 缓存管理
- 面包屑导航
- 标签页管理

### 已知问题
- 包体积较大
- 功能耦合度高
- 配置复杂

---

## 升级建议

### 从 v1.x 升级到 v2.x

1. **评估依赖** - 检查是否使用了主题或国际化功能
2. **安装新依赖** - 根据需要安装 `@ldesign/color` 或配置 `vue-i18n`
3. **更新代码** - 按照迁移指南更新相关代码
4. **测试功能** - 确保所有功能正常工作
5. **性能验证** - 验证性能改进效果

### 兼容性说明

- **Vue 版本** - 要求 Vue 3.3+
- **TypeScript** - 要求 TypeScript 5.0+
- **浏览器支持** - 现代浏览器（ES2020+）

### 获取帮助

- [文档](https://ldesign.dev/guide/router)
- [GitHub Issues](https://github.com/poly1603/ldesign/issues)
- [讨论区](https://github.com/poly1603/ldesign/discussions)
