<template>
  <div>
    <h2>Component Showcase</h2>
    <p class="page-desc">
      <code>@ldesign/router-vue</code> 提供的高级组件：RouterTabs、RouterModal、RouterSkeleton、RouterGuard。
    </p>

    <!-- RouterTabs -->
    <div class="card">
      <h3>RouterTabs</h3>
      <p class="section-desc">
        多标签页管理组件，支持固定标签、右键菜单、持久化和最大标签数限制。
      </p>
      <div class="demo-area">
        <div class="tabs-demo">
          <div class="tabs-bar">
            <div v-for="(tab, i) in demoTabs" :key="tab.path" class="demo-tab"
              :class="{ active: activeTabIndex === i }" @click="activeTabIndex = i">
              <span>{{ tab.title }}</span>
              <span v-if="!tab.affix" class="tab-close" @click.stop="removeTab(i)">&times;</span>
            </div>
            <button class="demo-tab add-tab" @click="addDemoTab">+</button>
          </div>
          <div class="tabs-content">
            <p>Active tab: <code>{{ demoTabs[activeTabIndex]?.title || 'none' }}</code></p>
            <p>Path: <code>{{ demoTabs[activeTabIndex]?.path || '' }}</code></p>
          </div>
        </div>
      </div>
      <pre class="code-block" v-pre><code>&lt;RouterTabs
  :persistent="true"         &lt;!-- localStorage 持久化 --&gt;
  storage-key="my-tabs"
  :max-tabs="10"
  :show-actions="true"
  :closable="true"
  :affix-tabs="['/']"         &lt;!-- 固定不可关闭的标签 --&gt;
  @tab-click="onTabClick"
  @tab-add="onTabAdd"
  @tab-remove="onTabRemove"
  @tab-refresh="onTabRefresh"
&gt;
  &lt;!-- 自定义标签内容 --&gt;
  &lt;template #tab="{ tab, isActive }"&gt;
    &lt;span :class="{ bold: isActive }"&gt;{{ tab.title }}&lt;/span&gt;
  &lt;/template&gt;
&lt;/RouterTabs&gt;</code></pre>
    </div>

    <!-- RouterModal -->
    <div class="card">
      <h3>RouterModal</h3>
      <p class="section-desc">
        基于 Teleport 的模态框组件，支持路由模态框模式、ESC 关闭、锁定滚动和多种过渡效果。
      </p>
      <div class="btn-row">
        <button class="btn btn-sm btn-primary" @click="showModal = true">Open Modal</button>
        <button class="btn btn-sm" @click="showZoomModal = true">Zoom Transition</button>
        <button class="btn btn-sm" @click="showSlideModal = true">Slide Down</button>
      </div>

      <!-- Basic Modal -->
      <Teleport to="body">
        <div v-if="showModal" class="modal-overlay" @click="showModal = false">
          <div class="modal-box" @click.stop>
            <div class="modal-header">
              <h4>RouterModal Demo</h4>
              <button class="modal-close" @click="showModal = false">&times;</button>
            </div>
            <div class="modal-body">
              <p>This demonstrates the RouterModal component. It supports:</p>
              <ul>
                <li>Teleport to body (or custom target)</li>
                <li>Keyboard ESC close</li>
                <li>Mask click close</li>
                <li>Lock background scroll</li>
                <li>Route-view mode (render router-view inside)</li>
              </ul>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm" @click="showModal = false">Close</button>
              <button class="btn btn-sm btn-primary" @click="showModal = false">Confirm</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Zoom Modal -->
      <Teleport to="body">
        <Transition name="modal-zoom">
          <div v-if="showZoomModal" class="modal-overlay" @click="showZoomModal = false">
            <div class="modal-box" @click.stop>
              <div class="modal-header">
                <h4>Zoom Transition</h4>
                <button class="modal-close" @click="showZoomModal = false">&times;</button>
              </div>
              <div class="modal-body"><p>Modal with zoom-in/zoom-out effect.</p></div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Slide Modal -->
      <Teleport to="body">
        <Transition name="modal-slide">
          <div v-if="showSlideModal" class="modal-overlay" @click="showSlideModal = false">
            <div class="modal-box" @click.stop>
              <div class="modal-header">
                <h4>Slide Down</h4>
                <button class="modal-close" @click="showSlideModal = false">&times;</button>
              </div>
              <div class="modal-body"><p>Modal that slides down from the top.</p></div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <pre class="code-block" v-pre><code>&lt;RouterModal
  v-model="visible"
  title="Edit User"
  width="600px"
  transition="zoom"           &lt;!-- 'fade' | 'zoom' | 'slide-down' | 'slide-up' --&gt;
  :mask-closable="true"
  :esc-closable="true"
  :lock-scroll="true"
  :route-view="false"         &lt;!-- true = render &lt;router-view&gt; inside --&gt;
  :close-to-back="false"      &lt;!-- true = router.back() on close --&gt;
  @confirm="handleConfirm"
  @cancel="handleCancel"
