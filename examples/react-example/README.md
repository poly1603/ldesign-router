# React Router Example

基于 @ldesign/router-react 的完整示例项目。

## 功能演示

- ✅ Hash 模式路由
- ✅ 多页面路由导航
- ✅ 动态路由参数
- ✅ 编程式导航
- ✅ 路由状态管理
- ✅ 404 页面处理
- ✅ TypeScript 完整支持

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
react-example/
├── index.html              # 主 HTML 文件
├── src/
│   ├── main.tsx            # 主入口
│   ├── App.tsx             # 主应用组件
│   └── index.css           # 全局样式
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 使用的技术

- React 18.2
- TypeScript 5.7.3
- @ldesign/router-react 1.0.0
- Vite 5.0.12

## 路由配置

```typescript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/about', name: 'about' },
    { path: '/contact', name: 'contact' },
    { path: '/user/:id', name: 'user' },
    { path: '/products', name: 'products' },
  ],
})
```

## 核心功能

### 路由监听
```typescript
useEffect(() => {
  const unlisten = router.history.listen((to) => {
    // 处理路由变化
  })
  return unlisten
}, [])
```

### 编程式导航
```typescript
router.push('/about')        // 跳转
router.replace('/home')      // 替换
router.back()                // 后退
router.forward()             // 前进
```

### 路由参数
```typescript
// 路由: /user/:id
const id = router.currentRoute.params.id
```

## 访问

开发服务器启动后，访问 http://localhost:3001

可以尝试以下路由：
- `#/` - 首页
- `#/about` - 关于页面
- `#/contact` - 联系页面
- `#/products` - 产品列表
- `#/user/123` - 用户详情（动态参数）
