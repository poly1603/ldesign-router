# @ldesign/router 文档系统使用指南

本文档详细说明了 `@ldesign/router` 项目的文档系统使用方法和维护指南。

## 📁 项目清理总结

### 已清理的文件

在项目维护过程中，我们清理了以下冗余和无用的文件：

#### 重复的管理器文件
- `src/animation-manager.ts` (已移至 `src/managers/`)
- `src/breadcrumb-manager.ts` (已移至 `src/managers/`)
- `src/cache-manager.ts` (已移至 `src/managers/`)
- `src/device-router.ts` (已移至 `src/core/`)
- `src/guard-manager.ts` (已移至 `src/managers/`)
- `src/menu-manager.ts` (已移至 `src/managers/`)
- `src/permission-manager.ts` (已移至 `src/managers/`)
- `src/tabs-manager.ts` (已移至 `src/managers/`)

#### 重复的核心文件
- `src/create-router.ts` (已移至 `src/core/`)
- `src/router.ts` (已移至 `src/core/`)
- `src/dev-tools.ts` (已移至 `src/features/`)

#### 文档和配置文件
- `README copy.md` (重复的README文件)
- `REFACTOR_PLAN.md` (重构计划文档)
- `REFACTOR_SUMMARY.md` (重构总结文档)

#### 测试和构建文件
- `build-test.mjs` (临时测试文件)
- `test-build.js` (临时测试文件)

#### 已移除的功能模块
- `src/i18n-manager.ts` (国际化管理器，已在v2.0中移除)
- `src/theme-manager.ts` (主题管理器，已在v2.0中移除)
- `src/plugin-manager.ts` (插件管理器，已在v2.0中移除)

### 当前项目结构

```
packages/router/
├── src/
│   ├── core/                  # 核心功能
│   │   ├── create-router.ts
│   │   ├── router.ts
│   │   └── device-router.ts
│   ├── managers/              # 功能管理器
│   │   ├── animation-manager.ts
│   │   ├── breadcrumb-manager.ts
│   │   ├── cache-manager.ts
│   │   ├── guard-manager.ts
│   │   ├── menu-manager.ts
│   │   ├── permission-manager.ts
│   │   └── tabs-manager.ts
│   ├── features/              # 特性功能
│   │   └── dev-tools.ts
│   ├── components/            # Vue 组件
│   ├── composables/           # 组合式函数
│   ├── types/                 # 类型定义
│   └── index.ts              # 主入口文件
├── docs/                      # VitePress 文档
│   ├── .vitepress/
│   │   └── config.mjs        # VitePress 配置
│   ├── guide/                # 使用指南
│   ├── features/             # 功能文档
│   ├── api/                  # API 参考
│   └── index.md             # 首页
├── example/                  # 示例应用
├── __tests__/               # 测试文件
└── package.json             # 包配置
```

## 📚 VitePress 文档系统

### 启动文档服务器

```bash
# 进入 router 包目录
cd packages/router

# 启动开发服务器
pnpm docs:dev

# 访问地址：http://localhost:5175/
```

### 构建文档

```bash
# 构建生产版本
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

### 文档结构说明

#### 配置文件
- `.vitepress/config.mjs` - VitePress 主配置文件（使用 ES 模块格式）

#### 文档目录
- `guide/` - 使用指南
  - `getting-started.md` - 快速开始
  - `core-concepts.md` - 核心概念
  - `configuration.md` - 配置选项
  - `vitepress-usage.md` - VitePress 使用指南
  - `best-practices.md` - 最佳实践
  - `performance.md` - 性能优化
  - `debugging.md` - 调试技巧
  - `migration.md` - 迁移指南
  - `theme-migration.md` - 主题迁移
  - `i18n-migration.md` - 国际化迁移

- `features/` - 功能特性
  - `guards.md` - 导航守卫
  - `permissions.md` - 权限管理
  - `caching.md` - 缓存管理
  - `breadcrumbs.md` - 面包屑导航
  - `tabs.md` - 标签页管理
  - `menu.md` - 菜单管理
  - `animations.md` - 路由动画
  - `device-routing.md` - 设备适配
  - `dev-tools.md` - 开发工具

- `api/` - API 参考
  - `router.md` - 路由器 API
  - `types.md` - 类型定义
  - `composables.md` - 组合式函数
  - `managers.md` - 管理器 API

### 配置文件说明

由于 VitePress 的 ESM 模块兼容性问题，我们使用了 `.mjs` 扩展名的配置文件：

```javascript
// .vitepress/config.mjs
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/router',
  description: '现代化的 Vue 3 企业级路由管理器',

  themeConfig: {
    nav: [...],
    sidebar: {...},
    socialLinks: [...]
  }
})
```

## 🛠️ 维护指南

### 添加新文档

1. 在相应目录下创建 `.md` 文件
2. 在 `.vitepress/config.mjs` 中添加导航链接
3. 重启开发服务器查看效果

### 更新文档内容

1. 直接编辑 Markdown 文件
2. VitePress 支持热重载，保存后自动更新

### 故障排除

#### 文档服务器启动失败

1. 检查 Node.js 版本（需要 >= 18.0.0）
2. 清除缓存：`rm -rf node_modules/.vite`
3. 重新安装依赖：`pnpm install`
4. 检查配置文件语法

#### ESM 模块问题

如果遇到 ESM 模块加载问题：

1. 确保使用 `.mjs` 扩展名
2. 使用 ES 模块语法（`import/export`）
3. 避免使用 CommonJS 语法（`require/module.exports`）

#### 端口冲突

VitePress 会自动寻找可用端口：
- 默认端口：5173
- 如果被占用，会自动使用下一个可用端口（如 5175）

## 📝 编写规范

### Markdown 语法

- 使用标准 Markdown 语法
- 支持 VitePress 扩展语法（代码组、提示框等）
- 添加适当的元数据（title、description）

### 代码示例

```typescript
// 提供完整的、可运行的代码示例
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
```

### 链接规范

- 内部链接使用相对路径：`[快速开始](/guide/getting-started)`
- 外部链接使用完整 URL：`[GitHub](https://github.com/poly1603/ldesign)`

## 🚀 部署

### 自动部署

文档通过 GitHub Actions 自动部署到 GitHub Pages。

### 手动部署

```bash
# 构建文档
pnpm docs:build

# 部署文件位于
# docs/.vitepress/dist/
```

## 📊 项目状态

- ✅ 项目文件清理完成
- ✅ VitePress 文档系统配置完成
- ✅ 文档服务器正常运行
- ✅ 完整的文档结构建立
- ✅ VitePress 使用指南编写完成

## 🔗 相关链接

- [VitePress 官方文档](https://vitepress.dev/)
- [项目 GitHub 仓库](https://github.com/poly1603/ldesign)
- [文档预览地址](http://localhost:5175/)

---

通过以上清理和文档系统的建立，`@ldesign/router` 项目现在拥有了清晰的代码结构和完善的文档系统，为开发者提供了良好的使用体验。
