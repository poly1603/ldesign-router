/**
 * 路由服务容器模块导出
 * 
 * @module router/container
 */

export {
  RouterServiceContainerImpl,
  createRouterServiceContainer,
} from './router-service-container'

export {
  RouterServiceLifetime,
  ROUTER_SERVICES,
} from './types'

export type {
  RouterServiceContainer,
  RouterServiceIdentifier,
  RouterServiceDescriptor,
  RouterServiceProvider,
  Constructor,
  Factory,
  ResolveOptions,
  RouterServiceContainerStats,
} from './types'
