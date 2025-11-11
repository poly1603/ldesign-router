/**
 * @ldesign/router-vue 组件导出
 * 
 * @module components
 */

export { default as RouterView } from './RouterView.vue'
export { default as RouterLink } from './RouterLink.vue'

export type { RouterLinkProps } from './RouterLink.vue'

/**
 * 路由过渡动画配置
 */
export interface TransitionConfig {
  /** 动画类型 */
  type?: 'fade' | 'slide' | 'zoom' | 'none'
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 动画模式 */
  mode?: 'out-in' | 'in-out' | 'default'
  /** 缓动函数 */
  easing?: string
}

export interface RouterViewProps {
  /** 视图名称 */
  name?: string
  /** 路由 */
  route?: any
  /** 路由切换动画 */
  transition?: boolean | TransitionConfig
}

// Demo Pages（仅供 example 使用）
import { defineComponent, h } from 'vue'

export const DemoHome = defineComponent({ name: 'DemoHome', setup: () => () => h('section', { class: 'page' }, [h('h2', '首页'), h('p', '来自 @ldesign/router-vue 的内置示例页 Home。')]) })
export const DemoAbout = defineComponent({ name: 'DemoAbout', setup: () => () => h('section', { class: 'page' }, [h('h2', '关于'), h('p', '来自 @ldesign/router-vue 的内置示例页 About。')]) })
export const DemoUser = defineComponent({ name: 'DemoUser', setup: () => () => h('section', { class: 'page' }, [h('h2', '用户'), h('p', '来自 @ldesign/router-vue 的内置示例页 User。')]) })
export const DemoDashboard = defineComponent({ name: 'DemoDashboard', setup: () => () => h('section', { class: 'page' }, [h('h2', '仪表盘'), h('p', '来自 @ldesign/router-vue 的内置示例页 Dashboard。')]) })
export const DemoNotFound = defineComponent({ name: 'DemoNotFound', setup: () => () => h('section', { class: 'page' }, [h('h2', '404'), h('p', '未找到页面。')]) })
