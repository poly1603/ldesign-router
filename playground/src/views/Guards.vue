<template>
  <div>
    <h2>导航守卫</h2>
    <p style="color: var(--text-secondary); margin: 8px 0 20px;">
      演示 beforeEach / afterEach / beforeRouteLeave 导航守卫
    </p>

    <div class="card">
      <h3>认证状态控制</h3>
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="btn" :class="isAuthenticated ? 'btn-primary' : ''" @click="toggleAuth">
          {{ isAuthenticated ? '已登录' : '未登录' }}
        </button>
        <span class="tag" :class="isAuthenticated ? 'tag-success' : 'tag-danger'">
          {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
        </span>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); margin-top: 10px;">
        点击按钮切换登录状态，然后尝试访问受保护页面
      </p>
    </div>

    <div class="card">
      <h3>受保护路由</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
        路由配置了 <code>meta: { requiresAuth: true }</code>，只有登录后才能访问
      </p>
      <router-link to="/guards/protected" class="btn">
        前往受保护页面
      </router-link>
    </div>

    <div class="card">
      <h3>守卫日志</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">
        导航守卫执行记录（最近 {{ logs.length }} 条）
      </p>
      <div class="log-list" v-if="logs.length">
        <div v-for="(log, i) in logs" :key="i" class="log-item" :class="`log-${log.type}`">
          <span class="log-badge">{{ log.type }}</span>
          <span class="log-msg">{{ log.message }}</span>
          <span class="log-time">{{ log.time }}</span>
        </div>
      </div>
      <p v-else style="color: var(--text-secondary); font-size: 13px;">暂无日志，请执行一些导航操作</p>
      <button v-if="logs.length" class="btn btn-sm" style="margin-top: 10px;" @click="logs.splice(0)">清除日志</button>
    </div>

    <div class="card">
      <h3>beforeRouteLeave 演示</h3>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" v-model="preventLeave" />
        启用离开确认（离开此页面时会弹出确认框）
      </label>
    </div>

    <!-- API 参考 -->
    <div class="card">
      <h3>API 参考</h3>
      <h4>router.beforeEach(guard)</h4>
      <p class="section-desc">注册全局前置守卫，在每次导航前触发。返回一个取消函数。</p>
      <pre class="code-block"><code>// 注册全局前置守卫
const removeGuard = router.beforeEach((to, from) => {
  // 返回 false 取消导航
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'Login' }
  }
  // 返回 undefined 或 true 继续导航
})

// 移除守卫
removeGuard()</code></pre>

      <h4 style="margin-top: 16px;">router.afterEach(hook)</h4>
      <p class="section-desc">注册全局后置钩子，在导航完成后触发，不能阻止导航。</p>
      <pre class="code-block"><code>router.afterEach((to, from, failure) => {
  // 发送页面访问统计
  analytics.trackPageView(to.fullPath)

  // 检查导航是否失败
  if (failure) {
    console.error('Navigation failed:', failure)
  }
})</code></pre>

      <h4 style="margin-top: 16px;">onBeforeRouteLeave(guard)</h4>
      <p class="section-desc">组件内守卫，在离开当前路由时触发。常用于未保存数据提示。</p>
      <pre class="code-block"><code>import { onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = confirm('有未保存的更改，确定离开？')
    if (!answer) return false  // 取消导航
  }
})</code></pre>

      <h4 style="margin-top: 16px;">onBeforeRouteUpdate(guard)</h4>
      <p class="section-desc">当路由参数变化但组件被复用时触发（如 /user/1 到 /user/2）。</p>
      <pre class="code-block"><code>import { onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate(async (to, from) => {
  // 参数变化时重新加载数据
  const id = to.params.id as string
  userData.value = await fetchUser(id)
})</code></pre>

      <h4 style="margin-top: 16px;">meta 字段配置</h4>
      <pre class="code-block"><code>const routes = [
  {
    path: '/admin',
    meta: {
      requiresAuth: true,     // 自定义字段
      roles: ['admin'],       // 角色要求
      title: '管理后台',
    },
    component: AdminLayout,
  },
]</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, reactive } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)
const preventLeave = ref(false)
const logs = reactive<{ type: string; message: string; time: string }[]>([])

// 提供认证状态给子路由
provide('isAuthenticated', isAuthenticated)

function toggleAuth() {
  isAuthenticated.value = !isAuthenticated.value
  addLog('info', `认证状态变更: ${isAuthenticated.value ? '已登录' : '未登录'}`)
}

function addLog(type: string, message: string) {
  const now = new Date()
  logs.unshift({
    type,
    message,
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
  })
  if (logs.length > 20) logs.pop()
}

// 全局前置守卫
const removeBeforeEach = router.beforeEach((to, from) => {
  addLog('before', `${from.path} → ${to.path}`)

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    addLog('blocked', `访问 ${to.path} 被拒绝（需要认证）`)
    return { name: 'Guards' }
  }
})

// 全局后置守卫
const removeAfterEach = router.afterEach((to, from) => {
  addLog('after', `导航完成: ${from.path} → ${to.path}`)
})

// beforeRouteLeave 守卫
onBeforeRouteLeave((_to, _from) => {
  if (preventLeave.value) {
    const answer = window.confirm('确定要离开此页面吗？')
    if (!answer) {
      addLog('blocked', '用户取消离开')
      return false
    }
  }
})

// 组件卸载时清理守卫
import { onUnmounted } from 'vue'
onUnmounted(() => {
  removeBeforeEach()
  removeAfterEach()
})
</script>

<style scoped>
.log-list {
  display: grid;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  background: var(--bg);
}

.log-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  min-width: 56px;
  text-align: center;
}

.log-before .log-badge { background: #dbeafe; color: #2563eb; }
.log-after .log-badge { background: #dcfce7; color: #16a34a; }
.log-blocked .log-badge { background: #fee2e2; color: #dc2626; }
.log-info .log-badge { background: #f3e8ff; color: #9333ea; }

.log-msg { flex: 1; }
.log-time { color: var(--text-secondary); font-size: 12px; font-family: monospace; }

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
