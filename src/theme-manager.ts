import { ref, reactive, computed, watch } from 'vue'
import type { ThemeConfig, Theme, RouteLocationNormalized, Route } from './types'
import type { LDesignRouter } from './router'

export class ThemeManager {
  private _currentTheme = ref<string>('light')
  private _themes = ref<Theme[]>([])
  private _config = reactive<Required<ThemeConfig>>({
    enabled: true,
    default: 'light',
    storage: true,
    customThemes: {}
  })

  constructor(
    private router: LDesignRouter,
    config?: ThemeConfig
  ) {
    if (config) {
      Object.assign(this._config, config)
    }

    this.initializeThemes()
    this.loadThemeFromStorage()
    this.setupSystemThemeDetection()
  }

  get currentTheme(): string {
    return this._currentTheme.value
  }

  get themes(): Theme[] {
    return this._themes.value
  }

  get config(): Required<ThemeConfig> {
    return this._config
  }

  /**
   * 初始化默认主题
   */
  private initializeThemes(): void {
    const defaultThemes: Theme[] = [
      {
        name: 'light',
        displayName: '浅色主题',
        colors: {
          primary: '#1890ff',
          secondary: '#722ed1',
          success: '#52c41a',
          warning: '#faad14',
          error: '#f5222d',
          info: '#13c2c2',
          background: '#ffffff',
          surface: '#f5f5f5',
          text: '#000000',
          textSecondary: '#666666'
        },
        variables: {
          '--router-bg-color': '#ffffff',
          '--router-text-color': '#000000',
          '--router-border-color': '#d9d9d9',
          '--router-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)'
        }
      },
      {
        name: 'dark',
        displayName: '深色主题',
        colors: {
          primary: '#1890ff',
          secondary: '#722ed1',
          success: '#52c41a',
          warning: '#faad14',
          error: '#f5222d',
          info: '#13c2c2',
          background: '#141414',
          surface: '#1f1f1f',
          text: '#ffffff',
          textSecondary: '#a6a6a6'
        },
        variables: {
          '--router-bg-color': '#141414',
          '--router-text-color': '#ffffff',
          '--router-border-color': '#434343',
          '--router-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)'
        }
      },
      {
        name: 'auto',
        displayName: '跟随系统',
        colors: {},
        variables: {}
      }
    ]

    this._themes.value = defaultThemes
  }

  /**
   * 设置主题
   */
  setTheme(themeName: string): void {
    const theme = this._themes.value.find(t => t.name === themeName)
    if (!theme) {
      console.warn(`Theme '${themeName}' not found`)
      return
    }

    this._currentTheme.value = themeName
    this.applyTheme(theme)
    this.saveThemeToStorage()
    this.emitThemeChange(themeName, theme)
  }

  /**
   * 应用主题
   */
  private applyTheme(theme: Theme): void {
    if (!this._config.enabled) return

    if (typeof document === 'undefined') return

    const root = document.documentElement

    // 处理自动主题
    if (theme.name === 'auto') {
      this.applyAutoTheme()
      return
    }

    // 应用CSS变量
    Object.entries(theme.variables || {}).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 设置主题类名
    document.body.className = document.body.className
      .replace(/\btheme-\w+\b/g, '')
      .trim()
    document.body.classList.add(`theme-${theme.name}`)

    // 设置颜色方案
    root.style.colorScheme = theme.name === 'dark' ? 'dark' : 'light'
  }

  /**
   * 应用自动主题
   */
  private applyAutoTheme(): void {
    if (!this._config.followSystem) return

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const autoTheme = prefersDark ? 'dark' : 'light'
    const theme = this._themes.value.find(t => t.name === autoTheme)
    
    if (theme) {
      this.applyTheme(theme)
    }
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    const currentIndex = this._themes.value.findIndex(t => t.name === this._currentTheme.value)
    const nextIndex = (currentIndex + 1) % this._themes.value.length
    const nextTheme = this._themes.value[nextIndex]
    
    this.setTheme(nextTheme.name)
  }

  /**
   * 添加自定义主题
   */
  addTheme(theme: Theme): void {
    const existingIndex = this._themes.value.findIndex(t => t.name === theme.name)
    
    if (existingIndex !== -1) {
      this._themes.value[existingIndex] = theme
    } else {
      this._themes.value.push(theme)
    }
  }

  /**
   * 移除主题
   */
  removeTheme(themeName: string): void {
    const index = this._themes.value.findIndex(t => t.name === themeName)
    if (index !== -1) {
      this._themes.value.splice(index, 1)
      
      // 如果移除的是当前主题，切换到默认主题
      if (this._currentTheme.value === themeName) {
        this.setTheme(this._config.default)
      }
    }
  }

  /**
   * 获取主题
   */
  getTheme(themeName: string): Theme | undefined {
    return this._themes.value.find(t => t.name === themeName)
  }

  /**
   * 获取当前主题对象
   */
  getCurrentTheme(): Theme | undefined {
    return this.getTheme(this._currentTheme.value)
  }

