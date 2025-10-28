/**
 * @ldesign/router-angular 路由服务
 * 
 * Angular 路由服务，基于 @angular/router
 * 
 * @module services/router
 */

import { Injectable } from '@angular/core'
import { Router, NavigationExtras, UrlTree } from '@angular/router'
import type {
  RouteLocationRaw,
  RouteParams,
  RouteQuery,
  RouteMeta,
} from '@ldesign/router-core'
import { parseQuery, stringifyQuery } from '@ldesign/router-core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * LDesign 路由服务
 * 
 * 提供与其他框架一致的路由 API
 */
@Injectable({
  providedIn: 'root',
})
export class LdRouterService {
  constructor(private router: Router) { }

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
    if (typeof to === 'string') {
      return this.router.navigateByUrl(to)
    }

    const commands = [to.path || '/']
    const extras: NavigationExtras = {}

    if (to.query) {
      extras.queryParams = to.query
    }

    if (to.hash) {
      extras.fragment = to.hash
    }

    return this.router.navigate(commands, extras)
  }

  /**
   * 替换当前位置
   * 
   * @param to - 目标路由
   * @returns Promise
   */
  async replace(to: RouteLocationRaw): Promise<boolean> {
    if (typeof to === 'string') {
      return this.router.navigateByUrl(to, { replaceUrl: true })
    }

    const commands = [to.path || '/']
    const extras: NavigationExtras = { replaceUrl: true }

    if (to.query) {
      extras.queryParams = to.query
    }

    if (to.hash) {
      extras.fragment = to.hash
    }

    return this.router.navigate(commands, extras)
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

