import { Component } from 'solid-js'
import { RouterProvider, RouterView, RouterLink } from '@ldesign/router-solid'
import { router } from './router'
import './App.css'

const App: Component = () => {
  return (
    <RouterProvider router={router}>
      <div class="app">
        <header class="header">
          <h1>⚛️ Solid.js Router Example</h1>
          <p>@ldesign/router-solid 示例应用</p>
        </header>

        <nav class="nav">
          <RouterLink to="/" activeClass="active">
            首页
          </RouterLink>
          <RouterLink to="/about" activeClass="active">
            关于
          </RouterLink>
          <RouterLink to="/user/123" activeClass="active">
            用户详情
          </RouterLink>
          <RouterLink to="/dashboard" activeClass="active">
            仪表盘
          </RouterLink>
        </nav>

        <main class="content">
          <RouterView />
        </main>

        <footer class="footer">
          <p>基于 @ldesign/router-core 构建 · 使用 @ldesign/launcher 启动</p>
        </footer>
      </div>
    </RouterProvider>
  )
}

export default App


