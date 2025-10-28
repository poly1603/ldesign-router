# 🚀 Router Examples - 使用 @ldesign/launcher

所有路由示例现在统一使用 `@ldesign/launcher` 进行管理，提供一致的开发体验。

## ✅ 完成状态

| 框架 | 示例路径 | 文件数 | 状态 |
|------|---------|--------|------|
| Vue 3 | `packages/vue/example/` | 15+ | ✅ 完成 |
| React | `packages/react/example/` | 16+ | ✅ 完成 |
| Svelte | `packages/svelte/example/` | 部分 | 🚧 进行中 |
| Solid.js | `packages/solid/example/` | 部分 | 🚧 进行中 |

## 使用 @ldesign/launcher 的优势

### 1. 统一的命令
所有框架使用相同的命令：

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 构建生产版本
pnpm preview  # 预览生产构建
```

### 2. 统一的配置
每个示例都有 `ldesign.launcher.config.ts` 配置文件：

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  framework: 'vue', // vue | react | svelte | solid
  plugins: [...],
  resolve: {
    alias: {...}
  }
})
```

### 3. 自动框架检测
Launcher 会根据配置自动应用框架特定的优化和插件。

## 快速开始

### Vue 3 Example

```bash
cd packages/router/packages/vue/example
pnpm install
pnpm dev
```

访问: http://localhost:5173

### React Example

```bash
cd packages/router/packages/react/example
pnpm install
pnpm dev
```

访问: http://localhost:5173

### Svelte Example

```bash
cd packages/router/packages/svelte/example
pnpm install
pnpm dev
```

访问: http://localhost:5173

### Solid.js Example

```bash
cd packages/router/packages/solid/example
pnpm install
pnpm dev
```

访问: http://localhost:5173

## 配置详解

### 框架特定配置

#### Vue
```typescript
export default defineConfig({
  framework: 'vue',
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/router-vue': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})
```

#### React
```typescript
export default defineConfig({
  framework: 'react',
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/router-react': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})
```

#### Svelte
```typescript
export default defineConfig({
  framework: 'svelte',
  plugins: [svelte()],
  resolve: {
    alias: {
      '@ldesign/router-svelte': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})
```

#### Solid.js
```typescript
export default defineConfig({
  framework: 'solid',
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '@ldesign/router-solid': resolve(__dirname, '../src'),
      '@ldesign/router-core': resolve(__dirname, '../../core/src'),
    },
  },
})
```

## 依赖说明

所有示例都依赖：

```json
{
  "devDependencies": {
    "@ldesign/launcher": "workspace:*",
    "@ldesign/router-{framework}": "workspace:*"
  }
}
```

## Package.json 脚本

所有示例使用相同的脚本：

```json
{
  "scripts": {
    "dev": "ldesign-launcher dev",
    "build": "ldesign-launcher build",
    "preview": "ldesign-launcher preview"
  }
}
```

## 功能特性

### 开发服务器
- 🔥 热模块替换 (HMR)
- ⚡ 快速启动
- 🔧 自动框架检测
- 📦 源码别名支持

### 生产构建
- 📦 代码分割
- 🗜️ 压缩优化
- 🎯 Tree-shaking
- 📊 构建分析

### 预览服务器
- 🌐 本地预览
- ⚡ 快速启动
- 🔒 生产环境模拟

## 目录结构

```
packages/router/packages/{framework}/example/
├── src/
│   ├── {pages|views}/        # 页面组件
│   │   ├── Home.*
│   │   ├── About.*
│   │   ├── User.*
│   │   ├── Dashboard.*
│   │   └── NotFound.*
│   ├── App.*                  # 根组件
│   ├── main.{ts|tsx}          # 入口文件
│   ├── router.ts              # 路由配置
│   └── style.css              # 全局样式
├── index.html                 # HTML 模板
├── package.json               # 依赖配置
├── ldesign.launcher.config.ts # Launcher 配置 ⭐
└── README.md                  # 说明文档
```

## 常见问题

### 如何修改端口？

在 `ldesign.launcher.config.ts` 中添加：

```typescript
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### 如何添加环境变量？

创建 `.env` 文件：

```
VITE_API_URL=http://localhost:3000
```

### 如何自定义构建输出？

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

## 迁移指南

### 从 Vite 迁移到 Launcher

1. **更新 package.json**

```diff
{
  "scripts": {
-   "dev": "vite",
+   "dev": "ldesign-launcher dev",
-   "build": "vite build",
+   "build": "ldesign-launcher build",
-   "preview": "vite preview"
+   "preview": "ldesign-launcher preview"
  },
  "devDependencies": {
+   "@ldesign/launcher": "workspace:*",
-   "vite": "^5.0.12"
  }
}
```

2. **创建 launcher 配置**

将 `vite.config.ts` 重命名或转换为 `ldesign.launcher.config.ts`

3. **安装依赖**

```bash
pnpm install
```

## 下一步

- [ ] 完成 Svelte 示例的所有页面组件
- [ ] 完成 Solid.js 示例的所有页面组件
- [ ] 添加更多高级示例
- [ ] 添加性能监控示例
- [ ] 添加 SSR 示例

## 相关文档

- [@ldesign/launcher 文档](../../tools/launcher/README.md)
- [Vite 文档](https://vitejs.dev/)
- [各框架路由文档](./README.md)

---

**最后更新**: 2025-10-28  
**维护者**: @ldesign Team


