/**
 * @ldesign/router 开发工具增强
 *
 * 提供更强大的开发调试和分析工具
 */
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 开发工具配置
 */
export interface DevToolsConfig {
    /** 是否启用开发工具 */
    enabled: boolean;
    /** 热键配置 */
    hotkeys: {
        toggle: string;
        inspect: string;
        performance: string;
        quality: string;
    };
    /** 面板配置 */
    panel: {
        position: 'top' | 'bottom' | 'left' | 'right';
        size: number;
        theme: 'light' | 'dark' | 'auto';
    };
    /** 功能开关 */
    features: {
        routeInspector: boolean;
        performanceMonitor: boolean;
        qualityChecker: boolean;
        networkTracker: boolean;
        stateViewer: boolean;
    };
}
/**
 * 路由检查器
 */
export declare class RouteInspector {
    private router;
    private highlightedElement;
    constructor(router: Router);
    /**
     * 检查当前路由
     */
    inspectCurrentRoute(): RouteInspectionResult;
    /**
     * 检查指定路由
     */
    inspectRoute(route: RouteLocationNormalized): RouteInspectionResult;
    /**
     * 分析路由性能
     */
    private analyzeRoutePerformance;
    /**
     * 检查无障碍访问
     */
    private checkAccessibility;
    /**
     * 检查SEO
     */
    private checkSEO;
    /**
     * 检查安全性
     */
    private checkSecurity;
    /**
     * 高亮路由元素
     */
    highlightRouteElement(selector: string): void;
    /**
     * 清除高亮
     */
    clearHighlight(): void;
}
/**
 * 路由检查结果
 */
export interface RouteInspectionResult {
    route: {
        path: string;
        name?: string;
        params: Record<string, any>;
        query: Record<string, any>;
        meta: Record<string, any>;
        matched: Array<{
            path: string;
            name?: string;
            component: string;
        }>;
    };
    performance: {
        loadTime: number;
        cacheHit: boolean;
        componentSize: string;
        recommendations: string[];
    };
    accessibility: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
    seo: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
    security: {
        score: number;
        issues: string[];
        suggestions: string[];
    };
}
/**
 * 开发工具面板
 */
export declare class DevToolsPanel {
    private container;
    private isVisible;
    private config;
    private inspector;
    constructor(router: Router, config?: Partial<DevToolsConfig>);
    /**
     * 初始化开发工具
     */
    private init;
    /**
     * 设置热键
     */
    private setupHotkeys;
    /**
     * 匹配热键
     */
    private matchHotkey;
    /**
     * 创建面板
     */
    private createPanel;
    /**
     * 切换面板显示
     */
    toggle(): void;
    /**
     * 显示面板
     */
    show(): void;
    /**
     * 隐藏面板
     */
    hide(): void;
    /**
     * 显示路由检查器
     */
    showInspector(): void;
    /**
     * 显示性能监控
     */
    showPerformance(): void;
    /**
     * 显示质量检查
     */
    showQuality(): void;
    /**
     * 获取所有路由
     */
    private getAllRoutes;
    /**
     * 渲染面板内容
     */
    private render;
    /**
     * 渲染检查器结果
     */
    private renderInspector;
    /**
     * 渲染性能数据
     */
    private renderPerformance;
    /**
     * 渲染质量检查结果
     */
    private renderQuality;
    /**
     * 销毁开发工具
     */
    destroy(): void;
}
export declare function createDevTools(router: Router, config?: Partial<DevToolsConfig>): DevToolsPanel;
