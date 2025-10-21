/**
 * @ldesign/router 语言切换组件
 *
 * 提供语言切换UI组件
 */
import { type PropType } from 'vue';
export declare const LocaleSwitcher: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    mode: {
        type: PropType<"dropdown" | "inline" | "buttons">;
        default: string;
    };
    format: {
        type: PropType<"code" | "name" | "native" | "emoji">;
        default: string;
    };
    labels: {
        type: PropType<Record<string, string>>;
        default: () => {
            en: string;
            zh: string;
            ja: string;
            ko: string;
            es: string;
            fr: string;
            de: string;
            ru: string;
        };
    };
    emojis: {
        type: PropType<Record<string, string>>;
        default: () => {
            en: string;
            zh: string;
            ja: string;
            ko: string;
            es: string;
            fr: string;
            de: string;
            ru: string;
        };
    };
    class: {
        type: StringConstructor;
        default: string;
    };
    position: {
        type: PropType<"top" | "bottom" | "left" | "right">;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    mode: {
        type: PropType<"dropdown" | "inline" | "buttons">;
        default: string;
    };
    format: {
        type: PropType<"code" | "name" | "native" | "emoji">;
        default: string;
    };
    labels: {
        type: PropType<Record<string, string>>;
        default: () => {
            en: string;
            zh: string;
            ja: string;
            ko: string;
            es: string;
            fr: string;
            de: string;
            ru: string;
        };
    };
    emojis: {
        type: PropType<Record<string, string>>;
        default: () => {
            en: string;
            zh: string;
            ja: string;
            ko: string;
            es: string;
            fr: string;
            de: string;
            ru: string;
        };
    };
    class: {
        type: StringConstructor;
        default: string;
    };
    position: {
        type: PropType<"top" | "bottom" | "left" | "right">;
        default: string;
    };
}>> & Readonly<{}>, {
    mode: "dropdown" | "inline" | "buttons";
    class: string;
    format: "name" | "code" | "native" | "emoji";
    labels: Record<string, string>;
    emojis: Record<string, string>;
    position: "left" | "right" | "top" | "bottom";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default LocaleSwitcher;
