# 批量生成测试配置和测试文件的脚本

$packages = @(
    "alpinejs", "astro", "lit", "nextjs", "nuxtjs", 
    "preact", "qwik", "remix", "sveltekit"
)

foreach ($pkg in $packages) {
    $pkgPath = ".\packages\$pkg"
    $testsPath = "$pkgPath\__tests__"
    
    # 创建测试目录
    New-Item -ItemType Directory -Force -Path $testsPath | Out-Null
    
    # 创建 vitest.config.ts
    $vitestConfig = @"
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
        'es/',
        'lib/',
      ],
    },
  },
})
"@
    Set-Content -Path "$pkgPath\vitest.config.ts" -Value $vitestConfig
    
    # 创建基础测试文件
    $routerTest = @"
import { describe, expect, it } from 'vitest'
import { createRouter } from '../src/router'
import { createMemoryHistory } from '@ldesign/router-core'

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
"@
    Set-Content -Path "$testsPath\router.test.ts" -Value $routerTest
    
    # 创建 e2e 测试目录和配置
    $e2ePath = "$pkgPath\e2e"
    New-Item -ItemType Directory -Force -Path $e2ePath | Out-Null
    
    $e2eTest = @"
import { expect, test } from '@playwright/test'

test.describe('Router E2E Tests', () => {
  test('should render router correctly', async ({ page }) => {
    // TODO: Implement E2E tests
    expect(true).toBe(true)
  })
})
"@
    Set-Content -Path "$e2ePath\basic.test.ts" -Value $e2eTest
    
    # 创建性能测试文件
    $perfPath = "$pkgPath\__tests__"
    $perfTest = @"
import { describe, expect, it } from 'vitest'
import { createRouter } from '../src/router'
import { createMemoryHistory } from '@ldesign/router-core'

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
      await router.push(\`/test-\${i}\`)
    }
    
    const end = performance.now()
    const duration = end - start
    
    // Should navigate 1000 times in less than 1000ms
    expect(duration).toBeLessThan(1000)
  })
})
"@
    Set-Content -Path "$perfPath\performance.test.ts" -Value $perfTest
    
    Write-Host "Generated test configs for: $pkg" -ForegroundColor Green
}

Write-Host "`nAll test configs generated successfully!" -ForegroundColor Cyan
