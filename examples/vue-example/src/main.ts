import { createApp } from 'vue'
import { createRouter } from '@ldesign/router-vue'
import App from './App.vue'
import './style.css'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import User from './pages/User.vue'

const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/user/:id', component: User },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
