<template>
  <router-view />
</template>

<script setup lang="ts">
// App.vue 仅作为入口容器，布局在 AppLayout.vue 中
</script>

<style>
:root {
  --primary: #4f46e5;
  --primary-light: #818cf8;
  --primary-bg: #eef2ff;
  --text: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius: 8px;
}

body {
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  color: var(--primary-light);
}

code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Fira Code', monospace;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 16px;
}

.card h3 {
  margin-bottom: 12px;
  color: var(--text);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-light);
  border-color: var(--primary-light);
  color: white;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 13px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-primary {
  background: var(--primary-bg);
  color: var(--primary);
}

.tag-success {
  background: #dcfce7;
  color: #16a34a;
}

.tag-warning {
  background: #fef3c7;
  color: #d97706;
}

.tag-danger {
  background: #fee2e2;
  color: #dc2626;
}

/* 路由过渡动画 - Fade */
.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}

/* 路由过渡动画 - Slide */
.route-slide-enter-active,
.route-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.route-slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.route-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* 路由过渡动画 - Zoom */
.route-zoom-enter-active,
.route-zoom-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.route-zoom-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.route-zoom-leave-to {
  opacity: 0;
  transform: scale(1.06);
}

/* 路由过渡动画 - Slide Up */
.route-slide-up-enter-active,
.route-slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.route-slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.route-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
