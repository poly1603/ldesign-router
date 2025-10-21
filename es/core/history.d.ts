/**
 * @ldesign/router 历史管理器
 *
 * 提供多种历史模式的实现：HTML5 History、Hash、Memory
 */
import type { HistoryLocation, RouterHistory } from '../types';
/**
 * 创建 HTML5 History
 */
export declare function createWebHistory(base?: string): RouterHistory;
/**
 * 创建 Hash History
 */
export declare function createWebHashHistory(base?: string): RouterHistory;
/**
 * 创建 Memory History
 */
export declare function createMemoryHistory(base?: string, initialLocation?: HistoryLocation): RouterHistory;
