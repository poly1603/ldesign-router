<template>
  <div class="smart-preload-demo">
    <h1>智能预加载示例</h1>
    
    <div class="info-box">
      <h3>📊 预加载统计</h3>
      <div class="stats">
        <div class="stat-item">
          <label>预加载次数:</label>
          <span>{{ stats.preloadCount }}</span>
        </div>
        <div class="stat-item">
          <label>成功次数:</label>
          <span>{{ stats.successCount }}</span>
        </div>
        <div class="stat-item">
          <label>失败次数:</label>
          <span>{{ stats.failureCount }}</span>
        </div>
        <div class="stat-item">
          <label>缓存命中:</label>
          <span>{{ stats.cacheHits }}</span>
        </div>
      </div>
    </div>

    <div class="navigation-demo">
      <h3>🎯 导航示例</h3>
      <p class="hint">将鼠标悬停在链接上，路由会自动预加载</p>
      
      <div class="nav-links">
        <RouterLink 
          v-for="page in pages" 
          :key="page.path"
          :to="page.path"
          preload="hover"
          class="nav-link"
        >
          <span class="icon">{{ page.icon }}</span>
          <span class="text">{{ page.title }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="prediction-demo">
      <h3>🧠 行为预测</h3>
      <p class="hint">基于访问历史，系统会自动预测并预加载可能访问的路由</p>
      
      <div class="predictions">
        <div 
          v-for="prediction in predictions" 
          :key="prediction.path"
          class="prediction-item"
        >
          <div class="prediction-header">
            <span class="path">{{ prediction.path }}</span>
            <span class="confidence" :class="getConfidenceClass(prediction.confidence)">
              {{ (prediction.confidence * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="prediction-bar">
            <div 
              class="bar-fill" 
              :style="{ width: `${prediction.confidence * 100}%` }"
              :class="getConfidenceClass(prediction.confidence)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="history-demo">
      <h3>📜 访问历史</h3>
      <div class="history-list">
        <div 
          v-for="(item, index) in history" 
          :key="index"
          class="history-item"
        >
          <span class="time">{{ formatTime(item.timestamp) }}</span>
          <span class="path">{{ item.path }}</span>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="clearHistory" class="btn btn-secondary">
        清空历史
      </button>
      <button @click="resetStats" class="btn btn-secondary">
        重置统计
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from '@ldesign/router'

const router = useRouter()

const pages = [
  { path: '/products', icon: '🛍️', title: '商品列表' },
  { path: '/cart', icon: '🛒', title: '购物车' },
  { path: '/checkout', icon: '💳', title: '结算' },
  { path: '/orders', icon: '📦', title: '订单' },
  { path: '/profile', icon: '👤', title: '个人中心' },
  { path: '/settings', icon: '⚙️', title: '设置' }
]

const stats = ref({
  preloadCount: 0,
  successCount: 0,
  failureCount: 0,
  cacheHits: 0
})

const predictions = ref([
  { path: '/products', confidence: 0.85 },
  { path: '/cart', confidence: 0.65 },
  { path: '/checkout', confidence: 0.45 },
  { path: '/orders', confidence: 0.25 }
])

const history = ref([
  { path: '/', timestamp: Date.now() - 300000 },
  { path: '/products', timestamp: Date.now() - 240000 },
  { path: '/cart', timestamp: Date.now() - 180000 },
  { path: '/products', timestamp: Date.now() - 120000 },
  { path: '/', timestamp: Date.now() - 60000 }
])

function getConfidenceClass(confidence: number) {
  if (confidence >= 0.7) return 'high'
  if (confidence >= 0.4) return 'medium'
  return 'low'
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN')
}

function clearHistory() {
  history.value = []
}

function resetStats() {
  stats.value = {
    preloadCount: 0,
    successCount: 0,
    failureCount: 0,
    cacheHits: 0
  }
}

// 模拟统计更新
let statsInterval: number

onMounted(() => {
  statsInterval = window.setInterval(() => {
    if (Math.random() > 0.7) {
      stats.value.preloadCount++
      if (Math.random() > 0.2) {
        stats.value.successCount++
      } else {
        stats.value.failureCount++
      }
    }
    if (Math.random() > 0.8) {
      stats.value.cacheHits++
    }
  }, 3000)
})

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval)
  }
})
</script>

<style scoped>
.smart-preload-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

h3 {
  color: #42b983;
  margin-bottom: 15px;
}

.hint {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.info-box {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.stat-item label {
  font-weight: 500;
}

.stat-item span {
  color: #42b983;
  font-size: 20px;
  font-weight: bold;
}

.navigation-demo,
.prediction-demo,
.history-demo {
  margin-bottom: 30px;
}

.nav-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s;
}

.nav-link:hover {
  border-color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.nav-link .icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.nav-link .text {
  font-size: 14px;
}

.predictions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.prediction-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.prediction-header .path {
  font-weight: 500;
}

.prediction-header .confidence {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.confidence.high {
  background: #e8f5e9;
  color: #2e7d32;
}

.confidence.medium {
  background: #fff3e0;
  color: #f57c00;
}

.confidence.low {
  background: #ffebee;
  color: #c62828;
}

.prediction-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s;
}

.bar-fill.high {
  background: #4caf50;
}

.bar-fill.medium {
  background: #ff9800;
}

.bar-fill.low {
  background: #f44336;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.history-item .time {
  color: #999;
  font-size: 13px;
}

.history-item .path {
  font-weight: 500;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>

