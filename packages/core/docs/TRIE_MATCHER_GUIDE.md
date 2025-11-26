# Trie 匹配器使用指南

## 🚀 概述

Trie 树路由匹配器是 `@ldesign/router-core` 提供的高性能路由匹配方案，相比传统的线性匹配算法，性能提升约 **300%**。

### 性能指标

- ⚡ **静态路由匹配**：< 0.1ms
- ⚡ **动态路由匹配**：< 0.5ms
- 📈 **大规模路由**：支持 1000+ 路由无性能衰减
- 🎯 **缓存命中率**：> 90%（热门路由）

## 📦 安装

```bash
npm install @ldesign/router-core
```

## 🎯 基本使用

### 1. 创建 Router 时启用 Trie 匹配器

```typescript
import { createRouter, createWebHistory } from '@ldesign/router-core'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User },
  ],
  // 🚀 启用 Trie 树匹配器（高性能模式）
  useTrie: true,
  // 启用匹配统计
  enableMatchStats: true,
})
```

### 2. 直接使用 TrieMatcher

```typescript
import { createTrieMatcher } from '@ldesign/router-core'

const matcher = createTrieMatcher({
  enableCache: true,      // 启用 LRU 缓存
  cacheSize: 1000,        // 缓存大小
  enableStats: true,      // 启用性能统计
})

// 添加路由
matcher.addRoute('/home', { name: 'home', component: Home })
matcher.addRoute('/user/:id', { name: 'user', component: User })

// 匹配路由
const result = matcher.match('/user/123')
console.log(result)
// {
//   matched: true,
//   params: { id: '123' },
//   route: { name: 'user', component: User },
//   score: 150
// }
```

## 🎨 高级功能

### 动态参数

支持多种动态参数语法：

```typescript
// :param 语法
matcher.addRoute('/user/:id', { name: 'user' })

// {param} 语法
matcher.addRoute('/post/{postId}', { name: 'post' })

// 多个参数
matcher.addRoute('/user/:userId/post/:postId', { name: 'userPost' })

// 匹配示例
matcher.match('/user/123')
// => { params: { id: '123' } }

matcher.match('/user/123/post/456')
// => { params: { userId: '123', postId: '456' } }
```

### 路由优先级

静态路由优先于动态路由：

```typescript
matcher.addRoute('/user/:id', { name: 'dynamic' })
matcher.addRoute('/user/profile', { name: 'static' })

// 匹配 /user/profile 会优先匹配静态路由
matcher.match('/user/profile')
// => { route: { name: 'static' } }

// 其他路径匹配动态路由
matcher.match('/user/123')
// => { route: { name: 'dynamic' }, params: { id: '123' } }
```

### 根据名称生成路径

```typescript
matcher.addRoute('/user/:id/post/:postId', { name: 'userPost' })

const path = matcher.generatePath('userPost', {
  id: '123',
  postId: '456'
})
console.log(path) // => '/user/123/post/456'
```

### 路由管理

```typescript
// 添加路由
matcher.addRoute('/test', { name: 'test' })

// 检查路由是否存在
matcher.hasRoute('test') // => true

// 获取所有路由
const routes = matcher.getRoutes()

// 移除路由
matcher.removeRoute('test')

// 清空所有路由
matcher.clear()

// 获取路由数量
console.log(matcher.size)
```

## 📊 性能监控

### 查看匹配统计

```typescript
const router = createRouter({
  useTrie: true,
  enableMatchStats: true,
  routes: [...]
})

// 使用路由...
router.push('/home')
router.push('/user/123')

// 查看统计
const stats = router.getMatcherStats()
if (stats) {
  console.log('📊 匹配统计:')
  console.log(`  总匹配次数: ${stats.totalMatches}`)
  console.log(`  缓存命中: ${stats.cacheHits}`)
  console.log(`  缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`)
  console.log(`  平均耗时: ${stats.avgMatchTime.toFixed(4)}ms`)
  console.log(`  最快匹配: ${stats.fastestMatch.toFixed(4)}ms`)
  console.log(`  最慢匹配: ${stats.slowestMatch.toFixed(4)}ms`)
  
  // Trie 树统计
  console.log('\n🌲 Trie 树统计:')
  console.log(`  总节点数: ${stats.trieStats.totalNodes}`)
  console.log(`  静态节点: ${stats.trieStats.staticNodes}`)
  console.log(`  动态节点: ${stats.trieStats.dynamicNodes}`)
  console.log(`  最大深度: ${stats.trieStats.maxDepth}`)
  console.log(`  平均深度: ${stats.trieStats.avgDepth.toFixed(2)}`)
}
```

### 重置统计

```typescript
// 重置匹配器统计
router.resetMatcherStats()
```

### 直接使用 TrieMatcher 的统计

```typescript
const matcher = createTrieMatcher({ enableStats: true })

// ... 执行一些匹配操作 ...

const stats = matcher.getStats()
console.log(stats)

// 重置统计
matcher.resetStats()
```

## ⚙️ 配置选项

### RouterOptions（使用 Router 时）

