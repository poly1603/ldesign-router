/**
 * Alpine.js Router Directives
 */

export interface RouteDirective {
  name: string
}

export interface LinkDirective {
  to: string
}

export function xRoute() {
  return {
    name: 'x-route',
  }
}

export function xLink() {
  return {
    name: 'x-link',
  }
}
