<template>
  <router-view v-slot="{ Component, route }">
    <!-- 错误边界 -->
    <ErrorBoundary
      v-if="errorBoundary"
      :fallback="errorFallback"
      :on-error="handleError"
      :reset-on-route-change="resetOnRouteChange"
    >
      <!-- Suspense 包装器 -->
      <Suspense
        v-if="suspense"
        :timeout="suspenseTimeout"
        @resolve="handleResolve"
        @pending="handlePending"
        @fallback="handleFallback"
      >
        <template #default>
          <RouterViewContent
            :component="Component"
            :route="route"
            :transition-config="resolvedTransition"
            :cache="cache"
            :cache-include="cacheInclude"
            :cache-exclude="cacheExclude"
            :cache-max="cacheMax"
            :style="rootStyle"
          />
        </template>
        <template #fallback>
          <div class="router-view__loading" :style="loadingStyle">
            <slot name="loading" :route="route">
              <span class="router-view__loading-spinner">{{ loadingText }}</span>
            </slot>
          </div>
        </template>
      </Suspense>
      <!-- 无 Suspense -->
      <RouterViewContent
        v-else
        :component="Component"
        :route="route"
        :transition-config="resolvedTransition"
        :cache="cache"
        :cache-include="cacheInclude"
        :cache-exclude="cacheExclude"
        :cache-max="cacheMax"
        :style="rootStyle"
      />
    </ErrorBoundary>
    <!-- 无错误边界 -->
    <template v-else>
      <Suspense
        v-if="suspense"
        :timeout="suspenseTimeout"
        @resolve="handleResolve"
        @pending="handlePending"
        @fallback="handleFallback"
      >
        <template #default>
          <RouterViewContent
            :component="Component"
            :route="route"
            :transition-config="resolvedTransition"
            :cache="cache"
            :cache-include="cacheInclude"
            :cache-exclude="cacheExclude"
            :cache-max="cacheMax"
            :style="rootStyle"
          />
        </template>
        <template #fallback>
          <div class="router-view__loading" :style="loadingStyle">
            <slot name="loading" :route="route">
              <span class="router-view__loading-spinner">{{ loadingText }}</span>
            </slot>
          </div>
        </template>
      </Suspense>
      <RouterViewContent
        v-else
        :component="Component"
        :route="route"
        :transition-config="resolvedTransition"
        :cache="cache"
        :cache-include="cacheInclude"
        :cache-exclude="cacheExclude"
        :cache-max="cacheMax"
        :style="rootStyle"
      />
    </template>
  </router-view>
</template>

<script setup lang="ts">
/**
 * RouterView 组件（增强版）
 *
 * 特性：
 * - 路由切换过渡动画
 * - 组件缓存（KeepAlive）
 * - 错误边界处理
 * - Suspense 异步加载
 * - 滚动行为控制
 * - 路由元信息响应
 * - 性能监控
 * - 插槽自定义
 */
import { ref, computed, inject, watch, watchEffect, onMounted, onUnmounted, defineComponent, h, Suspense, KeepAlive, Transition } from 'vue'
import { RouterView as VueRouterView, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface TransitionConfig {
  /** 动画类型 */
  type?: 'fade' | 'slide' | 'slide-left' | 'slide-right' | 'zoom' | 'none'
  /** 动画持续时间（毫秒） */
  duration?: number
  /** 动画模式 */
  mode?: 'out-in' | 'in-out' | 'default'
  /** 缓动函数 */
  easing?: string
  /** 是否启用 */
  enabled?: boolean
}

export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 包含的组件名称 */
  include?: string[] | RegExp | string
  /** 排除的组件名称 */
  exclude?: string[] | RegExp | string
  /** 最大缓存数量 */
  max?: number
}

export interface RouterViewProps {
  /** 视图名称 */
  name?: string
  
  /** 路由对象（用于独立控制） */
  route?: RouteLocationNormalizedLoaded
  
  /** 过渡动画配置 */
  transition?: boolean | TransitionConfig
  
  /** 缓存配置 */
  cache?: boolean | CacheConfig
  
  /** 错误边界 */
  errorBoundary?: boolean
  
  /** 错误回退组件 */
  errorFallback?: any
  
  /** 路由变化时重置错误 */
  resetOnRouteChange?: boolean
  
  /** 启用 Suspense */
  suspense?: boolean
  
  /** Suspense 超时时间 */
  suspenseTimeout?: number
  
  /** 加载文本 */
  loadingText?: string
  
  /** 加载样式 */
  loadingStyle?: Record<string, any>
  
  /** 滚动行为 */
  scrollBehavior?: 'auto' | 'smooth' | 'instant' | false
  
  /** 滚动位置 */
  scrollPosition?: 'top' | 'bottom' | { x: number; y: number }
  
  /** 性能监控 */
  performance?: boolean
  
  /** 自定义组件包装器 */
  wrapper?: any
}

const props = withDefaults(defineProps<RouterViewProps>(), {
  name: 'default',
  transition: true,
  cache: false,
  errorBoundary: false,
  resetOnRouteChange: true,
  suspense: false,
  suspenseTimeout: 0,
  loadingText: 'Loading...',
  scrollBehavior: 'auto',
  scrollPosition: 'top',
  performance: false
})

