import { createApp } from 'vue'
import { createLDesignRouter } from '../src'
import App from './App.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Contact from './views/Contact.vue'

// 创建路由器实例
const router = createLDesignRouter({
  history: 'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: '首页',
        requiresAuth: false,
        keepAlive: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: {
        title: '关于我们',
        requiresAuth: false,
        keepAlive: false
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
      meta: {
        title: '联系我们',
        requiresAuth: true,
        keepAlive: false
      }
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => import('./views/User.vue'),
      meta: {
        title: '用户详情',
        requiresAuth: true,
        keepAlive: true
      }
    }
  ],
  // 启用标签页管理
  tabsManager: {
    enabled: true,
    persistent: true,
    maxTabs: 8,
    closable: true,
    draggable: true
  },
  // 启用面包屑导航
  breadcrumbManager: {
    enabled: true,
    separator: '>',
    showHome: true,
    homeText: '首页',
    homePath: '/'
  },
  // 启用权限管理
  permissionManager: {
    enabled: true,
    strict: true,
    redirectPath: '/login'
  },
  // 启用主题管理
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    persistent: true,
    systemTheme: true
  },
  // 启用国际化
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    persistent: true,
    detectBrowserLanguage: true
  },
  // 启用缓存
  cacheManager: {
    enabled: true,
    strategy: 'lru',
    maxSize: 10,
    persistent: true
  },
  // 启用动画
  animationManager: {
    enabled: true,
    type: 'slide',
    duration: 300,
    easing: 'ease-in-out'
  }
})

// 设置权限和角色
router.permissionManager.setPermissions(['read', 'write', 'admin'])
router.permissionManager.setRoles(['user', 'admin'])

// 添加全局前置守卫
router.beforeEach(async (to, from, next) => {
  console.log('Navigation from', from?.path, 'to', to.path)
  
  // 检查权限
  if (to.meta?.requiresAuth) {
    const hasPermission = router.permissionManager.hasRole('user')
    if (!hasPermission) {
      console.warn('Access denied: insufficient permissions')
      next('/login')
      return
    }
  }
  
  // 更新页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - LDesign Router Demo`
  }
  
  next()
})

// 添加全局后置钩子
router.afterEach((to, from) => {
  console.log('Navigation completed from', from?.path, 'to', to.path)
})

// 创建Vue应用
const app = createApp(App)

// 安装路由器
app.use(router)

// 挂载应用
app.mount('#app')

// 开发环境下暴露路由器实例到全局
if (process.env.NODE_ENV === 'development') {
  ;(window as any).router = router
}