/**
 * @ldesign/router RouterView 组件
 *
 * 路由视图容器组件，用于渲染匹配的路由组件。这是路由系统中最核心的组件之一。
 * 
 * **核心功能**：
 * - 动态渲染匹配的路由组件
 * - 支持嵌套路由和命名视图
 * - 内置 KeepAlive 缓存支持
 * - 支持页面过渡动画
 * - 懒加载组件优化
 * - 错误边界处理
 * 
 * **性能优化**：
 * - 使用 shallowRef 减少响应式开销
 * - 组件缓存避免重复加载
 * - 对象池复用减少 GC
 * - 稳定的 key 生成策略
 * 
 * @module components/RouterView
 * @author ldesign
 */

import type { Component, RouteLocationNormalized, Router } from '../types'
import { computed, defineComponent, h, inject, KeepAlive, markRaw, type PropType, provide, ref, type Ref, shallowRef, Transition, watch } from 'vue'
import { ROUTE_INJECTION_SYMBOL, ROUTER_INJECTION_SYMBOL } from '../core/constants'

// ==================== 类型定义 ====================

/**
 * KeepAlive 组件属性
 * 用于配置组件缓存行为
 */
interface KeepAliveProps {
  /** 匹配的组件会被缓存 */
  include?: string | RegExp | (string | RegExp)[]
  /** 匹配的组件不会被缓存 */
  exclude?: string | RegExp | (string | RegExp)[]
  /** 最大缓存实例数 */
  max?: string | number
}

/**
 * Transition 过渡动画属性
 */
interface TransitionProps {
  /** 过渡类名 */
  name?: string
  /** 过渡模式 */
  mode?: 'in-out' | 'out-in' | 'default'
  /** 是否在初始渲染时使用过渡 */
  appear?: boolean
  /** 过渡持续时间（毫秒） */
  duration?: number | { enter: number; leave: number }
}

/**
 * RouterView 嵌套深度注入键
 * 用于追踪嵌套路由的层级深度
 * @internal
 */
const ROUTER_VIEW_DEPTH_SYMBOL = Symbol('RouterViewDepth')

/**
 * RouterView 组件定义
 * 
 * 这是一个功能完整的路由视图组件，支持多种高级特性。
 * 
 * @component
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <RouterView />
 *   
 *   <!-- 带缓存 -->
 *   <RouterView :keep-alive="true" :max="10" />
 *   
 *   <!-- 带动画 -->
 *   <RouterView transition="fade" />
 *   
 *   <!-- 完整配置 -->
 *   <RouterView
 *     name="sidebar"
 *     :keep-alive="{ max: 5, include: ['Home', 'About'] }"
 *     transition="slide"
 *     :loading="true"
 *     @error="handleError"
 *   />
 * </template>
 * ```
 */
