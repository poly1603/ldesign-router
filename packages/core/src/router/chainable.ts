/**
 * @ldesign/router-core 链式路由API
 * 
 * @description
 * 提供流畅的链式API来构建和操作路由。
 * 
 * **特性**：
 * - 流畅的链式调用
 * - 类型安全
 * - 导航API
 * - 守卫配置
 * - 元数据管理
 * 
 * @module router/chainable
 */

import type { 
  RouteRecordRaw, 
  RouteLocationRaw,
  NavigationGuard,
  RouteComponent,
  RouteMeta,
} from '../types'

/**
 * 路由构建器选项
 */
export interface RouteBuilderOptions {
  /** 路径 */
  path: string
  
  /** 名称 */
  name?: string | symbol
  
  /** 组件 */
  component?: RouteComponent
  
  /** 命名视图组件 */
  components?: Record<string, RouteComponent>
  
  /** 重定向 */
  redirect?: string | RouteLocationRaw
  
  /** 路由元信息 */
  meta?: RouteMeta
  
  /** Props */
  props?: boolean | Record<string, any> | ((route: any) => Record<string, any>)
  
  /** 别名 */
  alias?: string | string[]
  
  /** 子路由 */
  children?: RouteRecordRaw[]
  
  /** 前置守卫 */
  beforeEnter?: NavigationGuard | NavigationGuard[]
}

/**
 * 路由构建器
 */
export class RouteBuilder {
  private config: RouteBuilderOptions

  constructor(path: string) {
    this.config = { path }
  }

  // ==================== 基础配置 ====================

  /**
   * 设置路由名称
   */
  name(name: string | symbol): this {
    this.config.name = name
    return this
  }

  /**
   * 设置组件
   */
  component(component: RouteComponent): this {
    this.config.component = component
    return this
  }

  /**
   * 设置命名视图组件
   */
  components(components: Record<string, RouteComponent>): this {
    this.config.components = components
    return this
  }

  /**
   * 设置重定向
   */
  redirect(to: string | RouteLocationRaw): this {
    this.config.redirect = to
    return this
  }

  /**
   * 设置别名
   */
  alias(alias: string | string[]): this {
    this.config.alias = alias
    return this
  }

  /**
   * 设置Props
   */
  props(props: boolean | Record<string, any> | ((route: any) => Record<string, any>)): this {
    this.config.props = props
    return this
  }

  // ==================== 元数据 ====================

  /**
   * 设置元数据
   */
  meta(meta: RouteMeta): this {
    this.config.meta = { ...this.config.meta, ...meta }
    return this
  }

  /**
   * 设置单个元数据字段
   */
  metaField(key: string, value: any): this {
    if (!this.config.meta) {
      this.config.meta = {}
    }
    this.config.meta[key] = value
    return this
  }

  /**
   * 设置是否需要认证
   */
  requiresAuth(required: boolean = true): this {
    return this.metaField('requiresAuth', required)
  }

  /**
   * 设置所需角色
   */
  roles(roles: string[]): this {
    return this.metaField('roles', roles)
  }

  /**
   * 设置页面标题
   */
  title(title: string): this {
    return this.metaField('title', title)
  }

  /**
   * 设置图标
   */
  icon(icon: string): this {
    return this.metaField('icon', icon)
  }

  /**
   * 设置是否在菜单中隐藏
   */
  hidden(hidden: boolean = true): this {
    return this.metaField('hidden', hidden)
  }

  /**
   * 设置排序
   */
  order(order: number): this {
    return this.metaField('order', order)
  }

  // ==================== 守卫 ====================

  /**
   * 设置前置守卫
   */
  beforeEnter(guard: NavigationGuard | NavigationGuard[]): this {
    this.config.beforeEnter = guard
    return this
  }

  /**
   * 添加前置守卫
   */
  addGuard(guard: NavigationGuard): this {
    if (!this.config.beforeEnter) {
      this.config.beforeEnter = []
    } else if (!Array.isArray(this.config.beforeEnter)) {
      this.config.beforeEnter = [this.config.beforeEnter]
    }
    this.config.beforeEnter.push(guard)
    return this
  }

  // ==================== 子路由 ====================

  /**
   * 添加子路由
   */
  child(path: string, configure?: (builder: RouteBuilder) => void): this {
    const builder = new RouteBuilder(path)
    
    if (configure) {
      configure(builder)
    }

    if (!this.config.children) {
      this.config.children = []
    }

    this.config.children.push(builder.build())
    return this
  }

