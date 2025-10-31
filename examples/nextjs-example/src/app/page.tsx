'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [visitCount, setVisitCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('home-visits')
    const count = stored ? Number.parseInt(stored) + 1 : 1
    setVisitCount(count)
    localStorage.setItem('home-visits', count.toString())
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <h1>@ldesign/router-nextjs 示例</h1>
        <div className="nav-links">
          <Link href="/">首页</Link>
          <Link href="/about">关于</Link>
          <Link href="/user/123">用户 123</Link>
          <Link href="/user/456">用户 456</Link>
        </div>
      </nav>

      <main className="container" style={{ flex: 1 }}>
        <div className="page" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#000', fontSize: '2rem', marginBottom: '2rem' }}>
            🏠 欢迎使用 @ldesign/router-nextjs
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            margin: '2rem 0'
          }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>🚀 Next.js 15</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                基于最新的 Next.js 15 App Router
              </p>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>📦 类型安全</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                完整的 TypeScript 类型支持
              </p>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>⚡ 服务端渲染</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                强大的 SSR 和 SSG 支持
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            margin: '2rem 0' 
          }}>
            <button 
              onClick={() => router.push('/about')}
              className="btn"
            >
              了解更多
            </button>
            <button 
              onClick={() => router.push('/user/999')}
              className="btn"
              style={{ background: '#f5f5f5', color: '#333' }}
            >
              查看用户示例
            </button>
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '1rem',
            background: '#f9f9f9',
            borderRadius: '4px'
          }}>
            <p>
              页面访问次数: <strong style={{ color: '#000', fontSize: '1.2rem' }}>{visitCount}</strong>
            </p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Powered by Next.js 15 & @ldesign/router</p>
      </footer>
    </div>
  )
}
