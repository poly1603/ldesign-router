<template>
  <router-view v-slot="{ Component, route }">
    <transition
      v-if="transitionName"
      :name="transitionName"
      :mode="resolved.mode"
      appear
    >
      <component :is="Component" :key="route.fullPath || route.path" :style="rootStyle" />
    </transition>
    <component v-else :is="Component" :key="route.fullPath || route.path" />
  </router-view>
</template>

<script setup lang="ts">
/**
 * RouterView 组件（增强版）
 *
 * 特性：
 * - 路由切换过渡动画，支持注入与按需覆盖
 * - 默认启用 fade 动画，200ms，out-in
 */
import { computed, inject } from 'vue'

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

const props = defineProps<{ transition?: boolean | TransitionConfig }>()

const injected = inject<TransitionConfig | boolean | null>('routerAnimationConfig', null)

const defaults: Required<Omit<TransitionConfig, 'type'>> & { type: NonNullable<TransitionConfig['type']> } = {
  type: 'fade',
  duration: 200,
  mode: 'out-in',
  easing: 'ease-in-out',
}

const resolved = computed<Required<TransitionConfig>>(() => {
  const fromInjected = ((): TransitionConfig | null => {
    if (injected === null || injected === undefined) return null
    if (typeof injected === 'boolean') return injected ? { type: 'fade' } : { type: 'none' }
    return injected
  })()

  const fromProps = ((): TransitionConfig | null => {
    if (props.transition === undefined) return null
    if (typeof props.transition === 'boolean') return props.transition ? { type: 'fade' } : { type: 'none' }
    return props.transition
  })()

  const conf: TransitionConfig = { ...defaults, ...(fromInjected || {}), ...(fromProps || {}) }
  return {
    type: conf.type ?? 'fade',
    duration: conf.duration ?? 200,
    mode: (conf.mode as any) ?? 'out-in',
    easing: conf.easing ?? 'ease-in-out',
  }
})

const transitionName = computed(() => resolved.value.type === 'none' ? '' : `router-${resolved.value.type}`)
const rootStyle = computed(() => ({
  '--router-transition-duration': `${resolved.value.duration}ms`,
  '--router-transition-easing': resolved.value.easing,
} as Record<string, string>))
</script>

<style scoped>
/* fade */
.router-fade-enter-active,
.router-fade-leave-active { transition: opacity var(--router-transition-duration) var(--router-transition-easing); }
.router-fade-enter-from,
.router-fade-leave-to { opacity: 0; }

/* slide（水平） */
.router-slide-enter-active,
.router-slide-leave-active { transition: transform var(--router-transition-duration) var(--router-transition-easing), opacity var(--router-transition-duration) var(--router-transition-easing); }
.router-slide-enter-from { transform: translateX(8px); opacity: 0; }
.router-slide-leave-to { transform: translateX(-8px); opacity: 0; }

/* zoom */
.router-zoom-enter-active,
.router-zoom-leave-active { transition: transform var(--router-transition-duration) var(--router-transition-easing), opacity var(--router-transition-duration) var(--router-transition-easing); }
.router-zoom-enter-from { transform: scale(0.98); opacity: 0; }
.router-zoom-leave-to { transform: scale(1.02); opacity: 0; }
</style>