/&gt;</code></pre>
    </div>

    <!-- RouterSkeleton -->
    <div class="card">
      <h3>RouterSkeleton</h3>
      <p class="section-desc">
        路由骨架屏组件，支持多种预设（头部、内容、卡片、列表、表格）和动画效果。
      </p>
      <div class="btn-row">
        <button v-for="a in ['wave', 'pulse', 'shimmer']" :key="a" class="btn btn-sm"
          :class="{ 'btn-primary': skeletonAnim === a }" @click="skeletonAnim = a">
          {{ a }}
        </button>
        <button class="btn btn-sm" :class="{ 'btn-primary': skeletonLoading }" @click="skeletonLoading = !skeletonLoading">
          {{ skeletonLoading ? 'Loading...' : 'Load Complete' }}
        </button>
      </div>

      <!-- Skeleton Demo -->
      <div class="skeleton-demo">
        <template v-if="skeletonLoading">
          <!-- Header skeleton -->
          <div class="skel-header">
            <div class="skel-avatar" :class="`skel-${skeletonAnim}`"></div>
            <div class="skel-header-lines">
              <div class="skel-line w40" :class="`skel-${skeletonAnim}`"></div>
              <div class="skel-line w60" :class="`skel-${skeletonAnim}`"></div>
            </div>
          </div>
          <!-- Content skeleton -->
          <div class="skel-content">
            <div v-for="w in [100, 90, 80, 70, 50]" :key="w" class="skel-line"
              :class="`skel-${skeletonAnim}`" :style="{ width: w + '%' }"></div>
          </div>
          <!-- Card skeleton -->
          <div class="skel-cards">
            <div v-for="i in 3" :key="i" class="skel-card">
              <div class="skel-card-img" :class="`skel-${skeletonAnim}`"></div>
              <div class="skel-card-lines">
                <div class="skel-line w80" :class="`skel-${skeletonAnim}`"></div>
                <div class="skel-line w60" :class="`skel-${skeletonAnim}`"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div style="text-align: center; padding: 24px; color: var(--text-secondary);">
            Content loaded. Toggle "Loading..." to see the skeleton again.
          </div>
        </template>
      </div>

      <pre class="code-block" v-pre><code>&lt;RouterSkeleton
  :loading="isLoading"
  animation="wave"          &lt;!-- 'wave' | 'pulse' | 'shimmer' | 'none' --&gt;
  theme="light"             &lt;!-- 'light' | 'dark' --&gt;
  :show-header="true"
  :show-content="true"
  :show-cards="false"
  :show-list="false"
  :show-table="false"
  :rows="5"
  :card-count="3"
  :rounded="true"
  :min-show-time="300"      &lt;!-- prevent flash --&gt;
  :auto-route-change="true" &lt;!-- auto show on route change --&gt;
&gt;
  &lt;!-- real content after loading --&gt;
  &lt;YourComponent /&gt;
