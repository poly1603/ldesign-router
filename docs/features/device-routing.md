# 设备适配路由

设备适配路由根据用户设备类型提供不同的路由组件和体验。`@ldesign/router` 提供了智能的设备检测和适配功能。

## 基础配置

### 启用设备路由

```typescript
import { createLDesignRouter } from '@ldesign/router'

const router = createLDesignRouter({
  routes,
  deviceRouter: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    },
    defaultDevice: 'desktop'
  }
})
```

### 配置选项

```typescript
interface DeviceRouterConfig {
  enabled?: boolean // 是否启用设备路由，默认 false
  breakpoints?: { // 断点配置
    mobile?: number // 移动设备断点，默认 768
    tablet?: number // 平板设备断点，默认 1024
  }
  defaultDevice?: DeviceType // 默认设备类型，默认 'desktop'
}

type DeviceType = 'desktop' | 'tablet' | 'mobile'
```

## 路由配置

### 设备特定组件

```typescript
const routes = [
  {
    path: '/product/:id',
    name: 'Product',
    // 为不同设备提供不同组件
    components: {
      desktop: () => import('@/views/ProductDesktop.vue'),
      tablet: () => import('@/views/ProductTablet.vue'),
      mobile: () => import('@/views/ProductMobile.vue')
    },
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    // 移动设备使用不同的组件
    component: () => import('@/views/DashboardDesktop.vue'),
    meta: {
      mobileComponent: () => import('@/views/DashboardMobile.vue')
    }
  }
]
```

### 设备特定路由

```typescript
const routes = [
  // 桌面端路由
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDesktop,
    meta: {
      devices: ['desktop', 'tablet'] // 只在桌面和平板显示
    }
  },
  // 移动端专用路由
  {
    path: '/mobile-menu',
    name: 'MobileMenu',
    component: MobileMenu,
    meta: {
      devices: ['mobile'] // 只在移动设备显示
    }
  },
  // 条件路由
  {
    path: '/settings',
    name: 'Settings',
    component: (route) => {
      const { deviceInfo } = useDeviceRouter()
      return deviceInfo.value.type === 'mobile'
        ? MobileSettings
        : DesktopSettings
    }
  }
]
```

## 组件使用

### 设备检测组件

```vue
<script setup lang="ts">
import { useDeviceRouter } from '@ldesign/router'

const { deviceInfo, isMobile, isTablet, isDesktop } = useDeviceRouter()

// 监听设备变化
watch(deviceInfo, (info) => {
  console.log('设备类型变化:', info.type)

  // 根据设备类型调整布局
  document.body.className = `device-${info.type}`
})
</script>

<template>
  <div class="responsive-layout">
    <!-- 桌面布局 -->
    <div v-if="isDesktop" class="desktop-layout">
      <aside class="sidebar">
        <navigation-menu />
      </aside>
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 平板布局 -->
    <div v-else-if="isTablet" class="tablet-layout">
      <header class="header">
        <mobile-header />
      </header>
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 移动布局 -->
    <div v-else class="mobile-layout">
      <header class="mobile-header">
        <mobile-nav />
      </header>
      <main class="mobile-main">
        <router-view />
      </main>
      <footer class="mobile-footer">
        <bottom-navigation />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.desktop-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
}

.tablet-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.mobile-main {
  flex: 1;
  overflow-y: auto;
}
</style>
```

### 响应式组件

```vue
<script setup lang="ts">
import { useDeviceRouter } from '@ldesign/router'

const props = defineProps<{
  product: Product
}>()

const { isMobile, isTablet, isDesktop } = useDeviceRouter()
</script>

<template>
  <div class="product-detail">
    <!-- 桌面端：侧边栏 + 主内容 -->
    <template v-if="isDesktop">
      <div class="desktop-layout">
        <aside class="product-sidebar">
          <product-gallery :images="product.images" />
        </aside>
        <main class="product-main">
          <product-info :product="product" />
          <product-specs :specs="product.specs" />
        </main>
      </div>
    </template>

    <!-- 平板端：垂直布局 -->
    <template v-else-if="isTablet">
      <div class="tablet-layout">
        <product-gallery-tablet :images="product.images" />
        <product-info-tablet :product="product" />
      </div>
    </template>

    <!-- 移动端：卡片式布局 -->
    <template v-else>
      <div class="mobile-layout">
        <product-gallery-mobile :images="product.images" />
        <div class="mobile-content">
          <product-info-mobile :product="product" />
          <product-actions-mobile :product="product" />
        </div>
      </div>
    </template>
  </div>
</template>
```

