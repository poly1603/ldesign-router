<template>
  <div class="page about-page">
    <h2>📖 关于 @ldesign/router-vue</h2>
    
    <div class="content">
      <section class="section">
        <h3>项目简介</h3>
        <p>
          @ldesign/router-vue 是一个专为 Vue 3 设计的现代化路由解决方案。
          它基于 @ldesign/router-core 核心库，提供了符合 Vue 生态的 API 和组件。
        </p>
      </section>

      <section class="section">
        <h3>核心特性</h3>
        <ul class="features-list">
          <li>✨ 完整的 Composition API 支持</li>
          <li>🔧 强大的路由钩子和守卫</li>
          <li>📱 动态路由和嵌套路由</li>
          <li>🎨 内置的 RouterLink 和 RouterView 组件</li>
          <li>⚡ 轻量级，无额外依赖</li>
          <li>🔒 完整的 TypeScript 类型定义</li>
        </ul>
      </section>

      <section class="section">
        <h3>快速开始</h3>
        <pre class="code-block"><code>{{ installCode }}</code></pre>
      </section>

      <section class="section">
        <h3>路由信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">当前路径:</span>
            <code>{{ currentRoute.path }}</code>
          </div>
          <div class="info-item">
            <span class="label">路由名称:</span>
            <code>{{ currentRoute.name || 'N/A' }}</code>
          </div>
          <div class="info-item">
            <span class="label">查询参数:</span>
            <code>{{ JSON.stringify(currentRoute.query) }}</code>
          </div>
        </div>
      </section>
    </div>

    <div class="actions">
      <button @click="goBack" class="btn">
        ← 返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '@ldesign/router-vue'

const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value)

const installCode = `npm install @ldesign/router-vue
# 或
pnpm add @ldesign/router-vue

import { createRouter } from '@ldesign/router-vue'

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ]
})`

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.about-page {
  max-width: 800px;
}

.about-page h2 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.content {
  text-align: left;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h3 {
  color: #333;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.section p {
  color: #666;
  line-height: 1.8;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 0.5rem 0;
  color: #444;
  line-height: 1.6;
}

.code-block {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.6;
}

.code-block code {
  font-family: 'Courier New', monospace;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item .label {
  font-weight: bold;
  color: #555;
}

.info-item code {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #667eea;
}

.actions {
  margin-top: 2rem;
  text-align: center;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