  /**
   * 路由变化时的处理
   */
  onRouteChange(to: RouteLocationNormalized, from: Route): void {
    if (!this._config.enabled) return

    // 检查路由是否指定了特定主题
    const routeTheme = to.meta.theme as string | undefined
    if (routeTheme && routeTheme !== this._currentTheme.value) {
      this.setTheme(routeTheme)
    }
  }

  /**
   * 设置系统主题检测
   */
  private setupSystemThemeDetection(): void {
    if (!this._config.autoDetect || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (this._currentTheme.value === 'auto') {
        this.applyAutoTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    // 初始检测
    if (this._currentTheme.value === 'auto') {
      this.applyAutoTheme()
    }
  }

  /**
   * 从存储加载主题
   */
  private loadThemeFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('ldesign-router-theme')
      if (stored) {
        const theme = this._themes.value.find(t => t.name === stored)
        if (theme) {
          this.setTheme(stored)
          return
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error)
    }

    // 使用默认主题
    this.setTheme(this._config.default)
  }

  /**
   * 保存主题到存储
   */
  private saveThemeToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('ldesign-router-theme', this._currentTheme.value)
    } catch (error) {
      console.warn('Failed to save theme to storage:', error)
    }
  }

  /**
   * 生成主题CSS
   */
  generateThemeCSS(theme: Theme): string {
    const variables = Object.entries(theme.variables || {})
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')

    return `
.theme-${theme.name} {
${variables}
}

.theme-${theme.name} .ldesign-router-view {
  background-color: var(--router-bg-color, ${theme.colors?.background || '#ffffff'});
  color: var(--router-text-color, ${theme.colors?.text || '#000000'});
}

.theme-${theme.name} .ldesign-router-link {
  color: var(--router-text-color, ${theme.colors?.text || '#000000'});
}

.theme-${theme.name} .ldesign-router-link.active {
  color: var(--router-primary-color, ${theme.colors?.primary || '#1890ff'});
}
    `
  }

  /**
   * 注入主题样式
   */
  injectThemeStyles(): void {
    if (typeof document === 'undefined') return

    const styleId = 'ldesign-router-themes'
    let styleElement = document.getElementById(styleId)
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    const css = this._themes.value
      .map(theme => this.generateThemeCSS(theme))
      .join('\n')

    styleElement.textContent = css
  }

  /**
   * 移除主题样式
   */
  removeThemeStyles(): void {
    if (typeof document === 'undefined') return

    const styleElement = document.getElementById('ldesign-router-themes')
    if (styleElement) {
      styleElement.remove()
    }
  }

  /**
   * 获取主题颜色
   */
  getThemeColor(colorName: string, themeName?: string): string | undefined {
    const theme = themeName ? this.getTheme(themeName) : this.getCurrentTheme()
    return theme?.colors?.[colorName]
  }

  /**
   * 设置主题颜色
   */
  setThemeColor(colorName: string, color: string, themeName?: string): void {
    const theme = themeName ? this.getTheme(themeName) : this.getCurrentTheme()
    if (theme) {
      if (!theme.colors) theme.colors = {}
      theme.colors[colorName] = color
      
      // 如果是当前主题，立即应用
      if (!themeName || themeName === this._currentTheme.value) {
        this.applyTheme(theme)
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ThemeConfig>): void {
    Object.assign(this._config, config)
    
    if (this._config.enabled) {
      this.injectThemeStyles()
    } else {
      this.removeThemeStyles()
    }
  }

  /**
   * 导出主题配置
   */
  exportThemes(): string {
    return JSON.stringify({
      currentTheme: this._currentTheme.value,
      themes: this._themes.value,
      config: this._config
    }, null, 2)
  }

  /**
   * 导入主题配置
   */
  importThemes(data: string): void {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.themes) {
        this._themes.value = parsed.themes
      }
      
      if (parsed.config) {
        Object.assign(this._config, parsed.config)
      }
      
      if (parsed.currentTheme) {
        this.setTheme(parsed.currentTheme)
      }
      
      this.injectThemeStyles()
    } catch (error) {
      console.error('Failed to import themes:', error)
    }
  }

  private emitThemeChange(themeName: string, theme: Theme): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('theme-change', {
        detail: { themeName, theme }
      }))
    }
  }

  /**
   * 获取响应式数据
   */
  useTheme() {
    return {
      currentTheme: computed(() => this._currentTheme.value),
      themes: computed(() => this._themes.value),
      currentThemeObject: computed(() => this.getCurrentTheme()),
      config: computed(() => this._config),
      setTheme: this.setTheme.bind(this),
      toggleTheme: this.toggleTheme.bind(this),
      getThemeColor: this.getThemeColor.bind(this)
    }
  }

  /**
   * 创建主题切换组件的属性
   */
  createThemeSwitcherProps() {
    return {
      themes: this._themes.value,
      currentTheme: this._currentTheme.value,
      onChange: this.setTheme.bind(this)
    }
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.removeThemeStyles()
  }
}