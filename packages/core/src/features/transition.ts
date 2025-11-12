/**
 * @ldesign/router-core 路由过渡动画管理
 * 
 * @description
 * 提供路由切换时的过渡动画管理功能。
 * 
 * **特性**：
 * - 多种预设动画（滑动、淡入淡出、缩放、翻转）
 * - 自定义动画配置
 * - 根据导航方向自动选择动画
 * - 根据路由深度判断动画
 * - 动画性能优化
 * 
 * **使用场景**：
 * - SPA 页面切换动画
 * - 前进/后退不同动画效果
 * - 层级页面动画
 * 
 * @module features/transition
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 动画类型
 */
export type TransitionType =
  | 'slide'
  | 'fade'
  | 'zoom'
  | 'flip'
  | 'none'
  | 'custom'

/**
 * 动画方向
 */
export type TransitionDirection =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'in'
  | 'out'

/**
 * 动画模式
 */
export type TransitionMode =
  | 'in-out'     // 新页面进入后旧页面离开
  | 'out-in'     // 旧页面离开后新页面进入
  | 'default'    // 同时进行

/**
 * 动画配置
 */
export interface TransitionConfig {
  /** 动画类型 */
  type: TransitionType

  /** 动画方向 */
  direction?: TransitionDirection

  /** 动画时长（毫秒） */
  duration?: number

  /** 动画缓动函数 */
  easing?: string

  /** 动画模式 */
  mode?: TransitionMode

  /** 延迟时间（毫秒） */
  delay?: number

  /** 自定义 CSS 类名 */
  customClass?: {
    enter?: string
    enterActive?: string
    enterTo?: string
    leave?: string
    leaveActive?: string
    leaveTo?: string
  }

  /** 是否启用 */
  enabled?: boolean
}

/**
 * 过渡管理器配置
 */
export interface TransitionManagerOptions {
  /** 默认动画配置 */
  default?: TransitionConfig

  /** 是否根据导航方向自动判断 */
  autoDirection?: boolean

  /** 是否根据路由深度判断 */
  autoDepth?: boolean

  /** 路由特定动画配置 */
  routes?: Record<string, TransitionConfig>

  /** 是否启用（默认 true） */
  enabled?: boolean

  /** 是否在移动端禁用动画（默认 false） */
  disableOnMobile?: boolean

  /** 是否在慢速网络禁用动画（默认 false） */
  disableOnSlowNetwork?: boolean
}

/**
 * 导航方向
 */
export type NavigationDirection = 'forward' | 'backward' | 'unknown'

/**
 * 路由过渡动画管理器
 * 
 * @description
 * 管理路由切换时的过渡动画，支持多种预设动画和自定义配置。
 * 
 * **预设动画**：
 * - slide: 滑动动画（左、右、上、下）
 * - fade: 淡入淡出
 * - zoom: 缩放动画
 * - flip: 翻转动画
 * 
 * **智能判断**：
 * - 前进：右滑入
 * - 后退：左滑入
 * - 深度增加：向上滑入
 * - 深度减少：向下滑入
 * 
 * @class
 * 
 * @example
 * ```ts
 * const transition = new TransitionManager({
 *   default: {
 *     type: 'slide',
 *     direction: 'left',
 *     duration: 300,
 *   },
 *   autoDirection: true,
 *   routes: {
 *     '/home': { type: 'fade', duration: 200 },
 *     '/profile': { type: 'zoom', direction: 'in' },
 *   },
 * })
 * 
 * // 获取过渡配置
 * const config = transition.getTransition(toRoute, fromRoute, 'forward')
 * ```
 */
export class TransitionManager {
  /** 配置选项 */
  private options: Required<TransitionManagerOptions>

  /** 路由深度缓存 */
  private depthCache = new Map<string, number>()

  /** 默认动画配置 */
  private readonly DEFAULT_CONFIG: TransitionConfig = {
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    mode: 'out-in',
    delay: 0,
    enabled: true,
  }

