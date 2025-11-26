<template>
  <div class="router-skeleton" :class="skeletonClasses" :style="skeletonStyle">
    <!-- 自定义骨架屏 -->
    <slot v-if="$slots.default && !loading"></slot>
    
    <!-- 默认骨架屏 -->
    <template v-else-if="loading">
      <!-- 头部骨架 -->
      <div v-if="showHeader" class="router-skeleton__header">
        <div class="router-skeleton__avatar" :style="avatarStyle"></div>
        <div class="router-skeleton__header-content">
          <div class="router-skeleton__line" style="width: 40%"></div>
          <div class="router-skeleton__line" style="width: 60%; margin-top: 8px"></div>
        </div>
      </div>
      
      <!-- 内容骨架 -->
      <div v-if="showContent" class="router-skeleton__content">
        <div
          v-for="(line, index) in rows"
          :key="index"
          class="router-skeleton__line"
          :style="getLineStyle(index)"
        ></div>
      </div>
      
      <!-- 卡片骨架 -->
      <div v-if="showCards" class="router-skeleton__cards">
        <div
          v-for="card in cardCount"
          :key="card"
          class="router-skeleton__card"
          :style="cardStyle"
        >
          <div class="router-skeleton__card-image" :style="cardImageStyle"></div>
          <div class="router-skeleton__card-content">
            <div class="router-skeleton__line" style="width: 80%"></div>
            <div class="router-skeleton__line" style="width: 60%; margin-top: 8px"></div>
          </div>
        </div>
      </div>
      
      <!-- 列表骨架 -->
      <div v-if="showList" class="router-skeleton__list">
        <div
          v-for="item in listCount"
          :key="item"
          class="router-skeleton__list-item"
        >
          <div class="router-skeleton__avatar" :style="listAvatarStyle"></div>
          <div class="router-skeleton__list-content">
            <div class="router-skeleton__line" style="width: 70%"></div>
            <div class="router-skeleton__line" style="width: 50%; margin-top: 8px"></div>
          </div>
        </div>
      </div>
      
      <!-- 表格骨架 -->
      <div v-if="showTable" class="router-skeleton__table">
        <div class="router-skeleton__table-header">
          <div
            v-for="col in tableColumns"
            :key="col"
            class="router-skeleton__table-cell"
          >
            <div class="router-skeleton__line" style="width: 80%"></div>
          </div>
        </div>
        <div
          v-for="row in tableRows"
          :key="row"
          class="router-skeleton__table-row"
        >
          <div
            v-for="col in tableColumns"
            :key="col"
            class="router-skeleton__table-cell"
          >
            <div class="router-skeleton__line" style="width: 90%"></div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 实际内容 -->
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * RouterSkeleton 组件 - 路由骨架屏
 * 
 * 特性：
 * - 🎨 多种预设骨架屏样式（头部、内容、卡片、列表、表格）
 * - ✨ 动画效果（波浪、闪烁、渐变）
 * - 🎯 自定义骨架屏模板
 * - 📱 响应式设计
 * - 🔄 与路由懒加载集成
 * - ⚡ 性能优化
 * - 🎭 主题定制
 */
import { computed, watch, ref } from 'vue'
import { useRoute } from 'vue-router'

export type SkeletonAnimation = 'wave' | 'pulse' | 'shimmer' | 'none'
export type SkeletonTheme = 'light' | 'dark'

