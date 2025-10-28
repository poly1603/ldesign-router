/**
 * 路由匹配器测试
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { RouteMatcher } from '../matcher'
import type { RouteRecordRaw } from '../../../packages/core/src/types'

describe('RouteMatcher', () => {
  let matcher: RouteMatcher

  beforeEach(() => {
    matcher = new RouteMatcher(100)
  })

  afterEach(() => {
    matcher.clearCache()
  })

  describe('基础功能', () => {
    it('应该正确创建 RouteMatcher 实例', () => {
      expect(matcher).toBeInstanceOf(RouteMatcher)
    })

    it('应该支持自定义缓存大小', () => {
      const customMatcher = new RouteMatcher(200)
      const stats = customMatcher.getStats()
      expect(stats.adaptiveCache.currentSize).toBe(200)
    })
  })

  describe('addRoute', () => {
    it('应该添加简单路由', () => {
      const route: RouteRecordRaw = {
        path: '/about',
        name: 'about',
      }

      const normalized = matcher.addRoute(route)

      expect(normalized.path).toBe('/about')
      expect(normalized.name).toBe('about')
    })

    it('应该添加带参数的路由', () => {
      const route: RouteRecordRaw = {
        path: '/user/:id',
        name: 'user',
      }

      const normalized = matcher.addRoute(route)

      expect(normalized.path).toBe('/user/:id')
    })

    it('应该添加嵌套路由', () => {
      const route: RouteRecordRaw = {
        path: '/parent',
        name: 'parent',
        children: [
          {
            path: 'child',
            name: 'child',
          },
        ],
      }

      matcher.addRoute(route)

      const routes = matcher.getRoutes()
      expect(routes.length).toBeGreaterThanOrEqual(1)
    })

    it('应该添加通配符路由', () => {
      const route: RouteRecordRaw = {
        path: '/files/*',
        name: 'files',
      }

      const normalized = matcher.addRoute(route)

      expect(normalized.path).toBe('/files/*')
    })

    it('应该为没有名称的路由生成内部名称', () => {
      const route: RouteRecordRaw = {
        path: '/unnamed',
      }

      const normalized = matcher.addRoute(route)

      expect(normalized.name).toBeDefined()
    })
  })

  describe('removeRoute', () => {
    it('应该移除已添加的路由', () => {
      const route: RouteRecordRaw = {
        path: '/temp',
        name: 'temp',
      }

      matcher.addRoute(route)
      expect(matcher.hasRoute('temp')).toBe(true)

      matcher.removeRoute('temp')
      expect(matcher.hasRoute('temp')).toBe(false)
    })

    it('应该处理移除不存在的路由', () => {
      expect(() => matcher.removeRoute('nonexistent')).not.toThrow()
    })
  })

  describe('getRoutes', () => {
    it('应该返回所有路由', () => {
      matcher.addRoute({ path: '/a', name: 'a' })
      matcher.addRoute({ path: '/b', name: 'b' })
      matcher.addRoute({ path: '/c', name: 'c' })

      const routes = matcher.getRoutes()

      expect(routes.length).toBeGreaterThanOrEqual(3)
    })

    it('应该隐藏内部 Symbol 名称', () => {
      matcher.addRoute({ path: '/unnamed' })

      const routes = matcher.getRoutes()
      const unnamed = routes.find(r => r.path === '/unnamed')

      expect(unnamed?.name).toBeUndefined()
    })
  })

  describe('hasRoute', () => {
    it('应该检查路由是否存在', () => {
      matcher.addRoute({ path: '/test', name: 'test' })

      expect(matcher.hasRoute('test')).toBe(true)
      expect(matcher.hasRoute('nonexistent')).toBe(false)
    })
  })

  describe('matchByPath', () => {
    beforeEach(() => {
      // 添加测试路由
      matcher.addRoute({ path: '/', name: 'home' })
      matcher.addRoute({ path: '/about', name: 'about' })
      matcher.addRoute({ path: '/user/:id', name: 'user' })
      matcher.addRoute({ path: '/post/:category/:id', name: 'post' })
      matcher.addRoute({ path: '/files/*', name: 'files' })
    })

    it('应该匹配根路径', () => {
      const match = matcher.matchByPath('/')

      expect(match).not.toBeNull()
      expect(match?.record.path).toBe('/')
    })

    it('应该匹配静态路径', () => {
      const match = matcher.matchByPath('/about')

      expect(match).not.toBeNull()
      expect(match?.record.path).toBe('/about')
      expect(match?.record.name).toBe('about')
    })

    it('应该匹配动态路径并提取参数', () => {
      const match = matcher.matchByPath('/user/123')

      expect(match).not.toBeNull()
      expect(match?.record.path).toBe('/user/:id')
      expect(match?.params).toEqual({ id: '123' })
    })

    it('应该匹配多参数路径', () => {
      const match = matcher.matchByPath('/post/tech/456')

      expect(match).not.toBeNull()
      expect(match?.record.path).toBe('/post/:category/:id')
      expect(match?.params).toEqual({
        category: 'tech',
        id: '456',
      })
    })

    it('应该匹配通配符路径', () => {
      const match = matcher.matchByPath('/files/docs/readme.txt')

      expect(match).not.toBeNull()
      expect(match?.record.path).toBe('/files/*')
      expect(match?.params.pathMatch).toBe('docs/readme.txt')
    })

    it('应该处理不匹配的路径', () => {
      const match = matcher.matchByPath('/nonexistent')

      expect(match).toBeNull()
    })

    it('应该处理 URL 编码的路径', () => {
      const match = matcher.matchByPath('/user/hello%20world')

      expect(match).not.toBeNull()
      expect(match?.params.id).toBe('hello%20world')
    })
  })

  describe('matchByName', () => {
    beforeEach(() => {
      matcher.addRoute({ path: '/about', name: 'about' })
      matcher.addRoute({ path: '/user/:id', name: 'user' })
    })

    it('应该通过名称匹配路由', () => {
      const match = matcher.matchByName('about')

      expect(match).not.toBeNull()
      expect(match?.path).toBe('/about')
    })

    it('应该处理不存在的名称', () => {
      const match = matcher.matchByName('nonexistent')

      expect(match).toBeNull()
    })
  })

  describe('resolve', () => {
    beforeEach(() => {
      matcher.addRoute({ path: '/about', name: 'about' })
      matcher.addRoute({ path: '/user/:id', name: 'user' })
    })

    it('应该解析字符串路径', () => {
      const location = matcher.resolve('/about')

      expect(location.path).toBe('/about')
      expect(location.name).toBe('about')
    })

    it('应该解析带查询参数的路径', () => {
      const location = matcher.resolve('/about?tab=info')

      expect(location.path).toBe('/about')
      expect(location.query).toEqual({ tab: 'info' })
    })

    it('应该解析路径对象', () => {
      const location = matcher.resolve({
        path: '/about',
        query: { page: '1' },
      })

      expect(location.path).toBe('/about')
      expect(location.query).toEqual({ page: '1' })
    })

    it('应该解析命名路由', () => {
      const location = matcher.resolve({
        name: 'user',
        params: { id: '123' },
      })

      expect(location.path).toBe('/user/123')
      expect(location.params).toEqual({ id: '123' })
    })

    it('应该处理无效的路由位置', () => {
      expect(() => matcher.resolve({} as any)).toThrow()
    })
  })

  describe('缓存功能', () => {
    beforeEach(() => {
      matcher.addRoute({ path: '/cached', name: 'cached' })
    })

    it('应该缓存匹配结果', () => {
      // 第一次匹配
      matcher.matchByPath('/cached')
      const stats1 = matcher.getStats()
      const misses1 = stats1.cacheMisses

      // 第二次匹配（应该命中缓存）
      matcher.matchByPath('/cached')
      const stats2 = matcher.getStats()
      const hits2 = stats2.cacheHits

      expect(hits2).toBeGreaterThan(0)
      expect(stats2.cacheMisses).toBe(misses1)
    })

    it('应该清理缓存', () => {
      matcher.matchByPath('/cached')
      matcher.clearCache()

      const stats = matcher.getStats()
      expect(stats.cacheHits).toBe(0)
      expect(stats.cacheMisses).toBe(0)
    })

    it('应该统计缓存命中率', () => {
      // 执行多次匹配
      for (let i = 0; i < 10; i++) {
        matcher.matchByPath('/cached')
      }

      const stats = matcher.getStats()
      const hitRate = stats.totalMatches > 0
        ? stats.cacheHits / stats.totalMatches
        : 0

      expect(hitRate).toBeGreaterThan(0.5) // 命中率应该超过 50%
    })
  })

  describe('热点分析', () => {
    beforeEach(() => {
      matcher.addRoute({ path: '/popular', name: 'popular' })
      matcher.addRoute({ path: '/rare', name: 'rare' })
    })

    it('应该记录热点路由', () => {
      // 多次访问热门路由
      for (let i = 0; i < 10; i++) {
        matcher.matchByPath('/popular')
      }

      // 少量访问冷门路由
      matcher.matchByPath('/rare')

      const stats = matcher.getStats()
      const hotspots = stats.hotspots

      expect(hotspots.length).toBeGreaterThan(0)
      expect(hotspots[0]?.path).toBe('/popular')
    })
  })

  describe('预热功能', () => {
    beforeEach(() => {
      matcher.addRoute({ path: '/home', name: 'home' })
      matcher.addRoute({ path: '/about', name: 'about' })
      matcher.addRoute({ path: '/contact', name: 'contact' })
    })

    it('应该预热指定路由', () => {
      matcher.preheat(['/home', '/about'])

      const stats = matcher.getStats()
      expect(stats.preheated).toBe(true)
    })

    it('应该避免重复预热', () => {
      matcher.preheat(['/home'])
      matcher.preheat(['/about']) // 第二次预热应该被忽略

      const stats = matcher.getStats()
      expect(stats.preheated).toBe(true)
    })

    it('应该重置预热状态', () => {
      matcher.preheat(['/home'])
      matcher.resetPreheat()

      const stats = matcher.getStats()
      expect(stats.preheated).toBe(false)
    })
  })

  describe('性能测试', () => {
    it('应该快速添加大量路由', () => {
      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        matcher.addRoute({
          path: `/page${i}`,
          name: `page${i}`,
        })
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // 应该在 1 秒内完成
    })

    it('应该快速匹配路径', () => {
      // 添加一些路由
      for (let i = 0; i < 100; i++) {
        matcher.addRoute({
          path: `/page${i}`,
          name: `page${i}`,
        })
      }

      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        matcher.matchByPath(`/page${i % 100}`)
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // 应该在 100ms 内完成
    })

    it('应该保持高缓存命中率', () => {
      matcher.addRoute({ path: '/hot', name: 'hot' })

      // 多次访问同一路由
      for (let i = 0; i < 100; i++) {
        matcher.matchByPath('/hot')
      }

      const stats = matcher.getStats()
      const hitRate = stats.cacheHits / stats.totalMatches

      expect(hitRate).toBeGreaterThan(0.75) // 命中率应该超过 75%
    })
  })

  describe('边界情况', () => {
    it('应该处理空路径', () => {
      const route: RouteRecordRaw = {
        path: '',
        name: 'empty',
      }

      expect(() => matcher.addRoute(route)).not.toThrow()
    })

    it('应该处理极长的路径', () => {
      const longPath = '/path/' + 'segment/'.repeat(100)
      const route: RouteRecordRaw = {
        path: longPath,
        name: 'long',
      }

      matcher.addRoute(route)
      const match = matcher.matchByPath(longPath)

      expect(match).not.toBeNull()
    })

    it('应该处理特殊字符路径', () => {
      const route: RouteRecordRaw = {
        path: '/path-with_special.chars',
        name: 'special',
      }

      matcher.addRoute(route)
      const match = matcher.matchByPath('/path-with_special.chars')

      expect(match).not.toBeNull()
    })

    it('应该处理中文路径', () => {
      const route: RouteRecordRaw = {
        path: '/文档/介绍',
        name: 'docs',
      }

      matcher.addRoute(route)
      const match = matcher.matchByPath('/文档/介绍')

      expect(match).not.toBeNull()
    })

    it('应该处理大量参数', () => {
      const route: RouteRecordRaw = {
        path: '/:a/:b/:c/:d/:e',
        name: 'multi-params',
      }

      matcher.addRoute(route)
      const match = matcher.matchByPath('/1/2/3/4/5')

      expect(match).not.toBeNull()
      expect(match?.params).toEqual({
        a: '1',
        b: '2',
        c: '3',
        d: '4',
        e: '5',
      })
    })
  })

  describe('getStats', () => {
    it('应该返回完整的统计信息', () => {
      matcher.addRoute({ path: '/test', name: 'test' })
      matcher.matchByPath('/test')

      const stats = matcher.getStats()

      expect(stats).toHaveProperty('cacheHits')
      expect(stats).toHaveProperty('cacheMisses')
      expect(stats).toHaveProperty('totalMatches')
      expect(stats).toHaveProperty('averageMatchTime')
      expect(stats).toHaveProperty('cacheStats')
      expect(stats).toHaveProperty('compiledPathsCount')
      expect(stats).toHaveProperty('routesCount')
      expect(stats).toHaveProperty('hotspots')
      expect(stats).toHaveProperty('adaptiveCache')
      expect(stats).toHaveProperty('preheated')
    })
  })
})

