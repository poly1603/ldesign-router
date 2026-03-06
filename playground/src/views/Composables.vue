<template>
  <div>
    <h2>Composables 演示</h2>
    <p class="page-desc">
      展示 <code>@ldesign/router-vue</code> 提供的所有响应式组合函数，包含实时状态和 API 签名。
    </p>

    <!-- useParams / useQuery / useHash -->
    <div class="card">
      <h3>useParams / useQuery / useHash</h3>
      <p class="section-desc">获取路由参数、查询参数和 hash 的响应式引用。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">useParams()</span><code>{{ JSON.stringify(params) }}</code></div>
        <div class="info-row"><span class="info-label">useQuery()</span><code>{{ JSON.stringify(query) }}</code></div>
        <div class="info-row"><span class="info-label">useHash()</span><code>{{ hash || '(empty)' }}</code></div>
        <div class="info-row"><span class="info-label">useQueryParam('tab')</span><code>{{ tabParam || '(empty)' }}</code></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="$router.push('/composables?tab=params&page=1')">+Query</button>
        <button class="btn btn-sm" @click="$router.push('/composables#section-1')">#Hash</button>
        <button class="btn btn-sm" @click="$router.push('/composables?tab=query&page=2#anchor')">Query+Hash</button>
        <button class="btn btn-sm" @click="$router.push('/composables')">Clear</button>
      </div>
      <pre class="code-block"><code>const params = useParams()           // ComputedRef&lt;RouteParams&gt;
const query  = useQuery()            // ComputedRef&lt;RouteQuery&gt;
const hash   = useHash()             // ComputedRef&lt;string&gt;
const tab    = useQueryParam('tab')  // ComputedRef&lt;string&gt;
const id     = useParam('id', '')    // ComputedRef&lt;string&gt;</code></pre>
    </div>

    <!-- useMeta -->
    <div class="card">
      <h3>useMeta / useRouteName / useFullPath</h3>
      <p class="section-desc">获取当前路由的 meta 信息、路由名和完整路径。</p>
      <div class="info-grid">
        <div class="info-row" v-for="(value, key) in meta" :key="key">
          <span class="info-label">meta.{{ key }}</span><code>{{ value }}</code>
        </div>
      </div>
      <pre class="code-block"><code>const meta = useMeta()           // ComputedRef&lt;RouteMeta&gt;
