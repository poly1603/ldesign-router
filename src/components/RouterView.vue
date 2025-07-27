<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { LDesignRouter } from '../core/router'
import type { RouteLocationNormalized } from '../types'

interface RouterViewProps {
  name?: string
  route?: RouteLocationNormalized
}

const props = withDefaults(defineProps<RouterViewProps>(), {
  name: 'default',
})

const router = inject<LDesignRouter>('$router')
if (!router) {
  throw new Error('RouterView must be used within a router context')
}

const loading = ref(false)
const currentComponent = ref<Component | null>(null)
const routeKey = ref(0)

// 获取当前路由
const currentRoute = computed(() => {
  return props.route || router.currentRoute.value
})

// 获取组件属性
const componentProps = computed(() => {
  const route = currentRoute.value
  if (!route)
return {}

  return {
    ...route.params,
    ...route.query,
    route,
  }
})

// 加载组件
async function loadComponent(route: RouteLocationNormalized) {
  if (!route.matched.length) {
    currentComponent.value = null
    return
  }

  const matched = route.matched[route.matched.length - 1]
  if (!matched.component) {
    currentComponent.value = null
    return
  }

  try {
    loading.value = true

    // 检查是否为异步组件
    if (typeof matched.component === 'function') {
      const component = await matched.component()
      currentComponent.value = component.default || component
    }
 else {
      currentComponent.value = matched.component
    }

    // 更新路由key以触发组件重新渲染
    routeKey.value++
  }
 catch (error) {
    console.error('Failed to load component:', error)
    currentComponent.value = null
  }
 finally {
    loading.value = false
  }
}

// 监听路由变化
watch(
  currentRoute,
  (newRoute) => {
    if (newRoute) {
      loadComponent(newRoute)
    }
  },
  { immediate: true },
)

// 生命周期
onMounted(() => {
  if (currentRoute.value) {
    loadComponent(currentRoute.value)
  }
})

onUnmounted(() => {
  currentComponent.value = null
})
</script>

<template>
  <component
    :is="currentComponent"
    v-if="currentComponent"
    v-bind="componentProps"
    :key="routeKey"
  />
  <div v-else-if="!loading" class="router-view-fallback">
    <slot name="fallback">
      <div class="router-view-error">
        <h3>页面未找到</h3>
        <p>请检查路由配置或URL是否正确</p>
      </div>
    </slot>
  </div>
  <div v-else class="router-view-loading">
    <slot name="loading">
      <div class="loading-spinner">
        <div class="spinner" />
        <p>加载中...</p>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.router-view-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.router-view-error {
  text-align: center;
  color: #666;
}

.router-view-error h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.router-view-error p {
  margin: 0;
  font-size: 1rem;
}

.router-view-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
</style>
