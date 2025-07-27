# 示例项目

本目录包含了 `@ldesign/router` 的各种使用示例，帮助您快速理解和应用不同功能。

## 示例列表

### 基础示例

- [**基础路由**](./basic-routing/) - 最简单的路由配置和使用
- [**动态路由**](./dynamic-routes/) - 动态路由参数和嵌套路由
- [**路由守卫**](./navigation-guards/) - 导航守卫的使用
- [**编程式导航**](./programmatic-navigation/) - 使用 JavaScript 进行路由导航

### 功能示例

- [**权限管理**](./permission-management/) - 完整的权限控制系统
- [**缓存管理**](./cache-management/) - 页面缓存和数据缓存
- [**设备适配**](./device-adaptation/) - 响应式设备适配
- [**面包屑导航**](./breadcrumb-navigation/) - 面包屑导航实现
- [**标签页管理**](./tabs-management/) - 多标签页功能
- [**路由动画**](./route-animations/) - 页面切换动画

### 高级示例

- [**微前端集成**](./micro-frontend/) - 微前端架构中的路由管理
- [**SSR 支持**](./ssr-support/) - 服务端渲染支持
- [**性能优化**](./performance-optimization/) - 路由性能优化技巧
- [**自定义插件**](./custom-plugins/) - 开发自定义路由插件

### 完整应用示例

- [**管理后台**](./admin-dashboard/) - 完整的管理后台应用
- [**电商应用**](./e-commerce/) - 电商网站路由架构
- [**博客系统**](./blog-system/) - 博客系统路由设计
- [**移动端应用**](./mobile-app/) - 移动端应用路由方案

## 快速开始

### 运行示例

```bash
# 克隆项目
git clone https://github.com/ldesign/router.git
cd router/examples

# 安装依赖
pnpm install

# 运行特定示例
cd basic-routing
pnpm dev
```

### 示例结构

每个示例都包含以下文件：

```
example-name/
├── src/
│   ├── components/     # 组件
│   ├── views/         # 页面
│   ├── router/        # 路由配置
│   └── main.ts        # 入口文件
├── package.json       # 依赖配置
├── vite.config.ts     # 构建配置
└── README.md          # 示例说明
```

## 示例详情

### 基础路由示例

最简单的路由配置，适合初学者：

```typescript
// router/index.ts
import { createLDesignRouter } from '@ldesign/router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

export default createLDesignRouter({
  history: 'web',
  routes
})
```

### 权限管理示例

展示完整的权限控制系统：

```typescript
// router/index.ts
const router = createLDesignRouter({
  routes,
  permission: {
    enabled: true,
    mode: 'role',
    storage: 'localStorage',
    unauthorizedRedirect: '/login'
  }
})

// 路由配置
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    },
    children: [
      {
        path: 'users',
        component: UserManagement,
        meta: {
          permissions: ['user:read']
        }
      }
    ]
  }
]
```

### 设备适配示例

响应式设备适配的完整实现：

```typescript
// router/index.ts
const router = createLDesignRouter({
  routes,
  device: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  }
})

// 路由配置
const routes = [
  {
    path: '/dashboard',
    meta: {
      device: {
        mobile: () => import('@/views/mobile/Dashboard.vue'),
        tablet: () => import('@/views/tablet/Dashboard.vue'),
        desktop: () => import('@/views/desktop/Dashboard.vue')
      }
    }
  }
]
```

## 在线演示

您可以在以下平台查看在线演示：

- [CodeSandbox](https://codesandbox.io/s/ldesign-router-examples)
- [StackBlitz](https://stackblitz.com/github/ldesign/router/tree/main/examples)
- [GitHub Pages](https://ldesign.github.io/router/examples/)

## 贡献示例

我们欢迎社区贡献更多示例！

### 贡献指南

1. **Fork 项目**
2. **创建示例目录**
3. **编写示例代码**
4. **添加 README 说明**
5. **提交 Pull Request**

### 示例要求

- 代码清晰易懂
- 包含详细注释
- 提供 README 说明
- 遵循项目代码规范
- 包含必要的测试

### 示例模板

```typescript
// 示例模板
import { createApp } from 'vue'
import { createLDesignRouter } from '@ldesign/router'
import App from './App.vue'

// 路由配置
const routes = [
  // 您的路由配置
]

// 创建路由实例
const router = createLDesignRouter({
  history: 'web',
  routes,
  // 其他配置
})

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 常见问题

### Q: 如何运行特定示例？

A: 进入示例目录，运行 `pnpm install` 安装依赖，然后运行 `pnpm dev` 启动开发服务器。

### Q: 示例代码可以直接用于生产环境吗？

A: 示例代码主要用于学习和参考，在生产环境使用前请根据实际需求进行调整和优化。

### Q: 如何贡献新的示例？

A: 请参考贡献指南，创建新的示例目录并提交 Pull Request。

### Q: 示例中的依赖版本是否是最新的？

A: 我们会定期更新示例中的依赖版本，但建议您在使用时检查并更新到最新版本。

## 技术支持

如果您在使用示例时遇到问题：

1. **查看示例 README**：每个示例都有详细的说明文档
2. **检查控制台错误**：查看浏览器控制台的错误信息
3. **对比完整代码**：确保代码配置正确
4. **社区求助**：在 GitHub Issues 中提问
5. **官方文档**：查阅详细的 API 文档

## 许可证

所有示例代码遵循 MIT 许可证，您可以自由使用、修改和分发。
