/**
 * @ldesign/router 路由分析工具
 *
 * 提供路由使用分析、性能监控和用户行为追踪
 */
import type { Router } from '../types';
/**
 * 路由访问记录
 */
export interface RouteVisit {
    path: string;
    name?: string;
    timestamp: number;
    duration?: number;
    referrer?: string;
    userAgent: string;
    sessionId: string;
    userId?: string;
    metadata?: Record<string, any>;
}
/**
 * 性能指标
 */
export interface PerformanceMetrics {
    navigationStart: number;
    routeResolved: number;
    componentLoaded: number;
    renderComplete: number;
    totalTime: number;
    ttfb?: number;
    fcp?: number;
    lcp?: number;
}
/**
 * 用户行为事件
 */
export interface UserBehaviorEvent {
    type: 'click' | 'scroll' | 'hover' | 'focus' | 'custom';
    target: string;
    route: string;
    timestamp: number;
    data?: Record<string, any>;
}
/**
 * 分析配置
 */
export interface AnalyticsConfig {
    /** 是否启用分析 */
    enabled: boolean;
    /** 采样率 (0-1) */
    sampleRate: number;
    /** 是否收集性能数据 */
    collectPerformance: boolean;
    /** 是否收集用户行为 */
    collectBehavior: boolean;
    /** 数据上报端点 */
    endpoint?: string;
    /** 批量上报大小 */
    batchSize: number;
    /** 上报间隔 (ms) */
    reportInterval: number;
    /** 本地存储键名 */
    storageKey: string;
}
/**
 * 路由分析器
 */
export declare class RouteAnalytics {
    private router;
    private config;
    private visits;
    private performanceData;
    private behaviorEvents;
    private sessionId;
    private currentVisit?;
    private reportTimer?;
    constructor(router: Router, config?: Partial<AnalyticsConfig>);
    /**
     * 初始化分析器
     */
    private init;
    /**
     * 设置路由追踪
     */
    private setupRouteTracking;
    /**
     * 设置性能追踪
     */
    private setupPerformanceTracking;
    /**
     * 设置用户行为追踪
     */
    private setupBehaviorTracking;
    /**
     * 记录用户行为事件
     */
    recordBehaviorEvent(event: UserBehaviorEvent): void;
    /**
     * 获取元素选择器
     */
    private getElementSelector;
    /**
     * 生成会话ID
     */
    private generateSessionId;
    /**
     * 判断是否应该采样
     */
    private shouldSample;
    /**
     * 开始定期上报
     */
    private startReporting;
    /**
     * 上报数据
     */
    report(): Promise<void>;
    /**
     * 存储数据到本地
     */
    private storeData;
    /**
     * 加载存储的数据
     */
    private loadStoredData;
    /**
     * 获取分析报告
     */
    getReport(): {
        sessionId: string;
        totalVisits: number;
        uniqueRoutes: number;
        routeStats: {
            [k: string]: {
                count: number;
                totalTime: number;
                avgTime: number;
            };
        };
        performanceStats: {
            averageNavigationTime: number;
            slowestRoute: string;
            fastestRoute: string;
            totalNavigations: number;
        };
        behaviorEvents: number;
        topRoutes: {
            count: number;
            totalTime: number;
            avgTime: number;
            path: string;
        }[];
    };
    /**
     * 清空数据
     */
    clear(): void;
    /**
     * 销毁分析器
     */
    destroy(): void;
}
/**
 * 创建路由分析器
 */
export declare function createRouteAnalytics(router: Router, config?: Partial<AnalyticsConfig>): RouteAnalytics;
