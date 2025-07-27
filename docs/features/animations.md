# 路由动画

路由动画为页面切换提供流畅的视觉效果，提升用户体验。`@ldesign/router` 提供了丰富的动画类型和自定义选项。

## 基础配置

### 启用路由动画

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'slide',
    duration: 300,
    easing: 'ease-in-out',
    direction: 'right'
  }
})
```

### 配置选项

```typescript
interface AnimationConfig {
  enabled?: boolean // 是否启用动画，默认 false
  type?: AnimationType // 动画类型，默认 'fade'
  duration?: number // 动画时长（毫秒），默认 300
  easing?: string // 缓动函数，默认 'ease-in-out'
  direction?: string // 动画方向，默认 'right'
}

type AnimationType = 'fade' | 'slide' | 'zoom' | 'flip' | 'custom'
```

## 动画类型

### 淡入淡出 (fade)

```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'fade',
    duration: 300
  }
})
```

```css
/* 淡入淡出动画样式 */
.ldesign-fade-enter-active,
.ldesign-fade-leave-active {
  transition: opacity 300ms ease-in-out;
}

.ldesign-fade-enter-from,
.ldesign-fade-leave-to {
  opacity: 0;
}
```

### 滑动 (slide)

```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'slide',
    duration: 300,
    direction: 'right' // 'left', 'right', 'up', 'down'
  }
})
```

```css
/* 滑动动画样式 */
.ldesign-slide-right-enter-active,
.ldesign-slide-right-leave-active {
  transition: transform 300ms ease-in-out;
}

.ldesign-slide-right-enter-from {
  transform: translateX(100%);
}

.ldesign-slide-right-leave-to {
  transform: translateX(-100%);
}

.ldesign-slide-left-enter-from {
  transform: translateX(-100%);
}

.ldesign-slide-left-leave-to {
  transform: translateX(100%);
}
```

### 缩放 (zoom)

```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'zoom',
    duration: 300
  }
})
```

```css
/* 缩放动画样式 */
.ldesign-zoom-enter-active,
.ldesign-zoom-leave-active {
  transition: all 300ms ease-in-out;
}

.ldesign-zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.ldesign-zoom-leave-to {
  opacity: 0;
  transform: scale(1.2);
}
```

### 翻转 (flip)

```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'flip',
    duration: 600
  }
})
```

```css
/* 翻转动画样式 */
.ldesign-flip-enter-active,
.ldesign-flip-leave-active {
  transition: all 600ms ease-in-out;
  transform-style: preserve-3d;
}

.ldesign-flip-enter-from {
  transform: rotateY(-90deg);
}

.ldesign-flip-leave-to {
  transform: rotateY(90deg);
}
```

## 组件中使用

### 基础动画组件

```vue
<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

function getTransitionName(route: any) {
  // 获取动画配置
  const animationOptions = router.animationManager.getTransitionOptions(route)
  return animationOptions.name
}

const transitionMode = 'out-in' // 或 'in-out'

function onBeforeEnter(el: Element) {
  console.log('动画开始前')
}

function onEnter(el: Element, done: () => void) {
  console.log('进入动画')
  done()
}

function onLeave(el: Element, done: () => void) {
  console.log('离开动画')
  done()
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="getTransitionName(route)"
      :mode="transitionMode"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

### 条件动画

```vue
<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'

const router = useRouter()
const currentRoute = useRoute()

function getConditionalTransition(route: any) {
  // 根据路由层级决定动画
  const fromDepth = currentRoute.value.matched.length
  const toDepth = route.matched.length

  if (toDepth > fromDepth) {
    return 'slide-left' // 进入子页面
  }
 else if (toDepth < fromDepth) {
    return 'slide-right' // 返回父页面
  }
 else {
    return 'fade' // 同级页面
  }
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="getConditionalTransition(route)"
      mode="out-in"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

## 路由级动画

### 在路由配置中指定动画

```typescript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      animation: 'fade'
    }
  },
  {
    path: '/user',
    name: 'User',
    component: User,
    meta: {
      animation: 'slide',
      animationDirection: 'left'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: {
      animation: 'zoom',
      animationDuration: 500
    }
  }
]
```

### 动态动画配置

```typescript
// 根据导航方向动态设置动画
router.beforeEach((to, from, next) => {
  const isForward = to.meta?.level > from.meta?.level

  if (isForward) {
    to.meta.animation = 'slide'
    to.meta.animationDirection = 'left'
  }
 else {
    to.meta.animation = 'slide'
    to.meta.animationDirection = 'right'
  }

  next()
})
```

## 自定义动画

### 创建自定义动画

```css
/* 自定义弹跳动画 */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.5s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(0);
  }
}
```

### 使用自定义动画

```typescript
const router = createLDesignRouter({
  routes,
  animation: {
    enabled: true,
    type: 'custom',
    customName: 'bounce'
  }
})
```

## 高级功能

### 动画方向检测

```typescript
// 自动检测导航方向
function detectNavigationDirection(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const routes = router.getRoutes()
  const toIndex = routes.findIndex(route => route.name === to.name)
  const fromIndex = routes.findIndex(route => route.name === from.name)

  if (toIndex > fromIndex) {
    return 'forward'
  }
 else if (toIndex < fromIndex) {
    return 'backward'
  }
 else {
    return 'none'
  }
}

