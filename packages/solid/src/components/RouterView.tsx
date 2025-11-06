/**
 * RouterView 组件 - 渲染当前路由匹配的组件
 */
import type { Component, JSX } from 'solid-js'

export interface RouterViewProps {
  /** 子组件 */
  children?: JSX.Element
}

/**
 * RouterView 组件
 *
 * Solid Router 使用 children 来渲染嵌套路由
 *
 * @example
 * ```tsx
 * <RouterView />
 * ```
 */
export const RouterView: Component<RouterViewProps> = (props) => {
  return <>{props.children}</>
}


