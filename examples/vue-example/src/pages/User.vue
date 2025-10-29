<template>
  <div class="page user-page">
    <h2>👤 用户详情</h2>
    
    <div class="user-card">
      <div class="user-avatar">
        {{ userId.slice(0, 2).toUpperCase() }}
      </div>
      
      <div class="user-info">
        <h3>用户 #{{ userId }}</h3>
        <p class="user-meta">
          <span>📧 user{{ userId }}@example.com</span>
          <span>🕒 {{ currentTime }}</span>
        </p>
      </div>
    </div>

    <div class="details-section">
      <h3>路由参数信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">用户 ID (params):</span>
          <code>{{ params.id }}</code>
        </div>
        <div class="info-item">
          <span class="label">完整路径:</span>
          <code>{{ route.path }}</code>
        </div>
        <div class="info-item">
          <span class="label">查询参数:</span>
          <code>{{ JSON.stringify(route.query) || '{}' }}</code>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="changeUser(123)" class="btn btn-small">
        切换到用户 123
      </button>
      <button @click="changeUser(456)" class="btn btn-small">
        切换到用户 456
      </button>
      <button @click="changeUser(789)" class="btn btn-small">
        切换到用户 789
      </button>
    </div>

    <div class="navigation">
      <button @click="goBack" class="btn">
        ← 返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router-vue'

const router = useRouter()
const route = useRoute()

const params = computed(() => route.value.params)
const userId = computed(() => params.value.id as string || 'unknown')
const currentTime = ref('')

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('zh-CN')
}

function changeUser(id: number) {
  router.push(`/user/${id}`)
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.user-page {
  max-width: 800px;
}

.user-page h2 {
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.details-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.details-section h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
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
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.navigation {
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

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
</style>
