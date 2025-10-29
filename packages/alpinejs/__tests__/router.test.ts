import { createMemoryHistory } from '@ldesign/router-core'
import { describe, expect, it } from 'vitest'
import { createRouter } from '../src/router'

describe('router', () => {
  it('should create router instance', () => {
    const history = createMemoryHistory()
    const router = createRouter({
      history,
      routes: [],
    })

    expect(router).toBeDefined()
    expect(router.history).toBe(history)
    expect(router.currentRoute).toBeDefined()
  })

  it('should navigate to route', async () => {
    const history = createMemoryHistory()
    const router = createRouter({
      history,
      routes: [],
    })

    await router.push('/test')
    expect(history.location).toBe('/test')
  })

  it('should replace route', async () => {
    const history = createMemoryHistory()
    const router = createRouter({
      history,
      routes: [],
    })

    await router.replace('/replaced')
    expect(history.location).toBe('/replaced')
  })

  it('should navigate back', () => {
    const history = createMemoryHistory()
    const router = createRouter({
      history,
      routes: [],
    })

    expect(() => router.back()).not.toThrow()
  })

  it('should navigate forward', () => {
    const history = createMemoryHistory()
    const router = createRouter({
      history,
      routes: [],
    })

    expect(() => router.forward()).not.toThrow()
  })
})
