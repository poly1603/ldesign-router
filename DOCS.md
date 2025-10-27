# @ldesign/router 文档

## 📚 文档站点

完整的文档已使用 VitePress 构建，提供了更好的阅读体验和交互性。

### 本地运行文档

```bash
# 安装依赖
pnpm install

# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建的文档
pnpm docs:preview
```

文档服务器启动后，访问 http://localhost:5173 即可查看完整文档。

## 📖 文档结构

### 指南

- **开始**
  - [简介](./guide/introduction.md) - 了解 @ldesign/router 的核心特性
  - [快速开始](./guide/getting-started.md) - 快速上手指南
  - [安装](./guide/installation.md) - 安装和配置

- **基础**
  - [路由配置](./guide/route-configuration.md) - 学习路由配置
  - [导航](./guide/navigation.md) - 了解导航方式
  - [路由参数](./guide/route-params.md) - 使用动态参数
  - [嵌套路由](./guide/nested-routes.md) - 构建多层级路由
  - [动态路由](./guide/dynamic-routes.md) - 动态添加路由

- **进阶**
  - [路由守卫](./guide/guards.md) - 控制访问权限
  - [路由元信息](./guide/meta.md) - 使用元数据
  - [懒加载](./guide/lazy-loading.md) - 代码分割
  - [滚动行为](./guide/scroll-behavior.md) - 自定义滚动
  - [过渡动画](./guide/transitions.md) - 路由过渡效果

- **高级功能**
  - [Engine 集成](./guide/engine-integration.md) - 与 LDesign Engine 集成
  - [设备适配](./guide/device-routing.md) - 响应式设备路由
  - [性能优化](./guide/performance.md) - 性能优化指南
  - [SEO 优化](./guide/seo.md) - SEO 最佳实践
  - [SSR 支持](./guide/ssr.md) - 服务端渲染
  - [智能预加载](./guide/smart-preload.md) - 智能预加载系统
  - [路由分析](./guide/analytics.md) - 用户行为分析
  - [微前端](./guide/micro-frontend.md) - 微前端支持

### API 参考

- **核心 API**
  - [createRouter](./api/core.md) - 创建路由器
  - [Router 实例](./api/router-instance.md) - 路由器实例方法
  - [RouteRecord](./api/route-record.md) - 路由记录
  - [RouteLocation](./api/route-location.md) - 路由位置

- **组合式 API**
  - [useRouter](./api/composables/use-router.md) - 访问路由器
  - [useRoute](./api/composables/use-route.md) - 访问当前路由
  - [useLink](./api/composables/use-link.md) - 链接功能
  - [其他 Composables](./api/composables/others.md) - 更多组合式 API

- **组件**
  - [RouterView](./api/components/router-view.md) - 路由视图组件
  - [RouterLink](./api/components/router-link.md) - 路由链接组件
  - [DeviceUnsupported](./api/components/device-unsupported.md) - 设备不支持提示

- **插件**
  - [性能监控插件](./api/plugins/performance.md) - 性能监控
  - [缓存插件](./api/plugins/cache.md) - 路由缓存
  - [预加载插件](./api/plugins/preload.md) - 路由预加载
  - [智能预加载插件](./api/plugins/smart-preload.md) - 智能预加载
  - [动画插件](./api/plugins/animation.md) - 路由动画
  - [SEO 插件](./api/plugins/seo.md) - SEO 优化
  - [设备路由插件](./api/plugins/device.md) - 设备适配

### 示例

- **基础示例**
  - [基本使用](./examples/basic.md) - 入门示例
  - [嵌套路由](./examples/nested-routes.md) - 嵌套路由示例
  - [动态路由](./examples/dynamic-routes.md) - 动态路由示例
  - [路由守卫](./examples/guards.md) - 守卫示例

- **进阶示例**
  - [懒加载](./examples/lazy-loading.md) - 懒加载示例
  - [路由过渡](./examples/transitions.md) - 过渡动画示例
  - [权限控制](./examples/permission.md) - 权限控制示例
  - [多步骤表单](./examples/multi-step-form.md) - 表单路由示例

- **高级示例**
  - [Engine 集成](./examples/engine-integration.md) - Engine 集成示例
  - [设备适配](./examples/device-routing.md) - 设备路由示例
  - [SSR 应用](./examples/ssr.md) - SSR 示例
  - [微前端](./examples/micro-frontend.md) - 微前端示例
  - [性能优化](./examples/performance.md) - 性能优化示例
  - [SEO 优化](./examples/seo.md) - SEO 优化示例

- **完整应用**
  - [后台管理系统](./examples/admin-dashboard.md) - 管理后台示例
  - [电商网站](./examples/e-commerce.md) - 电商应用示例
  - [博客系统](./examples/blog.md) - 博客系统示例

## 🚀 运行示例

示例应用位于 `examples` 目录：

```bash
# 进入示例目录
cd examples

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建示例
pnpm build
```

## 📝 文档贡献

欢迎贡献文档！如果你发现文档有错误或需要改进，请：

1. Fork 仓库
2. 创建你的特性分支 (`git checkout -b feature/improve-docs`)
3. 提交你的更改 (`git commit -am 'docs: improve router documentation'`)
4. 推送到分支 (`git push origin feature/improve-docs`)
5. 创建一个 Pull Request

## 📄 许可证

本文档遵循 [MIT License](../LICENSE)。

