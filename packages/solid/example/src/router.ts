import { createRouter, createWebHistory } from '@ldesign/router-solid'
import { lazy } from 'solid-js'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const User = lazy(() => import('./pages/User'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

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
  document.title = `${to.meta?.title || ''} - Solid.js Router Example`
})


