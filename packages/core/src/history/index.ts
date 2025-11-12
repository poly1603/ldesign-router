/**
 * @ldesign/router-core 历史管理统一导出
 * 
 * @module history
 */

export { BaseHistory } from './base'
export { HTML5History, createWebHistory } from './html5'
export { HashHistory, createWebHashHistory } from './hash'
export { MemoryHistory, createMemoryHistory } from './memory'

// 高级历史管理
export {
  AdvancedHistory,
  createAdvancedHistory,
  // 兼容旧名称 (标记为弃用)
  EnhancedHistory,
  createEnhancedHistory,
  filterHistory,
  findHistoryEntry,
  getHistoryStats,
} from './advanced'

export type {
  HistoryEntry,
  HistorySnapshot,
  PersistenceOptions,
  HistoryInterceptor,
  AdvancedHistoryOptions,
  // 兼容旧名称
  EnhancedHistoryOptions,
  HistoryStats,
} from './advanced'

