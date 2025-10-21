/**
 * @ldesign/router 路由版本控制系统
 *
 * 提供路由配置的版本管理、备份和回滚功能
 */
import type { Router, RouteRecordRaw } from '../types';
/**
 * 路由版本快照
 */
export interface RouteVersion {
    /** 版本ID */
    id: string;
    /** 版本名称 */
    name: string;
    /** 版本描述 */
    description?: string;
    /** 创建时间 */
    createdAt: Date;
    /** 路由配置快照 */
    routes: RouteRecordRaw[];
    /** 元数据 */
    metadata?: {
        /** 路由数量 */
        routeCount: number;
        /** 动态路由数量 */
        dynamicRouteCount: number;
        /** 嵌套深度 */
        maxDepth: number;
        /** 创建者 */
        author?: string;
        /** 标签 */
        tags?: string[];
    };
}
/**
 * 版本比较结果
 */
export interface VersionDiff {
    /** 新增的路由 */
    added: RouteRecordRaw[];
    /** 删除的路由 */
    removed: RouteRecordRaw[];
    /** 修改的路由 */
    modified: Array<{
        before: RouteRecordRaw;
        after: RouteRecordRaw;
        changes: string[];
    }>;
    /** 总变更数 */
    totalChanges: number;
}
/**
 * 版本控制配置
 */
export interface VersionControlConfig {
    /** 最大版本数量 */
    maxVersions?: number;
    /** 是否自动创建版本 */
    autoSave?: boolean;
    /** 自动保存间隔（毫秒） */
    autoSaveInterval?: number;
    /** 是否启用压缩 */
    compression?: boolean;
    /** 存储策略 */
    storage?: 'memory' | 'localStorage' | 'indexedDB';
}
/**
 * 路由版本控制管理器
 */
export declare class RouteVersionControl {
    private router;
    private versions;
    private currentVersionId;
    private config;
    private autoSaveTimer?;
    state: {
        versions: RouteVersion[];
        currentVersion: RouteVersion | null;
        isDirty: boolean;
        isLoading: boolean;
    };
    constructor(router: Router, config?: VersionControlConfig);
    /**
     * 初始化版本控制
     */
    private initialize;
    /**
     * 创建新版本
     */
    createVersion(name: string, description?: string): Promise<RouteVersion>;
    /**
     * 恢复到指定版本
     */
    restoreVersion(versionId: string): Promise<boolean>;
    /**
     * 删除版本
     */
    deleteVersion(versionId: string): Promise<boolean>;
    /**
     * 比较两个版本
     */
    compareVersions(versionId1: string, versionId2: string): VersionDiff | null;
    /**
     * 获取版本历史
     */
    getVersionHistory(): RouteVersion[];
    /**
     * 获取当前版本
     */
    getCurrentVersion(): RouteVersion | null;
    /**
     * 导出版本
     */
    exportVersion(versionId: string): string | null;
    /**
     * 导入版本
     */
    importVersion(data: string): Promise<boolean>;
    /**
     * 创建分支版本
     */
    createBranch(baseVersionId: string, branchName: string): Promise<RouteVersion | null>;
    /**
     * 合并版本
     */
    mergeVersions(sourceId: string, targetId: string, strategy?: 'override' | 'merge'): Promise<RouteVersion | null>;
    /**
     * 生成版本ID
     */
    private generateVersionId;
    /**
     * 捕获当前路由配置
     */
    private captureCurrentRoutes;
    /**
     * 将路由记录转换为原始格式
     */
    private routeToRaw;
    /**
     * 清除当前路由
     */
    private clearCurrentRoutes;
    /**
     * 分析路由配置
     */
    private analyzeRoutes;
    /**
     * 比较路由差异
     */
    private diffRoutes;
    /**
     * 检测路由变化
     */
    private detectChanges;
    /**
     * 合并路由
     */
    private mergeRoutes;
    /**
     * 压缩路由（简单实现）
     */
    private compressRoutes;
    /**
     * 解压路由
     */
    private decompressRoutes;
    /**
     * 监听路由变化
     */
    private watchRouteChanges;
    /**
     * 开始自动保存
     */
    private startAutoSave;
    /**
     * 停止自动保存
     */
    private stopAutoSave;
    /**
     * 更新响应式状态
     */
    private updateState;
    /**
     * 移除最旧的版本
     */
    private removeOldestVersion;
    /**
     * 验证版本格式
     */
    private validateVersion;
    /**
     * 加载版本
     */
    private loadVersions;
    /**
     * 保存版本
     */
    private saveVersion;
    /**
     * 从存储中删除版本
     */
    private removeFromStorage;
    /**
     * 清理资源
     */
    destroy(): void;
}
/**
 * 设置路由版本控制
 */
export declare function setupRouteVersionControl(router: Router, config?: VersionControlConfig): RouteVersionControl;
/**
 * 获取版本控制实例
 */
export declare function getVersionControl(): RouteVersionControl | null;
/**
 * 快速创建版本
 */
export declare function createRouteVersion(name: string, description?: string): Promise<RouteVersion | null>;
/**
 * 快速恢复版本
 */
export declare function restoreRouteVersion(versionId: string): Promise<boolean>;
