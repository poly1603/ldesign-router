/**
 * RouterLink 指令
 * 
 * 提供与其他框架一致的路由链接指令
 */

import { Directive, Input, HostListener, HostBinding } from '@angular/core'
import { Router } from '@angular/router'
import type { RouteLocationRaw } from '@ldesign/router-core'

@Directive({
  selector: '[ldRouterLink]',
  standalone: true,
})
export class LdRouterLinkDirective {
  @Input() ldRouterLink!: RouteLocationRaw | string
  @Input() replace = false
  @Input() activeClass = 'router-link-active'

  @HostBinding('attr.href')
  get href(): string {
    if (typeof this.ldRouterLink === 'string') {
      return this.ldRouterLink
    }
    return this.ldRouterLink.path || '/'
  }

  constructor(private router: Router) { }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // 如果是修饰键点击，让浏览器处理
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return
    }

    event.preventDefault()

    const to = this.ldRouterLink
    if (typeof to === 'string') {
      if (this.replace) {
        this.router.navigateByUrl(to, { replaceUrl: true })
      } else {
        this.router.navigateByUrl(to)
      }
    } else {
      const commands = [to.path || '/']
      const extras: any = { replaceUrl: this.replace }

      if (to.query) {
        extras.queryParams = to.query
      }

      if (to.hash) {
        extras.fragment = to.hash
      }

      this.router.navigate(commands, extras)
    }
  }
}

