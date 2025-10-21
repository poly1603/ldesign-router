/**
 * @ldesign/router 中间件系统
 *
 * 提供灵活的路由中间件机制，支持认证、权限、日志等功能
 */
import type { NavigationGuardNext, RouteLocationNormalized } from '../types';
/**
 * 中间件函数类型
 */
export type MiddlewareFunction = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext, context: MiddlewareContext) => void | Promise<void>;
/**
 * 中间件上下文
 */
export interface MiddlewareContext {
    /** 用户信息 */
    user?: any;
    /** 权限列表 */
    permissions?: string[];
    /** 自定义数据 */
    data: Record<string, any>;
    /** 中间件链中的位置 */
    index: number;
    /** 总中间件数量 */
    total: number;
}
/**
 * 中间件配置
 */
export interface MiddlewareConfig {
    /** 中间件名称 */
    name: string;
    /** 中间件函数 */
    handler: MiddlewareFunction;
    /** 优先级（数字越小优先级越高） */
    priority?: number;
    /** 是否启用 */
    enabled?: boolean;
    /** 应用条件 */
    condition?: (route: RouteLocationNormalized) => boolean;
}
/**
 * 路由中间件管理器
 */
export declare class MiddlewareManager {
    private middlewares;
    private sortedMiddlewares;
    /**
     * 注册中间件
     */
    register(config: MiddlewareConfig): void;
    /**
     * 注册多个中间件
     */
    registerMultiple(configs: MiddlewareConfig[]): void;
    /**
     * 移除中间件
     */
    unregister(name: string): void;
    /**
     * 启用/禁用中间件
     */
    toggle(name: string, enabled: boolean): void;
    /**
     * 更新排序后的中间件列表
     */
    private updateSortedMiddlewares;
    /**
     * 执行中间件链
     */
    execute(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise<void>;
    /**
     * 获取所有中间件
     */
    getAll(): MiddlewareConfig[];
    /**
     * 获取启用的中间件
     */
    getEnabled(): MiddlewareConfig[];
    /**
     * 清空所有中间件
     */
    clear(): void;
}
/**
 * 认证中间件
 */
export declare const authMiddleware: MiddlewareConfig;
/**
 * 权限中间件
 */
export declare const permissionMiddleware: MiddlewareConfig;
/**
 * 角色中间件
 */
export declare const roleMiddleware: MiddlewareConfig;
/**
 * 日志中间件
 */
export declare const loggingMiddleware: MiddlewareConfig;
/**
 * 页面标题中间件
 */
export declare const titleMiddleware: MiddlewareConfig;
/**
 * 进度条中间件
 */
export declare const progressMiddleware: MiddlewareConfig;
/**
 * 创建缓存中间件
 */
export declare function createCacheMiddleware(options: {
    maxAge?: number;
    exclude?: string[];
}): MiddlewareConfig;
/**
 * 创建限流中间件
 */
export declare function createRateLimitMiddleware(options: {
    maxRequests: number;
    windowMs: number;
}): MiddlewareConfig;
export declare const middlewareManager: MiddlewareManager;
export { createAuthMiddleware as createAuthMiddlewareV2, createLoggerMiddleware, createMiddlewareComposer, createPerformanceMiddleware, createPermissionMiddleware, createProgressMiddleware as createProgressMiddlewareV2, createRouteContext, createScrollMiddleware, createTitleMiddleware as createTitleMiddlewareV2, MiddlewareComposer, } from './route-middleware';
export type { MiddlewareConfig as MiddlewareConfigV2, MiddlewareWrapper, RouteContext, RouteMiddleware, } from './route-middleware';
