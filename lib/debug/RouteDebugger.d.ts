/**
 * 路由调试工具
 * 提供可视化路由树、路由追踪、性能分析、错误诊断
 */
import type { RouteLocationNormalized, Router, RouteRecordNormalized } from '../types';
export interface DebugConfig {
    enabled?: boolean;
    visualizer?: {
        enabled?: boolean;
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        hotkey?: string;
        theme?: 'light' | 'dark' | 'auto';
    };
    tracer?: {
        enabled?: boolean;
        maxHistory?: number;
        captureStack?: boolean;
        logLevel?: 'verbose' | 'info' | 'warn' | 'error';
    };
    performance?: {
        enabled?: boolean;
        slowThreshold?: number;
        measureComponents?: boolean;
        reportInterval?: number;
    };
    errorDiagnostics?: {
        enabled?: boolean;
        captureErrors?: boolean;
        reportErrors?: boolean;
        errorEndpoint?: string;
    };
}
export declare class RouteVisualizer {
    private container?;
    private isVisible;
    private router;
    private config;
    constructor(router: Router, config?: DebugConfig['visualizer']);
    private init;
    private createContainer;
    private getContainerStyles;
    private getTheme;
    private setupHotkey;
    toggle(): void;
    render(): void;
    private renderRouteTree;
    private renderRouteNode;
    destroy(): void;
}
export declare class RouteTracer {
    private history;
    private config;
    private router;
    constructor(router: Router, config?: DebugConfig['tracer']);
    private setupTracing;
    private addTrace;
    private generateId;
    private serializeRoute;
    private serializeError;
    private log;
    getHistory(): RouteTrace[];
    getRecentErrors(count?: number): RouteTrace[];
    clearHistory(): void;
    exportTraces(): string;
}
export declare class RoutePerformanceAnalyzer {
    private metrics;
    private componentTimings;
    private config;
    private router;
    private reportTimer?;
    constructor(router: Router, config?: DebugConfig['performance']);
    private setupMeasurement;
    private addMetric;
    measureComponent(name: string, fn: () => void): void;
    private analyzeSlow;
    private startAutoReporting;
    generateReport(): PerformanceReport;
    private percentile;
    destroy(): void;
}
export declare class RouteErrorDiagnostics {
    private errors;
    private config;
    private router;
    constructor(router: Router, config?: DebugConfig['errorDiagnostics']);
    private setupErrorCapture;
    private captureError;
    private diagnoseError;
    private outputDiagnosis;
    private reportError;
    private generateId;
    getErrors(): ErrorRecord[];
    clearErrors(): void;
}
export declare class RouteDebugger {
    private visualizer?;
    private tracer?;
    private performanceAnalyzer?;
    private errorDiagnostics?;
    private router;
    private config;
    constructor(router: Router, config?: DebugConfig);
    private setupConsoleCommands;
    getDebugInfo(): DebugInfo;
    destroy(): void;
}
interface RouteTrace {
    id: string;
    from?: SerializedRoute;
    to?: SerializedRoute;
    timestamp: number;
    duration?: number;
    type: 'navigation' | 'error';
    status: 'pending' | 'success' | 'failed';
    error?: SerializedError;
    stack?: string;
}
interface SerializedRoute {
    path: string;
    name?: string | symbol | undefined;
    params?: any;
    query?: any;
    hash?: string;
    meta?: any;
}
interface SerializedError {
    message: string;
    type: string;
    stack?: string;
}
interface PerformanceReport {
    timestamp: number;
    routes: Array<{
        route: string;
        count: number;
        avg: number;
        min: number;
        max: number;
        p95: number;
    }>;
    components: Array<{
        component: string;
        count: number;
        avg: number;
        min: number;
        max: number;
    }>;
    summary: {
        totalNavigations: number;
        avgNavigationTime: number;
        slowestRoute: string;
        slowestTime: number;
    };
}
interface ErrorRecord {
    id: string;
    timestamp: number;
    error: {
        message: string;
        stack?: string;
        name: string;
    };
    source: string;
    route: string;
    extra?: any;
    diagnosis: ErrorDiagnosis;
}
interface ErrorDiagnosis {
    type: string;
    category: string;
    severity: 'warning' | 'error' | 'critical';
    suggestions: string[];
}
interface DebugInfo {
    currentRoute: RouteLocationNormalized;
    routes: RouteRecordNormalized[];
    history: RouteTrace[];
    errors: ErrorRecord[];
    performance: PerformanceReport;
}
export declare function setupRouteDebugger(router: Router, config?: DebugConfig): RouteDebugger;
export declare function getDebugInfo(): DebugInfo | null;
export declare function getRouteDebugger(): RouteDebugger | null;
export declare function debugLog(...args: any[]): void;
export declare function debugWarn(...args: any[]): void;
export declare function debugError(...args: any[]): void;
export {};
