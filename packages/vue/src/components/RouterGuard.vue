<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <!-- 守卫检查中 -->
    <slot v-if="guardState === 'checking'" name="checking">
      <div class="router-guard router-guard--checking">
        <div class="router-guard__content">
          <div class="router-guard__spinner"></div>
          <p class="router-guard__message">{{ checkingMessage }}</p>
        </div>
      </div>
    </slot>
    
    <!-- 守卫通过 -->
    <slot v-else-if="guardState === 'passed'">
      <!-- 默认渲染子内容 -->
    </slot>
    
    <!-- 守卫失败 -->
    <slot v-else-if="guardState === 'failed'" name="failed" :reason="failReason" :retry="retry">
      <div class="router-guard router-guard--failed">
        <div class="router-guard__content">
          <div class="router-guard__icon router-guard__icon--error">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </div>
          <h3 class="router-guard__title">{{ failTitle }}</h3>
          <p class="router-guard__message">{{ failReason || failMessage }}</p>
          <div class="router-guard__actions">
            <button
              v-if="showRetry"
              class="router-guard__button router-guard__button--primary"
              @click="retry"
            >
              {{ retryText }}
            </button>
            <button
              v-if="showGoBack"
              class="router-guard__button router-guard__button--secondary"
              @click="goBack"
            >
              {{ goBackText }}
            </button>
            <button
              v-if="showGoHome"
              class="router-guard__button router-guard__button--secondary"
              @click="goHome"
            >
              {{ goHomeText }}
            </button>
          </div>
        </div>
      </div>
    </slot>
    
    <!-- 权限不足 -->
    <slot v-else-if="guardState === 'unauthorized'" name="unauthorized" :login="handleLogin">
      <div class="router-guard router-guard--unauthorized">
        <div class="router-guard__content">
          <div class="router-guard__icon router-guard__icon--lock">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path
                fill="currentColor"
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              />
            </svg>
          </div>
          <h3 class="router-guard__title">{{ unauthorizedTitle }}</h3>
          <p class="router-guard__message">{{ unauthorizedMessage }}</p>
          <div class="router-guard__actions">
            <button
              v-if="showLogin"
              class="router-guard__button router-guard__button--primary"
              @click="handleLogin"
            >
              {{ loginText }}
            </button>
            <button
              v-if="showGoBack"
              class="router-guard__button router-guard__button--secondary"
              @click="goBack"
            >
              {{ goBackText }}
            </button>
          </div>
        </div>
      </div>
    </slot>
  </component>
</template>

<script setup lang="ts">
/**
 * RouterGuard 组件 - 路由守卫可视化
 * 
 * 特性：
 * - 🔒 可视化守卫状态（检查中、通过、失败、未授权）
 * - 🎨 自定义各种状态的显示内容
 * - 🔄 支持重试机制
 * - 🎯 集成权限检查
 * - 📱 响应式设计
 * - ♿ 无障碍访问
 * - 🎭 过渡动画
 * - 🔌 可与路由守卫集成
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute, type NavigationGuardNext } from 'vue-router'

export type GuardState = 'checking' | 'passed' | 'failed' | 'unauthorized'
export type GuardCheck = () => Promise<boolean> | boolean

export interface RouterGuardProps {
  /** 守卫检查函数 */
  guard?: GuardCheck
  /** 权限检查函数 */
  permission?: () => boolean | Promise<boolean>
  /** 初始状态 */
  initialState?: GuardState
  /** 自动检查 */
  autoCheck?: boolean
  /** 检查间隔（ms） */
  checkInterval?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 包装组件 */
  wrapper?: string
  /** 是否全屏显示 */
  fullscreen?: boolean
  /** 检查中消息 */
  checkingMessage?: string
  /** 失败标题 */
  failTitle?: string
  /** 失败消息 */
  failMessage?: string
  /** 未授权标题 */
  unauthorizedTitle?: string
  /** 未授权消息 */
  unauthorizedMessage?: string
  /** 重试按钮文本 */
  retryText?: string
  /** 返回按钮文本 */
  goBackText?: string
  /** 首页按钮文本 */
  goHomeText?: string
  /** 登录按钮文本 */
  loginText?: string
  /** 是否显示重试按钮 */
  showRetry?: boolean
  /** 是否显示返回按钮 */
  showGoBack?: boolean
  /** 是否显示首页按钮 */
  showGoHome?: boolean
  /** 是否显示登录按钮 */
  showLogin?: boolean
  /** 首页路径 */
  homePath?: string
  /** 登录路径 */
  loginPath?: string
  /** 失败后重定向路径 */
  redirectOnFail?: string
  /** 未授权后重定向路径 */
  redirectOnUnauthorized?: string
}

const props = withDefaults(defineProps<RouterGuardProps>(), {
  initialState: 'checking',
  autoCheck: true,
  checkInterval: 0,
  maxRetries: 3,
  wrapper: 'div',
  fullscreen: false,
  checkingMessage: '正在验证权限...',
  failTitle: '访问失败',
  failMessage: '无法访问此页面，请稍后重试',
  unauthorizedTitle: '权限不足',
  unauthorizedMessage: '您没有权限访问此页面',
  retryText: '重试',
  goBackText: '返回',
  goHomeText: '返回首页',
  loginText: '去登录',
  showRetry: true,
  showGoBack: true,
  showGoHome: false,
  showLogin: true,
  homePath: '/',
  loginPath: '/login',
})

export interface RouterGuardEmits {
  /** 守卫状态变化 */
  (e: 'state-change', state: GuardState): void
  /** 检查开始 */
  (e: 'check-start'): void
  /** 检查完成 */
  (e: 'check-complete', passed: boolean): void
  /** 守卫通过 */
  (e: 'passed'): void
  /** 守卫失败 */
  (e: 'failed', reason?: string): void
  /** 权限不足 */
  (e: 'unauthorized'): void
  /** 重试 */
  (e: 'retry', attempt: number): void
  /** 登录点击 */
  (e: 'login'): void
}

