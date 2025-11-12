/**
 * @ldesign/router-core 路由优化工具包
 * 
 * @description
 * 包含路径匹配优化、内存优化、代码分割等高级优化功能。
 * 
 * **特性**：
 * - Trie树路径匹配
 * - 内存泄漏检测
 * - 代码分割策略
 * - I18n路由支持
 * - DevTools集成
 * 
 * @module utils/optimization
 */

// ==================== 路径匹配优化 (Trie树) ====================

/**
 * Trie节点
 */
interface TrieNode {
  /** 子节点 */
  children: Map<string, TrieNode>
  
  /** 是否为路径结束 */
  isEnd: boolean
  
  /** 路径数据 */
  data?: any
  
  /** 参数名(动态路由) */
  paramName?: string
  
  /** 是否为动态节点 */
  isDynamic: boolean
}

/**
 * Trie树路径匹配器
 */
export class TriePathMatcher {
  private root: TrieNode = {
    children: new Map(),
    isEnd: false,
    isDynamic: false,
  }

  /**
   * 插入路径
   */
  insert(path: string, data: any): void {
    const segments = path.split('/').filter(Boolean)
    let node = this.root

    for (const segment of segments) {
      const isDynamic = segment.startsWith(':')
      const key = isDynamic ? ':' : segment

      if (!node.children.has(key)) {
        node.children.set(key, {
          children: new Map(),
          isEnd: false,
          isDynamic,
          paramName: isDynamic ? segment.slice(1) : undefined,
        })
      }

      node = node.children.get(key)!
    }

    node.isEnd = true
    node.data = data
  }

  /**
   * 匹配路径
   */
  match(path: string): { data: any; params: Record<string, string> } | null {
    const segments = path.split('/').filter(Boolean)
    const params: Record<string, string> = {}

    const search = (node: TrieNode, index: number): any => {
      if (index === segments.length) {
        return node.isEnd ? node.data : null
      }

      const segment = segments[index]

      // 尝试精确匹配
      if (node.children.has(segment)) {
        const result = search(node.children.get(segment)!, index + 1)
        if (result) return result
      }

      // 尝试动态匹配
      if (node.children.has(':')) {
        const dynamicNode = node.children.get(':')!
        if (dynamicNode.paramName) {
          params[dynamicNode.paramName] = segment
        }
        const result = search(dynamicNode, index + 1)
        if (result) return result
      }

      return null
    }

    const data = search(this.root, 0)
    return data ? { data, params } : null
  }

  /**
   * 删除路径
   */
  remove(path: string): boolean {
    const segments = path.split('/').filter(Boolean)
    
    const remove = (node: TrieNode, index: number): boolean => {
      if (index === segments.length) {
        if (!node.isEnd) return false
        node.isEnd = false
        node.data = undefined
        return node.children.size === 0
      }

      const segment = segments[index]
      const key = segment.startsWith(':') ? ':' : segment
      const child = node.children.get(key)

      if (!child) return false

      const shouldDelete = remove(child, index + 1)
      if (shouldDelete) {
        node.children.delete(key)
        return !node.isEnd && node.children.size === 0
      }

      return false
    }

    return remove(this.root, 0)
  }

  /**
   * 获取所有路径
   */
  getAllPaths(): string[] {
    const paths: string[] = []

    const traverse = (node: TrieNode, currentPath: string[]) => {
      if (node.isEnd) {
        paths.push('/' + currentPath.join('/'))
      }

      for (const [key, child] of node.children) {
        const segment = child.isDynamic && child.paramName 
          ? `:${child.paramName}` 
          : key
        traverse(child, [...currentPath, segment])
      }
    }

    traverse(this.root, [])
    return paths
  }

  /**
   * 清空
   */
  clear(): void {
    this.root.children.clear()
    this.root.isEnd = false
    this.root.data = undefined
  }
}

// ==================== 内存优化 ====================

/**
 * 内存监控器
 */
export class MemoryMonitor {
  private checkInterval: number
  private timer: any = null
  private listeners: Array<(usage: MemoryUsage) => void> = []
  private history: MemoryUsage[] = []
  private maxHistorySize = 100

  constructor(checkInterval: number = 5000) {
    this.checkInterval = checkInterval
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.timer) return