export interface RouterSkeletonProps {
  /** 是否显示加载状态 */
  loading?: boolean
  /** 动画类型 */
  animation?: SkeletonAnimation
  /** 主题 */
  theme?: SkeletonTheme
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示内容 */
  showContent?: boolean
  /** 是否显示卡片 */
  showCards?: boolean
  /** 是否显示列表 */
  showList?: boolean
  /** 是否显示表格 */
  showTable?: boolean
  /** 内容行数 */
  rows?: number
  /** 卡片数量 */
  cardCount?: number
  /** 列表项数量 */
  listCount?: number
  /** 表格行数 */
  tableRows?: number
  /** 表格列数 */
  tableColumns?: number
  /** 头像大小 */
  avatarSize?: number
  /** 卡片图片高度 */
  cardImageHeight?: number
  /** 是否圆角 */
  rounded?: boolean
  /** 自定义基础颜色 */
  baseColor?: string
  /** 自定义高亮颜色 */
  highlightColor?: string
  /** 最小显示时间（ms，防止闪烁） */
  minShowTime?: number
  /** 自动监听路由变化 */
  autoRouteChange?: boolean
}

const props = withDefaults(defineProps<RouterSkeletonProps>(), {
  loading: true,
  animation: 'wave',
  theme: 'light',
  showHeader: false,
  showContent: true,
  showCards: false,
  showList: false,
  showTable: false,
  rows: 5,
  cardCount: 3,
  listCount: 5,
  tableRows: 5,
  tableColumns: 4,
  avatarSize: 48,
  cardImageHeight: 160,
  rounded: true,
  minShowTime: 300,
  autoRouteChange: false
})

export interface RouterSkeletonEmits {
  /** 加载状态变化 */
  (e: 'update:loading', value: boolean): void
  /** 开始加载 */
  (e: 'loading-start'): void
  /** 加载完成 */
  (e: 'loading-end'): void
}

const emit = defineEmits<RouterSkeletonEmits>()

const route = useRoute()

// 最小显示时间控制
const loadingStartTime = ref<number>(0)
const actualLoading = ref(props.loading)

// 样式计算
const skeletonClasses = computed(() => ({
  [`router-skeleton--${props.animation}`]: props.animation !== 'none',
  [`router-skeleton--${props.theme}`]: true,
  'router-skeleton--rounded': props.rounded,
  'router-skeleton--loading': actualLoading.value,
}))

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.baseColor) {
    style['--skeleton-base-color'] = props.baseColor
  }
  
  if (props.highlightColor) {
    style['--skeleton-highlight-color'] = props.highlightColor
  }
  
  return style
})

const avatarStyle = computed(() => ({
  width: `${props.avatarSize}px`,
  height: `${props.avatarSize}px`,
}))

const listAvatarStyle = computed(() => ({
  width: `${props.avatarSize * 0.75}px`,
  height: `${props.avatarSize * 0.75}px`,
}))

const cardStyle = computed(() => ({}))

const cardImageStyle = computed(() => ({
  height: `${props.cardImageHeight}px`,
}))

// 获取行样式（模拟真实文本宽度变化）
const getLineStyle = (index: number) => {
  const widths = ['100%', '95%', '90%', '85%', '80%', '75%', '70%']
  const width = widths[index % widths.length]
  return { width }
}

// 处理加载状态变化
watch(
  () => props.loading,
  async (newLoading) => {
    if (newLoading) {
      // 开始加载
      loadingStartTime.value = Date.now()
      actualLoading.value = true
      emit('loading-start')
    } else {
      // 结束加载 - 确保最小显示时间
      const elapsed = Date.now() - loadingStartTime.value
      const remaining = props.minShowTime - elapsed
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      
      actualLoading.value = false
      emit('loading-end')
      emit('update:loading', false)
    }
  },
  { immediate: true }
)

// 监听路由变化
if (props.autoRouteChange) {
  let routeChangeTimer: ReturnType<typeof setTimeout> | null = null
  
  watch(
    () => route.fullPath,
    () => {
      // 路由变化时显示骨架屏
      actualLoading.value = true
      loadingStartTime.value = Date.now()
      emit('loading-start')
      
      // 清除之前的定时器
      if (routeChangeTimer) {
        clearTimeout(routeChangeTimer)
      }
      
      // 设置超时自动隐藏（防止永久显示）
      routeChangeTimer = setTimeout(() => {
        actualLoading.value = false
        emit('loading-end')
      }, 5000)
    }
  )
}

