import { useState } from 'react'
import { useRouter } from '@ldesign/router-react'

export default function Dashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  )

  const toggleAuth = () => {
    const newState = !isAuthenticated
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
    <div className="dashboard" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#61dafb', marginBottom: '1.5rem' }}>📊 仪表盘</h1>

      <div
        style={{
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          background: isAuthenticated ? '#efe' : '#fee',
          border: `2px solid ${isAuthenticated ? '#8c8' : '#f88'}`,
        }}
      >
        <h2 style={{ marginTop: 0 }}>认证状态</h2>
        <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
          {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
        </p>
        <button onClick={toggleAuth}>
          {isAuthenticated ? '退出登录' : '模拟登录'}
        </button>
      </div>

      <div
        style={{
          background: '#f9f9f9',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>功能说明</h2>
        <p style={{ lineHeight: 1.6, color: '#666', marginBottom: '1rem' }}>
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
            borderRadius: '4px',
            marginTop: '1rem',
          }}
        >
          💡 提示：退出登录后尝试直接访问此页面，会自动重定向到首页。
        </p>
      </div>

      <button onClick={() => router.push('/')}>返回首页</button>
    </div>
  )
}


