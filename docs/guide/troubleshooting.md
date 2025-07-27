# 故障排除

本指南帮助您诊断和解决使用 `@ldesign/router` 时可能遇到的常见问题。

## 常见问题

### 路由相关问题

#### 1. 路由无法匹配

**问题描述：** 访问某个路径时显示 404 或路由不匹配

**可能原因：**
- 路由配置错误
- 路径大小写不匹配
- 动态路由参数配置错误
- 路由守卫阻止了导航

**解决方案：**

```typescript
// ✅ 检查路由配置
const routes = [
  {
    path: '/user/:id', // 确保路径正确
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue')
  }
]

// ✅ 检查路由是否正确注册
console.log('已注册的路由:', router.getRoutes())

// ✅ 检查路由解析
const resolved = router.resolve('/user/123')
console.log('路由解析结果:', resolved)

// ✅ 启用调试模式
const router = createLDesignRouter({
  routes,
  debug: true // 启用调试信息
})
```

#### 2. 动态路由参数获取失败

**问题描述：** 无法获取 URL 中的动态参数

**解决方案：**

```typescript
// ✅ 正确获取路由参数
<script setup lang="ts">
const route = useRoute()

// 获取路径参数
const userId = computed(() => route.params.id)

// 获取查询参数
const tab = computed(() => route.query.tab)

// 监听参数变化
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    loadUserData(newId)
  }
})
</script>

// ❌ 常见错误：直接使用 route.params
// 这样无法响应参数变化
const userId = route.params.id
```

#### 3. 编程式导航失败

**问题描述：** 使用 `router.push()` 等方法导航失败

**解决方案：**

```typescript
// ✅ 正确的编程式导航
const router = useRouter()

// 使用路径
router.push('/user/123')

// 使用命名路由
router.push({ name: 'UserDetail', params: { id: '123' } })

// 处理导航错误
try {
  await router.push('/user/123')
}
 catch (error) {
  if (error.name === 'NavigationDuplicated') {
    // 导航到相同路由
    console.log('已在目标路由')
  }
 else {
    console.error('导航失败:', error)
  }
}

// ✅ 检查导航守卫
router.beforeEach((to, from, next) => {
  console.log('导航守卫:', { to: to.path, from: from.path })
  next()
})
```

### 权限相关问题

#### 1. 权限检查不生效

**问题描述：** 权限配置后仍然可以访问受限页面

**解决方案：**

```typescript
// ✅ 检查权限配置
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true, // 确保启用权限管理
    mode: 'role', // 检查模式配置
    storage: 'localStorage'
  }
})

// ✅ 检查用户权限设置
const { setUser, hasRole } = usePermissions()

// 确保正确设置用户信息
setUser({
  id: '123',
  username: 'john',
  roles: ['admin', 'user'],
  permissions: ['read', 'write']
})

// ✅ 检查路由权限配置
const routes = [
  {
    path: '/admin',
    component: AdminView,
    meta: {
      requiresAuth: true,
      roles: ['admin'], // 确保角色配置正确
      permissions: ['admin:read']
    }
  }
]

// ✅ 调试权限检查
console.log('当前用户角色:', hasRole('admin'))
console.log('权限检查结果:', router.permissionManager.checkPermission(route))
```

#### 2. 权限更新后不生效

**问题描述：** 更新用户权限后，页面权限状态没有更新

**解决方案：**

```typescript
// ✅ 正确更新权限
const { setUser, refreshPermissions } = usePermissions()

// 更新用户信息后刷新权限
async function updateUserRole(newRole: string) {
  const updatedUser = { ...currentUser.value, roles: [newRole] }
  setUser(updatedUser)

  // 刷新权限缓存
  await refreshPermissions()

  // 重新检查当前路由权限
  const currentRoute = router.currentRoute.value
  const hasPermission = router.permissionManager.checkPermission(currentRoute)

  if (!hasPermission) {
    router.push('/unauthorized')
  }
}

// ✅ 监听权限变化
watch(() => currentUser.value?.roles, (newRoles, oldRoles) => {
  if (JSON.stringify(newRoles) !== JSON.stringify(oldRoles)) {
    // 权限发生变化，重新验证当前路由
    nextTick(() => {
      router.permissionManager.validateCurrentRoute()
    })
  }
})
```

