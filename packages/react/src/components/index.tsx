/**
 * @ldesign/router-react 组件
 * 
 * @module components
 */

import React from 'react'
import type { ReactNode } from 'react'
import { Outlet, Link, Routes as ReactRoutes } from 'react-router-dom'
import type { RouteLocationRaw } from '@ldesign/router-core'

// ==================== RouterView ====================

export interface RouterViewProps {
  /** 子组件 */
  children?: ReactNode
}

/**
 * RouterView 组件
 * 
 * 基于 react-router-dom 的 Outlet
 */
export function RouterView(props: RouterViewProps) {
  return <Outlet />
}

// ==================== RouterLink ====================

export interface RouterLinkProps {
  /** 目标路由 */
  to: RouteLocationRaw | string

  /** 是否替换历史记录 */
  replace?: boolean

  /** 自定义类名 */
  className?: string

  /** 活跃链接类名 */
  activeClassName?: string

  /** 子组件 */
  children?: ReactNode

  /** 点击事件 */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

/**
 * RouterLink 组件
 * 
 * 基于 react-router-dom 的 Link
 */
export function RouterLink({
  to,
  replace,
  className,
  children,
  onClick,
}: RouterLinkProps) {
  const path = typeof to === 'string' ? to : to.path || '/'

  return (
    <Link
      to={path}
      replace={replace}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

// ==================== Routes ====================

export interface RoutesProps {
  /** 子路由 */
  children?: ReactNode
}

/**
 * Routes 组件
 * 
 * 基于 react-router-dom 的 Routes
 */
export function Routes({ children }: RoutesProps) {
  return <ReactRoutes>{children}</ReactRoutes>
}