  /**
   * 添加多个子路由
   */
  children(children: RouteRecordRaw[] | ((builder: RouteBuilder) => void)[]): this {
    if (!this.config.children) {
      this.config.children = []
    }

    if (Array.isArray(children)) {
      if (children.length > 0 && typeof children[0] === 'function') {
        // 配置函数数组
        for (const configure of children as ((builder: RouteBuilder) => void)[]) {
          const builder = new RouteBuilder('')
          configure(builder)
          this.config.children.push(builder.build())
        }
      } else {
        // 路由配置数组
        this.config.children.push(...(children as RouteRecordRaw[]))
      }
    }

    return this
  }

  // ==================== 构建 ====================

  /**
   * 构建路由配置
   */
  build(): RouteRecordRaw {
    return { ...this.config } as RouteRecordRaw
  }

  /**
   * 克隆构建器
   */
  clone(): RouteBuilder {
    const builder = new RouteBuilder(this.config.path)
    builder.config = { ...this.config }
    return builder
  }
}

/**
 * 路由器链式API
 */
export class ChainableRouter {
  private routes: RouteRecordRaw[] = []

  // ==================== 路由配置 ====================

  /**
   * 添加路由
   */
  route(path: string, configure?: (builder: RouteBuilder) => void): this {
    const builder = new RouteBuilder(path)
    
    if (configure) {
      configure(builder)
    }

    this.routes.push(builder.build())
    return this
  }

  /**
   * 添加多个路由
   */
  routes(routes: RouteRecordRaw[]): this {
    this.routes.push(...routes)
    return this
  }

  /**
   * 获取路由配置
   */
  getRoutes(): RouteRecordRaw[] {
    return this.routes
  }

  /**
   * 清空路由
   */
  clear(): this {
    this.routes = []
    return this
  }

  // ==================== 快捷方法 ====================

  /**
   * 添加页面路由
   */
  page(path: string, component: RouteComponent, name?: string): this {
    return this.route(path, builder => {
      builder.component(component)
      if (name) builder.name(name)
    })
  }

  /**
   * 添加重定向路由
   */
  redirectTo(from: string, to: string | RouteLocationRaw): this {
    return this.route(from, builder => {
      builder.redirect(to)
    })
  }

  /**
   * 添加分组路由
   */
  group(prefix: string, configure: (router: ChainableRouter) => void): this {
    const group = new ChainableRouter()
    configure(group)

    const groupRoutes = group.getRoutes().map(route => ({
      ...route,
      path: prefix + (route.path.startsWith('/') ? '' : '/') + route.path,
    }))

    this.routes.push(...groupRoutes)
    return this
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建路由构建器
 */
export function route(path: string, configure?: (builder: RouteBuilder) => void): RouteRecordRaw {
  const builder = new RouteBuilder(path)
  
  if (configure) {
    configure(builder)
  }

  return builder.build()
}

/**
 * 创建链式路由器
 */
export function createChainableRouter(): ChainableRouter {
  return new ChainableRouter()
}

// ==================== 实用工具 ====================

/**
 * 路由组合器
 */
export class RouteComposer {
  private routes: RouteRecordRaw[] = []

  /**
   * 添加路由
   */
  add(route: RouteRecordRaw | RouteRecordRaw[]): this {
    if (Array.isArray(route)) {
      this.routes.push(...route)
    } else {
      this.routes.push(route)
    }
    return this
  }

  /**
   * 合并路由
   */
  merge(...composers: RouteComposer[]): this {
    for (const composer of composers) {
      this.routes.push(...composer.getRoutes())
    }
    return this
  }

  /**
   * 过滤路由
   */
  filter(predicate: (route: RouteRecordRaw) => boolean): this {
    this.routes = this.routes.filter(predicate)
    return this
  }

  /**
   * 映射路由
   */
  map(mapper: (route: RouteRecordRaw) => RouteRecordRaw): this {
    this.routes = this.routes.map(mapper)
    return this
  }

  /**
   * 获取路由
   */
  getRoutes(): RouteRecordRaw[] {
    return this.routes
  }

  /**
   * 清空
   */
  clear(): this {
    this.routes = []
    return this
  }
}

/**
 * 创建路由组合器
 */
export function compose(): RouteComposer {
  return new RouteComposer()
}
