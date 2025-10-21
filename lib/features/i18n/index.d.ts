/**
 * @ldesign/router 路由国际化（i18n）支持
 *
 * 提供多语言路由功能，支持路径本地化、自动语言检测等
 */
import type { Router } from '../../types';
export interface I18nRouteConfig {
    /**
     * 默认语言
     */
    defaultLocale: string;
    /**
     * 支持的语言列表
     */
    locales: string[];
    /**
     * 是否自动检测浏览器语言
     */
    detectBrowserLanguage?: boolean;
    /**
     * URL 语言前缀策略
     * - 'always': 总是添加语言前缀
     * - 'never': 从不添加语言前缀
     * - 'non-default': 仅非默认语言添加前缀
     */
    strategy?: 'always' | 'never' | 'non-default';
    /**
     * 语言切换时是否保持当前路由
     */
    preserveRouteOnLocaleChange?: boolean;
    /**
     * 路径本地化映射
     */
    pathLocalization?: Record<string, Record<string, string>>;
    /**
     * 语言存储键名
     */
    storageKey?: string;
    /**
     * 语言切换回调
     */
    onLocaleChange?: (newLocale: string, oldLocale: string) => void;
    /**
     * 404 页面路径
     */
    fallbackRoute?: string;
}
export declare class I18nRouteManager {
    private router;
    private config;
    private currentLocale;
    private originalRoutes;
    private localizedRoutes;
    constructor(router: Router, config: I18nRouteConfig);
    /**
     * 初始化语言设置
     */
    private initializeLocale;
    /**
     * 检测浏览器语言
     */
    private detectBrowserLanguage;
    /**
     * 生成本地化路由
     */
    private generateLocalizedRoutes;
    /**
     * 创建特定语言的路由
     */
    private createLocalizedRoutes;
    /**
     * 本地化路径
     */
    private localizePath;
    /**
     * 是否应该添加语言前缀
     */
    private shouldAddPrefix;
    /**
     * 应用本地化路由
     */
    private applyLocalizedRoutes;
    /**
     * 设置导航守卫
     */
    private setupNavigationGuards;
    /**
     * 从路径中提取语言
     */
    private extractLocaleFromPath;
    /**
     * 路由记录转换为原始格式
     */
    private routeToRaw;
    /**
     * 获取当前语言
     */
    getLocale(): string;
    /**
     * 设置语言
     */
    setLocale(locale: string): void;
    /**
     * 移除路由中的语言信息
     */
    private removeLocaleFromRoute;
    /**
     * 本地化当前路径
     */
    private localizeCurrentPath;
    /**
     * 获取本地化路径
     */
    getLocalizedPath(path: string, locale?: string): string;
    /**
     * 获取所有语言的路径
     */
    getAllLocalizedPaths(path: string): Record<string, string>;
    /**
     * 切换到下一个语言
     */
    nextLocale(): void;
    /**
     * 获取语言切换链接
     */
    getLocaleSwitchLinks(): Array<{
        locale: string;
        path: string;
        active: boolean;
    }>;
}
/**
 * 设置 i18n 路由管理器
 */
export declare function setupI18nRouter(router: Router, config: I18nRouteConfig): I18nRouteManager;
/**
 * 获取 i18n 管理器实例
 */
export declare function getI18nManager(): I18nRouteManager | null;
/**
 * 使用 i18n 路由
 */
export declare function useI18nRoute(): {
    locale: import("vue").ComputedRef<string>;
    setLocale: (locale: string) => void;
    nextLocale: () => void;
    localizePath: (path: string, locale?: string) => string;
    getAllPaths: (path: string) => Record<string, string>;
    getSwitchLinks: () => {
        locale: string;
        path: string;
        active: boolean;
    }[];
    locales: any;
    defaultLocale: any;
};
export declare const I18nRouterPlugin: {
    install(app: any, options: {
        router: Router;
        config: I18nRouteConfig;
    }): void;
};
