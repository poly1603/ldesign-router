import { createRouter, createWebHistory } from '@ldesign/router-vue'
import Home from './views/Home.vue'
import About from './views/About.vue'
import User from './views/User.vue'
import Dashboard from './views/Dashboard.vue'
import NotFound from './views/NotFound.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: '首页' },
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { title: '关于' },
    },
    {
      path: '/user/:id',
      name: 'user',
      component: User,
      meta: { title: '用户详情' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: '仪表盘', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: { title: '404' },
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)

  // 模拟权限检查
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    if (!isAuthenticated) {
      alert('需要登录才能访问仪表盘')
      next('/')
      return
    }
  }

  next()
})

// 全局后置钩子
router.afterEach((to) => {
  document.title = `${to.meta.title} - Vue Router Example` || 'Vue Router Example'
})


