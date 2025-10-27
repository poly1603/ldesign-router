<template>
  <div class="seo-optimization">
    <h1>SEO 优化示例</h1>

    <div class="info-panel">
      <h3>📄 当前页面 SEO 信息</h3>
      <div class="seo-info">
        <div class="info-item">
          <label>标题:</label>
          <span>{{ currentSEO.title }}</span>
        </div>
        <div class="info-item">
          <label>描述:</label>
          <span>{{ currentSEO.description }}</span>
        </div>
        <div class="info-item">
          <label>关键词:</label>
          <span>{{ currentSEO.keywords }}</span>
        </div>
        <div class="info-item">
          <label>Canonical URL:</label>
          <span>{{ currentSEO.canonical }}</span>
        </div>
      </div>
    </div>

    <div class="og-panel">
      <h3>🌐 Open Graph 标签</h3>
      <div class="og-preview">
        <div class="og-card">
          <div v-if="currentSEO.ogImage" class="og-image">
            <img :src="currentSEO.ogImage" alt="OG Image" />
          </div>
          <div class="og-content">
            <h4>{{ currentSEO.ogTitle }}</h4>
            <p>{{ currentSEO.ogDescription }}</p>
            <span class="og-url">{{ currentSEO.ogUrl }}</span>
          </div>
        </div>
      </div>
      
      <div class="og-tags">
        <code-block>
          <pre>&lt;meta property="og:title" content="{{ currentSEO.ogTitle }}" /&gt;
