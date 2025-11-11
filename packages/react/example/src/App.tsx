import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-react'
import { router } from './router'
import './App.css'

function App() {
  return (
    <RouterProvider router={router}>
      <div className="app">
        <header className="header">
          <h1>⚛️ React Router Example</h1>
          <p>@ldesign/router-react 示例应用</p>
        </header>

        <nav className="nav">
          <RouterLink to="/" activeClassName="active">
            首页
          </RouterLink>
          <RouterLink to="/about" activeClassName="active">
            关于
          </RouterLink>
          <RouterLink to="/user/123" activeClassName="active">
            用户详情
          </RouterLink>
          <RouterLink to="/dashboard" activeClassName="active">
            仪表盘
          </RouterLink>
        </nav>

        <main className="content">
          <RouterView animation={{ type: 'fade', duration: 250, easing: 'ease-in-out' }} />
        </main>

        <footer className="footer">
          <p>基于 @ldesign/router-core 构建</p>
        </footer>
      </div>
    </RouterProvider>
  )
}

export default App


