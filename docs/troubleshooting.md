# 故障排除

本章节收集了使用 `@ldesign/router` 时常见的问题和解决方案。

## 安装和配置问题

### Q: 安装后提示找不到模块

**问题描述:**
```
Cannot resolve module '@ldesign/router'
```

**解决方案:**

1. 确认安装是否成功：
```bash
pnpm list @ldesign/router
```

2. 检查 `package.json` 中是否包含依赖：
```json
{
  "dependencies": {
    "@ldesign/router": "^2.0.0"
  }
}
```

3. 重新安装依赖：
```bash
pnpm install
```

4. 清除缓存并重新安装：
```bash
pnpm store prune
pnpm install
```

### Q: TypeScript 类型错误

**问题描述:**
```
Property 'permissionManager' does not exist on type 'LDesignRouter'
```

**解决方案:**

1. 确保 TypeScript 配置正确：
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "types": ["@ldesign/router"]
  }
}
```

2. 重启 TypeScript 服务：
- VS Code: `Ctrl+Shift+P` → `TypeScript: Restart TS Server`

3. 检查版本兼容性：
```bash
pnpm list typescript vue
```

## 路由导航问题

### Q: 路由跳转不生效

**问题描述:**
调用 `router.push()` 后页面没有跳转。

**解决方案:**

1. 检查路由配置是否正确：
```typescript
// 确保路由已正确定义
const routes = [
  {
    path: '/target',
    name: 'Target',
    component: TargetComponent
  }
]
```

2. 检查导航守卫是否阻止了跳转：
```typescript
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)
  next() // 确保调用了 next()
})
```

3. 检查是否有 JavaScript 错误：
```typescript
router.onError((error) => {
  console.error('路由错误:', error)
})
```

4. 使用 `await` 等待导航完成：
```typescript
try {
  await router.push('/target')
  console.log('导航成功')
}
 catch (error) {
  console.error('导航失败:', error)
}
```

### Q: 动态路由参数获取不到

**问题描述:**
```typescript
// 路由定义
{ path: '/user/:id', component: UserDetail }

// 组件中获取不到参数
const route = useRoute()
console.log(route.params.id) // undefined
```

**解决方案:**

1. 确保路由路径正确：
```typescript
// 正确的导航方式
router.push('/user/123')
router.push({ name: 'User', params: { id: '123' } })
```

2. 检查路由定义：
```typescript
// 确保参数名称一致
{
  path: '/user/:id',  // 参数名为 id
  name: 'User',
  component: UserDetail
}
```

3. 使用响应式方式获取参数：
```typescript
const route = useRoute()

// 使用 computed 确保响应性
const userId = computed(() => route.value.params.id)

// 或者监听参数变化
watch(() => route.value.params.id, (newId) => {
  console.log('用户ID变化:', newId)
})
```

## 权限管理问题

### Q: 权限检查不生效

**问题描述:**
设置了权限要求但用户仍能访问受限页面。

**解决方案:**

1. 确保权限管理已启用：
```typescript
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true, // 确保启用
    checkRole: (roles) => {
      // 实现角色检查逻辑
      const userRoles = getCurrentUser()?.roles || []
      return roles.some(role => userRoles.includes(role))
    }
  }
})
```

2. 检查用户信息是否正确设置：
```typescript
// 登录后设置用户信息
router.permissionManager.setCurrentUser({
  id: '1',
  name: 'John',
  roles: ['user'],
  permissions: ['read']
})

// 验证用户信息
console.log(router.permissionManager.getCurrentUser())
```

3. 检查路由元信息配置：
```typescript
{
  path: '/admin',
  component: AdminView,
  meta: {
    requiresAuth: true,
    roles: ['admin'] // 确保角色名称正确
  }
}
```

### Q: 权限检查函数未被调用

**问题描述:**
自定义的权限检查函数没有被执行。

**解决方案:**

1. 确保函数签名正确：
```typescript
const router = createLDesignRouter({
  permission: {
    enabled: true,
    checkRole: (roles: string[]) => boolean,
    checkPermission: (permissions: string[]) => boolean
  }
})
```

2. 添加调试日志：
```typescript
checkRole: (roles: string[]) => {
  console.log('检查角色:', roles)
  const userRoles = getCurrentUser()?.roles || []
  console.log('用户角色:', userRoles)
  const result = roles.some(role => userRoles.includes(role))
  console.log('检查结果:', result)
  return result
}
```

## 缓存问题

### Q: 页面缓存不生效

**问题描述:**
设置了缓存但页面仍然重新加载。

**解决方案:**

1. 确保缓存已启用：
```typescript
const router = createLDesignRouter({
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 10
  }
})
```

2. 检查路由缓存配置：
```typescript
{
  path: '/list',
  component: ListView,
  meta: {
    cache: true // 确保启用缓存
  }
}
```

3. 检查组件是否支持缓存：
```vue
<!-- 确保组件有 name 属性 -->
<script>
export default {
  name: 'ListView' // 缓存需要组件名称
}
</script>
```

4. 查看缓存统计：
```typescript
const stats = router.cacheManager.getCacheStats()
console.log('缓存统计:', stats)
```

### Q: 缓存占用内存过多

**问题描述:**
应用运行一段时间后内存占用过高。

**解决方案:**

1. 调整缓存大小：
```typescript
const router = createLDesignRouter({
  cache: {
    enabled: true,
    max: 5, // 减少缓存数量
    ttl: 300000 // 设置过期时间
  }
})
```

2. 定期清理缓存：
```typescript
// 定期清理过期缓存
setInterval(() => {
  router.cacheManager.cleanExpiredCache()
}, 60000) // 每分钟清理一次
```

3. 监控缓存使用：
```typescript
function monitorCache() {
  const stats = router.cacheManager.getCacheStats()
  if (stats.totalSize > 10 * 1024 * 1024) { // 10MB
    console.warn('缓存占用过多内存:', stats.totalSize)
    router.cacheManager.clearCache()
  }
}
```

## 设备适配问题

### Q: 设备检测不准确

**问题描述:**
设备类型检测结果与实际设备不符。

**解决方案:**

1. 检查断点配置：
```typescript
const router = createLDesignRouter({
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768, // 调整断点值
      tablet: 1024
    }
  }
})
```

2. 手动设置设备类型（测试用）：
```typescript
// 仅用于测试
router.deviceRouter.setDeviceType('mobile')
```

3. 监听设备变化：
```typescript
const { deviceInfo } = useDeviceRouter()

