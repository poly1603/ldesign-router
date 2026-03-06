<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>LDesign Router</h1>
        <span class="tag tag-primary">Playground</span>
      </div>
      <nav class="sidebar-nav">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item"
          :class="{ active: isActive(item.path) }">
          <span class="nav-letter">{{ item.letter }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="mode-info">
          <span class="tag tag-success">{{ mode }}</span>
        </div>
        <div class="route-info">
          <code>{{ $route.fullPath }}</code>
        </div>
      </div>
    </aside>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const mode = computed(() => {
  // 检查是否通过 Engine 启动
  return (window as any).__LDESIGN_ENGINE__ ? 'Engine Mode' : 'Vue Plugin Mode'
})

const navItems = [
  { path: '/', label: '首页', letter: 'H' },
  { path: '/basic', label: '基础路由', letter: 'B' },
  { path: '/nested', label: '嵌套路由', letter: 'N' },
  { path: '/dynamic', label: '动态路由', letter: 'D' },
  { path: '/guards', label: '导航守卫', letter: 'G' },
  { path: '/composables', label: 'Composables', letter: 'C' },
  { path: '/transitions', label: '过渡动画', letter: 'T' },
  { path: '/config', label: '路由配置', letter: 'R' },
  { path: '/async', label: '异步数据', letter: 'A' },
  { path: '/scroll', label: '滚动管理', letter: 'S' },
  { path: '/widgets', label: '组件展示', letter: 'W' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--card-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-header h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: var(--primary-bg);
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.nav-letter {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--border);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.2s;
}

.nav-item:hover .nav-letter {
  background: var(--primary-bg);
  color: var(--primary);
}

.nav-item.active .nav-letter {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-info code {
  font-size: 11px;
  word-break: break-all;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 32px;
  min-height: 100vh;
}
</style>
