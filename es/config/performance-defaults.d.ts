/**
 * @ldesign/router 性能优化默认配置
 *
 * 提供优化后的默认配置值，以获得更好的性能和内存使用
 */
import { AnimationType, CacheStrategy, PreloadStrategy } from '../core/constants';
interface MemoryThresholds {
    warning: number;
    critical: number;
    maxCache: number;
    maxListeners: number;
}
/**
 * 优化后的缓存配置
 * - 减少默认缓存大小以降低内存占用
 * - 使用 LRU 策略自动淘汰最少使用的项
 */
export declare const OPTIMIZED_CACHE_CONFIG: {
    /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
    maxSize: number;
    /** 缓存策略 - 使用 LRU（最近最少使用）策略 */
    strategy: CacheStrategy;
    /** 最大缓存项数量 */
    maxItems: number;
    /** 缓存过期时间（毫秒） */
    ttl: number;
    /** 是否自动清理过期项 */
    autoCleanup: boolean;
    /** 清理间隔（毫秒） */
    cleanupInterval: number;
};
/**
 * 优化后的内存阈值配置
 * - 更早触发警告和清理
 * - 减少监控开销
 */
export declare const OPTIMIZED_MEMORY_THRESHOLDS: MemoryThresholds;
/**
 * 内存监控配置
 */
export declare const MEMORY_MONITOR_CONFIG: {
    /** 监控间隔（毫秒） - 从 30秒 增加到 2分钟，减少CPU占用 */
    monitorInterval: number;
    /** 是否启用自动GC */
    enableAutoGC: boolean;
    /** GC触发阈值（MB） */
    gcThreshold: number;
    /** 清理策略 */
    cleanupStrategy: "moderate";
};
/**
 * 优化后的预加载配置
 * - 限制并发预加载数量
 * - 增加空闲超时时间
 */
export declare const OPTIMIZED_PRELOAD_CONFIG: {
    /** 是否启用预加载 */
    enabled: boolean;
    /** 预加载策略 */
    strategy: PreloadStrategy;
    /** 最大并发预加载数 - 从 5 降低到 2 */
    maxConcurrent: number;
    /** 空闲超时时间（毫秒） - 从 1秒 增加到 2秒 */
    idleTimeout: number;
    /** 预加载优先级队列大小 */
    queueSize: number;
    /** 是否自动预加载相关路由 */
    autoPreloadRelated: boolean;
    /** 网络状态检查 */
    checkNetworkStatus: boolean;
    /** 只在 WiFi 下预加载 */
    wifiOnly: boolean;
};
/**
 * 优化后的动画配置
 * - 使用性能更好的默认动画
 * - 减少动画时长
 */
export declare const OPTIMIZED_ANIMATION_CONFIG: {
    /** 是否启用动画 */
    enabled: boolean;
    /** 默认动画类型 */
    defaultAnimation: AnimationType;
    /** 动画时长（毫秒） - 从 300ms 降低到 200ms */
    duration: number;
    /** 是否使用 CSS 动画（性能更好） */
    useCSS: boolean;
    /** 是否启用硬件加速 */
    hardwareAcceleration: boolean;
    /** 是否在低端设备禁用动画 */
    disableOnLowEnd: boolean;
};
/**
 * 优化后的性能监控配置
 */
export declare const OPTIMIZED_PERFORMANCE_CONFIG: {
    /** 是否启用性能监控 */
    enabled: boolean;
    /** 警告阈值（毫秒） */
    warningThreshold: number;
    /** 错误阈值（毫秒） */
    errorThreshold: number;
    /** 采样率（0-1） */
    sampleRate: number;
    /** 是否记录详细信息 */
    detailed: boolean;
    /** 最大记录数量 */
    maxRecords: number;
    /** 是否发送到服务器 */
    sendToServer: boolean;
};
/**
 * 优化后的路由器配置
 */
export declare const OPTIMIZED_ROUTER_CONFIG: {
    /** 是否启用严格模式 */
    strict: boolean;
    /** 是否启用路径大小写敏感 */
    sensitive: boolean;
    /** 最大路由深度 */
    maxDepth: number;
    /** 最大动态段数量 */
    maxDynamicSegments: number;
    /** 是否启用路由缓存 */
    enableCache: boolean;
    /** 路由缓存大小 */
    routeCacheSize: number;
    /** 是否启用智能匹配 */
    smartMatching: boolean;
    /** 是否启用路由压缩 */
    compress: boolean;
};
/**
 * 开发环境特定配置
 */
