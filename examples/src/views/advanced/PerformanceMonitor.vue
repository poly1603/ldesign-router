<template>
  <div class="performance-monitor">
    <h1>性能监控示例</h1>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">⚡</div>
        <div class="metric-content">
          <h3>路由匹配速度</h3>
          <div class="metric-value">{{ metrics.matchSpeed }}ms</div>
          <div class="metric-change" :class="getChangeClass(metrics.matchSpeedChange)">
            {{ metrics.matchSpeedChange > 0 ? '+' : '' }}{{ metrics.matchSpeedChange }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📦</div>
        <div class="metric-content">
          <h3>组件加载时间</h3>
          <div class="metric-value">{{ metrics.componentLoad }}ms</div>
          <div class="metric-change" :class="getChangeClass(metrics.componentLoadChange)">
            {{ metrics.componentLoadChange > 0 ? '+' : '' }}{{ metrics.componentLoadChange }}%
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">💾</div>
        <div class="metric-content">
          <h3>缓存命中率</h3>
          <div class="metric-value">{{ metrics.cacheHitRate }}%</div>
          <div class="metric-trend">
            <div class="trend-bar" :style="{ width: `${metrics.cacheHitRate}%` }"></div>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🧠</div>
        <div class="metric-content">
          <h3>内存使用</h3>
          <div class="metric-value">{{ metrics.memoryUsage }}MB</div>
          <div class="metric-change" :class="getChangeClass(metrics.memoryChange)">
            {{ metrics.memoryChange > 0 ? '+' : '' }}{{ metrics.memoryChange }}%
          </div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>导航性能趋势</h3>
      <div class="chart">
        <div class="chart-bars">
          <div 
            v-for="(item, index) in performanceHistory" 
            :key="index"
            class="chart-bar"
            :style="{ height: `${item.value}%` }"
            :title="`${item.label}: ${item.value}ms`"
          >
            <div class="bar-fill"></div>
          </div>
        </div>
        <div class="chart-labels">
          <span v-for="(item, index) in performanceHistory" :key="index">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>

    <div class="navigation-log">
      <h3>导航日志</h3>
      <div class="log-controls">
        <button @click="clearLog" class="btn btn-small">清空日志</button>
        <label class="checkbox-label">
          <input v-model="autoScroll" type="checkbox" />
          自动滚动
        </label>
      </div>
      <div ref="logContainer" class="log-container">
        <div 
          v-for="(log, index) in navigationLog" 
          :key="index"
          class="log-entry"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span class="log-duration">{{ log.duration }}ms</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>性能测试</h3>
      <div class="test-controls">
        <button @click="runTest" :disabled="testing" class="btn btn-primary">
          {{ testing ? '测试中...' : '运行测试' }}
        </button>
        <button @click="runBenchmark" :disabled="testing" class="btn btn-secondary">
          运行基准测试
        </button>
      </div>
      
      <div v-if="testResults" class="test-results">
        <h4>测试结果</h4>
        <div class="result-grid">
          <div class="result-item">
            <label>平均耗时:</label>
            <span>{{ testResults.average }}ms</span>
          </div>
          <div class="result-item">
            <label>最小耗时:</label>
            <span>{{ testResults.min }}ms</span>
          </div>
          <div class="result-item">
            <label>最大耗时:</label>
            <span>{{ testResults.max }}ms</span>
          </div>
          <div class="result-item">
            <label>标准差:</label>
            <span>{{ testResults.stdDev }}ms</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from '@ldesign/router'

const router = useRouter()

const metrics = ref({
  matchSpeed: 1.4,
  matchSpeedChange: -30,
  componentLoad: 45,
  componentLoadChange: -15,
  cacheHitRate: 87,
  memoryUsage: 32,
  memoryChange: -20
})

const performanceHistory = ref([
  { label: '10s前', value: 80 },
  { label: '8s前', value: 75 },
  { label: '6s前', value: 60 },
  { label: '4s前', value: 70 },
  { label: '2s前', value: 55 },
  { label: '现在', value: 45 }
])

const navigationLog = ref([
  { time: '14:23:45', type: 'info', message: '导航到 /home', duration: 45 },
  { time: '14:23:46', type: 'success', message: '组件加载完成', duration: 120 },
  { time: '14:23:48', type: 'info', message: '导航到 /products', duration: 38 },
  { time: '14:23:49', type: 'success', message: '缓存命中', duration: 15 }
])

const testing = ref(false)
const testResults = ref(null)
const autoScroll = ref(true)
const logContainer = ref<HTMLElement | null>(null)

function getChangeClass(change: number) {
  return change > 0 ? 'positive' : 'negative'
}

function clearLog() {
  navigationLog.value = []
}

async function runTest() {
  testing.value = true
  testResults.value = null
  
  // 模拟测试
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  testResults.value = {
    average: 1.4,
    min: 0.8,
    max: 3.2,
    stdDev: 0.6
  }
  
  testing.value = false
}

async function runBenchmark() {
  testing.value = true
  
  addLog('info', '开始基准测试...', 0)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  addLog('success', '路由匹配测试完成', 1.4)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  addLog('success', '组件加载测试完成', 45)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  addLog('info', '基准测试完成', 0)
  
  testing.value = false
}

function addLog(type: string, message: string, duration: number) {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-CN')
  
  navigationLog.value.push({
    time,
    type,
    message,
    duration
  })
}

watch(navigationLog, async () => {
  if (autoScroll.value) {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
}, { deep: true })

// 模拟实时更新
let updateInterval: number

onMounted(() => {
  updateInterval = window.setInterval(() => {
    // 随机更新指标
    metrics.value.matchSpeed = +(Math.random() * 2 + 0.5).toFixed(1)
    metrics.value.componentLoad = Math.floor(Math.random() * 50 + 30)
    metrics.value.cacheHitRate = Math.floor(Math.random() * 20 + 80)
    metrics.value.memoryUsage = Math.floor(Math.random() * 10 + 28)
    
    // 更新历史数据
    performanceHistory.value.shift()
    performanceHistory.value.push({
      label: '现在',
      value: Math.floor(Math.random() * 40 + 30)
    })
    
    // 随机添加日志
    if (Math.random() > 0.7) {
      const types = ['info', 'success', 'warning']
      const type = types[Math.floor(Math.random() * types.length)]
      addLog(type, `随机导航事件`, Math.floor(Math.random() * 100))
    }
  }, 3000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.performance-monitor {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 36px;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 14px;
  font-weight: 500;
}

.metric-change.positive {
  color: #f44336;
}

.metric-change.negative {
  color: #4caf50;
}

.metric-trend {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.trend-bar {
  height: 100%;
  background: linear-gradient(90deg, #42b983, #35a372);
  transition: width 0.3s;
}

.chart-section,
.navigation-log,
.test-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.chart {
  margin-top: 20px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 10px 0;
  border-bottom: 2px solid #e0e0e0;
}

.chart-bar {
  flex: 1;
  max-width: 60px;
  margin: 0 5px;
  position: relative;
  cursor: pointer;
}

.bar-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #42b983, #35a372);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
}

.chart-bar:hover .bar-fill {
  opacity: 0.8;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.log-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 13px;
}

.log-entry {
  display: grid;
  grid-template-columns: 80px 80px 1fr 80px;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.log-entry:hover {
  background: #f9f9f9;
}

.log-entry.success {
  color: #4caf50;
}

.log-entry.warning {
  color: #ff9800;
}

.log-entry.error {
  color: #f44336;
}

.log-time {
  color: #999;
}

.log-type {
  font-weight: 500;
}

.log-duration {
  text-align: right;
  color: #666;
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #35a372;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.test-results {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.test-results h4 {
  margin-bottom: 15px;
  color: #42b983;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.result-item label {
  font-weight: 500;
}

.result-item span {
  color: #42b983;
  font-weight: bold;
}
</style>

