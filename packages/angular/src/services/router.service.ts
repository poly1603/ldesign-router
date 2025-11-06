/**
 * @ldesign/router-angular 路由服务
 * 
 * Angular 路由服务，基于 @angular/router
 * 
 * @module services/router
 */

import { Injectable, Optional } from '@angular/core'
import { Router, NavigationExtras, UrlTree } from '@angular/router'
import type {
  RouteLocationRaw,
  RouteLocationNormalized,
  RouteParams,
  RouteQuery,
  RouteMeta,
} from '@ldesign/router-core'
import { parseQuery, stringifyQuery } from '@ldesign/router-core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  emit(event: string, data?: any): void
}

/**
 * 当前路由信息
 */
export interface CurrentRoute {
  value?: RouteLocationNormalized
}

/**
 * LDesign 路由服务
 *
 * 提供与其他框架一致的路由 API
 */
@Injectable({
  providedIn: 'root',
})
export class LdRouterService {
  private eventEmitter?: EventEmitter

  constructor(private router: Router) { }

  /**
   * 设置事件发射器
   */
  setEventEmitter(emitter: EventEmitter): void {
    this.eventEmitter = emitter
  }

  /**
   * 获取当前路由（与其他框架适配器保持一致）
   */
  getCurrentRoute(): CurrentRoute {
    let route = this.router.routerState.root
    while (route.firstChild) {
      route = route.firstChild
    }

    const snapshot = route.snapshot
    return {
      value: {
        path: snapshot.url.map(segment => segment.path).join('/') || '/',
        fullPath: this.router.url,
        params: snapshot.params as RouteParams,
        query: snapshot.queryParams as RouteQuery,
        hash: snapshot.fragment || '',
        meta: snapshot.data as RouteMeta,
        matched: snapshot.routeConfig ? [snapshot.routeConfig as any] : [],
      }
    }
  }

  /**
   * 获取当前路由参数（Observable）
   */
  get params$(): Observable<RouteParams> {
    return this.router.events.pipe(
      map(() => {
        let route = this.router.routerState.root
        while (route.firstChild) {
          route = route.firstChild
        }
        return route.snapshot.params as RouteParams
      })
    )
  }

  /**
   * 获取当前查询参数（Observable）
   */
  get query$(): Observable<RouteQuery> {
    return this.router.events.pipe(
      map(() => this.router.routerState.root.snapshot.queryParams as RouteQuery)
    )
  }

  /**
   * 获取当前路由元信息（Observable）
   */
  get meta$(): Observable<RouteMeta> {
    return this.router.events.pipe(
      map(() => {
        let route = this.router.routerState.root
        while (route.firstChild) {
          route = route.firstChild
        }
        return route.snapshot.data as RouteMeta
      })
    )
  }

  /**
   * 导航到新位置
   *
   * @param to - 目标路由
   * @returns Promise
   */
  async push(to: RouteLocationRaw): Promise<boolean> {
    let result: boolean
    if (typeof to === 'string') {
      result = await this.router.navigateByUrl(to)
    } else {
      const commands = [to.path || '/']
      const extras: NavigationExtras = {}

      if (to.query) {
        extras.queryParams = to.query
      }

      if (to.hash) {
        extras.fragment = to.hash
      }

      result = await this.router.navigate(commands, extras)
    }

    // 触发路由导航事件
    if (this.eventEmitter && result) {
      setTimeout(() => {
        this.eventEmitter?.emit('router:navigated', {
          to: this.getCurrentRoute().value
        })
      }, 0)
    }

    return result
  }

  /**
   * 替换当前位置
   *
   * @param to - 目标路由
   * @returns Promise
   */
  async replace(to: RouteLocationRaw): Promise<boolean> {
    let result: boolean
    if (typeof to === 'string') {
      result = await this.router.navigateByUrl(to, { replaceUrl: true })
    } else {
      const commands = [to.path || '/']
      const extras: NavigationExtras = { replaceUrl: true }

      if (to.query) {
        extras.queryParams = to.query
      }

      if (to.hash) {
        extras.fragment = to.hash
      }

      result = await this.router.navigate(commands, extras)
    }

    // 触发路由导航事件
    if (this.eventEmitter && result) {
      setTimeout(() => {
        this.eventEmitter?.emit('router:navigated', {
          to: this.getCurrentRoute().value
        })
      }, 0)
    }

    return result
  }

  /**
   * 前进或后退
   *
   * @param delta - 步数
   */
  go(delta: number): void {
    if (delta === 0) return

    // Angular 没有直接的 go 方法，使用 Location
    const location = (this.router as any).location
    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        location.forward()
      }
    } else {
      for (let i = 0; i < Math.abs(delta); i++) {
        location.back()
      }
    }

    // 触发路由导航事件
    if (this.eventEmitter) {
      setTimeout(() => {
        this.eventEmitter?.emit('router:navigated', {
          to: this.getCurrentRoute().value
        })
      }, 0)
    }
  }

  /**
   * 后退
   */
  back(): void {
    this.go(-1)
  }

  /**
   * 前进
   */
  forward(): void {
    this.go(1)
  }

  /**
   * 获取当前 URL
   */
  get currentUrl(): string {
    return this.router.url
  }

  /**
   * 解析路由
   * 
   * @param to - 目标路由
   * @returns UrlTree
   */
  resolve(to: RouteLocationRaw): UrlTree {
    if (typeof to === 'string') {
      return this.router.parseUrl(to)
    }

    return this.router.createUrlTree([to.path || '/'], {
      queryParams: to.query,
      fragment: to.hash,
    })
  }

  /**
   * 获取底层 Angular Router 实例
   */
  get angularRouter(): Router {
    return this.router
  }
}

