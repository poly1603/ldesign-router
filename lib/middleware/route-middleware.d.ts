/**
 * @ldesign/router 路由中间件系统
 *
 * 提供类似 Koa 的洋葱模型中间件机制
 */
import type { RouteLocationNormalized } from '../types';
/**
 * 路由上下文
 * 包含当前导航的所有信息和状态
 */
export interface RouteContext {
    /** 目标路由 */
    to: RouteLocationNormalized;
    /** 来源路由 */
    from: RouteLocationNormalized;
    /** 导航状态数据 */
    state: Record<string, any>;
    /** 是否已中止 */
    aborted: boolean;
    /** 重定向目标 */
    redirectTo?: string | RouteLocationNormalized;
    /** 错误信息 */
    error?: Error;
    /** 开始时间 */
    startTime: number;
    /** 元数据 */
    meta: Record<string, any>;
}
/**
 * 中间件函数类型
 * @param context - 路由上下文
 * @param next - 下一个中间件
 */
export type RouteMiddleware = (context: RouteContext, next: () => Promise<void>) => Promise<void> | void;
/**
 * 中间件配置
 */
export interface MiddlewareConfig {
    /** 中间件名称 */
    name?: string;
    /** 是否启用 */
    enabled?: boolean;
    /** 优先级（数字越大优先级越高） */
    priority?: number;
    /** 应用条件 */
    condition?: (context: RouteContext) => boolean;
}
/**
 * 中间件包装器
 */
export interface MiddlewareWrapper {
    /** 中间件函数 */
    middleware: RouteMiddleware;
    /** 配置 */
    config: Required<MiddlewareConfig>;
}
/**
 * 中间件组合器
 * 实现洋葱模型的中间件执行机制
 */
export declare class MiddlewareComposer {
    private middlewares;
    private executionCount;
    private errorHandlers;
    /**
     * 注册中间件
     */
    use(middleware: RouteMiddleware, config?: MiddlewareConfig): this;
    /**
     * 批量注册中间件
     */
    useMultiple(middlewares: Array<RouteMiddleware | [RouteMiddleware, MiddlewareConfig]>): this;
    /**
     * 执行中间件链
     */
    execute(context: RouteContext): Promise<void>;
    /**
     * 注册错误处理器
     */
    onError(handler: (error: Error, context: RouteContext) => void): this;
    /**
     * 处理错误
     */
    private handleError;
    /**
     * 移除中间件
     */
    remove(name: string): boolean;
    /**
     * 清空所有中间件
     */
    clear(): void;
    /**
     * 获取中间件列表
     */
    getMiddlewares(): MiddlewareWrapper[];
    /**
     * 获取统计信息
     */
    getStats(): {
        totalMiddlewares: number;
        activeMiddlewares: number;
        executionCount: number;
    };
}
/**
 * 日志中间件
 */
export declare function createLoggerMiddleware(options?: {
    /** 是否记录详细信息 */
    verbose?: boolean;
    /** 自定义日志函数 */
    logger?: (message: string, data?: any) => void;
}): RouteMiddleware;
/**
 * 性能监控中间件
 */
export declare function createPerformanceMiddleware(options?: {
    /** 慢导航阈值（毫秒） */
    threshold?: number;
    /** 慢导航回调 */
    onSlow?: (duration: number, context: RouteContext) => void;
}): RouteMiddleware;
/**
 * 认证中间件
 */
export declare function createAuthMiddleware(options: {
    /** 检查认证状态 */
    checkAuth: () => boolean | Promise<boolean>;
    /** 未认证时的重定向路径 */
    redirectTo?: string;
    /** 需要认证的路由判断 */
    requiresAuth?: (context: RouteContext) => boolean;
}): RouteMiddleware;
/**
 * 权限检查中间件
 */
export declare function createPermissionMiddleware(options: {
    /** 检查权限 */
    checkPermission: (permissions: string[]) => boolean | Promise<boolean>;
    /** 权限不足时的重定向路径 */
    redirectTo?: string;
    /** 获取所需权限 */
    getRequiredPermissions?: (context: RouteContext) => string[];
}): RouteMiddleware;
/**
 * 页面标题中间件
 */
export declare function createTitleMiddleware(options?: {
    /** 默认标题 */
    defaultTitle?: string;
    /** 标题后缀 */
    suffix?: string;
    /** 标题前缀 */
    prefix?: string;
}): RouteMiddleware;
/**
 * 进度条中间件
 */
export declare function createProgressMiddleware(options?: {
    /** 进度条颜色 */
    color?: string;
    /** 进度条高度 */
    height?: string;
    /** 显示延迟（毫秒） */
    showDelay?: number;
}): RouteMiddleware;
/**
 * 滚动行为中间件
 */
export declare function createScrollMiddleware(options?: {
    /** 滚动行为 */
    behavior?: 'auto' | 'smooth';
    /** 滚动位置 */
    position?: 'top' | 'saved' | {
        x: number;
        y: number;
    };
}): RouteMiddleware;
/**
 * 创建中间件组合器实例
 */
export declare function createMiddlewareComposer(): MiddlewareComposer;
/**
 * 创建路由上下文
 */
export declare function createRouteContext(to: RouteLocationNormalized, from: RouteLocationNormalized): RouteContext;
export { MiddlewareComposer as default, };