## 组合式函数

### useDeviceRouter

```typescript
import { useDeviceRouter } from '@ldesign/router'

const {
  deviceInfo, // 设备信息
  isMobile, // 是否为移动设备
  isTablet, // 是否为平板设备
  isDesktop, // 是否为桌面设备
  getDeviceComponent // 获取设备特定组件
} = useDeviceRouter()
```

### 设备特定逻辑

```vue
<script setup lang="ts">
import { useDeviceRouter } from '@ldesign/router'

const { deviceInfo, isMobile, getDeviceComponent } = useDeviceRouter()

// 根据设备类型选择组件
const currentComponent = computed(() => {
  return getDeviceComponent({
    desktop: DesktopComponent,
    tablet: TabletComponent,
    mobile: MobileComponent
  })
})

// 设备特定的配置
const pageSize = computed(() => {
  switch (deviceInfo.value.type) {
    case 'mobile':
      return 10
    case 'tablet':
      return 20
    case 'desktop':
      return 50
    default:
      return 20
  }
})

// 设备特定的行为
function handleItemClick(item: any) {
  if (isMobile.value) {
    // 移动端：显示底部抽屉
    showBottomSheet(item)
  }
 else {
    // 桌面端：显示模态框
    showModal(item)
  }
}
</script>
```

## 高级功能

### 动态设备检测

```typescript
// 自定义设备检测逻辑
function customDeviceDetection() {
  const userAgent = navigator.userAgent.toLowerCase()
  const width = window.innerWidth
  const height = window.innerHeight

  // 检测特定设备
  if (/ipad/.test(userAgent)) {
    return 'tablet'
  }

  if (/iphone|android.*mobile/.test(userAgent)) {
    return 'mobile'
  }

  // 基于屏幕尺寸
  if (width <= 768) {
    return 'mobile'
  }
 else if (width <= 1024) {
    return 'tablet'
  }
 else {
    return 'desktop'
  }
}
```

### 设备能力检测

```typescript
// 检测设备能力
function detectDeviceCapabilities() {
  return {
    touch: 'ontouchstart' in window,
    hover: window.matchMedia('(hover: hover)').matches,
    pointerFine: window.matchMedia('(pointer: fine)').matches,
    orientation: screen.orientation?.type || 'unknown',
    pixelRatio: window.devicePixelRatio || 1,
    memory: (navigator as any).deviceMemory || 'unknown',
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  }
}
```

### 设备特定路由守卫

```typescript
// 设备访问控制
router.beforeEach((to, from, next) => {
  const { deviceInfo } = useDeviceRouter()
  const allowedDevices = to.meta?.devices

  if (allowedDevices && !allowedDevices.includes(deviceInfo.value.type)) {
    // 重定向到设备适配页面
    const fallbackRoute = to.meta?.deviceFallback?.[deviceInfo.value.type]
    if (fallbackRoute) {
      next(fallbackRoute)
    }
 else {
      next('/device-not-supported')
    }
  }
 else {
    next()
  }
})
```

## 性能优化

### 设备特定代码分割

```typescript
// 按设备类型分割代码
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => {
      const { deviceInfo } = useDeviceRouter()

      switch (deviceInfo.value.type) {
        case 'mobile':
          return import(
            /* webpackChunkName: "dashboard-mobile" */
            '@/views/DashboardMobile.vue'
          )
        case 'tablet':
          return import(
            /* webpackChunkName: "dashboard-tablet" */
            '@/views/DashboardTablet.vue'
          )
        default:
          return import(
            /* webpackChunkName: "dashboard-desktop" */
            '@/views/DashboardDesktop.vue'
          )
      }
    }
  }
]
```

### 设备特定资源加载

```typescript
// 根据设备加载不同的资源
function loadDeviceSpecificAssets() {
  const { deviceInfo } = useDeviceRouter()

  if (deviceInfo.value.type === 'mobile') {
    // 移动端加载小尺寸图片
    return import('@/assets/images/mobile')
  }
 else {
    // 桌面端加载高清图片
    return import('@/assets/images/desktop')
  }
}
```

## 设备适配策略

### 渐进式增强

