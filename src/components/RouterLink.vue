<template>
  <component
    :is="tag"
    :class="linkClass"
    :href="href"
    :target="target"
    :rel="rel"
    :aria-current="isExactActive ? 'page' : null"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { LDesignRouter } from '../router'
import type { RouteLocationRaw } from '../types'

interface RouterLinkProps {
  to: RouteLocationRaw
  replace?: boolean
  activeClass?: string
  exactActiveClass?: string
  ariaCurrentValue?: string
  tag?: string
  target?: string
  rel?: string
  prefetch?: boolean
  disabled?: boolean
  external?: boolean
}

const props = withDefaults(defineProps<RouterLinkProps>(), {
  replace: false,
  activeClass: 'router-link-active',
  exactActiveClass: 'router-link-exact-active',
  ariaCurrentValue: 'page',
  tag: 'a',
  prefetch: true,
  disabled: false,
  external: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  mouseenter: [event: MouseEvent]
  mouseleave: [event: MouseEvent]
}>()

const router = inject<LDesignRouter>('$router')
if (!router) {
  throw new Error('RouterLink must be used within a router context')
}

const isHovered = ref(false)
const isPrefetched = ref(false)

// 解析目标路由
const resolvedRoute = computed(() => {
  if (props.external) return null
  
  try {
    return router.resolve(props.to)
  } catch (error) {
    console.warn('Failed to resolve route:', props.to, error)
    return null
  }
})

// 生成href
const href = computed(() => {
  if (props.external) {
    return typeof props.to === 'string' ? props.to : '#'
  }
  
  if (resolvedRoute.value) {
    return resolvedRoute.value.fullPath
  }
  
  return '#'
})

// 检查是否激活
const isActive = computed(() => {
  if (props.external || !resolvedRoute.value) return false
  
  const current = router.currentRoute.value
  if (!current) return false
  
  return current.path.startsWith(resolvedRoute.value.path)
})

// 检查是否精确激活
const isExactActive = computed(() => {
  if (props.external || !resolvedRoute.value) return false
  
  const current = router.currentRoute.value
  if (!current) return false
  
  return current.path === resolvedRoute.value.path &&
         JSON.stringify(current.query) === JSON.stringify(resolvedRoute.value.query) &&
         JSON.stringify(current.params) === JSON.stringify(resolvedRoute.value.params)
})

// 生成CSS类
const linkClass = computed(() => {
  const classes: string[] = ['router-link']
  
  if (props.disabled) {
    classes.push('router-link-disabled')
  }
  
  if (isActive.value) {
    classes.push(props.activeClass)
  }
  
  if (isExactActive.value) {
    classes.push(props.exactActiveClass)
  }
  
  if (isHovered.value) {
    classes.push('router-link-hover')
  }
  
  return classes
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  emit('click', event)
  
  if (props.disabled) {
    event.preventDefault()
    return
  }
  
  if (props.external) {
    return // 让浏览器处理外部链接
  }
  
  // 检查是否应该阻止默认行为
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return
  }
  
  if (props.target && props.target !== '_self') {
    return
  }
  
  event.preventDefault()
  
  if (resolvedRoute.value) {
    const method = props.replace ? 'replace' : 'push'
    router[method](props.to).catch(error => {
      console.error('Navigation failed:', error)
    })
  }
}

// 处理鼠标进入事件
const handleMouseEnter = (event: MouseEvent) => {
  isHovered.value = true
  emit('mouseenter', event)
  
  // 预加载
  if (props.prefetch && !props.external && !isPrefetched.value && resolvedRoute.value) {
    prefetchRoute()
  }
}

// 处理鼠标离开事件
const handleMouseLeave = (event: MouseEvent) => {
  isHovered.value = false
  emit('mouseleave', event)
}

// 预加载路由组件
const prefetchRoute = async () => {
  if (isPrefetched.value || !resolvedRoute.value) return
  
  isPrefetched.value = true
  
  try {
    const matched = resolvedRoute.value.matched
    if (matched.length > 0) {
      const component = matched[matched.length - 1].component
      
      if (typeof component === 'function') {
        await component()
      }
    }
  } catch (error) {
    console.warn('Failed to prefetch route component:', error)
  }
}
</script>

<style scoped>
.router-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.router-link:hover {
  text-decoration: underline;
}

.router-link-active {
  color: #1890ff;
  font-weight: 500;
}

.router-link-exact-active {
  color: #1890ff;
  font-weight: 600;
}

.router-link-disabled {
  color: #ccc;
  cursor: not-allowed;
  pointer-events: none;
}

.router-link-disabled:hover {
  text-decoration: none;
}

.router-link-hover {
  opacity: 0.8;
}
</style>