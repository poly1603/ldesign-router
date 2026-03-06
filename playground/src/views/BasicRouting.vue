<template>
  <div>
    <h2>基础路由导航</h2>
    <p class="page-desc">演示编程式导航、声明式导航、历史导航以及当前路由对象的完整信息。</p>

    <div class="card">
      <h3>编程式导航</h3>
      <p class="section-desc">通过 <code>router.push()</code> 和 <code>router.replace()</code> 进行导航，支持字符串路径和对象参数。</p>
      <div class="btn-group">
        <button class="btn" @click="$router.push('/')">push('/')</button>
        <button class="btn" @click="$router.push('/dynamic')">push('/dynamic')</button>
        <button class="btn" @click="$router.push({ name: 'Guards' })">push({ name: 'Guards' })</button>
        <button class="btn" @click="$router.replace('/composables')">replace('/composables')</button>
      </div>
    </div>

    <div class="card">
      <h3>历史导航</h3>
      <p class="section-desc">通过 <code>back()</code> / <code>forward()</code> / <code>go(n)</code> 在浏览器历史中前进后退。</p>
      <div class="btn-group">
        <button class="btn" @click="$router.back()">back()</button>
        <button class="btn" @click="$router.forward()">forward()</button>
        <button class="btn" @click="$router.go(-2)">go(-2)</button>
        <button class="btn" @click="$router.go(1)">go(1)</button>
      </div>
    </div>

    <div class="card">
      <h3>声明式导航 (RouterLink)</h3>
      <p class="section-desc">在模板中使用 <code>&lt;router-link&gt;</code> 组件，支持 <code>to</code> 属性传入字符串或对象。</p>
      <div class="btn-group">
        <router-link to="/" class="btn">to="/"</router-link>
        <router-link to="/dynamic" class="btn">to="/dynamic"</router-link>
        <router-link :to="{ name: 'Guards' }" class="btn">:to="{ name: 'Guards' }"</router-link>
        <router-link to="/composables?tab=params&page=1" class="btn">带 query 参数</router-link>
      </div>
    </div>

    <div class="card">
      <h3>当前路由对象 ($route)</h3>
      <p class="section-desc">通过 <code>$route</code> 或 <code>useRoute()</code> 获取当前路由的响应式属性。</p>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">path</span>
          <code>{{ $route.path }}</code>
        </div>
        <div class="info-item">
          <span class="info-label">fullPath</span>
          <code>{{ $route.fullPath }}</code>
        </div>
        <div class="info-item">
          <span class="info-label">name</span>
          <code>{{ $route.name }}</code>
        </div>
        <div class="info-item">
          <span class="info-label">params</span>
          <code>{{ JSON.stringify($route.params) }}</code>
        </div>
        <div class="info-item">
          <span class="info-label">query</span>
          <code>{{ JSON.stringify($route.query) }}</code>
        </div>
        <div class="info-item">
          <span class="info-label">hash</span>
          <code>{{ $route.hash || '(empty)' }}</code>
        </div>
        <div class="info-item">
          <span class="info-label">matched</span>
          <code>{{ $route.matched.map(r => r.path).join(' > ') }}</code>
        </div>
      </div>
    </div>

    <!-- API 参考 -->
    <div class="card">
      <h3>API 参考</h3>
      <h4>router.push(to)</h4>
      <p class="section-desc">导航到新地址，向历史记录中添加一个新条目。</p>
      <pre class="code-block"><code>// 字符串路径
router.push('/users/123')

// 对象形式 - 命名路由 + 参数
router.push({ name: 'User', params: { id: '123' } })

// 对象形式 - 路径 + 查询参数
router.push({ path: '/search', query: { q: 'vue' } })

// 带 hash
router.push({ path: '/about', hash: '#team' })

// replace 模式（不留历史记录）
router.push({ path: '/login', replace: true })</code></pre>

      <h4 style="margin-top: 20px;">router.replace(to)</h4>
      <p class="section-desc">导航到新地址，替换当前历史记录而非添加新条目。</p>
      <pre class="code-block"><code>router.replace('/new-path')
router.replace({ name: 'Dashboard' })</code></pre>

      <h4 style="margin-top: 20px;">router.go(n) / back() / forward()</h4>
      <p class="section-desc">在历史记录中前进或后退 n 步。</p>
      <pre class="code-block"><code>router.go(1)    // 等同 router.forward()
router.go(-1)   // 等同 router.back()
router.go(-3)   // 后退 3 步</code></pre>

      <h4 style="margin-top: 20px;">RouterLink 组件</h4>
      <pre class="code-block"><code>&lt;!-- 基础用法 --&gt;
&lt;router-link to="/about"&gt;关于&lt;/router-link&gt;

&lt;!-- 命名路由 --&gt;
&lt;router-link :to="{ name: 'User', params: { id: 1 } }"&gt;
  用户
&lt;/router-link&gt;

&lt;!-- replace 模式 --&gt;
&lt;router-link to="/login" replace&gt;登录&lt;/router-link&gt;

&lt;!-- 自定义激活样式 --&gt;
&lt;router-link
  to="/dashboard"
  active-class="my-active"
  exact-active-class="my-exact-active"
&gt;
  Dashboard
&lt;/router-link&gt;</code></pre>
    </div>
  </div>
</template>

<style scoped>
.page-desc {
  color: var(--text-secondary);
  margin: 8px 0 20px;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-grid {
  display: grid;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.info-label {
  font-weight: 600;
  min-width: 80px;
  color: var(--text-secondary);
  font-size: 13px;
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
