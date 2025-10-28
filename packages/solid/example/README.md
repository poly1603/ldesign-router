# Solid.js Router Example

这是 @ldesign/router-solid 的完整示例应用，演示了路由的各种用法。

## 功能演示

- ✅ 基础路由导航
- ✅ 动态路由参数
- ✅ 查询参数和哈希
- ✅ 编程式导航
- ✅ 导航守卫
- ✅ 404 页面处理
- ✅ 路由元信息
- ✅ Solid.js Signals 响应式

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

## 项目结构

```
example/
├── .ldesign/
│   └── launcher.config.ts      # Launcher 配置 ✅
├── src/
│   ├── pages/                   # 页面组件
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── User.tsx
│   │   ├── Dashboard.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx                  # 根组件
│   ├── App.css                  # 应用样式
│   ├── main.tsx                 # 入口文件
│   ├── router.ts                # 路由配置
│   └── style.css                # 全局样式
├── index.html
├── package.json
└── tsconfig.json
```

## 使用 @ldesign/launcher

本示例使用 `@ldesign/launcher` 统一管理开发、构建和预览流程。

### 配置文件

查看 `.ldesign/launcher.config.ts` 了解完整配置。

## 了解更多

- [Solid.js 官方文档](https://www.solidjs.com/)
- [@ldesign/router-solid 文档](../README.md)
- [@ldesign/launcher 文档](../../../../tools/launcher/README.md)

