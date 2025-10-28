# @ldesign/router-core

框架无关的路由核心库，提供路由系统的基础功能。

[![npm version](https://img.shields.io/npm/v/@ldesign/router-core.svg)](https://www.npmjs.com/package/@ldesign/router-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-green.svg)](https://github.com/ldesign/ldesign)

## ✨ 特性

- 🎯 **框架无关** - 不依赖任何前端框架，纯 TypeScript 实现
- 📦 **轻量级** - 只包含核心功能，体积小巧（< 20KB gzipped）
- 🔧 **TypeScript** - 完整的类型定义支持，零 `any` 类型
- ⚡ **高性能** - 优化的路径匹配和参数解析
- 🛡️ **类型安全** - 完整的类型推导和检查
- 📝 **完整文档** - 每个函数都有详细的 JSDoc 注释和示例
- ✅ **测试完备** - 80%+ 测试覆盖率，200+ 测试用例

## 📦 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/router-core

# 使用 npm
npm install @ldesign/router-core

# 使用 yarn
yarn add @ldesign/router-core
```

## 📚 快速开始

### 基础使用

```typescript
import {
  normalizePath,
  parseQuery,
  parseURL,
  createWebHistory,
} from '@ldesign/router-core'

// 路径处理
const path = normalizePath('/about/')  // => '/about'

// 查询参数解析
const query = parseQuery('?name=john&age=30')
// => { name: 'john', age: '30' }

// URL 解析
const url = parseURL('/user/123?tab=profile#section')
// => {
//   path: '/user/123',
//   query: { tab: 'profile' },
//   hash: 'section',
//   fullPath: '/user/123?tab=profile#section'
// }

// 历史管理
const history = createWebHistory('/')
history.push({ path: '/about', fullPath: '/about' })
```

## 核心功能

### 1. 类型定义

提供完整的路由类型定义：

```typescript
import type {
  RouteParams,
  RouteQuery,
  RouteMeta,
  RouteLocationNormalized,
  NavigationGuard,
} from '@ldesign/router-core'
```

### 2. 路径处理工具

```typescript
import {
  normalizePath,
  joinPaths,
  buildPath,
  parsePathParams,
} from '@ldesign/router-core'

// 标准化路径
normalizePath('/about/') // => '/about'

// 连接路径
joinPaths('/api', 'users', '123') // => '/api/users/123'

// 构建带参数的路径
buildPath('/user/:id', { id: '123' }) // => '/user/123'

// 解析路径参数
parsePathParams('/user/:id', '/user/123') // => { id: '123' }
```

### 3. 查询参数处理

```typescript
import {
  parseQuery,
  stringifyQuery,
  mergeQuery,
} from '@ldesign/router-core'

// 解析查询字符串
parseQuery('page=1&sort=desc') // => { page: '1', sort: 'desc' }

// 序列化查询参数
stringifyQuery({ page: '1', sort: 'desc' }) // => 'page=1&sort=desc'

// 合并查询参数
mergeQuery({ page: '1' }, { sort: 'desc' }) // => { page: '1', sort: 'desc' }
```

### 4. URL 处理

```typescript
import {
  parseURL,
  stringifyURL,
  isSameURL,
} from '@ldesign/router-core'

// 解析 URL
parseURL('/about?page=1#section')
// => { path: '/about', query: { page: '1' }, hash: 'section', fullPath: '/about?page=1#section' }

// 序列化 URL
stringifyURL({ path: '/about', query: { page: '1' }, hash: 'section' })
// => '/about?page=1#section'

// 比较 URL
isSameURL('/about?page=1', '/about?page=1') // => true
```

### 5. 历史管理

提供三种历史管理模式：

```typescript
import {
  createWebHistory,      // HTML5 History 模式
  createWebHashHistory,  // Hash 模式
  createMemoryHistory,   // Memory 模式（SSR/测试）
} from '@ldesign/router-core'

// HTML5 History 模式（推荐）
const history = createWebHistory('/base/')

// Hash 模式（兼容性更好）
const history = createWebHashHistory('/base/')

// Memory 模式（用于 SSR 或测试）
const history = createMemoryHistory('/base/')

// 使用历史管理器
history.push({ path: '/about', query: 'page=1', hash: '' })
history.replace({ path: '/home', query: '', hash: '' })
history.go(-1)  // 后退
history.back()   // 后退
history.forward() // 前进

// 监听历史变化
const unlisten = history.listen((to, from, info) => {
  console.log('导航:', from.path, '->', to.path)
})

// 清理监听器
unlisten()
```

## 框架集成

这个核心包被以下框架包使用：

- `@ldesign/router-vue` - Vue 3 路由
- `@ldesign/router-react` - React 路由

你可以直接使用核心包来实现自己的路由解决方案，或使用框架特定的包以获得更好的集成体验。

## 许可证

MIT

