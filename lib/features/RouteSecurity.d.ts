/**
 * 路由安全系统
 * 提供权限管理、认证守卫、CSRF防护、XSS防护
 */
import type { NavigationGuard, RouteLocationNormalized, Router } from '../types';
export interface SecurityConfig {
    auth?: {
        enabled?: boolean;
        loginRoute?: string;
        tokenKey?: string;
        tokenStorage?: 'localStorage' | 'sessionStorage' | 'cookie';
        refreshToken?: boolean;
        tokenExpiry?: number;
    };
    permission?: {
        enabled?: boolean;
        mode?: 'role' | 'permission' | 'mixed';
        defaultRole?: string;
        roleHierarchy?: Record<string, string[]>;
        cachePermissions?: boolean;
    };
    csrf?: {
        enabled?: boolean;
        tokenName?: string;
        headerName?: string;
        cookieName?: string;
        validateMethods?: string[];
    };
    xss?: {
        enabled?: boolean;
        sanitizeParams?: boolean;
        sanitizeQuery?: boolean;
        whitelist?: string[];
        customSanitizer?: (value: string) => string;
    };
}
export declare class AuthManager {
    private token;
    private refreshTimer?;
    private config;
    state: {
        isAuthenticated: boolean;
        user: any;
        loading: boolean;
        error: Error | null;
    };
    constructor(config?: SecurityConfig['auth']);
    private loadToken;
    private getStorage;
    private getCookie;
    private setCookie;
    private deleteCookie;
    validateToken(): Promise<boolean>;
    private parseJWT;
    private setupTokenRefresh;
    refreshToken(): Promise<void>;
    login(_credentials: any): Promise<boolean>;
    setToken(token: string): void;
    logout(): void;
    getAuthHeader(): Record<string, string>;
    createAuthGuard(options?: AuthGuardOptions): NavigationGuard;
}
export declare class PermissionManager {
    private permissions;
    private roles;
    private config;
    private permissionCache;
    constructor(config?: SecurityConfig['permission']);
    addRole(role: string): void;
    removeRole(role: string): void;
    setRoles(roles: string[]): void;
    addPermission(permission: string): void;
    removePermission(permission: string): void;
    setPermissions(permissions: string[]): void;
    hasPermission(permission: string | string[]): boolean;
    hasRole(role: string | string[]): boolean;
    hasAnyPermission(permissions: string[]): boolean;
    hasAnyRole(roles: string[]): boolean;
    createPermissionGuard(): NavigationGuard;
}
export declare class CSRFProtection {
    private token;
    private config;
    constructor(config?: SecurityConfig['csrf']);
    private generateToken;
    private setupToken;
    private setCookie;
    getToken(): string;
    refreshToken(): void;
    validateRequest(method: string, token?: string): boolean;
    getHeaders(): Record<string, string>;
    createInterceptor(): {
        request: (config: any) => any;
        response: (response: any) => any;
    };
}
export declare class XSSProtection {
    private config;
    private sanitizer;
    constructor(config?: SecurityConfig['xss']);
    private defaultSanitizer;
    sanitize(value: any): any;
    sanitizeRoute(route: RouteLocationNormalized): RouteLocationNormalized;
    createXSSGuard(): NavigationGuard;
    validate(content: string): ValidationResult;
}
export declare class RouteSecurityManager {
    private authManager;
    private permissionManager;
    private csrfProtection;
    private xssProtection;
    private router;
    private config;
    private guardCleanups;
    constructor(router: Router, config?: SecurityConfig);
    private setupGuards;
    login(credentials: any): Promise<boolean>;
    logout(): void;
    can(permission: string | string[]): boolean;
    hasRole(role: string | string[]): boolean;
    setUserPermissions(permissions: string[]): void;
    setUserRoles(roles: string[]): void;
    getSecurityHeaders(): Record<string, string>;
    validateContent(content: string): ValidationResult;
    sanitize(value: any): any;
    getCurrentUser(): any;
    isAuthenticated(): boolean;
    destroy(): void;
}
interface AuthGuardOptions {
    requiresAuth?: boolean;
    redirect?: string;
}
interface ValidationResult {
    safe: boolean;
    threats: string[];
    sanitized: string;
}
export declare function setupRouteSecurity(router: Router, config?: SecurityConfig): RouteSecurityManager;
export declare function checkPermission(permission: string | string[]): boolean;
export declare function isAuthenticated(): boolean;
export declare function getCurrentUser(): any;
export declare function sanitizeContent(value: any): any;
export {};
