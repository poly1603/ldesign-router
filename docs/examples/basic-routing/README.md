# 基础路由示例

这个示例展示了 `@ldesign/router` 的基础路由功能，包括路由配置、页面导航和基本的路由守卫。

## 功能特性

- ✅ 基础路由配置
- ✅ 页面导航
- ✅ 路由参数
- ✅ 嵌套路由
- ✅ 路由守卫
- ✅ 404 页面处理

## 项目结构

```
basic-routing/
├── src/
│   ├── components/
│   │   ├── Navigation.vue     # 导航组件
│   │   └── Layout.vue         # 布局组件
│   ├── views/
│   │   ├── Home.vue           # 首页
│   │   ├── About.vue          # 关于页面
│   │   ├── Contact.vue        # 联系页面
│   │   ├── User.vue           # 用户页面
│   │   ├── UserProfile.vue    # 用户资料
│   │   ├── UserPosts.vue      # 用户文章
│   │   └── NotFound.vue       # 404 页面
│   ├── router/
│   │   └── index.ts           # 路由配置
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── package.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 安装依赖

```bash
cd basic-routing
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 代码示例

### 路由配置

```typescript
// src/router/index.ts
import { createLDesignRouter } from '@ldesign/router'
import Layout from '@/components/Layout.vue'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import User from '@/views/User.vue'
import UserProfile from '@/views/UserProfile.vue'
import UserPosts from '@/views/UserPosts.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: {
          title: '首页'
        }
      },
      {
        path: 'about',
        name: 'About',
        component: About,
        meta: {
          title: '关于我们'
        }
      },
      {
        path: 'contact',
        name: 'Contact',
        component: Contact,
        meta: {
          title: '联系我们'
        }
      },
      {
        path: 'user/:id',
        name: 'User',
        component: User,
        meta: {
          title: '用户中心'
        },
        children: [
          {
            path: '',
            redirect: 'profile'
          },
          {
            path: 'profile',
            name: 'UserProfile',
            component: UserProfile,
            meta: {
              title: '用户资料'
            }
          },
          {
            path: 'posts',
            name: 'UserPosts',
            component: UserPosts,
            meta: {
              title: '用户文章'
            }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createLDesignRouter({
  history: 'web',
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 基础路由示例`
  }

  console.log(`导航从 ${from.path} 到 ${to.path}`)
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  console.log(`导航完成: ${to.path}`)
})

export default router
```

### 布局组件

```vue
<!-- src/components/Layout.vue -->
<script setup lang="ts">
import Navigation from './Navigation.vue'
</script>

<template>
  <div class="layout">
    <header class="header">
      <h1>基础路由示例</h1>
      <Navigation />
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2024 @ldesign/router 基础路由示例</p>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background: #34495e;
  color: white;
  text-align: center;
  padding: 1rem;
}

.footer p {
  margin: 0;
}
</style>
```

### 导航组件

```vue
<!-- src/components/Navigation.vue -->
<script setup lang="ts">
const navLinks = [
  { name: 'home', to: '/', text: '首页' },
  { name: 'about', to: '/about', text: '关于' },
  { name: 'contact', to: '/contact', text: '联系' },
  { name: 'user', to: '/user/123', text: '用户中心' }
]
</script>

<template>
  <nav class="navigation">
    <router-link
      v-for="link in navLinks"
      :key="link.name"
      :to="link.to"
      class="nav-link"
      active-class="active"
    >
      {{ link.text }}
    </router-link>
  </nav>
</template>

<style scoped>
.navigation {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: #3498db;
}
</style>
```

### 首页组件

```vue
<!-- src/views/Home.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

// 当前路由信息
const routeInfo = computed(() => ({
  path: route.path,
  name: route.name,
  params: route.params,
  query: route.query,
  meta: route.meta
}))

// 编程式导航
function navigateToAbout() {
  router.push('/about')
}

function navigateToUser() {
  router.push({ name: 'User', params: { id: '123' } })
}
</script>

<template>
  <div class="home">
    <h1>欢迎使用 @ldesign/router</h1>

    <div class="intro">
      <p>这是一个基础路由示例，展示了以下功能：</p>

      <ul class="feature-list">
        <li>基础路由配置和导航</li>
        <li>动态路由参数</li>
        <li>嵌套路由</li>
        <li>路由守卫</li>
        <li>404 页面处理</li>
      </ul>
    </div>

    <div class="actions">
      <button class="btn btn-primary" @click="navigateToAbout">
        了解更多
      </button>

      <button class="btn btn-secondary" @click="navigateToUser">
        查看用户中心
      </button>
    </div>

    <div class="route-info">
      <h3>当前路由信息</h3>
      <pre>{{ routeInfo }}</pre>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
}

