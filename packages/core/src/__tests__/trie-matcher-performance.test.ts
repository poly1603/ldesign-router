/**
 * Trie 匹配器性能测试
 * 
 * 验证 Trie 树匹配器的性能优化效果
 * 目标：路由匹配 < 0.5ms
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createTrieMatcher } from '../utils/trie-matcher'
import { createMatcherRegistry } from '../utils/matcher'

describe('Trie 匹配器性能测试', () => {
  describe('性能对比：Trie vs 传统匹配器', () => {
    it('静态路由匹配性能：Trie 应优于传统匹配器', () => {
      const trieMatcher = createTrieMatcher({
        enableCache: false, // 禁用缓存以测试原始性能
        enableStats: true,
      })

      const traditionalMatcher = createMatcherRegistry({
        enableCache: false,
      })

      // 准备测试路由
      const routes = [
        { path: '/home', name: 'home' },
        { path: '/about', name: 'about' },
        { path: '/contact', name: 'contact' },
        { path: '/user/profile', name: 'profile' },
        { path: '/user/settings', name: 'settings' },
        { path: '/admin/dashboard', name: 'dashboard' },
        { path: '/admin/users', name: 'users' },
        { path: '/blog/posts', name: 'posts' },
        { path: '/blog/categories', name: 'categories' },
        { path: '/products/list', name: 'productList' },
      ]

      // 注册路由
      routes.forEach(route => {
        trieMatcher.addRoute(route.path, route)
        traditionalMatcher.addRoute(route.path, route)
      })

      // 测试路径
      const testPaths = [
        '/home',
        '/about',
        '/user/profile',
        '/admin/dashboard',
        '/blog/posts',
      ]

      // Trie 匹配器性能测试
      const trieStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        testPaths.forEach(path => {
          trieMatcher.match(path)
        })
      }
      const trieEnd = performance.now()
      const trieTime = trieEnd - trieStart

      // 传统匹配器性能测试
      const traditionalStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        testPaths.forEach(path => {
          traditionalMatcher.match(path)
        })
      }
      const traditionalEnd = performance.now()
      const traditionalTime = traditionalEnd - traditionalStart

      const improvement = ((traditionalTime - trieTime) / traditionalTime) * 100

      console.log('\n📊 静态路由性能对比:')
      console.log(`  传统匹配器: ${traditionalTime.toFixed(2)}ms`)
      console.log(`  Trie 匹配器: ${trieTime.toFixed(2)}ms`)
      console.log(`  性能提升: ${improvement.toFixed(1)}%`)

      // Trie 应该更快或至少相当
      expect(trieTime).toBeLessThanOrEqual(traditionalTime * 1.1) // 允许 10% 误差
    })

    it('动态路由匹配性能：应满足 < 0.5ms 要求', () => {
      const matcher = createTrieMatcher({
        enableCache: false,
        enableStats: true,
      })

      // 添加动态路由
      matcher.addRoute('/user/:id', { name: 'user' })
      matcher.addRoute('/post/:id/comment/:commentId', { name: 'comment' })
      matcher.addRoute('/category/:slug/product/:productId', { name: 'product' })

      const testPaths = [
        '/user/123',
        '/post/456/comment/789',
        '/category/electronics/product/999',
      ]

      // 性能测试
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        testPaths.forEach(path => {
          matcher.match(path)
        })
      }
      const end = performance.now()
      const totalTime = end - start
      const avgTime = totalTime / (1000 * testPaths.length)

      console.log('\n⚡ 动态路由性能:')
      console.log(`  总耗时: ${totalTime.toFixed(2)}ms`)
      console.log(`  平均单次匹配: ${avgTime.toFixed(4)}ms`)
      console.log(`  匹配次数: ${1000 * testPaths.length}`)

      // 验证性能目标：单次匹配 < 0.5ms
      expect(avgTime).toBeLessThan(0.5)
    })
  })

  describe('缓存效果测试', () => {
    it('LRU 缓存应显著提升重复路径匹配性能', () => {
      const withCache = createTrieMatcher({
        enableCache: true,
        cacheSize: 100,
        enableStats: true,
      })

      const withoutCache = createTrieMatcher({
        enableCache: false,
        enableStats: true,
      })

      // 添加路由
      const routes = Array.from({ length: 50 }, (_, i) => ({
        path: `/route${i}`,
        name: `route${i}`,
      }))

      routes.forEach(route => {
        withCache.addRoute(route.path, route)
        withoutCache.addRoute(route.path, route)
      })

      // 测试：重复访问前 10 条路由
      const hotPaths = routes.slice(0, 10).map(r => r.path)

      // 无缓存性能
      const noCacheStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        hotPaths.forEach(path => withoutCache.match(path))
      }
      const noCacheTime = performance.now() - noCacheStart

      // 有缓存性能
      const cacheStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        hotPaths.forEach(path => withCache.match(path))
      }
      const cacheTime = performance.now() - cacheStart

      const stats = withCache.getStats()
      const improvement = ((noCacheTime - cacheTime) / noCacheTime) * 100

      console.log('\n🚀 缓存效果:')
      console.log(`  无缓存耗时: ${noCacheTime.toFixed(2)}ms`)
      console.log(`  有缓存耗时: ${cacheTime.toFixed(2)}ms`)
      console.log(`  性能提升: ${improvement.toFixed(1)}%`)
      console.log(`  缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`)

      // 缓存应该显著提升性能
      expect(cacheTime).toBeLessThan(noCacheTime * 0.5) // 至少快 50%
      expect(stats.cacheHitRate).toBeGreaterThan(0.9) // 命中率 > 90%
    })
  })

  describe('大规模路由测试', () => {
    it('应能高效处理 1000+ 路由', () => {
      const matcher = createTrieMatcher({
        enableCache: true,
        enableStats: true,
      })

      // 创建 1000 个路由
      const routes = Array.from({ length: 1000 }, (_, i) => ({
        path: `/route/${Math.floor(i / 10)}/sub/${i % 10}`,
        name: `route${i}`,
      }))

      // 测试添加性能
      const addStart = performance.now()
      routes.forEach(route => matcher.addRoute(route.path, route))
      const addTime = performance.now() - addStart

      // 测试匹配性能
      const testPaths = [
        routes[0].path,
        routes[500].path,
        routes[999].path,
      ]

      const matchStart = performance.now()
      for (let i = 0; i < 1000; i++) {
        testPaths.forEach(path => matcher.match(path))
      }
      const matchTime = performance.now() - matchStart
      const avgMatchTime = matchTime / (1000 * testPaths.length)

      console.log('\n📈 大规模路由测试:')
      console.log(`  路由数量: ${routes.length}`)
      console.log(`  添加耗时: ${addTime.toFixed(2)}ms`)
      console.log(`  平均添加: ${(addTime / routes.length).toFixed(4)}ms/路由`)
      console.log(`  匹配耗时: ${matchTime.toFixed(2)}ms`)
      console.log(`  平均匹配: ${avgMatchTime.toFixed(4)}ms`)

      expect(matcher.size).toBe(1000)
      expect(avgMatchTime).toBeLessThan(0.5) // 仍然满足性能要求
    })
  })

  describe('统计功能测试', () => {
    it('应正确记录匹配统计', () => {
      const matcher = createTrieMatcher({
        enableStats: true,
      })

      matcher.addRoute('/test', { name: 'test' })

      // 执行一些匹配
      matcher.match('/test')
      matcher.match('/test')
      matcher.match('/nonexistent')

      const stats = matcher.getStats()

      expect(stats.totalMatches).toBe(3)
      expect(stats.avgMatchTime).toBeGreaterThan(0)
      expect(stats.fastestMatch).toBeLessThanOrEqual(stats.slowestMatch)

      console.log('\n📊 匹配统计:')
      console.log(`  总匹配次数: ${stats.totalMatches}`)
      console.log(`  缓存命中: ${stats.cacheHits}`)
      console.log(`  缓存未命中: ${stats.cacheMisses}`)
      console.log(`  平均耗时: ${stats.avgMatchTime.toFixed(4)}ms`)
      console.log(`  最快: ${stats.fastestMatch.toFixed(4)}ms`)
      console.log(`  最慢: ${stats.slowestMatch.toFixed(4)}ms`)
    })
  })

  describe('功能完整性测试', () => {
    let matcher: ReturnType<typeof createTrieMatcher>

    beforeEach(() => {
      matcher = createTrieMatcher()
    })

    it('应正确匹配静态路由', () => {
      matcher.addRoute('/home', { name: 'home', title: 'Home' })

      const result = matcher.match('/home')

      expect(result.matched).toBe(true)
      expect(result.route?.name).toBe('home')
      expect(result.params).toEqual({})
    })

    it('应正确提取动态参数', () => {
      matcher.addRoute('/user/:id', { name: 'user' })

      const result = matcher.match('/user/123')

      expect(result.matched).toBe(true)
      expect(result.params).toEqual({ id: '123' })
    })

    it('应支持多个动态参数', () => {
      matcher.addRoute('/post/:id/comment/:commentId', { name: 'comment' })

      const result = matcher.match('/post/456/comment/789')

      expect(result.matched).toBe(true)
      expect(result.params).toEqual({
        id: '456',
        commentId: '789',
      })
    })

    it('静态路由应优先于动态路由', () => {
      matcher.addRoute('/user/:id', { name: 'dynamic' })
      matcher.addRoute('/user/profile', { name: 'static' })

      const result = matcher.match('/user/profile')

      expect(result.matched).toBe(true)
      expect(result.route?.name).toBe('static')
    })

    it('应支持路由移除', () => {
      matcher.addRoute('/test', { name: 'test' })

      expect(matcher.hasRoute('test')).toBe(true)

      const removed = matcher.removeRoute('test')

      expect(removed).toBe(true)
      expect(matcher.hasRoute('test')).toBe(false)
    })

    it('应支持根据名称生成路径', () => {
      matcher.addRoute('/user/:id/post/:postId', { name: 'userPost' })

      const path = matcher.generatePath('userPost', { id: '123', postId: '456' })

      expect(path).toBe('/user/123/post/456')
    })
  })
})