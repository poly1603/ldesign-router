/**
 * @ldesign/router SEO 优化工具
 *
 * 提供完整的 SEO 支持，包括 meta 标签管理、结构化数据、社交媒体优化等。
 * 
 * **核心功能**：
 * - 自动管理 meta 标签（title, description, keywords）
 * - Open Graph 和 Twitter Card 支持
 * - 结构化数据（JSON-LD）支持
 * - Canonical URL 管理
 * - Sitemap 和 Robots.txt 生成
 * 
 * **使用场景**：
 * - 提升搜索引擎排名
 * - 优化社交媒体分享
 * - 符合 SEO 最佳实践
 * 
 * @module features/seo
 * @author ldesign
 */

import type { RouteLocationNormalized } from '../../types'

// ==================== 类型定义 ====================

/**
 * SEO 元数据配置
 */
export interface SEOMeta {
  /** 页面标题 */
  title?: string
  /** 页面描述 */
  description?: string
  /** 页面关键词 */
  keywords?: string | string[]
  /** 作者 */
  author?: string
  /** Canonical URL */
  canonical?: string
  /** 网站语言 */
  lang?: string
  /** 机器人索引控制 */
  robots?: 'index,follow' | 'noindex,nofollow' | 'index,nofollow' | 'noindex,follow'
  /** 视口设置 */
  viewport?: string
}

/**
 * Open Graph 配置（Facebook、LinkedIn 等）
 */
export interface OpenGraphMeta {
  /** OG 类型 */
  type?: 'website' | 'article' | 'product' | 'profile'
  /** OG 标题 */
  title?: string
  /** OG 描述 */
  description?: string
  /** OG 图片 URL */
  image?: string
  /** OG 图片宽度 */
  imageWidth?: number
  /** OG 图片高度 */
  imageHeight?: number
  /** OG URL */
  url?: string
  /** 网站名称 */
  siteName?: string
  /** 本地化语言 */
  locale?: string
}

/**
 * Twitter Card 配置
 */
export interface TwitterCardMeta {
  /** Card 类型 */
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  /** Twitter 站点账号 */
  site?: string
  /** Twitter 创建者账号 */
  creator?: string
  /** Twitter 标题 */
  title?: string
  /** Twitter 描述 */
  description?: string
  /** Twitter 图片 URL */
  image?: string
}

/**
 * 结构化数据类型
 */
export interface StructuredData {
  /** JSON-LD 类型 */
  '@type': string
  /** JSON-LD 上下文 */
  '@context'?: string
  /** 其他属性 */
  [key: string]: any
}

/**
 * 完整的 SEO 配置
 */
export interface SEOConfig {
  /** 基础 meta 标签 */
  meta?: SEOMeta
  /** Open Graph meta */
  openGraph?: OpenGraphMeta
  /** Twitter Card meta */
  twitter?: TwitterCardMeta
  /** 结构化数据 */
  structuredData?: StructuredData | StructuredData[]
  /** 默认标题模板（如：'%s | 网站名称'） */
  titleTemplate?: string
  /** 默认描述 */
  defaultDescription?: string
  /** 默认图片 */
  defaultImage?: string
  /** 网站基础 URL */
  baseUrl?: string
}

// ==================== SEO 管理器 ====================

/**
 * SEO 管理器类
 * 
 * 提供完整的 SEO 优化功能，自动管理页面元数据。
 * 
 * @class
 * @export
 * 
 * @example
 * ```ts
 * // 创建 SEO 管理器
 * const seoManager = new SEOManager({
 *   titleTemplate: '%s | 我的网站',
 *   baseUrl: 'https://example.com',
 *   defaultImage: 'https://example.com/og-image.jpg'
 * })
 * 
 * // 在路由守卫中使用
 * router.afterEach((to) => {
 *   seoManager.updateMeta(to)
 * })
 * ```
 */
export class SEOManager {
  private config: SEOConfig
  private createdElements: Set<HTMLElement> = new Set()

  /**
   * 创建 SEO 管理器实例
   * 
   * @param config - SEO 配置
   */
  constructor(config: SEOConfig = {}) {
    this.config = config
  }

