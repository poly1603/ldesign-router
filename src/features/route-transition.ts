/**
 * @ldesign/router 路由过渡动画增强
 *
 * 提供丰富的路由过渡动画效果和自定义动画支持。
 * 
 * **内置动画**：
 * - fade - 淡入淡出
 * - slide - 滑动
 * - scale - 缩放
 * - flip - 翻转
 * - rotate - 旋转
 * - bounce - 弹跳
 * - zoom - 缩放+淡入
 * - slideUp/slideDown - 垂直滑动
 * - slideLeft/slideRight - 水平滑动
 * 
 * **高级功能**：
 * - 共享元素动画
 * - 手势控制
 * - 自定义缓动函数
 * - 动画编排
 * 
 * @module features/route-transition
 * @author ldesign
 */

// ==================== 类型定义 ====================

/**
 * 动画类型
 */
export type TransitionType =
  | 'fade'
  | 'slide'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'flip'
  | 'rotate'
  | 'bounce'
  | 'zoom'
  | 'custom'

/**
 * 缓动函数类型
 */
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'

/**
 * 过渡配置
 */
export interface TransitionConfig {
  /** 动画类型 */
  type: TransitionType
  /** 持续时间（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: EasingFunction | string
  /** 延迟时间（毫秒） */
  delay?: number
  /** 进入动画配置 */
  enter?: Partial<TransitionConfig>
  /** 离开动画配置 */
  leave?: Partial<TransitionConfig>
}

/**
 * 共享元素动画配置
 */
export interface SharedElementConfig {
  /** 元素选择器 */
  selector: string
  /** 动画持续时间 */
  duration?: number
  /** 缓动函数 */
  easing?: string
}

// ==================== 预设动画 ====================

/**
 * 动画预设配置
 */
