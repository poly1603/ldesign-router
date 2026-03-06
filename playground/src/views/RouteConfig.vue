<template>
  <div>
    <h2>Route Configuration</h2>
    <p class="page-desc">
      动态管理路由配置：添加、移除、查询路由。展示 <code>router.addRoute()</code>、
      <code>router.removeRoute()</code>、<code>router.getRoutes()</code>、<code>router.hasRoute()</code> 的用法。
    </p>

    <!-- getRoutes -->
    <div class="card">
      <h3>router.getRoutes()</h3>
      <p class="section-desc">获取当前注册的所有路由列表。</p>
      <div class="btn-row">
        <button class="btn btn-sm" @click="refreshRoutes">Refresh</button>
        <span class="route-count">{{ routeList.length }} routes</span>
      </div>
      <div class="route-table">
        <div class="route-row route-header">
          <span class="route-col-name">Name</span>
          <span class="route-col-path">Path</span>
          <span class="route-col-meta">Meta</span>
        </div>
        <div v-for="r in routeList" :key="r.path" class="route-row">
          <span class="route-col-name"><code>{{ r.name || '-' }}</code></span>
          <span class="route-col-path"><code>{{ r.path }}</code></span>
          <span class="route-col-meta"><code>{{ JSON.stringify(r.meta || {}) }}</code></span>
        </div>
      </div>
      <pre class="code-block"><code>import { useRouter } from 'vue-router'

const router = useRouter()
const routes = router.getRoutes()
// RouteRecordNormalized[]</code></pre>
    </div>

    <!-- hasRoute -->
    <div class="card">
      <h3>router.hasRoute()</h3>
      <p class="section-desc">检查指定名称的路由是否已注册。</p>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <input v-model="checkName" placeholder="输入路由名称" class="input-field" style="max-width: 240px;" />
        <button class="btn btn-sm" @click="doCheckRoute">Check</button>
        <span v-if="checkResult !== null" class="tag" :class="checkResult ? 'tag-success' : 'tag-danger'">
          {{ checkResult ? 'EXISTS' : 'NOT FOUND' }}
        </span>
      </div>
      <div class="info-grid" style="margin-top: 10px;">
        <div class="info-row" v-for="name in quickCheckNames" :key="name">
          <span class="info-label">hasRoute('{{ name }}')</span>
          <span class="tag" :class="routerHas(name) ? 'tag-success' : 'tag-danger'">{{ routerHas(name) }}</span>
        </div>
      </div>
      <pre class="code-block"><code>router.hasRoute('Home')       // true
router.hasRoute('Dashboard')  // false</code></pre>
    </div>

    <!-- addRoute -->
    <div class="card">
      <h3>router.addRoute()</h3>
      <p class="section-desc">动态添加新路由。可以添加到顶层或作为子路由。</p>
      <div class="add-form">
        <div class="form-row">
          <label>Name</label>
          <input v-model="newRoute.name" placeholder="e.g. Dashboard" class="input-field" />
        </div>
        <div class="form-row">
          <label>Path</label>
          <input v-model="newRoute.path" placeholder="e.g. /dashboard" class="input-field" />
        </div>
        <div class="form-row">
          <label>Title (meta)</label>
          <input v-model="newRoute.title" placeholder="e.g. Dashboard Page" class="input-field" />
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm btn-primary" @click="doAddRoute" :disabled="!newRoute.name || !newRoute.path">Add Route</button>
      </div>
      <div v-if="addedRoutes.length" class="added-list">
        <p style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">Dynamically added:</p>
        <div v-for="r in addedRoutes" :key="r.name" class="added-item">
          <code>{{ r.name }}</code> <span style="color: var(--text-secondary)">=></span> <code>{{ r.path }}</code>
          <button class="btn btn-sm btn-danger" style="margin-left: auto;" @click="doRemoveRoute(r.name)">Remove</button>
        </div>
      </div>
      <pre class="code-block"><code>// 添加顶层路由
router.addRoute({
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('./Dashboard.vue'),
  meta: { title: 'Dashboard' },
})

// 添加为某路由的子路由
router.addRoute('Layout', {
  path: 'settings',
  name: 'Settings',
  component: () => import('./Settings.vue'),
})

// addRoute 返回一个移除函数
const removeRoute = router.addRoute({ ... })
removeRoute() // 移除刚添加的路由</code></pre>
    </div>

    <!-- removeRoute -->
    <div class="card">
      <h3>router.removeRoute()</h3>
      <p class="section-desc">通过路由名称移除已注册的路由。</p>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <input v-model="removeName" placeholder="输入路由名称" class="input-field" style="max-width: 240px;" />
        <button class="btn btn-sm btn-danger" @click="doRemoveByName" :disabled="!removeName">Remove</button>
      </div>
      <div v-if="removeLog.length" class="history-list" style="margin-top: 10px;">
        <div v-for="(log, i) in removeLog" :key="i" class="history-item">
          <span>Removed: <code>{{ log.name }}</code></span>
          <span class="history-time">{{ log.time }}</span>
        </div>
      </div>
      <pre class="code-block"><code>// 通过名称移除
