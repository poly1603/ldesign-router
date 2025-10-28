import { useRouter, useRoute, useMeta } from '@ldesign/router-react'

export default function About() {
  const router = useRouter()
  const route = useRoute()
  const meta = useMeta()

  return (
    <div className="about" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#61dafb', marginBottom: '1.5rem' }}>📖 关于</h1>

      <div
        style={{
          background: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#0369a1' }}>当前路由信息</h2>
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            gap: '0.5rem',
            margin: 0,
          }}
        >
          <dt style={{ fontWeight: 600, color: '#333' }}>路径:</dt>
          <dd
            style={{
              margin: 0,
              color: '#666',
              fontFamily: "'Courier New', monospace",
            }}
          >
            {route.path}
          </dd>

          <dt style={{ fontWeight: 600, color: '#333' }}>完整路径:</dt>
          <dd
            style={{
              margin: 0,
              color: '#666',
              fontFamily: "'Courier New', monospace",
            }}
          >
            {route.fullPath}
          </dd>

          <dt style={{ fontWeight: 600, color: '#333' }}>元信息标题:</dt>
          <dd
            style={{
              margin: 0,
              color: '#666',
              fontFamily: "'Courier New', monospace",
            }}
          >
            {meta.title || '无'}
          </dd>
        </dl>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#333' }}>关于 @ldesign/router-react</h2>
        <p style={{ lineHeight: 1.6, color: '#666', marginBottom: '1rem' }}>
          @ldesign/router-react 是一个基于 React Router v6 的增强路由库，
          它提供了与 @ldesign/router-core 的深度集成，
          为 React 应用提供了统一的路由解决方案。
        </p>

        <h3 style={{ color: '#333' }}>主要特点</h3>
        <ul style={{ paddingLeft: '2rem' }}>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            完全兼容 React Router v6 的 API
          </li>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            与 @ldesign/router-core 共享类型定义
          </li>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            支持多框架统一的路由配置
          </li>
          <li style={{ margin: '0.5rem 0', color: '#666' }}>
            提供额外的工具函数和类型支持
          </li>
        </ul>
      </div>

      <button onClick={() => router.back()}>返回上一页</button>
    </div>
  )
}


