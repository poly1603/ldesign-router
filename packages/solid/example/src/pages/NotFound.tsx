import { Component } from 'solid-js'
import { useRouter, useRoute } from '@ldesign/router-solid'

const NotFound: Component = () => {
  const router = useRouter()
  const route = useRoute()

  return (
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'min-height': '400px',
      }}
    >
      <div style={{ 'text-align': 'center', 'max-width': '600px' }}>
        <h1
          style={{
            'font-size': '6rem',
            color: '#2c4f7c',
            margin: 0,
            'line-height': 1,
          }}
        >
          404
        </h1>
        <h2 style={{ 'font-size': '2rem', color: '#333', margin: '1rem 0' }}>
          页面未找到
        </h2>
        <p style={{ color: '#666', 'font-size': '1.1rem', margin: '1rem 0' }}>
          抱歉，您访问的页面不存在。
        </p>
        <p
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            'border-radius': '4px',
            margin: '1.5rem 0',
          }}
        >
          请求的路径: <code>{route.path()}</code>
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            'justify-content': 'center',
            'margin-top': '2rem',
          }}
        >
          <button onClick={() => router.push('/')}>返回首页</button>
          <button onClick={() => router.back()}>返回上一页</button>
        </div>
      </div>
    </div>
  )
}

export default NotFound


