'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()
  const pathname = usePathname()

  const installCode = `npm install @ldesign/router-nextjs
# 或
pnpm add @ldesign/router-nextjs

// next.config.js
const nextConfig = {
  transpilePackages: ['@ldesign/router-nextjs']
}

// app/layout.tsx
import { RouterProvider } from '@ldesign/router-nextjs'

export default function RootLayout({ children }) {
  return <RouterProvider>{children}</RouterProvider>
}`

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <h1>@ldesign/router-nextjs 示例</h1>
        <div className="nav-links">
          <Link href="/">首页</Link>
          <Link href="/about" className="active">关于</Link>
          <Link href="/user/123">用户 123</Link>
          <Link href="/user/456">用户 456</Link>
        </div>
      </nav>

      <main className="container" style={{ flex: 1 }}>
        <div className="page" style={{ maxWidth: '800px' }}>
          <h2 style={{ color: '#000', fontSize: '2rem', marginBottom: '2rem' }}>
            📖 关于 @ldesign/router-nextjs
          </h2>

          <div style={{ textAlign: 'left' }}>
            <section style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>
                项目简介
              </h3>
              <p style={{ color: '#666', lineHeight: 1.8 }}>
                @ldesign/router-nextjs 是专为 Next.js 15 设计的路由增强库。
                它基于 @ldesign/router-core 核心库，在保留 Next.js 原生路由能力的同时，
                提供了统一的 API 和额外功能。
              </p>
            </section>

            <section style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>
                核心特性
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.5rem 0', color: '#444' }}>
                  ✨ 完全兼容 Next.js 15 App Router
                </li>
                <li style={{ padding: '0.5rem 0', color: '#444' }}>
                  🔧 统一的路由 API
                </li>
                <li style={{ padding: '0.5rem 0', color: '#444' }}>
                  📱 支持服务端和客户端渲染
                </li>
                <li style={{ padding: '0.5rem 0', color: '#444' }}>
                  🎨 增强的导航功能
                </li>
                <li style={{ padding: '0.5rem 0', color: '#444' }}>
                  ⚡ 轻量级，零额外依赖
                </li>
                <li style={{ padding: '0.5rem 0', color: '#444' }}>
                  🔒 完整的 TypeScript 类型
                </li>
              </ul>
            </section>

            <section style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem' }}>
                快速开始
              </h3>
              <pre style={{
                background: '#2d2d2d',
                color: '#f8f8f2',
                padding: '1.5rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}>
                <code style={{ fontFamily: "'Courier New', monospace" }}>
                  {installCode}
                </code>
              </pre>
            </section>

            <section style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>
                路由信息
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>当前路径:</span>
                  <code>{pathname}</code>
                </div>
              </div>
            </section>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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
