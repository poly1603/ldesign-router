# 基础使用示例

本页面展示 @ldesign/router 的基础使用示例。

## 简单的单页应用

这是一个最简单的单页应用示例：

::: code-group
```typescript [main.ts]
import { createApp } from 'vue'
import { createRouter, createWebHistory } from '@ldesign/router'
import App from './App.vue'

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
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('./views/Contact.vue')
  }
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes
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
      <RouterLink to="/contact">联系我们</RouterLink>
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
  background: #f5f5f5;
  display: flex;
  gap: 20px;
}

nav a {
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

nav a:hover {
  background: #e0e0e0;
}

nav a.router-link-active {
  color: #42b983;
  background: #e8f5e9;
}

main {
  padding: 40px 20px;
}
</style>
```

```vue [views/Home.vue]
<template>
  <div class="home">
    <h1>欢迎使用 @ldesign/router</h1>
    <p>这是一个现代化、高性能的 Vue 3 路由库</p>
    
    <div class="features">
      <div class="feature">
        <h3>⚡ 极致性能</h3>
        <p>路由匹配速度提升 30-70%</p>
      </div>
      <div class="feature">
        <h3>🛡️ 类型安全</h3>
        <p>完整的 TypeScript 支持</p>
      </div>
      <div class="feature">
        <h3>🎯 完全独立</h3>
        <p>不依赖 vue-router</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}

h1 {
  color: #42b983;
  margin-bottom: 20px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature {
  padding: 30px;
  border-radius: 8px;
  background: #f9f9f9;
}

.feature h3 {
  margin-bottom: 10px;
}
</style>
```

```vue [views/About.vue]
<template>
  <div class="about">
    <h1>关于我们</h1>
    <p>@ldesign/router 是为 Vue 3 打造的现代化路由解决方案</p>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

```vue [views/Contact.vue]
<template>
  <div class="contact">
    <h1>联系我们</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>姓名</label>
        <input v-model="form.name" type="text" required />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="form.email" type="email" required />
      </div>
      <div class="form-group">
        <label>留言</label>
        <textarea v-model="form.message" required></textarea>
      </div>
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()
const form = reactive({
  name: '',
  email: '',
  message: ''
})

function handleSubmit() {
  console.log('提交表单:', form)
  alert('感谢您的留言！')
  router.push('/')
}
</script>

<style scoped>
.contact {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

button {
  background: #42b983;
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #35a372;
}
</style>
```
:::

## 带路由元信息

使用路由元信息添加页面标题和权限控制：

```typescript
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
    meta: {
      title: '首页',
      icon: 'home'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      icon: 'dashboard'
    }
  }
]

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || 'App'
  
  // 检查认证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

## 编程式导航

```vue
<template>
  <div>
    <h1>编程式导航示例</h1>
    
    <div class="buttons">
      <button @click="goToAbout">访问关于页面</button>
      <button @click="goToUser">访问用户页面</button>
      <button @click="goBack">返回上一页</button>
      <button @click="replace">替换当前路由</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from '@ldesign/router'

const router = useRouter()

// 字符串路径
function goToAbout() {
  router.push('/about')
}

// 命名路由 + 参数
function goToUser() {
  router.push({
    name: 'user',
    params: { id: 123 },
    query: { tab: 'posts' }
  })
}

// 返回
function goBack() {
  router.back()
}

// 替换（不会产生历史记录）
function replace() {
  router.replace('/about')
}
</script>

<style scoped>
.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #35a372;
}
</style>
```

## 路由参数

```typescript
// 路由配置
const routes = [
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('./views/User.vue')
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div class="user">
    <h1>用户 #{{ userId }}</h1>
    <p>查询参数: {{ route.query.tab }}</p>
    
    <nav>
      <RouterLink :to="`/user/${userId}?tab=posts`">文章</RouterLink>
      <RouterLink :to="`/user/${userId}?tab=comments`">评论</RouterLink>
      <RouterLink :to="`/user/${userId}?tab=likes`">点赞</RouterLink>
    </nav>
    
    <div class="content">
      <div v-if="route.query.tab === 'posts'">文章列表...</div>
      <div v-else-if="route.query.tab === 'comments'">评论列表...</div>
      <div v-else-if="route.query.tab === 'likes'">点赞列表...</div>
      <div v-else>请选择一个标签</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from '@ldesign/router'

const route = useRoute()
const userId = computed(() => route.params.id)
</script>
```

## 路由守卫

```vue
<template>
  <div>
    <h1>编辑文章</h1>
    <form @submit.prevent="save">
      <input v-model="title" placeholder="标题" />
      <textarea v-model="content" placeholder="内容"></textarea>
      <button type="submit">保存</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onBeforeRouteLeave } from '@ldesign/router'

const title = ref('')
const content = ref('')
const saved = ref(false)

function save() {
  // 保存逻辑
  saved.value = true
  alert('保存成功')
}

// 离开路由前确认
onBeforeRouteLeave((to, from, next) => {
  if (!saved.value && (title.value || content.value)) {
    const answer = window.confirm('有未保存的更改，确定要离开吗？')
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>
```

## 404 页面

```typescript
const routes = [
  // ... 其他路由
  
  // 404 页面 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('./views/NotFound.vue')
  }
]
```

```vue
<!-- NotFound.vue -->
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <p class="path">{{ route.path }}</p>
    <RouterLink to="/">返回首页</RouterLink>
  </div>
</template>

<script setup>
import { useRoute, RouterLink } from '@ldesign/router'

const route = useRoute()
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 60px 20px;
}

h1 {
  font-size: 72px;
  color: #42b983;
  margin-bottom: 20px;
}

.path {
  color: #666;
  margin: 20px 0;
}

a {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 30px;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
```

## 在线演示

你可以在以下平台查看和运行这些示例：

- [CodeSandbox](https://codesandbox.io/) - 在线编辑和预览
- [StackBlitz](https://stackblitz.com/) - 在线 IDE

## 下一步

- [嵌套路由](/examples/nested-routes) - 学习嵌套路由
- [动态路由](/examples/dynamic-routes) - 了解动态路由
- [路由守卫](/examples/guards) - 学习路由守卫
- [高级示例](/examples/advanced) - 查看更多高级用法

