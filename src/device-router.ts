import { ref, computed, watch } from 'vue'
import type { Component } from 'vue'
import type { DeviceType, DeviceInfo, DeviceRouteConfig, RouteLocationNormalized } from './types'
import type { LDesignRouter } from './router'

export class DeviceRouter {
  private _deviceInfo = ref<DeviceInfo>({
    type: 'desktop',
    width: 0,
    height: 0,
    userAgent: '',
    isMobile: false,
    isTablet: false,
    isDesktop: true
  })

  private _enabled = ref(true)
  private resizeObserver?: ResizeObserver

  constructor(
    private router: LDesignRouter,
    enabled = true
  ) {
    this._enabled.value = enabled
    if (enabled) {
      this.init()
    }
  }

  get deviceInfo(): DeviceInfo {
    return this._deviceInfo.value
  }

  get currentDevice(): DeviceType {
    return this._deviceInfo.value.type
  }

  get isEnabled(): boolean {
    return this._enabled.value
  }

  private init(): void {
    if (typeof window === 'undefined') return

    // 初始检测
    this.detectDevice()

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this))
    
    // 使用 ResizeObserver 更精确地监听变化
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.handleResize.bind(this))
      this.resizeObserver.observe(document.documentElement)
    }

    // 监听设备方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.detectDevice(), 100)
    })
  }

  private handleResize(): void {
    this.detectDevice()
  }

  private detectDevice(): void {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent

    // 基于用户代理的检测
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTabletUA = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bTablet\b)/i.test(userAgent)
    
    // 基于屏幕尺寸的检测
    let deviceType: DeviceType
    if (width < 768) {
      deviceType = 'mobile'
    } else if (width < 1024) {
      deviceType = 'tablet'
    } else {
      deviceType = 'desktop'
    }

    // 结合用户代理和屏幕尺寸
    if (isMobileUA && !isTabletUA) {
      deviceType = 'mobile'
    } else if (isTabletUA) {
      deviceType = 'tablet'
    }

    const newDeviceInfo: DeviceInfo = {
      type: deviceType,
      width,
      height,
      userAgent,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop'
    }

    // 只有设备类型改变时才更新
    if (this._deviceInfo.value.type !== newDeviceInfo.type) {
      this._deviceInfo.value = newDeviceInfo
      this.onDeviceChange(newDeviceInfo)
    } else {
      // 更新尺寸信息
      this._deviceInfo.value.width = width
      this._deviceInfo.value.height = height
    }
  }

  private onDeviceChange(deviceInfo: DeviceInfo): void {
    // 设备类型改变时，重新加载当前路由以应用新的组件
    const currentRoute = this.router.currentRoute
    if (currentRoute) {
      this.router.replace({
        path: currentRoute.path,
        query: currentRoute.query,
        hash: currentRoute.hash
      })
    }

    // 触发设备变化事件
    this.emitDeviceChange(deviceInfo)
  }

  private emitDeviceChange(deviceInfo: DeviceInfo): void {
    // 派发自定义事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('device-change', {
        detail: deviceInfo
      }))
    }
  }

  /**
   * 根据当前设备类型获取适配的组件
   */
  getAdaptiveComponent(route: DeviceRouteConfig): Component | (() => Promise<Component>) | null {
    if (!this._enabled.value) {
      return route.component || null
    }

    const deviceType = this._deviceInfo.value.type
    const components = route.components

    if (!components) {
      return route.component || null
    }

    // 优先返回当前设备类型的组件
    if (components[deviceType]) {
      return components[deviceType]!
    }

    // 降级策略：mobile -> tablet -> desktop
    if (deviceType === 'mobile') {
      return components.tablet || components.desktop || route.component || null
    }

    // tablet -> desktop -> mobile
    if (deviceType === 'tablet') {
      return components.desktop || components.mobile || route.component || null
    }

    // desktop -> tablet -> mobile
    if (deviceType === 'desktop') {
      return components.tablet || components.mobile || route.component || null
    }

    return route.component || null
  }

  /**
   * 检查路由是否支持当前设备类型
   */
  isRouteSupported(route: DeviceRouteConfig): boolean {
    if (!this._enabled.value) return true

    const deviceType = this._deviceInfo.value.type
    const components = route.components

    if (!components) {
      return !!route.component
    }

    // 检查是否有任何可用的组件
    return !!(components[deviceType] || components.desktop || components.tablet || components.mobile || route.component)
  }

  /**
   * 获取设备特定的CSS类名
   */
  getDeviceClasses(): string[] {
    const deviceInfo = this._deviceInfo.value
    const classes = [`device-${deviceInfo.type}`]

    if (deviceInfo.isMobile) classes.push('is-mobile')
    if (deviceInfo.isTablet) classes.push('is-tablet')
    if (deviceInfo.isDesktop) classes.push('is-desktop')

    // 添加屏幕尺寸类
    if (deviceInfo.width < 480) classes.push('screen-xs')
    else if (deviceInfo.width < 768) classes.push('screen-sm')
    else if (deviceInfo.width < 1024) classes.push('screen-md')
    else if (deviceInfo.width < 1280) classes.push('screen-lg')
    else classes.push('screen-xl')

    return classes
  }

  /**
   * 手动设置设备类型（用于测试）
   */
  setDeviceType(type: DeviceType): void {
    const currentInfo = this._deviceInfo.value
    this._deviceInfo.value = {
      ...currentInfo,
      type,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop'
    }
    this.onDeviceChange(this._deviceInfo.value)
  }

  /**
   * 启用/禁用设备检测
   */
  setEnabled(enabled: boolean): void {
    this._enabled.value = enabled
    if (enabled) {
      this.init()
    }
  }

  /**
   * 获取设备信息的响应式引用
   */
  useDeviceInfo() {
    return {
      deviceInfo: computed(() => this._deviceInfo.value),
      currentDevice: computed(() => this._deviceInfo.value.type),
      isMobile: computed(() => this._deviceInfo.value.isMobile),
      isTablet: computed(() => this._deviceInfo.value.isTablet),
      isDesktop: computed(() => this._deviceInfo.value.isDesktop),
      deviceClasses: computed(() => this.getDeviceClasses())
    }
  }

  /**
   * 监听设备变化
   */
  onDeviceChange(callback: (deviceInfo: DeviceInfo) => void): () => void {
    const stopWatcher = watch(
      () => this._deviceInfo.value,
      callback,
      { deep: true }
    )

    return stopWatcher
  }

  /**
   * 销毁设备检测器
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this))
      window.removeEventListener('orientationchange', this.handleResize.bind(this))
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }
}