// 暴露方法
defineExpose({
  show: () => {
    actualLoading.value = true
    loadingStartTime.value = Date.now()
    emit('loading-start')
  },
  hide: () => {
    actualLoading.value = false
    emit('loading-end')
  },
})
</script>

<style scoped>
.router-skeleton {
  width: 100%;
}

/* 基础骨架元素 */
.router-skeleton__line {
  height: 16px;
  background-color: var(--skeleton-base-color, #f0f0f0);
  border-radius: 4px;
  margin-bottom: 12px;
}

.router-skeleton__avatar {
  background-color: var(--skeleton-base-color, #f0f0f0);
  border-radius: 50%;
  flex-shrink: 0;
}

/* 头部骨架 */
.router-skeleton__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.router-skeleton__header-content {
  flex: 1;
}

/* 内容骨架 */
.router-skeleton__content {
  margin-bottom: 24px;
}

/* 卡片骨架 */
.router-skeleton__cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.router-skeleton__card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.router-skeleton__card-image {
  width: 100%;
  background-color: var(--skeleton-base-color, #f0f0f0);
}

.router-skeleton__card-content {
  padding: 16px;
}

/* 列表骨架 */
.router-skeleton__list {
  margin-bottom: 24px;
}

.router-skeleton__list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.router-skeleton__list-item:last-child {
  border-bottom: none;
}

.router-skeleton__list-content {
  flex: 1;
}

/* 表格骨架 */
.router-skeleton__table {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.router-skeleton__table-header {
  display: flex;
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.router-skeleton__table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.router-skeleton__table-row:last-child {
  border-bottom: none;
}

.router-skeleton__table-cell {
  flex: 1;
  padding: 12px 16px;
}

/* 圆角样式 */
.router-skeleton--rounded .router-skeleton__line {
  border-radius: 8px;
}

.router-skeleton--rounded .router-skeleton__card {
  border-radius: 12px;
}

/* Wave 波浪动画 */
.router-skeleton--wave .router-skeleton__line,
.router-skeleton--wave .router-skeleton__avatar,
.router-skeleton--wave .router-skeleton__card-image {
  background: linear-gradient(
    90deg,
    var(--skeleton-base-color, #f0f0f0) 25%,
    var(--skeleton-highlight-color, #e8e8e8) 50%,
    var(--skeleton-base-color, #f0f0f0) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Pulse 脉冲动画 */
.router-skeleton--pulse .router-skeleton__line,
.router-skeleton--pulse .router-skeleton__avatar,
.router-skeleton--pulse .router-skeleton__card-image {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Shimmer 闪烁动画 */
.router-skeleton--shimmer .router-skeleton__line,
.router-skeleton--shimmer .router-skeleton__avatar,
.router-skeleton--shimmer .router-skeleton__card-image {
  position: relative;
  overflow: hidden;
}

.router-skeleton--shimmer .router-skeleton__line::after,
.router-skeleton--shimmer .router-skeleton__avatar::after,
.router-skeleton--shimmer .router-skeleton__card-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 深色主题 */
.router-skeleton--dark {
  --skeleton-base-color: #2c2c2c;
  --skeleton-highlight-color: #3a3a3a;
}

.router-skeleton--dark .router-skeleton__card {
  background-color: #1a1a1a;
  border-color: #333;
}

.router-skeleton--dark .router-skeleton__table {
  border-color: #333;
}

.router-skeleton--dark .router-skeleton__table-header {
  background-color: #222;
  border-color: #333;
}

.router-skeleton--dark .router-skeleton__table-row {
  border-color: #2a2a2a;
}

.router-skeleton--dark .router-skeleton__list-item {
  border-color: #2a2a2a;
}

/* 响应式 */
@media (max-width: 768px) {
  .router-skeleton__cards {
    grid-template-columns: 1fr;
  }
  
  .router-skeleton__table {
    overflow-x: auto;
  }
}
</style>