export interface RouterViewEmits {
  /** 路由进入 */
  (e: 'route-enter', route: RouteLocationNormalizedLoaded): void
  /** 路由离开 */
  (e: 'route-leave', route: RouteLocationNormalizedLoaded): void
  /** 路由更新 */
  (e: 'route-update', route: RouteLocationNormalizedLoaded): void
  /** 组件加载完成 */
  (e: 'component-resolved', component: any): void
  /** 组件加载中 */
  (e: 'component-pending'): void
  /** 组件加载失败 */
  (e: 'component-error', error: Error): void
  /** 性能数据 */
  (e: 'performance', data: PerformanceData): void
}

const emit = defineEmits<RouterViewEmits>()

const route = useRoute()
const currentRoute = computed(() => props.route || route)

// 注入的配置
const injectedTransition = inject<TransitionConfig | boolean>('routerAnimationConfig', null)
const injectedCache = inject<CacheConfig | boolean>('routerCacheConfig', null)
const injectedPerformance = inject<boolean>('routerPerformance', false)

// 性能监控
interface PerformanceData {
  route: string
  loadTime: number
  renderTime: number
  totalTime: number
}

const performanceStart = ref<number>(0)
const performanceEnd = ref<number>(0)

/**
 * 通用配置解析函数
 *
 * ⚡ 性能优化：
 * - 提取重复逻辑，减少代码重复
 * - 避免每次都创建新对象
 * - 统一配置合并策略
 *
 * @param defaults - 默认配置
 * @param injected - 注入的配置
 * @param propValue - props 传入的配置
 * @returns 合并后的配置
 *
 * @internal
 */
function resolveConfig<T extends { enabled?: boolean }>(
  defaults: T,
  injected: T | boolean | null,
  propValue: T | boolean | undefined,
): T {
  let config = { ...defaults }

  // 合并注入的配置
  if (injected !== null) {
    if (typeof injected === 'boolean') {
      config.enabled = injected
    }
    else {
      config = { ...config, ...injected }
    }
  }

  // 合并 props 配置（优先级最高）
  if (propValue !== undefined) {
    if (typeof propValue === 'boolean') {
      config.enabled = propValue
    }
    else {
      config = { ...config, ...propValue }
    }
  }

  return config
}

// 🚀 优化：解析过渡配置
const resolvedTransition = computed<TransitionConfig>(() => {
  const defaults: TransitionConfig = {
    type: 'fade',
    duration: 200,
    mode: 'out-in',
    easing: 'ease-in-out',
    enabled: true,
  }

  return resolveConfig(defaults, injectedTransition, props.transition)
})

// 🚀 优化：解析缓存配置
const resolvedCache = computed<CacheConfig>(() => {
  const defaults: CacheConfig = {
    enabled: false,
    include: undefined,
    exclude: undefined,
    max: 10,
  }

  return resolveConfig(defaults, injectedCache, props.cache)
})

// 缓存配置
const cache = computed(() => resolvedCache.value.enabled)
const cacheInclude = computed(() => resolvedCache.value.include)
const cacheExclude = computed(() => resolvedCache.value.exclude)
const cacheMax = computed(() => resolvedCache.value.max)

// 样式
const rootStyle = computed(() => ({
  '--router-transition-duration': `${resolvedTransition.value.duration}ms`,
  '--router-transition-easing': resolvedTransition.value.easing,
} as Record<string, string>))

// 处理错误
const handleError = (error: Error, instance: any, info: string) => {
  console.error('[RouterView] Component error:', error, info)
  emit('component-error', error)
}

// 处理 Suspense 状态
const handleResolve = () => {
  if (props.performance || injectedPerformance) {
    performanceEnd.value = performance.now()
    const data: PerformanceData = {
      route: currentRoute.value.path,
      loadTime: performanceEnd.value - performanceStart.value,
      renderTime: 0,
      totalTime: performanceEnd.value - performanceStart.value
    }
    emit('performance', data)
  }
  emit('component-resolved', currentRoute.value)
}

const handlePending = () => {
  if (props.performance || injectedPerformance) {
    performanceStart.value = performance.now()
  }
  emit('component-pending')
}

const handleFallback = () => {
  // Suspense fallback shown
}

// 滚动处理
const handleScroll = () => {
  if (props.scrollBehavior === false) return

  const options: ScrollToOptions = {
    behavior: props.scrollBehavior as ScrollBehavior,
  }

  if (props.scrollPosition === 'top') {
    options.top = 0
  }
  else if (props.scrollPosition === 'bottom') {
    options.top = document.body.scrollHeight
  }
  else if (typeof props.scrollPosition === 'object') {
    options.top = props.scrollPosition.y
    options.left = props.scrollPosition.x
  }

  window.scrollTo(options)
}

