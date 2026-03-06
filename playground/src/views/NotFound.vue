<template>
  <div class="not-found">
    <div class="not-found-content">
      <span class="not-found-code">404</span>
      <h1>页面未找到</h1>
      <p>请求的路径 <code>{{ $route.fullPath }}</code> 不存在</p>
      <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center;">
        <button class="btn" @click="$router.back()">← 返回上一页</button>
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.not-found-code {
  font-size: 120px;
  font-weight: 800;
  color: var(--border);
  line-height: 1;
  display: block;
  margin-bottom: 16px;
}

.not-found h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.not-found p {
  color: var(--text-secondary);
}
</style>
