/**
 * @ldesign/router-vue 组件导出
 * 
 * @module components
 */

export { default as RouterView } from './RouterView.vue'
export { default as RouterLink } from './RouterLink.vue'

export type { RouterLinkProps } from './RouterLink.vue'

export interface RouterViewProps {
  /** 视图名称 */
  name?: string

  /** 路由 */
  route?: any
}

