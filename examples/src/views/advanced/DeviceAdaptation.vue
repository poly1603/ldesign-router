<template>
  <div class="device-adaptation">
    <h1>设备适配示例</h1>

    <div class="device-info-panel">
      <h3>📱 当前设备信息</h3>
      <div class="device-info">
        <div class="info-item">
          <label>设备类型:</label>
          <span class="device-badge" :class="deviceType">
            {{ deviceType === 'mobile' ? '📱 手机' : deviceType === 'tablet' ? '📱 平板' : '🖥️ 桌面' }}
          </span>
        </div>
        <div class="info-item">
          <label>屏幕尺寸:</label>
          <span>{{ screenSize.width }} × {{ screenSize.height }}</span>
        </div>
        <div class="info-item">
          <label>方向:</label>
          <span>{{ orientation === 'portrait' ? '📱 竖屏' : '📱 横屏' }}</span>
        </div>
        <div class="info-item">
          <label>触摸支持:</label>
          <span>{{ touchSupport ? '✅ 支持' : '❌ 不支持' }}</span>
        </div>
      </div>
    </div>

    <div class="component-demo-panel">
      <h3>🎯 设备特定组件</h3>
      <p class="hint">根据设备类型自动加载不同的组件</p>
      
      <div class="component-preview">
        <div class="preview-header">
          <span>当前加载的组件：{{ currentComponent }}</span>
        </div>
        <div class="preview-body" :class="deviceType">
          <component :is="adaptiveComponent" />
        </div>
      </div>
      
      <div class="component-code">
        <code-block>
          <pre>// 路由配置
{
  path: '/home',
  deviceComponents: {
    mobile: () => import('@/views/mobile/Home.vue'),
    tablet: () => import('@/views/tablet/Home.vue'),
    desktop: () => import('@/views/desktop/Home.vue')
  }
}</pre>
        </code-block>
      </div>
    </div>

    <div class="access-control-panel">
      <h3>🛡️ 设备访问控制</h3>
      <p class="hint">限制特定路由只能在指定设备上访问</p>
      
      <div class="routes-list">
        <div 
          v-for="routeItem in accessRoutes" 
          :key="routeItem.path"
          class="route-item"
        >
          <div class="route-info">
            <span class="route-path">{{ routeItem.path }}</span>
            <span class="route-name">{{ routeItem.name }}</span>
          </div>
          <div class="route-devices">
            <span 
              v-for="device in ['mobile', 'tablet', 'desktop']" 
              :key="device"
              class="device-indicator"
              :class="{ 
                supported: routeItem.supportedDevices.includes(device),
                current: device === deviceType
              }"
            >
              {{ getDeviceIcon(device) }}
            </span>
          </div>
          <div class="route-status">
            <span 
              v-if="routeItem.supportedDevices.includes(deviceType)"
              class="status-badge supported"
            >
              ✓ 可访问
            </span>
            <span v-else class="status-badge unsupported">
              ✗ 不可访问
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="responsive-demo-panel">
      <h3>📐 响应式布局示例</h3>
      
      <div class="layout-preview">
        <div class="mobile-preview">
          <div class="preview-header">
            <span>📱 移动端</span>
          </div>
          <div class="preview-content mobile">
            <div class="nav-menu">菜单</div>
            <div class="content-area">
              <div class="content-block">内容1</div>
              <div class="content-block">内容2</div>
              <div class="content-block">内容3</div>
            </div>
          </div>
        </div>

        <div class="tablet-preview">
          <div class="preview-header">
            <span>📱 平板端</span>
          </div>
          <div class="preview-content tablet">
            <div class="nav-menu">菜单</div>
            <div class="content-area">
              <div class="content-block">内容1</div>
              <div class="content-block">内容2</div>
              <div class="content-block">内容3</div>
            </div>
            <div class="sidebar">侧边栏</div>
          </div>
        </div>

        <div class="desktop-preview">
          <div class="preview-header">
            <span>🖥️ 桌面端</span>
          </div>
          <div class="preview-content desktop">
            <div class="nav-menu">菜单</div>
            <div class="sidebar">侧边栏</div>
            <div class="content-area">
              <div class="content-block">内容1</div>
              <div class="content-block">内容2</div>
              <div class="content-block">内容3</div>
              <div class="content-block">内容4</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="test-panel">
      <h3>🧪 设备模拟测试</h3>
      <p class="hint">模拟不同设备查看效果（仅用于演示）</p>
      
      <div class="test-buttons">
        <button 
          v-for="device in ['mobile', 'tablet', 'desktop']" 
          :key="device"
          @click="simulateDevice(device)"
          class="btn"
          :class="{ active: simulatedDevice === device }"
        >
          {{ getDeviceIcon(device) }} {{ getDeviceName(device) }}
        </button>
        <button @click="resetDevice" class="btn btn-secondary">
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'

const deviceType = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
const screenSize = ref({ width: 0, height: 0 })
const orientation = ref<'portrait' | 'landscape'>('landscape')
const touchSupport = ref(false)
const simulatedDevice = ref<string | null>(null)

const MobileComponent = defineAsyncComponent(() => 
  Promise.resolve({
    template: `
      <div class="mobile-view">
        <h4>📱 移动端专用组件</h4>
        <p>这是为移动设备优化的界面</p>
        <ul>
          <li>简化的导航</li>
          <li>大按钮触控</li>
          <li>单列布局</li>
        </ul>
      </div>
    `
  })
)

const TabletComponent = defineAsyncComponent(() => 
  Promise.resolve({
    template: `
      <div class="tablet-view">
        <h4>📱 平板端专用组件</h4>
        <p>这是为平板设备优化的界面</p>
        <ul>
          <li>适中的导航</li>
          <li>两列布局</li>
          <li>侧边栏支持</li>
        </ul>
      </div>
    `
  })
)

