import { createRouter, createWebHistory } from '@ldesign/router-vue'
import { DemoHome, DemoAbout, DemoUser, DemoDashboard, DemoNotFound } from '@ldesign/router-vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DemoHome,
      meta: { title: '首页' },
    },
    {
      path: '/about',
      name: 'about',
      component: DemoAbout,
      meta: { title: '关于' },
    },
    {
      path: '/user/:id',
      name: 'user',
      component: DemoUser,
      meta: { title: '用户详情' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DemoDashboard,
      meta: { title: '仪表盘', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: DemoNotFound,
      meta: { title: '404' },
    },
  ],
})

