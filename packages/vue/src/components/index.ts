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

// 高级组件
export { default as RouterModal } from './RouterModal.vue'
export { default as RouterSkeleton } from './RouterSkeleton.vue'
export { default as RouterGuard } from './RouterGuard.vue'

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

export type {
  RouterModalProps,
  RouterModalEmits
} from './RouterModal.vue'

export type {
  RouterSkeletonProps,
  RouterSkeletonEmits,
  SkeletonAnimation,
  SkeletonTheme
} from './RouterSkeleton.vue'

export type {
  RouterGuardProps,
  RouterGuardEmits,
  GuardState,
  GuardCheck
} from './RouterGuard.vue'
