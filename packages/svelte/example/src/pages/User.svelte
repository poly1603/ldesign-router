<script lang="ts">
  import { getRouter, params, query, hash } from '@ldesign/router-svelte'
  
  const router = getRouter()
  const routeParams = params()
  const queryParams = query()
  const routeHash = hash()
  
  $: userId = $routeParams.id
  $: currentTab = $queryParams.tab || 'profile'
  $: currentPage = $queryParams.page || '1'
  $: section = $routeHash || '无'
  
  function changePage(page: number) {
    router.push({
      path: `/user/${userId}`,
      query: { ...$queryParams, page: String(page) },
    })
  }
  
  function changeTab(tab: string) {
    router.push({
      path: `/user/${userId}`,
      query: { tab, page: '1' },
    })
  }
  
  function changeSection(newSection: string) {
    router.push({
      path: `/user/${userId}`,
      query: $queryParams,
      hash: newSection,
    })
  }
</script>

<div class="user">
  <h1>👤 用户详情</h1>

  <div class="user-info">
    <h2>路由信息</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">用户 ID:</span>
        <span class="value">{userId}</span>
      </div>
      <div class="info-item">
        <span class="label">当前标签:</span>
        <span class="value">{currentTab}</span>
      </div>
      <div class="info-item">
        <span class="label">当前页码:</span>
        <span class="value">{currentPage}</span>
      </div>
      <div class="info-item">
        <span class="label">锚点:</span>
        <span class="value">{section}</span>
      </div>
    </div>
  </div>

  <div class="actions">
    <div class="action-group">
      <h3>切换标签</h3>
      <div class="buttons">
        <button on:click={() => changeTab('profile')}>个人资料</button>
        <button on:click={() => changeTab('posts')}>文章列表</button>
        <button on:click={() => changeTab('followers')}>粉丝</button>
      </div>
    </div>

    <div class="action-group">
      <h3>切换页码</h3>
      <div class="buttons">
        <button on:click={() => changePage(1)}>第 1 页</button>
        <button on:click={() => changePage(2)}>第 2 页</button>
        <button on:click={() => changePage(3)}>第 3 页</button>
      </div>
    </div>

    <div class="action-group">
      <h3>跳转锚点</h3>
      <div class="buttons">
        <button on:click={() => changeSection('top')}>顶部</button>
        <button on:click={() => changeSection('middle')}>中间</button>
        <button on:click={() => changeSection('bottom')}>底部</button>
      </div>
    </div>
  </div>

  <div class="navigation">
    <button on:click={() => router.back()}>返回</button>
    <button on:click={() => router.push('/')}>回到首页</button>
  </div>
</div>

<style>
  .user {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    margin-bottom: 1.5rem;
  }

  .user-info {
    background: #f0fdf4;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .user-info h2 {
    margin-top: 0;
    color: #15803d;
  }

  .info-grid {
    display: grid;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: white;
    border-radius: 4px;
  }

  .label {
    font-weight: 600;
    color: #333;
  }

  .value {
    color: #15803d;
    font-family: 'Courier New', monospace;
    font-weight: 500;
  }

  .actions {
    margin-bottom: 2rem;
  }

  .action-group {
    margin-bottom: 1.5rem;
  }

  .action-group h3 {
    color: #333;
    margin-bottom: 0.75rem;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .navigation {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e5e5;
  }
</style>


