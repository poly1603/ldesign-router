import { Component, createSignal } from 'solid-js'
import { useRouter } from '@ldesign/router-solid'

const Dashboard: Component = () => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    localStorage.getItem('isAuthenticated') === 'true'
  )

  const toggleAuth = () => {
    const newState = !isAuthenticated()
    setIsAuthenticated(newState)
    localStorage.setItem('isAuthenticated', String(newState))

    if (!newState) {
      alert('已退出登录，返回首页')
      router.push('/')
    }
  }

  const guardCode = `router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      alert('需要登录')
      next('/')
      return
    }
  }
  next()
})`

  return (
    <div class="dashboard" style={{ 'max-width': '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c4f7c', 'margin-bottom': '1.5rem' }}>📊 仪表盘</h1>

      <div
        style={{
          padding: '1.5rem',
          'border-radius': '8px',
          'margin-bottom': '2rem',
          background: isAuthenticated() ? '#efe' : '#fee',
          border: `2px solid ${isAuthenticated() ? '#8c8' : '#f88'}`,
        }}
      >
        <h2 style={{ 'margin-top': 0 }}>认证状态</h2>
        <p style={{ 'font-size': '1.2rem', margin: '1rem 0' }}>
          {isAuthenticated() ? '✅ 已登录' : '❌ 未登录'}
        </p>
        <button onClick={toggleAuth}>
          {isAuthenticated() ? '退出登录' : '模拟登录'}
        </button>
      </div>

      <div
        style={{
          background: '#f9f9f9',
          padding: '1.5rem',
          'border-radius': '8px',
          'margin-bottom': '2rem',
        }}
      >
        <h2 style={{ 'margin-top': 0, color: '#333' }}>功能说明</h2>
        <p style={{ 'line-height': 1.6, color: '#666', 'margin-bottom': '1rem' }}>
          这个页面演示了导航守卫的使用。在路由配置中，我们设置了{' '}
          <code>requiresAuth: true</code>，只有在认证状态下才能访问。
        </p>

        <h3 style={{ color: '#333', margin: '1.5rem 0 1rem 0' }}>
          导航守卫实现
        </h3>
        <pre>
          <code>{guardCode}</code>
        </pre>

        <p
          style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            padding: '1rem',
            'border-radius': '4px',
            'margin-top': '1rem',
          }}
        >
          💡 提示：退出登录后尝试直接访问此页面，会自动重定向到首页。
        </p>
      </div>

      <button onClick={() => router.push('/')}>返回首页</button>
    </div>
  )
}

export default Dashboard


