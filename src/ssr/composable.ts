/**
 * @ldesign/router SSR 组合式 API
 *
 * 提供 SSR 相关的组合式函数。
 * 
 * @module ssr/composable
 * @author ldesign
 */

import { inject, onServerPrefetch, ref, type Ref } from 'vue'
import type { RouteLocationNormalized } from '../types'
import type { DataFetcher } from './index'
import { isSSR } from './index'

/**
 * 使用 SSR 数据
 * 
 * 在服务端预取数据，在客户端从注水状态恢复数据。
 * 
 * @param key - 数据键
 * @param fetcher - 数据获取函数
 * @returns 响应式数据引用
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useSSRData } from '@ldesign/router/ssr'
 * 
 * const route = useRoute()
 * const userData = useSSRData('user', async () => {
 *   const response = await fetch(`/api/users/${route.params.id}`)
 *   return response.json()
 * })
 * </script>
 * 
 * <template>
 *   <div v-if="userData">{{ userData.name }}</div>
 * </template>
 * ```
 */
export function useSSRData<T = any>(
  key: string,
  fetcher: DataFetcher | (() => Promise<T>),
): Ref<T | null> {
  const data = ref<T | null>(null)

  // 服务端预取
  if (isSSR()) {
    onServerPrefetch(async () => {
      try {
        const result = await (fetcher as any)()
        data.value = result

        // 保存到 SSR 上下文
        const ssrContext = inject<any>('ssrContext', null)
        if (ssrContext && ssrContext.state) {
          ssrContext.state[key] = result
        }
      }
      catch (error) {
        console.error(`SSR 数据预取失败 [${key}]:`, error)
      }
    })
  }
  else {
    // 客户端恢复数据
    if (typeof window !== 'undefined' && (window as any).__INITIAL_STATE__) {
      const initialState = (window as any).__INITIAL_STATE__
      if (key in initialState) {
        data.value = initialState[key]
      }
    }

    // 如果没有初始数据，执行客户端获取
    if (data.value === null) {
      ; (fetcher as any)().then((result: T) => {
        data.value = result
      }).catch((error: Error) => {
        console.error(`客户端数据获取失败 [${key}]:`, error)
      })
    }
  }

  return data
}

/**
 * 使用异步数据（SSR友好）
 * 
 * 自动处理服务端/客户端数据获取差异。
 * 
 * @param fetcher - 数据获取函数
 * @param options - 配置选项
 * @returns 包含数据、加载状态、错误的对象
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useAsyncData } from '@ldesign/router/ssr'
 * 
 * const { data, loading, error, refresh } = useAsyncData(async () => {
 *   const res = await fetch('/api/data')
 *   return res.json()
 * }, { lazy: false })
 * </script>
 * ```
 */
export function useAsyncData<T = any>(
  fetcher: () => Promise<T>,
  options: {
    /** 是否延迟加载 */
    lazy?: boolean
    /** 数据键（用于SSR注水） */
    key?: string
    /** 默认值 */
    default?: T
  } = {},
) {
  const data = ref<T | null>(options.default ?? null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 执行数据获取
   */
  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await fetcher()
      data.value = result

      // SSR 上下文保存
      if (isSSR() && options.key) {
        const ssrContext = inject<any>('ssrContext', null)
        if (ssrContext?.state) {
          ssrContext.state[options.key] = result
        }
      }
    }
    catch (err) {
      error.value = err as Error
      console.error('异步数据获取失败:', err)
    }
    finally {
      loading.value = false
    }
  }

  // SSR 预取
  if (isSSR()) {
    onServerPrefetch(execute)
  }
  else {
    // 客户端恢复或获取
    if (options.key && typeof window !== 'undefined') {
      const initialState = (window as any).__INITIAL_STATE__
      if (initialState && options.key in initialState) {
        data.value = initialState[options.key]
      }
      else if (!options.lazy) {
        execute()
      }
    }
    else if (!options.lazy) {
      execute()
    }
  }

  return {
    /** 数据 */
    data,
    /** 加载状态 */
    loading,
    /** 错误信息 */
    error,
    /** 刷新数据 */
    refresh: execute,
  }
}

/**
 * 使用 SSR 上下文
 * 
 * 获取当前的 SSR 上下文对象。
 * 
 * @returns SSR 上下文或 null
 */
export function useSSRContext(): any | null {
  return inject<any>('ssrContext', null)
}

