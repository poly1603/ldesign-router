# 安装

## 环境要求

在安装 @ldesign/router 之前，请确保你的开发环境满足以下要求：

- **Node.js** >= 16.0.0
- **Vue** >= 3.3.0
- **TypeScript** >= 5.0.0 (可选，但强烈推荐)

## 包管理器安装

### pnpm（推荐）

```bash
pnpm add @ldesign/router
```

### npm

```bash
npm install @ldesign/router
```

### yarn

```bash
yarn add @ldesign/router
```

## CDN 使用

你也可以通过 CDN 直接在浏览器中使用 @ldesign/router：

### unpkg

```html
<script src="https://unpkg.com/@ldesign/router@latest"></script>
```

### jsdelivr

```html
<script src="https://cdn.jsdelivr.net/npm/@ldesign/router@latest"></script>
```

### 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>@ldesign/router CDN 示例</title>
</head>
<body>
  <div id="app">
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
    <router-view></router-view>
  </div>

  <script src="https://unpkg.com/vue@3"></script>
  <script src="https://unpkg.com/@ldesign/router@latest"></script>
  
  <script>
    const { createApp } = Vue
    const { createRouter, createWebHashHistory } = LDesignRouter

    const routes = [
      { path: '/', component: { template: '<h1>首页</h1>' } },
      { path: '/about', component: { template: '<h1>关于</h1>' } }
    ]

    const router = createRouter({
      history: createWebHashHistory(),
      routes
    })

    const app = createApp({})
    app.use(router)
    app.mount('#app')
  </script>
</body>
</html>
```

## 依赖说明

@ldesign/router 的依赖关系：

### 核心依赖

这些包会自动安装：

- `mitt` - 事件发射器，用于路由事件
- `nanoid` - 生成唯一 ID

### 对等依赖

这些包需要你手动安装：

- `vue` ^3.3.0 - Vue 3
- `@ldesign/device` ^1.0.0 - 设备检测（如果使用设备适配功能）
- `@ldesign/engine` ^1.0.0 - LDesign Engine（可选，如果使用 Engine 集成）

### 安装所有依赖

如果你要使用完整功能，可以一次性安装所有依赖：

::: code-group
```bash [pnpm]
pnpm add @ldesign/router @ldesign/device @ldesign/engine vue
```

```bash [npm]
npm install @ldesign/router @ldesign/device @ldesign/engine vue
```

```bash [yarn]
yarn add @ldesign/router @ldesign/device @ldesign/engine vue
```
:::

## 开发依赖

如果你要进行开发或贡献代码，还需要安装开发依赖：

```bash
pnpm add -D @ldesign/builder typescript vite vitest
```

## 验证安装

安装完成后，可以通过以下方式验证：

### 检查版本

```bash
npm list @ldesign/router
```

### 在代码中使用

```typescript
import { createRouter } from '@ldesign/router'

console.log(typeof createRouter) // 'function'
```

## TypeScript 配置

如果你使用 TypeScript，需要在 `tsconfig.json` 中添加类型声明：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/router"]
  }
}
```

### 类型导入

@ldesign/router 提供了完整的类型定义：

```typescript
import type {
  Router,
  RouteRecordRaw,
  RouteLocation,
  NavigationGuard
} from '@ldesign/router'
```

## Vite 配置

如果你使用 Vite，建议添加以下配置：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

## Webpack 配置

如果你使用 Webpack，建议添加以下配置：

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

## 按需导入

@ldesign/router 支持按需导入，可以减小打包体积：

```typescript
// 只导入核心功能
import { createRouter, createWebHistory } from '@ldesign/router'

// 按需导入高级功能
import { createPerformancePlugin } from '@ldesign/router/plugins/performance'
import { createSEOPlugin } from '@ldesign/router/features/seo'
import { useSSRData } from '@ldesign/router/ssr'
```

### 树摇优化

@ldesign/router 完全支持树摇（Tree Shaking），未使用的代码会在打包时自动移除：

```typescript
// 只会打包 createRouter 和 createWebHistory
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: []
})
```

## 浏览器支持

@ldesign/router 支持以下浏览器：

| 浏览器 | 最低版本 |
|--------|---------|
| Chrome | 64+ |
| Firefox | 67+ |
| Safari | 12+ |
| Edge | 79+ |

::: warning IE 11
@ldesign/router 不支持 IE 11。如果你需要支持 IE 11，请考虑使用 vue-router 或添加相应的 polyfill。
:::

## 升级指南

### 从 vue-router 迁移

如果你从 vue-router 迁移到 @ldesign/router，可以参考以下步骤：

1. **安装 @ldesign/router**
   ```bash
   pnpm add @ldesign/router
   pnpm remove vue-router
   ```

2. **更新导入**
   ```typescript
   // 之前
   import { createRouter } from 'vue-router'
   
   // 现在
   import { createRouter } from '@ldesign/router'
   ```

3. **更新路由配置**（大部分配置保持兼容）
   ```typescript
   // 配置基本相同
   const router = createRouter({
     history: createWebHistory(),
     routes: [...]
   })
   ```

4. **检查不兼容的功能**
   - 某些 vue-router 特有的功能可能不可用
   - 查看[迁移指南](/guide/migration)了解详情

### 更新到最新版本

检查并更新到最新版本：

```bash
# 检查可用的更新
pnpm outdated @ldesign/router

# 更新到最新版本
pnpm update @ldesign/router
```

## 常见问题

### 找不到模块

如果遇到"找不到模块"错误：

```
Error: Cannot find module '@ldesign/router'
```

**解决方案：**

1. 确认已经安装了包：`pnpm list @ldesign/router`
2. 删除 `node_modules` 并重新安装：
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```
3. 检查 `package.json` 中是否包含 `@ldesign/router`

### 类型定义错误

如果遇到类型定义错误：

```
Could not find a declaration file for module '@ldesign/router'
```

**解决方案：**

1. 确认 TypeScript 版本 >= 5.0.0
2. 检查 `tsconfig.json` 配置
3. 重新安装包：`pnpm add @ldesign/router`

### 版本冲突

如果遇到版本冲突：

**解决方案：**

1. 使用 `pnpm` 的 `overrides` 功能：
   ```json
   {
     "pnpm": {
       "overrides": {
         "vue": "^3.4.0"
       }
     }
   }
   ```

2. 或使用 `npm` 的 `resolutions` 功能：
   ```json
   {
     "resolutions": {
       "vue": "^3.4.0"
     }
   }
   ```

## 下一步

安装完成后，继续学习：

- [快速开始](/guide/getting-started) - 学习如何使用
- [路由配置](/guide/route-configuration) - 了解路由配置
- [示例](/examples/basic) - 查看实际应用示例

