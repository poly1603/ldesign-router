<template>
  <div>
    <h2>Scroll Behavior</h2>
    <p class="page-desc">
      <code>useRouteScroll</code> 在路由切换时自动保存/恢复滚动位置，支持 hash 锚点、
      自定义容器和 smooth 滚动。
    </p>

    <!-- 状态 -->
    <div class="card">
      <h3>Scroll State</h3>
      <p class="section-desc">当前滚动位置和保存状态。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">savedPosition</span><code>{{ savedPosition ? `x:${savedPosition.x} y:${savedPosition.y}` : 'null' }}</code></div>
        <div class="info-row"><span class="info-label">currentScrollY</span><code>{{ currentY }}px</code></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" @click="savePosition">Save Position</button>
        <button class="btn btn-sm" @click="restorePosition">Restore Position</button>
        <button class="btn btn-sm" @click="scrollTo({ x: 0, y: 0 })">Scroll to Top</button>
        <button class="btn btn-sm" @click="clearPositions">Clear All Saved</button>
      </div>
    </div>

    <!-- Hash 锚点 -->
    <div class="card">
      <h3>Hash Anchor Navigation</h3>
      <p class="section-desc">点击锚点链接，useRouteScroll 会自动滚动到对应 hash 元素。</p>
      <div class="btn-row">
        <router-link to="/scroll#section-a" class="btn btn-sm">#section-a</router-link>
        <router-link to="/scroll#section-b" class="btn btn-sm">#section-b</router-link>
        <router-link to="/scroll#section-c" class="btn btn-sm">#section-c</router-link>
        <router-link to="/scroll#api-ref" class="btn btn-sm">#api-ref</router-link>
      </div>
    </div>

    <!-- 导航测试 -->
    <div class="card">
      <h3>Navigation Test</h3>
      <p class="section-desc">导航到其他页面再返回，滚动位置会被自动恢复。先滚动到页面中间，然后离开再回来。</p>
      <div class="btn-row">
        <router-link to="/" class="btn btn-sm">Home</router-link>
        <router-link to="/basic" class="btn btn-sm">Basic</router-link>
        <router-link to="/async" class="btn btn-sm">Async</router-link>
      </div>
    </div>

    <!-- Long content sections -->
    <div id="section-a" class="card section-card" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
      <h3 style="color: #fff;">Section A</h3>
      <p style="color: rgba(255,255,255,0.85);">
        This is Section A. The useRouteScroll composable will automatically scroll here when
        you navigate to /scroll#section-a. The scroll behavior respects the configured
        behavior option (auto/smooth/instant).
      </p>
      <div class="section-spacer"></div>
    </div>

    <div id="section-b" class="card section-card" style="background: linear-gradient(135deg, #22c55e 0%, #14b8a6 100%);">
      <h3 style="color: #fff;">Section B</h3>
      <p style="color: rgba(255,255,255,0.85);">
        This is Section B. When navigating away from this page, the scroll position is
        automatically saved. When you return, the position is restored, so you pick up
        right where you left off.
      </p>
      <div class="section-spacer"></div>
    </div>

    <div id="section-c" class="card section-card" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);">
      <h3 style="color: #fff;">Section C</h3>
      <p style="color: rgba(255,255,255,0.85);">
        This is Section C. You can also manually save and restore positions using the
        savePosition() and restorePosition() methods. The clearPositions() method
        removes all saved scroll data.
      </p>
      <div class="section-spacer"></div>
    </div>

    <!-- API Reference -->
    <div id="api-ref" class="card">
      <h3>useRouteScroll API</h3>
      <pre class="code-block"><code>import { useRouteScroll } from '@ldesign/router-vue'

const {
  savedPosition,    // ComputedRef&lt;{ x: number; y: number } | null&gt;
  savePosition,     // () =&gt; void
  scrollTo,         // (pos: { x?, y? } | string) =&gt; void
  restorePosition,  // () =&gt; boolean
  clearPositions,   // () =&gt; void
} = useRouteScroll({
  behavior: 'smooth',     // 'auto' | 'smooth' | 'instant'
  selector: undefined,    // CSS selector for scroll container
  scrollToTop: true,      // auto scroll to top on new route
  saveKey: 'route-scroll' // storage key prefix
})

// scrollTo supports both position and CSS selector:
scrollTo({ x: 0, y: 100 })  // scroll to coordinates
scrollTo('#section-a')       // scroll to element</code></pre>
    </div>

    <!-- 自定义容器 -->
    <div class="card">
      <h3>Custom Container Scroll</h3>
      <p class="section-desc">
        useRouteScroll 也支持自定义滚动容器，通过 <code>selector</code> 指定。
      </p>
      <pre class="code-block"><code>// 监听特定容器的滚动
const { savedPosition, scrollTo } = useRouteScroll({
  selector: '.my-scroll-container',
  behavior: 'smooth',
})

// 在模板中
&lt;div class="my-scroll-container" style="overflow-y: auto; height: 400px;"&gt;
  &lt;!-- long content --&gt;
&lt;/div&gt;</code></pre>
    </div>

    <!-- 最佳实践 -->
    <div class="card">
      <h3>Best Practices</h3>
      <pre class="code-block"><code>// Pattern 1: App-level scroll management (in App.vue)
const { scrollTo } = useRouteScroll({
  scrollToTop: true,
  behavior: 'smooth',
})

// Pattern 2: Save scroll on route leave
onBeforeRouteLeave(() =&gt; {
  savePosition()
})

// Pattern 3: Scroll to hash on initial load
onMounted(() =&gt; {
  if (route.hash) {
    scrollTo(route.hash)
  }
})

// Pattern 4: Infinite list scroll preservation
const { savePosition, restorePosition } = useRouteScroll({
  selector: '.infinite-list',
  scrollToTop: false,  // don't reset on return
})</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouteScroll } from '@ldesign/router-vue'

const {
  savedPosition,
  savePosition,
  scrollTo,
  restorePosition,
  clearPositions,
} = useRouteScroll({
  behavior: 'smooth',
  scrollToTop: true,
})

const currentY = ref(0)
let scrollHandler: (() => void) | null = null

onMounted(() => {
  scrollHandler = () => { currentY.value = Math.round(window.scrollY) }
  window.addEventListener('scroll', scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<style scoped>
.page-desc { color: var(--text-secondary); margin: 8px 0 20px; line-height: 1.6; }
.section-desc { color: var(--text-secondary); font-size: 13px; margin-bottom: 10px; }
.info-grid { display: grid; gap: 4px; }
.info-row { display: flex; align-items: baseline; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.info-label { font-weight: 600; min-width: 160px; font-size: 13px; color: var(--text-secondary); flex-shrink: 0; }
.btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }

.section-card {
  padding: 28px !important;
  border-radius: 12px;
  color: white;
}

.section-spacer {
  height: 120px;
}

.code-block {
  background: #1e293b; color: #e2e8f0; border-radius: 6px; padding: 14px;
  font-size: 12px; overflow-x: auto; line-height: 1.6; margin-top: 12px;
}
.code-block code { background: transparent; padding: 0; color: inherit; }
</style>