```vue
<script setup lang="ts">
import { useDeviceRouter } from '@ldesign/router'

const { deviceInfo } = useDeviceRouter()

const supportsEnhancedFeatures = computed(() => {
  return deviceInfo.value.type !== 'mobile'
    || deviceInfo.value.capabilities.memory >= 4
})

const isHighPerformanceDevice = computed(() => {
  return deviceInfo.value.type === 'desktop'
    && deviceInfo.value.capabilities.memory >= 8
})
</script>

<template>
  <div class="progressive-enhancement">
    <!-- 基础功能：所有设备都支持 -->
    <basic-content />

    <!-- 增强功能：仅在支持的设备上显示 -->
    <enhanced-features v-if="supportsEnhancedFeatures" />

    <!-- 高级功能：仅在高性能设备上显示 -->
    <advanced-features v-if="isHighPerformanceDevice" />
  </div>
</template>
```

### 优雅降级

```typescript
// 功能降级策略
function getFeatureLevel(deviceType: DeviceType) {
  switch (deviceType) {
    case 'desktop':
      return 'full'
    case 'tablet':
      return 'enhanced'
    case 'mobile':
      return 'basic'
    default:
      return 'basic'
  }
}

// 根据功能级别提供不同的体验
function getComponentByFeatureLevel(level: string) {
  switch (level) {
    case 'full':
      return FullFeaturedComponent
    case 'enhanced':
      return EnhancedComponent
    case 'basic':
      return BasicComponent
    default:
      return BasicComponent
  }
}
```

## 调试和测试

### 设备模拟

```typescript
// 开发环境设备模拟
function simulateDevice(deviceType: DeviceType) {
  if (process.env.NODE_ENV === 'development') {
    const router = useRouter()
    router.deviceRouter.setDeviceType(deviceType)
  }
}

// 在开发工具中添加设备切换
const DeviceSimulator = {
  template: `
    <div class="device-simulator">
      <button @click="simulateDevice('desktop')">桌面</button>
      <button @click="simulateDevice('tablet')">平板</button>
      <button @click="simulateDevice('mobile')">手机</button>
    </div>
  `,
  setup() {
    return { simulateDevice }
  }
}
```

### 设备测试

```typescript
// 设备兼容性测试
describe('Device Routing', () => {
  it('should render mobile component on mobile device', () => {
    // 模拟移动设备
    Object.defineProperty(window, 'innerWidth', { value: 375 })

    const wrapper = mount(ProductDetail, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.mobile-layout').exists()).toBe(true)
  })

  it('should render desktop component on desktop device', () => {
    // 模拟桌面设备
    Object.defineProperty(window, 'innerWidth', { value: 1920 })

    const wrapper = mount(ProductDetail, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('.desktop-layout').exists()).toBe(true)
  })
})
```

## 最佳实践

### 1. 移动优先设计

```typescript
// 从移动端开始设计，然后增强
const MobileFirstComponent = {
  template: `
    <div class="component">
      <!-- 移动端基础布局 -->
      <div class="mobile-base">
        <slot />
      </div>

      <!-- 平板端增强 -->
      <div v-if="!isMobile" class="tablet-enhancement">
        <additional-features />
      </div>

      <!-- 桌面端增强 -->
      <div v-if="isDesktop" class="desktop-enhancement">
        <advanced-features />
      </div>
    </div>
  `
}
```

### 2. 性能考虑

```typescript
// 避免在移动设备上加载重型组件
function shouldLoadHeavyComponent() {
  const { deviceInfo } = useDeviceRouter()

  return deviceInfo.value.type === 'desktop'
    && deviceInfo.value.capabilities.memory >= 4
}
```

### 3. 用户体验一致性

```typescript
// 保持核心功能在所有设备上的一致性
function getCoreFeatures() {
  return {
    navigation: true,
    search: true,
    userProfile: true,
    // 核心功能在所有设备上都可用
  }
}

function getEnhancedFeatures(deviceType: DeviceType) {
  const base = getCoreFeatures()

  if (deviceType !== 'mobile') {
    return {
      ...base,
      advancedFilters: true,
      bulkOperations: true,
      // 增强功能仅在非移动设备上可用
    }
  }

  return base
}
```

设备适配路由是构建现代响应式应用的重要功能，通过合理的设备检测和适配策略，可以为不同设备的用户提供最佳的体验。