  /**
   * 更新页面 meta 标签（基于路由）
   * 
   * 从路由的 meta 字段读取 SEO 配置并自动更新页面元数据。
   * 
   * @param route - 当前路由位置
   * 
   * @example
   * ```ts
   * // 路由配置
   * {
   *   path: '/about',
   *   meta: {
   *     title: '关于我们',
   *     description: '了解我们的团队和使命',
   *     keywords: ['关于', '团队', '使命']
   *   }
   * }
   * 
   * // 自动更新
   * seoManager.updateMeta(route)
   * ```
   */
  updateMeta(route: RouteLocationNormalized): void {
    const seoConfig = route.meta.seo as SEOConfig || {}
    const meta = { ...this.config.meta, ...seoConfig.meta }
    const openGraph = { ...this.config.openGraph, ...seoConfig.openGraph }
    const twitter = { ...this.config.twitter, ...seoConfig.twitter }

    // 更新基础 meta 标签
    this.updateBasicMeta(meta, route)

    // 更新 Open Graph
    this.updateOpenGraph(openGraph, route)

    // 更新 Twitter Card
    this.updateTwitterCard(twitter, route)

    // 更新结构化数据
    if (seoConfig.structuredData) {
      this.updateStructuredData(seoConfig.structuredData)
    }
  }

  /**
   * 更新基础 meta 标签
   * 
   * @private
   * @param meta - meta 配置
   * @param route - 当前路由
   */
  private updateBasicMeta(meta: SEOMeta, route: RouteLocationNormalized): void {
    // 更新 title
    if (meta.title || route.meta.title) {
      const title = meta.title || route.meta.title as string
      const finalTitle = this.config.titleTemplate
        ? this.config.titleTemplate.replace('%s', title)
        : title
      document.title = finalTitle
    }

    // 更新 description
    this.setMetaTag('name', 'description', meta.description || this.config.defaultDescription)

    // 更新 keywords
    if (meta.keywords) {
      const keywords = Array.isArray(meta.keywords)
        ? meta.keywords.join(', ')
        : meta.keywords
      this.setMetaTag('name', 'keywords', keywords)
    }

    // 更新 author
    if (meta.author) {
      this.setMetaTag('name', 'author', meta.author)
    }

    // 更新 robots
    if (meta.robots) {
      this.setMetaTag('name', 'robots', meta.robots)
    }

    // 更新 canonical
    if (meta.canonical) {
      this.setLinkTag('rel', 'canonical', meta.canonical)
    } else if (this.config.baseUrl) {
      const canonical = `${this.config.baseUrl}${route.path}`
      this.setLinkTag('rel', 'canonical', canonical)
    }

    // 更新 lang
    if (meta.lang) {
      document.documentElement.lang = meta.lang
    }
  }

  /**
   * 更新 Open Graph meta 标签
   * 
   * @private
   * @param og - Open Graph 配置
   * @param route - 当前路由
   */
  private updateOpenGraph(og: OpenGraphMeta, route: RouteLocationNormalized): void {
    this.setMetaTag('property', 'og:type', og.type || 'website')

    if (og.title || route.meta.title) {
      this.setMetaTag('property', 'og:title', og.title || route.meta.title as string)
    }

    if (og.description || this.config.defaultDescription) {
      this.setMetaTag('property', 'og:description', og.description || this.config.defaultDescription)
    }

    if (og.image || this.config.defaultImage) {
      this.setMetaTag('property', 'og:image', og.image || this.config.defaultImage)

      if (og.imageWidth) {
        this.setMetaTag('property', 'og:image:width', String(og.imageWidth))
      }

      if (og.imageHeight) {
        this.setMetaTag('property', 'og:image:height', String(og.imageHeight))
      }
    }

    if (og.url) {
      this.setMetaTag('property', 'og:url', og.url)
    } else if (this.config.baseUrl) {
      this.setMetaTag('property', 'og:url', `${this.config.baseUrl}${route.path}`)
    }

    if (og.siteName) {
      this.setMetaTag('property', 'og:site_name', og.siteName)
    }

    if (og.locale) {
      this.setMetaTag('property', 'og:locale', og.locale)
    }
  }

  /**
   * 更新 Twitter Card meta 标签
   * 
   * @private
   * @param twitter - Twitter Card 配置
   * @param route - 当前路由
   */
  private updateTwitterCard(twitter: TwitterCardMeta, route: RouteLocationNormalized): void {
    this.setMetaTag('name', 'twitter:card', twitter.card || 'summary_large_image')

    if (twitter.site) {
      this.setMetaTag('name', 'twitter:site', twitter.site)
    }

    if (twitter.creator) {
      this.setMetaTag('name', 'twitter:creator', twitter.creator)
    }

    if (twitter.title || route.meta.title) {
      this.setMetaTag('name', 'twitter:title', twitter.title || route.meta.title as string)
    }

    if (twitter.description || this.config.defaultDescription) {
      this.setMetaTag('name', 'twitter:description', twitter.description || this.config.defaultDescription)
    }

    if (twitter.image || this.config.defaultImage) {
      this.setMetaTag('name', 'twitter:image', twitter.image || this.config.defaultImage)
    }
  }

