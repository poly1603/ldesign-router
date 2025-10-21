/**
 * @ldesign/router 性能监控插件
 *
 * 提供路由导航和组件加载的性能监控功能
 */
import type { App } from 'vue';
import type { PerformanceConfig, PerformanceMetrics } from '../components/types';
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 性能事件类型
 */
export declare enum PerformanceEventType {
    NAVIGATION_START = "navigation-start",
    NAVIGATION_END = "navigation-end",
    COMPONENT_LOAD_START = "component-load-start",
    COMPONENT_LOAD_END = "component-load-end",
    ROUTE_MATCH_START = "route-match-start",
    ROUTE_MATCH_END = "route-match-end",
    GUARD_EXECUTION_START = "guard-execution-start",
    GUARD_EXECUTION_END = "guard-execution-end"
}
/**
 * 性能事件
 */
interface PerformanceEvent {
    type: PerformanceEventType;
    timestamp: number;
    route?: RouteLocationNormalized;
    data?: any;
}
/**
 * 导航性能数据
 */
interface NavigationPerformance {
    id: string;
    from: RouteLocationNormalized;
    to: RouteLocationNormalized;
    startTime: number;
    endTime?: number;
    events: PerformanceEvent[];
    metrics?: PerformanceMetrics;
}
/**
 * 性能监控管理器
 */
export declare class PerformanceManager {
    private config;
    private navigations;
    private currentNavigation?;
    private eventListeners;
    constructor(config: PerformanceConfig);
    /**
     * 开始导航监控
     */
    startNavigation(from: RouteLocationNormalized, to: RouteLocationNormalized): string;
    /**
     * 结束导航监控
     */
    endNavigation(id: string): PerformanceMetrics | null;
    /**
     * 记录事件
     */
    recordEvent(type: PerformanceEventType, data?: any): void;
    /**
     * 添加事件监听器
     */
    addEventListener(type: PerformanceEventType, listener: (event: PerformanceEvent) => void): () => void;
    /**
     * 获取导航历史
     */
    getNavigationHistory(): NavigationPerformance[];
    /**
     * 获取性能统计
     */
    getStats(): {
        totalNavigations: number;
        averageTime: number;
        slowNavigations: number;
        fastNavigations: number;
    };
    /**
     * 清理历史数据
     */
    clear(): void;
    /**
     * 生成导航ID
     */
    private generateNavigationId;
    /**
     * 计算性能指标
     */
    private calculateMetrics;
    /**
     * 检查性能阈值
     */
    private checkThresholds;
    /**
     * 发射事件
     */
    private emitEvent;
}
/**
 * 性能监控装饰器
 */
export declare function withPerformanceMonitoring<T extends (...args: any[]) => any>(fn: T, name: string, manager: PerformanceManager): T;
/**
 * 性能监控插件选项
 */
export interface PerformancePluginOptions extends Partial<PerformanceConfig> {
    /** 是否启用自动监控 */
    autoMonitor?: boolean;
    /** 是否启用控制台输出 */
    consoleOutput?: boolean;
}
/**
 * 创建性能监控插件
 */
export declare function createPerformancePlugin(options?: PerformancePluginOptions): {
    install(): void;
    manager: null;
} | {
    install(app: App, router: Router): void;
    manager: PerformanceManager;
};
/**
 * 创建性能配置
 */
export declare function createPerformanceConfig(config: Partial<PerformanceConfig>): PerformanceConfig;
/**
 * 检查性能API支持
 */
export declare function supportsPerformanceAPI(): boolean;
/**
 * 获取页面性能信息
 */
export declare function getPagePerformance(): {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
} | null;
declare const _default: {
    createPerformancePlugin: typeof createPerformancePlugin;
    PerformanceManager: typeof PerformanceManager;
    PerformanceEventType: typeof PerformanceEventType;
    withPerformanceMonitoring: typeof withPerformanceMonitoring;
    createPerformanceConfig: typeof createPerformanceConfig;
    supportsPerformanceAPI: typeof supportsPerformanceAPI;
    getPagePerformance: typeof getPagePerformance;
};
export default _default;
