<script lang="ts">
  import { getRouter } from '@ldesign/router-svelte'
  import { writable } from 'svelte/store'
  
  const router = getRouter()
  const isAuthenticated = writable(localStorage.getItem('isAuthenticated') === 'true')
  
  function toggleAuth() {
    isAuthenticated.update(v => {
      const newState = !v
      localStorage.setItem('isAuthenticated', String(newState))
      
      if (!newState) {
        alert('已退出登录，返回首页')
        router.push('/')
      }
      
      return newState
    })
  }

  const guardCode = `router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      alert('需要登录')
      next('/')
      return
    }
  }
  next()
})`
</script>

<div class="dashboard">
  <h1>📊 仪表盘</h1>

  <div class="auth-status" class:authenticated={$isAuthenticated}>
    <h2>认证状态</h2>
    <p>{$isAuthenticated ? '✅ 已登录' : '❌ 未登录'}</p>
    <button on:click={toggleAuth}>
      {$isAuthenticated ? '退出登录' : '模拟登录'}
    </button>
  </div>

  <div class="info">
    <h2>功能说明</h2>
    <p>
      这个页面演示了导航守卫的使用。在路由配置中，我们设置了 
      <code>requiresAuth: true</code>，只有在认证状态下才能访问。
    </p>

    <h3>导航守卫实现</h3>
    <pre><code>{guardCode}</code></pre>

    <p class="tip">
      💡 提示：退出登录后尝试直接访问此页面，会自动重定向到首页。
    </p>
  </div>

  <button on:click={() => router.push('/')}>返回首页</button>
</div>

<style>
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    margin-bottom: 1.5rem;
  }

  .auth-status {
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    background: #fee;
    border: 2px solid #f88;
  }

  .auth-status.authenticated {
    background: #efe;
    border-color: #8c8;
  }

  .auth-status h2 {
    margin-top: 0;
  }

  .auth-status p {
    font-size: 1.2rem;
    margin: 1rem 0;
  }

  .info {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .info h2 {
    margin-top: 0;
    color: #333;
  }

  .info p {
    line-height: 1.6;
    color: #666;
    margin-bottom: 1rem;
  }

  .info h3 {
    color: #333;
    margin: 1.5rem 0 1rem 0;
  }

  .tip {
    background: #fff3cd;
    border: 1px solid #ffc107;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
  }
</style>


