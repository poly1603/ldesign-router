/**
 * LDesign Router Playground - Engine 模式入口
 *
 * 使用 @ldesign/engine-vue3 创建应用，通过 engine plugin 安装路由
 */
import App from './App.vue'
import routes from './router/routes'
import { createVueEngine } from '@ldesign/engine-vue3'
import { createRouterEnginePlugin } from '@ldesign/router-vue'

const engine = createVueEngine({
  name: 'Router Playground',
  debug: true,
  app: {
    rootComponent: App,
  },
  plugins: [
    createRouterEnginePlugin({
      routes: routes as any,
      mode: 'history',
      base: '/',
      debug: true,
      animation: { type: 'fade', duration: 200 },
    }),
  ],
})

engine.mount('#app')
