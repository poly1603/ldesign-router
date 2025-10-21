/**
 * @ldesign/router 代码质量检查工具
 *
 * 提供运行时代码质量检查和最佳实践建议
 */
import type { RouteLocationNormalized, RouteRecordRaw } from '../types';
/**
 * 代码质量问题类型
 */
export declare enum QualityIssueType {
    PERFORMANCE = "PERFORMANCE",
    SECURITY = "SECURITY",
    ACCESSIBILITY = "ACCESSIBILITY",
    MAINTAINABILITY = "MAINTAINABILITY",
    BEST_PRACTICE = "BEST_PRACTICE"
}
/**
 * 代码质量问题严重程度
 */
export declare enum IssueSeverity {
    ERROR = "ERROR",
    WARNING = "WARNING",
    INFO = "INFO"
}
/**
 * 代码质量问题
 */
export interface QualityIssue {
    id: string;
    type: QualityIssueType;
    severity: IssueSeverity;
    message: string;
    description: string;
    suggestion: string;
    route?: string;
    component?: string;
    line?: number;
    column?: number;
    context?: Record<string, any>;
}
/**
 * 质量检查规则
 */
export interface QualityRule {
    id: string;
    name: string;
    type: QualityIssueType;
    severity: IssueSeverity;
    enabled: boolean;
    check: (context: QualityCheckContext) => QualityIssue[];
}
/**
 * 质量检查上下文
 */
export interface QualityCheckContext {
    routes: RouteRecordRaw[];
    currentRoute?: RouteLocationNormalized;
    router?: any;
    performance?: PerformanceEntry[];
}
/**
 * 代码质量检查器
 */
export declare class CodeQualityChecker {
    private rules;
    private issues;
    constructor();
    /**
     * 设置默认检查规则
     */
    private setupDefaultRules;
    /**
     * 添加检查规则
     */
    addRule(rule: QualityRule): void;
    /**
     * 移除检查规则
     */
    removeRule(ruleId: string): void;
    /**
     * 启用/禁用规则
     */
    toggleRule(ruleId: string, enabled: boolean): void;
    /**
     * 执行质量检查
     */
    check(context: QualityCheckContext): QualityIssue[];
    /**
     * 获取问题统计
     */
    getIssueStats(): {
        total: number;
        byType: Record<QualityIssueType, number>;
        bySeverity: Record<IssueSeverity, number>;
    };
    /**
     * 生成质量报告
     */
    generateReport(): string;
    /**
     * 清空问题列表
     */
    clearIssues(): void;
}
export declare const codeQualityChecker: CodeQualityChecker;
