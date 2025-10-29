import { createMemoryHistory } from '@ldesign/router-core'
import { describe, expect, it } from 'vitest'
import { createRouter } from '../src/router'

describe('performance', () => {
  it('should create router efficiently', () => {
    const start = performance.now()

    for (let i = 0; i < 1000; i++) {
      const history = createMemoryHistory()
      createRouter({
        history,
        routes: [],
      })
    }

    const end = performance.now()
    const duration = end - start

    // Should create 1000 routers in less than 1000ms
    expect(duration).toBeLessThan(1000)
  })

  it('should navigate efficiently', async () => {
    const history = createMemoryHistory()
    const router = createRouter({
      history,
      routes: [],
    })

    const start = performance.now()

    for (let i = 0; i < 1000; i++) {
      await router.push(`/test-${ i }`)
    }

    const end = performance.now()
    const duration = end - start

    // Should navigate 1000 times in less than 1000ms
    expect(duration).toBeLessThan(1000)
  })
})
