/**
 * @ldesign/router-core 滚动行为管理
 * 
 * @description
 * 提供滚动位置记录、恢复、平滑滚动等功能。
 * 
 * **特性**：
 * - 滚动位置记录和恢复
 * - 平滑滚动支持
 * - 锚点跳转 (#hash)
 * - 自定义滚动策略
 * - 滚动延迟控制
 * - 浏览器前进/后退滚动恢复
 * 
 * @module features/scroll
 */

import type { RouteLocationNormalized, ScrollPosition } from '../types'

/**
 * 滚动行为类型
 */
export type ScrollBehaviorType = 'auto' | 'smooth' | 'instant'

/**
 * 滚动目标
 */
export interface ScrollTarget {
  /** X 坐标 */
  x?: number
  
  /** Y 坐标 */
  y?: number
  
  /** 目标元素选择器 */
  selector?: string
  
  /** 偏移量 */
  offset?: { x?: number; y?: number }
  
  /** 滚动行为 */
  behavior?: ScrollBehaviorType
}

/**
 * 保存的滚动位置
 */
export interface SavedScrollPosition {
  /** 路径 */
  path: string
  
  /** X 坐标 */
  x: number
  
  /** Y 坐标 */
  y: number
  
  /** 时间戳 */
  timestamp: number
}

/**
 * 滚动策略函数
 */
export type ScrollStrategy = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  savedPosition?: SavedScrollPosition,
) => ScrollTarget | false | void | Promise<ScrollTarget | false | void>

/**
 * 滚动管理器选项
 */
export interface ScrollManagerOptions {
  /** 默认滚动行为 */
  behavior?: ScrollBehaviorType
  
  /** 滚动延迟 (ms) */
  delay?: number
  
  /** 是否保存滚动位置 */
  savePosition?: boolean
  
  /** 滚动位置历史限制 */
  maxHistorySize?: number
  
  /** 自定义滚动策略 */
  strategy?: ScrollStrategy
}

/**
 * 滚动行为管理器
 */
export class ScrollManager {
  private scrollHistory = new Map<string, SavedScrollPosition>()
  private options: Required<Omit<ScrollManagerOptions, 'strategy'>> & { strategy?: ScrollStrategy }
  private isClient = typeof window !== 'undefined'

  constructor(options: ScrollManagerOptions = {}) {
    this.options = {
      behavior: options.behavior || 'auto',
      delay: options.delay || 0,
      savePosition: options.savePosition ?? true,
      maxHistorySize: options.maxHistorySize || 100,
      strategy: options.strategy,
    }

    // 在客户端环境下监听滚动
    if (this.isClient && this.options.savePosition) {
      this.setupScrollListener()
    }
  }

  // ==================== 滚动位置管理 ====================

  /**
   * 保存当前滚动位置
   */
  saveScrollPosition(path: string): void {
    if (!this.isClient) return

    const position: SavedScrollPosition = {
      path,
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
      timestamp: Date.now(),
    }

    this.scrollHistory.set(path, position)

    // 限制历史记录大小
    if (this.scrollHistory.size > this.options.maxHistorySize) {
      // 删除最旧的记录
      const oldestKey = this.getOldestKey()
      if (oldestKey) {
        this.scrollHistory.delete(oldestKey)
      }
    }
  }

  /**
   * 获取保存的滚动位置
   */
  getSavedPosition(path: string): SavedScrollPosition | undefined {
    return this.scrollHistory.get(path)
  }

  /**
   * 清空滚动历史
   */
  clearHistory(): void {
    this.scrollHistory.clear()
  }

