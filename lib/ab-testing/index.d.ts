/**
 * 路由 A/B 测试功能
 * 支持路由变体、用户分组、数据分析等
 */
import type { RouteLocationRaw, Router } from '../types';
export interface ABTestVariant {
    id: string;
    name: string;
    weight: number;
    route: RouteLocationRaw;
    component?: any;
    props?: Record<string, any>;
    meta?: Record<string, any>;
}
export interface ABTestExperiment {
    id: string;
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status: 'draft' | 'running' | 'paused' | 'completed';
    targetRoute: string;
    variants: ABTestVariant[];
    targeting?: TargetingRule;
    goals?: ExperimentGoal[];
    sampleSize?: number;
}
export interface TargetingRule {
    include?: UserSegment[];
    exclude?: UserSegment[];
    customRules?: Array<(user: any) => boolean>;
}
export interface UserSegment {
    type: 'new' | 'returning' | 'location' | 'device' | 'custom';
    value?: any;
    operator?: 'equals' | 'contains' | 'starts' | 'ends' | 'regex';
}
export interface ExperimentGoal {
    id: string;
    name: string;
    type: 'pageview' | 'click' | 'conversion' | 'custom';
    target?: string;
    value?: number;
}
export interface ABTestResult {
    experimentId: string;
    variantId: string;
    userId: string;
    timestamp: Date;
    goals: GoalResult[];
}
export interface GoalResult {
    goalId: string;
    achieved: boolean;
    value?: number;
    timestamp: Date;
}
export interface VariantStats {
    variantId: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
    avgValue?: number;
    confidence?: number;
}
/**
 * A/B 测试管理器
 */
export declare class ABTestManager {
    private experiments;
    private userVariants;
    private results;
    private router;
    private userId;
    private storage;
    private analytics;
    constructor(options?: {
        userId?: string;
        storage?: Storage;
        analytics?: AnalyticsAdapter;
    });
    /**
     * 初始化路由集成
     */
    initRouter(router: Router): void;
    /**
     * 设置路由集成
     */
    private setupRouterIntegration;
    /**
     * 创建实验
     */
    createExperiment(config: Omit<ABTestExperiment, 'id'>): ABTestExperiment;
    /**
     * 更新实验
     */
    updateExperiment(id: string, updates: Partial<ABTestExperiment>): void;
    /**
     * 删除实验
     */
    deleteExperiment(id: string): void;
    /**
     * 启动实验
     */
    startExperiment(id: string): void;
    /**
     * 停止实验
     */
    stopExperiment(id: string): void;
    /**
     * 设置实验路由
     */
    private setupExperimentRoutes;
    /**
     * 移除实验路由
     */
    private removeExperimentRoutes;
    /**
     * 选择变体
     */
    selectVariant(experiment: ABTestExperiment): ABTestVariant | null;
    /**
     * 分配变体
     */
    private assignVariant;
    /**
     * 检查定位规则
     */
    private matchesTargeting;
    /**
     * 匹配用户分段
     */
    private matchesSegment;
    /**
     * 判断是否新用户
     */
    private isNewUser;
    /**
     * 匹配位置
     */
    private matchesLocation;
    /**
     * 匹配设备
     */
    private matchesDevice;
    /**
     * 匹配自定义分段
     */
    private matchesCustomSegment;
    /**
     * 记录展示
     */
    recordImpression(experimentId: string, variantId: string): void;
    /**
     * 记录转化
     */
    recordConversion(experimentId: string, goalId: string, value?: number): void;
    /**
     * 获取实验统计
     */
    getExperimentStats(experimentId: string): Map<string, VariantStats>;
    /**
     * 计算置信度
     */
    private calculateConfidence;
    /**
     * 获取路由对应的实验
     */
    private getExperimentForRoute;
    /**
     * 生成用户ID
     */
    private generateUserId;
    /**
     * 获取当前用户
     */
    private getCurrentUser;
    /**
     * 获取设备类型
     */
    private getDevice;
    /**
     * 获取用户位置
     */
    private getUserLocation;
    /**
     * 哈希字符串
     */
    private hashString;
    /**
     * 保存实验
     */
    private saveExperiments;
    /**
     * 加载实验
     */
    private loadExperiments;
    /**
     * 保存用户变体
     */
    private saveUserVariants;
    /**
     * 加载用户变体
     */
    private loadUserVariants;
    /**
     * 获取全部实验（只读）
     */
    getExperiments(): ABTestExperiment[];
    /**
     * 导出结果
     */
    exportResults(experimentId?: string): any;
}
/**
 * 分析适配器接口
 */
export interface AnalyticsAdapter {
    track: (event: string, properties?: any) => void;
}
/**
 * Google Analytics 适配器
 */
export declare class GoogleAnalyticsAdapter implements AnalyticsAdapter {
    track(event: string, properties?: any): void;
}
/**
 * Vue 插件
 */
export declare const ABTestPlugin: {
    install(app: any, options?: any): void;
};
/**
 * 组合式 API
 */
export declare function useABTest(): {
    createExperiment: (config: Omit<ABTestExperiment, "id">) => ABTestExperiment;
    updateExperiment: (id: string, updates: Partial<ABTestExperiment>) => void;
    deleteExperiment: (id: string) => void;
    startExperiment: (id: string) => void;
    stopExperiment: (id: string) => void;
    recordConversion: (experimentId: string, goalId: string, value?: number) => void;
    getExperimentStats: (experimentId: string) => Map<string, VariantStats>;
    exportResults: (experimentId?: string) => any;
    currentExperiments: import("vue").ComputedRef<ABTestExperiment[]>;
};
declare global {
    function gtag(...args: any[]): void;
}