### 缓存相关问题

#### 1. 页面缓存不生效

**问题描述：** 配置了缓存但页面仍然重新加载

**解决方案：**

```typescript
// ✅ 检查缓存配置
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 10
  }
})

// ✅ 检查路由缓存配置
const routes = [
  {
    path: '/user/:id',
    component: UserDetail,
    meta: {
      cache: true,  // 确保启用缓存
      cacheKey: 'user-detail'  // 可选：自定义缓存键
    }
  }
]

// ✅ 检查组件名称
// 组件必须有 name 属性才能被缓存
<script setup lang="ts">
// 使用 defineOptions 设置组件名称
defineOptions({
  name: 'UserDetail'
})
</script>

// ✅ 调试缓存状态
const { getCacheStats } = useCache()
console.log('缓存统计:', getCacheStats())
```

#### 2. 缓存数据过期

**问题描述：** 缓存的数据没有及时更新

**解决方案：**

```typescript
// ✅ 手动清除缓存
const { removeFromCache, clearCache } = useCache()

// 清除特定页面缓存
function refreshUserData() {
  removeFromCache('user-detail')
  router.go(0) // 重新加载当前页面
}

// 清除所有缓存
function clearAllCache() {
  clearCache()
}

// ✅ 设置缓存过期时间
const routes = [
  {
    path: '/data',
    component: DataView,
    meta: {
      cache: true,
      cacheTTL: 300000 // 5分钟后过期
    }
  }
]

// ✅ 监听数据变化自动清除缓存
watch(() => userData.value, () => {
  // 数据更新时清除相关缓存
  removeFromCache('user-detail')
  removeFromCache('user-list')
})
```

### 设备适配问题

#### 1. 设备检测不准确

**问题描述：** 设备类型检测错误，显示了错误的组件

**解决方案：**

```typescript
// ✅ 检查设备配置
const router = createLDesignRouter({
  routes,
  device: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    },
    detection: 'both' // 同时使用 userAgent 和屏幕尺寸
  }
})

// ✅ 手动检测设备类型
const { deviceType, isMobile, isTablet, isDesktop } = useDevice()

console.log('设备信息:', {
  type: deviceType.value,
  isMobile: isMobile.value,
  isTablet: isTablet.value,
  isDesktop: isDesktop.value,
  userAgent: navigator.userAgent,
  screenWidth: window.innerWidth
})

// ✅ 监听设备变化
watch(deviceType, (newType, oldType) => {
  console.log(`设备类型变化: ${oldType} -> ${newType}`)
})
```

#### 2. 响应式组件切换问题

**问题描述：** 在不同设备间切换时组件显示异常

**解决方案：**

```typescript
// ✅ 使用 key 强制重新渲染
<template>
  <component
    :is="currentComponent"
    :key="deviceType"
  />
</template>

<script setup lang="ts">
const { deviceType } = useDevice()

const currentComponent = computed(() => {
  switch (deviceType.value) {
    case 'mobile':
      return MobileComponent
    case 'tablet':
      return TabletComponent
    default:
      return DesktopComponent
  }
})
</script>

// ✅ 处理设备切换时的状态保持
const preserveState = ref({})

watch(deviceType, (newType, oldType) => {
  // 保存当前状态
  preserveState.value[oldType] = getCurrentState()

  // 恢复新设备的状态
  nextTick(() => {
    if (preserveState.value[newType]) {
      restoreState(preserveState.value[newType])
    }
  })
})
```

## 调试技巧

### 启用调试模式

```typescript
// 开发环境启用详细调试
const router = createLDesignRouter({
  routes,
  debug: process.env.NODE_ENV === 'development',

  // 各模块的调试配置
  permission: {
    enabled: true,
    debug: true
  },
  cache: {
    enabled: true,
    debug: true
  },
  device: {
    enabled: true,
    debug: true
  }
})
```

