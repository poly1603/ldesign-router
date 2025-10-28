/**
 * @ldesign/router-angular 路由守卫
 * 
 * @module guards
 */

import { inject } from '@angular/core'
import type { CanActivateFn, CanDeactivateFn } from '@angular/router'

/**
 * 认证守卫工厂函数
 * 
 * @param checkFn - 检查函数
 * @returns CanActivateFn
 * 
 * @example
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [authGuard(() => isAuthenticated())]
 *   }
 * ]
 * ```
 */
export function authGuard(checkFn: () => boolean | Promise<boolean>): CanActivateFn {
  return async () => {
    return await checkFn()
  }
}

/**
 * 创建自定义守卫
 * 
 * @param guardFn - 守卫函数
 * @returns CanActivateFn
 */
export function createGuard(guardFn: CanActivateFn): CanActivateFn {
  return guardFn
}

/**
 * 退出确认守卫
 * 
 * @param message - 确认消息
 * @returns CanDeactivateFn
 */
export function confirmDeactivateGuard<T = any>(message = '确定要离开吗？'): CanDeactivateFn<T> {
  return () => {
    return confirm(message)
  }
}

