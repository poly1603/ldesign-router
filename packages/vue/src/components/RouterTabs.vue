<template>
  <div class="router-tabs" :class="rootClass">
    <!-- 标签列表 -->
    <div class="router-tabs__list" ref="tabListRef">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="router-tabs__item"
        :class="{
          'is-active': isActive(tab),
          'is-affix': tab.affix,
          'is-closable': isClosable(tab)
        }"
        @click="handleTabClick(tab)"
        @contextmenu.prevent="handleContextMenu($event, tab)"
      >
        <!-- 自定义标签内容 -->
        <slot name="tab" :tab="tab" :is-active="isActive(tab)">
          <span class="router-tabs__item-label">{{ tab.title }}</span>
        </slot>

        <!-- 关闭按钮 -->
        <span
          v-if="isClosable(tab)"
          class="router-tabs__item-close"
          @click.stop="closeTab(tab)"
        >
          ×
        </span>
      </div>
    </div>

    <!-- 右侧操作按钮 -->
    <div v-if="showActions" class="router-tabs__actions">
      <slot name="actions" :tabs="tabs" :active-tab="activeTab">
        <button
          class="router-tabs__action-btn"
          @click="refreshCurrentTab"
          title="刷新当前标签"
        >
          ↻
        </button>
        <button
          class="router-tabs__action-btn"
          @click="closeOtherTabs"
          title="关闭其他标签"
        >
          ⊗
        </button>
        <button
          class="router-tabs__action-btn"
          @click="closeAllTabs"
          title="关闭所有标签"
        >
          ✕
        </button>
      </slot>
    </div>

    <!-- 右键菜单 -->
    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="router-tabs__context-menu"
        :style="{
          left: contextMenu.x + 'px',
          top: contextMenu.y + 'px'
        }"
        @click="closeContextMenu"
      >
        <slot name="contextMenu" :tab="contextMenu.tab" :close="closeContextMenu">
          <div
            class="router-tabs__context-menu-item"
            @click="refreshTab(contextMenu.tab)"
          >
            刷新
          </div>
          <div
            v-if="isClosable(contextMenu.tab)"
            class="router-tabs__context-menu-item"
            @click="closeTab(contextMenu.tab)"
          >
            关闭
          </div>
          <div
            class="router-tabs__context-menu-item"
            @click="closeOtherTabs(contextMenu.tab)"
          >
            关闭其他
          </div>
          <div
            class="router-tabs__context-menu-item"
            @click="closeLeftTabs(contextMenu.tab)"
          >
            关闭左侧
          </div>
          <div
            class="router-tabs__context-menu-item"
            @click="closeRightTabs(contextMenu.tab)"
          >
            关闭右侧
          </div>
          <div
            class="router-tabs__context-menu-item"
            @click="closeAllTabs"
          >
            关闭所有
          </div>
        </slot>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * 标签页对象
 */
export interface RouterTab {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name?: string | symbol
  /** 标签标题 */
  title: string
  /** 是否固定（固定的标签不能关闭） */
  affix?: boolean
  /** 路由查询参数 */
  query?: Record<string, any>
  /** 路由参数 */
  params?: Record<string, any>
  /** 自定义数据 */
  meta?: Record<string, any>
}

export interface RouterTabsProps {
  /** 是否持久化标签（存储到 localStorage） */
  persistent?: boolean
  /** 持久化存储的 key */
  storageKey?: string
  /** 最大标签数量 */
  maxTabs?: number
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 是否允许关闭 */
  closable?: boolean
  /** 固定的标签路径列表 */
  affixTabs?: string[]
  /** 自定义根元素类名 */
  rootClass?: string | string[] | Record<string, boolean>
  /** 获取标签标题的函数 */
  getTitle?: (route: RouteLocationNormalizedLoaded) => string
}

const props = withDefaults(defineProps<RouterTabsProps>(), {
  persistent: true,
  storageKey: 'router-tabs',
  maxTabs: 10,
  showActions: true,
  closable: true,
  affixTabs: () => [],
  rootClass: '',
  getTitle: (route) => (route.meta?.title as string) || (route.name as string) || route.path
})

export interface RouterTabsEmits {
  /** 标签被点击 */
  (e: 'tab-click', tab: RouterTab): void
  /** 标签被添加 */
  (e: 'tab-add', tab: RouterTab): void
  /** 标签被移除 */
  (e: 'tab-remove', tab: RouterTab): void
  /** 标签被刷新 */
  (e: 'tab-refresh', tab: RouterTab): void
  /** 标签数量达到上限 */
  (e: 'max-tabs-reached', maxTabs: number): void
}

