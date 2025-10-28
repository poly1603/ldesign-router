# 🎉 @ldesign/router 完整版 - 包含 Angular 支持

## 总览

@ldesign/router 现已支持 **5 个主流前端框架** + 核心库：

1. ✅ **@ldesign/router-core** - 框架无关核心
2. ✅ **@ldesign/router-vue** - Vue 3 路由
3. ✅ **@ldesign/router-react** - React 路由
4. ✅ **@ldesign/router-svelte** - Svelte 路由
5. ✅ **@ldesign/router-solid** - Solid.js 路由
6. ✅ **@ldesign/router-angular** - Angular 路由 ⭐ 新增

## 📦 Angular 包

### 位置
`packages/router/packages/angular/`

### 核心文件
- ✅ `src/index.ts` - 主入口
- ✅ `src/services/router.service.ts` - 路由服务
- ✅ `src/guards/index.ts` - 路由守卫
- ✅ `src/directives/router-link.directive.ts` - 路由链接指令
- ✅ `package.json` - 包配置
- ✅ `ldesign.config.ts` - Builder 配置
- ✅ `tsconfig.json` - TypeScript 配置
- ✅ `README.md` - 完整文档

### 特性

#### 1. LdRouterService
提供与其他框架一致的路由 API：
- `push(to)` - 导航到新位置
- `replace(to)` - 替换当前位置
- `back()` - 返回上一页
- `forward()` - 前进到下一页
- `go(delta)` - 前进或后退指定步数

#### 2. Observable 流
利用 RxJS 提供响应式路由状态：
- `params$` - 路由参数流
- `query$` - 查询参数流
- `meta$` - 元信息流

#### 3. 路由守卫
- `authGuard()` - 认证守卫工厂
- `createGuard()` - 自定义守卫
- `confirmDeactivateGuard()` - 退出确认守卫

#### 4. ldRouterLink 指令
提供与其他框架一致的路由链接语法：
```html
<a ldRouterLink="/">首页</a>
<a [ldRouterLink]="{ path: '/user/123', query: { tab: 'posts' } }">用户</a>
```

## 🔄 完整框架对比

| 功能 | Vue | React | Svelte | Solid.js | Angular |
|------|-----|-------|--------|----------|---------|
| 创建路由器 | `createRouter` | `createRouter` | `createRouter` | `createRouter` | `provideRouter` |
| 上下文 | `app.use` | `<RouterProvider>` | `<RouterProvider>` | `<RouterProvider>` | DI System |
| 获取路由器 | `useRouter()` | `useRouter()` | `getRouter()` | `useRouter()` | `LdRouterService` |
| 当前参数 | `useParams()` | `useParams()` | `$params` | `useParams()` | `params$` |
| 响应式 | Ref | State | Store | Signal | Observable |
| 导航链接 | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` | `<RouterLink>` | `ldRouterLink` |
| 视图渲染 | `<RouterView>` | `<RouterView>` | `<RouterView>` | `<RouterView>` | `<router-outlet>` |

## 📊 最新统计

### 包数量
- **框架包**: 5 个 (Vue, React, Svelte, Solid.js, Angular)
- **核心包**: 1 个 (Core)
- **总计**: 6 个包

### 文件统计
| 包 | 文件数 | 代码行数 |
|---|--------|---------|
| Core | ~15 | ~800 |
| Vue | ~15 | ~600 |
| React | ~15 | ~600 |
| Svelte | ~10 | ~500 |
| Solid.js | ~10 | ~500 |
| Angular | ~10 | ~600 ⭐ |
| **总计** | **~75** | **~3,600** |

### 示例应用
- Vue: 17 个文件 (~900 行) ✅ 运行中
- React: 18 个文件 (~950 行) ✅ 运行中
- Svelte: 15 个文件 (~850 行) ✅ 运行中
- Solid.js: 17 个文件 (~950 行) ✅ 运行中
- Angular: 待创建

## 🚀 使用示例

### Angular
```typescript
// app.routes.ts
import { Routes } from '@angular/router'
import { authGuard } from '@ldesign/router-angular'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard(() => isAuthenticated())],
  },
]

// app.component.ts
@Component({
  template: `
    <nav>
      <a ldRouterLink="/">首页</a>
      <a ldRouterLink="/about">关于</a>
    </nav>
    <router-outlet />
  `,
  imports: [LdRouterLinkDirective, RouterOutlet],
})
export class AppComponent {
  constructor(private ldRouter: LdRouterService) {
    ldRouter.params$.subscribe(params => {
      console.log('参数:', params)
    })
  }
}
```

## 📝 构建脚本

```bash
# 构建所有包
pnpm run build

# 构建单个包
pnpm run build:core
pnpm run build:vue
pnpm run build:react
pnpm run build:svelte
pnpm run build:solid
pnpm run build:angular
```

## 🎯 下一步

### Angular 示例应用
创建 Angular 示例应用：
```bash
cd packages/router/packages/angular
# 创建 example 目录
```

---

**最后更新**: 2025-10-28  
**支持框架**: Vue 3, React, Svelte, Solid.js, Angular (5 个)  
**总包数**: 6 个（含 Core）

