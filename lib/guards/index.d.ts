/**
 * @ldesign/router 路由守卫
 *
 * 提供常用的路由守卫实现
 */
import type { NavigationGuard, RouteLocationNormalized, RouteLocationRaw } from '../types';
/**
 * 权限检查函数类型
 */
export type PermissionChecker = (permissions: string | string[], route: RouteLocationNormalized) => boolean | Promise<boolean>;
/**
 * 权限守卫选项
 */
export interface PermissionGuardOptions {
    /** 权限检查函数 */
    checker: PermissionChecker;
    /** 无权限时的重定向路由 */
    redirectTo?: RouteLocationRaw;
    /** 无权限时的错误消息 */
    errorMessage?: string;
    /** 权限字段名 */
    permissionField?: string;
}
/**
 * 创建权限守卫
 */
export declare function createPermissionGuard(options: PermissionGuardOptions): NavigationGuard;
/**
 * 认证检查函数类型
 */
export type AuthChecker = () => boolean | Promise<boolean>;
/**
 * 认证守卫选项
 */
export interface AuthGuardOptions {
    /** 认证检查函数 */
    checker: AuthChecker;
    /** 未认证时的重定向路由 */
    redirectTo?: RouteLocationRaw;
    /** 认证字段名 */
    authField?: string;
}
/**
 * 创建认证守卫
 */
export declare function createAuthGuard(options: AuthGuardOptions): NavigationGuard;
/**
 * 加载守卫选项
 */
export interface LoadingGuardOptions {
    /** 显示加载状态 */
    showLoading?: (to: RouteLocationNormalized) => void;
    /** 隐藏加载状态 */
    hideLoading?: (to: RouteLocationNormalized) => void;
    /** 最小加载时间（毫秒） */
    minLoadingTime?: number;
}
/**
 * 创建加载守卫
 */
export declare function createLoadingGuard(options?: LoadingGuardOptions): {
    beforeEach: NavigationGuard;
    afterEach: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
};
/**
 * 标题守卫选项
 */
export interface TitleGuardOptions {
    /** 默认标题 */
    defaultTitle?: string;
    /** 标题模板 */
    titleTemplate?: (title: string) => string;
    /** 标题字段名 */
    titleField?: string;
}
/**
 * 创建标题守卫
 */
export declare function createTitleGuard(options?: TitleGuardOptions): NavigationGuard;
/**
 * 滚动守卫选项
 */
export interface ScrollGuardOptions {
    /** 滚动行为 */
    behavior?: 'auto' | 'smooth';
    /** 滚动到顶部 */
    scrollToTop?: boolean;
    /** 保存滚动位置 */
    savePosition?: boolean;
}
/**
 * 创建滚动守卫
 */
export declare function createScrollGuard(options?: ScrollGuardOptions): {
    beforeEach: NavigationGuard;
    afterEach: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
};
/**
 * 进度守卫选项
 */
export interface ProgressGuardOptions {
    /** 进度条颜色 */
    color?: string;
    /** 进度条高度 */
    height?: string;
    /** 最小进度时间 */
    minTime?: number;
    /** 最大进度时间 */
    maxTime?: number;
}
/**
 * 创建进度守卫
 */
export declare function createProgressGuard(options?: ProgressGuardOptions): {
    beforeEach: NavigationGuard;
    afterEach: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
};
/**
 * 组合多个守卫
 */
export declare function combineGuards(...guards: NavigationGuard[]): NavigationGuard;
declare const _default: {
    createPermissionGuard: typeof createPermissionGuard;
    createAuthGuard: typeof createAuthGuard;
    createLoadingGuard: typeof createLoadingGuard;
    createTitleGuard: typeof createTitleGuard;
    createScrollGuard: typeof createScrollGuard;
    createProgressGuard: typeof createProgressGuard;
    combineGuards: typeof combineGuards;
};
export default _default;
