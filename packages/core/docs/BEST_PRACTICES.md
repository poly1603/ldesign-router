# @ldesign/router 最佳实践指南

## 📚 目录

- [性能优化](#性能优化)
- [架构设计](#架构设计)
- [代码组织](#代码组织)
- [常见问题](#常见问题)
- [避坑指南](#避坑指南)

---

## ⚡ 性能优化

### 1. 使用 Trie 树匹配器

**推荐做法：**
```typescript
import { createTrieMatcher } from '@ldesign/router-core'

// ✅ 好的做法 - 使用 Trie 树
const matcher = createTrieMatcher()
routes.forEach(route => matcher.addRoute(route.path, route))

// 匹配速度 < 0.5ms
const matched = matcher.match('/users/123')
```

**避免：**
```typescript
// ❌ 不好的做法 - 线性搜索
routes.find(route => route.path === path)
```

**性能对比：**
- Trie 树：O(m) - 路径长度
- 线性搜索：O(n) - 路由数量
- 大规模应用提升：2000%+

### 2. 启用智能缓存

**推荐做法：**
```typescript
import { createAdvancedCache } from '@ldesign/router-core'

const cache = createAdvancedCache({
  maxSize: 100,
  ttl: 5 * 60 * 1000,
  enablePrediction: true, // 启用访问模式预测
})

// 缓存命中率 > 90%
```

**配置建议：**
- 小型应用：maxSize = 50
- 中型应用：maxSize = 100
- 大型应用：maxSize = 200
- TTL：根据数据更新频率调整

### 3. 合理使用懒加载

**推荐做法：**
```typescript
import { LoadPriority } from '@ldesign/router-core'

// ✅ 根据重要性设置优先级
const routes = [
  {
    path: '/home',
    component: () => import('./Home.vue'),
    priority: LoadPriority.HIGH, // 首屏内容
  },
  {
    path: '/dashboard',
    component: () => import('./Dashboard.vue'),
    priority: LoadPriority.NORMAL, // 常用页面
  },
  {
    path: '/settings',
    component: () => import('./Settings.vue'),
    priority: LoadPriority.LOW, // 低频页面
  },
]
```

**优先级选择：**
- IMMEDIATE：登录页、首页
- HIGH：核心业务页面
- NORMAL：常规页面
- LOW：设置、帮助页面
- IDLE：统计、日志页面

### 4. 启用性能监控

**推荐做法：**
```typescript
import { createPerformanceMonitor } from '@ldesign/router-core'

// ✅ 开发环境启用详细监控
const monitor = createPerformanceMonitor({
  enabled: process.env.NODE_ENV === 'development',
  thresholds: {
    matchWarning: 1,
    guardWarning: 50,
    totalWarning: 100,
  },
  onWarning: (warning) => {
    console.warn(`[Performance] ${warning.message}`)
    // 可以上报到监控系统
  },
})
```

---

## 🏗️ 架构设计

### 1. 路由结构设计

**推荐做法：**
```typescript
// ✅ 清晰的层级结构
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'settings',
        component: Settings,
      },
    ],
  },
]
```

**设计原则：**
- 按业务模块划分
- 合理的嵌套层级（建议 ≤ 3层）
- 统一的命名规范
- 清晰的meta信息

### 2. 路由守卫设计

**推荐做法：**
```typescript
// ✅ 模块化的守卫
const authGuard = (to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
}

const permissionGuard = (to, from, next) => {
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    next('/403')
  } else {
    next()
  }
}

// 组合使用
router.beforeEach(authGuard)
router.beforeEach(permissionGuard)
```

**守卫原则：**
- 单一职责
- 可复用
- 异步操作要处理错误
- 避免循环重定向

### 3. 状态管理集成

**推荐做法：**
```typescript
// ✅ 路由状态与应用状态分离
import { useRouteCache } from '@ldesign/router-vue'

const { state: formData } = useRouteCache({
  key: 'checkout-form',
  saveOnLeave: true,
  ttl: 10 * 60 * 1000, // 10分钟
})

// 避免将所有状态都存储在路由中
```

---

## 📂 代码组织

### 1. 目录结构

**推荐结构：**
```
src/
├── router/
│   ├── index.ts          # 路由实例
│   ├── routes.ts         # 路由配置
│   ├── guards.ts         # 守卫函数
│   └── modules/          # 按模块拆分
│       ├── admin.ts
│       ├── user.ts
│       └── product.ts
├── views/                # 页面组件
└── components/           # 公共组件
```

### 2. 路由配置拆分

**推荐做法：**
```typescript
// routes/modules/admin.ts
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      // ...
    ],
  },
]

// routes/index.ts
import { adminRoutes } from './modules/admin'
import { userRoutes } from './modules/user'

export const routes = [
  ...adminRoutes,
  ...userRoutes,
  // ...
]
```

### 3. TypeScript 类型定义

**推荐做法：**
```typescript
// ✅ 定义清晰的类型
interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  keepAlive?: boolean
  icon?: string
}

interface AppRoute {
  path: string
  name: string
  component: Component
  meta?: RouteMeta
  children?: AppRoute[]
}

// 使用类型安全的路由配置
const routes: AppRoute[] = [
  // ...
]
```

---

## 🐛 常见问题

### 1. 路由匹配不到

**问题：**
```typescript
// ❌ 路径不匹配
router.push('/users/123')  // 路由定义是 '/user/:id'
```

**解决方案：**
```typescript
// ✅ 确保路径一致
router.push('/user/123')

// 或使用命名路由
router.push({ name: 'user-detail', params: { id: 123 } })
```

### 2. 守卫无限循环

**问题：**
```typescript
// ❌ 造成无限循环
router.beforeEach((to, from, next) => {
  if (!isAuthenticated()) {
    next('/login')  // 如果 /login 也需要认证，就会循环
  }
})
```

**解决方案：**
```typescript
// ✅ 添加终止条件
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  
  if (!isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 3. 动态路由参数丢失

**问题：**
```typescript
// ❌ 刷新页面后参数丢失
const userId = route.params.id
```

**解决方案：**
```typescript
// ✅ 使用 useRouteCache 持久化
const { state: userData } = useRouteCache({
  key: `user-${route.params.id}`,
  initialValue: null,
  saveOnLeave: true,
})
```

### 4. 内存泄漏

**问题：**
```typescript
// ❌ 未清理的监听器
router.beforeEach((to, from, next) => {
  // 每次导航都添加新的监听器
  window.addEventListener('resize', handleResize)
  next()
})
```

**解决方案：**
```typescript
// ✅ 使用内存管理器
import { createMemoryManager } from '@ldesign/router-core'

const memoryManager = createMemoryManager()

// 或在组件中正确清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

---

## ⚠️ 避坑指南

### 1. 不要在守卫中进行重操作

**❌ 不好的做法：**
```typescript
router.beforeEach(async (to, from, next) => {
  // 大量数据请求
  const users = await fetchAllUsers()
  const products = await fetchAllProducts()
  // ...
  next()
})
```

**✅ 好的做法：**
```typescript
router.beforeEach(async (to, from, next) => {
  // 只做必要的权限检查
  if (to.meta.requiresAuth) {
    const hasAuth = await checkAuth()
    if (!hasAuth) {
      next('/login')
      return
    }
  }
  next()
})

// 数据加载放在组件中
```

### 2. 不要过度使用缓存

**❌ 不好的做法：**
```typescript
// 缓存所有内容
cache.set('user-list', largeUserList)  // 10MB 数据
cache.set('product-list', largeProductList)  // 20MB 数据
```

**✅ 好的做法：**
```typescript
// 只缓存关键数据
cache.set('user-summary', userSummary)  // 轻量级数据
cache.set('frequently-accessed', frequentData)

// 大数据使用分页或虚拟滚动
```

### 3. 不要忽略错误处理

**❌ 不好的做法：**
```typescript
router.push('/dashboard')
```

**✅ 好的做法：**
```typescript
try {
  await router.push('/dashboard')
} catch (error) {
  if (error.name === 'NavigationDuplicated') {
    // 处理重复导航
  } else {
    // 其他错误处理
    console.error('Navigation failed:', error)
  }
}
```

### 4. 不要在路由配置中使用全局状态

**❌ 不好的做法：**
```typescript
let globalUser = null

const routes = [
  {
    path: '/profile',
    component: Profile,
    beforeEnter: () => {
      // 依赖全局状态
      return globalUser ? true : '/login'
    },
  },
]
```

**✅ 好的做法：**
```typescript
const routes = [
  {
    path: '/profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
]

// 在守卫中统一处理
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = getCurrentUser()  // 从状态管理获取
    if (!user) {
      next('/login')
      return
    }
  }
  next()
})
```

---

## 📊 性能检查清单

### 开发阶段
- [ ] 使用 Trie 树匹配器
- [ ] 启用性能监控
- [ ] 配置合理的缓存策略
- [ ] 设置懒加载优先级
- [ ] 检查守卫执行时间

### 测试阶段
- [ ] 运行性能基准测试
- [ ] 检查内存使用情况
- [ ] 测试大规模路由场景
- [ ] 验证缓存命中率
- [ ] 测试不同网络条件

### 生产阶段
- [ ] 启用生产环境优化
- [ ] 配置错误监控
- [ ] 设置性能告警
- [ ] 定期查看性能报告
- [ ] 根据实际情况调优

---

## 🎯 总结

### 核心原则
1. **性能优先** - 使用高效的数据结构和算法
2. **渐进增强** - 根据需要启用功能
3. **类型安全** - 充分利用 TypeScript
4. **可维护性** - 清晰的代码组织和文档
5. **可观测性** - 完善的监控和日志

### 推荐工具链
- **开发**: 性能监控器 + TypeScript
- **测试**: Vitest + 性能基准测试
- **生产**: 内存管理器 + 智能缓存

### 持续优化
- 定期查看性能报告
- 根据实际使用情况调整配置
- 关注新功能和最佳实践
- 参与社区讨论和贡献

---

**记住：好的路由设计是应用性能的基石！**