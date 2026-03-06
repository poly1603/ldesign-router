<template>
  <div>
    <h2>动态路由</h2>
    <p style="color: var(--text-secondary); margin: 8px 0 20px;">
      演示动态参数路由 <code>:id</code>，点击列表项查看详情
    </p>

    <div class="card">
      <h3>动态路由列表</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
        路由配置: <code>path: '/dynamic/:id'</code>
      </p>
      <div class="item-list">
        <router-link
          v-for="item in items"
          :key="item.id"
          :to="`/dynamic/${item.id}`"
          class="item-card"
        >
          <span class="item-id">#{{ item.id }}</span>
          <div>
            <div class="item-title">{{ item.title }}</div>
            <div class="item-desc">{{ item.description }}</div>
          </div>
          <span class="item-arrow">→</span>
        </router-link>
      </div>
    </div>

    <div class="card">
      <h3>编程式导航到动态路由</h3>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn" @click="$router.push('/dynamic/42')">push('/dynamic/42')</button>
        <button class="btn" @click="$router.push({ name: 'DynamicDetail', params: { id: 'custom-id' } })">
          push({ name, params: { id: 'custom-id' } })
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { id: '1', title: 'Vue 3 组合式 API', description: 'Composition API 使用指南' },
  { id: '2', title: 'Vite 构建工具', description: '下一代前端开发与构建工具' },
  { id: '3', title: 'TypeScript 类型系统', description: '类型安全的 JavaScript 超集' },
  { id: 'hello-world', title: '非数字 ID', description: '动态参数也可以是字符串' },
]
</script>

<style scoped>
.item-list {
  display: grid;
  gap: 8px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  transition: all 0.2s;
}

.item-card:hover {
  border-color: var(--primary);
  background: var(--primary-bg);
  color: var(--text);
}

.item-id {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-bg);
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
  min-width: 48px;
  text-align: center;
}

.item-title {
  font-weight: 600;
  font-size: 15px;
}

.item-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.item-arrow {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: 18px;
}
</style>
