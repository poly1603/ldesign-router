/**
 * @ldesign/router 滚动行为管理器
 *
 * 提供高级滚动控制功能
 */
import type { RouteLocationNormalized, ScrollPosition } from '../types';
export interface ScrollBehaviorOptions {
    /**
     * 是否启用平滑滚动
     */
    smooth?: boolean;
    /**
     * 滚动延迟（毫秒）
     */
    delay?: number;
    /**
     * 是否保存滚动位置
     */
    savePosition?: boolean;
    /**
     * 最大保存的位置数量
     */
    maxSavedPositions?: number;
    /**
     * 自定义滚动行为
     */
    custom?: (to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition: ScrollPosition | null) => ScrollPosition | false | void;
    /**
     * 滚动到锚点的偏移量
     */
    anchorOffset?: number;
    /**
     * 排除的路由
     */
    exclude?: string[];
}
/**
 * 滚动行为管理器
 */
export declare class ScrollBehaviorManager {
    private savedPositions;
    private options;
    private isScrolling;
    constructor(options?: ScrollBehaviorOptions);
    /**
     * 保存当前滚动位置
     */
    saveScrollPosition(route: RouteLocationNormalized): void;
    /**
     * 获取保存的滚动位置
     */
    getSavedPosition(route: RouteLocationNormalized): ScrollPosition | null;
    /**
     * 处理滚动行为
     */
    handleScroll(to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition?: ScrollPosition | null): Promise<void>;
    /**
     * 执行滚动
     */
    private performScroll;
    /**
     * 滚动到指定位置
     */
    private scrollTo;
    /**
     * 滚动到顶部
     */
    scrollToTop(_smooth?: boolean): void;
    /**
     * 滚动到底部
     */
    scrollToBottom(_smooth?: boolean): void;
    /**
     * 滚动到元素
     */
    scrollToElement(selector: string, offset?: number): void;
    /**
     * 清除保存的位置
     */
    clearSavedPositions(): void;
    /**
     * 获取当前滚动位置
     */
    getCurrentPosition(): ScrollPosition;
    /**
     * 是否在顶部
     */
    isAtTop(): boolean;
    /**
     * 是否在底部
     */
    isAtBottom(): boolean;
}
/**
 * 创建滚动行为管理器
 */
export declare function createScrollBehavior(options?: ScrollBehaviorOptions): ScrollBehaviorManager;
/**
 * 获取默认滚动管理器
 */
export declare function getScrollManager(): ScrollBehaviorManager;
/**
 * Vue 插件
 */
export declare const ScrollBehaviorPlugin: {
    install(app: any, options?: ScrollBehaviorOptions): void;
};
