import { createRouter, createWebHashHistory } from '@ldesign/router-react'
import { useState, useEffect } from 'react'

// 创建路由器
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/about', name: 'about' },
    { path: '/contact', name: 'contact' },
    { path: '/user/:id', name: 'user' },
    { path: '/products', name: 'products' },
  ],
})

// 页面组件
function HomePage() {
  return (
    <div>
      <h2>🏠 首页</h2>
      <p>欢迎使用 @ldesign/router-react！</p>
      <div className="card">
        <h3>特性：</h3>
        <ul>
          <li>✅ 基于 @ldesign/router-core</li>
          <li>✅ React 18+ 支持</li>
          <li>✅ TypeScript 类型安全</li>
          <li>✅ Hash/HTML5 History 模式</li>
          <li>✅ 动态路由参数</li>
          <li>✅ 编程式导航</li>
        </ul>
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div>
      <h2>ℹ️ 关于</h2>
      <p>@ldesign/router-react 是一个强大的 React 路由解决方案。</p>
      <div className="card">
        <h3>技术栈：</h3>
        <ul>
          <li>React 18</li>
          <li>TypeScript</li>
          <li>@ldesign/router-core</li>
          <li>Vite</li>
        </ul>
      </div>
    </div>
  )
}

function ContactPage() {
  return (
    <div>
      <h2>📧 联系我们</h2>
      <div className="card">
        <h3>联系方式：</h3>
        <p>📧 Email: example@ldesign.com</p>
        <p>🐙 GitHub: https://github.com/ldesign</p>
        <p>📦 npm: @ldesign/router-react</p>
      </div>
    </div>
  )
}

function UserPage({ id }: { id: string }) {
  return (
    <div>
      <h2>👤 用户详情</h2>
      <div className="card">
        <h3>用户 ID: {id}</h3>
        <p>这是一个动态路由参数的示例。</p>
        <p>URL 参数会自动从路径中提取并传递给组件。</p>
        <p>尝试访问不同的用户 ID，如 <code>#/user/456</code> 或 <code>#/user/789</code></p>
      </div>
    </div>
  )
}

function ProductsPage() {
  const products = [
    { id: 1, name: 'Product A', price: 99 },
    { id: 2, name: 'Product B', price: 149 },
    { id: 3, name: 'Product C', price: 199 },
  ]

  return (
    <div>
      <h2>🛍️ 产品列表</h2>
      <div className="card">
        {products.map(product => (
          <div key={product.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <strong>{product.name}</strong> - ${product.price}
          </div>
        ))}
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div>
      <h2>❌ 404 - 页面未找到</h2>
      <p>抱歉，您访问的页面不存在。</p>
    </div>
  )
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(router.currentRoute.path)
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    // 监听路由变化
    const unlisten = router.history.listen((to) => {
      setCurrentPath(to.location)
      
      // 解析路由参数
      if (to.location.startsWith('/user/')) {
        const id = to.location.split('/')[2]
        setParams({ id })
      } else {
        setParams({})
      }
    })

    // 初始化
    const path = router.currentRoute.path
    setCurrentPath(path)
    if (path.startsWith('/user/')) {
      const id = path.split('/')[2]
      setParams({ id })
    }

    return unlisten
  }, [])

  // 渲染当前页面
  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage />
    } else if (currentPath === '/about') {
      return <AboutPage />
    } else if (currentPath === '/contact') {
      return <ContactPage />
    } else if (currentPath === '/products') {
      return <ProductsPage />
    } else if (currentPath.startsWith('/user/')) {
      return <UserPage id={params.id || ''} />
    } else {
      return <NotFoundPage />
    }
  }

  const navigate = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => {
    if (path === '/' || path === '') {
      return currentPath === '/' || currentPath === ''
    }
    return currentPath === path || currentPath.startsWith(path + '/')
  }

  return (
    <div className="container">
      <header>
        <h1>⚛️ React Router Example</h1>
        <p>基于 @ldesign/router-react 的示例项目</p>
        
        <nav>
          <a
            href="#/"
            className={isActive('/') ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
          >
            首页
          </a>
          <a
            href="#/about"
            className={isActive('/about') ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              navigate('/about')
            }}
          >
            关于
          </a>
          <a
            href="#/contact"
            className={isActive('/contact') ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              navigate('/contact')
            }}
          >
            联系
          </a>
          <a
            href="#/products"
            className={isActive('/products') ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              navigate('/products')
            }}
          >
            产品
          </a>
          <a
            href="#/user/123"
            className={isActive('/user/') ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              navigate('/user/123')
            }}
          >
            用户详情
          </a>
        </nav>
      </header>

      <main>
        {renderPage()}

        <div className="route-info">
          <div><strong>当前路由:</strong> {currentPath}</div>
          <div><strong>路由参数:</strong> {JSON.stringify(params)}</div>
        </div>

        <div className="actions">
          <button onClick={() => router.back()}>← 后退</button>
          <button onClick={() => router.forward()}>前进 →</button>
          <button onClick={() => navigate('/')}>回到首页</button>
          <button onClick={() => navigate('/about')}>跳转到关于</button>
        </div>
      </main>
    </div>
  )
}