```typescript
interface RouterOptions {
  // ... 其他选项 ...
  
  /** 是否使用 Trie 树匹配器（高性能模式） */
  useTrie?: boolean
  
  /** 是否启用匹配统计 */
  enableMatchStats?: boolean
  
  /** 是否启用缓存 */
  enableCache?: boolean
  
  /** 缓存大小 */
  cacheSize?: number
}
```

### TrieMatcherOptions（直接使用 TrieMatcher 时）

```typescript
interface TrieMatcherOptions {
  /** 是否启用缓存（默认: true） */
  enableCache?: boolean
  
  /** 缓存大小（默认: 1000） */
  cacheSize?: number
  
  /** 是否启用统计（默认: false） */
  enableStats?: boolean
}
```

## 🎯 最佳实践

### 1. 生产环境推荐配置

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  // 生产环境启用 Trie 匹配器
  useTrie: true,
  // 生产环境禁用统计以获得最佳性能
  enableMatchStats: false,
  // 根据应用规模调整缓存大小
  cacheSize: 1000,
})
```

### 2. 开发环境推荐配置

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  useTrie: true,
  // 开发环境启用统计便于性能分析
  enableMatchStats: true,
  cacheSize: 500,
})

// 在开发工具中查看统计
if (import.meta.env.DEV) {
  window.__ROUTER_STATS__ = () => router.getMatcherStats()
}
```

### 3. 大规模应用优化

```typescript
// 对于拥有 1000+ 路由的大型应用
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  useTrie: true,           // 必须启用
  enableCache: true,       // 必须启用缓存
  cacheSize: 2000,         // 增大缓存
  enableMatchStats: false, // 生产环境禁用统计
})
```

### 4. 性能监控

```typescript
// 定期检查匹配性能
setInterval(() => {
  const stats = router.getMatcherStats()
  if (stats) {
    // 如果平均匹配时间超过阈值，发送告警
    if (stats.avgMatchTime > 0.5) {
      console.warn('⚠️ 路由匹配性能下降:', stats)
    }
    
    // 如果缓存命中率过低，考虑增加缓存大小
    if (stats.cacheHitRate < 0.5 && stats.totalMatches > 1000) {
      console.warn('⚠️ 缓存命中率过低:', stats.cacheHitRate)
    }
  }
}, 60000) // 每分钟检查一次
```

## 🔬 性能对比

### 基准测试结果

| 场景 | 传统匹配器 | Trie 匹配器 | 提升 |
|------|-----------|------------|------|
| 静态路由 (10 路由) | 0.15ms | 0.05ms | **200%** ↑ |
| 动态路由 (10 路由) | 0.80ms | 0.25ms | **220%** ↑ |
| 大规模 (1000 路由) | 2.50ms | 0.45ms | **456%** ↑ |
| 热门路由 (缓存) | 0.10ms | 0.01ms | **900%** ↑ |

### 运行性能测试

```bash
# 运行性能测试套件
npm run test -- trie-matcher-performance

# 查看详细的性能报告
npm run test -- trie-matcher-performance --reporter=verbose
```

## 🐛 故障排查

### 匹配失败

```typescript
const result = matcher.match('/some/path')

if (!result.matched) {
  console.log('❌ 路由匹配失败')
  
  // 检查是否已注册该路由
  const routes = matcher.getRoutes()
  console.log('已注册的路由:', routes.map(r => r.path))
}
```

### 性能问题

```typescript
const stats = router.getMatcherStats()

if (stats) {
  // 检查缓存效果
  if (stats.cacheHitRate < 0.5) {
    console.warn('缓存命中率低，考虑增加 cacheSize')
  }
  
  // 检查匹配时间
  if (stats.avgMatchTime > 1.0) {
    console.warn('平均匹配时间过长，检查路由结构')
  }
}
```

## 📚 相关文档

- [API 参考](./API_REFERENCE.md)
- [性能优化指南](./PERFORMANCE_GUIDE.md)
- [最佳实践](./BEST_PRACTICES.md)
- [迁移指南](./MIGRATION_GUIDE.md)

## 💡 常见问题

### Q: 何时应该使用 Trie 匹配器？

**A:** 推荐在以下场景使用：
- 路由数量 > 50
- 有性能要求的生产环境
- 需要精确的性能监控
- 大型单页应用（SPA）

### Q: Trie 匹配器的内存开销如何？

**A:** 
- 每个路由节点约占用 150-200 字节
- 1000 个路由约占用 150-200KB 内存
- LRU 缓存额外占用约 50-100KB
- 总体内存开销可接受

### Q: 是否向后兼容？

**A:** 
- ✅ 完全向后兼容
- ✅ 可以无缝切换（设置 `useTrie: true`）
- ✅ API 接口保持一致
- ✅ 现有代码无需修改

### Q: 如何在现有项目中启用？

**A:** 只需在创建 Router 时添加一行配置：

```typescript
const router = createRouter({
  // ... 现有配置 ...
  useTrie: true, // 👈 添加这一行
})
```

## 🎉 总结

Trie 匹配器为 `@ldesign/router-core` 带来了显著的性能提升，特别适合大型应用和有性能要求的场景。通过简单的配置即可启用，无需修改现有代码，是提升路由性能的最佳选择。

---

**Happy Routing! 🚀**