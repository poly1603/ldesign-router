/**
 * 统一的错误管理系统
 *
 * 提供集中化的错误处理、追踪和恢复机制
 */
export declare enum ErrorType {
    NAVIGATION = "NAVIGATION",
    GUARD = "GUARD",
    MIDDLEWARE = "MIDDLEWARE",
    COMPONENT = "COMPONENT",
    NETWORK = "NETWORK",
    PERMISSION = "PERMISSION",
    VALIDATION = "VALIDATION",
    STATE = "STATE",
    MEMORY = "MEMORY",
    PERFORMANCE = "PERFORMANCE",
    UNKNOWN = "UNKNOWN"
}
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface ErrorDetails {
    type: ErrorType;
    severity: ErrorSeverity;
    message: string;
    code?: string;
    stack?: string;
    context?: Record<string, any>;
    timestamp: number;
    userAgent?: string;
    url?: string;
    recoverable?: boolean;
    retryable?: boolean;
    retryCount?: number;
    maxRetries?: number;
}
export interface ErrorRecoveryStrategy {
    shouldRecover: (error: ErrorDetails) => boolean;
    recover: (error: ErrorDetails) => Promise<void> | void;
    fallback?: () => void;
}
export type ErrorListener = (error: ErrorDetails) => void;
export interface ErrorManagerConfig {
    maxErrorHistory: number;
    enableAutoRecovery: boolean;
    enableErrorReporting: boolean;
    reportingEndpoint?: string;
    recoveryStrategies?: Map<ErrorType, ErrorRecoveryStrategy>;
    globalFallback?: () => void;
}
/**
 * 错误管理器类
 */
export declare class ErrorManager {
    private static instance;
    private config;
    private errorHistory;
    private listeners;
    private recoveryStrategies;
    private isRecovering;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(config?: Partial<ErrorManagerConfig>): ErrorManager;
    /**
     * 设置全局错误处理器
     */
    private setupGlobalErrorHandlers;
    /**
     * 获取默认恢复策略
     */
    private getDefaultRecoveryStrategies;
    /**
     * 处理错误
     */
    handleError(errorData: Partial<ErrorDetails> & {
        type: ErrorType;
        message: string;
    }): void;
    /**
     * 记录错误日志
     */
    private logError;
    /**
     * 添加到错误历史
     */
    private addToHistory;
    /**
     * 通知错误监听器
     */
    private notifyListeners;
    /**
     * 尝试错误恢复
     */
    private attemptRecovery;
    /**
     * 上报错误到服务器
     */
    private reportError;
    /**
     * 添加错误监听器
     */
    addListener(listener: ErrorListener): () => void;
    /**
     * 移除错误监听器
     */
    removeListener(listener: ErrorListener): void;
    /**
     * 注册恢复策略
     */
    registerRecoveryStrategy(type: ErrorType, strategy: ErrorRecoveryStrategy): void;
    /**
     * 获取错误历史
     */
    getErrorHistory(filter?: {
        type?: ErrorType;
        severity?: ErrorSeverity;
    }): ErrorDetails[];
    /**
     * 清除错误历史
     */
    clearHistory(): void;
    /**
     * 获取错误统计
     */
    getStatistics(): {
        total: number;
        byType: Record<ErrorType, number>;
        bySeverity: Record<ErrorSeverity, number>;
        recentErrors: ErrorDetails[];
    };
    /**
     * 创建自定义错误
     */
    static createError(type: ErrorType, message: string, options?: Partial<ErrorDetails>): Error;
    /**
     * 包装函数以捕获错误
     */
    static wrapFunction<T extends (...args: any[]) => any>(fn: T, errorType?: ErrorType): T;
    /**
     * 装饰器：错误处理
     */
    static errorHandler(errorType?: ErrorType): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
export declare const errorManager: ErrorManager;
export declare const handleError: (errorData: Partial<ErrorDetails> & {
    type: ErrorType;
    message: string;
}) => void;
export declare const addErrorListener: (listener: ErrorListener) => () => void;
export declare const getErrorHistory: (filter?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
}) => ErrorDetails[];
export declare const getErrorStatistics: () => {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorDetails[];
};
export default errorManager;
