/**
 * URL 处理工具测试
 */

import { describe, expect, it } from 'vitest'
import {
  isSameURL,
  normalizeURL,
  parseURL,
  stringifyURL,
} from '../url'

describe('URL 处理工具', () => {
  describe('parseURL', () => {
    it('应该解析完整 URL', () => {
      const result = parseURL('/user/123?tab=profile&sort=desc#section-1')
      expect(result).toEqual({
        path: '/user/123',
        query: { tab: 'profile', sort: 'desc' },
        hash: 'section-1',
        fullPath: '/user/123?tab=profile&sort=desc#section-1',
      })
    })

    it('应该解析仅路径的 URL', () => {
      const result = parseURL('/about')
      expect(result).toEqual({
        path: '/about',
        query: {},
        hash: '',
        fullPath: '/about',
      })
    })

    it('应该解析带查询参数的 URL', () => {
      const result = parseURL('/search?q=vue&page=1')
      expect(result).toEqual({
        path: '/search',
        query: { q: 'vue', page: '1' },
        hash: '',
        fullPath: '/search?q=vue&page=1',
      })
    })

    it('应该解析带哈希的 URL', () => {
      const result = parseURL('/docs#introduction')
      expect(result).toEqual({
        path: '/docs',
        query: {},
        hash: 'introduction',
        fullPath: '/docs#introduction',
      })
    })

    it('应该解析根路径', () => {
      const result = parseURL('/')
      expect(result).toEqual({
        path: '/',
        query: {},
        hash: '',
        fullPath: '/',
      })
    })

    it('应该处理空字符串', () => {
      const result = parseURL('')
      expect(result.path).toBe('/')
    })

    it('应该解析复杂查询参数', () => {
      const result = parseURL('/search?tags=js&tags=vue&limit=20')
      expect(result.query).toEqual({
        tags: ['js', 'vue'],
        limit: '20',
      })
    })

    it('应该处理查询参数中的特殊字符', () => {
      const result = parseURL('/search?q=hello%20world&email=test%40example.com')
      expect(result.query).toEqual({
        q: 'hello world',
        email: 'test@example.com',
      })
    })

    it('应该处理多个哈希符号', () => {
      const result = parseURL('/docs#section-1#subsection')
      expect(result.hash).toBe('section-1#subsection')
    })

    it('应该处理查询参数和哈希都存在的情况', () => {
      const result = parseURL('/page?a=1&b=2#top')
      expect(result).toEqual({
        path: '/page',
        query: { a: '1', b: '2' },
        hash: 'top',
        fullPath: '/page?a=1&b=2#top',
      })
    })
  })

  describe('stringifyURL', () => {
    it('应该序列化仅路径的 URL', () => {
      expect(stringifyURL({ path: '/about' })).toBe('/about')
    })

    it('应该序列化带查询参数的 URL', () => {
      expect(stringifyURL({
        path: '/search',
        query: { q: 'vue', page: '1' },
      })).toBe('/search?q=vue&page=1')
    })

    it('应该序列化带哈希的 URL', () => {
      expect(stringifyURL({
        path: '/docs',
        hash: 'introduction',
      })).toBe('/docs#introduction')
    })

    it('应该序列化完整 URL', () => {
      expect(stringifyURL({
        path: '/user/123',
        query: { tab: 'profile' },
        hash: 'section-1',
      })).toBe('/user/123?tab=profile#section-1')
    })

    it('应该处理带 # 前缀的哈希', () => {
      expect(stringifyURL({
        path: '/docs',
        hash: '#intro',
      })).toBe('/docs#intro')
    })

    it('应该处理空查询对象', () => {
      expect(stringifyURL({
        path: '/page',
        query: {},
      })).toBe('/page')
    })

    it('应该处理空路径', () => {
      expect(stringifyURL({
        path: '',
        query: { a: '1' },
      })).toBe('/?a=1')
    })

    it('应该处理数组查询参数', () => {
      expect(stringifyURL({
        path: '/search',
        query: { tags: ['js', 'vue'] },
      })).toBe('/search?tags=js&tags=vue')
    })

    it('应该过滤 null 和 undefined 查询参数', () => {
      expect(stringifyURL({
        path: '/page',
        query: { a: '1', b: null, c: undefined },
      })).toBe('/page?a=1')
    })
  })

  describe('normalizeURL', () => {
    it('应该规范化简单 URL', () => {
      expect(normalizeURL('/about')).toBe('/about')
    })

    it('应该规范化带查询参数的 URL', () => {
      expect(normalizeURL('/search?a=1&b=2')).toBe('/search?a=1&b=2')
    })

    it('应该规范化带哈希的 URL', () => {
      expect(normalizeURL('/docs#intro')).toBe('/docs#intro')
    })

    it('应该规范化完整 URL', () => {
      expect(normalizeURL('/user/123?tab=profile#section'))
        .toBe('/user/123?tab=profile#section')
    })

    it('应该处理重复的斜杠', () => {
      const normalized = normalizeURL('//about//')
      expect(normalized).toBe('//about//')
    })

    it('应该处理空字符串', () => {
      expect(normalizeURL('')).toBe('/')
    })

    it('应该保留数组查询参数', () => {
      const normalized = normalizeURL('/search?tags=js&tags=vue')
      expect(normalized).toBe('/search?tags=js&tags=vue')
    })
  })

  describe('isSameURL', () => {
    it('应该识别相同的简单 URL', () => {
      expect(isSameURL('/about', '/about')).toBe(true)
    })

    it('应该识别查询参数顺序不同但内容相同的 URL', () => {
      expect(isSameURL('/search?a=1&b=2', '/search?b=2&a=1')).toBe(true)
    })

    it('应该识别不同的路径', () => {
      expect(isSameURL('/about', '/contact')).toBe(false)
    })

    it('应该识别不同的查询参数', () => {
      expect(isSameURL('/search?q=vue', '/search?q=react')).toBe(false)
    })

    it('应该识别不同的哈希', () => {
      expect(isSameURL('/docs#intro', '/docs#guide')).toBe(false)
    })

    it('应该处理没有查询参数的 URL', () => {
      expect(isSameURL('/about', '/about')).toBe(true)
      expect(isSameURL('/about', '/contact')).toBe(false)
    })

    it('应该处理一个有查询参数一个没有', () => {
      expect(isSameURL('/search', '/search?q=vue')).toBe(false)
    })

    it('应该处理数组查询参数', () => {
      expect(isSameURL(
        '/search?tags=js&tags=vue',
        '/search?tags=js&tags=vue',
      )).toBe(true)

      expect(isSameURL(
        '/search?tags=js&tags=vue',
        '/search?tags=vue&tags=js',
      )).toBe(false) // 数组顺序不同
    })

    it('应该处理空哈希', () => {
      expect(isSameURL('/docs', '/docs#')).toBe(true)
    })

    it('应该处理查询参数数量不同', () => {
      expect(isSameURL('/search?a=1', '/search?a=1&b=2')).toBe(false)
    })

    it('应该处理完全相同的复杂 URL', () => {
      const url = '/user/123?tab=profile&sort=desc#section-1'
      expect(isSameURL(url, url)).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('应该快速处理复杂 URL', () => {
      const largeQuery: Record<string, string> = {}
      for (let i = 0; i < 100; i++) {
        largeQuery[`param${i}`] = `value${i}`
      }

      const url = stringifyURL({
        path: '/search',
        query: largeQuery,
        hash: 'results',
      })

      const start = Date.now()
      const parsed = parseURL(url)
      const normalized = normalizeURL(url)
      const same = isSameURL(url, url)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(50) // 应该在 50ms 内完成
      expect(Object.keys(parsed.query)).toHaveLength(100)
      expect(normalized).toBe(url)
      expect(same).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理极长的路径', () => {
      const longPath = '/path/' + 'segment/'.repeat(100)
      const parsed = parseURL(longPath)
      expect(parsed.path).toBe(longPath)
    })

    it('应该处理极长的查询参数', () => {
      const longValue = 'a'.repeat(1000)
      const url = stringifyURL({
        path: '/page',
        query: { data: longValue },
      })
      const parsed = parseURL(url)
      expect(parsed.query.data).toBe(longValue)
    })

    it('应该处理极长的哈希', () => {
      const longHash = 'section-' + 'a'.repeat(1000)
      const url = stringifyURL({
        path: '/docs',
        hash: longHash,
      })
      const parsed = parseURL(url)
      expect(parsed.hash).toBe(longHash)
    })

    it('应该处理特殊路径字符', () => {
      const specialPath = '/path/with-dashes/and_underscores/and.dots'
      const parsed = parseURL(specialPath)
      expect(parsed.path).toBe(specialPath)
    })

    it('应该处理中文路径', () => {
      const chinesePath = '/文档/介绍'
      const parsed = parseURL(chinesePath)
      expect(parsed.path).toBe(chinesePath)
    })
  })

  describe('集成测试', () => {
    it('解析和序列化应该是可逆的', () => {
      const urls = [
        '/about',
        '/search?q=vue',
        '/docs#intro',
        '/user/123?tab=profile#section',
        '/path?a=1&b=2&c=3#top',
      ]

      for (const url of urls) {
        const parsed = parseURL(url)
        const stringified = stringifyURL(parsed)
        expect(stringified).toBe(url)
      }
    })

    it('规范化应该保持等价性', () => {
      const url1 = '/search?a=1&b=2'
      const url2 = normalizeURL(url1)
      expect(isSameURL(url1, url2)).toBe(true)
    })
  })
})