// 根据方向设置动画
router.beforeEach((to, from, next) => {
  const direction = detectNavigationDirection(to, from)

  switch (direction) {
    case 'forward':
      to.meta.animation = 'slide'
      to.meta.animationDirection = 'left'
      break
    case 'backward':
      to.meta.animation = 'slide'
      to.meta.animationDirection = 'right'
      break
    default:
      to.meta.animation = 'fade'
  }

  next()
})
```

### 动画性能优化

```typescript
// 根据设备性能调整动画
function adjustAnimationForPerformance() {
  const isLowEndDevice = navigator.hardwareConcurrency <= 2
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (isLowEndDevice || prefersReducedMotion) {
    // 禁用复杂动画
    router.animationManager.setAnimationType('fade')
    router.animationManager.setDuration(150)
  }
}
```

### 动画状态管理

```typescript
// 动画状态管理
const animationState = reactive({
  isAnimating: false,
  currentAnimation: '',
  queue: []
})

// 动画队列管理
function queueAnimation(animation: string) {
  if (animationState.isAnimating) {
    animationState.queue.push(animation)
  }
 else {
    executeAnimation(animation)
  }
}

function executeAnimation(animation: string) {
  animationState.isAnimating = true
  animationState.currentAnimation = animation

  // 动画完成后处理队列
  setTimeout(() => {
    animationState.isAnimating = false

    if (animationState.queue.length > 0) {
      const nextAnimation = animationState.queue.shift()
      executeAnimation(nextAnimation)
    }
  }, router.animationManager.getDuration())
}
```

## 响应式动画

### 根据屏幕尺寸调整动画

```typescript
function useResponsiveAnimation() {
  const { isMobile, isTablet } = useDeviceRouter()

  const getResponsiveAnimation = () => {
    if (isMobile.value) {
      return {
        type: 'slide',
        duration: 200,
        direction: 'up'
      }
    }
 else if (isTablet.value) {
      return {
        type: 'slide',
        duration: 250,
        direction: 'left'
      }
    }
 else {
      return {
        type: 'fade',
        duration: 300
      }
    }
  }

  return { getResponsiveAnimation }
}
```

### 用户偏好设置

```typescript
// 尊重用户的动画偏好
function respectUserPreferences() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const updateAnimationSettings = () => {
    if (prefersReducedMotion.matches) {
      router.animationManager.disable()
    }
 else {
      router.animationManager.enable()
    }
  }

  prefersReducedMotion.addEventListener('change', updateAnimationSettings)
  updateAnimationSettings()
}
```

## 调试动画

### 动画调试工具

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()
const showDebugPanel = ref(process.env.NODE_ENV === 'development')

const currentAnimation = computed(() => router.animationManager.getCurrentAnimation())
const duration = computed(() => router.animationManager.getDuration())
const isAnimating = computed(() => router.animationManager.isAnimating())
const animationEnabled = computed(() => router.animationManager.isEnabled())

function toggleAnimation() {
  if (animationEnabled.value) {
    router.animationManager.disable()
  }
 else {
    router.animationManager.enable()
  }
}

function slowMotion() {
  router.animationManager.setDuration(1000) // 1秒慢动作
}

function resetAnimation() {
  router.animationManager.reset()
}
</script>

<template>
  <div v-if="showDebugPanel" class="animation-debug">
    <h3>动画调试</h3>
    <div>当前动画: {{ currentAnimation }}</div>
    <div>动画时长: {{ duration }}ms</div>
    <div>动画状态: {{ isAnimating ? '进行中' : '空闲' }}</div>

    <div class="debug-controls">
      <button @click="toggleAnimation">
        {{ animationEnabled ? '禁用' : '启用' }}动画
      </button>
      <button @click="slowMotion">
        慢动作模式
      </button>
      <button @click="resetAnimation">
        重置动画
      </button>
    </div>
  </div>
</template>
```

## 最佳实践

### 1. 选择合适的动画类型

```typescript
// 根据页面类型选择动画
function getAnimationByPageType(route: RouteLocationNormalized) {
  if (route.meta?.pageType === 'modal') {
    return 'zoom'
  }
 else if (route.meta?.pageType === 'drawer') {
    return 'slide'
  }
 else {
    return 'fade'
  }
}
```

### 2. 控制动画时长

```typescript
// 根据内容复杂度调整动画时长
function getAnimationDuration(route: RouteLocationNormalized) {
  const complexity = route.meta?.complexity || 'simple'

  switch (complexity) {
    case 'simple':
      return 200
    case 'medium':
      return 300
    case 'complex':
      return 500
    default:
      return 300
  }
}
```

### 3. 性能考虑

```typescript
// 在低性能设备上简化动画
function optimizeForPerformance() {
  const isLowEnd = navigator.hardwareConcurrency <= 2

  if (isLowEnd) {
    router.animationManager.setAnimationType('fade')
    router.animationManager.setDuration(150)
  }
}
```

路由动画是提升用户体验的重要手段，通过合理的配置和使用，可以让应用更加生动和专业。