### 使用浏览器开发工具

```typescript
// 在控制台中调试路由
// 获取当前路由信息
console.log('当前路由:', router.currentRoute.value)

// 获取所有路由
console.log('所有路由:', router.getRoutes())

// 检查权限状态
console.log('权限状态:', router.permissionManager.getPermissionState())

// 检查缓存状态
console.log('缓存状态:', router.cacheManager.getCacheStats())

// 检查设备信息
console.log('设备信息:', router.deviceRouter.getDeviceInfo())
```

### 性能分析

```typescript
// 路由性能分析
router.beforeEach((to, from, next) => {
  console.time(`导航到 ${to.path}`)
  next()
})

router.afterEach((to, from) => {
  console.timeEnd(`导航到 ${to.path}`)
})

// 组件渲染性能分析
function useRenderPerformance(componentName: string) {
  onBeforeMount(() => {
    console.time(`${componentName} 渲染`)
  })

  onMounted(() => {
    console.timeEnd(`${componentName} 渲染`)
  })
}
```

## 错误处理

### 全局错误处理

```typescript
// 设置全局错误处理
router.onError((error, to, from) => {
  console.error('路由错误:', error)

  // 根据错误类型处理
  if (error.name === 'ChunkLoadError') {
    // 代码分割加载失败
    window.location.reload()
  }
 else if (error.name === 'PermissionDenied') {
    // 权限不足
    router.push('/unauthorized')
  }
 else {
    // 其他错误
    router.push('/error')
  }
})

// Vue 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue 错误:', error, info)

  // 发送错误报告
  errorReporting.report(error, {
    component: instance?.$options.name,
    info,
    route: router.currentRoute.value.path
  })
}
```

### 网络错误处理

```typescript
// 网络请求错误处理
function handleNetworkError(error: any) {
  if (error.code === 'NETWORK_ERROR') {
    // 网络连接问题
    showNotification('网络连接失败，请检查网络设置')
  }
 else if (error.status === 401) {
    // 认证失败
    router.push('/login')
  }
 else if (error.status === 403) {
    // 权限不足
    router.push('/unauthorized')
  }
 else if (error.status >= 500) {
    // 服务器错误
    showNotification('服务器错误，请稍后重试')
  }
}

// 请求拦截器
axios.interceptors.response.use(
  response => response,
  (error) => {
    handleNetworkError(error)
    return Promise.reject(error)
  }
)
```

## 常见错误代码

### ROUTER_001: 路由配置错误

```typescript
// 错误示例
const routes = [
  {
    path: '/user/:id',
    // 缺少 component 配置
  }
]

// 正确配置
const routes = [
  {
    path: '/user/:id',
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue')
  }
]
```

### PERMISSION_001: 权限配置错误

```typescript
// 错误示例
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true
    // 缺少必要配置
  }
})

// 正确配置
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true,
    mode: 'role',
    storage: 'localStorage'
  }
})
```

### CACHE_001: 缓存配置错误

```typescript
// 错误示例
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    max: -1 // 无效的最大缓存数
  }
})

// 正确配置
const router = createLDesignRouter({
  routes,
  cache: {
    enabled: true,
    strategy: 'lru',
    max: 10
  }
})
```

## 获取帮助

如果以上解决方案无法解决您的问题，可以通过以下方式获取帮助：

1. **查看文档**：仔细阅读相关功能的详细文档
2. **检查示例**：参考项目中的示例代码
3. **启用调试**：开启调试模式获取更多信息
4. **社区支持**：在 GitHub Issues 中搜索类似问题
5. **提交问题**：如果是新问题，请提交详细的错误报告

### 提交问题时请包含：

- 详细的错误描述
- 复现步骤
- 相关代码片段
- 环境信息（Vue 版本、浏览器版本等）
- 控制台错误信息
- 预期行为和实际行为的对比

这样可以帮助我们更快地定位和解决问题。