  /** 预设动画配置 */
  private readonly PRESETS: Record<string, TransitionConfig> = {
    'slide-left': {
      type: 'slide',
      direction: 'left',
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      mode: 'in-out',
      enabled: true,
    },
    'slide-right': {
      type: 'slide',
      direction: 'right',
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      mode: 'in-out',
      enabled: true,
    },
    'slide-up': {
      type: 'slide',
      direction: 'up',
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      mode: 'in-out',
      enabled: true,
    },
    'slide-down': {
      type: 'slide',
      direction: 'down',
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      mode: 'in-out',
      enabled: true,
    },
    'fade': {
      type: 'fade',
      duration: 200,
      easing: 'ease-in-out',
      mode: 'out-in',
      enabled: true,
    },
    'zoom-in': {
      type: 'zoom',
      direction: 'in',
      duration: 300,
      easing: 'ease-out',
      mode: 'out-in',
      enabled: true,
    },
    'zoom-out': {
      type: 'zoom',
      direction: 'out',
      duration: 300,
      easing: 'ease-in',
      mode: 'out-in',
      enabled: true,
    },
    'flip-x': {
      type: 'flip',
      direction: 'left',
      duration: 400,
      easing: 'ease-in-out',
      mode: 'out-in',
      enabled: true,
    },
    'flip-y': {
      type: 'flip',
      direction: 'up',
      duration: 400,
      easing: 'ease-in-out',
      mode: 'out-in',
      enabled: true,
    },
  }

  /**
   * 创建过渡管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: TransitionManagerOptions = {}) {
    this.options = {
      default: options.default ?? this.DEFAULT_CONFIG,
      autoDirection: options.autoDirection ?? true,
      autoDepth: options.autoDepth ?? true,
      routes: options.routes ?? {},
      enabled: options.enabled ?? true,
      disableOnMobile: options.disableOnMobile ?? false,
      disableOnSlowNetwork: options.disableOnSlowNetwork ?? false,
    }
  }

  /**
   * 获取过渡动画配置
   * 
   * @param to - 目标路由
   * @param from - 来源路由
   * @param direction - 导航方向
   * @returns 过渡动画配置
   * 
   * @example
   * ```ts
   * const config = manager.getTransition(toRoute, fromRoute, 'forward')
   * ```
   */
  getTransition(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    direction?: NavigationDirection,
  ): TransitionConfig {
    // 检查是否启用
    if (!this.shouldEnableTransition()) {
      return { ...this.DEFAULT_CONFIG, enabled: false }
    }

    // 优先使用路由特定配置
    const routeConfig = this.getRouteConfig(to)
    if (routeConfig) {
      return this.mergeConfig(this.options.default, routeConfig)
    }

    // 自动判断方向
    if (this.options.autoDirection && direction) {
      return this.getDirectionConfig(to, from, direction)
    }

    // 自动判断深度
    if (this.options.autoDepth) {
      return this.getDepthConfig(to, from)
    }

    // 使用默认配置
    return this.options.default
  }

  /**
   * 获取路由特定配置
   * 
   * @private
   */
  private getRouteConfig(route: RouteLocationNormalized): TransitionConfig | null {
    // 精确匹配
    if (this.options.routes[route.path]) {
      return this.options.routes[route.path]
    }

    // 正则匹配
    for (const [pattern, config] of Object.entries(this.options.routes)) {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        const regex = new RegExp(pattern.slice(1, -1))
        if (regex.test(route.path)) {
          return config
        }
      }
    }