&lt;meta property="og:description" content="{{ currentSEO.ogDescription }}" /&gt;
&lt;meta property="og:image" content="{{ currentSEO.ogImage }}" /&gt;
&lt;meta property="og:url" content="{{ currentSEO.ogUrl }}" /&gt;</pre>
        </code-block>
      </div>
    </div>

    <div class="twitter-panel">
      <h3>🐦 Twitter Card 标签</h3>
      <div class="twitter-preview">
        <div class="twitter-card">
          <div v-if="currentSEO.twitterImage" class="twitter-image">
            <img :src="currentSEO.twitterImage" alt="Twitter Image" />
          </div>
          <div class="twitter-content">
            <h4>{{ currentSEO.twitterTitle }}</h4>
            <p>{{ currentSEO.twitterDescription }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="structured-data-panel">
      <h3>📊 结构化数据</h3>
      <code-block>
        <pre>{{ formattedStructuredData }}</pre>
      </code-block>
    </div>

    <div class="sitemap-panel">
      <h3>🗺️ Sitemap 生成</h3>
      <p class="hint">基于路由配置自动生成 sitemap.xml</p>
      
      <div class="sitemap-options">
        <label class="checkbox-label">
          <input v-model="sitemapOptions.includeLastmod" type="checkbox" />
          包含最后修改时间
        </label>
        <label class="checkbox-label">
          <input v-model="sitemapOptions.includePriority" type="checkbox" />
          包含优先级
        </label>
        <label class="checkbox-label">
          <input v-model="sitemapOptions.includeChangefreq" type="checkbox" />
          包含更新频率
        </label>
      </div>
      
      <button @click="generateSitemap" class="btn btn-primary">
        生成 Sitemap
      </button>
      
      <code-block v-if="generatedSitemap">
        <pre>{{ generatedSitemap }}</pre>
      </code-block>
    </div>

    <div class="meta-tags-panel">
      <h3>🏷️ Meta 标签检查器</h3>
      <div class="meta-checker">
        <div class="checker-item" v-for="check in metaChecks" :key="check.name">
          <div class="check-status" :class="check.status">
            {{ check.status === 'pass' ? '✓' : '✗' }}
          </div>
          <div class="check-content">
            <strong>{{ check.name }}</strong>
            <p>{{ check.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="examples-panel">
      <h3>📝 示例路由</h3>
      <p class="hint">访问不同路由查看 SEO 配置效果</p>
      
      <div class="example-links">
        <RouterLink 
          v-for="example in examples" 
          :key="example.path"
          :to="example.path"
          class="example-link"
        >
          <span class="icon">{{ example.icon }}</span>
          <span class="text">{{ example.title }}</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from '@ldesign/router'

const route = useRoute()

const currentSEO = ref({
  title: 'SEO 优化示例 | @ldesign/router',
  description: '学习如何使用 @ldesign/router 进行 SEO 优化',
  keywords: 'Vue Router, SEO, Open Graph, Twitter Card',
  canonical: 'https://example.com/seo',
  ogTitle: 'SEO 优化示例',
  ogDescription: '学习如何使用 @ldesign/router 进行 SEO 优化',
  ogImage: 'https://via.placeholder.com/1200x630/42b983/ffffff?text=SEO+Optimization',
  ogUrl: 'https://example.com/seo',
  twitterTitle: 'SEO 优化示例',
  twitterDescription: '学习如何使用 @ldesign/router 进行 SEO 优化',
  twitterImage: 'https://via.placeholder.com/800x418/42b983/ffffff?text=SEO+Optimization'
})

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'SEO 优化示例',
  'description': '学习如何使用 @ldesign/router 进行 SEO 优化',
  'url': 'https://example.com/seo',
  'author': {
    '@type': 'Organization',
    'name': 'LDesign'
  }
}

const formattedStructuredData = computed(() => {
  return JSON.stringify(structuredData, null, 2)
})

const sitemapOptions = ref({
  includeLastmod: true,
  includePriority: true,
  includeChangefreq: true
})

const generatedSitemap = ref('')

const metaChecks = ref([
  {
    name: 'Title 标签',
    message: '✓ Title 标签存在且长度合适 (50-60 字符)',
    status: 'pass'
  },
  {
    name: 'Meta Description',
    message: '✓ Meta description 存在且长度合适 (150-160 字符)',
    status: 'pass'
  },
  {
    name: 'Open Graph',
    message: '✓ 所有必需的 Open Graph 标签都已设置',
    status: 'pass'
  },
  {
    name: 'Twitter Card',
    message: '✓ Twitter Card 标签配置正确',
    status: 'pass'
  },
  {
    name: 'Canonical URL',
    message: '✓ Canonical URL 已设置',
    status: 'pass'
  },
  {
    name: '结构化数据',
    message: '⚠️ 建议添加更多结构化数据以提升 SEO',
    status: 'warning'
  }
])

const examples = [
  { path: '/products', icon: '🛍️', title: '商品列表' },
  { path: '/blog', icon: '📝', title: '博客' },
  { path: '/about', icon: 'ℹ️', title: '关于我们' },
  { path: '/contact', icon: '✉️', title: '联系我们' }
]

function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  
  examples.forEach(example => {
    sitemap += '  <url>\n'
    sitemap += `    <loc>https://example.com${example.path}</loc>\n`
    
    if (sitemapOptions.value.includeLastmod) {
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`
    }
    
    if (sitemapOptions.value.includePriority) {
      sitemap += `    <priority>0.8</priority>\n`
    }
    
    if (sitemapOptions.value.includeChangefreq) {
      sitemap += `    <changefreq>weekly</changefreq>\n`
    }
    
    sitemap += '  </url>\n'
  })
  
  sitemap += '</urlset>'
  generatedSitemap.value = sitemap
}
</script>

<style scoped>
.seo-optimization {
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
  margin-bottom: 15px;
}

.info-panel,
.og-panel,
.twitter-panel,
.structured-data-panel,
.sitemap-panel,
.meta-tags-panel,
.examples-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.seo-info,
.og-tags,
.sitemap-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.info-item label {
  font-weight: 500;
  color: #666;
}

.og-preview,
.twitter-preview {
  margin-bottom: 20px;
}

.og-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  max-width: 600px;
}

.og-image,
.twitter-image {
  width: 100%;
  height: 314px;
  overflow: hidden;
  background: #f0f0f0;
}

.og-image img,
.twitter-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.og-content,
.twitter-content {
  padding: 15px;
}

.og-content h4,
.twitter-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.og-content p,
.twitter-content p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.og-url {
  font-size: 12px;
  color: #999;
}

.twitter-card {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  max-width: 500px;
}

.twitter-image {
  height: 260px;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  margin: 15px 0;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #35a372;
}

.meta-checker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checker-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.check-status {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.check-status.pass {
  background: #e8f5e9;
  color: #4caf50;
}

.check-status.warning {
  background: #fff3e0;
  color: #ff9800;
}

.check-status.fail {
  background: #ffebee;
  color: #f44336;
}

.check-content strong {
  display: block;
  margin-bottom: 4px;
  color: #2c3e50;
}

.check-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.example-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.example-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.3s;
}

.example-link:hover {
  border-color: #42b983;
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.example-link .icon {
  font-size: 24px;
}

.example-link .text {
  font-weight: 500;
}
</style>

