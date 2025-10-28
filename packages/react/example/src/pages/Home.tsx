import { useRouter } from '@ldesign/router-react'

export default function Home() {
  const router = useRouter()

  const goToAbout = () => {
    router.push('/about')
  }

  const goToUser = () => {
    router.push({ path: '/user/456', query: { tab: 'posts', page: '2' } })
  }

  const exampleCode = `import { useRouter, useRoute } from '@ldesign/router-react'

function MyComponent() {
  const router = useRouter()
  const route = useRoute()

  // 编程式导航
  router.push('/about')
  router.push({ path: '/user/123', query: { tab: 'posts' } })

  // 获取路由信息
  console.log(route.path)
  console.log(route.params)
  console.log(route.query)
}`

  return (
    <div className="home">
      <h1>🏠 欢迎使用 React Router</h1>
      <p>
        这是一个基于 <code>@ldesign/router-react</code> 的示例应用。
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <button onClick={goToAbout}>前往关于页</button>
        <button onClick={goToUser}>查看用户 456</button>
      </div>

      <div
        style={{
          background: '#f9f9f9',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <h2>✨ 特性</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🎯 基于 React Router v6
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            📦 与 @ldesign/router-core 集成
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🔧 完整的 TypeScript 支持
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            ⚡ 高性能路由匹配
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🛡️ 类型安全的导航
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🎨 支持导航守卫
          </li>
        </ul>
      </div>

      <div>
        <h2>📝 使用示例</h2>
        <pre>
          <code>{exampleCode}</code>
        </pre>
      </div>
    </div>
  )
}