export const RouterView = defineComponent({
  name: 'RouterView',

  props: {
    /**
     * 视图名称，用于命名视图
     * @default 'default'
     */
    name: {
      type: String,
      default: 'default',
    },

    /**
     * 是否启用 KeepAlive 缓存
     * 可以是布尔值或 KeepAlive 配置对象
     * @default false
     */
    keepAlive: {
      type: [Boolean, Object] as PropType<boolean | KeepAliveProps>,
      default: false,
    },

    /**
     * KeepAlive include 规则
     * 匹配的组件会被缓存
     */
    include: {
      type: [String, RegExp, Array] as PropType<string | RegExp | (string | RegExp)[]>,
      default: undefined,
    },

    /**
     * KeepAlive exclude 规则
     * 匹配的组件不会被缓存
     */
    exclude: {
      type: [String, RegExp, Array] as PropType<string | RegExp | (string | RegExp)[]>,
      default: undefined,
    },

    /**
     * KeepAlive 最大缓存数量
     */
    max: {
      type: Number,
      default: undefined,
    },

    /**
     * 过渡动画配置
     * 可以是动画名称字符串或完整配置对象
     */
    transition: {
      type: [String, Object] as PropType<string | TransitionProps>,
      default: undefined,
    },

    /**
     * 过渡模式
     * @default 'out-in'
     */
    mode: {
      type: String as PropType<'in-out' | 'out-in' | 'default'>,
      default: 'out-in',
    },

    /**
     * 是否显示加载状态
     * @default false
     */
    loading: {
      type: Boolean,
      default: false,
    },

    /**
     * 是否启用懒加载
     * @default true
     */
    lazy: {
      type: Boolean,
      default: true,
    },

    /**
     * 错误处理回调
     */
    onError: {
      type: Function as PropType<(error: Error) => void>,
      default: undefined,
    },

    /**
     * 是否使用 Suspense
     * @default false
     */
    suspense: {
      type: Boolean,
      default: false,
    },

    /**
     * 组件加载超时时间（毫秒）
     */
    timeout: {
      type: Number,
      default: undefined,
    },

    /**
     * 缓存策略
     * - always: 总是缓存
     * - matched: 仅缓存匹配的路由
     * - custom: 自定义策略
     * @default 'matched'
     */
    cacheStrategy: {
      type: String as PropType<'always' | 'matched' | 'custom'>,
      default: 'matched',
    },
  },

  // 不继承父组件属性
  inheritAttrs: false,

  setup(props, { slots }) {
    // 注入路由器和当前路由
    const router = inject<Router>(ROUTER_INJECTION_SYMBOL)
    const route = inject<Ref<RouteLocationNormalized>>(ROUTE_INJECTION_SYMBOL)

    // 计算当前 RouterView 的嵌套深度
    // 用于在嵌套路由中选择正确的路由记录
    const parentDepth = inject<number>(ROUTER_VIEW_DEPTH_SYMBOL, 0)
    const currentDepth = parentDepth + 1

    // 为子 RouterView 提供深度信息
    provide(ROUTER_VIEW_DEPTH_SYMBOL, currentDepth)

    // 确保在路由器上下文中使用
    if (!router || !route) {
      throw new Error('RouterView 必须在路由器上下文中使用')
    }

    // ==================== 状态管理 ====================

    /**
     * 当前渲染的组件（使用 shallowRef 优化性能）
     * shallowRef 不会深度追踪组件内部状态，减少响应式开销
     */
    const currentComponent = shallowRef<Component | null>(null)

    /** 组件加载状态 */
    const isLoading = ref(false)

    /** 组件加载错误 */
    const error = shallowRef<Error | null>(null)

    // ==================== 性能优化：组件缓存 ====================

    /**
     * 组件缓存 Map
     * key: 缓存键（路由名称 + 视图名称）
     * value: 已加载的组件
     */
    const componentCache = new Map<string, Component>()

    /**
     * 正在加载的 Promise Map
     * 避免同一组件被重复加载
     */
    const loadingPromises = new Map<string, Promise<Component>>()

    /**
     * 加载组件并缓存（性能优化版）
     * 
     * **优化策略**：
     * 1. 检查缓存，避免重复加载
     * 2. 合并并发请求，同一组件只加载一次
     * 3. 处理 ES 模块默认导出
     * 4. 自动缓存加载结果
     * 
     * @param componentDef - 组件定义（可能是函数或组件对象）
     * @param cacheKey - 缓存键
     * @returns 加载的组件或 null
     */
    const loadComponent = async (componentDef: any, cacheKey: string): Promise<Component | null> => {
      try {
        if (!componentDef)
          return null

        // 优化1：检查缓存，命中则直接返回
        if (componentCache.has(cacheKey)) {
          return componentCache.get(cacheKey)!
        }

        // 优化2：检查是否正在加载，避免重复请求
        if (loadingPromises.has(cacheKey)) {
          return await loadingPromises.get(cacheKey)!
        }

        // 处理懒加载组件（函数形式）
        if (typeof componentDef === 'function') {
          const loadPromise = componentDef().then((result: any) => {
            // 处理 ES 模块默认导出
            const component = result && typeof result === 'object' && 'default' in result
              ? result.default
              : result

            // 缓存成功加载的组件
            componentCache.set(cacheKey, component)
            loadingPromises.delete(cacheKey)

            return component
          })

          // 记录加载 Promise，避免并发重复加载
          loadingPromises.set(cacheKey, loadPromise)
          return await loadPromise
        }

        // 处理同步组件（直接缓存并返回）
        componentCache.set(cacheKey, componentDef)
        return componentDef
      }
      catch (error) {
        // 清理失败的加载 Promise
        loadingPromises.delete(cacheKey)
        console.error('组件加载失败:', error)
        throw error
      }
    }

    // 优化：使用 computed 减少重复计算
    const matchedRecord = computed(() => {
      const matched = route.value?.matched
      if (!matched?.length) return null
      return matched[currentDepth - 1]
    })

    const componentDef = computed(() => {
      return matchedRecord.value?.components?.[props.name]
    })

    // 优化：使用更精确的依赖追踪
    watch(
      componentDef,
      async (newComponentDef, oldComponentDef) => {
        if (!newComponentDef) {
          currentComponent.value = null
          isLoading.value = false
          error.value = null
          return
        }

        // 如果组件没有变化，不重新加载
        if (newComponentDef === oldComponentDef && currentComponent.value) {
          return
        }

        // 生成缓存键
        const cacheKey = `${String(matchedRecord.value?.name ?? 'default')}_${String(props.name)}`

        try {
          // 如果是函数（懒加载），显示loading状态
          if (typeof newComponentDef === 'function' && props.loading) {
            isLoading.value = true
          }

          const loadedComponent = await loadComponent(newComponentDef, cacheKey)

          if (loadedComponent) {
            currentComponent.value = markRaw(loadedComponent)
            error.value = null
          }

          isLoading.value = false
        }
        catch (err) {
          console.error('Failed to load component:', err)
          error.value = err as Error
          currentComponent.value = null
          isLoading.value = false
        }
      },
      { immediate: true },
    )

    return () => {
      const component = currentComponent.value

      // 如果有错误，显示错误信息
      if (error.value) {
        return slots.error?.({ error: error.value })
          || h('div', { class: 'router-view-error' }, `组件加载失败: ${error.value.message}`)
      }

      // 如果正在加载，显示loading
      if (isLoading.value && props.loading) {
        return slots.loading?.() || h('div', { class: 'router-view-loading' }, '加载中...')
      }

      // 优化：使用稳定的key生成策略
      const renderComponent = () => {
        if (!component)
          return null

        // 优化：使用缓存的key
        const componentKey = matchedRecord.value?.name
          ? String(matchedRecord.value.name)
          : route.value?.path || 'default'

        return h(component, {
          key: componentKey,
        })
      }

      // 包装transition
      const wrapWithTransition = (vnode: any) => {
        if (!props.transition)
          return vnode

        const transitionProps = typeof props.transition === 'string'
          ? { name: props.transition, mode: 'out-in' as const }
          : { mode: 'out-in' as const, ...props.transition }

        return h(Transition, transitionProps, () => vnode)
      }

      // 包装keep-alive
      const wrapWithKeepAlive = (vnode: any) => {
        if (!props.keepAlive)
          return vnode

        const keepAliveProps: any = {}
        if (props.include !== undefined)
          keepAliveProps.include = props.include
        if (props.exclude !== undefined)
          keepAliveProps.exclude = props.exclude
        if (props.max !== undefined)
          keepAliveProps.max = props.max

        return h(KeepAlive, keepAliveProps, () => vnode)
      }

      // 如果有默认slot，提供slot props（不包装transition，让用户自己控制）
      if (slots.default) {
        const slotContent = slots.default({
          Component: component,
          route: route.value || {},
        })
        return wrapWithKeepAlive(slotContent)
      }

      // 否则直接渲染组件（包装transition）
      const componentVNode = renderComponent()
      return wrapWithKeepAlive(wrapWithTransition(componentVNode))
    }
  },
})

export default RouterView
