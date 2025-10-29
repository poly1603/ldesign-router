<template>
  <div class="page home-page">
    <h2>🏠 欢迎使用 @ldesign/router-vue</h2>
    
    <div class="feature-cards">
      <div class="card">
        <h3>🚀 轻量快速</h3>
        <p>专为 Vue 3 优化的路由解决方案</p>
      </div>
      
      <div class="card">
        <h3>📦 类型安全</h3>
        <p>完整的 TypeScript 类型支持</p>
      </div>
      
      <div class="card">
        <h3>🎯 简单易用</h3>
        <p>符合直觉的 API 设计</p>
      </div>
    </div>

    <div class="actions">
      <button @click="goToAbout" class="btn btn-primary">
        了解更多
      </button>
      <button @click="goToUser" class="btn btn-secondary">
        查看用户示例
      </button>
    </div>

    <div class="stats">
      <p>页面访问次数: <strong>{{ visitCount }}</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router-vue'

const router = useRouter()
const visitCount = ref(0)

onMounted(() => {
  const stored = localStorage.getItem('home-visits')
  visitCount.value = stored ? Number.parseInt(stored) + 1 : 1
  localStorage.setItem('home-visits', visitCount.value.toString())
})

function goToAbout() {
  router.push('/about')
}

function goToUser() {
  router.push('/user/999')
}
</script>

<style scoped>
.home-page {
  text-align: center;
}

.home-page h2 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.card p {
  color: #666;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.stats {
  margin-top: 3rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.stats strong {
  color: #667eea;
  font-size: 1.2rem;
}
</style>
