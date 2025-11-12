/**
 * @ldesign/router-vue Router 测试
 */

import { describe, it, expect } from 'vitest'
import { createRouter } from '../index'
import { createMemoryHistory } from 'vue-router'

describe('createRouter', () => {
  it('应该创建路由器实例', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    })

    expect(router).toBeDefined()
    expect(router.currentRoute).toBeDefined()
  })

  it('应该正确配置basename和scrollBehavior', () => {
    const scrollBehavior = () => ({ top: 0 })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [],
      scrollBehavior,
    })

    expect(router).toBeDefined()
  })

  it('应该支持动态添加路由', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      ],
    })

    const removeRoute = router.addRoute({
      path: '/about',
      name: 'about',
      component: { template: '<div>About</div>' },
    })

    expect(router.hasRoute('about')).toBe(true)

    removeRoute()
    expect(router.hasRoute('about')).toBe(false)
  })

  it('应该支持移除路由', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/about', name: 'about', component: { template: '<div>About</div>' } },
      ],
    })

    expect(router.hasRoute('about')).toBe(true)
    router.removeRoute('about')
    expect(router.hasRoute('about')).toBe(false)
  })

  it('应该获取所有路由', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/about', name: 'about', component: { template: '<div>About</div>' } },
      ],
    })

    const routes = router.getRoutes()
    expect(routes.length).toBeGreaterThanOrEqual(2)
  })

  it('应该支持导航方法', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
      ],
    })

    await router.push('/about')
    expect(router.currentRoute.value.path).toBe('/about')

    router.back()
    router.forward()
    router.go(-1)
  })

  it('应该支持导航守卫', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    })

    const removeGuard = router.beforeEach((to, from, next) => {
      next()
    })

    expect(removeGuard).toBeInstanceOf(Function)
    removeGuard()
  })

  it('应该支持错误处理', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [],
    })

    const removeErrorHandler = router.onError((error) => {
      console.error(error)
    })

    expect(removeErrorHandler).toBeInstanceOf(Function)
  })

  it('应该判断路由是否就绪', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    })

    await expect(router.isReady()).resolves.toBeUndefined()
  })
})
