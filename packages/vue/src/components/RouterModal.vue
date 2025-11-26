<template>
  <Teleport :to="to" :disabled="!teleport">
    <Transition
      :name="transitionName"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave"
    >
      <div
        v-if="modelValue"
        class="router-modal"
        :class="modalClasses"
        :style="modalStyle"
        @click="handleMaskClick"
      >
        <!-- 遮罩层 -->
        <div class="router-modal__mask" :style="maskStyle"></div>
        
        <!-- 内容容器 -->
        <div
          class="router-modal__wrapper"
          :style="wrapperStyle"
          @click.stop
        >
          <div class="router-modal__container" :style="containerStyle">
            <!-- 头部 -->
            <div v-if="showHeader" class="router-modal__header">
              <slot name="header">
                <h3 class="router-modal__title">{{ title }}</h3>
              </slot>
              <button
                v-if="showClose"
                class="router-modal__close"
                :aria-label="closeAriaLabel"
                @click="handleClose"
              >
                <slot name="close-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="currentColor"
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                </slot>
              </button>
            </div>
            
            <!-- 内容区域 -->
            <div class="router-modal__body" :style="bodyStyle">
              <slot>
                <!-- 路由视图 -->
                <router-view v-if="routeView" />
              </slot>
            </div>
            
            <!-- 底部 -->
            <div v-if="showFooter" class="router-modal__footer">
              <slot name="footer">
                <button
                  v-if="showCancel"
                  class="router-modal__button router-modal__button--cancel"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </button>
                <button
                  v-if="showConfirm"
                  class="router-modal__button router-modal__button--confirm"
                  :disabled="confirmDisabled"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * RouterModal 组件 - 基于 Teleport 的模态框
 * 
 * 特性：
 * - 🎯 基于 Teleport 挂载到任意 DOM 节点
 * - 🎨 支持多种过渡动画
 * - 🔒 锁定背景滚动
 * - ⌨️ 键盘 ESC 关闭
 * - 📱 响应式设计
 * - 🎭 可作为路由模态框使用
 * - 🎪 支持嵌套模态框
 * - ♿ 无障碍访问支持
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface RouterModalProps {
  /** 是否显示模态框 */
  modelValue: boolean
  /** 模态框标题 */
  title?: string
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 最大宽度 */
  maxWidth?: string | number
  /** 最大高度 */
  maxHeight?: string | number
  /** Teleport 目标 */
  to?: string
  /** 是否使用 Teleport */
  teleport?: boolean
  /** 过渡动画类型 */
  transition?: 'fade' | 'zoom' | 'slide-down' | 'slide-up' | 'none'
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 确认按钮是否禁用 */
  confirmDisabled?: boolean
  /** 点击遮罩层是否关闭 */
  maskClosable?: boolean
  /** 按 ESC 是否关闭 */
  escClosable?: boolean
  /** 是否锁定背景滚动 */
  lockScroll?: boolean
  /** 是否作为路由模态框 */
  routeView?: boolean
  /** 关闭时是否返回上一路由 */
  closeToBack?: boolean
  /** z-index */
  zIndex?: number
  /** 遮罩层透明度 */
  maskOpacity?: number
  /** 内容区域样式 */
  bodyStyle?: Record<string, any>
  /** 关闭按钮无障碍标签 */
  closeAriaLabel?: string
}

const props = withDefaults(defineProps<RouterModalProps>(), {
  title: '',
  width: '520px',
  to: 'body',
  teleport: true,
  transition: 'zoom',
  showClose: true,
  showHeader: true,
  showFooter: false,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmDisabled: false,
  maskClosable: true,
  escClosable: true,
  lockScroll: true,
  routeView: false,
  closeToBack: false,
  zIndex: 1000,
  maskOpacity: 0.5,
  closeAriaLabel: '关闭'
})

export interface RouterModalEmits {
  /** 更新 modelValue */
  (e: 'update:modelValue', value: boolean): void
  /** 打开事件 */
  (e: 'open'): void
  /** 关闭事件 */
  (e: 'close'): void
  /** 打开后事件 */
  (e: 'opened'): void
  /** 关闭后事件 */
  (e: 'closed'): void
  /** 取消事件 */
  (e: 'cancel'): void
  /** 确认事件 */
  (e: 'confirm'): void
  /** 遮罩点击事件 */
  (e: 'mask-click'): void
}

const emit = defineEmits<RouterModalEmits>()

const route = useRoute()
const router = useRouter()

// 模态框级别（用于嵌套模态框）
const modalLevel = ref(0)
const modalStack: number[] = []

// 样式计算
const modalClasses = computed(() => ({
  'router-modal--opened': props.modelValue,
}))

const modalStyle = computed(() => ({
  zIndex: props.zIndex + modalLevel.value,
}))

const maskStyle = computed(() => ({
  opacity: props.maskOpacity,
}))

const wrapperStyle = computed(() => ({}))

const containerStyle = computed(() => {
  const style: Record<string, any> = {}
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  if (props.maxWidth) {
    style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  }
  
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  
  return style
})

const transitionName = computed(() => {
  if (props.transition === 'none') return ''
  return `router-modal-${props.transition}`
})

// 处理关闭
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
  
  if (props.routeView && props.closeToBack) {
    router.back()
  }
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  handleClose()
}

// 处理确认
const handleConfirm = () => {
  emit('confirm')
  // 不自动关闭，由父组件决定
}