.home h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.intro {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.feature-list {
  margin: 1rem 0;
  padding-left: 2rem;
}

.feature-list li {
  margin: 0.5rem 0;
  color: #555;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.route-info {
  background: #2c3e50;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.route-info h3 {
  margin-top: 0;
  color: #3498db;
}

.route-info pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
```

### 用户页面组件

```vue
<!-- src/views/User.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const route = useRoute()

// 获取用户 ID
const userId = computed(() => route.params.id as string)

// 编程式导航方法
function goToProfile() {
  router.push(`/user/${userId.value}/profile`)
}

function goToPosts() {
  router.push({ name: 'UserPosts', params: { id: userId.value } })
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="user">
    <h1>用户中心</h1>

    <div class="user-info">
      <h2>用户 ID: {{ userId }}</h2>
      <p>这是用户 {{ userId }} 的个人中心页面</p>
    </div>

    <nav class="user-nav">
      <router-link
        :to="`/user/${userId}/profile`"
        class="nav-item"
        active-class="active"
      >
        个人资料
      </router-link>

      <router-link
        :to="`/user/${userId}/posts`"
        class="nav-item"
        active-class="active"
      >
        我的文章
      </router-link>
    </nav>

    <div class="user-content">
      <router-view />
    </div>

    <div class="navigation-demo">
      <h3>编程式导航示例</h3>
      <button class="btn" @click="goToProfile">
        跳转到个人资料
      </button>
      <button class="btn" @click="goToPosts">
        跳转到我的文章
      </button>
      <button class="btn" @click="goBack">
        返回上一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.user {
  max-width: 800px;
}

.user h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.user-info {
  background: #e8f4fd;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #3498db;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.user-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 1rem;
}

.nav-item {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #7f8c8d;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #ecf0f1;
  color: #2c3e50;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.user-content {
  min-height: 200px;
  margin-bottom: 2rem;
}

.navigation-demo {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.navigation-demo h3 {
  margin-top: 0;
  color: #2c3e50;
}

.navigation-demo .btn {
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.navigation-demo .btn:hover {
  background: #7f8c8d;
}
</style>
```

### 用户资料组件

```vue
<!-- src/views/UserProfile.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '@ldesign/router'

const route = useRoute()

// 模拟用户资料数据
const userProfile = ref({
  name: `用户 ${route.params.id}`,
  email: `user${route.params.id}@example.com`,
  bio: '这是一个示例用户的个人简介，展示了如何在嵌套路由中显示用户信息。',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${route.params.id}`,
  joinDate: '2024-01-01',
  postsCount: 42,
  followersCount: 128
})
</script>

<template>
  <div class="user-profile">
    <h3>个人资料</h3>

    <div class="profile-card">
      <div class="avatar">
        <img :src="userProfile.avatar" :alt="userProfile.name">
      </div>

      <div class="profile-info">
        <h4>{{ userProfile.name }}</h4>
        <p class="email">
          {{ userProfile.email }}
        </p>
        <p class="bio">
          {{ userProfile.bio }}
        </p>

        <div class="stats">
          <div class="stat">
            <span class="label">注册时间</span>
            <span class="value">{{ userProfile.joinDate }}</span>
          </div>
          <div class="stat">
            <span class="label">文章数量</span>
            <span class="value">{{ userProfile.postsCount }}</span>
          </div>
          <div class="stat">
            <span class="label">粉丝数量</span>
            <span class="value">{{ userProfile.followersCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="route-params">
      <h4>路由参数</h4>
      <pre>{{ JSON.stringify(route.params, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.user-profile h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.profile-card {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.email {
  color: #7f8c8d;
  margin: 0 0 1rem 0;
}

.bio {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.stat .value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #3498db;
}

.route-params {
  background: #2c3e50;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.route-params h4 {
  margin-top: 0;
  color: #3498db;
}

.route-params pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
```

## 学习要点

### 1. 路由配置

- 使用 `createLDesignRouter` 创建路由实例
- 配置嵌套路由和子路由
- 设置路由元信息 (`meta`)
- 处理 404 页面

### 2. 导航方式

- 声明式导航：`<router-link>`
- 编程式导航：`router.push()`, `router.back()`
- 命名路由导航
- 路由参数传递

### 3. 路由守卫

- 全局前置守卫：`beforeEach`
- 全局后置钩子：`afterEach`
- 页面标题设置
- 导航日志记录

### 4. 组合式 API

- `useRouter()` 获取路由实例
- `useRoute()` 获取当前路由信息
- 响应式路由参数
- 路由信息监听

## 扩展练习

1. **添加路由过渡动画**
2. **实现面包屑导航**
3. **添加路由缓存**
4. **实现权限控制**
5. **添加加载状态**

## 相关文档

- [核心概念](../../guide/core-concepts.md)
- [路由配置](../../api/router.md)
- [组合式 API](../../api/composables.md)
- [最佳实践](../../guide/best-practices.md)
