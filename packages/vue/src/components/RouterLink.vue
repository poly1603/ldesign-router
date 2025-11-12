<template>
  <router-link
    v-if="shouldRender"
    ref="linkRef"
    :to="to"
    :replace="replace"
    :active-class="computedActiveClass"
    :exact-active-class="computedExactActiveClass"
    :custom="custom"
    :aria-current="ariaCurrentValue"
    v-slot="{ href, route, navigate, isActive, isExactActive }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <component
      :is="tag"
      v-if="custom"
      :href="disabled ? undefined : href"
      :class="{
        [computedActiveClass]: isActive && !disabled,
        [computedExactActiveClass]: isExactActive && !disabled,
        'is-disabled': disabled,
        'is-loading': loading,
        'is-external': isExternal
      }"
      :disabled="disabled"
      :target="target"
      @click="(e: MouseEvent) => handleClick(e, navigate)"
    >
      <span v-if="loading" class="router-link__loading">
        <slot name="loading">⟳</slot>
      </span>
      <span v-if="icon && iconPosition === 'left'" class="router-link__icon router-link__icon--left">
        <slot name="icon">{{ icon }}</slot>
      </span>
      <span class="router-link__content">
        <slot :isActive="isActive" :isExactActive="isExactActive" />
      </span>
      <span v-if="icon && iconPosition === 'right'" class="router-link__icon router-link__icon--right">
        <slot name="icon-right">{{ icon }}</slot>
      </span>
      <span v-if="badge" class="router-link__badge" :class="`router-link__badge--${badgeType}`">
        {{ badge }}
      </span>
    </component>
    <slot v-else :isActive="isActive" :isExactActive="isExactActive" />
  </router-link>
  <component
    v-else-if="fallback"
    :is="tag"
    class="router-link--fallback"
    :class="{ 'is-disabled': true }"
  >
    <slot name="fallback">
      <span v-if="icon && iconPosition === 'left'" class="router-link__icon router-link__icon--left">
        <slot name="icon">{{ icon }}</slot>
      </span>
      <span class="router-link__content">
        <slot />
      </span>
      <span v-if="icon && iconPosition === 'right'" class="router-link__icon router-link__icon--right">
        <slot name="icon-right">{{ icon }}</slot>
      </span>
    </slot>
  </component>
</template>

<script setup lang="ts">
/**
 * RouterLink 组件（增强版）
 * 
 * 特性：
 * - 预加载支持（hover/focus/visible）
 * - 权限控制
 * - 设备适配（移动端/桌面端）
 * - 外部链接检测
 * - 加载状态
 * - 图标和徽章支持
 * - 事件追踪
 * - 可访问性增强
 */
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { RouterLink as VueRouterLink, useRouter, useRoute } from 'vue-router'
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
  
  /** 自定义标签 */
  tag?: string
  
  /** 是否禁用 */
  disabled?: boolean
  
  /** 预加载策略 */
  prefetch?: boolean | 'hover' | 'focus' | 'visible'
  
  /** 预加载延迟（毫秒） */
  prefetchDelay?: number
  
  /** 权限要求 */
  permission?: string | string[] | ((route: any) => boolean)
  
  /** 设备要求 */
  device?: 'mobile' | 'desktop' | 'all'
  
  /** 加载状态 */
  loading?: boolean
  
  /** 图标 */
  icon?: string
  
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
  
  /** 徽章内容 */
  badge?: string | number
  
  /** 徽章类型 */
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  
  /** 目标窗口 */
  target?: '_blank' | '_self' | '_parent' | '_top'
  
  /** 是否显示降级内容 */
  fallback?: boolean
  
  /** aria-current 属性值 */
  ariaCurrentValue?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  
  /** 点击事件追踪 */
  track?: string | Record<string, any>
  
  /** 自定义点击处理 */
  beforeNavigate?: (to: RouteLocationRaw) => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<RouterLinkProps>(), {
  replace: false,
  custom: false,
  tag: 'a',
  disabled: false,
  prefetch: false,
  prefetchDelay: 50,
  device: 'all',
  loading: false,
  iconPosition: 'left',
  badgeType: 'primary',
  target: '_self',
  fallback: false,
  ariaCurrentValue: 'page'
})

export interface RouterLinkEmits {
  /** 预加载开始 */
  (e: 'prefetch-start', to: RouteLocationRaw | string): void
  /** 预加载完成 */
  (e: 'prefetch-end', to: RouteLocationRaw | string): void
  /** 预加载失败 */
  (e: 'prefetch-error', error: Error): void
  /** 点击事件 */
  (e: 'click', event: MouseEvent): void
  /** 导航被阻止 */
  (e: 'navigate-prevented', reason: string): void
}

const emit = defineEmits<RouterLinkEmits>()

const router = useRouter()
const route = useRoute()
const linkRef = ref<InstanceType<typeof VueRouterLink>>()

// 注入的权限检查函数
const checkPermission = inject<(permission: any) => boolean>('checkPermission', () => true)

// 注入的设备信息
const deviceInfo = inject<{ isMobile: boolean; isDesktop: boolean }>('deviceInfo', {
  isMobile: false,
  isDesktop: true
})

// 注入的事件追踪函数
const trackEvent = inject<(event: string, data?: any) => void>('trackEvent', () => {})

// 预加载状态
const prefetchTimer = ref<NodeJS.Timeout | null>(null)
const prefetched = ref(false)
const observer = ref<IntersectionObserver | null>(null)

// 计算属性
const computedActiveClass = computed(() => {
  return props.activeClass || 'router-link-active'
})

const computedExactActiveClass = computed(() => {
  return props.exactActiveClass || 'router-link-exact-active'
})

