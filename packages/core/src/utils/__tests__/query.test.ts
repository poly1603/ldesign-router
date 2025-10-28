/**
 * 查询参数处理工具测试
 */

import { describe, expect, it } from 'vitest'
import {
  mergeQuery,
  normalizeQuery,
  parseQuery,
  stringifyQuery,
} from '../query'

describe('查询参数处理工具', () => {
  describe('parseQuery', () => {
    it('应该解析基础查询字符串', () => {
      expect(parseQuery('name=john&age=30')).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该处理带前导 ? 的查询字符串', () => {
      expect(parseQuery('?name=john&age=30')).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该处理空查询字符串', () => {
      expect(parseQuery('')).toEqual({})
      expect(parseQuery('?')).toEqual({})
    })

    it('应该处理数组参数', () => {
      expect(parseQuery('tags=js&tags=vue&tags=router')).toEqual({
        tags: ['js', 'vue', 'router'],
      })
    })

    it('应该处理 URL 编码的参数', () => {
      expect(parseQuery('name=john%20doe&message=hello%20world')).toEqual({
        name: 'john doe',
        message: 'hello world',
      })
    })

    it('应该处理特殊字符', () => {
      expect(parseQuery('email=test%40example.com&path=%2Fhome%2Fuser')).toEqual({
        email: 'test@example.com',
        path: '/home/user',
      })
    })

    it('应该处理空值参数', () => {
      expect(parseQuery('name=john&age=&active=')).toEqual({
        name: 'john',
        age: '',
        active: '',
      })
    })

    it('应该处理单个参数', () => {
      expect(parseQuery('name=john')).toEqual({
        name: 'john',
      })
    })

    it('应该忽略空的参数对', () => {
      expect(parseQuery('&&&')).toEqual({})
      expect(parseQuery('name=john&&age=30')).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该处理中文字符', () => {
      expect(parseQuery('name=%E5%BC%A0%E4%B8%89')).toEqual({
        name: '张三',
      })
    })
  })

  describe('stringifyQuery', () => {
    it('应该序列化基础查询对象', () => {
      expect(stringifyQuery({
        name: 'john',
        age: '30',
      })).toBe('name=john&age=30')
    })

    it('应该处理空对象', () => {
      expect(stringifyQuery({})).toBe('')
    })

    it('应该处理数组值', () => {
      expect(stringifyQuery({
        tags: ['js', 'vue', 'router'],
      })).toBe('tags=js&tags=vue&tags=router')
    })

    it('应该编码特殊字符', () => {
      expect(stringifyQuery({
        name: 'john doe',
        message: 'hello world',
      })).toBe('name=john%20doe&message=hello%20world')
    })

    it('应该过滤 null 和 undefined 值', () => {
      expect(stringifyQuery({
        name: 'john',
        age: null,
        active: undefined,
      })).toBe('name=john')
    })

    it('应该保留空字符串值', () => {
      expect(stringifyQuery({
        name: 'john',
        age: '',
      })).toBe('name=john&age=')
    })

    it('应该处理单个值', () => {
      expect(stringifyQuery({
        name: 'john',
      })).toBe('name=john')
    })

    it('应该编码邮箱和特殊字符', () => {
      expect(stringifyQuery({
        email: 'test@example.com',
        path: '/home/user',
      })).toBe('email=test%40example.com&path=%2Fhome%2Fuser')
    })

    it('应该处理中文字符', () => {
      expect(stringifyQuery({
        name: '张三',
      })).toBe('name=%E5%BC%A0%E4%B8%89')
    })

    it('应该过滤数组中的 null 和 undefined', () => {
      expect(stringifyQuery({
        tags: ['js', null as any, 'vue', undefined as any],
      })).toBe('tags=js&tags=vue')
    })
  })

  describe('mergeQuery', () => {
    it('应该合并两个查询对象', () => {
      expect(mergeQuery(
        { page: '1', sort: 'desc' },
        { page: '2', limit: '20' },
      )).toEqual({
        page: '2',
        sort: 'desc',
        limit: '20',
      })
    })

    it('应该合并多个查询对象', () => {
      expect(mergeQuery(
        { a: '1' },
        { b: '2' },
        { c: '3' },
      )).toEqual({
        a: '1',
        b: '2',
        c: '3',
      })
    })

    it('应该忽略 null 和 undefined 值', () => {
      expect(mergeQuery(
        { name: 'john', age: '30' },
        { age: null, active: undefined },
      )).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该处理空对象', () => {
      expect(mergeQuery({}, {})).toEqual({})
      expect(mergeQuery({ name: 'john' }, {})).toEqual({ name: 'john' })
    })

    it('应该处理单个对象', () => {
      expect(mergeQuery({ name: 'john' })).toEqual({ name: 'john' })
    })

    it('应该处理空字符串值', () => {
      expect(mergeQuery(
        { name: 'john', age: '' },
        { age: '30' },
      )).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该覆盖数组值', () => {
      expect(mergeQuery(
        { tags: ['js', 'vue'] },
        { tags: ['react', 'angular'] },
      )).toEqual({
        tags: ['react', 'angular'],
      })
    })
  })

  describe('normalizeQuery', () => {
    it('应该将数字转为字符串', () => {
      expect(normalizeQuery({ page: 1, limit: 20 })).toEqual({
        page: '1',
        limit: '20',
      })
    })

    it('应该将布尔值转为字符串', () => {
      expect(normalizeQuery({ active: true, disabled: false })).toEqual({
        active: 'true',
        disabled: 'false',
      })
    })

    it('应该将数组元素转为字符串', () => {
      expect(normalizeQuery({ ids: [1, 2, 3] })).toEqual({
        ids: ['1', '2', '3'],
      })
    })

    it('应该保留 null 和 undefined 值', () => {
      expect(normalizeQuery({
        name: 'john',
        age: null,
        active: undefined,
      })).toEqual({
        name: 'john',
        age: null,
        active: undefined,
      })
    })

    it('应该保留字符串值', () => {
      expect(normalizeQuery({ name: 'john', age: '30' })).toEqual({
        name: 'john',
        age: '30',
      })
    })

    it('应该处理空对象', () => {
      expect(normalizeQuery({})).toEqual({})
    })

    it('应该处理混合类型', () => {
      expect(normalizeQuery({
        name: 'john',
        age: 30,
        active: true,
        tags: ['js', 'vue'],
        count: null,
      })).toEqual({
        name: 'john',
        age: '30',
        active: 'true',
        tags: ['js', 'vue'],
        count: null,
      })
    })

    it('应该将对象转为字符串', () => {
      expect(normalizeQuery({
        data: { key: 'value' },
      })).toEqual({
        data: '[object Object]',
      })
    })
  })

  describe('性能测试', () => {
    it('应该快速处理大量参数', () => {
      const largeQuery: Record<string, string> = {}
      for (let i = 0; i < 1000; i++) {
        largeQuery[`param${i}`] = `value${i}`
      }

      const start = Date.now()
      const stringified = stringifyQuery(largeQuery)
      const parsed = parseQuery(stringified)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100) // 应该在 100ms 内完成
      expect(Object.keys(parsed)).toHaveLength(1000)
    })
  })

  describe('边界情况', () => {
    it('应该处理极长的值', () => {
      const longValue = 'a'.repeat(10000)
      const query = stringifyQuery({ data: longValue })
      const parsed = parseQuery(query)
      expect(parsed.data).toBe(longValue)
    })

    it('应该处理极多的数组元素', () => {
      const tags = Array.from({ length: 100 }, (_, i) => `tag${i}`)
      const query = stringifyQuery({ tags })
      const parsed = parseQuery(query)
      expect(parsed.tags).toEqual(tags)
    })

    it('应该处理只有键没有值的参数', () => {
      const parsed = parseQuery('name&age&active')
      expect(parsed).toEqual({
        name: '',
        age: '',
        active: '',
      })
    })
  })
})

