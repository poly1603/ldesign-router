/**
 * @ldesign/router 组合式 API
 *
 * 提供便捷的 Vue 3 Composition API 钩子函数
 */
import type { ComputedRef } from 'vue';
import type { NavigationGuard, RouteLocationNormalized, RouteLocationRaw, RouteMeta, RouteParams, RouteQuery, RouteRecordNormalized, UseRouteReturn, UseRouterReturn } from '../types';
/**
 * 获取路由器实例（增强版）
 */
export declare function useRouter(): UseRouterReturn & {
    isNavigating: ComputedRef<boolean>;
    canGoBack: ComputedRef<boolean>;
    canGoForward: ComputedRef<boolean>;
    routeHistory: ComputedRef<RouteLocationNormalized[]>;
    goHome: () => Promise<void>;
    reload: () => Promise<void>;
    prefetch: (to: RouteLocationRaw) => Promise<void>;
};
/**
 * 获取当前路由信息（增强版）
 */
export declare function useRoute(): UseRouteReturn & {
    isHome: ComputedRef<boolean>;
    isNotFound: ComputedRef<boolean>;
    breadcrumbs: ComputedRef<Array<{
        name: string;
        path: string;
        meta: any;
    }>>;
    parent: ComputedRef<RouteRecordNormalized | undefined>;
    hasParams: ComputedRef<boolean>;
    hasQuery: ComputedRef<boolean>;
    paramKeys: ComputedRef<string[]>;
    queryKeys: ComputedRef<string[]>;
    matchedNames: ComputedRef<string[]>;
    depth: ComputedRef<number>;
    is: (name: string | string[]) => boolean;
    getParam: (key: string, defaultValue?: any) => any;
    getQuery: (key: string, defaultValue?: any) => any;
};
/**
 * 获取路由参数
 */
export declare function useParams(): ComputedRef<RouteParams>;
/**
 * 获取查询参数
 */
export declare function useQuery(): ComputedRef<RouteQuery>;
/**
 * 获取哈希值
 */
export declare function useHash(): ComputedRef<string>;
/**
 * 获取路由元信息
 */
export declare function useMeta(): ComputedRef<RouteMeta>;
/**
 * 获取匹配的路由记录
 */
export declare function useMatched(): ComputedRef<RouteRecordNormalized[]>;
/**
 * 导航控制钩子
 */
export declare function useNavigation(): {
    /**
     * 导航到指定路由
     */
    push: (to: RouteLocationRaw) => Promise<import("../types").NavigationFailure | void | undefined>;
    /**
     * 替换当前路由
     */
    replace: (to: RouteLocationRaw) => Promise<import("../types").NavigationFailure | void | undefined>;
    /**
     * 历史导航
     */
    go: (delta: number) => void;
    /**
     * 后退
     */
    back: () => void;
    /**
     * 前进
     */
    forward: () => void;
    /**
     * 导航状态
     */
    isNavigating: ComputedRef<boolean>;
    direction: ComputedRef<"unknown" | "forward" | "backward">;
    lastNavigationTime: ComputedRef<number>;
};
/**
 * 组件内路由更新守卫
 */
export declare function onBeforeRouteUpdate(guard: NavigationGuard): void;
/**
 * 组件内路由离开守卫
 */
export declare function onBeforeRouteLeave(guard: NavigationGuard): void;
/**
 * 链接属性和方法
 */
export interface UseLinkOptions {
    to: ComputedRef<RouteLocationRaw> | RouteLocationRaw;
    replace?: boolean;
}
/**
 * 链接返回值
 */
export interface UseLinkReturn {
    href: ComputedRef<string>;
    route: ComputedRef<RouteLocationNormalized>;
    isActive: ComputedRef<boolean>;
    isExactActive: ComputedRef<boolean>;
    navigate: (e?: Event) => Promise<void>;
}
/**
 * 链接功能钩子
 */
export declare function useLink(options: UseLinkOptions): UseLinkReturn;
/**
 * 检查是否在路由器上下文中
 */
export declare function hasRouter(): boolean;
/**
 * 检查是否在路由上下文中
 */
export declare function hasRoute(): boolean;
declare const _default: {
    useRouter: typeof useRouter;
    useRoute: typeof useRoute;
    useParams: typeof useParams;
    useQuery: typeof useQuery;
    useHash: typeof useHash;
    useMeta: typeof useMeta;
    useMatched: typeof useMatched;
    useNavigation: typeof useNavigation;
    useLink: typeof useLink;
    onBeforeRouteUpdate: typeof onBeforeRouteUpdate;
    onBeforeRouteLeave: typeof onBeforeRouteLeave;
    hasRouter: typeof hasRouter;
    hasRoute: typeof hasRoute;
};
export default _default;
export { useDeviceComponent } from './useDeviceComponent';
export type {} from './useDeviceComponent';
export { useDeviceRoute } from './useDeviceRoute';
export type { UseDeviceRouteOptions, UseDeviceRouteReturn, } from './useDeviceRoute';
