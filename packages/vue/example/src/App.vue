<script setup lang="ts">
import { RouterView, RouterLink } from '@ldesign/router-vue'
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🚀 Vue Router Example</h1>
      <p>@ldesign/router-vue 示例应用</p>
    </header>

    <nav class="nav">
      <RouterLink to="/" active-class="active">首页</RouterLink>
      <RouterLink to="/about" active-class="active">关于</RouterLink>
      <RouterLink to="/user/123" active-class="active">用户详情</RouterLink>
      <RouterLink to="/dashboard" active-class="active">仪表盘</RouterLink>
    </nav>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>基于 @ldesign/router-core 构建</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #42b883;
  margin: 0 0 0.5rem 0;
}

.header p {
  color: #666;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.nav :deep(a) {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav :deep(a:hover) {
  background: #e0e0e0;
}

.nav :deep(a.active) {
  background: #42b883;
  color: white;
}

.content {
  min-height: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e5e5;
  color: #666;
}
</style>


