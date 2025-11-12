/**
 * @ldesign/router-core 类型定义统一导出
 * 
 * @module types
 */

// 基础类型
export type {
  RouteParams,
  RouteQuery,
  RouteMeta,
  ExtractRouteParams,
  RouteParamsFor,
  TypedRouteParams,
  TypedRouteQuery,
} from './base'

// 历史管理类型
export type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationInformation,
  RouterHistory,
} from './history'

export {
  NavigationType,
} from './history'

// 导航相关类型
export type {
  RouteLocationBase,
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteRecordBase,
  RouteRecordRaw,
  RouteRecordNormalized,
  NavigationGuard,
  NavigationGuardNext,
  NavigationGuardNextCallback,
  NavigationGuardReturn,
  NavigationHookAfter,
  NavigationFailure,
  ScrollPosition,
  ScrollPositionElement,
  ScrollBehavior,
} from './navigation'

export {
  NavigationFailureType,
} from './navigation'

// 类型安全系统
export type {
  ExtractRouteParamsFromPath,
  TypedRouteRecordRaw,
  TypedRouteLocation,
  ExtendedRouteMeta,
  RouteConfigBuilder,
  NamedRoutes,
  TypedNavigationGuard,
  RouteGroup,
  RouteModule,
  MergeRouteTypes,
  RouteParamsType,
  RouteQueryType,
  RouteMetaType,
  OptionalParamRoute,
  RequiredParamRoute,
} from './typed'

export {
  isTypedRoute,
  isNamedRoute,
  isPathRoute,
  createTypedRoute,
  defineRoute,
  defineRouteGroup,
  defineRouteModule,
  mergeRouteMeta,
} from './typed'

