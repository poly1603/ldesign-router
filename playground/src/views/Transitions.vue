<template>
  <div>
    <h2>Transition Animations</h2>
    <p class="page-desc">
      <code>useRouteTransition</code> 提供路由切换动画管理，支持多种动画类型、自动方向检测和自定义时长。
    </p>

    <!-- 当前状态 -->
    <div class="card">
      <h3>当前过渡状态</h3>
      <p class="section-desc">通过下方按钮切换全局过渡类型，然后导航到其他页面观察效果。</p>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">transitionName</span><code>{{ transitionName }}</code></div>
        <div class="info-row"><span class="info-label">direction</span><span class="tag tag-primary">{{ direction }}</span></div>
        <div class="info-row"><span class="info-label">duration</span><code>{{ duration }}ms</code></div>
        <div class="info-row">
          <span class="info-label">isTransitioning</span>
          <span class="tag" :class="isTransitioning ? 'tag-warning' : 'tag-success'">{{ isTransitioning }}</span>
        </div>
      </div>
      <div class="btn-row">
        <button v-for="type in transitionTypes" :key="type" class="btn btn-sm"
          :class="{ 'btn-primary': currentType === type }" @click="changeTransition(type)">
          {{ type }}
        </button>
      </div>
      <div class="btn-row">
        <router-link to="/" class="btn btn-sm">Home</router-link>
        <router-link to="/basic" class="btn btn-sm">Basic</router-link>
        <router-link to="/nested" class="btn btn-sm">Nested</router-link>
        <router-link to="/guards" class="btn btn-sm">Guards</router-link>
      </div>
    </div>

    <!-- 独立动画预览 -->
    <div class="card">
      <h3>动画类型预览</h3>
      <p class="section-desc">每种动画类型均有独立的预览区域，点击 "Play" 触发演示。</p>
      <div class="preview-grid">
        <!-- Fade -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">Fade</span>
            <button class="btn btn-sm" @click="fadeKey++">Play</button>
          </div>
          <div class="preview-stage">
            <transition name="pv-fade" mode="out-in">
              <div :key="fadeKey" class="preview-block" :style="{ background: pickColor(fadeKey) }">
                <span class="preview-label">Fade {{ fadeKey }}</span>
              </div>
            </transition>
          </div>
          <div class="preview-desc">opacity 0 &rarr; 1，最常用的平滑过渡</div>
        </div>

        <!-- Slide -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">Slide</span>
            <button class="btn btn-sm" @click="slideKey++">Play</button>
          </div>
          <div class="preview-stage">
            <transition name="pv-slide" mode="out-in">
              <div :key="slideKey" class="preview-block" :style="{ background: pickColor(slideKey) }">
                <span class="preview-label">Slide {{ slideKey }}</span>
              </div>
            </transition>
          </div>
          <div class="preview-desc">translateX 水平滑动，适合列表/步骤切换</div>
        </div>

        <!-- Slide Up -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">Slide Up</span>
            <button class="btn btn-sm" @click="slideUpKey++">Play</button>
          </div>
          <div class="preview-stage">
            <transition name="pv-slide-up" mode="out-in">
              <div :key="slideUpKey" class="preview-block" :style="{ background: pickColor(slideUpKey) }">
                <span class="preview-label">SlideUp {{ slideUpKey }}</span>
              </div>
            </transition>
          </div>
          <div class="preview-desc">translateY 垂直滑动，适合模态框/Toast</div>
        </div>

        <!-- Zoom -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">Zoom</span>
            <button class="btn btn-sm" @click="zoomKey++">Play</button>
          </div>
          <div class="preview-stage">
            <transition name="pv-zoom" mode="out-in">
              <div :key="zoomKey" class="preview-block" :style="{ background: pickColor(zoomKey) }">
                <span class="preview-label">Zoom {{ zoomKey }}</span>
              </div>
            </transition>
          </div>
          <div class="preview-desc">scale 0.6 &rarr; 1，缩放进入效果</div>
        </div>

        <!-- Scale -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">Scale</span>
            <button class="btn btn-sm" @click="scaleKey++">Play</button>
          </div>
          <div class="preview-stage">
            <transition name="pv-scale" mode="out-in">
              <div :key="scaleKey" class="preview-block" :style="{ background: pickColor(scaleKey) }">
                <span class="preview-label">Scale {{ scaleKey }}</span>
              </div>
            </transition>
          </div>
          <div class="preview-desc">scale 0.85 &rarr; 1 + opacity，柔和的尺寸变化</div>
        </div>

        <!-- None -->
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">None</span>
            <button class="btn btn-sm" @click="noneKey++">Play</button>
          </div>
          <div class="preview-stage">
            <div :key="noneKey" class="preview-block" :style="{ background: pickColor(noneKey) }">
              <span class="preview-label">None {{ noneKey }}</span>
            </div>
          </div>
          <div class="preview-desc">无动画，瞬间切换</div>
        </div>
      </div>
    </div>

    <!-- API 文档 -->
    <div class="card">
      <h3>useRouteTransition API</h3>
      <p class="section-desc">完整的 API 签名和配置选项。</p>
      <pre class="code-block"><code>import { useRouteTransition } from '@ldesign/router-vue'
