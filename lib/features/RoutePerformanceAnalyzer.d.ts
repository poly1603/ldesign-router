/**
 * @ldesign/router 路由性能分析器
 *
 * 提供详细的路由性能分析、诊断和优化建议
 */
import type { Router } from '../types';
/**
 * 性能指标
 */
export interface PerformanceMetric {
    /** 路由路径 */
    path: string;
    /** 路由名称 */
    name?: string;
    /** 导航开始时间 */
    startTime: number;
    /** 导航结束时间 */
    endTime?: number;
    /** 总耗时 */
    duration?: number;
    /** 守卫执行时间 */
    guardTime?: number;
    /** 组件加载时间 */
    componentLoadTime?: number;
    /** 渲染时间 */
    renderTime?: number;
    /** 内存使用 */
    memoryUsage?: number;
    /** 是否是懒加载 */
    isLazyLoaded?: boolean;
    /** 是否命中缓存 */
    isCached?: boolean;
    /** 错误信息 */
    error?: Error;
    /** 性能评分 */
    score?: number;
}
/**
 * 性能分析报告
 */
export interface PerformanceReport {
    /** 总体评分 */
    overallScore: number;
    /** 总导航次数 */
    totalNavigations: number;
    /** 平均导航时间 */
    averageNavigationTime: number;
    /** 最慢的路由 */
    slowestRoutes: PerformanceMetric[];
    /** 最快的路由 */
    fastestRoutes: PerformanceMetric[];
    /** 错误路由 */
    errorRoutes: PerformanceMetric[];
    /** 性能趋势 */
    performanceTrend: 'improving' | 'stable' | 'degrading';
    /** 优化建议 */
    suggestions: OptimizationSuggestion[];
    /** 详细指标 */
    detailedMetrics: {
        p50: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
    };
}
/**
 * 优化建议
 */
export interface OptimizationSuggestion {
    /** 优先级 */
    priority: 'high' | 'medium' | 'low';
    /** 类型 */
    type: 'lazy-loading' | 'caching' | 'code-splitting' | 'guard-optimization' | 'memory' | 'other';
    /** 受影响的路由 */
    affectedRoutes: string[];
    /** 建议描述 */
    description: string;
    /** 预期改进 */
    expectedImprovement: string;
    /** 实施步骤 */
    implementationSteps?: string[];
}
/**
 * 分析器配置
 */
export interface AnalyzerConfig {
    /** 是否启用 */
    enabled?: boolean;
    /** 采样率 (0-1) */
    sampleRate?: number;
    /** 最大记录数 */
    maxRecords?: number;
    /** 性能阈值 */
    thresholds?: {
        good?: number;
        acceptable?: number;
        poor?: number;
    };
    /** 是否记录详细信息 */
    detailed?: boolean;
    /** 是否自动分析 */
    autoAnalyze?: boolean;
    /** 分析间隔 */
    analyzeInterval?: number;
}
/**
 * 路由性能分析器
 */
