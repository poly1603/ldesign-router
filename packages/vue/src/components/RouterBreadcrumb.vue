<template>
  <nav class="router-breadcrumb" :class="rootClass" aria-label="breadcrumb">
    <ol class="router-breadcrumb__list">
      <!-- 首页链接 -->
      <li v-if="showHome" class="router-breadcrumb__item">
        <a
          class="router-breadcrumb__link"
          :class="{ 'is-active': isHome }"
          @click="handleClick(homeRoute)"
        >
          <slot name="home" :route="homeRoute">
            <span class="router-breadcrumb__text">{{ homeText }}</span>
          </slot>
        </a>
        <span v-if="items.length > 0" class="router-breadcrumb__separator">
          <slot name="separator">{{ separator }}</slot>
        </span>
      </li>

      <!-- 面包屑项 -->
      <li
        v-for="(item, index) in displayItems"
        :key="item.path"
        class="router-breadcrumb__item"
      >
        <!-- 省略号 -->
        <template v-if="item.isEllipsis">
          <span class="router-breadcrumb__ellipsis" @click="handleEllipsisClick">
            <slot name="ellipsis">...</slot>
          </span>
        </template>

        <!-- 常规项 -->
        <template v-else>
          <a
            class="router-breadcrumb__link"
            :class="{
              'is-active': isLast(index),
              'is-disabled': item.disabled
            }"
            @click="handleClick(item)"
          >
            <slot name="item" :item="item" :index="index" :is-last="isLast(index)">
              <span class="router-breadcrumb__text">{{ item.title }}</span>
            </slot>
          </a>

          <!-- 分隔符 -->
          <span v-if="!isLast(index)" class="router-breadcrumb__separator">
            <slot name="separator">{{ separator }}</slot>
          </span>
        </template>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute, type RouteLocationNormalizedLoaded, type RouteRecordNormalized } from 'vue-router'

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name?: string | symbol
  /** 显示标题 */
  title: string
  /** 是否禁用点击 */
  disabled?: boolean
  /** 路由查询参数 */
  query?: Record<string, any>
  /** 路由参数 */
  params?: Record<string, any>
  /** 路由元信息 */
  meta?: Record<string, any>
  /** 是否为省略号 */
  isEllipsis?: boolean
}

export interface RouterBreadcrumbProps {
  /** 分隔符 */
  separator?: string
  /** 是否显示首页链接 */
  showHome?: boolean
  /** 首页文本 */
  homeText?: string
  /** 首页路径 */
  homePath?: string
  /** 最大显示项数（0 表示不限制） */
  maxItems?: number
  /** 是否隐藏最后一项 */
  hideLast?: boolean
  /** 自定义根元素类名 */
  rootClass?: string | string[] | Record<string, boolean>
  /** 获取面包屑标题的函数 */
  getTitle?: (route: RouteRecordNormalized) => string
  /** 过滤面包屑项的函数 */
  filter?: (route: RouteRecordNormalized) => boolean
  /** 是否替换导航（不添加历史记录） */
  replace?: boolean
}

const props = withDefaults(defineProps<RouterBreadcrumbProps>(), {
  separator: '/',
  showHome: true,
  homeText: '首页',
  homePath: '/',
  maxItems: 0,
  hideLast: false,
  rootClass: '',
  getTitle: (route) => (route.meta?.title as string) || (route.name as string) || route.path,
  filter: () => true,
  replace: false
})

export interface RouterBreadcrumbEmits {
  /** 面包屑项被点击 */
  (e: 'item-click', item: BreadcrumbItem): void
  /** 省略号被点击 */
  (e: 'ellipsis-click'): void
}

const emit = defineEmits<RouterBreadcrumbEmits>()

const router = useRouter()
const route = useRoute()

// 展开省略号
const expanded = ref(false)

/**
 * 首页路由对象
 */
const homeRoute = computed<BreadcrumbItem>(() => ({
  path: props.homePath,
  name: 'home',
  title: props.homeText,
  disabled: false
}))

/**
 * 是否在首页
 */
const isHome = computed(() => route.path === props.homePath)

/**
 * 从路由匹配记录创建面包屑项
 */
const createBreadcrumbItem = (matchedRoute: RouteRecordNormalized): BreadcrumbItem => {
  return {
    path: matchedRoute.path,
    name: matchedRoute.name,
    title: props.getTitle(matchedRoute),
    disabled: false,
    query: route.query,
    params: route.params,
    meta: matchedRoute.meta as Record<string, any>
  }
}

/**
 * 面包屑项列表（不含首页）
 */
const items = computed<BreadcrumbItem[]>(() => {
  // 过滤首页路由
  const matched = route.matched.filter((item) => {
    return item.path !== props.homePath && props.filter(item)
  })

  let breadcrumbs = matched.map(createBreadcrumbItem)

  // 隐藏最后一项
  if (props.hideLast && breadcrumbs.length > 0) {
    breadcrumbs = breadcrumbs.slice(0, -1)
  }

  return breadcrumbs
})

/**
 * 显示的面包屑项（处理最大显示数量）
 */
const displayItems = computed<BreadcrumbItem[]>(() => {
  const maxItems = props.maxItems
  if (maxItems <= 0 || items.value.length <= maxItems || expanded.value) {
    return items.value
  }

  // 需要省略中间部分
  // 保留前面和后面各一半的项
  const keepStart = Math.ceil(maxItems / 2)
  const keepEnd = Math.floor(maxItems / 2)

  const result: BreadcrumbItem[] = []

  // 前面部分
  result.push(...items.value.slice(0, keepStart))

  // 省略号
  result.push({
    path: '',
    title: '...',
    disabled: true,
    isEllipsis: true
  })

  // 后面部分
  result.push(...items.value.slice(-keepEnd))

  return result
})

/**
 * 判断是否为最后一项
 */
const isLast = (index: number): boolean => {
  return index === displayItems.value.length - 1
}

/**
 * 处理面包屑项点击
 */
const handleClick = (item: BreadcrumbItem) => {
  // 禁用或当前项不跳转
  if (item.disabled || item.path === route.path) {
    return
  }

  emit('item-click', item)

  // 执行路由跳转
  const navigate = props.replace ? router.replace : router.push
  navigate({
    path: item.path,
    query: item.query,
    params: item.params
  })
}

/**
 * 处理省略号点击
 */
const handleEllipsisClick = () => {
  expanded.value = !expanded.value
  emit('ellipsis-click')
}

// 监听路由变化，重置展开状态
watch(
  () => route.path,
  () => {
    expanded.value = false
  }
)

// 暴露给外部使用的属性和方法
defineExpose({
  items,
  displayItems,
  expanded,
  handleClick,
  handleEllipsisClick
})
</script>

<style scoped>
.router-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 1;
}

.router-breadcrumb__list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.router-breadcrumb__item {
  display: flex;
  align-items: center;
}

.router-breadcrumb__link {
  display: inline-flex;
  align-items: center;
  color: #606266;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.router-breadcrumb__link:hover {
  color: #409eff;
}

.router-breadcrumb__link.is-active {
  color: #303133;
  font-weight: 500;
  cursor: default;
}

.router-breadcrumb__link.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.router-breadcrumb__link.is-disabled:hover {
  color: #c0c4cc;
}

.router-breadcrumb__text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.router-breadcrumb__separator {
  margin: 0 8px;
  color: #c0c4cc;
  user-select: none;
}

.router-breadcrumb__ellipsis {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  color: #909399;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s;
}

.router-breadcrumb__ellipsis:hover {
  color: #409eff;
}
</style>
