<template>
  <router-link
    :to="to"
    :replace="replace"
    :active-class="activeClass"
    :exact-active-class="exactActiveClass"
    :custom="custom"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
/**
 * RouterLink 组件
 * 
 * 基于 vue-router 的 RouterLink，可以添加增强功能
 */
import { RouterLink as VueRouterLink } from 'vue-router'
import type { RouteLocationRaw } from '@ldesign/router-core'

export interface RouterLinkProps {
  /** 目标路由 */
  to: RouteLocationRaw | string
  
  /** 是否替换历史记录 */
  replace?: boolean
  
  /** 活跃链接类名 */
  activeClass?: string
  
  /** 精确活跃链接类名 */
  exactActiveClass?: string
  
  /** 是否使用自定义渲染 */
  custom?: boolean
}

withDefaults(defineProps<RouterLinkProps>(), {
  replace: false,
  custom: false,
})

// 未来可以添加：
// - 预加载功能
// - 权限检查
// - 设备适配
// - 事件追踪
</script>

