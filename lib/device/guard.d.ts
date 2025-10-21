/**
 * 设备路由守卫
 *
 * 提供设备访问控制功能，检查当前设备是否被路由支持
 */
import type { DeviceType } from '@ldesign/device';
import type { DeviceGuardOptions, NavigationGuard } from '../types';
/**
 * 设备路由守卫类
 */
export declare class DeviceRouteGuard {
    private options;
    private getCurrentDevice;
    constructor(getCurrentDevice: () => DeviceType, options?: DeviceGuardOptions);
    /**
     * 创建导航守卫
     */
    createGuard(): NavigationGuard;
    /**
     * 获取路由支持的设备类型
     */
    private getSupportedDevices;
    /**
     * 默认的设备支持检查函数
     */
    private defaultCheckSupportedDevices;
    /**
     * 默认的不支持设备处理函数
     */
    private defaultOnUnsupportedDevice;
}
/**
 * 创建设备路由守卫的便捷函数
 */
export declare function createDeviceGuard(getCurrentDevice: () => DeviceType, options?: DeviceGuardOptions): NavigationGuard;
