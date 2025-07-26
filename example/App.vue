<template>
  <div id="app" :class="themeClass">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo">LDesign Router Demo</h1>
        
        <!-- 主导航菜单 -->
        <nav class="main-nav">
          <RouterLink to="/" class="nav-link">{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/about" class="nav-link">{{ t('nav.about') }}</RouterLink>
          <RouterLink to="/contact" class="nav-link">{{ t('nav.contact') }}</RouterLink>
          <RouterLink to="/user/123" class="nav-link">{{ t('nav.user') }}</RouterLink>
        </nav>
        
        <!-- 工具栏 -->
        <div class="toolbar">
          <!-- 语言切换 -->
          <select v-model="currentLocale" @change="handleLocaleChange" class="locale-selector">
            <option value="zh-CN">中文</option>
            <option value="en-US">English</option>
          </select>
          
          <!-- 主题切换 -->
          <button @click="toggleTheme" class="theme-toggle" :title="t('toolbar.toggleTheme')">
            {{ currentTheme === 'light' ? '🌙' : '☀️' }}
          </button>
          
          <!-- 设备信息 -->
          <span class="device-info">{{ deviceType }}</span>
        </div>
      </div>
    </header>
    
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container" v-if="breadcrumbs.length > 1">
      <nav class="breadcrumb">
        <span 
          v-for="(item, index) in breadcrumbs" 
          :key="index"
          class="breadcrumb-item"
        >
          <RouterLink 
            v-if="index < breadcrumbs.length - 1" 
            :to="item.path"
            class="breadcrumb-link"
          >
            {{ item.text }}
          </RouterLink>
          <span v-else class="breadcrumb-current">{{ item.text }}</span>
          <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">></span>
        </span>
      </nav>
    </div>
    
    <!-- 标签页 -->
    <div class="tabs-container" v-if="tabsEnabled && tabs.length > 0">
      <div class="tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.path"
          :class="['tab', { active: tab.path === activeTab?.path }]"
          @click="activateTab(tab.path)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <button 
            v-if="tab.closable && tabs.length > 1"
            @click.stop="removeTab(tab.path)"
            class="tab-close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <main class="app-main">
      <div class="content-wrapper">
        <!-- 路由视图 -->
        <transition :name="animationType" mode="out-in">
          <RouterView :key="routeKey" />
        </transition>
      </div>
    </main>
    
    <!-- 底部信息 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>{{ t('footer.copyright') }}</p>
        <div class="footer-stats">
          <span>{{ t('footer.currentRoute') }}: {{ currentRoute?.path || 'N/A' }}</span>
          <span>{{ t('footer.navigationCount') }}: {{ navigationCount }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { 
  RouterView, 
  RouterLink,
  useRoute,
  useRouter,
  useDevice,
  useTabs,
  useBreadcrumbs,
  useTheme,
  useI18n,
  useAnimationManager
} from '../src'

// 获取路由信息
const route = useRoute()
const router = useRouter()

// 获取设备信息
const { deviceType } = useDevice()

// 获取标签页管理
const { tabs, activeTab, activateTab, removeTab } = useTabs()
const tabsEnabled = computed(() => router.tabsManager.config.enabled)

// 获取面包屑
const { breadcrumbs } = useBreadcrumbs()

// 获取主题管理
const { theme: currentTheme, toggleTheme } = useTheme()
const themeClass = computed(() => `theme-${currentTheme.value}`)

// 获取国际化
const { locale: currentLocale, t, setLocale } = useI18n()

// 获取动画管理
const animationManager = useAnimationManager()
const animationType = computed(() => animationManager.config.type)

// 当前路由
const currentRoute = computed(() => route.value)

// 路由key，用于强制重新渲染
const routeKey = computed(() => {
  return currentRoute.value?.fullPath || ''
})

// 导航计数
const navigationCount = computed(() => {
  return router.devTools?.data.performance.navigationCount || 0
})

// 处理语言切换
const handleLocaleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setLocale(target.value)
}

// 监听路由变化
watch(currentRoute, (newRoute) => {
  console.log('Route changed to:', newRoute?.path)
}, { immediate: true })
</script>

<style scoped>
/* 基础样式 */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 主题样式 */
.theme-light {
  background-color: #ffffff;
  color: #333333;
}

.theme-dark {
  background-color: #1a1a1a;
  color: #ffffff;
}

/* 头部样式 */
.app-header {
  background: var(--header-bg, #f8f9fa);
  border-bottom: 1px solid var(--border-color, #e9ecef);
  padding: 0 1rem;
}

.theme-dark .app-header {
  --header-bg: #2d2d2d;
  --border-color: #404040;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1890ff;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: var(--hover-bg, #f0f0f0);
}

.theme-dark .nav-link:hover {
  --hover-bg: #404040;
}

.nav-link.router-link-active {
  color: #1890ff;
  background-color: var(--active-bg, #e6f7ff);
}

.theme-dark .nav-link.router-link-active {
  --active-bg: #1a3a5c;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.locale-selector {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  background: var(--input-bg, #ffffff);
  color: inherit;
}

.theme-dark .locale-selector {
  --border-color: #404040;
  --input-bg: #2d2d2d;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--hover-bg, #f0f0f0);
}

.device-info {
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
  text-transform: capitalize;
}

.theme-dark .device-info {
  --text-secondary: #999;
}

/* 面包屑样式 */
.breadcrumb-container {
  background: var(--breadcrumb-bg, #fafafa);
  border-bottom: 1px solid var(--border-color, #e9ecef);
  padding: 0.5rem 1rem;
}

.theme-dark .breadcrumb-container {
  --breadcrumb-bg: #262626;
  --border-color: #404040;
}

.breadcrumb {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: #1890ff;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--text-secondary, #666);
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: var(--text-secondary, #666);
}

/* 标签页样式 */
.tabs-container {
  background: var(--tabs-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #e9ecef);
  padding: 0 1rem;
}

.theme-dark .tabs-container {
  --tabs-bg: #1a1a1a;
  --border-color: #404040;
}

.tabs {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab:hover {
  background-color: var(--hover-bg, #f0f0f0);
}

.tab.active {
  border-bottom-color: #1890ff;
  color: #1890ff;
}

.tab-title {
  margin-right: 0.5rem;
}

.tab-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary, #666);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.tab-close:hover {
  background-color: var(--danger-bg, #ff4d4f);
  color: white;
}

/* 主要内容样式 */
.app-main {
  flex: 1;
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 动画样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 底部样式 */
.app-footer {
  background: var(--footer-bg, #f8f9fa);
  border-top: 1px solid var(--border-color, #e9ecef);
  padding: 1rem;
  margin-top: auto;
}

.theme-dark .app-footer {
  --footer-bg: #2d2d2d;
  --border-color: #404040;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.footer-stats {
  display: flex;
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 1rem 0;
  }
  
  .main-nav {
    margin: 1rem 0;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .footer-stats {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
}
</style>