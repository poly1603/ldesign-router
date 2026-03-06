<template>
  <div>
    <h2>Async Route Data</h2>
    <p class="page-desc">
      <code>useAsyncRouteData</code> 提供路由级异步数据加载，在路由参数变化时自动 refetch，
      支持缓存、loading/error 状态和数据转换。
    </p>

    <!-- 用户列表 -->
    <div class="card">
      <h3>Simulated API - User List</h3>
      <p class="section-desc">模拟异步获取用户列表。点击用户查看详情，观察参数变化时自动 refetch。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">loading</span><span class="tag" :class="usersLoading ? 'tag-warning' : 'tag-success'">{{ usersLoading }}</span></div>
        <div class="info-row"><span class="info-label">error</span><code>{{ usersError?.message || 'null' }}</code></div>
        <div class="info-row"><span class="info-label">fetchCount</span><code>{{ usersFetchCount }}</code></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="refreshUsers">Refresh</button>
        <button class="btn btn-sm" @click="clearUsersCache">Clear Cache</button>
      </div>
      <div v-if="usersLoading" class="loading-block">Loading users...</div>
      <div v-else-if="usersError" class="error-block">
        Error: {{ usersError.message }}
        <button class="btn btn-sm" @click="refreshUsers">Retry</button>
      </div>
      <div v-else-if="users" class="user-list">
        <div v-for="u in users" :key="u.id" class="user-card" @click="$router.push(`/async/${u.id}`)">
          <span class="user-avatar">{{ u.name[0] }}</span>
          <div>
            <div class="user-name">{{ u.name }}</div>
            <div class="user-email">{{ u.email }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户详情 -->
    <div v-if="$route.params.userId" class="card">
      <h3>User Detail (param: {{ $route.params.userId }})</h3>
      <p class="section-desc">路由参数变化时自动重新获取用户详情。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">loading</span><span class="tag" :class="detailLoading ? 'tag-warning' : 'tag-success'">{{ detailLoading }}</span></div>
        <div class="info-row"><span class="info-label">error</span><code>{{ detailError?.message || 'null' }}</code></div>
      </div>
      <div v-if="detailLoading" class="loading-block">Loading user detail...</div>
      <div v-else-if="detailError" class="error-block">
        Error: {{ detailError.message }}
        <button class="btn btn-sm" @click="refreshDetail">Retry</button>
      </div>
      <div v-else-if="userDetail" class="detail-card">
        <div class="info-grid">
          <div class="info-row"><span class="info-label">ID</span><code>{{ userDetail.id }}</code></div>
          <div class="info-row"><span class="info-label">Name</span><code>{{ userDetail.name }}</code></div>
          <div class="info-row"><span class="info-label">Email</span><code>{{ userDetail.email }}</code></div>
          <div class="info-row"><span class="info-label">Role</span><span class="tag tag-primary">{{ userDetail.role }}</span></div>
        </div>
      </div>
      <div class="btn-row">
        <router-link v-for="id in [1,2,3,4]" :key="id" :to="`/async/${id}`" class="btn btn-sm" :class="{ 'btn-primary': $route.params.userId == String(id) }">User {{ id }}</router-link>
        <router-link to="/async" class="btn btn-sm">Back to list</router-link>
      </div>
    </div>

    <!-- Error Simulation -->
    <div class="card">
      <h3>Error Simulation</h3>
      <p class="section-desc">模拟请求失败的场景，演示 error 状态和 retry 机制。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">loading</span><span class="tag" :class="errorLoading ? 'tag-warning' : 'tag-success'">{{ errorLoading }}</span></div>
        <div class="info-row"><span class="info-label">error</span><code>{{ errorResult?.message || 'null' }}</code></div>
        <div class="info-row"><span class="info-label">data</span><code>{{ errorData ?? 'undefined' }}</code></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="refreshError">Fetch (will fail)</button>
      </div>
    </div>

    <!-- API Reference -->
    <div class="card">
      <h3>useAsyncRouteData API</h3>
      <pre class="code-block"><code>import { useAsyncRouteData } from '@ldesign/router-vue'

const {
  data,        // ComputedRef&lt;T | undefined&gt;
  loading,     // ComputedRef&lt;boolean&gt;
  error,       // ComputedRef&lt;Error | null&gt;
  refresh,     // () =&gt; void
  clearCache,  // (key?) =&gt; void
  fetchCount,  // ComputedRef&lt;number&gt;
} = useAsyncRouteData(
  (route) =&gt; fetch(`/api/${route.params.id}`).then(r =&gt; r.json()),
  {
    immediate: true,              // 创建时立即执行
    watch: ['params', 'query'],   // 监听变化的路由属性
    cacheKey: (route) =&gt; route.fullPath,  // 缓存键
    cacheTime: 5 * 60 * 1000,    // 缓存 5 分钟
    initialData: undefined,       // 初始数据
    transform: (raw) =&gt; raw.data, // 数据转换
    onSuccess: (data) =&gt; {},      // 成功回调
    onError: (err) =&gt; {},         // 错误回调
  }
)</code></pre>
    </div>

    <!-- useRouteDebounce -->
    <div class="card">
      <h3>useRouteDebounce</h3>
      <p class="section-desc">防止快速连续点击导致重复导航。点击按钮快速连续点击，只会执行一次导航。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">isNavigating</span><span class="tag" :class="isDebouncing ? 'tag-warning' : 'tag-success'">{{ isDebouncing }}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="debouncedNav('/async')">to /async (debounced)</button>
        <button class="btn btn-sm" @click="debouncedNav('/async/1')">to /async/1 (debounced)</button>
        <button class="btn btn-sm" @click="cancelNav">Cancel</button>
      </div>
      <pre class="code-block"><code>const { navigate, isNavigating, cancel } = useRouteDebounce({
  delay: 300,    // 防抖延迟 ms
  leading: false // 是否立即执行第一次
})</code></pre>
    </div>

    <!-- useRouteAnnouncer -->
    <div class="card">
      <h3>useRouteAnnouncer (A11y)</h3>
      <p class="section-desc">为屏幕阅读器播报路由变化。导航到不同页面时自动通过 ARIA live region 播报。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">message</span><code>{{ announceMessage || '(empty)' }}</code></div>
        <div class="info-row"><span class="info-label">isActive</span><span class="tag" :class="isAnnouncing ? 'tag-warning' : 'tag-success'">{{ isAnnouncing }}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="announce('Custom announcement')">Manual Announce</button>
      </div>
      <pre class="code-block"><code>const { message, isActive, announce } = useRouteAnnouncer({
  politeness: 'polite',           // 'polite' | 'assertive'
  template: 'Navigated to %s',   // %s = route title
  announceDelay: 100,             // ms
})</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useAsyncRouteData,
  useRouteDebounce,
  useRouteAnnouncer,
} from '@ldesign/router-vue'