// 判断是否为外部链接
const isExternal = computed(() => {
  if (typeof props.to !== 'string') return false
  return /^(https?:|mailto:|tel:)/.test(props.to)
})

// 权限检查
const hasPermission = computed(() => {
  if (!props.permission) return true
  
  if (typeof props.permission === 'function') {
    return props.permission(route)
  }
  
  if (Array.isArray(props.permission)) {
    return props.permission.every(p => checkPermission(p))
  }
  
  return checkPermission(props.permission)
})

// 设备检查
const isDeviceMatch = computed(() => {
  if (props.device === 'all') return true
  if (props.device === 'mobile') return deviceInfo.isMobile
  if (props.device === 'desktop') return deviceInfo.isDesktop
  return true
})

// 是否应该渲染
const shouldRender = computed(() => {
  return hasPermission.value && isDeviceMatch.value && !props.fallback
})

/**
 * 执行预加载
 */
const doPrefetch = async () => {
  if (prefetched.value || props.disabled || isExternal.value) return
  
  try {
    emit('prefetch-start', props.to)
    
    // 解析路由
    const resolved = router.resolve(props.to)
    
    // 预加载路由组件
    if (resolved.matched.length > 0) {
      const components = resolved.matched
        .map(record => record.components?.default)
        .filter(Boolean)
      
      await Promise.all(
        components.map(component => {
          if (typeof component === 'function') {
            return component()
          }
          return Promise.resolve(component)
        })
      )
    }
    
    prefetched.value = true
    emit('prefetch-end', props.to)
  } catch (error) {
    emit('prefetch-error', error as Error)
  }
}

/**
 * 处理鼠标进入
 */
const handleMouseEnter = () => {
  if (props.prefetch === 'hover') {
    if (prefetchTimer.value) clearTimeout(prefetchTimer.value)
    prefetchTimer.value = setTimeout(doPrefetch, props.prefetchDelay)
  }
}

/**
 * 处理鼠标离开
 */
const handleMouseLeave = () => {
  if (prefetchTimer.value) {
    clearTimeout(prefetchTimer.value)
    prefetchTimer.value = null
  }
}

/**
 * 处理获得焦点
 */
const handleFocus = () => {
  if (props.prefetch === 'focus') {
    if (prefetchTimer.value) clearTimeout(prefetchTimer.value)
    prefetchTimer.value = setTimeout(doPrefetch, props.prefetchDelay)
  }
}

/**
 * 处理失去焦点
 */
const handleBlur = () => {
  if (prefetchTimer.value) {
    clearTimeout(prefetchTimer.value)
    prefetchTimer.value = null
  }
}

/**
 * 处理点击事件
 */
const handleClick = async (event: MouseEvent, navigate: () => void) => {
  emit('click', event)
  
  // 事件追踪
  if (props.track) {
    const trackData = typeof props.track === 'string' 
      ? { action: props.track }
      : props.track
    trackEvent('router-link-click', { ...trackData, to: props.to })
  }
  
  // 禁用状态
  if (props.disabled) {
    event.preventDefault()
    emit('navigate-prevented', 'disabled')
    return
  }
  
  // 外部链接
  if (isExternal.value) {
    if (props.target === '_blank') {
      window.open(props.to as string, '_blank')
    } else {
      window.location.href = props.to as string
    }
    event.preventDefault()
    return
  }
  
  // 自定义导航前处理
  if (props.beforeNavigate) {
    event.preventDefault()
    const canNavigate = await props.beforeNavigate(props.to)
    if (canNavigate) {
      navigate()
    } else {
      emit('navigate-prevented', 'beforeNavigate')
    }
    return
  }
  
  // 使用默认导航（不阻止事件）
  if (!props.custom) {
    // router-link 会自动处理
  }
}

// 设置可见性预加载
onMounted(() => {
  if (props.prefetch === 'visible' && !prefetched.value) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            doPrefetch()
            observer.value?.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    
    if (linkRef.value?.$el) {
      observer.value.observe(linkRef.value.$el)
    }
  }
  
  // 立即预加载
  if (props.prefetch === true) {
    doPrefetch()
  }
})

onUnmounted(() => {
  if (prefetchTimer.value) {
    clearTimeout(prefetchTimer.value)
  }
  if (observer.value) {
    observer.value.disconnect()
  }
})

// 暴露实例方法
defineExpose({
  prefetch: doPrefetch,
  prefetched
})
</script>

<style scoped>
.router-link__loading {
  display: inline-flex;
  align-items: center;
  margin-right: 0.25em;
  animation: router-link-spin 1s linear infinite;
}

.router-link__icon {
  display: inline-flex;
  align-items: center;
}

.router-link__icon--left {
  margin-right: 0.25em;
}

.router-link__icon--right {
  margin-left: 0.25em;
}

.router-link__content {
  display: inline-flex;
  align-items: center;
}

.router-link__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.25em;
  padding: 0.125em 0.375em;
  font-size: 0.75em;
  line-height: 1;
  border-radius: 0.25em;
  white-space: nowrap;
}

.router-link__badge--primary {
  color: #fff;
  background-color: #409eff;
}

.router-link__badge--success {
  color: #fff;
  background-color: #67c23a;
}

.router-link__badge--warning {
  color: #fff;
  background-color: #e6a23c;
}

.router-link__badge--danger {
  color: #fff;
  background-color: #f56c6c;
}

.router-link__badge--info {
  color: #fff;
  background-color: #909399;
}

.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.is-loading {
  cursor: wait;
}

.is-external::after {
  content: '↗';
  margin-left: 0.125em;
  font-size: 0.875em;
}

@keyframes router-link-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

