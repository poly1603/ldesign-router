/**
 * @ldesign/router RouterLink 增强版组件
 *
 * 提供更多功能和更好的性能
 */
import type { RouteLocationRaw } from '../types';
import { type PropType } from 'vue';
export declare const RouterLinkEnhanced: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
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
    inactiveClass: {
        type: StringConstructor;
        default: string;
    };
    pendingClass: {
        type: StringConstructor;
        default: string;
    };
    custom: {
        type: BooleanConstructor;
        default: boolean;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    prefetch: {
        type: PropType<boolean | "hover" | "visible" | "immediate" | "idle">;
        default: boolean;
    };
    prefetchDelay: {
        type: NumberConstructor;
        default: number;
    };
    prefetchPriority: {
        type: PropType<"high" | "low" | "auto">;
        default: string;
    };
    permission: {
        type: PropType<string | string[] | (() => boolean)>;
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
    external: {
        type: BooleanConstructor;
        default: boolean;
    };
    target: {
        type: PropType<"_blank" | "_self" | "_parent" | "_top" | string>;
        default: undefined;
    };
    rel: {
        type: StringConstructor;
        default: undefined;
    };
    append: {
        type: BooleanConstructor;
        default: boolean;
    };
    exact: {
        type: BooleanConstructor;
        default: boolean;
    };
    event: {
        type: PropType<string | string[]>;
        default: string;
    };
    beforeNavigate: {
        type: PropType<(to: RouteLocationRaw) => boolean | Promise<boolean> | void>;
        default: undefined;
    };
    afterNavigate: {
        type: PropType<(to: RouteLocationRaw) => void>;
        default: undefined;
    };
    isActiveMatch: {
        type: PropType<(route: any) => boolean>;
        default: undefined;
    };
    isExactActiveMatch: {
        type: PropType<(route: any) => boolean>;
        default: undefined;
    };
    ariaCurrentValue: {
        type: PropType<"page" | "step" | "location" | "date" | "time" | "true" | "false">;
        default: string;
    };
    ariaLabel: {
        type: StringConstructor;
        default: undefined;
    };
    scrollBehavior: {
        type: PropType<boolean | ScrollToOptions>;
        default: undefined;
    };
    transition: {
        type: PropType<string | object>;
        default: undefined;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null | undefined, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("click" | "navigate" | "prefetch")[], "click" | "navigate" | "prefetch", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
    inactiveClass: {
        type: StringConstructor;
        default: string;
    };
    pendingClass: {
        type: StringConstructor;
        default: string;
    };
    custom: {
        type: BooleanConstructor;
        default: boolean;
    };
    tag: {
        type: StringConstructor;
        default: string;
    };
    prefetch: {
        type: PropType<boolean | "hover" | "visible" | "immediate" | "idle">;
        default: boolean;
    };
    prefetchDelay: {
        type: NumberConstructor;
        default: number;
    };
    prefetchPriority: {
        type: PropType<"high" | "low" | "auto">;
        default: string;
    };
    permission: {
        type: PropType<string | string[] | (() => boolean)>;
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
    external: {
        type: BooleanConstructor;
        default: boolean;
    };
    target: {
        type: PropType<"_blank" | "_self" | "_parent" | "_top" | string>;
        default: undefined;
    };
    rel: {
        type: StringConstructor;
        default: undefined;
    };
    append: {
        type: BooleanConstructor;
        default: boolean;
    };
    exact: {
        type: BooleanConstructor;
        default: boolean;
    };
    event: {
        type: PropType<string | string[]>;
        default: string;
    };
    beforeNavigate: {
        type: PropType<(to: RouteLocationRaw) => boolean | Promise<boolean> | void>;
        default: undefined;
    };
    afterNavigate: {
        type: PropType<(to: RouteLocationRaw) => void>;
        default: undefined;
    };
    isActiveMatch: {
        type: PropType<(route: any) => boolean>;
        default: undefined;
    };
    isExactActiveMatch: {
        type: PropType<(route: any) => boolean>;
        default: undefined;
    };
    ariaCurrentValue: {
        type: PropType<"page" | "step" | "location" | "date" | "time" | "true" | "false">;
        default: string;
    };
    ariaLabel: {
        type: StringConstructor;
        default: undefined;
    };
    scrollBehavior: {
        type: PropType<boolean | ScrollToOptions>;
        default: undefined;
    };
    transition: {
        type: PropType<string | object>;
        default: undefined;
    };
}>> & Readonly<{
    onClick?: ((...args: any[]) => any) | undefined;
    onNavigate?: ((...args: any[]) => any) | undefined;
    onPrefetch?: ((...args: any[]) => any) | undefined;
}>, {
    transition: string | object;
    replace: boolean;
    custom: boolean;
    event: string | string[];
    activeClass: string;
    exactActiveClass: string;
    permission: string | string[] | (() => boolean);
    external: boolean;
    target: string;
    disabled: boolean;
    loading: boolean;
    beforeNavigate: (to: RouteLocationRaw) => boolean | Promise<boolean> | void;
    isActiveMatch: (route: any) => boolean;
    prefetchPriority: "high" | "low" | "auto";
    ariaCurrentValue: "location" | "time" | "page" | "step" | "date" | "true" | "false";
    scrollBehavior: boolean | ScrollToOptions;
    prefetch: boolean | "hover" | "visible" | "idle" | "immediate";
    inactiveClass: string;
    pendingClass: string;
    tag: string;
    prefetchDelay: number;
    rel: string;
    append: boolean;
    exact: boolean;
    afterNavigate: (to: RouteLocationRaw) => void;
    isExactActiveMatch: (route: any) => boolean;
    ariaLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default RouterLinkEnhanced;
