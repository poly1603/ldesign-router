/**
 * 设备路由组合式函数
 *
 * 提供设备路由相关的响应式功能
 */
import type { DeviceType } from '@ldesign/device';
import type { ComputedRef, Ref } from 'vue';
export interface UseDeviceRouteOptions {
    /** 是否自动检测设备变化 */
    autoDetect?: boolean;
    /** 设备变化时是否自动重新检查路由支持 */
    autoRecheck?: boolean;
}
export interface UseDeviceRouteReturn {
    /** 当前设备类型 */
    currentDevice: Ref<DeviceType>;
    /** 当前设备类型（别名） */
    deviceType: ComputedRef<DeviceType>;
    /** 当前设备友好名称 */
    currentDeviceName: ComputedRef<string>;
    /** 是否为移动设备 */
    isMobile: ComputedRef<boolean>;
    /** 是否为平板设备 */
    isTablet: ComputedRef<boolean>;
    /** 是否为桌面设备 */
    isDesktop: ComputedRef<boolean>;
    /** 当前路由是否支持当前设备 */
    isCurrentRouteSupported: ComputedRef<boolean>;
    /** 当前路由支持的设备类型 */
    supportedDevices: ComputedRef<DeviceType[]>;
    /** 检查指定路由是否支持当前设备 */
    isRouteSupported: (path: string) => boolean;
    /** 检查指定路由是否支持指定设备 */
    isRouteSupportedOnDevice: (path: string, device: DeviceType) => boolean;
    /** 获取设备信息 */
    getDeviceInfo: () => {
        type: DeviceType;
        isMobile: boolean;
        isTablet: boolean;
        isDesktop: boolean;
        userAgent: string;
        screenWidth: number;
        screenHeight: number;
    };
    /** 监听设备变化 */
    onDeviceChange: (callback: (device: DeviceType) => void) => () => void;
    /** 跳转到设备不支持页面 */
    goToUnsupportedPage: (message?: string) => void;
}
/**
 * 使用设备路由功能
 */
export declare function useDeviceRoute(options?: UseDeviceRouteOptions): UseDeviceRouteReturn;
