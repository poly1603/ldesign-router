/**
 * 设备不支持提示组件
 *
 * 当用户在不支持的设备上访问时显示友好的提示信息
 */
import type { DeviceType } from '@ldesign/device';
export interface DeviceUnsupportedProps {
    /** 当前设备类型 */
    device?: DeviceType;
    /** 来源路由 */
    from?: string;
    /** 自定义提示信息 */
    message?: string;
    /** 支持的设备类型 */
    supportedDevices?: DeviceType[];
    /** 是否显示返回按钮 */
    showBackButton?: boolean;
    /** 是否显示刷新按钮 */
    showRefreshButton?: boolean;
    /** 自定义样式类名 */
    className?: string;
}
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    device: {
        type: () => DeviceType;
        default: string;
    };
    from: {
        type: StringConstructor;
        default: string;
    };
    message: {
        type: StringConstructor;
        default: string;
    };
    supportedDevices: {
        type: () => DeviceType[];
        default: () => string[];
    };
    showBackButton: {
        type: BooleanConstructor;
        default: boolean;
    };
    showRefreshButton: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    device: {
        type: () => DeviceType;
        default: string;
    };
    from: {
        type: StringConstructor;
        default: string;
    };
    message: {
        type: StringConstructor;
        default: string;
    };
    supportedDevices: {
        type: () => DeviceType[];
        default: () => string[];
    };
    showBackButton: {
        type: BooleanConstructor;
        default: boolean;
    };
    showRefreshButton: {
        type: BooleanConstructor;
        default: boolean;
    };
    className: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    supportedDevices: DeviceType[];
    device: DeviceType;
    from: string;
    message: string;
    showBackButton: boolean;
    showRefreshButton: boolean;
    className: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
