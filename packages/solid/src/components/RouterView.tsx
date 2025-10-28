/**
 * RouterView 组件 - 渲染当前路由匹配的组件
 */
import { Outlet } from '@solidjs/router'
import type { Component, JSX } from 'solid-js'

export interface RouterViewProps {
  /** 子组件 */
  children?: JSX.Element
}

/**
 * RouterView 组件
 * 
 * 基于 @solidjs/router 的 Outlet
 * 
 * @example
 * ```tsx
 * <RouterView />
 * ```
 */
export const RouterView: Component<RouterViewProps> = (props) => {
  return <Outlet />
}


