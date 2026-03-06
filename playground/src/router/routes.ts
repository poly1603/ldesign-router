import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'basic',
        name: 'BasicRouting',
        component: () => import('../views/BasicRouting.vue'),
        meta: { title: '基础路由' },
      },
      {
        path: 'nested',
        name: 'NestedRoutes',
        component: () => import('../views/NestedRoutes.vue'),
        meta: { title: '嵌套路由' },
        children: [
          {
            path: '',
            name: 'NestedDefault',
            component: () => import('../views/nested/NestedDefault.vue'),
            meta: { title: '嵌套路由 - 默认' },
          },
          {
            path: 'child-a',
            name: 'ChildA',
            component: () => import('../views/nested/ChildA.vue'),
            meta: { title: '嵌套路由 - 子页面 A' },
          },
          {
            path: 'child-b',
            name: 'ChildB',
            component: () => import('../views/nested/ChildB.vue'),
            meta: { title: '嵌套路由 - 子页面 B' },
          },
        ],
      },
      {
        path: 'dynamic',
        name: 'DynamicRoutes',
        component: () => import('../views/DynamicRoutes.vue'),
        meta: { title: '动态路由' },
      },
      {
        path: 'dynamic/:id',
        name: 'DynamicDetail',
        component: () => import('../views/DynamicDetail.vue'),
        meta: { title: '动态路由详情' },
      },
      {
        path: 'guards',
        name: 'Guards',
        component: () => import('../views/Guards.vue'),
        meta: { title: '导航守卫' },
      },
      {
        path: 'guards/protected',
        name: 'ProtectedPage',
        component: () => import('../views/ProtectedPage.vue'),
        meta: { title: '受保护页面', requiresAuth: true },
      },
      {
        path: 'composables',
        name: 'Composables',
        component: () => import('../views/Composables.vue'),
        meta: { title: 'Composables', description: '路由 Composables 演示' },
      },
      {
        path: 'transitions',
        name: 'Transitions',
        component: () => import('../views/Transitions.vue'),
        meta: { title: '过渡动画' },
      },
      {
        path: 'config',
        name: 'RouteConfig',
        component: () => import('../views/RouteConfig.vue'),
        meta: { title: '路由配置' },
      },
      {
        path: 'async',
        name: 'AsyncData',
        component: () => import('../views/AsyncData.vue'),
        meta: { title: '异步数据' },
      },
      {
        path: 'async/:userId',
        name: 'AsyncDataUser',
        component: () => import('../views/AsyncData.vue'),
        meta: { title: '异步数据 - 用户' },
      },
      {
        path: 'scroll',
        name: 'ScrollBehavior',
        component: () => import('../views/ScrollBehavior.vue'),
        meta: { title: '滚动管理' },
      },
      {
        path: 'widgets',
        name: 'Widgets',
        component: () => import('../views/Widgets.vue'),
        meta: { title: '组件展示' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '404 - 页面未找到' },
  },
]

export default routes
