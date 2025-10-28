/**
 * @ldesign/router-core 历史管理类型
 *
 * 定义框架无关的历史管理相关类型
 * 
 * @module types/history
 */

// ==================== 历史管理类型 ====================

/**
 * 历史位置类型
 * 
 * 表示历史记录中的一个位置，包含路径、查询参数和哈希
 */
export interface HistoryLocation {
  /** 完整路径（包含查询参数和哈希） */
  fullPath: string

  /** 路径部分（不包含查询参数和哈希） */
  path: string

  /** 查询参数字符串（不包含 ?） */
  query?: string

  /** 哈希部分（不包含 #） */
  hash?: string
}

/**
 * 历史状态类型
 * 
 * 存储在浏览器历史记录中的状态数据
 */
export interface HistoryState {
  /** 后退步数 */
  back?: HistoryLocation | null

  /** 当前位置 */
  current: HistoryLocation

  /** 前进步数 */
  forward?: HistoryLocation | null

  /** 历史记录位置索引 */
  position: number

  /** 是否替换当前记录 */
  replaced?: boolean

  /** 滚动位置 */
  scroll?: {
    left: number
    top: number
  } | null

  /** 自定义状态数据 */
  [key: string]: unknown
}

/**
 * 导航类型
 */
export enum NavigationType {
  /** 前进导航 */
  forward = 'forward',

  /** 后退导航 */
  back = 'back',

  /** 未知/初始导航 */
  unknown = ''
}

/**
 * 导航方向
 */
export type NavigationDirection = 'forward' | 'back' | 'unknown' | ''

/**
 * 导航信息
 */
export interface NavigationInformation {
  /** 导航类型 */
  type: NavigationType

  /** 导航方向 */
  direction: NavigationDirection

  /** 历史记录增量 */
  delta: number
}

/**
 * 导航回调函数
 */
export type NavigationCallback = (
  to: HistoryLocation,
  from: HistoryLocation,
  information: NavigationInformation
) => void

/**
 * 路由历史接口
 */
export interface RouterHistory {
  /** 基础路径 */
  readonly base: string

  /** 当前位置 */
  readonly location: HistoryLocation

  /** 当前状态 */
  readonly state: HistoryState

  /**
   * 添加新的历史记录
   */
  push(to: HistoryLocation, data?: HistoryState): void

  /**
   * 替换当前历史记录
   */
  replace(to: HistoryLocation, data?: HistoryState): void

  /**
   * 在历史记录中前进或后退
   */
  go(delta: number, triggerListeners?: boolean): void

  /**
   * 后退一步
   */
  back(): void

  /**
   * 前进一步
   */
  forward(): void

  /**
   * 监听历史变化
   */
  listen(callback: NavigationCallback): () => void

  /**
   * 销毁历史管理器
   */
  destroy(): void
}

