<template>
  <div>
    <h2>LDesign Router Playground</h2>
    <p class="page-desc">
      全面展示 <code>@ldesign/router-vue</code> 的路由功能、API 用法和最佳实践。<br>
      本路由库基于 <code>vue-router</code> 和 <code>@ldesign/router-core</code>，提供了丰富的 Composables、插件系统和开箱即用的功能增强。
    </p>

    <div class="features-grid">
      <router-link v-for="feature in features" :key="feature.path" :to="feature.path" class="feature-card card">
        <span class="feature-letter">{{ feature.letter }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </router-link>
    </div>

    <!-- 快速开始 -->
    <div class="card" style="margin-top: 24px;">
      <h3>快速开始</h3>
      <p class="section-desc">支持两种集成方式：通过 LDesign Engine 插件系统（推荐）或直接作为 Vue 插件使用。</p>
      <div class="mode-compare">
        <div class="mode-block">
          <h4>Engine 模式 <span class="tag tag-primary">推荐</span></h4>
          <pre class="code-block"><code>import { createVueEngine } from '@ldesign/engine-vue3'
import { createRouterEnginePlugin } from '@ldesign/router-vue'
import routes from './router/routes'

const engine = createVueEngine({
  app: { rootComponent: App },
  plugins: [
    createRouterEnginePlugin({
      routes,
      mode: 'history',   // 'history' | 'hash' | 'memory'
      base: '/',
      preset: 'spa',     // 预设配置: 'spa' | 'admin' | 'mobile'
      animation: { type: 'fade', duration: 200 },
      debug: true,
    }),
  ],
})

engine.mount('#app')</code></pre>
        </div>
        <div class="mode-block">
          <h4>Vue Plugin 模式</h4>
          <pre class="code-block"><code>import { createApp } from 'vue'
import {
  createRouterPlugin,
  createWebHistory,
} from '@ldesign/router-vue'
import routes from './router/routes'

const app = createApp(App)

app.use(createRouterPlugin({
  history: createWebHistory(),
  routes,
  autoTitle: {
    template: '%s | My App',
    defaultTitle: 'Home',
  },
  progress: true,  // 自动导航进度条
  onReady: () => console.log('Router ready'),
}))

app.mount('#app')</code></pre>
        </div>
      </div>
    </div>

    <!-- 核心特性 -->
    <div class="card">
      <h3>核心特性</h3>
      <div class="feature-list">
        <div class="feature-item">
          <strong>丰富的 Composables</strong>
          <span>useParams, useQuery, useMeta, useRouteHistory, useNavigationProgress, useRouteCache 等 20+ 个响应式组合式函数</span>
        </div>
        <div class="feature-item">
          <strong>导航守卫体系</strong>
          <span>beforeEach / afterEach / beforeRouteLeave / beforeRouteUpdate，支持异步守卫和条件导航</span>
        </div>
        <div class="feature-item">
          <strong>动态路由管理</strong>
          <span>addRoute / removeRoute 运行时动态增删路由，支持路由匹配检查和列表查询</span>
        </div>
        <div class="feature-item">
          <strong>过渡动画控制</strong>
          <span>useRouteTransition 提供 fade / slide / zoom 等多种预设动画，支持自动方向判断</span>
        </div>
        <div class="feature-item">
          <strong>自动标题管理</strong>
          <span>根据路由 meta.title 自动更新 document.title，支持模板自定义</span>
        </div>
        <div class="feature-item">
          <strong>导航进度条</strong>
          <span>useNavigationProgress 提供 loading bar 进度状态，自动与路由导航绑定</span>
        </div>
      </div>
    </div>

    <!-- 安装 -->
    <div class="card">
      <h3>安装</h3>
      <pre class="code-block"><code># 安装路由包
pnpm add @ldesign/router-vue @ldesign/router-core

# 如果使用 Engine 模式，额外安装
pnpm add @ldesign/engine-vue3 @ldesign/engine-core</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const features = [
  { path: '/basic', letter: 'B', title: '基础路由', description: 'push / replace / back / forward 编程式和声明式导航' },
  { path: '/nested', letter: 'N', title: '嵌套路由', description: '父子路由嵌套、路由匹配链、子路由切换' },
  { path: '/dynamic', letter: 'D', title: '动态路由', description: '动态参数 :id、useParam / useQuery / useHash' },
  { path: '/guards', letter: 'G', title: '导航守卫', description: 'beforeEach / afterEach / onBeforeRouteLeave 守卫体系' },
  { path: '/composables', letter: 'C', title: 'Composables', description: '20+ 响应式组合函数完整演示与 API 文档' },
  { path: '/transitions', letter: 'T', title: '过渡动画', description: 'fade / slide / zoom / scale 多种路由切换动画预览' },
  { path: '/config', letter: 'R', title: '路由配置', description: '动态增删路由、路由列表查询、匹配检查' },
]
</script>

<style scoped>
.page-desc {
  color: var(--text-secondary);
  margin: 8px 0 24px;
  line-height: 1.7;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.feature-card {
  display: block;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);
}

.feature-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  color: var(--text);
}

.feature-letter {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  background: var(--primary-bg);
  color: var(--primary);
  margin-bottom: 12px;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.feature-list {
  display: grid;
  gap: 10px;
}

.feature-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  line-height: 1.5;
}

.feature-item strong {
  min-width: 140px;
  flex-shrink: 0;
  color: var(--text);
}

.feature-item span {
  color: var(--text-secondary);
}

.mode-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mode-block {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 16px;
}

.mode-block h4 {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.6;
}

.code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
}
</style>
