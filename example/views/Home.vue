<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">{{ t('home.title') }}</h1>
      <p class="hero-subtitle">{{ t('home.subtitle') }}</p>
      <div class="hero-actions">
        <RouterLink to="/about" class="btn btn-primary">
          {{ t('home.learnMore') }}
        </RouterLink>
        <RouterLink to="/contact" class="btn btn-secondary">
          {{ t('home.getStarted') }}
        </RouterLink>
      </div>
    </div>
    
    <div class="features-section">
      <h2 class="section-title">{{ t('home.features.title') }}</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.key">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ t(`home.features.${feature.key}.title`) }}</h3>
          <p class="feature-description">{{ t(`home.features.${feature.key}.description`) }}</p>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <h2 class="section-title">{{ t('home.stats.title') }}</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ routeCount }}</div>
          <div class="stat-label">{{ t('home.stats.routes') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ navigationCount }}</div>
          <div class="stat-label">{{ t('home.stats.navigations') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ cacheSize }}</div>
          <div class="stat-label">{{ t('home.stats.cached') }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ deviceType }}</div>
          <div class="stat-label">{{ t('home.stats.device') }}</div>
        </div>
      </div>
    </div>
    
    <div class="demo-section">
      <h2 class="section-title">{{ t('home.demo.title') }}</h2>
      <div class="demo-controls">
        <button @click="addRandomTab" class="btn btn-outline">
          {{ t('home.demo.addTab') }}
        </button>
        <button @click="toggleTheme" class="btn btn-outline">
          {{ t('home.demo.toggleTheme') }}
        </button>
        <button @click="switchLanguage" class="btn btn-outline">
          {{ t('home.demo.switchLanguage') }}
        </button>
        <button @click="clearCache" class="btn btn-outline">
          {{ t('home.demo.clearCache') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from '../../src'
import { 
  useRouter,
  useDevice,
  useTabs,
  useTheme,
  useI18n,
  useCacheManager
} from '../../src'

// 获取各种管理器
const router = useRouter()
const { deviceType } = useDevice()
const { addTab } = useTabs()
const { toggleTheme } = useTheme()
const { locale, setLocale, t } = useI18n()
const cacheManager = useCacheManager()

// 功能特性列表
const features = ref([
  { key: 'deviceAdaptive', icon: '📱' },
  { key: 'tabManagement', icon: '📑' },
  { key: 'breadcrumbs', icon: '🍞' },
  { key: 'caching', icon: '💾' },
  { key: 'animations', icon: '✨' },
  { key: 'permissions', icon: '🔐' },
  { key: 'themes', icon: '🎨' },
  { key: 'i18n', icon: '🌍' }
])

// 统计数据
const routeCount = computed(() => {
  return router.getRoutes().length
})

const navigationCount = computed(() => {
  return router.devTools?.data.performance.navigationCount || 0
})

const cacheSize = computed(() => {
  return router.devTools?.data.cache.size || 0
})

// 演示功能
const addRandomTab = () => {
  const randomId = Math.floor(Math.random() * 1000)
  addTab({
    path: `/user/${randomId}`,
    title: `用户 ${randomId}`,
    closable: true
  })
  router.push(`/user/${randomId}`)
}

const switchLanguage = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  setLocale(newLocale)
}

const clearCache = () => {
  cacheManager.clear()
  console.log('Cache cleared')
}
</script>

<style scoped>
.home-page {
  max-width: 1000px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 4rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border-color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin: 0 0 3rem 0;
  color: #333;
}

.features-section {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.feature-description {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.stats-section {
  margin-bottom: 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.demo-section {
  background: #f8f9fa;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-controls {
    flex-direction: column;
    align-items: center;
  }
}

/* 暗色主题适配 */
:global(.theme-dark) .feature-card,
:global(.theme-dark) .stat-item {
  background: #2d2d2d;
  color: white;
}

:global(.theme-dark) .feature-title,
:global(.theme-dark) .section-title {
  color: white;
}

:global(.theme-dark) .feature-description,
:global(.theme-dark) .stat-label {
  color: #ccc;
}

:global(.theme-dark) .demo-section {
  background: #2d2d2d;
}
</style>