/**
 * 设备路由工具函数
 */
import type { DeviceType } from '@ldesign/device';
import type { DeviceComponentResolution, RouteComponent, RouteLocationNormalized, RouteLocationRaw } from '../types';
/**
 * 检查设备是否被路由支持
 */
export declare function checkDeviceSupport(route: RouteLocationNormalized, currentDevice: DeviceType): boolean;
/**
 * 从路由中获取支持的设备类型
 */
export declare function getSupportedDevicesFromRoute(route: RouteLocationNormalized): DeviceType[] | undefined;
/**
 * 解析设备特定组件
 */
export declare function resolveDeviceComponent(deviceComponents: Record<DeviceType, RouteComponent>, currentDevice: DeviceType): DeviceComponentResolution | null;
/**
 * 创建设备不支持的路由
 */
export declare function createUnsupportedDeviceRoute(originalRoute: RouteLocationNormalized, currentDevice: DeviceType, customMessage?: string): RouteLocationRaw;
/**
 * 检查路由是否有设备特定配置
 */
export declare function hasDeviceSpecificConfig(route: RouteLocationNormalized): boolean;
/**
 * 获取设备友好的名称
 */
export declare function getDeviceFriendlyName(device: DeviceType): string;
/**
 * 创建设备信息对象
 */
export declare function createDeviceInfo(device: DeviceType): {
    type: DeviceType;
    name: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
};
/**
 * 验证设备类型
 */
export declare function isValidDeviceType(device: string): device is DeviceType;
/**
 * 获取设备优先级（用于回退排序）
 */
export declare function getDevicePriority(device: DeviceType): number;
/**
 * 排序设备类型（按优先级）
 */
export declare function sortDevicesByPriority(devices: DeviceType[]): DeviceType[];