const emit = defineEmits<RouterTabsEmits>()

const router = useRouter()
const route = useRoute()

// 标签列表
const tabs = ref<RouterTab[]>([])
const tabListRef = ref<HTMLElement>()

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null as RouterTab | null
})

// 当前激活的标签
const activeTab = computed(() => {
  return tabs.value.find((tab) => tab.path === route.path)
})

/**
 * 判断标签是否激活
 */
const isActive = (tab: RouterTab): boolean => {
  return tab.path === route.path
}

/**
 * 判断标签是否可关闭
 */
const isClosable = (tab: RouterTab): boolean => {
  return props.closable && !tab.affix
}

/**
 * 从路由创建标签对象
 */
const createTabFromRoute = (routeData: RouteLocationNormalizedLoaded): RouterTab => {
  return {
    path: routeData.path,
    name: routeData.name,
    title: props.getTitle(routeData),
    affix: props.affixTabs.includes(routeData.path),
    query: routeData.query,
    params: routeData.params,
    meta: routeData.meta as Record<string, any>
  }
}

/**
 * 添加标签
 */
const addTab = (tab: RouterTab) => {
  // 检查是否已存在
  const existingIndex = tabs.value.findIndex((t) => t.path === tab.path)
  if (existingIndex !== -1) {
    // 更新已存在的标签
    tabs.value[existingIndex] = tab
    return
  }

  // 检查是否达到最大数量
  if (tabs.value.length >= props.maxTabs) {
    // 移除最早的非固定标签
    const removableIndex = tabs.value.findIndex((t) => !t.affix)
    if (removableIndex !== -1) {
      tabs.value.splice(removableIndex, 1)
    } else {
      emit('max-tabs-reached', props.maxTabs)
      return
    }
  }

  tabs.value.push(tab)
  emit('tab-add', tab)
  saveToStorage()
}

/**
 * 移除标签
 */
const removeTab = (tab: RouterTab) => {
  const index = tabs.value.findIndex((t) => t.path === tab.path)
  if (index === -1) return

  tabs.value.splice(index, 1)
  emit('tab-remove', tab)
  saveToStorage()

  // 如果移除的是当前激活的标签，跳转到前一个或后一个标签
  if (isActive(tab)) {
    const nextTab = tabs.value[index] || tabs.value[index - 1]
    if (nextTab) {
      router.push({ path: nextTab.path, query: nextTab.query, params: nextTab.params })
    }
  }
}

/**
 * 点击标签
 */
const handleTabClick = (tab: RouterTab) => {
  emit('tab-click', tab)
  if (!isActive(tab)) {
    router.push({ path: tab.path, query: tab.query, params: tab.params })
  }
}

/**
 * 关闭标签
 */
const closeTab = (tab: RouterTab) => {
  if (!isClosable(tab)) return
  removeTab(tab)
}

/**
 * 刷新标签
 */
const refreshTab = (tab: RouterTab | null) => {
  if (!tab) return
  emit('tab-refresh', tab)
  
  // 如果是当前标签，重新加载路由
  if (isActive(tab)) {
    router.replace({
      path: tab.path,
      query: { ...tab.query, _t: Date.now() }
    })
  }
}

/**
 * 刷新当前标签
 */
const refreshCurrentTab = () => {
  refreshTab(activeTab.value || null)
}

/**
 * 关闭其他标签
 */
const closeOtherTabs = (exceptTab?: RouterTab) => {
  const targetTab = exceptTab || activeTab.value
  if (!targetTab) return

  tabs.value = tabs.value.filter((tab) => tab.affix || tab.path === targetTab.path)
  saveToStorage()
}

/**
 * 关闭左侧标签
 */
const closeLeftTabs = (targetTab: RouterTab | null) => {
  if (!targetTab) return

  const index = tabs.value.findIndex((t) => t.path === targetTab.path)
  if (index === -1) return

  tabs.value = tabs.value.filter((tab, i) => i >= index || tab.affix)
  saveToStorage()
}

/**
 * 关闭右侧标签
 */
const closeRightTabs = (targetTab: RouterTab | null) => {
  if (!targetTab) return

  const index = tabs.value.findIndex((t) => t.path === targetTab.path)
  if (index === -1) return

  tabs.value = tabs.value.filter((tab, i) => i <= index || tab.affix)
  saveToStorage()
}