const emit = defineEmits<RouterGuardEmits>()

const router = useRouter()
const route = useRoute()

// 状态
const guardState = ref<GuardState>(props.initialState)
const failReason = ref<string>('')
const retryCount = ref(0)
const checkTimer = ref<ReturnType<typeof setInterval> | null>(null)

// 包装组件属性
const wrapperComponent = computed(() => props.wrapper)
const wrapperProps = computed(() => ({
  class: {
    'router-guard-wrapper': true,
    'router-guard-wrapper--fullscreen': props.fullscreen,
  },
}))

// 执行守卫检查
const checkGuard = async (): Promise<boolean> => {
  emit('check-start')
  guardState.value = 'checking'
  
  try {
    // 检查权限
    if (props.permission) {
      const hasPermission = await Promise.resolve(props.permission())
      if (!hasPermission) {
        guardState.value = 'unauthorized'
        emit('unauthorized')
        emit('state-change', 'unauthorized')
        
        if (props.redirectOnUnauthorized) {
          router.push(props.redirectOnUnauthorized)
        }
        
        return false
      }
    }
    
    // 执行自定义守卫
    if (props.guard) {
      const passed = await Promise.resolve(props.guard())
      
      if (passed) {
        guardState.value = 'passed'
        emit('passed')
        emit('state-change', 'passed')
        emit('check-complete', true)
        return true
      } else {
        guardState.value = 'failed'
        failReason.value = '守卫检查未通过'
        emit('failed', failReason.value)
        emit('state-change', 'failed')
        emit('check-complete', false)
        
        if (props.redirectOnFail) {
          router.push(props.redirectOnFail)
        }
        
        return false
      }
    }
    
    // 没有守卫函数，直接通过
    guardState.value = 'passed'
    emit('passed')
    emit('state-change', 'passed')
    emit('check-complete', true)
    return true
  } catch (error) {
    console.error('[RouterGuard] Check failed:', error)
    guardState.value = 'failed'
    failReason.value = error instanceof Error ? error.message : '检查过程中发生错误'
    emit('failed', failReason.value)
    emit('state-change', 'failed')
    emit('check-complete', false)
    
    if (props.redirectOnFail) {
      router.push(props.redirectOnFail)
    }
    
    return false
  }
}

// 重试
const retry = async () => {
  if (retryCount.value >= props.maxRetries) {
    failReason.value = `已达到最大重试次数 (${props.maxRetries})`
    return
  }
  
  retryCount.value++
  emit('retry', retryCount.value)
  await checkGuard()
}

// 返回
const goBack = () => {
  router.back()
}

// 返回首页
const goHome = () => {
  router.push(props.homePath)
}

// 处理登录
const handleLogin = () => {
  emit('login')
  router.push(props.loginPath)
}

// 开始定期检查
const startPeriodicCheck = () => {
  if (props.checkInterval > 0) {
    checkTimer.value = setInterval(() => {
      checkGuard()
    }, props.checkInterval)
  }
}

// 停止定期检查
const stopPeriodicCheck = () => {
  if (checkTimer.value) {
    clearInterval(checkTimer.value)
    checkTimer.value = null
  }
}

// 监听路由变化
watch(
  () => route.fullPath,
  () => {
    if (props.autoCheck) {
      retryCount.value = 0
      checkGuard()
    }
  }
)

// 生命周期
onMounted(() => {
  if (props.autoCheck) {
    checkGuard()
  }
  
  startPeriodicCheck()
})

// 暴露方法
defineExpose({
  check: checkGuard,
  retry,
  reset: () => {
    guardState.value = props.initialState
    retryCount.value = 0
    failReason.value = ''
  },
  getState: () => guardState.value,
})
</script>

<style scoped>
.router-guard-wrapper--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.router-guard {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.router-guard__content {
  max-width: 480px;
  text-align: center;
}

/* 加载状态 */
.router-guard--checking {
  color: #606266;
}

.router-guard__spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 24px;
  border: 4px solid #e8e8e8;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: router-guard-spin 1s linear infinite;
}

@keyframes router-guard-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 图标 */
.router-guard__icon {
  margin: 0 auto 24px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.router-guard__icon--error {
  color: #f56c6c;
  background-color: #fef0f0;
}

.router-guard__icon--lock {
  color: #e6a23c;
  background-color: #fdf6ec;
}

/* 文本 */
.router-guard__title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.router-guard__message {
  margin: 0 0 24px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 按钮 */
.router-guard__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.router-guard__button {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.router-guard__button--primary {
  background-color: #409eff;
  color: #fff;
}

.router-guard__button--primary:hover {
  background-color: #66b1ff;
}

.router-guard__button--secondary {
  background-color: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.router-guard__button--secondary:hover {
  background-color: #f5f7fa;
  border-color: #c6e2ff;
  color: #409eff;
}

/* 失败状态 */
.router-guard--failed {
  color: #f56c6c;
}

/* 未授权状态 */
.router-guard--unauthorized {
  color: #e6a23c;
}

/* 响应式 */
@media (max-width: 768px) {
  .router-guard {
    min-height: 300px;
    padding: 20px;
  }
  
  .router-guard__content {
    max-width: 100%;
  }
  
  .router-guard__title {
    font-size: 18px;
  }
  
  .router-guard__message {
    font-size: 13px;
  }
  
  .router-guard__actions {
    flex-direction: column;
    width: 100%;
  }
  
  .router-guard__button {
    width: 100%;
  }
}
</style>