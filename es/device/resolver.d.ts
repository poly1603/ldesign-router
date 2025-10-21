/**
 * 设备组件解析器
 *
 * 根据当前设备类型解析合适的组件进行渲染
 */
import type { DeviceType } from '@ldesign/device';
import type { DeviceComponentResolution, RouteRecordNormalized } from '../types';
/**
 * 设备组件解析器类
 */
export declare class DeviceComponentResolver {
    private getCurrentDevice;
    constructor(getCurrentDevice: () => DeviceType);
    /**
     * 解析路由记录的组件
     */
    resolveComponent(record: RouteRecordNormalized, viewName?: string): DeviceComponentResolution | null;
    /**
     * 解析设备特定组件
     */
    /**
     * 解析设备特定组件（包含回退信息）
     */
    private resolveDeviceSpecificComponentWithFallback;
    /**
     * 解析常规组件
     */
    private resolveRegularComponent;
    /**
     * 创建错误组件
     */
    /**
     * 检查组件是否支持当前设备
     */
    isComponentSupportedOnDevice(record: RouteRecordNormalized, device: DeviceType): boolean;
    /**
     * 检查是否有任何设备组件可用作回退
     */
    private hasAnyDeviceComponent;
}
/**
 * 创建设备组件解析器的便捷函数
 */
export declare function createDeviceComponentResolver(getCurrentDevice: () => DeviceType): DeviceComponentResolver;
