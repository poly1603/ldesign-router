'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useParams } from 'next/navigation'

export default function UserPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const userId = params.id as string
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN'))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <h1>@ldesign/router-nextjs 示例</h1>
        <div className="nav-links">
          <Link href="/">首页</Link>
          <Link href="/about">关于</Link>
          <Link href="/user/123" className={userId === '123' ? 'active' : ''}>
            用户 123
          </Link>
          <Link href="/user/456" className={userId === '456' ? 'active' : ''}>
            用户 456
          </Link>
        </div>
      </nav>

      <main className="container" style={{ flex: 1 }}>
        <div className="page" style={{ maxWidth: '800px' }}>
          <h2 style={{ color: '#000', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            👤 用户详情
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #000 0%, #434343 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {userId.slice(0, 2).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                用户 #{userId}
              </h3>
              <p style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: '#666',
                fontSize: '0.9rem',
                margin: 0
              }}>
                <span>📧 user{userId}@example.com</span>
                <span>🕒 {currentTime}</span>
              </p>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '1.2rem' }}>路由参数信息</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold', color: '#555' }}>用户 ID (params):</span>
                <code>{userId}</code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 'bold', color: '#555' }}>完整路径:</span>
                <code>{pathname}</code>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/user/123')}
              className="btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              切换到用户 123
            </button>
            <button
              onClick={() => router.push('/user/456')}
              className="btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              切换到用户 456
            </button>
            <button
              onClick={() => router.push('/user/789')}
              className="btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              切换到用户 789
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => router.push('/')} className="btn">
              ← 返回首页
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Powered by Next.js 15 & @ldesign/router</p>
      </footer>
    </div>
  )
}
