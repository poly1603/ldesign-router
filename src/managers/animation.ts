import { reactive } from 'vue'
import type { AnimationConfig, AnimationOptions, Route } from '../types'

/**
 * 动画管理器
 * 负责管理路由切换时的动画效果
 */
export class AnimationManager {
  private config = reactive<Required<AnimationConfig>>({
    enabled: true,
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    direction: 'right',
  })

  private animationHistory: string[] = []

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: AnimationConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializeAnimations()
  }

  /**
   * 初始化动画
   */
  private initializeAnimations(): void {
    if (!this.config.enabled)
return

    // 注册默认动画样式
    this.registerDefaultAnimations()
  }

  /**
   * 获取路由切换动画选项
   * @param to 目标路由
   * @param from 当前路由
   * @returns 动画选项
   */
  getTransitionOptions(to: Route, from: Route): AnimationOptions {
    if (!this.config.enabled) {
      return { name: 'none', css: false }
    }

    // 检查路由元信息中的动画配置
    const toAnimation = to.meta?.animation
    const fromAnimation = from.meta?.animation

    // 优先使用路由级别的动画配置
    const animationType = toAnimation || fromAnimation || this.config.type
    const direction = this.determineDirection(to, from)

    return {
      name: this.getAnimationName(animationType, direction),
      mode: 'out-in',
      appear: true,
      duration: this.config.duration,
      css: true,
      type: 'transition',
    }
  }

  /**
   * 确定动画方向
   * @param to 目标路由
   * @param from 当前路由
   * @returns 动画方向
   */
  private determineDirection(to: Route, from: Route): string {
    // 基于路由层级确定方向
    const toDepth = to.matched.length
    const fromDepth = from.matched.length

    if (toDepth > fromDepth) {
      return 'forward' // 进入子路由
    }
 else if (toDepth < fromDepth) {
      return 'backward' // 返回父路由
    }
 else {
      // 同级路由，基于历史记录确定方向
      return this.getDirectionFromHistory(to.path, from.path)
    }
  }

  /**
   * 基于历史记录确定方向
   * @param toPath 目标路径
   * @param fromPath 当前路径
   * @returns 方向
   */
  private getDirectionFromHistory(toPath: string, fromPath: string): string {
    const fromIndex = this.animationHistory.indexOf(fromPath)
    const toIndex = this.animationHistory.indexOf(toPath)

    if (fromIndex !== -1 && toIndex !== -1) {
      return toIndex > fromIndex ? 'forward' : 'backward'
    }

    // 添加到历史记录
    if (fromIndex === -1) {
      this.animationHistory.push(fromPath)
    }

    return this.config.direction
  }

  /**
   * 获取动画名称
   * @param type 动画类型
   * @param direction 方向
   * @returns 动画名称
   */
  private getAnimationName(type: string, direction: string): string {
    return `ldesign-${type}-${direction}`
  }

  /**
   * 注册默认动画样式
   */
  private registerDefaultAnimations(): void {
    if (typeof document === 'undefined')
return

    const styleId = 'ldesign-router-animations'
    if (document.getElementById(styleId))
return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = this.getDefaultAnimationCSS()
    document.head.appendChild(style)
  }

  /**
   * 获取默认动画CSS
   * @returns CSS字符串
   */
  private getDefaultAnimationCSS(): string {
    const duration = this.config.duration
    const easing = this.config.easing

    return `
      /* 淡入淡出动画 */
      .ldesign-fade-forward-enter-active,
      .ldesign-fade-forward-leave-active,
      .ldesign-fade-backward-enter-active,
      .ldesign-fade-backward-leave-active {
        transition: opacity ${duration}ms ${easing};
      }

      .ldesign-fade-forward-enter-from,
      .ldesign-fade-forward-leave-to,
      .ldesign-fade-backward-enter-from,
      .ldesign-fade-backward-leave-to {
        opacity: 0;
      }

      /* 滑动动画 */
      .ldesign-slide-forward-enter-active,
      .ldesign-slide-forward-leave-active {
        transition: transform ${duration}ms ${easing};
      }

      .ldesign-slide-forward-enter-from {
        transform: translateX(100%);
      }

      .ldesign-slide-forward-leave-to {
        transform: translateX(-100%);
      }

      .ldesign-slide-backward-enter-active,
      .ldesign-slide-backward-leave-active {
        transition: transform ${duration}ms ${easing};
      }

      .ldesign-slide-backward-enter-from {
        transform: translateX(-100%);
      }

      .ldesign-slide-backward-leave-to {
        transform: translateX(100%);
      }

      /* 缩放动画 */
      .ldesign-zoom-forward-enter-active,
      .ldesign-zoom-forward-leave-active,
      .ldesign-zoom-backward-enter-active,
      .ldesign-zoom-backward-leave-active {
        transition: all ${duration}ms ${easing};
      }

      .ldesign-zoom-forward-enter-from,
      .ldesign-zoom-backward-enter-from {
        opacity: 0;
        transform: scale(0.8);
      }

      .ldesign-zoom-forward-leave-to,
      .ldesign-zoom-backward-leave-to {
        opacity: 0;
        transform: scale(1.2);
      }

      /* 无动画 */
      .ldesign-none-forward-enter-active,
      .ldesign-none-forward-leave-active,
      .ldesign-none-backward-enter-active,
      .ldesign-none-backward-leave-active {
        transition: none;
      }
    `
  }

  /**
   * 设置动画配置
   * @param newConfig 新配置
   */
  setConfig(newConfig: Partial<AnimationConfig>): void {
    Object.assign(this.config, newConfig)

    if (this.config.enabled) {
      this.registerDefaultAnimations()
    }
  }

  /**
   * 获取动画配置
   */
  getConfig(): AnimationConfig {
    return { ...this.config }
  }

  /**
   * 添加自定义动画CSS
   * @param css CSS字符串
   * @param id 样式ID
   */
  addCustomAnimation(css: string, id: string = 'custom'): void {
    if (typeof document === 'undefined')
return

    const styleId = `ldesign-router-animation-${id}`
    let style = document.getElementById(styleId) as HTMLStyleElement

    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      document.head.appendChild(style)
    }

    style.textContent = css
  }

  /**
   * 移除自定义动画
   * @param id 样式ID
   */
  removeCustomAnimation(id: string): void {
    if (typeof document === 'undefined')
return

    const styleId = `ldesign-router-animation-${id}`
    const style = document.getElementById(styleId)
    if (style) {
      style.remove()
    }
  }

  /**
   * 清空动画历史
   */
  clearAnimationHistory(): void {
    this.animationHistory = []
  }

  /**
   * 获取动画统计信息
   */
  getAnimationStats(): {
    enabled: boolean
    type: string
    duration: number
    historySize: number
  } {
    return {
      enabled: this.config.enabled,
      type: this.config.type,
      duration: this.config.duration,
      historySize: this.animationHistory.length,
    }
  }

  /**
   * 预加载动画
   * @param animationType 动画类型
   */
  preloadAnimation(animationType: string): void {
    // 预加载动画相关资源
    const animationName = this.getAnimationName(animationType, 'forward')

    // 触发CSS解析
    if (typeof document !== 'undefined') {
      const testElement = document.createElement('div')
      testElement.className = `${animationName}-enter-active`
      testElement.style.position = 'absolute'
      testElement.style.visibility = 'hidden'
      document.body.appendChild(testElement)

      // 强制重排
      testElement.offsetHeight

      // 清理
      document.body.removeChild(testElement)
    }
  }
}
