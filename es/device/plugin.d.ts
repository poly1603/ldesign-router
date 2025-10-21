/**
 * 设备路由插件
 *
 * 将所有设备适配功能整合到一个易用的插件中
 */
import type { DeviceType } from '@ldesign/device';
import type { DeviceRouterPluginOptions, Router } from '../types';
/**
 * 设备路由插件类
 */
export declare class DeviceRouterPlugin {
    private router;
    private options;
    private deviceDetector;
    private deviceGuard;
    private componentResolver;
    private templateResolver;
    private guardRemover;
    constructor(router: Router, options?: DeviceRouterPluginOptions);
    /**
     * 安装插件
     */
    install(): void;
    /**
     * 卸载插件
     */
    uninstall(): void;
    /**
     * 扩展路由器功能
     */
    private extendRouter;
    /**
     * 获取当前设备类型
     */
    getCurrentDevice(): DeviceType;
    /**
     * 获取设备信息
     */
    getDeviceInfo(): import("@ldesign/device").DeviceInfo;
    /**
     * 检查路由是否支持当前设备
     */
    isRouteSupported(routePath: string): boolean;
    /**
     * 监听设备变化
     */
    onDeviceChange(callback: (deviceType: DeviceType) => void): () => void;
    /**
     * 标准化选项
     */
    private normalizeOptions;
}
/**
 * 创建设备路由插件的便捷函数
 */
export declare function createDeviceRouterPlugin(options?: DeviceRouterPluginOptions): {
    install(router: Router): DeviceRouterPlugin;
};
