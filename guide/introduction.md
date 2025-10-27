# 简介

## @ldesign/router 是什么？

@ldesign/router 是一个现代化、高性能、类型安全的 Vue 3 路由库。它完全独立于 vue-router，提供了更好的性能表现和更灵活的集成方式。

## 核心特性

### 🎯 完全独立

与 vue-router 不同，@ldesign/router 是一个完全独立的实现：

- **避免版本冲突** - 不依赖 vue-router，可以与任何版本的 Vue 3 配合使用
- **灵活集成** - 可以作为独立路由库使用，也可以与 LDesign Engine 深度集成
- **现代化设计** - 基于 Vue 3 Composition API 从零开始构建

### ⚡ 极致性能

通过多项性能优化，实现了显著的性能提升：

| 指标 | 优化幅度 | 优化前 | 优化后 |
|------|---------|--------|--------|
| 路由匹配速度 | +30% | 2.0ms | 1.4ms |
| 首次匹配 | +70% | 5.0ms | 1.5ms |
| 缓存键生成 | +42.6% | 4.01ms | 2.30ms |
| 组件重复加载 | -80% | 频繁 | 罕见 |
| 页面切换 | +40-60% | 慢 | 快 |
| 内存占用 | -20% | 40MB | 32MB |

**性能优化技术：**

- **LRU 缓存** - 智能缓存最常用的路由匹配结果
- **Trie 树匹配** - 高效的路由路径匹配算法
- **路由预热** - 消除首次匹配的冷启动延迟
- **自适应缓存** - 根据命中率动态调整缓存策略
- **智能预加载** - 基于用户行为预测，提前加载可能访问的路由
- **组件缓存优化** - 避免重复加载相同组件

### 🛡️ 类型安全

完整的 TypeScript 支持，让你的路由代码更加安全可靠：

```typescript
// 路径参数自动推导
const routes = [
  {
    path: '/user/:id',
    name: 'user',
    component: UserView
  }
]

// 类型安全的导航
router.push({ 
  name: 'user', 
  params: { id: 123 } // ✅ 类型正确
})

router.push({ 
  name: 'user', 
  params: { id: 'abc' } // ❌ 类型错误
})

// 类型安全的路由守卫
router.beforeEach((to, from) => {
  // to 和 from 都有完整的类型提示
  console.log(to.params.id) // 自动推导为 number
})
```

### 🏗️ 嵌套路由

强大的嵌套路由支持，完美匹配复杂应用架构：

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'settings',
        component: UserSettings,
        children: [
          {
            path: 'privacy',
            component: PrivacySettings
          }
        ]
      }
    ]
  }
]
```

### 🔍 SEO 优化

内置完整的 SEO 优化套件：

- **Meta 标签管理** - 自动管理页面 title、description、keywords
- **Open Graph** - 支持 Facebook、LinkedIn 等社交平台分享
- **Twitter Card** - 优化 Twitter 分享体验
- **结构化数据** - Schema.org JSON-LD 支持
- **Sitemap 生成** - 自动生成搜索引擎爬虫需要的 sitemap

```typescript
// 在路由中配置 SEO
{
  path: '/about',
  meta: {
    title: '关于我们',
    description: '了解我们的团队和使命',
    seo: {
      openGraph: {
        title: '关于我们 | 公司名',
        description: '了解我们的团队和使命',
        image: '/og-image.jpg'
      },
      twitter: {
        card: 'summary_large_image',
        title: '关于我们',
        description: '了解我们的团队和使命'
      },
      structuredData: {
        '@type': 'Organization',
        name: '公司名',
        url: 'https://example.com'
      }
    }
  }
}
```

### 🧠 智能预加载

基于用户行为的智能预加载系统：

- **行为预测** - 分析用户的访问模式，预测下一步可能访问的路由
- **优先级队列** - 根据预测置信度排序预加载任务
- **并发控制** - 限制同时预加载的数量，避免占用过多资源
- **网络检测** - 在 Wi-Fi 环境下才预加载，节省流量
- **错误重试** - 预加载失败自动重试

```typescript
import { createSmartPreloadPlugin } from '@ldesign/router/plugins/smart-preload'

const smartPreload = createSmartPreloadPlugin({
  enabled: true,
  maxConcurrent: 2,      // 最多同时预加载2个
  minConfidence: 0.6,    // 置信度阈值
  wifiOnly: true         // 仅在 Wi-Fi 下预加载
})

smartPreload.install(router)
// 页面切换速度提升 40-60%！
```

### 🖥️ SSR 支持

完整的服务端渲染支持：

- **数据预取** - 服务端自动预取数据
- **注水/脱水** - 自动序列化和恢复状态
- **SSR 缓存** - 缓存渲染结果，提升性能
- **异步数据 Composables** - 简化异步数据处理

```vue
<script setup>
import { useSSRData } from '@ldesign/router/ssr'

