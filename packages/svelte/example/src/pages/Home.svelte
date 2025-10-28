<script lang="ts">
  import { getRouter } from '@ldesign/router-svelte'
  
  const router = getRouter()
  
  function goToAbout() {
    router.push('/about')
  }
  
  function goToUser() {
    router.push({ path: '/user/456', query: { tab: 'posts', page: '2' } })
  }

  const exampleCode = `import { getRouter, params, query } from '@ldesign/router-svelte'

const router = getRouter()
const routeParams = params()
const queryParams = query()

// 使用 $ 前缀自动订阅
$: console.log($routeParams.id)
$: console.log($queryParams.page)

// 编程式导航
router.push('/about')
router.push({ path: '/user/123', query: { tab: 'posts' } })`
</script>

<div class="home">
  <h1>🏠 欢迎使用 Svelte Router</h1>
  <p>
    这是一个基于 <code>@ldesign/router-svelte</code> 的示例应用。
  </p>

  <div class="actions">
    <button on:click={goToAbout}>前往关于页</button>
    <button on:click={goToUser}>查看用户 456</button>
  </div>

  <div class="features">
    <h2>✨ 特性</h2>
    <ul>
      <li>🎯 基于 @ldesign/router-core</li>
      <li>📦 Svelte Stores 响应式</li>
      <li>🔧 完整的 TypeScript 支持</li>
      <li>⚡ 高性能路由匹配</li>
      <li>🛡️ 类型安全的导航</li>
      <li>🎨 支持导航守卫</li>
      <li>🚀 使用 @ldesign/launcher 启动</li>
    </ul>
  </div>

  <div class="code-example">
    <h2>📝 使用示例</h2>
    <pre><code>{exampleCode}</code></pre>
  </div>
</div>

<style>
  .home {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .features {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .features h2 {
    margin-top: 0;
    color: #333;
  }

  .features ul {
    list-style: none;
    padding: 0;
  }

  .features li {
    padding: 0.5rem 0;
    color: #666;
  }

  .code-example h2 {
    color: #333;
    margin-bottom: 1rem;
  }
</style>