export declare const DEV_CONFIG: {
    /** 是否启用调试模式 */
    debug: any;
    /** 是否启用性能分析 */
    profiling: boolean;
    /** 是否启用详细日志 */
    verboseLogging: boolean;
    /** 是否启用热重载 */
    hotReload: boolean;
    /** 是否显示性能指标 */
    showMetrics: boolean;
};
/**
 * 生产环境优化配置
 */
export declare const PROD_CONFIG: {
    /** 是否压缩资源 */
    compress: boolean;
    /** 是否启用 CDN */
    useCDN: boolean;
    /** 是否启用服务工作器 */
    serviceWorker: boolean;
    /** 是否启用预渲染 */
    prerender: boolean;
    /** 是否启用代码分割 */
    codeSplitting: boolean;
    /** 是否内联关键 CSS */
    inlineCSS: boolean;
};
/**
 * 获取优化后的完整配置
 * @param env - 环境：'development' | 'production'
 */
export declare function getOptimizedConfig(env?: 'development' | 'production'): {
    cache: {
        /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
        maxSize: number;
        /** 缓存策略 - 使用 LRU（最近最少使用）策略 */
        strategy: CacheStrategy;
        /** 最大缓存项数量 */
        maxItems: number;
        /** 缓存过期时间（毫秒） */
        ttl: number;
        /** 是否自动清理过期项 */
        autoCleanup: boolean;
        /** 清理间隔（毫秒） */
        cleanupInterval: number;
    };
    memory: {
        thresholds: MemoryThresholds;
        monitor: {
            /** 监控间隔（毫秒） - 从 30秒 增加到 2分钟，减少CPU占用 */
            monitorInterval: number;
            /** 是否启用自动GC */
            enableAutoGC: boolean;
            /** GC触发阈值（MB） */
            gcThreshold: number;
            /** 清理策略 */
            cleanupStrategy: "moderate";
        };
    };
    preload: {
        /** 是否启用预加载 */
        enabled: boolean;
        /** 预加载策略 */
        strategy: PreloadStrategy;
        /** 最大并发预加载数 - 从 5 降低到 2 */
        maxConcurrent: number;
        /** 空闲超时时间（毫秒） - 从 1秒 增加到 2秒 */
        idleTimeout: number;
        /** 预加载优先级队列大小 */
        queueSize: number;
        /** 是否自动预加载相关路由 */
        autoPreloadRelated: boolean;
        /** 网络状态检查 */
        checkNetworkStatus: boolean;
        /** 只在 WiFi 下预加载 */
        wifiOnly: boolean;
    };
    animation: {
        /** 是否启用动画 */
        enabled: boolean;
        /** 默认动画类型 */
        defaultAnimation: AnimationType;
        /** 动画时长（毫秒） - 从 300ms 降低到 200ms */
        duration: number;
        /** 是否使用 CSS 动画（性能更好） */
        useCSS: boolean;
        /** 是否启用硬件加速 */
        hardwareAcceleration: boolean;
        /** 是否在低端设备禁用动画 */
        disableOnLowEnd: boolean;
    };
    performance: {
        enabled: boolean;
        /** 警告阈值（毫秒） */
        warningThreshold: number;
        /** 错误阈值（毫秒） */
        errorThreshold: number;
        /** 采样率（0-1） */
        sampleRate: number;
        /** 是否记录详细信息 */
        detailed: boolean;
        /** 最大记录数量 */
        maxRecords: number;
        /** 是否发送到服务器 */
        sendToServer: boolean;
    };
    router: {
        /** 是否启用严格模式 */
        strict: boolean;
        /** 是否启用路径大小写敏感 */
        sensitive: boolean;
        /** 最大路由深度 */
        maxDepth: number;
        /** 最大动态段数量 */
        maxDynamicSegments: number;
        /** 是否启用路由缓存 */
        enableCache: boolean;
        /** 路由缓存大小 */
        routeCacheSize: number;
        /** 是否启用智能匹配 */
        smartMatching: boolean;
        /** 是否启用路由压缩 */
        compress: boolean;
    };
    env: {
        /** 是否启用调试模式 */
        debug: any;
        /** 是否启用性能分析 */
        profiling: boolean;
        /** 是否启用详细日志 */
        verboseLogging: boolean;
        /** 是否启用热重载 */
        hotReload: boolean;
        /** 是否显示性能指标 */
        showMetrics: boolean;
    } | {
        /** 是否压缩资源 */
        compress: boolean;
        /** 是否启用 CDN */
        useCDN: boolean;
        /** 是否启用服务工作器 */
        serviceWorker: boolean;
        /** 是否启用预渲染 */
        prerender: boolean;
        /** 是否启用代码分割 */
        codeSplitting: boolean;
        /** 是否内联关键 CSS */
        inlineCSS: boolean;
    };
};
/**
 * 性能优化建议
 */
