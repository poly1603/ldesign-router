# Vue Router Example

基于 @ldesign/router-vue 的完整示例项目。

## 功能演示

- ✅ Vue 3 + TypeScript
- ✅ Composition API
- ✅ Hash 模式路由
- ✅ 动态路由参数
- ✅ 编程式导航
- ✅ Composables (useRouter, useRoute)

## 开发

```bash
# 安装依赖
pnpm install --ignore-scripts

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 访问

开发服务器启动后，访问 http://localhost:3002

## 路由配置

```typescript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/about', name: 'about', component: About },
    { path: '/user/:id', name: 'user', component: User },
  ],
})
```

## 使用的技术

- Vue 3.4
- TypeScript 5.7.3
- @ldesign/router-vue 1.0.0
- Vite 5.0.12
