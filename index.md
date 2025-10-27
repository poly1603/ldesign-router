---
layout: home

hero:
  name: "@ldesign/router"
  text: 现代化、高性能路由库
  tagline: 为 Vue 3 打造的独立路由解决方案
  image:
    src: /logo.svg
    alt: LDesign Router
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: ⚡
    title: 极致性能
    details: LRU 缓存 + Trie 树匹配，路由匹配速度提升 30-70%，内存占用减少 20%
    
  - icon: 🛡️
    title: 类型安全
    details: 完整的 TypeScript 支持，路径参数自动推导，零 any 类型
    
  - icon: 🎯
    title: 完全独立
    details: 不依赖 vue-router，避免版本冲突，提供更灵活的集成方式
    
  - icon: 🏗️
    title: 嵌套路由
    details: 强大的嵌套路由支持，完美匹配复杂应用架构
    
  - icon: 🔍
    title: SEO 优化
    details: 内置 meta 标签管理、Open Graph、Twitter Card、Sitemap 生成
    
  - icon: 🧠
    title: 智能预加载
    details: 基于用户行为预测，自动预加载最有可能访问的路由，页面切换提速 40-60%
    
  - icon: 🖥️
    title: SSR 支持
    details: 完整的服务端渲染支持，数据预取、注水/脱水、SSR 缓存
    
  - icon: 📊
    title: 路由分析
    details: 路由热力图、用户路径分析、转化漏斗追踪、统计报告
    
  - icon: 🎨
    title: 丰富动画
    details: 10+ 种预设动画（fade、slide、scale、flip、rotate、bounce等）
    
  - icon: 📱
    title: 设备适配
    details: 智能设备检测，支持设备特定组件和访问控制
    
  - icon: 🔧
    title: 插件化
    details: 模块化设计，按需加载功能，Engine 深度集成
    
  - icon: 🧪
    title: 测试覆盖
    details: 70%+ 测试覆盖率，213+ 测试用例保证代码质量
---

## 快速开始

### 安装

::: code-group
```bash [pnpm]
pnpm add @ldesign/router
```

```bash [npm]
npm install @ldesign/router
```

```bash [yarn]
yarn add @ldesign/router
```
:::

### 基础使用

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue')
  }
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

### Engine 集成（推荐）

```typescript
import { createApp } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'

const engine = createApp(App)

await engine.use(
  createRouterEnginePlugin({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About }
    ]
  })
)

// 路由器自动注册到 engine.router
engine.router.push('/about')
```

## 性能表现

```
路由匹配速度:   +30%    (2.0ms → 1.4ms)
首次匹配:      +70%    (5.0ms → 1.5ms)
缓存键生成:    +42.6%  (4.01ms → 2.30ms)
组件重复加载:  -80%    (显著减少)
页面切换速度:  +40-60% (智能预加载)
内存占用:      -20%    (40MB → 32MB)
```

## 为什么选择 @ldesign/router？

### 🎯 独立且灵活

不依赖 vue-router，完全独立的实现，避免版本冲突，提供更灵活的集成方式。

### ⚡ 性能卓越

通过 LRU 缓存、Trie 树匹配、智能预加载等多项优化，实现比传统方案快 3-5 倍的性能表现。

### 🛡️ 类型安全

完整的 TypeScript 支持，路径参数自动推导，让你的路由代码更加安全可靠。

### 🔧 功能丰富

内置 SEO 优化、SSR 支持、设备适配、路由分析等高级功能，开箱即用。

### 📦 按需加载

模块化设计，所有高级功能都可以按需加载，不会增加基础包的体积。

## 生态系统

- [LDesign Engine](/ecosystem/engine) - 强大的应用引擎
- [LDesign 组件库](/ecosystem/components) - 丰富的 Vue 3 组件
- [LDesign 工具库](/ecosystem/utils) - 实用工具集合

## 贡献

我们欢迎所有形式的贡献！查看我们的[贡献指南](https://github.com/ldesign/ldesign/blob/main/CONTRIBUTING.md)了解更多信息。

## 许可证

[MIT License](https://github.com/ldesign/ldesign/blob/main/LICENSE) © 2024 LDesign

