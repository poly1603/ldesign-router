/**
 * 统一的日志系统
 *
 * 提供环境感知的日志功能，生产环境自动禁用
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    prefix?: string;
    timestamp?: boolean;
}
declare class Logger {
    private config;
    private isDevelopment;
    private isTest;
    constructor(config?: Partial<LoggerConfig>);
    private shouldLog;
    private format;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, error?: Error | any, ...args: any[]): void;
    group(label: string): void;
    groupEnd(): void;
    table(data: any): void;
    time(label: string): void;
    timeEnd(label: string): void;
    clear(): void;
    /**
     * 创建子日志器
     */
    createChild(prefix: string, config?: Partial<LoggerConfig>): Logger;
    /**
     * 设置日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 启用/禁用日志
     */
    setEnabled(enabled: boolean): void;
}
export declare const logger: {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, error?: Error | any, ...args: any[]) => void;
    group: (label: string) => void;
    groupEnd: () => void;
    table: (data: any) => void;
    time: (label: string) => void;
    timeEnd: (label: string) => void;
    clear: () => void;
    createChild: (prefix: string, config?: Partial<LoggerConfig>) => Logger;
    setLevel: (level: LogLevel) => void;
    setEnabled: (enabled: boolean) => void;
};
export { Logger };
export type { LoggerConfig, LogLevel };
export declare const performanceLogger: Logger;
export declare const securityLogger: Logger;
export declare const debugLogger: Logger;
export declare const analyticsLogger: Logger;
export default logger;
