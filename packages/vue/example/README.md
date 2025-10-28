# Vue Router Example

这是 @ldesign/router-vue 的完整示例应用，演示了路由的各种用法。

## 功能演示

- ✅ 基础路由导航
- ✅ 动态路由参数
- ✅ 查询参数和哈希
- ✅ 编程式导航
- ✅ 导航守卫
- ✅ 404 页面处理
- ✅ 路由元信息

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（使用 @ldesign/launcher）
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

> 💡 本示例使用 `@ldesign/launcher` 统一管理开发、构建和预览流程

## 项目结构

```
example/
├── .ldesign/
│   └── launcher.config.ts      # Launcher 配置 ✅
├── src/
│   ├── views/                   # 页面组件
│   │   ├── Home.vue
│   │   ├── About.vue
│   │   ├── User.vue
│   │   ├── Dashboard.vue
│   │   └── NotFound.vue
│   ├── App.vue                  # 根组件
│   ├── main.ts                  # 入口文件
│   ├── router.ts                # 路由配置
│   └── style.css                # 全局样式
├── index.html
├── package.json
└── tsconfig.json
```

## 路由配置

查看 `src/router.ts` 了解完整的路由配置，包括：

- 路由定义
- 导航守卫
- 元信息配置

## 了解更多

- [Vue Router 官方文档](https://router.vuejs.org/)
- [@ldesign/router-vue 文档](../README.md)

