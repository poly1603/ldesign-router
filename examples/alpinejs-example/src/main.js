import { createRouter, createWebHashHistory } from '@ldesign/router-alpinejs'

// 创建路由器
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
    },
    {
      path: '/about',
      name: 'about',
    },
    {
      path: '/contact',
      name: 'contact',
    },
    {
      path: '/user/:id',
      name: 'user',
    },
  ],
})

// 路由视图内容
const views = {
  home: `
    <h2>🏠 首页</h2>
    <p>欢迎使用 @ldesign/router-alpinejs！</p>
    <p>这是一个简单的 Alpine.js 路由示例。</p>
    <h3>特性：</h3>
    <ul>
      <li>✅ 基于 @ldesign/router-core</li>
      <li>✅ Hash 模式路由</li>
      <li>✅ 路由参数支持</li>
      <li>✅ 编程式导航</li>
      <li>✅ 类型安全</li>
    </ul>
  `,
  about: `
    <h2>ℹ️ 关于</h2>
    <p>这是关于页面。</p>
    <p>@ldesign/router-alpinejs 是一个轻量级的 Alpine.js 路由解决方案。</p>
    <h3>技术栈：</h3>
    <ul>
      <li>Alpine.js 3.x</li>
      <li>@ldesign/router-core</li>
      <li>TypeScript</li>
      <li>Vite</li>
    </ul>
  `,
  contact: `
    <h2>📧 联系</h2>
    <p>这是联系页面。</p>
    <p>如果您有任何问题或建议，欢迎联系我们！</p>
    <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 4px;">
      <h4>联系方式：</h4>
      <p>📧 Email: example@ldesign.com</p>
      <p>🐙 GitHub: https://github.com/ldesign</p>
    </div>
  `,
  user: (id) => `
    <h2>👤 用户详情</h2>
    <p>用户 ID: <strong>${id}</strong></p>
    <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 4px;">
      <h4>用户信息：</h4>
      <p>这是动态路由参数的示例。</p>
      <p>当前显示的用户 ID 从 URL 参数中获取。</p>
      <p>尝试访问 #/user/456 或 #/user/789 查看不同用户。</p>
    </div>
  `,
  notFound: `
    <h2>404</h2>
    <p>页面未找到</p>
  `,
}

// 渲染视图
function renderView(path) {
  const contentEl = document.getElementById('content')
  const pathEl = document.getElementById('current-path')
  const paramsEl = document.getElementById('route-params')
  
  // 更新当前路径显示
  pathEl.textContent = path
  
  // 解析路由
  if (path === '/' || path === '') {
    contentEl.innerHTML = views.home
    paramsEl.textContent = '{}'
  } else if (path === '/about') {
    contentEl.innerHTML = views.about
    paramsEl.textContent = '{}'
  } else if (path === '/contact') {
    contentEl.innerHTML = views.contact
    paramsEl.textContent = '{}'
  } else if (path.startsWith('/user/')) {
    const id = path.split('/')[2]
    contentEl.innerHTML = views.user(id)
    paramsEl.textContent = JSON.stringify({ id })
  } else {
    contentEl.innerHTML = views.notFound
    paramsEl.textContent = '{}'
  }
  
  // 更新导航高亮
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href').replace('#', '')
    if (href === path || (path.startsWith('/user/') && href.startsWith('/user/'))) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })
}

// 启动路由器
router.start()

// 监听路由变化
router.history.listen((to) => {
  renderView(to.location)
})

// 初始渲染
renderView(router.currentRoute.path)

// 导航按钮
document.getElementById('back-btn').addEventListener('click', () => {
  router.back()
})

document.getElementById('forward-btn').addEventListener('click', () => {
  router.forward()
})

document.getElementById('home-btn').addEventListener('click', () => {
  router.push('/')
})

// 处理链接点击
document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const href = link.getAttribute('href').replace('#', '')
    router.push(href)
  })
})

console.log('✅ Router initialized:', router)
console.log('📍 Current route:', router.currentRoute)
