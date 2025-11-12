/**
 * @ldesign/router-core 路由元数据与扩展
 * 
 * @description
 * 定义框架无关的路由元数据和扩展功能接口
 * 
 * @module types/metadata
 */

import type { RouteLocationNormalized, RouteRecordRaw } from './navigation'

// ==================== 路由元数据扩展 ====================

/**
 * 路由元数据扩展接口
 * 
 * @description
 * 允许各框架扩展路由元数据，添加框架特定的功能
 */
export interface RouteMetaExtended {
  /** 页面标题 */
  title?: string | ((route: RouteLocationNormalized) => string)
  
  /** 页面描述 */
  description?: string
  
  /** 页面关键词 */
  keywords?: string[]
  
  /** 页面图标 */
  icon?: string
  
  /** 是否在菜单中显示 */
  showInMenu?: boolean
  
  /** 是否在面包屑中显示 */
  showInBreadcrumb?: boolean
  
  /** 是否在标签页中显示 */
  showInTabs?: boolean
  
  /** 菜单排序权重 */
  order?: number
  
  /** 权限要求 */
  permission?: string | string[] | ((route: RouteLocationNormalized) => boolean)
  
  /** 角色要求 */
  roles?: string[]
  
  /** 是否缓存页面 */
  keepAlive?: boolean
  
  /** 缓存键 */
  cacheKey?: string | ((route: RouteLocationNormalized) => string)
  
  /** 页面过渡动画 */
  transition?: string | {
    name?: string
    mode?: string
    duration?: number
  }
  
  /** 页面布局 */
  layout?: string | false
  
  /** 是否需要认证 */
  requiresAuth?: boolean
  
  /** 是否为访客页面 */
  guest?: boolean
  
  /** 是否隐藏 */
  hidden?: boolean
  
  /** 是否禁用 */
  disabled?: boolean
  
  /** 页面级别的 loading 状态 */
  loading?: boolean
  
  /** 页面错误处理 */
  errorHandler?: (error: Error, route: RouteLocationNormalized) => void
  
  /** 页面进入前的数据预取 */
  beforeEnter?: (route: RouteLocationNormalized) => Promise<any>
  
  /** 页面离开前的清理 */
  beforeLeave?: (route: RouteLocationNormalized) => Promise<boolean>
  
  /** 自定义属性（框架特定） */
  [key: string]: any
}

// ==================== 路由能力接口 ====================

/**
 * 路由数据预取接口
 * 
 * @description
 * 定义路由级别的数据预取能力
 */
export interface RouteDataFetcher {
  /**
   * 预取数据
   * 
   * @param route - 目标路由
   * @returns 预取的数据
   */
  fetch(route: RouteLocationNormalized): Promise<any>
  
  /**
   * 获取缓存的数据
   */
  getCached(route: RouteLocationNormalized): any
  
  /**
   * 清除缓存
   */
  clearCache(route?: RouteLocationNormalized): void
  
  /**
   * 判断是否有缓存
   */
  hasCached(route: RouteLocationNormalized): boolean
}

/**
 * 路由验证器接口
 * 
 * @description
 * 定义路由级别的验证能力
 */
export interface RouteValidator {
  /**
   * 验证路由
   * 
   * @param route - 目标路由
   * @returns 验证结果
   */
  validate(route: RouteLocationNormalized): boolean | Promise<boolean>
  
  /**
   * 获取验证错误
   */
  getErrors(): string[]
  
  /**
   * 清除错误
   */
  clearErrors(): void
}

/**
 * 路由转换器接口
 * 
 * @description
 * 定义路由转换和映射能力
 */
export interface RouteTransformer {
  /**
   * 转换路由
   * 
   * @param route - 原始路由
   * @returns 转换后的路由
   */
  transform(route: RouteRecordRaw): RouteRecordRaw
  
  /**
   * 批量转换
   */
  transformBatch(routes: RouteRecordRaw[]): RouteRecordRaw[]
  
  /**
   * 反向转换
   */
  reverse(route: RouteRecordRaw): RouteRecordRaw
}

// ==================== 路由增强功能 ====================

/**
 * 路由分析器接口
 * 
 * @description
 * 提供路由分析和统计能力
 */
export interface RouteAnalyzer {
  /**
   * 分析路由访问频率
   */
  analyzeFrequency(): Map<string, number>
  
  /**
   * 分析路由停留时间
   */
  analyzeStayTime(): Map<string, number>
  
  /**
   * 获取热门路由
   */
  getPopularRoutes(limit?: number): RouteLocationNormalized[]
  
  /**
   * 获取路由访问路径
   */
  getNavigationPaths(): Array<{
    from: string
    to: string
    count: number
  }>
  
  /**
   * 导出分析报告
   */
  exportReport(): {
    frequency: Record<string, number>
    stayTime: Record<string, number>
    popularRoutes: string[]
    navigationPaths: Array<{ from: string; to: string; count: number }>
  }
}

/**
 * 路由优化器接口
 * 
 * @description
 * 提供路由性能优化能力
 */
