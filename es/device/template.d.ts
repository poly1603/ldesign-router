/**
 * 模板路由解析器
 *
 * 为路由系统提供模板相关的功能
 */
import type { DeviceType } from '@ldesign/device';
import type { Router } from '../types';
/**
 * 模板路由解析器选项
 */
export interface TemplateRouteResolverOptions {
    /** 是否启用模板路由 */
    enabled?: boolean;
    /** 默认模板 */
    defaultTemplate?: string;
    /** 模板路径前缀 */
    templatePrefix?: string;
}
/**
 * 模板路由解析器
 */
export declare class TemplateRouteResolver {
    private options;
    constructor(_router: Router, options?: TemplateRouteResolverOptions);
    /**
     * 初始化模板路由解析器
     */
    init(): void;
    /**
     * 解析模板路由
     */
    resolveTemplateRoute(path: string, device: DeviceType): string;
    /**
     * 获取模板路径
     */
    getTemplatePath(templateName: string, device: DeviceType): string;
    /**
     * 销毁解析器
     */
    destroy(): void;
}
