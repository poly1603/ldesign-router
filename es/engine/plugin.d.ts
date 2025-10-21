/**
 * @ldesign/router Engine 插件
 *
 * 将路由器集成到 LDesign Engine 中的插件实现
 */
import type { RouteRecordRaw, ScrollBehavior } from '../types';
interface Plugin {
    name: string;
    version: string;
    dependencies?: string[];
    install: (context: any) => Promise<void>;
    uninstall?: (context: any) => Promise<void>;
    [key: string]: any;
}
/**
 * 路由器预设配置
 */
export type RouterPreset = 'spa' | 'mpa' | 'mobile' | 'desktop' | 'admin' | 'blog';
/**
 * 路由器 Engine 插件选项（增强版）
 */
export interface RouterEnginePluginOptions {
    /** 插件名称 */
    name?: string;
    /** 插件版本 */
    version?: string;
    /** 路由配置 */
    routes: RouteRecordRaw[];
    /** 路由模式 */
    mode?: 'history' | 'hash' | 'memory';
    /** 基础路径 */
    base?: string;
    /** 滚动行为 */
    scrollBehavior?: ScrollBehavior;
    /** 活跃链接类名 */
    linkActiveClass?: string;
    /** 精确活跃链接类名 */
    linkExactActiveClass?: string;
    /** 预设配置 */
    preset?: RouterPreset;
    /** 是否启用预加载 */
    preload?: boolean | {
        strategy?: 'hover' | 'visible' | 'idle';
        delay?: number;
        enabled?: boolean;
    };
    /** 是否启用缓存 */
    cache?: boolean | {
        maxSize?: number;
        strategy?: 'memory' | 'session' | 'local';
        enabled?: boolean;
    };
    /** 动画配置 */
    animation?: boolean | {
        type?: 'fade' | 'slide' | 'scale' | 'flip';
        duration?: number;
        enabled?: boolean;
    };
    /** 性能配置 */
    performance?: {
        enableLazyLoading?: boolean;
        enableCodeSplitting?: boolean;
        enablePrefetch?: boolean;
        cacheSize?: number;
    };
    /** 开发配置 */
    development?: {
        enableDevtools?: boolean;
        enableHotReload?: boolean;
        enableDebugMode?: boolean;
    };
    /** 安全配置 */
    security?: {
        enableCSRFProtection?: boolean;
        enableXSSProtection?: boolean;
        trustedDomains?: string[];
    };
}
/**
 * 获取预设配置
 */
declare function getPresetConfig(preset: RouterPreset): Partial<RouterEnginePluginOptions>;
/**
 * 合并配置选项
 */
declare function mergeOptions(options: RouterEnginePluginOptions): RouterEnginePluginOptions;
/**
 * 创建路由器 Engine 插件（增强版）
 *
 * 将路由器集成到 LDesign Engine 中，提供统一的路由管理体验
 *
 * @param options 路由器配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createRouterEnginePlugin } from '@ldesign/router'
 *
 * // 使用预设配置
 * const routerPlugin = createRouterEnginePlugin({
 *   preset: 'spa',
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ]
 * })
 *
 * // 自定义配置
 * const customRouterPlugin = createRouterEnginePlugin({
 *   routes: [...],
 *   mode: 'history',
 *   preload: { strategy: 'hover', delay: 200 },
 *   cache: { maxSize: 30, strategy: 'memory' },
 *   animation: { type: 'fade', duration: 300 }
 * })
 *
 * await engine.use(routerPlugin)
 * ```
 */
export declare function createRouterEnginePlugin(options: RouterEnginePluginOptions): Plugin;
/**
 * 创建 SPA 路由插件
 */
export declare function createSPARouter(routes: RouteRecordRaw[], options?: Partial<RouterEnginePluginOptions>): Plugin;
/**
 * 创建移动端路由插件
 */
export declare function createMobileRouter(routes: RouteRecordRaw[], options?: Partial<RouterEnginePluginOptions>): Plugin;
/**
 * 创建桌面端路由插件
 */
export declare function createDesktopRouter(routes: RouteRecordRaw[], options?: Partial<RouterEnginePluginOptions>): Plugin;
/**
 * 创建管理后台路由插件
 */
export declare function createAdminRouter(routes: RouteRecordRaw[], options?: Partial<RouterEnginePluginOptions>): Plugin;
/**
 * 创建博客路由插件
 */
export declare function createBlogRouter(routes: RouteRecordRaw[], options?: Partial<RouterEnginePluginOptions>): Plugin;
/**
 * 创建简单路由插件（最小配置）
 */
export declare function createSimpleRouter(routes: RouteRecordRaw[], mode?: 'history' | 'hash'): Plugin;
/**
 * 验证路由配置
 */
export declare function validateRouterConfig(options: RouterEnginePluginOptions): string[];
declare const _default: {
    createRouterEnginePlugin: typeof createRouterEnginePlugin;
    createSPARouter: typeof createSPARouter;
    createMobileRouter: typeof createMobileRouter;
    createDesktopRouter: typeof createDesktopRouter;
    createAdminRouter: typeof createAdminRouter;
    createBlogRouter: typeof createBlogRouter;
    createSimpleRouter: typeof createSimpleRouter;
    validateRouterConfig: typeof validateRouterConfig;
    getPresetConfig: typeof getPresetConfig;
    mergeOptions: typeof mergeOptions;
};
export default _default;
/**
 * 路由器插件工厂函数（向后兼容）
 *
 * @param options 路由器配置选项
 * @returns 路由器 Engine 插件实例
 *
 * @example
 * ```typescript
 * import { routerPlugin } from '@ldesign/router'
 *
 * await engine.use(routerPlugin({
 *   routes: [
 *     { path: '/', component: Home },
 *     { path: '/about', component: About }
 *   ],
 *   mode: 'hash'
 * }))
 * ```
 */
export declare function routerPlugin(options: RouterEnginePluginOptions): Plugin;
/**
 * 默认路由器 Engine 插件实例
 *
 * 使用默认配置创建的路由器插件，需要提供路由配置
 *
 * @example
 * ```typescript
 * import { createDefaultRouterEnginePlugin } from '@ldesign/router'
 *
 * const defaultRouterPlugin = createDefaultRouterEnginePlugin([
 *   { path: '/', component: Home }
 * ])
 *
 * await engine.use(defaultRouterPlugin)
 * ```
 */
export declare function createDefaultRouterEnginePlugin(routes: RouteRecordRaw[]): Plugin;
/**
 * 创建简单的 SPA 路由器实例（直接返回路由器，不是插件）
 * 主要用于测试和不需要 Engine 集成的简单场景
 */
export declare function createSimpleSPARouter(routes: RouteRecordRaw[], options?: {
    mode?: 'history' | 'hash' | 'memory';
    base?: string;
    scrollBehavior?: ScrollBehavior;
}): import("../types").Router;
/**
 * 创建简单的移动端路由器实例
 */
export declare function createSimpleMobileRouter(routes: RouteRecordRaw[], options?: {
    animation?: {
        type: string;
        duration: number;
    };
    mode?: 'history' | 'hash' | 'memory';
    base?: string;
}): import("../types").Router;
/**
 * 创建简单的管理后台路由器实例
 */
export declare function createSimpleAdminRouter(routes: RouteRecordRaw[], options?: {
    security?: {
        enableCSRFProtection: boolean;
    };
    mode?: 'history' | 'hash' | 'memory';
    base?: string;
}): import("../types").Router;