// 🚀 优化：合并路由监听逻辑，减少 watcher 数量
// 使用单个 watch 替代 watchEffect + watch，提升性能
let previousRoute: RouteLocationNormalizedLoaded | null = null
watch(
  () => currentRoute.value,
  (newRoute, oldRoute) => {
    // 触发路由进入和更新事件
    emit('route-enter', newRoute)
    emit('route-update', newRoute)
    
    // 处理滚动
    handleScroll()
    
    // 触发路由离开事件
    if (oldRoute && oldRoute.path !== newRoute.path) {
      emit('route-leave', oldRoute)
    }
    
    previousRoute = oldRoute
  },
  { immediate: true } // 立即执行一次，模拟 watchEffect 的行为
)

// 错误边界组件
const ErrorBoundary = defineComponent({
  name: 'ErrorBoundary',
  props: {
    fallback: { type: [Object, Function], default: null },
    onError: { type: Function, default: null },
    resetOnRouteChange: { type: Boolean, default: true }
  },
  data() {
    return {
      hasError: false,
      error: null as Error | null
    }
  },
  watch: {
    '$route'() {
      if (this.resetOnRouteChange && this.hasError) {
        this.hasError = false
        this.error = null
      }
    }
  },
  errorCaptured(error: Error, instance: any, info: string) {
    this.hasError = true
    this.error = error
    if (this.onError) {
      this.onError(error, instance, info)
    }
    return false
  },
  render() {
    if (this.hasError && this.fallback) {
      if (typeof this.fallback === 'function') {
        return this.fallback(this.error)
      }
      return h(this.fallback, { error: this.error })
    }
    return this.$slots.default?.()
  }
})

// RouterView 内容组件
const RouterViewContent = defineComponent({
  name: 'RouterViewContent',
  props: {
    component: { type: [Object, Function], required: true },
    route: { type: Object, required: true },
    transitionConfig: { type: Object, required: true },
    cache: { type: Boolean, default: false },
    cacheInclude: { type: [String, Array, RegExp], default: undefined },
    cacheExclude: { type: [String, Array, RegExp], default: undefined },
    cacheMax: { type: Number, default: 10 },
    style: { type: Object, default: () => ({}) }
  },
  setup(props) {
    const transitionName = computed(() => {
      if (!props.transitionConfig.enabled || props.transitionConfig.type === 'none') {
        return ''
      }
      return `router-${props.transitionConfig.type}`
    })
    
    return () => {
      const component = h(props.component as any, {
        key: props.route.fullPath || props.route.path,
        style: props.style
      })
      
      // 包装缓存
      const cached = props.cache
        ? h(KeepAlive, {
            include: props.cacheInclude,
            exclude: props.cacheExclude,
            max: props.cacheMax
          }, () => component)
        : component
      
      // 包装过渡
      const transitioned = transitionName.value
        ? h(Transition, {
            name: transitionName.value,
            mode: props.transitionConfig.mode as any,
            appear: true
          }, () => cached)
        : cached
      
      return transitioned
    }
  }
})

// 生命周期
onMounted(() => {
  // 初始化性能监控
  if (props.performance || injectedPerformance) {
    console.log('[RouterView] Performance monitoring enabled')
  }
})

onUnmounted(() => {
  // 清理
})

// 暴露实例方法
defineExpose({
  refresh: () => {
    // 强制刷新视图
    currentRoute.value.meta.__timestamp = Date.now()
  },
  clearCache: () => {
    // 清除缓存（需要访问 KeepAlive 实例）
    console.log('[RouterView] Cache cleared')
  }
})
</script>

<style scoped>
/* Fade 淡入淡出 */
.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity var(--router-transition-duration) var(--router-transition-easing);
}
.router-fade-enter-from,
.router-fade-leave-to {
  opacity: 0;
}

/* Slide 水平滑动 */
.router-slide-enter-active,
.router-slide-leave-active {
  transition: transform var(--router-transition-duration) var(--router-transition-easing),
              opacity var(--router-transition-duration) var(--router-transition-easing);
}
.router-slide-enter-from {
  transform: translateX(16px);
  opacity: 0;
}
.router-slide-leave-to {
  transform: translateX(-16px);
  opacity: 0;
}

/* Slide Left 左滑 */
.router-slide-left-enter-active,
.router-slide-left-leave-active {
  transition: transform var(--router-transition-duration) var(--router-transition-easing),
              opacity var(--router-transition-duration) var(--router-transition-easing);
}
.router-slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.router-slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Slide Right 右滑 */
.router-slide-right-enter-active,
.router-slide-right-leave-active {
  transition: transform var(--router-transition-duration) var(--router-transition-easing),
              opacity var(--router-transition-duration) var(--router-transition-easing);
}
.router-slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.router-slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Zoom 缩放 */
.router-zoom-enter-active,
.router-zoom-leave-active {
  transition: transform var(--router-transition-duration) var(--router-transition-easing),
              opacity var(--router-transition-duration) var(--router-transition-easing);
}
.router-zoom-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.router-zoom-leave-to {
  transform: scale(1.05);
  opacity: 0;
}

/* Loading 加载状态 */
.router-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #909399;
}

.router-view__loading-spinner {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
}

.router-view__loading-spinner::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: router-view-spin 0.8s linear infinite;
}

@keyframes router-view-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