    this.timer = setInterval(() => {
      const usage = this.getMemoryUsage()
      if (usage) {
        this.recordUsage(usage)
        this.notifyListeners(usage)
      }
    }, this.checkInterval)
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsage | null {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
        timestamp: Date.now(),
      }
    }
    return null
  }

  /**
   * 记录使用情况
   */
  private recordUsage(usage: MemoryUsage): void {
    this.history.push(usage)
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }
  }

  /**
   * 监听内存变化
   */
  onMemoryChange(callback: (usage: MemoryUsage) => void): () => void {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(usage: MemoryUsage): void {
    for (const listener of this.listeners) {
      listener(usage)
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(): MemoryUsage[] {
    return [...this.history]
  }

  /**
   * 检测内存泄漏
   */
  detectLeak(threshold: number = 10 * 1024 * 1024): boolean {
    if (this.history.length < 10) return false

    const recent = this.history.slice(-10)
    const first = recent[0].usedJSHeapSize
    const last = recent[recent.length - 1].usedJSHeapSize

    return last - first > threshold
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stop()
    this.listeners = []
    this.history = []
  }
}

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}

/**
 * 弱引用缓存
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>()

  /**
   * 设置缓存
   */
  set(key: K, value: V): void {
    this.cache.set(key, value)
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  /**
   * 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }
}

// ==================== 代码分割 ====================

/**
 * 代码分割策略
 */
export interface CodeSplitStrategy {
  /** 策略名称 */
  name: string
  
  /** 是否应该分割 */
  shouldSplit: (path: string) => boolean
  
  /** 获取chunk名称 */
  getChunkName: (path: string) => string
}

/**
 * 按路由分割策略
 */
export function createRouteBasedSplit(): CodeSplitStrategy {
  return {
    name: 'route-based',
    shouldSplit: (path) => path.startsWith('/'),
    getChunkName: (path) => {
      const segments = path.split('/').filter(Boolean)
      return segments[0] || 'home'
    },
  }
}

/**
 * 按功能模块分割策略
 */
export function createModuleBasedSplit(modules: Record<string, string[]>): CodeSplitStrategy {
  return {
    name: 'module-based',
    shouldSplit: (path) => {
      return Object.values(modules).some(paths => 
        paths.some(p => path.startsWith(p))
      )
    },
    getChunkName: (path) => {
      for (const [moduleName, paths] of Object.entries(modules)) {
        if (paths.some(p => path.startsWith(p))) {
          return moduleName
        }
      }
      return 'default'
    },
  }
}

// ==================== I18n路由支持 ====================

/**
 * I18n路由配置
 */
export interface I18nRouteConfig {
  /** 默认语言 */
  defaultLocale: string
  
  /** 支持的语言列表 */
  locales: string[]
  
  /** 路径翻译 */
  translations: Record<string, Record<string, string>>
  
  /** 是否在路径中包含默认语言 */
  includeDefaultLocaleInPath?: boolean
}

/**
 * I18n路由管理器
 */
export class I18nRouter {
  private config: I18nRouteConfig
  private currentLocale: string

  constructor(config: I18nRouteConfig) {
    this.config = config
    this.currentLocale = config.defaultLocale
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: string): void {
    if (!this.config.locales.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`)
    }
    this.currentLocale = locale
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale
  }

  /**
   * 翻译路径
   */
  translatePath(path: string, locale?: string): string {
    const targetLocale = locale || this.currentLocale
    const translations = this.config.translations[path]

    if (!translations) {
      return path
    }

    const translated = translations[targetLocale] || path
    
    // 添加语言前缀
    if (targetLocale !== this.config.defaultLocale || 
        this.config.includeDefaultLocaleInPath) {
      return `/${targetLocale}${translated}`
    }

    return translated
  }

  /**
   * 从路径中提取语言
   */
  extractLocale(path: string): { locale: string; path: string } {
    const match = path.match(/^\/([a-z]{2}(-[A-Z]{2})?)(.*)/)
    
    if (match && this.config.locales.includes(match[1])) {
      return {
        locale: match[1],
        path: match[3] || '/',
      }
    }

    return {
      locale: this.config.defaultLocale,
      path,
    }
  }

  /**
   * 切换语言
   */
  switchLocale(newLocale: string, currentPath: string): string {
    const { path } = this.extractLocale(currentPath)
    return this.translatePath(path, newLocale)
  }
}

// ==================== DevTools集成 ====================

/**
 * DevTools事件类型
 */
export type DevToolsEvent = 
  | { type: 'navigation'; data: any }
  | { type: 'state-change'; data: any }
  | { type: 'error'; data: any }

/**
 * DevTools钩子
 */
export interface DevToolsHook {
  /** 发送事件 */
  emit: (event: DevToolsEvent) => void
  
  /** 监听事件 */
  on: (type: string, handler: (data: any) => void) => () => void
}

/**
 * DevTools连接器
 */
export class DevToolsConnector {
  private hook: DevToolsHook | null = null
  private events: DevToolsEvent[] = []
  private maxEvents = 100

  /**
   * 连接DevTools
   */
  connect(hook: DevToolsHook): void {
    this.hook = hook
    
    // 发送缓存的事件
    for (const event of this.events) {
      this.hook.emit(event)
    }
    this.events = []
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.hook = null
  }

  /**
   * 发送事件
   */
  emit(event: DevToolsEvent): void {
    if (this.hook) {
      this.hook.emit(event)
    } else {
      // 缓存事件
      this.events.push(event)
      if (this.events.length > this.maxEvents) {
        this.events.shift()
      }
    }
  }

  /**
   * 记录导航
   */
  logNavigation(from: string, to: string, duration: number): void {
    this.emit({
      type: 'navigation',
      data: { from, to, duration, timestamp: Date.now() },
    })
  }

  /**
   * 记录状态变化
   */
  logStateChange(state: any): void {
    this.emit({
      type: 'state-change',
      data: { state, timestamp: Date.now() },
    })
  }

  /**
   * 记录错误
   */
  logError(error: Error): void {
    this.emit({
      type: 'error',
      data: { 
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      },
    })
  }
}

// ==================== 工具函数 ====================

/**
 * 创建Trie路径匹配器
 */
export function createTrieMatcher(): TriePathMatcher {
  return new TriePathMatcher()
}

/**
 * 创建内存监控器
 */
export function createMemoryMonitor(interval?: number): MemoryMonitor {
  return new MemoryMonitor(interval)
}

/**
 * 创建I18n路由器
 */
export function createI18nRouter(config: I18nRouteConfig): I18nRouter {
  return new I18nRouter(config)
}

/**
 * 创建DevTools连接器
 */
export function createDevToolsConnector(): DevToolsConnector {
  return new DevToolsConnector()
}
