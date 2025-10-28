/**
 * RouterLink 组件 - 路由导航链接
 */
import { A } from '@solidjs/router'
import type { Component, JSX } from 'solid-js'
import type { RouteLocationRaw } from '@ldesign/router-core'

export interface RouterLinkProps {
  /** 目标路由 */
  to: RouteLocationRaw | string

  /** 是否替换历史记录 */
  replace?: boolean

  /** 自定义类名 */
  class?: string

  /** 活跃链接类名 */
  activeClass?: string

  /** 非活跃链接类名 */
  inactiveClass?: string

  /** 子组件 */
  children?: JSX.Element

  /** 点击事件 */
  onClick?: (event: MouseEvent) => void
}

/**
 * RouterLink 组件
 * 
 * 基于 @solidjs/router 的 A 组件
 * 
 * @example
 * ```tsx
 * <RouterLink to="/about">About</RouterLink>
 * <RouterLink to="/user/123" replace>User</RouterLink>
 * ```
 */
export const RouterLink: Component<RouterLinkProps> = (props) => {
  const href = () => {
    const to = props.to
    return typeof to === 'string' ? to : to.path || '/'
  }

  return (
    <A
      href={href()}
      replace={props.replace}
      class={props.class}
      activeClass={props.activeClass}
      inactiveClass={props.inactiveClass}
      onClick={props.onClick}
    >
      {props.children}
    </A>
  )
}


