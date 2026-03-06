/**
 * NavigationProgress - 框架无关的导航进度状态管理
 *
 * 提供 loading bar / progress bar 的状态控制
 *
 * @module features/navigation-progress
 */

export interface NavigationProgressOptions {
  /** 初始进度（0-1），默认 0 */
  initialProgress?: number
  /** 自动递增间隔（毫秒），默认 200 */
  trickleInterval?: number
  /** 每次自动递增的最小值，默认 0.01 */
  trickleMin?: number
  /** 每次自动递增的最大值，默认 0.03 */
  trickleMax?: number
  /** 最大进度值（不会自动达到 1），默认 0.95 */
  maximum?: number
  /** 完成动画延迟（毫秒），默认 300 */
  finishDelay?: number
}

export interface NavigationProgressState {
  /** 当前进度 (0-1) */
  progress: number
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否已完成（短暂 true 后重置） */
  isFinished: boolean
}

export type ProgressListener = (state: NavigationProgressState) => void

/**
 * 导航进度管理器
 *
 * @example
 * ```typescript
 * const progress = createNavigationProgress()
 *
 * router.beforeEach(() => { progress.start() })
 * router.afterEach(() => { progress.finish() })
 *
 * progress.onChange((state) => {
 *   console.log(`Progress: ${(state.progress * 100).toFixed(0)}%`)
 * })
 * ```
 */
export class NavigationProgress {
  private state: NavigationProgressState = {
    progress: 0,
    isLoading: false,
    isFinished: false,
  }

  private options: Required<NavigationProgressOptions>
  private trickleTimer: ReturnType<typeof setInterval> | null = null
  private finishTimer: ReturnType<typeof setTimeout> | null = null
  private listeners = new Set<ProgressListener>()

  constructor(options: NavigationProgressOptions = {}) {
    this.options = {
      initialProgress: options.initialProgress ?? 0,
      trickleInterval: options.trickleInterval ?? 200,
      trickleMin: options.trickleMin ?? 0.01,
      trickleMax: options.trickleMax ?? 0.03,
      maximum: options.maximum ?? 0.95,
      finishDelay: options.finishDelay ?? 300,
    }
  }

  /** 获取当前状态 */
  getState(): Readonly<NavigationProgressState> {
    return { ...this.state }
  }

  /** 开始导航进度 */
  start(): void {
    this.clearTimers()

    this.state = {
      progress: this.options.initialProgress || 0.08,
      isLoading: true,
      isFinished: false,
    }
    this.notify()

    // 开始 trickle（缓慢递增）
    this.trickleTimer = setInterval(() => {
      this.trickle()
    }, this.options.trickleInterval)
  }

  /** 设置进度到指定值 */
  set(progress: number): void {
    const clamped = Math.min(Math.max(progress, 0), 1)
    this.state.progress = clamped
    this.notify()
  }

  /** 递增进度 */
  inc(amount?: number): void {
    if (!this.state.isLoading) return

    const increment = amount ?? (Math.random() * (this.options.trickleMax - this.options.trickleMin) + this.options.trickleMin)
    const newProgress = Math.min(this.state.progress + increment, this.options.maximum)
    this.state.progress = newProgress
    this.notify()
  }

  /** 完成导航进度 */
  finish(): void {
    this.clearTimers()

    this.state.progress = 1
    this.state.isFinished = true
    this.notify()

    this.finishTimer = setTimeout(() => {
      this.state = {
        progress: 0,
        isLoading: false,
        isFinished: false,
      }
      this.notify()
    }, this.options.finishDelay)
  }

  /** 失败（红色进度条效果，由 UI 层处理颜色） */
  fail(): void {
    this.clearTimers()

    this.state.progress = 1
    this.state.isLoading = false
    this.state.isFinished = true
    this.notify()

    this.finishTimer = setTimeout(() => {
      this.state = {
        progress: 0,
        isLoading: false,
        isFinished: false,
      }
      this.notify()
    }, this.options.finishDelay)
  }

  /** 注册状态变化监听器 */
  onChange(listener: ProgressListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** 销毁 */
  destroy(): void {
    this.clearTimers()
    this.listeners.clear()
  }

  private trickle(): void {
    if (this.state.progress >= this.options.maximum) return
    this.inc()
  }

  private notify(): void {
    const snapshot = { ...this.state }
    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }

  private clearTimers(): void {
    if (this.trickleTimer) {
      clearInterval(this.trickleTimer)
      this.trickleTimer = null
    }
    if (this.finishTimer) {
      clearTimeout(this.finishTimer)
      this.finishTimer = null
    }
  }
}

/**
 * 创建导航进度管理器
 */
export function createNavigationProgress(options?: NavigationProgressOptions): NavigationProgress {
  return new NavigationProgress(options)
}
