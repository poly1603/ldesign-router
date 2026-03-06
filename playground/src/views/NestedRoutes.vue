<template>
  <div>
    <h2>嵌套路由</h2>
    <p style="color: var(--text-secondary); margin: 8px 0 20px;">
      演示父子路由嵌套，子路由在父路由的 <code>&lt;router-view&gt;</code> 中渲染
    </p>

    <div class="card">
      <h3>子路由导航</h3>
      <div class="child-nav">
        <router-link to="/nested" class="btn" :class="{ 'btn-primary': $route.name === 'NestedDefault' }">
          默认子路由
        </router-link>
        <router-link to="/nested/child-a" class="btn" :class="{ 'btn-primary': $route.name === 'ChildA' }">
          子页面 A
        </router-link>
        <router-link to="/nested/child-b" class="btn" :class="{ 'btn-primary': $route.name === 'ChildB' }">
          子页面 B
        </router-link>
      </div>
    </div>

    <div class="card">
      <h3>路由匹配链</h3>
      <div class="match-chain">
        <span v-for="(match, i) in $route.matched" :key="match.path" class="match-item">
          <code>{{ match.path || '/' }}</code>
          <span v-if="i < $route.matched.length - 1" class="match-arrow">→</span>
        </span>
      </div>
      <p style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
        当前子路由: <code>{{ $route.name }}</code>
      </p>
    </div>

    <div class="nested-content card">
      <h3>子路由内容区</h3>
      <div class="child-view">
        <router-view v-slot="{ Component }">
          <transition name="route-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    <!-- API 参考 -->
    <div class="card">
      <h3>嵌套路由配置文档</h3>
      <p class="section-desc">子路由通过 <code>children</code> 属性定义，父路由组件需包含 <code>&lt;router-view&gt;</code> 作为子路由的渲染出口。</p>
      <pre class="code-block"><code>const routes = [
  {
    path: '/nested',
    component: () => import('./views/NestedRoutes.vue'),
    meta: { title: '嵌套路由' },
    children: [
      {
        path: '',           // 默认子路由，访问 /nested 时渲染
        name: 'NestedDefault',
        component: () => import('./views/nested/Default.vue'),
      },
      {
        path: 'child-a',   // 访问 /nested/child-a 时渲染
        name: 'ChildA',
        component: () => import('./views/nested/ChildA.vue'),
      },
      {
        path: 'child-b',   // 访问 /nested/child-b 时渲染
        name: 'ChildB',
        component: () => import('./views/nested/ChildB.vue'),
      },
    ],
  },
]</code></pre>

      <h4 style="margin-top: 20px;">父组件模板</h4>
      <pre class="code-block"><code>&lt;template&gt;
  &lt;div&gt;
    &lt;h2&gt;嵌套路由&lt;/h2&gt;
    &lt;nav&gt;
      &lt;router-link to="/nested"&gt;默认&lt;/router-link&gt;
      &lt;router-link to="/nested/child-a"&gt;子页面 A&lt;/router-link&gt;
    &lt;/nav&gt;

    &lt;!-- 子路由渲染出口 --&gt;
    &lt;router-view v-slot="{ Component }"&gt;
      &lt;transition name="fade" mode="out-in"&gt;
        &lt;component :is="Component" /&gt;
      &lt;/transition&gt;
    &lt;/router-view&gt;
  &lt;/div&gt;
&lt;/template&gt;</code></pre>

      <h4 style="margin-top: 20px;">关键要点</h4>
      <div class="key-points">
        <div class="key-point"><strong>path: ''</strong> — 空字符串表示默认子路由，当访问父路径时自动渲染</div>
        <div class="key-point"><strong>$route.matched</strong> — 包含当前路由的所有匹配记录（父 + 子）</div>
        <div class="key-point"><strong>父组件保持</strong> — 切换子路由时，父组件不会重新渲染</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-nav {
  display: flex;
  gap: 8px;
}

.match-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-arrow {
  color: var(--text-secondary);
  font-weight: 600;
}

.child-view {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 20px;
  min-height: 120px;
  margin-top: 12px;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  overflow-x: auto;
  line-height: 1.6;
}

.code-block code {
  background: transparent;
  padding: 0;
  color: inherit;
}

h4 {
  font-size: 14px;
  margin-bottom: 6px;
}

.key-points {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.key-point {
  padding: 8px 12px;
  background: var(--bg);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
}
</style>
