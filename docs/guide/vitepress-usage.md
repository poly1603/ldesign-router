# VitePress 使用指南

本指南将详细介绍如何使用和维护 `@ldesign/router` 的 VitePress 文档系统。

## 📚 文档结构

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress 配置文件
├── guide/                  # 使用指南
│   ├── getting-started.md  # 快速开始
│   ├── core-concepts.md    # 核心概念
│   ├── configuration.md    # 配置选项
│   ├── best-practices.md   # 最佳实践
│   ├── performance.md      # 性能优化
│   ├── debugging.md        # 调试技巧
│   ├── migration.md        # 迁移指南
│   ├── theme-migration.md  # 主题迁移
│   └── i18n-migration.md   # 国际化迁移
├── features/               # 功能特性
│   ├── guards.md          # 导航守卫
│   ├── permissions.md     # 权限管理
│   ├── caching.md         # 缓存管理
│   ├── breadcrumbs.md     # 面包屑导航
│   ├── tabs.md            # 标签页管理
│   ├── menu.md            # 菜单管理
│   ├── animations.md      # 路由动画
│   ├── device-routing.md  # 设备适配
│   └── dev-tools.md       # 开发工具
├── api/                   # API 参考
│   ├── router.md          # 路由器 API
│   ├── types.md           # 类型定义
│   ├── composables.md     # 组合式函数
│   └── managers.md        # 管理器 API
├── index.md               # 首页
├── changelog.md           # 更新日志
└── troubleshooting.md     # 故障排除
```

## 🚀 启动开发服务器

### 安装依赖

首先确保安装了文档相关的依赖：

```bash
# 在 router 包目录下
cd packages/router
pnpm install
```

### 启动文档服务器

```bash
# 启动 VitePress 开发服务器
pnpm docs:dev

# 或者使用 npm
npm run docs:dev
```

服务器启动后，访问 `http://localhost:5173` 查看文档。

### 构建文档

```bash
# 构建生产版本
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

## ✍️ 编写文档

### Markdown 语法

VitePress 支持标准的 Markdown 语法，以及一些扩展功能：

#### 代码块

```typescript
// TypeScript 代码示例
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

#### 代码组

::: code-group

```typescript [TypeScript]
import { createLDesignRouter } from '@ldesign/router'
```

```javascript [JavaScript]
const { createLDesignRouter } = require('@ldesign/router')
```

:::

#### 提示框

::: tip 提示
这是一个提示信息。
:::

::: warning 警告
这是一个警告信息。
:::

::: danger 危险
这是一个危险信息。
:::

::: info 信息
这是一个普通信息。
:::

#### 详情折叠

::: details 点击查看详细信息
这里是折叠的内容。
:::

### 文档元数据

每个文档文件都应该包含适当的元数据：

```markdown
---
title: 页面标题
description: 页面描述
---

# 页面标题

页面内容...
```

### 内部链接

使用相对路径链接到其他文档：

```markdown
[快速开始](/guide/getting-started)
[API 参考](/api/router)
[功能特性](/features/guards)
```

## 🎨 自定义配置

### 主题配置

在 `.vitepress/config.ts` 中配置主题：

```typescript
export default defineConfig({
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '功能', link: '/features/guards' },
      { text: 'API', link: '/api/router' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '核心概念', link: '/guide/core-concepts' }
          ]
        }
      ]
    }
  }
})
```

### 搜索配置

启用本地搜索：

```typescript
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件'
          }
        }
      }
    }
  }
})
```

## 📝 文档编写规范

### 标题层级

- 使用 `#` 作为页面主标题
- 使用 `##` 作为主要章节
- 使用 `###` 作为子章节
- 避免使用超过 4 级的标题

### 代码示例

- 提供完整的、可运行的代码示例
- 使用适当的语言标识符
- 添加必要的注释说明
- 展示常见的使用场景

### 链接和引用

- 使用相对路径链接内部文档
- 外部链接使用完整 URL
- 重要的概念添加链接到相关文档

### 图片和媒体

```markdown
![图片描述](./images/example.png)
```

图片文件放在 `docs/public/images/` 目录下。

## 🔧 维护指南

### 更新文档

1. **功能更新时**：同步更新相关的功能文档
2. **API 变更时**：更新 API 参考文档
3. **版本发布时**：更新更新日志

### 文档审查

定期审查文档内容：

- 检查链接是否有效
- 验证代码示例是否正确
- 确保信息是最新的
- 检查拼写和语法错误

### 性能优化

- 优化图片大小
- 减少不必要的依赖
- 使用代码分割
- 启用缓存

## 🚀 部署

### 自动部署

文档会通过 GitHub Actions 自动部署到 GitHub Pages：

```yaml
# .github/workflows/docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths: ['packages/router/docs/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: packages/router/docs/.vitepress/dist
```

### 手动部署

```bash
# 构建文档
pnpm docs:build

# 部署到服务器
scp -r docs/.vitepress/dist/* user@server:/path/to/docs/
```

## 🛠️ 故障排除

### 常见问题

#### 1. 文档服务器启动失败

```bash
# 清除缓存
rm -rf node_modules/.vite
rm -rf docs/.vitepress/cache

# 重新安装依赖
pnpm install
```

#### 2. 构建失败

检查以下问题：

- Markdown 语法错误
- 链接路径错误
- 图片文件缺失
- 配置文件语法错误

#### 3. 搜索功能异常

```bash
# 重新构建搜索索引
pnpm docs:build
```

### 调试技巧

1. **启用详细日志**：
   ```bash
   DEBUG=vitepress:* pnpm docs:dev
   ```

2. **检查配置**：
   验证 `.vitepress/config.ts` 配置是否正确

3. **清除缓存**：
   删除 `.vitepress/cache` 目录

## 📚 参考资源

- [VitePress 官方文档](https://vitepress.dev/)
- [Markdown 语法指南](https://www.markdownguide.org/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

通过遵循本指南，您可以高效地维护和更新 `@ldesign/router` 的文档系统，为用户提供优质的文档体验。
