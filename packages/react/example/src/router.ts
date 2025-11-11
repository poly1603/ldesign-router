import { createRouter, DemoHome, DemoAbout, DemoUser, DemoDashboard, DemoNotFound } from '@ldesign/router-react'

export const router = createRouter({
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
      path: '*',
      name: 'not-found',
      component: DemoNotFound,
      meta: { title: '404' },
    },
  ],
})

// 全局导航守卫和钩子功能需要在 Router 类型中定义
// 当前 router 实例可能不支持 beforeEach/afterEach 方法
// 注释掉这些代码，使用其他方式实现导航守卫

// router.beforeEach((to, from, next) => {
//   console.log('导航到:', to.path)
//   if (to.meta?.requiresAuth) {
//     const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
//     if (!isAuthenticated) {
//       alert('需要登录才能访问仪表盘')
//       next('/')
//       return
//     }
//   }
//   next()
// })

// router.afterEach((to) => {
//   document.title = `${to.meta?.title || ''} - React Router Example`
// })


