<script lang="ts">
  import { createRouter, RouterLink, RouterView, useRouter } from '@ldesign/router-sveltekit'
  import Home from './routes/Home.svelte'
  import About from './routes/About.svelte'
  import User from './routes/User.svelte'

  const router = createRouter({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About },
      { path: '/user/:id', component: User },
    ],
  })

  const currentRouter = useRouter()
  
  $: currentPath = currentRouter.currentRoute.value.path
</script>

<div id="app">
  <nav class="navbar">
    <h1>@ldesign/router-sveltekit 示例</h1>
    <div class="nav-links">
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/user/123">用户 123</RouterLink>
      <RouterLink to="/user/456">用户 456</RouterLink>
    </div>
  </nav>

  <main class="container">
    <RouterView />
  </main>

  <footer class="footer">
    <p>
      当前路由: <code>{currentPath}</code>
    </p>
  </footer>
</div>

<style>
  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    background: linear-gradient(135deg, #ff3e00 0%, #ff8800 100%);
    color: white;
    padding: 1.5rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .navbar h1 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  .nav-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  :global(.nav-links a) {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
    background: rgba(255, 255, 255, 0.1);
  }

  :global(.nav-links a:hover) {
    background: rgba(255, 255, 255, 0.2);
  }

  :global(.nav-links a.router-link-active) {
    background: rgba(255, 255, 255, 0.3);
    font-weight: bold;
  }

  .container {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .footer {
    background: #f5f5f5;
    padding: 1rem 2rem;
    text-align: center;
    border-top: 1px solid #ddd;
  }

  .footer code {
    background: #e0e0e0;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
</style>
