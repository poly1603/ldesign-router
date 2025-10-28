import { createRouter, createWebHistory } from '@ldesign/router-svelte'
import Home from './pages/Home.svelte'
import About from './pages/About.svelte'
import User from './pages/User.svelte'
import Dashboard from './pages/Dashboard.svelte'
import NotFound from './pages/NotFound.svelte'

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
      path: '*',
      name: 'not-found',
      component: NotFound,
      meta: { title: '404' },
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)

  if (to.meta?.requiresAuth) {
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
  document.title = `${to.meta?.title || ''} - Svelte Router Example`
})


