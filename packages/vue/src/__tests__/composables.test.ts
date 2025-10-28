/**
 * Vue Composables 测试
 */

import { describe, expect, it } from 'vitest'

describe('Vue Composables', () => {
  describe('基础导出', () => {
    it('应该能够导入 composables 模块', async () => {
      const composables = await import('../composables')
      expect(composables).toBeDefined()
    })
  })

  // TODO: 添加更多 composables 测试
  // - useRouter
  // - useRoute
  // - useParams
  // - useQuery
  // 需要配置 Vue 测试环境
})

