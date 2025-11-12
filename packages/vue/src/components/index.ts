/**
 * @ldesign/router-vue 组件导出
 * 
 * @module components
 */

// 核心组件
export { default as RouterView } from './RouterView.vue'
export { default as RouterLink } from './RouterLink.vue'
export { default as RouterTabs } from './RouterTabs.vue'
export { default as RouterBreadcrumb } from './RouterBreadcrumb.vue'

// 类型导出
export type { 
  RouterViewProps, 
  RouterViewEmits,
  TransitionConfig,
  CacheConfig
} from './RouterView.vue'

export type { 
  RouterLinkProps,
  RouterLinkEmits
} from './RouterLink.vue'

export type { 
  RouterTab, 
  RouterTabsProps, 
  RouterTabsEmits 
} from './RouterTabs.vue'

export type { 
  BreadcrumbItem, 
  RouterBreadcrumbProps, 
  RouterBreadcrumbEmits 
} from './RouterBreadcrumb.vue'