  /**
   * 更新结构化数据（JSON-LD）
   * 
   * @private
   * @param data - 结构化数据
   */
  private updateStructuredData(data: StructuredData | StructuredData[]): void {
    // 移除旧的结构化数据
    const oldScripts = document.querySelectorAll('script[type="application/ld+json"]')
    oldScripts.forEach(script => script.remove())

    // 添加新的结构化数据
    const dataArray = Array.isArray(data) ? data : [data]

    dataArray.forEach((item) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...item,
      })
      document.head.appendChild(script)
      this.createdElements.add(script)
    })
  }

  /**
   * 设置 meta 标签
   * 
   * @private
   * @param attrName - 属性名（name 或 property）
   * @param attrValue - 属性值
   * @param content - 内容
   */
  private setMetaTag(attrName: string, attrValue: string, content?: string): void {
    if (!content)
      return

    let element = document.querySelector<HTMLMetaElement>(
      `meta[${attrName}="${attrValue}"]`,
    )

    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attrName, attrValue)
      document.head.appendChild(element)
      this.createdElements.add(element)
    }

    element.setAttribute('content', content)
  }

  /**
   * 设置 link 标签
   * 
   * @private
   * @param attrName - 属性名
   * @param attrValue - 属性值
   * @param href - 链接地址
   */
  private setLinkTag(attrName: string, attrValue: string, href?: string): void {
    if (!href)
      return

    let element = document.querySelector<HTMLLinkElement>(
      `link[${attrName}="${attrValue}"]`,
    )

    if (!element) {
      element = document.createElement('link')
      element.setAttribute(attrName, attrValue)
      document.head.appendChild(element)
      this.createdElements.add(element)
    }

    element.setAttribute('href', href)
  }

  /**
   * 生成 Sitemap XML
   * 
   * 根据路由配置生成标准的 sitemap.xml 内容。
   * 
   * @param routes - 路由数组
   * @param baseUrl - 网站基础 URL
   * @returns Sitemap XML 字符串
   * 
   * @example
   * ```ts
   * const sitemap = seoManager.generateSitemap(
   *   router.getRoutes(),
   *   'https://example.com'
   * )
   * // 保存为 sitemap.xml
   * ```
   */
  generateSitemap(routes: RouteLocationNormalized[], baseUrl: string): string {
    const urls = routes
      .filter(route => !route.meta.noIndex) // 过滤掉不需要索引的路由
      .map((route) => {
        const priority = route.meta.sitemapPriority || 0.5
        const changefreq = route.meta.sitemapChangefreq || 'weekly'
        const lastmod = new Date().toISOString().split('T')[0]

        return `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
      })
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  }

  /**
   * 生成 robots.txt 内容
   * 
   * @param config - robots.txt 配置
   * @returns robots.txt 内容
   * 
   * @example
   * ```ts
   * const robotsTxt = seoManager.generateRobotsTxt({
   *   userAgent: '*',
   *   allow: ['/'],
   *   disallow: ['/admin', '/private'],
   *   sitemap: 'https://example.com/sitemap.xml'
   * })
   * ```
   */
  generateRobotsTxt(config: {
    userAgent?: string
    allow?: string[]
    disallow?: string[]
    sitemap?: string
  }): string {
    const {
      userAgent = '*',
      allow = ['/'],
      disallow = [],
      sitemap,
    } = config

    let content = `User-agent: ${userAgent}\n`

    allow.forEach((path) => {
      content += `Allow: ${path}\n`
    })

    disallow.forEach((path) => {
      content += `Disallow: ${path}\n`
    })

    if (sitemap) {
      content += `\nSitemap: ${sitemap}`
    }

    return content
  }

  /**
   * 清理所有创建的元素
   * 
   * 在应用卸载时调用，清理所有动态创建的 meta 标签。
   * 
   * @example
   * ```ts
   * // 应用卸载时
   * seoManager.cleanup()
   * ```
   */
  cleanup(): void {
    this.createdElements.forEach(element => element.remove())
    this.createdElements.clear()
  }
}

/**
 * 创建 SEO 管理器实例
 * 
 * @param config - SEO 配置
 * @returns SEO 管理器实例
 * 
 * @example
 * ```ts
 * const seoManager = createSEOManager({
 *   titleTemplate: '%s | 我的网站',
 *   baseUrl: 'https://example.com'
 * })
 * ```
 */
export function createSEOManager(config?: SEOConfig): SEOManager {
  return new SEOManager(config)
}

// ==================== 便捷导出 ====================

// 导出插件相关功能
export { createSEOPlugin, createSEOVuePlugin } from './plugin'
export type { SEOPluginOptions } from './plugin'

// 导出组合式 API
export { useSEO, useRouteSEO, usePageMeta, useStructuredData } from './composable'

// 默认导出
export default SEOManager