// 处理遮罩点击
const handleMaskClick = () => {
  emit('mask-click')
  if (props.maskClosable) {
    handleClose()
  }
}

// 处理过渡动画
const handleAfterEnter = () => {
  emit('opened')
}

const handleAfterLeave = () => {
  emit('closed')
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.escClosable && props.modelValue) {
    handleClose()
  }
}

// 锁定/解锁滚动
let originalOverflow = ''
let originalPaddingRight = ''

const lockBodyScroll = () => {
  if (!props.lockScroll) return
  
  const hasScrollbar = document.body.scrollHeight > window.innerHeight
  
  originalOverflow = document.body.style.overflow
  originalPaddingRight = document.body.style.paddingRight
  
  if (hasScrollbar) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
  
  document.body.style.overflow = 'hidden'
}

const unlockBodyScroll = () => {
  if (!props.lockScroll) return
  
  document.body.style.overflow = originalOverflow
  document.body.style.paddingRight = originalPaddingRight
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  async (visible) => {
    if (visible) {
      emit('open')
      await nextTick()
      lockBodyScroll()
      
      // 记录模态框层级
      modalLevel.value = modalStack.length
      modalStack.push(props.zIndex + modalLevel.value)
    } else {
      unlockBodyScroll()
      
      // 移除模态框层级
      const index = modalStack.indexOf(props.zIndex + modalLevel.value)
      if (index > -1) {
        modalStack.splice(index, 1)
      }
    }
  },
  { immediate: true }
)

// 监听路由变化
watch(
  () => route.fullPath,
  () => {
    if (props.routeView && props.closeToBack && props.modelValue) {
      // 路由变化时不自动关闭，由外部控制
    }
  }
)

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  unlockBodyScroll()
  
  // 清理模态框层级
  const index = modalStack.indexOf(props.zIndex + modalLevel.value)
  if (index > -1) {
    modalStack.splice(index, 1)
  }
})

// 暴露方法
defineExpose({
  close: handleClose,
})
</script>

<style scoped>
.router-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.router-modal__mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.router-modal__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 20px;
}

.router-modal__container {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  max-height: 90vh;
}

.router-modal__header {
  position: relative;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.router-modal__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.router-modal__close {
  position: absolute;
  top: 20px;
  right: 24px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.router-modal__close:hover {
  color: #333;
}

.router-modal__body {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.router-modal__footer {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.router-modal__button {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.router-modal__button:hover {
  background-color: #f5f7fa;
}

.router-modal__button--confirm {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.router-modal__button--confirm:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.router-modal__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Fade 过渡 */
.router-modal-fade-enter-active,
.router-modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.router-modal-fade-enter-active .router-modal__mask,
.router-modal-fade-leave-active .router-modal__mask {
  transition: opacity 0.3s ease;
}

.router-modal-fade-enter-active .router-modal__container,
.router-modal-fade-leave-active .router-modal__container {
  transition: opacity 0.3s ease;
}

.router-modal-fade-enter-from,
.router-modal-fade-leave-to {
  opacity: 0;
}

.router-modal-fade-enter-from .router-modal__container,
.router-modal-fade-leave-to .router-modal__container {
  opacity: 0;
}

/* Zoom 过渡 */
.router-modal-zoom-enter-active,
.router-modal-zoom-leave-active {
  transition: opacity 0.3s ease;
}

.router-modal-zoom-enter-active .router-modal__mask,
.router-modal-zoom-leave-active .router-modal__mask {
  transition: opacity 0.3s ease;
}

.router-modal-zoom-enter-active .router-modal__container,
.router-modal-zoom-leave-active .router-modal__container {
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.router-modal-zoom-enter-from .router-modal__container,
.router-modal-zoom-leave-to .router-modal__container {
  opacity: 0;
  transform: scale(0.8);
}

/* Slide Down 过渡 */
.router-modal-slide-down-enter-active,
.router-modal-slide-down-leave-active {
  transition: opacity 0.3s ease;
}

.router-modal-slide-down-enter-active .router-modal__mask,
.router-modal-slide-down-leave-active .router-modal__mask {
  transition: opacity 0.3s ease;
}

.router-modal-slide-down-enter-active .router-modal__container,
.router-modal-slide-down-leave-active .router-modal__container {
  transition: all 0.3s ease;
}

.router-modal-slide-down-enter-from .router-modal__container,
.router-modal-slide-down-leave-to .router-modal__container {
  opacity: 0;
  transform: translateY(-50px);
}

/* Slide Up 过渡 */
.router-modal-slide-up-enter-active,
.router-modal-slide-up-leave-active {
  transition: opacity 0.3s ease;
}

.router-modal-slide-up-enter-active .router-modal__mask,
.router-modal-slide-up-leave-active .router-modal__mask {
  transition: opacity 0.3s ease;
}

.router-modal-slide-up-enter-active .router-modal__container,
.router-modal-slide-up-leave-active .router-modal__container {
  transition: all 0.3s ease;
}

.router-modal-slide-up-enter-from .router-modal__container,
.router-modal-slide-up-leave-to .router-modal__container {
  opacity: 0;
  transform: translateY(50px);
}

/* 响应式 */
@media (max-width: 768px) {
  .router-modal__wrapper {
    padding: 0;
    align-items: flex-end;
  }
  
  .router-modal__container {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
  }
}
</style>