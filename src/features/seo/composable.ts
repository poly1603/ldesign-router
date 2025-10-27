/**
 * @ldesign/router SEO 组合式 API
 *
 * 提供便捷的 SEO 相关组合式函数。
 * 
 * @module features/seo/composable
 * @author ldesign
 */

import { inject, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocationNormalized } from '../../types'
import type { SEOConfig } from './index'
import { SEOManager } from './index'

/**
 * 使用 SEO 管理器
 * 
 * 从 Vue 应用上下文中获取 SEO 管理器实例。
 * 
 * @returns SEO 管理器实例或 null
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useSEO } from '@ldesign/router/features/seo'
 * 
 * const seo = useSEO()
 * 
 * // 手动更新 meta
 * seo?.updateMeta(route)
 * </script>
 * ```
 */
export function useSEO(): SEOManager | null {
  return inject<SEOManager>('seoManager', null)
}

/**
 * 使用路由 SEO
 * 
 * 监听路由变化并自动更新 SEO 元数据。
 * 
 * @param route - 当前路由的响应式引用
 * @param config - SEO 配置（可选）
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useRoute } from '@ldesign/router'
 * import { useRouteSEO } from '@ldesign/router/features/seo'
 * 
 * const route = useRoute()
 * 
 * useRouteSEO(route, {
 *   titleTemplate: '%s | 我的网站'
 * })
 * </script>
 * ```
 */
export function useRouteSEO(
  route: Ref<RouteLocationNormalized>,
  config?: SEOConfig,
): SEOManager {
  // 尝试获取全局 SEO 管理器
  let manager = useSEO()

  // 如果没有全局管理器，创建局部管理器
  if (!manager && config) {
    manager = new SEOManager(config)
  }

  if (!manager) {
    throw new Error('SEO 管理器未初始化，请提供 config 或使用 SEO 插件')
  }

  // 监听路由变化并更新 meta
  watch(
    route,
    (newRoute) => {
      manager!.updateMeta(newRoute)
    },
    { immediate: true },
  )

  // 组件卸载时清理
  onUnmounted(() => {
    manager!.cleanup()
  })

  return manager
}

/**
 * 使用页面 meta 标签
 * 
 * 为当前页面设置自定义 meta 标签。
 * 
 * @param meta - meta 配置
 * 
 * @example
 * ```vue
 * <script setup>
 * import { usePageMeta } from '@ldesign/router/features/seo'
 * 
 * usePageMeta({
 *   title: '关于我们',
 *   description: '了解我们的团队和使命',
 *   keywords: ['关于', '团队', '使命'],
 *   openGraph: {
 *     type: 'article',
 *     image: 'https://example.com/about-og.jpg'
 *   }
 * })
 * </script>
 * ```
 */
export function usePageMeta(meta: SEOConfig): void {
  const manager = useSEO()

  if (!manager) {
    console.warn('SEO 管理器未找到，请先安装 SEO 插件')
    return
  }

  onMounted(() => {
    // 临时创建一个路由对象来应用 meta
    const fakeRoute = {
      meta: { seo: meta },
    } as RouteLocationNormalized

    manager.updateMeta(fakeRoute)
  })
}

/**
 * 使用结构化数据
 * 
 * 为当前页面添加结构化数据（JSON-LD）。
 * 
 * @param data - 结构化数据对象或数组
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useStructuredData } from '@ldesign/router/features/seo'
 * 
 * // 添加面包屑导航结构化数据
 * useStructuredData({
 *   '@type': 'BreadcrumbList',
 *   itemListElement: [
 *     { '@type': 'ListItem', position: 1, name: '首页', item: '/' },
 *     { '@type': 'ListItem', position: 2, name: '产品', item: '/products' }
 *   ]
 * })
 * 
 * // 添加文章结构化数据
 * useStructuredData({
 *   '@type': 'Article',
 *   headline: '文章标题',
 *   author: {
 *     '@type': 'Person',
 *     name: '作者名称'
 *   },
 *   datePublished: '2024-01-01'
 * })
 * </script>
 * ```
 */
export function useStructuredData(data: any | any[]): void {
  const manager = useSEO()

  if (!manager) {
    console.warn('SEO 管理器未找到，请先安装 SEO 插件')
    return
  }

  onMounted(() => {
    // 使用私有方法更新结构化数据
    ; (manager as any).updateStructuredData(data)
  })

  // 清理
  onUnmounted(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    scripts.forEach(script => script.remove())
  })
}


