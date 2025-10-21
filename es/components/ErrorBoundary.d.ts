/**
 * 路由错误边界组件
 * 捕获路由渲染过程中的错误并提供友好的错误界面
 */
import { type Component, type PropType } from 'vue';
/**
 * 错误信息类型
 */
export interface RouteErrorInfo {
    /** 错误对象 */
    error: Error;
    /** 错误发生的路由路径 */
    route: string;
    /** 错误发生的时间戳 */
    timestamp: number;
    /** 错误组件信息 */
    component?: string;
    /** 错误类型 */
    type: 'render' | 'async' | 'navigation' | 'unknown';
    /** 堆栈信息 */
    stack?: string;
}
/**
 * 错误边界组件属性
 */
export interface ErrorBoundaryProps {
    /** 自定义错误组件 */
    fallback?: Component;
    /** 错误处理函数 */
    onError?: (error: RouteErrorInfo) => void;
    /** 是否在开发环境显示详细错误 */
    showDetails?: boolean;
    /** 重试延迟（毫秒） */
    retryDelay?: number;
    /** 最大重试次数 */
    maxRetries?: number;
    /** 是否自动重试 */
    autoRetry?: boolean;
    /** 错误消息映射 */
    errorMessages?: Record<string, string>;
    /** 是否记录错误日志 */
    logErrors?: boolean;
}
/**
 * 错误边界组件
 */
export declare const ErrorBoundary: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    fallback: {
        type: PropType<Component>;
        default: () => import("vue").DefineComponent<import("vue").ExtractPropTypes<{
            error: {
                type: PropType<RouteErrorInfo>;
                required: true;
            };
            onRetry: {
                type: PropType<() => void>;
                required: true;
            };
            showDetails: {
                type: BooleanConstructor;
                default: boolean;
            };
        }>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
            [key: string]: any;
        }>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
            error: {
                type: PropType<RouteErrorInfo>;
                required: true;
            };
            onRetry: {
                type: PropType<() => void>;
                required: true;
            };
            showDetails: {
                type: BooleanConstructor;
                default: boolean;
            };
        }>> & Readonly<{}>, {
            showDetails: boolean;
        }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    };
    onError: {
        type: PropType<(error: RouteErrorInfo) => void>;
    };
    showDetails: {
        type: BooleanConstructor;
        default: any;
    };
    retryDelay: {
        type: NumberConstructor;
        default: number;
    };
    maxRetries: {
        type: NumberConstructor;
        default: number;
    };
    autoRetry: {
        type: BooleanConstructor;
        default: boolean;
    };
    errorMessages: {
        type: PropType<Record<string, string>>;
        default: () => {};
    };
    logErrors: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    fallback: {
        type: PropType<Component>;
        default: () => import("vue").DefineComponent<import("vue").ExtractPropTypes<{
            error: {
                type: PropType<RouteErrorInfo>;
                required: true;
            };
            onRetry: {
                type: PropType<() => void>;
                required: true;
            };
            showDetails: {
                type: BooleanConstructor;
                default: boolean;
            };
        }>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
            [key: string]: any;
        }>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
            error: {
                type: PropType<RouteErrorInfo>;
                required: true;
            };
            onRetry: {
                type: PropType<() => void>;
                required: true;
            };
            showDetails: {
                type: BooleanConstructor;
                default: boolean;
            };
        }>> & Readonly<{}>, {
            showDetails: boolean;
        }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    };
    onError: {
        type: PropType<(error: RouteErrorInfo) => void>;
    };
    showDetails: {
        type: BooleanConstructor;
        default: any;
    };
    retryDelay: {
        type: NumberConstructor;
        default: number;
    };
    maxRetries: {
        type: NumberConstructor;
        default: number;
    };
    autoRetry: {
        type: BooleanConstructor;
        default: boolean;
    };
    errorMessages: {
        type: PropType<Record<string, string>>;
        default: () => {};
    };
    logErrors: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    showDetails: boolean;
    fallback: Component;
    retryDelay: number;
    maxRetries: number;
    autoRetry: boolean;
    errorMessages: Record<string, string>;
    logErrors: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 全局错误处理器
 */
export declare class RouteErrorHandler {
    private static instance;
    private errors;
    private maxErrors;
    private listeners;
    private constructor();
    static getInstance(): RouteErrorHandler;
    /**
     * 设置全局错误处理器
     */
    private setupGlobalHandlers;
    /**
     * 处理错误
     */
    handleError(error: RouteErrorInfo): void;
    /**
     * 添加错误监听器
     */
    onError(listener: (error: RouteErrorInfo) => void): () => void;
    /**
     * 获取所有错误
     */
    getErrors(): RouteErrorInfo[];
    /**
     * 获取最近的错误
     */
    getRecentErrors(count?: number): RouteErrorInfo[];
    /**
     * 清除所有错误
     */
    clearErrors(): void;
    /**
     * 获取错误统计
     */
    getErrorStats(): {
        total: number;
        byType: Record<string, number>;
        byRoute: Record<string, number>;
    };
}
/**
 * 创建错误边界包装器
 * @param component 要包装的组件
 * @param options 错误边界选项
 */
export declare function withErrorBoundary(component: Component, options?: Partial<ErrorBoundaryProps>): Component;
/**
 * 错误恢复策略
 */
export declare const ErrorRecoveryStrategies: {
    /**
     * 重新加载页面
     */
    reload: () => void;
    /**
     * 导航到首页
     */
    goHome: (router: any) => void;
    /**
     * 返回上一页
     */
    goBack: (router: any) => void;
    /**
     * 清除缓存并重试
     */
    clearCacheAndRetry: () => void;
};
export default ErrorBoundary;
