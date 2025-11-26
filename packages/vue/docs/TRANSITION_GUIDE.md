# 路由过渡动画使用指南

本指南详细介绍如何使用 `useRouteTransition` Composable 为路由切换添加流畅的过渡动画效果。

## 目录

- [快速开始](#快速开始)
- [动画类型](#动画类型)
- [基础用法](#基础用法)
- [高级特性](#高级特性)
- [自定义动画](#自定义动画)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

## 快速开始

### 1. 引入样式文件

```ts
// main.ts
import '@ldesign/router-vue/styles/transitions.css'
```

### 2. 基础使用

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition
      :name="transitionName"
      :duration="duration"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
    >
      <component :is="Component" :key="$route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { useRouteTransition } from '@ldesign/router-vue'

const {
  transitionName,
  duration,
  onBeforeEnter,
  onAfterEnter,
} = useRouteTransition({
  defaultType: 'fade',
  duration: 300,
})
</script>
```

## 动画类型

### 预设动画类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `fade` | 淡入淡出 | 简单页面切换、模态框 |
| `slide-left` | 左滑 | 从右向左的导航流程 |
| `slide-right` | 右滑 | 从左向右的返回操作 |
| `slide-up` | 上滑 | 弹出层、底部导航 |
| `slide-down` | 下滑 | 下拉内容、顶部导航 |
| `zoom` | 缩放 | 详情页进入/退出 |
| `flip` | 翻转 | 卡片翻转、特殊效果 |
| `scale` | 缩放+模糊 | 高级过渡效果 |
| `none` | 无动画 | 需要禁用动画时 |

## 高级特性

### 1. 自动方向判断

```vue
<script setup lang="ts">
const { 
  transitionName, 
  direction,
  onBeforeEnter, 
  onAfterEnter 
} = useRouteTransition({
  defaultType: 'slide-left',
  autoDirection: true, // 启用自动方向判断
})

// 监听方向变化
watch(direction, (newDir) => {
  console.log('过渡方向:', newDir) // 'forward' | 'backward' | 'none'
})
</script>
```

### 2. 特定路由的过渡

```vue
<script setup lang="ts">
const { transitionName, setRouteTransition } = useRouteTransition({
  defaultType: 'fade',
  routeTransitions: {
    '/dashboard': 'slide-up',
    '/profile': 'zoom',
    '/settings': 'fade',
  },
})

// 也可以动态设置
setRouteTransition('/about', 'flip')
</script>
```

### 3. 完整生命周期控制

```vue
<script setup lang="ts">
const {
  transitionName,
  isTransitioning,
  onBeforeEnter,
  onAfterEnter,
  onBeforeLeave,
  onAfterLeave,
} = useRouteTransition()

watch(isTransitioning, (transitioning) => {
  if (transitioning) {
    console.log('正在过渡中...')
  }
})
</script>
```

## 性能优化

### 1. GPU 加速

预设样式已包含 GPU 加速优化：

```css
.my-transition-enter-active {
  will-change: transform, opacity;
  backface-visibility: hidden;
}
```

### 2. 条件性启用动画

```vue
<script setup lang="ts">
const enableTransitions = !matchMedia('(prefers-reduced-motion: reduce)').matches

const { transitionName } = useRouteTransition({
  enabled: enableTransitions,
})
</script>
```

## 常见问题

### Q1: 为什么动画没有生效？

检查：
1. 是否引入了 CSS 样式文件
2. 是否正确使用了 `transition` 组件
3. 是否为路由设置了唯一的 `key`

### Q2: 如何禁用某些路由的动画？

```vue
<script setup lang="ts">
const { transitionName } = useRouteTransition({
  routeTransitions: {
    '/no-animation': 'none',
  },
})
</script>
```

### Q3: 动画在移动端卡顿怎么办？

```vue
<script setup lang="ts">
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

const { transitionName } = useRouteTransition({
  defaultType: isMobile ? 'fade' : 'slide-left',
  duration: isMobile ? 200 : 300,
})
</script>
```

## API 参考

### useRouteTransition(options?)

**选项：**

- `defaultType?: TransitionType` - 默认过渡类型
- `duration?: number` - 过渡持续时间（毫秒）
- `enabled?: boolean` - 是否启用过渡
- `classPrefix?: string` - 自定义类名前缀
- `autoDirection?: boolean` - 自动判断方向
- `routeTransitions?: Record<string, TransitionType>` - 路由特定配置

**返回值：**

- `transitionName: ComputedRef<string>` - 过渡名称
- `type: ComputedRef<TransitionType>` - 当前过渡类型
- `direction: ComputedRef<TransitionDirection>` - 过渡方向
- `isTransitioning: ComputedRef<boolean>` - 是否正在过渡
- `duration: ComputedRef<number>` - 过渡持续时间
- `setTransition(type)` - 设置过渡类型
- `setRouteTransition(path, type)` - 设置路由过渡
- `setDirection(direction)` - 设置过渡方向
- `disable()` - 禁用过渡
- `enable(type?)` - 启用过渡
- `onBeforeEnter()` - 进入前钩子
- `onEnter()` - 进入中钩子
- `onAfterEnter()` - 进入后钩子
- `onBeforeLeave()` - 离开前钩子
- `onLeave()` - 离开中钩子
- `onAfterLeave()` - 离开后钩子