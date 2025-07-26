import { ref, reactive, computed } from 'vue'
import type { I18nConfig, I18nMessages, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class I18nManager {
  private _currentLocale = ref<string>('zh-CN')
  private _messages = ref<I18nMessages>({})
  private _fallbackLocale = ref<string>('en-US')
  private _config = reactive<Required<I18nConfig>>({
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    storageKey: 'ldesign-router-locale',
    detectBrowserLanguage: true
  })

  constructor(
    private router: LDesignRouter,
    config?: I18nConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }

    this.initializeMessages()
    this.loadLocaleFromStorage()
    this.detectBrowserLanguage()
  }

  get currentLocale(): string {
    return this._currentLocale.value
  }

  get messages(): I18nMessages {
    return this._messages.value
  }

  get fallbackLocale(): string {
    return this._fallbackLocale.value
  }

  get config(): Required<I18nConfig> {
    return this._config
  }

  /**
   * 初始化默认消息
   */
  private initializeMessages(): void {
    const defaultMessages: I18nMessages = {
      'zh-CN': {
        router: {
          home: '首页',
          back: '返回',
          forward: '前进',
          refresh: '刷新',
          close: '关闭',
          closeOthers: '关闭其他',
          closeAll: '关闭所有',
          loading: '加载中...',
          error: '错误',
          notFound: '页面未找到',
          forbidden: '访问被拒绝',
          unauthorized: '未授权访问',
          serverError: '服务器错误',
          networkError: '网络错误',
          timeout: '请求超时',
          retry: '重试',
          cancel: '取消',
          confirm: '确认',
          save: '保存',
          delete: '删除',
          edit: '编辑',
          view: '查看',
          search: '搜索',
          filter: '筛选',
          sort: '排序',
          export: '导出',
          import: '导入',
          settings: '设置',
          profile: '个人资料',
          logout: '退出登录',
          login: '登录',
          register: '注册'
        },
        breadcrumb: {
          separator: '/'
        },
        tabs: {
          newTab: '新标签页',
          closeTab: '关闭标签页',
          refreshTab: '刷新标签页',
          pinTab: '固定标签页',
          unpinTab: '取消固定'
        },
        menu: {
          collapse: '收起菜单',
          expand: '展开菜单'
        },
        theme: {
          light: '浅色主题',
          dark: '深色主题',
          auto: '跟随系统'
        },
        device: {
          desktop: '桌面端',
          tablet: '平板端',
          mobile: '移动端'
        }
      },
      'en-US': {
        router: {
          home: 'Home',
          back: 'Back',
          forward: 'Forward',
          refresh: 'Refresh',
          close: 'Close',
          closeOthers: 'Close Others',
          closeAll: 'Close All',
          loading: 'Loading...',
          error: 'Error',
          notFound: 'Page Not Found',
          forbidden: 'Access Denied',
          unauthorized: 'Unauthorized Access',
          serverError: 'Server Error',
          networkError: 'Network Error',
          timeout: 'Request Timeout',
          retry: 'Retry',
          cancel: 'Cancel',
          confirm: 'Confirm',
          save: 'Save',
          delete: 'Delete',
          edit: 'Edit',
          view: 'View',
          search: 'Search',
          filter: 'Filter',
          sort: 'Sort',
          export: 'Export',
          import: 'Import',
          settings: 'Settings',
          profile: 'Profile',
          logout: 'Logout',
          login: 'Login',
          register: 'Register'
        },
        breadcrumb: {
          separator: '/'
        },
        tabs: {
          newTab: 'New Tab',
          closeTab: 'Close Tab',
          refreshTab: 'Refresh Tab',
          pinTab: 'Pin Tab',
          unpinTab: 'Unpin Tab'
        },
        menu: {
          collapse: 'Collapse Menu',
          expand: 'Expand Menu'
        },
        theme: {
          light: 'Light Theme',
          dark: 'Dark Theme',
          auto: 'Follow System'
        },
        device: {
          desktop: 'Desktop',
          tablet: 'Tablet',
          mobile: 'Mobile'
        }
      }
    }

    this._messages.value = defaultMessages
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: string): void {
    if (!this._messages.value[locale]) {
      console.warn(`Locale '${locale}' not found`)
      return
    }

    this._currentLocale.value = locale
    this.saveLocaleToStorage()
    this.updateDocumentLanguage()
    this.emitLocaleChange(locale)
  }

  /**
   * 设置回退语言
   */
  setFallbackLocale(locale: string): void {
    this._fallbackLocale.value = locale
  }

  /**
   * 添加消息
   */
  addMessages(locale: string, messages: any): void {
    if (!this._messages.value[locale]) {
      this._messages.value[locale] = {}
    }

    this._messages.value[locale] = this.deepMerge(
      this._messages.value[locale],
      messages
    )
  }

  /**
   * 设置消息
   */
  setMessages(locale: string, messages: any): void {
    this._messages.value[locale] = messages
  }

  /**
   * 获取翻译文本
   */
  t(key: string, params?: Record<string, any>, locale?: string): string {
    if (!this._config.enabled) return key

    const targetLocale = locale || this._currentLocale.value
    let message = this.getMessage(key, targetLocale)

    // 如果没有找到，使用回退语言
    if (message === key && targetLocale !== this._fallbackLocale.value) {
      message = this.getMessage(key, this._fallbackLocale.value)
    }

    // 参数替换
    if (params && typeof message === 'string') {
      message = this.interpolate(message, params)
    }

    return message
  }

  /**
   * 获取消息
   */
  private getMessage(key: string, locale: string): string {
    const messages = this._messages.value[locale]
    if (!messages) return key

    const keys = key.split('.')
    let result: any = messages

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return key
      }
    }

    return typeof result === 'string' ? result : key
  }

  /**
   * 参数插值
   */
  private interpolate(message: string, params: Record<string, any>): string {
    return message.replace(/\{([^}]+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match
    })
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  /**
   * 获取可用语言列表
   */
  getAvailableLocales(): string[] {
    return Object.keys(this._messages.value)
  }

  /**
   * 检查语言是否可用
   */
  isLocaleAvailable(locale: string): boolean {
    return locale in this._messages.value
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    // 检查路由是否指定了特定语言
    const routeLocale = to.meta.locale as string | undefined
    if (routeLocale && routeLocale !== this._currentLocale.value) {
      this.setLocale(routeLocale)
    }

    // 更新页面标题
    this.updatePageTitle(to)
  }

  /**
   * 更新页面标题
   */
  private updatePageTitle(route: RouteLocationNormalized): void {
    if (typeof document === 'undefined') return

    let title = ''

    if (route.meta.title) {
      // 如果标题是翻译键
      if (typeof route.meta.title === 'string' && route.meta.title.includes('.')) {
        title = this.t(route.meta.title)
      } else {
        title = route.meta.title
      }
    } else if (route.name) {
      title = route.name.toString()
    }

    if (title) {
      document.title = title
    }
  }

  /**
   * 更新文档语言属性
   */
  private updateDocumentLanguage(): void {
    if (typeof document === 'undefined') return

    document.documentElement.lang = this._currentLocale.value
    document.documentElement.dir = this.isRTL(this._currentLocale.value) ? 'rtl' : 'ltr'
  }

  /**
   * 检查是否为从右到左的语言
   */
  private isRTL(locale: string): boolean {
    const rtlLocales = ['ar', 'he', 'fa', 'ur']
    return rtlLocales.some(rtl => locale.startsWith(rtl))
  }

  /**
   * 检测浏览器语言
   */
  private detectBrowserLanguage(): void {
    if (!this._config.detectBrowserLanguage || typeof navigator === 'undefined') return

    const browserLanguage = navigator.language || navigator.languages?.[0]
    if (browserLanguage) {
      // 尝试完全匹配
      if (this.isLocaleAvailable(browserLanguage)) {
        this.setLocale(browserLanguage)
        return
      }

      // 尝试语言代码匹配（如 en-US -> en）
      const languageCode = browserLanguage.split('-')[0]
      const matchingLocale = this.getAvailableLocales().find(locale =>
        locale.startsWith(languageCode)
      )

      if (matchingLocale) {
        this.setLocale(matchingLocale)
      }
    }
  }

  /**
   * 从存储加载语言
   */
  private loadLocaleFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this._config.storageKey)
      if (stored && this.isLocaleAvailable(stored)) {
        this.setLocale(stored)
        return
      }
    } catch (error) {
      console.warn('Failed to load locale from storage:', error)
    }

    // 使用默认语言
    this.setLocale(this._config.defaultLocale)
  }

  /**
   * 保存语言到存储
   */
  private saveLocaleToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this._config.storageKey, this._currentLocale.value)
    } catch (error) {
      console.warn('Failed to save locale to storage:', error)
    }
  }

  /**
   * 异步加载语言包
   */
  async loadLocaleMessages(locale: string, loader: () => Promise<any>): Promise<void> {
    try {
      const messages = await loader()
      this.addMessages(locale, messages)
    } catch (error) {
      console.error(`Failed to load locale messages for '${locale}':`, error)
    }
  }

  /**
   * 格式化数字
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this._currentLocale.value, options).format(value)
    } catch (error) {
      return value.toString()
    }
  }

  /**
   * 格式化日期
   */
  formatDate(value: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    try {
      const date = value instanceof Date ? value : new Date(value)
      return new Intl.DateTimeFormat(this._currentLocale.value, options).format(date)
    } catch (error) {
      return String(value)
    }
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    try {
      return new Intl.RelativeTimeFormat(this._currentLocale.value).format(value, unit)
    } catch (error) {
      return `${value} ${unit}`
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<I18nConfig>): void {
    Object.assign(this._config, config)
  }

  /**
   * 导出语言包
   */
  exportMessages(): string {
    return JSON.stringify({
      currentLocale: this._currentLocale.value,
      fallbackLocale: this._fallbackLocale.value,
      messages: this._messages.value,
      config: this._config
    }, null, 2)
  }

  /**
   * 导入语言包
   */
  importMessages(data: string): void {
    try {
      const parsed = JSON.parse(data)

      if (parsed.messages) {
        this._messages.value = parsed.messages
      }

      if (parsed.config) {
        Object.assign(this._config, parsed.config)
      }

      if (parsed.currentLocale) {
        this.setLocale(parsed.currentLocale)
      }

      if (parsed.fallbackLocale) {
        this.setFallbackLocale(parsed.fallbackLocale)
      }
    } catch (error) {
      console.error('Failed to import messages:', error)
    }
  }

  /**
   * 创建翻译函数
   */
  createT(namespace?: string) {
    return (key: string, params?: Record<string, any>, locale?: string) => {
      const fullKey = namespace ? `${namespace}.${key}` : key
      return this.t(fullKey, params, locale)
    }
  }

  private emitLocaleChange(locale: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('locale-change', {
        detail: { locale }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useI18n() {
    return {
      locale: computed(() => this._currentLocale.value),
      messages: computed(() => this._messages.value),
      availableLocales: computed(() => this.getAvailableLocales()),
      config: computed(() => this._config),
      t: this.t.bind(this),
      setLocale: this.setLocale.bind(this),
      formatNumber: this.formatNumber.bind(this),
      formatDate: this.formatDate.bind(this),
      formatRelativeTime: this.formatRelativeTime.bind(this)
    }
  }

  /**
   * 创建语言切换组件的属性
   */
  createLocaleSwitcherProps() {
    return {
      locales: this.getAvailableLocales().map(locale => ({
        value: locale,
        label: this._messages.value[locale]?.name || locale
      })),
      currentLocale: this._currentLocale.value,
      onChange: this.setLocale.bind(this)
    }
  }

  /**
   * 销毁国际化管理器
   */
  destroy(): void {
    // 清理事件监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('locale-change', this.emitLocaleChange)
    }
    
    // 重置状态
    this._currentLocale.value = this._config.defaultLocale
    this._messages.value = {}
  }
}