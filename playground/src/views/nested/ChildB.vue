<template>
  <div class="nested-child">
    <h4>子页面 B</h4>
    <p>路径: <code>/nested/child-b</code></p>
    <p>此页面是嵌套路由的第二个子页面。注意父子路由切换时只有子路由区域重新渲染，父组件保持不变。</p>
    <div style="margin-top: 12px; display: flex; gap: 8px;">
      <router-link to="/nested/child-a" class="btn btn-sm">← 子页面 A</router-link>
      <router-link to="/nested" class="btn btn-sm">默认 →</router-link>
    </div>
  </div>
</template>

<style scoped>
.nested-child {
  animation: fadeIn 0.3s ease;
}
.nested-child h4 {
  color: var(--warning);
  margin-bottom: 8px;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
