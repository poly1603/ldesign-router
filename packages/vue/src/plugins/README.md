# Vue Router Plugins

这个目录包含两种路由插件，服务于不同的使用场景。

## 📦 插件类型

### 1. Vue Plugin (`vue-plugin.ts`)

**用途**: 用于标准 Vue 3 应用的路由插件

**特点**:
- 实现 Vue Plugin 接口
- 简化路由器的创建和安装
- 适用于普通 Vue SPA 应用
- 支持全局组件注册

**使用示例**:

```typescript
import { createApp } from 'vue'
import { createRouterPlugin } from '@ldesign/router-vue'
import App from './App.vue'

const app = createApp(App)

// 方式 1: 使用插件
const routerPlugin = createRouterPlugin({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ],
  history: createWebHistory()
})

app.use(routerPlugin)
app.mount('#app')

// 方式 2: 直接使用
import { useRouterPlugin } from '@ldesign/router-vue'

const router = useRouterPlugin(app, {
  routes: [...],
  history: createWebHistory()
})
```

**导出内容**:
- `createRouterPlugin(options)` - 创建 Vue 插件
- `useRouterPlugin(app, options)` - 直接创建并安装路由器
- `RouterPluginOptions` - 插件选项类型

---

### 2. Engine Plugin (`engine-plugin.ts`)

**用途**: 用于集成到 LDesign Engine 生态系统

**特点**:
- 实现 LDesign Engine Plugin 接口
- 与 Engine 生命周期集成
- 支持 Engine 事件系统
- 支持 Engine 状态管理
- 支持动画配置注入
- 支持路由预设

**使用示例**:

```typescript
import { createEngine } from '@ldesign/engine-core'
import { createRouterEnginePlugin } from '@ldesign/router-vue'

const engine = createEngine({
  plugins: [
    createRouterEnginePlugin({
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ],
      mode: 'history',
      base: '/',
      preset: 'admin',
      animation: {
        type: 'fade',
        duration: 300
      }
    })
  ]
})

// 或使用默认配置
import { createDefaultRouterEnginePlugin } from '@ldesign/router-vue'

const engine = createEngine({
  plugins: [
    createDefaultRouterEnginePlugin(routes)
  ]
})

// 别名方式
import { routerPlugin } from '@ldesign/router-vue'

const plugin = routerPlugin({
  routes,
  mode: 'hash'
})
```

**导出内容**:
- `createRouterEnginePlugin(options)` - 创建 Engine 插件
- `createDefaultRouterEnginePlugin(routes)` - 创建默认配置的 Engine 插件
- `routerPlugin` - `createRouterEnginePlugin` 的别名
- `RouterEnginePluginOptions` - Engine 插件选项类型
- `RouterMode` - 路由模式类型
- `RouterPreset` - 路由预设类型

**Engine 集成特性**:

1. **事件系统集成**:
   ```typescript
   // Engine 会自动发射路由事件
   engine.events.on('router:installed', ({ router }) => {
     console.log('路由器已安装')
   })
   
   engine.events.on('router:navigated', ({ to }) => {
     console.log('导航到:', to.path)
   })
   ```

2. **状态管理集成**:
   ```typescript
   // 路由配置自动保存到 Engine 状态
   const mode = engine.state.get('router:mode')
   const base = engine.state.get('router:base')
   const preset = engine.state.get('router:preset')
   ```

3. **日志集成**:
   ```typescript
   // 使用 Engine 的日志系统
   engine.logger.info('路由信息...')
   ```

4. **动画配置注入**:
   ```typescript
   // 动画配置会自动注入到 RouterView
   // 无需手动配置
   ```

---

## 🔄 选择哪个插件？

### 使用 Vue Plugin (`vue-plugin.ts`) 当：
- ✅ 你在开发普通的 Vue 3 SPA 应用
- ✅ 不需要 Engine 生态系统
- ✅ 只需要简单的路由功能
- ✅ 想要最小化的依赖

### 使用 Engine Plugin (`engine-plugin.ts`) 当：
- ✅ 你在使用 LDesign Engine
- ✅ 需要与 Engine 生命周期集成
- ✅ 需要使用 Engine 的事件/状态/日志系统
- ✅ 需要路由预设和高级配置
- ✅ 需要统一的插件管理

---

## 📋 API 对比

| 特性 | Vue Plugin | Engine Plugin |
|------|-----------|---------------|
| Vue 插件接口 | ✅ | ❌ |
| Engine 插件接口 | ❌ | ✅ |
| 简单安装 | ✅ | ✅ |
| 事件系统集成 | ❌ | ✅ |
| 状态管理集成 | ❌ | ✅ |
| 日志集成 | ❌ | ✅ |
| 动画配置注入 | ❌ | ✅ |
| 路由预设 | ❌ | ✅ |
| 调试模式 | ❌ | ✅ |
| 依赖 | 最小 | Engine Core |

---

## 💡 迁移指南

### 从 Vue Plugin 迁移到 Engine Plugin

```typescript
// 之前 - Vue Plugin
import { createRouterPlugin } from '@ldesign/router-vue'

const plugin = createRouterPlugin({
  routes,
  history: createWebHistory()
})

app.use(plugin)

// 之后 - Engine Plugin
import { createRouterEnginePlugin } from '@ldesign/router-vue'

const plugin = createRouterEnginePlugin({
  routes,
  mode: 'history',  // 使用 mode 代替 history 对象
  base: '/'
})

engine.use(plugin)
```

### 从 Engine Plugin 降级到 Vue Plugin

```typescript
// 之前 - Engine Plugin
import { createRouterEnginePlugin } from '@ldesign/router-vue'

const plugin = createRouterEnginePlugin({
  routes,
  mode: 'history',
  base: '/',
  animation: { type: 'fade' }
})

// 之后 - Vue Plugin
import { createRouterPlugin, createRouter } from '@ldesign/router-vue'

// 手动创建并配置
const router = createRouter({
  routes,
  history: createWebHistory('/')
})

// 如果需要动画，手动 provide
app.provide('routerAnimationConfig', { type: 'fade' })
app.use(router.vueRouter)
```

---

## 🔗 相关文档

- [Vue Router 文档](https://router.vuejs.org/)
- [LDesign Engine 文档](../../engine/README.md)
- [组件使用指南](../components/README.md)

---

**最后更新**: 2024-11-11