watch(deviceInfo, (info) => {
  console.log('设备信息:', info)
})
```

## 动画问题

### Q: 路由动画不显示

**问题描述:**
配置了路由动画但切换时没有动画效果。

**解决方案:**

1. 确保动画已启用：
```typescript
const router = createLDesignRouter({
  animation: {
    enabled: true,
    type: 'slide',
    duration: 300
  }
})
```

2. 检查 CSS 样式是否加载：
```css
/* 确保动画样式存在 */
.ldesign-slide-forward-enter-active,
.ldesign-slide-forward-leave-active {
  transition: transform 300ms ease-in-out;
}
```

3. 在组件中正确使用动画：
```vue
<script setup>
function getTransitionName(route) {
  return router.animationManager.getTransitionOptions(route).name
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="getTransitionName(route)"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

## 开发工具问题

### Q: 开发工具不显示

**问题描述:**
启用了开发工具但界面上看不到。

**解决方案:**

1. 确保在开发环境中启用：
```typescript
const router = createLDesignRouter({
  devTools: process.env.NODE_ENV === 'development'
})
```

2. 检查浏览器控制台是否有错误：
```javascript
// 在浏览器控制台中检查
console.log(window.ldesignRouter?.devTools)
```

3. 手动显示开发工具：
```typescript
if (router.devTools) {
  router.devTools.show()
}
```

## 性能问题

### Q: 路由切换缓慢

**问题描述:**
页面切换时有明显的延迟。

**解决方案:**

1. 使用路由懒加载：
```typescript
const routes = [
  {
    path: '/heavy',
    component: () => import(
      /* webpackChunkName: "heavy" */ '@/views/Heavy.vue'
    )
  }
]
```

2. 预加载重要路由：
```typescript
// 预加载下一个可能访问的页面
router.prefetch('/next-page')
```

3. 优化组件加载：
```typescript
// 使用 Suspense 处理异步组件
<template>
  <Suspense>
    <router-view />
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

## 调试技巧

### 启用详细日志

```typescript
// 开发环境启用详细日志
if (process.env.NODE_ENV === 'development') {
  router.beforeEach((to, from, next) => {
    console.log(`导航: ${from.path} → ${to.path}`)
    next()
  })

  router.afterEach((to, from) => {
    console.log(`导航完成: ${to.path}`)
  })

  router.onError((error) => {
    console.error('路由错误:', error)
  })
}
```

### 使用浏览器开发工具

1. 在 Vue DevTools 中查看路由状态
2. 使用 Network 面板检查资源加载
3. 使用 Performance 面板分析性能问题

### 常用调试命令

```typescript
// 在浏览器控制台中使用
window.router = router // 暴露路由器实例

// 查看当前路由
console.log(router.currentRoute.value)

// 查看所有路由
console.log(router.getRoutes())

// 查看权限状态
console.log(router.permissionManager.getCurrentUser())

// 查看缓存状态
console.log(router.cacheManager.getCacheStats())
```

## 获取帮助

如果以上解决方案都无法解决您的问题，可以通过以下方式获取帮助：

1. **查看文档** - [https://ldesign.dev/router](https://ldesign.dev/router)
2. **GitHub Issues** - [https://github.com/poly1603/ldesign/issues](https://github.com/poly1603/ldesign/issues)
3. **社区讨论** - [https://github.com/poly1603/ldesign/discussions](https://github.com/poly1603/ldesign/discussions)

提交问题时，请包含以下信息：
- 使用的版本号
- 完整的错误信息
- 最小可复现的代码示例
- 浏览器和操作系统信息
