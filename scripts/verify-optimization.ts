#!/usr/bin/env node
/**
 * Router 包优化验证脚本
 * 
 * 验证所有优化工作是否完成并符合规范
 */

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const PACKAGES = ['core', 'vue', 'react', 'svelte', 'solid', 'angular']
const REQUIRED_CONFIG_FILES = ['vitest.config.ts', 'eslint.config.js']

interface CheckResult {
  name: string
  passed: boolean
  message: string
}

const results: CheckResult[] = []

/**
 * 检查配置文件
 */
function checkConfigFiles(): void {
  console.log('\n📋 检查配置文件...\n')

  for (const pkg of PACKAGES) {
    const pkgPath = join(process.cwd(), 'packages', pkg)

    for (const configFile of REQUIRED_CONFIG_FILES) {
      const filePath = join(pkgPath, configFile)
      const exists = existsSync(filePath)

      results.push({
        name: `${pkg}/${configFile}`,
        passed: exists,
        message: exists ? '✅ 存在' : '❌ 缺失',
      })
    }
  }
}

/**
 * 检查测试文件
 */
function checkTestFiles(): void {
  console.log('\n🧪 检查测试文件...\n')

  const coreTests = [
    'packages/core/src/utils/__tests__/query.test.ts',
    'packages/core/src/utils/__tests__/url.test.ts',
    'packages/core/src/history/__tests__/html5.test.ts',
    'packages/core/src/history/__tests__/hash.test.ts',
    'packages/core/src/history/__tests__/memory.test.ts',
  ]

  for (const testFile of coreTests) {
    const filePath = join(process.cwd(), testFile)
    const exists = existsSync(filePath)

    results.push({
      name: `Core: ${testFile.split('/').pop()}`,
      passed: exists,
      message: exists ? '✅ 存在' : '❌ 缺失',
    })
  }

  // 检查 matcher 测试（在 src/core 目录）
  const matcherTest = join(process.cwd(), 'src/core/__tests__/matcher.test.ts')
  results.push({
    name: 'Core: matcher.test.ts',
    passed: existsSync(matcherTest),
    message: existsSync(matcherTest) ? '✅ 存在' : '❌ 缺失',
  })

  // 检查框架包测试
  const vueTest = join(process.cwd(), 'packages/vue/src/__tests__/composables.test.ts')
  const reactTest = join(process.cwd(), 'packages/react/src/__tests__/hooks.test.ts')

  results.push({
    name: 'Vue: composables.test.ts',
    passed: existsSync(vueTest),
    message: existsSync(vueTest) ? '✅ 存在' : '❌ 缺失',
  })

  results.push({
    name: 'React: hooks.test.ts',
    passed: existsSync(reactTest),
    message: existsSync(reactTest) ? '✅ 存在' : '❌ 缺失',
  })
}

/**
 * 检查文档文件
 */
function checkDocumentation(): void {
  console.log('\n📚 检查文档文件...\n')

  const docs = [
    'OPTIMIZATION_PROGRESS.md',
    'IMPLEMENTATION_SUMMARY.md',
    'CURRENT_STATUS.md',
    'OPTIMIZATION_COMPLETED.md',
    'QUICK_REFERENCE.md',
  ]

  for (const doc of docs) {
    const filePath = join(process.cwd(), doc)
    const exists = existsSync(filePath)

    results.push({
      name: `Doc: ${doc}`,
      passed: exists,
      message: exists ? '✅ 存在' : '❌ 缺失',
    })
  }
}

/**
 * 打印结果
 */
function printResults(): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 验证结果汇总')
  console.log('='.repeat(60) + '\n')

  const passed = results.filter(r => r.passed).length
  const total = results.length
  const percentage = Math.round((passed / total) * 100)

  // 按类别分组显示
  const categories = {
    '配置文件': results.filter(r => r.name.includes('vitest') || r.name.includes('eslint')),
    '测试文件': results.filter(r => r.name.includes('test.ts')),
    '文档文件': results.filter(r => r.name.includes('Doc:')),
  }

  for (const [category, items] of Object.entries(categories)) {
    console.log(`\n${category}:`)
    for (const item of items) {
      console.log(`  ${item.message} ${item.name}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n总计: ${passed}/${total} 项通过 (${percentage}%)\n`)

  if (passed === total) {
    console.log('🎉 所有检查通过！\n')
  }
  else {
    console.log('⚠️ 部分检查未通过，请查看上方详情\n')
  }

  console.log('='.repeat(60) + '\n')
}

/**
 * 主函数
 */
function main(): void {
  console.log('\n🚀 开始验证 Router 包优化工作...\n')

  checkConfigFiles()
  checkTestFiles()
  checkDocumentation()
  printResults()

  // 退出码
  const allPassed = results.every(r => r.passed)
  process.exit(allPassed ? 0 : 1)
}

main()