router.removeRoute('Dashboard')

// 通过 addRoute 返回的函数移除
const remove = router.addRoute({ name: 'Temp', ... })
remove()

// 通过覆盖同名路由替换
router.addRoute({ path: '/new', name: 'Existing', ... })</code></pre>
    </div>

    <!-- 实用模式 -->
    <div class="card">
      <h3>Patterns: Dynamic Route Loading</h3>
      <p class="section-desc">常见的动态路由加载模式和最佳实践。</p>
      <pre class="code-block"><code>// Pattern 1: 根据用户权限动态加载路由
async function loadUserRoutes(user: User) {
  const modules = await fetchUserModules(user.role)
  modules.forEach(mod => {
    router.addRoute('Layout', {
      path: mod.path,
      name: mod.name,
      component: () => import(`./modules/${mod.component}.vue`),
      meta: { permissions: mod.permissions },
    })
  })
}

// Pattern 2: 模块化路由注册
function registerModule(moduleRoutes: RouteRecordRaw[]) {
  moduleRoutes.forEach(route => router.addRoute(route))
  // 刷新当前路由以匹配新增的路由
  router.replace(router.currentRoute.value.fullPath)
}

// Pattern 3: 开发环境热更新路由
if (import.meta.hot) {
  import.meta.hot.accept('./routes', (mod) => {
    const oldRoutes = router.getRoutes()
    oldRoutes.forEach(r => {
      if (r.name) router.removeRoute(r.name)
    })
    mod.default.forEach(r => router.addRoute(r))
  })
}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// getRoutes
const routeList = ref<{ name: string; path: string; meta: Record<string, any> }[]>([])
function refreshRoutes() {
  routeList.value = router.getRoutes().map(r => ({
    name: String(r.name || ''),
    path: r.path,
    meta: r.meta || {},
  }))
}
onMounted(refreshRoutes)

// hasRoute
const checkName = ref('')
const checkResult = ref<boolean | null>(null)
const quickCheckNames = ['Home', 'Guards', 'Dashboard', 'RouteConfig']

function doCheckRoute() {
  checkResult.value = router.hasRoute(checkName.value)
}
function routerHas(name: string) {
  return router.hasRoute(name)
}

// addRoute
const newRoute = reactive({ name: '', path: '', title: '' })
const addedRoutes = ref<{ name: string; path: string }[]>([])

function doAddRoute() {
  if (!newRoute.name || !newRoute.path) return
  const DynamicPage = {
    render: () => h('div', { class: 'card', style: 'margin: 20px;' }, [
      h('h2', `Dynamic: ${newRoute.name}`),
      h('p', `This page was dynamically added at path: ${newRoute.path}`),
    ]),
  }
  router.addRoute({
    path: newRoute.path,
    name: newRoute.name,
    component: DynamicPage,
    meta: { title: newRoute.title || newRoute.name },
  })
  addedRoutes.value.push({ name: newRoute.name, path: newRoute.path })
  newRoute.name = ''
  newRoute.path = ''
  newRoute.title = ''
  refreshRoutes()
}

// removeRoute
const removeName = ref('')
const removeLog = ref<{ name: string; time: string }[]>([])

function doRemoveRoute(name: string) {
  if (router.hasRoute(name)) {
    router.removeRoute(name)
    addedRoutes.value = addedRoutes.value.filter(r => r.name !== name)
    removeLog.value.unshift({ name, time: new Date().toLocaleTimeString() })
    refreshRoutes()
  }
}

function doRemoveByName() {
  if (!removeName.value) return
  doRemoveRoute(removeName.value)
  removeName.value = ''
}
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
  margin-bottom: 12px;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 10px 0;
}

.route-count {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
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
  min-width: 220px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* Route table */
.route-table {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.route-row {
  display: grid;
  grid-template-columns: 160px 200px 1fr;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
  align-items: center;
}

.route-row:last-child { border-bottom: none; }

.route-header {
  background: var(--bg);
  font-weight: 700;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
}

.route-col-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

/* Add form */
.add-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 4px;
}

.form-row label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.input-field {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text);
  outline: none;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: var(--primary);
}

.added-list {
  margin-top: 10px;
  padding: 10px;
  background: var(--bg);
  border-radius: 8px;
}

.added-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}

.added-item:last-child { border-bottom: none; }

.btn-danger {
  background: var(--danger);
  color: #fff;
}

.btn-danger:hover {
  opacity: 0.85;
}

.history-list {
  display: grid;
  gap: 4px;
  max-height: 160px;
  overflow-y: auto;
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
</style>