const name = useRouteName()      // ComputedRef&lt;string | symbol&gt;
const full = useFullPath()       // ComputedRef&lt;string&gt;</code></pre>
    </div>

    <!-- useRouteActive / usePathActive -->
    <div class="card">
      <h3>useRouteActive / usePathActive / useHasQueryParam</h3>
      <p class="section-desc">检查路由是否活跃、路径是否匹配、查询参数是否存在。</p>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">useRouteActive('Composables')</span>
          <span class="tag" :class="isComposablesActive ? 'tag-success' : 'tag-danger'">{{ isComposablesActive }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">useRouteActive('Home')</span>
          <span class="tag" :class="isHomeActive ? 'tag-success' : 'tag-danger'">{{ isHomeActive }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">usePathActive('/composables')</span>
          <span class="tag" :class="isPathActive ? 'tag-success' : 'tag-danger'">{{ isPathActive }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">useHasQueryParam('tab')</span>
          <span class="tag" :class="hasTab ? 'tag-success' : 'tag-danger'">{{ hasTab }}</span>
        </div>
      </div>
      <pre class="code-block"><code>const isActive = useRouteActive('Dashboard')       // ComputedRef&lt;boolean&gt;
const isExact  = useRouteActive('Dashboard', true)  // exact match
const isPath   = usePathActive('/dashboard')        // 路径前缀匹配
const hasTab   = useHasQueryParam('tab')             // 查询参数存在性</code></pre>
    </div>

    <!-- useBreadcrumb -->
    <div class="card">
      <h3>useBreadcrumb</h3>
      <p class="section-desc">根据路由匹配链自动生成面包屑导航数据。</p>
      <nav class="breadcrumb-demo">
        <span v-for="(item, i) in breadcrumbs" :key="item.path" class="breadcrumb-item">
          <router-link :to="item.path">{{ item.title }}</router-link>
          <span v-if="i < breadcrumbs.length - 1" class="breadcrumb-sep">/</span>
        </span>
      </nav>
      <pre class="code-block"><code>const breadcrumbs = useBreadcrumb()
// [{ path: '/', title: '首页', name: 'Home', meta: {...} }, ...]
// 通过 meta.breadcrumb: false 排除某个路由</code></pre>
    </div>

    <!-- useRouteHistory -->
    <div class="card">
      <h3>useRouteHistory</h3>
      <p class="section-desc">追踪用户的导航历史，支持前进/后退和历史列表。</p>
      <div class="btn-row">
        <button class="btn btn-sm" :disabled="!canGoBack" @click="goBack">Back</button>
        <button class="btn btn-sm" :disabled="!canGoForward" @click="goForward">Forward</button>
        <button class="btn btn-sm" @click="clearHistory">清除</button>
      </div>
      <div class="history-list" v-if="history.length">
        <div v-for="(item, i) in history.slice(0, 6)" :key="i" class="history-item">
          <code>{{ item.path }}</code>
          <span class="history-time">{{ new Date(item.timestamp).toLocaleTimeString() }}</span>
        </div>
      </div>
      <p v-else class="empty-text">暂无历史记录</p>
      <pre class="code-block"><code>const {
  history,       // ComputedRef&lt;HistoryItem[]&gt;
  canGoBack,     // ComputedRef&lt;boolean&gt;
  canGoForward,  // ComputedRef&lt;boolean&gt;
  goBack,        // () =&gt; void
  goForward,     // () =&gt; void
  clear,         // () =&gt; void
  getPrevious,   // () =&gt; HistoryItem | null
  getNext,       // () =&gt; HistoryItem | null
} = useRouteHistory()</code></pre>
    </div>

    <!-- useNavigationProgress -->
    <div class="card">
      <h3>useNavigationProgress</h3>
      <p class="section-desc">提供 loading bar 进度状态，自动与路由导航绑定。</p>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" :style="{ width: (progressState.progress * 100) + '%' }" :class="{ active: progressState.isLoading }" />
      </div>
      <div class="info-grid" style="margin-top: 8px;">
        <div class="info-row"><span class="info-label">progress</span><code>{{ (progressState.progress * 100).toFixed(0) }}%</code></div>
        <div class="info-row"><span class="info-label">isLoading</span><span class="tag" :class="progressState.isLoading ? 'tag-warning' : 'tag-success'">{{ progressState.isLoading }}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="startProgress">start()</button>
        <button class="btn btn-sm" @click="incProgress">inc()</button>
        <button class="btn btn-sm" @click="setProgress(0.5)">set(0.5)</button>
        <button class="btn btn-sm" @click="finishProgress">finish()</button>
        <button class="btn btn-sm" @click="failProgress">fail()</button>
      </div>
      <pre class="code-block"><code>const { progress, start, finish, fail, set, inc } = useNavigationProgress()
// progress.value = { progress: 0.5, isLoading: true, isFinished: false }</code></pre>
    </div>

    <!-- useRouteTitle -->
    <div class="card">
      <h3>useRouteTitle</h3>
      <p class="section-desc">监听路由变化并自动更新 document.title，支持模板和默认值。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">title (raw)</span><code>{{ routeTitle }}</code></div>
        <div class="info-row"><span class="info-label">formattedTitle</span><code>{{ formattedTitle }}</code></div>
        <div class="info-row"><span class="info-label">document.title</span><code>{{ docTitle }}</code></div>
      </div>
      <pre class="code-block"><code>const { title, formattedTitle } = useRouteTitle(
  '%s | My App',    // 模板，%s 为占位符
  'Home'            // 默认标题
)
// 也支持函数形式模板
const { title } = useRouteTitle((t) =&gt; `${t} - My App`)</code></pre>
    </div>

    <!-- useRouteCache -->
    <div class="card">
      <h3>useRouteCache</h3>
      <p class="section-desc">在路由切换时保持组件状态，支持自动保存/恢复和 TTL 过期。</p>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">缓存值</span>
          <code>{{ JSON.stringify(cachedForm) }}</code>
        </div>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; margin: 10px 0;">
        <input v-model="cachedForm.name" placeholder="姓名" class="input-field" />
        <input v-model="cachedForm.email" placeholder="邮箱" class="input-field" />
        <button class="btn btn-sm" @click="saveCache">保存</button>
        <button class="btn btn-sm" @click="clearCache">清除</button>
      </div>
      <p class="empty-text">输入内容后点击保存，切换到其他页面再回来，数据将被恢复。</p>
      <pre class="code-block"><code>const { state, save, clear, reset } = useRouteCache({
  key: 'my-form',
  initialValue: { name: '', email: '' },
  saveOnLeave: true,   // 离开时自动保存
  ttl: 5 * 60 * 1000,  // 5 分钟过期
})</code></pre>
    </div>

    <!-- useRoutePermission -->
    <div class="card">
      <h3>useRoutePermission</h3>
      <p class="section-desc">检查当前用户是否有访问当前路由的权限。</p>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">hasPermission</span>
          <span class="tag" :class="hasPermission ? 'tag-success' : 'tag-danger'">{{ hasPermission }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">userPermissions</span>
          <code>{{ JSON.stringify(currentUserPerms) }}</code>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="setUserPermissions(['admin', 'editor'])">admin+editor</button>
        <button class="btn btn-sm" @click="setUserPermissions(['viewer'])">viewer</button>
        <button class="btn btn-sm" @click="setUserPermissions([])">clear</button>
      </div>
      <pre class="code-block"><code>const {
  hasPermission,         // ComputedRef&lt;boolean&gt;
  setUserPermissions,    // (perms: string[]) =&gt; void
  requiredPermissions,   // ComputedRef&lt;string[]&gt;
  userPermissions,       // ComputedRef&lt;string[]&gt;
} = useRoutePermission(
  ['admin', 'editor'],  // 所需权限
  'some'                // 'some' | 'every'
)</code></pre>
    </div>

    <!-- useRoutePrefetch -->
    <div class="card">
      <h3>useRoutePrefetch</h3>
      <p class="section-desc">控制路由组件的预加载行为，优化用户体验。</p>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">isPrefetching</span>
          <span class="tag" :class="isPrefetching ? 'tag-warning' : 'tag-success'">{{ isPrefetching }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">isPrefetched</span>
          <span class="tag" :class="isPrefetched ? 'tag-success' : 'tag-danger'">{{ isPrefetched }}</span>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="prefetchRoute">预取 /dynamic</button>
        <button class="btn btn-sm" @click="cancelPrefetch">取消</button>
      </div>
      <pre class="code-block"><code>const {
  prefetchRoute,   // () =&gt; void
  cancelPrefetch,  // () =&gt; void
  isPrefetching,   // ComputedRef&lt;boolean&gt;
  isPrefetched,    // ComputedRef&lt;boolean&gt;
} = useRoutePrefetch('/dashboard', {
  delay: 200,      // 延迟预取
  onHover: true,   // 悬停时预取
})</code></pre>
    </div>

    <!-- useRouteWatcher -->
    <div class="card">
      <h3>useRouteWatcher</h3>
      <p class="section-desc">通用的路由变化监听工具，比直接 watch route 更简洁。</p>
      <div v-if="watcherLogs.length" class="history-list">
        <div v-for="(log, i) in watcherLogs" :key="i" class="history-item">
          <code>{{ log.from }}</code> <span style="color: var(--text-secondary)">&rarr;</span> <code>{{ log.to }}</code>
        </div>
      </div>
      <p v-else class="empty-text">导航到其他页面再回来查看变化记录</p>
      <pre class="code-block"><code>// 监听路径变化
useRouteWatcher((newPath, oldPath) =&gt; {
  console.log(`${oldPath} =&gt; ${newPath}`)
})

// 监听 query 变化
useRouteWatcher(
  (newQuery, oldQuery) =&gt; { /* ... */ },
  { source: 'query', deep: true }
)

// source: 'path' | 'fullPath' | 'name' | 'params' | 'query' | 'hash'</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useParams,
  useQuery,
  useHash,
  useMeta,
  useQueryParam,
  useRouteActive,
  usePathActive,
  useHasQueryParam,
  useBreadcrumb,
  useRouteHistory,
  useNavigationProgress,
  useRouteTitle,
  useRouteWatcher,
  useRouteCache,
  useRoutePermission,
  useRoutePrefetch,
} from '@ldesign/router-vue'

// 基础 composables
const params = useParams()
const query = useQuery()
const hash = useHash()
const meta = useMeta()
const tabParam = useQueryParam('tab')

// 路由活跃状态
const isComposablesActive = useRouteActive('Composables')
const isHomeActive = useRouteActive('Home')
const isPathActive = usePathActive('/composables')
const hasTab = useHasQueryParam('tab')

// 面包屑
const breadcrumbs = useBreadcrumb()

// 路由历史
const { history, canGoBack, canGoForward, goBack, goForward, clear: clearHistory } = useRouteHistory()

// 导航进度
const {
  progress: progressComputed,
  start: startProgress,
  finish: finishProgress,
  fail: failProgress,
  set: setProgress,
  inc: incProgress,
} = useNavigationProgress()
const progressState = computed(() => progressComputed.value)

// 路由标题
const { title: routeTitle, formattedTitle } = useRouteTitle('%s | LDesign Router', 'Playground')
const docTitle = ref(document.title)

// 路由缓存
const { state: cachedForm, save: saveCache, clear: clearCache } = useRouteCache({
  key: 'composables-demo-form',
  initialValue: { name: '', email: '' },
  saveOnLeave: true,
})

// 路由权限
const {
  hasPermission,
  setUserPermissions,
  userPermissions: currentUserPerms,
} = useRoutePermission(['admin', 'editor'], 'some')

// 路由预取
const {
  prefetchRoute,
  cancelPrefetch,
  isPrefetching,
  isPrefetched,
} = useRoutePrefetch('/dynamic', { delay: 300 })

// 路由监听
const watcherLogs = ref<{ from: string; to: string }[]>([])
useRouteWatcher((newPath, oldPath) => {
  watcherLogs.value.unshift({ from: String(oldPath), to: String(newPath) })
  if (watcherLogs.value.length > 10) watcherLogs.value.pop()
  docTitle.value = document.title
})
</script>

<style scoped>
.page-desc {
  color: var(--text-secondary);
  margin: 8px 0 20px;
  line-height: 1.6;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 10px;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 13px;
}

.info-grid { display: grid; gap: 4px; }

.info-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.info-label {
  font-weight: 600;
  min-width: 200px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.breadcrumb-demo {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: var(--radius);
  margin-bottom: 12px;
}

.breadcrumb-sep { color: var(--text-secondary); }

.history-list {
  display: grid;
  gap: 4px;
  max-height: 180px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--bg);
  border-radius: 4px;
  font-size: 13px;
}

.history-time {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: monospace;
}

.progress-bar-container {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.progress-bar-fill.active {
  background: var(--warning);
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.6;
  margin-top: 12px;
}

.code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.input-field {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text);
  outline: none;
  flex: 1;
}

.input-field:focus {
  border-color: var(--primary);
}
</style>