    return null
  }

  /**
   * 根据导航方向获取配置
   * 
   * @private
   */
  private getDirectionConfig(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    direction: NavigationDirection,
  ): TransitionConfig {
    if (direction === 'forward') {
      return this.PRESETS['slide-left']
    }
    
    if (direction === 'backward') {
      return this.PRESETS['slide-right']
    }

    return this.options.default
  }

  /**
   * 根据路由深度获取配置
   * 
   * @private
   */
  private getDepthConfig(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ): TransitionConfig {
    const toDepth = this.getRouteDepth(to)
    const fromDepth = this.getRouteDepth(from)

    if (toDepth > fromDepth) {
      // 进入更深层级，向上滑入
      return this.PRESETS['slide-up']
    }
    
    if (toDepth < fromDepth) {
      // 返回上层，向下滑出
      return this.PRESETS['slide-down']
    }

    // 同级切换，淡入淡出
    return this.PRESETS['fade']
  }

  /**
   * 获取路由深度
   * 
   * @private
   */
  private getRouteDepth(route: RouteLocationNormalized): number {
    const cached = this.depthCache.get(route.path)
    if (cached !== undefined) {
      return cached
    }

    // 根据路径分段数计算深度
    const depth = route.path.split('/').filter(Boolean).length

    this.depthCache.set(route.path, depth)
    return depth
  }

  /**
   * 合并配置
   * 
   * @private
   */
  private mergeConfig(
    base: TransitionConfig,
    override: TransitionConfig,
  ): TransitionConfig {
    return {
      ...base,
      ...override,
      customClass: {
        ...base.customClass,
        ...override.customClass,
      },
    }
  }

  /**
   * 检查是否应该启用过渡
   * 
   * @private
   */
  private shouldEnableTransition(): boolean {
    if (!this.options.enabled) {
      return false
    }

    // 检查移动端
    if (this.options.disableOnMobile && this.isMobile()) {
      return false
    }

    // 检查网络状态
    if (this.options.disableOnSlowNetwork && this.isSlowNetwork()) {
      return false
    }

    return true
  }

  /**
   * 检查是否为移动端
   * 
   * @private
   */
  private isMobile(): boolean {
    if (typeof navigator === 'undefined') {
      return false
    }

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  }

  /**
   * 检查是否为慢速网络
   * 
   * @private
   */
  private isSlowNetwork(): boolean {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return false
    }

    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType

    return effectiveType === 'slow-2g' || effectiveType === '2g'
  }

  /**
   * 注册自定义动画
   * 
   * @param name - 动画名称
   * @param config - 动画配置
   * 
   * @example
   * ```ts
   * manager.registerTransition('custom-slide', {
   *   type: 'custom',
   *   duration: 400,
   *   customClass: {
   *     enter: 'custom-enter',
   *     enterActive: 'custom-enter-active',
   *     leave: 'custom-leave',
   *     leaveActive: 'custom-leave-active',
   *   },
   * })
   * ```
   */
  registerTransition(name: string, config: TransitionConfig): void {
    this.options.routes[name] = config
  }

  /**
   * 获取预设动画
   * 
   * @param name - 预设名称
   * @returns 动画配置，不存在返回 null
   * 
   * @example
   * ```ts
   * const fadeConfig = manager.getPreset('fade')
   * ```
   */
  getPreset(name: string): TransitionConfig | null {
    return this.PRESETS[name] ?? null
  }

  /**
   * 获取所有预设
   * 
   * @returns 预设配置对象
   */
  getAllPresets(): Record<string, TransitionConfig> {
    return { ...this.PRESETS }
  }

  /**
   * 生成 CSS 类名
   * 
   * @param config - 动画配置
   * @returns CSS 类名对象
   * 
   * @example
   * ```ts
   * const classes = manager.generateClasses(config)
   * // => {
   * //   enter: 'router-transition-slide-enter',
   * //   enterActive: 'router-transition-slide-enter-active',
   * //   ...
   * // }
   * ```
   */
  generateClasses(config: TransitionConfig): {
    enter: string
    enterActive: string
    enterTo: string
    leave: string
    leaveActive: string
    leaveTo: string
  } {
    // 使用自定义类名
    if (config.customClass) {
      return {
        enter: config.customClass.enter ?? '',
        enterActive: config.customClass.enterActive ?? '',
        enterTo: config.customClass.enterTo ?? '',
        leave: config.customClass.leave ?? '',
        leaveActive: config.customClass.leaveActive ?? '',
        leaveTo: config.customClass.leaveTo ?? '',
      }
    }

    // 生成默认类名
    const prefix = 'router-transition'
    const type = config.type
    const direction = config.direction ? `-${config.direction}` : ''
    const base = `${prefix}-${type}${direction}`

    return {
      enter: `${base}-enter`,
      enterActive: `${base}-enter-active`,
      enterTo: `${base}-enter-to`,
      leave: `${base}-leave`,
      leaveActive: `${base}-leave-active`,
      leaveTo: `${base}-leave-to`,
    }
  }

  /**
   * 生成 CSS 样式
   * 
   * @param config - 动画配置
   * @returns CSS 样式字符串
   * 
   * @example
   * ```ts
   * const css = manager.generateCSS(config)
   * // 插入到 <style> 标签
   * ```
   */
  generateCSS(config: TransitionConfig): string {
    const classes = this.generateClasses(config)
    const duration = config.duration ?? 300
    const easing = config.easing ?? 'ease-in-out'

    let css = ''

    // 滑动动画
    if (config.type === 'slide') {
      const transform = this.getSlideTransform(config.direction)
      css = `
.${classes.enterActive}, .${classes.leaveActive} {
  transition: transform ${duration}ms ${easing};
}
.${classes.enter} {
  transform: ${transform.enter};
}
.${classes.enterTo} {
  transform: translateX(0);
}
.${classes.leave} {
  transform: translateX(0);
}
.${classes.leaveTo} {
  transform: ${transform.leave};
}
      `
    }

    // 淡入淡出动画
    if (config.type === 'fade') {
      css = `
.${classes.enterActive}, .${classes.leaveActive} {
  transition: opacity ${duration}ms ${easing};
}
.${classes.enter} {
  opacity: 0;
}
.${classes.enterTo} {
  opacity: 1;
}
.${classes.leave} {
  opacity: 1;
}
.${classes.leaveTo} {
  opacity: 0;
}
      `
    }

    // 缩放动画
    if (config.type === 'zoom') {
      const scale = config.direction === 'in' ? '0.8' : '1.2'
      css = `
.${classes.enterActive}, .${classes.leaveActive} {
  transition: transform ${duration}ms ${easing}, opacity ${duration}ms ${easing};
}
.${classes.enter} {
  transform: scale(${scale});
  opacity: 0;
}
.${classes.enterTo} {
  transform: scale(1);
  opacity: 1;
}
.${classes.leave} {
  transform: scale(1);
  opacity: 1;
}
.${classes.leaveTo} {
  transform: scale(${scale === '0.8' ? '1.2' : '0.8'});
  opacity: 0;
}
      `
    }

    // 翻转动画
    if (config.type === 'flip') {
      const axis = config.direction === 'left' || config.direction === 'right' ? 'Y' : 'X'
      css = `
.${classes.enterActive}, .${classes.leaveActive} {
  transition: transform ${duration}ms ${easing};
  backface-visibility: hidden;
}
.${classes.enter} {
  transform: rotate${axis}(90deg);
}
.${classes.enterTo} {
  transform: rotate${axis}(0deg);
}
.${classes.leave} {
  transform: rotate${axis}(0deg);
}
.${classes.leaveTo} {
  transform: rotate${axis}(-90deg);
}
      `
    }

    return css.trim()
  }

  /**
   * 获取滑动动画的 transform 值
   * 
   * @private
   */
  private getSlideTransform(direction?: TransitionDirection): {
    enter: string
    leave: string
  } {
    switch (direction) {
      case 'left':
        return {
          enter: 'translateX(100%)',
          leave: 'translateX(-100%)',
        }
      case 'right':
        return {
          enter: 'translateX(-100%)',
          leave: 'translateX(100%)',
        }
      case 'up':
        return {
          enter: 'translateY(100%)',
          leave: 'translateY(-100%)',
        }
      case 'down':
        return {
          enter: 'translateY(-100%)',
          leave: 'translateY(100%)',
        }
      default:
        return {
          enter: 'translateX(100%)',
          leave: 'translateX(-100%)',
        }
    }
  }

  /**
   * 清空深度缓存
   */
  clearCache(): void {
    this.depthCache.clear()
  }
}

/**
 * 创建过渡管理器
 * 
 * @param options - 配置选项
 * @returns 过渡管理器实例
 * 
 * @example
 * ```ts
 * const transition = createTransitionManager({
 *   default: {
 *     type: 'slide',
 *     direction: 'left',
 *     duration: 300,
 *   },
 *   autoDirection: true,
 * })
 * ```
 */
export function createTransitionManager(
  options?: TransitionManagerOptions,
): TransitionManager {
  return new TransitionManager(options)
}