/**
 * 关闭所有标签
 */
const closeAllTabs = () => {
  tabs.value = tabs.value.filter((tab) => tab.affix)
  saveToStorage()

  // 跳转到第一个固定标签
  const firstAffixTab = tabs.value[0]
  if (firstAffixTab && !isActive(firstAffixTab)) {
    router.push({ path: firstAffixTab.path })
  }
}

/**
 * 显示右键菜单
 */
const handleContextMenu = (event: MouseEvent, tab: RouterTab) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tab
  }
}

/**
 * 关闭右键菜单
 */
const closeContextMenu = () => {
  contextMenu.value.visible = false
}

/**
 * 保存到 localStorage
 */
const saveToStorage = () => {
  if (!props.persistent) return

  try {
    const data = tabs.value.map((tab) => ({
      path: tab.path,
      name: tab.name,
      title: tab.title,
      affix: tab.affix,
      query: tab.query,
      params: tab.params,
      meta: tab.meta
    }))
    localStorage.setItem(props.storageKey, JSON.stringify(data))
  } catch (error) {
    console.error('[RouterTabs] Failed to save to localStorage:', error)
  }
}

/**
 * 从 localStorage 加载
 */
const loadFromStorage = () => {
  if (!props.persistent) return

  try {
    const data = localStorage.getItem(props.storageKey)
    if (data) {
      tabs.value = JSON.parse(data)
    }
  } catch (error) {
    console.error('[RouterTabs] Failed to load from localStorage:', error)
  }
}

/**
 * 初始化固定标签
 */
const initAffixTabs = () => {
  props.affixTabs.forEach((path) => {
    const matchedRoute = router.getRoutes().find((r) => r.path === path)
    if (matchedRoute) {
      const tab: RouterTab = {
        path,
        name: matchedRoute.name,
        title: props.getTitle({
          ...route,
          path,
          name: matchedRoute.name,
          meta: matchedRoute.meta
        } as RouteLocationNormalizedLoaded),
        affix: true
      }
      addTab(tab)
    }
  })
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    const tab = createTabFromRoute(route)
    addTab(tab)
  },
  { immediate: true }
)

// 点击其他地方关闭右键菜单
const handleDocumentClick = () => {
  if (contextMenu.value.visible) {
    closeContextMenu()
  }
}

onMounted(() => {
  loadFromStorage()
  initAffixTabs()
  
  // 添加当前路由
  const currentTab = createTabFromRoute(route)
  addTab(currentTab)

  // 监听全局点击事件
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})

// 暴露给外部使用的方法
defineExpose({
  tabs,
  activeTab,
  addTab,
  removeTab,
  closeTab,
  refreshTab,
  closeOtherTabs,
  closeLeftTabs,
  closeRightTabs,
  closeAllTabs
})
</script>

<style scoped>
.router-tabs {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.router-tabs__list {
  flex: 1;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.router-tabs__list::-webkit-scrollbar {
  height: 4px;
}

.router-tabs__list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.router-tabs__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 16px;
  margin: 4px 2px;
  font-size: 14px;
  color: #606266;
  background: #f4f4f5;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.router-tabs__item:hover {
  color: #409eff;
  background: #ecf5ff;
  border-color: #c6e2ff;
}

.router-tabs__item.is-active {
  color: #409eff;
  background: #fff;
  border-color: #409eff;
}

.router-tabs__item.is-affix {
  background: #fdf6ec;
  border-color: #f5dab1;
}

.router-tabs__item.is-affix.is-active {
  background: #fff;
  border-color: #409eff;
}

.router-tabs__item-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.router-tabs__item-close {
  margin-left: 8px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  color: #909399;
  transition: color 0.3s;
}

.router-tabs__item-close:hover {
  color: #f56c6c;
}

.router-tabs__actions {
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-left: 1px solid #dcdfe6;
}

.router-tabs__action-btn {
  padding: 4px 8px;
  margin: 0 2px;
  font-size: 16px;
  color: #606266;
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s;
}

.router-tabs__action-btn:hover {
  color: #409eff;
  background: #ecf5ff;
}

.router-tabs__context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
  padding: 4px 0;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.router-tabs__context-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.router-tabs__context-menu-item:hover {
  color: #409eff;
  background: #ecf5ff;
}
</style>