const DesktopComponent = defineAsyncComponent(() => 
  Promise.resolve({
    template: `
      <div class="desktop-view">
        <h4>🖥️ 桌面端专用组件</h4>
        <p>这是为桌面设备优化的界面</p>
        <ul>
          <li>完整的导航</li>
          <li>多列布局</li>
          <li>丰富的交互</li>
        </ul>
      </div>
    `
  })
)

const adaptiveComponent = computed(() => {
  const type = simulatedDevice.value || deviceType.value
  switch (type) {
    case 'mobile':
      return MobileComponent
    case 'tablet':
      return TabletComponent
    default:
      return DesktopComponent
  }
})

const currentComponent = computed(() => {
  const type = simulatedDevice.value || deviceType.value
  return `${getDeviceName(type)}Component.vue`
})

const accessRoutes = [
  {
    path: '/admin',
    name: '管理后台',
    supportedDevices: ['desktop']
  },
  {
    path: '/dashboard',
    name: '仪表板',
    supportedDevices: ['tablet', 'desktop']
  },
  {
    path: '/mobile-app',
    name: '移动应用',
    supportedDevices: ['mobile']
  },
  {
    path: '/editor',
    name: '编辑器',
    supportedDevices: ['desktop']
  },
  {
    path: '/home',
    name: '首页',
    supportedDevices: ['mobile', 'tablet', 'desktop']
  }
]

function detectDevice() {
  const width = window.innerWidth
  
  if (width < 768) {
    deviceType.value = 'mobile'
  } else if (width < 1024) {
    deviceType.value = 'tablet'
  } else {
    deviceType.value = 'desktop'
  }
  
  screenSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  orientation.value = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  touchSupport.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

function getDeviceIcon(device: string) {
  switch (device) {
    case 'mobile': return '📱'
    case 'tablet': return '📱'
    case 'desktop': return '🖥️'
    default: return '❓'
  }
}

function getDeviceName(device: string) {
  switch (device) {
    case 'mobile': return '手机'
    case 'tablet': return '平板'
    case 'desktop': return '桌面'
    default: return '未知'
  }
}

function simulateDevice(device: string) {
  simulatedDevice.value = device
}

function resetDevice() {
  simulatedDevice.value = null
}

onMounted(() => {
  detectDevice()
  window.addEventListener('resize', detectDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', detectDevice)
})
</script>

<style scoped>
.device-adaptation {
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

h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.hint {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.device-info-panel,
.component-demo-panel,
.access-control-panel,
.responsive-demo-panel,
.test-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.device-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}

.info-item label {
  font-weight: 500;
  color: #666;
}

.device-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
}

.device-badge.mobile {
  background: #e3f2fd;
  color: #1976d2;
}

.device-badge.tablet {
  background: #f3e5f5;
  color: #7b1fa2;
}

.device-badge.desktop {
  background: #e8f5e9;
  color: #388e3c;
}

.component-preview {
  margin: 20px 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 12px 20px;
  background: #f5f5f5;
  font-weight: 500;
  color: #666;
}

.preview-body {
  padding: 30px;
  min-height: 200px;
}

.preview-body.mobile {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.preview-body.tablet {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
}

.preview-body.desktop {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.component-code {
  margin-top: 20px;
}

code-block {
  display: block;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

code-block pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.route-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route-path {
  font-family: monospace;
  color: #42b983;
  font-weight: 500;
}

.route-name {
  font-size: 14px;
  color: #666;
}

.route-devices {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.device-indicator {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e0e0e0;
  font-size: 16px;
  opacity: 0.3;
}

.device-indicator.supported {
  opacity: 1;
  background: #e8f5e9;
}

.device-indicator.current {
  box-shadow: 0 0 0 3px #42b983;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.supported {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge.unsupported {
  background: #ffebee;
  color: #f44336;
}

.layout-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.mobile-preview,
.tablet-preview,
.desktop-preview {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-content {
  padding: 20px;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-content.mobile {
  background: #f5f5f5;
}

.preview-content.mobile .nav-menu {
  height: 40px;
  background: #42b983;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.preview-content.mobile .content-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-content.tablet {
  background: #fafafa;
  flex-direction: row;
  flex-wrap: wrap;
}

.preview-content.tablet .nav-menu {
  width: 100%;
  height: 40px;
  background: #9c27b0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.preview-content.tablet .content-area {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.preview-content.tablet .sidebar {
  width: 120px;
  background: #ce93d8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.preview-content.desktop {
  background: #f0f0f0;
  flex-direction: row;
  flex-wrap: wrap;
}

.preview-content.desktop .nav-menu {
  width: 100%;
  height: 40px;
  background: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.preview-content.desktop .sidebar {
  width: 120px;
  background: #81c784;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  align-self: stretch;
}

.preview-content.desktop .content-area {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.content-block {
  padding: 20px;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn:hover {
  border-color: #42b983;
}

.btn.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.btn-secondary {
  background: #f0f0f0;
  border-color: #f0f0f0;
}

.btn-secondary:hover {
  background: #e0e0e0;
  border-color: #e0e0e0;
}

.mobile-view,
.tablet-view,
.desktop-view {
  padding: 20px;
  border-radius: 8px;
}

.mobile-view {
  background: #e3f2fd;
}

.tablet-view {
  background: #f3e5f5;
}

.desktop-view {
  background: #e8f5e9;
}

ul {
  margin: 15px 0;
  padding-left: 20px;
}

li {
  margin: 8px 0;
  color: #666;
}
</style>

