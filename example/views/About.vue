<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n, useRouter } from '../../src'

const { t } = useI18n()
const router = useRouter()

// 技术栈
const techStack = ref([
  'Vue 3',
  'TypeScript',
  'Composition API',
  'Reactive System',
  'ES Modules',
  'Vite',
  'Rollup',
])

// 架构层次
const architectureLayers = ref([
  {
    name: 'presentation',
    components: ['RouterView', 'RouterLink', 'Components'],
  },
  {
    name: 'composables',
    components: ['useRouter', 'useRoute', 'useDevice', 'useTabs'],
  },
  {
    name: 'managers',
    components: ['DeviceRouter', 'TabsManager', 'CacheManager', 'ThemeManager'],
  },
  {
    name: 'core',
    components: ['LDesignRouter', 'RouteResolver', 'NavigationGuards'],
  },
])

// 功能特性
const features = ref([
  {
    key: 'deviceAdaptive',
    icon: '📱',
    benefits: ['responsive', 'adaptive', 'optimized'],
  },
  {
    key: 'tabManagement',
    icon: '📑',
    benefits: ['multiTab', 'persistent', 'draggable'],
  },
  {
    key: 'caching',
    icon: '💾',
    benefits: ['performance', 'strategies', 'persistent'],
  },
  {
    key: 'animations',
    icon: '✨',
    benefits: ['smooth', 'customizable', 'performant'],
  },
])

// 性能指标
const performanceMetrics = computed(() => {
  const devTools = router.devTools
  return [
    {
      key: 'bundleSize',
      value: '< 50KB',
    },
    {
      key: 'navigationTime',
      value: `${devTools?.data.performance.averageNavigationTime.toFixed(1)}ms` || 'N/A',
    },
    {
      key: 'cacheHitRate',
      value: `${Math.round((devTools?.data.cache.hitRate || 0) * 100)}%`,
    },
    {
      key: 'memoryUsage',
      value: '< 5MB',
    },
  ]
})
</script>

<template>
  <div class="about-page">
    <div class="page-header">
      <h1 class="page-title">
        {{ t('about.title') }}
      </h1>
      <p class="page-subtitle">
        {{ t('about.subtitle') }}
      </p>
    </div>

    <div class="content-section">
      <div class="intro-card">
        <h2>{{ t('about.intro.title') }}</h2>
        <p>{{ t('about.intro.description') }}</p>

        <div class="tech-stack">
          <h3>{{ t('about.techStack.title') }}</h3>
          <div class="tech-items">
            <span v-for="tech in techStack" :key="tech" class="tech-item">
              {{ tech }}
            </span>
          </div>
        </div>
      </div>

      <div class="architecture-card">
        <h2>{{ t('about.architecture.title') }}</h2>
        <p>{{ t('about.architecture.description') }}</p>

        <div class="architecture-diagram">
          <div v-for="layer in architectureLayers" :key="layer.name" class="layer">
            <div class="layer-name">
              {{ t(`about.architecture.layers.${layer.name}`) }}
            </div>
            <div class="layer-components">
              <span
                v-for="component in layer.components"
                :key="component"
                class="component"
              >
                {{ component }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="features-card">
        <h2>{{ t('about.features.title') }}</h2>
        <div class="features-list">
          <div v-for="feature in features" :key="feature.key" class="feature-item">
            <div class="feature-icon">
              {{ feature.icon }}
            </div>
            <div class="feature-content">
              <h3>{{ t(`about.features.${feature.key}.title`) }}</h3>
              <p>{{ t(`about.features.${feature.key}.description`) }}</p>
              <ul class="feature-benefits">
                <li v-for="benefit in feature.benefits" :key="benefit">
                  {{ t(`about.features.${feature.key}.benefits.${benefit}`) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="performance-card">
        <h2>{{ t('about.performance.title') }}</h2>
        <p>{{ t('about.performance.description') }}</p>

        <div class="performance-metrics">
          <div v-for="metric in performanceMetrics" :key="metric.key" class="metric">
            <div class="metric-value">
              {{ metric.value }}
            </div>
            <div class="metric-label">
              {{ t(`about.performance.metrics.${metric.key}`) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #333;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.intro-card,
.architecture-card,
.features-card,
.performance-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.intro-card h2,
.architecture-card h2,
.features-card h2,
.performance-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.intro-card p,
.architecture-card p,
.performance-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.tech-stack {
  margin-top: 2rem;
}

.tech-stack h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-item {
  background: #f0f2f5;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.architecture-diagram {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.layer {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.layer-name {
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.layer-components {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.component {
  background: white;
  color: #333;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  border: 1px solid #e9ecef;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.feature-content p {
  color: #666;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.feature-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-benefits li {
  background: #e6f7ff;
  color: #1890ff;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.metric-label {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .feature-item {
    flex-direction: column;
    text-align: center;
  }

  .feature-benefits {
    justify-content: center;
  }

  .performance-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .layer-components {
    justify-content: center;
  }
}

/* 暗色主题适配 */
:global(.theme-dark) .intro-card,
:global(.theme-dark) .architecture-card,
:global(.theme-dark) .features-card,
:global(.theme-dark) .performance-card {
  background: #2d2d2d;
  color: white;
}

:global(.theme-dark) .page-title,
:global(.theme-dark) .intro-card h2,
:global(.theme-dark) .architecture-card h2,
:global(.theme-dark) .features-card h2,
:global(.theme-dark) .performance-card h2,
:global(.theme-dark) .tech-stack h3,
:global(.theme-dark) .feature-content h3 {
  color: white;
}

:global(.theme-dark) .page-subtitle,
:global(.theme-dark) .intro-card p,
:global(.theme-dark) .architecture-card p,
:global(.theme-dark) .performance-card p,
:global(.theme-dark) .feature-content p,
:global(.theme-dark) .metric-label {
  color: #ccc;
}

:global(.theme-dark) .tech-item {
  background: #404040;
  color: #ccc;
}

:global(.theme-dark) .layer {
  background: #404040;
}

:global(.theme-dark) .component {
  background: #2d2d2d;
  color: #ccc;
  border-color: #555;
}

:global(.theme-dark) .metric {
  background: #404040;
}
</style>