&lt;/RouterSkeleton&gt;</code></pre>
    </div>

    <!-- RouterGuard -->
    <div class="card">
      <h3>RouterGuard</h3>
      <p class="section-desc">
        路由守卫可视化组件，展示 checking / passed / failed / unauthorized 四种状态，支持重试和自定义。
      </p>
      <div class="btn-row">
        <button v-for="s in guardStates" :key="s" class="btn btn-sm"
          :class="{ 'btn-primary': guardState === s }" @click="guardState = s">
          {{ s }}
        </button>
      </div>
      <div class="guard-demo">
        <!-- Checking -->
        <div v-if="guardState === 'checking'" class="guard-state guard-checking">
          <div class="guard-spinner"></div>
          <p>Checking permissions...</p>
        </div>
        <!-- Passed -->
        <div v-else-if="guardState === 'passed'" class="guard-state guard-passed">
          <span class="guard-icon">OK</span>
          <p>Access granted. Content is now visible.</p>
        </div>
        <!-- Failed -->
        <div v-else-if="guardState === 'failed'" class="guard-state guard-failed">
          <span class="guard-icon">!</span>
          <p>Access failed. Please retry.</p>
          <button class="btn btn-sm" @click="guardState = 'checking'">Retry</button>
        </div>
        <!-- Unauthorized -->
        <div v-else class="guard-state guard-unauthorized">
          <span class="guard-icon">X</span>
          <p>You are not authorized to view this content.</p>
          <button class="btn btn-sm" @click="guardState = 'passed'">Login</button>
        </div>
      </div>
      <pre class="code-block" v-pre><code>&lt;RouterGuard
  :guard="checkPermission"
  :auto-check="true"
  :max-retries="3"
  checking-message="Verifying..."
  fail-title="Access Denied"
  fail-message="Cannot access this page"
  unauthorized-title="Not Authorized"
  :show-retry="true"
  :show-go-back="true"
  home-path="/"
  login-path="/login"
  @state-change="onStateChange"
  @passed="onPassed"
&gt;
  &lt;!-- Protected content --&gt;
  &lt;DashboardPage /&gt;

  &lt;!-- Custom checking slot --&gt;
  &lt;template #checking&gt;
    &lt;MyCustomSpinner /&gt;
  &lt;/template&gt;

  &lt;!-- Custom failed slot --&gt;
  &lt;template #failed="{ reason, retry }"&gt;
    &lt;p&gt;{{ reason }}&lt;/p&gt;
    &lt;button @click="retry"&gt;Try Again&lt;/button&gt;
  &lt;/template&gt;
&lt;/RouterGuard&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// RouterTabs demo state
interface DemoTab { path: string; title: string; affix?: boolean }
const demoTabs = reactive<DemoTab[]>([
  { path: '/', title: 'Home', affix: true },
  { path: '/basic', title: 'Basic Routing' },
  { path: '/guards', title: 'Guards' },
])
const activeTabIndex = ref(0)
let tabCounter = 0
function addDemoTab() {
  tabCounter++
  demoTabs.push({ path: `/page-${tabCounter}`, title: `Tab ${tabCounter}` })
  activeTabIndex.value = demoTabs.length - 1
}
function removeTab(index: number) {
  if (demoTabs[index].affix) return
  demoTabs.splice(index, 1)
  if (activeTabIndex.value >= demoTabs.length) activeTabIndex.value = demoTabs.length - 1
}

// RouterModal demo state
const showModal = ref(false)
const showZoomModal = ref(false)
const showSlideModal = ref(false)

// RouterSkeleton demo state
const skeletonAnim = ref('wave')
const skeletonLoading = ref(true)

// RouterGuard demo state
const guardStates = ['checking', 'passed', 'failed', 'unauthorized'] as const
const guardState = ref<typeof guardStates[number]>('checking')
</script>

<style scoped>
.page-desc { color: var(--text-secondary); margin: 8px 0 20px; line-height: 1.6; }
.section-desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 10px; }
.btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }

.demo-area { margin: 12px 0; }

