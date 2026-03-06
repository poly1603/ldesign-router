<template>
  <div class="nested-child">
    <h4>默认子路由</h4>
    <p>这是 <code>/nested</code> 路径的默认子组件。</p>
    <p>当父路由 <code>/nested</code> 被匹配但没有匹配到更具体的子路由时，此组件会被渲染。</p>
    <div style="margin-top: 12px;">
      <router-link to="/nested/child-a" class="btn btn-sm">前往子页面 A →</router-link>
    </div>
  </div>
</template>

<style scoped>
.nested-child {
  animation: fadeIn 0.3s ease;
}
.nested-child h4 {
  color: var(--primary);
  margin-bottom: 8px;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
