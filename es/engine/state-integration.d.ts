/**
 * @ldesign/router 状态管理集成
 *
 * 与 LDesign Engine 状态管理器的深度集成
 */
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 路由状态接口
 */
export interface RouterState {
    /** 当前路由 */
    currentRoute: RouteLocationNormalized;
    /** 路由历史 */
    history: RouteLocationNormalized[];
    /** 前进历史 */
    forwardHistory: RouteLocationNormalized[];
    /** 导航状态 */
    isNavigating: boolean;
    /** 错误状态 */
    error: Error | null;
    /** 加载状态 */
    isLoading: boolean;
}
/**
 * 路由状态管理器配置
 */
export interface RouterStateConfig {
    /** 是否启用历史记录 */
    enableHistory?: boolean;
    /** 历史记录最大长度 */
    maxHistoryLength?: number;
    /** 是否持久化状态 */
    persistent?: boolean;
    /** 持久化键名 */
    persistentKey?: string;
    /** 是否启用状态同步 */
    enableSync?: boolean;
}
/**
 * 路由状态管理器
 */
export declare class RouterStateManager {
    private stateManager;
    private router;
    private config;
    private unsubscribers;
    constructor(stateManager: any, router: Router, config?: RouterStateConfig);
    /**
     * 初始化状态
     */
    private initializeState;
    /**
     * 设置路由监听器
     */
    private setupRouterListeners;
    /**
     * 设置状态同步
     */
    private setupStateSync;
    /**
     * 更新当前路由
     */
    private updateCurrentRoute;
    /**
     * 添加到历史记录
     */
    private addToHistory;
    /**
     * 设置导航状态
     */
    private setNavigating;
    /**
     * 设置错误状态
     */
    private setError;
    /**
     * 清除错误状态
     */
    private clearError;
    /**
     * 设置加载状态
     */
    setLoading(isLoading: boolean): void;
    /**
     * 持久化状态
     */
    private persistState;
    /**
     * 恢复持久化状态
     */
    private restorePersistedState;
    /**
     * 获取路由状态
     */
    getState(): RouterState;
    /**
     * 获取当前路由
     */
    getCurrentRoute(): RouteLocationNormalized | undefined;
    /**
     * 获取历史记录
     */
    getHistory(): RouteLocationNormalized[];
    /**
     * 获取前进历史
     */
    getForwardHistory(): RouteLocationNormalized[];
    /**
     * 是否可以后退
     */
    canGoBack(): boolean;
    /**
     * 是否可以前进
     */
    canGoForward(): boolean;
    /**
     * 后退
     */
    goBack(): void;
    /**
     * 前进
     */
    goForward(): void;
    /**
     * 清除历史记录
     */
    clearHistory(): void;
    /**
     * 销毁状态管理器
     */
    destroy(): void;
}
/**
 * 创建路由状态管理器
 */
export declare function createRouterStateManager(stateManager: any, router: Router, config?: RouterStateConfig): RouterStateManager;
declare const _default: {
    RouterStateManager: typeof RouterStateManager;
    createRouterStateManager: typeof createRouterStateManager;
};
export default _default;
