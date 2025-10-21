/**
 * 微前端路由集成
 * 支持子应用注册、隔离、通信等功能
 */
import type { Router } from '../types';
export interface MicroApp {
    name: string;
    entry: string;
    container: string | HTMLElement;
    activeRule: string | RegExp | ((location: Location) => boolean);
    props?: Record<string, any>;
    sandbox?: boolean | SandboxConfig;
    prefetch?: boolean | 'all';
    loader?: (loading: boolean) => void;
    beforeMount?: (app: MicroApp) => Promise<void> | void;
    afterMount?: (app: MicroApp) => Promise<void> | void;
    beforeUnmount?: (app: MicroApp) => Promise<void> | void;
    afterUnmount?: (app: MicroApp) => Promise<void> | void;
}
export interface SandboxConfig {
    strictStyleIsolation?: boolean;
    experimentalStyleIsolation?: boolean;
    patchers?: Array<(sandbox: any) => void>;
}
export interface MicroFrontendConfig {
    apps: MicroApp[];
    lifeCycles?: GlobalLifeCycles;
    fetch?: typeof fetch;
    prefetch?: boolean | 'all' | string[];
    sandbox?: boolean | SandboxConfig;
    singular?: boolean;
}
export interface GlobalLifeCycles {
    beforeLoad?: (app: MicroApp) => Promise<void> | void;
    beforeMount?: (app: MicroApp) => Promise<void> | void;
    afterMount?: (app: MicroApp) => Promise<void> | void;
    beforeUnmount?: (app: MicroApp) => Promise<void> | void;
    afterUnmount?: (app: MicroApp) => Promise<void> | void;
    afterLoad?: (app: MicroApp) => Promise<void> | void;
}
export interface MicroAppState {
    loading: boolean;
    mounted: boolean;
    error: Error | null;
}
/**
 * 微前端路由管理器
 */
export declare class MicroFrontendRouter {
    private apps;
    private appStates;
    private activeApps;
    private eventBus;
    private router;
    private config;
    private appContainers;
    private appScripts;
    private appStyles;
    private globalState;
    private stateWatchers;
    constructor(config: MicroFrontendConfig);
    /**
     * 注册微应用
     */
    registerApps(apps: MicroApp[]): void;
    /**
     * 注册单个微应用
     */
    registerApp(app: MicroApp): void;
    /**
     * 注销微应用
     */
    unregisterApp(name: string): void;
    /**
     * 启动微前端
     */
    start(router?: Router): Promise<void>;
    /**
     * 设置路由集成
     */
    private setupRouterIntegration;
    /**
     * 获取应用路径
     */
    private getAppPath;
    /**
     * 监听路由变化
     */
    private listenRouteChange;
    /**
     * 路由变化处理
     */
    private reroute;
    /**
     * 获取当前激活的应用
     */
    private getActiveApps;
    /**
     * 判断应用是否激活
     */
    private isAppActive;
    /**
     * 挂载应用
     */
    mountApp(name: string, container?: HTMLElement): Promise<void>;
    /**
     * 卸载应用
     */
    unmountApp(name: string): Promise<void>;
    /**
     * 加载应用资源
     */
    private loadApp;
    /**
     * 解析 HTML
     */
    private parseHTML;
    /**
     * 创建容器
     */
    private createContainer;
    /**
     * 创建沙箱
     */
    private createSandbox;
    /**
     * 样式隔离（暂时禁用）
     */
    private _applySandboxStyles;
    /**
     * 销毁沙箱
     */
    private destroySandbox;
    /**
     * CSS 作用域处理
     */
    private scopeCSS;
    /**
     * 执行挂载
     */
    private doMount;
    /**
     * 执行卸载
     */
    private doUnmount;
    /**
     * 预加载应用
     */
    private prefetchApp;
    /**
     * 跨应用通信 - 发送消息
     */
    sendMessage(target: string | string[], message: any): void;
    /**
     * 跨应用通信 - 监听消息
     */
    onMessage(appName: string, handler: (message: any) => void): () => void;
    /**
     * 全局状态管理 - 设置状态
     */
    setGlobalState(key: string, value: any): void;
    /**
     * 全局状态管理 - 获取状态
     */
    getGlobalState(key?: string): any;
    /**
     * 全局状态管理 - 监听状态变化
     */
    watchGlobalState(key: string, watcher: (value: any) => void): () => void;
    /**
     * 导航到子应用
     */
    navigateToApp(appName: string, path?: string): void;
    /**
     * 获取应用状态
     */
    getAppState(name: string): MicroAppState | undefined;
    /**
     * 获取所有应用
     */
    getApps(): MicroApp[];
    /**
     * 获取激活的应用
     */
    getActiveAppNames(): string[];
    /**
     * 监听应用事件
     */
    on(event: string, handler: Function): () => any;
    /**
     * 销毁
     */
    destroy(): Promise<void>;
}
/**
 * Vue 插件
 */
export declare const MicroFrontendPlugin: {
    install(app: any, options: MicroFrontendConfig): void;
};
/**
 * 组合式 API
 */
export declare function useMicroFrontend(): {
    registerApp: (app: MicroApp) => void;
    unregisterApp: (name: string) => void;
    navigateToApp: (appName: string, path?: string) => void;
    sendMessage: (target: string | string[], message: any) => void;
    onMessage: (appName: string, handler: (message: any) => void) => () => void;
    setGlobalState: (key: string, value: any) => void;
    getGlobalState: (key?: string) => any;
    watchGlobalState: (key: string, watcher: (value: any) => void) => () => void;
    getAppState: (name: string) => MicroAppState | undefined;
    getApps: () => MicroApp[];
    getActiveAppNames: () => string[];
    on: (event: string, handler: Function) => () => any;
};