export interface RouteOptimizer {
  /**
   * 优化路由配置
   */
  optimize(routes: RouteRecordRaw[]): RouteRecordRaw[]
  
  /**
   * 预编译路由正则
   */
  precompilePatterns(routes: RouteRecordRaw[]): void
  
  /**
   * 生成路由索引
   */
  buildIndex(routes: RouteRecordRaw[]): Map<string, RouteRecordRaw>
  
  /**
   * 路由去重
   */
  deduplicate(routes: RouteRecordRaw[]): RouteRecordRaw[]
  
  /**
   * 路由排序（按优先级）
   */
  sort(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

// ==================== 路由中间件 ====================

/**
 * 路由中间件接口
 * 
 * @description
 * 定义路由级别的中间件处理能力
 */
export interface RouteMiddleware {
  /**
   * 中间件名称
   */
  name: string
  
  /**
   * 中间件优先级（数字越小优先级越高）
   */
  priority?: number
  
  /**
   * 处理函数
   * 
   * @param to - 目标路由
   * @param from - 来源路由
   * @param next - 继续执行
   */
  handle(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: (result?: boolean | string | RouteLocationNormalized) => void
  ): void | Promise<void>
}

/**
 * 路由中间件管理器
 */
export interface RouteMiddlewareManager {
  /**
   * 注册中间件
   */
  register(middleware: RouteMiddleware): void
  
  /**
   * 注销中间件
   */
  unregister(name: string): void
  
  /**
   * 执行中间件链
   */
  execute(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<boolean | RouteLocationNormalized>
  
  /**
   * 获取所有中间件
   */
  getAll(): RouteMiddleware[]
  
  /**
   * 清空中间件
   */
  clear(): void
}

// ==================== 路由状态管理 ====================

/**
 * 路由状态管理器
 * 
 * @description
 * 管理路由级别的状态
 */
export interface RouteStateManager<T = any> {
  /**
   * 获取状态
   */
  get(key: string): T | undefined
  
  /**
   * 设置状态
   */
  set(key: string, value: T): void
  
  /**
   * 删除状态
   */
  delete(key: string): void
  
  /**
   * 清空状态
   */
  clear(): void
  
  /**
   * 判断是否存在
   */
  has(key: string): boolean
  
  /**
   * 获取所有状态
   */
  getAll(): Map<string, T>
  
  /**
   * 订阅状态变化
   */
  subscribe(key: string, callback: (value: T) => void): () => void
  
  /**
   * 持久化状态
   */
  persist?(): void
  
  /**
   * 恢复状态
   */
  restore?(): void
}

// ==================== 路由事件系统 ====================

/**
 * 路由事件
 */
export interface RouteEvent {
  /** 事件类型 */
  type: string
  
  /** 事件数据 */
  data?: any
  
  /** 时间戳 */
  timestamp: number
  
  /** 来源路由 */
  from?: RouteLocationNormalized
  
  /** 目标路由 */
  to?: RouteLocationNormalized
}

/**
 * 路由事件发射器
 */
export interface RouteEventEmitter {
  /**
   * 监听事件
   */
  on(event: string, handler: (data: RouteEvent) => void): void
  
  /**
   * 监听一次
   */
  once(event: string, handler: (data: RouteEvent) => void): void
  
  /**
   * 取消监听
   */
  off(event: string, handler?: (data: RouteEvent) => void): void
  
  /**
   * 发射事件
   */
  emit(event: string, data?: any): void
  
  /**
   * 清空所有监听器
   */
  clear(): void
}

// ==================== 路由插件系统 ====================

/**
 * 路由插件接口
 * 
 * @description
 * 定义路由插件的标准接口
 */
export interface RoutePlugin {
  /** 插件名称 */
  name: string
  
  /** 插件版本 */
  version?: string
  
  /** 插件依赖 */
  dependencies?: string[]
  
  /**
   * 安装插件
   * 
   * @param router - 路由器实例
   * @param options - 插件选项
   */
  install(router: any, options?: any): void | Promise<void>
  
  /**
   * 卸载插件
   */
  uninstall?(): void | Promise<void>
  
  /**
   * 插件是否已安装
   */
  isInstalled?(): boolean
}

/**
 * 路由插件管理器
 */
export interface RoutePluginManager {
  /**
   * 安装插件
   */
  install(plugin: RoutePlugin, options?: any): Promise<void>
  
  /**
   * 卸载插件
   */
  uninstall(name: string): Promise<void>
  
  /**
   * 获取插件
   */
  get(name: string): RoutePlugin | undefined
  
  /**
   * 判断插件是否已安装
   */
  has(name: string): boolean
  
  /**
   * 获取所有插件
   */
  getAll(): RoutePlugin[]
}

// ==================== 导出聚合 ====================

export type {
  RouteDataFetcher,
  RouteValidator,
  RouteTransformer,
  RouteAnalyzer,
  RouteOptimizer,
  RouteMiddleware,
  RouteMiddlewareManager,
  RouteStateManager,
  RouteEvent,
  RouteEventEmitter,
  RoutePlugin,
  RoutePluginManager,
}