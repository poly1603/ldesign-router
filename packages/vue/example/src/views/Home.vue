<script setup lang="ts">
import { useRouter } from '@ldesign/router-vue'

const router = useRouter()

const goToAbout = () => {
  router.push('/about')
}

const goToUser = () => {
  router.push({ path: '/user/456', query: { tab: 'posts', page: '2' } })
}
</script>

<template>
  <div class="home">
    <h1>🏠 欢迎使用 Vue Router</h1>
    <p>这是一个基于 <code>@ldesign/router-vue</code> 的示例应用。</p>

    <div class="actions">
      <button @click="goToAbout">前往关于页</button>
      <button @click="goToUser">查看用户 456</button>
    </div>

    <div class="features">
      <h2>✨ 特性</h2>
      <ul>
        <li>🎯 基于 Vue Router v4</li>
        <li>📦 与 @ldesign/router-core 集成</li>
        <li>🔧 完整的 TypeScript 支持</li>
        <li>⚡ 高性能路由匹配</li>
        <li>🛡️ 类型安全的导航</li>
        <li>🎨 支持导航守卫</li>
      </ul>
    </div>

    <div class="code-example">
      <h2>📝 使用示例</h2>
      <pre><code>{{ exampleCode }}</code></pre>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      exampleCode: `import { useRouter, useRoute } from '@ldesign/router-vue'

const router = useRouter()
const route = useRoute()

// 编程式导航
router.push('/about')
router.push({ path: '/user/123', query: { tab: 'posts' } })

// 获取路由信息
console.log(route.value.path)
console.log(route.value.params)
console.log(route.value.query)`,
    }
  },
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
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


