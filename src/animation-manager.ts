import { ref, reactive, nextTick } from 'vue'
import type { AnimationConfig, AnimationType, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class AnimationManager {
  private _currentAnimation = ref<string | null>(null)
  private _isAnimating = ref(false)
  private _config = reactive<Required<AnimationConfig>>({
    enabled: true,
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    mode: 'out-in'
  })

  constructor(
    private router: LDesignRouter,
    config?: AnimationConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }
  }

  get currentAnimation(): string | null {
    return this._currentAnimation.value
  }

  get isAnimating(): boolean {
    return this._isAnimating.value
  }

  get config(): Required<AnimationConfig> {
    return this._config
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    const animationType = this.getAnimationType(to, from)
    this.playAnimation(animationType, to, from)
  }

  /**
   * 播放动画
   */
  playAnimation(type: AnimationType, to: RouteLocationNormalized, from?: Route): Promise<void> {
    return new Promise((resolve) => {
      if (!this._config.enabled) {
        resolve()
        return
      }

      this._isAnimating.value = true
      this._currentAnimation.value = type

      // 触发动画开始事件
      this.emitAnimationStart(type, to, from)

      // 设置动画结束回调
      const onAnimationEnd = () => {
        this._isAnimating.value = false
        this._currentAnimation.value = null
        this.emitAnimationEnd(type, to, from)
        resolve()
      }

      // 使用 setTimeout 模拟动画持续时间
      setTimeout(onAnimationEnd, this._config.duration)
    })
  }

  /**
   * 获取动画类型
   */
  getAnimationType(to: RouteLocationNormalized, from?: Route): AnimationType {
    // 优先使用路由元信息中的动画配置
    if (to.meta.animation) {
      return to.meta.animation
    }

    // 根据路由层级判断动画方向
    if (from) {
      const toDepth = this.getRouteDepth(to.path)
      const fromDepth = this.getRouteDepth(from.path)

      if (toDepth > fromDepth) {
        return 'slide-left' // 进入子页面
      } else if (toDepth < fromDepth) {
        return 'slide-right' // 返回父页面
      }
    }

    // 使用默认动画
    return this._config.type
  }

  /**
   * 获取路由深度
   */
  private getRouteDepth(path: string): number {
    return path.split('/').filter(segment => segment).length
  }

  /**
   * 获取动画CSS类名
   */
  getAnimationClasses(type: AnimationType): {
    enter: string
    enterActive: string
    enterTo: string
    leave: string
    leaveActive: string
    leaveTo: string
  } {
    const prefix = 'ldesign-router'
    
    return {
      enter: `${prefix}-${type}-enter`,
      enterActive: `${prefix}-${type}-enter-active`,
      enterTo: `${prefix}-${type}-enter-to`,
      leave: `${prefix}-${type}-leave`,
      leaveActive: `${prefix}-${type}-leave-active`,
      leaveTo: `${prefix}-${type}-leave-to`
    }
  }

  /**
   * 获取动画样式
   */
  getAnimationStyles(): string {
    const { duration, easing } = this._config
    
    return `
      /* Fade Animation */
      .ldesign-router-fade-enter-active,
      .ldesign-router-fade-leave-active {
        transition: opacity ${duration}ms ${easing};
      }
      .ldesign-router-fade-enter-from,
      .ldesign-router-fade-leave-to {
        opacity: 0;
      }

      /* Slide Left Animation */
      .ldesign-router-slide-left-enter-active,
      .ldesign-router-slide-left-leave-active {
        transition: transform ${duration}ms ${easing};
      }
      .ldesign-router-slide-left-enter-from {
        transform: translateX(100%);
      }
      .ldesign-router-slide-left-leave-to {
        transform: translateX(-100%);
      }

      /* Slide Right Animation */
      .ldesign-router-slide-right-enter-active,
      .ldesign-router-slide-right-leave-active {
        transition: transform ${duration}ms ${easing};
      }
      .ldesign-router-slide-right-enter-from {
        transform: translateX(-100%);
      }
      .ldesign-router-slide-right-leave-to {
        transform: translateX(100%);
      }

      /* Slide Up Animation */
      .ldesign-router-slide-up-enter-active,
      .ldesign-router-slide-up-leave-active {
        transition: transform ${duration}ms ${easing};
      }
      .ldesign-router-slide-up-enter-from {
        transform: translateY(100%);
      }
      .ldesign-router-slide-up-leave-to {
        transform: translateY(-100%);
      }

      /* Slide Down Animation */
      .ldesign-router-slide-down-enter-active,
      .ldesign-router-slide-down-leave-active {
        transition: transform ${duration}ms ${easing};
      }
      .ldesign-router-slide-down-enter-from {
        transform: translateY(-100%);
      }
      .ldesign-router-slide-down-leave-to {
        transform: translateY(100%);
      }

      /* Scale Animation */
      .ldesign-router-scale-enter-active,
      .ldesign-router-scale-leave-active {
        transition: transform ${duration}ms ${easing}, opacity ${duration}ms ${easing};
      }
      .ldesign-router-scale-enter-from {
        transform: scale(0.8);
        opacity: 0;
      }
      .ldesign-router-scale-leave-to {
        transform: scale(1.2);
        opacity: 0;
      }

      /* Zoom Animation */
      .ldesign-router-zoom-enter-active,
      .ldesign-router-zoom-leave-active {
        transition: transform ${duration}ms ${easing}, opacity ${duration}ms ${easing};
      }
      .ldesign-router-zoom-enter-from {
        transform: scale(0);
        opacity: 0;
      }
      .ldesign-router-zoom-leave-to {
        transform: scale(0);
        opacity: 0;
      }

      /* Flip Animation */
      .ldesign-router-flip-enter-active,
      .ldesign-router-flip-leave-active {
        transition: transform ${duration}ms ${easing};
      }
      .ldesign-router-flip-enter-from {
        transform: rotateY(-90deg);
      }
      .ldesign-router-flip-leave-to {
        transform: rotateY(90deg);
      }

      /* Rotate Animation */
      .ldesign-router-rotate-enter-active,
      .ldesign-router-rotate-leave-active {
        transition: transform ${duration}ms ${easing}, opacity ${duration}ms ${easing};
      }
      .ldesign-router-rotate-enter-from {
        transform: rotate(-180deg);
        opacity: 0;
      }
      .ldesign-router-rotate-leave-to {
        transform: rotate(180deg);
        opacity: 0;
      }

      /* Bounce Animation */
      .ldesign-router-bounce-enter-active {
        animation: bounce-in ${duration}ms ${easing};
      }
      .ldesign-router-bounce-leave-active {
        animation: bounce-out ${duration}ms ${easing};
      }

      @keyframes bounce-in {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes bounce-out {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        30% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(0.3);
          opacity: 0;
        }
      }

      /* 动画容器 */
      .ldesign-router-view {
        position: relative;
        overflow: hidden;
      }

      .ldesign-router-view > * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      /* 模式样式 */
      .ldesign-router-mode-out-in .ldesign-router-view > *:not(.ldesign-router-view-current) {
        position: absolute;
      }

      .ldesign-router-mode-in-out .ldesign-router-view > * {
        position: relative;
      }
    `
  }

  /**
   * 注入动画样式
   */
  injectStyles(): void {
    if (typeof document === 'undefined') return

    const styleId = 'ldesign-router-animations'
    let styleElement = document.getElementById(styleId)
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = this.getAnimationStyles()
  }

  /**
   * 移除动画样式
   */
  removeStyles(): void {
    if (typeof document === 'undefined') return

    const styleElement = document.getElementById('ldesign-router-animations')
    if (styleElement) {
      styleElement.remove()
    }
  }

  /**
   * 设置自定义动画
   */
  setCustomAnimation(name: string, styles: string): void {
    if (typeof document === 'undefined') return

    const styleId = `ldesign-router-custom-${name}`
    let styleElement = document.getElementById(styleId)
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = styles
  }

  /**
   * 预设动画配置
   */
  setPreset(preset: 'mobile' | 'desktop' | 'minimal' | 'rich'): void {
    const presets = {
      mobile: {
        type: 'slide-left' as AnimationType,
        duration: 250,
        easing: 'ease-out',
        mode: 'out-in' as const
      },
      desktop: {
        type: 'fade' as AnimationType,
        duration: 200,
        easing: 'ease-in-out',
        mode: 'out-in' as const
      },
      minimal: {
        type: 'fade' as AnimationType,
        duration: 150,
        easing: 'ease',
        mode: 'out-in' as const
      },
      rich: {
        type: 'scale' as AnimationType,
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        mode: 'out-in' as const
      }
    }

    Object.assign(this._config, presets[preset])
    this.injectStyles()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AnimationConfig>): void {
    Object.assign(this._config, config)
    
    if (this._config.enabled) {
      this.injectStyles()
    } else {
      this.removeStyles()
    }
  }

  /**
   * 等待动画完成
   */
  waitForAnimation(): Promise<void> {
    return new Promise((resolve) => {
      if (!this._isAnimating.value) {
        resolve()
        return
      }

      const checkAnimation = () => {
        if (!this._isAnimating.value) {
          resolve()
        } else {
          requestAnimationFrame(checkAnimation)
        }
      }

      checkAnimation()
    })
  }

  /**
   * 获取过渡组件属性
   */
  getTransitionProps(route?: RouteLocationNormalized) {
    if (!this._config.enabled) {
      return { name: '' }
    }

    const animationType = route?.meta?.animation || this._config.type
    const classes = this.getAnimationClasses(animationType)
    
    return {
      name: `ldesign-router-${animationType}`,
      mode: this._config.mode,
      duration: this._config.duration,
      enterActiveClass: classes.enterActive,
      leaveActiveClass: classes.leaveActive,
      enterFromClass: classes.enter,
      leaveToClass: classes.leaveTo,
      onBeforeEnter: () => this.emitAnimationStart(animationType, route),
      onAfterEnter: () => this.emitAnimationEnd(animationType, route),
      onBeforeLeave: () => this.emitAnimationStart(animationType, route),
      onAfterLeave: () => this.emitAnimationEnd(animationType, route)
    }
  }

  private emitAnimationStart(type: AnimationType, to?: RouteLocationNormalized, from?: Route): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('router-animation-start', {
        detail: { type, to, from }
      }))
    }
  }

  private emitAnimationEnd(type: AnimationType, to?: RouteLocationNormalized, from?: Route): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('router-animation-end', {
        detail: { type, to, from }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useAnimation() {
    return {
      currentAnimation: computed(() => this._currentAnimation.value),
      isAnimating: computed(() => this._isAnimating.value),
      config: computed(() => this._config)
    }
  }

  /**
   * 销毁动画管理器
   */
  destroy(): void {
    this.removeStyles()
    this._currentAnimation.value = null
    this._isAnimating.value = false
  }
}