export declare const PERFORMANCE_TIPS: {
    cache: string;
    memory: string;
    preload: string;
    animation: string;
    monitoring: string;
    general: string[];
};
declare const _default: {
    cache: {
        /** 最大缓存大小（MB） - 从 10MB 降低到 3MB */
        maxSize: number;
        /** 缓存策略 - 使用 LRU（最近最少使用）策略 */
        strategy: CacheStrategy;
        /** 最大缓存项数量 */
        maxItems: number;
        /** 缓存过期时间（毫秒） */
        ttl: number;
        /** 是否自动清理过期项 */
        autoCleanup: boolean;
        /** 清理间隔（毫秒） */
        cleanupInterval: number;
    };
    memory: {
        thresholds: MemoryThresholds;
        monitor: {
            /** 监控间隔（毫秒） - 从 30秒 增加到 2分钟，减少CPU占用 */
            monitorInterval: number;
            /** 是否启用自动GC */
            enableAutoGC: boolean;
            /** GC触发阈值（MB） */
            gcThreshold: number;
            /** 清理策略 */
            cleanupStrategy: "moderate";
        };
    };
    preload: {
        /** 是否启用预加载 */
        enabled: boolean;
        /** 预加载策略 */
        strategy: PreloadStrategy;
        /** 最大并发预加载数 - 从 5 降低到 2 */
        maxConcurrent: number;
        /** 空闲超时时间（毫秒） - 从 1秒 增加到 2秒 */
        idleTimeout: number;
        /** 预加载优先级队列大小 */
        queueSize: number;
        /** 是否自动预加载相关路由 */
        autoPreloadRelated: boolean;
        /** 网络状态检查 */
        checkNetworkStatus: boolean;
        /** 只在 WiFi 下预加载 */
        wifiOnly: boolean;
    };
    animation: {
        /** 是否启用动画 */
        enabled: boolean;
        /** 默认动画类型 */
        defaultAnimation: AnimationType;
        /** 动画时长（毫秒） - 从 300ms 降低到 200ms */
        duration: number;
        /** 是否使用 CSS 动画（性能更好） */
        useCSS: boolean;
        /** 是否启用硬件加速 */
        hardwareAcceleration: boolean;
        /** 是否在低端设备禁用动画 */
        disableOnLowEnd: boolean;
    };
    performance: {
        enabled: boolean;
        /** 警告阈值（毫秒） */
        warningThreshold: number;
        /** 错误阈值（毫秒） */
        errorThreshold: number;
        /** 采样率（0-1） */
        sampleRate: number;
        /** 是否记录详细信息 */
        detailed: boolean;
        /** 最大记录数量 */
        maxRecords: number;
        /** 是否发送到服务器 */
        sendToServer: boolean;
    };
    router: {
        /** 是否启用严格模式 */
        strict: boolean;
        /** 是否启用路径大小写敏感 */
        sensitive: boolean;
        /** 最大路由深度 */
        maxDepth: number;
        /** 最大动态段数量 */
        maxDynamicSegments: number;
        /** 是否启用路由缓存 */
        enableCache: boolean;
        /** 路由缓存大小 */
        routeCacheSize: number;
        /** 是否启用智能匹配 */
        smartMatching: boolean;
        /** 是否启用路由压缩 */
        compress: boolean;
    };
    env: {
        /** 是否启用调试模式 */
        debug: any;
        /** 是否启用性能分析 */
        profiling: boolean;
        /** 是否启用详细日志 */
        verboseLogging: boolean;
        /** 是否启用热重载 */
        hotReload: boolean;
        /** 是否显示性能指标 */
        showMetrics: boolean;
    } | {
        /** 是否压缩资源 */
        compress: boolean;
        /** 是否启用 CDN */
        useCDN: boolean;
        /** 是否启用服务工作器 */
        serviceWorker: boolean;
        /** 是否启用预渲染 */
        prerender: boolean;
        /** 是否启用代码分割 */
        codeSplitting: boolean;
        /** 是否内联关键 CSS */
        inlineCSS: boolean;
    };
};
export default _default;
