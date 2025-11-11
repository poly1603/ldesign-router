/**
 * @ldesign/router-react 组件
 *
 * @module components
 */

import React from 'react'
import type { ReactNode } from 'react'
import { Outlet, Link, Routes as ReactRoutes, useLocation } from 'react-router-dom'
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
export interface TransitionConfig {
  /** 动画类型 */
  type?: 'fade' | 'none'
  /** 时长（毫秒） */
  duration?: number
  /** 缓动函数 */
  easing?: string
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 带最小淡入动画的 RouterView
 */
export function RouterView(_: RouterViewProps & { animation?: boolean | TransitionConfig }) {
  const location = useLocation()
  const config: Required<TransitionConfig> = React.useMemo(() => {
    const def: Required<TransitionConfig> = { type: 'fade', duration: 200, easing: 'ease-in-out', enabled: true }
    const a = (_ as any).animation
    if (a === false) return { ...def, enabled: false }
    if (a && typeof a === 'object') return { ...def, ...a, enabled: a.enabled ?? true }
    return def
  }, [(_ as any).animation])

  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    setVisible(false)
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [location.key])

  const style: React.CSSProperties = config.enabled && config.type !== 'none'
    ? { opacity: visible ? 1 : 0, transition: `opacity ${config.duration}ms ${config.easing}` }
    : undefined

  return (
    <div key={location.key} style={style}>
      <Outlet />
    </div>
  )
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



// ==================== 内置 Demo 页面（仅供 example 引用） ====================
export function DemoHome() {
  return (
    <section className="page">
      <h2>首页</h2>
      <p>来自 @ldesign/router-react 的内置示例页 Home。</p>
    </section>
  )
}

export function DemoAbout() {
  return (
    <section className="page">
      <h2>关于</h2>
      <p>来自 @ldesign/router-react 的内置示例页 About。</p>
    </section>
  )
}

export function DemoUser() {
  return (
    <section className="page">
      <h2>用户</h2>
      <p>来自 @ldesign/router-react 的内置示例页 User。</p>
    </section>
  )
}

export function DemoDashboard() {
  return (
    <section className="page">
      <h2>仪表盘</h2>
      <p>来自 @ldesign/router-react 的内置示例页 Dashboard。</p>
    </section>
  )
}

export function DemoNotFound() {
  return (
    <section className="page">
      <h2>404</h2>
      <p>未找到页面。</p>
    </section>
  )
}