import type { TransitionType } from '@ldesign/router-vue'

const {
  transitionName,   // ComputedRef&lt;string&gt;   当前 CSS 动画名
  duration,         // ComputedRef&lt;number&gt;   动画时长 (ms)
  direction,        // ComputedRef&lt;string&gt;   'forward' | 'backward' | 'none'
  isTransitioning,  // ComputedRef&lt;boolean&gt;  是否正在过渡
  setTransition,    // (type: TransitionType, opts?) =&gt; void
  setDuration,      // (ms: number) =&gt; void
} = useRouteTransition({
  defaultType: 'fade',      // 默认动画类型
  duration: 300,            // 动画时长 ms
  autoDirection: true,      // 自动检测前进/后退方向
})

// TransitionType:
//   'fade' | 'slide-left' | 'slide-right'
//   'slide-up' | 'slide-down'
//   'zoom' | 'scale' | 'none'</code></pre>
    </div>

    <!-- 在模板中使用 -->
    <div class="card">
      <h3>在模板中使用</h3>
      <p class="section-desc">将 useRouteTransition 与 Vue Router 的 &lt;router-view&gt; 结合。</p>
      <pre class="code-block"><code>&lt;!-- App.vue --&gt;
&lt;router-view v-slot="{ Component }"&gt;
  &lt;transition :name="transitionName" :duration="duration" mode="out-in"&gt;
    &lt;component :is="Component" /&gt;
  &lt;/transition&gt;
&lt;/router-view&gt;

&lt;script setup&gt;
import { useRouteTransition } from '@ldesign/router-vue'

const { transitionName, duration } = useRouteTransition({
  defaultType: 'fade',
  duration: 350,
})
&lt;/script&gt;</code></pre>
    </div>

    <!-- transitionPresetStyles -->
    <div class="card">
      <h3>transitionPresetStyles</h3>
      <p class="section-desc">内置 CSS 预设样式，可直接注入到全局样式中。</p>
      <pre class="code-block"><code>import { transitionPresetStyles } from '@ldesign/router-vue'

// 在 JS 中动态注入
createStyleTag(transitionPresetStyles.fade)
createStyleTag(transitionPresetStyles.slide)
createStyleTag(transitionPresetStyles.zoom)

// 或在 meta 中指定单个路由的过渡
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { transition: 'slide-left' },
  },
  {
    path: '/settings',
    component: Settings,
    meta: { transition: 'zoom' },
  },
]</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouteTransition, transitionPresetStyles } from '@ldesign/router-vue'
import type { TransitionType } from '@ldesign/router-vue'

const transitionTypes: TransitionType[] = [
  'fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom', 'scale', 'none',
]

const {
  transitionName, duration, direction, isTransitioning, setTransition,
} = useRouteTransition({ defaultType: 'fade', duration: 300, autoDirection: true })

const currentType = ref<TransitionType>('fade')
function changeTransition(type: TransitionType) {
  currentType.value = type
  setTransition(type)
}

// Independent demo keys for each preview
const fadeKey = ref(0)
const slideKey = ref(0)
const slideUpKey = ref(0)
const zoomKey = ref(0)
const scaleKey = ref(0)
const noneKey = ref(0)

const palette = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6',
]
function pickColor(k: number) {
  return palette[k % palette.length]
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
  min-width: 160px;
  font-size: 13px;
  color: var(--text-secondary);
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

/* Preview grid */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.preview-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}

.preview-title {
  font-weight: 700;
  font-size: 14px;
}

.preview-stage {
  height: 140px;
  overflow: hidden;
  position: relative;
}

.preview-block {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.preview-label {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  letter-spacing: 1px;
}

.preview-desc {
  padding: 8px 14px;
  font-size: 12px;
  color: var(--text-secondary);
  border-top: 1px solid var(--border);
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.6;
  margin-top: 8px;
}

.code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
}
</style>

<style>
/* Fade preview */
.pv-fade-enter-active,
.pv-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.pv-fade-enter-from,
.pv-fade-leave-to {
  opacity: 0;
}

/* Slide preview */
.pv-slide-enter-active,
.pv-slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}
.pv-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.pv-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide Up preview */
.pv-slide-up-enter-active,
.pv-slide-up-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}
.pv-slide-up-enter-from {
  transform: translateY(60px);
  opacity: 0;
}
.pv-slide-up-leave-to {
  transform: translateY(-60px);
  opacity: 0;
}

/* Zoom preview */
.pv-zoom-enter-active,
.pv-zoom-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.pv-zoom-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.pv-zoom-leave-to {
  opacity: 0;
  transform: scale(1.4);
}

/* Scale preview */
.pv-scale-enter-active,
.pv-scale-leave-active {
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.pv-scale-enter-from {
  opacity: 0;
  transform: scale(0.85);
}
.pv-scale-leave-to {
  opacity: 0;
  transform: scale(1.15);
}
</style>
