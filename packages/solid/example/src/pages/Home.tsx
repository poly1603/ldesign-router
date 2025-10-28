import { Component } from 'solid-js'
import { useRouter } from '@ldesign/router-solid'

const Home: Component = () => {
  const router = useRouter()

  const goToAbout = () => {
    router.push('/about')
  }

  const goToUser = () => {
    router.push({ path: '/user/456', query: { tab: 'posts', page: '2' } })
  }

  const exampleCode = `import { useRouter, useParams, useQuery } from '@ldesign/router-solid'

function MyComponent() {
  const router = useRouter()
  const params = useParams()
  const query = useQuery()

  // 使用 signals - 调用函数获取值
  console.log(params().id)
  console.log(query().page)

  // 编程式导航
  router.push('/about')
  router.push({ path: '/user/123', query: { tab: 'posts' } })
}`

  return (
    <div class="home" style={{ 'max-width': '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c4f7c', 'margin-bottom': '1rem' }}>
        🏠 欢迎使用 Solid.js Router
      </h1>
      <p
        style={{
          'font-size': '1.1rem',
          color: '#666',
          'margin-bottom': '2rem',
          'line-height': 1.6,
        }}
      >
        这是一个基于 <code>@ldesign/router-solid</code> 的示例应用。
      </p>

      <div style={{ display: 'flex', gap: '1rem', 'margin-bottom': '3rem' }}>
        <button onClick={goToAbout}>前往关于页</button>
        <button onClick={goToUser}>查看用户 456</button>
      </div>

      <div
        style={{
          background: '#f9f9f9',
          padding: '1.5rem',
          'border-radius': '8px',
          'margin-bottom': '2rem',
        }}
      >
        <h2 style={{ 'margin-top': 0, color: '#333' }}>✨ 特性</h2>
        <ul style={{ 'list-style': 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🎯 基于 @solidjs/router
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            📦 与 @ldesign/router-core 集成
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🔧 完整的 TypeScript 支持
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            ⚡ 细粒度响应式 Signals
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🛡️ 类型安全的导航
          </li>
          <li style={{ padding: '0.5rem 0', color: '#666' }}>
            🚀 使用 @ldesign/launcher 启动
          </li>
        </ul>
      </div>

      <div>
        <h2 style={{ color: '#333', 'margin-bottom': '1rem' }}>📝 使用示例</h2>
        <pre>
          <code>{exampleCode}</code>
        </pre>
      </div>
    </div>
  )
}

export default Home


