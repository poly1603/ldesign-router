<template>
  <div>
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h2 style="margin: 0;">动态路由详情</h2>
    </div>

    <div class="card">
      <h3>路由参数</h3>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">useParam('id')</span>
          <code class="info-value">{{ id }}</code>
        </div>
        <div class="info-row">
          <span class="info-label">useParams()</span>
          <code class="info-value">{{ JSON.stringify(params) }}</code>
        </div>
        <div class="info-row">
          <span class="info-label">$route.params</span>
          <code class="info-value">{{ JSON.stringify($route.params) }}</code>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Query 参数</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
        尝试在 URL 中添加 query 参数：<code>?tab=info&page=2</code>
      </p>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">useQuery()</span>
          <code class="info-value">{{ JSON.stringify(query) }}</code>
        </div>
      </div>
      <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-sm" @click="$router.push({ path: $route.path, query: { tab: 'info' } })">
          添加 ?tab=info
        </button>
        <button class="btn btn-sm" @click="$router.push({ path: $route.path, query: { tab: 'info', page: '2' } })">
          添加 ?tab=info&page=2
        </button>
        <button class="btn btn-sm" @click="$router.push({ path: $route.path })">
          清除 query
        </button>
      </div>
    </div>

    <div class="card">
      <h3>导航到其他动态路由</h3>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn" v-for="nextId in ['1', '2', '3', 'hello-world']" :key="nextId"
          :class="{ 'btn-primary': id === nextId }"
          @click="$router.push(`/dynamic/${nextId}`)">
          id = {{ nextId }}
        </button>
      </div>
    </div>
    <!-- API 参考 -->
    <div class="card">
      <h3>API 参考</h3>
      <h4>useParam(key, defaultValue?)</h4>
      <p class="section-desc">获取单个路由参数的响应式引用。</p>
      <pre class="code-block"><code>import { useParam } from '@ldesign/router-vue'

// 获取 :id 参数
const id = useParam('id')           // ComputedRef&lt;string&gt;
const tab = useParam('tab', 'info') // 带默认值</code></pre>

      <h4 style="margin-top: 16px;">useParams()</h4>
      <p class="section-desc">获取所有路由参数的响应式引用。</p>
      <pre class="code-block"><code>import { useParams } from '@ldesign/router-vue'

const params = useParams()  // ComputedRef&lt;RouteParams&gt;
// 路由 /user/:id/post/:postId
// 访问 /user/1/post/42
// params.value = { id: '1', postId: '42' }</code></pre>

      <h4 style="margin-top: 16px;">useQuery()</h4>
      <p class="section-desc">获取所有查询参数的响应式引用。</p>
      <pre class="code-block"><code>import { useQuery, useQueryParam } from '@ldesign/router-vue'

const query = useQuery()              // ComputedRef&lt;RouteQuery&gt;
const page = useQueryParam('page', '1') // 单个查询参数</code></pre>

      <h4 style="margin-top: 16px;">类型安全版本</h4>
      <pre class="code-block"><code>import { useTypedParams, useTypedQuery } from '@ldesign/router-vue'

interface UserParams { id: string; tab?: string }
const params = useTypedParams&lt;UserParams&gt;()
// params.value.id 自动推断为 string

interface SearchQuery { q?: string; page?: string }
const query = useTypedQuery&lt;SearchQuery&gt;()</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useParams, useParam, useQuery } from '@ldesign/router-vue'

const id = useParam('id')
const params = useParams()
const query = useQuery()
</script>

<style scoped>
.info-grid {
  display: grid;
  gap: 6px;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.info-label {
  font-weight: 600;
  min-width: 160px;
  font-size: 13px;
  color: var(--text-secondary);
}

.info-value {
  word-break: break-all;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.6;
}

.code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
}

h4 {
  font-size: 14px;
  margin-bottom: 6px;
}
</style>