/* Tabs Demo */
.tabs-bar {
  display: flex; gap: 2px; background: var(--bg); padding: 4px;
  border-radius: 8px 8px 0 0; overflow-x: auto;
}
.demo-tab {
  padding: 8px 14px; font-size: 13px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  background: transparent; color: var(--text-secondary); transition: all 0.15s;
}
.demo-tab:hover { background: var(--card-bg); color: var(--text); }
.demo-tab.active { background: var(--card-bg); color: var(--primary); font-weight: 600; }
.add-tab { font-size: 16px; font-weight: 700; }
.tab-close { font-size: 14px; line-height: 1; opacity: 0.5; }
.tab-close:hover { opacity: 1; color: var(--danger); }
.tabs-content {
  padding: 16px; border: 1px solid var(--border); border-top: none;
  border-radius: 0 0 8px 8px; font-size: 13px;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: var(--card-bg); border-radius: 12px; width: 90%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
}
.modal-header h4 { font-size: 16px; font-weight: 700; }
.modal-close {
  font-size: 22px; cursor: pointer; color: var(--text-secondary);
  background: none; border: none; line-height: 1;
}
.modal-body { padding: 20px; font-size: 14px; line-height: 1.6; }
.modal-body ul { margin: 8px 0 0 20px; }
.modal-body li { margin: 4px 0; }
.modal-footer {
  display: flex; gap: 8px; justify-content: flex-end;
  padding: 12px 20px; border-top: 1px solid var(--border);
}

/* Skeleton Demo */
.skeleton-demo {
  padding: 16px; background: var(--bg); border-radius: 8px; margin: 10px 0;
}
.skel-header { display: flex; gap: 12px; margin-bottom: 16px; }
.skel-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
.skel-header-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
.skel-line { height: 12px; border-radius: 6px; background: var(--border); }
.w40 { width: 40%; } .w60 { width: 60%; } .w80 { width: 80%; }
.skel-content { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.skel-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.skel-card { border-radius: 8px; overflow: hidden; background: var(--card-bg); }
.skel-card-img { height: 80px; background: var(--border); }
.skel-card-lines { padding: 10px; display: flex; flex-direction: column; gap: 8px; }

/* Skeleton animations */
.skel-wave { animation: skel-wave 1.6s linear infinite; background: linear-gradient(90deg, var(--border) 25%, #e2e8f0 50%, var(--border) 75%); background-size: 200% 100%; }
@keyframes skel-wave { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skel-pulse { animation: skel-pulse 1.5s ease-in-out infinite; }
@keyframes skel-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.skel-shimmer { animation: skel-shimmer 2s ease-in-out infinite; }
@keyframes skel-shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

/* Guard Demo */
.guard-demo {
  padding: 20px; background: var(--bg); border-radius: 8px; margin: 10px 0;
  min-height: 100px; display: flex; align-items: center; justify-content: center;
}
.guard-state { text-align: center; }
.guard-state p { margin: 8px 0; font-size: 14px; color: var(--text-secondary); }
.guard-icon {
  display: inline-flex; width: 48px; height: 48px; border-radius: 50%;
  align-items: center; justify-content: center; font-weight: 700; font-size: 18px;
}
.guard-checking .guard-spinner {
  width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary);
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
.guard-passed .guard-icon { background: #dcfce7; color: #16a34a; }
.guard-failed .guard-icon { background: #fef2f2; color: #dc2626; }
.guard-unauthorized .guard-icon { background: #fef3c7; color: #d97706; }

.code-block {
  background: #1e293b; color: #e2e8f0; border-radius: 6px; padding: 14px;
  font-size: 12px; overflow-x: auto; line-height: 1.6; margin-top: 12px;
}
.code-block code { background: transparent; padding: 0; color: inherit; }
</style>

<style>
/* Modal transitions (global) */
.modal-zoom-enter-active, .modal-zoom-leave-active { transition: all 0.3s ease; }
.modal-zoom-enter-from, .modal-zoom-leave-to { opacity: 0; transform: scale(0.85); }
.modal-slide-enter-active, .modal-slide-leave-active { transition: all 0.3s ease; }
.modal-slide-enter-from { opacity: 0; transform: translateY(-40px); }
.modal-slide-leave-to { opacity: 0; transform: translateY(40px); }
</style>
