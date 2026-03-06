<template>
  <div>
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h2 style="margin: 0;">受保护页面</h2>
      <span class="tag tag-success">已认证</span>
    </div>

    <div class="card">
      <h3>恭喜！您已通过认证</h3>
      <p>此页面配置了 <code>meta: { requiresAuth: true }</code>，只有认证用户才能访问。</p>
      <p style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
        导航守卫 <code>beforeEach</code> 检测到此路由需要认证，如果未认证将被重定向到守卫演示页面。
      </p>
    </div>

    <div class="card">
      <h3>路由 Meta 信息</h3>
      <div style="display: grid; gap: 6px;">
        <div v-for="(value, key) in $route.meta" :key="key"
          style="display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border);">
          <span style="min-width: 120px; font-weight: 600; font-size: 13px; color: var(--text-secondary);">{{ key }}</span>
          <code>{{ value }}</code>
        </div>
      </div>
    </div>
  </div>
</template>
