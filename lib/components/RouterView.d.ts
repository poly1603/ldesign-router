/**
 * @ldesign/router RouterView 组件
 *
 * 完整优化版本 - 包含所有增强功能
 */
import { type PropType } from 'vue';
interface KeepAliveProps {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    max?: string | number;
}
interface TransitionProps {
    name?: string;
    mode?: 'in-out' | 'out-in' | 'default';
    appear?: boolean;
    duration?: number | {
        enter: number;
        leave: number;
    };
}
export declare const RouterView: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        default: string;
    };
    keepAlive: {
        type: PropType<boolean | KeepAliveProps>;
        default: boolean;
    };
    include: {
        type: PropType<string | RegExp | (string | RegExp)[]>;
        default: undefined;
    };
    exclude: {
        type: PropType<string | RegExp | (string | RegExp)[]>;
        default: undefined;
    };
    max: {
        type: NumberConstructor;
        default: undefined;
    };
    transition: {
        type: PropType<string | TransitionProps>;
        default: undefined;
    };
    mode: {
        type: PropType<"in-out" | "out-in" | "default">;
        default: string;
    };
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    lazy: {
        type: BooleanConstructor;
        default: boolean;
    };
    onError: {
        type: PropType<(error: Error) => void>;
        default: undefined;
    };
    suspense: {
        type: BooleanConstructor;
        default: boolean;
    };
    timeout: {
        type: NumberConstructor;
        default: undefined;
    };
    cacheStrategy: {
        type: PropType<"always" | "matched" | "custom">;
        default: string;
    };
}>, () => any, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    name: {
        type: StringConstructor;
        default: string;
    };
    keepAlive: {
        type: PropType<boolean | KeepAliveProps>;
        default: boolean;
    };
    include: {
        type: PropType<string | RegExp | (string | RegExp)[]>;
        default: undefined;
    };
    exclude: {
        type: PropType<string | RegExp | (string | RegExp)[]>;
        default: undefined;
    };
    max: {
        type: NumberConstructor;
        default: undefined;
    };
    transition: {
        type: PropType<string | TransitionProps>;
        default: undefined;
    };
    mode: {
        type: PropType<"in-out" | "out-in" | "default">;
        default: string;
    };
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    lazy: {
        type: BooleanConstructor;
        default: boolean;
    };
    onError: {
        type: PropType<(error: Error) => void>;
        default: undefined;
    };
    suspense: {
        type: BooleanConstructor;
        default: boolean;
    };
    timeout: {
        type: NumberConstructor;
        default: undefined;
    };
    cacheStrategy: {
        type: PropType<"always" | "matched" | "custom">;
        default: string;
    };
}>> & Readonly<{}>, {
    keepAlive: boolean | KeepAliveProps;
    transition: string | TransitionProps;
    name: string;
    include: string | RegExp | (string | RegExp)[];
    exclude: string | RegExp | (string | RegExp)[];
    mode: "default" | "in-out" | "out-in";
    onError: (error: Error) => void;
    loading: boolean;
    max: number;
    lazy: boolean;
    suspense: boolean;
    timeout: number;
    cacheStrategy: "custom" | "matched" | "always";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default RouterView;
