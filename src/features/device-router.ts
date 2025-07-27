import { computed, reactive, ref } from 'vue'
import type { DeviceInfo, DeviceRouterConfig, DeviceType } from '../types'

/**
 * 设备路由器
 * 负责根据设备类型提供不同的路由组件
 */
export class DeviceRouter {
  private _deviceInfo = ref<DeviceInfo>({
    type: 'desktop',
    width: 1920,
    height: 1080,
    userAgent: '',
    pixelRatio: 1,
  })

  private config = reactive<Required<DeviceRouterConfig>>({
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
    defaultDevice: 'desktop',
  })

  private resizeObserver?: ResizeObserver

  constructor(
    private router: any, // 使用 any 避免循环依赖
    config: DeviceRouterConfig = {},
  ) {
    Object.assign(this.config, config)
    this.initializeDeviceDetection()
  }

  /**
   * 初始化设备检测
   */
  private initializeDeviceDetection(): void {
    if (!this.config.enabled)
return

    this.detectDevice()
    this.setupResizeListener()
    this.setupOrientationListener()
  }

  /**
   * 检测设备信息
   */
  private detectDevice(): void {
    if (typeof window === 'undefined') {
      this._deviceInfo.value.type = this.config.defaultDevice
      return
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent

    // 确定设备类型
    let deviceType: DeviceType = 'desktop'
    if (width <= this.config.breakpoints.mobile!) {
      deviceType = 'mobile'
    }
 else if (width <= this.config.breakpoints.tablet!) {
      deviceType = 'tablet'
    }

    // 更新设备信息
    this._deviceInfo.value = {
      type: deviceType,
      width,
      height,
      userAgent,
      pixelRatio: this.getDevicePixelRatio(),
    }
  }

  /**
   * 设置窗口大小监听器
   */
  private setupResizeListener(): void {
    if (typeof window === 'undefined')
return

    const handleResize = () => {
      this.detectDevice()
    }

    window.addEventListener('resize', handleResize)

    // 使用 ResizeObserver 获得更好的性能
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(handleResize)
      this.resizeObserver.observe(document.documentElement)
    }
  }

  /**
   * 设置屏幕方向监听器
   */
  private setupOrientationListener(): void {
    if (typeof window === 'undefined')
return

    const handleOrientationChange = () => {
      // 延迟检测，等待屏幕方向变化完成
      setTimeout(() => {
        this.detectDevice()
      }, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    // 现代浏览器的屏幕方向API
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
    }
  }

  /**
   * 获取当前设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return this._deviceInfo.value
  }

  /**
   * 获取设备信息的响应式引用
   */
  get deviceInfo() {
    return computed(() => this._deviceInfo.value)
  }

  /**
   * 检查是否为移动设备
   */
  get isMobile() {
    return computed(() => this._deviceInfo.value.type === 'mobile')
  }

  /**
   * 检查是否为平板设备
   */
  get isTablet() {
    return computed(() => this._deviceInfo.value.type === 'tablet')
  }

  /**
   * 检查是否为桌面设备
   */
  get isDesktop() {
    return computed(() => this._deviceInfo.value.type === 'desktop')
  }

  /**
   * 获取设备类型
   */
  get deviceType() {
    return computed(() => this._deviceInfo.value.type)
  }

  /**
   * 获取设备CSS类名
   */
  get deviceClass() {
    return computed(() => `device-${this._deviceInfo.value.type}`)
  }

  /**
   * 根据设备类型获取组件
   * @param components 设备组件映射
   * @returns 当前设备对应的组件
   */
  getDeviceComponent(components: Record<DeviceType, any>): any {
    const deviceType = this._deviceInfo.value.type
    return components[deviceType] || components.desktop || components[Object.keys(components)[0] as DeviceType]
  }

  /**
   * 检查设备是否支持触摸
   */
  isTouchDevice(): boolean {
    if (typeof window === 'undefined')
return false

    return 'ontouchstart' in window
      || navigator.maxTouchPoints > 0
      || (navigator as any).msMaxTouchPoints > 0
  }

  /**
   * 检查设备是否支持悬停
   */
  supportsHover(): boolean {
    if (typeof window === 'undefined')
return true

    return window.matchMedia('(hover: hover)').matches
  }

  /**
   * 获取设备像素比
   */
  getDevicePixelRatio(): number {
    if (typeof window === 'undefined')
return 1

    return window.devicePixelRatio || 1
  }

  /**
   * 检查是否为高分辨率设备
   */
  isHighDPI(): boolean {
    return this.getDevicePixelRatio() > 1
  }

  /**
   * 获取视口尺寸
   */
  getViewportSize(): { width: number, height: number } {
    if (typeof window === 'undefined') {
      return { width: 1920, height: 1080 }
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  /**
   * 检查是否为横屏模式
   */
  isLandscape(): boolean {
    const { width, height } = this.getViewportSize()
    return width > height
  }

  /**
   * 检查是否为竖屏模式
   */
  isPortrait(): boolean {
    return !this.isLandscape()
  }

  /**
   * 设置断点配置
   * @param breakpoints 新的断点配置
   */
  setBreakpoints(breakpoints: Partial<DeviceRouterConfig['breakpoints']>): void {
    Object.assign(this.config.breakpoints, breakpoints)
    this.detectDevice()
  }

  /**
   * 获取断点配置
   */
  getBreakpoints(): DeviceRouterConfig['breakpoints'] {
    return { ...this.config.breakpoints }
  }

  /**
   * 手动设置设备类型（用于测试）
   * @param deviceType 设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    this._deviceInfo.value.type = deviceType
    this._deviceInfo.value.isMobile = deviceType === 'mobile'
    this._deviceInfo.value.isTablet = deviceType === 'tablet'
    this._deviceInfo.value.isDesktop = deviceType === 'desktop'
  }

  /**
   * 获取设备特性
   */
  getDeviceFeatures(): {
    touch: boolean
    hover: boolean
    highDPI: boolean
    orientation: 'landscape' | 'portrait'
    pixelRatio: number
  } {
    return {
      touch: this.isTouchDevice(),
      hover: this.supportsHover(),
      highDPI: this.isHighDPI(),
      orientation: this.isLandscape() ? 'landscape' : 'portrait',
      pixelRatio: this.getDevicePixelRatio(),
    }
  }

  /**
   * 销毁设备路由器
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.detectDevice)
      window.removeEventListener('orientationchange', this.detectDevice)

      if (screen.orientation) {
        screen.orientation.removeEventListener('change', this.detectDevice)
      }
    }
  }

  /**
   * 获取设备统计信息
   */
  getDeviceStats(): {
    type: DeviceType
    width: number
    height: number
    features: ReturnType<DeviceRouter['getDeviceFeatures']>
    enabled: boolean
  } {
    return {
      type: this._deviceInfo.value.type,
      width: this._deviceInfo.value.width,
      height: this._deviceInfo.value.height,
      features: this.getDeviceFeatures(),
      enabled: this.config.enabled,
    }
  }
}
