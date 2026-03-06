<template>
  <div class="nested-child">
    <h4>子页面 A</h4>
    <p>路径: <code>/nested/child-a</code></p>
    <p>此页面是嵌套路由的第一个子页面，在父组件 <code>NestedRoutes.vue</code> 的 <code>&lt;router-view&gt;</code> 中渲染。</p>
    <div style="margin-top: 12px; display: flex; gap: 8px;">
      <router-link to="/nested" class="btn btn-sm">← 默认</router-link>
      <router-link to="/nested/child-b" class="btn btn-sm">子页面 B →</router-link>
    </div>
  </div>
</template>

<style scoped>
.nested-child {
  animation: fadeIn 0.3s ease;
}
.nested-child h4 {
  color: var(--success);
  margin-bottom: 8px;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
