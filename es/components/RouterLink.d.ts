/**
 * @ldesign/router RouterLink 组件
 *
 * 增强版本 - 完整功能优化
 */
import type { RouteLocationRaw } from '../types';
import { type PropType } from 'vue';
export declare const RouterLink: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    to: {
        type: PropType<RouteLocationRaw>;
        required: true;
    };
    replace: {
        type: BooleanConstructor;
        default: boolean;
    };
    activeClass: {
        type: StringConstructor;
        default: string;
    };
    exactActiveClass: {
        type: StringConstructor;
        default: string;
    };
    custom: {
        type: BooleanConstructor;
        default: boolean;
    };
    preload: {
        type: PropType<boolean | "hover" | "visible" | "immediate">;
        default: boolean;
    };
    preloadDelay: {
        type: NumberConstructor;
        default: number;
    };
    permission: {
        type: PropType<string | (() => boolean)>;
        default: undefined;
    };
    external: {
        type: BooleanConstructor;
        default: boolean;
    };
    target: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    beforeNavigate: {
        type: PropType<(to: RouteLocationRaw) => boolean | Promise<boolean>>;
        default: undefined;
    };
    isActiveMatch: {
        type: PropType<(route: RouteLocationRaw) => boolean>;
        default: undefined;
    };
    prefetchPriority: {
        type: PropType<"high" | "low" | "auto">;
        default: string;
    };
    ariaCurrentValue: {
        type: PropType<"page" | "step" | "location" | "date" | "time" | "true" | "false">;
        default: string;
    };
    scrollToTop: {
        type: BooleanConstructor;
        default: boolean;
    };
    transition: {
        type: PropType<boolean | string | object>;
        default: boolean;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null | undefined, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    to: {
        type: PropType<RouteLocationRaw>;
        required: true;
    };
    replace: {
        type: BooleanConstructor;
        default: boolean;
    };
    activeClass: {
        type: StringConstructor;
        default: string;
    };
    exactActiveClass: {
        type: StringConstructor;
        default: string;
    };
    custom: {
        type: BooleanConstructor;
        default: boolean;
    };
    preload: {
        type: PropType<boolean | "hover" | "visible" | "immediate">;
        default: boolean;
    };
    preloadDelay: {
        type: NumberConstructor;
        default: number;
    };
    permission: {
        type: PropType<string | (() => boolean)>;
        default: undefined;
    };
    external: {
        type: BooleanConstructor;
        default: boolean;
    };
    target: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    beforeNavigate: {
        type: PropType<(to: RouteLocationRaw) => boolean | Promise<boolean>>;
        default: undefined;
    };
    isActiveMatch: {
        type: PropType<(route: RouteLocationRaw) => boolean>;
        default: undefined;
    };
    prefetchPriority: {
        type: PropType<"high" | "low" | "auto">;
        default: string;
    };
    ariaCurrentValue: {
        type: PropType<"page" | "step" | "location" | "date" | "time" | "true" | "false">;
        default: string;
    };
    scrollToTop: {
        type: BooleanConstructor;
        default: boolean;
    };
    transition: {
        type: PropType<boolean | string | object>;
        default: boolean;
    };
}>> & Readonly<{}>, {
    preload: boolean | "hover" | "visible" | "immediate";
    transition: string | boolean | object;
    replace: boolean;
    custom: boolean;
    activeClass: string;
    exactActiveClass: string;
    preloadDelay: number;
    permission: string | (() => boolean);
    external: boolean;
    target: string;
    disabled: boolean;
    loading: boolean;
    beforeNavigate: (to: RouteLocationRaw) => boolean | Promise<boolean>;
    isActiveMatch: (route: RouteLocationRaw) => boolean;
    prefetchPriority: "high" | "low" | "auto";
    ariaCurrentValue: "location" | "time" | "page" | "step" | "date" | "true" | "false";
    scrollToTop: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default RouterLink;
