# Alpine.js Router Example

基于 @ldesign/router-alpinejs 的简单示例项目。

## 功能演示

- ✅ Hash 模式路由
- ✅ 路由导航
- ✅ 动态路由参数
- ✅ 编程式导航（push/back/forward）
- ✅ 当前路由信息显示

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 项目结构

```
alpinejs-example/
├── index.html          # 主 HTML 文件
├── src/
│   └── main.js         # 主入口文件
├── package.json
├── vite.config.js
└── README.md
```

## 使用的技术

- Alpine.js 3.13
- @ldesign/router-alpinejs 1.0.0
- Vite 5.0.12

## 路由配置

```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/about', name: 'about' },
    { path: '/contact', name: 'contact' },
    { path: '/user/:id', name: 'user' },
  ],
})
```

## 访问

开发服务器启动后，访问 http://localhost:3000

可以尝试以下路由：
- `#/` - 首页
- `#/about` - 关于页面
- `#/contact` - 联系页面
- `#/user/123` - 用户详情（动态参数）
