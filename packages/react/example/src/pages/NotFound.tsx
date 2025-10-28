import { useRouter, useRoute } from '@ldesign/router-react'

export default function NotFound() {
  const router = useRouter()
  const route = useRoute()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1
          style={{
            fontSize: '6rem',
            color: '#61dafb',
            margin: 0,
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: '2rem', color: '#333', margin: '1rem 0' }}>
          页面未找到
        </h2>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: '1rem 0' }}>
          抱歉，您访问的页面不存在。
        </p>
        <p
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            margin: '1.5rem 0',
          }}
        >
          请求的路径: <code>{route.path}</code>
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem',
          }}
        >
          <button onClick={() => router.push('/')}>返回首页</button>
          <button onClick={() => router.back()}>返回上一页</button>
        </div>
      </div>
    </div>
  )
}


