# @ldesign/router

多框架路由库，支持 Vue 3、React、Svelte、Solid.js 和 Angular，提供统一的 API 和增强的功能。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-green.svg)](https://github.com/ldesign/ldesign)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

## 📦 包结构

这是一个 monorepo 项目，包含六个独立的包：

- **[@ldesign/router-core](./packages/core)** - 框架无关的核心库（零依赖）
- **[@ldesign/router-vue](./packages/vue)** - Vue 3 路由库（基于 vue-router v4）
- **[@ldesign/router-react](./packages/react)** - React 路由库（基于 react-router-dom v6）
- **[@ldesign/router-svelte](./packages/svelte)** - Svelte 路由库
- **[@ldesign/router-solid](./packages/solid)** - Solid.js 路由库（基于 @solidjs/router）
- **[@ldesign/router-angular](./packages/angular)** - Angular 路由库

## 🎯 优化成果

本包已根据 [LDesign 包开发规范](../engine/LDESIGN_PACKAGE_STANDARDS.md) 进行了全面优化：

- ✅ **标准化配置** - 所有子包配置统一（vitest, eslint）
- ✅ **类型安全** - 移除所有 `any` 类型，完善类型定义
- ✅ **完整文档** - 所有工具函数有详细的 JSDoc 中文注释和示例
- ✅ **测试完备** - Core 包 237+ 测试用例，70%+ 覆盖率
- ✅ **性能优化** - Trie 树 + LRU 缓存，平均匹配时间 < 2ms

查看详细优化报告：[OPTIMIZATION_COMPLETED.md](./OPTIMIZATION_COMPLETED.md)

## 🚀 快速开始

### Vue 3

```bash
pnpm add @ldesign/router-vue vue-router
```

```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from '@ldesign/router-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/about', component: () => import('./views/About.vue') },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
```

### React

```bash
pnpm add @ldesign/router-react react-router-dom
```

```typescript
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@ldesign/router-react'

const router = createRouter({
  routes: [
    { path: '/', component: () => import('./pages/Home') },
    { path: '/about', component: () => import('./pages/About') },
  ],
})

const root = createRoot(document.getElementById('root')!)
root.render(<RouterProvider router={router} />)
```

### Svelte

```bash
pnpm add @ldesign/router-svelte
```

```svelte
<!-- src/App.svelte -->
<script>
  import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-svelte'
  import { createRouter, createWebHistory } from '@ldesign/router-svelte'
  import Home from './routes/Home.svelte'
  import About from './routes/About.svelte'
  
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About },
    ],
  })
</script>

<RouterProvider {router}>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>
  <RouterView />
</RouterProvider>
```

### Solid.js

```bash
pnpm add @ldesign/router-solid @solidjs/router
```

```tsx
// src/App.tsx
import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-solid'
import { createRouter, createWebHistory } from '@ldesign/router-solid'
import Home from './pages/Home'
import About from './pages/About'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
})

export default function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      <RouterView />
    </RouterProvider>
  )
}
```

## ✨ 特性

### 核心特性

- 🎯 **多框架支持** - 支持 Vue 3、React、Svelte、Solid.js 和 Angular，统一的 API
- 📦 **模块化设计** - 核心功能独立，框架封装分离
- 🔧 **TypeScript** - 完整的类型定义支持
- ⚡ **高性能** - 优化的路径匹配和参数解析
- 🛡️ **类型安全** - 完整的类型推导和检查
- 🎨 **响应式** - 利用各框架的响应式系统（Composition API、Hooks、Stores、Signals、RxJS）

### 统一的 API

所有框架版本提供高度一致的 API（根据各框架特性适配）：

```typescript
// Vue - Composition API
import { useRouter, useRoute, useParams } from '@ldesign/router-vue'
const router = useRouter()
const route = useRoute()
const params = useParams()

// React - Hooks
import { useRouter, useRoute, useParams } from '@ldesign/router-react'
const router = useRouter()
const route = useRoute()
const params = useParams()

// Svelte - Stores
import { getRouter, params, query } from '@ldesign/router-svelte'
const router = getRouter()
$params.id  // 使用 $ 前缀自动订阅

// Solid.js - Signals
import { useRouter, useParams, useQuery } from '@ldesign/router-solid'
const router = useRouter()
const paramsSignal = useParams()
paramsSignal().id  // 调用函数获取值
```

## 📚 文档

- [Core 包文档](./packages/core/README.md)
- [Vue 包文档](./packages/vue/README.md)
- [React 包文档](./packages/react/README.md)
- [Svelte 包文档](./packages/svelte/README.md)
- [Solid.js 包文档](./packages/solid/README.md)
- [Angular 包文档](./packages/angular/README.md)

## 🏗️ 架构设计

```
@ldesign/router (workspace)
├── @ldesign/router-core      # 框架无关核心
│   ├── 类型定义
│   ├── 工具函数
│   └── 历史管理
├── @ldesign/router-vue       # Vue 3 封装
│   ├── 基于 vue-router v4
│   ├── Vue 组件
│   └── Composables
├── @ldesign/router-react     # React 封装
│   ├── 基于 react-router-dom v6
│   ├── React 组件
│   └── Hooks
├── @ldesign/router-svelte    # Svelte 封装
│   ├── 基于 @ldesign/router-core
│   ├── Svelte 组件
│   └── Stores
└── @ldesign/router-solid     # Solid.js 封装
    ├── 基于 @solidjs/router
    ├── Solid 组件
    └── Signals/Hooks
```

### 设计原则

1. **框架无关的核心** - 将通用逻辑提取到 core 包
2. **框架特定封装** - 利用各框架官方路由库的成熟生态
3. **统一的 API** - 提供一致的使用体验
4. **按需加载** - 每个包独立发布，按需安装

## 🔄 API 对比

| 功能 | Core | Vue | React | Svelte | Solid.js | Angular |
|------|------|-----|-------|--------|----------|---------|
| 类型定义 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 工具函数 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 历史管理 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 路由器 | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| 组件 | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| 响应式 API | - | Composables | Hooks | Stores | Signals | RxJS |

## 📝 使用示例

### 路径处理

```typescript
import { normalizePath, joinPaths, buildPath } from '@ldesign/router-core'

normalizePath('/about/')                  // => '/about'
joinPaths('/api', 'users', '123')         // => '/api/users/123'
buildPath('/user/:id', { id: '123' })     // => '/user/123'
```

### 查询参数处理

```typescript
import { parseQuery, stringifyQuery } from '@ldesign/router-core'

parseQuery('page=1&sort=desc')            // => { page: '1', sort: 'desc' }
stringifyQuery({ page: '1', sort: 'desc' }) // => 'page=1&sort=desc'
```

### 历史管理

```typescript
import { createWebHistory } from '@ldesign/router-core'

const history = createWebHistory('/app/')

history.push({ path: '/about', query: 'page=1', hash: '' })
history.listen((to, from, info) => {
  console.log('导航:', from.path, '->', to.path)
})
```

## 🛠️ 开发

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm run build
```

### 构建单个包

```bash
pnpm run build:core   # 构建 core 包
pnpm run build:vue    # 构建 vue 包
pnpm run build:react  # 构建 react 包
pnpm run build:svelte # 构建 svelte 包
pnpm run build:solid  # 构建 solid 包
pnpm run build:angular # 构建 angular 包
```

### 类型检查

```bash
pnpm run type-check
```

### 代码检查

```bash
pnpm run lint
```

## 📦 发布的包

| 包名 | 版本 | 描述 |
|------|------|------|
| [@ldesign/router-core](https://www.npmjs.com/package/@ldesign/router-core) | - | 框架无关核心库 |
| [@ldesign/router-vue](https://www.npmjs.com/package/@ldesign/router-vue) | - | Vue 3 路由库 |
| [@ldesign/router-react](https://www.npmjs.com/package/@ldesign/router-react) | - | React 路由库 |
| [@ldesign/router-svelte](https://www.npmjs.com/package/@ldesign/router-svelte) | - | Svelte 路由库 |
| [@ldesign/router-solid](https://www.npmjs.com/package/@ldesign/router-solid) | - | Solid.js 路由库 |
| [@ldesign/router-angular](https://www.npmjs.com/package/@ldesign/router-angular) | - | Angular 路由库 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 🔗 相关链接

- [Vue Router](https://router.vuejs.org/)
- [React Router](https://reactrouter.com/)
- [Svelte](https://svelte.dev/)
- [Solid.js Router](https://github.com/solidjs/solid-router)
- [LDesign](https://github.com/ldesign/ldesign)