export declare class RoutePerformanceAnalyzer {
    private router;
    private config;
    private metrics;
    private currentNavigation;
    private analyzeTimer?;
    private navigationCount;
    state: {
        isRecording: boolean;
        totalRecords: number;
        currentReport: {
            overallScore: number;
            totalNavigations: number;
            averageNavigationTime: number;
            slowestRoutes: {
                path: string;
                name?: string
                /** 导航开始时间 */
                 | undefined;
                startTime: number;
                endTime?: number
                /** 总耗时 */
                 | undefined;
                duration?: number
                /** 守卫执行时间 */
                 | undefined;
                guardTime?: number
                /** 组件加载时间 */
                 | undefined;
                componentLoadTime?: number
                /** 渲染时间 */
                 | undefined;
                renderTime?: number
                /** 内存使用 */
                 | undefined;
                memoryUsage?: number
                /** 是否是懒加载 */
                 | undefined;
                isLazyLoaded?: boolean
                /** 是否命中缓存 */
                 | undefined;
                isCached?: boolean
                /** 错误信息 */
                 | undefined;
                error?: Error
                /** 性能评分 */
                 | undefined;
                score?: number | undefined;
            }[];
            fastestRoutes: {
                path: string;
                name?: string
                /** 导航开始时间 */
                 | undefined;
                startTime: number;
                endTime?: number
                /** 总耗时 */
                 | undefined;
                duration?: number
                /** 守卫执行时间 */
                 | undefined;
                guardTime?: number
                /** 组件加载时间 */
                 | undefined;
                componentLoadTime?: number
                /** 渲染时间 */
                 | undefined;
                renderTime?: number
                /** 内存使用 */
                 | undefined;
                memoryUsage?: number
                /** 是否是懒加载 */
                 | undefined;
                isLazyLoaded?: boolean
                /** 是否命中缓存 */
                 | undefined;
                isCached?: boolean
                /** 错误信息 */
                 | undefined;
                error?: Error
                /** 性能评分 */
                 | undefined;
                score?: number | undefined;
            }[];
            errorRoutes: {
                path: string;
                name?: string
                /** 导航开始时间 */
                 | undefined;
                startTime: number;
                endTime?: number
                /** 总耗时 */
                 | undefined;
                duration?: number
                /** 守卫执行时间 */
                 | undefined;
                guardTime?: number
                /** 组件加载时间 */
                 | undefined;
                componentLoadTime?: number
                /** 渲染时间 */
                 | undefined;
                renderTime?: number
                /** 内存使用 */
                 | undefined;
                memoryUsage?: number
                /** 是否是懒加载 */
                 | undefined;
                isLazyLoaded?: boolean
                /** 是否命中缓存 */
                 | undefined;
                isCached?: boolean
                /** 错误信息 */
                 | undefined;
                error?: Error
                /** 性能评分 */
                 | undefined;
                score?: number | undefined;
            }[];
            performanceTrend: "improving" | "stable" | "degrading";
            suggestions: {
                priority: "high" | "medium" | "low";
                type: "lazy-loading" | "caching" | "code-splitting" | "guard-optimization" | "memory" | "other";
                affectedRoutes: string[];
                description: string;
                expectedImprovement: string;
                implementationSteps?: string[] | undefined;
            }[];
            detailedMetrics: {
                p50: number;
                p75: number;
                p90: number;
                p95: number;
                p99: number;
            };
        } | null;
        realTimeMetrics: {
            lastNavigationTime: number;
            averageTime: number;
            memoryUsage: number;
        };
    };
    constructor(router: Router, config?: AnalyzerConfig);
    /**
     * 初始化分析器
     */
    private initialize;
    /**
     * 设置导航跟踪
     */
    private setupNavigationTracking;
    /**
     * 判断是否应该记录
     */
    private shouldRecord;
    /**
     * 开始导航记录
     */
    private startNavigation;
    /**
     * 结束导航记录
     */
    private endNavigation;
    /**
     * 计算性能评分
     */
    private calculateScore;
    /**
     * 获取内存使用量
     */
    private getMemoryUsage;
    /**
     * 更新实时指标
     */
    private updateRealTimeMetrics;
    /**
     * 清理旧记录
     */
    private cleanOldRecords;
    /**
     * 生成性能报告
     */
    generateReport(): PerformanceReport;
    /**
     * 计算百分位数
     */
    private percentile;
    /**
     * 计算性能趋势
     */
    private calculateTrend;
    /**
     * 生成优化建议
     */
    private generateSuggestions;
    /**
     * 计算总体评分
     */
    private calculateOverallScore;
    /**
     * 创建空报告
     */
    private createEmptyReport;
    /**
     * 开始自动分析
     */
    private startAutoAnalyze;
    /**
     * 停止自动分析
     */
    private stopAutoAnalyze;
    /**
     * 开始记录
     */
    startRecording(): void;
    /**
     * 停止记录
     */
    stopRecording(): void;
    /**
     * 清除数据
     */
    clearData(): void;
    /**
     * 导出数据
     */
    exportData(): string;
    /**
     * 导入数据
     */
    importData(jsonData: string): boolean;
    /**
     * 获取路由性能历史
     */
    getRouteHistory(path: string): PerformanceMetric[];
    /**
     * 获取实时指标
     */
    getRealTimeMetrics(): {
        lastNavigationTime: number;
        averageTime: number;
        memoryUsage: number;
    };
    /**
     * 销毁分析器
     */
    destroy(): void;
}
/**
 * 设置性能分析器
 */
export declare function setupPerformanceAnalyzer(router: Router, config?: AnalyzerConfig): RoutePerformanceAnalyzer;
/**
 * 获取性能分析器实例
 */
export declare function getPerformanceAnalyzer(): RoutePerformanceAnalyzer | null;
/**
 * 生成性能报告
 */
export declare function generatePerformanceReport(): PerformanceReport | null;
/**
 * 获取性能建议
 */
export declare function getPerformanceSuggestions(): OptimizationSuggestion[];
