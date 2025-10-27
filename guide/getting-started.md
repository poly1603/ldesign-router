# 快速开始

本指南将帮助你快速上手 @ldesign/router。

## 安装

### 使用包管理器

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

### CDN

你也可以通过 CDN 直接使用：

```html
<script src="https://unpkg.com/@ldesign/router@latest"></script>
```

## 基础使用

### 1. 创建路由器

首先，创建一个路由器实例：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./views/About.vue'),
    meta: { title: '关于我们' }
  }
]

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(),
  routes
})
```

### 2. 安装路由器

在 Vue 应用中安装路由器：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 安装路由器
app.use(router)

app.mount('#app')
```

### 3. 使用路由组件

在你的应用中使用 `RouterView` 和 `RouterLink` 组件：

```vue
<template>
  <div id="app">
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
    </nav>
    
    <!-- 路由出口 - 匹配的组件会在这里渲染 -->
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from '@ldesign/router'
</script>
```

## Engine 集成（推荐）

如果你使用 LDesign Engine，可以使用更简洁的集成方式：

```typescript
import { createApp } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import App from './App.vue'

// 创建应用
const engine = createApp(App)

// 使用路由插件
await engine.use(
  createRouterEnginePlugin({
    routes: [
      { path: '/', component: () => import('./views/Home.vue') },
      { path: '/about', component: () => import('./views/About.vue') }
    ],
    mode: 'history',
    base: '/'
  })
)

// 路由器会自动注册到 engine.router
console.log(engine.router) // Router 实例

// 挂载应用
engine.mount('#app')
```

### Engine 集成的优势

1. **自动配置** - 无需手动调用 `app.use(router)`
2. **统一管理** - 路由器作为 engine 的一部分统一管理
3. **状态同步** - 路由状态自动同步到 engine 状态系统
4. **日志集成** - 路由操作自动记录到 engine 日志系统
5. **插件生态** - 更好地与其他 engine 插件协作

## 历史模式

@ldesign/router 提供了三种历史模式：

### HTML5 History 模式（推荐）

使用 HTML5 History API，URL 看起来更加美观：

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// URL: https://example.com/about
```

::: warning 服务器配置
使用 History 模式需要服务器配置支持。如果用户直接访问 `https://example.com/about`，服务器需要返回 `index.html`，否则会出现 404 错误。

**Nginx 配置示例：**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache 配置示例：**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
:::

### Hash 模式

使用 URL 的 hash 部分，无需服务器配置：

```typescript
import { createRouter, createWebHashHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// URL: https://example.com/#/about
```

### Memory 模式

不会修改 URL，适用于非浏览器环境（如 Node.js）：

```typescript
import { createRouter, createMemoryHistory } from '@ldesign/router'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})
```

## 基础路径

如果你的应用部署在子路径下，可以设置 `base` 选项：

```typescript
const router = createRouter({
  history: createWebHistory('/my-app/'),
  routes
})

// URL: https://example.com/my-app/about
```

## 编程式导航

除了使用 `RouterLink` 组件，还可以使用编程式导航：

```typescript
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 字符串路径
router.push('/about')

// 对象形式
router.push({ path: '/about' })

// 命名路由
router.push({ name: 'about' })

// 带参数
router.push({ name: 'user', params: { id: 123 } })

// 带查询参数
router.push({ path: '/search', query: { q: 'vue' } })

// 带哈希
router.push({ path: '/about', hash: '#team' })
```

## 访问当前路由

使用 `useRoute()` 获取当前路由信息：

```typescript
import { useRoute } from '@ldesign/router'

const route = useRoute()

console.log(route.path)        // 当前路径
console.log(route.name)        // 路由名称
console.log(route.params)      // 路由参数
console.log(route.query)       // 查询参数
console.log(route.hash)        // 哈希值
console.log(route.meta)        // 路由元信息
console.log(route.matched)     // 匹配的路由记录
```

## 完整示例

这是一个完整的示例应用：

::: code-group
```typescript [main.ts]
import { createApp } from 'vue'
import { createRouter, createWebHistory } from '@ldesign/router'
import App from './App.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: '首页' }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { title: '关于我们' }
    }
  ]
})

// 全局前置守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'App'
  next()
})

// 创建并挂载应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

```vue [App.vue]
<template>
  <div id="app">
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
    </nav>
    
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from '@ldesign/router'
</script>

<style scoped>
nav {
  padding: 20px;
  background: #f0f0f0;
}

nav a {
  margin-right: 20px;
  text-decoration: none;
  color: #333;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

main {
  padding: 20px;
}
</style>
```

```vue [views/Home.vue]
<template>
  <div class="home">
    <h1>首页</h1>
    <p>欢迎使用 @ldesign/router</p>
  </div>
</template>
```

```vue [views/About.vue]
<template>
  <div class="about">
    <h1>关于我们</h1>
    <p>这是一个使用 @ldesign/router 构建的应用</p>
  </div>
</template>
```
:::

## 下一步

现在你已经了解了 @ldesign/router 的基础用法，可以继续学习：

- [路由配置](/guide/route-configuration) - 学习如何配置路由
- [导航](/guide/navigation) - 了解导航的各种方式
- [路由参数](/guide/route-params) - 学习如何使用动态路由参数
- [嵌套路由](/guide/nested-routes) - 构建多层级的路由结构
- [路由守卫](/guide/guards) - 控制路由的访问权限

## 故障排除

### 路由不工作

如果路由不工作，请检查：

1. 是否正确安装了路由器：`app.use(router)`
2. 是否在组件中使用了 `RouterView` 组件
3. 路由配置是否正确
4. 控制台是否有错误信息

### 404 错误（History 模式）

如果使用 History 模式出现 404 错误，请检查：

1. 服务器是否正确配置（参见上面的服务器配置示例）
2. 是否正确设置了 `base` 选项
3. 部署路径是否与配置匹配

### 组件不渲染

如果组件不渲染，请检查：

1. 组件是否正确导入
2. 组件路径是否正确
3. 是否有语法错误
4. 是否有路由守卫阻止了导航

