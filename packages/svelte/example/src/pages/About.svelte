<script lang="ts">
  import { getRouter, route, meta } from '@ldesign/router-svelte'
  
  const router = getRouter()
  const currentRoute = route()
  const routeMeta = meta()
</script>

<div class="about">
  <h1>📖 关于</h1>

  <div class="info-card">
    <h2>当前路由信息</h2>
    <dl>
      <dt>路径:</dt>
      <dd>{$currentRoute.path}</dd>

      <dt>完整路径:</dt>
      <dd>{$currentRoute.fullPath}</dd>

      <dt>元信息标题:</dt>
      <dd>{$routeMeta.title || '无'}</dd>
    </dl>
  </div>

  <div class="description">
    <h2>关于 @ldesign/router-svelte</h2>
    <p>
      @ldesign/router-svelte 是一个专为 Svelte 设计的路由库，
      它提供了与 @ldesign/router-core 的深度集成，
      为 Svelte 应用提供了统一的路由解决方案。
    </p>

    <h3>主要特点</h3>
    <ul>
      <li>使用 Svelte Stores 提供原生响应式体验</li>
      <li>与 @ldesign/router-core 共享类型定义</li>
      <li>支持多框架统一的路由配置</li>
      <li>使用 @ldesign/launcher 统一管理</li>
    </ul>
  </div>

  <button on:click={() => router.back()}>返回上一页</button>
</div>

<style>
  .about {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    margin-bottom: 1.5rem;
  }

  .info-card {
    background: #f0f9ff;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .info-card h2 {
    margin-top: 0;
    color: #0369a1;
  }

  dl {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 0.5rem;
    margin: 0;
  }

  dt {
    font-weight: 600;
    color: #333;
  }

  dd {
    margin: 0;
    color: #666;
    font-family: 'Courier New', monospace;
  }

  .description {
    margin-bottom: 2rem;
  }

  .description h2 {
    color: #333;
  }

  .description p {
    line-height: 1.6;
    color: #666;
    margin-bottom: 1rem;
  }

  .description ul {
    padding-left: 2rem;
  }

  .description li {
    margin: 0.5rem 0;
    color: #666;
  }
</style>


