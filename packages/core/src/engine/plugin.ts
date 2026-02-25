/**
 * @ldesign/router Engine 插件
 */
import type { RouterEnginePluginOptions } from './types'
import { createRouterServiceContainer } from '../di/service-container'

export const routerStateKeys = {
  CONTAINER: 'router:container' as const,
  MODE: 'router:mode' as const,
  BASE: 'router:base' as const,
} as const

export const routerEventKeys = {
  INSTALLED: 'router:installed' as const,
  UNINSTALLED: 'router:uninstalled' as const,
  NAVIGATED: 'router:navigated' as const,
  BEFORE_NAVIGATE: 'router:beforeNavigate' as const,
  AFTER_NAVIGATE: 'router:afterNavigate' as const,
} as const

export function createRouterEnginePlugin(options: RouterEnginePluginOptions = {}) {
  let container: any = null
  return {
    name: 'router',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      container = createRouterServiceContainer()
      engine.state?.set(routerStateKeys.CONTAINER, container)
      if ((options as any).mode) engine.state?.set(routerStateKeys.MODE, (options as any).mode)
      if ((options as any).base) engine.state?.set(routerStateKeys.BASE, (options as any).base)
      engine.events?.emit(routerEventKeys.INSTALLED, { name: 'router' })
      engine.logger?.info('[Router Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      container?.dispose?.(); container = null
      engine.state?.delete(routerStateKeys.CONTAINER)
      engine.state?.delete(routerStateKeys.MODE)
      engine.state?.delete(routerStateKeys.BASE)
      engine.events?.emit(routerEventKeys.UNINSTALLED, {})
      engine.logger?.info('[Router Plugin] uninstalled')
    },
  }
}
