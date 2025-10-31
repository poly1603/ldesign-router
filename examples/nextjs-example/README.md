# Next.js Router Example

这是 `@ldesign/router-nextjs` 的完整示例项目，展示了如何在 Next.js 15 应用中使用路由功能。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📂 项目结构

```
nextjs-example/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # 根布局
│   │   ├── page.tsx      # 首页
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── user/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── components/       # 可复用组件
│   └── styles/           # 样式文件
├── public/               # 静态资源
├── next.config.js
├── package.json
└── tsconfig.json
```

## ✨ 功能特性

- 🎯 **App Router**: 使用 Next.js 15 最新的 App Router
- 🔗 **动态路由**: 用户详情页 (`/user/[id]`)
- 🧭 **路由导航**: 集成 @ldesign/router 导航功能
- 📱 **响应式设计**: 移动端友好的界面
- ⚡ **服务端渲染**: Next.js 原生 SSR 支持
- 🎨 **现代 UI**: 美观的用户界面和交互

## 🔧 核心用法

### 1. App Router 结构

Next.js 15 使用 App Router，路由基于文件系统：

```
app/
├── page.tsx           → /
├── about/
│   └── page.tsx       → /about
└── user/
    └── [id]/
        └── page.tsx   → /user/:id
```

### 2. 路由导航

```typescript
import { useRouter } from '@ldesign/router-nextjs'

export default function Component() {
  const router = useRouter()
  
  const handleNavigate = () => {
    router.push('/about')
  }
  
  return <button onClick={handleNavigate}>Go to About</button>
}
```

### 3. 获取路由参数

```typescript
import { useParams } from 'next/navigation'

export default function UserPage() {
  const params = useParams()
  const userId = params.id
  
  return <div>User ID: {userId}</div>
}
```

### 4. RouterLink 组件

```typescript
import { RouterLink } from '@ldesign/router-nextjs'

<RouterLink href="/about">
  About Page
</RouterLink>
```

## 🌐 在线预览

开发服务器默认运行在: http://localhost:3004

## 📖 更多文档

查看 [@ldesign/router-nextjs](../../packages/nextjs/README.md) 的完整文档。

## 🎯 示例页面

### 首页 (/)
- 展示项目特性
- 快速导航按钮
- 页面访问统计

### 关于页 (/about)
- 项目介绍
- 核心特性列表
- 快速开始指南
- 当前路由信息

### 用户详情 (/user/[id])
- 动态路由参数展示
- 用户信息显示
- 实时时间
- 用户切换功能

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Next.js 15 发布说明](https://nextjs.org/blog/next-15)
- [@ldesign/router 文档](../../README.md)

## 📝 注意事项

- 本示例使用 Next.js 15 的 App Router
- 需要 Node.js 18.17 或更高版本
- 使用 React 18 Server Components

## 🐛 常见问题

### Q: 为什么要同时使用 Next.js Router 和 @ldesign/router？

A: @ldesign/router-nextjs 是对 Next.js 原生路由的增强，提供了统一的 API 和额外功能，同时保持 Next.js 的所有优势。

### Q: 如何在 Server Components 中使用路由？

A: Server Components 中使用 Next.js 原生的路由功能，Client Components 中可以使用 @ldesign/router 的增强功能。