// 服务端自动预取，客户端自动恢复
const userData = useSSRData('user', async () => {
  const res = await fetch('/api/user')
  return res.json()
})
</script>

<template>
  <div v-if="userData">{{ userData.name }}</div>
</template>
```

### 📊 路由分析

强大的路由分析功能：

- **路由热力图** - 可视化展示路由访问频率
- **用户路径分析** - 分析用户的访问路径
- **转化漏斗** - 追踪用户在特定流程中的转化情况
- **统计报告** - 生成详细的统计报告

```typescript
import { createAdvancedAnalyzer } from '@ldesign/router/analytics'

const analyzer = createAdvancedAnalyzer()
analyzer.attach(router)

// 获取路由热力图
const heatmap = analyzer.getHeatmap()

// 分析转化漏斗
const funnel = analyzer.getFunnelData({
  name: '购买流程',
  steps: [
    { path: '/products', name: '商品列表', order: 1 },
    { path: '/cart', name: '购物车', order: 2 },
    { path: '/checkout', name: '结算', order: 3 },
    { path: '/success', name: '完成', order: 4 }
  ]
})
```

### 🎨 丰富动画

内置 10+ 种预设路由过渡动画：

- `fade` - 淡入淡出
- `slide-left` / `slide-right` - 左右滑动
- `slide-up` / `slide-down` - 上下滑动
- `scale` - 缩放
- `flip` - 翻转
- `rotate` - 旋转
- `bounce` - 弹跳
- `zoom` - 变焦

```vue
<template>
  <RouterView animation="fade" />
  
  <RouterLink to="/about" animation="slide">关于我们</RouterLink>
</template>
```

### 📱 设备适配

智能设备检测和适配：

- **设备特定组件** - 为不同设备提供不同的组件
- **设备访问控制** - 限制特定路由只能在指定设备访问
- **响应式路由** - 根据设备自动调整路由行为

```typescript
const routes = [
  {
    path: '/',
    // 为不同设备配置不同组件
    deviceComponents: {
      mobile: () => import('@/views/mobile/Home.vue'),
      tablet: () => import('@/views/tablet/Home.vue'),
      desktop: () => import('@/views/desktop/Home.vue')
    }
  },
  {
    path: '/admin',
    component: AdminPanel,
    meta: {
      // 限制只能在桌面设备访问
      supportedDevices: ['desktop']
    }
  }
]
```

### 🔧 插件化架构

模块化设计，按需加载功能：

```typescript
// 基础路由功能
import { createRouter } from '@ldesign/router'

// 按需加载高级功能
import { createPerformancePlugin } from '@ldesign/router/plugins/performance'
import { createCachePlugin } from '@ldesign/router/plugins/cache'
import { createSEOPlugin } from '@ldesign/router/features/seo'

const router = createRouter({ routes })

// 安装插件
router.use(createPerformancePlugin())
router.use(createCachePlugin())
router.use(createSEOPlugin())
```

## 与 vue-router 的区别

| 特性 | @ldesign/router | vue-router |
|------|----------------|------------|
| 性能 | ⚡ 高性能优化 | 标准性能 |
| 类型安全 | 🛡️ 完整支持 | 部分支持 |
| 独立性 | ✅ 完全独立 | ❌ 紧耦合 |
| SEO 优化 | ✅ 内置支持 | ❌ 需要手动 |
| 智能预加载 | ✅ 行为预测 | ❌ 无 |
| SSR 支持 | ✅ 开箱即用 | ⚠️ 需要配置 |
| 路由分析 | ✅ 内置支持 | ❌ 需要第三方 |
| 设备适配 | ✅ 内置支持 | ❌ 需要手动 |
| Engine 集成 | ✅ 深度集成 | ❌ 无 |
| 包体积 | 📦 20KB (min+gzip) | 📦 ~15KB |

::: tip 注意
虽然包体积略大，但 @ldesign/router 包含了更多开箱即用的功能，整体来说性价比更高。
:::

## 浏览器支持

@ldesign/router 支持所有现代浏览器：

- Chrome >= 64
- Firefox >= 67
- Safari >= 12
- Edge >= 79

::: warning 注意
不支持 IE 11。如果需要支持 IE 11，请使用 polyfill 或考虑使用 vue-router。
:::

## 下一步

- [快速开始](/guide/getting-started) - 了解如何使用 @ldesign/router
- [核心概念](/guide/route-configuration) - 学习路由配置的基础知识
- [API 参考](/api/core) - 查看完整的 API 文档
- [示例](/examples/basic) - 查看实际应用示例