  /**
   * 获取最旧的历史记录键
   */
  private getOldestKey(): string | undefined {
    let oldestKey: string | undefined
    let oldestTime = Infinity

    for (const [key, value] of this.scrollHistory.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  // ==================== 滚动控制 ====================

  /**
   * 处理路由导航后的滚动
   */
  async handleScroll(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<void> {
    if (!this.isClient) return

    // 延迟执行
    if (this.options.delay > 0) {
      await this.sleep(this.options.delay)
    }

    // 使用自定义策略
    if (this.options.strategy) {
      const savedPosition = this.getSavedPosition(to.path)
      const target = await this.options.strategy(to, from, savedPosition)
      
      if (target === false) {
        return // 不滚动
      }
      
      if (target) {
        this.scrollTo(target)
        return
      }
    }

    // 默认滚动行为
    await this.defaultScrollBehavior(to, from)
  }

  /**
   * 默认滚动行为
   */
  private async defaultScrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): Promise<void> {
    // 1. 如果有 hash,滚动到锚点
    if (to.hash) {
      this.scrollToHash(to.hash)
      return
    }

    // 2. 如果是后退/前进,恢复滚动位置
    const savedPosition = this.getSavedPosition(to.path)
    if (savedPosition) {
      this.scrollTo({
        x: savedPosition.x,
        y: savedPosition.y,
        behavior: this.options.behavior,
      })
      return
    }

    // 3. 默认滚动到顶部
    this.scrollTo({
      x: 0,
      y: 0,
      behavior: this.options.behavior,
    })
  }

  /**
   * 滚动到指定位置
   */
  scrollTo(target: ScrollTarget): void {
    if (!this.isClient) return

    // 如果有选择器,滚动到元素
    if (target.selector) {
      this.scrollToElement(target.selector, target.offset, target.behavior)
      return
    }

    // 滚动到坐标
    const x = target.x ?? 0
    const y = target.y ?? 0
    const offsetX = target.offset?.x ?? 0
    const offsetY = target.offset?.y ?? 0

    window.scrollTo({
      left: x + offsetX,
      top: y + offsetY,
      behavior: this.mapBehavior(target.behavior),
    })
  }

  /**
   * 滚动到元素
   */
  scrollToElement(
    selector: string,
    offset?: { x?: number; y?: number },
    behavior?: ScrollBehaviorType,
  ): void {
    if (!this.isClient) return

    const element = document.querySelector(selector)
    if (!element) {
      console.warn(`Element not found: ${selector}`)
      return
    }

    const rect = element.getBoundingClientRect()
    const x = window.scrollX + rect.left + (offset?.x ?? 0)
    const y = window.scrollY + rect.top + (offset?.y ?? 0)

    window.scrollTo({
      left: x,
      top: y,
      behavior: this.mapBehavior(behavior),
    })
  }

  /**
   * 滚动到 hash 锚点
   */
  scrollToHash(hash: string): void {
    if (!this.isClient) return

    // 移除 # 号
    const id = hash.replace(/^#/, '')
    
    // 尝试按 ID 查找
    let element = document.getElementById(id)
    
    // 如果没找到,尝试按 name 查找
    if (!element) {
      element = document.querySelector(`[name="${id}"]`)
    }

    if (element) {
      element.scrollIntoView({
        behavior: this.mapBehavior(this.options.behavior),
        block: 'start',
      })
    } else {
      // 如果找不到元素,滚动到顶部
      this.scrollTo({ x: 0, y: 0 })
    }
  }

  /**
   * 平滑滚动到顶部
   */
  scrollToTop(behavior?: ScrollBehaviorType): void {
    this.scrollTo({
      x: 0,
      y: 0,
      behavior: behavior || this.options.behavior,
    })
  }

  /**
   * 平滑滚动到底部
   */
  scrollToBottom(behavior?: ScrollBehaviorType): void {
    if (!this.isClient) return

    const height = document.documentElement.scrollHeight - window.innerHeight

    this.scrollTo({
      x: 0,
      y: height,
      behavior: behavior || this.options.behavior,
    })
  }

  /**
   * 获取当前滚动位置
   */
  getCurrentPosition(): ScrollPosition {
    if (!this.isClient) {
      return { left: 0, top: 0 }
    }

    return {
      left: window.scrollX || window.pageXOffset,
      top: window.scrollY || window.pageYOffset,
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 映射滚动行为
   */
  private mapBehavior(behavior?: ScrollBehaviorType): ScrollBehavior {
    if (behavior === 'smooth') return 'smooth'
    if (behavior === 'instant') return 'instant'
    return 'auto'
  }

  /**
   * 延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 设置滚动监听器
   */
  private setupScrollListener(): void {
    if (!this.isClient) return

    // 防抖保存滚动位置
    let timeout: number | null = null
    const handleScroll = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      timeout = window.setTimeout(() => {
        this.saveScrollPosition(window.location.pathname)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.scrollHistory.clear()
  }
}

/**
 * 创建滚动管理器
 */
export function createScrollManager(options?: ScrollManagerOptions): ScrollManager {
  return new ScrollManager(options)
}

// ==================== 预设滚动策略 ====================

/**
 * 始终滚动到顶部
 */
export function alwaysScrollToTop(behavior?: ScrollBehaviorType): ScrollStrategy {
  return () => ({
    x: 0,
    y: 0,
    behavior,
  })
}

/**
 * 始终保持滚动位置
 */
export function keepScrollPosition(): ScrollStrategy {
  return () => false
}

/**
 * 仅在新页面时滚动到顶部
 */
export function scrollToTopOnNewPage(behavior?: ScrollBehaviorType): ScrollStrategy {
  return (to, from, savedPosition) => {
    // 如果有保存的位置,恢复
    if (savedPosition) {
      return {
        x: savedPosition.x,
        y: savedPosition.y,
        behavior,
      }
    }
    
    // 否则滚动到顶部
    return {
      x: 0,
      y: 0,
      behavior,
    }
  }
}

/**
 * 滚动到锚点或顶部
 */
export function scrollToHashOrTop(behavior?: ScrollBehaviorType): ScrollStrategy {
  return (to, from, savedPosition) => {
    // 如果有 hash,滚动到锚点
    if (to.hash) {
      return {
        selector: to.hash,
        behavior,
      }
    }
    
    // 如果有保存的位置,恢复
    if (savedPosition) {
      return {
        x: savedPosition.x,
        y: savedPosition.y,
        behavior,
      }
    }
    
    // 否则滚动到顶部
    return {
      x: 0,
      y: 0,
      behavior,
    }
  }
}

/**
 * 延迟滚动策略
 */
export function delayedScroll(
  strategy: ScrollStrategy,
  delay: number,
): ScrollStrategy {
  return async (to, from, savedPosition) => {
    await new Promise(resolve => setTimeout(resolve, delay))
    return await strategy(to, from, savedPosition)
  }
}

/**
 * 条件滚动策略
 */
export function conditionalScroll(
  condition: (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean,
  trueStrategy: ScrollStrategy,
  falseStrategy?: ScrollStrategy,
): ScrollStrategy {
  return (to, from, savedPosition) => {
    if (condition(to, from)) {
      return trueStrategy(to, from, savedPosition)
    }
    
    if (falseStrategy) {
      return falseStrategy(to, from, savedPosition)
    }
    
    return false
  }
}