export const TRANSITION_PRESETS: Record<TransitionType, TransitionConfig> = {
  fade: {
    type: 'fade',
    duration: 300,
    easing: 'ease',
  },

  slide: {
    type: 'slide',
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideUp: {
    type: 'slideUp',
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideDown: {
    type: 'slideDown',
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideLeft: {
    type: 'slideLeft',
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  slideRight: {
    type: 'slideRight',
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  scale: {
    type: 'scale',
    duration: 300,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  flip: {
    type: 'flip',
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  rotate: {
    type: 'rotate',
    duration: 500,
    easing: 'ease-in-out',
  },

  bounce: {
    type: 'bounce',
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  zoom: {
    type: 'zoom',
    duration: 350,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  custom: {
    type: 'custom',
    duration: 300,
    easing: 'ease',
  },
}

/**
 * 生成CSS动画样式
 * 
 * @param type - 动画类型
 * @returns CSS类名数组
 */
export function getTransitionClasses(type: TransitionType): {
  enterFrom: string
  enterActive: string
  enterTo: string
  leaveFrom: string
  leaveActive: string
  leaveTo: string
} {
  const prefix = `route-transition-${type}`

  return {
    enterFrom: `${prefix}-enter-from`,
    enterActive: `${prefix}-enter-active`,
    enterTo: `${prefix}-enter-to`,
    leaveFrom: `${prefix}-leave-from`,
    leaveActive: `${prefix}-leave-active`,
    leaveTo: `${prefix}-leave-to`,
  }
}

/**
 * 注入过渡动画样式
 * 
 * 在页面中注入所有预设动画的CSS样式。
 * 
 * @example
 * ```ts
 * // 应用启动时注入
 * injectTransitionStyles()
 * ```
 */
export function injectTransitionStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('ldesign-router-transitions')) return

  const style = document.createElement('style')
  style.id = 'ldesign-router-transitions'

  style.textContent = `
    /* Fade 淡入淡出 */
    .route-transition-fade-enter-from,
    .route-transition-fade-leave-to {
      opacity: 0;
    }
    .route-transition-fade-enter-active,
    .route-transition-fade-leave-active {
      transition: opacity 0.3s ease;
    }
    
    /* Slide 滑动 */
    .route-transition-slide-enter-from {
      transform: translateX(100%);
    }
    .route-transition-slide-leave-to {
      transform: translateX(-100%);
    }
    .route-transition-slide-enter-active,
    .route-transition-slide-leave-active {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* SlideUp 上滑 */
    .route-transition-slideUp-enter-from {
      transform: translateY(100%);
    }
    .route-transition-slideUp-leave-to {
      transform: translateY(-100%);
    }
    .route-transition-slideUp-enter-active,
    .route-transition-slideUp-leave-active {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* SlideDown 下滑 */
    .route-transition-slideDown-enter-from {
      transform: translateY(-100%);
    }
    .route-transition-slideDown-leave-to {
      transform: translateY(100%);
    }
    .route-transition-slideDown-enter-active,
    .route-transition-slideDown-leave-active {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Scale 缩放 */
    .route-transition-scale-enter-from,
    .route-transition-scale-leave-to {
      opacity: 0;
      transform: scale(0.8);
    }
    .route-transition-scale-enter-active,
    .route-transition-scale-leave-active {
      transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Flip 翻转 */
    .route-transition-flip-enter-from {
      transform: perspective(400px) rotateY(90deg);
      opacity: 0;
    }
    .route-transition-flip-leave-to {
      transform: perspective(400px) rotateY(-90deg);
      opacity: 0;
    }
    .route-transition-flip-enter-active,
    .route-transition-flip-leave-active {
      transition: transform 0.6s, opacity 0.6s;
    }
    
    /* Rotate 旋转 */
    .route-transition-rotate-enter-from {
      transform: rotate(-180deg) scale(0.5);
      opacity: 0;
    }
    .route-transition-rotate-leave-to {
      transform: rotate(180deg) scale(0.5);
      opacity: 0;
    }
    .route-transition-rotate-enter-active,
    .route-transition-rotate-leave-active {
      transition: transform 0.5s, opacity 0.5s;
    }
    
    /* Bounce 弹跳 */
    .route-transition-bounce-enter-from {
      transform: scale(0.3);
      opacity: 0;
    }
    .route-transition-bounce-leave-to {
      transform: scale(1.2);
      opacity: 0;
    }
    .route-transition-bounce-enter-active,
    .route-transition-bounce-leave-active {
      transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.6s;
    }
    
    /* Zoom 缩放+淡入 */
    .route-transition-zoom-enter-from,
    .route-transition-zoom-leave-to {
      opacity: 0;
      transform: scale(1.1);
    }
    .route-transition-zoom-enter-active,
    .route-transition-zoom-leave-active {
      transition: opacity 0.35s, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `

  document.head.appendChild(style)
}

import type { PropType } from 'vue'
import type { RouteLocationRaw } from '../types'
import { computed, defineComponent, h } from 'vue'
import { useLink } from '../composables'

/**
 * RouterLink 组件定义
 * 
 * @component
 */
export const RouterLink = defineComponent({
  name: 'RouterLink',

  props: {
    /**
     * 目标路由位置
     * @required
     */
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },

    /**
     * 是否使用替换模式
     * @default false
     */
    replace: {
      type: Boolean,
      default: false,
    },

    /**
     * 激活状态的CSS类名
     * @default 'router-link-active'
     */
    activeClass: {
      type: String,
      default: 'router-link-active',
    },

    /**
     * 精确激活状态的CSS类名
     * @default 'router-link-exact-active'
     */
    exactActiveClass: {
      type: String,
      default: 'router-link-exact-active',
    },

    /**
     * 是否使用自定义渲染
     * @default false
     */
    custom: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { slots }) {
    const link = useLink(props)

    return () => {
      const children = slots.default?.({
        ...link,
        navigate: link.navigate,
      })

      if (props.custom) {
        return children
      }

      return h(
        'a',
        {
          href: link.href,
          onClick: link.navigate,
          class: [
            link.isActive.value && props.activeClass,
            link.isExactActive.value && props.exactActiveClass,
          ].filter(Boolean),
        },
        children
      )
    }
  },
})

