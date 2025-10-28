<script setup lang="ts">
import { useRouter, useRoute } from '@ldesign/router-vue'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在。</p>
      <p class="path">请求的路径: <code>{{ route.path }}</code></p>
      
      <div class="actions">
        <button @click="router.push('/')">返回首页</button>
        <button @click="router.back()">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.content {
  text-align: center;
  max-width: 600px;
}

h1 {
  font-size: 6rem;
  color: #42b883;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin: 1rem 0;
}

p {
  color: #666;
  font-size: 1.1rem;
  margin: 1rem 0;
}

.path {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin: 1.5rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}
</style>


