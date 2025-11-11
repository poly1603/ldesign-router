import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

const app = createApp(App)

app.provide('routerAnimationConfig', { type: 'fade', duration: 250, mode: 'out-in', easing: 'ease-in-out' })
app.use(router)
app.mount('#app')


