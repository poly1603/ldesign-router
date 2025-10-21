/**
 * @ldesign/router 动画插件
 *
 * 提供丰富的路由过渡动画效果
 */
import type { App } from 'vue';
import type { AnimationConfig, AnimationType } from '../components/types';
import type { RouteLocationNormalized, Router } from '../types';
/**
 * 预定义动画配置
 */
export declare const ANIMATION_PRESETS: Record<AnimationType, AnimationConfig>;
/**
 * 动画管理器
 */
export declare class AnimationManager {
    private animations;
    private customAnimations;
    constructor();
    /**
     * 设置默认动画
     */
    setDefaultAnimation(_animation: AnimationType): void;
    /**
     * 注册自定义动画
     */
    register(name: string, config: AnimationConfig): void;
    /**
     * 获取动画配置
     */
    get(name: string): AnimationConfig | undefined;
    /**
     * 获取所有动画名称
     */
    getNames(): string[];
    /**
     * 根据路由变化选择动画
     */
    selectAnimation(to: RouteLocationNormalized, from: RouteLocationNormalized): AnimationConfig;
    /**
     * 生成 CSS 样式
     */
    generateCSS(): string;
    /**
     * 注入样式到页面
     */
    injectStyles(): void;
}
/**
 * 动画插件选项
 */
export interface AnimationPluginOptions {
    /** 默认动画类型 */
    defaultAnimation?: AnimationType;
    /** 自定义动画配置 */
    customAnimations?: Record<string, AnimationConfig>;
    /** 是否自动注入样式 */
    autoInjectStyles?: boolean;
    /** 是否启用智能动画选择 */
    smartSelection?: boolean;
}
/**
 * 创建动画插件
 */
export declare function createAnimationPlugin(options?: AnimationPluginOptions): {
    install(app: App, router: Router): void;
    manager: AnimationManager;
};
/**
 * 创建自定义动画配置
 */
export declare function createAnimationConfig(config: Partial<AnimationConfig>): AnimationConfig;
/**
 * 检查是否支持动画
 */
export declare function supportsAnimations(): boolean;
/**
 * 获取动画持续时间
 */
export declare function getAnimationDuration(element: Element): number;
declare const _default: {
    createAnimationPlugin: typeof createAnimationPlugin;
    AnimationManager: typeof AnimationManager;
    ANIMATION_PRESETS: Record<AnimationType, AnimationConfig>;
    createAnimationConfig: typeof createAnimationConfig;
    supportsAnimations: typeof supportsAnimations;
    getAnimationDuration: typeof getAnimationDuration;
};
export default _default;
