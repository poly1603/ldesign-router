/**
 * 优化的路由组件 - 减少内存占用和虚拟DOM开销
 */
import type { RouteLocationNormalized, RouteLocationRaw } from '../types';
import { type PropType, type ShallowRef, type VNode } from 'vue';
/**
 * 优化的 RouterView 组件
 */
export declare const OptimizedRouterView: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        default: string;
    };
    route: {
        type: PropType<ShallowRef<RouteLocationNormalized>>;
        required: false;
    };
}>, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        default: string;
    };
    route: {
        type: PropType<ShallowRef<RouteLocationNormalized>>;
        required: false;
    };
}>> & Readonly<{}>, {
    name: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 优化的 RouterLink 组件
 */
export declare const OptimizedRouterLink: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    to: {
        type: PropType<RouteLocationRaw>;
        required: true;
    };
    replace: BooleanConstructor;
    activeClass: {
        type: StringConstructor;
        default: string;
    };
    exactActiveClass: {
        type: StringConstructor;
        default: string;
    };
    custom: BooleanConstructor;
    ariaCurrentValue: {
        type: PropType<"page" | "step" | "location" | "date" | "time">;
        default: string;
    };
}>, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    to: {
        type: PropType<RouteLocationRaw>;
        required: true;
    };
    replace: BooleanConstructor;
    activeClass: {
        type: StringConstructor;
        default: string;
    };
    exactActiveClass: {
        type: StringConstructor;
        default: string;
    };
    custom: BooleanConstructor;
    ariaCurrentValue: {
        type: PropType<"page" | "step" | "location" | "date" | "time">;
        default: string;
    };
}>> & Readonly<{}>, {
    replace: boolean;
    custom: boolean;
    activeClass: string;
    exactActiveClass: string;
    ariaCurrentValue: "location" | "time" | "page" | "step" | "date";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 优化的 KeepAlive 包装器
 */
export declare const OptimizedKeepAlive: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    include: (ArrayConstructor | StringConstructor | RegExpConstructor)[];
    exclude: (ArrayConstructor | StringConstructor | RegExpConstructor)[];
    max: {
        type: NumberConstructor;
        default: number;
    };
}>, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null | undefined, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    include: (ArrayConstructor | StringConstructor | RegExpConstructor)[];
    exclude: (ArrayConstructor | StringConstructor | RegExpConstructor)[];
    max: {
        type: NumberConstructor;
        default: number;
    };
}>> & Readonly<{}>, {
    max: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
/**
 * 内存使用统计组件（开发模式）
 */
export declare const MemoryStats: import("vue").DefineComponent<{}, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
