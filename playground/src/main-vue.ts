/**
 * LDesign Router Playground - 原生 Vue 模式入口
 *
 * 不使用 Engine，直接通过 Vue Plugin 安装路由
 */
import { createApp } from 'vue'
import App from './App.vue'
import routes from './router/routes'
import { createRouterPlugin, createWebHistory } from '@ldesign/router-vue'

const app = createApp(App)

app.use(createRouterPlugin({
  history: createWebHistory(),
  routes: routes as any,
  autoTitle: {
    template: '%s | LDesign Router',
    defaultTitle: 'Router Playground',
  },
  progress: true,
}))

app.mount('#app')