// ==================== Simulated API ====================
interface User {
  id: number
  name: string
  email: string
  role: string
}

const fakeUsers: User[] = [
  { id: 1, name: 'Alice Wang', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Zhang', email: 'bob@example.com', role: 'editor' },
  { id: 3, name: 'Carol Li', email: 'carol@example.com', role: 'viewer' },
  { id: 4, name: 'David Chen', email: 'david@example.com', role: 'editor' },
]

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// User list
const {
  data: users,
  loading: usersLoading,
  error: usersError,
  refresh: refreshUsers,
  clearCache: clearUsersCache,
  fetchCount: usersFetchCount,
} = useAsyncRouteData<User[]>(
  async () => {
    await delay(800)
    return [...fakeUsers]
  },
  { immediate: true, cacheTime: 30000, cacheKey: 'user-list' },
)

// User detail (re-fetches when params change)
const {
  data: userDetail,
  loading: detailLoading,
  error: detailError,
  refresh: refreshDetail,
} = useAsyncRouteData<User | null>(
  async (route) => {
    const id = Number(route.params.userId)
    if (!id) return null
    await delay(600)
    return fakeUsers.find(u => u.id === id) || null
  },
  { immediate: true, watch: ['params'] },
)

// Error simulation
const {
  data: errorData,
  loading: errorLoading,
  error: errorResult,
  refresh: refreshError,
} = useAsyncRouteData(
  async () => {
    await delay(500)
    throw new Error('Simulated network error: 500 Internal Server Error')
  },
  { immediate: false },
)

// Debounce
const { navigate: debouncedNav, isNavigating: isDebouncing, cancel: cancelNav } = useRouteDebounce({ delay: 400 })

// Announcer
const { message: announceMessage, isActive: isAnnouncing, announce } = useRouteAnnouncer({
  template: 'Navigated to %s',
  politeness: 'polite',
})
</script>

<style scoped>
.page-desc { color: var(--text-secondary); margin: 8px 0 20px; line-height: 1.6; }
.section-desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 10px; }
.info-grid { display: grid; gap: 4px; }
.info-row { display: flex; align-items: baseline; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.info-label { font-weight: 600; min-width: 140px; font-size: 13px; color: var(--text-secondary); flex-shrink: 0; }
.btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }

.loading-block {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg);
  border-radius: 8px;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.error-block {
  padding: 16px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.user-card:hover { border-color: var(--primary); background: var(--primary-bg); }

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.user-name { font-weight: 600; font-size: 14px; }
.user-email { font-size: 12px; color: var(--text-secondary); }

.detail-card {
  padding: 16px;
  background: var(--bg);
  border-radius: 8px;
  margin: 10px 0;
}

.code-block {
  background: #1e293b; color: #e2e8f0; border-radius: 6px; padding: 14px;
  font-size: 12px; overflow-x: auto; line-height: 1.6; margin-top: 12px;
}
.code-block code { background: transparent; padding: 0; color: inherit; }
</style>
