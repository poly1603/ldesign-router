<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" />
  </router-view>
</template>

<script setup lang="ts">
/**
 * RouterView 组件
 * 
 * 基于 vue-router 的 RouterView，可以添加增强功能
 */
import { RouterView as VueRouterView } from 'vue-router'

// 未来可以添加：
// - 过渡动画
// - 缓存策略
// - 加载状态
// - 错误边界
</script>

