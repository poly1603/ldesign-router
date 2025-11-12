/**
 * @ldesign/router-vue Composables 测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import {
  useParams,
  useQuery,
  useHash,
  useMeta,
  useRouteMatch,
  useFullPath,
  useRouteName,
  useTypedParams,
  useTypedQuery,
  useTypedMeta,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
} from '../index'

function createTestRouter(initialPath = '/') {
  return createRouter({
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    routes: [
      { 
        path: '/', 
        name: 'home',
        component: { template: '<div>Home</div>' },
      },
      { 
        path: '/users/:id', 
        name: 'user',
        component: { template: '<div>User</div>' },
        meta: { requiresAuth: true },
      },
      { 
        path: '/about', 
        name: 'about',
        component: { template: '<div>About</div>' },
      },
    ],
  })
}

describe('Vue Composables', () => {
  describe('useParams', () => {
    it('应该返回空对象当没有参数时', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const params = useParams()
          return { params }
        },
        template: '<div>{{ params }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.params).toEqual({})
    })

    it('应该返回路由参数', async () => {
      const router = createTestRouter('/users/123')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const params = useParams()
          return { params }
        },
        template: '<div>{{ params.id }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.params.id).toBe('123')
    })
  })

  describe('useQuery', () => {
    it('应该返回空对象当没有查询参数时', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const query = useQuery()
          return { query }
        },
        template: '<div>{{ query }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.query).toEqual({})
    })

    it('应该返回查询参数', async () => {
      const router = createTestRouter('/?page=1&sort=desc')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const query = useQuery()
          return { query }
        },
        template: '<div>{{ query }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.query.page).toBe('1')
      expect(wrapper.vm.query.sort).toBe('desc')
    })
  })

  describe('useHash', () => {
    it('应该返回空字符串当没有hash时', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const hash = useHash()
          return { hash }
        },
        template: '<div>{{ hash }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.hash).toBe('')
    })

    it('应该返回hash值', async () => {
      const router = createTestRouter('/#section')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const hash = useHash()
          return { hash }
        },
        template: '<div>{{ hash }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.hash).toBe('#section')
    })
  })

  describe('useMeta', () => {
    it('应该返回路由元信息', async () => {
      const router = createTestRouter('/users/123')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const meta = useMeta()
          return { meta }
        },
        template: '<div>{{ meta }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.meta.requiresAuth).toBe(true)
    })
  })

  describe('useRouteMatch', () => {
    it('应该匹配当前路径', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const isMatch = useRouteMatch('/')
          return { isMatch }
        },
        template: '<div>{{ isMatch }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.isMatch).toBe(true)
    })

    it('应该不匹配不同路径', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const isMatch = useRouteMatch('/about')
          return { isMatch }
        },
        template: '<div>{{ isMatch }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.isMatch).toBe(false)
    })
  })

  describe('useFullPath', () => {
    it('应该返回完整路径', async () => {
      const router = createTestRouter('/?page=1#section')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const fullPath = useFullPath()
          return { fullPath }
        },
        template: '<div>{{ fullPath }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.fullPath).toBe('/?page=1#section')
    })
  })

  describe('useRouteName', () => {
    it('应该返回路由名称', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const TestComponent = defineComponent({
        setup() {
          const routeName = useRouteName()
          return { routeName }
        },
        template: '<div>{{ routeName }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.routeName).toBe('home')
    })
  })

  describe('useTypedParams', () => {
    it('应该返回类型安全的参数', async () => {
      const router = createTestRouter('/users/123')
      await router.isReady()

      interface UserParams {
        id: string
      }

      const TestComponent = defineComponent({
        setup() {
          const params = useTypedParams<UserParams>()
          return { params }
        },
        template: '<div>{{ params.id }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.params.id).toBe('123')
    })
  })

  describe('useTypedQuery', () => {
    it('应该返回类型安全的查询参数', async () => {
      const router = createTestRouter('/?page=1&sort=desc')
      await router.isReady()

      interface SearchQuery {
        page: string
        sort: string
      }

      const TestComponent = defineComponent({
        setup() {
          const query = useTypedQuery<SearchQuery>()
          return { query }
        },
        template: '<div>{{ query }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.query.page).toBe('1')
      expect(wrapper.vm.query.sort).toBe('desc')
    })
  })

  describe('useTypedMeta', () => {
    it('应该返回类型安全的元信息', async () => {
      const router = createTestRouter('/users/123')
      await router.isReady()

      interface PageMeta {
        requiresAuth: boolean
      }

      const TestComponent = defineComponent({
        setup() {
          const meta = useTypedMeta<PageMeta>()
          return { meta }
        },
        template: '<div>{{ meta }}</div>',
      })

      const wrapper = mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(wrapper.vm.meta.requiresAuth).toBe(true)
    })
  })

  describe('onBeforeRouteLeave', () => {
    it('应该注册路由离开守卫', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const guardFn = vi.fn((to, from, next) => next())

      const TestComponent = defineComponent({
        setup() {
          onBeforeRouteLeave(guardFn)
        },
        template: '<div>Test</div>',
      })

      mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(guardFn).not.toHaveBeenCalled()
    })
  })

  describe('onBeforeRouteUpdate', () => {
    it('应该注册路由更新守卫', async () => {
      const router = createTestRouter('/')
      await router.isReady()

      const guardFn = vi.fn((to, from, next) => next())

      const TestComponent = defineComponent({
        setup() {
          onBeforeRouteUpdate(guardFn)
        },
        template: '<div>Test</div>',
      })

      mount(TestComponent, {
        global: { plugins: [router] },
      })

      await nextTick()
      expect(guardFn).not.toHaveBeenCalled()
    })
  })
})
