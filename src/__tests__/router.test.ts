import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLDesignRouter } from '../core/create-router'
import type { RouterOptions } from '../types'

// Mock DOM APIs
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
  },
  writable: true,
})

describe('lDesign Router', () => {
  let routerOptions: RouterOptions

  beforeEach(() => {
    routerOptions = {
      routes: [
        {
          path: '/',
          name: 'Home',
          component: () => Promise.resolve({ default: {} }),
        },
        {
          path: '/about',
          name: 'About',
          component: () => Promise.resolve({ default: {} }),
          meta: {
            title: 'About Page',
            requiresAuth: true,
          },
        },
      ],
    }
  })

  describe('createLDesignRouter', () => {
    it('should create router instance with default options', () => {
      const router = createLDesignRouter(routerOptions)

      expect(router).toBeDefined()
      expect(router.options).toBeDefined()
      expect(router.currentRoute).toBeDefined()
    })

    it('should merge user options with defaults', () => {
      const router = createLDesignRouter({
        ...routerOptions,
        permission: {
          enabled: true,
          mode: 'role',
        },
      })

      expect(router.permissionManager).toBeDefined()
    })

    it('should initialize managers based on config', () => {
      const router = createLDesignRouter({
        ...routerOptions,
        cache: { enabled: true },
        breadcrumb: { enabled: true },
        tabs: { enabled: true },
      })

      expect(router.cacheManager).toBeDefined()
      expect(router.breadcrumbManager).toBeDefined()
      expect(router.tabsManager).toBeDefined()
    })
  })

  describe('navigation', () => {
    it('should navigate to route', async () => {
      const router = createLDesignRouter(routerOptions)

      await router.push({ path: '/about' })

      expect(router.currentRoute.path).toBe('/about')
      expect(router.currentRoute.name).toBe('About')
    })

    it('should resolve route location', () => {
      const router = createLDesignRouter(routerOptions)

      const resolved = router.resolve({ path: '/about' })

      expect(resolved.path).toBe('/about')
      expect(resolved.name).toBe('About')
    })
  })

  describe('route Management', () => {
    it('should add new route', () => {
      const router = createLDesignRouter(routerOptions)

      const newRoute = {
        path: '/contact',
        name: 'Contact',
        component: () => Promise.resolve({ default: {} }),
      }

      router.addRoute(newRoute)

      expect(router.hasRoute('Contact')).toBe(true)
    })

    it('should remove route', () => {
      const router = createLDesignRouter(routerOptions)

      router.removeRoute('About')

      expect(router.hasRoute('About')).toBe(false)
    })

    it('should get all routes', () => {
      const router = createLDesignRouter(routerOptions)

      const routes = router.getRoutes()

      expect(routes).toHaveLength(2)
      expect(routes[0].name).toBe('Home')
      expect(routes[1].name).toBe('About')
    })
  })

  describe('guards', () => {
    it('should add and execute before each guard', async () => {
      const router = createLDesignRouter(routerOptions)
      const guardFn = vi.fn((to, from, next) => next())

      router.beforeEach(guardFn)
      await router.push({ path: '/about' })

      expect(guardFn).toHaveBeenCalled()
    })

    it('should add and execute after each guard', async () => {
      const router = createLDesignRouter(routerOptions)
      const guardFn = vi.fn()

      router.afterEach(guardFn)
      await router.push({ path: '/about' })

      expect(guardFn).toHaveBeenCalled()
    })
  })

  describe('permission Manager', () => {
    it('should check route permissions', () => {
      const router = createLDesignRouter({
        ...routerOptions,
        permission: {
          enabled: true,
          checkRole: () => true,
          checkPermission: () => true,
        },
      })

      const route = router.resolve({ path: '/about' })
      const hasPermission = router.permissionManager.checkRoutePermission(route)

      expect(hasPermission).toBe(true)
    })
  })

  describe('device Router', () => {
    it('should detect device type', () => {
      const router = createLDesignRouter({
        ...routerOptions,
        deviceRouter: {
          enabled: true,
          breakpoints: {
            mobile: 768,
            tablet: 1024,
          },
        },
      })

      const deviceInfo = router.deviceRouter.getDeviceInfo()

      expect(deviceInfo.type).toBeDefined()
      expect(['desktop', 'tablet', 'mobile']).toContain(deviceInfo.type)
    })
  })

  describe('cache Manager', () => {
    it('should manage route cache', () => {
      const router = createLDesignRouter({
        ...routerOptions,
        cache: {
          enabled: true,
          max: 5,
        },
      })

      const stats = router.cacheManager.getCacheStats()

      expect(stats.enabled).toBe(true)
      expect(stats.maxSize).toBe(5)
    })
  })

  describe('breadcrumb Manager', () => {
    it('should generate breadcrumbs', () => {
      const router = createLDesignRouter({
        ...routerOptions,
        breadcrumb: {
          enabled: true,
          showHome: true,
        },
      })

      const breadcrumbs = router.breadcrumbManager.getBreadcrumbs()

      expect(breadcrumbs).toBeDefined()
      expect(Array.isArray(breadcrumbs)).toBe(true)
    })
  })
})
