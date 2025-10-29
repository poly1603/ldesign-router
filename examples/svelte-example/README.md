# Svelte Router Example

这是 `@ldesign/router-sveltekit` 的完整示例项目，展示了如何在 Svelte 5 应用中使用路由功能。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📂 项目结构

```
svelte-example/
├── src/
│   ├── lib/
│   │   └── components/     # 可复用组件
│   ├── routes/             # 页面组件
│   │   ├── Home.svelte
│   │   ├── About.svelte
│   │   └── User.svelte
│   ├── App.svelte          # 根组件
│   ├── main.ts             # 入口文件
│   └── app.css             # 全局样式
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## ✨ 功能特性

- 🎯 **基础路由**: 首页、关于页
- 🔗 **动态路由**: 用户详情页 (`/user/:id`)
- 🧭 **路由导航**: 使用 `RouterLink` 组件
- 📱 **路由视图**: 使用 `RouterView` 组件
- ⚡ **编程式导航**: 使用 `useRouter` 和 `useRoute`
- 🎨 **Svelte 5 Runes**: 使用最新的 Svelte 5 响应式语法

## 🔧 核心用法

### 1. 创建路由器

```typescript
import { createRouter } from '@ldesign/router-sveltekit'
import Home from './routes/Home.svelte'
import About from './routes/About.svelte'

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User },
  ],
})
```

### 2. 使用路由组件

```svelte
<script lang="ts">
  import { RouterLink, RouterView } from '@ldesign/router-sveltekit'
</script>

<nav>
  <RouterLink to="/">首页</RouterLink>
  <RouterLink to="/about">关于</RouterLink>
</nav>

<main>
  <RouterView />
</main>
```

### 3. 编程式导航

```svelte
<script lang="ts">
  import { useRouter, useRoute } from '@ldesign/router-sveltekit'

  const router = useRouter()
  const route = useRoute()

  function goToUser() {
    router.push('/user/123')
  }
</script>
```

## 🌐 在线预览

开发服务器默认运行在: http://localhost:3003

## 📖 更多文档

查看 [@ldesign/router-sveltekit](../../packages/sveltekit/README.md) 的完整文档。
